<template>
  <div class="container">
    <div class="products">
      <!-- Header -->
      <div class="products__header">
        <div>
          <h1 class="products__title">Продукты</h1>
          <p class="products__subtitle">
            Управляйте своим каталогом товаров
          </p>
        </div>
        
        <div class="products__actions">
          <UButton
            to="/import"
            icon="heroicons:arrow-up-tray"
            variant="outline"
          >
            Импорт
          </UButton>
          <UButton
            to="/products/new"
            icon="heroicons:plus"
          >
            Добавить продукт
          </UButton>
        </div>
      </div>
      
      <!-- Filters -->
      <ProductFilters
        :filters="filters"
        :filter-options="filterOptions"
        :loading="isLoading"
        @apply="applyFilters"
        @clear="clearFilters"
      />
      
      <!-- Toolbar -->
      <div class="products__toolbar">
        <div class="products__toolbar-left">
          <div class="products__results-info">
            <template v-if="hasProducts">
              Показано {{ paginationInfo.start }}-{{ paginationInfo.end }} 
              из {{ paginationInfo.total }} продуктов
            </template>
            <template v-else-if="!isLoading">
              Продукты не найдены
            </template>
          </div>
        </div>
        
        <div class="products__toolbar-right">
          <!-- View toggle -->
          <div class="products__view-toggle">
            <button
              type="button"
              class="products__view-button"
              :class="{ 'products__view-button--active': viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              aria-label="Сетка"
            >
              <Icon name="heroicons:squares-2x2" />
            </button>
            <button
              type="button"
              class="products__view-button"
              :class="{ 'products__view-button--active': viewMode === 'list' }"
              @click="viewMode = 'list'"
              aria-label="Список"
            >
              <Icon name="heroicons:list-bullet" />
            </button>
          </div>
          
          <!-- Sort -->
          <USelect
            v-model="currentSort"
            :options="sortOptions"
            class="products__sort-select"
            @change="handleSortChange"
          />
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="products__loading">
        <UIcon name="heroicons:arrow-path" class="animate-spin" size="48" />
        <p class="products__loading-text">Загрузка продуктов...</p>
      </div>
      
      <!-- Error state -->
      <UAlert
        v-else-if="hasError"
        icon="heroicons:exclamation-triangle"
        color="red"
        variant="soft"
        :title="error || 'Произошла ошибка'"
        :close-button="{ icon: 'heroicons:x-mark-20-solid', color: 'red', variant: 'link' }"
        @close="fetchProducts"
      />
      
      <!-- Empty state -->
      <div v-else-if="isEmpty" class="products__empty">
        <Icon name="heroicons:cube-transparent" class="products__empty-icon" />
        <h3 class="products__empty-title">Продукты не найдены</h3>
        <p class="products__empty-description">
          Попробуйте изменить фильтры или импортировать новые данные
        </p>
        <UButton
          to="/import"
          icon="heroicons:arrow-up-tray"
        >
          Импортировать данные
        </UButton>
      </div>
      
      <!-- Products grid/list -->
      <div 
        v-else-if="hasProducts"
        class="products__grid"
        :class="`products__grid--${viewMode}`"
      >
        <!-- Grid view -->
        <template v-if="viewMode === 'grid'">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :show-edit-button="true"
            :show-delete-button="true"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </template>
        
        <!-- List view -->
        <template v-else>
          <ProductListItem
            v-for="product in products"
            :key="product.id"
            :product="product"
            :show-edit-button="true"
            :show-delete-button="true"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </template>
      </div>
      
      <!-- Pagination -->
      <div v-if="hasProducts" class="products__pagination-container">
        <UPagination
          v-model="pagination.page"
          :page-count="pagination.limit"
          :total="total"
          :max="5"
          @change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types';

// SEO Meta
definePageMeta({
  title: 'Продукты',
  description: 'Список всех продуктов в каталоге',
});

// Composables
const {
  products,
  loading,
  error,
  filters,
  pagination,
  viewMode,
  filterOptions,
  isLoading,
  hasError,
  isEmpty,
  hasProducts,
  paginationInfo,
  fetchProducts,
  applyFilters,
  clearFilters,
  changePage,
  changeSort,
} = useProducts();

const router = useRouter();
const toast = useToast();

// Sort options
const sortOptions = [
  { label: 'Новые сначала', value: 'createdAt:DESC' },
  { label: 'Старые сначала', value: 'createdAt:ASC' },
  { label: 'По названию (А-Я)', value: 'name:ASC' },
  { label: 'По названию (Я-А)', value: 'name:DESC' },
  { label: 'По цене (дешевые)', value: 'price:ASC' },
  { label: 'По цене (дорогие)', value: 'price:DESC' },
];

const currentSort = ref('createdAt:DESC');

// Handle sort change
const handleSortChange = () => {
  const [sortBy, sortOrder] = currentSort.value.split(':') as [string, 'ASC' | 'DESC'];
  changeSort(sortBy, sortOrder);
};

// Handle product edit
const handleEdit = (product: Product) => {
  router.push(`/products/${product.id}-edit`);
};

// Handle product delete
const handleDelete = async (product: Product) => {
  const isConfirmed = confirm(`Вы уверены, что хотите удалить продукт "${product.name}"?`);
  
  if (!isConfirmed) return;
  
  try {
    const api = useApi();
    await api.products.delete(product.id);
    
    toast.add({
      title: 'Продукт удален',
      description: `Продукт "${product.name}" успешно удален`,
      color: 'green',
    });
    
    // Refresh products list
    await fetchProducts();
  } catch (error) {
    toast.add({
      title: 'Ошибка',
      description: error instanceof Error ? error.message : 'Не удалось удалить продукт',
      color: 'red',
    });
  }
};

// Keyboard shortcuts
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    // Ctrl/Cmd + K for search focus
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      // Focus search input
      const searchInput = document.querySelector('input[placeholder*="Поиск"]') as HTMLInputElement;
      searchInput?.focus();
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/abstracts/_variables.scss";
@import "~/assets/scss/abstracts/_mixins.scss";

.products {
  padding: $spacing-6 0;
  
  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 $spacing-4;
  }
  
  &__header {
    margin-bottom: $spacing-8;
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
  
  &__actions {
    display: flex;
    gap: $spacing-3;
    margin-bottom: $spacing-6;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  
  &__controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;
    gap: $spacing-4;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  &__view-toggle {
    display: flex;
    gap: $spacing-1;
  }
  
  &__sort-controls {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }
  
  &__sort-select {
    min-width: 200px;
  }
  
  // Сетка товаров - 4 колонки
  &__grid {
    display: grid;
    gap: $spacing-6;
    margin-bottom: $spacing-8;
    
    // Сетка карточек - 4 столбца
    &--grid {
      grid-template-columns: repeat(4, 1fr);
      
      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
      }
      
      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    
    // Список - одна колонка
    &--list {
      grid-template-columns: 1fr;
      gap: $spacing-3;
    }
  }
  
  // Состояния
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
  
  &__empty {
    text-align: center;
    padding: $spacing-12 $spacing-4;
  }
  
  &__empty-icon {
    font-size: 64px;
    color: $color-gray-400;
    margin-bottom: $spacing-6;
  }
  
  &__empty-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-gray-900;
    margin: 0 0 $spacing-4 0;
  }
  
  &__empty-description {
    color: $color-gray-600;
    margin: 0 0 $spacing-6 0;
  }
  
  // Пагинация
  &__pagination-container {
    display: flex;
    justify-content: center;
    padding-top: $spacing-6;
    border-top: 1px solid $color-gray-200;
  }
}

// Анимации
.products__grid--grid > * {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
  
  @for $i from 1 through 12 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.1}s;
    }
  }
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

// Hover эффекты для сетки
.products__grid--grid > * {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
}
</style>
