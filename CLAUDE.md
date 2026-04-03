# CLAUDE.md

## Project

Cyprus Villages — an application with a calendar of festivals in Cypriot villages.

**MVP1:** Web app (public + admin)
**MVP2:** Telegram Mini App using the same domain model and API

---

## Product context

The application should allow users to:

* browse festivals by month, village, region, and category;
* view festival details (date, description, coordinates, parking, sources);
* view village pages with festival lists and a map;
* manage data via admin panel;
* support incomplete data (`TBA`);
* keep change history and avoid hard deletes.

---

## Core business entities

* Village
* Festival
* FestivalEdition
* LocationPoint
* Media
* User
* AuditLog

---

## Domain rules

1. `Festival` = persistent entity (brand).
2. `FestivalEdition` = specific occurrence (year-based).
3. Date, venue, parking, source URL, status → stored in `FestivalEdition`.
4. Use soft delete / archive by default.
5. Support `TBA` for unknown dates.
6. Store coordinates as numeric fields.
7. Log admin changes in `AuditLog` when possible.

---

## Architecture

* Monorepo
* `apps/web` — Next.js (public + admin)
* `apps/api` — NestJS
* `database/prisma` — schema, migrations, seed
* `packages/*` — shared types/config/schemas
* UI: **Mantine**
* Data: **TanStack Query**
* Forms: **react-hook-form + zod**
* Maps: **Leaflet**
* DB: **PostgreSQL**
* ORM: **Prisma**

---

## Frontend architecture (FSD)

Layers:

* `app`
* `pages`
* `widgets`
* `features`
* `entities`
* `shared`

### Rules

1. Do not mix business logic across layers.
2. Keep API calls outside UI (`entities/*/api`, `shared/api`).
3. Use `shared` only for reusable, domain-agnostic code.
4. Do not place domain logic (`Festival`, `Village`) in `shared`.
5. Avoid deep imports; use public APIs (`index.ts`).
6. Avoid circular dependencies.
7. Separate layouts for public/admin, reuse entities/shared.
8. Design mobile-first.
9. Keep Telegram logic isolated (`shared/lib/telegram`).

---

## Backend rules

1. Structure by domain modules.
2. Separate public and admin APIs.
3. Use DTOs + validation for all inputs.
4. Keep DB access in services/repositories.
5. Support statuses: `draft`, `published`, `archived`, `cancelled`.
6. Use soft delete / archive.
7. Maintain Swagger/OpenAPI.
8. Never instantiate `PrismaClient` directly — always use the injected `PrismaService`. Prisma 7.5 removed the binary engine; `new PrismaClient()` without a driver adapter throws at runtime. In scripts, follow the `PrismaPg` adapter pattern in `database/prisma/seed/index.ts`.
9. Prisma client must be generated before running typecheck or backend code (`pnpm db:generate`).

---

## Repository structure

```text
apps/
  web/
  api/
packages/
  shared-types/
  shared-constants/
  shared-schemas/
  shared-config/
database/
  prisma/
infra/
  compose/
  docker/
  env/
docs/
  architecture.md
  progress.md
  security.md
  roadmap-pwa-testing.md
  stack-decisions.md
  audits/
```

---

## Coding standards

* TypeScript everywhere
* `T` for types, `I` for interfaces
* Small, focused files and functions
* Explicit naming (`FestivalEditionStatus`, etc.)
* Avoid magic strings (use constants)
* Code must be reusable for web + mini app

---

## API and naming rules

1. Prefer additive API changes (avoid breaking).
2. Keep response shape stable once used.
3. Use consistent naming: `create`, `update`, `archive`, `getById`, `getList`.
4. Use explicit booleans (`isPublished`, `hasParking`).
5. Avoid vague names (`data`, `item`, `value`).
6. Align validation between backend and frontend.

---

## Performance rules

1. Avoid N+1 queries.
2. Fetch only required fields (explicit select/include).
3. Separate list vs detail queries.
4. Add pagination/filtering for admin early.

---

## Incomplete data handling

1. Support incomplete records explicitly (`TBA`, nullable fields).
2. Do not assume exact dates always exist.
3. Preserve source links even if data is partial.
4. Distinguish missing vs confirmed negative data.

---

## Admin panel rules

1. Forms must map directly to domain + DTOs.
2. Avoid admin-only data structures when possible.
3. Support draft/incomplete content.
4. Make destructive actions explicit (archive/publish).
5. Ensure audit traceability.

---

## Localization rules

1. Avoid hardcoded UI strings.
2. Keep all texts localization-ready.
3. Store domain data language-agnostic where possible.
4. Use stable translation keys.

---

## Change safety rules

1. Identify affected layers before changes.
2. Do not silently rename widely used fields.
3. Prefer deprecation over removal.
4. Document schema/migration impact.
5. Avoid irreversible data changes without confirmation.

---

## Documentation rules

1. Document non-obvious decisions in `docs/architecture.md`.
2. Document invariants not enforced by DB.
3. Mark MVP simplifications explicitly.
4. Keep docs aligned with code.

---

## What Claude Code should do

1. Preserve architecture and project style.
2. Place new logic in correct FSD layers.
3. Check impact of domain changes (schema, DTOs, types, UI).
4. Use consistent naming.
5. Prefer scalable solutions (Mini App ready).
6. Avoid unnecessary dependencies.
7. Keep solutions simple (MVP-first).

---

## What Claude Code should avoid

* Mixing `Festival` and `FestivalEdition`
* Moving domain logic into `shared`
* Hard deletes without reason
* Storing dates only as strings
* Duplicating types across layers
* Separating admin from domain model
* Desktop-only UI assumptions

---

## Preferred implementation order

1. Repository setup
2. Web app
3. API
4. Prisma
5. Base UI/layouts
6. Domain schema
7. Admin CRUD (Village)
8. Admin CRUD (Festival + Edition)
9. Public pages
10. Map
11. Localization
12. Telegram bridge

---

## Definition of done

* Architecture respected
* Types and validation intact
* Files placed correctly
* No duplication
* Mini App readiness preserved
* Related layers updated

---

## Schema rules

1. Avoid ambiguous ownership in models.
2. Document invariants (Prisma + docs).
3. Document MVP simplifications.
4. Do not change schema without explicit request.
5. Check impact on all layers when modifying schema.
