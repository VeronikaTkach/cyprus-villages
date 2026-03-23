import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
