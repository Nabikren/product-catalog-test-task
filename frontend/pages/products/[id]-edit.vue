<template>
  <div class="product-edit">
    <div class="product-edit__container">
      <!-- Header -->
      <div class="product-edit__header">
        <div class="product-edit__breadcrumbs">
          <UBreadcrumb
            :links="[
              { label: 'Главная', to: '/' },
              { label: 'Продукты', to: '/products' },
              { label: product?.name || 'Загрузка...', to: `/products/${productId}` },
              { label: 'Редактирование' }
            ]"
          />
        </div>
        
        <h1 class="product-edit__title">
          Редактирование товара
        </h1>
        
        <p class="product-edit__subtitle">
          Измените информацию о товаре и сохраните изменения
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading && !product" class="product-edit__loading">
        <UIcon name="heroicons:arrow-path" class="animate-spin" size="48" />
        <p class="product-edit__loading-text">Загрузка товара...</p>
      </div>

      <!-- Error state -->
      <UAlert
        v-else-if="hasError"
        icon="heroicons:exclamation-triangle"
        color="red"
        variant="soft"
        :title="error || 'Произошла ошибка'"
        :close-button="{ icon: 'heroicons:x-mark-20-solid', color: 'red', variant: 'link' }"
        @close="() => {}"
      />

      <!-- Edit form -->
      <div v-else-if="product" class="product-edit__form-container">
        <form 
          class="product-edit__form"
          @submit.prevent="onSubmit"
        >
          <div class="product-edit__grid">
            <!-- Основная информация -->
            <div class="product-edit__section">
              <h2 class="product-edit__section-title">Основная информация</h2>
              
              <div class="product-edit__section-content">
                <!-- Название -->
                <UFormGroup 
                  label="Название товара"
                  name="name"
                  required
                  class="product-edit__field"
                >
                  <UInput
                    v-model="state.name"
                    placeholder="Введите название товара"
                    size="lg"
                    :disabled="isSaving"
                  />
                </UFormGroup>

                <!-- Бренд -->
                <UFormGroup 
                  label="Бренд"
                  name="brand"
                  class="product-edit__field"
                >
                  <UInput
                    v-model="state.brand"
                    placeholder="Введите бренд"
                    size="lg"
                    :disabled="isSaving"
                  />
                </UFormGroup>

                <!-- Описание -->
                <UFormGroup 
                  label="Описание"
                  name="description"
                  class="product-edit__field product-edit__field--full"
                >
                  <UTextarea
                    v-model="state.description"
                    placeholder="Введите описание товара"
                    :rows="4"
                    size="lg"
                    :disabled="isSaving"
                  />
                </UFormGroup>
              </div>
            </div>

            <!-- Цена и наличие -->
            <div class="product-edit__section">
              <h2 class="product-edit__section-title">Цена и наличие</h2>
              
              <div class="product-edit__section-content">
                <!-- Цена -->
                <UFormGroup 
                  label="Цена"
                  name="price"
                  class="product-edit__field"
                >
                  <UInput
                    v-model.number="state.price"
                    type="number"
                    placeholder="0"
                    size="lg"
                    :disabled="isSaving"
                    min="0"
                    step="0.01"
                  >
                    <template #trailing>
                      <span class="text-gray-500 dark:text-gray-400 text-xs">₽</span>
                    </template>
                  </UInput>
                </UFormGroup>

                <!-- Количество -->
                <UFormGroup 
                  label="Количество"
                  name="quantity"
                  class="product-edit__field"
                >
                  <UInput
                    v-model.number="state.quantity"
                    type="number"
                    placeholder="0"
                    size="lg"
                    :disabled="isSaving"
                    min="0"
                  >
                    <template #trailing>
                      <span class="text-gray-500 dark:text-gray-400 text-xs">шт.</span>
                    </template>
                  </UInput>
                </UFormGroup>

                <!-- Статус -->
                <UFormGroup 
                  label="Статус"
                  name="status"
                  class="product-edit__field product-edit__field--full"
                >
                  <USelect
                    v-model="state.status"
                    :options="statusOptions"
                    placeholder="Выберите статус"
                    size="lg"
                    :disabled="isSaving"
                  />
                </UFormGroup>
              </div>
            </div>

            <!-- Категоризация -->
            <div class="product-edit__section">
              <h2 class="product-edit__section-title">Категоризация</h2>
              
              <div class="product-edit__section-content">
                <!-- Категория -->
                <UFormGroup 
                  label="Категория"
                  name="category"
                  class="product-edit__field"
                >
                  <UInput
                    v-model="state.category"
                    placeholder="Введите категорию"
                    size="lg"
                    :disabled="isSaving"
                  />
                </UFormGroup>

                <!-- Артикул -->
                <UFormGroup 
                  label="Артикул"
                  name="sku"
                  class="product-edit__field"
                >
                  <UInput
                    v-model="state.sku"
                    placeholder="Введите артикул"
                    size="lg"
                    :disabled="isSaving"
                  />
                </UFormGroup>

                <!-- URL изображения -->
                <UFormGroup 
                  label="URL изображения"
                  name="imageUrl"
                  class="product-edit__field product-edit__field--full"
                >
                  <UInput
                    v-model="state.imageUrl"
                    placeholder="https://example.com/image.jpg"
                    size="lg"
                    :disabled="isSaving"
                  />
                </UFormGroup>

                <!-- Дополнительные параметры -->
                <UFormGroup 
                  label="Дополнительные параметры (JSON)"
                  name="metadata"
                  class="product-edit__field product-edit__field--full"
                >
                  <UTextarea
                    v-model="metadataString"
                    placeholder='{"ключ": "значение", "цвет": "белый"}'
                    :rows="4"
                    size="lg"
                    :disabled="isSaving"
                  />
                  <template #help>
                    Введите дополнительные параметры в формате JSON
                  </template>
                </UFormGroup>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="product-edit__actions">
            <UButton
              type="submit"
              size="lg"
              :loading="isSaving"
              :disabled="!isFormValid"
              class="product-edit__submit"
            >
              {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
            </UButton>
            
            <UButton
              type="button"
              variant="outline"
              size="lg"
              :disabled="isSaving"
              @click="router.push(`/products/${productId}`)"
            >
              Отмена
            </UButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===== ОТЛАДКА - САМОЕ НАЧАЛО =====
console.log('🟢 СТАРТ: Файл [id].edit.vue загружается!');
console.log('🟢 Время загрузки:', new Date().toLocaleTimeString());
console.log('🟢 URL:', window.location.href);

// SEO Meta
definePageMeta({
  title: 'Редактирование товара',
  description: 'Редактирование информации о товаре',
});

// Types
interface ProductEditState {
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

// Router
const route = useRoute();
const router = useRouter();
const toast = useToast();

const productId = computed(() => parseInt(route.params.id as string));

// Отладка - проверяем что скрипт загружается
console.log('🚀 Страница редактирования загружается!');
console.log('📍 Product ID:', productId.value);
console.log('🔗 Route params:', route.params);

// API
const { 
  product, 
  isLoading, 
  hasError, 
  error, 
  fetchProduct, 
  updateProduct 
} = useProduct(productId);

// State
const isSaving = ref(false);

// Form state
const state = ref<ProductEditState>({
  name: '',
  brand: '',
  description: '',
  price: 0,
  category: '',
  sku: '',
  quantity: 0,
  imageUrl: '',
  status: '',
  metadata: {},
});

// Metadata as JSON string for textarea
const metadataString = ref('');

// Status options
const statusOptions = [
  { label: 'Активный', value: 'active' },
  { label: 'Неактивный', value: 'inactive' },
  { label: 'Закончился', value: 'out_of_stock' },
  { label: 'Ожидается', value: 'pending' },
];

// Computed
const isFormValid = computed(() => {
  return state.value.name.trim().length > 0;
});

// Watch для заполнения формы при загрузке товара
watch(product, (newProduct, oldProduct) => {
  console.log('🔄 Watch product сработал!');
  console.log('🔄 Новый товар:', newProduct);
  console.log('🔄 Старый товар:', oldProduct);
  console.log('🔄 Есть ли товар?', !!newProduct);
  
  if (newProduct) {
    console.log('📝 Начинаем заполнение формы...');
    state.value = {
      name: newProduct.name || '',
      brand: newProduct.brand || '',
      description: newProduct.description || '',
      price: newProduct.price || 0,
      category: newProduct.category || '',
      sku: newProduct.sku || '',
      quantity: newProduct.quantity || 0,
      imageUrl: newProduct.imageUrl || '',
      status: newProduct.status || '',
      metadata: newProduct.metadata || {},
    };
    
    // Конвертируем metadata в JSON строку для отображения
    try {
      metadataString.value = newProduct.metadata ? JSON.stringify(newProduct.metadata, null, 2) : '';
    } catch (e) {
      metadataString.value = '';
      console.warn('Ошибка при конвертации metadata в JSON:', e);
    }
    
    console.log('📝 Форма заполнена:', state.value);
    console.log('📝 Metadata строка:', metadataString.value);
  } else {
    console.log('⚠️ Товар пустой, форма не заполняется');
  }
}, { immediate: true });

// Отладка состояний
watch([isLoading, hasError, error], ([loading, hasErr, err]) => {
  console.log('📊 Состояние загрузки:', { loading, hasError: hasErr, error: err });
});

const onSubmit = async () => {
  // Простая валидация
  if (!state.value.name.trim()) {
    toast.add({
      title: 'Ошибка валидации',
      description: 'Название товара обязательно для заполнения',
      color: 'red',
    });
    return;
  }

  try {
    isSaving.value = true;
    
    // Парсим metadata из JSON строки
    let parsedMetadata;
    try {
      parsedMetadata = metadataString.value.trim() ? JSON.parse(metadataString.value) : {};
    } catch (e) {
      toast.add({
        title: 'Ошибка в JSON',
        description: 'Дополнительные параметры содержат некорректный JSON',
        color: 'red',
      });
      return;
    }
    
    // Подготавливаем данные для отправки
    const updateData = {
      ...state.value,
      price: state.value.price ? Number(state.value.price) : undefined,
      quantity: state.value.quantity ? Number(state.value.quantity) : undefined,
      metadata: parsedMetadata,
    };
    
    // Удаляем пустые значения
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });
    
    console.log('📤 Отправляем данные для обновления:', updateData);
    
    const result = await updateProduct(productId.value, updateData);
    
    if (result.success) {
      toast.add({
        title: 'Успешно!',
        description: 'Товар успешно обновлен',
        color: 'green',
      });
      
      // Перенаправляем на страницу товара
      await router.push(`/products/${productId.value}`);
    } else {
      throw new Error(result.error || 'Ошибка обновления товара');
    }
  } catch (err) {
    console.error('Ошибка сохранения:', err);
    toast.add({
      title: 'Ошибка',
      description: err instanceof Error ? err.message : 'Не удалось сохранить изменения',
      color: 'red',
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/abstracts/_variables.scss";
@import "~/assets/scss/abstracts/_variables.scss";
@import "~/assets/scss/abstracts/_mixins.scss";

.product-edit {
  min-height: 100vh;
  background: linear-gradient(135deg, $color-gray-50 0%, $color-white 100%);
  padding: $spacing-6 0;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $spacing-4;
  }

  &__header {
    margin-bottom: $spacing-8;
    text-align: center;
  }

  &__breadcrumbs {
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $color-gray-900;
    margin: 0 0 $spacing-2 0;
  }

  &__subtitle {
    color: $color-gray-600;
    font-size: $font-size-lg;
    margin: 0;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-12 $spacing-4;
    color: $color-gray-500;
  }

  &__loading-text {
    margin-top: $spacing-4;
    font-size: $font-size-lg;
  }

  &__form-container {
    background: $color-white;
    border-radius: $border-radius-xl;
    box-shadow: $shadow-xl;
    padding: $spacing-8;
  }

  &__form {
    display: flex;
    flex-direction: column;
  }

  &__grid {
    display: grid;
    gap: $spacing-8;
    margin-bottom: $spacing-8;
    
    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
    
    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  &__section {
    &:first-child {
      @media (min-width: 1024px) {
        grid-column: span 2;
      }
    }
  }

  &__section-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-gray-900;
    margin: 0 0 $spacing-4 0;
    padding-bottom: $spacing-3;
    border-bottom: 2px solid $color-primary-light;
  }

  &__section-content {
    display: grid;
    gap: $spacing-4;
    
    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__field {
    &--full {
      @media (min-width: 768px) {
        grid-column: span 2;
      }
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    padding-top: $spacing-6;
    border-top: 1px solid $color-gray-200;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  &__submit {
    min-width: 200px;
    
    @media (max-width: 768px) {
      width: 100%;
    }
  }
}

// Анимации
.product-edit__form-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
