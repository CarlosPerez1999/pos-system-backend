import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports:[TypeOrmModule.forFeature([Inventory]), ProductsModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
