import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database';
import { LocationPointsRepository } from './location-points.repository';
import { LocationPointsService } from './location-points.service';
import { LocationPointsAdminController } from './location-points-admin.controller';
import { LocationPointsMapController } from './location-points-map.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [LocationPointsAdminController, LocationPointsMapController],
  providers: [LocationPointsService, LocationPointsRepository],
  exports: [LocationPointsService],
})
export class LocationPointsModule {}
