import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LocationPointType } from '@prisma/client';

export class UpdateLocationPointDto {
  @ApiPropertyOptional({ enum: LocationPointType })
  @IsOptional()
  @IsEnum(LocationPointType)
  type?: LocationPointType;

  @ApiPropertyOptional({ example: 'Main village square', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional({ example: 34.8494 })
  @IsOptional()
  @IsLatitude()
  lat?: number;

  @ApiPropertyOptional({ example: 32.8108 })
  @IsOptional()
  @IsLongitude()
  lng?: number;

  @ApiPropertyOptional({ example: 'Near the monastery entrance' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
