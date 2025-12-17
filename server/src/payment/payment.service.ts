import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayOSService } from 'src/payos/payos.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayOSWebhookDto } from './dto/payos-webhook.dto';
import { Prisma } from '@prisma/client';
import { BookingStatus, GatewayType, PaymentStatus } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { ETicketService } from 'src/eticket/eticket.service';
import { SmsService } from 'src/notifications/sms.service';

interface NotificationPreferences {
  email?: Record<string, boolean>;
  sms?: Record<string, boolean>;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly payosService: PayOSService,
    private readonly emailService: EmailService,
    private readonly eticketService: ETicketService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Tạo link thanh toán cho booking
   */
  async createPaymentLink(createPaymentDto: CreatePaymentDto) {
    const { bookingId, buyerName, buyerEmail, buyerPhone } = createPaymentDto;

    // Kiểm tra booking có tồn tại và chưa thanh toán
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        trip: {
          include: {
            bus: true,
          },
        },
        route: {
          include: {
            origin: true,
            destination: true,
          },
        },
        seat: true,
        user: true,
        pickupStop: {
          include: {
            location: true,
          },
        },
        dropoffStop: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.status === BookingStatus.confirmed) {
      throw new BadRequestException('Booking đã được thanh toán');
    }

    if (booking.status === BookingStatus.cancelled) {
      throw new BadRequestException('Booking đã bị hủy');
    }

    // Tạo orderCode duy nhất từ bookingId
    const orderCode = this.generateOrderCode(bookingId);
    const amount = Number(booking.price);

    // Lấy thông tin khách hàng
    const customerInfo = booking.customerInfo as Record<
      string,
      string | undefined
    >;
    const finalBuyerName =
      buyerName ||
      customerInfo?.fullName ||
      booking.user?.fullName ||
      'Khách hàng';
    const finalBuyerEmail =
      buyerEmail || customerInfo?.email || booking.user?.email || '';
    const finalBuyerPhone =
      buyerPhone ||
      customerInfo?.phoneNumber ||
      booking.user?.phoneNumber ||
      '';

    // Tạo mô tả thanh toán (PayOS giới hạn 25 ký tự)
    const description = `Ve xe ghe ${booking.seat.seatNumber}`.substring(0, 25);

    // Tạo payment record
    const payment = await this.prisma.payments.create({
      data: {
        bookingId: booking.id,
        amount: booking.price,
        gateway: GatewayType.payos,
        orderCode: BigInt(orderCode),
        status: PaymentStatus.pending,
      },
    });

    try {
      // Tạo payment link với PayOS
      const paymentLink = await this.payosService.createPaymentLink({
        orderCode,
        amount,
        description,
        buyerName: finalBuyerName,
        buyerEmail: finalBuyerEmail,
        buyerPhone: finalBuyerPhone,
        items: [
          {
            name: description,
            quantity: 1,
            price: amount,
          },
        ],
      });

      // Log response để debug
      this.logger.log('PayOS Response:', JSON.stringify(paymentLink, null, 2));

      // Cập nhật payment với paymentLinkId
      const linkData = paymentLink as {
        paymentLinkId?: string;
        id?: string;
        checkoutUrl?: string;
        checkout_url?: string;
        qrCode?: string;
        qr_code?: string;
        orderCode?: number;
        order_code?: number;
        amount?: number;
      };

      await this.prisma.payments.update({
        where: { id: payment.id },
        data: {
          gatewayTransactionId:
            linkData.paymentLinkId || linkData.id || 'unknown',
        },
      });

      this.logger.log(
        `Payment link created for booking ${bookingId}: ${linkData.checkoutUrl || linkData.checkout_url}`,
      );

      return {
        paymentId: payment.id,
        checkoutUrl: linkData.checkoutUrl || linkData.checkout_url || '',
        qrCode: linkData.qrCode || linkData.qr_code,
        orderCode: linkData.orderCode || linkData.order_code || orderCode,
        amount: linkData.amount || amount,
      };
    } catch (error) {
      // Nếu tạo payment link thất bại, cập nhật payment status
      await this.prisma.payments.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.failed },
      });

      throw error;
    }
  }

  /**
   * Xử lý webhook từ PayOS
   */
  async handlePayOSWebhook(webhookData: PayOSWebhookDto) {
    try {
      // Xác thực webhook data
      const verifiedData =
        this.payosService.verifyPaymentWebhookData(webhookData);

      this.logger.log(
        `Received PayOS webhook for order: ${verifiedData.orderCode}`,
      );

      // Tìm booking từ orderCode
      const bookingId = await this.getBookingIdFromOrderCode(
        verifiedData.orderCode,
      );

      const booking = await this.prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          payments: {
            where: { gateway: GatewayType.payos },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          user: true,
          trip: {
            include: {
              bus: true,
            },
          },
          route: {
            include: {
              origin: true,
              destination: true,
            },
          },
          seat: true,
          pickupStop: {
            include: {
              location: true,
            },
          },
          dropoffStop: {
            include: {
              location: true,
            },
          },
        },
      });

      if (!booking) {
        this.logger.error(
          `Booking not found for orderCode: ${verifiedData.orderCode}`,
        );
        throw new NotFoundException('Booking không tồn tại');
      }

      const payment = booking.payments[0];
      if (!payment) {
        this.logger.error(`Payment not found for booking: ${bookingId}`);
        throw new NotFoundException('Payment không tồn tại');
      }

      // Kiểm tra trạng thái thanh toán
      const isSuccess = verifiedData.code === '00';

      if (isSuccess) {
        // Thanh toán thành công
        await this.prisma.$transaction(async (tx) => {
          // Cập nhật payment status
          await tx.payments.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.successful,
              gatewayTransactionId: verifiedData.paymentLinkId,
            },
          });

          // Cập nhật booking status
          await tx.bookings.update({
            where: { id: bookingId },
            data: {
              status: BookingStatus.confirmed,
            },
          });
        });

        this.logger.log(`Payment successful for booking: ${bookingId}`);

        // Gửi email xác nhận và e-ticket
        try {
          const customerInfo = booking.customerInfo as Record<string, unknown>;
          const customerEmail =
            booking.user?.email || (customerInfo?.email as string);
          const customerPhone =
            booking.user?.phoneNumber || (customerInfo?.phoneNumber as string);
          const customerName =
            booking.user?.fullName ||
            (customerInfo?.fullName as string) ||
            'Khách hàng';

          // Check email preferences
          let sendEmail = true;
          if (booking.user?.id) {
            const emailPref = await this.checkEmailPreference(
              booking.user.id,
              'payment',
            );
            sendEmail = emailPref;
          }

          if (sendEmail && customerEmail && booking.ticketCode) {
            // Tạo PDF e-ticket
            const pdfBuffer = await this.eticketService.generatePDF(
              booking.ticketCode,
            );

            // Gửi email với attachment
            await this.emailService.sendETicketEmail(
              customerEmail,
              booking.ticketCode,
              customerName,
              {
                from: booking.route.origin.name,
                to: booking.route.destination.name,
                departureTime: booking.trip.startTime.toISOString(),
                seatNumber: booking.seat.seatNumber,
              },
              pdfBuffer,
            );

            this.logger.log(`Confirmation email sent to: ${customerEmail}`);
          }

          // Check SMS preferences
          let sendSms = true;
          if (booking.user?.id) {
            const smsPref = await this.smsService.checkSmsPreference(
              booking.user.id,
              'payment',
            );
            sendSms = smsPref;
          }

          // Gửi SMS confirmation
          if (sendSms && customerPhone && booking.ticketCode) {
            const tripDate = booking.trip.startTime.toLocaleDateString(
              'vi-VN',
              {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              },
            );
            const tripTime = booking.trip.startTime.toLocaleTimeString(
              'vi-VN',
              {
                hour: '2-digit',
                minute: '2-digit',
              },
            );

            await this.smsService.sendBookingConfirmationSms(customerPhone, {
              customerName,
              ticketCode: booking.ticketCode,
              tripDate,
              tripTime,
              origin: booking.route.origin.name,
              destination: booking.route.destination.name,
              seatNumber: booking.seat.seatNumber,
              price: `${Number(booking.price).toLocaleString('vi-VN')}đ`,
            });
            this.logger.log(`Confirmation SMS sent to: ${customerPhone}`);
          }
        } catch (notificationError) {
          this.logger.error(
            'Failed to send confirmation notifications',
            notificationError,
          );
          // Không throw error vì payment đã thành công
        }
      } else {
        // Thanh toán thất bại
        await this.prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.failed,
          },
        });

        this.logger.log(`Payment failed for booking: ${bookingId}`);
      }

      return {
        success: true,
        message: isSuccess
          ? 'Payment processed successfully'
          : 'Payment failed',
        bookingId,
        status: isSuccess ? 'successful' : 'failed',
      };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async checkPaymentStatus(bookingId: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: { gateway: GatewayType.payos },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    const payment = booking.payments[0];
    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    // Lấy thông tin từ PayOS
    const orderCode = this.generateOrderCode(bookingId);
    try {
      const paymentInfo =
        await this.payosService.getPaymentLinkInformation(orderCode);

      return {
        bookingId,
        paymentId: payment.id,
        status: payment.status,
        amount: Number(payment.amount),
        gateway: payment.gateway,
        paymentInfo,
      };
    } catch (error) {
      this.logger.error(
        `Error checking payment status: ${(error as Error).message}`,
      );
      return {
        bookingId,
        paymentId: payment.id,
        status: payment.status,
        amount: Number(payment.amount),
        gateway: payment.gateway,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán theo orderCode (public API cho callback)
   */
  async checkPaymentStatusByOrderCode(orderCode: number) {
    const bookingId = await this.getBookingIdFromOrderCode(orderCode);

    // Get full booking details for redirect
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: { gateway: GatewayType.payos },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        trip: true,
        route: {
          include: {
            origin: true,
            destination: true,
          },
        },
        seat: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    const payment = booking.payments[0];
    const customerInfo = booking.customerInfo as Record<
      string,
      string | undefined
    >;

    return {
      bookingId,
      tripId: booking.tripId,
      routeId: booking.routeId,
      ticketCode: booking.ticketCode,
      status: payment?.status || 'pending',
      seatNumber: booking.seat?.seatNumber,
      passengerName: customerInfo?.fullName,
      email: customerInfo?.email,
      travelDate: booking.trip?.startTime,
      amount: Number(payment?.amount || booking.price),
      gateway: payment?.gateway,
    };
  }

  /**
   * Hủy thanh toán
   */
  async cancelPayment(bookingId: string, reason?: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: { gateway: GatewayType.payos },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    const payment = booking.payments[0];
    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    if (payment.status === PaymentStatus.successful) {
      throw new BadRequestException(
        'Không thể hủy payment đã thanh toán thành công',
      );
    }

    // Hủy payment link trên PayOS
    const orderCode = this.generateOrderCode(bookingId);
    try {
      await this.payosService.cancelPaymentLink(orderCode, reason);

      // Cập nhật payment status
      await this.prisma.payments.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.failed },
      });

      this.logger.log(`Payment cancelled for booking: ${bookingId}`);

      return {
        success: true,
        message: 'Payment cancelled successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error cancelling payment: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Check if user has email notifications enabled for a specific type
   */
  private async checkEmailPreference(
    userId: string,
    notificationType: 'booking' | 'payment' | 'reminder' | 'promotion',
  ): Promise<boolean> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { notificationPreferences: true },
      });

      if (!user || !user.notificationPreferences) {
        return true; // Default to enabled
      }

      const prefs = user.notificationPreferences as NotificationPreferences;
      return prefs.email?.[notificationType] !== false;
    } catch (error) {
      this.logger.error('Error checking email preferences:', error);
      return true; // Default to enabled on error
    }
  }

  /**
   * Generate orderCode từ bookingId
   * PayOS yêu cầu orderCode là số nguyên dương <= 9007199254740991
   */
  private generateOrderCode(bookingId: string): number {
    // Sử dụng timestamp nhưng chỉ lấy 10 chữ số (seconds + ms)
    const timestamp = Math.floor(Date.now() / 100); // Chia 100 để giảm kích thước
    // Lấy 3 chữ số từ hash bookingId
    const hash =
      bookingId.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0) % 1000;

    // Kết hợp để tạo số duy nhất (tối đa 13 chữ số, an toàn cho PayOS)
    return timestamp * 1000 + hash;
  }

  /**
   * Lấy bookingId từ orderCode
   */
  private async getBookingIdFromOrderCode(orderCode: number): Promise<string> {
    // BigInt type not supported in Prisma where clause type definition

    const payment = await this.prisma.payments.findUnique({
      where: {
        orderCode: BigInt(orderCode),
      } as unknown as Prisma.PaymentsWhereUniqueInput,
      select: { bookingId: true },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment not found for orderCode: ${orderCode}`,
      );
    }

    return payment.bookingId;
  }
}
