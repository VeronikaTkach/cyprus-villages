# Cyprus Villages — Project Progress

> Last updated: 2026-04-19 (D4 Playwright foundation complete; FestivalEdition admin workflow polish: success feedback, create-view context)

---

## Next priority

1. **D7 — Audit Log UI** — `GET /admin/audit-log` backend endpoint + frontend table.
2. **D4 (cont.) — E2E CI integration** — wire Playwright into GitHub Actions with a full-stack environment.
3. **Home page** — replace placeholder with real content (village/festival highlights).

---

## Architecture audit — 2026-03-27

Full architecture consistency audit completed. Overall conclusion: the architecture is holding well — all core domain invariants, FSD layer boundaries, and backend discipline are respected. No major drift found. Three concrete follow-ups identified (stale audit log TODO comments, undocumented latest-edition-only map rule, undocumented `enableImplicitConversion` setting).

Full snapshot: [`docs/audits/2026-03-27-architecture-audit.md`](audits/2026-03-27-architecture-audit.md)

---

## What is already implemented

### Infrastructure and monorepo

- pnpm workspaces + Turborepo
- Node 24 LTS, TypeScript 5 throughout
- Shared packages: `shared-types`, `shared-constants`, `shared-schemas`, `shared-config`
- Docker Compose for local PostgreSQL
- Environment variables via `.env.local`
- GitHub Actions CI: lint, typecheck, and unit tests on every push/PR (`.github/workflows/ci.yml`)

---

### Database (`database/prisma`)

**Schema (all models):**
- `Village` — slug, nameEl, district, region, centerLat/Lng, isActive
- `VillageTranslation` — (villageId, locale) unique, name, description
- `Festival` — slug, villageId, titleEl, category, isActive
- `FestivalTranslation` — (festivalId, locale) unique, title, description
- `FestivalEdition` — year, dates, isDateTba, times, venue, parking, status lifecycle, source tracking
- `LocationPoint` — type, label, lat/lng, villageId?, festivalEditionId? (dual-ownership)
- `Media` — url, alt, kind (GALLERY/COVER), single-owner invariant; files stored in Cloudflare R2
- `User` — email, passwordHash, role (SUPER_ADMIN/CONTENT_ADMIN/EDITOR), isActive
- `AuditLog` — entityType, entityId, action, beforeJson, afterJson, userId

**Migrations:**
1. `20260320105229_initial_domain_schema` — full schema
2. `20260320130127_rename_media_kind_image_to_gallery` — enum value rename
3. `20260323120000_village_translations` — extracted VillageTranslation from flat columns
4. `20260324120000_festival_translations` — extracted FestivalTranslation, preserved titleEl
5. `20260324180000_user_password_hash` — added passwordHash column to User

**Seed:**
- Villages (Omodos, Lefkara, Paphos, etc.) with translations
- Festivals with translations linked to villages
- Festival editions with dates, statuses, and coordinates
- Admin user (`admin@cyprus-villages.dev`, role SUPER_ADMIN, password hashed)

---

### Backend (NestJS, `apps/api`)

**Fully implemented modules:**

| Module | Public API | Admin API | Notes |
|--------|-----------|-----------|-------|
| `villages` | GET /villages, GET /villages/:slug | GET, POST, PATCH :id, PATCH :id/archive | Translations upsert, AuditLog; detail includes festivals[] + media[] |
| `festivals` | GET /festivals?category&villageId&year&month, GET /festivals/:slug, GET /map/festivals | GET, POST, PATCH :id, PATCH :id/archive | Translations upsert, AuditLog; month filter in-memory; detail includes media[]; map markers via FestivalsMapController |
| `festival-editions` | — (via festival) | GET /festival/:fid, GET :id, POST, PATCH :id, PATCH :id/publish, PATCH :id/archive, PATCH :id/cancel | Status transitions, publishedAt |
| `location-points` | GET /map/points | GET /village/:id, GET /festival-edition/:id, GET /:id, POST, PATCH /:id, PATCH /:id/archive | Dual-ownership, orphan-row invariant enforced at service layer |
| `media` | — | POST /admin/media/upload, GET /admin/media, DELETE /admin/media/:id | Cloudflare R2 storage; hard delete (intentional — see architecture.md); upload validated: max 5 MB, image/jpeg\|png\|webp only; keys: `{entity}/{id}/cover-{timestamp}.{ext}` |
| `health` | GET /health | — | Liveness probe |

**Auth (`auth` module):**
- `POST /auth/login` — bcryptjs password verification, sets httpOnly cookie (`cv-auth`), returns `{ ok: true }`; rate-limited to 5 attempts / 10 min
- `POST /auth/logout` — clears the cookie
- `JwtAuthGuard` — extracts token from cookie (primary) or `Authorization: Bearer` header (Swagger fallback)
- `RolesGuard` + `@Roles()` decorator — role-based access control
- All admin controllers protected: `EDITOR`, `CONTENT_ADMIN`, `SUPER_ADMIN` allowed
- All domain services propagate `userId` from `@CurrentUser()` into `AuditLog` writes

**Infrastructure:**
- `StorageModule` / `StorageService` (`common/storage/`) — wraps `@aws-sdk/client-s3` against the R2 endpoint; `upload()` and `deleteByUrl()`
- R2 env vars (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`) in `env.validation.ts`; documented in `infra/env/api.env.example`

**Stub / minimal modules:**
- `users` — `UsersService.findByEmail()` implemented (used by auth); full admin CRUD not yet done
- `audit-log` — module wired; log writes handled inside each domain service directly

**Consistent across all implemented modules:**
- DTOs + class-validator on all incoming data
- Separate public and admin controllers
- Soft delete (archive) by default; Media is an explicit hard-delete exception
- AuditLog on CREATE/UPDATE/ARCHIVE for Village and Festival

---

### Frontend (Next.js 16, `apps/web`)

#### Base infrastructure

- App Router with `[locale]/(public)/` and `admin/` route groups
- Mantine 8 with custom teal theme, mobile-first typography
- TanStack Query 5 (QueryClientProvider, cache invalidation)
- next-intl: 3 locales (en/ru/el), locale switcher in the header
- PWA: `manifest.json` (display: standalone, icons array populated), `appleWebApp` meta, `themeColor`, `viewportFit: cover`, apple touch icon via `metadata.icons.apple`
- Telegram bridge: no-op stub in `shared/lib/telegram/`

#### Shared layer (`shared/`)

- `shared/api/http-client.ts` — `httpGet`, `httpPost`, `httpPatch` (fetch + credentials: include, 401 redirect); `httpUpload` (multipart POST, no Content-Type override)
- `shared/lib/auth` — Zustand persist store for `isAuthenticated: boolean` flag (`cv-auth-ui` localStorage key); no token stored in browser
- `shared/ui` — `Button`, `Input`, `Select`, `Textarea`, `Card`, `Modal`, `Drawer`, `PageContainer`, `SectionTitle`, `EmptyState`, `LoadingState`
- `shared/ui/map` — `LeafletMap` (dynamic ssr:false wrapper), `_LeafletMapInner` (MapContainer + TileLayer OSM + DivIcon markers by kind), types `IMapMarker` / `TMapMarkerKind`; `MapPickerControl` (dynamic ssr:false picker — click-to-place marker, emits lat/lng via `onPick`)
- `shared/hooks`, `shared/config/navigation`, `shared/i18n`

#### Entities

| Entity | Types | API functions | Queries | UI |
|--------|-------|---------------|---------|-----|
| `village` | ✓ (IVillage, media?: IMediaBrief[]) | ✓ | usePublicVillages/Village, useAdminVillages/Village, useCreate/Update/Archive | VillageCard |
| `festival` | ✓ (IFestival, media?: IMediaBrief[]) | ✓ | usePublicFestivals/Festival, useAdminFestivals/Festival, useCreate/Update/Archive | FestivalCard + constants |
| `festival-edition` | ✓ | ✓ | useEditionsForFestival, useAdminEdition, useCreate/Update/Publish/Archive/Cancel | — |
| `location-point` | ✓ | ✓ | usePublicMapPoints, useAdminLocationPoints | — |
| `media` | ✓ (IMedia, IMediaBrief) | fetchMediaByOwner, uploadCover, deleteMedia | useMediaByOwner, useUploadCover, useDeleteMedia | — |

#### Features

- `features/admin-village` — `VillageForm` (create/edit, locale tabs, coordinates)
- `features/admin-festival` — `FestivalForm` (create/edit, locale tabs, category), `FestivalEditionForm` (create/edit, dates/TBA/times, venue, parking, sources)
- `features/admin-location-point` — `LocationPointsSection` (list + inline create/edit for a village or festival-edition context)
- `features/admin-media` — `CoverUpload` (fetches current cover, upload/delete with loading states; wired into VillageEditView and FestivalEditView)

#### Widgets

- `widgets/header` — navigation, LocaleSwitcher, mobile drawer
- `widgets/admin-sidebar` — collapsible sidebar with Villages / Festivals entries

#### Public pages

| Page | State |
|------|-------|
| `/[locale]/` | Placeholder with welcome text |
| `/[locale]/villages` | Grid of VillageCard, EmptyState |
| `/[locale]/villages/[slug]` | Cover image (with placeholder fallback), description, map, related festivals list |
| `/[locale]/festivals` | Filter bar (category/village/year/month), scrollable month strip, timeline grouped by month with Soon/Ongoing badges; URL-synced filters |
| `/[locale]/festivals/[slug]` | Cover image (with placeholder fallback), badges, dates, venue/parking, description, map |
| `/[locale]/map` | Cyprus overview: village centres + festival venues, zoom 9 |

#### Admin pages

| Page | State |
|------|-------|
| `/admin` | Dashboard placeholder |
| `/admin/villages` | Table with Archive action |
| `/admin/villages/new` | Create village |
| `/admin/villages/[id]/edit` | Edit + Archive + CoverUpload + LocationPointsSection |
| `/admin/festivals` | Table with Archive + Add Edition actions |
| `/admin/festivals/new` | Create festival |
| `/admin/festivals/[id]/edit` | Edit + Archive + CoverUpload + edition list |
| `/admin/festivals/[id]/editions/new` | Create edition |
| `/admin/festival-editions/[id]/edit` | Edit + Publish / Cancel / Archive; inline success feedback on Save, Publish, Cancel |
| `/admin/login` | Login form, JWT auth, redirects to `/admin` on success |

#### PWA icons

- `public/icons/icon-192.png` — 192×192 standard icon
- `public/icons/icon-512.png` — 512×512 standard icon
- `public/icons/icon-512-maskable.png` — 512×512 maskable (10% safe zone, Android adaptive)
- `public/icons/apple-touch-icon.png` — 180×180 iOS home screen
- Generator: `apps/web/scripts/gen-icons.mjs` (Node.js built-ins only, no external deps)

---

## What is not yet implemented — planned phases

---

### Phase A — Critical blockers ✓ COMPLETE

#### A1 — Authentication (Admin Auth) ✓ COMPLETE

- [x] Backend: `auth` module — JWT login, `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator
- [x] Backend: protect all `admin/*` controllers
- [x] Backend: `GET /auth/me` session probe
- [x] Frontend: `/admin/login` page, `isAuthenticated` Zustand store, logout
- [ ] Backend: `users` admin CRUD (`POST /admin/users`, `PATCH /admin/users/:id`, `GET /admin/users`)

---

### Phase B — Core domain completion ✓ COMPLETE

#### B1 — LocationPoint CRUD ✓ COMPLETE

- [x] Backend: full CRUD + public `GET /map/points`
- [x] Frontend: entity + admin UI + map markers on detail and overview pages

---

### Phase C — Public UX improvements

#### C1 — Festival filtering and search ✓ COMPLETE

- [x] Backend: `?category`, `?villageId`, `?year`, `?month` on `GET /festivals`; `displayEdition` helper
- [x] Frontend: filter UI, URL sync, month strip, timeline grouped by month, Soon/Ongoing badges
- [x] Backend: `GET /map/festivals` — returns `{ id, slug, titleEl, lat, lng }` per festival; only active festivals with ≥1 PUBLISHED edition and valid venue coordinates; representative edition selected by year desc → startDate asc → id desc
  - Coordinates are taken from the single representative edition only. If that edition has null `venueLat`/`venueLng`, the festival is excluded entirely — there is no fallback to other published editions with valid coordinates. This is intentional.

#### C2 — Village page: festival list ✓ COMPLETE

- [x] Backend: `GET /villages/:slug` includes `festivals[]` (active, with ≥1 PUBLISHED edition; editions pre-filtered to PUBLISHED)
- [x] Frontend: Festivals section on `_VillageDetailView` — SimpleGrid of FestivalCards; EmptyState when none

#### C3 — Festival calendar view ✓ COMPLETE

- [x] Frontend: `_FestivalsTimeline.tsx`, `_MonthStrip.tsx`, Soon/Ongoing badges

---

### Phase D — Platform hardening and expansion

#### D1 — Media ✓ COMPLETE

- [x] Backend: `StorageService` + `MediaModule` (upload, list, hard delete)
- [x] Backend: upload validation — max 5 MB, image/jpeg|png|webp; structured key `{entity}/{id}/cover-{timestamp}.{ext}`
- [x] Backend: village and festival detail responses include `media: MediaBriefDto[]`
- [x] Frontend: `entities/media`, `features/admin-media/CoverUpload`, `httpUpload`
- [x] Frontend: cover image on public village and festival detail pages; placeholder fallback on missing/broken image

#### D2 — Map coordinate picker (Admin) ✓ COMPLETE

- [x] Frontend: `MapPickerControl` in `shared/ui/map` — dynamic-imported Leaflet picker; emits lat/lng on click; shows marker at current value; centers on existing coords or Cyprus default
- [x] Frontend: wire into VillageForm (centerLat/Lng) — always-visible picker below coordinate inputs
- [x] Frontend: wire into FestivalEditionForm (venue + parking) — toggle button per section ("Pick venue on map" / "Pick parking on map")

#### D3 — Testing foundation (Vitest) ✓ COMPLETE

- [x] Vitest config, jsdom, `@vitejs/plugin-react`, test utilities (MantineProvider + QueryClient wrapper)
- [x] Unit tests: `EmptyState`, `getLatestEdition`, `getFestivalTranslation`, `formatDate`/`formatDateRange`
- [x] Backend unit tests (Jest): `selectDisplayEdition` — 8 cases
- [x] CI: lint + typecheck + tests on every push/PR

#### D4 — E2E tests (Playwright) — foundation only, not fully complete

**Foundation implemented:**
- [x] Playwright configured: Chromium + WebKit + mobile Chrome (Pixel 5, 393px); `playwright.config.ts` in `apps/web`
- [x] Public flows: home, festivals list + detail, villages list + detail + related festivals, map smoke test (`e2e/public/`)
- [x] Admin flow: login page load, successful login → dashboard, wrong credentials error, post-login sidebar navigation to Villages (`e2e/admin/login.spec.ts`)
- [x] Navigation coverage: list → card click → detail verified for both villages and festivals
- [x] Mobile coverage: all tests run on the mobile-chrome project automatically
- [x] Scripts: `pnpm test:e2e`, `pnpm test:e2e:ui`, `pnpm test:e2e:headed`

**Not yet implemented:**
- [ ] Admin CRUD E2E flows: create village, create festival, publish edition
- [ ] CI orchestration for E2E (requires full-stack: Next.js + NestJS API + seeded DB in CI)
- [ ] Automated full-stack setup for test environments

#### D5 — PWA Phase 2 (Installability) ✓ COMPLETE

- [x] Icon set: 192×192, 512×512, 512×512 maskable, 180×180 apple-touch-icon in `public/icons/`
- [x] `manifest.json` icons array with correct `sizes`, `type`, `purpose`; `background_color` = `#12b886`
- [x] Apple touch icon via `metadata.icons.apple` in `app/layout.tsx`
- [ ] Manual Lighthouse / DevTools installability check (no service worker yet)

#### D6 — Service worker and offline cache (PWA Phase 3)

Only after public flows are stable and tested.

- [ ] Choose approach: Workbox / next-pwa / custom SW
- [ ] Caching strategy: stale-while-revalidate for lists, cache-first for map tiles
- [ ] Offline fallback page
- [ ] Lighthouse PWA audit in CI

#### D7 — Audit Log UI

- [ ] Backend: `GET /admin/audit-log` with pagination and filters
- [ ] Frontend: `/admin/audit-log` page — table with entityType, action, user, date, before/after diff

#### D8 — MVP2: Telegram Mini App

A fully separate phase. Reuses the entire domain model and API.

- [ ] Activate `shared/lib/telegram/` stubs — init, viewport, back-button
- [ ] Mini App shell with Telegram theme
- [ ] Adapt public pages for Telegram viewport (safe area insets)
- [ ] Deploy Telegram Bot + Mini App webhook configuration

---

## Known technical debt and limitations

| Issue | Location | Priority |
|-------|----------|----------|
| No pagination in admin list views | Villages, Festivals, LocationPoints | Medium |
| Cover image dimensions (width/height) not extracted on upload | `MediaService.uploadCover` | Low |
| Admin UI does not support creating dual-ownership LocationPoints | `LocationPointForm` | Low |
| Public map points filtered client-side on detail pages | `_VillageDetailView`, `_FestivalDetailView` | Low |
| `middleware.ts` uses deprecated API (build warning) | `apps/web/src/middleware.ts` | Low |
| Home page `/[locale]/` is a placeholder | `(public)/page.tsx` | Low |
| Admin dashboard `/admin` is a placeholder | `admin/page.tsx` | Low |
