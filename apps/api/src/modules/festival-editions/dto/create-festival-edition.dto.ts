import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FestivalEditionStatus } from '@prisma/client';

export class CreateFestivalEditionDto {
  @ApiProperty({ example: 1, description: 'ID of the festival this edition belongs to.' })
  @IsInt()
  @Min(1)
  festivalId!: number;

  @ApiProperty({
    example: 2026,
    description: 'Year of this festival edition. Must be unique per festival.',
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @ApiPropertyOptional({
    example: '2026-09-14',
    description: 'Start date in ISO 8601 format (YYYY-MM-DD). Omit when isDateTba is true.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'End date in ISO 8601 format. Omit when isDateTba is true.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Set true when exact dates are not yet confirmed.',
  })
  @IsOptional()
  @IsBoolean()
  isDateTba?: boolean;

  @ApiPropertyOptional({
    example: '18:00',
    description: 'Start time in HH:mm format (Cyprus local time / EET-EEST).',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @ApiPropertyOptional({
    example: '23:00',
    description: 'End time in HH:mm format (Cyprus local time / EET-EEST).',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:mm format' })
  endTime?: string;

  @ApiPropertyOptional({
    enum: FestivalEditionStatus,
    default: FestivalEditionStatus.DRAFT,
    description: 'Initial lifecycle status. Defaults to DRAFT.',
  })
  @IsOptional()
  @IsEnum(FestivalEditionStatus)
  status?: FestivalEditionStatus;

  @ApiPropertyOptional({ example: 'Omodos Village Square' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  venueName?: string;

  @ApiPropertyOptional({ example: 34.8466, description: 'Venue latitude (−90 to 90).' })
  @IsOptional()
  @IsLatitude()
  venueLat?: number;

  @ApiPropertyOptional({ example: 32.8099, description: 'Venue longitude (−180 to 180).' })
  @IsOptional()
  @IsLongitude()
  venueLng?: number;

  @ApiPropertyOptional({ example: 'Main village car park' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  parkingName?: string;

  @ApiPropertyOptional({ example: 34.845, description: 'Parking latitude.' })
  @IsOptional()
  @IsLatitude()
  parkingLat?: number;

  @ApiPropertyOptional({ example: 32.809, description: 'Parking longitude.' })
  @IsOptional()
  @IsLongitude()
  parkingLng?: number;

  @ApiPropertyOptional({ example: 'https://omodos.org/wine-festival' })
  @IsOptional()
  @IsUrl()
  officialUrl?: string;

  @ApiPropertyOptional({ description: 'Source URL where this information was found.' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Free-text note about the data source or verification.' })
  @IsOptional()
  @IsString()
  sourceNote?: string;
}
