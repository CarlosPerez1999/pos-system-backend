import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Ground coffee 250g', description: 'Product name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Organic coffee from Colombia',
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 89.5, description: 'Product price' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  price: number;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/cafe.jpg',
    description: 'Product image url',
  })
  @IsOptional()
  @IsUrl()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'CAF-COL-250',
    description: 'Product Stock Keeping Unit',
  })
  @IsString()
  sku: string;

  @ApiPropertyOptional({
    example: '7501234567890',
    description: 'Product barcode',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: true, description: 'Product availability' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
