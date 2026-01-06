import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ScheduleStrategy } from '../entities/schedule-definition.entity';

export class UpdateScheduleDefinitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  requiredPeoplePerSlot?: number;

  @IsOptional()
  @IsEnum(ScheduleStrategy)
  strategy?: ScheduleStrategy;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
