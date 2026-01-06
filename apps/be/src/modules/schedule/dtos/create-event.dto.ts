import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export enum ScheduleType {
  OPENTALK = 'OPENTALK',
  CLEANING = 'CLEANING',
}
export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: ScheduleType })
  @IsEnum(ScheduleType)
  type: ScheduleType;

  @ApiProperty()
  @IsNumber()
  cycleId: number;

  @ApiProperty()
  @IsDateString()
  eventDate: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  participantIds: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
