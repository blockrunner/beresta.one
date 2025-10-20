# Руководство разработчика

## Быстрый старт

### 1. Установка зависимостей

```bash
# Клонирование репозитория
git clone <repository-url>
cd beresta-website

# Установка основных зависимостей
npm install

# Установка зависимостей API
npm run install:api

# Копирование конфигурации
cp env.example .env
```

### 2. Запуск в режиме разработки

```bash
# Запуск всего проекта (сайт + API)
npm run dev

# Или запуск по отдельности:
npm run dev:site  # Только сайт
npm run dev:api   # Только API
```

### 3. Доступ к приложению

- **Сайт**: http://localhost:8100
- **Веб-приложение**: http://localhost:8100/app/
- **API**: http://localhost:8100/app/api/health

## Структура проекта

### Frontend (Сайт)
- **Папка**: корень проекта
- **Технологии**: HTML5, CSS3, JavaScript (ES6+)
- **Сборка**: Vite
- **Компоненты**: `components/`
- **Страницы**: `pages/`

### Frontend (Веб-приложение)
- **Папка**: `app/`
- **Технологии**: HTML5, CSS3, JavaScript (ES6+)
- **Особенности**: Web Bluetooth API, управление устройством

### Backend (API)
- **Папка**: `app/api/`
- **Технологии**: Node.js, Express.js
- **Функции**: Управление очередью, логирование
- **Хранение**: JSON файлы

## API Endpoints

### Queue Management
- `POST /api/queue/save` - Сохранить элемент очереди
- `GET /api/queue/load` - Загрузить все элементы очереди
- `DELETE /api/queue/remove` - Удалить элемент очереди
- `GET /api/queue/status` - Статус очереди

### Logging
- `POST /api/logs/add` - Добавить запись в лог
- `DELETE /api/logs/clear` - Очистить логи
- `GET /api/logs/view` - Просмотр логов (с пагинацией)
- `GET /api/logs/status` - Статус логов

### Health Check
- `GET /api/health` - Проверка состояния API

## Конфигурация

### Environment Variables

Скопируйте `env.example` в `.env` и настройте:

```bash
# Сервер
PORT=8100
API_PORT=3000

# CORS
CORS_ORIGIN=http://localhost:8100

# Bluetooth
BLUETOOTH_DEVICE_NAME=WEB-CLIENT
BLUETOOTH_SERVICE=0xFFE0
BLUETOOTH_CHARACTERISTIC=0xFFE1

# Безопасность
SESSION_SECRET=your-secret-key
API_KEY=your-api-key
```

### Конфигурационные файлы

- `config/dev.config.js` - Настройки разработки
- `config/prod.config.js` - Настройки продакшена

## Инструменты разработки

### Линтинг и форматирование

```bash
# Проверка кода
npm run lint

# Автоисправление
npm run lint:fix

# Форматирование
npm run format

# Проверка форматирования
npm run format:check
```

### Сборка

```bash
# Сборка всего проекта
npm run build

# Сборка только сайта
npm run build:site

# Сборка только API
npm run build:api
```

### Очистка

```bash
# Удаление собранных файлов и зависимостей
npm run clean
```

## Разработка

### Добавление новых страниц

1. Создайте папку в `pages/`
2. Добавьте `index.html`
3. Обновите навигацию в `components/header.html`

### Добавление API endpoints

1. Создайте новый роут в `app/api/routes/`
2. Добавьте валидацию в `app/api/middleware/validation.js`
3. Обновите документацию

### Работа с Bluetooth

Веб-приложение использует Web Bluetooth API для связи с устройством:

```javascript
// Подключение к устройству
navigator.bluetooth.requestDevice({
  filters: [{ name: 'WEB-CLIENT' }]
});

// Отправка данных
characteristic.writeValue(data);
```

## Тестирование

### Локальное тестирование

```bash
# Запуск в режиме разработки
npm run dev

# Проверка API
curl http://localhost:3000/api/health
```

### Тестирование в продакшене

```bash
# Сборка
npm run build

# Запуск
npm start
```

## Деплой

### Подготовка к деплою

1. Установите переменные окружения
2. Соберите проект: `npm run build`
3. Настройте веб-сервер (Nginx/Apache)

### Nginx конфигурация

Используйте файлы `nginx.conf` и `beresta-common.conf` для настройки Nginx.

## Отладка

### Логи

- **API логи**: `app/api/data/logs.log`
- **Очередь**: `app/api/data/queue_data.json`

### Консоль браузера

Используйте DevTools для отладки frontend кода.

### API отладка

```bash
# Проверка статуса API
curl http://localhost:3000/api/health

# Просмотр логов
curl http://localhost:3000/api/logs/status
```

## Полезные команды

```bash
# Установка зависимостей API
npm run install:api

# Запуск только сайта
npm run dev:site

# Запуск только API
npm run dev:api

# Просмотр собранного сайта
npm run preview

# Очистка и переустановка
npm run clean && npm install && npm run install:api
```

## Troubleshooting

### Проблемы с API

1. Проверьте, что порт 3000 свободен
2. Убедитесь, что установлены зависимости API
3. Проверьте логи в `app/api/data/logs.log`

### Проблемы с Bluetooth

1. Убедитесь, что браузер поддерживает Web Bluetooth
2. Проверьте, что устройство включено и доступно
3. Используйте HTTPS для продакшена

### Проблемы с CORS

1. Проверьте настройки CORS в `app/api/server.js`
2. Убедитесь, что `CORS_ORIGIN` правильно настроен
3. Проверьте, что API запущен на правильном порту

