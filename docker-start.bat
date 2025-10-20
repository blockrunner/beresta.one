@echo off
REM Beresta Docker Management Script for Windows
REM Упрощенный запуск и управление Docker контейнерами

setlocal enabledelayedexpansion

REM Цвета для вывода (Windows)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Функция для вывода сообщений
:print_message
echo %BLUE%[Beresta Docker]%NC% %~1
goto :eof

:print_success
echo %GREEN%[Beresta Docker]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[Beresta Docker]%NC% %~1
goto :eof

:print_error
echo %RED%[Beresta Docker]%NC% %~1
goto :eof

REM Проверка наличия Docker
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker не установлен. Установите Docker Desktop и попробуйте снова."
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose не установлен. Установите Docker Desktop и попробуйте снова."
    exit /b 1
)
goto :eof

REM Создание .env файла если его нет
:create_env
if not exist .env (
    call :print_message "Создание .env файла из env.example..."
    copy env.example .env >nul
    call :print_success ".env файл создан"
)
goto :eof

REM Функция для запуска production версии
:start_production
call :print_message "Запуск production версии..."
call :create_env
docker-compose up -d beresta-app
if errorlevel 1 (
    call :print_error "Ошибка при запуске production версии"
    exit /b 1
)
call :print_success "Production версия запущена!"
call :print_message "Frontend: http://localhost:8100"
call :print_message "API: http://localhost:3000"
goto :eof

REM Функция для запуска development версии
:start_development
call :print_message "Запуск development версии..."
call :create_env
docker-compose --profile dev up -d beresta-dev
if errorlevel 1 (
    call :print_error "Ошибка при запуске development версии"
    exit /b 1
)
call :print_success "Development версия запущена!"
call :print_message "Frontend: http://localhost:8101"
call :print_message "API: http://localhost:3001"
goto :eof

REM Функция для остановки контейнеров
:stop_containers
call :print_message "Остановка всех контейнеров..."
docker-compose down
call :print_success "Все контейнеры остановлены"
goto :eof

REM Функция для пересборки образов
:rebuild
call :print_message "Пересборка Docker образов..."
docker-compose build --no-cache
call :print_success "Образы пересобраны"
goto :eof

REM Функция для просмотра логов
:show_logs
set "service=%~1"
if "%service%"=="" (
    call :print_message "Показ логов всех сервисов..."
    docker-compose logs -f
) else (
    call :print_message "Показ логов для сервиса: %service%"
    docker-compose logs -f %service%
)
goto :eof

REM Функция для очистки
:cleanup
call :print_message "Очистка Docker ресурсов..."
docker-compose down -v --remove-orphans
docker system prune -f
call :print_success "Очистка завершена"
goto :eof

REM Функция для проверки статуса
:status
call :print_message "Статус контейнеров:"
docker-compose ps
goto :eof

REM Функция для входа в контейнер
:shell
set "service=%~1"
if "%service%"=="" set "service=beresta.one"
call :print_message "Вход в контейнер: %service%"
docker-compose exec %service% sh
goto :eof

REM Функция для показа помощи
:show_help
echo Beresta Docker Management Script
echo.
echo Использование: %~nx0 [команда] [опции]
echo.
echo Команды:
echo   start-prod     Запуск production версии
echo   start-dev      Запуск development версии
echo   stop           Остановка всех контейнеров
echo   restart        Перезапуск контейнеров
echo   rebuild        Пересборка образов
echo   logs [service] Показ логов (опционально указать сервис)
echo   status         Показ статуса контейнеров
echo   shell [service] Вход в контейнер (по умолчанию beresta.one)
echo   cleanup        Очистка Docker ресурсов
echo   help           Показ этой справки
echo.
echo Примеры:
echo   %~nx0 start-prod          # Запуск production
echo   %~nx0 start-dev           # Запуск development
echo   %~nx0 logs beresta-app    # Логи production
echo   %~nx0 shell beresta.one   # Вход в dev контейнер
goto :eof

REM Основная логика
:main
call :check_docker
if errorlevel 1 exit /b 1

set "command=%~1"
if "%command%"=="" set "command=help"

if "%command%"=="start-prod" goto :start_production
if "%command%"=="prod" goto :start_production
if "%command%"=="start-dev" goto :start_development
if "%command%"=="dev" goto :start_development
if "%command%"=="stop" goto :stop_containers
if "%command%"=="restart" (
    call :stop_containers
    call :start_production
    goto :eof
)
if "%command%"=="rebuild" goto :rebuild
if "%command%"=="logs" goto :show_logs
if "%command%"=="status" goto :status
if "%command%"=="shell" goto :shell
if "%command%"=="cleanup" goto :cleanup
if "%command%"=="help" goto :show_help
if "%command%"=="-h" goto :show_help
if "%command%"=="--help" goto :show_help

call :print_error "Неизвестная команда: %command%"
echo.
call :show_help
exit /b 1

REM Запуск основной функции
call :main %*
