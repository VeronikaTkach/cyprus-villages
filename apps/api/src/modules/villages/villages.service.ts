import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';
import { VillagesRepository, TVillageRecord, TVillageWithFestivals } from './villages.repository';
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

  async getVillageBySlug(slug: string): Promise<TVillageWithFestivals> {
    const village = await this.villagesRepository.findBySlugWithFestivals(slug);

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

  async createVillage(dto: CreateVillageDto, userId: number): Promise<TVillageRecord> {
    const existing = await this.villagesRepository.findBySlug(dto.slug);

    if (existing) {
      throw new ConflictException(
        `Village with slug '${dto.slug}' already exists`,
      );
    }

    const village = await this.villagesRepository.create({
      slug: dto.slug,
      nameEl: dto.nameEl,
      district: dto.district,
      region: dto.region,
      centerLat: dto.centerLat,
      centerLng: dto.centerLng,
      translations: {
        create: this.buildTranslationCreates(dto),
      },
    });

    await this.writeAuditLog(village.id, AuditAction.CREATE, null, village, userId);

    return village;
  }

  async updateVillage(id: number, dto: UpdateVillageDto, userId: number): Promise<TVillageRecord> {
    const before = await this.getVillageById(id);

    const upserts = this.buildTranslationUpserts(id, dto);

    const village = await this.villagesRepository.update(id, {
      nameEl: dto.nameEl,
      district: dto.district,
      region: dto.region,
      centerLat: dto.centerLat,
      centerLng: dto.centerLng,
      ...(upserts.length > 0 && { translations: { upsert: upserts } }),
    });

    await this.writeAuditLog(id, AuditAction.UPDATE, before, village, userId);

    return village;
  }

  async archiveVillage(id: number, userId: number): Promise<TVillageRecord> {
    const before = await this.getVillageById(id);

    if (!before.isActive) {
      throw new ConflictException(`Village #${id} is already archived`);
    }

    const village = await this.villagesRepository.update(id, {
      isActive: false,
    });

    await this.writeAuditLog(id, AuditAction.ARCHIVE, before, village, userId);

    return village;
  }

  // ── Translation helpers ───────────────────────────────────

  private buildTranslationCreates(
    dto: CreateVillageDto,
  ): Prisma.VillageTranslationCreateWithoutVillageInput[] {
    const creates: Prisma.VillageTranslationCreateWithoutVillageInput[] = [
      { locale: 'en', name: dto.nameEn, description: dto.descriptionEn ?? null },
    ];

    if (dto.nameRu) {
      creates.push({
        locale: 'ru',
        name: dto.nameRu,
        description: dto.descriptionRu ?? null,
      });
    }

    if (dto.nameEl) {
      creates.push({
        locale: 'el',
        name: dto.nameEl,
        description: dto.descriptionEl ?? null,
      });
    }

    return creates;
  }

  private buildTranslationUpserts(
    id: number,
    dto: UpdateVillageDto,
  ): Prisma.VillageTranslationUpsertWithWhereUniqueWithoutVillageInput[] {
    const upserts: Prisma.VillageTranslationUpsertWithWhereUniqueWithoutVillageInput[] =
      [];

    if (dto.nameEn !== undefined) {
      upserts.push({
        where: { villageId_locale: { villageId: id, locale: 'en' } },
        create: { locale: 'en', name: dto.nameEn, description: dto.descriptionEn ?? null },
        update: { name: dto.nameEn, description: dto.descriptionEn ?? null },
      });
    }

    if (dto.nameRu !== undefined) {
      upserts.push({
        where: { villageId_locale: { villageId: id, locale: 'ru' } },
        create: { locale: 'ru', name: dto.nameRu, description: dto.descriptionRu ?? null },
        update: { name: dto.nameRu, description: dto.descriptionRu ?? null },
      });
    }

    if (dto.nameEl !== undefined) {
      upserts.push({
        where: { villageId_locale: { villageId: id, locale: 'el' } },
        create: { locale: 'el', name: dto.nameEl, description: dto.descriptionEl ?? null },
        update: { name: dto.nameEl, description: dto.descriptionEl ?? null },
      });
    }

    return upserts;
  }

  // ── Audit ─────────────────────────────────────────────────

  private async writeAuditLog(
    entityId: number,
    action: AuditAction,
    before: TVillageRecord | null,
    after: TVillageRecord | null,
    userId: number,
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
        userId,
      },
    });
  }
}
