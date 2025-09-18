<template>
  <article class="product-list-item" @click="goToDetails">
    <img 
      v-if="product.imageUrl"
      :src="product.imageUrl" 
      :alt="product.name"
      class="product-list-item__image"
      loading="lazy"
    />
    <div v-else class="product-list-item__image product-list-item__image--placeholder">
      <Icon name="heroicons:photo" size="24" />
    </div>
    
    <div class="product-list-item__content">
      <div class="product-list-item__header">
        <div>
          <h3 class="product-list-item__title">
            {{ product.name }}
          </h3>
          <div v-if="product.brand" class="product-list-item__brand">
            {{ product.brand }}
          </div>
        </div>
        
        <div class="product-list-item__price">
          {{ formattedPrice }}
        </div>
      </div>
      
      <p v-if="product.description" class="product-list-item__description">
        {{ product.description }}
      </p>
      
      <div class="product-list-item__meta">
        <div class="product-list-item__status" v-if="product.status">
          {{ product.status }}
        </div>
        
        <div class="product-list-item__actions">
          <UButton
            v-if="showEditButton"
            icon="heroicons:pencil"
            size="sm"
            variant="ghost"
            @click.prevent.stop="goToEdit"
            aria-label="Редактировать"
          />
          <UButton
            v-if="showDeleteButton"
            icon="heroicons:trash"
            size="sm"
            variant="ghost"
            color="red"
            @click.stop="handleDelete"
            aria-label="Удалить"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/types';

interface Props {
  product: Product;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

interface Emits {
  (e: 'edit', product: Product): void;
  (e: 'delete', product: Product): void;
}

const props = withDefaults(defineProps<Props>(), {
  showEditButton: false,
  showDeleteButton: false,
});

const emit = defineEmits<Emits>();
const router = useRouter();

// Formatted price
const formattedPrice = computed(() => {
  if (!props.product.price) return 'Цена не указана';
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(props.product.price);
});

// Actions
const goToDetails = () => {
  router.push(`/products/${props.product.id}`);
};

  const goToEdit = (event?: Event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Переход к редактированию товара:', props.product.id);
    router.push(`/products/${props.product.id}-edit`);
  };

const handleDelete = () => {
  emit('delete', props.product);
};
</script>

<style lang="scss" scoped>
.product-list-item__image--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-gray-400;
  background-color: $color-gray-100;
}
</style>
