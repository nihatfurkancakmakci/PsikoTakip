import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePsychologistDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiPropertyOptional()
  @IsUrl()
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

  @ApiPropertyOptional({ description: 'Sertifikalar (virgülle ayrılmış)' })
  @IsString()
  @IsOptional()
  certificates?: string;

  @ApiPropertyOptional()
  @IsOptional()
  workingHours?: Record<string, unknown>;

  @ApiPropertyOptional({ minimum: 30, maximum: 120 })
  @IsInt()
  @Min(30)
  @Max(120)
  @IsOptional()
  sessionDurationMin?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAcceptingClients?: boolean;
}
