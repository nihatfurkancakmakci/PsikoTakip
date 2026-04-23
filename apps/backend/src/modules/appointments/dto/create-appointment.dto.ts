import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionType } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  psychologistId: string;

  @ApiProperty({ example: '2026-04-25T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-04-25T11:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ enum: SessionType, default: SessionType.IN_PERSON })
  @IsEnum(SessionType)
  sessionType: SessionType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
