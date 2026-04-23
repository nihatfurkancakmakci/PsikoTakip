# Faz 5: Release ve Operasyon

## Goal
v1.0.0 sürümünü güvenli şekilde yayınlamak, izlemek ve sürdürülebilir bakım döngüsünü işletmek.

## Tasks
- [ ] Release branch stratejisini uygula ve SemVer sürümleme standardını sabitle → Verify: sürüm etiketi + changelog üretildi.
- [ ] UAT (kullanıcı kabul testi) oturumu yap ve kabul tutanağını imzala → Verify: “go/no-go” kararı yazılı kayda geçti.
- [ ] Production deployment’ı kademeli yürüt (DB migrate, backend deploy, frontend deploy) → Verify: smoke testler canlıda geçti.
- [ ] Post-release gözlem planını çalıştır (error rate, latency, login/randevu başarı oranı) → Verify: ilk 24 saat metrikleri normal.
- [ ] Olay yönetimi ve rollback prosedürünü test et → Verify: rollback tatbikatı başarıyla tamamlandı.
- [ ] Operasyonel dokümantasyonu güncelle (runbook, on-call, incident template) → Verify: ekip erişebilir ve güncel doküman mevcut.
- [ ] Sprint sonrası bakım planını başlat (hotfix akışı, teknik borç, iyileştirme backlog’u) → Verify: v1.0.x bakım takvimi yayımlandı.

## Done When
- [ ] v1.0.0 stabil ve izlenebilir şekilde production’da.
- [ ] Kritik işlevler canlı ortamda doğrulandı.
- [ ] Ekip bakım ve incident süreçlerini standardize etti.

## Notes
- Release gecesi tek noktadan karar veren “release owner” atanmalı.
- Her hotfix sonrası kısa kök neden analizi (RCA) zorunlu tutulmalı.
