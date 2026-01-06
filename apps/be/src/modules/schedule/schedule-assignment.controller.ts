import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateScheduleAssignmentDto } from './dtos/create-schedule-assignment.dto';
import { UpdateScheduleAssignmentDto } from './dtos/update-schedule-assignment.dto';
import { ScheduleAssignmentService } from './schedule-assignment.service';

@Controller('schedule-assignments')
export class ScheduleAssignmentController {
  constructor(
    private readonly scheduleAssignmentService: ScheduleAssignmentService,
  ) {}

  /**
   * Get assignments for an event
   * GET /schedule-assignments/event/:eventId
   */
  @Get('event/:eventId')
  findByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.scheduleAssignmentService.findByEvent(eventId);
  }

  /**
   * Get assignments for a staff member
   * GET /schedule-assignments/staff/:staffId
   */
  @Get('staff/:staffId')
  findByStaff(
    @Param('staffId', ParseIntPipe) staffId: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.scheduleAssignmentService.findByStaff(
      staffId,
      dateFrom,
      dateTo,
    );
  }

  /**
   * Get a single assignment by ID
   * GET /schedule-assignments/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleAssignmentService.findOne(id);
  }

  /**
   * Create a new assignment
   * POST /schedule-assignments
   */
  @Post()
  create(@Body() dto: CreateScheduleAssignmentDto) {
    return this.scheduleAssignmentService.create(dto);
  }

  /**
   * Create multiple assignments for an event
   * POST /schedule-assignments/bulk
   */
  @Post('bulk')
  createBulk(@Body() dto: { eventId: number; staffIds: number[] }) {
    return this.scheduleAssignmentService.createBulk(dto.eventId, dto.staffIds);
  }

  /**
   * Update an assignment
   * PUT /schedule-assignments/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleAssignmentDto,
  ) {
    return this.scheduleAssignmentService.update(id, dto);
  }

  /**
   * Update assignment metadata (for slide submission, etc)
   * PATCH /schedule-assignments/:id/metadata
   */
  @Patch(':id/metadata')
  updateMetadata(
    @Param('id', ParseIntPipe) id: number,
    @Body() metadata: Record<string, any>,
  ) {
    return this.scheduleAssignmentService.updateMetadata(id, metadata);
  }

  /**
   * Mark assignment as completed
   * PATCH /schedule-assignments/:id/complete
   */
  @Patch(':id/complete')
  markCompleted(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleAssignmentService.markCompleted(id);
  }

  /**
   * Delete an assignment
   * DELETE /schedule-assignments/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleAssignmentService.remove(id);
    return { message: 'Assignment deleted successfully' };
  }
}
