<template>
  <header class="header">
    <div class="header__container">
      <NuxtLink to="/" class="header__logo">
        📦 Каталог продуктов
      </NuxtLink>
      
      <nav class="header__nav">
        <NuxtLink 
          v-for="item in navigation" 
          :key="item.to"
          :to="item.to" 
          class="header__nav-link"
          :class="{ 'header__nav-link--active': item.active }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
      
      <button 
        class="header__mobile-menu-button"
        @click="toggleMobileMenu"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Открыть меню"
      >
        <Icon :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" />
      </button>
    </div>
    
    <Transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="header__mobile-menu">
        <nav class="header__mobile-nav">
          <NuxtLink 
            v-for="item in navigation" 
            :key="item.to"
            :to="item.to" 
            class="header__mobile-nav-link"
            :class="{ 'header__nav-link--active': item.active }"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import type { NavItem } from '~/types';

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Navigation items
const route = useRoute();
const navigation = computed<NavItem[]>(() => [
  {
    label: 'Главная',
    to: '/',
    active: route.path === '/',
  },
  {
    label: 'Продукты',
    to: '/products',
    active: route.path.startsWith('/products'),
  },
  {
    label: 'Импорт',
    to: '/import',
    active: route.path === '/import',
  },
]);

// Mobile menu methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Close mobile menu when route changes
watch(() => route.path, () => {
  closeMobileMenu();
});

// Close mobile menu on outside click
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element;
    if (!target.closest('.header')) {
      closeMobileMenu();
    }
  };

  document.addEventListener('click', handleClickOutside);
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});
</script>

<style lang="scss" scoped>
// Mobile menu animations
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
