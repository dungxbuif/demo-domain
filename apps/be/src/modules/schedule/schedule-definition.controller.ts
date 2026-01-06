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
import { CreateScheduleDefinitionDto } from './dtos/create-schedule-definition.dto';
import { QueryScheduleDefinitionDto } from './dtos/query-schedule-definition.dto';
import { UpdateScheduleDefinitionDto } from './dtos/update-schedule-definition.dto';
import { ScheduleDefinitionService } from './schedule-definition.service';

@Controller('schedule-definitions')
export class ScheduleDefinitionController {
  constructor(
    private readonly scheduleDefinitionService: ScheduleDefinitionService,
  ) {}

  /**
   * Get all schedule definitions
   * GET /schedule-definitions
   */
  @Get()
  findAll(@Query() query: QueryScheduleDefinitionDto) {
    return this.scheduleDefinitionService.findAll(query);
  }

  /**
   * Get a schedule definition by ID
   * GET /schedule-definitions/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleDefinitionService.findOne(id);
  }

  /**
   * Get a schedule definition by code
   * GET /schedule-definitions/code/:code
   */
  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.scheduleDefinitionService.findByCode(code);
  }

  /**
   * Create a new schedule definition
   * POST /schedule-definitions
   */
  @Post()
  create(@Body() dto: CreateScheduleDefinitionDto) {
    return this.scheduleDefinitionService.create(dto);
  }

  /**
   * Update a schedule definition
   * PUT /schedule-definitions/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDefinitionDto,
  ) {
    return this.scheduleDefinitionService.update(id, dto);
  }

  /**
   * Toggle active status
   * PATCH /schedule-definitions/:id/toggle-active
   */
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleDefinitionService.toggleActive(id);
  }

  /**
   * Delete a schedule definition
   * DELETE /schedule-definitions/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleDefinitionService.remove(id);
    return { message: 'Schedule definition deleted successfully' };
  }
}
