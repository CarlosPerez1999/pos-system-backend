import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
  .setTitle('POS System API')
  .setDescription('Documentation for the management API')
  .setVersion('1.0')
  .addTag('products', 'Product catalog management')
  .addTag('sales', 'Sales and payment records')
  .addTag('users', 'User and Role Management')
  .addTag('inventory', 'Stock and movement control')
  .build()

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
