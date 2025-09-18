import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  @IsString({ message: 'Название должно быть строкой' })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsOptional()
  @IsString({ message: 'Бренд должен быть строкой' })
  brand?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString({ message: 'Категория должна быть строкой' })
  category?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString({ message: 'SKU должен быть строкой' })
  sku?: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @Min(0, { message: 'Количество не может быть отрицательным' })
  quantity?: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL изображения' })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString({ message: 'Статус должен быть строкой' })
  status?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Дополнительные поля для Excel данных
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
