import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Получить все продукты с фильтрацией и пагинацией
  async findAll(
    filters: ProductFiltersDto = {},
  ): Promise<PaginatedResponse<Product>> {
    const {
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Поиск по названию
    if (search) {
      queryBuilder.andWhere(
        'product.name ILIKE :search OR product.description ILIKE :search',
        { search: `%${search}%` }
      );
    }

    // Фильтр по бренду
    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    // Фильтр по категории
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    // Фильтр по цене
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Фильтр по статусу
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    // Сортировка
    const allowedSortFields = ['id', 'name', 'brand', 'price', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    // Пагинация
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Выполнение запроса
    const [products, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: products,
      total,
      page,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  // Получить продукт по ID
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID ${id} не найден`);
    }

    return product;
  }

  // Создать новый продукт
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  // Обновить продукт
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id); // Проверяем существование

    // Обновляем поля
    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  // Удалить продукт
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id); // Проверяем существование
    await this.productRepository.remove(product);
  }

  // Получить доступные фильтры
  async getFilters(): Promise<{
    brands: string[];
    categories: string[];
  }> {
    const [brands, categories] = await Promise.all([
      this.productRepository
        .createQueryBuilder('product')
        .select('DISTINCT product.brand', 'brand')
        .where('product.brand IS NOT NULL')
        .getRawMany(),
      this.productRepository
        .createQueryBuilder('product')
        .select('DISTINCT product.category', 'category')
        .where('product.category IS NOT NULL')
        .getRawMany(),
    ]);

    return {
      brands: brands.map(item => item.brand).filter(Boolean),
      categories: categories.map(item => item.category).filter(Boolean),
    };
  }

  // Очистить все продукты
  async clear(): Promise<{ deletedCount: number }> {
    const count = await this.productRepository.count();
    await this.productRepository.clear();
    
    return { deletedCount: count };
  }
}
