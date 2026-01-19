import { PenaltyStatus } from '@qnoffice/shared';
import { AbstractEntity } from '@src/common/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PenaltyType } from '../penalty-type/penalty-type.entity';
import Staff from '../staff/staff.entity';
import { PenaltyProofEntity } from './entities/penalty-proof.entity';

@Entity('penalties')
export class Penalty extends AbstractEntity {
  @Column()
  staffId: number;

  @Column()
  penaltyTypeId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  reason: string;

  @Column({
    type: 'enum',
    enum: PenaltyStatus,
    default: PenaltyStatus.UNPAID,
  })
  status: PenaltyStatus;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @ManyToOne(() => PenaltyType, (penaltyType) => penaltyType.penalties)
  @JoinColumn({ name: 'penalty_type_id' })
  penaltyType: PenaltyType;

  @OneToMany(() => PenaltyProofEntity, (proof) => proof.penalty, {
    cascade: true,
    eager: false,
  })
  proofs?: PenaltyProofEntity[];
}
