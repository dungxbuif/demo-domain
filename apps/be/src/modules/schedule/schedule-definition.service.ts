import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateScheduleDefinitionDto } from './dtos/create-schedule-definition.dto';
import { QueryScheduleDefinitionDto } from './dtos/query-schedule-definition.dto';
import { UpdateScheduleDefinitionDto } from './dtos/update-schedule-definition.dto';
import { ScheduleDefinition } from './entities/schedule-definition.entity';

@Injectable()
export class ScheduleDefinitionService {
  constructor(
    @InjectRepository(ScheduleDefinition)
    private readonly scheduleDefinitionRepository: Repository<ScheduleDefinition>,
  ) {}

  /**
   * Find all schedule definitions with optional filtering
   */
  async findAll(
    query: QueryScheduleDefinitionDto,
  ): Promise<ScheduleDefinition[]> {
    const where: FindOptionsWhere<ScheduleDefinition> = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.code) {
      where.code = query.code;
    }

    return this.scheduleDefinitionRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one schedule definition by ID
   */
  async findOne(id: number): Promise<ScheduleDefinition> {
    const definition = await this.scheduleDefinitionRepository.findOne({
      where: { id },
    });

    if (!definition) {
      throw new NotFoundException(
        `Schedule definition with ID ${id} not found`,
      );
    }

    return definition;
  }

  /**
   * Find schedule definition by code
   */
  async findByCode(code: string): Promise<ScheduleDefinition> {
    const definition = await this.scheduleDefinitionRepository.findOne({
      where: { code },
    });

    if (!definition) {
      throw new NotFoundException(
        `Schedule definition with code ${code} not found`,
      );
    }

    return definition;
  }

  /**
   * Create a new schedule definition
   */
  async create(dto: CreateScheduleDefinitionDto): Promise<ScheduleDefinition> {
    // Check if code already exists
    const existing = await this.scheduleDefinitionRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Schedule definition with code ${dto.code} already exists`,
      );
    }

    const definition = this.scheduleDefinitionRepository.create(dto);
    return this.scheduleDefinitionRepository.save(definition);
  }

  /**
   * Update a schedule definition
   */
  async update(
    id: number,
    dto: UpdateScheduleDefinitionDto,
  ): Promise<ScheduleDefinition> {
    const definition = await this.findOne(id);

    // Check if code is being changed and if it conflicts
    if (dto.code && dto.code !== definition.code) {
      const existing = await this.scheduleDefinitionRepository.findOne({
        where: { code: dto.code },
      });

      if (existing) {
        throw new ConflictException(
          `Schedule definition with code ${dto.code} already exists`,
        );
      }
    }

    Object.assign(definition, dto);
    return this.scheduleDefinitionRepository.save(definition);
  }

  /**
   * Delete a schedule definition
   */
  async remove(id: number): Promise<void> {
    const definition = await this.findOne(id);
    await this.scheduleDefinitionRepository.remove(definition);
  }

  /**
   * Activate/Deactivate a schedule definition
   */
  async toggleActive(id: number): Promise<ScheduleDefinition> {
    const definition = await this.findOne(id);
    definition.isActive = !definition.isActive;
    return this.scheduleDefinitionRepository.save(definition);
  }
}
