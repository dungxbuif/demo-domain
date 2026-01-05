import { IsOptional, IsString } from 'class-validator';

export default class UpdateStaffUserIdDto {
  @IsOptional()
  @IsString()
  userId?: string | null;
}
