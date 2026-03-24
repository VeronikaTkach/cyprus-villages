import { Module } from '@nestjs/common';
import { FestivalsController } from './festivals.controller';
import { FestivalsAdminController } from './festivals-admin.controller';
import { FestivalsService } from './festivals.service';
import { FestivalsRepository } from './festivals.repository';

@Module({
  controllers: [FestivalsController, FestivalsAdminController],
  providers: [FestivalsService, FestivalsRepository],
  exports: [FestivalsService],
})
export class FestivalsModule {}
