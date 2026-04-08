import { Injectable } from '@nestjs/common';
import { MediaKind, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';

const mediaSelect = {
  id: true,
  url: true,
  alt: true,
  width: true,
  height: true,
  kind: true,
  villageId: true,
  festivalId: true,
  festivalEditionId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MediaSelect;

export type TMediaRecord = Prisma.MediaGetPayload<{ select: typeof mediaSelect }>;

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MediaCreateInput): Promise<TMediaRecord> {
    return this.prisma.media.create({ data, select: mediaSelect });
  }

  findById(id: number): Promise<TMediaRecord | null> {
    return this.prisma.media.findUnique({ where: { id }, select: mediaSelect });
  }

  findByOwner(filter: {
    villageId?: number;
    festivalId?: number;
    festivalEditionId?: number;
  }): Promise<TMediaRecord[]> {
    const where: Prisma.MediaWhereInput = {};
    if (filter.villageId !== undefined) where.villageId = filter.villageId;
    if (filter.festivalId !== undefined) where.festivalId = filter.festivalId;
    if (filter.festivalEditionId !== undefined)
      where.festivalEditionId = filter.festivalEditionId;

    return this.prisma.media.findMany({
      where,
      select: mediaSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  findCoversByVillage(villageId: number): Promise<TMediaRecord[]> {
    return this.prisma.media.findMany({
      where: { villageId, kind: MediaKind.COVER },
      select: mediaSelect,
    });
  }

  delete(id: number): Promise<TMediaRecord> {
    return this.prisma.media.delete({ where: { id }, select: mediaSelect });
  }
}
