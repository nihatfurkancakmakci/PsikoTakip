# Faz 4: Test, Güvenlik ve Uyumluluk

## Goal
Sistemi performans, güvenlik, kullanılabilirlik, erişilebilirlik ve KVKK gereksinimlerine karşı doğrulamak.

## Tasks
- [ ] Test piramidini uygula (unit, integration, e2e) ve coverage hedefini >%80 tut → Verify: CI raporunda coverage eşiği sağlandı.
- [ ] Kritik akışlar için E2E testleri yaz (kayıt, giriş, randevu, seans, test skorlama) → Verify: nightly pipeline’da yeşil.
- [ ] API doğrulama ve hata senaryolarını kontrol et (400/401/403/409/500) → Verify: negatif test seti geçti.
- [ ] Performans testlerini çalıştır (API latency, eşzamanlı kullanıcı, yük altında randevu çakışma) → Verify: hedef KPI’lar karşılandı.
- [ ] Güvenlik sertleştirmesini tamamla (Helmet, CORS, rate limit, input validation, token güvenliği) → Verify: OWASP checklist tamam.
- [ ] KVKK uyumluluk kontrolünü yap (rıza, veri erişim/silme, audit log, veri saklama) → Verify: uyumluluk checklist’i imzalandı.
- [ ] Erişilebilirlik ve kullanılabilirlik testi uygula (WCAG 2.1 AA, Lighthouse >=90, kullanıcı panel testi) → Verify: rapor çıktıları arşivlendi.

## Done When
- [ ] Kritik bulgu (P0/P1) kalmadı.
- [ ] Release öncesi kalite kapıları tamamen geçti.
- [ ] Güvenlik ve KVKK kontrolleri belgeyle kanıtlandı.

## Notes
- Güvenlik açıkları için net SLA tanımla: P0 aynı gün, P1 48 saat, P2 sprint içinde.
- Audit log’larda kullanıcı kimliği, endpoint, sonuç kodu ve zaman damgası zorunlu olmalı.
