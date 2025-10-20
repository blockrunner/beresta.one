# 🚀 Быстрый автоматический деплой

## 📋 Что нужно сделать ОДИН РАЗ:

### 1. На production сервере (только один раз):

```bash
# Скачать и запустить автоматическую настройку
curl -fsSL https://raw.githubusercontent.com/your-username/beresta-website/main/auto-setup.sh | bash
```

**Этот скрипт автоматически:**
- ✅ Установит Docker и Git
- ✅ Создаст SSH ключи
- ✅ Настроит firewall
- ✅ Создаст все необходимые директории
- ✅ Покажет информацию для GitHub Secrets

### 2. В GitHub репозитории:

Перейдите в `Settings > Secrets and variables > Actions` и добавьте:

| Secret | Значение |
|--------|----------|
| `PRODUCTION_HOST` | IP адрес вашего сервера |
| `PRODUCTION_USER` | Имя пользователя (обычно `ubuntu` или `root`) |
| `PRODUCTION_SSH_KEY` | Приватный SSH ключ (покажет скрипт) |
| `PRODUCTION_PORT` | `22` |

### 3. Настройте DNS:

Укажите домен `beresta.one` на IP вашего сервера.

## 🎉 Готово!

**Теперь каждый push в main ветку автоматически деплоит изменения на https://beresta.one!**

### Что происходит автоматически при push:

1. 🔨 **Сборка** Docker образа
2. 📦 **Публикация** в GitHub Container Registry  
3. 🚀 **SSH подключение** к серверу
4. 📥 **Обновление** кода через git pull
5. 🐳 **Перезапуск** контейнеров
6. ✅ **Проверка** работоспособности
7. 🎯 **Готово!** Сайт обновлен

### Никаких ручных действий на сервере не требуется!

---

## 🔍 Мониторинг

- **GitHub Actions**: `https://github.com/your-username/beresta-website/actions`
- **Сайт**: `https://beresta.one`
- **API**: `https://beresta.one/app/api`

## 🚨 Если что-то пошло не так:

1. Проверьте GitHub Actions логи
2. Убедитесь что все secrets настроены
3. Проверьте что сервер доступен по SSH

**Больше ничего делать не нужно - все автоматически!** 🚀
