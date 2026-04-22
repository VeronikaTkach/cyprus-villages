import { Injectable } from '@nestjs/common';
import { FestivalCategory, FestivalEditionStatus, MediaKind, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';

interface IFindAllActiveFilters {
  category?: FestivalCategory;
  villageId?: number;
  year?: number;
}

// Explicit field selection — predictable shape for all festival queries.
// Editions are included ordered year-descending; translations ordered by locale
// so callers always receive a stable, consistent structure.
const festivalSelect = {
  id: true,
  slug: true,
  villageId: true,
  titleEl: true,
  category: true,
  typicalMonth: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  translations: {
    select: {
      locale: true,
      title: true,
      description: true,
    },
    orderBy: { locale: 'asc' as const },
  },
  editions: {
    select: {
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
    },
    orderBy: { year: 'desc' as const },
  },
} satisfies Prisma.FestivalSelect;

export type TFestivalRecord = Prisma.FestivalGetPayload<{
  select: typeof festivalSelect;
}>;

// ── Detail select — used only for GET /festivals/:slug ────────────────────────
// Extends the base fields with COVER media (at most 1 for MVP).

const festivalDetailSelect = {
  ...festivalSelect,
  media: {
    where: { kind: MediaKind.COVER },
    select: { id: true, url: true, alt: true, width: true, height: true },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.FestivalSelect;

export type TFestivalWithMedia = Prisma.FestivalGetPayload<{
  select: typeof festivalDetailSelect;
}>;

// ── Map select — used only for GET /map/festivals ─────────────────────────────
// Fetches only the fields required to produce a map marker.
// Editions are pre-filtered to PUBLISHED and limited to the fields needed for
// the edition-selection tiebreak (id, year, startDate) plus venue coordinates.

const festivalMapSelect = {
  id: true,
  slug: true,
  titleEl: true,
  editions: {
    where: { status: FestivalEditionStatus.PUBLISHED },
    select: {
      id: true,
      year: true,
      startDate: true,
      venueLat: true,
      venueLng: true,
    },
    orderBy: { year: 'desc' as const },
  },
} satisfies Prisma.FestivalSelect;

export type TFestivalMapRow = Prisma.FestivalGetPayload<{
  select: typeof festivalMapSelect;
}>;

@Injectable()
export class FestivalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(filters: IFindAllActiveFilters = {}): Promise<TFestivalRecord[]> {
    const where: Prisma.FestivalWhereInput = { isActive: true };

    if (filters.category !== undefined) {
      where.category = filters.category;
    }

    if (filters.villageId !== undefined) {
      where.villageId = filters.villageId;
    }

    if (filters.year !== undefined) {
      where.editions = {
        some: {
          status: FestivalEditionStatus.PUBLISHED,
          year: filters.year,
        },
      };
    }

    return this.prisma.festival.findMany({
      where,
      select: festivalSelect,
      orderBy: { titleEl: 'asc' },
    });
  }

  findAll(): Promise<TFestivalRecord[]> {
    return this.prisma.festival.findMany({
      select: festivalSelect,
      orderBy: { titleEl: 'asc' },
    });
  }

  findBySlug(slug: string): Promise<TFestivalRecord | null> {
    return this.prisma.festival.findUnique({
      where: { slug },
      select: festivalSelect,
    });
  }

  findBySlugWithMedia(slug: string): Promise<TFestivalWithMedia | null> {
    return this.prisma.festival.findUnique({
      where: { slug },
      select: festivalDetailSelect,
    });
  }

  findById(id: number): Promise<TFestivalRecord | null> {
    return this.prisma.festival.findUnique({
      where: { id },
      select: festivalSelect,
    });
  }

  findForMap(): Promise<TFestivalMapRow[]> {
    return this.prisma.festival.findMany({
      where: {
        isActive: true,
        editions: { some: { status: FestivalEditionStatus.PUBLISHED } },
      },
      select: festivalMapSelect,
    });
  }

  create(data: Prisma.FestivalCreateInput): Promise<TFestivalRecord> {
    return this.prisma.festival.create({
      data,
      select: festivalSelect,
    });
  }

  update(id: number, data: Prisma.FestivalUpdateInput): Promise<TFestivalRecord> {
    return this.prisma.festival.update({
      where: { id },
      data,
      select: festivalSelect,
    });
  }
}
