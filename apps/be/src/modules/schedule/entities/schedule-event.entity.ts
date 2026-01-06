import { AbstractEntity } from '@src/common/database/abstract.entity';
import { DateOnlyTransformer } from '@src/common/database/date-only.transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ScheduleAssignment } from './schedule-assignment.entity';
import { ScheduleDefinition } from './schedule-definition.entity';

/**
 * Status of a schedule event
 */
export enum ScheduleEventStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped', // Skipped due to holiday
}

/**
 * ScheduleEvent Entity
 * Represents a single occurrence of a schedule
 * Example: "Cleaning on 2026-01-15", "Open Talk on 2026-01-18"
 */
@Entity('schedule_events')
@Index(['definitionId', 'date'])
@Index(['date'])
export class ScheduleEvent extends AbstractEntity {
  /**
   * Reference to the schedule definition (type)
   */
  @Column({ name: 'definition_id' })
  definitionId: number;

  @ManyToOne(() => ScheduleDefinition, (def) => def.events, { eager: true })
  @JoinColumn({ name: 'definition_id' })
  definition: ScheduleDefinition;

  /**
   * Date of this event (date only, no time)
   * Stored in UTC+7 timezone
   */
  @Column({
    type: 'date',
    transformer: new DateOnlyTransformer(),
  })
  date: string;

  /**
   * Cycle number for rotation-based schedules
   * Example: Cycle 1, Cycle 2, etc.
   */
  @Column({ name: 'cycle_number', type: 'int', default: 1 })
  cycleNumber: number;

  /**
   * Status of this event
   */
  @Column({
    type: 'enum',
    enum: ScheduleEventStatus,
    default: ScheduleEventStatus.SCHEDULED,
  })
  status: ScheduleEventStatus;

  /**
   * Flag indicating if this event was skipped due to holiday
   */
  @Column({ name: 'is_holiday_skipped', default: false })
  isHolidaySkipped: boolean;

  /**
   * Event-specific metadata in JSONB format
   * Can store additional information specific to this event:
   * {
   *   "notes": "Special event",
   *   "location": "Meeting Room A",
   *   "duration": 60,
   * }
   */
  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;

  /**
   * Staff assignments for this event
   */
  @OneToMany(() => ScheduleAssignment, (assignment) => assignment.event, {
    cascade: true,
  })
  assignments: ScheduleAssignment[];
}
