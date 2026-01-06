import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import StaffEntity from '../staff/staff.entity';
import {
  CreateSwapRequestDto,
  QuerySwapRequestDto,
  ReviewSwapRequestDto,
} from './dtos/swap-request.dto';
import { ScheduleAssignment } from './entities/schedule-assignment.entity';
import {
  ScheduleSwapRequest,
  SwapRequestStatus,
} from './entities/schedule-swap-request.entity';

@Injectable()
export class ScheduleSwapService {
  constructor(
    @InjectRepository(ScheduleSwapRequest)
    private readonly swapRequestRepository: Repository<ScheduleSwapRequest>,
    @InjectRepository(ScheduleAssignment)
    private readonly assignmentRepository: Repository<ScheduleAssignment>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  /**
   * Find all swap requests with filtering
   */
  async findAll(query: QuerySwapRequestDto): Promise<ScheduleSwapRequest[]> {
    let queryBuilder = this.swapRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.fromAssignment', 'fromAssignment')
      .leftJoinAndSelect('fromAssignment.event', 'event')
      .leftJoinAndSelect('event.definition', 'definition')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('request.targetStaff', 'targetStaff')
      .leftJoinAndSelect('request.reviewedBy', 'reviewedBy');

    if (query.status) {
      queryBuilder = queryBuilder.andWhere('request.status = :status', {
        status: query.status,
      });
    }

    if (query.requesterStaffId) {
      queryBuilder = queryBuilder.andWhere(
        'request.requesterStaffId = :requesterStaffId',
        {
          requesterStaffId: query.requesterStaffId,
        },
      );
    }

    if (query.definitionId) {
      queryBuilder = queryBuilder.andWhere('definition.id = :definitionId', {
        definitionId: query.definitionId,
      });
    }

    return queryBuilder.orderBy('request.createdAt', 'DESC').getMany();
  }

  /**
   * Find one swap request by ID
   */
  async findOne(id: number): Promise<ScheduleSwapRequest> {
    const request = await this.swapRequestRepository.findOne({
      where: { id },
      relations: [
        'fromAssignment',
        'fromAssignment.event',
        'fromAssignment.event.definition',
        'requester',
        'targetStaff',
        'reviewedBy',
        'newAssignment',
      ],
    });

    if (!request) {
      throw new NotFoundException(`Swap request with ID ${id} not found`);
    }

    return request;
  }

  /**
   * Create a new swap request
   */
  async create(dto: CreateSwapRequestDto): Promise<ScheduleSwapRequest> {
    // Verify assignment exists
    const assignment = await this.assignmentRepository.findOne({
      where: { id: dto.fromAssignmentId },
      relations: ['event', 'staff'],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${dto.fromAssignmentId} not found`,
      );
    }

    // Verify requester is the one assigned
    if (assignment.staffId !== dto.requesterStaffId) {
      throw new ForbiddenException(
        'Only the assigned staff can request a swap',
      );
    }

    // Verify requester exists
    const requester = await this.staffRepository.findOne({
      where: { id: dto.requesterStaffId },
    });

    if (!requester) {
      throw new NotFoundException(
        `Requester staff with ID ${dto.requesterStaffId} not found`,
      );
    }

    // Verify target staff if specified
    if (dto.targetStaffId) {
      const targetStaff = await this.staffRepository.findOne({
        where: { id: dto.targetStaffId },
      });

      if (!targetStaff) {
        throw new NotFoundException(
          `Target staff with ID ${dto.targetStaffId} not found`,
        );
      }
    }

    // Check if there's already a pending request for this assignment
    const existingRequest = await this.swapRequestRepository.findOne({
      where: {
        fromAssignmentId: dto.fromAssignmentId,
        status: SwapRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'There is already a pending swap request for this assignment',
      );
    }

    const request = this.swapRequestRepository.create(dto);
    return this.swapRequestRepository.save(request);
  }

  /**
   * Review (approve/reject) a swap request
   */
  async review(
    id: number,
    dto: ReviewSwapRequestDto,
  ): Promise<ScheduleSwapRequest> {
    const request = await this.findOne(id);

    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be reviewed');
    }

    // Verify reviewer exists
    const reviewer = await this.staffRepository.findOne({
      where: { id: dto.reviewedByStaffId },
    });

    if (!reviewer) {
      throw new NotFoundException(
        `Reviewer staff with ID ${dto.reviewedByStaffId} not found`,
      );
    }

    // TODO: Check if reviewer has HR or GDVP role (requires role check)

    request.status = dto.status;
    request.reviewedByStaffId = dto.reviewedByStaffId;
    request.reviewedAt = new Date();
    if (dto.reviewNotes) {
      request.reviewNotes = dto.reviewNotes;
    }

    if (dto.status === SwapRequestStatus.APPROVED && dto.newAssignmentId) {
      request.newAssignmentId = dto.newAssignmentId;
    }

    return this.swapRequestRepository.save(request);
  }

  /**
   * Cancel a swap request
   */
  async cancel(id: number, staffId: number): Promise<ScheduleSwapRequest> {
    const request = await this.findOne(id);

    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    if (request.requesterStaffId !== staffId) {
      throw new ForbiddenException(
        'Only the requester can cancel the swap request',
      );
    }

    request.status = SwapRequestStatus.CANCELLED;
    return this.swapRequestRepository.save(request);
  }

  /**
   * Get pending swap requests for a definition
   */
  async getPendingByDefinition(
    definitionId: number,
  ): Promise<ScheduleSwapRequest[]> {
    return this.findAll({
      status: SwapRequestStatus.PENDING,
      definitionId,
    });
  }

  /**
   * Get swap request history for a staff member
   */
  async getStaffHistory(staffId: number): Promise<ScheduleSwapRequest[]> {
    return this.findAll({
      requesterStaffId: staffId,
    });
  }
}
