# Cyprus Villages

A festival guide and calendar for traditional villages across Cyprus.

Discover cultural events, local festivals, and village celebrations — with dates, locations, maps, and everything you need to plan your visit.

---

## About

Cyprus has hundreds of villages, each with its own festivals, wine celebrations, cultural events, and religious feasts. This app brings them all together in one place.

**What you can do:**
- Browse festivals by month, village, region, or category
- See festival dates, venues, parking, and source links
- Explore village pages with their festival history and map
- Track upcoming editions and statuses (including TBA dates)
- Manage content through an admin panel

---

## Tech Stack

### Frontend — `apps/web`
| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, SSR/ISR |
| Language | TypeScript + React 19 |
| UI Library | [Mantine 8](https://mantine.dev) |
| Data Fetching | [TanStack Query 5](https://tanstack.com/query) |
| Forms | [React Hook Form 7](https://react-hook-form.com) + [Zod 4](https://zod.dev) |
| State | [Zustand 5](https://zustand-demo.pmnd.rs) |
| Maps | [Leaflet](https://leafletjs.com) + [React Leaflet 5](https://react-leaflet.js.org) |
| Architecture | [Feature-Sliced Design](https://feature-sliced.design) |

### Backend — `apps/api`
| | |
|---|---|
| Framework | [NestJS 11](https://nestjs.com) |
| Language | TypeScript |
| ORM | [Prisma 7](https://www.prisma.io) |
| Database | PostgreSQL |
| Validation | class-validator + class-transformer |
| API Docs | Swagger / OpenAPI |

### Infrastructure
| | |
|---|---|
| Monorepo | [pnpm workspaces](https://pnpm.io/workspaces) + [Turborepo](https://turbo.build) |
| Node | 24 LTS |
| Local DB | Docker Compose |

---

## Project Structure

```
apps/
  web/          # Next.js — public site + admin panel
  api/          # NestJS REST API
packages/
  shared-types/       # shared TypeScript types
  shared-constants/   # shared constants
  shared-schemas/     # shared Zod schemas
  shared-config/      # shared configs
database/
  prisma/       # schema, migrations, seed
infra/
  compose/      # Docker Compose for local Postgres
  env/          # .env examples
docs/
  architecture.md
  stack-decisions.md
  roadmap-pwa-testing.md
```

---

## Getting Started

### Prerequisites
- Node.js 24 LTS (`nvm use`)
- pnpm 9+
- Docker (for local PostgreSQL)

### Install dependencies
```bash
pnpm install
```

### Start local database
```bash
docker compose -f infra/compose/docker-compose.dev.yml up -d
```

### Run in development
```bash
pnpm dev
```

This starts both `apps/web` on `http://localhost:3000` and `apps/api` on `http://localhost:3001`.

API docs available at `http://localhost:3001/api/docs`.

---

## Status

> MVP1 in progress — public site + admin panel.
> MVP2 planned — Telegram Mini App on the same API and domain model.
