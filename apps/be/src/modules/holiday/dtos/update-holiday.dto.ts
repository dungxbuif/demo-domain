import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export default class UpdateHolidayDto {
  @ApiProperty({
    example: '2026-01-01',
    description: 'Holiday date in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    example: 'New Year',
    description: 'Holiday name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
