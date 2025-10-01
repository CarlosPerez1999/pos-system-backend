/**
 * JwtAuthGuard protects routes using the 'jwt' strategy registered in JWTStrategy.
 * - Intercepts incoming requests and verifies the JWT token in the Authorization header.
 * - If the token is valid, exposes the user data in req.user.
 * - Used in conjunction with RoleGuard to enforce role-based access control.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
