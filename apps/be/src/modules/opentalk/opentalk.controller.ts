import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    OpentalkSlideSubmission,
    ScheduleCycle,
    ScheduleEvent,
    SwapRequest,
} from '@qnoffice/shared';
import { CreateOpentalkCycleDto } from '@src/modules/opentalk/dtos/create-opentalk-cycle.dto';
import { CreateOpentalkEventDto } from '@src/modules/opentalk/dtos/create-opentalk-event.dto';
import CreateSwapRequestDto from '@src/modules/opentalk/dtos/create-swap-request.dto';
import { OpentalkQueryDto } from '@src/modules/opentalk/dtos/opentalk-query.dto';
import ReviewSwapRequestDto from '@src/modules/opentalk/dtos/review-swap-request.dto';
import { SwapOpentalkDto } from '@src/modules/opentalk/dtos/swap-opentalk.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import SubmitSlideDto from './dtos/submit-slide.dto';
import { OpentalkService } from './opentalk.service';
import { OpentalkSlideService } from './services/opentalk-slide.service';

@ApiTags('Opentalk Management')
@Controller('opentalk')
export class OpentalkController {
  constructor(
    private readonly opentalkService: OpentalkService,
    private readonly slideService: OpentalkSlideService,
  ) {}

  @Post('cycles')
  @ApiOperation({ summary: 'Create a new opentalk cycle' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Opentalk cycle created successfully',
  })
  async createCycle(
    @Body() createCycleDto: CreateOpentalkCycleDto,
  ): Promise<ScheduleCycle> {
    return this.opentalkService.createCycle(createCycleDto) as any;
  }

  @Get('cycles')
  @ApiOperation({
    summary: 'Get all opentalk cycles with events and participants',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by cycle status',
  })
  async getCycles(
    @Query('status') status?: string,
  ): Promise<ScheduleCycle[]> {
    return this.opentalkService.getCyclesWithEvents(status) as any;
  }

  @Get('cycles/:id')
  @ApiOperation({ summary: 'Get opentalk cycle by ID' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  async getCycleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ScheduleCycle | null> {
    return this.opentalkService.getCycleById(id) as any;
  }

  @Put('cycles/:id')
  @ApiOperation({ summary: 'Update opentalk cycle' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  async updateCycle(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateOpentalkCycleDto>,
  ): Promise<ScheduleCycle> {
    return this.opentalkService.updateCycle(id, updateData) as any;
  }

  @Delete('cycles/:id')
  @ApiOperation({ summary: 'Delete opentalk cycle' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  async deleteCycle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.opentalkService.deleteCycle(id);
  }

  // Opentalk Event Management
  @Post('events')
  @ApiOperation({ summary: 'Create a new opentalk event' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Opentalk event created successfully',
  })
  async createEvent(
    @Body() createEventDto: CreateOpentalkEventDto,
  ): Promise<ScheduleEvent> {
    return this.opentalkService.createEvent(createEventDto) as any;
  }

  @Get('events')
  @ApiOperation({ summary: 'Get opentalk events with filters' })
  async getEvents(
    @Query() query: OpentalkQueryDto,
  ): Promise<ScheduleEvent[]> {
    return this.opentalkService.getEvents(query) as any;
  }

  @Get('cycles/:cycleId/events')
  @ApiOperation({ summary: 'Get opentalk events for a specific cycle' })
  @ApiParam({ name: 'cycleId', description: 'Cycle ID' })
  async getEventsByCycle(
    @Param('cycleId', ParseIntPipe) cycleId: number,
  ): Promise<ScheduleEvent[]> {
    return this.opentalkService.getEventsByCycle(cycleId) as any;
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get opentalk event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ScheduleEvent | null> {
    return this.opentalkService.getEventById(id) as any;
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update opentalk event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateOpentalkEventDto>,
  ): Promise<ScheduleEvent> {
    return this.opentalkService.updateEvent(id, updateData) as any;
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete opentalk event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.opentalkService.deleteEvent(id);
  }

  @Post('swap')
  @ApiOperation({ summary: 'Create a new swap' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Swapped successfully',
  })
  async swapOpentalk(@Body() swapDto: SwapOpentalkDto): Promise<void> {
    return this.opentalkService.swapOpentalk(swapDto);
  }

  @Get('spreadsheet')
  @ApiOperation({ summary: 'Get opentalk data in spreadsheet format' })
  @ApiQuery({
    name: 'cycleId',
    required: false,
    description: 'Filter by cycle ID',
  })
  async getSpreadsheetData(@Query('cycleId') cycleId?: number): Promise<any> {
    return this.opentalkService.getSpreadsheetData(cycleId);
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign participants to opentalk events' })
  async bulkAssignParticipants(
    @Body()
    assignmentData: {
      cycleId: number;
      assignments: Array<{ eventId: number; participantIds: number[] }>;
    },
  ): Promise<ScheduleEvent[]> {
    return this.opentalkService.bulkAssignParticipants(assignmentData) as any;
  }

  @Get('conflicts')
  @ApiOperation({
    summary: 'Check for participant conflicts in opentalk events',
  })
  @ApiQuery({ name: 'cycleId', required: false })
  async checkConflicts(@Query('cycleId') cycleId?: number): Promise<any[]> {
    return this.opentalkService.checkConflicts(cycleId);
  }

  // Swap Request Management
  @Get('swap-requests')
  @ApiOperation({ summary: 'Get swap requests' })
  @ApiQuery({ name: 'requesterId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getSwapRequests(
    @Query('requesterId') requesterId?: number,
    @Query('status') status?: string,
  ): Promise<SwapRequest[]> {
    return this.opentalkService.getSwapRequests({
      requesterId,
      status,
    }) as any;
  }

  @Post('swap-requests')
  @ApiOperation({ summary: 'Create a new swap request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Swap request created successfully',
  })
  async createSwapRequest(
    @Body() createSwapRequestDto: CreateSwapRequestDto,
    @Query('requesterId', ParseIntPipe) requesterId: number,
  ): Promise<SwapRequest> {
    return this.opentalkService.createSwapRequest(
      createSwapRequestDto,
      requesterId,
    ) as any;
  }

  @Put('swap-requests/:id/review')
  @ApiOperation({ summary: 'Review a swap request (approve/reject)' })
  @ApiParam({ name: 'id', description: 'Swap request ID' })
  async reviewSwapRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewDto: ReviewSwapRequestDto,
  ): Promise<SwapRequest> {
    return this.opentalkService.reviewSwapRequest(id, reviewDto) as any;
  }

  @Post('slides/submit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit slides for an opentalk event' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Slides submitted successfully',
  })
  async submitSlide(
    @Body() dto: SubmitSlideDto,
    @Req() req: any,
  ): Promise<OpentalkSlideSubmission> {
    const staffId = req.user.staffId;
    return this.slideService.submitSlide(dto, staffId) as any;
  }

  @Get('slides/:eventId')
  @ApiOperation({ summary: 'Get slide submission for an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  async getSlideSubmission(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<OpentalkSlideSubmission | null> {
    return this.slideService.getSlideSubmission(eventId) as any;
  }
}
