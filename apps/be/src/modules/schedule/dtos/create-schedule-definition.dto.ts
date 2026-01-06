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

export class CreateScheduleDefinitionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  @Min(1)
  requiredPeoplePerSlot: number;

  @IsEnum(ScheduleStrategy)
  strategy: ScheduleStrategy;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
