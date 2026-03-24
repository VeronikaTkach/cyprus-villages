import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, FestivalEditionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database';
import {
  FestivalEditionsRepository,
  TFestivalEditionRecord,
} from './festival-editions.repository';
import { CreateFestivalEditionDto } from './dto/create-festival-edition.dto';
import { UpdateFestivalEditionDto } from './dto/update-festival-edition.dto';

@Injectable()
export class FestivalEditionsService {
  constructor(
    private readonly editionsRepository: FestivalEditionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Admin reads ───────────────────────────────────────────

  getEditionsForFestival(festivalId: number): Promise<TFestivalEditionRecord[]> {
    return this.editionsRepository.findByFestivalId(festivalId);
  }

  async getEditionById(id: number): Promise<TFestivalEditionRecord> {
    const edition = await this.editionsRepository.findById(id);

    if (!edition) {
      throw new NotFoundException(`Festival edition #${id} not found`);
    }

    return edition;
  }

  // ── Admin mutations ───────────────────────────────────────

  async createEdition(
    dto: CreateFestivalEditionDto,
  ): Promise<TFestivalEditionRecord> {
    // Validate festival exists
    const festival = await this.prisma.festival.findUnique({
      where: { id: dto.festivalId },
      select: { id: true },
    });

    if (!festival) {
      throw new NotFoundException(`Festival #${dto.festivalId} not found`);
    }

    // Check (festivalId, year) uniqueness up front for a clean error message.
    // Prisma would also raise P2002 on the unique constraint, but this surfaces
    // a human-readable conflict instead of a generic database error.
    const existing = await this.prisma.festivalEdition.findUnique({
      where: { festivalId_year: { festivalId: dto.festivalId, year: dto.year } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        `Festival #${dto.festivalId} already has an edition for year ${dto.year}`,
      );
    }

    const edition = await this.editionsRepository.create({
      festival: { connect: { id: dto.festivalId } },
      year: dto.year,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      isDateTba: dto.isDateTba ?? false,
      startTime: dto.startTime ?? null,
      endTime: dto.endTime ?? null,
      status: dto.status ?? FestivalEditionStatus.DRAFT,
      venueName: dto.venueName ?? null,
      venueLat: dto.venueLat ?? null,
      venueLng: dto.venueLng ?? null,
      parkingName: dto.parkingName ?? null,
      parkingLat: dto.parkingLat ?? null,
      parkingLng: dto.parkingLng ?? null,
      officialUrl: dto.officialUrl ?? null,
      sourceUrl: dto.sourceUrl ?? null,
      sourceNote: dto.sourceNote ?? null,
    });

    await this.writeAuditLog(edition.id, AuditAction.CREATE, null, edition);

    return edition;
  }

  async updateEdition(
    id: number,
    dto: UpdateFestivalEditionDto,
  ): Promise<TFestivalEditionRecord> {
    const before = await this.getEditionById(id);

    const edition = await this.editionsRepository.update(id, {
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      isDateTba: dto.isDateTba,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status,
      lastVerifiedAt: dto.lastVerifiedAt ? new Date(dto.lastVerifiedAt) : undefined,
      venueName: dto.venueName,
      venueLat: dto.venueLat,
      venueLng: dto.venueLng,
      parkingName: dto.parkingName,
      parkingLat: dto.parkingLat,
      parkingLng: dto.parkingLng,
      officialUrl: dto.officialUrl,
      sourceUrl: dto.sourceUrl,
      sourceNote: dto.sourceNote,
    });

    await this.writeAuditLog(id, AuditAction.UPDATE, before, edition);

    return edition;
  }

  async publishEdition(id: number): Promise<TFestivalEditionRecord> {
    const before = await this.getEditionById(id);

    if (before.status === FestivalEditionStatus.PUBLISHED) {
      throw new ConflictException(`Edition #${id} is already published`);
    }

    if (before.status === FestivalEditionStatus.CANCELLED) {
      throw new ConflictException(
        `Edition #${id} is cancelled and cannot be published`,
      );
    }

    const edition = await this.editionsRepository.update(id, {
      status: FestivalEditionStatus.PUBLISHED,
      // Preserve the original publishedAt if this edition was previously
      // published then archived and is now being re-published.
      publishedAt: before.publishedAt ?? new Date(),
    });

    await this.writeAuditLog(id, AuditAction.PUBLISH, before, edition);

    return edition;
  }

  async archiveEdition(id: number): Promise<TFestivalEditionRecord> {
    const before = await this.getEditionById(id);

    if (before.status === FestivalEditionStatus.ARCHIVED) {
      throw new ConflictException(`Edition #${id} is already archived`);
    }

    const edition = await this.editionsRepository.update(id, {
      status: FestivalEditionStatus.ARCHIVED,
    });

    await this.writeAuditLog(id, AuditAction.ARCHIVE, before, edition);

    return edition;
  }

  async cancelEdition(id: number): Promise<TFestivalEditionRecord> {
    const before = await this.getEditionById(id);

    if (before.status === FestivalEditionStatus.CANCELLED) {
      throw new ConflictException(`Edition #${id} is already cancelled`);
    }

    if (before.status === FestivalEditionStatus.ARCHIVED) {
      throw new ConflictException(
        `Edition #${id} is archived and cannot be cancelled`,
      );
    }

    const edition = await this.editionsRepository.update(id, {
      status: FestivalEditionStatus.CANCELLED,
    });

    await this.writeAuditLog(id, AuditAction.CANCEL, before, edition);

    return edition;
  }

  // ── Audit ─────────────────────────────────────────────────
  //
  // userId is null until auth is implemented.
  // TODO: accept userId from request context once guards are in place.

  private async writeAuditLog(
    entityId: number,
    action: AuditAction,
    before: TFestivalEditionRecord | null,
    after: TFestivalEditionRecord | null,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'FestivalEdition',
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
