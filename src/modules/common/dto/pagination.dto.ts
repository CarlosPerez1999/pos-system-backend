import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Maximum number of elements',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of elements to skip from the start',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
