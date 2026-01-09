import { IUpdateStaffUserIdDto } from '@qnoffice/shared';
import { IsOptional, IsString } from 'class-validator';

export default class UpdateStaffUserIdDto implements IUpdateStaffUserIdDto {
  @IsOptional()
  @IsString()
  userId?: string | null;
}
