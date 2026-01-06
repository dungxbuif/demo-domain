import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ScheduleEventStatus } from '../entities/schedule-event.entity';

export class UpdateScheduleEventDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date?: string;

  @IsOptional()
  @IsInt()
  cycleNumber?: number;

  @IsOptional()
  @IsEnum(ScheduleEventStatus)
  status?: ScheduleEventStatus;

  @IsOptional()
  @IsBoolean()
  isHolidaySkipped?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
