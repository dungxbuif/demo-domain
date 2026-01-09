import { ApiProperty } from '@nestjs/swagger';
import { ICreateHolidaysRangeDto } from '@qnoffice/shared';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export default class CreateHolidaysRangeDto implements ICreateHolidaysRangeDto {
  @ApiProperty({
    example: '2026-01-01',
    description: 'Start date of holiday range in YYYY-MM-DD format',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-01-05',
    description: 'End date of holiday range in YYYY-MM-DD format',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 'New Year Holiday',
    description: 'Holiday name (applied to all dates in range)',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
