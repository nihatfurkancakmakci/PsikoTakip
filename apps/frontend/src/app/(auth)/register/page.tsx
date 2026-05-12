'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  emailSchema,
  formatTurkishMobilePhone,
  passwordChecks,
  passwordSchema,
  passwordScore,
  phoneSchema,
} from '@/lib/auth-validation';
import { ArrowRight, Brain, Check, Loader2, Lock, Mail, Phone, User, X } from 'lucide-react';

const schema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1, 'Ad zorunludur'),
  lastName: z.string().trim().min(1, 'Soyad zorunludur'),
  phone: phoneSchema,
  kvkk: z.literal(true, { errorMap: () => ({ message: 'KVKK metnini kabul etmelisiniz' }) }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [kvkkOpen, setKvkkOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { kvkk: false as unknown as true },
  });

  const password = watch('password') ?? '';
  const score = passwordScore(password);

  const onSubmit = async ({ kvkk: _kvkk, ...rest }: FormData) => {
    try {
      await registerUser(rest);
      toast.success('Kayıt başarılı. Lütfen e-postanızı doğrulayın.');
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Hesap oluşturun</h1>
          <p className="text-slate-500 text-sm">Danışan hesabınızla PsikoTakip'e katılın</p>
        </div>

        <div className="card shadow-md border-slate-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div>
              <label className="label">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="email" className="input-field pl-10" placeholder="ornek@gmail.com" {...register('email')} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="password" className="input-field pl-10" placeholder="Güçlü bir şifre girin" {...register('password')} />
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all ${score < 4 ? 'bg-red-500' : score < 7 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.max(1, score) * (100 / passwordChecks.length)}%` }}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                {passwordChecks.map((rule) => {
                  const valid = rule.test(password);
                  return (
                    <span key={rule.label} className={`text-xs flex items-center gap-1 ${valid ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <Check className="w-3 h-3" />
                      {rule.label}
                    </span>
                  );
                })}
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Telefon</label>
              <div className="flex gap-2">
                <select className="input-field w-24" defaultValue="+90" aria-label="Ülke kodu">
                  <option value="+90">+90</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    className="input-field pl-10"
                    inputMode="numeric"
                    placeholder="545 987 12 45"
                    {...register('phone')}
                    onChange={(event) => {
                      event.target.value = formatTurkishMobilePhone(event.target.value);
                      setValue('phone', event.target.value, { shouldValidate: true });
                    }}
                  />
                </div>
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-primary-50 rounded-xl border border-primary-100">
              <input
                type="checkbox"
                id="kvkk"
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-600 accent-primary-600 cursor-pointer"
                readOnly
                checked={watch('kvkk') === true}
                onClick={() => setKvkkOpen(true)}
                {...register('kvkk')}
              />
              <button type="button" onClick={() => setKvkkOpen(true)} className="text-left text-xs text-slate-600 leading-relaxed">
                KVKK Aydınlatma Metni'ni okuyup kabul ediyorum.
              </button>
            </div>
            {errors.kvkk && <p className="text-red-500 text-xs -mt-2">{errors.kvkk.message}</p>}

            <button type="submit" className="btn-primary w-full py-3 text-[15px]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">KVKK Aydınlatma Metni</h2>
              <button type="button" onClick={() => setKvkkOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto text-sm text-slate-600 leading-6 space-y-3">
              <p>PsikoTakip, hesap oluşturma, randevu yönetimi, danışan iletişimi ve yasal yükümlülüklerin yerine getirilmesi amacıyla kişisel verilerinizi işler.</p>
              <p>Kimlik ve iletişim bilgileriniz, sağlık verilerinizle ilişkili güvenli kayıtlar ve sistem işlem günlükleri yalnızca yetkili kullanıcılar tarafından erişilebilir şekilde saklanır.</p>
              <p>Verileriniz KVKK kapsamında açık rızanız, sözleşmenin kurulması ve kanuni yükümlülükler çerçevesinde işlenir. Hesabınız üzerinden verilerinize erişme, düzeltme, dışa aktarma ve silme haklarınızı kullanabilirsiniz.</p>
              <p>Metnin tamamını okuduğunuzu ve kişisel verilerinizin bu kapsamda işlenmesini kabul ettiğinizi onaylayarak kayıt işlemine devam edebilirsiniz.</p>
            </div>
            <div className="p-5 border-t border-slate-100">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  setValue('kvkk', true, { shouldValidate: true });
                  setKvkkOpen(false);
                }}
              >
                Okudum ve kabul ediyorum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
