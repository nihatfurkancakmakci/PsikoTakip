# PsikoTakip Uygulama Master Planı

## Goal
`raporfinal.docx` (gereksinim) ve `TASARIM_RAPOR_PLANI_PsikologYönetimSistemi.docx` (tasarım) ile uyumlu, ekip bazlı ve sprint odaklı bir geliştirme yürütme planı sağlamak.

## Kapsam Özeti
- Ürün: Psikolog Yönetim Sistemi (PsikoTakip), web tabanlı.
- Roller: Misafir, Danışan, Psikolog, Admin.
- Teknoloji: Next.js + Tailwind, NestJS, PostgreSQL (Supabase), Prisma, JWT + RBAC.
- Kritik hedefler: API <2 sn, test skorlama <2 sn, %99.5 uptime, min. 50 eşzamanlı kullanıcı, test coverage >%80, KVKK uyumluluğu.
- Kapsam dışı: ödeme/fatura, sigorta, detaylı finansal raporlama.

## Fazlar (Şirket İçi Ekip Akışı)
- Faz 1: `01-kickoff-ve-urun-yonetimi.md`
- Faz 2: `02-teknik-mimari-ve-altyapi.md`
- Faz 3: `03-sprint-uygulama-plani.md`
- Faz 4: `04-test-guvenlik-ve-uyumluluk.md`
- Faz 5: `05-release-ve-operasyon.md`

## Ekip Rolleri
- Product Owner: gereksinim önceliği, kabul kriteri, scope kontrolü.
- Scrum Master / PM: sprint planlama, bağımlılık yönetimi, risk takibi.
- Backend Team: API, domain kuralları, güvenlik, entegrasyon.
- Frontend Team: kullanıcı akışları, UI/UX, erişilebilirlik.
- QA Team: test stratejisi, regresyon, performans ve kabul testleri.
- DevOps Team: CI/CD, ortam yönetimi, release güvenliği, gözlemlenebilirlik.
- Security & Compliance: KVKK, audit log, gizlilik süreçleri.

## Done When
- [ ] Tüm Faz md dosyaları oluşturuldu ve ekiplerce onaylandı.
- [ ] Sprint planı raporlardaki must-have use-case’leri kapsıyor.
- [ ] Güvenlik ve KVKK gereksinimleri ayrı kontrol listesiyle izleniyor.
