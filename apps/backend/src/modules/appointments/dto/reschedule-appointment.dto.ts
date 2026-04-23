import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionType } from '@prisma/client';

export class RescheduleAppointmentDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @IsOptional()
  @IsString()
  notes?: string;
}
