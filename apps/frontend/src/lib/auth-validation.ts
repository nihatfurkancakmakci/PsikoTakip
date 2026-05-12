import { z } from 'zod';

export const allowedEmailDomains = [
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'yandex.com',
  'yandex.com.tr',
  'psikotakip.com',
];

const allowedEmailRegex = new RegExp(
  `^[A-Z0-9._%+-]+@(${allowedEmailDomains.map((domain) => domain.replace('.', '\\.')).join('|')})$`,
  'i',
);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Geçerli bir e-posta girin')
  .regex(allowedEmailRegex, 'Desteklenen bir e-posta domaini girin');

export const passwordChecks = [
  { label: 'En az 8 karakter', test: (value: string) => value.length >= 8 },
  { label: '1 büyük harf', test: (value: string) => /[A-ZÇĞİÖŞÜ]/.test(value) },
  { label: '1 küçük harf', test: (value: string) => /[a-zçğıöşü]/.test(value) },
  { label: '1 rakam', test: (value: string) => /\d/.test(value) },
  { label: '1 özel karakter', test: (value: string) => /[^\w\s]/.test(value) },
  { label: 'Tekrarlı karakter yok', test: (value: string) => !/(.)\1{3,}/.test(value) },
  {
    label: '1234 gibi sıralı ifade yok',
    test: (value: string) =>
      !/(0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i.test(
        value,
      ),
  },
];

export const passwordSchema = z
  .string()
  .min(8, 'En az 8 karakter olmalı')
  .refine((value) => passwordChecks.every((check) => check.test(value)), {
    message: 'Şifre kuralların tamamını karşılamalı',
  });

export function passwordScore(password: string) {
  return passwordChecks.filter((check) => check.test(password)).length;
}

export function normalizeTurkishMobilePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('90') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  return local.slice(0, 10);
}

export function formatTurkishMobilePhone(value: string) {
  const local = normalizeTurkishMobilePhone(value);
  return [local.slice(0, 3), local.slice(3, 6), local.slice(6, 8), local.slice(8, 10)]
    .filter(Boolean)
    .join(' ');
}

export const phoneSchema = z
  .string()
  .transform((value) => normalizeTurkishMobilePhone(value))
  .refine((value) => /^5\d{9}$/.test(value), 'Telefon 5 ile başlayan 10 haneli mobil numara olmalı')
  .transform((value) => `+90${value}`);
