import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Product } from '../entities/product.entity';
import { ImportDto, ImportResultDto, ImportMethod } from './dto/import.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Главный метод импорта
  async importData(importDto: ImportDto, file?: Express.Multer.File): Promise<ImportResultDto> {
    switch (importDto.type) {
      case ImportMethod.FILE:
        if (!file) {
          throw new BadRequestException('Файл не предоставлен');
        }
        return await this.importFromFile(file.buffer, file.originalname);

      case ImportMethod.GOOGLE_SHEETS:
        if (!importDto.spreadsheetId && !importDto.url) {
          throw new BadRequestException('ID таблицы или URL не предоставлен');
        }
        const identifier = importDto.spreadsheetId || importDto.url!;
        return await this.importFromGoogleSheets(identifier);

      default:
        throw new BadRequestException('Неподдерживаемый метод импорта');
    }
  }

  // Импорт из файла (Excel или CSV)
  private async importFromFile(buffer: Buffer, filename: string): Promise<ImportResultDto> {
    const fileExtension = filename.split('.').pop()?.toLowerCase();

    let data: any[] = [];

    try {
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        data = await this.parseExcelFile(buffer);
      } else if (fileExtension === 'csv') {
        data = await this.parseCsvFile(buffer);
      } else {
        throw new BadRequestException('Неподдерживаемый формат файла. Поддерживаются: xlsx, xls, csv');
      }

      return await this.processImportData(data);
    } catch (error) {
      throw new BadRequestException(`Ошибка импорта файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Импорт из Google Sheets
  private async importFromGoogleSheets(identifier: string): Promise<ImportResultDto> {
    try {
      let url = identifier;
      
      // Если передан ID, создаем полный URL
      if (!identifier.includes('docs.google.com')) {
        url = `https://docs.google.com/spreadsheets/d/${identifier}/edit?gid=0#gid=0`;
      }
      
      // Преобразуем в CSV URL
      const csvUrl = this.convertGoogleSheetsUrlToCsv(url);
      
      // Скачиваем CSV данные
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new BadRequestException(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const buffer = Buffer.from(csvText, 'utf-8');
      const data = await this.parseCsvFile(buffer);
      
      return await this.processImportData(data);
    } catch (error) {
      throw new BadRequestException(`Ошибка импорта из Google Sheets: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Парсинг Excel файла
  private async parseExcelFile(buffer: Buffer): Promise<any[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }

  // Парсинг CSV файла
  private async parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer);
      
      stream
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Преобразование Google Sheets URL в CSV
  private convertGoogleSheetsUrlToCsv(url: string): string {
    let spreadsheetId = '';
    let gid = '0';

    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      spreadsheetId = match[1];
    }

    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    if (gidMatch) {
      gid = gidMatch[1];
    }

    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  }

  // Обработка импортированных данных
  private async processImportData(rawData: any[]): Promise<ImportResultDto> {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new BadRequestException('Файл пуст или имеет неверный формат');
    }

    const errors: string[] = [];
    let importedCount = 0;
    const totalRows = rawData.length;

    for (let i = 0; i < rawData.length; i++) {
      try {
        const rowData = rawData[i];
        const productData = this.mapRowToProduct(rowData);
        
        if (productData.name) {
          const product = this.productRepository.create(productData);
          await this.productRepository.save(product);
          importedCount++;
        } else {
          errors.push(`Строка ${i + 1}: отсутствует обязательное поле "Название"`);
        }
      } catch (error) {
        errors.push(`Строка ${i + 1}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    }

    return {
      success: true,
      totalRows,
      importedCount,
      errorsCount: errors.length,
      errors,
      message: `Импорт завершен. Обработано строк: ${totalRows}, импортировано товаров: ${importedCount}`,
    };
  }

  // Маппинг строки данных в продукт
  private mapRowToProduct(rowData: any): CreateProductDto {
    // Нормализуем ключи - убираем лишние символы и приводим к нижнему регистру
    const normalizedData: Record<string, any> = {};
    
    if (Array.isArray(rowData)) {
      // Если данные в виде массива (из Excel)
      const [name, brand, description, price, category, sku, quantity, imageUrl, status] = rowData;
      normalizedData.name = name;
      normalizedData.brand = brand;
      normalizedData.description = description;
      normalizedData.price = price;
      normalizedData.category = category;
      normalizedData.sku = sku;
      normalizedData.quantity = quantity;
      normalizedData.imageUrl = imageUrl;
      normalizedData.status = status;
    } else {
      // Если данные в виде объекта (из CSV)
      Object.keys(rowData).forEach(key => {
        const normalizedKey = key.toLowerCase().trim().replace(/[^\wа-яё\s]/g, '');
        normalizedData[normalizedKey] = rowData[key];
      });
      
      // Отладочная информация убрана для продакшена
    }

    // Маппинг полей с различными вариантами названий
    const fieldMappings: Record<string, string[]> = {
      name: ['название товара', 'название', 'наименование', 'name', 'товар'],
      brand: ['бренд', 'brand', 'производитель', 'марка'],
      description: ['описание', 'description', 'desc'],
      price: ['цена руб', 'цена', 'price', 'стоимость', 'цена рублей'],
      category: ['категория', 'category', 'группа'],
      sku: ['артикул', 'sku', 'код'],
      quantity: ['количество', 'quantity', 'остаток'],
      imageUrl: ['imageurl', 'image', 'картинка', 'фото'],
      status: ['статус', 'status', 'состояние'],
    };

    const result: CreateProductDto = { name: '' };
    const metadata: Record<string, any> = {};

    // Маппинг основных полей
    Object.keys(fieldMappings).forEach(targetField => {
      const possibleKeys = fieldMappings[targetField];
      
      // Более точный поиск - ищем точное совпадение или включение
      const foundKey = possibleKeys.find(key => {
        return Object.keys(normalizedData).some(dataKey => {
          // Точное совпадение
          if (dataKey === key) return true;
          // Включение (старая логика)
          if (dataKey.includes(key)) return true;
          // Включение наоборот (для случаев типа "название товара")
          if (key.includes(dataKey)) return true;
          return false;
        });
      });
      
      // Отладка убрана для продакшена
      
      if (foundKey) {
        const dataKey = Object.keys(normalizedData).find(key => 
          key === foundKey || key.includes(foundKey) || foundKey.includes(key)
        );
        if (dataKey && normalizedData[dataKey]) {
          let value = normalizedData[dataKey];
          
          // Специальная обработка для числовых полей
          if ((targetField === 'price' || targetField === 'quantity') && typeof value === 'string') {
            const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
            value = isNaN(numValue) ? undefined : numValue;
          }
          
          if (value !== undefined && value !== null && value !== '') {
            (result as any)[targetField] = value;
          }
        }
      }
    });

    // Добавляем все остальные поля в metadata
    Object.keys(rowData).forEach(key => {
      if (rowData[key] && !Object.values(fieldMappings).flat().some(mappedKey => 
        key.toLowerCase().includes(mappedKey)
      )) {
        metadata[key] = rowData[key];
      }
    });

    if (Object.keys(metadata).length > 0) {
      result.metadata = metadata;
    }

    // Автоматическое определение категории по названию
    if (!result.category && result.name) {
      result.category = this.detectCategory(result.name);
    }

    // Улучшение описания из metadata
    if (!result.description && metadata) {
      const additionalInfo = [];
      if (metadata['цвет'] || metadata['Цвет']) {
        additionalInfo.push(`Цвет: ${metadata['цвет'] || metadata['Цвет']}`);
      }
      if (metadata['страна-изготовитель'] || metadata['Страна-изготовитель']) {
        additionalInfo.push(`Производство: ${metadata['страна-изготовитель'] || metadata['Страна-изготовитель']}`);
      }
      if (additionalInfo.length > 0) {
        result.description = additionalInfo.join(', ');
      }
    }

    return result;
  }

  // Автоматическое определение категории
  private detectCategory(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('душевая дверь') || lowerName.includes('душевой уголок')) {
      return 'Душевые ограждения';
    }
    if (lowerName.includes('смеситель')) {
      return 'Смесители';
    }
    if (lowerName.includes('ванна')) {
      return 'Ванны';
    }
    if (lowerName.includes('раковина') || lowerName.includes('умывальник')) {
      return 'Раковины';
    }
    if (lowerName.includes('унитаз')) {
      return 'Унитазы';
    }
    if (lowerName.includes('душ')) {
      return 'Душевое оборудование';
    }
    
    return 'Товары';
  }
}
