import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FestivalsService } from './festivals.service';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';
import { FestivalResponseDto } from './dto/festival-response.dto';

/**
 * Admin endpoints for festival management.
 * Includes inactive festivals in reads; supports create, update, archive.
 * All editions (any status) are included in responses.
 * Route: /api/v1/admin/festivals
 *
 * Note: no auth guards yet — to be added when the auth module is implemented.
 */
@ApiTags('admin / festivals')
@Controller('admin/festivals')
export class FestivalsAdminController {
  constructor(private readonly festivalsService: FestivalsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all festivals (admin)',
    description: 'Returns all festivals including inactive ones, with all editions regardless of status.',
  })
  @ApiOkResponse({ type: [FestivalResponseDto] })
  getAllFestivals(): Promise<FestivalResponseDto[]> {
    return this.festivalsService.getAllFestivals();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get festival by ID (admin)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalResponseDto })
  @ApiNotFoundResponse({ description: 'Festival not found' })
  getFestivalById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FestivalResponseDto> {
    return this.festivalsService.getFestivalById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new festival' })
  @ApiCreatedResponse({ type: FestivalResponseDto })
  @ApiConflictResponse({ description: 'A festival with this slug already exists' })
  @ApiNotFoundResponse({ description: 'Village not found' })
  createFestival(@Body() dto: CreateFestivalDto): Promise<FestivalResponseDto> {
    return this.festivalsService.createFestival(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a festival',
    description: 'Updates any subset of festival fields. Slug and villageId cannot be changed.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalResponseDto })
  @ApiNotFoundResponse({ description: 'Festival not found' })
  updateFestival(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFestivalDto,
  ): Promise<FestivalResponseDto> {
    return this.festivalsService.updateFestival(id, dto);
  }

  @Patch(':id/archive')
  @ApiOperation({
    summary: 'Archive a festival',
    description:
      'Sets isActive to false. The festival is no longer visible on the public site. ' +
      'Use this instead of deleting — the record and all its data are preserved.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalResponseDto })
  @ApiNotFoundResponse({ description: 'Festival not found' })
  @ApiConflictResponse({ description: 'Festival is already archived' })
  archiveFestival(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FestivalResponseDto> {
    return this.festivalsService.archiveFestival(id);
  }
}
