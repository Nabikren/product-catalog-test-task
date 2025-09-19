import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';

export enum ImportMethod {
  FILE = 'file',
  GOOGLE_SHEETS = 'google_sheets',
}

export class ImportDto {
  @ApiProperty({ 
    description: 'Метод импорта',
    enum: ImportMethod,
    example: ImportMethod.GOOGLE_SHEETS
  })
  @IsEnum(ImportMethod, { message: 'Метод импорта должен быть file или google_sheets' })
  type: ImportMethod;

  @ApiPropertyOptional({ 
    description: 'ID Google Sheets таблицы или полный URL',
    example: '1JSxXiuWX9dJEeUKGYUY4EsQ5wJln7acNr7UEpA20Ys0'
  })
  @IsOptional()
  @IsString({ message: 'ID таблицы должен быть строкой' })
  spreadsheetId?: string;

  @ApiPropertyOptional({ 
    description: 'URL для импорта',
    example: 'https://docs.google.com/spreadsheets/d/1JSxXiuWX9dJEeUKGYUY4EsQ5wJln7acNr7UEpA20Ys0/edit'
  })
  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL' })
  url?: string;
}

export class ImportResultDto {
  @ApiProperty({ description: 'Успешность операции' })
  success: boolean;

  @ApiProperty({ description: 'Общее количество обработанных строк' })
  totalRows: number;

  @ApiProperty({ description: 'Количество успешно импортированных товаров' })
  importedCount: number;

  @ApiProperty({ description: 'Количество ошибок' })
  errorsCount: number;

  @ApiProperty({ description: 'Детальная информация об ошибках', type: [String] })
  errors: string[];

  @ApiPropertyOptional({ description: 'Дополнительная информация' })
  message?: string;
}
