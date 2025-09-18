<template>
  <div class="products__filters">
    <form @submit.prevent="handleSubmit" class="products__filters-grid">
      <!-- Поиск -->
      <UFormGroup label="Поиск">
        <UInput
          v-model="localFilters.search"
          placeholder="Поиск по названию или описанию..."
          icon="heroicons:magnifying-glass"
        />
      </UFormGroup>
      
      <!-- Бренд -->
      <UFormGroup label="Бренд">
        <USelect
          v-model="localFilters.brand"
          :options="brandOptions"
          placeholder="Выберите бренд"
        />
      </UFormGroup>
      
      <!-- Категория -->
      <UFormGroup label="Категория">
        <USelect
          v-model="localFilters.category"
          :options="categoryOptions"
          placeholder="Выберите категорию"
        />
      </UFormGroup>
      
      <!-- Статус -->
      <UFormGroup label="Статус">
        <USelect
          v-model="localFilters.status"
          :options="statusOptions"
          placeholder="Выберите статус"
        />
      </UFormGroup>
      
      <!-- Цена от -->
      <UFormGroup label="Цена от">
        <UInput
          v-model.number="localFilters.minPrice"
          type="number"
          placeholder="0"
          min="0"
          step="0.01"
        />
      </UFormGroup>
      
      <!-- Цена до -->
      <UFormGroup label="Цена до">
        <UInput
          v-model.number="localFilters.maxPrice"
          type="number"
          placeholder="99999"
          min="0"
          step="0.01"
        />
      </UFormGroup>
    </form>
    
    <div class="products__filters-actions">
      <UButton
        type="button"
        variant="outline"
        @click="handleClear"
      >
        Очистить
      </UButton>
      <UButton
        type="button"
        @click="handleSubmit"
      >
        Применить
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductFilters, FilterOptions } from '~/types';

interface Props {
  filters: ProductFilters;
  filterOptions: FilterOptions;
  loading?: boolean;
}

interface Emits {
  (e: 'apply', filters: ProductFilters): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Local filters state
const localFilters = ref<ProductFilters>({ ...props.filters });

// Options for select inputs
const brandOptions = computed(() => [
  { label: 'Все бренды', value: '' },
  ...props.filterOptions.brands.map(brand => ({
    label: brand,
    value: brand,
  })),
]);

const categoryOptions = computed(() => [
  { label: 'Все категории', value: '' },
  ...props.filterOptions.categories.map(category => ({
    label: category,
    value: category,
  })),
]);

const statusOptions = [
  { label: 'Все статусы', value: '' },
  { label: 'Активный', value: 'active' },
  { label: 'Неактивный', value: 'inactive' },
  { label: 'Ожидает', value: 'pending' },
];

// Methods
const handleSubmit = () => {
  // Remove empty values
  const cleanFilters = Object.fromEntries(
    Object.entries(localFilters.value).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  );
  
  emit('apply', cleanFilters);
};

const handleClear = () => {
  localFilters.value = {};
  emit('clear');
};

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

// Auto-apply on search change with debounce
const debouncedSearch = useDebounceFn(() => {
  handleSubmit();
}, 500);

watch(() => localFilters.value.search, () => {
  debouncedSearch();
});
</script>
