import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import {
  ALLOWED_EMAIL_REGEX,
  STRONG_PASSWORD_REGEX,
  TURKISH_MOBILE_PHONE_REGEX,
  normalizeTurkishMobilePhone,
} from '../../../common/validation/auth-validation';

export class CreatePsychologistDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  @Matches(ALLOWED_EMAIL_REGEX, { message: 'Desteklenen bir e-posta domaini girin' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(STRONG_PASSWORD_REGEX, {
    message:
      'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter içermeli; tekrar eden veya sıralı karakterler içermemelidir',
  })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @Transform(({ value }) => (typeof value === 'string' ? normalizeTurkishMobilePhone(value) : value))
  @IsString()
  @Matches(TURKISH_MOBILE_PHONE_REGEX, {
    message: 'Telefon numarası +90 ile başlayan 10 haneli mobil numara olmalıdır',
  })
  phone: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}
