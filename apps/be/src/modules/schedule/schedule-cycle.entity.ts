import { AbstractEntity } from '@src/common/database/abstract.entity';
import { Column, Entity } from 'typeorm';

export enum CycleStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DRAFT = 'DRAFT',
}

@Entity('schedule_cycles')
export default class ScheduleCycleEntity extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: CycleStatus,
    default: CycleStatus.DRAFT,
  })
  status: CycleStatus;

  @Column({ nullable: true })
  description?: string;
}
