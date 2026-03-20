-- Rename MediaKind enum value IMAGE → GALLERY.
-- MediaKind is used to describe the presentation role of a media asset.
-- IMAGE was semantically inconsistent (a file type, not a role).
-- GALLERY correctly describes the role: an inline or gallery image.
ALTER TYPE "MediaKind" RENAME VALUE 'IMAGE' TO 'GALLERY';
