import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IReviewSwapRequestDto, SwapRequestStatus } from '@qnoffice/shared';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class ReviewSwapRequestDto implements IReviewSwapRequestDto {
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
