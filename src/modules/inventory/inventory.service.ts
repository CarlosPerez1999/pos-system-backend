import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { MovementType } from './enum/movement-type.enum';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private readonly productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    try {
      const product = await this.productsService.findOne(
        createInventoryDto.productId,
      );

      return await this.dataSource.transaction(async (entityManager) => {
        const newMovement = entityManager.create(Inventory, createInventoryDto);
        this.applyProductStock(
          createInventoryDto.movementType,
          product,
          createInventoryDto.quantity,
        );
        await entityManager.save(Product, product);
        newMovement.product = product;
        const savedMovement = await entityManager.save(Inventory, newMovement);

        return savedMovement;
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Inventory>> {
    try {
      const movements = await this.inventoryRepository.find({
        take: pagination.limit ?? 10,
        skip: pagination.offset ?? 0,
      });

      return {
        items: movements,
        total: await this.inventoryRepository.count(),
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
      const movement = await this.inventoryRepository.findOne({
        where: { id },
        relations: ['product'],
      });
      if (!movement)
        throw new NotFoundException(
          `Inventory movement with id ${id} not found`,
        );
      return movement;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    try {
      const originalMovement = await this.findOne(id);
      const product = originalMovement.product;
      return await this.dataSource.transaction(async (entityManager) => {
        this.revertProductStock(
          originalMovement.movementType,
          product,
          originalMovement.quantity,
        );

        if (
          updateInventoryDto.movementType === undefined ||
          typeof updateInventoryDto.quantity !== 'number' ||
          updateInventoryDto.quantity <= 0
        ) {
          throw new BadRequestException(
            'Valid movementType and quantity are required',
          );
        }

        this.applyProductStock(
          updateInventoryDto.movementType,
          product,
          updateInventoryDto.quantity,
        );

        await entityManager.save(Product, product);
        const updatedMovement = await entityManager.preload(Inventory, {
          id,
          ...updateInventoryDto,
        });
        if (!updatedMovement)
          throw new NotFoundException(
            `Inventory movement with id ${id} not found`,
          );

        return await entityManager.save(Inventory, updatedMovement);
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.inventoryRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Inventory movement with id ${id} not found`,
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  revertProductStock(
    movementType: MovementType,
    product: Product,
    quantity: number,
  ) {
    switch (movementType) {
      case MovementType.IN:
        product.stock -= quantity;
        break;
      case MovementType.OUT:
        product.stock += quantity;
        break;
    }
    return product;
  }

  applyProductStock(
    movementType: MovementType,
    product: Product,
    quantity: number,
  ) {
    switch (movementType) {
      case MovementType.IN:
        product.stock += quantity;
        break;
      case MovementType.OUT: {
        if (product.stock < quantity) {
          throw new BadRequestException('Insufficient stock');
        }
        product.stock -= quantity;
        break;
      }
    }
    return product;
  }
}
