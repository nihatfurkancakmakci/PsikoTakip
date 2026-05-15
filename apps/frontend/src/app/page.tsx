import Link from 'next/link';
import {
  Brain,
  Calendar,
  Shield,
  FileText,
  BarChart3,
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  Heart,
  Sparkles,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Randevu Yönetimi',
    desc: 'Online ve yüz yüze randevuları tek panelden yönetin, çakışma kontrolü ve otomatik hatırlatıcılar.',
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: FileText,
    title: 'Güvenli Seans Notları',
    desc: 'AES-256 şifreli seans notları ile danışan bilgilerini en üst düzey güvenlikte saklayın.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: BarChart3,
    title: 'Psikolojik Testler',
    desc: 'Beck Depresyon, Beck Anksiyete ve daha fazla standardize test atayın, otomatik skorlama alın.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
  {
    icon: BarChart3,
    title: 'İlerleme Grafikleri',
    desc: 'Danışanların test sonuçlarını zaman serisi grafikleriyle takip edin, gelişimi görselleştirin.',
    color: 'from-sky-500 to-cyan-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Users,
    title: 'Çoklu Psikolog Desteği',
    desc: 'Birden fazla psikolog aynı sistemde çalışabilir, admin panelinden tüm klinik yönetilebilir.',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
  },
  {
    icon: Shield,
    title: 'KVKK Uyumlu',
    desc: 'Kişisel verilerin korunması kanununa tam uyumlu altyapı, veri dışa aktarma ve silme hakları.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
  },
];

const steps = [
  {
    num: '01',
    title: 'Hesap Oluşturun',
    desc: 'Danışan olarak kayıt olun veya admin tarafından psikolog hesabınız oluşturulsun.',
    icon: Users,
  },
  {
    num: '02',
    title: 'Randevu Alın',
    desc: 'Uygun psikologu seçin, müsait saatleri görüntüleyin ve randevunuzu oluşturun.',
    icon: Calendar,
  },
  {
    num: '03',
    title: 'Takibi Başlatın',
    desc: 'Seans notları, psikolojik testler ve ilerleme grafikleriyle terapi sürecinizi yönetin.',
    icon: BarChart3,
  },
];

const stats = [
  { value: '256', label: 'Bit AES Şifreleme', icon: Lock },
  { value: '7/24', label: 'Erişim', icon: Clock },
  { value: '%100', label: 'KVKK Uyumlu', icon: Shield },
  { value: '3+', label: 'Psikolojik Test', icon: Sparkles },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">PsikoTakip</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-primary-600 transition-colors">Özellikler</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-primary-600 transition-colors">Nasıl Çalışır</a>
            <a href="#security" className="text-sm text-slate-600 hover:text-primary-600 transition-colors">Güvenlik</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors px-4 py-2">
              Giriş Yap
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-5">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-100/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-primary-50/30 via-transparent to-violet-50/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-xs font-semibold text-primary-700">KVKK Uyumlu Psikolog Yönetim Sistemi</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Psikoloji Pratiğinizi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600">
                Dijital Dünyaya
              </span>{' '}
              Taşıyın
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Randevularınızı, seans notlarınızı, psikolojik testlerinizi ve danışan ilerleme grafiklerinizi
              güvenle tek platformda yönetin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-base !py-3.5 !px-8 shadow-lg shadow-primary-500/30">
                Ücretsiz Başlayın
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn-secondary text-base !py-3.5 !px-8">
                Giriş Yap
              </Link>
            </div>

            {/* Quick trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                AES-256 Şifreli
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                KVKK Uyumlu
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                JWT Auth
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-surface-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 mb-3">
                  <s.icon className="w-5 h-5 text-primary-300" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 md:py-28 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm tracking-wide uppercase">Özellikler</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
              İhtiyacınız olan her şey tek çatı altında
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Psikologlar ve danışanlar için özel olarak tasarlanmış kapsamlı yönetim araçları
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm tracking-wide uppercase">Nasıl Çalışır</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
              3 adımda başlayın
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              PsikoTakip ile terapi sürecinizi yönetmek hiç bu kadar kolay olmamıştı
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center group">
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-50 to-violet-50 border-2 border-primary-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="w-8 h-8 text-primary-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Whom ── */}
      <section className="py-20 md:py-28 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Psikologlar */}
            <div className="bg-gradient-to-br from-surface-900 to-slate-800 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                  <Heart className="w-6 h-6 text-primary-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Psikologlar İçin</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Danışan yönetimi, seans notları ve test değerlendirmelerinizi profesyonelce yönetin.
                </p>
                <ul className="space-y-3">
                  {[
                    'Randevu oluşturma ve çakışma kontrolü',
                    'AES-256 şifreli seans notları',
                    'Psikolojik test atama ve skorlama',
                    'Danışan ilerleme grafikleri',
                    'Profil ve çalışma saatleri yönetimi',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Danışanlar */}
            <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Danışanlar İçin</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Online randevu alın, testlerinizi tamamlayın ve ilerlemenizi takip edin.
                </p>
                <ul className="space-y-3">
                  {[
                    'Psikolog seçimi ve online randevu',
                    'Psikolojik test çözme',
                    'İlerleme grafiği takibi',
                    'Güvenli danışan portalı',
                    'Bildirim ve hatırlatıcılar',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section id="security" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-primary-600 via-violet-600 to-primary-700 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Güvenliğiniz Önceliğimiz
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Sağlık verileri en hassas kişisel verilerdir. PsikoTakip, endüstri standardı güvenlik
                protokolleri ile verilerinizi korur.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { title: 'AES-256 Şifreleme', desc: 'Seans notları ve sağlık verileri şifreli saklanır' },
                  { title: 'JWT Kimlik Doğrulama', desc: 'Access + Refresh token ile güvenli oturum yönetimi' },
                  { title: 'KVKK Uyumluluk', desc: 'Veri erişim, düzeltme, dışa aktarma ve silme hakları' },
                ].map((item) => (
                  <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                    <h4 className="font-bold text-white mb-1.5">{item.title}</h4>
                    <p className="text-sm text-white/70 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 bg-surface-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
            Danışan olarak kayıt olun, randevunuzu alın ve terapi sürecinizi dijital ortamda güvenle yönetmeye başlayın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base !py-3.5 !px-8 shadow-lg shadow-primary-500/30">
              Ücretsiz Kayıt Ol
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base !py-3.5 !px-8">
              Mevcut Hesabınızla Giriş Yapın
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-surface-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">PsikoTakip</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma</Link>
              <a href="#features" className="hover:text-white transition-colors">Özellikler</a>
              <a href="#security" className="hover:text-white transition-colors">Güvenlik</a>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 PsikoTakip · KVKK Uyumlu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
