import { OmitType, PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateFestivalEditionDto } from './create-festival-edition.dto';

/**
 * festivalId and year are immutable after creation:
 * - festivalId: an edition belongs to exactly one festival forever.
 * - year: forms the unique constraint (festivalId, year); changing it would
 *   be semantically equivalent to deleting and re-creating the edition.
 *
 * lastVerifiedAt can be set to record when the edition data was last
 * manually confirmed to be accurate (e.g. after checking the official site).
 *
 * To change status use the dedicated /publish, /archive, /cancel endpoints
 * instead of the status field here — they enforce valid transitions and
 * write correct audit actions.
 */
export class UpdateFestivalEditionDto extends PartialType(
  OmitType(CreateFestivalEditionDto, ['festivalId', 'year'] as const),
) {
  @ApiPropertyOptional({
    description: 'ISO 8601 timestamp of the last manual data verification.',
    example: '2026-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  lastVerifiedAt?: string;
}
