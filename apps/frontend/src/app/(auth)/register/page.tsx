'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Brain, User, Mail, Lock, Phone, Users, ArrowRight, Check } from 'lucide-react';

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

const passwordRules = [
  'En az 8 karakter',
  '1 büyük harf (A-Z)',
  '1 küçük harf (a-z)',
  '1 rakam (0-9)',
  '1 özel karakter (.?!@#...)',
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CLIENT' },
  });

  const onSubmit = async ({ kvkk: _kvkk, ...rest }: FormData) => {
    try {
      await registerUser(rest);
      toast.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
      router.push('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Kayıt başarısız';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Hesap oluşturun</h1>
          <p className="text-slate-500 text-sm">PsikoTakip'e katılın</p>
        </div>

        <div className="card shadow-md border-slate-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Ad</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input className="input-field pl-10" placeholder="Adınız" {...register('firstName')} />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Soyad</label>
                <input className="input-field" placeholder="Soyadınız" {...register('lastName')} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="email" className="input-field pl-10" placeholder="ornek@email.com" {...register('email')} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="password" className="input-field pl-10" placeholder="Güçlü bir şifre girin" {...register('password')} />
              </div>
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  {passwordRules.map((rule) => (
                    <span key={rule} className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                      {rule}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="label">
                Telefon <span className="text-slate-400 font-normal">(opsiyonel)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input className="input-field pl-10" placeholder="+905551234567" {...register('phone')} />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="label">Hesap Türü</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select className="input-field pl-10 appearance-none bg-white" {...register('role')}>
                  <option value="CLIENT">Danışan</option>
                  <option value="PSYCHOLOGIST">Psikolog</option>
                </select>
              </div>
            </div>

            {/* KVKK */}
            <div className="flex items-start gap-3 p-3.5 bg-primary-50 rounded-xl border border-primary-100">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  id="kvkk"
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 accent-primary-600 cursor-pointer"
                  {...register('kvkk')}
                />
              </div>
              <label htmlFor="kvkk" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
                <Link href="/kvkk" target="_blank" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
                {"'ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum."}
              </label>
            </div>
            {errors.kvkk && <p className="text-red-500 text-xs -mt-2">{errors.kvkk.message}</p>}

            <button type="submit" className="btn-primary w-full py-3 text-[15px]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                <>
                  Kayıt Ol
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
