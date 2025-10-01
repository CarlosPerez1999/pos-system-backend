import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
export class LoginAuthDto extends PickType(CreateUserDto, [
  'username',
  'password',
] as const) {}
