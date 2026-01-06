import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCleaningEventDto {
  @ApiProperty({ description: 'Title of the cleaning event' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Date of the cleaning event (YYYY-MM-DD)' })
  @IsDateString()
  eventDate: string;

  @ApiProperty({ description: 'ID of the cycle this event belongs to' })
  @IsNumber()
  cycleId: number;

  @ApiPropertyOptional({ description: 'Notes for the cleaning event' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Status of the cleaning event',
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS'],
    default: 'PENDING',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Array of participant staff IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  participantIds?: number[];
}
