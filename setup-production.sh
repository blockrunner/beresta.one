#!/bin/bash

# Beresta Production Server Setup Script
# Скрипт для первоначальной настройки production сервера

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${BLUE}[Beresta Setup]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Beresta Setup]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Beresta Setup]${NC} $1"
}

print_error() {
    echo -e "${RED}[Beresta Setup]${NC} $1"
}

# Проверка что скрипт запущен на сервере
check_server() {
    if [ -z "$SSH_CLIENT" ] && [ -z "$SSH_TTY" ]; then
        print_warning "Этот скрипт предназначен для запуска на production сервере"
        print_warning "Запустите его через SSH на вашем сервере"
    fi
}

# Установка Docker
install_docker() {
    print_message "Установка Docker..."
    
    # Обновление пакетов
    sudo apt update
    
    # Установка зависимостей
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Добавление Docker GPG ключа
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Добавление Docker репозитория
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Установка Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Добавление пользователя в группу docker
    sudo usermod -aG docker $USER
    
    print_success "Docker установлен"
    print_warning "Перезайдите в систему для применения изменений группы docker"
}

# Установка Git
install_git() {
    print_message "Установка Git..."
    sudo apt install -y git
    print_success "Git установлен"
}

# Создание директорий
create_directories() {
    print_message "Создание директорий..."
    
    # Создание основной директории
    sudo mkdir -p /var/www/beresta
    sudo chown $USER:$USER /var/www/beresta
    
    # Создание директорий для данных
    mkdir -p /var/www/beresta/app/data
    mkdir -p /var/www/beresta/logs
    mkdir -p /var/www/beresta/ssl
    
    print_success "Директории созданы"
}

# Настройка SSL
setup_ssl() {
    print_message "Настройка SSL..."
    
    if [ ! -f /var/www/beresta/ssl/beresta.crt ] || [ ! -f /var/www/beresta/ssl/beresta.key ]; then
        print_warning "SSL сертификаты не найдены"
        print_warning "Поместите ваши SSL сертификаты в /var/www/beresta/ssl/"
        print_warning "Файлы: beresta.crt и beresta.key"
        
        # Создание самоподписанного сертификата для тестирования
        print_message "Создание самоподписанного сертификата для тестирования..."
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /var/www/beresta/ssl/beresta.key \
            -out /var/www/beresta/ssl/beresta.crt \
            -subj "/C=RU/ST=Saratov/L=Saratov/O=Beresta/CN=beresta.one"
        
        sudo chown $USER:$USER /var/www/beresta/ssl/*
        print_success "Самоподписанный сертификат создан"
    else
        print_success "SSL сертификаты найдены"
    fi
}

# Клонирование репозитория
clone_repository() {
    print_message "Клонирование репозитория..."
    
    cd /var/www/beresta
    
    if [ ! -d ".git" ]; then
        print_message "Введите URL вашего GitHub репозитория:"
        read -p "Repository URL: " REPO_URL
        
        git clone $REPO_URL .
        print_success "Репозиторий клонирован"
    else
        print_success "Репозиторий уже существует"
    fi
}

# Настройка GitHub Actions secrets
setup_github_secrets() {
    print_message "Настройка GitHub Actions secrets..."
    
    print_warning "Для автоматического деплоя нужно настроить следующие secrets в GitHub:"
    echo ""
    echo "PRODUCTION_HOST - IP адрес вашего сервера"
    echo "PRODUCTION_USER - имя пользователя для SSH"
    echo "PRODUCTION_SSH_KEY - приватный SSH ключ"
    echo "PRODUCTION_PORT - порт SSH (обычно 22)"
    echo ""
    print_message "Перейдите в Settings > Secrets and variables > Actions в вашем GitHub репозитории"
    print_message "Добавьте эти secrets для автоматического деплоя"
}

# Создание SSH ключа для GitHub Actions
create_ssh_key() {
    print_message "Создание SSH ключа для GitHub Actions..."
    
    if [ ! -f ~/.ssh/id_rsa ]; then
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        print_success "SSH ключ создан"
        
        print_warning "Добавьте публичный ключ в ~/.ssh/authorized_keys:"
        cat ~/.ssh/id_rsa.pub
        echo ""
        
        print_warning "И добавьте приватный ключ в GitHub Secrets как PRODUCTION_SSH_KEY:"
        cat ~/.ssh/id_rsa
    else
        print_success "SSH ключ уже существует"
    fi
}

# Первый деплой
first_deploy() {
    print_message "Первый деплой..."
    
    cd /var/www/beresta
    
    # Копирование production docker-compose
    cp docker-compose.prod.yml docker-compose.yml
    
    # Сборка и запуск
    docker-compose build --no-cache beresta-app
    docker-compose up -d beresta-app
    
    print_success "Первый деплой завершен"
    print_message "Сайт доступен по адресу: https://beresta.one"
}

# Основная функция
main() {
    print_message "Настройка Beresta Production Server"
    echo ""
    
    check_server
    
    # Установка зависимостей
    install_docker
    install_git
    
    # Настройка окружения
    create_directories
    setup_ssl
    clone_repository
    create_ssh_key
    
    # Первый деплой
    first_deploy
    
    # Инструкции
    setup_github_secrets
    
    print_success "Настройка завершена!"
    echo ""
    print_message "Следующие шаги:"
    echo "1. Настройте DNS для beresta.one на IP этого сервера"
    echo "2. Добавьте SSL сертификаты в /var/www/beresta/ssl/"
    echo "3. Настройте GitHub Secrets для автоматического деплоя"
    echo "4. При следующем пуше в main ветку произойдет автоматический деплой"
}

# Запуск
main "$@"
