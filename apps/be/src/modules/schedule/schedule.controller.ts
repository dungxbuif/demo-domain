import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { QueryScheduleDto } from './dtos/query-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Get all schedules with filtering
   */
  @Get()
  findAll(@Query() query: QueryScheduleDto) {
    return this.scheduleService.findAll(query);
  }

  /**
   * Get a single schedule by ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  /**
   * Create a new schedule
   */
  @Post()
  create(@Body() createDto: CreateScheduleDto) {
    return this.scheduleService.create(createDto);
  }

  /**
   * Update a schedule
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, updateDto);
  }

  /**
   * Delete a schedule
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleService.remove(id);
    return { message: 'Schedule deleted successfully' };
  }

  @Get('my/schedules')
  getMySchedules() {
    return { message: 'Not implemented yet - requires authentication' };
  }
}
