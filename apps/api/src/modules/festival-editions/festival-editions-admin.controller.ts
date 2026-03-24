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
import { FestivalEditionsService } from './festival-editions.service';
import { CreateFestivalEditionDto } from './dto/create-festival-edition.dto';
import { UpdateFestivalEditionDto } from './dto/update-festival-edition.dto';
import { FestivalEditionResponseDto } from './dto/festival-edition-response.dto';

/**
 * Admin endpoints for festival edition management.
 * No public read endpoints — editions are surfaced via the festival detail response.
 * Route: /api/v1/admin/festival-editions
 */
@ApiTags('admin / festival-editions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EDITOR, UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@Controller('admin/festival-editions')
export class FestivalEditionsAdminController {
  constructor(private readonly editionsService: FestivalEditionsService) {}

  @Get('festival/:festivalId')
  @ApiOperation({
    summary: 'List all editions for a festival (admin)',
    description:
      'Returns all editions for the given festival ordered by year descending. ' +
      'Includes editions of every status (DRAFT, PUBLISHED, ARCHIVED, CANCELLED).',
  })
  @ApiParam({ name: 'festivalId', type: Number, example: 1 })
  @ApiOkResponse({ type: [FestivalEditionResponseDto] })
  getEditionsForFestival(
    @Param('festivalId', ParseIntPipe) festivalId: number,
  ): Promise<FestivalEditionResponseDto[]> {
    return this.editionsService.getEditionsForFestival(festivalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get festival edition by ID (admin)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalEditionResponseDto })
  @ApiNotFoundResponse({ description: 'Edition not found' })
  getEditionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FestivalEditionResponseDto> {
    return this.editionsService.getEditionById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a festival edition' })
  @ApiCreatedResponse({ type: FestivalEditionResponseDto })
  @ApiNotFoundResponse({ description: 'Festival not found' })
  @ApiConflictResponse({ description: 'An edition for this festival and year already exists' })
  createEdition(
    @Body() dto: CreateFestivalEditionDto,
  ): Promise<FestivalEditionResponseDto> {
    return this.editionsService.createEdition(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a festival edition',
    description:
      'Updates any subset of edition fields. festivalId and year cannot be changed. ' +
      'To change lifecycle status use the dedicated /publish, /archive, or /cancel endpoints.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalEditionResponseDto })
  @ApiNotFoundResponse({ description: 'Edition not found' })
  updateEdition(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFestivalEditionDto,
  ): Promise<FestivalEditionResponseDto> {
    return this.editionsService.updateEdition(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({
    summary: 'Publish a festival edition',
    description:
      'Sets status to PUBLISHED. Can publish from DRAFT or ARCHIVED. ' +
      'Cannot publish a CANCELLED edition.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalEditionResponseDto })
  @ApiNotFoundResponse({ description: 'Edition not found' })
  @ApiConflictResponse({ description: 'Edition is already published or is cancelled' })
  publishEdition(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FestivalEditionResponseDto> {
    return this.editionsService.publishEdition(id);
  }

  @Patch(':id/archive')
  @ApiOperation({
    summary: 'Archive a festival edition',
    description: 'Sets status to ARCHIVED. Can archive from any status.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalEditionResponseDto })
  @ApiNotFoundResponse({ description: 'Edition not found' })
  @ApiConflictResponse({ description: 'Edition is already archived' })
  archiveEdition(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FestivalEditionResponseDto> {
    return this.editionsService.archiveEdition(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel a festival edition',
    description:
      'Sets status to CANCELLED. Can cancel from DRAFT or PUBLISHED. ' +
      'Cannot cancel an ARCHIVED edition.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: FestivalEditionResponseDto })
  @ApiNotFoundResponse({ description: 'Edition not found' })
  @ApiConflictResponse({ description: 'Edition is already cancelled or is archived' })
  cancelEdition(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FestivalEditionResponseDto> {
    return this.editionsService.cancelEdition(id);
  }
}
