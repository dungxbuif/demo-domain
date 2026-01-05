import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CleaningSchedule } from './cleaning-schedule.entity';
import { CleaningScheduleService } from './cleaning-schedule.service';

@Controller('cleaning-schedules')
export class CleaningScheduleController {
  constructor(
    private readonly cleaningScheduleService: CleaningScheduleService,
  ) {}

  @Get()
  findAll(): Promise<CleaningSchedule[]> {
    return this.cleaningScheduleService.findAll();
  }

  @Get('month')
  findByMonth(
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<CleaningSchedule[]> {
    return this.cleaningScheduleService.findByMonth(+year, +month);
  }

  @Post()
  create(
    @Body() scheduleData: Partial<CleaningSchedule>,
  ): Promise<CleaningSchedule> {
    return this.cleaningScheduleService.create(scheduleData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() scheduleData: Partial<CleaningSchedule>,
  ): Promise<CleaningSchedule | null> {
    return this.cleaningScheduleService.update(+id, scheduleData);
  }
}
