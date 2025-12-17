import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayOSWebhookDto } from './dto/payos-webhook.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Tạo link thanh toán cho booking (public for guest checkout)',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment link created successfully',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', example: 'payment-uuid-123' },
        checkoutUrl: {
          type: 'string',
          example: 'https://pay.payos.vn/web/...',
        },
        qrCode: { type: 'string', example: 'https://img.vietqr.io/...' },
        orderCode: { type: 'number', example: 123456789 },
        amount: { type: 'number', example: 250000 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Booking không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Booking đã được thanh toán hoặc đã bị hủy',
  })
  async createPaymentLink(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPaymentLink(createPaymentDto);
  }

  @Post('webhook/payos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook từ PayOS để xử lý kết quả thanh toán' })
  @ApiBody({ type: PayOSWebhookDto })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handlePayOSWebhook(@Body() webhookData: PayOSWebhookDto) {
    return this.paymentService.handlePayOSWebhook(webhookData);
  }

  @Get('status/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán của booking' })
  @ApiParam({ name: 'bookingId', description: 'ID của booking' })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking hoặc Payment không tồn tại',
  })
  async checkPaymentStatus(@Param('bookingId') bookingId: string) {
    return this.paymentService.checkPaymentStatus(bookingId);
  }

  @Get('status-by-order/:orderCode')
  @ApiOperation({
    summary: 'Kiểm tra trạng thái thanh toán theo orderCode (public)',
  })
  @ApiParam({ name: 'orderCode', description: 'OrderCode từ PayOS' })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
  })
  async checkPaymentStatusByOrderCode(@Param('orderCode') orderCode: string) {
    return this.paymentService.checkPaymentStatusByOrderCode(Number(orderCode));
  }

  @Delete('cancel/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy payment link' })
  @ApiParam({ name: 'bookingId', description: 'ID của booking' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Khách hàng không muốn thanh toán nữa',
        },
      },
    },
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  @ApiResponse({
    status: 404,
    description: 'Booking hoặc Payment không tồn tại',
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể hủy payment đã thanh toán thành công',
  })
  async cancelPayment(
    @Param('bookingId') bookingId: string,
    @Body() body?: { reason?: string },
  ) {
    return this.paymentService.cancelPayment(bookingId, body?.reason);
  }
}
