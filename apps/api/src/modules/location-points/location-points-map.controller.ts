import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LocationPointsService } from './location-points.service';
import { MapPointDto } from './dto/location-point-response.dto';

/**
 * Public map endpoint — returns all active location points for map rendering.
 * Route: /api/v1/map/points
 */
@ApiTags('map')
@Controller('map')
export class LocationPointsMapController {
  constructor(private readonly locationPointsService: LocationPointsService) {}

  @Get('points')
  @ApiOperation({
    summary: 'Get all active map points (public)',
    description:
      'Returns all active LocationPoints in a compact shape suited for map rendering. ' +
      'Includes village points, festival edition points, and dual-ownership points.',
  })
  @ApiOkResponse({ type: [MapPointDto] })
  getMapPoints(): Promise<MapPointDto[]> {
    return this.locationPointsService.getPublicMapPoints();
  }
}
