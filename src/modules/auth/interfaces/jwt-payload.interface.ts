import { Role } from 'src/modules/users/enum/role.enum';

export interface JwtPayload {
  sub: string; 
  username: string;
  role: Role;
}
