import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSwapRequestDto {
  @ApiProperty({ description: 'Request type' })
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  assignmentId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  targetStaffId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  targetAssignmentId?: number;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class ReviewRequestDto {
  @ApiProperty()
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
