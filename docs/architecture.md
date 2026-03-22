# architecture.md

## Project overview
**Cyprus Villages** — платформа для календаря фестивалей в кипрских деревнях.

На первом этапе создаётся **MVP1 web application**:
- публичный сайт;
- календарь фестивалей;
- страницы фестивалей и деревень;
- карта;
- административная панель для управления данными.

На втором этапе создаётся **MVP2 Telegram Mini App**, использующий ту же доменную модель и тот же backend API.

---

## Product goals
Система должна решать следующие задачи:
- собрать фестивали по кипрским деревням в одном месте;
- показывать даты и статусы событий, включая `TBA`;
- хранить данные о парковке, основной точке фестиваля и других полезных точках;
- поддерживать оперативное редактирование контента через admin panel;
- позволять расширять справочник деревень и фестивалей без переделки архитектуры;
- подготовить техническую базу для Telegram Mini App.

---

## High-level architecture
Проект проектируется как **monorepo**.

### Repository structure
```text
apps/
  web/                # Next.js, public app + admin panel
  api/                # NestJS backend
packages/
  shared-types/       # общие типы
  shared-constants/   # общие константы
  shared-schemas/     # zod-схемы и валидация
  shared-config/      # конфиги eslint/tsconfig и др.
database/
  prisma/             # schema, migrations, seeds
infra/
  compose/            # docker compose for local/dev
  docker/             # Dockerfiles / nginx
  env/                # .env examples
docs/
  architecture.md
  stack-decisions.md
  roadmap-pwa-testing.md
```

---

## Technology stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript** + React 19
- **Mantine 8**
- **TanStack Query 5**
- **react-hook-form 7** + **zod 4**
- **Zustand 5**
- **Leaflet / react-leaflet 5**
- **next-intl** or equivalent i18n layer later

### Backend
- **NestJS 11**
- **TypeScript**
- **Prisma 7**
- **PostgreSQL**
- **class-validator / class-transformer**
- **Swagger / OpenAPI**

### Infrastructure
- **pnpm workspace**
- **Turborepo**
- **Node 24 LTS**
- **Docker Compose** for local Postgres
- later: CI/CD and deployment configs

---

## Why this stack

### Next.js
Подходит для:
- SEO-страниц фестивалей и деревень;
- SSR/ISR;
- одного приложения с public и admin зонами;
- mobile-first UI, пригодного для последующей адаптации в Mini App.

### Mantine
Выбран как единая UI-библиотека для:
- публичного приложения;
- админ-панели;
- форм, модалок, drawer-панелей, layout;
- лёгкой тематизации под Telegram Mini App в будущем.

### NestJS
Подходит для:
- модульной backend-архитектуры;
- админских и публичных контроллеров;
- DTO и типизированной валидации;
- понятного роста API.

### Prisma + PostgreSQL
Подходит для:
- явной доменной модели;
- миграций;
- реляционных связей между деревнями, фестивалями, edition и точками на карте.

---

## Domain model

### 1. Village
Деревня как постоянная сущность.

**Пример полей:**
- `id`
- `slug`
- `nameEn`, `nameRu`, `nameEl`
- `district`
- `region`
- `descriptionEn`, `descriptionRu`, `descriptionEl`
- `centerLat`, `centerLng`
- `isActive`
- `createdAt`, `updatedAt`

### 2. Festival
Постоянная сущность фестиваля.

Это не конкретная дата, а сам фестиваль как recurring entity.

**Пример полей:**
- `id`
- `slug`
- `villageId`
- `titleEn`, `titleRu`, `titleEl`
- `category`
- `shortDescriptionEn`, `shortDescriptionRu`, `shortDescriptionEl`
- `isActive`

### 3. FestivalEdition
Конкретный выпуск фестиваля в определённом году.

**Пример полей:**
- `id`
- `festivalId`
- `year`
- `startDate`
- `endDate`
- `isDateTba`
- `startTime`
- `endTime`
- `venueName`
- `venueLat`, `venueLng`
- `parkingName`
- `parkingLat`, `parkingLng`
- `officialUrl`
- `sourceUrl`
- `sourceNote`
- `status` (`draft | published | archived | cancelled`)
- `lastVerifiedAt`
- `publishedAt`

### 4. LocationPoint
Точка на карте, связанная с деревней или конкретным выпуском фестиваля.

**Пример полей:**
- `id`
- `villageId?`
- `festivalEditionId?`
- `type` (`parking | venue | meeting | wc | shuttle | viewpoint`)
- `label`
- `lat`, `lng`
- `note`
- `isActive`

### 5. Media
Изображения и медиа.

**Пример полей:**
- `id`
- `url`
- `alt`
- `width`
- `height`
- `kind`

### 6. AuditLog
Журнал административных изменений.

**Пример полей:**
- `id`
- `userId`
- `entityType`
- `entityId`
- `action`
- `beforeJson`
- `afterJson`
- `createdAt`

---

## Core domain principles
1. `Festival` и `FestivalEdition` — разные сущности, их нельзя смешивать.
2. Год, даты, parking, venue и source относятся к `FestivalEdition`.
3. Публично показываются только опубликованные edition.
4. Деревни и фестивали по умолчанию архивируются, а не удаляются физически.
5. Если дата неизвестна, используется `isDateTba = true`.
6. Координаты хранятся нормализованно как числа.
7. Должна быть готовность к мультиязычности.

---

## Frontend architecture (FSD)
Frontend должен быть реализован по **Feature-Sliced Design**.

### Layers
```text
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

### Responsibilities

#### `app`
Глобальные провайдеры, layout, config, theme, router composition.

#### `pages`
Route-level composition.

#### `widgets`
Крупные UI-блоки из нескольких сущностей и фич.

#### `features`
Пользовательские действия и сценарии.
Примеры:
- filter festivals
- search festivals
- create festival
- update village
- publish festival edition

#### `entities`
Бизнес-сущности и их UI/model/api.
Примеры:
- festival
- festival-edition
- village
- location-point

#### `shared`
Переиспользуемый базовый слой:
- UI-kit wrappers
- api clients
- hooks
- helpers
- constants
- telegram bridge

---

## Frontend structure example
```text
apps/web/src/
  app/
    providers/
    layouts/
    config/
  pages/
    home/
    festivals/
    villages/
    map/
    admin/
  widgets/
    header/
    footer/
    festival-calendar/
    festival-map/
    admin-sidebar/
  features/
    festival/filter-festivals/
    festival/search-festivals/
    admin-festival/create-festival/
    admin-festival/update-festival/
    admin-village/create-village/
  entities/
    festival/
      model/
      api/
      ui/
    village/
      model/
      api/
      ui/
    location-point/
      model/
      api/
      ui/
  shared/
    api/
    ui/
    lib/
    hooks/
    config/
    i18n/
```

---

## Public app and admin app
На этапе MVP1 это **одно web-приложение**, но с двумя логическими зонами:

### Public zone
- home page
- festival list
- festival details
- villages list
- village details
- map view

### Admin zone
- dashboard
- villages CRUD
- festivals CRUD
- festival editions CRUD
- location points management
- media management
- audit log

Обе зоны используют:
- один backend;
- одну доменную модель;
- единый shared-слой.

---

## Backend architecture
Backend строится модульно.

### Suggested structure
```text
apps/api/src/
  main.ts
  app.module.ts
  common/
    config/
    database/
    dto/
    guards/
    filters/
    interceptors/
    utils/
  modules/
    auth/
    users/
    villages/
    festivals/
    festival-editions/
    location-points/
    media/
    audit-log/
    health/
```

### Principles
1. Public controllers и admin controllers должны быть разделены.
2. DTO обязательны.
3. Валидация обязательна.
4. Бизнес-логика должна жить в сервисах.
5. Работа с данными должна быть централизована и предсказуема.

---

## API segmentation

### Public API examples
```text
GET /api/v1/festivals
GET /api/v1/festivals/:slug
GET /api/v1/villages
GET /api/v1/villages/:slug
GET /api/v1/map/points
```

### Admin API examples
```text
POST   /api/v1/admin/villages
PATCH  /api/v1/admin/villages/:id
POST   /api/v1/admin/festivals
PATCH  /api/v1/admin/festivals/:id
POST   /api/v1/admin/festival-editions
PATCH  /api/v1/admin/festival-editions/:id
PATCH  /api/v1/admin/festival-editions/:id/publish
PATCH  /api/v1/admin/festival-editions/:id/archive
PATCH  /api/v1/admin/festival-editions/:id/change-parking
GET    /api/v1/admin/audit-log
```

---

## Database principles
1. PostgreSQL — основной источник истины.
2. Prisma schema хранится в `database/prisma`.
3. Миграции должны быть версионируемыми.
4. Должны быть seed-данные для локальной разработки.
5. Поля статусов и активности должны поддерживать архивирование и публикацию.

---

## Schema design decisions

This section documents intentional design choices in the Prisma schema that are not obvious from the model structure alone. These decisions must be respected by future migrations and service implementations.

### Media single-owner invariant

`Media` has three nullable foreign keys: `villageId`, `festivalId`, `festivalEditionId`.

**Invariant:** each `Media` row must have exactly one FK set. A media asset belongs to exactly one parent entity.

Prisma and PostgreSQL can express this with a CHECK constraint, but Prisma does not support CHECK constraints in schema.prisma. The invariant is enforced at the service layer — any service that creates or updates a `Media` record must validate that exactly one FK is non-null before writing.

If asset reuse across multiple entities becomes a requirement in the future, the correct solution is a many-to-many junction table, not relaxing this invariant.

### LocationPoint dual ownership

`LocationPoint` has two nullable FKs: `villageId` and `festivalEditionId`. Having both set simultaneously is intentional.

Three valid ownership states:
- `villageId` only — a permanent village landmark (viewpoint, public WC, etc.), shown on the village map at all times.
- `festivalEditionId` only — a temporary point specific to one edition (shuttle stop, event-only barrier, etc.).
- both set — a permanent village point that is also used as a festival edition point (e.g. the village main car park repurposed as festival parking). Shown on both the village map and the edition detail page.

An orphan row (both null) is invalid and must be rejected at the service layer.

### MediaKind is a presentation role enum

`MediaKind` values (`GALLERY`, `COVER`, `THUMBNAIL`) describe the presentation role of a media asset, not its file type. All values are role-oriented.

This is intentional for MVP1 where only image files are supported. If other file types (PDF, video) are added later, the kind system should be reviewed separately.

### AuditAction.DELETE is intentionally kept

The general product rule is to prefer archive/deactivate over hard delete. However, `DELETE` is kept in `AuditAction` because hard deletes can occur for legitimate technical or admin reasons (data-entry mistakes, GDPR erasure, duplicate records).

Any hard delete must be logged using `AuditAction.DELETE` so the audit trail remains intact. `DELETE` in the audit log does not imply that hard delete is an approved business flow — it is the log entry for an exceptional action.

### Time fields as "HH:mm" strings

`FestivalEdition.startTime` and `endTime` are stored as plain `String` in `"HH:mm"` format.

This is an intentional MVP1 simplification:
- Cyprus festivals are local-time events with no cross-timezone scheduling requirements.
- All times are assumed to be Cyprus local time (EET/EEST, UTC+2/UTC+3).
- Times are display-oriented, not used for timestamp arithmetic.

If cross-timezone support or calendar integration is required in the future, a `timestamptz` field should be added. The string fields can remain for display convenience.

---

## Localization strategy
На первом этапе желательно проектировать данные под будущую локализацию.

Базовый вариант для MVP:
- хранить `nameEn`, `nameRu`, `nameEl` в сущностях напрямую.

Позже можно перейти к translation tables, если потребуется более гибкая модель.

---

## Maps strategy
Приложение должно поддерживать карту.

### Requirements
- карта фестиваля;
- parking point;
- venue point;
- дополнительные точки;
- нормализованные `lat/lng` поля;
- возможность редактирования координат в admin panel.

---

## Telegram Mini App readiness
Хотя Mini App появится во втором этапе, подготовка должна быть заложена сразу.

### What should be prepared in MVP1
- mobile-first UI;
- единый Public API;
- shared types and schemas;
- abstraction layer for Telegram bridge;
- независимость core domain logic от transport layer;
- отсутствие desktop-only assumptions в ключевых flows.

### Suggested frontend preparation
```text
shared/lib/telegram/
  init.ts
  theme.ts
  viewport.ts
  back-button.ts
  types.ts
```

На MVP1 это может быть thin adapter с безопасными no-op реализациями.

---

## Security and access
### Roles
- `super_admin`
- `content_admin`
- `editor`

### Basic role policy
- `editor` — создаёт и редактирует черновики;
- `content_admin` — публикует и архивирует;
- `super_admin` — управляет пользователями, ролями и системными настройками.

---

## Admin UX principles
Админ-панель должна быть ориентирована на быстрые рутинные изменения контента.

### Important admin scenarios
- изменить дату фестиваля;
- отметить дату как `TBA`;
- обновить parking point;
- добавить новую деревню;
- скрыть деревню;
- опубликовать выпуск фестиваля;
- заархивировать выпуск;
- увидеть историю изменений.

### UI expectations
- таблицы списков;
- формы редактирования;
- drawer/modal patterns;
- map picker for coordinates;
- publish/archive actions.

---

## Architectural constraints
1. Не строить отдельную независимую модель для Mini App.
2. Не смешивать public и admin responsibilities.
3. Не хранить festival date только как display string.
4. Не использовать hard delete по умолчанию.
5. Не складывать всю логику в shared.
6. Не допускать прямого хаотичного импорта UI-библиотеки без обёрток в shared/ui там, где нужен контроль над design system.

---

## Recommended implementation sequence
1. Monorepo scaffolding.
2. Initialize `apps/web`.
3. Initialize `apps/api`.
4. Configure workspace and shared packages.
5. Setup Prisma and PostgreSQL.
6. Configure Mantine and base layouts.
7. Implement Village domain.
8. Implement Festival + FestivalEdition domain.
9. Implement LocationPoint management.
10. Add public festival list and details.
11. Add admin CRUD.
12. Add audit logging.
13. Add localization.
14. Prepare Telegram bridge.

---

## First release scope (MVP1)
### Included
- festival list;
- festival details;
- villages list;
- village details;
- map;
- admin panel;
- CRUD for villages and festivals;
- edition model;
- parking and venue coordinates;
- publish/archive workflow.

### Deferred
- Telegram Mini App UI;
- reminders;
- favorites;
- user cabinet;
- advanced analytics;
- automated source parsing.

---

## Final architectural statement
Проект должен разрабатываться как **единая контентно-доменная платформа** для фестивалей кипрских деревень, где:
- web и future mini app используют один backend;
- публичная часть и админка разделены логически, но работают на одном домене;
- `FestivalEdition` является обязательной сущностью;
- данные поддерживают редактирование, архивирование и неполную определённость (`TBA`);
- архитектура готова к масштабированию без переписывания ядра.
