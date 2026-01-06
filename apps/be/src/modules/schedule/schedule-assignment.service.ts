import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import StaffEntity from '../staff/staff.entity';
import { CreateScheduleAssignmentDto } from './dtos/create-schedule-assignment.dto';
import { UpdateScheduleAssignmentDto } from './dtos/update-schedule-assignment.dto';
import { ScheduleAssignment } from './entities/schedule-assignment.entity';
import { ScheduleEvent } from './entities/schedule-event.entity';

@Injectable()
export class ScheduleAssignmentService {
  constructor(
    @InjectRepository(ScheduleAssignment)
    private readonly assignmentRepository: Repository<ScheduleAssignment>,
    @InjectRepository(ScheduleEvent)
    private readonly eventRepository: Repository<ScheduleEvent>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  /**
   * Find all assignments for an event
   */
  async findByEvent(eventId: number): Promise<ScheduleAssignment[]> {
    return this.assignmentRepository.find({
      where: { eventId },
      relations: ['staff', 'event'],
      order: { assignmentOrder: 'ASC' },
    });
  }

  /**
   * Find all assignments for a staff member
   */
  async findByStaff(
    staffId: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ScheduleAssignment[]> {
    let query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.event', 'event')
      .leftJoinAndSelect('event.definition', 'definition')
      .leftJoinAndSelect('assignment.staff', 'staff')
      .where('assignment.staffId = :staffId', { staffId });

    if (dateFrom && dateTo) {
      query = query.andWhere('event.date BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    } else if (dateFrom) {
      query = query.andWhere('event.date >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      query = query.andWhere('event.date <= :dateTo', { dateTo });
    }

    return query.orderBy('event.date', 'ASC').getMany();
  }

  /**
   * Find one assignment by ID
   */
  async findOne(id: number): Promise<ScheduleAssignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['event', 'event.definition', 'staff'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  /**
   * Create a new assignment
   */
  async create(dto: CreateScheduleAssignmentDto): Promise<ScheduleAssignment> {
    // Verify event exists
    const event = await this.eventRepository.findOne({
      where: { id: dto.eventId },
      relations: ['definition', 'assignments'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
    }

    // Verify staff exists
    const staff = await this.staffRepository.findOne({
      where: { id: dto.staffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${dto.staffId} not found`);
    }

    // Check if staff is already assigned to this event
    const existingAssignment = await this.assignmentRepository.findOne({
      where: { eventId: dto.eventId, staffId: dto.staffId },
    });

    if (existingAssignment) {
      throw new ConflictException(`Staff is already assigned to this event`);
    }

    // Validate number of assignments doesn't exceed required people
    const currentAssignments = event.assignments?.length || 0;
    if (currentAssignments >= event.definition.requiredPeoplePerSlot) {
      throw new BadRequestException(
        `Event already has maximum ${event.definition.requiredPeoplePerSlot} assignments`,
      );
    }

    // Auto-assign assignment order if not provided
    if (!dto.assignmentOrder) {
      dto.assignmentOrder = currentAssignments + 1;
    }

    const assignment = this.assignmentRepository.create(dto);
    return this.assignmentRepository.save(assignment);
  }

  /**
   * Update an assignment
   */
  async update(
    id: number,
    dto: UpdateScheduleAssignmentDto,
  ): Promise<ScheduleAssignment> {
    const assignment = await this.findOne(id);
    Object.assign(assignment, dto);
    return this.assignmentRepository.save(assignment);
  }

  /**
   * Update assignment metadata (for slide submission, etc)
   */
  async updateMetadata(
    id: number,
    metadata: Record<string, any>,
  ): Promise<ScheduleAssignment> {
    const assignment = await this.findOne(id);
    assignment.metadata = { ...assignment.metadata, ...metadata };
    return this.assignmentRepository.save(assignment);
  }

  /**
   * Mark assignment as completed
   */
  async markCompleted(id: number): Promise<ScheduleAssignment> {
    const assignment = await this.findOne(id);
    assignment.isCompleted = true;
    return this.assignmentRepository.save(assignment);
  }

  /**
   * Delete an assignment
   */
  async remove(id: number): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentRepository.remove(assignment);
  }

  /**
   * Create multiple assignments for an event
   */
  async createBulk(
    eventId: number,
    staffIds: number[],
  ): Promise<ScheduleAssignment[]> {
    const assignments: ScheduleAssignment[] = [];

    for (let i = 0; i < staffIds.length; i++) {
      const assignment = await this.create({
        eventId,
        staffId: staffIds[i],
        assignmentOrder: i + 1,
      });
      assignments.push(assignment);
    }

    return assignments;
  }
}
