#!/bin/bash

# Скрипт для остановки проекта

echo "🛑 Остановка каталога продуктов..."

# Остановка Docker контейнеров
echo "🐘 Остановка PostgreSQL..."
docker-compose down

# Убиваем процессы Node.js
echo "🔌 Остановка Node.js процессов..."
pkill -f "next dev"
pkill -f "nuxt dev"

echo "✅ Все сервисы остановлены"
