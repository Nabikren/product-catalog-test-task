@echo off
chcp 65001 > nul

echo 🛑 Остановка каталога продуктов...

:: Остановка Docker контейнеров
echo 🐘 Остановка PostgreSQL...
docker-compose down

:: Убиваем процессы Node.js
echo 🔌 Остановка Node.js процессов...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul

echo ✅ Все сервисы остановлены
pause
