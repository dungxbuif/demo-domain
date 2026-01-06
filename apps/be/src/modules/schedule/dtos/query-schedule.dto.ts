import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ScheduleStatus, ScheduleType } from '../schedule.entity';

export class QueryScheduleDto {
  @IsOptional()
  @IsEnum(ScheduleType)
  type?: ScheduleType;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @IsOptional()
  @IsString()
  dateFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  dateTo?: string; // YYYY-MM-DD

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  staffId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  branchId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 20;
}
