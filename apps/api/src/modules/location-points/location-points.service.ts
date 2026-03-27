import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';
import {
  LocationPointsRepository,
  TLocationPointRecord,
  TMapPointRecord,
} from './location-points.repository';
import { CreateLocationPointDto } from './dto/create-location-point.dto';
import { UpdateLocationPointDto } from './dto/update-location-point.dto';

@Injectable()
export class LocationPointsService {
  constructor(
    private readonly locationPointsRepository: LocationPointsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Admin reads ───────────────────────────────────────────

  getByVillage(villageId: number): Promise<TLocationPointRecord[]> {
    return this.locationPointsRepository.findByVillage(villageId);
  }

  getByFestivalEdition(festivalEditionId: number): Promise<TLocationPointRecord[]> {
    return this.locationPointsRepository.findByFestivalEdition(festivalEditionId);
  }

  async getById(id: number): Promise<TLocationPointRecord> {
    const point = await this.locationPointsRepository.findById(id);
    if (!point) {
      throw new NotFoundException(`LocationPoint #${id} not found`);
    }
    return point;
  }

  // ── Public reads ──────────────────────────────────────────

  getPublicMapPoints(): Promise<TMapPointRecord[]> {
    return this.locationPointsRepository.findAllActiveForMap();
  }

  // ── Admin mutations ───────────────────────────────────────

  async create(dto: CreateLocationPointDto): Promise<TLocationPointRecord> {
    this.assertNotOrphan(dto.villageId, dto.festivalEditionId);

    await this.assertVillageExists(dto.villageId);
    await this.assertFestivalEditionExists(dto.festivalEditionId);

    const data: Prisma.LocationPointCreateInput = {
      type: dto.type,
      label: dto.label,
      lat: dto.lat,
      lng: dto.lng,
      note: dto.note ?? null,
      ...(dto.villageId !== undefined && {
        village: { connect: { id: dto.villageId } },
      }),
      ...(dto.festivalEditionId !== undefined && {
        festivalEdition: { connect: { id: dto.festivalEditionId } },
      }),
    };

    const point = await this.locationPointsRepository.create(data);

    await this.writeAuditLog(point.id, AuditAction.CREATE, null, point);

    return point;
  }

  async update(id: number, dto: UpdateLocationPointDto): Promise<TLocationPointRecord> {
    const before = await this.getById(id);

    const point = await this.locationPointsRepository.update(id, {
      type: dto.type,
      label: dto.label,
      lat: dto.lat,
      lng: dto.lng,
      note: dto.note,
    });

    await this.writeAuditLog(id, AuditAction.UPDATE, before, point);

    return point;
  }

  async archive(id: number): Promise<TLocationPointRecord> {
    const before = await this.getById(id);

    if (!before.isActive) {
      throw new ConflictException(`LocationPoint #${id} is already archived`);
    }

    const point = await this.locationPointsRepository.update(id, { isActive: false });

    await this.writeAuditLog(id, AuditAction.ARCHIVE, before, point);

    return point;
  }

  // ── Ownership invariant ───────────────────────────────────

  private assertNotOrphan(
    villageId: number | undefined,
    festivalEditionId: number | undefined,
  ): void {
    if (villageId === undefined && festivalEditionId === undefined) {
      throw new BadRequestException(
        'A LocationPoint must belong to at least one owner: ' +
          'provide villageId, festivalEditionId, or both.',
      );
    }
  }

  // ── Reference validation ──────────────────────────────────

  private async assertVillageExists(villageId: number | undefined): Promise<void> {
    if (villageId === undefined) return;

    const village = await this.prisma.village.findUnique({
      where: { id: villageId },
      select: { id: true },
    });

    if (!village) {
      throw new NotFoundException(`Village #${villageId} not found`);
    }
  }

  private async assertFestivalEditionExists(
    festivalEditionId: number | undefined,
  ): Promise<void> {
    if (festivalEditionId === undefined) return;

    const edition = await this.prisma.festivalEdition.findUnique({
      where: { id: festivalEditionId },
      select: { id: true },
    });

    if (!edition) {
      throw new NotFoundException(
        `FestivalEdition #${festivalEditionId} not found`,
      );
    }
  }

  // ── Audit ─────────────────────────────────────────────────

  private async writeAuditLog(
    entityId: number,
    action: AuditAction,
    before: TLocationPointRecord | null,
    after: TLocationPointRecord | null,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'LocationPoint',
        entityId,
        action,
        beforeJson: before
          ? (JSON.parse(JSON.stringify(before)) as Prisma.InputJsonValue)
          : undefined,
        afterJson: after
          ? (JSON.parse(JSON.stringify(after)) as Prisma.InputJsonValue)
          : undefined,
        userId: null,
      },
    });
  }
}
