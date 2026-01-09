import { ICreateSwapRequestDto, ScheduleType } from '@qnoffice/shared';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateSwapRequestDto implements ICreateSwapRequestDto {
  scheduleId: number;
  targetStaffId?: number | undefined;
  @IsNumber()
  fromEventId: number;

  @IsNumber()
  toEventId: number;

  @IsString()
  reason: string;

  @IsEnum(ScheduleType)
  type: ScheduleType;
}
