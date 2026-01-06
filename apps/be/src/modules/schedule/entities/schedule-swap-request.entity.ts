import { AbstractEntity } from '@src/common/database/abstract.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ScheduleAssignment } from './schedule-assignment.entity';

/**
 * Status of a swap request
 */
export enum SwapRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

/**
 * ScheduleSwapRequest Entity
 * Generic swap request for all schedule types
 * Handles the approval workflow for schedule swaps
 */
@Entity('schedule_swap_requests')
@Index(['fromAssignmentId'])
@Index(['requesterStaffId'])
@Index(['status'])
export class ScheduleSwapRequest extends AbstractEntity {
  /**
   * Reference to the assignment being swapped from
   */
  @Column({ name: 'from_assignment_id' })
  fromAssignmentId: number;

  @ManyToOne(() => ScheduleAssignment, { eager: true })
  @JoinColumn({ name: 'from_assignment_id' })
  fromAssignment: ScheduleAssignment;

  /**
   * Staff member requesting the swap
   */
  @Column({ name: 'requester_staff_id' })
  requesterStaffId: number;

  @ManyToOne(() => StaffEntity, { eager: true })
  @JoinColumn({ name: 'requester_staff_id' })
  requester: StaffEntity;

  /**
   * Target staff member to swap with (nullable for "swap with anyone")
   */
  @Column({ name: 'target_staff_id', nullable: true })
  targetStaffId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'target_staff_id' })
  targetStaff: StaffEntity;

  /**
   * Reason for the swap request
   */
  @Column({ type: 'text', nullable: true })
  reason: string;

  /**
   * Status of the swap request
   */
  @Column({
    type: 'enum',
    enum: SwapRequestStatus,
    default: SwapRequestStatus.PENDING,
  })
  status: SwapRequestStatus;

  /**
   * Staff member who approved/rejected the request (HR/GDVP)
   */
  @Column({ name: 'reviewed_by_staff_id', nullable: true })
  reviewedByStaffId: number;

  @ManyToOne(() => StaffEntity, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_staff_id' })
  reviewedBy: StaffEntity;

  /**
   * Timestamp when the request was reviewed
   */
  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date;

  /**
   * Review notes/comments from HR/GDVP
   */
  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  /**
   * If approved, reference to the new assignment created for the swap
   */
  @Column({ name: 'new_assignment_id', nullable: true })
  newAssignmentId: number;

  @ManyToOne(() => ScheduleAssignment, { nullable: true })
  @JoinColumn({ name: 'new_assignment_id' })
  newAssignment: ScheduleAssignment;
}
