import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class ManualSwapDto {
  @ApiProperty()
  @IsNumber()
  assignment1Id: number;

  @ApiProperty()
  @IsNumber()
  assignment2Id: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  additionalAffectedAssignments?: number[];
}
