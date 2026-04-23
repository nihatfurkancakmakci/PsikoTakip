# Faz 2: Teknik Mimari ve Altyapı

## Goal
Tasarım raporundaki hedef mimariyi (Next.js + NestJS + Supabase + Prisma) üretime hazır bir teknik temel olarak kurmak.

## Tasks
- [ ] Monorepo/repo yapısını FE-BE ayrımıyla netleştir ve standart klasör yapısı kur → Verify: proje ağacı ekip standardına göre oluştu.
- [ ] Backend’de Clean/Onion katmanlarını modül bazlı başlat (auth, users, appointments, tests, admin) → Verify: modül iskeleti ve DI bağımlılıkları ayağa kalktı.
- [ ] Frontend’de App Router, layout, route guard ve temel dashboard iskeletini kur → Verify: rol bazlı yönlendirme çalışan demo akışı var.
- [ ] PostgreSQL + Prisma şemasını ER modeline göre kur (users, appointments, session_notes, tests, test_results, notifications, audit_logs) → Verify: migration başarıyla çalıştı.
- [ ] JWT + Refresh Token + RBAC guard mekanizmasını endpoint seviyesinde uygula → Verify: yetkisiz erişimler 401/403 ile engelleniyor.
- [ ] CI temel hattını ekle (lint, test, build) ve branch koruma kuralları tanımla → Verify: PR açıldığında pipeline zorunlu kontrolleri çalışıyor.
- [ ] Ortam yönetimini güvenli hale getir (secret, env, key rotation planı) → Verify: `.env` repo dışında; staging/prod secret’ları platformda tanımlı.

## Done When
- [ ] Teknik temel üzerinde ekipler paralel geliştirme yapabiliyor.
- [ ] Mimari katman sorumlulukları ihlal edilmeden kod üretiliyor.
- [ ] Güvenlik ve veri modeli kararları dokümante edildi.

## Notes
- Şifreleme ve loglama stratejisini bu fazda netleştir; sprint sonuna bırakma.
- Test skorlama motoru için Strategy Pattern başlangıç skeleton’u erken kurulmalı.
