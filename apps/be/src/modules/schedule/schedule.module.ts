import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ScheduleCycleEntity from './schedule-cycle.entity';
import ScheduleEventParticipantEntity from './schedule-event-participant.entity';
import ScheduleEventEntity from './schedule-event.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleCycleEntity,
      ScheduleEventEntity,
      ScheduleEventParticipantEntity,
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
