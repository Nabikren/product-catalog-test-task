import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class ProductService {
  private productRepository: Repository<Product>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
  }

  // Получить все продукты с фильтрацией и пагинацией
  async getProducts(
    filters: ProductFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Product>> {
    const {
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      status,
    } = filters;

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = pagination;

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
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

    // Пагинация
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Получить продукт по ID
  async getProductById(id: number): Promise<Product | null> {
    return await this.productRepository.findOne({ where: { id } });
  }

  // Создать продукт
  async createProduct(productData: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(productData);
    
    // Валидация
    const errors = await validate(product);
    if (errors.length > 0) {
      throw new Error(`Ошибка валидации: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`);
    }

    return await this.productRepository.save(product);
  }

  // Обновить продукт
  async updateProduct(id: number, productData: UpdateProductDto): Promise<Product | null> {
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) {
      return null;
    }

    // Обновляем поля
    Object.assign(existingProduct, productData);

    // Валидация
    const errors = await validate(existingProduct);
    if (errors.length > 0) {
      throw new Error(`Ошибка валидации: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`);
    }

    return await this.productRepository.save(existingProduct);
  }

  // Удалить продукт
  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected! > 0;
  }

  // Получить уникальные бренды
  async getBrands(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.brand', 'brand')
      .where('product.brand IS NOT NULL')
      .getRawMany();

    return result.map(r => r.brand).filter(Boolean);
  }

  // Получить уникальные категории
  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .getRawMany();

    return result.map(r => r.category).filter(Boolean);
  }
}
