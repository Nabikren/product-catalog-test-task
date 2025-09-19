# Руководство по развертыванию

## Быстрый старт

### Предварительные требования
- Node.js 18+
- npm или yarn
- Docker и Docker Compose
- Git

### Установка и запуск

1. **Клонирование и настройка:**
```bash
# Установка зависимостей и настройка
./scripts/start.sh

# Или вручную:
npm install
docker-compose up -d
```

2. **Запуск в режиме разработки:**
```bash
npm run dev
```

3. **Доступ к приложению:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger документация: http://localhost:3001/api/docs
- База данных: localhost:5432

## Структура проекта

```
product-catalog/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── entities/    # TypeORM сущности
│   │   ├── products/    # Модуль продуктов
│   │   ├── import/      # Модуль импорта
│   │   ├── database/    # Конфигурация БД
│   │   └── main.ts      # Точка входа
│   └── package.json
├── frontend/            # Nuxt 3 приложение
│   ├── pages/          # Страницы
│   ├── components/     # Vue компоненты
│   ├── composables/    # Composables
│   ├── assets/scss/    # SCSS стили (BEM)
│   └── package.json
├── scripts/            # Скрипты для управления
└── docker-compose.yml  # PostgreSQL
```

## API Endpoints

### Продукты
- `GET /api/products` - список продуктов (с фильтрами и пагинацией)
- `GET /api/products/:id` - получить продукт
- `POST /api/products` - создать продукт
- `PUT /api/products/:id` - обновить продукт
- `DELETE /api/products/:id` - удалить продукт
- `GET /api/products/filters` - получить доступные фильтры

### Импорт
- `POST /api/import` - импорт из файла или Google Sheets

## Переменные окружения

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=product_catalog
PORT=3001
```

### Frontend
```env
API_BASE_URL=http://localhost:3001/api
```

## Технологический стек

### Backend
- **NestJS** - Node.js фреймворк с модульной архитектурой
- **TypeORM** - ORM для работы с БД
- **PostgreSQL** - основная база данных
- **TypeScript** - типизация
- **class-validator** - валидация данных
- **Swagger** - автоматическая документация API

### Frontend
- **Nuxt 3** - Vue.js фреймворк
- **TypeScript** - типизация
- **NuxtUI** - UI компоненты
- **SCSS + BEM** - стилизация
- **Vite** - сборщик (встроен в Nuxt 3)

## Функционал

### ✅ Реализовано
- Импорт продуктов из Excel/CSV файлов
- Импорт из Google Sheets
- CRUD операции с продуктами
- Страница списка продуктов с фильтрацией
- Страница деталей продукта
- Валидация данных при импорте
- Поиск и фильтрация по различным полям
- Адаптивная верстка
- Обработка ошибок
- Пагинация

### 🎯 Дополнительные возможности
- Редактирование продуктов
- Удаление продуктов
- Режимы просмотра (сетка/список)
- Сортировка по различным полям
- Валидация загружаемых файлов
- Отображение ошибок импорта
- Статистика импорта

## Развертывание в продакшене

### Docker
```bash
# Сборка для продакшена
npm run build

# Запуск в Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Переменные для продакшена
- Установите безопасные пароли для БД
- Настройте CORS для API
- Используйте HTTPS
- Настройте backup базы данных

## Команды разработчика

```bash
# Запуск всех сервисов
npm run dev

# Только backend
npm run dev:backend

# Только frontend  
npm run dev:frontend

# Сборка для продакшена
npm run build

# Очистка проекта
./scripts/reset.sh

# Остановка сервисов
./scripts/stop.sh
```

## Тестирование

### Тестовые данные
Используйте тестовую Google Sheets таблицу:
- ID: `1JSxXiuWX9dJEeUKGYUY4EsQ5wJln7acNr7UEpA20Ys0`
- URL: https://docs.google.com/spreadsheets/d/1JSxXiuWX9dJEeUKGYUY4EsQ5wJln7acNr7UEpA20Ys0/edit

### Форматы данных
Поддерживаемые поля в Excel/CSV:
- name (обязательно) - название продукта
- brand - бренд/производитель
- description - описание
- price - цена (число)
- category - категория
- sku - артикул
- quantity - количество (число)
- imageUrl - ссылка на изображение
- status - статус

## Troubleshooting

### База данных не запускается
```bash
docker-compose down -v
docker-compose up -d
```

### Порты заняты
Измените порты в docker-compose.yml или остановите конфликтующие сервисы

### Ошибки импорта
- Проверьте формат файла (xlsx, xls, csv)
- Убедитесь что есть заголовки в первой строке
- Проверьте права доступа к Google Sheets

### Проблемы с зависимостями
```bash
./scripts/reset.sh
./scripts/start.sh
```
