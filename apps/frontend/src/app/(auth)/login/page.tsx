'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Brain, CheckCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { emailSchema } from '@/lib/auth-validation';

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre zorunludur'),
});

type FormData = z.infer<typeof schema>;

const features = [
  'Randevu yönetimi ve hatırlatıcılar',
  'Güvenli seans notları ve raporlar',
  'Psikolojik test değerlendirmeleri',
  'KVKK uyumlu veri güvenliği',
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Hoş geldiniz, ${user.firstName}!`);
      if (user.role === 'ADMIN') router.push('/admin');
      else if (user.role === 'PSYCHOLOGIST') router.push('/psychologist');
      else router.push('/client');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Giriş başarısız';
      toast.error(msg);
      reset({ email: data.email, password: '' });
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-surface-900 relative overflow-hidden flex-col">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[360px] h-[360px] bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-primary-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/40">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">PsikoTakip</span>
          </div>

          {/* Main heading */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white leading-snug mb-4">
              Psikoloji pratiğinizi
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-violet-300">
                dijital dünyaya taşıyın
              </span>
            </h2>
            <p className="text-slate-400 text-base mb-12 max-w-sm leading-relaxed">
              Randevularınızı, test sonuçlarınızı ve danışan notlarınızı tek platformda yönetin.
            </p>

            <div className="space-y-3.5">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-primary-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs">© 2025 PsikoTakip · KVKK Uyumlu</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-[400px] animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">PsikoTakip</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1.5">Tekrar hoş geldiniz</h1>
            <p className="text-slate-500 text-sm">Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">E-posta adresi</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="ornek@email.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end -mt-1">
              <Link
                href="/forgot-password"
                className="text-xs text-slate-500 hover:text-primary-600 transition-colors"
              >
                Şifremi unuttum
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-[15px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-7">
            Hesabınız yok mu?{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
