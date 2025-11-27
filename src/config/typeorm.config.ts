import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

// Load environment variables
config();

const configService = new ConfigService();

/**
 * TypeORM CLI configuration for migrations
 * This config is used for generating and running migrations
 */
export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: 5432,
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: ['src/modules/**/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false when using migrations
});
