# План исправления авторизации

## Проблема

Фронтенд не использует правильный flow авторизации через Telegram Mini App. Все API запросы будут отклоняться с 401, потому что нет JWT токена в cookies.

## Как работает авторизация на бэкенде

### 1. Telegram Auth Flow

```
Client → POST /api/v1/auth/telegram
Body: { init_data: "...", phone?: "...", city?: "..." }
         ↓
Backend валидирует init_data через HMAC-SHA256
         ↓
Backend генерирует JWT токен
         ↓
Backend устанавливает HttpOnly cookie: access_token
         ↓
Backend возвращает redirect на /api/v1/users/me (303)
```

### 2. Auth Middleware

- Проверяет **ВСЕ** запросы (кроме `/api/v1/auth/*`, `/docs`, `/openapi.json`, `/static`)
- Читает JWT из cookie `access_token`
- Если токена нет или он невалидный → **401 Unauthorized**
- Если токен валидный → добавляет `user_id` в `request.state`

### 3. Конфигурация бэкенда

```bash
TELEGRAM_BOT_TOKEN=<ваш_бот_токен>  # Для валидации initData
JWT_SECRET=9f3c2e7a1d4b8a6f0c5e9d7a2b4f6e1c8a0d9b3e5f7c2a4e6d1b8f0a9c5
JWT_ALG=HS256
JWT_ACCESS_TTL_MIN=60
TG_AUTH=True  # ОБЯЗАТЕЛЬНО включить!
```

## Что нужно исправить

### 1. Создать сервис для авторизации

**Файл:** `src/services/auth.service.ts`

```typescript
import { API_CONFIG } from "@/config/api.config";

export type TelegramAuthRequest = {
  init_data: string;
  phone?: string | null;
  city?: string | null;
};

export class AuthService {
  async authenticateWithTelegram(
    initData: string,
    phone?: string,
    city?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Secret": API_CONFIG.SECRET,
        },
        credentials: "include", // ВАЖНО! Для cookies
        body: JSON.stringify({
          init_data: initData,
          phone: phone || null,
          city: city || null,
        }),
      });

      // Backend возвращает 303 redirect, но fetch не следует за ним автоматически
      // Нам главное, что cookie установлена
      return response.ok || response.status === 303;
    } catch (error) {
      console.error("Telegram auth failed:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
```

### 2. Обновить AuthProvider

**Файл:** `src/components/AuthProvider.tsx`

```typescript
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTelegram } from "./TelegramProvider";
import { User } from "../domain/user-repo.interface";
import UsersService from "../domain/user-service";
import UsersRestRepository from "../infractructure/users-rest.repository";
import { authService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user: tgUser, isReady, webApp } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function authenticateUser() {
      if (!isReady || !tgUser?.id || !webApp) {
        setIsLoading(false);
        return;
      }

      try {
        // ШАГ 1: Получить initData от Telegram
        const initData = webApp.initData;
        if (!initData) {
          console.error("No initData from Telegram WebApp");
          setIsLoading(false);
          return;
        }

        // ШАГ 2: Отправить initData на бэкенд для авторизации
        // Это установит JWT cookie
        const authSuccess = await authService.authenticateWithTelegram(
          initData,
          undefined, // phone - можно добавить позже
          undefined  // city - можно добавить позже
        );

        if (!authSuccess) {
          console.error("Telegram authentication failed");
          setIsLoading(false);
          return;
        }

        // ШАГ 3: Теперь с установленным JWT cookie можем делать API запросы
        const userRepo = new UsersRestRepository();
        const userService = new UsersService(userRepo);

        // Получаем пользователя по Telegram ID
        const authenticatedUser = await userService.findByTelegramId(
          String(tgUser.id)
        );

        if (authenticatedUser) {
          setUser(authenticatedUser);
        } else {
          console.error("User not found after authentication");
        }
      } catch (error) {
        console.error("Failed to authenticate user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    authenticateUser();
  }, [isReady, tgUser, webApp]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Обновить httpClient для работы с cookies

**Файл:** `src/lib/http-client.ts`

```typescript
import { API_CONFIG } from "../config/api.config";

export class HttpClient {
  private baseURL: string;
  private secret: string;

  constructor(
    baseURL: string = API_CONFIG.BASE_URL,
    secret: string = API_CONFIG.SECRET,
  ) {
    this.baseURL = baseURL;
    this.secret = secret;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.secret) {
      headers["X-API-Secret"] = this.secret;
    }

    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // ВАЖНО! Отправляем cookies с каждым запросом
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      throw error;
    }
  }

  // ... rest of methods
}
```

### 4. Проверить TelegramProvider

Убедиться, что `webApp` доступен в контексте:

**Файл:** `src/components/TelegramProvider.tsx`

```typescript
// В контекст нужно добавить webApp:
interface TelegramContextType {
  webApp: WebApp | null;
  user: WebAppUser | null;
  isReady: boolean;
}

// В провайдере:
<TelegramContext.Provider value={{ webApp, user, isReady }}>
  {children}
</TelegramContext.Provider>
```

## Важные моменты

### 1. Credentials: "include"

Обязательно добавить `credentials: "include"` во все fetch запросы, чтобы браузер:
- Отправлял cookies с запросами
- Сохранял cookies из ответов

### 2. CORS на бэкенде

Бэкенд должен правильно настроить CORS для работы с cookies:

```python
# В main.py или где настроен CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,  # ВАЖНО!
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Secure cookies в production

В production убедиться, что:
- Фронтенд работает по HTTPS
- Backend устанавливает `secure=True` для cookies
- `sameSite="lax"` или `sameSite="none"` (если cross-domain)

### 4. Telegram Bot Token

На бэкенде в `.env` должен быть настроен:
```bash
TELEGRAM_BOT_TOKEN=<получить_у_@BotFather>
```

Без него валидация `initData` не будет работать.

## Порядок внедрения

1. ✅ Создать `src/services/auth.service.ts`
2. ✅ Обновить `TelegramProvider` чтобы экспортировал `webApp`
3. ✅ Обновить `httpClient` добавить `credentials: "include"`
4. ✅ Обновить `AuthProvider` использовать новый flow
5. ✅ Проверить на бэкенде настройки CORS
6. ✅ Протестировать auth flow

## Тестирование

После внедрения изменений:

1. Открыть приложение в Telegram
2. Проверить в DevTools → Network:
   - `POST /api/v1/auth/telegram` возвращает 303/200
   - В Response Headers есть `Set-Cookie: access_token=...`
   - Последующие запросы содержат `Cookie: access_token=...`
3. Проверить что API запросы работают без 401 ошибок

## Альтернативный вариант: отключить auth на бэкенде (НЕ рекомендуется!)

Если нужно временно протестировать без auth:

```bash
# В .env на бэкенде
TG_AUTH=False
```

Но это **небезопасно для production**!
