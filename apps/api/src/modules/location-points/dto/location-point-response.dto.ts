import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationPointType } from '@prisma/client';

export class LocationPointResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ enum: LocationPointType, example: LocationPointType.VENUE })
  type!: LocationPointType;

  @ApiProperty({ example: 'Main village square' })
  label!: string;

  @ApiProperty({ example: 34.8494 })
  lat!: number;

  @ApiProperty({ example: 32.8108 })
  lng!: number;

  @ApiPropertyOptional({ nullable: true })
  note!: string | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  villageId!: number | null;

  @ApiPropertyOptional({ example: 5, nullable: true })
  festivalEditionId!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

/** Compact shape used by the public map endpoint. */
export class MapPointDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ enum: LocationPointType, example: LocationPointType.VENUE })
  type!: LocationPointType;

  @ApiProperty({ example: 'Main village square' })
  label!: string;

  @ApiProperty({ example: 34.8494 })
  lat!: number;

  @ApiProperty({ example: 32.8108 })
  lng!: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  villageId!: number | null;

  @ApiPropertyOptional({ example: 5, nullable: true })
  festivalEditionId!: number | null;
}
