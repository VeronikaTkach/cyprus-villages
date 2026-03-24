import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFestivalDto } from './create-festival.dto';

/**
 * All fields from CreateFestivalDto are optional except `slug` and `villageId`.
 * slug   — immutable after creation (forms the stable public URL).
 * villageId — immutable: a festival cannot be moved to a different village.
 */
export class UpdateFestivalDto extends PartialType(
  OmitType(CreateFestivalDto, ['slug', 'villageId'] as const),
) {}
