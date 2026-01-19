import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePenaltyProofDto {
  @IsString()
  @IsNotEmpty()
  imageKey: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
