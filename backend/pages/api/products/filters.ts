import { NextApiRequest, NextApiResponse } from 'next';
import { ProductService } from '../../../src/services/ProductService';
import { initializeDatabase } from '../../../src/config/database';
import { ApiResponse } from '../../../src/types';

const productService = new ProductService();

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

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({
        success: false,
        error: `Метод ${req.method} не поддерживается`,
      });
    }

    const [brands, categories] = await Promise.all([
      productService.getBrands(),
      productService.getCategories(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        brands,
        categories,
      },
      message: 'Фильтры успешно получены',
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
    });
  }
}
