# Инструкция по деплою Beresta Website

## Настройка GitHub репозитория

### 1. Создание репозитория на GitHub

1. Перейдите на [GitHub.com](https://github.com)
2. Нажмите "New repository"
3. Заполните данные:
   - **Repository name**: `beresta-website`
   - **Description**: `Official website for Beresta project`
   - **Visibility**: Public (или Private по желанию)
   - **НЕ** добавляйте README, .gitignore или лицензию (они уже есть)

### 2. Подключение локального репозитория к GitHub

```bash
# Перейдите в папку проекта
cd "D:\Beresta\site\public_html"

# Добавьте remote origin (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/beresta-website.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Отправьте код на GitHub
git push -u origin main
```

### 3. Настройка секретов для деплоя

В настройках репозитория GitHub (`Settings` → `Secrets and variables` → `Actions`) добавьте следующие секреты:

#### Для FTP деплоя:
- `FTP_SERVER` - адрес FTP сервера (например: ftp.yourhosting.com)
- `FTP_USERNAME` - имя пользователя FTP
- `FTP_PASSWORD` - пароль FTP
- `FTP_SERVER_DIR` - папка на сервере (например: /public_html)

#### Для SFTP деплоя (альтернатива):
- `SFTP_SERVER` - адрес SFTP сервера
- `SFTP_USERNAME` - имя пользователя SFTP
- `SFTP_PASSWORD` - пароль SFTP
- `SFTP_REMOTE_PATH` - путь на сервере

#### Для SSH деплоя (альтернатива):
- `SSH_HOST` - адрес SSH сервера
- `SSH_USERNAME` - имя пользователя SSH
- `SSH_PRIVATE_KEY` - приватный SSH ключ
- `SSH_PORT` - порт SSH (обычно 22)
- `SSH_REMOTE_PATH` - путь на сервере

## Локальная разработка

### Установка зависимостей

```bash
# Установите Node.js (если не установлен)
# Скачайте с https://nodejs.org/

# Установите зависимости
npm install
```

### Запуск локального сервера

```bash
# Запуск с автоматическим открытием браузера
npm run dev

# Или простой запуск
npm start

# Или используйте встроенный сервер
node dev-server.js
```

Сервер будет доступен по адресу: http://localhost:8100

### Альтернативные способы запуска

```bash
# Python HTTP сервер
python -m http.server 8100

# PHP встроенный сервер
php -S localhost:8100

# Live Server (VS Code extension)
# Установите расширение "Live Server" и нажмите "Go Live"
```

## Процесс деплоя

### Автоматический деплой

После настройки секретов, деплой будет происходить автоматически при каждом пуше в ветку `main`:

1. Сделайте изменения в коде
2. Добавьте файлы в Git: `git add .`
3. Сделайте коммит: `git commit -m "Описание изменений"`
4. Отправьте на GitHub: `git push origin main`
5. GitHub Actions автоматически задеплоит сайт

### Ручной деплой

Если нужно запустить деплой вручную:

1. Перейдите в репозиторий на GitHub
2. Откройте вкладку "Actions"
3. Выберите workflow "Deploy to Hosting"
4. Нажмите "Run workflow"

## Структура проекта

```
public_html/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── components/                 # Компоненты сайта
├── css/                       # Стили
├── img/                       # Изображения
├── js/                        # JavaScript файлы
├── locales/                   # Локализация
├── models/                    # 3D модели
├── app/                       # Основная версия приложения
├── W8dpUuQw/                  # Совместимость (копия app/)
├── W8dpUuQw_dev/              # Dev версия
├── *.html                     # HTML страницы
├── package.json               # Node.js зависимости
├── dev-server.js              # Локальный сервер разработки
├── README.md                  # Описание проекта
├── DEPLOYMENT.md              # Эта инструкция
└── .gitignore                 # Git ignore файл
```

## Troubleshooting

### Проблемы с деплоем

1. **Проверьте секреты** - убедитесь, что все секреты правильно настроены
2. **Проверьте логи** - в GitHub Actions есть подробные логи деплоя
3. **Проверьте права доступа** - убедитесь, что FTP/SFTP/SSH доступ работает

### Проблемы с локальным сервером

1. **Порт занят** - измените порт в `package.json` или `dev-server.js`
2. **Файлы не загружаются** - проверьте пути к файлам
3. **CORS ошибки** - используйте локальный сервер вместо открытия файлов напрямую

## Контакты

При возникновении проблем с деплоем обращайтесь к команде разработки Beresta.
