import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FestivalsService } from './festivals.service';
import { FestivalMapMarkerDto } from './dto/festival-response.dto';

/**
 * Public map endpoint — returns festival markers for map rendering.
 * Only festivals with at least one PUBLISHED edition and valid venue
 * coordinates are included.
 * Route: /api/v1/map/festivals
 */
@ApiTags('map')
@Controller('map')
export class FestivalsMapController {
  constructor(private readonly festivalsService: FestivalsService) {}

  @Get('festivals')
  @ApiOperation({
    summary: 'Get festival map markers (public)',
    description:
      'Returns a compact list of festivals suitable for map rendering. ' +
      'Each item represents one festival with coordinates taken from the ' +
      'most representative published edition (year desc → startDate asc → id desc). ' +
      'Festivals without a published edition or without venue coordinates are excluded.',
  })
  @ApiOkResponse({ type: [FestivalMapMarkerDto] })
  getMapFestivals(): Promise<FestivalMapMarkerDto[]> {
    return this.festivalsService.getMapFestivals();
  }
}
