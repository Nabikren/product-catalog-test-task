#!/bin/bash

# Скрипт для запуска проекта в режиме разработки

echo "🚀 Запуск каталога продуктов..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не найден. Пожалуйста, установите Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не найден. Пожалуйста, установите Docker Compose."
    exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Пожалуйста, установите Node.js версии 18 или выше."
    exit 1
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден. Пожалуйста, установите npm."
    exit 1
fi

echo "✅ Все зависимости найдены"

# Запуск базы данных
echo "🐘 Запуск PostgreSQL..."
docker-compose up -d

# Ожидание запуска БД
echo "⏳ Ожидание запуска базы данных..."
sleep 10

# Установка зависимостей
echo "📦 Установка зависимостей..."

# Root dependencies
npm install

# Backend dependencies
cd backend
echo "🔧 Установка зависимостей backend..."
npm install
cd ..

# Frontend dependencies
cd frontend
echo "🎨 Установка зависимостей frontend..."
npm install
cd ..

# Создание .env файлов
echo "⚙️ Настройка конфигурации..."

# Backend .env
if [ ! -f "backend/.env.local" ]; then
    cp backend/.env.example backend/.env.local
    echo "✅ Создан backend/.env.local"
fi

echo "🎉 Настройка завершена!"
echo ""
echo "Для запуска используйте:"
echo "  npm run dev              - запуск всех сервисов"
echo "  npm run dev:backend      - только backend"
echo "  npm run dev:frontend     - только frontend"
echo ""
echo "Приложение будет доступно по адресам:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Database: localhost:5432"
