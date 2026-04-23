import { IsString, IsArray, IsNumber, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitTestDto {
  @ApiProperty({ description: 'Test sonucu ID' })
  @IsString()
  testResultId: string;

  @ApiProperty({ description: 'Cevaplar dizisi (0-3 arası tam sayı)', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  answers: number[];
}
