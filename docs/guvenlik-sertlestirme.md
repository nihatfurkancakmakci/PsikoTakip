# PsikoTakip – Güvenlik Sertleştirme Kontrol Listesi (OWASP 2025)

## A01 – Broken Access Control
- [x] JWT + RBAC tüm endpoint'lerde
- [x] Danışan yalnızca kendi randevularına erişebilir
- [x] Psikolog yalnızca kendi hastalarının notlarına erişir
- [x] Admin gizli notları görebilir (auditli)
- [ ] IDOR testleri (Faz 4)

## A02 – Cryptographic Failures
- [x] AES-256-CBC şifreleme (sağlık notu, seans notu, test yanıtı)
- [x] Rastgele IV her şifreleme işleminde
- [x] bcrypt(12) şifre hash
- [x] JWT sırları .env'de, repo'da yok
- [ ] Key rotation prosedürü belgelendi (TODO)

## A03 – Injection
- [x] class-validator ile whitelist validation
- [x] Prisma ORM → parameterized query (SQL injection yok)
- [x] forbidNonWhitelisted: true

## A04 – Insecure Design
- [x] Clean Architecture, katman sorumlulukları ayrılmış
- [x] Çakışma kontrolü backend'de (client-side bypass'ı engellenmiş)
- [x] Randevu geçmişe alınamaz (backend kontrolü)

## A05 – Security Misconfiguration
- [x] Helmet.js (X-Frame-Options, HSTS, CSP headers)
- [x] CORS kısıtlaması
- [x] .env repo dışında, .gitignore'da
- [ ] Production'da debug modu kapalı

## A06 – Vulnerable Components
- [x] npm audit CI'da çalışıyor
- [ ] Dependabot alerts (GitHub repo'da aktif edilecek)

## A07 – Auth Failures
- [x] accessToken 15 dakika TTL
- [x] refreshToken 7 gün, veritabanında revoke edilebilir
- [x] Logout tüm token'ları iptal eder
- [x] Başarısız girişler audit log'a yazılıyor
- [ ] Brute-force rate limit (ThrottlerModule: 60 req/min)

## A08 – Software & Data Integrity
- [x] Prisma migration'ları versiyon kontrolünde
- [ ] CI artifact imzalama

## A09 – Logging & Monitoring
- [x] AuditLog tüm kritik işlemler için
- [x] HttpExceptionFilter tüm 5xx hataları logluyor
- [ ] Centralized log (Vercel/Railway dahili log = yeterli MVP için)

## A10 – SSRF
- [x] Video meeting URL'leri UUID tabanlı dahili üretiliyor
- [x] Harici servis çağrısı yok (email hariç)

## Güvenlik SLA
- P0 (kritik): Aynı gün düzeltilir
- P1 (yüksek): 48 saat içinde
- P2 (orta): Sprint içinde
