# security.md

This document covers authentication design, token handling, access control decisions, and known security trade-offs in the Cyprus Villages project.

---

## Threat model (MVP1)

### In scope

| Threat | Notes |
|--------|-------|
| XSS → token theft | Current `localStorage` storage makes this the primary risk. Any injected script can read the token and impersonate an admin. Mitigated post-MVP by moving to httpOnly cookies. |
| Brute-force login | No rate limiting on `POST /auth/login`. An attacker can try passwords at will. Must be addressed before production. |
| Unauthorised admin access | A user without a valid JWT must not reach any admin endpoint. Covered by `JwtAuthGuard` on all admin controllers. |

### Out of scope for MVP1

- Advanced targeted attacks (credential stuffing at scale, session fixation, token replay beyond JWT expiry).
- Account recovery flows (password reset, email verification).
- Two-factor authentication.
- Automated security scanning or penetration testing.

These are not dismissed as unimportant — they are deferred because the current admin team is small, the data is non-sensitive, and the application is not yet publicly indexed.

---

## Authentication model

### Current implementation (MVP1)

Authentication is JWT-based:

- **Login:** `POST /api/v1/auth/login` — validates credentials with `bcryptjs`, returns a signed JWT access token.
- **Token storage:** the access token is stored in the browser via Zustand `persist` middleware, using `localStorage` under the key `cv-auth`.
- **Transport:** `shared/api/http-client.ts` reads the token from the store and attaches it as an `Authorization: Bearer` header on every admin API request.
- **Guard:** `JwtAuthGuard` validates the token on all admin controllers. `RolesGuard` enforces role-based access (`EDITOR`, `CONTENT_ADMIN`, `SUPER_ADMIN`).
- **401 handling:** the HTTP client detects a 401 response, clears the stored token, and redirects to `/admin/login`. The redirect is suppressed when the request originates from the login page itself to prevent a redirect loop.

### Known risk: localStorage token storage

Storing the JWT in `localStorage` means any JavaScript running on the page can read it. If an XSS vulnerability is introduced anywhere in the application, the token can be exfiltrated and used to impersonate an admin user.

This is accepted for MVP1 because:
- The admin panel is not publicly discoverable.
- The team is small and the data is non-sensitive personal data.
- Implementing httpOnly cookies correctly requires backend changes that are deferred to avoid blocking other priorities.

### Target implementation (post-MVP)

Token storage must migrate to httpOnly cookies before the application handles sensitive data or has a broader admin team.

**Target state:**
- The login endpoint sets the token as an httpOnly, `Secure`, `SameSite=Strict` cookie.
- The frontend makes no explicit token reads — the browser attaches the cookie automatically on every same-origin request.
- Logout calls a `POST /auth/logout` endpoint that clears the cookie (`Set-Cookie: max-age=0`).
- No JWT is accessible from JavaScript — XSS cannot exfiltrate the token.

**Why cookie-based is preferred:**
- httpOnly cookies are invisible to JavaScript. XSS can execute arbitrary JS but cannot read the token.
- `SameSite=Strict` blocks cross-origin requests from carrying the cookie, providing CSRF protection without a separate token.
- Logout is authoritative: clearing a cookie on the server is reliable, whereas invalidating a `localStorage` token requires client cooperation or a server-side denylist.

**Migration path:**
1. Update `auth.controller.ts` to set the token as a cookie in the login response.
2. Update `JwtAuthGuard` to extract the token from the cookie alongside (or instead of) the `Authorization` header.
3. Remove the Zustand auth store and the `Bearer` header injection from `http-client.ts`.
4. Add `POST /auth/logout` to clear the cookie.

### Rate limiting on the login endpoint

`POST /auth/login` currently has no rate limiting. Brute-force password attacks against the admin login page are possible.

**Required before production:** apply rate limiting to `/auth/login`. The recommended approach is the `@nestjs/throttler` module (or a reverse-proxy rule). A safe default is 5 attempts per minute per IP address, with exponential back-off or a temporary IP block after repeated failures.

---

## Access control

### Roles

| Role | Permitted actions |
|------|-------------------|
| `EDITOR` | Create and edit drafts |
| `CONTENT_ADMIN` | Publish and archive; inherits editor capabilities |
| `SUPER_ADMIN` | Manage users, roles, and system settings; unrestricted access |

All three roles are currently permitted on all admin controllers — no per-role endpoint differentiation is enforced beyond the guard. Role granularity will be tightened when the `users` admin module is implemented.

---

## Audit log — user attribution

The `AuditLog` entity records a `userId` with every write. However, the current implementation passes `userId: null` in some service modules because the authenticated user context is not yet consistently propagated from the guard to the service layer.

**Known affected area:** `LocationPoint` mutations log with `userId: null`. The `Festival` and `Village` modules have the same gap — they were implemented before the auth guard was in place.

This is a temporary limitation. It is acceptable for MVP1 because the admin team is small and the audit log is used for content history, not compliance auditing.

**This must be fixed before the audit log is used for accountability or compliance purposes.** An audit trail where every write is attributed to `null` provides no traceability — it cannot answer "who changed this record?" and cannot support any future access review or incident investigation.

**Target:** every admin mutation must propagate the authenticated user's ID from `@CurrentUser()` (available via `JwtAuthGuard`) through the service method signature to the `AuditLog.create()` call. No `AuditLog` row written by a named admin action should have `userId: null`.

The `@CurrentUser()` decorator is already implemented at `apps/api/src/common/decorators/current-user.decorator.ts`. The work required is:
1. Add `currentUser: IJwtPayload` as a parameter to each admin controller method.
2. Pass `currentUser.sub` (the user ID) into the corresponding service method.
3. Use it in the `writeAuditLog()` call instead of the hardcoded `null`.
