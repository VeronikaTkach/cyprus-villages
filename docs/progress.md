# Cyprus Villages — Project Progress

> Last updated: 2026-03-24

---

## What is already implemented

### Infrastructure and monorepo

- pnpm workspaces + Turborepo
- Node 24 LTS, TypeScript 5 throughout
- Shared packages: `shared-types`, `shared-constants`, `shared-schemas`, `shared-config`
- Docker Compose for local PostgreSQL
- Environment variables via `.env.local`

---

### Database (`database/prisma`)

**Schema (all models):**
- `Village` — slug, nameEl, district, region, centerLat/Lng, isActive
- `VillageTranslation` — (villageId, locale) unique, name, description
- `Festival` — slug, villageId, titleEl, category, isActive
- `FestivalTranslation` — (festivalId, locale) unique, title, description
- `FestivalEdition` — year, dates, isDateTba, times, venue, parking, status lifecycle, source tracking
- `LocationPoint` — type, label, lat/lng, villageId?, festivalEditionId? (dual-ownership)
- `Media` — url, alt, kind (GALLERY/COVER/THUMBNAIL), single-owner invariant
- `User` — email, role (SUPER_ADMIN/CONTENT_ADMIN/EDITOR), isActive
- `AuditLog` — entityType, entityId, action, beforeJson, afterJson, userId

**Migrations:**
1. `20260320105229_initial_domain_schema` — full schema
2. `20260320130127_rename_media_kind_image_to_gallery` — enum value rename
3. `20260323120000_village_translations` — extracted VillageTranslation from flat columns
4. `20260324120000_festival_translations` — extracted FestivalTranslation, preserved titleEl

**Seed:**
- Villages (Omodos, Lefkara, Paphos, etc.) with translations
- Festivals with translations linked to villages
- Festival editions with dates, statuses, and coordinates

---

### Backend (NestJS, `apps/api`)

**Fully implemented modules:**

| Module | Public API | Admin API | Notes |
|--------|-----------|-----------|-------|
| `villages` | GET /villages, GET /villages/:slug | GET, POST, PATCH :id, PATCH :id/archive | Translations upsert, AuditLog |
| `festivals` | GET /festivals, GET /festivals/:slug | GET, POST, PATCH :id, PATCH :id/archive | Translations upsert, AuditLog |
| `festival-editions` | — (via festival) | GET /festival/:fid, GET :id, POST, PATCH :id, PATCH :id/publish, PATCH :id/archive, PATCH :id/cancel | Status transitions, publishedAt |
| `health` | GET /health | — | Liveness probe |

**Stub modules (module wired, no implementation):**
- `location-points` — module created, no controller/service/repository
- `media` — module created, no implementation
- `auth` — module created, no implementation
- `users` — module created, no implementation
- `audit-log` — module created; log writes are handled inside the villages/festivals services

**Consistent across all implemented modules:**
- DTOs + class-validator on all incoming data
- Separate public and admin controllers
- Soft delete (archive) by default, no hard delete
- AuditLog on CREATE/UPDATE/ARCHIVE for Village and Festival

---

### Frontend (Next.js 16, `apps/web`)

#### Base infrastructure

- App Router with `[locale]/(public)/` and `admin/` route groups
- Mantine 8 with custom teal theme, mobile-first typography
- TanStack Query 5 (QueryClientProvider, cache invalidation)
- next-intl: 3 locales (en/ru/el), locale switcher in the header
- PWA groundwork: `manifest.json`, `appleWebApp` meta, `themeColor`, `viewportFit: cover`
- Telegram bridge: no-op stub in `shared/lib/telegram/`

#### Shared layer (`shared/`)

- `shared/api/http-client.ts` — fetch wrapper that parses JSON error bodies
- `shared/ui` — `Button`, `Input`, `Select`, `Textarea`, `Card`, `Modal`, `Drawer`, `PageContainer`, `SectionTitle`, `EmptyState`, `LoadingState`
- `shared/ui/map` — `LeafletMap` (dynamic ssr:false wrapper), `_LeafletMapInner` (MapContainer + TileLayer OSM + DivIcon markers by kind), types `IMapMarker` / `TMapMarkerKind`
- `shared/hooks`, `shared/config/navigation`, `shared/i18n`

#### Entities

| Entity | Types | API | UI | Queries |
|--------|-------|-----|----|---------|
| `village` | ✓ | ✓ | VillageCard | usePublicVillages, usePublicVillage, useAdminVillages, useAdminVillage, useCreate/Update/Archive |
| `festival` | ✓ | ✓ | FestivalCard + constants | usePublicFestivals, usePublicFestival, useAdminFestivals, useAdminFestival, useCreate/Update/Archive |
| `festival-edition` | ✓ | ✓ | — | useEditionsForFestival, useAdminEdition, useCreate/Update/Publish/Archive/Cancel |

#### Features (admin forms)

- `features/admin-village` — `VillageForm` (create/edit, locale tabs, coordinates)
- `features/admin-festival` — `FestivalForm` (create/edit, locale tabs, category), `FestivalEditionForm` (create/edit, dates/TBA/times, venue, parking, sources)

#### Widgets

- `widgets/header` — navigation, LocaleSwitcher, mobile drawer
- `widgets/admin-sidebar` — collapsible sidebar with Villages / Festivals entries

#### Public pages

| Page | State |
|------|-------|
| `/[locale]/` | Placeholder with welcome text |
| `/[locale]/villages` | Grid of VillageCard, EmptyState |
| `/[locale]/villages/[slug]` | Detail + map with village centre point (teal) |
| `/[locale]/festivals` | Grid of FestivalCard, EmptyState |
| `/[locale]/festivals/[slug]` | Detail + map with venue (blue) + parking (orange) |
| `/[locale]/map` | Cyprus overview: village centres + festival venues, zoom 9 |

#### Admin pages

| Page | State |
|------|-------|
| `/admin` | Dashboard placeholder |
| `/admin/villages` | Table with Archive action |
| `/admin/villages/new` | Create village |
| `/admin/villages/[id]/edit` | Edit + Archive |
| `/admin/festivals` | Table with Archive + Add Edition actions |
| `/admin/festivals/new` | Create festival |
| `/admin/festivals/[id]/edit` | Edit + Archive + edition list |
| `/admin/festivals/[id]/editions/new` | Create edition |
| `/admin/festival-editions/[id]/edit` | Edit + Publish / Cancel / Archive |

#### Maps

- `LeafletMap` component — reusable, SSR-safe, 3 marker kinds with colour coding
- Tiles: OpenStreetMap (no API key required)
- Integrated into: village detail, festival detail, map overview page

---

## What is not yet implemented — planned steps

### Step 1 — Authentication (Admin Auth)

Without this the entire admin section is publicly accessible.

- [ ] Backend: `auth` module — JWT (login, refresh), `AuthGuard`, `@Roles()` decorator
- [ ] Backend: protect all `admin/*` controllers with `AuthGuard + RolesGuard`
- [ ] Backend: `users` module — `POST /admin/users`, `PATCH /admin/users/:id`, `GET /admin/users`
- [ ] Frontend: `/admin/login` page with login form
- [ ] Frontend: JWT token storage (httpOnly cookie or Zustand + localStorage)
- [ ] Frontend: redirect to `/admin/login` on 401; logout action

---

### Step 2 — LocationPoint CRUD

The model is fully defined in the schema but has no implementation whatsoever.

- [ ] Backend: `location-points` — DTOs, repository, service, admin controller (GET /village/:id, GET /edition/:id, POST, PATCH :id, DELETE :id)
- [ ] Backend: public endpoint `GET /map/points` — all active points with coordinates
- [ ] Frontend: `entities/location-point` — types, API functions, queries
- [ ] Frontend: admin UI for managing points in the context of a village and a festival edition
- [ ] Frontend: render LocationPoint markers on the village and festival detail maps

---

### Step 3 — Festival filtering and search

Currently the festival list loads in full with no filtering.

- [ ] Backend: query parameters on `GET /festivals` — `?category=`, `?villageId=`, `?year=`, `?month=`, `?status=`
- [ ] Backend: `GET /map/festivals` — lightweight endpoint for the map view (id, slug, titleEl, lat, lng)
- [ ] Frontend: `features/filter-festivals` — filter UI (category, village, month)
- [ ] Frontend: update `usePublicFestivals` to accept and forward filter params
- [ ] Frontend: sync active filters to URL search params

---

### Step 4 — Festival calendar view

- [ ] Frontend: calendar/timeline layout for `/[locale]/festivals` — grouped by month
- [ ] Frontend: "Coming soon" / "Happening now" badge on festival cards
- [ ] Frontend: `/[locale]/festivals?month=YYYY-MM` with month navigation

---

### Step 5 — Media

The model exists in the schema; no functionality is implemented.

- [ ] Backend: file upload (multer or S3-compatible storage), `media` module — POST /admin/media, DELETE /admin/media/:id, attach to entities
- [ ] Frontend: image upload component in Village/Festival admin forms
- [ ] Frontend: render cover/gallery images on public pages
- [ ] Frontend: `entities/media` — types and queries

---

### Step 6 — Map coordinate picker (Admin)

Currently coordinates are entered as plain numbers in input fields.

- [ ] Frontend: `features/admin-village` — clickable map in VillageForm for selecting centerLat/centerLng
- [ ] Frontend: `features/admin-festival` — clickable map in FestivalEditionForm for venue and parking coords
- [ ] Shared: `MapPickerControl` in `shared/ui/map` — map component that emits a lat/lng on click

---

### Step 7 — Village page: festival list

Currently the village detail page shows only description and a map.

- [ ] Backend: `GET /villages/:slug` — include `festivals[]` with their active editions
- [ ] Frontend: "Festivals" section on `_VillageDetailView` — list of FestivalCards linked to the village

---

### Step 8 — Testing foundation (Vitest)

- [ ] Configure Vitest in `apps/web`
- [ ] Test utilities: render helpers, QueryClient mock, Mantine provider wrapper
- [ ] Unit tests: `shared/ui` components (render, props), helpers (`getFestivalTranslation`, `formatDateRange`, `getLatestEdition`)
- [ ] Unit tests: entity model functions
- [ ] CI: run lint + typecheck + tests on every PR (GitHub Actions or equivalent)

---

### Step 9 — E2E tests (Playwright)

- [ ] Configure Playwright: Chromium + WebKit (Safari-like), mobile viewport 390px
- [ ] Core public flows: home → festival list → festival detail
- [ ] Villages: list → detail with map
- [ ] Admin flows: create village, create festival, publish edition
- [ ] Map smoke test: verify tiles and markers load without errors

---

### Step 10 — PWA Phase 2 (Installability)

Phase 1 (manifest, meta tags) is already complete.

- [ ] Create icon set: at minimum 192×192 and 512×512 PNG + maskable variant
- [ ] Populate `icons` array in `public/manifest.json`
- [ ] Add `<link rel="apple-touch-icon">` in `app/layout.tsx`
- [ ] Verify installability criteria in Chrome DevTools / Lighthouse

---

### Step 11 — Service worker and offline cache (PWA Phase 3)

Only after public flows are stable and tested.

- [ ] Choose approach: Workbox / next-pwa / custom SW
- [ ] Caching strategy: stale-while-revalidate for lists, cache-first for map tiles
- [ ] Offline fallback page
- [ ] Lighthouse PWA audit in CI

---

### Step 12 — Audit Log UI

- [ ] Backend: `GET /admin/audit-log` with pagination and filters (entityType, action, userId, dateRange)
- [ ] Frontend: `/admin/audit-log` page — table showing entityType, action, user, date, diff (before/after JSON)

---

### Step 13 — MVP2: Telegram Mini App

A fully separate phase. Reuses the entire domain model and API.

- [ ] Activate `shared/lib/telegram/` stubs — init, viewport, back-button
- [ ] Mini App shell with Telegram theme (`useTelegramColorScheme` already in place)
- [ ] Adapt public pages for Telegram viewport (safe area insets)
- [ ] Deploy Telegram Bot + Mini App webhook configuration
- [ ] Telegram bridge tests (unit + integration)

---

## Known technical debt and limitations

| Issue | Location | Priority |
|-------|----------|----------|
| Admin section has no authentication | All `/admin` routes | Critical |
| No pagination in admin list views | Villages, Festivals | Medium |
| LocationPoints are fully modelled but never shown | Backend + Frontend | Medium |
| Coordinates entered as plain number inputs | FestivalEditionForm, VillageForm | Low |
| Media single-owner invariant not validated at service level | MediaService (not implemented) | Low |
| LocationPoint orphan-row invariant not validated at service level | LocationPointsService (not implemented) | Low |
| `middleware.ts` uses deprecated API (build warning) | `apps/web/src/middleware.ts` | Low |
| Home page `/[locale]/` is a placeholder | `(public)/page.tsx` | Low |
| Admin dashboard `/admin` is a placeholder | `admin/page.tsx` | Low |
