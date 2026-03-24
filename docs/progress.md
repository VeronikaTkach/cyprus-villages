# Cyprus Villages — статус проекта

> Актуально на: 2026-03-24

---

## Что уже реализовано

### Инфраструктура и монорепозиторий

- pnpm workspaces + Turborepo
- Node 24 LTS, TypeScript 5 везде
- Shared-пакеты: `shared-types`, `shared-constants`, `shared-schemas`, `shared-config`
- Docker Compose для локальной PostgreSQL
- Переменные окружения через `.env.local`

---

### База данных (`database/prisma`)

**Схема (все модели):**
- `Village` — slug, nameEl, district, region, centerLat/Lng, isActive
- `VillageTranslation` — (villageId, locale) unique, name, description
- `Festival` — slug, villageId, titleEl, category, isActive
- `FestivalTranslation` — (festivalId, locale) unique, title, description
- `FestivalEdition` — year, dates, isDateTba, times, venue, parking, status lifecycle, source tracking
- `LocationPoint` — тип, label, lat/lng, villageId?, festivalEditionId? (dual-ownership)
- `Media` — url, alt, kind (GALLERY/COVER/THUMBNAIL), single-owner invariant
- `User` — email, role (SUPER_ADMIN/CONTENT_ADMIN/EDITOR), isActive
- `AuditLog` — entityType, entityId, action, beforeJson, afterJson, userId

**Миграции:**
1. `20260320105229_initial_domain_schema` — вся схема целиком
2. `20260320130127_rename_media_kind_image_to_gallery` — переименование enum-значения
3. `20260323120000_village_translations` — выделение VillageTranslation из плоских колонок
4. `20260324120000_festival_translations` — выделение FestivalTranslation, сохранение titleEl

**Seed:**
- Деревни (Омодос, Лефкара, Пафос и др.) с переводами
- Фестивали с переводами и привязкой к деревням
- Издания фестивалей с датами, статусами, координатами

---

### Backend (NestJS, `apps/api`)

**Полностью реализованные модули:**

| Модуль | Public API | Admin API | Примечания |
|--------|-----------|-----------|------------|
| `villages` | GET /villages, GET /villages/:slug | GET, POST, PATCH :id, PATCH :id/archive | Translations upsert, AuditLog |
| `festivals` | GET /festivals, GET /festivals/:slug | GET, POST, PATCH :id, PATCH :id/archive | Translations upsert, AuditLog |
| `festival-editions` | — (через festival) | GET /festival/:fid, GET :id, POST, PATCH :id, PATCH :id/publish, PATCH :id/archive, PATCH :id/cancel | Status transitions, publishedAt |
| `health` | GET /health | — | Liveness probe |

**Модули-заготовки (структура есть, логики нет):**
- `location-points` — модуль создан, контроллер/сервис/репозиторий не реализованы
- `media` — модуль создан, реализации нет
- `auth` — модуль создан, реализации нет
- `users` — модуль создан, реализации нет
- `audit-log` — модуль создан; запись в лог реализована внутри villages/festivals сервисов

**Поддерживается везде:**
- DTOs + class-validator на всех входящих данных
- Раздельные public и admin контроллеры
- Soft delete (archive) по умолчанию, без hard delete
- AuditLog при CREATE/UPDATE/ARCHIVE на Village и Festival

---

### Frontend (Next.js 16, `apps/web`)

#### Базовая инфраструктура

- App Router, маршруты `[locale]/(public)/` и `admin/`
- Mantine 8 с кастомной teal-темой, mobile-first типографика
- TanStack Query 5 (QueryClientProvider, деидентификация)
- next-intl: 3 локали (en/ru/el), переключатель локали в хедере
- PWA-groundwork: `manifest.json`, `appleWebApp` meta, `themeColor`, `viewportFit: cover`
- Telegram-bridge: no-op стаб в `shared/lib/telegram/`

#### Shared layer (`shared/`)

- `shared/api/http-client.ts` — fetch-обёртка, парсит JSON-ошибки из тела ответа
- `shared/ui` — `Button`, `Input`, `Select`, `Textarea`, `Card`, `Modal`, `Drawer`, `PageContainer`, `SectionTitle`, `EmptyState`, `LoadingState`
- `shared/ui/map` — `LeafletMap` (dynamic ssr:false wrapper), `_LeafletMapInner` (MapContainer + TileLayer OSM + DivIcon маркеры по видам), типы `IMapMarker` / `TMapMarkerKind`
- `shared/hooks`, `shared/config/navigation`, `shared/i18n`

#### Entities

| Entity | Types | API | UI | Queries |
|--------|-------|-----|----|---------|
| `village` | ✓ | ✓ | VillageCard | usePublicVillages, usePublicVillage, useAdminVillages, useAdminVillage, useCreate/Update/Archive |
| `festival` | ✓ | ✓ | FestivalCard + константы | usePublicFestivals, usePublicFestival, useAdminFestivals, useAdminFestival, useCreate/Update/Archive |
| `festival-edition` | ✓ | ✓ | — | useEditionsForFestival, useAdminEdition, useCreate/Update/Publish/Archive/Cancel |

#### Features (admin forms)

- `features/admin-village` — `VillageForm` (create/edit, locale-tabs, координаты)
- `features/admin-festival` — `FestivalForm` (create/edit, locale-tabs, категория), `FestivalEditionForm` (create/edit, даты/TBA/времена, venue, parking, sources)

#### Widgets

- `widgets/header` — навигация, LocaleSwitcher, mobile drawer
- `widgets/admin-sidebar` — collapsible sidebar с пунктами Villages / Festivals

#### Публичные страницы

| Страница | Статус |
|----------|--------|
| `/[locale]/` | Заглушка с приветствием |
| `/[locale]/villages` | Список с VillageCard, EmptyState |
| `/[locale]/villages/[slug]` | Детальная + карта с центром деревни (teal) |
| `/[locale]/festivals` | Список с FestivalCard, EmptyState |
| `/[locale]/festivals/[slug]` | Детальная + карта venue (blue) + parking (orange) |
| `/[locale]/map` | Обзор всего Кипра: точки деревень + venue фестивалей, zoom 9 |

#### Страницы администратора

| Страница | Статус |
|----------|--------|
| `/admin` | Dashboard-заглушка |
| `/admin/villages` | Таблица, Archive |
| `/admin/villages/new` | Создание деревни |
| `/admin/villages/[id]/edit` | Редактирование + Archive |
| `/admin/festivals` | Таблица, Archive, + Edition |
| `/admin/festivals/new` | Создание фестиваля |
| `/admin/festivals/[id]/edit` | Редактирование + Archive + список изданий |
| `/admin/festivals/[id]/editions/new` | Создание издания |
| `/admin/festival-editions/[id]/edit` | Редактирование + Publish / Cancel / Archive |

#### Карты

- Компонент `LeafletMap` — reusable, SSR-safe, 3 вида маркеров с цветовым кодированием
- Тайлы: OpenStreetMap (без ключа)
- Интегрировано: страница деревни, страница фестиваля, страница карты

---

## Что не реализовано / запланировано по шагам

### Шаг 1 — Аутентификация (Admin Auth)

Без этого admin-раздел полностью открыт.

- [ ] Backend: `auth` модуль — JWT (login, refresh), `AuthGuard`, декоратор `@Roles()`
- [ ] Backend: защита всех `admin/*` контроллеров через `AuthGuard + RolesGuard`
- [ ] Backend: `users` модуль — `POST /admin/users`, `PATCH /admin/users/:id`, `GET /admin/users`
- [ ] Frontend: страница `/admin/login` с формой
- [ ] Frontend: хранение JWT-токена (httpOnly cookie или localStorage через Zustand)
- [ ] Frontend: редирект на `/admin/login` при 401; логаут

---

### Шаг 2 — LocationPoint: CRUD

Модель полностью описана в схеме, но нет ни одной строки логики.

- [ ] Backend: `location-points` — DTOs, репозиторий, сервис, admin-контроллер (GET /village/:id, GET /edition/:id, POST, PATCH :id, DELETE :id)
- [ ] Backend: public endpoint `GET /map/points` — все активные точки с координатами
- [ ] Frontend: `entities/location-point` — типы, API, queries
- [ ] Frontend: admin-страница управления точками (в контексте деревни и в контексте издания)
- [ ] Frontend: отображение LocationPoint-маркеров на карте деревни и фестиваля

---

### Шаг 3 — Фильтрация и поиск фестивалей

Сейчас список фестивалей выгружается целиком без фильтров.

- [ ] Backend: query-параметры на `GET /festivals` — `?category=`, `?villageId=`, `?year=`, `?month=`, `?status=`
- [ ] Backend: `GET /map/festivals` — упрощённый endpoint для карты (id, slug, titleEl, lat, lng)
- [ ] Frontend: `features/filter-festivals` — UI-фильтры (категория, деревня, месяц)
- [ ] Frontend: обновление `usePublicFestivals` для передачи параметров фильтрации
- [ ] Frontend: URL-синхронизация фильтров (searchParams)

---

### Шаг 4 — Календарный вид фестивалей

- [ ] Frontend: calendar/timeline view для страницы `/[locale]/festivals` — сортировка по месяцам
- [ ] Frontend: бейдж «Скоро» / «Идёт сейчас» на карточках
- [ ] Frontend: страница `/[locale]/festivals?month=YYYY-MM` с навигацией по месяцам

---

### Шаг 5 — Медиа (Media)

Модель есть в схеме, функциональности нет.

- [ ] Backend: file upload (multer или S3-compatible storage), `media` модуль — POST /admin/media, DELETE /admin/media/:id, привязка к сущностям
- [ ] Frontend: компонент загрузки изображений в формах Village/Festival
- [ ] Frontend: отображение cover/gallery на публичных страницах
- [ ] Frontend: `entities/media` — типы и queries

---

### Шаг 6 — Coord Picker на карте (Admin)

Сейчас координаты вводятся вручную числами в формах.

- [ ] Frontend: `features/admin-village` — кликабельная карта в VillageForm для выбора centerLat/centerLng
- [ ] Frontend: `features/admin-festival` — кликабельная карта в FestivalEditionForm для venue и parking
- [ ] Технически: `MapPickerControl` в `shared/ui/map` — компонент с `onClick` на карте

---

### Шаг 7 — Страница деревни: список фестивалей

Сейчас на странице деревни только описание и карта.

- [ ] Backend: `GET /villages/:slug` — добавить `festivals[]` с активными изданиями
- [ ] Frontend: секция «Фестивали» на `_VillageDetailView` — список FestivalCard, привязанных к деревне

---

### Шаг 8 — Тестовая база (Vitest)

- [ ] Настройка Vitest в `apps/web`
- [ ] Test-утилиты: render helpers, QueryClient mock, Mantine provider wrapper
- [ ] Unit-тесты: `shared/ui` компоненты (рендер, props), helpers (getFestivalTranslation, formatDateRange, getLatestEdition)
- [ ] Unit-тесты: entity model функции
- [ ] CI: запуск lint + typecheck + tests на каждый PR (GitHub Actions или аналог)

---

### Шаг 9 — E2E тесты (Playwright)

- [ ] Настройка Playwright: Chromium + WebKit (Safari-like), мобильный viewport 390px
- [ ] Основные публичные флоу: главная → список фестивалей → детальная страница
- [ ] Деревни: список → детальная с картой
- [ ] Admin-флоу: создание деревни, создание фестиваля, публикация издания
- [ ] Smoke-тест карты: проверка, что тайлы и маркеры загружаются

---

### Шаг 10 — PWA Phase 2 (Installability)

Фаза 1 (манифест, мета) уже сделана.

- [ ] Создать набор иконок: минимум 192×192 и 512×512 PNG + maskable-вариант
- [ ] Прописать `icons` в `public/manifest.json`
- [ ] `<link rel="apple-touch-icon">` в `app/layout.tsx`
- [ ] Проверить критерии installability в Chrome DevTools / Lighthouse

---

### Шаг 11 — Service Worker и offline-кэш (PWA Phase 3)

Только после стабилизации публичных флоу.

- [ ] Выбрать подход: Workbox / next-pwa / кастомный SW
- [ ] Стратегия кэширования: stale-while-revalidate для списков, cache-first для тайлов карты
- [ ] Offline-fallback страница
- [ ] Lighthouse PWA audit в CI

---

### Шаг 12 — Audit Log UI

- [ ] Backend: `GET /admin/audit-log` с пагинацией и фильтрами (entityType, action, userId, dateRange)
- [ ] Frontend: страница `/admin/audit-log` — таблица с полями entityType, action, user, дата, diff (before/after JSON)

---

### Шаг 13 — MVP2: Telegram Mini App

Полностью отдельная фаза. Переиспользует весь domain и API.

- [ ] Активировать заглушки `shared/lib/telegram/` — init, viewport, back-button
- [ ] Mini App shell с Telegram-темой (useTelegramColorScheme уже есть)
- [ ] Адаптация публичных страниц под Telegram-viewport (safe area)
- [ ] Деплой конфигурации Telegram Bot + Mini App webhook
- [ ] Тесты Telegram bridge (unit + интеграция)

---

## Технический долг и известные ограничения

| Проблема | Где | Приоритет |
|----------|-----|-----------|
| Admin-раздел не защищён аутентификацией | Весь `/admin` | Критично |
| Нет пагинации в admin-списках | Villages, Festivals | Средний |
| LocationPoints никак не отображаются, хотя модель есть | Backend + Frontend | Средний |
| Координаты вводятся вручную числами | FestivalEditionForm, VillageForm | Низкий |
| Нет валидации единственного FK в Media на уровне сервиса | MediaService (не реализован) | Низкий |
| Нет валидации orphan-row в LocationPoint на уровне сервиса | LocationPointsService (не реализован) | Низкий |
| `middleware.ts` использует устаревший API (предупреждение при сборке) | `apps/web/src/middleware.ts` | Низкий |
| Главная страница `/[locale]/` — заглушка | `(public)/page.tsx` | Низкий |
| Admin dashboard `/admin` — заглушка | `admin/page.tsx` | Низкий |
