<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__content">
        <div class="footer__section">
          <h3 class="footer__title">Каталог продуктов</h3>
          <p class="footer__text">
            Мини-каталог продуктов с импортом из Excel. 
            Простое и удобное решение для управления товарами.
          </p>
        </div>
        
        <div class="footer__section">
          <h3 class="footer__title">Навигация</h3>
          <nav>
            <NuxtLink to="/" class="footer__link">Главная</NuxtLink>
            <NuxtLink to="/products" class="footer__link">Продукты</NuxtLink>
            <NuxtLink to="/import" class="footer__link">Импорт</NuxtLink>
          </nav>
        </div>
        
        <div class="footer__section">
          <h3 class="footer__title">Технологии</h3>
          <div class="footer__text">
            <p>Frontend: Nuxt 3, TypeScript, BEM + SCSS</p>
            <p>Backend: NextJS, TypeORM, PostgreSQL</p>
          </div>
        </div>
      </div>
      
      <div class="footer__bottom">
        <div class="footer__copyright">
          © {{ currentYear }} Каталог продуктов. Тестовое задание.
        </div>
        
        <div class="footer__social">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer__social-link"
            aria-label="GitHub"
          >
            <Icon name="mdi:github" />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer__social-link"
            aria-label="LinkedIn"
          >
            <Icon name="mdi:linkedin" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>
