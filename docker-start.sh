#!/bin/bash

# Beresta Docker Management Script
# Упрощенный запуск и управление Docker контейнерами

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
print_message() {
    echo -e "${BLUE}[Beresta Docker]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Beresta Docker]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Beresta Docker]${NC} $1"
}

print_error() {
    echo -e "${RED}[Beresta Docker]${NC} $1"
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

# Создание .env файла если его нет
create_env() {
    if [ ! -f .env ]; then
        print_message "Создание .env файла из env.example..."
        cp env.example .env
        print_success ".env файл создан"
    fi
}

# Функция для запуска production версии
start_production() {
    print_message "Запуск production версии..."
    create_env
    docker-compose up -d beresta-app
    print_success "Production версия запущена!"
    print_message "Frontend: http://localhost:8100"
    print_message "API: http://localhost:3000"
}

# Функция для запуска development версии
start_development() {
    print_message "Запуск development версии..."
    create_env
    docker-compose --profile dev up -d beresta-dev
    print_success "Development версия запущена!"
    print_message "Frontend: http://localhost:8101"
    print_message "API: http://localhost:3001"
}

# Функция для остановки контейнеров
stop_containers() {
    print_message "Остановка всех контейнеров..."
    docker-compose down
    print_success "Все контейнеры остановлены"
}

# Функция для пересборки образов
rebuild() {
    print_message "Пересборка Docker образов..."
    docker-compose build --no-cache
    print_success "Образы пересобраны"
}

# Функция для просмотра логов
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        print_message "Показ логов для сервиса: $service"
        docker-compose logs -f "$service"
    else
        print_message "Показ логов всех сервисов..."
        docker-compose logs -f
    fi
}

# Функция для очистки
cleanup() {
    print_message "Очистка Docker ресурсов..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Очистка завершена"
}

# Функция для проверки статуса
status() {
    print_message "Статус контейнеров:"
    docker-compose ps
}

# Функция для входа в контейнер
shell() {
    local service=${1:-"beresta.one"}
    print_message "Вход в контейнер: $service"
    docker-compose exec "$service" sh
}

# Функция для показа помощи
show_help() {
    echo "Beresta Docker Management Script"
    echo ""
    echo "Использование: $0 [команда] [опции]"
    echo ""
    echo "Команды:"
    echo "  start-prod     Запуск production версии"
    echo "  start-dev      Запуск development версии"
    echo "  stop           Остановка всех контейнеров"
    echo "  restart        Перезапуск контейнеров"
    echo "  rebuild        Пересборка образов"
    echo "  logs [service] Показ логов (опционально указать сервис)"
    echo "  status         Показ статуса контейнеров"
    echo "  shell [service] Вход в контейнер (по умолчанию beresta.one)"
    echo "  cleanup        Очистка Docker ресурсов"
    echo "  help           Показ этой справки"
    echo ""
    echo "Примеры:"
    echo "  $0 start-prod          # Запуск production"
    echo "  $0 start-dev           # Запуск development"
    echo "  $0 logs beresta-app    # Логи production"
    echo "  $0 shell beresta.one   # Вход в dev контейнер"
}

# Основная логика
main() {
    check_docker

    case "${1:-help}" in
        "start-prod"|"prod")
            start_production
            ;;
        "start-dev"|"dev")
            start_development
            ;;
        "stop")
            stop_containers
            ;;
        "restart")
            stop_containers
            start_production
            ;;
        "rebuild")
            rebuild
            ;;
        "logs")
            show_logs "$2"
            ;;
        "status")
            status
            ;;
        "shell")
            shell "$2"
            ;;
        "cleanup")
            cleanup
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
