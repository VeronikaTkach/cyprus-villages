import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { VillagesService } from './villages.service';
import { VillageResponseDto } from './dto/village-response.dto';

/**
 * Public read-only endpoints for villages.
 * Returns only active villages.
 * Route: /api/v1/villages
 */
@ApiTags('villages')
@Controller('villages')
export class VillagesController {
  constructor(private readonly villagesService: VillagesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all active villages',
    description: 'Returns all villages that are currently active, sorted by English name.',
  })
  @ApiOkResponse({ type: [VillageResponseDto] })
  getVillages(): Promise<VillageResponseDto[]> {
    return this.villagesService.getActiveVillages();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get village by slug',
    description:
      'Returns a single active village by its URL slug (e.g. "omodos"). ' +
      'Returns 404 if the village does not exist or is not active.',
  })
  @ApiParam({ name: 'slug', example: 'omodos', description: 'Village URL slug' })
  @ApiOkResponse({ type: VillageResponseDto })
  @ApiNotFoundResponse({ description: 'Village not found or not active' })
  getVillageBySlug(@Param('slug') slug: string): Promise<VillageResponseDto> {
    return this.villagesService.getVillageBySlug(slug);
  }
}
