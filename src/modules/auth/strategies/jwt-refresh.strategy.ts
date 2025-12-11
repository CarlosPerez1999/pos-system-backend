/**
 * JwtRefreshStrategy validates refresh token requests by extracting and verifying the refresh JWT token.
 * It uses Passport to intercept the Authorization header, decode the refresh token,
 * and expose the user data (id, username) in the req.user object.
 * This strategy is registered as 'jwt-refresh' and is used in the JwtRefreshGuard.
 */

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: payload.sub })
      .addSelect('user.refreshToken')
      .getOne();

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      name: payload.name,
    };
  }
}
