import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-calm-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary-800 mb-4">PsikoTakip</h1>
          <p className="text-xl text-gray-600">
            KVKK uyumlu, çoklu psikolog destekli psikoloji klinik yönetim platformu
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div className="card text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Psikologlar İçin</h3>
            <ul className="space-y-1">
              <li>✓ Randevu yönetimi</li>
              <li>✓ Seans notu (AES-256)</li>
              <li>✓ Psikolojik test atama</li>
              <li>✓ Danışan ilerleme grafikleri</li>
            </ul>
          </div>
          <div className="card text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Danışanlar İçin</h3>
            <ul className="space-y-1">
              <li>✓ Online randevu alma</li>
              <li>✓ Test çözme</li>
              <li>✓ İlerleme takibi</li>
              <li>✓ Güvenli portal</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary px-8 py-3">
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="bg-white border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </main>
  );
}
