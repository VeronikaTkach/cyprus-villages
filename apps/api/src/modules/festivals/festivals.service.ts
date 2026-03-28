import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, FestivalEditionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';
import { FestivalsRepository, TFestivalRecord } from './festivals.repository';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';
import { PublicFestivalsFilterDto } from './dto/public-festivals-filter.dto';

@Injectable()
export class FestivalsService {
  constructor(
    private readonly festivalsRepository: FestivalsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Public reads ──────────────────────────────────────────
  // Public callers only see PUBLISHED editions.

  async getActiveFestivals(filters: PublicFestivalsFilterDto = {}): Promise<TFestivalRecord[]> {
    const festivals = await this.festivalsRepository.findAllActive({
      category: filters.category,
      villageId: filters.villageId,
      year: filters.year,
    });

    let results = festivals.map((f) => this.filterPublishedEditions(f));

    // Month filter is applied in-memory after editions are restricted to PUBLISHED.
    if (filters.month !== undefined) {
      results = results
        .map((f) => ({
          ...f,
          editions: f.editions.filter((e) => {
            if (!e.startDate) return false;
            return new Date(e.startDate).getUTCMonth() + 1 === filters.month;
          }),
        }))
        .filter((f) => f.editions.length > 0);
    }

    return results;
  }

  async getFestivalBySlug(slug: string): Promise<TFestivalRecord> {
    const festival = await this.festivalsRepository.findBySlug(slug);

    if (!festival || !festival.isActive) {
      throw new NotFoundException(`Festival '${slug}' not found`);
    }

    return this.filterPublishedEditions(festival);
  }

  // ── Admin reads ───────────────────────────────────────────
  // Admin callers see all editions regardless of status.

  getAllFestivals(): Promise<TFestivalRecord[]> {
    return this.festivalsRepository.findAll();
  }

  async getFestivalById(id: number): Promise<TFestivalRecord> {
    const festival = await this.festivalsRepository.findById(id);

    if (!festival) {
      throw new NotFoundException(`Festival #${id} not found`);
    }

    return festival;
  }

  // ── Admin mutations ───────────────────────────────────────

  async createFestival(dto: CreateFestivalDto, userId: number): Promise<TFestivalRecord> {
    const existing = await this.festivalsRepository.findBySlug(dto.slug);

    if (existing) {
      throw new ConflictException(
        `Festival with slug '${dto.slug}' already exists`,
      );
    }

    const village = await this.prisma.village.findUnique({
      where: { id: dto.villageId },
      select: { id: true },
    });

    if (!village) {
      throw new NotFoundException(`Village #${dto.villageId} not found`);
    }

    const festival = await this.festivalsRepository.create({
      slug: dto.slug,
      village: { connect: { id: dto.villageId } },
      titleEl: dto.titleEl ?? null,
      ...(dto.category !== undefined && { category: dto.category }),
      translations: {
        create: this.buildTranslationCreates(dto),
      },
    });

    await this.writeAuditLog(festival.id, AuditAction.CREATE, null, festival, userId);

    return festival;
  }

  async updateFestival(id: number, dto: UpdateFestivalDto, userId: number): Promise<TFestivalRecord> {
    const before = await this.getFestivalById(id);

    const upserts = this.buildTranslationUpserts(id, dto);

    const festival = await this.festivalsRepository.update(id, {
      titleEl: dto.titleEl,
      category: dto.category,
      ...(upserts.length > 0 && { translations: { upsert: upserts } }),
    });

    await this.writeAuditLog(id, AuditAction.UPDATE, before, festival, userId);

    return festival;
  }

  async archiveFestival(id: number, userId: number): Promise<TFestivalRecord> {
    const before = await this.getFestivalById(id);

    if (!before.isActive) {
      throw new ConflictException(`Festival #${id} is already archived`);
    }

    const festival = await this.festivalsRepository.update(id, {
      isActive: false,
    });

    await this.writeAuditLog(id, AuditAction.ARCHIVE, before, festival, userId);

    return festival;
  }

  // ── Translation helpers ───────────────────────────────────

  private buildTranslationCreates(
    dto: CreateFestivalDto,
  ): Prisma.FestivalTranslationCreateWithoutFestivalInput[] {
    const creates: Prisma.FestivalTranslationCreateWithoutFestivalInput[] = [
      { locale: 'en', title: dto.titleEn, description: dto.descriptionEn ?? null },
    ];

    if (dto.titleRu) {
      creates.push({
        locale: 'ru',
        title: dto.titleRu,
        description: dto.descriptionRu ?? null,
      });
    }

    if (dto.titleEl) {
      creates.push({
        locale: 'el',
        title: dto.titleEl,
        description: dto.descriptionEl ?? null,
      });
    }

    return creates;
  }

  private buildTranslationUpserts(
    id: number,
    dto: UpdateFestivalDto,
  ): Prisma.FestivalTranslationUpsertWithWhereUniqueWithoutFestivalInput[] {
    const upserts: Prisma.FestivalTranslationUpsertWithWhereUniqueWithoutFestivalInput[] =
      [];

    if (dto.titleEn !== undefined) {
      upserts.push({
        where: { festivalId_locale: { festivalId: id, locale: 'en' } },
        create: { locale: 'en', title: dto.titleEn, description: dto.descriptionEn ?? null },
        update: { title: dto.titleEn, description: dto.descriptionEn ?? null },
      });
    }

    if (dto.titleRu !== undefined) {
      upserts.push({
        where: { festivalId_locale: { festivalId: id, locale: 'ru' } },
        create: { locale: 'ru', title: dto.titleRu, description: dto.descriptionRu ?? null },
        update: { title: dto.titleRu, description: dto.descriptionRu ?? null },
      });
    }

    if (dto.titleEl !== undefined) {
      upserts.push({
        where: { festivalId_locale: { festivalId: id, locale: 'el' } },
        create: { locale: 'el', title: dto.titleEl, description: dto.descriptionEl ?? null },
        update: { title: dto.titleEl, description: dto.descriptionEl ?? null },
      });
    }

    return upserts;
  }

  // ── Helpers ───────────────────────────────────────────────

  private filterPublishedEditions(festival: TFestivalRecord): TFestivalRecord {
    return {
      ...festival,
      editions: festival.editions.filter(
        (e) => e.status === FestivalEditionStatus.PUBLISHED,
      ),
    };
  }

  // ── Audit ─────────────────────────────────────────────────

  private async writeAuditLog(
    entityId: number,
    action: AuditAction,
    before: TFestivalRecord | null,
    after: TFestivalRecord | null,
    userId: number,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Festival',
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
