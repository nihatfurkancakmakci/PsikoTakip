import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTestDto {
  @ApiProperty({ description: 'Danışan kullanıcı ID' })
  @IsString()
  clientUserId: string;

  @ApiProperty({ description: 'Test ID (psychological_tests tablosundan)' })
  @IsString()
  testId: string;
}
