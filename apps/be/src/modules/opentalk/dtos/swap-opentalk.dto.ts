import { ApiProperty } from '@nestjs/swagger';
import { ISwapOpentalkDto } from '@qnoffice/shared';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SwapOpentalkDto implements ISwapOpentalkDto {
  @ApiProperty({ description: 'First event ID' })
  @IsNotEmpty()
  @IsNumber()
  event1Id: number;

  @ApiProperty({ description: 'Second event ID' })
  @IsNotEmpty()
  @IsNumber()
  event2Id: number;
}
