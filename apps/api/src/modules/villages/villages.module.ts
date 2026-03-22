import { Module } from '@nestjs/common';
import { VillagesController } from './villages.controller';
import { VillagesAdminController } from './villages-admin.controller';
import { VillagesService } from './villages.service';
import { VillagesRepository } from './villages.repository';

@Module({
  controllers: [VillagesController, VillagesAdminController],
  providers: [VillagesService, VillagesRepository],
  exports: [VillagesService],
})
export class VillagesModule {}
