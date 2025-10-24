import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const whereConditions: Record<string, string>[] = [
        { sku: createProductDto.sku },
      ];

      if (createProductDto.barcode) {
        whereConditions.push({ barcode: createProductDto.barcode });
      }

      const existing = await this.productsRepository.findOne({
        where: whereConditions,
      });

      if (existing) {
        throw new ConflictException(
          'Product with this SKU or Barcode already exists',
        );
      }

      const newProduct = this.productsRepository.create(createProductDto);
      const savedProduct = await this.productsRepository.save(newProduct);

      return savedProduct;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Product>> {
    try {
      const products = await this.productsRepository.find({
        take: pagination.limit ?? 10,
        skip: pagination.offset ?? 0,
      });

      return {
        items: products,
        total: await this.productsRepository.count(),
        limit: pagination.limit ?? 10,
        offset: pagination.offset ?? 0,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productsRepository.findOneBy({ id });
      if (!product)
        throw new NotFoundException(`Product with id ${id} not found`);
      return product;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findBySearch(
    query: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Product>> {
    try {
      const products = await this.productsRepository.find({
        where: [
          { sku: ILike(`%${query}%`) },
          { name: ILike(`%${query}%`) },
          { barcode: ILike(`%${query}%`) },
        ],

        take: pagination.limit ?? 10,
        skip: pagination.offset ?? 0,
      });

      return {
        items: products,
        total: products.length,
        limit: pagination.limit ?? 10,
        offset: pagination.offset ?? 0,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const product = await this.productsRepository.preload({
        id,
        ...updateProductDto,
      });

      if (!product)
        throw new NotFoundException(`Product with id ${id} not found`);

      return await this.productsRepository.save(product);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.productsRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
