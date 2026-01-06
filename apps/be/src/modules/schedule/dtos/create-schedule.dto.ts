import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ScheduleMetadata, ScheduleType } from '../schedule.entity';

export class CreateScheduleDto {
  @IsEnum(ScheduleType)
  type: ScheduleType;

  @IsString()
  date: string; // YYYY-MM-DD format

  @IsArray()
  @IsInt({ each: true })
  staffIds: number[];

  @IsOptional()
  @IsObject()
  metadata?: ScheduleMetadata;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  branchId?: number;
}
