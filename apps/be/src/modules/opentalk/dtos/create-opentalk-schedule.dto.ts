import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export default class CreateOpentalkScheduleDto {
  @ApiProperty({
    example: '2026-01-11',
    description: 'OpenTalk date in YYYY-MM-DD format (Saturday)',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 1,
    description: 'Staff ID',
  })
  @IsNotEmpty()
  @IsNumber()
  staffId: number;
}
