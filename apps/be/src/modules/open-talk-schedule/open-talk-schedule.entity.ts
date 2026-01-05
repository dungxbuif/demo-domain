import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  // @ManyToOne(() => UserEntity, (user) => user.openTalkSchedules)
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity;

  // @Column()
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
