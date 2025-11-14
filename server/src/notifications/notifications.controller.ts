import { Controller, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Get all notifications' })
  @Get()
  async findAll() {
    return this.notificationsService.findAll();
  }

  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }
}
