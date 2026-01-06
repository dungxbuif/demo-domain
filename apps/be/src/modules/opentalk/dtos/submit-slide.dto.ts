import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class SubmitSlideDto {
  @ApiProperty({
    example: 'Introduction to NestJS',
    description: 'OpenTalk topic',
  })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({
    example: 'https://example.com/slides.pdf',
    description: 'Slide URL',
  })
  @IsNotEmpty()
  @IsString()
  slideUrl: string;
}
