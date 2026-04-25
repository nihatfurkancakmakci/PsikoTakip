import Link from 'next/link';

export const metadata = { title: 'KVKK Aydınlatma Metni – PsikoTakip' };

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KVKK Aydınlatma Metni</h1>
          <p className="text-sm text-gray-500 mt-1">Son güncelleme: Nisan 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">1. Veri Sorumlusu</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            PsikoTakip uygulaması kapsamında kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu
            ("KVKK") uyarınca <strong>PsikoTakip Yazılım Ekibi</strong> tarafından işlenmektedir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">2. İşlenen Kişisel Veriler</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Kimlik bilgileri: ad, soyad</li>
            <li>İletişim bilgileri: e-posta adresi, telefon numarası</li>
            <li>Sağlık verileri: psikolojik test sonuçları, seans notları (yalnızca ilgili psikolog tarafından erişilebilir)</li>
            <li>İşlem bilgileri: randevu geçmişi, oturum açma kayıtları</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Randevu oluşturma ve yönetme hizmetinin sağlanması</li>
            <li>Psikolog-danışan iletişiminin kolaylaştırılması</li>
            <li>Psikolojik test atama ve sonuç takibi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Bilgi güvenliğinin sağlanması</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">4. Kişisel Verilerin Aktarılması</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Kişisel verileriniz; randevunuzu gerçekleştiren psikolog ile paylaşılmakta, yasal zorunluluk
            halinde ilgili kamu kurum ve kuruluşlarına aktarılmaktadır. Üçüncü taraf reklam veya pazarlama
            amaçlı herhangi bir aktarım yapılmamaktadır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">5. Kişisel Verilerin Saklanma Süresi</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Verileriniz, hizmet ilişkisinin sona ermesinden itibaren yasal saklama süreleri (5 yıl) boyunca
            muhafaza edilmekte; süre sonunda güvenli biçimde silinmektedir. Hesabınızı sildiğinizde kişisel
            verileriniz anonimleştirilerek sistemden kaldırılır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">6. Haklarınız (KVKK Madde 11)</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
            <li>KVKK'nın 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkması durumunda itiraz etme</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">7. Güvenlik</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Sağlık verileriniz (seans notları, test sonuçları) AES-256 şifreleme ile korunmaktadır.
            Sistemimiz HTTPS üzerinden hizmet vermekte; şifreler bcrypt ile hashlenmektedir.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Sorularınız için: <span className="text-primary-600">psikotakip@example.com</span>
          </p>
          <Link href="/register" className="text-sm text-primary-600 hover:underline font-medium">
            ← Kayıt formuna dön
          </Link>
        </div>
      </div>
    </div>
  );
}
