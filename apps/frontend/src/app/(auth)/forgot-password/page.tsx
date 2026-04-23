'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-calm-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-800">PsikoTakip</h1>
          <p className="text-gray-500 mt-1">Şifrenizi mi unuttunuz?</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <p className="text-gray-700 font-medium">E-posta gönderildi</p>
            <p className="text-sm text-gray-500">
              Hesabınız mevcutsa şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
              Lütfen gelen kutunuzu kontrol edin.
            </p>
            <Link href="/login" className="btn-primary inline-block px-6">
              Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-gray-600">
              Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                className="input-field"
                placeholder="ornek@email.com"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-primary-600 hover:underline font-medium">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}
