# API Documentation

## Обзор

Beresta API предоставляет RESTful интерфейс для управления очередью команд и логирования операций устройства.

**Base URL**: `http://localhost:3000/api` (разработка)  
**Production URL**: `https://beresta.one/app/api`

## Аутентификация

В настоящее время API не требует аутентификации. В будущих версиях будет добавлена поддержка API ключей.

## Rate Limiting

- **Лимит**: 100 запросов в 15 минут на IP
- **Заголовки ответа**: 
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Формат ответов

### Успешный ответ
```json
{
  "message": "Описание операции",
  "data": { ... }
}
```

### Ошибка
```json
{
  "error": "Описание ошибки",
  "message": "Детали ошибки"
}
```

## Queue Management

### POST /api/queue/save

Сохранить новый элемент в очереди.

**Request Body:**
```json
{
  "name": "string (1-255 символов)",
  "data": "object"
}
```

**Response (201):**
```json
{
  "message": "Queue item saved successfully",
  "data": {
    "id": 1,
    "name": "test command",
    "data": { ... },
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Validation Errors (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### GET /api/queue/load

Загрузить все элементы очереди.

**Response (200):**
```json
{
  "message": "Queue loaded successfully",
  "data": {
    "last_id": 5,
    "data": [
      {
        "id": 1,
        "name": "command 1",
        "data": { ... },
        "created_at": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

### DELETE /api/queue/remove

Удалить элемент из очереди.

**Request Body:**
```json
{
  "id": 1
}
```

**Response (200):**
```json
{
  "message": "Queue item removed successfully",
  "id": 1
}
```

**Not Found (404):**
```json
{
  "error": "Queue item not found",
  "id": 1
}
```

### GET /api/queue/status

Получить статус очереди.

**Response (200):**
```json
{
  "message": "Queue status retrieved successfully",
  "data": {
    "total_items": 3,
    "last_id": 5,
    "last_updated": "2024-01-01T12:00:00.000Z"
  }
}
```

## Logging

### POST /api/logs/add

Добавить запись в лог.

**Request Body:**
```json
{
  "log-action": "string (1-255 символов)",
  "log-type": "text|img|data",
  "log-msg": "string|array"
}
```

**Response (201):**
```json
{
  "message": "Log entry added successfully",
  "timestamp": "01.01.2024 12:00:00"
}
```

**Примеры log-msg:**

Для типа `text`:
```json
{
  "log-action": "device_connect",
  "log-type": "text",
  "log-msg": "Device connected successfully"
}
```

Для типа `img`:
```json
{
  "log-action": "pattern_send",
  "log-type": "img",
  "log-msg": [
    [
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1]
    ]
  ]
}
```

### DELETE /api/logs/clear

Очистить все логи.

**Response (200):**
```json
{
  "message": "Logs cleared successfully",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/logs/view

Просмотр логов с пагинацией.

**Query Parameters:**
- `page` (optional): номер страницы (default: 1)
- `limit` (optional): количество записей на странице (default: 100, max: 1000)

**Example:** `GET /api/logs/view?page=1&limit=50`

**Response (200):**
```json
{
  "message": "Logs retrieved successfully",
  "data": {
    "entries": [
      "Datetime: 01.01.2024 12:00:00\nAction: device_connect\nType: text\nMessage: Device connected\n------------------------------"
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "total_pages": 3
    }
  }
}
```

### GET /api/logs/status

Получить статус логов.

**Response (200):**
```json
{
  "message": "Logs status retrieved successfully",
  "data": {
    "total_entries": 150,
    "file_size": 10240,
    "last_updated": "2024-01-01T12:00:00.000Z"
  }
}
```

## Health Check

### GET /api/health

Проверка состояния API.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200  | OK |
| 201  | Created |
| 400  | Bad Request (validation error) |
| 403  | Forbidden (rate limit exceeded) |
| 404  | Not Found |
| 500  | Internal Server Error |

## Примеры использования

### JavaScript (Fetch API)

```javascript
// Сохранение элемента очереди
const saveQueueItem = async (name, data) => {
  const response = await fetch('/app/api/queue/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, data })
  });
  
  return await response.json();
};

// Загрузка очереди
const loadQueue = async () => {
  const response = await fetch('/app/api/queue/load');
  return await response.json();
};

// Добавление лога
const addLog = async (action, type, message) => {
  const response = await fetch('/app/api/logs/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'log-action': action,
      'log-type': type,
      'log-msg': message
    })
  });
  
  return await response.json();
};
```

### cURL

```bash
# Проверка здоровья API
curl http://localhost:3000/api/health

# Сохранение элемента очереди
curl -X POST http://localhost:3000/api/queue/save \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "data": {"pattern": [1,0,1]}}'

# Загрузка очереди
curl http://localhost:3000/api/queue/load

# Добавление лога
curl -X POST http://localhost:3000/api/logs/add \
  -H "Content-Type: application/json" \
  -d '{"log-action": "test", "log-type": "text", "log-msg": "Test message"}'
```

## Changelog

### v1.0.0
- Первоначальная версия API
- Управление очередью команд
- Система логирования
- Rate limiting
- Валидация данных

