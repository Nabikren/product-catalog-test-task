import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { google } from 'googleapis';
import { validate } from 'class-validator';
import { ProductService } from './ProductService';
import { Product } from '../entities/Product';
import { ImportResult, ImportError, CreateProductDto } from '../types';

export class ImportService {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  // Импорт из файла (Excel или CSV)
  async importFromFile(buffer: Buffer, filename: string): Promise<ImportResult> {
    const fileExtension = filename.split('.').pop()?.toLowerCase();

    let data: any[] = [];

    try {
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        data = await this.parseExcelFile(buffer);
      } else if (fileExtension === 'csv') {
        data = await this.parseCsvFile(buffer);
      } else {
        throw new Error('Неподдерживаемый формат файла. Поддерживаются: xlsx, xls, csv');
      }

      return await this.processImportData(data);
    } catch (error) {
      throw new Error(`Ошибка импорта файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Импорт из Google Sheets по URL (преобразование в CSV)
  async importFromGoogleSheetsUrl(url: string): Promise<ImportResult> {
    try {
      // Преобразуем Google Sheets URL в CSV экспорт URL
      const csvUrl = this.convertGoogleSheetsUrlToCsv(url);
      
      // Скачиваем CSV данные
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const buffer = Buffer.from(csvText, 'utf-8');
      
      // Парсим CSV данные
      const data = await this.parseCsvFile(buffer);
      return await this.processImportData(data);
      
    } catch (error) {
      throw new Error(`Ошибка импорта из Google Sheets: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Преобразование Google Sheets URL в CSV экспорт URL
  private convertGoogleSheetsUrlToCsv(url: string): string {
    // Извлекаем ID таблицы из URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Некорректный URL Google Sheets');
    }
    
    const spreadsheetId = match[1];
    
    // Проверяем, есть ли указание на конкретный лист (gid)
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    
    // Формируем URL для CSV экспорта
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  }

  // Импорт из Google Sheets (поддерживает как ID, так и URL)
  async importFromGoogleSheets(spreadsheetIdOrUrl: string, range: string = 'A:Z'): Promise<ImportResult> {
    try {
      // Проверяем, передан ID или URL
      let spreadsheetId: string;
      
      if (spreadsheetIdOrUrl.includes('docs.google.com')) {
        // Это URL, извлекаем ID
        const match = spreadsheetIdOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) {
          throw new Error('Некорректный URL Google Sheets');
        }
        spreadsheetId = match[1];
      } else {
        // Это просто ID
        spreadsheetId = spreadsheetIdOrUrl;
      }
      
      const sheets = google.sheets({ version: 'v4' });
      
      // Публичный доступ без API ключа для тестирования
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
        key: process.env.GOOGLE_SHEETS_API_KEY, // Опционально
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('Таблица пуста или недоступна');
      }

      // Первая строка - заголовки
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const item: any = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      });

      return await this.processImportData(data);
    } catch (error) {
      throw new Error(`Ошибка импорта из Google Sheets: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Парсинг Excel файла
  private async parseExcelFile(buffer: Buffer): Promise<any[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    return XLSX.utils.sheet_to_json(worksheet);
  }

  // Парсинг CSV файла
  private async parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  // Обработка данных импорта
  private async processImportData(data: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      totalRows: data.length,
      successfulImports: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const rowNumber = i + 2; // +2 потому что: +1 для 1-based индексации, +1 для заголовка

      try {
        const productData = this.mapRowToProduct(rowData);
        
        // Валидация перед сохранением
        const product = new Product();
        Object.assign(product, productData);
        
        const validationErrors = await validate(product);
        if (validationErrors.length > 0) {
          result.errors.push({
            row: rowNumber,
            errors: validationErrors.map(e => 
              Object.values(e.constraints || {}).join(', ')
            ),
            data: rowData,
          });
          continue;
        }

        await this.productService.createProduct(productData);
        result.successfulImports++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
          data: rowData,
        });
      }
    }

    return result;
  }

  // Маппинг данных строки в объект продукта
  private mapRowToProduct(rowData: any): CreateProductDto {
    // Гибкий маппинг с различными вариантами названий полей
    const fieldMappings = {
      name: ['name', 'название', 'product_name', 'товар', 'наименование', 'название товара'],
      brand: ['brand', 'бренд', 'производитель', 'марка'],
      description: ['description', 'описание', 'desc', 'цвет', 'страна-изготовитель'],
      price: ['price', 'цена', 'стоимость', 'cost', 'цена, руб.*', 'цена, руб.'],
      category: ['category', 'категория', 'тип'],
      sku: ['sku', 'артикул', 'код'],
      quantity: ['quantity', 'количество', 'qty', 'stock'],
      imageUrl: ['image_url', 'imageUrl', 'изображение', 'фото', 'image'],
      status: ['status', 'статус', 'состояние'],
    };

    const product: CreateProductDto = {
      name: '',
    };

    // Маппинг полей
    Object.entries(fieldMappings).forEach(([key, aliases]) => {
      for (const alias of aliases) {
        // Пробуем найти точное совпадение или близкие варианты
        let value = rowData[alias] || rowData[alias.toLowerCase()] || rowData[alias.toUpperCase()];
        
        // Если не найдено, ищем по частичному совпадению
        if (value === undefined || value === '') {
          const foundKey = Object.keys(rowData).find(k => 
            k.toLowerCase().includes(alias.toLowerCase()) || 
            alias.toLowerCase().includes(k.toLowerCase())
          );
          if (foundKey) {
            value = rowData[foundKey];
          }
        }
        
        if (value !== undefined && value !== '') {
          if (key === 'price' || key === 'quantity') {
            const numValue = parseFloat(value.toString().replace(/[^\d.,]/g, '').replace(',', '.'));
            if (!isNaN(numValue)) {
              (product as any)[key] = numValue;
            }
          } else {
            (product as any)[key] = value.toString().trim();
          }
          break;
        }
      }
    });

    // Обязательное поле name
    if (!product.name) {
      throw new Error('Отсутствует обязательное поле "Название"');
    }

    // Автоматическое определение категории для Google Sheets данных
    if (!product.category && product.name) {
      const name = product.name.toLowerCase();
      if (name.includes('душевая') || name.includes('душевой')) {
        product.category = 'Сантехника';
      } else if (name.includes('ванна')) {
        product.category = 'Ванны';
      } else {
        product.category = 'Товары';
      }
    }

    // Объединяем дополнительную информацию в описание
    if (!product.description) {
      const extraInfo = [];
      if (rowData['цвет']) extraInfo.push(`Цвет: ${rowData['цвет']}`);
      if (rowData['страна-изготовитель']) extraInfo.push(`Производство: ${rowData['страна-изготовитель']}`);
      product.description = extraInfo.join(', ') || 'Описание недоступно';
    }

    // Сохраняем оригинальные данные в metadata
    product.metadata = rowData;

    return product;
  }
}
