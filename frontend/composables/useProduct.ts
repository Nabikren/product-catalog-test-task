import type { Product, CreateProductDto, UpdateProductDto, LoadingState } from '~/types';

export const useProduct = (productId?: number | Ref<number>) => {
  console.log('🔧 useProduct вызван с ID:', productId);
  const api = useApi();
  const router = useRouter();

  // Reactive state
  const product = ref<Product | null>(null);
  const loading = ref<LoadingState>('idle');
  const error = ref<string | null>(null);

  // Reactive product ID
  const id = computed(() => {
    if (typeof productId === 'number') return productId;
    if (productId && 'value' in productId) return productId.value;
    return undefined;
  });

  // Загрузить продукт по ID
  const fetchProduct = async (productId?: number) => {
    const targetId = productId || id.value;
    console.log('📥 fetchProduct вызван. Target ID:', targetId, 'Переданный ID:', productId, 'id.value:', id.value);
    
    if (!targetId) {
      console.log('❌ ID продукта не указан');
      error.value = 'ID продукта не указан';
      return;
    }

    try {
      loading.value = 'loading';
      error.value = null;

      const fetchedProduct = await api.products.getById(targetId);
      console.log('✅ Товар получен из API:', fetchedProduct);
      product.value = fetchedProduct;
      console.log('✅ product.value установлен:', product.value);
      loading.value = 'success';
      console.log('✅ loading установлен в success');
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Произошла ошибка';
      console.error('Error fetching product:', err);
    }
  };

  // Создать продукт
  const createProduct = async (productData: CreateProductDto): Promise<Product | null> => {
    try {
      loading.value = 'loading';
      error.value = null;

      const newProduct = await api.products.create(productData);
      product.value = newProduct;
      loading.value = 'success';

      return newProduct;
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при создании';
      console.error('Error creating product:', err);
      return null;
    }
  };

  // Обновить продукт
  const updateProduct = async (productId: number, productData: UpdateProductDto): Promise<{ success: boolean; data?: Product; error?: string }> => {
    try {
      loading.value = 'loading';
      error.value = null;

      const updatedProduct = await api.products.update(productId, productData);
      product.value = updatedProduct;
      loading.value = 'success';

      return { success: true, data: updatedProduct };
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при обновлении';
      console.error('Error updating product:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Произошла ошибка при обновлении' };
    }
  };

  // Удалить продукт
  const deleteProduct = async (): Promise<boolean> => {
    const targetId = id.value;
    
    if (!targetId) {
      error.value = 'ID продукта не указан';
      return false;
    }

    try {
      loading.value = 'loading';
      error.value = null;

      await api.products.delete(targetId);
      product.value = null;
      loading.value = 'success';

      return true;
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при удалении';
      console.error('Error deleting product:', err);
      return false;
    }
  };

  // Сохранить продукт (создать или обновить)
  const saveProduct = async (productData: CreateProductDto | UpdateProductDto): Promise<Product | null> => {
    if (id.value) {
      const result = await updateProduct(id.value, productData as UpdateProductDto);
      return result.success ? result.data || null : null;
    } else {
      return await createProduct(productData as CreateProductDto);
    }
  };

  // Переход к редактированию
  const goToEdit = () => {
    if (product.value) {
      router.push(`/products/${product.value.id}-edit`);
    }
  };

  // Переход назад к списку
  const goToList = () => {
    router.push('/products');
  };

  // Computed properties
  const isLoading = computed(() => loading.value === 'loading');
  const hasError = computed(() => loading.value === 'error');
  const isNew = computed(() => !id.value);
  const isExisting = computed(() => !!id.value && !!product.value);

  // Format helpers
  const formattedPrice = computed(() => {
    if (!product.value?.price) return 'Цена не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(product.value.price);
  });

  const formattedDate = computed(() => {
    if (!product.value?.createdAt) return '';
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(product.value.createdAt));
  });

  // Watch for ID changes
  watch(id, (newId) => {
    console.log('👁️ Watch сработал! Новый ID:', newId);
    if (newId) {
      fetchProduct(newId);
    } else {
      console.log('⚠️ ID пустой, загрузка не будет выполнена');
    }
  }, { immediate: true });

  return {
    // State
    product: readonly(product),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    isLoading,
    hasError,
    isNew,
    isExisting,
    formattedPrice,
    formattedDate,

    // Actions
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    saveProduct,
    goToEdit,
    goToList,
  };
};
