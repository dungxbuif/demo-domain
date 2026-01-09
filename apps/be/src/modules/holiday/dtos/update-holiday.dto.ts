import { ApiProperty } from '@nestjs/swagger';
import { IUpdateHolidayDto } from '@qnoffice/shared';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export default class UpdateHolidayDto implements IUpdateHolidayDto {
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
