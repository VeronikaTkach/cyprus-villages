import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FestivalCategory, FestivalEditionStatus } from '@prisma/client';
import { MediaBriefDto } from '../../media/dto/media-response.dto';

export class FestivalTranslationDto {
  @ApiProperty({ example: 'en', description: 'BCP 47 locale code' })
  locale!: string;

  @ApiProperty({ example: 'Omodos Wine Festival' })
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;
}

/**
 * Edition summary embedded in festival responses.
 * Contains all edition fields; festivalId is omitted (redundant — already
 * known from the parent festival).
 */
export class FestivalEditionBriefDto {
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

/**
 * Response shape for a single festival in the public list.
 * Identical to FestivalResponseDto plus a `displayEdition` presentation helper.
 * `displayEdition` is the edition the frontend should use for timeline grouping,
 * date display, and Soon/Ongoing badges — it respects active year/month filters.
 */
export class PublicFestivalListItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'wine-festival-omodos' })
  slug!: string;

  @ApiProperty({ example: 1 })
  villageId!: number;

  @ApiPropertyOptional({
    example: 'Φεστιβάλ Κρασιού Ομοδού',
    nullable: true,
    description: 'Greek title — always shown prominently regardless of active locale.',
  })
  titleEl!: string | null;

  @ApiProperty({ enum: FestivalCategory })
  category!: FestivalCategory;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [FestivalTranslationDto] })
  translations!: FestivalTranslationDto[];

  @ApiProperty({ type: [FestivalEditionBriefDto] })
  editions!: FestivalEditionBriefDto[];

  /**
   * The edition to use for timeline grouping and badge logic on the list page.
   * Null only when no published edition exists (should not occur in practice since
   * the list endpoint only returns festivals with at least one published edition).
   */
  @ApiProperty({ type: FestivalEditionBriefDto, nullable: true })
  displayEdition!: FestivalEditionBriefDto | null;
}

export class FestivalResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'wine-festival-omodos' })
  slug!: string;

  @ApiProperty({ example: 1 })
  villageId!: number;

  @ApiPropertyOptional({
    example: 'Φεστιβάλ Κρασιού Ομοδού',
    nullable: true,
    description: 'Greek title — always shown prominently regardless of active locale.',
  })
  titleEl!: string | null;

  @ApiProperty({ enum: FestivalCategory })
  category!: FestivalCategory;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [FestivalTranslationDto] })
  translations!: FestivalTranslationDto[];

  @ApiProperty({ type: [FestivalEditionBriefDto] })
  editions!: FestivalEditionBriefDto[];
}

/**
 * Response shape for GET /festivals/:slug.
 * Extends the base response with COVER media.
 */
export class FestivalDetailResponseDto extends FestivalResponseDto {
  @ApiProperty({ type: [MediaBriefDto], description: 'COVER images (at most 1 for MVP)' })
  media!: MediaBriefDto[];
}

/**
 * Compact marker shape for GET /map/festivals.
 * Coordinates come from the representative published edition's venue.
 */
export class FestivalMapMarkerDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'wine-festival-omodos' })
  slug!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Φεστιβάλ Κρασιού Ομοδού' })
  titleEl!: string | null;

  @ApiProperty({ example: 34.8494, description: 'Venue latitude from the representative published edition' })
  lat!: number;

  @ApiProperty({ example: 32.8108, description: 'Venue longitude from the representative published edition' })
  lng!: number;
}
