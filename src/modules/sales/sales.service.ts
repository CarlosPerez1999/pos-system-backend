import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { ProductsService } from '../products/products.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,

    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    try {
      const sale = new Sale();
      sale.date = createSaleDto.date;

      const items: SaleItem[] = [];

      for (const itemDto of createSaleDto.items) {
        const product = await this.productsService.findOne(itemDto.productId);
        const saleItem = new SaleItem();
        saleItem.product = product;
        saleItem.quantity = itemDto.quantity;
        saleItem.unitPrice = product.price;

        items.push(saleItem);
      }

      sale.items = items;
      sale.total = items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );

      const savedSale = await this.salesRepository.save(sale);
      return savedSale;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findAll(pagination: PaginationDto):Promise<PaginatedResponseDto<Sale>> {
    try {
      const sales = await this.salesRepository.find({
        take: pagination.limit ?? 10,
        skip: pagination.offset ?? 0
      });
      return {
        items: sales,
        total: await this.salesRepository.count(),
        limit: pagination.limit ?? 10,
        offset: pagination.offset ?? 0,
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findOne(id: string) {
    try {
      const sale = await this.salesRepository.findOne({
        where: { id },
        relations: ['items'],
      });
      if (!sale) throw new NotFoundException(`Sale with id ${id} not found`);
      return sale;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    try {
      const sale = await this.salesRepository.preload({
        id,
        ...updateSaleDto,
      });

      if (!sale) throw new NotFoundException(`Sale with id ${id} not found`);

      return await this.salesRepository.save(sale);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.salesRepository.softDelete(id);
      if (result.affected === 0)
        throw new NotFoundException(`Sale with id ${id} not found`);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
