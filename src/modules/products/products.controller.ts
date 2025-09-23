import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @ApiResponse({
    status: 409,
    description: 'Product with this SKU or Barcode already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get an array of products' })
  @ApiResponse({
    status: 200,
    description: 'All products retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    return await this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({
    name: 'id',
    description: 'ID to search for a product',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product by id' })
  @ApiParam({ name: 'id', description: 'ID to update a product', type: String })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiParam({ name: 'id', description: 'ID to delete a product', type: String })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.remove(id);
  }
}
