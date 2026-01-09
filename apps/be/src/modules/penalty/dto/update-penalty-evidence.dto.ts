import { IUpdatePenaltyEvidenceDto } from '@qnoffice/shared';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePenaltyEvidenceDto implements IUpdatePenaltyEvidenceDto {
  @IsArray()
  @IsString({ each: true })
  evidenceUrls: string[];

  @IsString()
  @IsOptional()
  reason?: string;
}
