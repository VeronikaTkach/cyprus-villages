# Stack Decisions — Cyprus Villages

## Goal

Cyprus Villages is an SEO-oriented web application with a public-facing website, festival calendar, interactive map, and an administrative panel. The architecture is intentionally designed so that a Telegram Mini App can be added later without rebuilding the core domain or API.

The goal is not just to build a working MVP, but to use a modern, explainable, portfolio-strong stack with:
- up-to-date and supported technologies
- strong developer experience
- clear architecture
- end-to-end type safety
- a realistic production-style backend
- a relational database aligned with the business domain

## Final target stack

### Runtime
- Node.js 24 LTS
- pnpm workspace + Turbo

### Frontend
- Next.js 16
- React 19
- TypeScript 5
- Mantine 8
- TanStack Query 5
- React Hook Form
- Zod 4
- Leaflet + react-leaflet 5

### Backend
- NestJS 11
- Prisma ORM 7
- PostgreSQL 18

## Why this stack was chosen

### Next.js 16
Next.js 16 was selected as the main React framework for a production-style web application. This project needs:
- SEO-friendly festival and village pages
- slug-based routing
- server rendering and a modern app architecture
- a solid foundation for both the public website and the admin panel

Next.js 16 is the current major release and is the right choice for a modern portfolio project that should look relevant and production-oriented.

### React 19
React 19 is used as the current React baseline for a new project. It is the natural match for Next.js 16 and keeps the frontend stack aligned with the current React ecosystem. Choosing React 19 instead of staying on an older React version makes the stack more future-facing and stronger from a portfolio perspective.

### TypeScript 5
TypeScript is a core part of the architecture, not an optional enhancement. It is used for:
- strongly typed domain entities
- predictable DTOs and API contracts
- safe work across a monorepo
- better integration with React, NestJS, and Prisma tooling

TypeScript improves maintainability, readability, and architectural discipline across the project.

### Mantine 8
Mantine was chosen as the single UI library for:
- the public application
- the administrative panel
- future mobile and Mini App adaptation

Reasons for this choice:
- strong component set for form-heavy applications
- excellent primitives for navigation, overlays, inputs, and dates
- fast path to a polished UI without unnecessary complexity
- suitable for both content-oriented pages and back-office interfaces
- current major version with an official migration path from previous versions

We intentionally do not use one UI library for the app and another for the admin panel. A single UI system reduces maintenance cost, improves consistency, and simplifies the shared UI layer.

### TanStack Query 5
TanStack Query is used for server state management:
- festival list loading
- village and festival detail fetching
- filtering
- caching
- refetching
- admin mutations

This is a better fit than trying to manage server state through a global client store. It is especially suitable for CRUD-oriented applications with both public and admin interfaces.

### React Hook Form + Zod 4
This combination was selected for forms and validation because the project will include:
- festival edit forms
- village edit forms
- map-related coordinates and points
- publication status controls
- filters and query parameter handling

React Hook Form provides a performant and ergonomic way to build forms, while Zod 4 provides a modern declarative validation model with strong TypeScript integration. Zod 4 is chosen early to avoid accumulating unnecessary legacy on v3.

### Leaflet + react-leaflet 5
The map is a core product feature: parking points, venue points, village coordinates, and route-related context. This project does not require a heavy GIS platform; it needs a lightweight, understandable, and reliable map solution.

Leaflet and react-leaflet 5 were chosen because they are practical, popular, and well suited to this level of mapping functionality.

### NestJS 11
NestJS was chosen as the backend framework because it provides:
- a clear modular architecture
- well-structured modules, controllers, and providers
- strong TypeScript support
- a strong foundation for auth, admin API, public API, and domain modules
- a production-style backend architecture that is valuable in a portfolio project

For a project with modules such as `villages`, `festivals`, `festival-editions`, `location-points`, `media`, and `audit-log`, NestJS is a better fit than a minimal hand-rolled Express or Fastify setup.

### Prisma ORM 7
Prisma was chosen as the ORM and database access layer because it provides:
- a clear schema model
- a typed client
- convenient migrations
- strong developer experience
- excellent TypeScript integration

This is especially important because the project is being built by a frontend-focused developer who wants a backend and database layer that is predictable, productive, and easy to reason about.

### PostgreSQL 18
PostgreSQL was chosen as the main database because the project’s domain is naturally relational:
- villages
- festivals
- festival editions
- location points
- users
- roles
- audit log
- media links
- translations

PostgreSQL is a mature, reliable, and highly respected relational database system. For this domain, it is a more appropriate choice than a document database.

### Node.js 24 LTS
The project runtime is explicitly pinned to Node.js 24 LTS rather than depending on whatever local version happens to be installed.

Reasons:
- LTS versions are better targets for real projects than odd-numbered or non-LTS lines
- a pinned runtime improves reproducibility
- backend tooling and Prisma are better aligned with supported LTS environments
- it reflects stronger engineering hygiene in a portfolio project

## Why alternatives were not chosen

### Why not Vite + React SPA
Because the project needs a strong SEO-friendly public layer with slug pages and server-oriented rendering. Next.js is a better fit for that requirement and presents more strongly as a production-ready architecture.

### Why not a separate UI library for the admin panel
Because one UI stack:
- reduces complexity
- lowers maintenance cost
- keeps a consistent visual language
- simplifies the shared UI layer

### Why not raw Express or Fastify
Because the goal is not only to make the API work, but to demonstrate a structured, scalable backend architecture. NestJS is a stronger choice for that purpose.

### Why not MongoDB
Because the project data model is naturally relational. PostgreSQL is easier to justify architecturally and more suitable for the domain.

### Why not Supabase instead of a custom backend
Because the goal is to showcase a real backend engineering layer in the portfolio, not only to assemble a product with a BaaS.

### Why not GraphQL
Because for the MVP stage, REST + OpenAPI solves the problem more simply and with less overhead. The domain is centered around lists, detail pages, filters, and CRUD operations, and GraphQL does not add enough value here to justify the extra complexity.

## Architectural implications of this stack

- the frontend is built as an FSD-oriented Next.js monorepo app
- the backend is built as a NestJS modular monolith
- Prisma schema and migrations are managed centrally
- PostgreSQL is the primary source of truth
- UI is built through a shared UI layer on top of Mantine
- the future Telegram Mini App will reuse the same domain and API, not a separate business logic layer

## Final decision

The following target stack is adopted for Cyprus Villages:

- Node.js 24 LTS
- Next.js 16
- React 19
- TypeScript 5
- Mantine 8
- TanStack Query 5
- React Hook Form
- Zod 4
- Leaflet + react-leaflet 5
- NestJS 11
- Prisma ORM 7
- PostgreSQL 18

This stack was chosen because it is modern, portfolio-strong, type-safe, scalable, and practical for a frontend-focused developer who wants to build a high-quality backend and database layer without unnecessary low-level complexity.

## Testing stack

The project uses different testing tools for frontend and backend:

- **Frontend (`apps/web`):** Vitest + `@testing-library/react` — chosen for fast execution, native ESM support, and alignment with the React/Vite ecosystem.
- **Backend (`apps/api`):** Jest — used for service-level unit tests where the Node.js environment and NestJS patterns are primary.

This split is intentional and reflects ecosystem fit rather than inconsistency.

There is no requirement to unify the test runners unless a concrete need arises.