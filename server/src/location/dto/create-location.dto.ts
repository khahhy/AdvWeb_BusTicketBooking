import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Bến xe Miền Đông',
    description: 'Tên địa điểm hoặc bến xe',
  })
  name: string;

  @ApiProperty({
    example: '292 Đinh Bộ Lĩnh, P.26, Bình Thạnh, TP.HCM',
    description: 'Địa chỉ chi tiết (tùy chọn)',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 'TP.HCM',
    description: 'Tên thành phố',
  })
  city: string;
}
