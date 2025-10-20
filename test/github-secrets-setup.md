# Настройка секретов GitHub для деплоймента

## Проблема
Ошибка "missing server host" возникает из-за неправильного mapping секретов в workflow файле.

## Решение

### 1. Секреты, которые нужно создать в GitHub

Перейдите в настройки репозитория: `Settings` → `Secrets and variables` → `Actions`

Создайте следующие секреты:

| Название секрета | Значение | Описание |
|------------------|----------|----------|
| `SSH_HOST` | `berisk.beget.tech` | Хост SSH сервера |
| `SSH_USER` | `berisk_beresta` | Имя пользователя SSH |
| `SSH_PASS` | `Q13123213123Qg` | Пароль SSH |

### 2. Изменения в workflow файле

В файле `.github/workflows/deploy.yml` исправлены следующие параметры:

**Было:**
```yaml
host: ${{ secrets.PRODUCTION_HOST }}
username: ${{ secrets.PRODUCTION_USER }}
key: ${{ secrets.PRODUCTION_SSH_KEY }}
port: ${{ secrets.PRODUCTION_PORT }}
```

**Стало:**
```yaml
host: ${{ secrets.SSH_HOST }}
username: ${{ secrets.SSH_USER }}
password: ${{ secrets.SSH_PASS }}
port: 22
```

### 3. Тестирование

Для тестирования SSH подключения используйте:

```bash
# Перейдите в папку test
cd test

# Запустите тест (требует sshpass)
chmod +x test-ssh.sh
./test-ssh.sh

# Или используйте Node.js версию
node test-ssh-connection.js
```

### 4. Установка sshpass (если нужно)

**Ubuntu/Debian:**
```bash
sudo apt-get install sshpass
```

**macOS:**
```bash
brew install sshpass
```

**Windows (WSL):**
```bash
sudo apt-get install sshpass
```

### 5. Проверка секретов

Убедитесь, что все секреты созданы в GitHub:
- `SSH_HOST` ✅
- `SSH_USER` ✅  
- `SSH_PASS` ✅

После создания секретов workflow должен работать корректно.
