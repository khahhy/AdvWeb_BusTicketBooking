import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';

@ApiTags('activity-logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@ApiBearerAuth('JWT-auth')
export class ActivityLogsController {
  constructor(private readonly activityLogService: ActivityLogsService) {}

  @ApiOperation({ summary: 'Admin: Get all system activity logs' })
  @ApiResponse({
    status: 200,
    description: 'Fetched all activity logs successfully.',
  })
  @Get()
  async findAll(@Query() query: QueryActivityLogDto) {
    return this.activityLogService.findAll(query.page, query.limit);
  }

  @ApiOperation({ summary: 'Admin: Get history of a specific user' })
  @ApiParam({ name: 'userId', description: 'User UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Fetched user history successfully.',
  })
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.activityLogService.findByUser(userId);
  }

  @ApiOperation({
    summary: 'Admin: Get history of a specific entity (e.g., Bus, Trip)',
  })
  @ApiParam({
    name: 'type',
    description:
      'Entity Type: Buses, Locations, Routes, Settings, Trips, Users',
    type: String,
  })
  @ApiParam({ name: 'id', description: 'Entity UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Fetched entity history successfully.',
  })
  @Get('entity/:type/:id')
  async findByEntity(@Param('type') type: string, @Param('id') id: string) {
    return this.activityLogService.findByEntity(id, type);
  }
}
