# Мини-каталог продуктов

Тестовое задание: приложение для импорта продуктов из Excel и управления каталогом.

## Технологический стек

- **Backend:** NextJS + TypeORM + PostgreSQL
- **Frontend:** Nuxt 3 + TypeScript + NuxtUI + BEM + SCSS

## Структура проекта

```
├── backend/     # NextJS API
├── frontend/    # Nuxt 3 приложение
└── docker-compose.yml  # PostgreSQL
```

## Запуск проекта

1. Запустить базу данных:
```bash
docker-compose up -d
```

2. Установить зависимости:
```bash
npm install
```

3. Запустить в режиме разработки:
```bash
npm run dev
```

## Порты

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

## Функционал

- ✅ Импорт продуктов из Excel/CSV/Google Sheets
- ✅ CRUD операции с продуктами
- ✅ Просмотр списка продуктов
- ✅ Детальная страница продукта
- ✅ Валидация данных
- ✅ Поиск и фильтрация
