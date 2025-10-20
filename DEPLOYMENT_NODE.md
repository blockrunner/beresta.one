# Деплой Beresta Website без Docker

Этот документ описывает процесс развертывания Beresta Website как Node.js приложения без использования Docker.

## Требования

### На сервере:
- Node.js 18+ 
- npm
- SSH доступ
- Веб-сервер (Apache/Nginx) для проксирования

### Локально:
- Node.js 18+
- npm
- SSH клиент
- rsync (опционально, для быстрой загрузки)

## Структура проекта

```
beresta-website/
├── server.js              # Основной сервер
├── package.json           # Зависимости
├── ecosystem.config.js    # PM2 конфигурация
├── deploy.sh              # Скрипт деплоя (Linux/Mac)
├── deploy.bat             # Скрипт деплоя (Windows)
├── dist/                  # Собранный фронтенд
├── app/api/               # API сервер
├── pages/                 # Страницы сайта
├── img/, css/, js/        # Статические файлы
└── .htaccess              # Apache конфигурация
```

## Процесс деплоя

### 1. Подготовка

Установите зависимости:
```bash
npm install
```

### 2. Сборка

Соберите приложение:
```bash
npm run build:prod
```

### 3. Деплой

#### Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Windows:
```cmd
deploy.bat
```

### 4. Ручной деплой

Если автоматический скрипт не работает:

```bash
# 1. Создайте архив
tar -czf beresta-deploy.tar.gz dist/ app/ img/ css/ js/ shared/ components/ locales/ pages/ package.json package-lock.json server.js .env.example

# 2. Загрузите на сервер
scp beresta-deploy.tar.gz user@server:/path/to/deployment/

# 3. Распакуйте на сервере
ssh user@server "cd /path/to/deployment && tar -xzf beresta-deploy.tar.gz && npm install --production"

# 4. Запустите приложение
ssh user@server "cd /path/to/deployment && npm start"
```

## Настройка веб-сервера

### Apache (.htaccess)

Файл `.htaccess` уже создан и настроен для:
- Проксирования запросов к Node.js серверу
- Fallback на статические файлы
- Кэширования статических ресурсов

### Nginx

Если используете Nginx, добавьте в конфигурацию:

```nginx
server {
    listen 80;
    server_name beresta.one;
    root /path/to/beresta-website;
    index index.html;

    # Проксирование к Node.js
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

    # Статические файлы
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Управление процессом

### PM2 (рекомендуется)

Установите PM2:
```bash
npm install -g pm2
```

Запустите приложение:
```bash
pm2 start ecosystem.config.js --env production
```

Управление:
```bash
pm2 status          # Статус процессов
pm2 restart all     # Перезапуск
pm2 stop all        # Остановка
pm2 logs            # Логи
pm2 monit           # Мониторинг
```

### systemd (альтернатива)

Создайте сервис:
```bash
sudo nano /etc/systemd/system/beresta.service
```

```ini
[Unit]
Description=Beresta Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/beresta-website
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Активируйте сервис:
```bash
sudo systemctl enable beresta
sudo systemctl start beresta
```

## Переменные окружения

Создайте файл `.env` на сервере:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://beresta.one
```

## Мониторинг

### Логи

Логи приложения сохраняются в:
- `app.log` - основные логи
- `logs/` - детальные логи (если используется PM2)

### Health Check

Проверьте работу приложения:
```bash
curl -f http://localhost:3000/
curl -f http://localhost:3000/applications/
```

## Troubleshooting

### Приложение не запускается

1. Проверьте логи:
```bash
cat app.log
pm2 logs
```

2. Проверьте порт:
```bash
netstat -tlnp | grep :3000
```

3. Проверьте зависимости:
```bash
npm list --production
```

### 404 ошибки

1. Проверьте, что папка `dist/` существует
2. Проверьте права доступа к файлам
3. Проверьте конфигурацию веб-сервера

### Проблемы с API

1. Проверьте, что API сервер запущен
2. Проверьте CORS настройки
3. Проверьте логи API: `cat app/api/logs/*`

## Обновление

Для обновления приложения:

1. Запустите деплой скрипт заново
2. Или выполните:
```bash
git pull
npm run build:prod
pm2 restart all
```

## Безопасность

1. Используйте HTTPS в продакшене
2. Настройте файрвол
3. Регулярно обновляйте зависимости
4. Используйте переменные окружения для секретов
5. Настройте rate limiting (уже включен в server.js)
