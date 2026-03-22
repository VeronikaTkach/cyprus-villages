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
import { VillagesService } from './villages.service';
import { CreateVillageDto } from './dto/create-village.dto';
import { UpdateVillageDto } from './dto/update-village.dto';
import { VillageResponseDto } from './dto/village-response.dto';

/**
 * Admin endpoints for village management.
 * Includes inactive villages in reads; supports create, update, archive.
 * Route: /api/v1/admin/villages
 *
 * Note: no auth guards yet — to be added when the auth module is implemented.
 */
@ApiTags('admin / villages')
@Controller('admin/villages')
export class VillagesAdminController {
  constructor(private readonly villagesService: VillagesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all villages (admin)',
    description: 'Returns all villages including inactive ones, sorted by English name.',
  })
  @ApiOkResponse({ type: [VillageResponseDto] })
  getAllVillages(): Promise<VillageResponseDto[]> {
    return this.villagesService.getAllVillages();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get village by ID (admin)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: VillageResponseDto })
  @ApiNotFoundResponse({ description: 'Village not found' })
  getVillageById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VillageResponseDto> {
    return this.villagesService.getVillageById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new village' })
  @ApiCreatedResponse({ type: VillageResponseDto })
  @ApiConflictResponse({ description: 'A village with this slug already exists' })
  createVillage(@Body() dto: CreateVillageDto): Promise<VillageResponseDto> {
    return this.villagesService.createVillage(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a village',
    description: 'Updates any subset of village fields. Slug cannot be changed.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: VillageResponseDto })
  @ApiNotFoundResponse({ description: 'Village not found' })
  updateVillage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVillageDto,
  ): Promise<VillageResponseDto> {
    return this.villagesService.updateVillage(id, dto);
  }

  @Patch(':id/archive')
  @ApiOperation({
    summary: 'Archive a village',
    description:
      'Sets isActive to false. The village is no longer visible on the public site. ' +
      'Use this instead of deleting — the record and all its data are preserved.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: VillageResponseDto })
  @ApiNotFoundResponse({ description: 'Village not found' })
  @ApiConflictResponse({ description: 'Village is already archived' })
  archiveVillage(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VillageResponseDto> {
    return this.villagesService.archiveVillage(id);
  }
}
