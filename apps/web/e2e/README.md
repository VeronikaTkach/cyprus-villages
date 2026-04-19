# E2E Tests (Playwright)

## Required services

All three must be running before executing the full suite:

| Service | Command | Port |
|---------|---------|------|
| PostgreSQL | `docker compose up -d` (repo root) | 5432 |
| NestJS API | `cd apps/api && pnpm dev` | 3001 |
| Next.js web | started automatically by Playwright's `webServer` config | 3000 |

The database must be seeded once:
```sh
pnpm db:seed   # run from repo root
```

## Run locally

```sh
cd apps/web

pnpm test:e2e          # headless, all browsers
pnpm test:e2e:ui       # interactive Playwright UI
pnpm test:e2e:headed   # headed (visible browser window)
```

Run a single file:
```sh
pnpm test:e2e e2e/public/villages.spec.ts
```

## SSR-only vs. API-required tests

Tests marked `(requires API)` in their description need the NestJS API to be running.
Tests without that label only assert on server-rendered content (headings, page titles)
and pass with the web server alone.

## Credentials

The admin login tests use the seeded admin account:
- **Email:** `admin@cyprus-villages.dev`
- **Password:** `Admin1234!`
