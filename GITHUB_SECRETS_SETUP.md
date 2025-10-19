# Настройка секретов GitHub для Beresta.one

## Необходимые секреты для деплоя

В репозитории [beresta.one](https://github.com/blockrunner/beresta.one/) нужно настроить следующие секреты:

### 1. Перейдите в настройки репозитория
- Откройте https://github.com/blockrunner/beresta.one/
- Нажмите **Settings** → **Secrets and variables** → **Actions**
- Нажмите **New repository secret**

### 2. Добавьте следующие секреты:

#### SSH_HOST
- **Name**: `SSH_HOST`
- **Value**: `berisk.beget.tech`

#### SSH_USER
- **Name**: `SSH_USER`
- **Value**: `berisk_beresta`

#### SSH_PASS
- **Name**: `SSH_PASS`
- **Value**: `Q13123213123Qg`

#### SSH_REMOTE_PATH (опционально)
- **Name**: `SSH_REMOTE_PATH`
- **Value**: `.` (точка означает текущую папку)

## Проверка настройки

После добавления всех секретов:

1. Сделайте любой коммит и push в main ветку
2. Перейдите во вкладку **Actions** в репозитории
3. Убедитесь, что workflow "Deploy to Hosting" запустился
4. Проверьте логи выполнения

## Структура деплоя

Workflow будет:
1. Клонировать код из репозитория
2. Подключаться к серверу `berisk.beget.tech` по SSH
3. Синхронизировать файлы в папку `/home/berisk/beresta.one/public_html/`
4. Исключать служебные файлы (.git, .github, node_modules и т.д.)

## Troubleshooting

### Если деплой не работает:

1. **Проверьте секреты** - убедитесь, что все секреты правильно добавлены
2. **Проверьте SSH доступ** - убедитесь, что сервер доступен
3. **Проверьте права доступа** - убедитесь, что пользователь `berisk_beresta` имеет права на запись в папку
4. **Проверьте логи** - в GitHub Actions есть подробные логи каждого шага

### Полезные команды для проверки SSH:

```bash
# Проверка подключения
ssh berisk_beresta@berisk.beget.tech

# Проверка папки
ls -la /home/berisk/beresta.one/public_html/
```

## Безопасность

⚠️ **Важно**: Секреты в GitHub зашифрованы и доступны только для GitHub Actions. Они не видны в логах и не могут быть прочитаны другими пользователями.
