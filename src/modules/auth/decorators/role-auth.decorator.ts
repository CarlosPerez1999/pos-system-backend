/**
 * RolesAuth combines role authentication and authorization into a single decorator.
 * - Applies JwtAuthGuard to validate the JWT token and extract the user.
 * - Applies RoleGuard to verify if the user has one of the allowed roles.
 * - Uses SetMetadata to register required roles in the handler.
 * This decorator simplifies route protection with @RolesAuth([Roles.ADMIN, ROLES.SELLER]).
 */
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RoleGuard } from '../guards/role.guard';
import { Role } from 'src/modules/users/enum/role.enum';

export function RolesAuth(roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RoleGuard),
  );
}
