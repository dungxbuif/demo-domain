import { ApiProperty } from '@nestjs/swagger';
import { ICreateHolidayDto } from '@qnoffice/shared';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export default class CreateHolidayDto implements ICreateHolidayDto {
  @ApiProperty({
    example: '2026-01-01',
    description: 'Holiday date in YYYY-MM-DD format',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'New Year',
    description: 'Holiday name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
