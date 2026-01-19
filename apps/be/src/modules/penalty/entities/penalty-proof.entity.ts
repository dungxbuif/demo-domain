import { AbstractEntity } from '@src/common/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Penalty } from '../penalty.entity';

@Entity('penalty_proofs')
export class PenaltyProofEntity extends AbstractEntity {
  @Column({ name: 'image_key' })
  imageKey: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @ManyToOne(() => Penalty, (penalty) => penalty.proofs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'penalty_id' })
  penalty: Penalty;
}
