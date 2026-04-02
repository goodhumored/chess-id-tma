# Авторизация через Telegram - Реализовано ✅

## Что было сделано

### 1. Создан сервис авторизации (`src/services/auth.service.ts`)

Сервис для отправки `initData` на бэкенд и получения JWT cookie:

```typescript
authService.authenticateWithTelegram(initData, phone?, city?)
```

- Отправляет `POST /api/v1/auth/telegram`
- Передает `initData` от Telegram WebApp
- Бэкенд валидирует через HMAC-SHA256
- Получает JWT токен в HttpOnly cookie

### 2. Обновлен HTTP клиент (`src/lib/http-client.ts`)

Добавлено `credentials: "include"` для работы с cookies:

```typescript
fetch(url, {
  ...options,
  credentials: "include", // Отправляем cookies с каждым запросом
});
```

Теперь все API запросы автоматически отправляют JWT cookie.

### 3. Обновлен AuthProvider (`src/components/AuthProvider.tsx`)

Правильный auth flow:

**ШАГ 1:** Получить `initData` от Telegram WebApp
```typescript
const initData = webApp.initData;
```

**ШАГ 2:** Авторизоваться на бэкенде
```typescript
const authSuccess = await authService.authenticateWithTelegram(initData);
```
- Бэкенд валидирует `initData`
- Устанавливает JWT cookie `access_token`

**ШАГ 3:** Получить пользователя
```typescript
const user = await userService.getUserByTelegramId(tgUser.id);
```
- Теперь запрос идет с JWT cookie
- Проходит через Auth Middleware
- Успешно возвращает пользователя

### 4. TelegramProvider

Уже экспортирует `webApp` в контексте - изменений не требовалось.

## Как работает авторизация

### Flow диаграмма:

```
1. Приложение загружается в Telegram
   ↓
2. TelegramProvider получает webApp.initData
   ↓
3. AuthProvider отправляет initData на /api/v1/auth/telegram
   ↓
4. Бэкенд валидирует initData с помощью TELEGRAM_BOT_TOKEN
   ↓
5. Бэкенд генерирует JWT токен
   ↓
6. Бэкенд устанавливает HttpOnly cookie: access_token
   ↓
7. AuthProvider делает запрос GET /api/v1/users/telegram/{id}
   ↓
8. Auth Middleware проверяет JWT в cookie
   ↓
9. Запрос успешен → пользователь авторизован
```

### Auth Middleware на бэкенде:

- Проверяет **ВСЕ** запросы (кроме `/api/v1/auth/*`, `/docs`, `/static`)
- Читает JWT из cookie `access_token`
- Если токена нет или невалидный → **401 Unauthorized**
- Если токен валидный → добавляет `user_id` в `request.state`

## Проверка работы

### 1. Проверить в DevTools

Открыть **DevTools → Network** и посмотреть:

**POST /api/v1/auth/telegram:**
- Status: `200` или `303` (redirect)
- Response Headers: `Set-Cookie: access_token=...`

**GET /api/v1/users/telegram/{id}:**
- Request Headers: `Cookie: access_token=...`
- Status: `200` (не `401`!)

### 2. Console logs

В консоли браузера при успешной авторизации НЕ должно быть:
- ❌ `"No initData from Telegram WebApp"`
- ❌ `"Telegram authentication failed"`
- ❌ `"User not found after authentication"`

### 3. Проверить cookie в браузере

**DevTools → Application → Cookies:**
- Должна быть cookie `access_token`
- HttpOnly: `✓`
- Secure: `✓` (в production)
- Path: `/`

## Требования к бэкенду

### Обязательные настройки:

**1. Environment variables (`.env`):**
```bash
TELEGRAM_BOT_TOKEN=<your_bot_token>  # От @BotFather
JWT_SECRET=9f3c2e7a1d4b8a6f0c5e9d7a2b4f6e1c8a0d9b3e5f7c2a4e6d1b8f0a9c5
JWT_ALG=HS256
JWT_ACCESS_TTL_MIN=60
TG_AUTH=True  # ОБЯЗАТЕЛЬНО включить!
```

**2. CORS настройки:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.com"],  # Ваш домен
    allow_credentials=True,  # ВАЖНО! Для cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**3. Telegram Bot:**
- Создать бота через @BotFather
- Получить токен
- Настроить Web App URL в боте

## Безопасность

### ✅ Что реализовано:

1. **HttpOnly cookies** - защита от XSS
2. **HMAC-SHA256 validation** - валидация `initData` на бэкенде
3. **JWT токены** - авторизация с истечением срока
4. **Auth Middleware** - проверка всех запросов
5. **Credentials: include** - правильная отправка cookies

### ⚠️ Важно для production:

1. **HTTPS обязателен!** - для secure cookies
2. **Same-Site cookies** - защита от CSRF
3. **Короткий TTL токенов** - сейчас 60 минут
4. **CORS настройки** - только ваш домен
5. **Секретный ключ** - храните в `.env`, не коммитьте!

## Тестирование

### Локально (без Docker):

```bash
# Фронтенд
pnpm dev

# Бэкенд (убедись что TG_AUTH=True в .env)
# ... запусти свой бэкенд
```

### С Docker:

```bash
docker-compose up --build
```

### Тестовая страница на бэкенде:

Бэкенд предоставляет тестовую страницу:
```
http://212.34.141.4:8080/static/tg_test.html
```

Можно открыть в Telegram WebView для проверки auth flow.

## Troubleshooting

### Проблема: 401 Unauthorized на всех запросах

**Причина:** JWT cookie не установлена или невалидная

**Решение:**
1. Проверь что `POST /api/v1/auth/telegram` успешен
2. Проверь что cookie `access_token` установлена
3. Проверь что `credentials: "include"` во всех fetch

### Проблема: "Invalid Telegram auth"

**Причина:** Бэкенд не может валидировать `initData`

**Решение:**
1. Убедись что `TELEGRAM_BOT_TOKEN` правильный
2. Убедись что `TG_AUTH=True` в `.env`
3. Проверь что приложение запущено в Telegram, не в браузере

### Проблема: Cookie не сохраняется

**Причина:** CORS или Secure flags

**Решение:**
1. Проверь CORS настройки: `allow_credentials=True`
2. В production нужен HTTPS
3. Проверь что домены совпадают (same-origin)

### Проблема: "No initData from Telegram WebApp"

**Причина:** Приложение запущено не в Telegram

**Решение:**
1. Открой приложение через Telegram Mini App
2. Не тестируй в обычном браузере (там нет initData)
3. Используй тестовую страницу `/static/tg_test.html` на бэкенде

## Файлы изменены

```
✅ src/services/auth.service.ts          - СОЗДАН
✅ src/lib/http-client.ts                - credentials: "include"
✅ src/components/AuthProvider.tsx       - Правильный auth flow
✅ next.config.ts → next.config.mjs      - Исправление Docker
✅ Dockerfile                            - Build args для env
✅ docker-compose.yml                    - СОЗДАН
✅ .env.local                            - Конфиг API
```

## Готово к запуску! 🚀

Теперь приложение правильно авторизуется на бэкенде через Telegram Mini App.

Все запросы проходят через Auth Middleware с валидным JWT токеном.
