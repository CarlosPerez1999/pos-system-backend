import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MovementType } from '../enum/movement-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    description: 'Affected product ID',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 10, description: 'Quantity moved in the inventory' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 'IN',
    enum: MovementType,
    description: 'type of movement: IN or OUT',
  })
  @IsEnum(MovementType)
  movementType: MovementType;

  @ApiPropertyOptional({ example: 'Provider Replacement', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
