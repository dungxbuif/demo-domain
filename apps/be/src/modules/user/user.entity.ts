import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

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
export default class UserEntity {
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

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
