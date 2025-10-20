# Настройка GitHub Actions для деплоя

Этот документ описывает настройку автоматического деплоя через GitHub Actions на виртуальный хостинг.

## Требования

1. **GitHub репозиторий** с кодом проекта
2. **SSH доступ** к серверу хостинга
3. **Node.js** на сервере (версия 18+)

## Настройка GitHub Secrets

В настройках репозитория GitHub (`Settings` → `Secrets and variables` → `Actions`) добавьте следующие секреты:

### Обязательные секреты:

| Secret Name | Описание | Пример |
|-------------|----------|---------|
| `SSH_PRIVATE_KEY` | Приватный SSH ключ для доступа к серверу | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_USER` | Имя пользователя для SSH | `berisk` |
| `SSH_HOST` | Хост сервера | `berisk.beget.tech` |
| `REMOTE_PATH` | Путь к папке на сервере | `/home/berisk/public_html` |

### Как получить SSH ключи:

1. **Создайте SSH ключ** (если нет):
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

2. **Скопируйте публичный ключ** на сервер:
```bash
ssh-copy-id user@server
```

3. **Скопируйте приватный ключ** в GitHub Secrets:
```bash
cat ~/.ssh/id_rsa
```

## Настройка сервера

### 1. Установка Node.js

На сервере установите Node.js 18+:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Установка PM2 (опционально)

Для более надежного управления процессами:

```bash
sudo npm install -g pm2
```

### 3. Настройка прав доступа

```bash
# Создайте папку для приложения
mkdir -p /home/berisk/public_html
chown -R berisk:berisk /home/berisk/public_html

# Убедитесь, что у пользователя есть права на запуск Node.js
```

## Workflow файлы

В проекте есть два workflow файла:

### 1. `deploy.yml` - Простой деплой
- Использует `nohup` для запуска приложения
- Подходит для простых случаев

### 2. `deploy-pm2.yml` - Деплой с PM2 (рекомендуется)
- Использует PM2 для управления процессами
- Автоматический перезапуск при сбоях
- Логирование и мониторинг

## Активация деплоя

### Автоматический деплой:
- Деплой запускается автоматически при push в ветку `main`

### Ручной деплой:
1. Перейдите в `Actions` в GitHub
2. Выберите нужный workflow
3. Нажмите `Run workflow`

## Мониторинг деплоя

### В GitHub Actions:
1. Перейдите в `Actions`
2. Выберите последний запуск
3. Просмотрите логи каждого шага

### На сервере:
```bash
# Проверка статуса приложения
pm2 status

# Просмотр логов
pm2 logs beresta-website

# Перезапуск приложения
pm2 restart beresta-website
```

## Troubleshooting

### Ошибка SSH подключения:
1. Проверьте правильность SSH ключей
2. Убедитесь, что сервер доступен
3. Проверьте права доступа к папке

### Ошибка сборки:
1. Проверьте версию Node.js (должна быть 18+)
2. Убедитесь, что все зависимости установлены
3. Проверьте логи в GitHub Actions

### Приложение не запускается:
1. Проверьте логи: `pm2 logs beresta-website`
2. Убедитесь, что порт 3000 свободен
3. Проверьте переменные окружения

### 404 ошибки:
1. Проверьте, что папка `dist/` существует
2. Убедитесь, что веб-сервер настроен правильно
3. Проверьте права доступа к файлам

## Настройка веб-сервера

### Apache (.htaccess)
Файл `.htaccess` создается автоматически и содержит:
- Проксирование к Node.js серверу
- Fallback на статические файлы
- Кэширование

### Nginx
Если используете Nginx, добавьте в конфигурацию:

```nginx
server {
    listen 80;
    server_name beresta.one;
    root /home/berisk/public_html;
    index index.html;

    location / {
        try_files $uri $uri/ @nodejs;
    }

    location @nodejs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Безопасность

1. **Используйте HTTPS** в продакшене
2. **Настройте файрвол** для ограничения доступа
3. **Регулярно обновляйте** зависимости
4. **Мониторьте логи** на предмет подозрительной активности
5. **Используйте переменные окружения** для секретов

## Откат изменений

Если что-то пошло не так:

1. **Автоматический откат** (если включен):
```bash
# На сервере
cd /home/berisk/public_html
cp -r public_html.backup.YYYYMMDD_HHMMSS/* .
pm2 restart beresta-website
```

2. **Ручной откат**:
- Откатите изменения в Git
- Запустите деплой заново

## Мониторинг производительности

### PM2 мониторинг:
```bash
pm2 monit
```

### Логи:
```bash
pm2 logs --lines 100
```

### Статистика:
```bash
pm2 show beresta-website
```
