import { AbstractEntity } from '@src/common/database/abstract.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('branches')
export class BranchEntity extends AbstractEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  address: string;

  @OneToMany(() => StaffEntity, (staff) => staff.branch)
  staffs: StaffEntity[];
}
