import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionNoteDto {
  @ApiProperty()
  @IsString()
  appointmentId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emotionalState?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  goals?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isSharedWithClient?: boolean;
}
