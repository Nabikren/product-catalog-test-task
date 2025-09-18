<template>
  <div class="home">
    <section class="home__hero">
      <div class="container">
        <h1 class="home__hero-title">
          Каталог продуктов
        </h1>
        <p class="home__hero-subtitle">
          Простое и удобное решение для управления товарами 
          с возможностью импорта из Excel таблиц
        </p>
        <div class="home__hero-actions">
          <UButton
            to="/products"
            size="lg"
            icon="heroicons:view-columns"
          >
            Просмотреть продукты
          </UButton>
          <UButton
            to="/import"
            size="lg"
            variant="solid"
            icon="heroicons:arrow-up-tray"
            class="btn-white"
          >
            Импортировать данные
          </UButton>
        </div>
      </div>
    </section>
    
    <section class="home__features">
      <div class="container">
        <div class="home__features-grid">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="home__feature"
          >
            <div class="home__feature-icon">
              <Icon :name="feature.icon" />
            </div>
            <h3 class="home__feature-title">
              {{ feature.title }}
            </h3>
            <p class="home__feature-description">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <section v-if="stats" class="home__stats">
      <div class="container">
        <div class="home__stats-grid">
          <div 
            v-for="stat in stats" 
            :key="stat.label"
            class="home__stat"
          >
            <div class="home__stat-value">
              {{ stat.value }}
            </div>
            <div class="home__stat-label">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="home__cta">
      <div class="container">
        <h2 class="home__cta-title">
          Готовы начать?
        </h2>
        <p class="home__cta-description">
          Импортируйте свои данные и начните управлять каталогом уже сегодня
        </p>
        <UButton
          to="/import"
          size="xl"
          color="white"
          variant="solid"
          icon="heroicons:rocket-launch"
        >
          Начать импорт
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// SEO Meta
definePageMeta({
  title: 'Главная',
  description: 'Мини-каталог продуктов с импортом из Excel таблиц',
});

useSeoMeta({
  title: 'Каталог продуктов - Главная',
  ogTitle: 'Каталог продуктов',
  description: 'Простое и удобное решение для управления товарами с возможностью импорта из Excel таблиц',
  ogDescription: 'Простое и удобное решение для управления товарами с возможностью импорта из Excel таблиц',
});

// Features data
const features = [
  {
    icon: 'heroicons:arrow-up-tray',
    title: 'Импорт из Excel',
    description: 'Загружайте данные из Excel файлов, CSV или Google Sheets одним кликом',
  },
  {
    icon: 'heroicons:view-columns',
    title: 'Управление каталогом',
    description: 'Просматривайте, редактируйте и управляйте своими продуктами в удобном интерфейсе',
  },
  {
    icon: 'heroicons:magnifying-glass',
    title: 'Поиск и фильтры',
    description: 'Быстро находите нужные товары с помощью поиска и гибких фильтров',
  },
  {
    icon: 'heroicons:chart-bar',
    title: 'Валидация данных',
    description: 'Автоматическая проверка и валидация импортируемых данных',
  },
  {
    icon: 'heroicons:device-phone-mobile',
    title: 'Адаптивный дизайн',
    description: 'Работайте с каталогом на любых устройствах - от телефона до компьютера',
  },
  {
    icon: 'heroicons:shield-check',
    title: 'Надежность',
    description: 'Современные технологии обеспечивают стабильную работу приложения',
  },
];

// Stats (будут загружаться из API)
const stats = ref<Array<{ label: string; value: string }> | null>(null);

// Load stats on mount
onMounted(async () => {
  try {
    // Здесь можно загрузить статистику из API
    // const api = useApi();
    // const data = await api.getStats();
    
    // Mock data for now
    stats.value = [
      { label: 'Продуктов', value: '1,234' },
      { label: 'Категорий', value: '56' },
      { label: 'Брендов', value: '89' },
      { label: 'Импортов', value: '123' },
    ];
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
});
</script>
