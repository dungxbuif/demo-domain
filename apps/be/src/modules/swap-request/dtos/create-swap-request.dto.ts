import { ICreateSwapRequestDto, ScheduleType } from '@qnoffice/shared';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSwapRequestDto implements ICreateSwapRequestDto {
  @IsNumber()
  fromEventId: number;

  @IsNumber()
  toEventId: number;

  @IsString()
  reason: string;

  @IsEnum(ScheduleType)
  type: ScheduleType;

  @IsOptional()
  @IsNumber()
  targetStaffId?: number;
}
