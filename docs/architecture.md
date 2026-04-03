# architecture.md

## Project overview
**Cyprus Villages** — a platform for a festival calendar across Cypriot villages.

The first phase delivers **MVP1 web application**:
- public website;
- festival calendar;
- festival and village pages;
- map;
- administrative panel for content management.

The second phase delivers **MVP2 Telegram Mini App**, using the same domain model and the same backend API.

---

## Product goals
The system must solve the following problems:
- aggregate festivals across Cypriot villages in one place;
- display event dates and statuses, including `TBA`;
- store parking, main festival venue, and other useful location points;
- support fast routine content editing through the admin panel;
- allow expanding the village and festival catalogue without redesigning the architecture;
- prepare the technical foundation for the Telegram Mini App.

---

## High-level architecture
The project is designed as a **monorepo**.

### Repository structure
```text
apps/
  web/                # Next.js, public app + admin panel
  api/                # NestJS backend
packages/
  shared-types/       # shared TypeScript types
  shared-constants/   # shared constants
  shared-schemas/     # zod schemas and validation
  shared-config/      # shared eslint/tsconfig and other configs
database/
  prisma/             # schema, migrations, seed data
infra/
  compose/            # docker compose for local development
  docker/             # Dockerfiles / nginx
  env/                # .env example files
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
- **next-intl** or equivalent i18n layer — added in a later phase

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
- **Docker Compose** for local PostgreSQL
- later: CI/CD and deployment configuration

---

## Why this stack

### Next.js
Suitable for:
- SEO-friendly festival and village pages;
- SSR/ISR;
- a single application with public and admin zones;
- mobile-first UI that can later be adapted for the Mini App.

### Mantine
Chosen as the single UI library for:
- the public application;
- the admin panel;
- forms, modals, drawer panels, and layout;
- straightforward theming for the Telegram Mini App in the future.

### NestJS
Suitable for:
- modular backend architecture;
- separate public and admin controllers;
- DTOs and typed validation;
- predictable API growth.

### Prisma + PostgreSQL
Suitable for:
- an explicit domain model;
- migration management;
- relational links between villages, festivals, editions, and map points.

---

## Domain model

### 1. Village
A village as a long-lived entity.

**Example fields:**
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
A persistent festival entity.

This is not a specific date but the festival itself as a recurring entity.

**Example fields:**
- `id`
- `slug`
- `villageId`
- `titleEn`, `titleRu`, `titleEl`
- `category`
- `shortDescriptionEn`, `shortDescriptionRu`, `shortDescriptionEl`
- `isActive`

### 3. FestivalEdition
A concrete yearly instance of a festival.

**Example fields:**
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
A geographic point of interest linked to a village or a specific festival edition.

**Example fields:**
- `id`
- `villageId?`
- `festivalEditionId?`
- `type` (`parking | venue | meeting | wc | shuttle | viewpoint`)
- `label`
- `lat`, `lng`
- `note`
- `isActive`

### 5. Media
Images and media assets.

**Example fields:**
- `id`
- `url`
- `alt`
- `width`
- `height`
- `kind`

### 6. AuditLog
A log of administrative changes.

**Example fields:**
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
1. `Festival` and `FestivalEdition` are distinct entities and must not be mixed.
2. Year, dates, parking, venue, and source belong to `FestivalEdition`.
3. Only published editions are shown publicly.
4. Villages and festivals are archived by default, not hard deleted.
5. When a date is unknown, `isDateTba = true` is used.
6. Coordinates are stored as normalised numeric fields.
7. The model must be ready for multilingual support.

---

## MVP trade-offs

Several implementation simplifications are intentional for MVP1 and should not be treated as bugs or oversights. They were chosen to keep scope manageable while the dataset and team are small.

Examples currently present in this document:
- **In-memory month filtering** — `GET /festivals?month=` filters published editions in the application layer rather than SQL. Acceptable at current data volume; see *Schema design decisions* for the full rationale and future optimisation path.
- **Client-side map point filtering** — village and festival detail pages fetch all active `LocationPoint` records and filter in the browser. Efficient while the point count is small; see *Maps strategy* for the planned scoped-endpoint improvement.
- **Limited admin UI for LocationPoints** — the admin UI supports single-ownership point creation only. The domain and API support dual-ownership; the UI gap is intentional for MVP1; see *Schema design decisions*.

Each trade-off is documented inline with its rationale and a defined improvement path. They should be revisited as data volume grows, the admin team expands, or product complexity increases.

---

## Frontend architecture (FSD)
The frontend is built using **Feature-Sliced Design**.

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

### Layer responsibilities

#### `app`
Global providers, layout, configuration, theme, router composition.

#### `pages`
Route-level composition.

#### `widgets`
Large UI blocks composed from multiple entities and features.

#### `features`
User actions and scenarios.
Examples:
- filter festivals
- search festivals
- create festival
- update village
- publish festival edition

#### `entities`
Business entities and their UI/model/api.
Examples:
- festival
- festival-edition
- village
- location-point

#### `shared`
Reusable base layer:
- UI-kit wrappers
- API clients
- hooks
- helper utilities
- constants
- Telegram bridge

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
In MVP1 this is a **single web application** with two logical zones:

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

Both zones share:
- one backend;
- one domain model;
- a single shared layer.

---

## Backend architecture
The backend is built as a modular monolith.

### Structure
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
1. Public controllers and admin controllers must be separated.
2. DTOs are mandatory.
3. Validation is mandatory.
4. Business logic must live in services.
5. Data access must be centralised and predictable.
6. `PrismaClient` must never be instantiated directly — always use the injected `PrismaService`. Prisma 7.5 removed the native binary engine; calling `new PrismaClient()` without a driver adapter throws at runtime. The `PrismaService` constructor handles adapter setup. In standalone scripts (seed, migrations), use the `PrismaPg` adapter pattern from `database/prisma/seed/index.ts` as the reference.

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
1. PostgreSQL is the primary source of truth.
2. The Prisma schema is stored in `database/prisma`.
3. Migrations must be versioned.
4. Seed data must be available for local development.
5. Status and activity fields must support archiving and publishing workflows.
6. The Prisma client is not generated automatically on install. Any environment (local or CI) must run `pnpm db:generate` before typechecking or running the backend. This requirement is enforced in CI and must be preserved.

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

### LocationPoint ownership is immutable after creation

Once a `LocationPoint` row is created, its `villageId` and `festivalEditionId` may not be changed via an update operation. Changing ownership is a semantic replacement, not an edit — the correct workflow is to archive the existing point and create a new one with the intended ownership.

This is an intentional domain invariant, not an API limitation:
- **Audit integrity:** the creation record carries ownership context. Silently reassigning ownership would make the audit trail misleading — a record created as "shuttle stop for the 2024 Limassol Wine Festival" should not become "permanent Omodos viewpoint" by patching a FK.
- **Semantic clarity:** the two points are different domain objects. The archive + create workflow makes the intent explicit and preserves full history.

### LocationPoint dual ownership — admin UI limitation

The domain model and service layer support all three valid ownership states (village-only, edition-only, or both). The admin UI currently supports only single-ownership creation:
- "Add point" from the village edit page creates a village-only point (`villageId` set, `festivalEditionId` null).
- "Add point" from the festival edition edit page creates an edition-only point (`festivalEditionId` set, `villageId` null).

Creating a dual-ownership point (both FKs set) is not exposed in the UI. This is an intentional MVP1 simplification — the use case exists but is uncommon and can be handled via the admin API or directly until a dedicated UI flow is warranted.

This limitation is strictly in the admin UI. The domain model, service layer, and API all accept and validate dual-ownership records correctly.

### MediaKind is a presentation role enum

`MediaKind` values (`GALLERY`, `COVER`, `THUMBNAIL`) describe the presentation role of a media asset, not its file type. All values are role-oriented.

This is intentional for MVP1 where only image files are supported. If other file types (PDF, video) are added later, the kind system should be reviewed separately.

### AuditAction.DELETE is intentionally kept

The general product rule is to prefer archive/deactivate over hard delete. However, `DELETE` is kept in `AuditAction` because hard deletes can occur for legitimate technical or admin reasons (data-entry mistakes, GDPR erasure, duplicate records).

Any hard delete must be logged using `AuditAction.DELETE` so the audit trail remains intact. `DELETE` in the audit log does not imply that hard delete is an approved business flow — it is the log entry for an exceptional action.

### Festival filtering: month is partially in-memory (MVP simplification)

`GET /api/v1/festivals` supports four optional query parameters: `category`, `villageId`, `year`, and `month`.

`category` and `villageId` are applied at the database level. `year` is also applied at the database level via an `editions.some({ status: PUBLISHED, year })` subquery.

`month` is currently applied in-memory: after the database returns festivals with their published editions, the service filters editions whose `startDate` falls in the requested month and drops festivals with no remaining editions.

This is an intentional MVP simplification:
- The dataset is small and in-memory filtering adds no meaningful overhead.
- Moving month logic into SQL would require a date-extraction expression in the Prisma `where` clause, which increases query complexity for marginal gain at current scale.

**Future optimisation:** if the dataset grows, month filtering should move fully to the database level (e.g. using a raw `EXTRACT(MONTH FROM "startDate") = $1` condition or a generated column). Any such migration must preserve two invariants:
1. Filtering is applied only to `PUBLISHED` editions — draft, archived, and cancelled editions must never influence public results.
2. `Festival` and `FestivalEdition` semantics must remain separate — a festival must not be excluded based on its own fields when the filter concern belongs to its editions.

### displayEdition — presentation helper on the public list response

`GET /api/v1/festivals` includes a `displayEdition` field on each festival in the list. This is a **presentation helper**, not a domain merge — `Festival` and `FestivalEdition` remain distinct entities.

`displayEdition` is the specific published edition the frontend should use for timeline grouping, date display, and Soon/Ongoing badge logic. It is selected based on the active request filters:

- **year + month**: edition matching both year and `startDate` month
- **year only**: edition matching year
- **month only**: edition with `startDate` in that month (TBA editions with `null startDate` are never matched)
- **no filters**: latest published edition (year desc)

If no edition matches the active filter, the selection falls back to all published editions. Within any candidate group, the tiebreak is: year desc → startDate asc (nulls last) → id desc.

`displayEdition` is absent on the detail (slug) endpoint — use `editions[0]` there.

### Time fields as "HH:mm" strings

`FestivalEdition.startTime` and `endTime` are stored as plain `String` in `"HH:mm"` format.

This is an intentional MVP1 simplification:
- Cyprus festivals are local-time events with no cross-timezone scheduling requirements.
- All times are assumed to be Cyprus local time (EET/EEST, UTC+2/UTC+3).
- Times are display-oriented, not used for timestamp arithmetic.

If cross-timezone support or calendar integration is required in the future, a `timestamptz` field should be added. The string fields can remain for display convenience.

---

## Localization strategy
Data should be designed for future localization from the start.

Basic approach for MVP:
- store `nameEn`, `nameRu`, `nameEl` inline on each entity.

Translation tables can be introduced later if a more flexible model is required.

---

## Maps strategy
The application must support an interactive map.

### Requirements
- festival map;
- parking point;
- venue point;
- additional points of interest;
- normalised `lat/lng` fields;
- coordinate editing in the admin panel.

### Public map points: client-side filtering on detail pages (MVP trade-off)

The public map endpoint (`GET /api/v1/map/points`) returns all active `LocationPoint` records in a single response. On village and festival detail pages the frontend fetches this full dataset and filters client-side to the points relevant to the current entity.

This is an intentional MVP trade-off:
- The total number of active points is small; a single cached response is cheaper than per-entity round trips.
- TanStack Query caches the result, so navigating between multiple detail pages reuses the same fetch.

**Future improvement:** once the point count grows or per-entity performance becomes a concern, introduce scoped endpoints (`GET /map/points?villageId=` / `GET /map/points?festivalEditionId=`) or embed relevant points directly in the entity detail API responses. The client-side filtering logic can then be replaced with a dedicated query per page context.

---

## Telegram Mini App readiness
Although the Mini App is planned for phase two, the groundwork must be laid from the start.

### What must be prepared in MVP1
- mobile-first UI;
- a single public API;
- shared types and schemas;
- an abstraction layer for the Telegram bridge;
- independence of core domain logic from the transport layer;
- no desktop-only assumptions in critical user flows.

### Suggested frontend preparation
```text
shared/lib/telegram/
  init.ts
  theme.ts
  viewport.ts
  back-button.ts
  types.ts
```

In MVP1 this can be a thin adapter with safe no-op implementations.

---

## Security and access
### Roles
- `super_admin`
- `content_admin`
- `editor`

### Basic role policy
- `editor` — creates and edits drafts;
- `content_admin` — publishes and archives;
- `super_admin` — manages users, roles, and system settings.

---

## Admin UX principles
The admin panel must be optimised for fast routine content changes.

### Key admin scenarios
- change a festival date;
- mark a date as `TBA`;
- update a parking point;
- add a new village;
- hide a village;
- publish a festival edition;
- archive an edition;
- review the change history.

### UI expectations
- list tables;
- edit forms;
- drawer/modal patterns;
- map picker for coordinates;
- publish and archive actions.

---

## Architectural constraints
1. Do not build a separate independent model for the Mini App.
2. Do not mix public and admin responsibilities.
3. Do not store festival dates only as display strings.
4. Do not use hard delete by default.
5. Do not put all logic into shared.
6. Do not allow uncontrolled direct imports of the UI library where the design system layer in shared/ui is required.

---

## Recommended implementation sequence
1. Monorepo scaffolding.
2. Initialize `apps/web`.
3. Initialize `apps/api`.
4. Configure workspace and shared packages.
5. Set up Prisma and PostgreSQL.
6. Configure Mantine and base layouts.
7. Implement the Village domain.
8. Implement the Festival + FestivalEdition domain.
9. Implement LocationPoint management.
10. Add the public festival list and detail pages.
11. Add admin CRUD.
12. Add audit logging.
13. Add localization.
14. Prepare the Telegram bridge.

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
- favourites;
- user cabinet;
- advanced analytics;
- automated source parsing.

---

## Final architectural statement
The project must be developed as a **unified content-domain platform** for festivals of Cypriot villages, where:
- the web app and the future Mini App share one backend;
- the public zone and the admin panel are logically separated but run on the same domain;
- `FestivalEdition` is a mandatory entity;
- data supports editing, archiving, and partial uncertainty (`TBA`);
- the architecture is ready to scale without rewriting the core.
