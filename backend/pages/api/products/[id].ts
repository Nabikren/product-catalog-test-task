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
  
  // Заголовки против кэширования
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Инициализация БД
    await initializeDatabase();

    const { id } = req.query;
    const productId = parseInt(id as string);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID продукта',
      });
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, productId);
      case 'PUT':
        return await handlePut(req, res, productId);
      case 'DELETE':
        return await handleDelete(req, res, productId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Метод ${req.method} не поддерживается`,
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
    });
  }
}

// GET /api/products/[id] - получить продукт по ID
async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>, productId: number) {
  try {
    const product = await productService.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Продукт не найден',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: 'Продукт успешно получен',
    });
  } catch (error) {
    throw error;
  }
}

// PUT /api/products/[id] - обновить продукт
async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResponse>, productId: number) {
  try {
    const updateData = req.body;
    
    const product = await productService.updateProduct(productId, updateData);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Продукт не найден',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: 'Продукт успешно обновлен',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Ошибка валидации')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    throw error;
  }
}

// DELETE /api/products/[id] - удалить продукт
async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse>, productId: number) {
  try {
    const deleted = await productService.deleteProduct(productId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Продукт не найден',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Продукт успешно удален',
    });
  } catch (error) {
    throw error;
  }
}
