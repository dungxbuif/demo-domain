import { StaffStatus, UserRole } from '../enums';
import { Branch } from './branch.types';

export interface User {
  mezonId: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Staff {
  id: number;
  email: string;
  status: StaffStatus;
  userId: string | null;
  role: UserRole;
  branchId: number;
  user?: User;
  branch?: Branch;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICreateStaffDto {
  email: string;
  branchId: number;
  role: UserRole;
}

export interface IUpdateStaffUserIdDto {
  userId?: string | null;
}
