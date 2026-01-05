import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../branch/branch.entity';
import { CleaningSchedule } from '../cleaning-schedule/cleaning-schedule.entity';
import { OpenTalkSchedule } from '../open-talk-schedule/open-talk-schedule.entity';
import { Penalty } from '../penalty/penalty.entity';

export enum UserRole {
  STAFF = 0,
  HR = 1,
  GDVP = 2,
}

export enum UserStatus {
  ACTIVE = 0,
  INACTIVE = 1,
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  mezon_user_id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ManyToOne(() => Branch, (branch) => branch.users)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column()
  branch_id: number;

  @Column({ type: 'json', nullable: true })
  remote_schedule: any; // JSON for remote work schedule

  @OneToMany(() => CleaningSchedule, (schedule) => schedule.user1)
  cleaningSchedules1: CleaningSchedule[];

  @OneToMany(() => CleaningSchedule, (schedule) => schedule.user2)
  cleaningSchedules2: CleaningSchedule[];

  @OneToMany(() => OpenTalkSchedule, (schedule) => schedule.user)
  openTalkSchedules: OpenTalkSchedule[];

  @OneToMany(() => Penalty, (penalty) => penalty.user)
  penalties: Penalty[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
