import { AbstractEntity } from '@src/common/database/abstract.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ScheduleEvent } from './schedule-event.entity';

export enum ScheduleStrategy {
  ROUND_ROBIN = 'round_robin',
  MANUAL = 'manual',
  FIRST_AVAILABLE = 'first_available',
}

@Entity('schedule_definitions')
@Index(['code'], { unique: true })
export class ScheduleDefinition extends AbstractEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  participants: number;

  @Column({
    type: 'enum',
    enum: ScheduleStrategy,
    default: ScheduleStrategy.MANUAL,
  })
  strategy: ScheduleStrategy;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>;

  @OneToMany(() => ScheduleEvent, (event) => event.definition)
  events: ScheduleEvent[];
}
