import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class SwapOpentalkDto {
  @ApiProperty({ description: 'First event ID' })
  @IsNotEmpty()
  @IsNumber()
  event1Id: number;

  @ApiProperty({ description: 'Second event ID' })
  @IsNotEmpty()
  @IsNumber()
  event2Id: number;

  @ApiProperty({
    description: 'Participant IDs to swap from event1 to event2',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  participantsFrom1to2: number[];

  @ApiProperty({
    description: 'Participant IDs to swap from event2 to event1',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  participantsFrom2to1: number[];
}
