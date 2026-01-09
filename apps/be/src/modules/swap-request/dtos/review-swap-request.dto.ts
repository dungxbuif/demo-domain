import { IReviewSwapRequestDto, SwapRequestStatus } from '@qnoffice/shared';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewSwapRequestDto implements IReviewSwapRequestDto {
  @IsEnum(SwapRequestStatus)
  status: SwapRequestStatus;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
