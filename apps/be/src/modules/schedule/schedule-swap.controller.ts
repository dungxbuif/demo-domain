import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateSwapRequestDto,
  QuerySwapRequestDto,
  ReviewSwapRequestDto,
} from './dtos/swap-request.dto';
import { ScheduleSwapService } from './schedule-swap.service';

@Controller('schedule-swaps')
export class ScheduleSwapController {
  constructor(private readonly scheduleSwapService: ScheduleSwapService) {}

  /**
   * Get all swap requests with filtering
   * GET /schedule-swaps
   */
  @Get()
  findAll(@Query() query: QuerySwapRequestDto) {
    return this.scheduleSwapService.findAll(query);
  }

  /**
   * Get a swap request by ID
   * GET /schedule-swaps/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleSwapService.findOne(id);
  }

  /**
   * Get pending swap requests for a definition
   * GET /schedule-swaps/definition/:definitionId/pending
   */
  @Get('definition/:definitionId/pending')
  getPendingByDefinition(
    @Param('definitionId', ParseIntPipe) definitionId: number,
  ) {
    return this.scheduleSwapService.getPendingByDefinition(definitionId);
  }

  /**
   * Get swap request history for a staff member
   * GET /schedule-swaps/staff/:staffId/history
   */
  @Get('staff/:staffId/history')
  getStaffHistory(@Param('staffId', ParseIntPipe) staffId: number) {
    return this.scheduleSwapService.getStaffHistory(staffId);
  }

  /**
   * Create a new swap request
   * POST /schedule-swaps
   */
  @Post()
  create(@Body() dto: CreateSwapRequestDto) {
    return this.scheduleSwapService.create(dto);
  }

  /**
   * Review (approve/reject) a swap request
   * PUT /schedule-swaps/:id/review
   */
  @Put(':id/review')
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewSwapRequestDto,
  ) {
    return this.scheduleSwapService.review(id, dto);
  }

  /**
   * Cancel a swap request
   * PATCH /schedule-swaps/:id/cancel
   */
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { staffId: number },
  ) {
    return this.scheduleSwapService.cancel(id, body.staffId);
  }
}
