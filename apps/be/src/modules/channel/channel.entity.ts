import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel_id: string; // Mezon channel ID

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['cleaning', 'opentalk', 'penalty', 'general'],
    default: 'general',
  })
  purpose: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
