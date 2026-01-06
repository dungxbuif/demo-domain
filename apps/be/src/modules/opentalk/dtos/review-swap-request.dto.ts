import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SwapRequestStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export default class ReviewSwapRequestDto {
  @ApiProperty({
    enum: SwapRequestStatus,
    description: 'Approval status',
  })
  @IsNotEmpty()
  @IsEnum(SwapRequestStatus)
  status: SwapRequestStatus;

  @ApiPropertyOptional({
    example: 'Approved based on valid reason',
    description: 'Review note',
  })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
