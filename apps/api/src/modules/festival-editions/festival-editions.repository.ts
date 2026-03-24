import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';

// Explicit field selection — all edition fields, no nested festival.
// The parent festival context is provided by the caller when needed.
const editionSelect = {
  id: true,
  festivalId: true,
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

export type TFestivalEditionRecord = Prisma.FestivalEditionGetPayload<{
  select: typeof editionSelect;
}>;

@Injectable()
export class FestivalEditionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByFestivalId(festivalId: number): Promise<TFestivalEditionRecord[]> {
    return this.prisma.festivalEdition.findMany({
      where: { festivalId },
      select: editionSelect,
      orderBy: { year: 'desc' },
    });
  }

  findById(id: number): Promise<TFestivalEditionRecord | null> {
    return this.prisma.festivalEdition.findUnique({
      where: { id },
      select: editionSelect,
    });
  }

  create(data: Prisma.FestivalEditionCreateInput): Promise<TFestivalEditionRecord> {
    return this.prisma.festivalEdition.create({
      data,
      select: editionSelect,
    });
  }

  update(id: number, data: Prisma.FestivalEditionUpdateInput): Promise<TFestivalEditionRecord> {
    return this.prisma.festivalEdition.update({
      where: { id },
      data,
      select: editionSelect,
    });
  }
}
