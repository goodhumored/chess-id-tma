# API Integration Guide

## Обзор изменений

Код обновлен для работы с новым API бэкенда. Все REST репозитории реализованы и готовы к использованию.

## Конфигурация

### Переменные окружения (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://212.34.141.4:8080
NEXT_PUBLIC_API_SECRET=9f3c2e7a1d4b8a6f0c5e9d7a2b4f6e1c8a0d9b3e5f7c2a4e6d1b8f0a9c5
```

Секрет API передается в заголовке `X-API-Secret` при каждом запросе.

## Реализованные репозитории

### 1. ChessEventsRestRepository

**Файл:** `src/infractructure/chess-events-rest.repository.ts`

**Методы:**
- `findEvents(query)` - получить список событий с фильтрацией
- `getById(id)` - получить событие по ID
- `getUpcoming(limit)` - получить предстоящие события
- `search(query, skip, limit)` - поиск событий
- `create(event)` - создать новое событие
- `update(id, event)` - обновить событие
- `delete(id)` - удалить событие

**API endpoints:**
- `GET /api/v1/events/` - список событий
- `GET /api/v1/events/id/{id}` - событие по ID
- `GET /api/v1/events/upcoming` - предстоящие события
- `GET /api/v1/events/search/{query}` - поиск
- `POST /api/v1/events/` - создание
- `PUT /api/v1/events/id/{id}` - обновление
- `DELETE /api/v1/events/id/{id}` - удаление

### 2. CitiesRestRepository

**Файл:** `src/infractructure/cities-rest.repository.ts`

**Методы:**
- `getAll()` - получить все города
- `getById(id)` - получить город по ID
- `create(city)` - создать город
- `update(id, city)` - обновить город
- `delete(id)` - удалить город

**API endpoints:**
- `GET /api/v1/cities/`
- `GET /api/v1/cities/id/{id}`
- `POST /api/v1/cities/`
- `PUT /api/v1/cities/id/{id}`
- `DELETE /api/v1/cities/id/{id}`

### 3. EventRegistrationsRestRepository

**Файл:** `src/infractructure/event-registrations-rest.repository.ts`

**Методы:**
- `getRegistrations(query)` - получить список регистраций
- `getById(id)` - получить регистрацию по ID
- `create(registration)` - создать регистрацию
- `update(id, registration)` - обновить регистрацию
- `delete(id)` - удалить регистрацию
- `getUserRegistrations(userId, skip, limit)` - регистрации пользователя
- `getEventRegistrations(eventId, skip, limit)` - регистрации на событие
- `checkRegistration(userId, eventId)` - проверить регистрацию
- `getEventStats(eventId)` - статистика по событию

**API endpoints:**
- `GET /api/v1/event_regs/`
- `GET /api/v1/event_regs/id/{id}`
- `POST /api/v1/event_regs/`
- `PUT /api/v1/event_regs/id/{id}`
- `DELETE /api/v1/event_regs/id/{id}`
- `GET /api/v1/event_regs/user/{user_id}/registrations`
- `GET /api/v1/event_regs/event/{event_id}/registrations`
- `GET /api/v1/event_regs/check/{user_id}/{event_id}`
- `GET /api/v1/event_regs/event/{event_id}/stats`

### 4. UsersRestRepository

**Файл:** `src/infractructure/users-rest.repository.ts` (уже существовал, без изменений)

## Использование

### Переключение с Mock на REST API

Чтобы использовать реальный API вместо моковых данных:

```typescript
// Было (Mock):
import ChessEventsMockRepository from "@/infractructure/chess-events-mock.repository";
const repo = new ChessEventsMockRepository();

// Стало (REST API):
import ChessEventsRestRepository from "@/infractructure/chess-events-rest.repository";
const repo = new ChessEventsRestRepository();
```

### Пример работы с событиями

```typescript
import ChessEventsRestRepository from "@/infractructure/chess-events-rest.repository";
import ChessEventsService from "@/domain/chess-events-service";

const eventsRepo = new ChessEventsRestRepository();
const eventsService = new ChessEventsService(eventsRepo);

// Получить все события
const events = await eventsService.findEvents({});

// Получить предстоящие события
const upcomingEvents = await eventsRepo.getUpcoming(10);

// Поиск событий
const searchResults = await eventsRepo.search("турнир", 0, 20);

// Создать событие
const newEvent = await eventsRepo.create({
  organizer_id: 1,
  city_id: 1,
  title: "Новый турнир",
  description: "Описание",
  event_type: "tournament",
  datetime_start: new Date().toISOString(),
  address: "ул. Примерная, д. 1",
  limit_participants: 50,
  status: "draft"
});
```

### Пример работы с регистрациями

```typescript
import EventRegistrationsRestRepository from "@/infractructure/event-registrations-rest.repository";

const registrationsRepo = new EventRegistrationsRestRepository();

// Зарегистрировать пользователя на событие
const registration = await registrationsRepo.create({
  user_id: 1,
  event_id: 5
});

// Получить все регистрации пользователя
const userRegistrations = await registrationsRepo.getUserRegistrations(1);

// Получить все регистрации на событие
const eventRegistrations = await registrationsRepo.getEventRegistrations(5);

// Проверить, зарегистрирован ли пользователь
const isRegistered = await registrationsRepo.checkRegistration(1, 5);

// Получить статистику
const stats = await registrationsRepo.getEventStats(5);
```

## Изменения в модели данных

### ChessEvent

Модель `ChessEvent` обновлена для соответствия API:

```typescript
class ChessEvent {
  id: number;                    // было: string
  title: string;
  type: string | null;           // было: "tournament" | "training" | "meeting" | "lectures"
  date: Date;
  dateEnd: Date | null;          // новое поле
  location: string;              // теперь это address из API
  description: string | null;
  organizer: EventOrganizer;     // было: string
  city: EventCity;               // новое поле
  participants: number;
  maxParticipants: number | null;
  imageUrl: string;
  status: string;                // новое поле
  createdAt: Date;              // новое поле
}
```

## Тестирование API

Swagger документация доступна по адресу:
```
http://212.34.141.4:8080/docs
```

## Примечания

1. Mock репозитории (`*-mock.repository.ts`) обновлены для соответствия новой структуре модели и продолжат работать для локальной разработки
2. HTTP клиент автоматически добавляет секрет API в заголовок `X-API-Secret`
3. Все репозитории следуют паттерну dependency injection через интерфейсы
4. В `ChessEventsRestRepository` для изображений используется заглушка `https://i.pravatar.cc`, так как API не возвращает URL изображений
