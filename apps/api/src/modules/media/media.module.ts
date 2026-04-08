import { Module } from '@nestjs/common';
import { StorageModule } from '../../common/storage';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';
import { MediaAdminController } from './media-admin.controller';

@Module({
  imports: [StorageModule],
  providers: [MediaRepository, MediaService],
  controllers: [MediaAdminController],
  exports: [MediaService],
})
export class MediaModule {}
