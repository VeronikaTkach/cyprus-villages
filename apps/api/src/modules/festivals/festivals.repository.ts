import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';

// Explicit field selection — predictable shape for all festival queries.
// Editions are included ordered year-descending; translations ordered by locale
// so callers always receive a stable, consistent structure.
const festivalSelect = {
  id: true,
  slug: true,
  villageId: true,
  titleEl: true,
  category: true,
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

@Injectable()
export class FestivalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(): Promise<TFestivalRecord[]> {
    return this.prisma.festival.findMany({
      where: { isActive: true },
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

  findById(id: number): Promise<TFestivalRecord | null> {
    return this.prisma.festival.findUnique({
      where: { id },
      select: festivalSelect,
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
