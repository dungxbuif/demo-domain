import { OpentalkSlideStatus, OpentalkSlideType } from '@qnoffice/shared';
import { AbstractEntity } from '@src/common/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity('opentalk_slides')
export default class OpentalkSlideEntity extends AbstractEntity {
  @Column({ name: 'event_id' })
  eventId: number; // No FK - just store the ID

  @Column({ nullable: true })
  topic?: string;

  @Column({ name: 'slide_url', nullable: true })
  slideUrl?: string;

  @Column({ name: 'slide_key', nullable: true })
  slideKey?: string; // S3 key for uploaded files

  @Column({
    type: 'enum',
    enum: OpentalkSlideType,
  })
  type: OpentalkSlideType;

  @Column({
    type: 'enum',
    enum: OpentalkSlideStatus,
    default: OpentalkSlideStatus.PENDING,
  })
  status: OpentalkSlideStatus;

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy?: number; // User ID who approved

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy?: number; // User ID who rejected

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;
}
