import { UserRole } from '@src/common/constants/user.constants';
import { IsEmail, IsEnum, IsNumber } from 'class-validator';

export default class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsNumber()
  branchId: number;

  @IsEnum(UserRole)
  role: UserRole;
}
