import {
  ISwapRequestQueryDto,
  ScheduleType,
  SwapRequestStatus,
} from '@qnoffice/shared';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class SwapRequestQueryDto implements ISwapRequestQueryDto {
  @IsOptional()
  @IsNumber()
  requesterId?: number;

  @IsOptional()
  @IsEnum(SwapRequestStatus)
  status?: SwapRequestStatus;

  @IsOptional()
  @IsEnum(ScheduleType)
  type?: ScheduleType;
}
