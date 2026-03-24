import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FestivalEditionStatus } from '@prisma/client';

export class FestivalEditionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID of the parent festival.' })
  festivalId!: number;

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
