import { PartialType } from '@nestjs/mapped-types';
import { IUpdatePenaltyDto, PenaltyStatus } from '@qnoffice/shared';
import { IsEnum, IsOptional } from 'class-validator';
import { CreatePenaltyDto } from './create-penalty.dto';

export class UpdatePenaltyDto
  extends PartialType(CreatePenaltyDto)
  implements IUpdatePenaltyDto
{
  @IsEnum(PenaltyStatus)
  @IsOptional()
  status?: PenaltyStatus;
}
