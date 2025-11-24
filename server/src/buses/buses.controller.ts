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
  async create(@Body() createBusDto: CreateBusDto) {
    return this.busesService.create(createBusDto);
  }

  @ApiOperation({ summary: 'Get all buses' })
  @ApiResponse({ status: 200, description: 'Fetched all buses successfully.' })
  @Get()
  async findAll() {
    return this.busesService.findAll();
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
  async update(@Param('id') id: string, @Body() updateBusDto: UpdateBusDto) {
    return this.busesService.update(id, updateBusDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a bus and its associated seats' })
  @ApiParam({ name: 'id', description: 'Bus ID', type: String })
  @ApiResponse({ status: 200, description: 'Bus deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Bus not found.' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.busesService.remove(id);
  }
}
