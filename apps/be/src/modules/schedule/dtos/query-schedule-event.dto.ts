import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ScheduleEventStatus } from '../entities/schedule-event.entity';

export class QueryScheduleEventDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  definitionId?: number;

  @IsOptional()
  @IsString()
  dateFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  dateTo?: string; // YYYY-MM-DD

  @IsOptional()
  @IsEnum(ScheduleEventStatus)
  status?: ScheduleEventStatus;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  cycleNumber?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  staffId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}
