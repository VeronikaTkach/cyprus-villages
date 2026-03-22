import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVillageDto } from './create-village.dto';

/**
 * All fields from CreateVillageDto are optional here, except `slug`.
 * Slug is immutable after creation — it forms the stable public URL for a village.
 * Changing a slug would silently break all existing external links and bookmarks.
 */
export class UpdateVillageDto extends PartialType(
  OmitType(CreateVillageDto, ['slug'] as const),
) {}
