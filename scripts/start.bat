@echo off
chcp 65001 > nul

echo 🚀 Запуск каталога продуктов...

:: Проверка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден. Пожалуйста, установите Node.js версии 18 или выше.
    pause
    exit /b 1
)

:: Проверка npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm не найден. Пожалуйста, установите npm.
    pause
    exit /b 1
)

:: Проверка Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker не найден. Пожалуйста, установите Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Все зависимости найдены

:: Запуск базы данных
echo 🐘 Запуск PostgreSQL...
docker-compose up -d

:: Ожидание запуска БД
echo ⏳ Ожидание запуска базы данных...
timeout /t 10 /nobreak >nul

:: Установка зависимостей
echo 📦 Установка зависимостей...

:: Root dependencies
call npm install

:: Backend dependencies
cd backend
echo 🔧 Установка зависимостей backend...
call npm install
cd ..

:: Frontend dependencies
cd frontend
echo 🎨 Установка зависимостей frontend...
call npm install
cd ..

:: Создание .env файлов
echo ⚙️ Настройка конфигурации...

:: Backend .env
if not exist "backend\.env.local" (
    copy "backend\.env.example" "backend\.env.local" >nul
    echo ✅ Создан backend/.env.local
)

echo 🎉 Настройка завершена!
echo.
echo Для запуска используйте:
echo   npm run dev              - запуск всех сервисов
echo   npm run dev:backend      - только backend
echo   npm run dev:frontend     - только frontend
echo.
echo Приложение будет доступно по адресам:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   Database: localhost:5432
echo.
pause
