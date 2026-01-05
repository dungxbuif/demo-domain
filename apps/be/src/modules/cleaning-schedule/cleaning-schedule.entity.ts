import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ScheduleStatus {
  SCHEDULED = 0,
  COMPLETED = 1,
  SWAPPED = 2,
}

@Entity('cleaning_schedules')
export class CleaningSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  // @ManyToOne(() => UserEntity, (user) => user.cleaningSchedules1)
  // @JoinColumn({ name: 'user_id_1' })
  // user1: UserEntity;

  // @Column()
  // user_id_1: number;

  // @ManyToOne(() => UserEntity, (user) => user.cleaningSchedules2)
  // @JoinColumn({ name: 'user_id_2' })
  // user2: UserEntity;

  @Column()
  user_id_2: number;

  @Column()
  cycle_number: number;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED,
  })
  status: ScheduleStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
