# Настройка красивых URL для Beresta Website

## Обзор

Проект Beresta теперь поддерживает красивые URL без расширений `.html`. Вместо `http://localhost:8100/applications.html` теперь можно использовать `http://localhost:8100/applications/`.

## Новая структура URL

### До (старые URL):
- `http://localhost:8100/applications.html`
- `http://localhost:8100/technology.html`
- `http://localhost:8100/team.html`
- `http://localhost:8100/blog.html`
- `http://localhost:8100/roadmap.html`
- `http://localhost:8100/whitepaper.html`
- `http://localhost:8100/participation.html`
- `http://localhost:8100/prototype.html`

### После (новые URL):
- `http://localhost:8100/applications/`
- `http://localhost:8100/technology/`
- `http://localhost:8100/team/`
- `http://localhost:8100/blog/`
- `http://localhost:8100/roadmap/`
- `http://localhost:8100/whitepaper/`
- `http://localhost:8100/participation/`
- `http://localhost:8100/prototype/`

## Структура файлов

```
public_html/
├── pages/                    # Новые страницы в папках
│   ├── applications/
│   │   └── index.html
│   ├── technology/
│   │   └── index.html
│   ├── team/
│   │   └── index.html
│   ├── blog/
│   │   └── index.html
│   ├── roadmap/
│   │   └── index.html
│   ├── whitepaper/
│   │   └── index.html
│   ├── participation/
│   │   └── index.html
│   └── prototype/
│       └── index.html
├── *.html                    # Старые файлы (для совместимости)
├── dev-server.js             # Обновленный сервер разработки
├── nginx.conf                # Конфигурация Nginx
├── .htaccess                 # Конфигурация Apache
└── migrate-to-clean-urls.*   # Скрипты миграции
```

## Локальная разработка

### Запуск сервера разработки

```bash
# Запуск обновленного dev-сервера
node dev-server.js

# Или через npm
npm run dev
```

### Тестирование URL

1. Откройте браузер
2. Перейдите на `http://localhost:8100`
3. Протестируйте новые URL:
   - `http://localhost:8100/applications/`
   - `http://localhost:8100/technology/`
   - `http://localhost:8100/team/`

## Продакшен

### Nginx

Используйте файл `nginx.conf` для настройки Nginx:

```bash
# Копирование конфигурации
sudo cp nginx.conf /etc/nginx/sites-available/beresta
sudo cp beresta-common.conf /etc/nginx/snippets/

# Активация сайта
sudo ln -s /etc/nginx/sites-available/beresta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache

Файл `.htaccess` автоматически создается при миграции и содержит правила для Apache.

## Миграция

### Автоматическая миграция

**Windows (Batch):**
```cmd
migrate-to-clean-urls.bat
```

**Windows (PowerShell):**
```powershell
.\migrate-to-clean-urls.ps1
```

### Ручная миграция

1. **Создание структуры папок:**
   ```bash
   mkdir -p pages/{applications,technology,team,blog,roadmap,whitepaper,participation,prototype}
   ```

2. **Копирование файлов:**
   ```bash
   cp applications.html pages/applications/index.html
   cp technology.html pages/technology/index.html
   # ... и так далее для всех страниц
   ```

3. **Обновление ссылок:**
   - Замените все `href="/page.html"` на `href="/page/"`
   - Обновите внутренние ссылки в HTML файлах

## Обратная совместимость

- **Старые URL продолжают работать** - файлы `.html` остаются в корне
- **Автоматическое перенаправление** - сервер автоматически находит нужную страницу
- **Постепенная миграция** - можно обновлять ссылки постепенно

## Преимущества новой структуры

### SEO и производительность
- ✅ **SEO-дружественные URL** - поисковики лучше индексируют
- ✅ **Кэширование** - браузеры эффективнее кэшируют по папкам
- ✅ **CDN оптимизация** - статические файлы легко раздавать

### Масштабируемость
- ✅ **Микросервисная готовность** - легко выделить страницы в отдельные сервисы
- ✅ **A/B тестирование** - можно создавать варианты страниц
- ✅ **Локализация** - легко добавить `/en/`, `/ru/` версии
- ✅ **Версионирование** - можно добавить `/v1/`, `/v2/` API

### Разработка
- ✅ **Чистая архитектура** - логичная структура файлов
- ✅ **Легкая навигация** - понятные пути к файлам
- ✅ **Готовность к фреймворкам** - легко мигрировать на Next.js, Nuxt.js

## Будущие возможности

### Динамические страницы
```
/blog/post-slug/
/api/contact/
/en/applications/
/v2/technology/
```

### API интеграция
```
/api/blog/posts/
/api/team/members/
/api/applications/categories/
```

## Troubleshooting

### Проблемы с локальным сервером

1. **404 ошибки на новых URL:**
   - Убедитесь, что файлы находятся в `pages/page-name/index.html`
   - Проверьте, что `dev-server.js` обновлен

2. **Старые ссылки не работают:**
   - Проверьте, что старые `.html` файлы остались в корне
   - Убедитесь, что сервер поддерживает fallback

### Проблемы с продакшеном

1. **Nginx 404 ошибки:**
   - Проверьте конфигурацию `nginx.conf`
   - Убедитесь, что пути к файлам правильные

2. **Apache не работает:**
   - Проверьте, что модуль `mod_rewrite` включен
   - Убедитесь, что `.htaccess` файл существует

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что все файлы на месте
3. Протестируйте на локальном сервере
4. Проверьте конфигурацию веб-сервера

