# 🚀 Автоматический деплой Beresta

Этот документ описывает настройку автоматического деплоя на production сервер при пуше в main ветку GitHub.

## 📋 Предварительные требования

- Ubuntu/Debian сервер с root доступом
- Домен beresta.one настроенный на IP сервера
- SSL сертификаты для домена

## 🔧 Настройка production сервера

### 1. Подключение к серверу

```bash
ssh root@your-server-ip
```

### 2. Запуск скрипта настройки

```bash
# Скачивание и запуск скрипта настройки
curl -fsSL https://raw.githubusercontent.com/your-username/beresta-website/main/setup-production.sh | bash
```

Или вручную:

```bash
# Клонирование репозитория
git clone https://github.com/your-username/beresta-website.git /var/www/beresta
cd /var/www/beresta

# Запуск скрипта настройки
chmod +x setup-production.sh
./setup-production.sh
```

### 3. Настройка SSL сертификатов

Поместите ваши SSL сертификаты в `/var/www/beresta/ssl/`:

```bash
# Копирование сертификатов
cp your-beresta.crt /var/www/beresta/ssl/beresta.crt
cp your-beresta.key /var/www/beresta/ssl/beresta.key

# Установка прав доступа
chmod 644 /var/www/beresta/ssl/beresta.crt
chmod 600 /var/www/beresta/ssl/beresta.key
```

## 🔑 Настройка GitHub Actions

### 1. Создание SSH ключа

На production сервере:

```bash
# Создание SSH ключа
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# Добавление публичного ключа в authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

### 2. Настройка GitHub Secrets

Перейдите в ваш GitHub репозиторий:
`Settings > Secrets and variables > Actions`

Добавьте следующие secrets:

| Secret | Описание | Пример |
|--------|----------|---------|
| `PRODUCTION_HOST` | IP адрес сервера | `123.456.789.0` |
| `PRODUCTION_USER` | SSH пользователь | `root` или `ubuntu` |
| `PRODUCTION_SSH_KEY` | Приватный SSH ключ | Содержимое `~/.ssh/id_rsa` |
| `PRODUCTION_PORT` | SSH порт | `22` |

### 3. Получение приватного SSH ключа

```bash
# На production сервере
cat ~/.ssh/id_rsa
```

Скопируйте весь вывод (включая `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`) и вставьте в GitHub Secret `PRODUCTION_SSH_KEY`.

## 🎯 Как работает автоматический деплой

### При пуше в main ветку:

1. **GitHub Actions** запускает workflow
2. **Сборка** Docker образа с новым кодом
3. **Публикация** образа в GitHub Container Registry
4. **SSH подключение** к production серверу
5. **Остановка** старых контейнеров
6. **Обновление** кода через `git pull`
7. **Сборка** нового образа на сервере
8. **Запуск** обновленных контейнеров
9. **Проверка** работоспособности сайта

### Workflow файл: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Ручной запуск

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
      - name: Build Docker image
      - name: Deploy to production server
      - name: Health check
```

## 🔍 Мониторинг деплоя

### Просмотр статуса деплоя

1. Перейдите в ваш GitHub репозиторий
2. Откройте вкладку `Actions`
3. Выберите последний workflow run
4. Просмотрите логи выполнения

### Проверка на сервере

```bash
# Статус контейнеров
docker-compose ps

# Логи приложения
docker-compose logs -f beresta-app

# Проверка доступности
curl -I https://beresta.one/
curl -I https://beresta.one/applications/
```

## 🛠️ Ручное управление

### На production сервере:

```bash
cd /var/www/beresta

# Остановка
docker-compose down

# Запуск
docker-compose up -d

# Перезапуск
docker-compose restart

# Обновление
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

## 🚨 Устранение неполадок

### Проблема: Деплой не запускается

**Решение:**
- Проверьте GitHub Secrets
- Убедитесь что SSH ключ правильный
- Проверьте доступность сервера

### Проблема: Сайт не работает после деплоя

**Решение:**
```bash
# Проверка логов
docker-compose logs beresta-app

# Проверка статуса
docker-compose ps

# Перезапуск
docker-compose restart
```

### Проблема: SSL ошибки

**Решение:**
```bash
# Проверка сертификатов
ls -la /var/www/beresta/ssl/

# Проверка прав доступа
chmod 644 /var/www/beresta/ssl/beresta.crt
chmod 600 /var/www/beresta/ssl/beresta.key
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи GitHub Actions
2. Проверьте логи на production сервере
3. Убедитесь что все secrets настроены правильно
4. Проверьте доступность сервера и домена

## 🎉 Готово!

После настройки каждый push в main ветку будет автоматически деплоить изменения на production сервер!

**Тестирование:**
1. Внесите изменения в код
2. Сделайте commit и push в main
3. Проверьте GitHub Actions
4. Убедитесь что сайт обновился
