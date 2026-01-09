import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateSwapRequestDto } from '@qnoffice/shared';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export default class CreateSwapRequestDto implements ICreateSwapRequestDto {
  @ApiProperty({
    example: 1,
    description: 'OpenTalk schedule ID to swap',
  })
  @IsNotEmpty()
  @IsNumber()
  scheduleId: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Target staff ID to swap with (optional)',
  })
  @IsOptional()
  @IsNumber()
  targetStaffId?: number;

  @ApiProperty({
    example: 'I have an important meeting on that day',
    description: 'Reason for swap request',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
