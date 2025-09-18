import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { ImportService } from '../../../src/services/ImportService';
import { initializeDatabase } from '../../../src/config/database';
import { ApiResponse } from '../../../src/types';

const importService = new ImportService();

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла. Разрешены: .xlsx, .xls, .csv'));
    }
  },
});

// Отключаем встроенный bodyParser для multer
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Инициализация БД
    await initializeDatabase();

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({
        success: false,
        error: `Метод ${req.method} не поддерживается`,
      });
    }

    return await handleImport(req, res);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
    });
  }
}

function handleImport(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  return new Promise((resolve) => {
    // Если Content-Type содержит JSON, парсим тело запроса как JSON
    if (req.headers['content-type']?.includes('application/json')) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const parsedBody = JSON.parse(body);
          const { type, url, spreadsheetId, range } = parsedBody;
          
          if (type === 'url') {
            await handleUrlImport(req, res, parsedBody, resolve);
            return;
          } else if (type === 'google_sheets') {
            await handleGoogleSheetsImport(req, res, parsedBody, resolve);
            return;
          }
          
          return res.status(400).json({
            success: false,
            error: 'Для JSON запросов поддерживаются типы: "url", "google_sheets"',
          });
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Ошибка парсинга JSON',
          });
        }
      });
      return;
    }
    
    // Для файлов используем multer
    upload.single('file')(req as any, res as any, async (err) => {
      try {
        if (err) {
          return res.status(400).json({
            success: false,
            error: err.message,
          });
        }

        const { type, url, spreadsheetId, range } = req.body;

        let result;

        if (type === 'file') {
          // Импорт из загруженного файла
          const file = (req as any).file;
          if (!file) {
            return res.status(400).json({
              success: false,
              error: 'Файл не загружен',
            });
          }

          result = await importService.importFromFile(file.buffer, file.originalname);
        } else if (type === 'google_sheets') {
          // Импорт из Google Sheets
          if (!spreadsheetId) {
            return res.status(400).json({
              success: false,
              error: 'Не указан ID Google Sheets',
            });
          }

          result = await importService.importFromGoogleSheets(spreadsheetId, range || 'A:Z');
        } else if (type === 'url') {
          // Импорт по URL (Google Sheets)
          if (!url) {
            return res.status(400).json({
              success: false,
              error: 'Не указан URL для импорта',
            });
          }

          result = await importService.importFromGoogleSheetsUrl(url);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Неверный тип импорта. Поддерживаются: file, google_sheets, url',
          });
        }

        return res.status(200).json({
          success: true,
          data: result,
          message: `Импорт завершен. Успешно: ${result.successfulImports}, Ошибок: ${result.errors.length}`,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка импорта',
        });
      } finally {
        resolve(undefined);
      }
    });
  });
}

async function handleUrlImport(req: NextApiRequest, res: NextApiResponse<ApiResponse>, body: any, resolve: any) {
  try {
    const { url } = body;
    
    if (!url) {
      res.status(400).json({
        success: false,
        error: 'Не указан URL для импорта',
      });
      resolve(undefined);
      return;
    }

    const result = await importService.importFromGoogleSheetsUrl(url);

    res.status(200).json({
      success: true,
      data: result,
      message: `Импорт завершен. Успешно: ${result.successfulImports}, Ошибок: ${result.errors.length}`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка импорта по URL',
    });
  } finally {
    resolve(undefined);
  }
}

async function handleGoogleSheetsImport(req: NextApiRequest, res: NextApiResponse<ApiResponse>, body: any, resolve: any) {
  try {
    const { spreadsheetId, range } = body;
    
    if (!spreadsheetId) {
      res.status(400).json({
        success: false,
        error: 'Не указан ID Google Sheets',
      });
      resolve(undefined);
      return;
    }

    // Если это URL, используем его напрямую, если ID - преобразуем в URL
    let url: string;
    if (spreadsheetId.includes('docs.google.com')) {
      url = spreadsheetId;
    } else {
      // Преобразуем ID в URL для CSV экспорта
      url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=0#gid=0`;
    }

    const result = await importService.importFromGoogleSheetsUrl(url);

    res.status(200).json({
      success: true,
      data: result,
      message: `Импорт завершен. Успешно: ${result.successfulImports}, Ошибок: ${result.errors.length}`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка импорта из Google Sheets',
    });
  } finally {
    resolve(undefined);
  }
}
