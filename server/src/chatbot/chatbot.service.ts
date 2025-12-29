import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessageDto, ChatResponseDto } from './dto/chat.dto';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentService } from '../payment/payment.service';
import type {
  ChatContext,
  PendingSearch,
  ParsedIntent,
} from './types/chatbot.types';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private geminiService: GeminiService,
    private prisma: PrismaService,
    private bookingsService: BookingsService,
    private paymentService: PaymentService,
  ) {}

  private removeVietnameseAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  private matchesCityParts(searchTerm: string, cityName: string): boolean {
    // Handle cases like "vung tau" matching "ba ria - vung tau"
    // or "ba ria" matching "ba ria - vung tau"
    const cityParts = cityName.split(/[\s-]+/);
    const searchParts = searchTerm.split(/[\s-]+/);

    // Check if all search parts are found in city parts
    return searchParts.every((searchPart) =>
      cityParts.some(
        (cityPart) =>
          cityPart.includes(searchPart) || searchPart.includes(cityPart),
      ),
    );
  }

  private generateTextSeatMap(
    availableSeats: string[],
    bookedSeats: string[],
  ): string {
    // Group seats by row
    const seatsByRow: Record<string, string[]> = {};

    [...availableSeats, ...bookedSeats].forEach((seat) => {
      const row = seat.charAt(0);
      if (!seatsByRow[row]) seatsByRow[row] = [];
      seatsByRow[row].push(seat);
    });

    // Sort rows alphabetically
    const rows = Object.keys(seatsByRow).sort();

    let map = '';
    rows.forEach((row) => {
      const seats = seatsByRow[row].sort();
      const available = seats.filter((s) => availableSeats.includes(s));
      const booked = seats.filter((s) => bookedSeats.includes(s));

      map += `Hàng ${row}: `;

      // Show available seats in green
      if (available.length > 0) {
        map += available.map((s) => `[${s}]`).join(' ');
      }

      // Show booked seats
      if (booked.length > 0) {
        if (available.length > 0) map += ' ';
        map += booked.map((s) => `[${s}✗]`).join(' ');
      }

      map += '\n';
    });

    return map;
  }

  async processMessage(dto: ChatMessageDto): Promise<ChatResponseDto> {
    try {
      // Check if we're in an active booking flow - prioritize booking context
      if (dto.context?.bookingState?.stage) {
        this.logger.log(
          `Active booking flow detected - stage: ${dto.context.bookingState.stage}`,
        );
        return await this.handleBooking(dto.message, {}, dto.context);
      }

      // Check if we're in an active search flow
      if (dto.context?.pendingSearch) {
        this.logger.log('Active search flow detected');
        return await this.handleTripSearch(dto.message, {}, dto.context);
      }

      // Parse user intent for new conversations
      const parsed: ParsedIntent = await this.geminiService.parseUserIntent(
        dto.message,
      );

      this.logger.log(`Detected intent: ${parsed.intent}`, parsed.entities);

      // Route to appropriate handler
      switch (parsed.intent) {
        case 'search_trip':
          return await this.handleTripSearch(
            dto.message,
            parsed.entities,
            dto.context,
          );
        case 'booking':
          return await this.handleBooking(
            dto.message,
            parsed.entities,
            dto.context,
          );
        case 'faq':
          return await this.handleFAQ(dto.message);
        default:
          return await this.handleGeneral(dto.message);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error processing message: ${err.message}`);
      return {
        message: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        type: 'text',
      };
    }
  }

  private async handleTripSearch(
    userMessage: string,
    entities: ParsedIntent['entities'],
    context?: ChatContext,
  ): Promise<ChatResponseDto> {
    try {
      // Get pending search from context (if user is continuing a search)
      const pendingSearch: PendingSearch = context?.pendingSearch || {};

      // Get all locations for context
      const locations = await this.prisma.locations.findMany({
        select: { id: true, name: true, city: true },
      });

      // Build context-aware prompt
      const contextInfo =
        pendingSearch.originCity || pendingSearch.destinationCity
          ? `\nPrevious context:
- Origin: ${pendingSearch.originCity || 'not specified'}
- Destination: ${pendingSearch.destinationCity || 'not specified'}
- Date: ${pendingSearch.date || 'not specified'}

Merge with context.`
          : '';

      // Use AI to extract city names from natural language
      const prompt = `Extract origin and destination CITY names from: "${userMessage}"

${contextInfo}

Return JSON format (replace null with actual null, not string):
{
  "originCity": "city name" or null,
  "destinationCity": "city name" or null,
  "date": "YYYY-MM-DD" or null,
  "needMoreInfo": true/false,
  "clarificationMessage": "message if needed"
}

Examples:
- "tìm xe từ HCM đi Vũng Tàu" → originCity: "Ho Chi Minh", destinationCity: "Vung Tau"
- "từ Sài Gòn đến Đà Nẵng" → originCity: "Sai Gon", destinationCity: "Da Nang"
- "đi Nha Trang" → originCity: null, destinationCity: "Nha Trang", needMoreInfo: true

City name variations to recognize:
- "HCM", "Sài Gòn", "Saigon", "TP HCM" → "Ho Chi Minh"
- "Vũng Tàu", "Bà Rịa" → "Ba Ria - Vung Tau"
- "Đà Nẵng", "Da Nang" → "Da Nang"

CRITICAL: Return ONLY valid JSON. Use null (not "null" string) for missing values.`;

      const aiResponse = await this.geminiService.generateResponse(prompt);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      let searchParams = JSON.parse(jsonMatch[0]);

      // Merge with pending search context
      searchParams = {
        originCity: searchParams.originCity || pendingSearch.originCity || null,
        destinationCity:
          searchParams.destinationCity || pendingSearch.destinationCity || null,
        date: searchParams.date || pendingSearch.date || null,
        needMoreInfo: searchParams.needMoreInfo,
        clarificationMessage: searchParams.clarificationMessage,
      };

      // Find all locations matching the cities
      if (searchParams.originCity) {
        const normalizedOrigin = this.removeVietnameseAccents(
          searchParams.originCity.toLowerCase(),
        );
        const originLocations = locations.filter((l) => {
          const normalizedCity = this.removeVietnameseAccents(
            l.city.toLowerCase(),
          );
          const normalizedName = this.removeVietnameseAccents(
            l.name.toLowerCase(),
          );

          // Check if city or name contains the search term
          return (
            normalizedCity.includes(normalizedOrigin) ||
            normalizedOrigin.includes(normalizedCity) ||
            normalizedName.includes(normalizedOrigin) ||
            this.matchesCityParts(normalizedOrigin, normalizedCity)
          );
        });
        searchParams.originIds = originLocations.map((l) => l.id);
        searchParams.originName = searchParams.originCity;
        this.logger.log(
          `Found ${originLocations.length} locations for origin: ${searchParams.originCity}`,
          originLocations.map((l) => l.name),
        );
      }

      if (searchParams.destinationCity) {
        const normalizedDest = this.removeVietnameseAccents(
          searchParams.destinationCity.toLowerCase(),
        );
        const destLocations = locations.filter((l) => {
          const normalizedCity = this.removeVietnameseAccents(
            l.city.toLowerCase(),
          );
          const normalizedName = this.removeVietnameseAccents(
            l.name.toLowerCase(),
          );

          // Check if city or name contains the search term
          return (
            normalizedCity.includes(normalizedDest) ||
            normalizedDest.includes(normalizedCity) ||
            normalizedName.includes(normalizedDest) ||
            this.matchesCityParts(normalizedDest, normalizedCity)
          );
        });
        searchParams.destinationIds = destLocations.map((l) => l.id);
        searchParams.destinationName = searchParams.destinationCity;
        this.logger.log(
          `Found ${destLocations.length} locations for destination: ${searchParams.destinationCity}`,
          destLocations.map((l) => l.name),
        );
      }

      // Re-check if we still need more info after merge
      if (
        !searchParams.originIds?.length ||
        !searchParams.destinationIds?.length
      ) {
        searchParams.needMoreInfo = true;

        if (
          !searchParams.originIds?.length &&
          !searchParams.destinationIds?.length
        ) {
          searchParams.clarificationMessage =
            'Bạn muốn đi từ đâu đến đâu? Ví dụ: "Hà Nội đi Đà Nẵng"';
        } else if (!searchParams.destinationIds?.length) {
          searchParams.clarificationMessage = `Bạn muốn đi từ ${searchParams.originName} đến đâu?`;
        } else if (!searchParams.originIds?.length) {
          searchParams.clarificationMessage = `Bạn muốn đi từ đâu đến ${searchParams.destinationName}?`;
        }
      }

      // If we need more info, ask for it and return pending search context
      if (searchParams.needMoreInfo) {
        return {
          message: searchParams.clarificationMessage,
          type: 'text',
          data: {
            pendingSearch: searchParams, // Return this so frontend can send it back
          },
          suggestions: [
            'Hà Nội - Đà Nẵng',
            'Sài Gòn - Vũng Tàu',
            'Đà Nẵng - Hội An',
          ],
        };
      }

      // Search for trips
      const trips = await this.searchTrips(searchParams);

      if (trips.length === 0) {
        const noResultMessage =
          searchParams.originName && searchParams.destinationName
            ? `Không tìm thấy chuyến xe từ ${searchParams.originName} đến ${searchParams.destinationName}${searchParams.date ? ` vào ngày ${searchParams.date}` : ''}.`
            : 'Không tìm thấy chuyến xe phù hợp.';

        return {
          message: `${noResultMessage} Bạn có thể thử ngày khác hoặc tuyến đường khác.`,
          type: 'text',
          suggestions: ['Tìm ngày mai', 'Tìm cuối tuần', 'Xem tuyến khác'],
        };
      }

      // Generate friendly response with route info
      const routeInfo = trips[0]?.tripRoutes?.[0]?.route;
      const fromLocation =
        routeInfo?.origin?.name || searchParams.originName || 'điểm đi';
      const toLocation =
        routeInfo?.destination?.name ||
        searchParams.destinationName ||
        'điểm đến';

      const responseMessage =
        trips.length === 1
          ? `Tìm thấy 1 chuyến xe từ ${fromLocation} đến ${toLocation}! 🚌`
          : `Tìm thấy ${trips.length} chuyến xe từ ${fromLocation} đến ${toLocation}! 🚌`;

      return {
        message: responseMessage,
        type: 'trip_results',
        data: {
          trips,
          searchParams,
          summary: {
            count: trips.length,
            from: fromLocation,
            to: toLocation,
            date: searchParams.date,
          },
        },
        suggestions: ['Xem tất cả chuyến', 'Đặt vé ngay', 'Tìm chuyến khác'],
      };
    } catch (error) {
      this.logger.error(`Error in trip search: ${error.message}`);
      return {
        message:
          'Tôi có thể giúp bạn tìm chuyến xe. Bạn muốn đi từ đâu đến đâu?',
        type: 'text',
        suggestions: [
          'Hà Nội đi Sài Gòn',
          'Đà Nẵng đi Hội An',
          'Hỏi về giá vé',
        ],
      };
    }
  }

  private async searchTrips(params: any) {
    const { originIds, destinationIds, date } = params;

    // Build where clause for trips
    let startDate = new Date();
    if (date && date !== 'null') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        startDate = parsedDate;
      }
    }

    const whereClause: any = {
      startTime: { gte: startDate },
      status: 'scheduled',
    };

    this.logger.log(
      `Searching trips with date: ${date} -> ${startDate.toISOString()}`,
    );

    // Search by city - find trips where origin is ANY location in originIds
    // and destination is ANY location in destinationIds
    if (originIds?.length || destinationIds?.length) {
      whereClause.tripRoutes = {
        some: {
          route: {
            ...(originIds?.length && { originLocationId: { in: originIds } }),
            ...(destinationIds?.length && {
              destinationLocationId: { in: destinationIds },
            }),
          },
        },
      };
    }

    const trips = await this.prisma.trips.findMany({
      where: whereClause,
      include: {
        bus: {
          select: {
            id: true,
            plate: true,
            busType: true,
            amenities: true,
          },
        },
        tripRoutes: {
          include: {
            route: {
              include: {
                origin: {
                  select: { id: true, name: true, city: true },
                },
                destination: {
                  select: { id: true, name: true, city: true },
                },
              },
            },
          },
        },
        tripStops: {
          include: {
            location: {
              select: { id: true, name: true, city: true },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
      take: 10,
      orderBy: { startTime: 'asc' },
    });

    return trips;
  }

  private async handleBooking(
    userMessage: string,
    _entities: any,
    context?: any,
  ): Promise<ChatResponseDto> {
    const bookingState = context?.bookingState || {};
    const stage = bookingState.stage || 'init';

    // Check if user wants to view seat map
    if (
      userMessage.toLowerCase().includes('sơ đồ ghế') ||
      userMessage.toLowerCase().includes('xem ghế') ||
      userMessage.toLowerCase().includes('ghế trống') ||
      userMessage.toLowerCase().includes('ghế còn')
    ) {
      const { tripId, routeId } = bookingState;

      if (!tripId || !routeId) {
        return {
          message: 'Vui lòng chọn chuyến xe trước để xem sơ đồ ghế.',
          type: 'text',
          suggestions: ['Tìm chuyến xe'],
        };
      }

      // Fetch available seats from database
      try {
        // Get trip details
        const trip = await this.prisma.trips.findUnique({
          where: { id: tripId },
          include: {
            bus: {
              include: {
                seats: true,
              },
            },
            seatLocks: {
              include: {
                seat: true,
              },
            },
          },
        });

        if (!trip) {
          throw new Error('Trip not found');
        }

        // Get all seats for this bus
        const allSeats = trip.bus.seats;

        // Get locked seats for this trip
        const lockedSeatIds = new Set(
          trip.seatLocks.map((lock) => lock.seatId),
        );

        // Calculate available seats
        const availableSeats = allSeats
          .filter((seat) => !lockedSeatIds.has(seat.id))
          .map((seat) => seat.seatNumber)
          .sort();

        const bookedSeats = allSeats
          .filter((seat) => lockedSeatIds.has(seat.id))
          .map((seat) => seat.seatNumber)
          .sort();

        // Create text-based seat map
        const seatMap = this.generateTextSeatMap(availableSeats, bookedSeats);

        return {
          message: `Sơ đồ ghế:\n\n${seatMap}\n\nGhế trống (${availableSeats.length}): ${availableSeats.slice(0, 10).join(', ')}${availableSeats.length > 10 ? '...' : ''}\nĐã đặt: ${bookedSeats.length} ghế\n\nNhập số ghế bạn muốn chọn (vd: A1, B2):`,
          type: 'seat_selection',
          data: {
            tripId,
            routeId,
            bookingState,
            availableSeats,
          },
          suggestions: availableSeats.slice(0, 3).map((seat) => seat),
        };
      } catch (error) {
        this.logger.error(`Error fetching seat status: ${error.message}`);
        return {
          message:
            'Không thể lấy thông tin ghế. Vui lòng thử lại sau hoặc nhập số ghế trực tiếp (vd: A1, B2).',
          type: 'seat_selection',
          data: {
            tripId,
            routeId,
            bookingState,
          },
          suggestions: ['A1', 'A2', 'B1'],
        };
      }
    }

    // Parse seat selection from user message (e.g., "Chọn ghế A1" or "A1, A2")
    // Only when in seat_selection stage and message looks like seat numbers
    if (stage === 'seat_selection') {
      // Validate: should be short patterns like A1, B2 (not UUID or long strings)
      const seatPattern = /\b([A-D]\d{1,2})\b/gi;
      const seats = userMessage.match(seatPattern) || [];

      // Only process if we found valid seat patterns AND message is not a trip ID
      if (seats.length > 0 && seats.length < 10 && !userMessage.includes('-')) {
        const totalPrice = seats.length * (bookingState.basePrice || 0);

        return {
          message: `Đã chọn ${seats.length} ghế: ${seats.join(', ')}\n\nVui lòng cung cấp thông tin hành khách:\n\nHọ tên:\nEmail:\nSố điện thoại:\n\nVí dụ: "Nguyễn Văn A, example@email.com, 0912345678"`,
          type: 'passenger_form',
          data: {
            bookingState: {
              ...bookingState,
              stage: 'passenger_details',
              selectedSeats: seats,
              totalPrice,
            },
          },
          suggestions: ['Nhập thông tin'],
        };
      }
    }

    // Parse passenger info from user message
    if (stage === 'passenger_details') {
      // Try to parse: "Name, email, phone" or just any text
      const parts = userMessage.split(',').map((s) => s.trim());

      if (parts.length >= 3 || userMessage.includes('@')) {
        const name = parts[0] || 'Khách hàng';
        const email = parts.find((p) => p.includes('@')) || '';
        const phone = parts.find((p) => /\d{9,11}/.test(p)) || '';

        return {
          message: `Thông tin đã nhận!\n\nTên: ${name}\nEmail: ${email}\nSĐT: ${phone}\n\nTổng tiền: ${bookingState.totalPrice?.toLocaleString('vi-VN')} VND\n\nChọn phương thức thanh toán:`,
          type: 'payment_selection',
          data: {
            bookingState: {
              ...bookingState,
              stage: 'payment',
              passengerInfo: { name, email, phone },
            },
          },
          suggestions: ['Thanh toán online', 'Thanh toán tại bến'],
        };
      }
    }

    // Stage 1: Initial - Trip Selection
    if (stage === 'init') {
      return {
        message:
          'Để đặt vé, bạn cần chọn chuyến xe trước. Bạn muốn tìm chuyến từ đâu đến đâu?',
        type: 'text',
        data: {
          bookingState: { stage: 'selecting_trip' },
        },
        suggestions: [
          'Hà Nội đi Đà Nẵng',
          'Hồ Chí Minh đi Kiên Giang',
          'Xem tuyến phổ biến',
        ],
      };
    }

    // Stage 2: Seat Selection (triggered after trip is selected)
    if (stage === 'seat_selection') {
      const { tripId, routeId } = bookingState;

      // Fetch seat map automatically when entering this stage
      try {
        const trip = await this.prisma.trips.findUnique({
          where: { id: tripId },
          include: {
            bus: {
              include: {
                seats: true,
              },
            },
            seatLocks: {
              include: {
                seat: true,
              },
            },
          },
        });

        if (trip) {
          const allSeats = trip.bus.seats;
          const lockedSeatIds = new Set(
            trip.seatLocks.map((lock) => lock.seatId),
          );
          const busType = trip.bus.busType || 'standard';

          const availableSeats = allSeats
            .filter((seat) => !lockedSeatIds.has(seat.id))
            .map((seat) => seat.seatNumber)
            .sort();

          const bookedSeats = allSeats
            .filter((seat) => lockedSeatIds.has(seat.id))
            .map((seat) => seat.seatNumber)
            .sort();

          // Create a map of seat numbers to seat IDs for later lookup
          const seatNumberToId = {};
          allSeats.forEach((seat) => {
            seatNumberToId[seat.seatNumber] = seat.id;
          });

          const seatMap = this.generateTextSeatMap(availableSeats, bookedSeats);

          return {
            message: `Xe ${busType.toUpperCase()} - ${allSeats.length} ghế\n\nTình trạng ghế theo hàng:\n(Click số ghế để chọn nhanh)\n\n${seatMap}\n\nChú thích:\n[A1] = Ghế trống (${availableSeats.length} ghế)\n[A1✗] = Đã đặt (${bookedSeats.length} ghế)\n\nNhập số ghế bạn muốn (vd: A1 hoặc A1,B2)`,
            type: 'seat_selection',
            data: {
              tripId,
              routeId,
              bookingState: {
                ...bookingState,
                availableSeats,
                seatNumberToId,
              },
            },
            suggestions: availableSeats.slice(0, 3),
          };
        }
      } catch (error) {
        this.logger.error(`Error fetching seats: ${error.message}`);
      }

      // Fallback if seat fetch fails
      return {
        message: `Chuyến xe đã được chọn! Vui lòng chọn ghế của bạn.\n\nNhập số ghế (vd: "A1" hoặc "A1, B2" cho nhiều ghế):`,
        type: 'seat_selection',
        data: {
          tripId,
          routeId,
          bookingState,
        },
        suggestions: ['A1', 'A1, A2', 'B1, B2, B3'],
      };
    }

    // Stage 3: Passenger Details
    if (stage === 'passenger_details') {
      // Check if user is logged in and auto-fill their info
      const user = context?.user;
      if (user && user.fullName && user.email) {
        // User is logged in - auto-fill and skip to payment
        return {
          message: `Đã chọn ${bookingState.selectedSeats?.length || 0} ghế!\n\nThông tin của bạn:\n${user.fullName}\n${user.email}\n${user.phoneNumber || 'Chưa có SĐT'}\n\nTổng tiền: ${bookingState.totalPrice?.toLocaleString('vi-VN')} VND\n\nChọn phương thức thanh toán:`,
          type: 'payment_selection',
          data: {
            bookingState: {
              ...bookingState,
              stage: 'payment',
              passengerInfo: {
                name: user.fullName,
                email: user.email,
                phone: user.phoneNumber || '',
              },
            },
          },
          suggestions: ['Thanh toán online', 'Thanh toán tại bến'],
        };
      }

      // User not logged in - ask for info
      return {
        message: `Ghế đã được chọn! Vui lòng cung cấp thông tin hành khách:\n\nHọ tên:\nEmail:\nSố điện thoại:\n\nVí dụ: "Nguyễn Văn A, example@email.com, 0912345678"`,
        type: 'passenger_form',
        data: {
          bookingState,
        },
        suggestions: ['Nhập thông tin'],
      };
    }

    // Stage 4: Payment
    if (stage === 'payment') {
      const {
        passengerInfo,
        selectedSeats,
        selectedSeatIds,
        totalPrice,
        tripId,
        routeId,
      } = bookingState;
      const userId = context?.user?.id;

      try {
        // Create booking for all selected seats in one call
        const bookingResult = await this.bookingsService.create({
          userId,
          tripId,
          routeId,
          seatIds: selectedSeatIds, // Pass all seat IDs at once
          customerInfo: {
            fullName: passengerInfo.name,
            email: passengerInfo.email,
            phoneNumber: passengerInfo.phone,
            identificationCard: passengerInfo.phone, // Use phone as fallback for ID
          },
        });

        // Extract booking data from the result
        const bookingData = bookingResult.data;
        const bookingIds = bookingData.bookingIds;
        const primaryBookingId = bookingData.bookingId;

        this.logger.log(
          `Created booking with ${bookingIds.length} seats: ${bookingIds.join(', ')}`,
        );

        // Create payment link
        const paymentResult = await this.paymentService.createPaymentLink({
          bookingId: primaryBookingId,
          bookingIds: bookingIds,
          totalAmount: totalPrice,
          buyerName: passengerInfo.name,
          buyerEmail: passengerInfo.email,
        });

        return {
          message: `Đặt vé thành công!\n\nTên: ${passengerInfo.name}\nEmail: ${passengerInfo.email}\nSĐT: ${passengerInfo.phone}\nGhế: ${selectedSeats?.join(', ')}\nTổng tiền: ${totalPrice?.toLocaleString('vi-VN')} VND\n\nVui lòng quét mã QR bên dưới để thanh toán.\n\nLink thanh toán có hiệu lực trong 15 phút.\n\nSau khi thanh toán xong, nhấn nút "Xác nhận đã thanh toán" để kiểm tra trạng thái.`,
          type: 'payment_link',
          data: {
            bookingIds: bookingIds,
            paymentId: paymentResult.paymentId,
            checkoutUrl: paymentResult.checkoutUrl,
            qrCode: paymentResult.qrCode,
            amount: paymentResult.amount,
            orderCode: paymentResult.orderCode,
            // Thêm thông tin để frontend hiển thị nút xác nhận
            showConfirmButton: true,
            confirmButtonText: 'Xác nhận đã thanh toán',
          },
          suggestions: ['Xác nhận đã thanh toán', 'Cần hỗ trợ'],
        };
      } catch (error) {
        this.logger.error(`Error creating booking/payment: ${error.message}`);
        return {
          message: `Có lỗi xảy ra khi tạo đặt vé:\n${error.message}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.`,
          type: 'error',
          suggestions: ['Thử lại', 'Tìm chuyến mới'],
        };
      }
    }

    // Default fallback
    return {
      message: 'Để đặt vé, hãy bắt đầu bằng cách tìm chuyến xe bạn muốn.',
      type: 'text',
      suggestions: ['Tìm chuyến xe'],
    };
  }

  private async handleFAQ(userMessage: string): Promise<ChatResponseDto> {
    // Get FAQ data from database or predefined knowledge base
    const faqKnowledge = `
# Câu hỏi thường gặp - Đặt vé xe khách

## 1. Chính sách hủy vé
**Hủy vé trước 24 giờ:**
- Hoàn lại 80% giá vé
- Phí hủy: 20% giá vé

**Hủy vé trước 12 giờ:**
- Hoàn lại 50% giá vé  
- Phí hủy: 50% giá vé

**Hủy trong vòng 12 giờ trước giờ khởi hành:**
- Không hoàn tiền

**Cách hủy vé:**
- Truy cập "Quản lý đặt vé" trên website
- Hoặc liên hệ hotline hỗ trợ

## 2. Quy trình hoàn tiền
- Thời gian xử lý: 5-7 ngày làm việc
- Hoàn về tài khoản/thẻ thanh toán ban đầu
- Nhận email thông báo khi hoàn tiền thành công
- Kiểm tra trạng thái: Website hoặc hotline

## 3. Phương thức thanh toán
**Thanh toán online:**
- Thẻ ATM nội địa
- Visa/Mastercard/JCB
- Ví điện tử: Momo, ZaloPay
- Quét QR Code thanh toán

**Thanh toán tại bến:**
- Tiền mặt khi lên xe
- Cần đặt trước và giữ chỗ

**Bảo mật:**
- Mã hóa SSL 256-bit
- Không lưu trữ thông tin thẻ
- Tuân thủ chuẩn PCI-DSS

## 4. Thông tin về vé
**Vé điện tử (E-ticket):**
- Gửi qua email ngay sau thanh toán
- Chứa mã QR để lên xe
- Có thể tải lại từ website

**Lên xe:**
- Xuất trình mã QR hoặc mã đặt vé
- Đến trước giờ khởi hành 15-30 phút
- Mang theo CMND/CCCD

**Đổi lịch trình:**
- Liên hệ hotline trước 24h
- Phụ thuộc vào tình trạng chỗ trống
- Có thể phát sinh phí đổi vé

## 5. Chính sách hành lý
- Hành lý xách tay miễn phí: 7kg
- Hành lý ký gửi miễn phí: 20kg
- Vượt mức phụ thu: 10.000đ/kg
- Không vận chuyển hàng cấm

## 6. Liên hệ & Hỗ trợ
- Website: https://busticket.com
- Email: support@busticket.com
- Hotline: 1900-xxxx (24/7)
- Chat trực tuyến: Trên website
`;

    const prompt = `
Bạn là trợ lý hỗ trợ khách hàng chuyên nghiệp cho hệ thống đặt vé xe khách.

Cơ sở kiến thức:
${faqKnowledge}

Câu hỏi của khách hàng: "${userMessage}"

Yêu cầu:
1. Trả lời chính xác dựa trên cơ sở kiến thức
2. Nếu câu hỏi không có trong kiến thức, hãy:
   - Thừa nhận bạn không có thông tin cụ thể
   - Đề xuất liên hệ hotline hoặc email hỗ trợ
3. Giọng điệu: Thân thiện, chuyên nghiệp, lịch sự
4. Độ dài: Ngắn gọn, súc tích (dưới 150 từ)
5. KHÔNG sử dụng emoji hoặc biểu tượng cảm xúc
6. Format văn bản đơn giản, KHÔNG dùng markdown phức tạp
7. Chỉ dùng dấu gạch đầu dòng (-) nếu cần liệt kê

TRẢ LỜI BẰNG TIẾNG VIỆT:
`;

    const response = await this.geminiService.generateResponse(prompt);

    return {
      message: response.trim(),
      type: 'faq_answer',
      suggestions: [
        'Hỏi câu khác',
        'Tìm chuyến xe',
        'Xem giá vé',
        'Chính sách hoàn tiền',
      ],
    };
  }

  private async handleGeneral(userMessage: string): Promise<ChatResponseDto> {
    const prompt = `
You are a friendly bus booking assistant. Respond to this general message from a user.

User message: "${userMessage}"

Generate a warm, helpful response in Vietnamese that:
1. Acknowledges their message
2. Offers to help with booking, searching trips, or answering questions
3. Keep it brief and conversational

Return ONLY the response message.
`;

    const response = await this.geminiService.generateResponse(prompt);

    return {
      message: response.trim(),
      type: 'text',
      suggestions: [
        'Tìm chuyến Hà Nội - Đà Nẵng',
        'Xem chuyến xe hôm nay',
        'Chính sách hủy vé',
        'Liên hệ hỗ trợ',
      ],
    };
  }

  // Helper method to get trip details by ID
  async getTripDetails(tripId: string) {
    return await this.prisma.trips.findUnique({
      where: { id: tripId },
      include: {
        bus: true,
        tripRoutes: {
          include: {
            route: {
              include: {
                origin: true,
                destination: true,
              },
            },
          },
        },
        bookings: {
          where: {
            status: {
              notIn: ['cancelled'],
            },
          },
          select: {
            seatId: true,
            seat: {
              select: {
                seatNumber: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Xác nhận thanh toán sau khi người dùng scan QR code và thanh toán thành công
   */
  async confirmPayment(orderCode: number): Promise<ChatResponseDto> {
    try {
      this.logger.log(`Confirming payment for orderCode: ${orderCode}`);

      // Gọi payment service để kiểm tra và cập nhật trạng thái
      const paymentStatus =
        await this.paymentService.checkPaymentStatusByOrderCode(orderCode);

      if (!paymentStatus) {
        return {
          message:
            'Không tìm thấy thông tin thanh toán.\n\nVui lòng kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ.',
          type: 'error',
          suggestions: ['Cần hỗ trợ', 'Tìm chuyến mới'],
        };
      }

      // Kiểm tra trạng thái thanh toán
      if (paymentStatus.status === 'successful') {
        const bookingIds = paymentStatus.bookings?.map((b) => b.bookingId) || [
          paymentStatus.bookingId,
        ];

        return {
          message: `Thanh toán thành công!\n\nVé điện tử đã được gửi qua email.\nMã đơn hàng: ${orderCode}\nSố tiền: ${paymentStatus.amount?.toLocaleString('vi-VN')} VND\n\nVui lòng kiểm tra email để nhận vé điện tử và QR code lên xe.\n\nĐến bến xe trước giờ khởi hành 15-30 phút.`,
          type: 'payment_success',
          data: {
            bookingId: paymentStatus.bookingId,
            bookingIds,
            orderCode,
            amount: paymentStatus.amount,
            status: paymentStatus.status,
          },
          suggestions: ['Xem vé của tôi', 'Tìm chuyến mới'],
        };
      } else if (paymentStatus.status === 'pending') {
        return {
          message: `Thanh toán đang chờ xử lý...\n\nMã đơn hàng: ${orderCode}\nSố tiền: ${paymentStatus.amount?.toLocaleString('vi-VN')} VND\n\nVui lòng hoàn tất thanh toán hoặc chờ hệ thống xác nhận.\n\nBạn có thể nhấn "Kiểm tra lại" sau vài giây nữa.`,
          type: 'payment_pending',
          data: {
            orderCode,
            amount: paymentStatus.amount,
            status: paymentStatus.status,
          },
          suggestions: ['Kiểm tra lại', 'Cần hỗ trợ'],
        };
      } else {
        return {
          message: `Thanh toán không thành công.\n\nMã đơn hàng: ${orderCode}\nTrạng thái: ${paymentStatus.status}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ nếu bạn đã thanh toán.`,
          type: 'payment_failed',
          data: {
            orderCode,
            status: paymentStatus.status,
          },
          suggestions: ['Thử lại', 'Cần hỗ trợ'],
        };
      }
    } catch (error) {
      this.logger.error(`Error confirming payment: ${error.message}`);
      return {
        message: `Có lỗi xảy ra khi kiểm tra thanh toán:\n${error.message}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.`,
        type: 'error',
        suggestions: ['Thử lại', 'Cần hỗ trợ'],
      };
    }
  }
}
