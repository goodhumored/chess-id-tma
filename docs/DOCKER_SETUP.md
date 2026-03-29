# Docker Setup Guide

## Исправленные проблемы

1. ✅ Конвертирован `next.config.ts` → `next.config.mjs` (не требует TypeScript в runtime)
2. ✅ Добавлена поддержка переменных окружения для статического экспорта
3. ✅ Создан `docker-compose.yml` для удобного запуска

## Запуск в Docker

### Вариант 1: С docker-compose (рекомендуется)

```bash
# Сборка и запуск
docker-compose up --build

# Или в фоновом режиме
docker-compose up -d --build

# Остановка
docker-compose down
```

### Вариант 2: С docker build/run

```bash
# Сборка с передачей переменных окружения
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://212.34.141.4:8080 \
  --build-arg NEXT_PUBLIC_API_SECRET=9f3c2e7a1d4b8a6f0c5e9d7a2b4f6e1c8a0d9b3e5f7c2a4e6d1b8f0a9c5 \
  -t chessid-tma .

# Запуск контейнера
docker run -p 3000:3000 chessid-tma
```

## Переменные окружения

Переменные можно задать в `.env.docker` файле:

```bash
NEXT_PUBLIC_API_URL=http://212.34.141.4:8080
NEXT_PUBLIC_API_SECRET=9f3c2e7a1d4b8a6f0c5e9d7a2b4f6e1c8a0d9b3e5f7c2a4e6d1b8f0a9c5
```

Затем запустить с этим файлом:

```bash
docker-compose --env-file .env.docker up --build
```

## Важно!

Поскольку используется **static export** (`output: "export"`), переменные окружения `NEXT_PUBLIC_*` должны быть доступны **во время сборки**, а не во время выполнения. Dockerfile уже настроен для этого.

## Проверка

После запуска приложение будет доступно по адресу:
```
http://localhost:3000
```

## Troubleshooting

Если видишь ошибку про TypeScript:
- ✅ Исправлено: Теперь используется `next.config.mjs` вместо `.ts`

Если API не работает:
- Проверь, что переменные окружения правильно переданы в `docker build`
- Убедись, что бэкенд доступен по адресу `http://212.34.141.4:8080`
