import { Controller, Get, Param } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @ApiOperation({ summary: 'Get all routes' })
  @Get()
  async findAll() {
    return this.routesService.findAll();
  }

  @ApiOperation({ summary: 'Get a route by ID with trips' })
  @ApiParam({ name: 'id', description: 'Route ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }
}
