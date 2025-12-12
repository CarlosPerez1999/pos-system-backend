import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import jwt, { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginAuthDto: LoginAuthDto) {
    try {
      const { username, password } = loginAuthDto;
      const user = await this.usersRepository.findOne({
        where: {
          username: username,
        },
        select: [
          'id',
          'email',
          'username',
          'password',
          'role',
          'name',
          'isActive',
        ],
      });

      if (!user) {
        this.logger.debug(`Login attempt failed: user not found (${username})`);
        throw new NotFoundException(`User with username ${username} not found`);
      }

      if (!user.isActive) {
        this.logger.debug(`Login attempt failed: inactive account (${username})`);
        throw new UnauthorizedException('User account is inactive');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      this.logger.debug(`Login attempt for ${username}: password match=${isMatch}`);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      };
      
      const tokens = await this.getTokens(payload);
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      
      return tokens;
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async register(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  async me(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Token inválido o expirado' };
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: userId })
      .addSelect('user.password')
      .getOne();

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid old password');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const payload = {
      sub: user.id,
      purpose: 'reset_password',
      name: user.name,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Mock email sending
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    this.logger.log(`[MOCK EMAIL] Reset Password Link: ${resetLink}`);

    return {
      message: 'If the email exists, a reset link has been sent.',
      mockLink: resetLink,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });

      if (payload.purpose !== 'reset_password') {
        throw new UnauthorizedException('Invalid token purpose');
      }

      const user = await this.usersRepository.findOneBy({ id: payload.sub });
      if (!user) throw new NotFoundException('User not found');

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.usersRepository.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getTokens(payload: {
    sub: string;
    username: string;
    role: string;
    name: string;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'role', 'name'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    };

    const tokens = await this.getTokens(payload);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, {
      refreshToken: null,
    });
    return { message: 'Logged out successfully' };
  }
}
