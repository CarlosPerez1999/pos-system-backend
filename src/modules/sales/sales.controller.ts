import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale successfully created' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get an array of sales' })
  @ApiResponse({
    status: 200,
    description: 'All sales retrieved successfully',
  })
  findAll() {
    return this.salesService.findAll();
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
  @ApiParam({ name: 'id', description: 'ID to update a sale'})
  @ApiResponse({ status: 200, description: 'Sale updated successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sale by id' })
  @ApiParam({ name: 'id', description: 'ID to delete a sale'})
  @ApiResponse({ status: 204, description: 'Sale deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
