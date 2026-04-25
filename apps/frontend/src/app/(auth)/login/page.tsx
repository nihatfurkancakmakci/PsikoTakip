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
  password: z.string().min(1, 'Şifre zorunludur'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Hoş geldiniz, ${user.firstName}!`);

      if (user.role === 'ADMIN') router.push('/admin');
      else if (user.role === 'PSYCHOLOGIST') router.push('/psychologist');
      else router.push('/client');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Giriş başarısız';
      toast.error(msg);
      reset({ email: data.email, password: data.password });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-calm-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-800">PsikoTakip</h1>
          <p className="text-gray-500 mt-1">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-primary-600 hover:underline font-medium">
              Kayıt olun
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link href="/forgot-password" className="text-gray-500 hover:underline">
              Şifremi unuttum
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
