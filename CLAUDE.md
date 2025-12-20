# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChessID (chronolog.online) is a Telegram Mini App built with Next.js 15 for discovering and managing chess events. The application is designed to run inside Telegram as a web app, integrating with the Telegram WebApp API.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (with Turbopack)
pnpm dev

# Production build (with Turbopack)
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

The dev server runs on http://localhost:3000 by default.

## Architecture

### Layered Architecture Pattern

This codebase follows a **clean architecture** approach with clear separation between domain, infrastructure, and UI layers:

```
src/
├── domain/              # Business logic and interfaces
├── infractructure/      # Data access implementations (note the typo in folder name)
├── components/          # React components
└── app/                 # Next.js App Router pages
```

### Domain Layer (`src/domain/`)

Contains business entities, service classes, and repository interfaces. This layer has no dependencies on external frameworks or implementations.

**Key entities:**
- `ChessEvent` - Core domain model for chess events (tournaments, training, meetings, lectures)
- `ChessEventsService` - Business logic for event operations
- `UsersService` - Business logic for user operations

**Repository interfaces:**
- `ChessEventsRepository` - Interface defining event data access methods
- `UsersRepository` - Interface defining user data access methods

The service classes accept repository interfaces via dependency injection in their constructors, allowing flexible data source switching.

### Infrastructure Layer (`src/infractructure/`)

**Note:** The folder is spelled "infractructure" (missing "s"). This is consistent throughout the codebase.

Contains concrete implementations of repository interfaces:
- `ChessEventsMockRepository` - In-memory mock data (currently used)
- `ChessEventsRestRepository` - REST API implementation (not yet implemented)
- `UsersMockRepository` - In-memory user data
- `UsersRestRepository` - REST API for users (not yet implemented)

The mock repositories contain hardcoded Russian-language data for development and testing.

### Telegram Integration

The app is a **Telegram Mini App** and requires Telegram WebApp context to function properly:

**TelegramProvider** (`src/components/TelegramProvider.tsx`):
- Client-side React context provider that initializes Telegram WebApp
- Loads Telegram script from `https://telegram.org/js/telegram-web-app.js?59` (included in layout.tsx)
- Calls `window.Telegram.WebApp.ready()` and `.expand()`
- Provides `useTelegram()` hook for accessing:
  - `webApp` - Full Telegram WebApp API
  - `user` - Current Telegram user data
  - `isReady` - Whether Telegram context is initialized
- Applies Telegram theme colors as CSS variables
- Handles viewport changes via `viewportChanged` events to set `--tg-full-height`

**Root Layout** (`src/app/layout.tsx`):
- Wraps entire app in `<TelegramProvider>`
- Includes persistent `<AppBar>` component at bottom
- Uses Plus Jakarta Sans font from Google Fonts
- Configures viewport with `userScalable: false` and `viewportFit: cover` for mobile optimization

### UI Components

**AppBar** (`src/components/layout/AppBar.tsx`):
- Bottom navigation bar visible across all pages
- Fixed position at bottom with 24px padding

**EventCard** (`src/components/event-card.tsx`):
- Displays chess event information
- Shows event type, date, location, participants, and image

## Backend Integration

### API Configuration

Backend API base URL is configured in `src/config/api.config.ts`:
- Default: `https://api.chess-id.goodhumored.ru`
- Can be overridden via `NEXT_PUBLIC_API_URL` environment variable
- HTTP client wrapper available at `src/lib/http-client.ts`

### User Authentication

Authentication flow via Telegram Mini App:
1. `TelegramProvider` initializes Telegram WebApp and extracts user data
2. `AuthProvider` wraps the app and handles authentication:
   - Automatically fetches/creates user on app load via `telegram_id`
   - Uses `UsersRestRepository` to call backend API
   - Provides `useAuth()` hook with `user`, `isLoading`, `isAuthenticated`
3. Backend endpoints:
   - `GET /api/v1/users/telegram/{telegram_id}` - Get user by Telegram ID
   - `POST /api/v1/users/` - Create new user
   - `PUT /api/v1/users/id/{user_id}` - Update user

**Important:** Backend should validate `initData` from Telegram to ensure authenticity. Current implementation trusts the Telegram user data without validation on the backend.

### Repository Implementations

Two implementations exist for each repository:
- **Mock repositories** (`*-mock.repository.ts`): In-memory data for development
- **REST repositories** (`*-rest.repository.ts`): Real API calls via HTTP client

To switch between implementations, instantiate the desired repository when creating services:
```typescript
// Using REST API
const userRepo = new UsersRestRepository();
const userService = new UsersService(userRepo);

// Using mock data
const userRepo = new UsersMockRepository();
const userService = new UsersService(userRepo);
```

**Note:** Events API endpoints are not yet implemented on the backend. The app currently uses `ChessEventsMockRepository` for events. When backend adds events endpoints, implement `ChessEventsRestRepository` following the same pattern as `UsersRestRepository`.

## Configuration Notes

### Static Export

`next.config.ts` is configured for **static export** (`output: "export"`):
- Generates static HTML files
- Images are unoptimized (`unoptimized: true`)
- Allowed image domains: picsum.photos, lh3.googleusercontent.com, i.pravatar.cc

### TypeScript

TypeScript is configured with **strict mode** and extensive compiler checks enabled (`tsconfig.json`):
- `strict: true`
- `exactOptionalPropertyTypes: true`
- `noUncheckedIndexedAccess: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

Path alias: `@/*` maps to `./src/*`

### Styling

- Uses Tailwind CSS 4 with `@tailwindcss/postcss`
- Tailwind important selector is used (note the `!` in classes like `bg-background!`, `pb-24!`)
- Custom fonts: Roboto and HUMakingfilm are included in `src/app/_fonts/`

## Docker Deployment

Multi-stage Dockerfile using Node 18 Alpine:
- Uses **pnpm** as package manager
- Builder stage: Installs all deps and runs build
- Production stage: Installs only prod deps, runs as non-root user (nextjs:nodejs)
- Exposes port 3000
- Disables Next.js telemetry

## Repository State

**Current state (as of git status):**
- Many files are staged (Added) but not yet committed
- Some files are modified after staging (AM status): `globals.css`, `layout.tsx`, `TelegramProvider.tsx`, `event-card.tsx`, `AppBar.tsx`
- One file deleted after staging: `src/app/events/[slug]/page.tsx`
- Untracked directories: `src/app/events/`, `src/app/my-events/`

The REST repository implementations are placeholders that throw "Method not implemented" errors. The app currently uses mock repositories for all data access.
