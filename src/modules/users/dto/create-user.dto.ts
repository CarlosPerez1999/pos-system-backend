import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { Role } from '../enum/role.enum';

export class CreateUserDto {
  @IsString()
  @Length(1, 50)
  name: string;

  @IsString()
  @Length(1, 20)
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  password: string;

  @IsBoolean()
  isActive: boolean;
  @IsEnum(Role)
  role: Role;
}
