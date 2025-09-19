import type { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductFilters, 
  PaginationParams, 
  PaginatedResponse, 
  ImportResult, 
  ImportOptions,
  FilterOptions
} from '~/types';

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;

  // Generic API call function
  const apiCall = async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    const fullUrl = `${baseURL}${endpoint}`;
    console.log('🌐 API Call:', options.method || 'GET', fullUrl);
    console.log('🌐 Base URL:', baseURL);
    console.log('🌐 Endpoint:', endpoint);
    
    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // NestJS API возвращает данные напрямую, без оборачивающего объекта success/data
      return result as T;
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
        method: 'PATCH',
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

      const fullUrl = `${baseURL}/import`;
      console.log('🌐 File Import API Call: POST', fullUrl);
      console.log('🌐 File:', file.name, file.type, file.size);

      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ File import failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ File import result:', result);
      
      // NestJS API возвращает данные напрямую
      return result as ImportResult;
    },

    // Импорт из Google Sheets
    fromGoogleSheets: async (spreadsheetId: string, range?: string): Promise<ImportResult> => {
      const formData = new FormData();
      formData.append('type', 'google_sheets');
      formData.append('spreadsheetId', spreadsheetId);
      if (range) {
        formData.append('range', range);
      }

      const fullUrl = `${baseURL}/import`;
      console.log('🌐 Google Sheets Import API Call: POST', fullUrl);
      console.log('🌐 Spreadsheet ID:', spreadsheetId);

      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Sheets import failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Google Sheets import result:', result);
      
      return result as ImportResult;
    },

    // Импорт по URL (для будущего развития)
    fromUrl: async (url: string): Promise<ImportResult> => {
      const formData = new FormData();
      formData.append('type', 'url');
      formData.append('url', url);

      const fullUrl = `${baseURL}/import`;
      console.log('🌐 URL Import API Call: POST', fullUrl);
      console.log('🌐 URL:', url);

      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ URL import failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ URL import result:', result);
      
      return result as ImportResult;
    },
  };

  return {
    products,
    importData,
  };
};
