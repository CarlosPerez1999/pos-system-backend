import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory movement' })
  @ApiResponse({
    status: 201,
    description: 'Inventory movement successfully created',
  })
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return await this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get an array of inventory movements' })
  @ApiResponse({
    status: 200,
    description: 'All inventory movements retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllOrSearch(
    @Query() paginationDto: PaginationDto,
    @Query('productId') productId?: string,
  ) {
    if (productId) {
      return await this.inventoryService.findByProductId(
        productId,
        paginationDto,
      );
    }
    return await this.inventoryService.findAll(paginationDto);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({
    status: 200,
    description: 'Products with low stock retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Products with low stock not found',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async lowStock(@Query() paginationDto: PaginationDto) {
    return await this.inventoryService.lowStock(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory movement by id' })
  @ApiParam({
    name: 'id',
    description: 'ID to search for a inventory movement',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory movement retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Inventory movement not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    return await this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory movement by id' })
  @ApiParam({
    name: 'id',
    description: 'ID to update a inventory movement',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory movement updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Inventory movement not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return await this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory movement by id' })
  @ApiParam({
    name: 'id',
    description: 'ID to delete a inventory movement',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Inventory movement deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Inventory movement not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string) {
    return await this.inventoryService.remove(id);
  }
}
