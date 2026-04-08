import { Injectable } from '@nestjs/common';
import { FestivalEditionStatus, MediaKind, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';

// Explicit field selection — returned for all village queries.
// Keeps response shapes predictable and avoids accidental relation loading.
const villageSelect = {
  id: true,
  slug: true,
  nameEl: true,
  district: true,
  region: true,
  centerLat: true,
  centerLng: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  translations: {
    select: {
      locale: true,
      name: true,
      description: true,
    },
  },
} satisfies Prisma.VillageSelect;

export type TVillageRecord = Prisma.VillageGetPayload<{
  select: typeof villageSelect;
}>;

// ── Detail select — used only for GET /villages/:slug ─────────────────────────
// Extends the base village fields with active festivals that have at least one
// PUBLISHED edition. Editions are pre-filtered to PUBLISHED so the service
// does not need an extra pass.

const villageFestivalEditionSelect = {
  id: true,
  year: true,
  startDate: true,
  endDate: true,
  isDateTba: true,
  startTime: true,
  endTime: true,
  status: true,
  publishedAt: true,
  lastVerifiedAt: true,
  venueName: true,
  venueLat: true,
  venueLng: true,
  parkingName: true,
  parkingLat: true,
  parkingLng: true,
  officialUrl: true,
  sourceUrl: true,
  sourceNote: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FestivalEditionSelect;

const villageDetailSelect = {
  id: true,
  slug: true,
  nameEl: true,
  district: true,
  region: true,
  centerLat: true,
  centerLng: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  translations: {
    select: {
      locale: true,
      name: true,
      description: true,
    },
  },
  festivals: {
    where: {
      isActive: true,
      editions: { some: { status: FestivalEditionStatus.PUBLISHED } },
    },
    select: {
      id: true,
      slug: true,
      villageId: true,
      titleEl: true,
      category: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      translations: {
        select: { locale: true, title: true, description: true },
        orderBy: { locale: 'asc' as const },
      },
      editions: {
        where: { status: FestivalEditionStatus.PUBLISHED },
        select: villageFestivalEditionSelect,
        orderBy: { year: 'desc' as const },
      },
    },
    orderBy: { titleEl: 'asc' as const },
  },
  media: {
    where: { kind: MediaKind.COVER },
    select: { id: true, url: true, alt: true, width: true, height: true },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.VillageSelect;

export type TVillageWithFestivals = Prisma.VillageGetPayload<{
  select: typeof villageDetailSelect;
}>;

@Injectable()
export class VillagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(): Promise<TVillageRecord[]> {
    return this.prisma.village.findMany({
      where: { isActive: true },
      select: villageSelect,
      orderBy: { nameEl: 'asc' },
    });
  }

  findAll(): Promise<TVillageRecord[]> {
    return this.prisma.village.findMany({
      select: villageSelect,
      orderBy: { nameEl: 'asc' },
    });
  }

  findBySlug(slug: string): Promise<TVillageRecord | null> {
    return this.prisma.village.findUnique({
      where: { slug },
      select: villageSelect,
    });
  }

  findBySlugWithFestivals(slug: string): Promise<TVillageWithFestivals | null> {
    return this.prisma.village.findUnique({
      where: { slug },
      select: villageDetailSelect,
    });
  }

  findById(id: number): Promise<TVillageRecord | null> {
    return this.prisma.village.findUnique({
      where: { id },
      select: villageSelect,
    });
  }

  create(data: Prisma.VillageCreateInput): Promise<TVillageRecord> {
    return this.prisma.village.create({
      data,
      select: villageSelect,
    });
  }

  update(id: number, data: Prisma.VillageUpdateInput): Promise<TVillageRecord> {
    return this.prisma.village.update({
      where: { id },
      data,
      select: villageSelect,
    });
  }
}
