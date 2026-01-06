import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SwapRequestStatus } from '../entities/schedule-swap-request.entity';

export class CreateSwapRequestDto {
  @IsInt()
  fromAssignmentId: number;

  @IsInt()
  requesterStaffId: number;

  @IsOptional()
  @IsInt()
  targetStaffId?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewSwapRequestDto {
  @IsEnum(SwapRequestStatus)
  status: SwapRequestStatus.APPROVED | SwapRequestStatus.REJECTED;

  @IsInt()
  reviewedByStaffId: number;

  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @IsOptional()
  @IsInt()
  newAssignmentId?: number;
}

export class QuerySwapRequestDto {
  @IsOptional()
  @IsEnum(SwapRequestStatus)
  status?: SwapRequestStatus;

  @IsOptional()
  @IsInt()
  requesterStaffId?: number;

  @IsOptional()
  @IsInt()
  definitionId?: number;
}
