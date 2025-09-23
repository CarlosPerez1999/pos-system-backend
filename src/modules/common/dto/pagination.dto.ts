import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional } from "class-validator"

export class PaginationDto{
    @ApiPropertyOptional({example: 10 ,
    description: 'Maximum number of elements',})
    @IsOptional()
    @IsNumber()
    limit?:number

    @ApiPropertyOptional({example: 0 ,
    description: 'Number of elements to skip from the start',})
    @IsOptional()
    @IsNumber()
    offset?:number
}