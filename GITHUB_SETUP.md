# Настройка GitHub репозитория для Beresta Website

## Шаги для настройки

### 1. Создайте репозиторий на GitHub

1. Перейдите на [GitHub.com](https://github.com) и войдите в аккаунт
2. Нажмите зеленую кнопку "New" или "+" → "New repository"
3. Заполните форму:
   - **Repository name**: `beresta-website`
   - **Description**: `Official website for Beresta project - innovative sensory feedback technology`
   - **Visibility**: Public (рекомендуется для открытого проекта)
   - **НЕ** добавляйте README, .gitignore или лицензию (они уже созданы)

### 2. Подключите локальный репозиторий к GitHub

Выполните следующие команды в терминале (замените `YOUR_USERNAME` на ваш GitHub username):

```bash
# Перейдите в папку проекта
cd "D:\Beresta\site\public_html"

# Добавьте remote origin
git remote add origin https://github.com/YOUR_USERNAME/beresta-website.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Отправьте код на GitHub
git push -u origin main
```

### 3. Настройте секреты для автоматического деплоя

1. В вашем GitHub репозитории перейдите в **Settings** → **Secrets and variables** → **Actions**
2. Нажмите **New repository secret**
3. Добавьте следующие секреты (в зависимости от типа хостинга):

#### Для FTP хостинга:
- `FTP_SERVER` - адрес FTP сервера (например: `ftp.yourhosting.com`)
- `FTP_USERNAME` - имя пользователя FTP
- `FTP_PASSWORD` - пароль FTP
- `FTP_SERVER_DIR` - папка на сервере (например: `/public_html`)

#### Для SFTP хостинга:
- `SFTP_SERVER` - адрес SFTP сервера
- `SFTP_USERNAME` - имя пользователя SFTP
- `SFTP_PASSWORD` - пароль SFTP
- `SFTP_REMOTE_PATH` - путь на сервере

#### Для SSH хостинга:
- `SSH_HOST` - адрес SSH сервера
- `SSH_USERNAME` - имя пользователя SSH
- `SSH_PRIVATE_KEY` - приватный SSH ключ
- `SSH_PORT` - порт SSH (обычно 22)
- `SSH_REMOTE_PATH` - путь на сервере

### 4. Проверьте настройку

1. Сделайте небольшое изменение в любом файле
2. Выполните:
   ```bash
   git add .
   git commit -m "Test deployment setup"
   git push origin main
   ```
3. Перейдите в **Actions** вкладку вашего репозитория
4. Убедитесь, что workflow запустился и выполнился успешно

## Готовые команды для копирования

### Windows (PowerShell):
```powershell
cd "D:\Beresta\site\public_html"
git remote add origin https://github.com/YOUR_USERNAME/beresta-website.git
git branch -M main
git push -u origin main
```

### Linux/Mac (Bash):
```bash
cd "D:\Beresta\site\public_html"
git remote add origin https://github.com/YOUR_USERNAME/beresta-website.git
git branch -M main
git push -u origin main
```

## Что дальше?

После настройки GitHub репозитория:

1. **Локальная разработка**: Используйте `npm run dev` или `start-dev.bat` для запуска локального сервера
2. **Автоматический деплой**: Каждый push в main ветку будет автоматически деплоить сайт
3. **Мониторинг**: Следите за статусом деплоя во вкладке Actions

## Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FTP Deploy Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [SFTP Deploy Action](https://github.com/wlixcc/SFTP-Deploy-Action)
- [SSH Deploy Action](https://github.com/appleboy/ssh-action)

## Поддержка

При возникновении проблем:
1. Проверьте логи в GitHub Actions
2. Убедитесь, что все секреты правильно настроены
3. Проверьте права доступа к хостингу
4. Обратитесь к команде разработки Beresta

