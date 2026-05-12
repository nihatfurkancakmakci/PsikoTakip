export const ALLOWED_EMAIL_DOMAINS = [
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

export const ALLOWED_EMAIL_REGEX = new RegExp(
  `^[A-Z0-9._%+-]+@(${ALLOWED_EMAIL_DOMAINS.map((domain) => domain.replace('.', '\\.')).join('|')})$`,
  'i',
);

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])(?!.*(.)\1{3,})(?!.*(?:0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)).{8,}$/i;

export const TURKISH_MOBILE_PHONE_REGEX = /^\+905\d{9}$/;

export function normalizeTurkishMobilePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('90') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  return `+90${local}`;
}
