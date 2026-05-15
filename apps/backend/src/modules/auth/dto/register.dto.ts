import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  ALLOWED_EMAIL_REGEX,
  STRONG_PASSWORD_REGEX,
  TURKISH_MOBILE_PHONE_REGEX,
  normalizeTurkishMobilePhone,
} from '../../../common/validation/auth-validation';

export class RegisterDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  @Matches(ALLOWED_EMAIL_REGEX, { message: 'Desteklenen bir e-posta domaini girin' })
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(STRONG_PASSWORD_REGEX, {
    message:
      'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter içermeli; tekrar eden veya sıralı karakterler içermemelidir',
  })
  password: string;

  @ApiProperty({ example: 'Ahmet' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+905551234567' })
  @Transform(({ value }) => (typeof value === 'string' ? normalizeTurkishMobilePhone(value) : value))
  @IsString()
  @Matches(TURKISH_MOBILE_PHONE_REGEX, {
    message: 'Telefon numarası +90 ile başlayan 10 haneli mobil numara olmalıdır',
  })
  phone: string;

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: '2000-01-15' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ enum: [Role.CLIENT], default: Role.CLIENT })
  @IsEnum([Role.CLIENT], { message: 'Kamuya açık kayıt yalnızca danışan hesabı oluşturabilir' })
  @IsOptional()
  role?: Role;
}
