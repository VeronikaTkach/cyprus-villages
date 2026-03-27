import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';

const locationPointSelect = {
  id: true,
  type: true,
  label: true,
  lat: true,
  lng: true,
  note: true,
  villageId: true,
  festivalEditionId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LocationPointSelect;

// Compact select for the public map endpoint
const mapPointSelect = {
  id: true,
  type: true,
  label: true,
  lat: true,
  lng: true,
  villageId: true,
  festivalEditionId: true,
} satisfies Prisma.LocationPointSelect;

export type TLocationPointRecord = Prisma.LocationPointGetPayload<{
  select: typeof locationPointSelect;
}>;

export type TMapPointRecord = Prisma.LocationPointGetPayload<{
  select: typeof mapPointSelect;
}>;

@Injectable()
export class LocationPointsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number): Promise<TLocationPointRecord | null> {
    return this.prisma.locationPoint.findUnique({
      where: { id },
      select: locationPointSelect,
    });
  }

  findByVillage(villageId: number): Promise<TLocationPointRecord[]> {
    return this.prisma.locationPoint.findMany({
      where: { villageId },
      select: locationPointSelect,
      orderBy: { type: 'asc' },
    });
  }

  findByFestivalEdition(festivalEditionId: number): Promise<TLocationPointRecord[]> {
    return this.prisma.locationPoint.findMany({
      where: { festivalEditionId },
      select: locationPointSelect,
      orderBy: { type: 'asc' },
    });
  }

  findAllActiveForMap(): Promise<TMapPointRecord[]> {
    return this.prisma.locationPoint.findMany({
      where: { isActive: true },
      select: mapPointSelect,
      orderBy: { id: 'asc' },
    });
  }

  create(data: Prisma.LocationPointCreateInput): Promise<TLocationPointRecord> {
    return this.prisma.locationPoint.create({
      data,
      select: locationPointSelect,
    });
  }

  update(id: number, data: Prisma.LocationPointUpdateInput): Promise<TLocationPointRecord> {
    return this.prisma.locationPoint.update({
      where: { id },
      data,
      select: locationPointSelect,
    });
  }
}
