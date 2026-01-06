import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import StaffEntity from '../staff/staff.entity';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { QueryScheduleDto } from './dtos/query-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { Schedule, ScheduleType } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  /**
   * Find all schedules with filtering and pagination
   */
  async findAll(query: QueryScheduleDto) {
    const {
      type,
      status,
      dateFrom,
      dateTo,
      staffId,
      branchId,
      page = 1,
      limit = 20,
    } = query;

    const where: FindOptionsWhere<Schedule> = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;

    // Date range filtering
    if (dateFrom && dateTo) {
      where.date = MoreThanOrEqual(dateFrom) as any;
      // Note: For complex date range, we'll use a second condition
    } else if (dateFrom) {
      where.date = MoreThanOrEqual(dateFrom) as any;
    } else if (dateTo) {
      where.date = LessThanOrEqual(dateTo) as any;
    }

    let queryBuilder = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.staff', 'staff');

    // Apply where conditions
    if (type)
      queryBuilder = queryBuilder.andWhere('schedule.type = :type', { type });
    if (status)
      queryBuilder = queryBuilder.andWhere('schedule.status = :status', {
        status,
      });
    if (branchId)
      queryBuilder = queryBuilder.andWhere('schedule.branchId = :branchId', {
        branchId,
      });

    if (dateFrom && dateTo) {
      queryBuilder = queryBuilder.andWhere(
        'schedule.date BETWEEN :dateFrom AND :dateTo',
        { dateFrom, dateTo },
      );
    } else if (dateFrom) {
      queryBuilder = queryBuilder.andWhere('schedule.date >= :dateFrom', {
        dateFrom,
      });
    } else if (dateTo) {
      queryBuilder = queryBuilder.andWhere('schedule.date <= :dateTo', {
        dateTo,
      });
    }

    // Filter by staff ID (if schedule has this staff member)
    if (staffId) {
      queryBuilder = queryBuilder.andWhere('staff.id = :staffId', { staffId });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('schedule.date', 'ASC')
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
   * Find one schedule by ID
   */
  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['staff'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  /**
   * Create a new schedule
   */
  async create(createDto: CreateScheduleDto): Promise<Schedule> {
    const { staffIds, ...scheduleData } = createDto;

    // Fetch staff entities
    const staff = await this.staffRepository.find({
      where: { id: In(staffIds) },
    });

    if (staff.length !== staffIds.length) {
      throw new NotFoundException('One or more staff members not found');
    }

    // Validate staff count based on schedule type
    this.validateStaffCount(createDto.type, staff.length);

    const schedule = this.scheduleRepository.create({
      ...scheduleData,
      staff,
    });

    return this.scheduleRepository.save(schedule);
  }

  /**
   * Update a schedule
   */
  async update(id: number, updateDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);

    const { staffIds, ...updateData } = updateDto;

    // Update staff if provided
    if (staffIds) {
      const staff = await this.staffRepository.find({
        where: { id: In(staffIds) },
      });

      if (staff.length !== staffIds.length) {
        throw new NotFoundException('One or more staff members not found');
      }

      this.validateStaffCount(schedule.type, staff.length);
      schedule.staff = staff;
    }

    // Update other fields
    Object.assign(schedule, updateData);

    return this.scheduleRepository.save(schedule);
  }

  /**
   * Delete a schedule
   */
  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
  }

  /**
   * Validate staff count based on schedule type
   */
  private validateStaffCount(type: ScheduleType, count: number): void {
    if (type === ScheduleType.CLEANING && count !== 2) {
      throw new Error('Cleaning schedule requires exactly 2 staff members');
    }
    if (type === ScheduleType.OPEN_TALK && count !== 1) {
      throw new Error('Open talk schedule requires exactly 1 staff member');
    }
  }

  /**
   * Get schedules by type
   */
  async findByType(type: ScheduleType, dateFrom?: string, dateTo?: string) {
    const query: QueryScheduleDto = { type, dateFrom, dateTo };
    return this.findAll(query);
  }

  /**
   * Get schedules for a specific staff member
   */
  async findByStaff(staffId: number, dateFrom?: string, dateTo?: string) {
    const query: QueryScheduleDto = { staffId, dateFrom, dateTo };
    return this.findAll(query);
  }
}
