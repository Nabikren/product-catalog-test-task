import type { 
  Product, 
  ProductFilters, 
  PaginationParams, 
  PaginatedResponse,
  ViewMode,
  LoadingState 
} from '~/types';

export const useProducts = () => {
  const api = useApi();

  // Reactive state
  const products = ref<Product[]>([]);
  const loading = ref<LoadingState>('idle');
  const error = ref<string | null>(null);
  const total = ref(0);
  const currentPage = ref(1);
  const totalPages = ref(0);

  // Filters and pagination
  const filters = ref<ProductFilters>({});
  const pagination = ref<PaginationParams>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // View mode
  const viewMode = ref<ViewMode>('grid');

  // Filter options
  const filterOptions = ref({
    brands: [] as string[],
    categories: [] as string[],
  });

  // Загрузить продукты
  const fetchProducts = async () => {
    try {
      loading.value = 'loading';
      error.value = null;

      const response = await api.products.getAll(filters.value, pagination.value);
      
      products.value = response.data;
      total.value = response.total;
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      
      loading.value = 'success';
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Произошла ошибка';
      console.error('Error fetching products:', err);
    }
  };

  // Загрузить фильтры
  const fetchFilters = async () => {
    try {
      filterOptions.value = await api.products.getFilters();
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  // Применить фильтры
  const applyFilters = (newFilters: ProductFilters) => {
    filters.value = { ...newFilters };
    pagination.value.page = 1; // Сбросить на первую страницу
    fetchProducts();
  };

  // Очистить фильтры
  const clearFilters = () => {
    filters.value = {};
    pagination.value.page = 1;
    fetchProducts();
  };

  // Изменить страницу
  const changePage = (page: number) => {
    pagination.value.page = page;
    fetchProducts();
  };

  // Изменить лимит
  const changeLimit = (limit: number) => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchProducts();
  };

  // Изменить сортировку
  const changeSort = (sortBy: string, sortOrder: 'ASC' | 'DESC' = 'DESC') => {
    pagination.value.sortBy = sortBy;
    pagination.value.sortOrder = sortOrder;
    pagination.value.page = 1;
    fetchProducts();
  };

  // Переключить режим просмотра
  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
  };

  // Поиск
  const search = (query: string) => {
    filters.value.search = query;
    pagination.value.page = 1;
    fetchProducts();
  };

  // Computed properties
  const isLoading = computed(() => loading.value === 'loading');
  const hasError = computed(() => loading.value === 'error');
  const isEmpty = computed(() => products.value.length === 0 && loading.value === 'success');
  const hasProducts = computed(() => products.value.length > 0);

  // Pagination info
  const paginationInfo = computed(() => {
    const start = (currentPage.value - 1) * pagination.value.limit! + 1;
    const end = Math.min(start + pagination.value.limit! - 1, total.value);
    
    return {
      start,
      end,
      total: total.value,
      currentPage: currentPage.value,
      totalPages: totalPages.value,
    };
  });

  // Initialize
  onMounted(() => {
    fetchProducts();
    fetchFilters();
  });

  return {
    // State
    products: readonly(products),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),
    pagination: readonly(pagination),
    viewMode,
    filterOptions: readonly(filterOptions),

    // Computed
    isLoading,
    hasError,
    isEmpty,
    hasProducts,
    paginationInfo,

    // Actions
    fetchProducts,
    fetchFilters,
    applyFilters,
    clearFilters,
    changePage,
    changeLimit,
    changeSort,
    toggleViewMode,
    search,
  };
};
