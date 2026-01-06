import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateCycleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Cycle type (OPENTALK or CLEANING)' })
  @IsString()
  type: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
