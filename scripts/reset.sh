#!/bin/bash

# Скрипт для сброса проекта (очистка данных)

echo "🔄 Сброс каталога продуктов..."

# Остановка сервисов
./scripts/stop.sh

# Удаление Docker volumes (данные БД)
echo "🗑️ Очистка данных базы..."
docker-compose down -v
docker volume prune -f

# Очистка node_modules
echo "🧹 Очистка зависимостей..."
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules

# Очистка билдов
echo "📦 Очистка билдов..."
rm -rf backend/.next
rm -rf frontend/.nuxt
rm -rf frontend/.output

# Очистка логов
rm -rf *.log
rm -rf backend/*.log
rm -rf frontend/*.log

echo "✅ Проект сброшен"
echo "Для повторной настройки запустите: ./scripts/start.sh"
