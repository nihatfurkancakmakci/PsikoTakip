'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Suspense } from 'react';
import { passwordChecks, passwordSchema, passwordScore } from '@/lib/auth-validation';

const schema = z.object({
  password: passwordSchema,
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

function PasswordMeter({ password }: { password: string }) {
  const score = passwordScore(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full transition-all ${score < 4 ? 'bg-red-500' : score < 7 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.max(1, score) * (100 / passwordChecks.length)}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {passwordChecks.map((rule) => (
          <span key={rule.label} className={`text-xs ${rule.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
            {rule.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const watchedPassword = watch('password') ?? '';

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Geçersiz bağlantı');
      return;
    }
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      toast.success('Şifreniz başarıyla sıfırlandı!');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Geçersiz veya süresi dolmuş bağlantı');
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600">Geçersiz bağlantı. Lütfen şifre sıfırlama talebini tekrarlayın.</p>
        <a href="/forgot-password" className="btn-primary inline-block px-6">Tekrar dene</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
        <input
          type="password"
          className="input-field"
          placeholder="Güçlü bir şifre girin"
          {...register('password')}
        />
        <PasswordMeter password={watchedPassword} />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
        <input
          type="password"
          className="input-field"
          placeholder="Şifrenizi tekrar girin"
          {...register('confirm')}
        />
        {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
        {isSubmitting ? 'Sıfırlanıyor...' : 'Şifremi Sıfırla'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-calm-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-800">PsikoTakip</h1>
          <p className="text-gray-500 mt-1">Yeni şifrenizi belirleyin</p>
        </div>

        <Suspense fallback={<p className="text-center text-gray-400">Yükleniyor...</p>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-primary-600 hover:underline font-medium">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}
