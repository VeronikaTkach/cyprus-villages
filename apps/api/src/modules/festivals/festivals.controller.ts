import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FestivalsService } from './festivals.service';
import { FestivalResponseDto } from './dto/festival-response.dto';

/**
 * Public read-only endpoints for festivals.
 * Returns only active festivals with their PUBLISHED editions.
 * Route: /api/v1/festivals
 */
@ApiTags('festivals')
@Controller('festivals')
export class FestivalsController {
  constructor(private readonly festivalsService: FestivalsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all active festivals',
    description:
      'Returns all active festivals sorted by English title. ' +
      'Each festival includes its PUBLISHED editions ordered by year descending.',
  })
  @ApiOkResponse({ type: [FestivalResponseDto] })
  getFestivals(): Promise<FestivalResponseDto[]> {
    return this.festivalsService.getActiveFestivals();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get festival by slug',
    description:
      'Returns a single active festival with its PUBLISHED editions. ' +
      'Returns 404 if the festival does not exist or is not active.',
  })
  @ApiParam({ name: 'slug', example: 'wine-festival-omodos', description: 'Festival URL slug' })
  @ApiOkResponse({ type: FestivalResponseDto })
  @ApiNotFoundResponse({ description: 'Festival not found or not active' })
  getFestivalBySlug(@Param('slug') slug: string): Promise<FestivalResponseDto> {
    return this.festivalsService.getFestivalBySlug(slug);
  }
}
