#!/bin/bash

# Beresta Fully Automated Server Setup
# Полностью автоматическая настройка production сервера

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${BLUE}[Beresta Auto-Setup]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Beresta Auto-Setup]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Beresta Auto-Setup]${NC} $1"
}

print_error() {
    echo -e "${RED}[Beresta Auto-Setup]${NC} $1"
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

# Установка Git
install_git() {
    print_message "Установка Git..."
    sudo apt install -y git
    print_success "Git установлен"
}

# Установка OpenSSL
install_openssl() {
    print_message "Установка OpenSSL..."
    sudo apt install -y openssl
    print_success "OpenSSL установлен"
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
    
    # Проверка что публичный ключ уже в authorized_keys
    if ! grep -q "$(cat ~/.ssh/id_rsa.pub)" ~/.ssh/authorized_keys; then
        cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
        print_success "Публичный ключ добавлен в authorized_keys"
    fi
}

# Настройка sudo без пароля для Docker
setup_sudo() {
    print_message "Настройка sudo для Docker..."
    
    # Добавление пользователя в sudoers для Docker команд
    echo "$USER ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/local/bin/docker-compose" | sudo tee /etc/sudoers.d/docker-user
    sudo chmod 440 /etc/sudoers.d/docker-user
    
    print_success "Sudo настроен для Docker"
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

# Настройка firewall
setup_firewall() {
    print_message "Настройка firewall..."
    
    # Установка ufw если не установлен
    sudo apt install -y ufw
    
    # Настройка правил
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "Firewall настроен"
}

# Создание systemd сервиса для автозапуска
create_systemd_service() {
    print_message "Создание systemd сервиса..."
    
    sudo tee /etc/systemd/system/beresta-deploy.service > /dev/null << EOF
[Unit]
Description=Beresta Auto Deploy Service
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
User=$USER
WorkingDirectory=/var/www/beresta
ExecStart=/usr/bin/docker-compose up -d
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable beresta-deploy.service
    
    print_success "Systemd сервис создан"
}

# Вывод информации для GitHub Secrets
show_github_secrets() {
    print_message "Информация для GitHub Secrets:"
    echo ""
    print_warning "Добавьте эти значения в GitHub Secrets:"
    echo ""
    echo "PRODUCTION_HOST: $(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
    echo "PRODUCTION_USER: $USER"
    echo "PRODUCTION_PORT: 22"
    echo ""
    print_warning "PRODUCTION_SSH_KEY (приватный ключ):"
    cat ~/.ssh/id_rsa
    echo ""
    print_warning "Перейдите в GitHub: Settings > Secrets and variables > Actions"
    print_warning "Добавьте эти secrets для автоматического деплоя"
}

# Основная функция
main() {
    print_message "🚀 Полностью автоматическая настройка Beresta Production Server"
    echo ""
    
    # Проверка что скрипт запущен от root или с sudo
    if [ "$EUID" -eq 0 ]; then
        print_error "Не запускайте скрипт от root! Запустите от обычного пользователя с sudo правами"
        exit 1
    fi
    
    # Проверка sudo прав
    if ! sudo -n true 2>/dev/null; then
        print_error "Требуются sudo права. Запустите: sudo $0"
        exit 1
    fi
    
    print_message "Начинаем автоматическую настройку..."
    echo ""
    
    # Выполнение всех шагов
    update_system
    install_docker
    install_git
    install_openssl
    create_ssh_key
    setup_sudo
    create_directories
    setup_firewall
    create_systemd_service
    
    echo ""
    print_success "🎉 Автоматическая настройка завершена!"
    echo ""
    
    # Вывод информации
    show_github_secrets
    
    echo ""
    print_message "📋 Следующие шаги:"
    echo "1. Настройте DNS для beresta.one на IP этого сервера"
    echo "2. Добавьте GitHub Secrets (см. выше)"
    echo "3. Сделайте push в main ветку - деплой запустится автоматически!"
    echo ""
    print_success "Сервер готов к автоматическому деплою! 🚀"
}

# Запуск
main "$@"
