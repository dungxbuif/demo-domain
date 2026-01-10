import { ISubmitSlideDto, OpentalkSlideType } from '@qnoffice/shared';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
export class SubmitSlideDto implements ISubmitSlideDto {
  @IsNumber()
  eventId: number;

  @IsString()
  slidesUrl: string;

  @IsOptional()
  @IsEnum(OpentalkSlideType)
  type?: OpentalkSlideType;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}
