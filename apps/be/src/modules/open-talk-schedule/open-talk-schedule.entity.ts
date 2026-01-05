import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum OpenTalkStatus {
  SCHEDULED,
  COMPLETED,
  SWAPPED,
}

export enum SlideStatus {
  PENDING,
  SUBMITTED,
  APPROVED,
  REJECTED,
}

@Entity('open_talk_schedules')
export class OpenTalkSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => User, (user) => user.openTalkSchedules)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  topic: string;

  @Column({ nullable: true })
  slide_url: string;

  @Column({
    type: 'enum',
    enum: SlideStatus,
    default: SlideStatus.PENDING,
  })
  slide_status: SlideStatus;

  @Column({
    type: 'enum',
    enum: OpenTalkStatus,
    default: OpenTalkStatus.SCHEDULED,
  })
  schedule_status: OpenTalkStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
