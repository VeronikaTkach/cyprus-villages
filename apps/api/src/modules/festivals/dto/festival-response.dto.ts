import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FestivalCategory, FestivalEditionStatus } from '@prisma/client';

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
