<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Мета-теги для приложения
useHead({
  title: 'Каталог продуктов',
  meta: [
    { name: 'description', content: 'Мини-каталог продуктов с импортом из Excel' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// Глобальные стили
useSeoMeta({
  title: 'Каталог продуктов',
  ogTitle: 'Каталог продуктов',
  description: 'Мини-каталог продуктов с импортом из Excel',
  ogDescription: 'Мини-каталог продуктов с импортом из Excel',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;
    padding: 0;
  }
}
</style>
