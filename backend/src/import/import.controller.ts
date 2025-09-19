import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ImportService } from './import.service';
import { ImportDto, ImportResultDto, ImportMethod } from './dto/import.dto';

@ApiTags('import')
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Импорт данных из файла или Google Sheets' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description: 'Данные для импорта',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['file'],
              description: 'Тип импорта - файл'
            },
            file: {
              type: 'string',
              format: 'binary',
              description: 'Загружаемый файл (Excel или CSV)'
            }
          },
          required: ['type', 'file']
        },
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['google_sheets'],
              description: 'Тип импорта - Google Sheets'
            },
            spreadsheetId: {
              type: 'string',
              description: 'ID Google Sheets таблицы или полный URL',
              example: '1JSxXiuWX9dJEeUKGYUY4EsQ5wJln7acNr7UEpA20Ys0'
            }
          },
          required: ['type', 'spreadsheetId']
        }
      ]
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Импорт успешно выполнен',
    type: ImportResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации или импорта',
  })
  async importData(
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ImportResultDto> {
    // Парсим данные из FormData
    const type = req.body.type;
    const spreadsheetId = req.body.spreadsheetId;
    const url = req.body.url;

    // Создаем DTO вручную
    const importDto: ImportDto = {
      type: type as ImportMethod,
      spreadsheetId,
      url,
    };

    // Валидация в зависимости от типа импорта
    if (importDto.type === ImportMethod.FILE && !file) {
      throw new BadRequestException('Для импорта из файла необходимо загрузить файл');
    }

    if (importDto.type === ImportMethod.GOOGLE_SHEETS && !importDto.spreadsheetId) {
      throw new BadRequestException('Для импорта из Google Sheets необходимо указать ID таблицы');
    }

    try {
      return await this.importService.importData(importDto, file);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Ошибка импорта данных'
      );
    }
  }
}
