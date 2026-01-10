import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ScheduleCycleEntity from '../schedule/enties/schedule-cycle.entity';
import ScheduleEventParticipantEntity from '../schedule/enties/schedule-event-participant.entity';
import ScheduleEventEntity from '../schedule/enties/schedule-event.entity';
import StaffEntity from '../staff/staff.entity';
import SwapRequestEntity from '../swap-request/swap-request.entity';
import OpentalkSlideEntity from './entities/opentalk-slide.entity';
import { OpentalkController } from './opentalk.controller';
import { OpentalkService } from './opentalk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleCycleEntity,
      ScheduleEventEntity,
      ScheduleEventParticipantEntity,
      StaffEntity,
      SwapRequestEntity,
      OpentalkSlideEntity,
    ]),
  ],
  controllers: [OpentalkController],
  providers: [OpentalkService],
  exports: [OpentalkService],
})
export class OpentalkModule {}
