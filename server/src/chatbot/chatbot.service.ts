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
            'Hà Nội đi Đà Nẵng',
            'Sài Gòn đi Nha Trang',
            'Đà Nẵng đi Hội An',
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
          suggestions: [
            'Xem các ngày khác',
            'Thay đổi điểm đến',
            'Tìm kiếm tuyến khác',
          ],
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
        suggestions: ['Xem tất cả chuyến', 'Tìm chuyến khác', 'Thay đổi ngày'],
      };
    } catch (error) {
      this.logger.error(`Error in trip search: ${error.message}`);
      return {
        message:
          'Tôi có thể giúp bạn tìm chuyến xe. Bạn muốn đi từ đâu đến đâu?',
        type: 'text',
        suggestions: [
          'Hà Nội đi Sài Gòn',
          'Đà Nẵng đi Nha Trang',
          'Xem các tuyến phổ biến',
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
          message: `🚌 Sơ đồ ghế:\n\n${seatMap}\n\n✅ Ghế trống (${availableSeats.length}): ${availableSeats.slice(0, 10).join(', ')}${availableSeats.length > 10 ? '...' : ''}\n❌ Đã đặt: ${bookedSeats.length} ghế\n\nNhập số ghế bạn muốn chọn (vd: A1, B2):`,
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
          message: `✓ Đã chọn ${seats.length} ghế: ${seats.join(', ')}\n\nVui lòng cung cấp thông tin hành khách:\n\n📝 Họ tên:\n📧 Email:\n📱 Số điện thoại:\n\nVí dụ: "Nguyễn Văn A, example@email.com, 0912345678"`,
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
          message: `✓ Thông tin đã nhận!\n\n👤 ${name}\n📧 ${email}\n📱 ${phone}\n\nTổng tiền: ${bookingState.totalPrice?.toLocaleString('vi-VN')} VND\n\nChọn phương thức thanh toán:`,
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

          const seatMap = this.generateTextSeatMap(
            availableSeats,
            bookedSeats,
            trip.bus.busType,
          );

          return {
            message: `🚌 Xe ${busType.toUpperCase()} - ${allSeats.length} ghế\n\n📋 Tình trạng ghế theo hàng:\n(Click số ghế để chọn nhanh)\n\n${seatMap}\n\n💡 Chú thích:\n[A1] = Ghế trống (${availableSeats.length} ghế)\n[A1✗] = Đã đặt (${bookedSeats.length} ghế)\n\n👉 Nhập số ghế bạn muốn (vd: A1 hoặc A1,B2)`,
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
          message: `✓ Đã chọn ${bookingState.selectedSeats?.length || 0} ghế!\n\n👤 Thông tin của bạn:\n${user.fullName}\n${user.email}\n${user.phoneNumber || 'Chưa có SĐT'}\n\nTổng tiền: ${bookingState.totalPrice?.toLocaleString('vi-VN')} VND\n\nChọn phương thức thanh toán:`,
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
        message: `Ghế đã được chọn! Vui lòng cung cấp thông tin hành khách:\n\n📝 Họ tên:\n📧 Email:\n📱 Số điện thoại:\n\nVí dụ: "Nguyễn Văn A, example@email.com, 0912345678"`,
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
          message: `✅ Đặt vé thành công!\n\n👤 ${passengerInfo.name}\n📧 ${passengerInfo.email}\n📱 ${passengerInfo.phone}\n🎫 Ghế: ${selectedSeats?.join(', ')}\n💰 Tổng tiền: ${totalPrice?.toLocaleString('vi-VN')} VND\n\n🔗 Nhấn nút bên dưới để thanh toán ngay:\n\n⏰ Link thanh toán có hiệu lực trong 15 phút`,
          type: 'payment_link',
          data: {
            bookingIds: bookingIds,
            paymentId: paymentResult.paymentId,
            checkoutUrl: paymentResult.checkoutUrl,
            qrCode: paymentResult.qrCode,
            amount: paymentResult.amount,
            orderCode: paymentResult.orderCode,
          },
          suggestions: [],
        };
      } catch (error) {
        this.logger.error(`Error creating booking/payment: ${error.message}`);
        return {
          message: `❌ Có lỗi xảy ra khi tạo đặt vé:\n${error.message}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.`,
          type: 'error',
          suggestions: ['Thử lại', 'Tìm chuyến khác'],
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
# Bus Booking FAQs

## Cancellation Policy
- Có thể hủy vé trước 24h: Hoàn 80% giá vé
- Hủy trước 12h: Hoàn 50% giá vé  
- Hủy trong vòng 12h: Không hoàn tiền
- Liên hệ hotline để hủy vé: 1900-xxxx

## Refund Process
- Thời gian hoàn tiền: 5-7 ngày làm việc
- Hoàn về tài khoản/thẻ thanh toán ban đầu
- Kiểm tra trạng thái hoàn tiền qua email hoặc hotline

## Payment Methods
- Chấp nhận: Thẻ ATM, Visa, Mastercard, Momo, ZaloPay
- Thanh toán an toàn với mã hóa SSL
- Không lưu thông tin thẻ

## Ticket Information
- E-ticket gửi qua email sau khi thanh toán
- Xuất trình mã QR khi lên xe
- Đổi lịch trình liên hệ hotline (phụ thuộc vào chính sách)

## Contact
- Hotline: 1900-xxxx (24/7)
- Email: support@busticket.com
- Website: www.busticket.com
`;

    const prompt = `
You are a customer support assistant for a bus booking system. Answer the user's question based on this knowledge base.

Knowledge Base:
${faqKnowledge}

User question: "${userMessage}"

Provide a helpful, concise answer in Vietnamese. If the question is not covered in the knowledge base, 
provide general helpful information and suggest contacting support.

Keep the response friendly and professional, under 200 words.
`;

    const response = await this.geminiService.generateResponse(prompt);

    return {
      message: response.trim(),
      type: 'faq_answer',
      suggestions: ['Hỏi câu khác', 'Liên hệ hỗ trợ', 'Quay lại tìm kiếm'],
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
      suggestions: ['Tìm chuyến xe', 'Đặt vé', 'Câu hỏi thường gặp'],
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
}
