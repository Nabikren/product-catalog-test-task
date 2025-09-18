import { NextApiRequest, NextApiResponse } from 'next';
import { ProductService } from '../../../src/services/ProductService';
import { initializeDatabase } from '../../../src/config/database';
import { ApiResponse, ProductFilters, PaginationParams } from '../../../src/types';

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

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
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

// GET /api/products - получить список продуктов
async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const {
    search,
    brand,
    category,
    minPrice,
    maxPrice,
    status,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query;

  const filters: ProductFilters = {
    search: search as string,
    brand: brand as string,
    category: category as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    status: status as string,
  };

  const pagination: PaginationParams = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
    sortBy: sortBy as string || 'createdAt',
    sortOrder: (sortOrder as 'ASC' | 'DESC') || 'DESC',
  };

  try {
    const result = await productService.getProducts(filters, pagination);
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Продукты успешно получены',
    });
  } catch (error) {
    throw error;
  }
}

// POST /api/products - создать продукт
async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const productData = req.body;
    
    if (!productData.name) {
      return res.status(400).json({
        success: false,
        error: 'Название продукта обязательно',
      });
    }

    const product = await productService.createProduct(productData);
    
    return res.status(201).json({
      success: true,
      data: product,
      message: 'Продукт успешно создан',
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
