<template>
  <div class="container">
    <div class="product-details">
      <!-- Loading state -->
      <div v-if="isLoading" class="product-details__loading">
        <USkeleton class="h-8 w-64 mb-4" />
        <USkeleton class="h-64 w-full mb-6" />
        <USkeleton class="h-32 w-full" />
      </div>
      
      <!-- Error state -->
      <UAlert
        v-else-if="hasError"
        icon="heroicons:exclamation-triangle"
        color="red"
        variant="soft"
        :title="error || 'Продукт не найден'"
        :close-button="{ icon: 'heroicons:x-mark-20-solid', color: 'red', variant: 'link' }"
        @close="goToList"
      />
      
      <!-- Product details -->
      <div v-else-if="product" class="product-details__content">
        <!-- Header -->
        <div class="product-details__header">
          <div class="product-details__breadcrumb">
            <UButton
              to="/products"
              variant="ghost"
              icon="heroicons:arrow-left"
              size="sm"
            >
              К списку продуктов
            </UButton>
          </div>
          
          <div class="product-details__actions">
            <UButton
              variant="outline"
              icon="heroicons:pencil"
              @click="goToEdit"
            >
              Редактировать
            </UButton>
            <UButton
              color="red"
              variant="outline"
              icon="heroicons:trash"
              @click="handleDelete"
            >
              Удалить
            </UButton>
          </div>
        </div>
        
        <!-- Main content -->
        <div class="product-details__main">
          <!-- Image -->
          <div class="product-details__image-container">
            <img 
              v-if="product.imageUrl"
              :src="product.imageUrl" 
              :alt="product.name"
              class="product-details__image"
            />
            <div v-else class="product-details__image-placeholder">
              <Icon name="heroicons:photo" size="96" />
              <p>Изображение отсутствует</p>
            </div>
          </div>
          
          <!-- Info -->
          <div class="product-details__info">
            <div class="product-details__header-info">
              <div v-if="product.brand" class="product-details__brand">
                {{ product.brand }}
              </div>
              <h1 class="product-details__title">
                {{ product.name }}
              </h1>
              <div class="product-details__price">
                {{ formattedPrice }}
              </div>
            </div>
            
            <div v-if="product.description" class="product-details__description">
              <h2>Описание</h2>
              <p>{{ product.description }}</p>
            </div>
            
            <!-- Specifications -->
            <div class="product-details__specs">
              <h2>Характеристики</h2>
              <dl class="product-details__specs-list">
                <template v-if="product.sku">
                  <dt>Артикул</dt>
                  <dd>{{ product.sku }}</dd>
                </template>
                
                <template v-if="product.category">
                  <dt>Категория</dt>
                  <dd>{{ product.category }}</dd>
                </template>
                
                <template v-if="product.quantity !== undefined">
                  <dt>Количество</dt>
                  <dd>{{ product.quantity }} шт.</dd>
                </template>
                
                <template v-if="product.status">
                  <dt>Статус</dt>
                  <dd>
                    <UBadge 
                      :color="getStatusColor(product.status)"
                      variant="soft"
                    >
                      {{ product.status }}
                    </UBadge>
                  </dd>
                </template>
                
                <dt>Дата создания</dt>
                <dd>{{ formattedDate }}</dd>
                
                <dt>Последнее обновление</dt>
                <dd>{{ formatDate(product.updatedAt) }}</dd>
              </dl>
            </div>
            
            <!-- Metadata -->
            <div v-if="product.metadata && Object.keys(product.metadata).length > 0" class="product-details__metadata">
              <h2>Дополнительные данные</h2>
              <UCard class="metadata-card">
                <dl class="product-details__metadata-list">
                  <template v-for="(value, key) in product.metadata" :key="key">
                    <dt>{{ formatMetadataKey(key) }}</dt>
                    <dd>{{ value }}</dd>
                  </template>
                </dl>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Route params
const route = useRoute();
const productId = parseInt(route.params.id as string);

if (isNaN(productId)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found'
  });
}

// Composables
const {
  product,
  loading,
  error,
  isLoading,
  hasError,
  formattedPrice,
  formattedDate,
  goToEdit,
  goToList,
} = useProduct(productId);

const router = useRouter();
const toast = useToast();

// SEO Meta
useSeoMeta({
  title: () => product.value ? `${product.value.name} - Каталог продуктов` : 'Продукт - Каталог продуктов',
  description: () => product.value?.description || 'Просмотр продукта в каталоге',
});

// Utility functions
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'активный':
      return 'green';
    case 'inactive':
    case 'неактивный':
      return 'red';
    case 'pending':
    case 'ожидает':
      return 'yellow';
    default:
      return 'gray';
  }
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

const formatMetadataKey = (key: string) => {
  // Переводы ключей на русский
  const translations: Record<string, string> = {
    'Цвет': 'Цвет',
    'Бренд': 'Бренд',
    'Артикул': 'Артикул',
    'Цена, руб.*': 'Цена (руб.)',
    'Цена, руб.': 'Цена (руб.)',
    'Название товара': 'Название товара',
    'Страна-изготовитель': 'Страна-изготовитель',
    'color': 'Цвет',
    'brand': 'Бренд',
    'sku': 'Артикул',
    'price': 'Цена',
    'name': 'Название',
    'country': 'Страна',
  };
  
  return translations[key] || key;
};

// Handle delete
const handleDelete = async () => {
  if (!product.value) return;
  
  const isConfirmed = confirm(`Вы уверены, что хотите удалить продукт "${product.value.name}"?`);
  
  if (!isConfirmed) return;
  
  try {
    const api = useApi();
    await api.products.delete(product.value.id);
    
    toast.add({
      title: 'Продукт удален',
      description: `Продукт "${product.value.name}" успешно удален`,
      color: 'green',
    });
    
    // Navigate to products list
    router.push('/products');
  } catch (error) {
    toast.add({
      title: 'Ошибка',
      description: error instanceof Error ? error.message : 'Не удалось удалить продукт',
      color: 'red',
    });
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/abstracts/_variables.scss";
@import "~/assets/scss/abstracts/_mixins.scss";

.product-details {
  padding: $spacing-6 0;
  
  @include element('loading') {
    max-width: 800px;
    margin: 0 auto;
  }
  
  @include element('content') {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  @include element('header') {
    @include flex-between;
    align-items: flex-start;
    margin-bottom: $spacing-8;
    gap: $spacing-4;
    
    @include mobile-only {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  @include element('breadcrumb') {
    margin-bottom: $spacing-4;
    
    @include mobile-only {
      margin-bottom: $spacing-2;
    }
  }
  
  @include element('actions') {
    display: flex;
    gap: $spacing-3;
    
    @include mobile-only {
      justify-content: stretch;
      
      .btn {
        flex: 1;
      }
    }
  }
  
  @include element('main') {
    display: grid;
    gap: $spacing-8;
    
    @include desktop-up {
      grid-template-columns: 1fr 1fr;
      gap: $spacing-12;
    }
  }
  
  @include element('image-container') {
    aspect-ratio: 1;
    border-radius: $border-radius-lg;
    overflow: hidden;
    background-color: $color-gray-100;
  }
  
  @include element('image') {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @include element('image-placeholder') {
    @include flex-center;
    flex-direction: column;
    height: 100%;
    color: $color-gray-400;
    text-align: center;
    
    p {
      margin-top: $spacing-4;
      font-size: $font-size-lg;
    }
  }
  
  @include element('info') {
    display: flex;
    flex-direction: column;
    gap: $spacing-6;
  }
  
  @include element('header-info') {
    padding-bottom: $spacing-6;
    border-bottom: 1px solid $color-gray-200;
  }
  
  @include element('brand') {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-gray-600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: $spacing-2;
  }
  
  @include element('title') {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $color-gray-900;
    margin-bottom: $spacing-4;
    line-height: $line-height-tight;
    
    @include mobile-only {
      font-size: $font-size-2xl;
    }
  }
  
  @include element('price') {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-primary;
    
    @include mobile-only {
      font-size: $font-size-xl;
    }
  }
  
  @include element('description') {
    h2 {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $color-gray-900;
      margin-bottom: $spacing-3;
    }
    
    p {
      color: $color-gray-700;
      line-height: $line-height-relaxed;
    }
  }
  
  @include element('specs') {
    h2 {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $color-gray-900;
      margin-bottom: $spacing-4;
    }
  }
  
  @include element('specs-list') {
    display: grid;
    gap: $spacing-3;
    
    dt {
      font-weight: $font-weight-medium;
      color: $color-gray-600;
      font-size: $font-size-sm;
    }
    
    dd {
      color: $color-gray-900;
      margin-bottom: $spacing-2;
    }
  }
  
  @include element('metadata') {
    h2 {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $color-gray-900;
      margin-bottom: $spacing-4;
    }
  }
  
  @include element('metadata-list') {
    display: grid;
    gap: $spacing-3;
    
    dt {
      font-weight: $font-weight-medium;
      color: $color-gray-600 !important;
      font-size: $font-size-sm;
      margin-bottom: $spacing-1;
    }
    
    dd {
      color: $color-gray-900 !important;
      margin-bottom: $spacing-3;
      font-size: $font-size-base;
    }
  }
}

// Светлая тема для карточки
:deep(.metadata-card) {
  background-color: $color-white !important;
  color: $color-gray-900 !important;
}
</style>
