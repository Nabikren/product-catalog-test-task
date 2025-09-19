import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { ImportModule } from './import/import.module';
import { Product } from './entities/product.entity';

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // База данных с упрощенной конфигурацией
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'product_catalog',
      entities: [Product],
      synchronize: true, // Автосоздание таблиц
      logging: false,
    }),
    
    // Модули функционала
    ProductsModule,
    ImportModule,
  ],
})
export class AppModule {}
