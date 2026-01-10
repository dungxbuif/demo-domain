import { IsNotEmpty, IsString } from 'class-validator';

export class RejectSlideDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
