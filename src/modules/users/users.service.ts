import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { Role } from './enum/role.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.usersRepository.count();
      if (count === 0) {
        this.logger.log('No users found. Creating default admin user...');
        const password = await bcrypt.hash('Admin123@', 10);
        const admin = this.usersRepository.create({
          email: 'admin@admin.com',
          username: 'admin',
          password,
          name: 'Admin User',
          isActive: true,
          role: Role.ADMIN,
        });
        await this.usersRepository.save(admin);
        this.logger.log(
          'Default admin user created: admin@admin.com / admin123',
        );
      }
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const existing = await this.usersRepository.findOne({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });

      if (existing) {
        const conflictField =
          existing.email === createUserDto.email ? 'email' : 'username';

        throw new ConflictException(
          `User with this ${conflictField} already exists`,
        );
      }

      const { password, ...restDto } = createUserDto;
      const encryptedPass = await bcrypt.hash(password, 10);
      const newUser = this.usersRepository.create({
        password: encryptedPass,
        ...restDto,
      });
      const savedUser = await this.usersRepository.save(newUser);
      const { password: _savedPassword, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    try {
      const users = await this.usersRepository.find({
        take: pagination.limit ?? 10,
        skip: pagination.offset ?? 0,
      });
      return {
        items: users,
        total: await this.usersRepository.count(),
        limit: pagination.limit ?? 10,
        offset: pagination.offset ?? 0,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Error retrieving all users');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.usersRepository.findOneBy({ id });

      if (!user) throw new NotFoundException(`User with id ${id} not found`);

      return user;
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.preload({
        id,
        ...updateUserDto,
      });

      if (!user) throw new NotFoundException(`User with id ${id} not found`);

      // Check if trying to change role of the last admin
      if (updateUserDto.role && updateUserDto.role !== Role.ADMIN) {
        const currentUser = await this.usersRepository.findOneBy({ id });
        if (currentUser && currentUser.role === Role.ADMIN) {
          const adminCount = await this.usersRepository.count({
            where: { role: Role.ADMIN },
          });
          if (adminCount <= 1) {
            throw new ConflictException(
              'Cannot change role of the last administrator. Create another admin first.',
            );
          }
        }
      }

      return await this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User with id ${id} not found`);

      // Check if trying to delete the last admin
      if (user.role === Role.ADMIN) {
        const adminCount = await this.usersRepository.count({
          where: { role: Role.ADMIN },
        });
        if (adminCount <= 1) {
          throw new ConflictException(
            'Cannot delete the last administrator. Create another admin first.',
          );
        }
      }

      const result = await this.usersRepository.softDelete(id);
      if (result.affected === 0)
        throw new NotFoundException(`User with id ${id} not found`);
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error);
    }
  }
}
