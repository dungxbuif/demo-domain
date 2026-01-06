import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ScheduleMetadata, ScheduleStatus } from '../schedule.entity';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  staffIds?: number[];

  @IsOptional()
  @IsObject()
  metadata?: ScheduleMetadata;

  @IsOptional()
  @IsString()
  notes?: string;
}
