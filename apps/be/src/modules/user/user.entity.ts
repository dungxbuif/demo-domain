import { AbstractAuditEntity } from '@src/common/database/abstract.entity';
import { UserRole } from '@src/common/enums/user-role.enum';
import StaffEntity from '@src/modules/staff/staff.entity';
import { AfterInsert, Column, Entity, EntityManager, IsNull } from 'typeorm';

@Entity('users')
export default class UserEntity extends AbstractAuditEntity {
  @Column({ primary: true, unique: true })
  mezonId: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF,
  })
  role: UserRole;

  @AfterInsert()
  async logInsert(event: { entity: UserEntity; entityManager: EntityManager }) {
    const manager = event?.entityManager;
    if (!manager || !event?.entity?.email) return;
    const existStaff = await manager.findOneBy(StaffEntity, {
      email: event.entity.email,
      userId: IsNull(),
    });
    if (existStaff) {
      existStaff.userId = event.entity.mezonId;
      await manager.save(StaffEntity, existStaff);
    }
  }
}
