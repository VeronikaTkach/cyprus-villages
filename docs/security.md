# security.md

This document covers authentication design, token handling, access control decisions, and known security trade-offs in the Cyprus Villages project.

---

## Threat model (MVP1)

### In scope

| Threat | Notes |
|--------|-------|
| XSS → token theft | The JWT is stored in an httpOnly cookie — JavaScript cannot read it. XSS can still make authenticated requests from the victim's browser session, but cannot exfiltrate the token for use elsewhere. The risk is significantly reduced compared to `localStorage` storage. |
| Brute-force login | Rate limited to 5 attempts per 10 minutes per IP via `@nestjs/throttler`. |
| Unauthorised admin access | A user without a valid JWT must not reach any admin endpoint. Covered by `JwtAuthGuard` on all admin controllers. |

### Out of scope for MVP1

- Advanced targeted attacks (credential stuffing at scale, session fixation, token replay beyond JWT expiry).
- Account recovery flows (password reset, email verification).
- Two-factor authentication.
- Automated security scanning or penetration testing.

These are not dismissed as unimportant — they are deferred because the current admin team is small, the data is non-sensitive, and the application is not yet publicly indexed.

---

## Authentication model

### Current implementation

Authentication is cookie-based JWT:

- **Login:** `POST /api/v1/auth/login` — validates credentials with `bcryptjs`, sets a signed JWT as an httpOnly cookie (`cv-auth`), returns `{ ok: true }`.
- **Token storage:** the JWT is stored in an httpOnly, `SameSite=Strict` cookie. It is never accessible from JavaScript.
- **Transport:** the browser attaches the cookie automatically on every request to the same origin. `shared/api/http-client.ts` uses `credentials: 'include'` on all fetch calls.
- **Guard:** `JwtAuthGuard` extracts the token from the cookie first, with an `Authorization: Bearer` header fallback (kept for Swagger UI compatibility). `RolesGuard` enforces role-based access (`EDITOR`, `CONTENT_ADMIN`, `SUPER_ADMIN`).
- **Logout:** `POST /api/v1/auth/logout` clears the cookie server-side and returns `{ ok: true }`. A logout button is present in the admin header.
- **401 handling:** the HTTP client detects a 401 response, sets `isAuthenticated: false` in the Zustand store (for the UI redirect guard), and redirects to `/admin/login`.
- **Rate limiting:** `POST /auth/login` is protected by `@nestjs/throttler` — 5 attempts per 10 minutes per IP.

### Client-side auth state

The frontend keeps an `isAuthenticated: boolean` flag in a Zustand store persisted under the key `cv-auth-ui`. This flag is used only for UI gating (redirect guard in `AdminLayout`). It does not hold the JWT — the actual session credential is the httpOnly cookie managed by the browser.

On 401 responses the flag is cleared, which triggers the redirect guard to send the user back to `/admin/login`.

### Cookie settings

| Setting | Value | Reason |
|---------|-------|--------|
| `httpOnly` | `true` | Token not accessible to JavaScript |
| `secure` | `true` in production | HTTPS-only transmission |
| `sameSite` | `Strict` | Blocks cross-origin requests from carrying the cookie (CSRF protection) |
| `path` | `/` | Cookie sent on all requests to the origin |
| `maxAge` | 7 days | Persistent session across browser restarts |

### Swagger compatibility

The `Authorization: Bearer` header fallback in `JwtAuthGuard` is kept intentionally. It allows Swagger UI (`/api/v1/docs`) to continue working by pasting a token into the "Authorize" dialog. This fallback is harmless in production — it is only useful for manual API testing.

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

The `AuditLog` entity records a `userId` with every write. All four domain service modules (`villages`, `festivals`, `festival-editions`, `location-points`) now propagate the authenticated user ID from the controller layer to the service layer and into the audit log row.

The `@CurrentUser()` decorator extracts the JWT payload from the request, and each admin controller method passes `user.sub` into the corresponding service method, which forwards it to `writeAuditLog()`. No admin mutation writes `userId: null`.
