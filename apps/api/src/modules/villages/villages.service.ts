import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';
import { VillagesRepository, TVillageRecord } from './villages.repository';
import { CreateVillageDto } from './dto/create-village.dto';
import { UpdateVillageDto } from './dto/update-village.dto';

@Injectable()
export class VillagesService {
  constructor(
    private readonly villagesRepository: VillagesRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Public reads ──────────────────────────────────────────

  getActiveVillages(): Promise<TVillageRecord[]> {
    return this.villagesRepository.findAllActive();
  }

  async getVillageBySlug(slug: string): Promise<TVillageRecord> {
    const village = await this.villagesRepository.findBySlug(slug);

    if (!village || !village.isActive) {
      throw new NotFoundException(`Village '${slug}' not found`);
    }

    return village;
  }

  // ── Admin reads ───────────────────────────────────────────

  getAllVillages(): Promise<TVillageRecord[]> {
    return this.villagesRepository.findAll();
  }

  async getVillageById(id: number): Promise<TVillageRecord> {
    const village = await this.villagesRepository.findById(id);

    if (!village) {
      throw new NotFoundException(`Village #${id} not found`);
    }

    return village;
  }

  // ── Admin mutations ───────────────────────────────────────

  async createVillage(dto: CreateVillageDto): Promise<TVillageRecord> {
    const existing = await this.villagesRepository.findBySlug(dto.slug);

    if (existing) {
      throw new ConflictException(
        `Village with slug '${dto.slug}' already exists`,
      );
    }

    const village = await this.villagesRepository.create({
      slug: dto.slug,
      nameEn: dto.nameEn,
      nameRu: dto.nameRu,
      nameEl: dto.nameEl,
      district: dto.district,
      region: dto.region,
      descriptionEn: dto.descriptionEn,
      descriptionRu: dto.descriptionRu,
      descriptionEl: dto.descriptionEl,
      centerLat: dto.centerLat,
      centerLng: dto.centerLng,
    });

    await this.writeAuditLog(village.id, AuditAction.CREATE, null, village);

    return village;
  }

  async updateVillage(id: number, dto: UpdateVillageDto): Promise<TVillageRecord> {
    const before = await this.getVillageById(id);

    const village = await this.villagesRepository.update(id, {
      nameEn: dto.nameEn,
      nameRu: dto.nameRu,
      nameEl: dto.nameEl,
      district: dto.district,
      region: dto.region,
      descriptionEn: dto.descriptionEn,
      descriptionRu: dto.descriptionRu,
      descriptionEl: dto.descriptionEl,
      centerLat: dto.centerLat,
      centerLng: dto.centerLng,
    });

    await this.writeAuditLog(id, AuditAction.UPDATE, before, village);

    return village;
  }

  async archiveVillage(id: number): Promise<TVillageRecord> {
    const before = await this.getVillageById(id);

    if (!before.isActive) {
      throw new ConflictException(`Village #${id} is already archived`);
    }

    const village = await this.villagesRepository.update(id, {
      isActive: false,
    });

    await this.writeAuditLog(id, AuditAction.ARCHIVE, before, village);

    return village;
  }

  // ── Audit ─────────────────────────────────────────────────
  //
  // userId is null until auth is implemented.
  // TODO: accept userId from request context once guards are in place.
  //
  // Dates in TVillageRecord are serialised to ISO strings via JSON.stringify,
  // producing a plain JSON-compatible object for storage.

  private async writeAuditLog(
    entityId: number,
    action: AuditAction,
    before: TVillageRecord | null,
    after: TVillageRecord | null,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Village',
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
