import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Название товара', example: 'Смеситель для кухни' })
  @IsString({ message: 'Название должно быть строкой' })
  name: string;

  @ApiPropertyOptional({ description: 'Бренд товара', example: 'RGW' })
  @IsOptional()
  @IsString({ message: 'Бренд должен быть строкой' })
  brand?: string;

  @ApiPropertyOptional({ description: 'Описание товара', example: 'Высококачественный смеситель' })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({ description: 'Цена товара в рублях', example: 15990.50 })
  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;

  @ApiPropertyOptional({ description: 'Категория товара', example: 'Сантехника' })
  @IsOptional()
  @IsString({ message: 'Категория должна быть строкой' })
  category?: string;

  @ApiPropertyOptional({ description: 'Артикул товара', example: 'RGW-001' })
  @IsOptional()
  @IsString({ message: 'SKU должен быть строкой' })
  sku?: string;

  @ApiPropertyOptional({ description: 'Количество на складе', example: 10 })
  @IsOptional()
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @Min(0, { message: 'Количество не может быть отрицательным' })
  quantity?: number;

  @ApiPropertyOptional({ description: 'URL изображения товара', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL изображения' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Статус товара', example: 'active' })
  @IsOptional()
  @IsString({ message: 'Статус должен быть строкой' })
  status?: string;

  @ApiPropertyOptional({ description: 'Дополнительные данные', example: { color: 'белый', warranty: '2 года' } })
  @IsOptional()
  metadata?: Record<string, any>;
}
