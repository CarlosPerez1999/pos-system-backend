import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existing = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existing)
        throw new ConflictException('User with this email already exists');
      const { password, ...restDto } = createUserDto;
      const encryptedPass = await bcrypt.hash(password, 10);
      const newUser = this.usersRepository.create({
        password: encryptedPass,
        ...restDto,
      });
      const savedUser = await this.usersRepository.save(newUser);

      return savedUser;
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
