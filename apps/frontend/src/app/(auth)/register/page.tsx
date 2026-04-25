'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z
    .string()
    .min(8, 'En az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az 1 büyük harf içermeli')
    .regex(/[a-z]/, 'En az 1 küçük harf içermeli')
    .regex(/[0-9]/, 'En az 1 rakam içermeli')
    .regex(/[.?!@#$%^&*]/, 'En az 1 özel karakter içermeli (.?!@#...)'),
  firstName: z.string().min(1, 'Ad zorunludur'),
  lastName: z.string().min(1, 'Soyad zorunludur'),
  phone: z.string().optional(),
  role: z.enum(['CLIENT', 'PSYCHOLOGIST']),
  kvkk: z.literal(true, { errorMap: () => ({ message: 'KVKK metnini kabul etmelisiniz' }) }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CLIENT' },
  });

  const onSubmit = async ({ kvkk: _kvkk, ...rest }: FormData) => {
    try {
      await registerUser(rest);
      toast.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
      router.push('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Kayıt başarısız';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-calm-50 flex items-center justify-center px-4 py-8">
      <div className="card max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-800">PsikoTakip</h1>
          <p className="text-gray-500 mt-1">Yeni hesap oluşturun</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input className="input-field" placeholder="Ad" {...register('firstName')} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input className="input-field" placeholder="Soyad" {...register('lastName')} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input type="email" className="input-field" placeholder="ornek@email.com" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input type="password" className="input-field" placeholder="Şifrenizi girin" {...register('password')} />
            {errors.password ? (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            ) : (
              <ul className="mt-1.5 space-y-0.5">
                {[
                  'En az 8 karakter',
                  '1 büyük harf (A-Z)',
                  '1 küçük harf (a-z)',
                  '1 rakam (0-9)',
                  '1 özel karakter (.?!@#...)',
                ].map(rule => (
                  <li key={rule} className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="text-gray-300">•</span> {rule}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon <span className="text-gray-400">(opsiyonel)</span></label>
            <input className="input-field" placeholder="+905551234567" {...register('phone')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
            <select className="input-field" {...register('role')}>
              <option value="CLIENT">Danışan</option>
              <option value="PSYCHOLOGIST">Psikolog</option>
            </select>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="kvkk"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 accent-primary-600 flex-shrink-0 cursor-pointer"
              {...register('kvkk')}
            />
            <label htmlFor="kvkk" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
              <Link href="/kvkk" target="_blank" className="text-primary-600 hover:underline font-medium">
                KVKK Aydınlatma Metni
              </Link>
              {"'ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum."}
            </label>
          </div>
          {errors.kvkk && <p className="text-red-500 text-xs -mt-2">{errors.kvkk.message}</p>}

          <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-primary-600 hover:underline font-medium">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
