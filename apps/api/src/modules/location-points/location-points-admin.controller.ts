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
  ApiBadRequestResponse,
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
import { LocationPointsService } from './location-points.service';
import { CreateLocationPointDto } from './dto/create-location-point.dto';
import { UpdateLocationPointDto } from './dto/update-location-point.dto';
import { LocationPointResponseDto } from './dto/location-point-response.dto';

/**
 * Admin endpoints for LocationPoint management.
 * Route: /api/v1/admin/location-points
 */
@ApiTags('admin / location-points')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EDITOR, UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@Controller('admin/location-points')
export class LocationPointsAdminController {
  constructor(private readonly locationPointsService: LocationPointsService) {}

  @Get('village/:villageId')
  @ApiOperation({ summary: 'List all location points for a village (admin)' })
  @ApiParam({ name: 'villageId', type: Number, example: 1 })
  @ApiOkResponse({ type: [LocationPointResponseDto] })
  getByVillage(
    @Param('villageId', ParseIntPipe) villageId: number,
  ): Promise<LocationPointResponseDto[]> {
    return this.locationPointsService.getByVillage(villageId);
  }

  @Get('festival-edition/:festivalEditionId')
  @ApiOperation({ summary: 'List all location points for a festival edition (admin)' })
  @ApiParam({ name: 'festivalEditionId', type: Number, example: 5 })
  @ApiOkResponse({ type: [LocationPointResponseDto] })
  getByFestivalEdition(
    @Param('festivalEditionId', ParseIntPipe) festivalEditionId: number,
  ): Promise<LocationPointResponseDto[]> {
    return this.locationPointsService.getByFestivalEdition(festivalEditionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single location point by ID (admin)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: LocationPointResponseDto })
  @ApiNotFoundResponse({ description: 'LocationPoint not found' })
  getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LocationPointResponseDto> {
    return this.locationPointsService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a location point',
    description:
      'Creates a new location point. Must belong to at least one owner ' +
      '(villageId, festivalEditionId, or both).',
  })
  @ApiCreatedResponse({ type: LocationPointResponseDto })
  @ApiBadRequestResponse({ description: 'Orphan row rejected — no owner provided' })
  @ApiNotFoundResponse({ description: 'Referenced Village or FestivalEdition not found' })
  create(@Body() dto: CreateLocationPointDto): Promise<LocationPointResponseDto> {
    return this.locationPointsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a location point',
    description: 'Updates type, label, coordinates, or note. Ownership cannot be changed after creation.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: LocationPointResponseDto })
  @ApiNotFoundResponse({ description: 'LocationPoint not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLocationPointDto,
  ): Promise<LocationPointResponseDto> {
    return this.locationPointsService.update(id, dto);
  }

  @Patch(':id/archive')
  @ApiOperation({
    summary: 'Archive a location point',
    description:
      'Sets isActive to false. The point is no longer shown on public maps. ' +
      'Use this instead of deleting.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: LocationPointResponseDto })
  @ApiNotFoundResponse({ description: 'LocationPoint not found' })
  @ApiConflictResponse({ description: 'LocationPoint is already archived' })
  archive(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LocationPointResponseDto> {
    return this.locationPointsService.archive(id);
  }
}
