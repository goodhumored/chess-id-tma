# Environment Variables Setup

## Фронтенд (.env.local)

Скопируй `.env.example` в `.env.local` и заполни реальными значениями:

```bash
cp .env.example .env.local
```

Затем отредактируй `.env.local`:

```bash
# URL бэкенда
NEXT_PUBLIC_API_URL=http://212.34.141.4:8080

# API Secret (должен совпадать с бэкендом)
NEXT_PUBLIC_API_SECRET=9f3c2e7a1d4b8a6f0c5e9d7a2b4f6e1c8a0d9b3e5f7c2a4e6d1b8f0a9c5

# Флаг мокирования авторизации телеграма
# ТОЛЬКО ДЛЯ ЛОКАЛЬНОЙ СБОРКИ
NEXT_PUBLIC_SKIP_TELEGRAM_AUTH=false

# Токен тестового бота для мокирования авторизации телеграма
# Должен совпадать с токеном на бекенде
# ТОЛЬКО ДЛЯ ЛОКАЛЬНОЙ СБОРКИ 
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=123456:TEST_TOKEN
```

## Бэкенд (.env)

В `/home/goodhumored/uni/1sem/chess_id/.env`:

```bash
# Database
DB_URL=postgresql+asyncpg://chessid:chessid@database:5432/chessid

# Telegram Bot Token (ОБЯЗАТЕЛЬНО получи от @BotFather!)
TELEGRAM_BOT_TOKEN=<твой_реальный_токен>

# JWT Secret (должен совпадать с фронтендом)
JWT_SECRET=9f3c2e7a1d4b8a6f0c5e9d7a2b4f6e1c8a0d9b3e5f7c2a4e6d1b8f0a9c5
JWT_ALG=HS256
JWT_ACCESS_TTL_MIN=60

# Auth (ОБЯЗАТЕЛЬНО True!)
TG_AUTH=True
```

## Docker

Для Docker используй `.env.docker`:

```bash
cp .env.example .env.docker
# Отредактируй .env.docker с реальными значениями
```

Запуск:
```bash
docker-compose --env-file .env.docker up --build
```

## Важно!

- ❌ НЕ коммить `.env.local`, `.env.docker` с реальными секретами
- ✅ Коммитить только `.env.example` с примерами
- 🔑 Секреты должны совпадать на фронте и бэке!
