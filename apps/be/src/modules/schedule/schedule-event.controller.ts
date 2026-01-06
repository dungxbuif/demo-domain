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
import { CreateScheduleEventDto } from './dtos/create-schedule-event.dto';
import { QueryScheduleEventDto } from './dtos/query-schedule-event.dto';
import { UpdateScheduleEventDto } from './dtos/update-schedule-event.dto';
import { ScheduleEventService } from './schedule-event.service';

@Controller('schedule-events')
export class ScheduleEventController {
  constructor(private readonly scheduleEventService: ScheduleEventService) {}

  /**
   * Get all schedule events with filtering and pagination
   * GET /schedule-events
   */
  @Get()
  findAll(@Query() query: QueryScheduleEventDto) {
    return this.scheduleEventService.findAll(query);
  }

  /**
   * Get a schedule event by ID
   * GET /schedule-events/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleEventService.findOne(id);
  }

  /**
   * Get upcoming events for a staff member
   * GET /schedule-events/staff/:staffId/upcoming
   */
  @Get('staff/:staffId/upcoming')
  findUpcomingForStaff(
    @Param('staffId', ParseIntPipe) staffId: number,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.scheduleEventService.findUpcomingForStaff(staffId, limit);
  }

  /**
   * Get events by definition code
   * GET /schedule-events/definition/:code
   */
  @Get('definition/:code')
  findByDefinitionCode(
    @Param('code') code: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.scheduleEventService.findByDefinitionCode(
      code,
      dateFrom,
      dateTo,
    );
  }

  /**
   * Create a new schedule event
   * POST /schedule-events
   */
  @Post()
  create(@Body() dto: CreateScheduleEventDto) {
    return this.scheduleEventService.create(dto);
  }

  /**
   * Update a schedule event
   * PUT /schedule-events/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleEventDto,
  ) {
    return this.scheduleEventService.update(id, dto);
  }

  /**
   * Delete a schedule event
   * DELETE /schedule-events/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleEventService.remove(id);
    return { message: 'Schedule event deleted successfully' };
  }
}
