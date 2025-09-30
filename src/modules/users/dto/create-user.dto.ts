import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { Role } from '../enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Carlos Perez',
    description: "User's full legal name",
  })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiProperty({
    example: 'carper01',
    description: 'Unique system identifier for the user',
  })
  @IsString()
  @Length(1, 20)
  username: string;

  @ApiProperty({
    example: 'carper01',
    description: "User's email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongP@5s',
    description: "User's password",
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty({
    example: true,
    description: 'User activity status',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    example: 'seller',
    description: 'User role within the system',
  })
  @IsEnum(Role)
  role: Role;
}
