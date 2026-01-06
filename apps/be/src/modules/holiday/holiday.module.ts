import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidayController } from '@src/modules/holiday/holiday.constroller';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import { HolidayService } from '@src/modules/holiday/holiday.service';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity])],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}
