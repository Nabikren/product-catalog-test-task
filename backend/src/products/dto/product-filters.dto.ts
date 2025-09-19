import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductFiltersDto {
  @ApiPropertyOptional({ description: 'Поиск по названию или описанию', example: 'смеситель' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Фильтр по бренду', example: 'RGW' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Фильтр по категории', example: 'Сантехника' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Минимальная цена', example: 1000 })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Минимальная цена должна быть числом' })
  @Min(0, { message: 'Минимальная цена не может быть отрицательной' })
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Максимальная цена', example: 50000 })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Максимальная цена должна быть числом' })
  @Min(0, { message: 'Максимальная цена не может быть отрицательной' })
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Фильтр по статусу', example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Номер страницы', example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Номер страницы должен быть числом' })
  @Min(1, { message: 'Номер страницы должен быть больше 0' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Количество элементов на странице', example: 10, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Лимит должен быть числом' })
  @Min(1, { message: 'Лимит должен быть больше 0' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Поле для сортировки', example: 'createdAt', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Направление сортировки', example: 'DESC', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
