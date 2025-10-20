#!/bin/bash

# Beresta Server Setup Script
# Запустите этот скрипт на вашем production сервере

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
check_environment() {
    print_message "Проверка окружения..."
    
    # Проверка Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        print_error "Этот скрипт предназначен для Ubuntu/Debian"
        exit 1
    fi
    
    # Проверка sudo прав
    if ! sudo -n true 2>/dev/null; then
        print_error "Требуются sudo права"
        exit 1
    fi
    
    print_success "Окружение проверено"
}

# Обновление системы
update_system() {
    print_message "Обновление системы..."
    sudo apt update && sudo apt upgrade -y
    print_success "Система обновлена"
}

# Установка Docker
install_docker() {
    print_message "Установка Docker..."
    
    # Удаление старых версий
    sudo apt remove -y docker docker-engine docker.io containerd runc || true
    
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
}

# Установка Git и OpenSSL
install_dependencies() {
    print_message "Установка зависимостей..."
    sudo apt install -y git openssl ufw
    print_success "Зависимости установлены"
}

# Создание SSH ключа
create_ssh_key() {
    print_message "Создание SSH ключа..."
    
    if [ ! -f ~/.ssh/id_rsa ]; then
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        print_success "SSH ключ создан"
    else
        print_success "SSH ключ уже существует"
    fi
    
    # Добавление публичного ключа в authorized_keys
    if [ ! -f ~/.ssh/authorized_keys ]; then
        touch ~/.ssh/authorized_keys
        chmod 600 ~/.ssh/authorized_keys
    fi
    
    if ! grep -q "$(cat ~/.ssh/id_rsa.pub)" ~/.ssh/authorized_keys; then
        cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
        print_success "Публичный ключ добавлен в authorized_keys"
    fi
}

# Настройка sudo для Docker
setup_sudo() {
    print_message "Настройка sudo для Docker..."
    
    echo "$USER ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/local/bin/docker-compose" | sudo tee /etc/sudoers.d/docker-user
    sudo chmod 440 /etc/sudoers.d/docker-user
    
    print_success "Sudo настроен для Docker"
}

# Создание директорий
create_directories() {
    print_message "Создание директорий..."
    
    sudo mkdir -p /var/www/beresta
    sudo chown $USER:$USER /var/www/beresta
    
    mkdir -p /var/www/beresta/app/data
    mkdir -p /var/www/beresta/logs
    mkdir -p /var/www/beresta/ssl
    
    print_success "Директории созданы"
}

# Настройка firewall
setup_firewall() {
    print_message "Настройка firewall..."
    
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "Firewall настроен"
}

# Получение IP адреса
get_server_ip() {
    print_message "Получение IP адреса сервера..."
    
    # Попытка получить внешний IP
    EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "не удалось определить")
    
    print_success "IP адреса:"
    echo "  Внешний IP: $EXTERNAL_IP"
    echo "  Локальный IP: $(hostname -I | awk '{print $1}')"
}

# Вывод информации для GitHub Secrets
show_github_secrets() {
    print_message "Информация для GitHub Secrets:"
    echo ""
    print_warning "Добавьте эти значения в GitHub Secrets:"
    echo ""
    echo "PRODUCTION_HOST: $EXTERNAL_IP"
    echo "PRODUCTION_USER: $USER"
    echo "PRODUCTION_PORT: 22"
    echo ""
    print_warning "PRODUCTION_SSH_KEY (приватный ключ):"
    echo "---"
    cat ~/.ssh/id_rsa
    echo "---"
    echo ""
    print_warning "Перейдите в GitHub: Settings > Secrets and variables > Actions"
    print_warning "Добавьте эти secrets для автоматического деплоя"
}

# Основная функция
main() {
    print_message "🚀 Настройка Beresta Production Server"
    echo ""
    
    check_environment
    update_system
    install_docker
    install_dependencies
    create_ssh_key
    setup_sudo
    create_directories
    setup_firewall
    get_server_ip
    
    echo ""
    print_success "🎉 Настройка завершена!"
    echo ""
    
    show_github_secrets
    
    echo ""
    print_message "📋 Следующие шаги:"
    echo "1. Настройте DNS для beresta.one на IP: $EXTERNAL_IP"
    echo "2. Добавьте GitHub Secrets (см. выше)"
    echo "3. Сделайте push в main ветку - деплой запустится автоматически!"
    echo ""
    print_success "Сервер готов к автоматическому деплою! 🚀"
}

# Запуск
main "$@"
