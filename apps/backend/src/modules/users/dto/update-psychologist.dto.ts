import { IsString, IsOptional, IsBoolean, IsInt, Min, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePsychologistDto {
  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Eğitim bilgileri' })
  @IsString()
  @IsOptional()
  educationInfo?: string;

  @ApiPropertyOptional({ description: 'Deneyim süresi (yıl)', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Sertifikalar (JSON array string)' })
  @IsString()
  @IsOptional()
  certificates?: string;

  @ApiPropertyOptional()
  @IsOptional()
  workingHours?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAcceptingClients?: boolean;
}
