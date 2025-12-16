import { Controller, Get, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @ApiOperation({ summary: 'Get all notifications for current user' })
  @Get()
  async findAllForUser(@Request() req: any) {
    return this.notificationsService.findAllForUser(req.user.id as string);
  }

  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.findOne(id, req.user.id as string);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: String })
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id as string);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Patch('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id as string);
  }

  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: String })
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.delete(id, req.user.id as string);
  }
}
