# Roadmap: PWA Readiness and Testing Foundation

## 1. Purpose

This document describes the planned evolution of the Cyprus Villages platform toward:

- full PWA support
- a solid testing foundation
- a clean platform abstraction layer for web, PWA, and Telegram Mini App

It is a planning document, not an implementation guide. It does not define implementation steps or timelines — it establishes direction and helps avoid premature decisions that would complicate the project later.

The roadmap covers two parallel tracks:

**PWA track** — moving from a mobile-first web app toward an installable, optionally offline-capable Progressive Web App.

**Testing track** — building a sustainable, layered testing foundation that matches the FSD architecture and the project's multi-platform intent.

Both tracks are designed to evolve in phases. Nothing here should be implemented before the core product functionality is stable.

---

## 2. Current State

### What is already in place

**Frontend foundation**
- Next.js 16 App Router with route groups for public and admin zones
- React 19 with server and client component separation
- Mantine 8 with a custom teal theme, mobile-first font stack, component defaults
- TanStack Query 5 for server state management
- Feature-Sliced Design architecture across all frontend layers

**Mobile-first shell**
- Correct viewport meta: `width=device-width, initialScale=1, viewportFit=cover`
- `themeColor` set to teal (`#12b886`) for browser chrome and system UI
- Public layout with responsive header and mobile drawer navigation
- Admin layout with collapsible sidebar and working mobile burger
- System font stack: `-apple-system, BlinkMacSystemFont, system-ui` — native rendering on iOS and Android

**PWA-ready groundwork**
- `public/manifest.json` stub: `display: standalone`, `theme_color`, `start_url`, `scope`
- Manifest linked via Next.js `metadata.manifest`
- `appleWebApp` metadata for iOS standalone mode
- `formatDetection` for correct mobile behavior
- Icons array in manifest is currently empty

**Telegram bridge placeholder**
- `shared/lib/telegram/index.ts` — `isTelegramWebApp`, `getTelegramWebApp`, theme params, color scheme
- `shared/lib/telegram/types.ts` — `ITelegramWebApp`, `ITelegramThemeParams`
- `shared/lib/telegram/viewport.ts` — viewport height adapters (no-op for MVP1)
- `shared/lib/telegram/back-button.ts` — back button adapters (no-op for MVP1)
- `shared/lib/telegram/use-telegram.ts` — `useTelegramColorScheme` hook

**Monorepo**
- pnpm workspaces + Turborepo
- Shared packages: `shared-types`, `shared-constants`, `shared-schemas`, `shared-config`
- NestJS 11 backend with module stubs for all domain areas
- Prisma 7 schema ready for domain model implementation

### What is not yet in place

- No service worker
- No offline caching strategy
- PWA icon set added: 192×192, 512×512, 512×512 maskable, 180×180 apple touch icon — all in `public/icons/`; manifest `icons` array and apple touch icon metadata are complete
- Installability at the metadata/icon level is now met; a service worker is required for the Chrome desktop install prompt but not for Android Chrome or iOS Safari home screen add
- No push notifications
- No background sync
- No end-to-end tests
- No automated CI for lint, typecheck, or tests
- No PWA-specific test coverage
- No platform detection layer beyond the Telegram bridge stub

### Recently added

- **`apps/web` unit test foundation** — Vitest + @testing-library/react, jsdom environment, MantineProvider + QueryClient render wrapper; first tests cover entity model helpers and a shared UI component
- **`apps/api` unit tests** — Jest + ts-jest; `selectDisplayEdition` helper tested with 8 cases

---

## 3. PWA Roadmap

### Phase 1 — PWA-Ready Foundation

**Status: largely complete**

This phase establishes the structural prerequisites for a Progressive Web App without adding any runtime PWA behavior. The goal is that adding a service worker later does not require restructuring the app shell or metadata.

**What belongs here:**

- `manifest.json` with correct name, short name, description, start URL, scope, display mode, theme color, background color, and orientation
- `appleWebApp` metadata for standalone iOS behavior
- `themeColor` in viewport config for browser chrome
- `viewportFit: cover` for safe area awareness on notch devices
- Correct viewport scaling configuration
- Application name in metadata
- `formatDetection: { telephone: false }` to prevent unintended mobile formatting

**What does not belong here yet:**

- PWA icons — do not add placeholder or broken icons; an empty icons array is better than incorrect icons
- Service worker — premature installation causes debugging complexity without benefit
- Caching strategy — cannot be designed properly until the data fetching patterns are stable

**Exit criteria:** the app shell is structured so that a service worker and icons can be added in the next phase without restructuring any existing code.

---

### Phase 2 — Basic Installable PWA

**Status: icon/manifest layer complete; service worker pending**

This phase makes the app installable on Android and iOS home screens. At this point the app behaves identically offline and online — there is no offline functionality yet, only installability.

**What belongs here:**

- ✓ Full PWA icon set: 192×192, 512×512, 512×512 maskable PNG in `public/icons/`
- ✓ Updated `manifest.json` icons array with correct `sizes`, `type`, `purpose`
- ✓ Maskable icon variant for Android adaptive icons
- ✓ Apple touch icon (`/icons/apple-touch-icon.png`) wired via Next.js `metadata.icons.apple`
- Validation of installability criteria in Chrome DevTools / Lighthouse (manual; no service worker yet)

**What does not belong here yet:**

- Service worker — still not needed for installability alone; the manifest and icons are sufficient
- Offline fallback page — do not add until a clear offline strategy is defined

**Exit criteria:** the app passes browser PWA installability checks and can be added to home screen on Android (Chrome) and iOS (Safari) with a correct icon and name.

---

### Phase 3 — Advanced PWA Features

**Recommended timing: post-MVP1, explicitly planned, not assumed**

This phase adds meaningful offline capabilities and optionally push notifications. It should only be considered once:

- the product has stable data fetching patterns
- the public-facing content model is finalized
- there is a clear user scenario for offline access (e.g., saving a festival page for offline reference)

**What belongs here:**

- Service worker implementation — via dedicated PWA/service worker tooling or a Workbox-based strategy; the specific approach should be chosen at implementation time
- Runtime caching strategy: choose a strategy per resource type
  - festival and village list pages: stale-while-revalidate
  - map tiles: cache-first with expiry
  - static assets: cache-first permanently
  - API responses: network-first or stale-while-revalidate depending on freshness needs
- Offline fallback page: a minimal static page shown when both network and cache miss
- Optional: IndexedDB for user-side local data (favorites, saved festivals)
- Optional: background sync for future user interactions that need queuing
- Optional: push notifications — only add if there is a concrete use case (e.g., festival reminders)
- Production-only PWA validation: Lighthouse PWA audit in CI

**What to avoid in this phase:**

- Offline-first architecture for the admin panel — the admin panel requires live data and should not have complex caching
- Aggressive caching of admin routes
- Implementing offline sync before the data model is stable

**Exit criteria:** the public app is usable in limited offline mode, scores well in Lighthouse PWA audit, and the service worker does not interfere with the admin panel.

---

## 4. Testing Roadmap

### Philosophy

Testing should follow the architecture. Because the project uses Feature-Sliced Design, tests should be co-located with the code they cover and should reflect the layer boundaries. A unit test for a shared utility should not need to know about a festival entity. An entity test should not need to know about page routing.

Testing is introduced in phases that mirror how the product itself grows.

---

### Phase 1 — Frontend Unit and Integration Testing Foundation

**Recommended timing: before or alongside the first domain feature implementation**

The goal of this phase is to have a working test infrastructure, not high coverage. Establishing the tooling early prevents test debt from accumulating.

**Recommended tooling:**

- **Vitest** — test runner, chosen because it integrates naturally with the TypeScript and ESM setup used by this project. It is compatible with the Vite ecosystem, has fast cold starts, and is a natural fit for a Next.js project that does not need Jest's full configuration surface.
- **Testing Library (`@testing-library/react`)** — for component-level interaction testing. Tests should describe behavior from the user's perspective, not internal implementation details.

**What belongs here:**

- Test runner configuration (Vitest config in `apps/web`)
- Basic test utilities: render helpers, mock providers (Mantine, QueryClient)
- First tests on shared utilities: `shared/config`, `shared/lib`, `shared/i18n`, `shared/hooks`
- Entity model tests: pure transformation or selector logic
- Component tests for shared/ui: does the component render, does it respond to props
- CI integration: lint, typecheck, and unit tests run automatically on every pull request (test execution CI, not a deployment pipeline)

**What does not belong here yet:**

- E2E tests — do not mix concerns; unit and integration testing infrastructure should be stable first
- Mocking the database — never mock the database in integration tests; instead test against real data shapes using fixtures

**Exit criteria:** test runner is configured, at minimum one test per shared layer exists, tests run in CI. ✓ All criteria met — Vitest is configured in `apps/web`, first tests cover entity model and shared UI, and CI runs automatically via `.github/workflows/ci.yml`.

**Note:** frontend tests use Vitest, while backend tests use Jest. This is an intentional split based on tooling suitability and does not require unification.

---

### Phase 2 — End-to-End Testing Foundation

**Recommended timing: when the first full public user flow is implemented end-to-end**

The goal of this phase is to cover the primary user journeys on the web application.

**Recommended tooling:**

- **Playwright** — chosen for cross-browser E2E testing. It supports Chromium, Firefox, and WebKit, which allows testing the public app in a Safari-like environment (relevant for iOS PWA behavior). Playwright has excellent support for mobile viewport emulation and is well suited to the Next.js App Router model.

**What belongs here:**

- Playwright configuration targeting Chromium and WebKit at minimum
- Tests for the primary public flows: home page, festival list, festival detail, village page
- Basic admin flow tests: login, create entry, publish
- Mobile viewport tests: run the same flows at 390px width to catch mobile breakage
- CI integration: E2E tests run automatically as part of the test pipeline; staging environment integration can be added once a deployment pipeline exists

**What does not belong here yet:**

- PWA-specific tests — these require a service worker and should not be attempted until Phase 3
- Visual regression testing — valuable but not the right priority at this stage

**Exit criteria:** primary public and admin flows have at least one E2E test each, mobile viewport is covered, CI runs these tests.

---

### Phase 3 — Platform-Specific and PWA-Specific Tests

**Recommended timing: when Phase 2 (PWA) is complete**

**What belongs here:**

- Lighthouse CI integration for PWA audit scores in production builds
- Service worker behavior tests: cache hit/miss, offline fallback rendering
- Playwright tests with service worker enabled: verify offline page renders correctly
- Telegram Mini App bridge tests: verify no-op implementations do not throw in a non-Telegram environment, verify correct detection logic
- Platform detection tests: unit tests for `isTelegramWebApp`, `getTelegramColorScheme`, viewport adapters

**Exit criteria:** PWA audit passes in CI, offline fallback is tested, Telegram bridge is unit-tested.

---

## 5. Platform Abstraction Roadmap

### Current separation

The app currently isolates all Telegram-specific logic inside `shared/lib/telegram/`. All functions in this module are safe no-ops when running outside a Telegram WebApp context. This prevents platform-specific code from leaking into domain logic or UI components.

### Target structure

As the project grows toward supporting multiple platforms (web, PWA, Telegram Mini App), the platform abstraction layer should grow with it. The goal is to keep platform detection and platform-specific behavior completely isolated from business logic.

**`shared/lib/telegram/`** — already established. Future additions in MVP2:
- `init.ts` — call `Telegram.WebApp.ready()` at app startup
- Full implementations of `viewport.ts`, `back-button.ts`
- Real `getTelegramThemeParams` integration in `useTelegramColorScheme`

**`shared/lib/pwa/`** — to be added when Phase 2 PWA work begins:
- `install-prompt.ts` — capture and expose the `beforeinstallprompt` event
- `service-worker.ts` — registration helper and update detection

**`shared/hooks/platform/`** — a set of hooks that abstract platform differences:
- `usePlatform.ts` — returns the current platform context: `'web' | 'pwa' | 'telegram'`
- `useIsInstalled.ts` — returns whether the app is running in standalone mode
- `useIsTelegram.ts` — thin wrapper over `isTelegramWebApp()`

**`shared/types/platform.ts`** — shared type definitions:
- `TPlatform = 'web' | 'pwa' | 'telegram'`
- `IPlatformContext` — if a context provider becomes necessary

### Principle

Platform-specific code must never appear in entity, feature, widget, or page layers. Any component that needs to behave differently based on platform should receive platform information as a prop or hook result, not detect it inline. This makes the business logic components portable across all three platforms.

---

## 6. Recommended Priority Order

The following is a practical sequence that reflects the architecture decisions already made and avoids premature investment in infrastructure before the product has real content.

1. **Finish the domain model** — implement Village, Festival, FestivalEdition, LocationPoint in the Prisma schema and the NestJS modules
2. **Implement admin CRUD** — villages and festivals management through the admin panel
3. **Implement public flows** — festival list, festival detail, village page, map view
4. **Add the testing foundation** — Vitest configuration and first unit tests; do this before CRUD grows large enough to make testing difficult to introduce
5. **Add PWA icons and installability** — manifest icons, touch icon, installability validation
6. **Add E2E tests** — Playwright covering the primary public flows and at least one admin flow
7. **Add service worker** — only after public flows are stable and tested
8. **Add offline caching** — only after the service worker is stable
9. **Add push notifications** — only if there is a validated user need (festival reminders, date changes)
10. **MVP2 — Telegram Mini App** — implement the Mini App shell using the existing API and bridge layer; the domain logic does not change

---

## 7. What We Intentionally Postpone

The following items are explicitly out of scope for the near term. Adding them before the core product is stable would increase complexity without proportional benefit.

**PWA**
- Service worker — too early; caching strategy cannot be designed without stable data fetching patterns
- Offline-first architecture — the app is content-driven and SEO-oriented; offline access is secondary to discoverability
- Background sync — no user write actions exist yet that would benefit from this
- Push notifications — no notification content model exists; premature infrastructure
- IndexedDB local storage — not needed until there is a clear offline user scenario
- Advanced Workbox configuration — belongs in Phase 3 after simpler caching is validated

**Testing**
- Visual regression testing — valuable but not the right priority before the UI is stable
- Contract testing — relevant once the Mini App and web consume the same API concurrently
- Load testing — not the current concern at MVP stage
- 100% code coverage targets — coverage targets create the wrong incentives; coverage follows meaningful tests, not the other way around

**Platform**
- Complex platform-branching logic in business code — keep all platform detection in `shared/lib` and `shared/hooks/platform`; never branch on platform inside entities, features, or widgets
- Separate Mini App UI codebase — the architecture decision is clear: one domain, one API, one shared layer; Mini App UI extends from the same base rather than duplicating it

**Infrastructure**
- CI/CD deployment pipeline — full deployment automation remains postponed; it depends on hosting decisions not yet made. Automated test execution (lint, typecheck, unit tests, E2E) is a separate concern and is planned within the testing phases above — it can be introduced much earlier
- Monitoring and error tracking — relevant post-launch, not during MVP development

---

## Summary

| Track | Phase | Trigger |
|---|---|---|
| PWA | Phase 1 — Ready | Complete |
| PWA | Phase 2 — Installable | After core product flows |
| PWA | Phase 3 — Offline + advanced | Post-MVP1 |
| Testing | Phase 1 — Unit/integration | **In progress** — Vitest foundation in place, first tests added |
| Testing | Phase 2 — E2E | After first full public flow |
| Testing | Phase 3 — PWA/platform-specific | After PWA Phase 2 |
| Platform | Telegram bridge stubs | Complete |
| Platform | Full Telegram bridge | MVP2 |
| Platform | `shared/lib/pwa` | PWA Phase 2 |
| Platform | `shared/hooks/platform` | When 2+ platforms active |
