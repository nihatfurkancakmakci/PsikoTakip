# Faz 3: Sprint Uygulama Planı (Örnek 6 Sprint)

## Goal
Must-have use-case’leri kontrollü şekilde teslim edip, her sprint sonunda çalışır artım üretmek.

## Sprint Planı
- [ ] Sprint 1: Proje iskeleti + auth temel + CI başlangıcı → Verify: register/login akışı ve pipeline çalışıyor.
- [ ] Sprint 2: Kullanıcı/rol akışları + psikolog onay süreci + profil yönetimi → Verify: admin onay/red ve rol bazlı dashboard aktif.
- [ ] Sprint 3: Randevu yaşam döngüsü (arama, slot, oluşturma, onay/red, iptal) → Verify: çakışma kontrolü + bildirim tetikleme çalışıyor.
- [ ] Sprint 4: Seans yönetimi + seans notu + gizli not erişim kuralı → Verify: yalnız psikolog gizli notu görebiliyor.
- [ ] Sprint 5: Psikolojik test atama/cevaplama/otomatik skorlama + ilerleme grafiği → Verify: skor hesaplama <2 sn, grafik çıktısı doğru.
- [ ] Sprint 6: Admin paneli, audit log, sertleştirme, regresyon, release hazırlığı → Verify: v1.0.0 release candidate üretildi.

## Paralel Çalışma Kuralı (Ekip İçin)
- [ ] FE-BE her user story için ortak API kontratı çıkarır → Verify: story başlamadan endpoint şeması net.
- [ ] QA her story için test senaryosunu sprint başında yazar → Verify: story kapanmadan test checklist tamam.
- [ ] DevOps sprint boyunca gözlemlenebilirlik metriklerini günceller → Verify: hata oranı ve response süreleri dashboard’da.

## Done When
- [ ] UC001, UC002, UC004, UC005, UC006, UC007, UC008, UC011, UC012 sorunsuz çalışıyor.
- [ ] Should-have maddelerin en az %70’i tamamlandı.
- [ ] Sprint demo çıktıları ve retrospektif aksiyonları kaydedildi.

## Notes
- Her sprint sonunda “backlog refine + teknik borç temizliği” için sabit kapasite (%15) ayır.
- Story kabul kriteri karşılanmadan “done” işaretleme yapılmamalı.
