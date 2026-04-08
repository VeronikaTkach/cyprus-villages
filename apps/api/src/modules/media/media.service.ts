import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import { StorageService } from '../../common/storage';
import { MediaRepository, TMediaRecord } from './media.repository';
import { UploadMediaDto } from './dto/upload-media.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadCover(
    file: Express.Multer.File,
    dto: UploadMediaDto,
  ): Promise<TMediaRecord> {
    this.validateOwnership(dto);

    const prefix = this.buildPrefix(dto);
    const url = await this.storageService.upload(
      prefix,
      'cover',
      file.buffer,
      file.mimetype,
    );

    return this.mediaRepository.create({
      url,
      alt: dto.alt ?? null,
      kind: MediaKind.COVER,
      ...(dto.villageId !== undefined && { village: { connect: { id: dto.villageId } } }),
      ...(dto.festivalId !== undefined && { festival: { connect: { id: dto.festivalId } } }),
      ...(dto.festivalEditionId !== undefined && {
        festivalEdition: { connect: { id: dto.festivalEditionId } },
      }),
    });
  }

  listByOwner(filter: {
    villageId?: number;
    festivalId?: number;
    festivalEditionId?: number;
  }): Promise<TMediaRecord[]> {
    return this.mediaRepository.findByOwner(filter);
  }

  // Media uses hard delete intentionally — unlike villages/festivals which are
  // soft-archived. Rationale: (a) keeping orphaned files in R2 costs money, and
  // (b) a deleted cover image has no business value worth preserving. The DB row
  // is removed together with the R2 object so the two stay in sync.
  async deleteMedia(id: number): Promise<void> {
    const media = await this.mediaRepository.findById(id);
    if (!media) throw new NotFoundException(`Media #${id} not found`);

    await this.storageService.deleteByUrl(media.url);
    await this.mediaRepository.delete(id);
  }

  // ── Helpers ────────────────────────────────────────────────

  private validateOwnership(dto: UploadMediaDto): void {
    const owners = [dto.villageId, dto.festivalId, dto.festivalEditionId].filter(
      (v) => v !== undefined,
    );
    if (owners.length !== 1) {
      throw new BadRequestException(
        'Exactly one of villageId, festivalId, or festivalEditionId must be provided.',
      );
    }
  }

  private buildPrefix(dto: UploadMediaDto): string {
    if (dto.villageId !== undefined) return `villages/${dto.villageId}`;
    if (dto.festivalId !== undefined) return `festivals/${dto.festivalId}`;
    return `festival-editions/${dto.festivalEditionId!}`;
  }
}
