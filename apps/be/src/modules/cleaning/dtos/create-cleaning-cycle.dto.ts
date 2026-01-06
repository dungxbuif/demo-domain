import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCleaningCycleDto {
  @ApiProperty({ description: 'Name of the cleaning cycle' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the cleaning cycle' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the cleaning cycle',
    enum: ['DRAFT', 'ACTIVE', 'COMPLETED'],
    default: 'DRAFT',
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'ACTIVE', 'COMPLETED'])
  status?: string;
}
