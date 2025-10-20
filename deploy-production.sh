#!/bin/bash

# Beresta Production Deployment Script
# Скрипт для деплоя на production сервер

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
print_message() {
    echo -e "${BLUE}[Beresta Deploy]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Beresta Deploy]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Beresta Deploy]${NC} $1"
}

print_error() {
    echo -e "${RED}[Beresta Deploy]${NC} $1"
}

# Проверка наличия Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен. Установите Docker и попробуйте снова."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
        exit 1
    fi
}

# Создание .env файла для production
create_prod_env() {
    if [ ! -f .env.prod ]; then
        print_message "Создание .env.prod файла..."
        cat > .env.prod << EOF
# Beresta Production Configuration
NODE_ENV=production
PORT=3000
API_PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://beresta.one

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/beresta.crt
SSL_KEY_PATH=/etc/nginx/ssl/beresta.key

# Security
SESSION_SECRET=your-production-secret-key-here
API_KEY=your-production-api-key-here

# Logging
LOG_LEVEL=info
LOG_TIMEZONE=Europe/Saratov
EOF
        print_success ".env.prod файл создан"
    fi
}

# Создание SSL директории
create_ssl_dir() {
    if [ ! -d ssl ]; then
        print_message "Создание директории для SSL сертификатов..."
        mkdir -p ssl
        print_warning "Поместите ваши SSL сертификаты в папку ssl/"
        print_warning "Файлы: beresta.crt и beresta.key"
    fi
}

# Сборка production образа
build_production() {
    print_message "Сборка production образа..."
    docker-compose build --no-cache beresta-app
    print_success "Production образ собран"
}

# Запуск production
start_production() {
    print_message "Запуск production версии..."
    docker-compose up -d beresta-app
    print_success "Production версия запущена!"
    print_message "HTTP: http://beresta.one"
    print_message "HTTPS: https://beresta.one"
    print_message "API: https://beresta.one/app/api"
}

# Остановка production
stop_production() {
    print_message "Остановка production версии..."
    docker-compose down
    print_success "Production версия остановлена"
}

# Просмотр логов
show_logs() {
    print_message "Показ логов production..."
    docker-compose logs -f beresta-app
}

# Проверка статуса
status() {
    print_message "Статус production контейнеров:"
    docker-compose ps
}

# Обновление production
update_production() {
    print_message "Обновление production версии..."
    docker-compose down
    docker-compose build --no-cache beresta-app
    docker-compose up -d beresta-app
    print_success "Production версия обновлена"
}

# Функция для показа помощи
show_help() {
    echo "Beresta Production Deployment Script"
    echo ""
    echo "Использование: $0 [команда]"
    echo ""
    echo "Команды:"
    echo "  build         Сборка production образа"
    echo "  start         Запуск production версии"
    echo "  stop          Остановка production версии"
    echo "  restart       Перезапуск production версии"
    echo "  update        Обновление production версии"
    echo "  logs          Показ логов production"
    echo "  status        Показ статуса контейнеров"
    echo "  setup         Первоначальная настройка"
    echo "  help          Показ этой справки"
    echo ""
    echo "Примеры:"
    echo "  $0 setup          # Первоначальная настройка"
    echo "  $0 build          # Сборка образа"
    echo "  $0 start          # Запуск production"
    echo "  $0 update         # Обновление"
}

# Первоначальная настройка
setup() {
    print_message "Первоначальная настройка production..."
    check_docker
    create_prod_env
    create_ssl_dir
    print_success "Настройка завершена"
    print_warning "Не забудьте:"
    print_warning "1. Поместить SSL сертификаты в папку ssl/"
    print_warning "2. Настроить DNS для beresta.one"
    print_warning "3. Запустить: $0 build && $0 start"
}

# Основная логика
main() {
    case "${1:-help}" in
        "build")
            check_docker
            build_production
            ;;
        "start")
            check_docker
            start_production
            ;;
        "stop")
            check_docker
            stop_production
            ;;
        "restart")
            check_docker
            stop_production
            start_production
            ;;
        "update")
            check_docker
            update_production
            ;;
        "logs")
            show_logs
            ;;
        "status")
            status
            ;;
        "setup")
            setup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Неизвестная команда: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Запуск основной функции
main "$@"
