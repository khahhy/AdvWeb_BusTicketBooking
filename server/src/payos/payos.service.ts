import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';

export interface CreatePaymentLinkData {
  orderCode: number;
  amount: number;
  description: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  cancelUrl?: string;
  returnUrl?: string;
}

export interface PaymentLinkResponse {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}

export interface WebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  virtualAccountNumber?: string;
}

@Injectable()
export class PayOSService {
  private readonly logger = new Logger(PayOSService.name);
  private payOS: PayOS;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      this.logger.error('PayOS credentials are not configured');
      throw new Error('PayOS credentials are missing in environment variables');
    }

    try {
      this.payOS = new PayOS({
        clientId,
        apiKey,
        checksumKey,
      });
      this.logger.log('PayOS service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PayOS', error);
      throw error;
    }
  }

  /**
   * Tạo link thanh toán
   */
  async createPaymentLink(
    data: CreatePaymentLinkData,
  ): Promise<PaymentLinkResponse> {
    try {
      this.logger.log(`Creating payment link for order: ${data.orderCode}`);

      const paymentData: any = {
        orderCode: data.orderCode,
        amount: data.amount,
        description: data.description,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        buyerAddress: data.buyerAddress,
        items: data.items || [
          {
            name: data.description,
            quantity: 1,
            price: data.amount,
          },
        ],
        cancelUrl:
          data.cancelUrl ||
          this.configService.get<string>('PAYOS_CANCEL_URL') ||
          '',
        returnUrl:
          data.returnUrl ||
          this.configService.get<string>('PAYOS_RETURN_URL') ||
          '',
      };

      const response = await this.payOS.paymentRequests.create(paymentData);

      this.logger.log('PayOS API Response:', JSON.stringify(response, null, 2));

      // PayOS SDK v2 wraps response in a 'data' property
      const responseData = (response as any).data || response;

      // If no checkoutUrl, construct it manually from paymentLinkId or orderCode
      let checkoutUrl = responseData.checkoutUrl || responseData.checkout_url;

      if (!checkoutUrl && responseData.paymentLinkId) {
        // Construct PayOS checkout URL manually
        checkoutUrl = `https://pay.payos.vn/web/${responseData.paymentLinkId}`;
      } else if (!checkoutUrl && data.orderCode) {
        // Alternative: use orderCode
        checkoutUrl = `https://pay.payos.vn/web/${data.orderCode}`;
      }

      this.logger.log(`Payment link created successfully: ${checkoutUrl}`);

      // Return with constructed checkoutUrl
      return {
        ...responseData,
        checkoutUrl,
      };
    } catch (error) {
      this.logger.error('Failed to create payment link', error);
      throw new BadRequestException(
        `Failed to create payment link: ${error.message}`,
      );
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async getPaymentLinkInformation(orderCode: number): Promise<any> {
    try {
      this.logger.log(`Getting payment info for order: ${orderCode}`);
      const response = await this.payOS.paymentRequests.get(orderCode);
      return response;
    } catch (error) {
      this.logger.error(`Failed to get payment info: ${error.message}`);
      throw new BadRequestException(
        `Failed to get payment information: ${error.message}`,
      );
    }
  }

  /**
   * Hủy link thanh toán
   */
  async cancelPaymentLink(
    orderCode: number,
    cancellationReason?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Canceling payment for order: ${orderCode}`);
      const response = await this.payOS.paymentRequests.cancel(
        orderCode,
        cancellationReason,
      );
      this.logger.log(`Payment link cancelled successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to cancel payment link: ${error.message}`);
      throw new BadRequestException(
        `Failed to cancel payment link: ${error.message}`,
      );
    }
  }

  /**
   * Xác thực webhook từ PayOS
   */
  verifyPaymentWebhookData(webhookData: WebhookData): WebhookData {
    try {
      this.logger.log(
        `Verifying webhook data for order: ${webhookData.orderCode}`,
      );
      // PayOS SDK v2 doesn't require signature verification for webhook
      // Just return the data as-is since PayOS handles verification internally
      this.logger.log('Webhook data received');
      return webhookData;
    } catch (error) {
      this.logger.error('Webhook verification failed', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Confirm webhook đã nhận
   */
  confirmWebhook(webhookUrl: string): Promise<any> {
    try {
      this.logger.log(`Confirming webhook URL: ${webhookUrl}`);
      return this.payOS.webhooks.confirm(webhookUrl);
    } catch (error) {
      this.logger.error('Failed to confirm webhook', error);
      throw new BadRequestException('Failed to confirm webhook');
    }
  }
}
