import { ICreatePenaltyDto } from '@qnoffice/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatePenaltyProofDto } from './create-penalty-proof.dto';

export class CreatePenaltyDto implements ICreatePenaltyDto {
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @IsNumber()
  @IsNotEmpty()
  penaltyTypeId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number; // If not provided, use penalty type's default amount

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePenaltyProofDto)
  @IsOptional()
  proofs?: CreatePenaltyProofDto[];
}
