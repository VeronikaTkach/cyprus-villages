import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadMediaDto {
  @ApiPropertyOptional({ description: 'Village owner ID (exactly one owner required)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  villageId?: number;

  @ApiPropertyOptional({ description: 'Festival owner ID' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  festivalId?: number;

  @ApiPropertyOptional({ description: 'FestivalEdition owner ID' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  festivalEditionId?: number;

  @ApiPropertyOptional({ description: 'Alt text for accessibility', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;
}
