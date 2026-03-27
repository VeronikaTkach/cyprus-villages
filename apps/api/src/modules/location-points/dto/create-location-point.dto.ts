import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { LocationPointType } from '@prisma/client';

export class CreateLocationPointDto {
  @ApiProperty({ enum: LocationPointType, example: LocationPointType.VENUE })
  @IsEnum(LocationPointType)
  type!: LocationPointType;

  @ApiProperty({ example: 'Main village square', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  label!: string;

  @ApiProperty({ example: 34.8494 })
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: 32.8108 })
  @IsLongitude()
  lng!: number;

  @ApiPropertyOptional({ example: 'Near the monastery entrance' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Village this point belongs to. At least one of villageId or ' +
      'festivalEditionId must be provided.',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  villageId?: number;

  @ApiPropertyOptional({
    example: 5,
    description:
      'Festival edition this point belongs to. At least one of villageId or ' +
      'festivalEditionId must be provided.',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  festivalEditionId?: number;
}
