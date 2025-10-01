/**
 * RoleGuard restricts access to routes based on the roles defined with the @Roles() decorator.
 * - Uses Reflector to retrieve the required roles from the handler metadata.
 * - Checks if the authenticated user (req.user.role) has one of the allowed roles.
 * - If they don't have the appropriate role, throws a ForbiddenException.
 * This guard is used in conjunction with JwtAuthGuard to protect routes for authentication and authorization.
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/modules/users/enum/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission for this action',
      );
    }

    return true;
  }
}
