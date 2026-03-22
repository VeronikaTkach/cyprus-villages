import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VillageResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'omodos' })
  slug!: string;

  @ApiProperty({ example: 'Omodos' })
  nameEn!: string;

  @ApiPropertyOptional({ example: 'Омодос', nullable: true })
  nameRu!: string | null;

  @ApiPropertyOptional({ example: 'Ομοδός', nullable: true })
  nameEl!: string | null;

  @ApiPropertyOptional({ example: 'Limassol', nullable: true })
  district!: string | null;

  @ApiPropertyOptional({ example: 'Troodos', nullable: true })
  region!: string | null;

  @ApiPropertyOptional({ nullable: true })
  descriptionEn!: string | null;

  @ApiPropertyOptional({ nullable: true })
  descriptionRu!: string | null;

  @ApiPropertyOptional({ nullable: true })
  descriptionEl!: string | null;

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
}
