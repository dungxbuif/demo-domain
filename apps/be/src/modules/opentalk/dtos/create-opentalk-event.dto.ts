import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventStatus } from '../../schedule/schedule-event.entity';

export class CreateOpentalkEventDto {
  @ApiProperty({ description: 'Title of the opentalk event' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Type of event', default: 'OPENTALK' })
  @IsOptional()
  @IsString()
  type?: string = 'OPENTALK';

  @ApiProperty({ description: 'Cycle ID this event belongs to' })
  @IsNumber()
  cycleId: number;

  @ApiProperty({ description: 'Date of the event' })
  @Type(() => Date)
  @IsDate()
  eventDate: Date;

  @ApiProperty({ enum: EventStatus, description: 'Status of the event' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Array of participant staff IDs',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  participantIds?: number[];
}
