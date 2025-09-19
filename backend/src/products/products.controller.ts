import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { Product } from '../entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список продуктов с фильтрацией и пагинацией' })
  @ApiResponse({
    status: 200,
    description: 'Список продуктов успешно получен',
    type: [Product],
  })
  @ApiQuery({ type: ProductFiltersDto })
  async findAll(
    @Query() filters: ProductFiltersDto,
  ) {
    return this.productsService.findAll(filters);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Получить доступные фильтры' })
  @ApiResponse({
    status: 200,
    description: 'Фильтры успешно получены',
  })
  async getFilters() {
    return this.productsService.getFilters();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить продукт по ID' })
  @ApiParam({ name: 'id', description: 'ID продукта' })
  @ApiResponse({
    status: 200,
    description: 'Продукт успешно найден',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Продукт не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый продукт' })
  @ApiResponse({
    status: 201,
    description: 'Продукт успешно создан',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить продукт' })
  @ApiParam({ name: 'id', description: 'ID продукта' })
  @ApiResponse({
    status: 200,
    description: 'Продукт успешно обновлен',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Продукт не найден',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить продукт' })
  @ApiParam({ name: 'id', description: 'ID продукта' })
  @ApiResponse({
    status: 204,
    description: 'Продукт успешно удален',
  })
  @ApiResponse({
    status: 404,
    description: 'Продукт не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Очистить все продукты' })
  @ApiResponse({
    status: 200,
    description: 'Все продукты успешно удалены',
  })
  async clear() {
    return this.productsService.clear();
  }
}
