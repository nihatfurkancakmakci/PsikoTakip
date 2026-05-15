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
import { ArrowRight, Brain, Check, Loader2, Lock, Mail, Phone, User, X, Calendar } from 'lucide-react';

const schema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1, 'Ad zorunludur'),
  lastName: z.string().trim().min(1, 'Soyad zorunludur'),
  phone: phoneSchema,
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
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
    defaultValues: { kvkk: false as unknown as true, gender: '' },
  });

  const password = watch('password') ?? '';
  const score = passwordScore(password);

  const onSubmit = async ({ kvkk: _kvkk, ...rest }: FormData) => {
    try {
      await registerUser(rest);
      toast.success('Kayıt başarılı. Lütfen giriş yapın.');
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
          <p className="text-slate-500 text-sm">Danışan hesabınızla PsikoTakip&apos;e katılın</p>
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

            {/* Cinsiyet ve Doğum Tarihi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cinsiyet</label>
                <select className="input-field" {...register('gender')}>
                  <option value="">Belirtmek istemiyorum</option>
                  <option value="MALE">Erkek</option>
                  <option value="FEMALE">Kadın</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>
              <div>
                <label className="label">Doğum Tarihi</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    className="input-field pl-10"
                    max={new Date().toISOString().split('T')[0]}
                    {...register('dateOfBirth')}
                  />
                </div>
              </div>
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
                6698 sayılı KVKK Aydınlatma Metni&apos;ni okudum ve kabul ediyorum.
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
              <p className="font-semibold text-slate-800">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni</p>
              <p className="text-xs text-slate-500">7 Nisan 2016 tarih ve 29677 sayılı Resmî Gazete&apos;de yayımlanan kanun uyarınca</p>
              <p><strong>Veri Sorumlusu:</strong> PsikoTakip Psikolog Yönetim Sistemi</p>
              <p><strong>1. İşlenen Kişisel Veri Kategorileri (KVKK m.3)</strong><br />
                Kimlik bilgileri (ad, soyad, doğum tarihi, cinsiyet), iletişim bilgileri (e-posta, telefon), <u>özel nitelikli kişisel veriler</u> (KVKK m.6 kapsamında sağlık verileri: seans notları, psikolojik test sonuçları), işlem güvenliği bilgileri (oturum açma kayıtları, IP adresi, erişim logları) işlenmektedir.</p>
              <p><strong>2. Hukuki Sebepler (KVKK m.5 ve m.6)</strong><br />
                <strong>m.5/2-c:</strong> Sözleşmenin kurulması veya ifası (randevu hizmeti).<br />
                <strong>m.5/2-ç:</strong> Hukuki yükümlülük (yasal saklama süreleri).<br />
                <strong>m.5/2-f:</strong> Meşru menfaat (sistem güvenliği).<br />
                <strong>m.6/2:</strong> Sağlık verileri için ilgili kişinin açık rızası.</p>
              <p><strong>3. Verilerin Aktarılması (KVKK m.8-9)</strong><br />
                Kişisel verileriniz yalnızca ilgili psikologunuza, yasal zorunluluk halinde yetkili kamu kurumlarına ve teknik altyapı sağlayıcılarına (bulut veritabanı, e-posta servisi) aktarılmaktadır. Sağlık verileriniz AES-256 şifreleme ile korunmaktadır. Üçüncü taraf reklam veya pazarlama amaçlı aktarım yapılmamaktadır.</p>
              <p><strong>4. Saklama Süresi (KVKK m.7)</strong><br />
                Verileriniz hizmet ilişkisi süresince; sağlık verileri ilişki sonrasında 5 yıl boyunca yasal yükümlülükler gereği saklanmaktadır. Süre sonunda Crypto-Shredding yöntemiyle imha edilmektedir.</p>
              <p><strong>5. Haklarınız (KVKK m.11)</strong><br />
                Kişisel verilerinizin işlenip işlenmediğini öğrenme; işlenmişse bilgi talep etme; işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme; yurt içi/yurt dışı aktarım yapılan üçüncü kişileri bilme; düzeltilmesini isteme; silinmesini veya yok edilmesini isteme; üçüncü kişilere bildirilmesini isteme; otomatik analiz sonucu aleyhinize bir sonuca itiraz etme; kanuna aykırı işleme sebebiyle zarara uğranılması halinde tazminat talep etme haklarına sahipsiniz.</p>
              <p><strong>6. Başvuru (KVKK m.13)</strong><br />
                Hesabınız üzerinden &quot;Verilerimi İndir&quot; ve &quot;Hesabımı Sil&quot; seçeneklerini kullanabilirsiniz. Detaylı başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. Başvurunuzun reddedilmesi halinde KVKK m.14 uyarınca Kişisel Verileri Koruma Kurulu&apos;na şikâyette bulunabilirsiniz.</p>
              <p className="text-xs text-slate-400 mt-4 p-2 bg-slate-50 rounded-lg">İşbu aydınlatma metni, 6698 sayılı KVKK, Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ ve Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik hükümlerine uygun olarak hazırlanmıştır.</p>
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
