import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class UpdateSubjectDto {
  @ApiProperty({
    description: 'The new topic/subject for the OpenTalk',
    example: 'Introduction to Microservices Architecture',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
