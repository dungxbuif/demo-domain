import { AbstractEntity } from '@src/common/database/abstract.entity';
import { DateOnlyTransformer } from '@src/common/database/date-only.transformer';
import StaffEntity from '@src/modules/staff/staff.entity';
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';

/**
 * Schedule types supported by the system
 */
export enum ScheduleType {
  CLEANING = 'cleaning',
  OPEN_TALK = 'open_talk',
}

/**
 * Generic schedule status
 */
export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  SWAPPED = 'swapped',
  CANCELLED = 'cancelled',
}

/**
 * Metadata interface for Cleaning Schedule
 */
export interface CleaningMetadata {
  cycleNumber: number;
}

/**
 * Metadata interface for Open Talk Schedule
 */
export interface OpenTalkMetadata {
  topic?: string;
  slideUrl?: string;
  slideStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
}

/**
 * Union type for all metadata types
 */
export type ScheduleMetadata = CleaningMetadata | OpenTalkMetadata;

/**
 * Unified Schedule Entity
 * Handles all schedule types (cleaning, open talk, etc.) using a single table
 * with type discriminator and JSONB metadata for type-specific fields
 */
@Entity('schedules')
@Index(['type', 'date']) // Composite index for common queries
@Index(['type', 'status']) // Index for filtering by type and status
export class Schedule extends AbstractEntity {
  /**
   * Type of schedule (cleaning, open_talk, etc.)
   */
  @Column({
    type: 'enum',
    enum: ScheduleType,
  })
  type: ScheduleType;

  /**
   * Schedule date (date only, no time component)
   * Stored in UTC+7 timezone
   */
  @Column({
    type: 'date',
    transformer: new DateOnlyTransformer(),
  })
  date: string;

  /**
   * Schedule status
   */
  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED,
  })
  status: ScheduleStatus;

  /**
   * Staff members assigned to this schedule
   * Using many-to-many for flexibility (cleaning needs 2, open talk needs 1)
   */
  @ManyToMany(() => StaffEntity, { eager: true })
  @JoinTable({
    name: 'schedule_staff',
    joinColumn: { name: 'schedule_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'staff_id', referencedColumnName: 'id' },
  })
  staff: StaffEntity[];

  /**
   * Type-specific metadata stored as JSONB
   * - For cleaning: { cycleNumber: number }
   * - For open_talk: { topic?: string, slideUrl?: string, slideStatus: string }
   */
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata: ScheduleMetadata;

  /**
   * Notes or additional information
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  /**
   * Branch ID (for multi-branch support)
   */
  @Column({
    name: 'branch_id',
    nullable: true,
  })
  branchId?: number;
}
