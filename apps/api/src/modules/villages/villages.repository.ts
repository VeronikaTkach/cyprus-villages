import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
