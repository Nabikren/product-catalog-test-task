// API Response типы
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Product типы
export interface Product {
  id: number;
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
  createdAt: string;
  updatedAt: string;
}

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

// Фильтрация и пагинация
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

// Import типы
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

export type ImportMethod = 'file' | 'google_sheets';

export interface ImportOptions {
  method: ImportMethod;
  file?: File;
  url?: string;
  spreadsheetId?: string;
  range?: string;
}

// Filters для компонентов
export interface FilterOptions {
  brands: string[];
  categories: string[];
}

// UI State типы
export type ViewMode = 'grid' | 'list';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Form типы
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'file' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Navigation
export interface NavItem {
  label: string;
  to: string;
  icon?: string;
  active?: boolean;
}
