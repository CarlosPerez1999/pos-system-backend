import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { ProductsService } from '../products/products.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { InventoryService } from '../inventory/inventory.service';
import { CreateInventoryDto } from '../inventory/dto/create-inventory.dto';
import { MovementType } from '../inventory/enum/movement-type.enum';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    /**
     * Creates a sale within a transactional context using TypeORM's DataSource.
     * Steps:
     * 1. Initializes and saves the base Sale entity.
     * 2. Iterates over each item in the DTO to:
     *    - Fetch the corresponding Product.
     *    - Create a SaleItem with quantity and unit price.
     *    - Register an inventory OUT movement via inventoryService,
     *      passing the transaction manager to ensure atomicity.
     * 3. Updates the Sale with its items and total, then persists it.
     *
     * All operations are wrapped in a single transaction to ensure consistency
     * between sales and inventory movements.
     */

    try {
      return await this.dataSource.transaction(async (manager) => {
        const sale = new Sale();
        sale.date = createSaleDto.date;
        sale.items = [];
        sale.total = 0;

        const savedSale = await manager.save(sale);

        for (const itemDto of createSaleDto.items) {
          const product = await this.productsService.findOne(itemDto.productId);

          const saleItem = new SaleItem();
          saleItem.product = product;
          saleItem.quantity = itemDto.quantity;
          saleItem.unitPrice = product.price;

          const createInventoryDto: CreateInventoryDto = {
            productId: product.id,
            movementType: MovementType.OUT,
            quantity: saleItem.quantity,
            description: `Sale with id ${savedSale.id}`,
          };

          await this.inventoryService.create(createInventoryDto, manager);
          savedSale.items.push(saleItem);
          savedSale.total += saleItem.unitPrice * saleItem.quantity;
        }

        return await manager.save(savedSale);
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Sale>> {
    try {
      const sales = await this.salesRepository.find({
        take: pagination.limit ?? 10,
        skip: pagination.offset ?? 0,
      });
      return {
        items: sales,
        total: await this.salesRepository.count(),
        limit: pagination.limit ?? 10,
        offset: pagination.offset ?? 0,
      };
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
