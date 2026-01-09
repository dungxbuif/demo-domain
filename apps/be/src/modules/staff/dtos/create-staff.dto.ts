import { ICreateStaffDto, UserRole } from '@qnoffice/shared';
import { IsEmail, IsEnum, IsNumber } from 'class-validator';

export default class CreateStaffDto implements ICreateStaffDto {
  @IsEmail()
  email: string;

  @IsNumber()
  branchId: number;

  @IsEnum(UserRole)
  role: UserRole;
}
