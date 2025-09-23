import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @IsDateString()
  @ApiProperty({ example: '2025-09-23T14:30:00Z', description: 'Date of sale' })
  date: Date;

  /**
   * Validates each items in the array using the rules defined in CreateSaleItemDTO
   * @ValidationNested ensures nested validation is applied
   * @Type transform plain JSON objects into class instances for proper validation
   */
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  @ApiProperty({ type: [CreateSaleItemDto] })
  items: CreateSaleItemDto[];
}
