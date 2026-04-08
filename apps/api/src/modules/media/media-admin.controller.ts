import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaResponseDto } from './dto/media-response.dto';

/**
 * Admin endpoints for Media management.
 * Route: /api/v1/admin/media
 */
@ApiTags('admin / media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EDITOR, UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@Controller('admin/media')
export class MediaAdminController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if ((ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Unsupported file type "${file.mimetype}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}.`,
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload a cover image',
    description:
      'Uploads a file to Cloudflare R2 and creates a Media record with kind=COVER. ' +
      'Exactly one of villageId, festivalId, or festivalEditionId must be supplied as a form field.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        villageId: { type: 'integer' },
        festivalId: { type: 'integer' },
        festivalEditionId: { type: 'integer' },
        alt: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({ type: MediaResponseDto })
  @ApiBadRequestResponse({
    description: 'No file provided, unsupported mime type, file exceeds 5 MB, or invalid owner combination',
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query() dto: UploadMediaDto,
  ): Promise<MediaResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    return this.mediaService.uploadCover(file, dto) as Promise<MediaResponseDto>;
  }

  @Get()
  @ApiOperation({
    summary: 'List media for an owner',
    description:
      'Returns all media records for the given owner. Supply exactly one of villageId, festivalId, festivalEditionId.',
  })
  @ApiQuery({ name: 'villageId', required: false, type: Number })
  @ApiQuery({ name: 'festivalId', required: false, type: Number })
  @ApiQuery({ name: 'festivalEditionId', required: false, type: Number })
  @ApiOkResponse({ type: [MediaResponseDto] })
  list(@Query() dto: UploadMediaDto): Promise<MediaResponseDto[]> {
    return this.mediaService.listByOwner({
      villageId: dto.villageId,
      festivalId: dto.festivalId,
      festivalEditionId: dto.festivalEditionId,
    }) as Promise<MediaResponseDto[]>;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a media record and remove the file from R2' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Deleted successfully' })
  @ApiNotFoundResponse({ description: 'Media not found' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mediaService.deleteMedia(id);
  }
}
