# CLAUDE.md

## Project
Cyprus Villages — приложение с календарём фестивалей в кипрских деревнях.

Цель MVP1: веб-приложение с публичной частью и админ-панелью.
Цель MVP2: Telegram Mini App на той же доменной модели и API.

## Product context
Приложение должно позволять:
- просматривать фестивали по месяцам, деревням, регионам и категориям;
- открывать страницу фестиваля с датой, описанием, координатами, парковкой и ссылками на источник;
- открывать страницу деревни со списком фестивалей и картой;
- редактировать данные через admin panel;
- поддерживать неполные записи, например `TBA` вместо точной даты;
- сохранять историю изменений и избегать жёсткого удаления данных.

## Core business entities
Основные сущности:
- Village
- Festival
- FestivalEdition
- LocationPoint
- Media
- User
- AuditLog

### Domain rules
1. Один `Festival` — это постоянная сущность, например бренд фестиваля.
2. Один `FestivalEdition` — это выпуск фестиваля в конкретном году.
3. Даты, парковка, venue, source URL, статус публикации должны храниться на уровне `FestivalEdition`.
4. Деревни и фестивали не удаляются физически без крайней необходимости; использовать soft delete / archive.
5. Должен поддерживаться статус `TBA` для неизвестной даты.
6. Координаты хранить отдельными числовыми полями, не только строковым адресом.
7. Любые административные изменения, влияющие на публичные данные, по возможности логировать в `AuditLog`.

## Architecture decisions
- Monorepo.
- `apps/web` — Next.js приложение, публичная часть + admin panel.
- `apps/api` — NestJS API.
- `database/prisma` — Prisma schema, migrations, seed.
- `packages/*` — shared types, constants, schemas, config.
- UI library: **Mantine**.
- Data fetching: **TanStack Query**.
- Forms: **react-hook-form + zod**.
- Maps: **Leaflet**.
- Database: **PostgreSQL**.
- ORM: **Prisma**.

## Frontend rules
Frontend должен быть организован по **FSD**.

### Required layers
- `app`
- `pages`
- `widgets`
- `features`
- `entities`
- `shared`

### Frontend constraints
1. Не смешивать бизнес-логику разных слоёв.
2. Не импортировать компоненты Mantine напрямую во всех местах без необходимости; предпочитать обёртки через `shared/ui`.
3. Не размещать API-запросы внутри UI-компонентов, если это можно вынести в `entities/*/api` или `shared/api`.
4. Не складывать все типы в один глобальный файл.
5. Любая Telegram-специфика должна находиться в `shared/lib/telegram` или в отдельном bridge/provider, а не быть размазана по приложению.
6. Публичная часть и админка должны иметь отдельные layout, но использовать общие сущности и shared-слой.
7. Сразу проектировать UI mobile-first, чтобы позже безболезненно вынести Mini App.

## Backend rules
1. Backend строить модульно по доменам.
2. Разделять public API и admin API.
3. DTO и валидация обязательны для входных данных.
4. Не писать SQL/Prisma-запросы хаотично по коду; доступ к данным держать в сервисах/репозиториях.
5. Для публичных сущностей поддерживать статусы: `draft`, `published`, `archived`, `cancelled`.
6. Для удаления по умолчанию использовать soft delete или archive strategy.
7. Swagger/OpenAPI должен поддерживаться для API.

## Expected repository layout
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
  architecture/
  api/
  database/
```

## Coding standards
- TypeScript everywhere where possible.
- Для type aliases использовать префикс `T`.
- Для interfaces использовать префикс `I`.
- Не создавать огромные файлы-комбайны.
- Предпочитать маленькие, читаемые функции.
- Придерживаться явных названий: `FestivalEditionStatus`, `VillageCard`, `UpdateFestivalEditionDto`.
- Избегать magic strings; выносить константы и enum-like values.
- Писать код так, чтобы его было легко переиспользовать в web и future mini app.

## What Claude Code should do by default
Когда работаешь с этим проектом:
1. Сначала анализируй текущую структуру и не ломай выбранную архитектуру.
2. Предлагай изменения в существующем стиле проекта.
3. Если добавляешь новую фичу, сразу раскладывай её по FSD-слоям.
4. Если изменяешь доменную модель, проверь влияние на:
   - Prisma schema
   - DTO
   - shared types
   - frontend entities
   - admin forms
5. Если создаёшь новые файлы, используй понятные и консистентные имена.
6. Если есть неоднозначность, выбирай решение, которое проще масштабируется под mini app.
7. Не добавляй тяжёлые зависимости без причины.
8. Не переусложняй MVP.

## What Claude Code should avoid
- Не переносить бизнес-логику в `shared`, если она относится к конкретной сущности.
- Не смешивать `Festival` и `FestivalEdition`.
- Не хранить дату фестиваля только строкой без нормализованного поля.
- Не реализовывать удаление через hard delete без отдельной причины.
- Не строить админку отдельно от общей доменной модели.
- Не дублировать типы между frontend и backend, если можно вынести их в `packages`.
- Не создавать UI с сильной зависимостью только от desktop-сценария.

## Preferred implementation order
1. Repository scaffolding.
2. Web app initialization.
3. API initialization.
4. Prisma setup.
5. Mantine + base layouts.
6. Domain schema: Village, Festival, FestivalEdition, LocationPoint.
7. Admin CRUD for Villages.
8. Admin CRUD for Festivals and Editions.
9. Public festival list and details.
10. Map integration.
11. Localization.
12. Telegram bridge preparation.

## Definition of done for any task
Задача считается завершённой, если:
- код соответствует архитектуре;
- типы и валидация не сломаны;
- новые файлы лежат в правильных слоях;
- нет явного дублирования;
- сохранена готовность к будущему Telegram Mini App;
- обновлены связанные типы/схемы/DTO, если это требовалось.

## Schema and data model rules
1. Не создавать модели с неоднозначным владением данными. Если модель допускает несколько интерпретаций (например, несколько опциональных FK), задокументируй intended invariant в schema.prisma-комментарии и в `docs/architecture.md § Schema design decisions`.
2. Если Prisma не может выразить инвариант на уровне БД, задокументируй его явно как service-level rule. Не оставлять его неявным.
3. Намеренные упрощения MVP (например, строка вместо timestamp, inline поля вместо translation tables) должны быть задокументированы с объяснением — чтобы будущий рефакторинг был осознанным решением, а не случайным обнаружением.
4. Не делать коммит изменений схемы без явной просьбы пользователя.
5. При изменении схемы всегда проверять влияние на: Prisma client, API DTOs, shared types, frontend entities.
