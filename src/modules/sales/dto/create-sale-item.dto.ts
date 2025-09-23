import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateSaleItemDto {
  @IsUUID()
  @ApiProperty({ description: 'ID of the product being sold' })
  productId: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 2, description: 'Quantity of product sold' })
  quantity: number;
}
