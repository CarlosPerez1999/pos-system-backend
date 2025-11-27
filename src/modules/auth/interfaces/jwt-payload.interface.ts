import { Role } from 'src/modules/users/enum/role.enum';

export interface JwtPayload {
  sub: string;
  name: string;
  username: string;
  role: Role;
}
