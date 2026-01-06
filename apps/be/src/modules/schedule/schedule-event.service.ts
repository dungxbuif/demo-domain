import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleEventDto } from './dtos/create-schedule-event.dto';
import { QueryScheduleEventDto } from './dtos/query-schedule-event.dto';
import { UpdateScheduleEventDto } from './dtos/update-schedule-event.dto';
import { ScheduleDefinition } from './entities/schedule-definition.entity';
import { ScheduleEvent } from './entities/schedule-event.entity';

@Injectable()
export class ScheduleEventService {
  constructor(
    @InjectRepository(ScheduleEvent)
    private readonly scheduleEventRepository: Repository<ScheduleEvent>,
    @InjectRepository(ScheduleDefinition)
    private readonly scheduleDefinitionRepository: Repository<ScheduleDefinition>,
  ) {}

  /**
   * Find all schedule events with filtering and pagination
   */
  async findAll(query: QueryScheduleEventDto) {
    const {
      definitionId,
      dateFrom,
      dateTo,
      status,
      cycleNumber,
      staffId,
      page = 1,
      limit = 20,
    } = query;

    let queryBuilder = this.scheduleEventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.definition', 'definition')
      .leftJoinAndSelect('event.assignments', 'assignments')
      .leftJoinAndSelect('assignments.staff', 'staff');

    if (definitionId) {
      queryBuilder = queryBuilder.andWhere(
        'event.definitionId = :definitionId',
        { definitionId },
      );
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('event.status = :status', {
        status,
      });
    }

    if (cycleNumber) {
      queryBuilder = queryBuilder.andWhere('event.cycleNumber = :cycleNumber', {
        cycleNumber,
      });
    }

    if (dateFrom && dateTo) {
      queryBuilder = queryBuilder.andWhere(
        'event.date BETWEEN :dateFrom AND :dateTo',
        { dateFrom, dateTo },
      );
    } else if (dateFrom) {
      queryBuilder = queryBuilder.andWhere('event.date >= :dateFrom', {
        dateFrom,
      });
    } else if (dateTo) {
      queryBuilder = queryBuilder.andWhere('event.date <= :dateTo', { dateTo });
    }

    if (staffId) {
      queryBuilder = queryBuilder.andWhere('staff.id = :staffId', { staffId });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('event.date', 'ASC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one schedule event by ID
   */
  async findOne(id: number): Promise<ScheduleEvent> {
    const event = await this.scheduleEventRepository.findOne({
      where: { id },
      relations: ['definition', 'assignments', 'assignments.staff'],
    });

    if (!event) {
      throw new NotFoundException(`Schedule event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Create a new schedule event
   */
  async create(dto: CreateScheduleEventDto): Promise<ScheduleEvent> {
    // Verify definition exists
    const definition = await this.scheduleDefinitionRepository.findOne({
      where: { id: dto.definitionId },
    });

    if (!definition) {
      throw new NotFoundException(
        `Schedule definition with ID ${dto.definitionId} not found`,
      );
    }

    const event = this.scheduleEventRepository.create(dto);
    return this.scheduleEventRepository.save(event);
  }

  /**
   * Update a schedule event
   */
  async update(
    id: number,
    dto: UpdateScheduleEventDto,
  ): Promise<ScheduleEvent> {
    const event = await this.findOne(id);
    Object.assign(event, dto);
    return this.scheduleEventRepository.save(event);
  }

  /**
   * Delete a schedule event
   */
  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.scheduleEventRepository.remove(event);
  }

  /**
   * Find events by definition code (convenience method)
   */
  async findByDefinitionCode(code: string, dateFrom?: string, dateTo?: string) {
    const definition = await this.scheduleDefinitionRepository.findOne({
      where: { code },
    });

    if (!definition) {
      throw new NotFoundException(
        `Schedule definition with code ${code} not found`,
      );
    }

    const query: QueryScheduleEventDto = {
      definitionId: definition.id,
      dateFrom,
      dateTo,
    };

    return this.findAll(query);
  }

  /**
   * Find upcoming events for a staff member
   */
  async findUpcomingForStaff(staffId: number, limit: number = 10) {
    const today = new Date().toISOString().split('T')[0];

    return this.findAll({
      staffId,
      dateFrom: today,
      limit,
    });
  }
}
