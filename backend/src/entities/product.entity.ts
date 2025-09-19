import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Уникальный идентификатор товара', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Название товара', example: 'Смеситель для кухни' })
  @Column({ type: 'varchar', length: 500 })
  @IsString({ message: 'Название должно быть строкой' })
  name: string;

  @ApiPropertyOptional({ description: 'Бренд товара', example: 'RGW' })
  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsOptional()
  @IsString({ message: 'Бренд должен быть строкой' })
  brand?: string;

  @ApiPropertyOptional({ description: 'Описание товара', example: 'Высококачественный смеситель' })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({ description: 'Цена товара в рублях', example: 15990.50 })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;

  @ApiPropertyOptional({ description: 'Категория товара', example: 'Сантехника' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString({ message: 'Категория должна быть строкой' })
  category?: string;

  @ApiPropertyOptional({ description: 'Артикул товара', example: 'RGW-001' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString({ message: 'SKU должен быть строкой' })
  sku?: string;

  @ApiPropertyOptional({ description: 'Количество на складе', example: 10 })
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @Min(0, { message: 'Количество не может быть отрицательным' })
  quantity?: number;

  @ApiPropertyOptional({ description: 'URL изображения товара', example: 'https://example.com/image.jpg' })
  @Column({ type: 'varchar', length: 1000, nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL изображения' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Статус товара', example: 'active' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString({ message: 'Статус должен быть строкой' })
  status?: string;

  @ApiProperty({ description: 'Дата создания записи' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Дополнительные данные из Excel/CSV', example: { color: 'белый', warranty: '2 года' } })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
