-- Add typicalMonth to Festival.
-- Stores the usual calendar month (1–12) for a recurring festival.
-- Optional: null means no typical month has been specified.
-- Does NOT replace FestivalEdition dates — those remain the authoritative source.

ALTER TABLE "Festival" ADD COLUMN "typicalMonth" INTEGER;
