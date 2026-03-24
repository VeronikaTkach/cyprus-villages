-- Migration: festival_translations
-- Extracts multilingual title/description fields out of the Festival table
-- into a new FestivalTranslation table (one row per locale per festival).
-- Festival.titleEl is retained as a fixed "always-shown" Greek display name.

-- ── 1. Create new table ────────────────────────────────────────────────────

CREATE TABLE "FestivalTranslation" (
    "id"          SERIAL PRIMARY KEY,
    "festivalId"  INTEGER NOT NULL,
    "locale"      TEXT    NOT NULL,
    "title"       TEXT    NOT NULL,
    "description" TEXT,
    CONSTRAINT "FestivalTranslation_festivalId_fkey"
        FOREIGN KEY ("festivalId")
        REFERENCES "Festival"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "FestivalTranslation_festivalId_locale_key"
    ON "FestivalTranslation"("festivalId", "locale");

CREATE INDEX "FestivalTranslation_festivalId_idx"
    ON "FestivalTranslation"("festivalId");

CREATE INDEX "FestivalTranslation_locale_idx"
    ON "FestivalTranslation"("locale");

-- ── 2. Migrate existing data ───────────────────────────────────────────────

-- English — titleEn was NOT NULL, so every festival gets an 'en' row.
INSERT INTO "FestivalTranslation" ("festivalId", "locale", "title", "description")
SELECT "id", 'en', "titleEn", "shortDescriptionEn"
FROM "Festival";

-- Russian — only where titleRu exists.
INSERT INTO "FestivalTranslation" ("festivalId", "locale", "title", "description")
SELECT "id", 'ru', "titleRu", "shortDescriptionRu"
FROM "Festival"
WHERE "titleRu" IS NOT NULL;

-- Greek — titleEl stays on Festival as a fixed display field.
-- We also create a translation row so the Greek locale works uniformly.
INSERT INTO "FestivalTranslation" ("festivalId", "locale", "title", "description")
SELECT "id", 'el', "titleEl", "shortDescriptionEl"
FROM "Festival"
WHERE "titleEl" IS NOT NULL;

-- ── 3. Drop migrated columns from Festival ─────────────────────────────────

ALTER TABLE "Festival"
    DROP COLUMN "titleEn",
    DROP COLUMN "titleRu",
    DROP COLUMN "shortDescriptionEn",
    DROP COLUMN "shortDescriptionRu",
    DROP COLUMN "shortDescriptionEl";
-- titleEl intentionally kept — permanent Greek display name.
