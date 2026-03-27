import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FestivalCategory } from '@prisma/client';

export class PublicFestivalsFilterDto {
  @ApiPropertyOptional({
    enum: FestivalCategory,
    description: 'Filter by festival category',
    example: FestivalCategory.WINE,
  })
  @IsOptional()
  @IsEnum(FestivalCategory)
  category?: FestivalCategory;

  @ApiPropertyOptional({
    description: 'Filter by village ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  villageId?: number;

  @ApiPropertyOptional({
    description: 'Filter by edition year (shows only festivals with a published edition in that year)',
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    description: 'Filter by edition month 1–12 (shows only festivals with a published edition starting in that month)',
    example: 6,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
