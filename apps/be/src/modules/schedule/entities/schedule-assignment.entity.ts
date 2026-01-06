import { AbstractEntity } from '@src/common/database/abstract.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ScheduleEvent } from './schedule-event.entity';

/**
 * ScheduleAssignment Entity
 * Links staff members to schedule events
 * Supports N staff per event (flexible for different schedule types)
 */
@Entity('schedule_assignments')
@Index(['eventId', 'staffId'], { unique: true })
@Index(['staffId'])
export class ScheduleAssignment extends AbstractEntity {
  /**
   * Reference to the schedule event
   */
  @Column({ name: 'event_id' })
  eventId: number;

  @ManyToOne(() => ScheduleEvent, (event) => event.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: ScheduleEvent;

  /**
   * Reference to the staff member
   */
  @Column({ name: 'staff_id' })
  staffId: number;

  @ManyToOne(() => StaffEntity, { eager: true })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffEntity;

  /**
   * Order of assignment (for sorting/priority)
   * Example: For cleaning with 2 people, first person = 1, second = 2
   */
  @Column({ name: 'assignment_order', type: 'int', default: 1 })
  assignmentOrder: number;

  /**
   * Assignment-specific metadata in JSONB format
   * Dynamic fields based on schedule type:
   *
   * For Open Talk:
   * {
   *   "topic": "NestJS Best Practices",
   *   "slideUrl": "https://slides.com/...",
   *   "slideStatus": "approved", // pending | submitted | approved | rejected
   *   "submittedAt": "2026-01-10T10:00:00Z"
   * }
   *
   * For Cleaning:
   * {
   *   "area": "Kitchen",
   *   "checkedOut": true
   * }
   *
   * For future schedule types:
   * {
   *   "customField1": "value1",
   *   "customField2": "value2"
   * }
   */
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  /**
   * Whether this assignment is completed
   */
  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  /**
   * Notes specific to this assignment
   */
  @Column({ type: 'text', nullable: true })
  notes: string;
}
