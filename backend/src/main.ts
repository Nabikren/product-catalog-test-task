import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Префикс для всех API routes
  app.setGlobalPrefix('api');

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Product Catalog API')
    .setDescription('API для каталога продуктов с импортом из Excel/Google Sheets')
    .setVersion('1.0')
    .addTag('products', 'Операции с продуктами')
    .addTag('import', 'Импорт данных')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Запуск на порту 3001
  await app.listen(3001);
  console.log('🚀 NestJS API запущен на http://localhost:3001');
  console.log('📚 Swagger документация: http://localhost:3001/api/docs');
}

bootstrap();
