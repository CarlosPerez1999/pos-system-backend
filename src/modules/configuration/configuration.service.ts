import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConfigurationService implements OnModuleInit {
  logger = new Logger(ConfigurationService.name);
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.configurationRepository.count();
      if (count === 0) {
        this.logger.log(
          'No configuration found. Creating default configuration...',
        );
        const defaultConfig = this.configurationRepository.create({
          storeName: 'POS System',
        });
        await this.configurationRepository.save(defaultConfig);
        this.logger.log('Default configuration created: POS System');
      }
    } catch (error) {
      this.logger.error('Failed to seed default configuration', error);
    }
  }

  async create(createConfigurationDto: CreateConfigurationDto) {
    try {
      const count = await this.configurationRepository.count();
      if (count > 0) {
        throw new InternalServerErrorException(
          'Configuration already exists. Use update instead.',
        );
      }
      return await this.configurationRepository.save(createConfigurationDto);
    } catch (error) {
      this.logger.error(error);
      throw error instanceof InternalServerErrorException
        ? error
        : new InternalServerErrorException('Internal server error');
    }
  }

  async getSettings() {
    try {
      const config = await this.configurationRepository.find();
      if (!config || config.length === 0) {
        // Return default or empty object if no config exists yet
        return null;
      }
      return config[0];
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async update(updateConfigurationDto: UpdateConfigurationDto) {
    try {
      const configList = await this.configurationRepository.find();
      if (!configList || configList.length === 0) {
        throw new NotFoundException(
          'Configuration not found. Create it first.',
        );
      }

      const config = configList[0];
      const updated = await this.configurationRepository.preload({
        id: config.id,
        ...updateConfigurationDto,
      });

      if (!updated) {
        throw new InternalServerErrorException(
          'Could not update configuration',
        );
      }

      return this.configurationRepository.save(updated);
    } catch (error) {
      this.logger.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Internal server error');
    }
  }
}
