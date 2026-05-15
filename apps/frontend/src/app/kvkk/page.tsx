import Link from 'next/link';

export const metadata = { title: 'KVKK Aydınlatma Metni – PsikoTakip' };

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni
          </h1>
          <p className="text-sm text-gray-500 mt-1">Son güncelleme: Mayıs 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">1. Veri Sorumlusu</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            7 Nisan 2016 tarih ve 29677 sayılı Resmî Gazete&apos;de yayımlanan <strong>6698 sayılı Kişisel Verilerin Korunması Kanunu</strong> (&quot;KVKK&quot;) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>PsikoTakip Psikolog Yönetim Sistemi</strong> tarafından aşağıda açıklanan kapsamda işlenmektedir.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            İşbu aydınlatma metni, KVKK&apos;nın 10. maddesi ile <strong>Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ</strong> hükümlerine uygun olarak hazırlanmıştır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">2. İşlenen Kişisel Veri Kategorileri</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            KVKK&apos;nın 3. maddesi kapsamında aşağıdaki kişisel veri kategorileri işlenmektedir:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li><strong>Kimlik bilgileri:</strong> Ad, soyad, doğum tarihi, cinsiyet</li>
            <li><strong>İletişim bilgileri:</strong> E-posta adresi, telefon numarası</li>
            <li><strong>Özel nitelikli kişisel veriler (KVKK m.6):</strong> Psikolojik test sonuçları, seans notları, sağlık değerlendirmeleri — bu veriler KVKK&apos;nın 6. maddesi kapsamında &quot;sağlık verileri&quot; olarak özel nitelikli kişisel veri kategorisinde işlenmektedir</li>
            <li><strong>İşlem güvenliği bilgileri:</strong> Oturum açma kayıtları, IP adresi, erişim logları, işlem zaman damgaları</li>
            <li><strong>Hukuki işlem bilgileri:</strong> Randevu geçmişi, rıza ve onay kayıtları</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Kişisel verileriniz KVKK&apos;nın 5. ve 6. maddelerinde belirtilen şartlara uygun olarak aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Psikolog-danışan randevu oluşturma ve yönetme hizmetinin sağlanması</li>
            <li>Psikolojik test atama, uygulama ve otomatik skorlama işlemlerinin yürütülmesi</li>
            <li>Seans notu yönetimi ve danışan ilerleme takibi</li>
            <li>Randevu hatırlatma ve bildirim hizmetlerinin sunulması</li>
            <li>Kullanıcı kimlik doğrulama ve hesap güvenliğinin sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (KVKK m.5/2-ç)</li>
            <li>Bilgi güvenliği süreçlerinin yürütülmesi ve denetim kaydı tutulması</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">4. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Kişisel verileriniz aşağıdaki hukuki sebepler doğrultusunda işlenmektedir:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li><strong>KVKK m.5/2-c:</strong> Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması — randevu hizmeti kapsamında</li>
            <li><strong>KVKK m.5/2-ç:</strong> Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi — yasal saklama süreleri</li>
            <li><strong>KVKK m.5/2-f:</strong> Veri sorumlusunun meşru menfaatleri — sistem güvenliği ve hizmet kalitesi</li>
            <li><strong>KVKK m.6/2:</strong> Sağlık verilerinin işlenmesi — ilgili kişinin açık rızası alınmak suretiyle</li>
            <li><strong>KVKK m.5/1:</strong> İlgili kişinin açık rızası — özel nitelikli kişisel veriler için</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">5. Kişisel Verilerin Aktarılması</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            KVKK&apos;nın 8. ve 9. maddeleri uyarınca kişisel verileriniz aşağıdaki taraflara aktarılabilmektedir:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Randevunuzu gerçekleştiren <strong>psikolog</strong> ile seans ve test verileri paylaşılmaktadır</li>
            <li>Yasal zorunluluk halinde <strong>yetkili kamu kurum ve kuruluşlarına</strong> aktarılmaktadır</li>
            <li>Teknik altyapı hizmetleri kapsamında <strong>bulut hizmet sağlayıcıları</strong> (veritabanı, e-posta sunucusu) ile paylaşılmaktadır</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed">
            Sağlık verileriniz (seans notları, test sonuçları) <strong>AES-256 şifreleme</strong> ile korunmaktadır.
            Üçüncü taraf reklam veya pazarlama amaçlı herhangi bir aktarım yapılmamaktadır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">6. Kişisel Verilerin Saklanma Süresi</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            KVKK&apos;nın 7. maddesi ve <strong>Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik</strong> hükümleri doğrultusunda:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Aktif hesap verileri: Hizmet ilişkisi süresince</li>
            <li>Seans ve tedavi verileri: Hizmet ilişkisinin sona ermesinden itibaren <strong>5 (beş) yıl</strong> boyunca yasal yükümlülükler gereği</li>
            <li>Erişim ve denetim logları: <strong>5 (beş) yıl</strong> (5651 sayılı Kanun gereği)</li>
            <li>Hesap silindiğinde kişisel veriler anonimleştirilerek sistemden kaldırılır</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed">
            Saklama süresi dolan veriler, <strong>Crypto-Shredding</strong> (şifreleme anahtarının yok edilmesi) yöntemiyle geri döndürülemez şekilde imha edilmektedir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">7. Veri Sahibi Olarak Haklarınız (KVKK Madde 11)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            6698 sayılı KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li><strong>a)</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li><strong>b)</strong> Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li><strong>c)</strong> Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li><strong>ç)</strong> Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
            <li><strong>d)</strong> Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li><strong>e)</strong> KVKK&apos;nın 7. maddesi çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
            <li><strong>f)</strong> (d) ve (e) bentleri uyarınca yapılan işlemlerin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li><strong>g)</strong> İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
            <li><strong>ğ)</strong> Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğranılması hâlinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">8. Veri Güvenliği Tedbirleri</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            KVKK&apos;nın 12. maddesi uyarınca veri güvenliğini sağlamak amacıyla aşağıdaki teknik ve idari tedbirler alınmaktadır:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Sağlık verileri (seans notları, test sonuçları) <strong>AES-256-CBC</strong> şifreleme ile saklanmaktadır</li>
            <li>Kullanıcı şifreleri <strong>bcrypt</strong> algoritmasıyla hash&apos;lenerek korunmaktadır</li>
            <li>Tüm iletişim <strong>HTTPS (TLS 1.2+)</strong> protokolü üzerinden gerçekleştirilmektedir</li>
            <li>Rol Tabanlı Erişim Kontrolü (<strong>RBAC</strong>) ile yetkisiz erişim engellenmektedir</li>
            <li>Tüm kritik işlemler <strong>denetim günlüğüne (Audit Log)</strong> kaydedilmektedir</li>
            <li>Veritabanı yedekleri AES-256 ile şifrelenerek farklı coğrafi lokasyonlarda saklanmaktadır</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">9. Başvuru Yöntemi</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            KVKK&apos;nın 13. maddesi uyarınca, yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>Hesabınız üzerinden <strong>&quot;Verilerimi İndir&quot;</strong> seçeneği ile kişisel verilerinizi JSON formatında indirebilirsiniz</li>
            <li>Hesabınız üzerinden <strong>&quot;Hesabımı Sil&quot;</strong> seçeneği ile verilerinizin silinmesini/anonimleştirilmesini talep edebilirsiniz</li>
            <li>Detaylı başvurular için <strong>psikotakip@example.com</strong> adresine yazılı olarak iletebilirsiniz</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed">
            Başvurularınız, KVKK&apos;nın 13/2 maddesi gereğince, talebin niteliğine göre en kısa sürede ve en geç <strong>30 (otuz) gün</strong> içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilecektir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">10. Kişisel Verileri Koruma Kurulu&apos;na Şikâyet Hakkı</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            KVKK&apos;nın 14. maddesi uyarınca, başvurunuzun reddedilmesi, verilen cevabın yetersiz bulunması veya süresinde başvuruya cevap verilmemesi hâllerinde; cevabı öğrendiğiniz tarihten itibaren 30 gün ve herhâlde başvuru tarihinden itibaren 60 gün içinde <strong>Kişisel Verileri Koruma Kurulu&apos;na</strong> şikâyette bulunma hakkınız saklıdır.
          </p>
        </section>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
          <p className="text-xs font-semibold text-blue-800">Yasal Dayanak</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            İşbu aydınlatma metni, 7 Nisan 2016 tarih ve 29677 sayılı Resmî Gazete&apos;de yayımlanan <strong>6698 sayılı Kişisel Verilerin Korunması Kanunu</strong>, 10 Mart 2018 tarih ve 30356 sayılı Resmî Gazete&apos;de yayımlanan <strong>Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ</strong> ve <strong>Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik</strong> hükümlerine uygun olarak hazırlanmıştır.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            İletişim: <span className="text-primary-600">psikotakip@example.com</span>
          </p>
          <Link href="/register" className="text-sm text-primary-600 hover:underline font-medium">
            ← Kayıt formuna dön
          </Link>
        </div>
      </div>
    </div>
  );
}
