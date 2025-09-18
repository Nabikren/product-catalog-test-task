import type { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductFilters, 
  PaginationParams, 
  PaginatedResponse, 
  ImportResult, 
  ImportOptions,
  FilterOptions,
  ApiResponse 
} from '~/types';

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  // Generic API call function
  const apiCall = async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API call failed');
      }

      return result.data as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Products API
  const products = {
    // Получить список продуктов
    getAll: async (
      filters: ProductFilters = {}, 
      pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<Product>> => {
      const params = new URLSearchParams();
      
      Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const queryString = params.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      
      return apiCall<PaginatedResponse<Product>>(endpoint);
    },

    // Получить продукт по ID
    getById: async (id: number): Promise<Product> => {
      return apiCall<Product>(`/products/${id}`);
    },

    // Создать продукт
    create: async (productData: CreateProductDto): Promise<Product> => {
      return apiCall<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },

    // Обновить продукт
    update: async (id: number, productData: UpdateProductDto): Promise<Product> => {
      return apiCall<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    },

    // Удалить продукт
    delete: async (id: number): Promise<void> => {
      return apiCall<void>(`/products/${id}`, {
        method: 'DELETE',
      });
    },

    // Получить фильтры
    getFilters: async (): Promise<FilterOptions> => {
      return apiCall<FilterOptions>('/products/filters');
    },
  };

  // Import API
  const importData = {
    // Импорт из файла
    fromFile: async (file: File): Promise<ImportResult> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'file');

      const response = await fetch(`${baseURL}/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<ImportResult> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      return result.data as ImportResult;
    },

    // Импорт из Google Sheets
    fromGoogleSheets: async (spreadsheetId: string, range?: string): Promise<ImportResult> => {
      return apiCall<ImportResult>('/import', {
        method: 'POST',
        body: JSON.stringify({
          type: 'google_sheets',
          spreadsheetId,
          range: range || 'A:Z',
        }),
      });
    },

    // Импорт по URL (для будущего развития)
    fromUrl: async (url: string): Promise<ImportResult> => {
      return apiCall<ImportResult>('/import', {
        method: 'POST',
        body: JSON.stringify({
          type: 'url',
          url,
        }),
      });
    },
  };

  return {
    products,
    importData,
  };
};
