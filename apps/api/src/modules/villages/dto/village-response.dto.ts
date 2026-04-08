import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FestivalCategory, FestivalEditionStatus } from '@prisma/client';
import { MediaBriefDto } from '../../media/dto/media-response.dto';

export class VillageTranslationDto {
  @ApiProperty({ example: 'en', description: 'BCP 47 locale code' })
  locale!: string;

  @ApiProperty({ example: 'Omodos' })
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;
}

export class VillageResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'omodos' })
  slug!: string;

  @ApiPropertyOptional({
    example: 'Ομοδός',
    nullable: true,
    description: 'Greek name — always shown alongside the localised name.',
  })
  nameEl!: string | null;

  @ApiPropertyOptional({ example: 'Limassol', nullable: true })
  district!: string | null;

  @ApiPropertyOptional({ example: 'Troodos', nullable: true })
  region!: string | null;

  @ApiPropertyOptional({ example: 34.8494, nullable: true })
  centerLat!: number | null;

  @ApiPropertyOptional({ example: 32.8108, nullable: true })
  centerLng!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: [VillageTranslationDto] })
  translations!: VillageTranslationDto[];
}

// ── Village detail DTOs (GET /villages/:slug) ─────────────────────────────────

export class VillageFestivalTranslationDto {
  @ApiProperty({ example: 'en' })
  locale!: string;

  @ApiProperty({ example: 'Omodos Wine Festival' })
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;
}

export class VillageFestivalEditionDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiPropertyOptional({ nullable: true })
  startDate!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  endDate!: Date | null;

  @ApiProperty({ example: false })
  isDateTba!: boolean;

  @ApiPropertyOptional({ nullable: true, example: '18:00' })
  startTime!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '23:00' })
  endTime!: string | null;

  @ApiProperty({ enum: FestivalEditionStatus })
  status!: FestivalEditionStatus;

  @ApiPropertyOptional({ nullable: true })
  publishedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lastVerifiedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  venueName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  venueLat!: number | null;

  @ApiPropertyOptional({ nullable: true })
  venueLng!: number | null;

  @ApiPropertyOptional({ nullable: true })
  parkingName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  parkingLat!: number | null;

  @ApiPropertyOptional({ nullable: true })
  parkingLng!: number | null;

  @ApiPropertyOptional({ nullable: true })
  officialUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  sourceUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  sourceNote!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class VillageFestivalDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'wine-festival-omodos' })
  slug!: string;

  @ApiProperty({ example: 1 })
  villageId!: number;

  @ApiPropertyOptional({ nullable: true })
  titleEl!: string | null;

  @ApiProperty({ enum: FestivalCategory })
  category!: FestivalCategory;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [VillageFestivalTranslationDto] })
  translations!: VillageFestivalTranslationDto[];

  @ApiProperty({ type: [VillageFestivalEditionDto] })
  editions!: VillageFestivalEditionDto[];
}

/**
 * Response shape for GET /villages/:slug.
 * Extends the base village response with the village's active festivals
 * (only festivals that have at least one PUBLISHED edition are included;
 * each festival's editions array is also restricted to PUBLISHED only).
 */
export class VillageDetailResponseDto extends VillageResponseDto {
  @ApiProperty({ type: [VillageFestivalDto] })
  festivals!: VillageFestivalDto[];

  @ApiProperty({ type: [MediaBriefDto], description: 'COVER images (at most 1 for MVP)' })
  media!: MediaBriefDto[];
}
