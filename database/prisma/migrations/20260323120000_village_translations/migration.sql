-- Migration: village_translations
-- Extracts multilingual name/description fields out of the Village table
-- into a new VillageTranslation table (one row per locale per village).
-- Village.nameEl is retained as a fixed "always-shown" Greek display name.

-- ── 1. Create new table ────────────────────────────────────────────────────

CREATE TABLE "VillageTranslation" (
    "id"          SERIAL PRIMARY KEY,
    "villageId"   INTEGER NOT NULL,
    "locale"      TEXT    NOT NULL,
    "name"        TEXT    NOT NULL,
    "description" TEXT,
    CONSTRAINT "VillageTranslation_villageId_fkey"
        FOREIGN KEY ("villageId")
        REFERENCES "Village"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "VillageTranslation_villageId_locale_key"
    ON "VillageTranslation"("villageId", "locale");

CREATE INDEX "VillageTranslation_villageId_idx"
    ON "VillageTranslation"("villageId");

CREATE INDEX "VillageTranslation_locale_idx"
    ON "VillageTranslation"("locale");

-- ── 2. Migrate existing data ───────────────────────────────────────────────

-- English — nameEn was NOT NULL, so every village gets an 'en' row.
INSERT INTO "VillageTranslation" ("villageId", "locale", "name", "description")
SELECT "id", 'en', "nameEn", "descriptionEn"
FROM "Village";

-- Russian — only where nameRu exists.
INSERT INTO "VillageTranslation" ("villageId", "locale", "name", "description")
SELECT "id", 'ru', "nameRu", "descriptionRu"
FROM "Village"
WHERE "nameRu" IS NOT NULL;

-- Greek — nameEl stays on Village as a fixed display field.
-- We also create a translation row so the Greek locale works uniformly.
INSERT INTO "VillageTranslation" ("villageId", "locale", "name", "description")
SELECT "id", 'el', "nameEl", "descriptionEl"
FROM "Village"
WHERE "nameEl" IS NOT NULL;

-- ── 3. Drop migrated columns from Village ─────────────────────────────────

ALTER TABLE "Village"
    DROP COLUMN "nameEn",
    DROP COLUMN "nameRu",
    DROP COLUMN "descriptionEn",
    DROP COLUMN "descriptionRu",
    DROP COLUMN "descriptionEl";
-- nameEl intentionally kept — permanent Greek display name.
