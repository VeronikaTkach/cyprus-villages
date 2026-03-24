import { Module } from '@nestjs/common';
import { FestivalEditionsAdminController } from './festival-editions-admin.controller';
import { FestivalEditionsService } from './festival-editions.service';
import { FestivalEditionsRepository } from './festival-editions.repository';

@Module({
  controllers: [FestivalEditionsAdminController],
  providers: [FestivalEditionsService, FestivalEditionsRepository],
  exports: [FestivalEditionsService],
})
export class FestivalEditionsModule {}
