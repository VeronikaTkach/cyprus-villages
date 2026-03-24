import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { FestivalCategory } from '@prisma/client';

export class CreateFestivalDto {
  @ApiProperty({
    example: 'wine-festival-omodos',
    description:
      'URL-friendly identifier. Lowercase letters, numbers, and hyphens only. ' +
      'Becomes the public URL segment (/festivals/wine-festival-omodos). ' +
      'Cannot be changed after creation.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiProperty({ example: 1, description: 'ID of the village this festival belongs to.' })
  @IsInt()
  @Min(1)
  villageId!: number;

  @ApiProperty({ example: 'Omodos Wine Festival', description: 'English title (required).' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titleEn!: string;

  @ApiPropertyOptional({ example: 'Омодосский винный фестиваль' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleRu?: string;

  @ApiPropertyOptional({
    example: 'Φεστιβάλ Κρασιού Ομοδού',
    description:
      'Greek title — stored both in the permanent titleEl column and as a ' +
      'translation row for locale "el". Always displayed prominently regardless of active locale.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEl?: string;

  @ApiPropertyOptional({ description: 'Short description in English.' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Short description in Russian.' })
  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @ApiPropertyOptional({ description: 'Short description in Greek.' })
  @IsOptional()
  @IsString()
  descriptionEl?: string;

  @ApiPropertyOptional({ enum: FestivalCategory, default: FestivalCategory.OTHER })
  @IsOptional()
  @IsEnum(FestivalCategory)
  category?: FestivalCategory;
}
