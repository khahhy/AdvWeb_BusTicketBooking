import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PayOSWebhookDto {
  @ApiProperty({
    description: 'Mã đơn hàng',
    example: 123456,
  })
  @IsNotEmpty()
  @IsNumber()
  orderCode: number;

  @ApiProperty({
    description: 'Số tiền',
    example: 100000,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Mô tả giao dịch',
    example: 'Thanh toán vé xe',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Số tài khoản',
  })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Mã tham chiếu',
  })
  @IsNotEmpty()
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'Thời gian giao dịch',
  })
  @IsNotEmpty()
  @IsString()
  transactionDateTime: string;

  @ApiProperty({
    description: 'Loại tiền tệ',
    example: 'VND',
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'ID link thanh toán',
  })
  @IsNotEmpty()
  @IsString()
  paymentLinkId: string;

  @ApiProperty({
    description: 'Mã trạng thái',
    example: '00',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Mô tả trạng thái',
    example: 'success',
  })
  @IsNotEmpty()
  @IsString()
  desc: string;

  @ApiProperty({
    description: 'ID ngân hàng đối tác',
    required: false,
  })
  @IsString()
  counterAccountBankId?: string;

  @ApiProperty({
    description: 'Tên ngân hàng đối tác',
    required: false,
  })
  @IsString()
  counterAccountBankName?: string;

  @ApiProperty({
    description: 'Tên tài khoản đối tác',
    required: false,
  })
  @IsString()
  counterAccountName?: string;

  @ApiProperty({
    description: 'Số tài khoản đối tác',
    required: false,
  })
  @IsString()
  counterAccountNumber?: string;

  @ApiProperty({
    description: 'Tên tài khoản ảo',
    required: false,
  })
  @IsString()
  virtualAccountName?: string;

  @ApiProperty({
    description: 'Số tài khoản ảo',
    required: false,
  })
  @IsString()
  virtualAccountNumber?: string;
}
