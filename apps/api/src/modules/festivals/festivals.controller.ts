import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FestivalCategory } from '@prisma/client';
import { FestivalsService } from './festivals.service';
import { FestivalResponseDto } from './dto/festival-response.dto';
import { PublicFestivalsFilterDto } from './dto/public-festivals-filter.dto';

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
      'Each festival includes its PUBLISHED editions ordered by year descending. ' +
      'All query parameters are optional — omitting them returns all active festivals.',
  })
  @ApiOkResponse({ type: [FestivalResponseDto] })
  @ApiQuery({ name: 'category', required: false, enum: FestivalCategory, description: 'Filter by category' })
  @ApiQuery({ name: 'villageId', required: false, type: Number, description: 'Filter by village ID' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by edition year (must have a published edition in that year)' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Filter by edition start month 1–12' })
  getFestivals(@Query() filters: PublicFestivalsFilterDto): Promise<FestivalResponseDto[]> {
    return this.festivalsService.getActiveFestivals(filters);
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
