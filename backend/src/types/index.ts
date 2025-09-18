// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Типы для продуктов
export interface CreateProductDto {
  name: string;
  brand?: string;
  description?: string;
  price?: number;
  category?: string;
  sku?: string;
  quantity?: number;
  imageUrl?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Типы для импорта
export interface ImportResult {
  totalRows: number;
  successfulImports: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  errors: string[];
  data: Record<string, any>;
}

// Типы для фильтрации и пагинации
export interface ProductFilters {
  search?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
