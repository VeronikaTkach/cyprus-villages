import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, FestivalEditionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';
import { FestivalsRepository, TFestivalRecord, TFestivalWithMedia } from './festivals.repository';
import { FestivalMapMarkerDto } from './dto/festival-response.dto';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';
import { PublicFestivalsFilterDto } from './dto/public-festivals-filter.dto';
import { selectDisplayEdition } from './festivals.helpers';
import type { TEdition } from './festivals.helpers';

/** A festival record augmented with the presentation-helper displayEdition field. */
export type TFestivalPublicListItem = TFestivalRecord & {
  displayEdition: TEdition | null;
};

@Injectable()
export class FestivalsService {
  constructor(
    private readonly festivalsRepository: FestivalsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Public reads ──────────────────────────────────────────
  // Public callers only see PUBLISHED editions.

  async getActiveFestivals(filters: PublicFestivalsFilterDto = {}): Promise<TFestivalPublicListItem[]> {
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

    // Attach the presentation-helper edition before returning.
    return results.map((f) => ({
      ...f,
      displayEdition: selectDisplayEdition(f.editions, {
        year: filters.year,
        month: filters.month,
      }),
    }));
  }

  async getMapFestivals(): Promise<FestivalMapMarkerDto[]> {
    const rows = await this.festivalsRepository.findForMap();
    const result: FestivalMapMarkerDto[] = [];

    for (const festival of rows) {
      const edition = this.pickRepresentativeEdition(festival.editions);
      if (edition === null || edition.venueLat === null || edition.venueLng === null) continue;
      result.push({
        id: festival.id,
        slug: festival.slug,
        titleEl: festival.titleEl,
        lat: edition.venueLat,
        lng: edition.venueLng,
      });
    }

    return result;
  }

  async getFestivalBySlug(slug: string): Promise<TFestivalWithMedia> {
    const festival = await this.festivalsRepository.findBySlugWithMedia(slug);

    if (!festival || !festival.isActive) {
      throw new NotFoundException(`Festival '${slug}' not found`);
    }

    return {
      ...this.filterPublishedEditions(festival),
      media: festival.media,
    };
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
      ...(dto.typicalMonth !== undefined && { typicalMonth: dto.typicalMonth }),
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
      ...(dto.typicalMonth !== undefined && { typicalMonth: dto.typicalMonth }),
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

  /**
   * Picks the single most representative edition for map display.
   * Applies the same tiebreak as selectDisplayEdition with no filters:
   *   year desc → startDate asc (nulls last) → id desc.
   *
   * Operates on the lean map type (id, year, startDate only) so that
   * the repository query stays minimal.
   */
  private pickRepresentativeEdition<T extends { id: number; year: number; startDate: Date | null }>(
    editions: T[],
  ): T | null {
    if (!editions.length) return null;
    return [...editions].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      if (a.startDate !== b.startDate) {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return b.id - a.id;
    })[0]!;
  }

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
