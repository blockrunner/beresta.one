# Beresta Project Website

Официальный сайт проекта Beresta - инновационной технологии сенсорной обратной связи.

## Описание

Beresta - это проект, направленный на создание инновационных решений для сенсорной обратной связи и тактильных интерфейсов.

## Структура проекта

### Основные страницы (новые красивые URL)
- `/` - Главная страница
- `/applications/` - Страница приложений
- `/technology/` - Технологии
- `/team/` - Команда
- `/blog/` - Блог
- `/roadmap/` - Дорожная карта
- `/whitepaper/` - Белая книга
- `/participation/` - Участие в проекте
- `/prototype/` - Прототип
- `/app/` - Веб-приложение для управления устройством

### Файловая структура
```
public_html/
├── app/                      # Веб-приложение для управления устройством
│   ├── api/                  # Node.js backend API
│   │   ├── server.js         # Express сервер
│   │   ├── routes/           # API роуты
│   │   ├── middleware/       # Middleware (валидация, rate limiting)
│   │   ├── utils/            # Утилиты (работа с файлами)
│   │   └── data/             # Данные (queue, logs)
│   ├── css/                  # Стили приложения
│   ├── js/                   # JavaScript приложения
│   └── index.html            # Главная страница приложения
├── pages/                    # Новые страницы в папках
│   ├── applications/index.html
│   ├── technology/index.html
│   ├── team/index.html
│   └── ...
├── *.html                    # Старые файлы (для совместимости)
├── components/               # Переиспользуемые компоненты
├── css/                      # Стили сайта
├── js/                       # JavaScript сайта
├── img/                      # Изображения
├── locales/                  # Локализация
├── models/                   # 3D модели
├── config/                   # Конфигурация
│   ├── dev.config.js         # Конфигурация разработки
│   └── prod.config.js        # Конфигурация продакшена
└── shared/                   # Общие ресурсы
    ├── models/
    └── img/
```

## Локальная разработка

### 🐳 Docker (Рекомендуемый способ)

Самый простой способ запуска проекта - через Docker:

```bash
# Запуск production версии
./docker-start.sh start-prod    # Linux/Mac
docker-start.bat start-prod     # Windows

# Запуск development версии с hot reload
./docker-start.sh start-dev     # Linux/Mac
docker-start.bat start-dev      # Windows

# Остановка контейнеров
./docker-start.sh stop          # Linux/Mac
docker-start.bat stop           # Windows

# Просмотр логов
./docker-start.sh logs          # Linux/Mac
docker-start.bat logs           # Windows

# Полная справка
./docker-start.sh help          # Linux/Mac
docker-start.bat help           # Windows
```

**Преимущества Docker:**
- ✅ Одинаковая среда на всех машинах
- ✅ Автоматическая установка зависимостей
- ✅ Изолированная среда разработки
- ✅ Простой деплой
- ✅ Готовность к продакшену

### 📦 Установка зависимостей (альтернативный способ)

```bash
# Установка основных зависимостей
npm install

# Установка зависимостей API
npm run install:api

# Копирование конфигурации
cp env.example .env
```

### 🚀 Запуск сервера разработки (альтернативный способ)

```bash
# Запуск всего проекта (сайт + API)
npm run dev

# Запуск только сайта
npm run dev:site

# Запуск только API
npm run dev:api

# Альтернативный способ (старый dev-server)
node dev-server.js
```

### 🏗️ Сборка для продакшена

#### Docker (Рекомендуемый способ)
```bash
# Сборка Docker образа
docker-compose build

# Или через скрипт
./docker-start.sh rebuild
```

#### Альтернативный способ
```bash
# Сборка всего проекта
npm run build

# Сборка только сайта
npm run build:site

# Сборка только API
npm run build:api
```

### Тестирование красивых URL

После запуска сервера протестируйте новые URL:
- `http://localhost:8100/applications/`
- `http://localhost:8100/technology/`
- `http://localhost:8100/team/`

Старые URL (с `.html`) также продолжают работать для обратной совместимости.

## 🚀 Деплой

### Docker деплой (Рекомендуемый способ)

```bash
# Сборка и запуск production образа
docker-compose up -d beresta-app

# Или через скрипт
./docker-start.sh start-prod
```

### GitHub Actions (автоматический деплой)

Сайт автоматически деплоится на хостинг через GitHub Actions при пуше в main ветку.

### Ручной деплой

```bash
# Сборка проекта
npm run build

# Запуск production сервера
npm start
```

## Технологии

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Vite (сборка и dev-сервер)
- Responsive Design
- Clean URLs (красивые URL без расширений)
- Модульная архитектура
- Компонентная система

### Backend
- Node.js + Express.js
- RESTful API
- Валидация данных (express-validator)
- Rate limiting
- CORS поддержка
- Файловое хранилище (JSON)

### DevOps & Deployment
- 🐳 Docker & Docker Compose
- Multi-stage builds для оптимизации
- Health checks
- Volume management
- Environment configuration
- Automated deployment scripts

### Инструменты разработки
- ESLint (линтинг)
- Prettier (форматирование)
- Concurrently (запуск нескольких серверов)
- Nodemon (автоперезагрузка API)

## Новые возможности

### 🐳 Docker Integration
- ✅ Multi-stage Docker builds
- ✅ Development и Production конфигурации
- ✅ Автоматизированные скрипты управления
- ✅ Volume management для данных
- ✅ Health checks и мониторинг
- ✅ Кроссплатформенная совместимость

### Современная архитектура
- ✅ Node.js backend с Express.js
- ✅ RESTful API с валидацией
- ✅ Rate limiting и безопасность
- ✅ Файловое хранилище данных
- ✅ Конфигурация через environment variables

### Красивые URL
Проект поддерживает современные URL без расширений `.html`:
- ✅ SEO-дружественные URL
- ✅ Лучшее кэширование
- ✅ Готовность к масштабированию
- ✅ Обратная совместимость

### Инструменты разработки
- ✅ Vite для быстрой разработки
- ✅ ESLint и Prettier для качества кода
- ✅ Hot Module Replacement (HMR)
- ✅ Автоматическая сборка и минификация

### Масштабируемая архитектура
- ✅ Структура папок для легкого расширения
- ✅ Готовность к микросервисам
- ✅ Поддержка A/B тестирования
- ✅ Возможность локализации

Подробнее см. [CLEAN_URLS_SETUP.md](CLEAN_URLS_SETUP.md)

## Лицензия

Все права защищены © 2024 Beresta Project
