import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleaningScheduleController } from './cleaning-schedule.controller';
import { CleaningSchedule } from './cleaning-schedule.entity';
import { CleaningScheduleService } from './cleaning-schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([CleaningSchedule])],
  controllers: [CleaningScheduleController],
  providers: [CleaningScheduleService],
  exports: [CleaningScheduleService],
})
export class CleaningScheduleModule {}
