# Architecture Consistency Audit — 2026-03-27

## Scope

Compared the current codebase against:
- `CLAUDE.md`
- `docs/architecture.md`
- `docs/security.md`
- `docs/progress.md`
- `docs/stack-decisions.md`
- `docs/roadmap-pwa-testing.md`

---

## Summary

The architecture is holding well. All core domain invariants — Festival/FestivalEdition separation, published-only public data exposure, LocationPoint ownership enforcement, FSD layer discipline, public/admin controller separation, Prisma access discipline — are respected in the actual codebase with no meaningful drift from the documented design. The majority of deviations from ideal are intentional MVP simplifications that are already documented. Three concrete follow-ups were identified: stale TODO comments in audit log writes, an undocumented product rule for festival detail maps, and an undocumented global ValidationPipe behaviour.

---

## Strong alignment

- **Festival / FestivalEdition separation** — edition-specific fields (year, dates, venue, parking, status, source) never leak into Festival; the two entities are distinct at every layer from DB schema through API response.
- **Public-only published edition exposure** — `filterPublishedEditions()` runs on every public read path; no unpublished edition can reach a public consumer.
- **LocationPoint ownership enforcement** — `assertNotOrphan()` blocks orphan creation at service layer; `UpdateLocationPointDto` excludes ownership FKs, making reassignment structurally impossible.
- **FSD layer boundaries** — `shared/ui/` is domain-agnostic; `entities/` follows model/api/ui consistently; `features/` contains only admin form orchestration; no domain logic in shared.
- **Public/admin controller separation** — every module uses distinct controller files; guards applied at class level on all five admin controllers with no gaps.
- **Prisma access discipline** — no direct `new PrismaClient()` outside the approved pattern; all services and repositories use injected `PrismaService`.
- **Soft-delete preference** — no hard deletes in any current service; `AuditAction.DELETE` exists in schema but is unused in routine operations.
- **Telegram bridge isolation** — `shared/lib/telegram/` is a complete no-op stub on web; no Telegram branches in entities, features, or pages.
- **No premature PWA/service worker complexity** — manifest in place; icons array intentionally empty; no service worker added ahead of Phase 3 roadmap milestone.

---

## Accepted MVP trade-offs

- **In-memory month filtering** — `?month=` is filtered in application layer after DB query; all other festival filters (`category`, `villageId`, `year`) apply at DB level. Documented in `docs/architecture.md → Schema design decisions`.
- **Client-side map point filtering on detail pages** — village and festival detail pages fetch all active `LocationPoint` records and filter in the browser. Documented in `docs/architecture.md → Maps strategy`.
- **Single-ownership LocationPoint admin UI** — the admin UI supports only village-only or edition-only creation; dual-ownership is supported by domain and API but not exposed in the UI. Documented in `docs/architecture.md → Schema design decisions`.
- **JWT stored in localStorage** — current admin auth stores the access token via Zustand persist. Accepted for MVP1 with a documented migration path to httpOnly cookies. See `docs/security.md`.

---

## Temporary limitations

- **Audit log actor attribution** — all four domain services write `userId: null` to every `AuditLog` row. The `@CurrentUser()` decorator and `JwtAuthGuard` are both in place; the wiring from controller to service to `writeAuditLog()` is the only remaining step. Tracked in `docs/security.md` and `docs/progress.md`.
- **No rate limiting on `/auth/login`** — brute-force protection is absent. Documented as required before production in `docs/security.md`.
- **No logout UI** — `clearToken()` exists in the auth store but is not wired to any UI element in the admin header. Tracked in `docs/progress.md → Known technical debt`.
- **Client-side-only admin page redirect** — `AdminLayout.tsx` redirects on missing token after Zustand hydration; there is no Next.js middleware intercepting `/admin/*` server-side. The API itself is fully protected. Noted in `docs/security.md`.
- **Stale TODO comments** — all `writeAuditLog()` private methods contain the comment "userId is null until auth is implemented." Auth is now implemented; the comment is factually incorrect and should be updated to reflect the real state (wiring deferred, not blocked).

---

## Follow-up actions

1. **Auth hardening** — migrate token storage to httpOnly cookies; add `@nestjs/throttler` rate limiting on `/auth/login`.
2. **Audit log user attribution** — wire `@CurrentUser()` through each admin controller method → service → `writeAuditLog()` across all four domain services.
3. **Update stale TODO comments** — change "until auth is implemented" wording in `writeAuditLog()` methods to reflect that the gap is deferred wiring, not a missing prerequisite.
4. **Document latest-edition-only rule** — add a note in `docs/architecture.md` stating that festival detail pages surface map data from the most recently published edition only.
5. **Document `enableImplicitConversion` in ValidationPipe** — add a note in `CLAUDE.md` that this setting is active globally, and that explicit `@Type(() => Number)` should still be used on numeric query params.

---

## Notes

This snapshot is intentionally curated and should be used as a baseline for comparison in future architecture audits.
