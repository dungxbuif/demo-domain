import { IUpdatePenaltyEvidenceDto } from '@qnoffice/shared';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePenaltyProofDto } from './create-penalty-proof.dto';

export class UpdatePenaltyEvidenceDto implements IUpdatePenaltyEvidenceDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePenaltyProofDto)
  @IsOptional()
  proofs?: CreatePenaltyProofDto[];
}
