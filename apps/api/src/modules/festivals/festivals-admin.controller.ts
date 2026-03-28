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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FestivalsService } from './festivals.service';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';
import { FestivalResponseDto } from './dto/festival-response.dto';
import type { IJwtPayload } from '../auth/jwt-payload.interface';

/**
 * Admin endpoints for festival management.
 * Includes inactive festivals in reads; supports create, update, archive.
 * All editions (any status) are included in responses.
 * Route: /api/v1/admin/festivals
 */
@ApiTags('admin / festivals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EDITOR, UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
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
  createFestival(
    @Body() dto: CreateFestivalDto,
    @CurrentUser() user: IJwtPayload,
  ): Promise<FestivalResponseDto> {
    return this.festivalsService.createFestival(dto, user.sub);
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
    @CurrentUser() user: IJwtPayload,
  ): Promise<FestivalResponseDto> {
    return this.festivalsService.updateFestival(id, dto, user.sub);
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
    @CurrentUser() user: IJwtPayload,
  ): Promise<FestivalResponseDto> {
    return this.festivalsService.archiveFestival(id, user.sub);
  }
}
