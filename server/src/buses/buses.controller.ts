import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { BusesService } from './buses.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { QueryBusesDto } from './dto/query-buses.dto';
import type { RequestWithUser } from 'src/common/type/request-with-user.interface';

@ApiTags('buses')
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new bus and generate its seats' })
  @ApiBody({ type: CreateBusDto })
  @ApiResponse({ status: 201, description: 'Bus created successfully.' })
  @ApiResponse({ status: 400, description: 'Plate already exists.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBusDto: CreateBusDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    const ip = req.ip as string;
    const userAgent = req.headers['user-agent'] as string;
    return this.busesService.create(createBusDto, userId, ip, userAgent);
  }

  @ApiOperation({ summary: 'Get all buses with optional filtering' })
  @ApiResponse({ status: 200, description: 'Fetched all buses successfully.' })
  @Get()
  async findAll(@Query() query: QueryBusesDto) {
    return this.busesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a specific bus by ID' })
  @ApiParam({ name: 'id', description: 'Bus ID', type: String })
  @ApiResponse({ status: 200, description: 'Fetched bus successfully.' })
  @ApiResponse({ status: 404, description: 'Bus not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }

  @ApiOperation({ summary: 'Get all seats for a specific bus' })
  @ApiParam({ name: 'id', description: 'Bus ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Fetched seats for bus successfully.',
  })
  @ApiResponse({ status: 404, description: 'Bus not found.' })
  @Get(':id/seats')
  async getSeats(@Param('id') id: string) {
    return this.busesService.getSeats(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a bus' })
  @ApiParam({ name: 'id', description: 'Bus ID', type: String })
  @ApiBody({ type: UpdateBusDto })
  @ApiResponse({ status: 200, description: 'Bus updated successfully.' })
  @ApiResponse({ status: 404, description: 'Bus not found.' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBusDto: UpdateBusDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    const ip = req.ip as string;
    const userAgent = req.headers['user-agent'] as string;
    return this.busesService.update(id, updateBusDto, userId, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a bus and its associated seats' })
  @ApiParam({ name: 'id', description: 'Bus ID', type: String })
  @ApiResponse({ status: 200, description: 'Bus deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Bus not found.' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const ip = req.ip as string;
    const userAgent = req.headers['user-agent'] as string;
    return this.busesService.remove(id, userId, ip, userAgent);
  }
}
