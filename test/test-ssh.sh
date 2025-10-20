#!/bin/bash

# Тестовый скрипт для проверки SSH подключения
# Использует те же параметры, что и в GitHub Actions

echo "🔧 Тестирование SSH подключения..."
echo ""

# Загружаем переменные из env.example
if [ ! -f "../env.example" ]; then
    echo "❌ Файл env.example не найден"
    exit 1
fi

source ../env.example

echo "📡 Хост: $SSH_HOST"
echo "👤 Пользователь: $SSH_USER"
echo "🔑 Пароль: ***"
echo ""

# Проверяем наличие sshpass
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass не установлен. Установите его:"
    echo "   Ubuntu/Debian: sudo apt-get install sshpass"
    echo "   macOS: brew install sshpass"
    echo "   Windows: используйте WSL или Git Bash"
    exit 1
fi

# Тестируем SSH подключение
echo "🚀 Выполняем SSH подключение..."
sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SSH_USER@$SSH_HOST" "echo 'SSH connection successful!'"

if [ $? -eq 0 ]; then
    echo "✅ SSH подключение успешно!"
else
    echo "❌ Ошибка SSH подключения"
    exit 1
fi

echo ""
echo "🐳 Тестирование Docker команд на сервере..."

# Список команд для тестирования
commands=(
    "docker --version"
    "docker-compose --version"
    "pwd"
    "ls -la"
)

for cmd in "${commands[@]}"; do
    echo "🔧 Выполняем: $cmd"
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$cmd"
    echo ""
done

echo "🎉 Все тесты завершены!"
