import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateVillageDto {
  @ApiProperty({
    example: 'omodos',
    description:
      'URL-friendly identifier. Lowercase letters, numbers, and hyphens only. ' +
      'Becomes the public URL segment for this village (/villages/omodos). ' +
      'Cannot be changed after creation.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiProperty({ example: 'Omodos' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nameEn!: string;

  @ApiPropertyOptional({ example: 'Омодос' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameRu?: string;

  @ApiPropertyOptional({ example: 'Ομοδός' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEl?: string;

  @ApiPropertyOptional({ example: 'Limassol' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: 'Troodos' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEl?: string;

  @ApiPropertyOptional({
    example: 34.8494,
    description: 'Geographic centre of the village — latitude (−90 to 90)',
  })
  @IsOptional()
  @IsLatitude()
  centerLat?: number;

  @ApiPropertyOptional({
    example: 32.8108,
    description: 'Geographic centre of the village — longitude (−180 to 180)',
  })
  @IsOptional()
  @IsLongitude()
  centerLng?: number;
}
