import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('sales')
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale successfully created' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: User) {
    return this.salesService.create(createSaleDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get an array of sales' })
  @ApiResponse({
    status: 200,
    description: 'All sales retrieved successfully',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.salesService.findAll(paginationDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get sales summary' })
  @ApiResponse({
    status: 200,
    description: 'Sales summary retrieved successfully',
  })
  summary() {
    return this.salesService.summary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by id' })
  @ApiParam({
    name: 'id',
    description: 'ID to search for a sales',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Sale retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sale by id' })
  @ApiParam({ name: 'id', description: 'ID to update a sale' })
  @ApiResponse({ status: 200, description: 'Sale updated successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sale by id' })
  @ApiParam({ name: 'id', description: 'ID to delete a sale' })
  @ApiResponse({ status: 204, description: 'Sale deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
