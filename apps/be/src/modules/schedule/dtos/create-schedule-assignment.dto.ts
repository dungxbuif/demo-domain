import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateScheduleAssignmentDto {
  @IsInt()
  eventId: number;

  @IsInt()
  staffId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignmentOrder?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
