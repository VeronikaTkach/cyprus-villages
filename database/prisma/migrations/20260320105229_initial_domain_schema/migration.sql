-- CreateEnum
CREATE TYPE "FestivalCategory" AS ENUM ('WINE', 'FOOD', 'CULTURAL', 'RELIGIOUS', 'MUSIC', 'ARTS', 'SPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "FestivalEditionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LocationPointType" AS ENUM ('PARKING', 'VENUE', 'MEETING_POINT', 'WC', 'SHUTTLE', 'VIEWPOINT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'COVER', 'THUMBNAIL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CONTENT_ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE', 'CANCEL');

-- CreateTable
CREATE TABLE "Village" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRu" TEXT,
    "nameEl" TEXT,
    "descriptionEn" TEXT,
    "descriptionRu" TEXT,
    "descriptionEl" TEXT,
    "district" TEXT,
    "region" TEXT,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Festival" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "villageId" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleRu" TEXT,
    "titleEl" TEXT,
    "shortDescriptionEn" TEXT,
    "shortDescriptionRu" TEXT,
    "shortDescriptionEl" TEXT,
    "category" "FestivalCategory" NOT NULL DEFAULT 'OTHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Festival_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FestivalEdition" (
    "id" SERIAL NOT NULL,
    "festivalId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isDateTba" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "status" "FestivalEditionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "venueName" TEXT,
    "venueLat" DOUBLE PRECISION,
    "venueLng" DOUBLE PRECISION,
    "parkingName" TEXT,
    "parkingLat" DOUBLE PRECISION,
    "parkingLng" DOUBLE PRECISION,
    "officialUrl" TEXT,
    "sourceUrl" TEXT,
    "sourceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FestivalEdition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationPoint" (
    "id" SERIAL NOT NULL,
    "type" "LocationPointType" NOT NULL,
    "label" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "villageId" INTEGER,
    "festivalEditionId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
    "villageId" INTEGER,
    "festivalId" INTEGER,
    "festivalEditionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" "AuditAction" NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Village_slug_key" ON "Village"("slug");

-- CreateIndex
CREATE INDEX "Village_isActive_idx" ON "Village"("isActive");

-- CreateIndex
CREATE INDEX "Village_district_idx" ON "Village"("district");

-- CreateIndex
CREATE INDEX "Village_region_idx" ON "Village"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Festival_slug_key" ON "Festival"("slug");

-- CreateIndex
CREATE INDEX "Festival_villageId_idx" ON "Festival"("villageId");

-- CreateIndex
CREATE INDEX "Festival_isActive_idx" ON "Festival"("isActive");

-- CreateIndex
CREATE INDEX "Festival_category_idx" ON "Festival"("category");

-- CreateIndex
CREATE INDEX "FestivalEdition_festivalId_idx" ON "FestivalEdition"("festivalId");

-- CreateIndex
CREATE INDEX "FestivalEdition_status_idx" ON "FestivalEdition"("status");

-- CreateIndex
CREATE INDEX "FestivalEdition_year_idx" ON "FestivalEdition"("year");

-- CreateIndex
CREATE INDEX "FestivalEdition_startDate_idx" ON "FestivalEdition"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "FestivalEdition_festivalId_year_key" ON "FestivalEdition"("festivalId", "year");

-- CreateIndex
CREATE INDEX "LocationPoint_villageId_idx" ON "LocationPoint"("villageId");

-- CreateIndex
CREATE INDEX "LocationPoint_festivalEditionId_idx" ON "LocationPoint"("festivalEditionId");

-- CreateIndex
CREATE INDEX "LocationPoint_type_idx" ON "LocationPoint"("type");

-- CreateIndex
CREATE INDEX "LocationPoint_isActive_idx" ON "LocationPoint"("isActive");

-- CreateIndex
CREATE INDEX "Media_villageId_idx" ON "Media"("villageId");

-- CreateIndex
CREATE INDEX "Media_festivalId_idx" ON "Media"("festivalId");

-- CreateIndex
CREATE INDEX "Media_festivalEditionId_idx" ON "Media"("festivalEditionId");

-- CreateIndex
CREATE INDEX "Media_kind_idx" ON "Media"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "Festival" ADD CONSTRAINT "Festival_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FestivalEdition" ADD CONSTRAINT "FestivalEdition_festivalId_fkey" FOREIGN KEY ("festivalId") REFERENCES "Festival"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationPoint" ADD CONSTRAINT "LocationPoint_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationPoint" ADD CONSTRAINT "LocationPoint_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_festivalId_fkey" FOREIGN KEY ("festivalId") REFERENCES "Festival"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
