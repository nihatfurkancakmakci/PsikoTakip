# PsikoTakip v1.0.0 — Release Notes

**Tarih:** 2026-04-19  
**Durum:** Production-Ready  

---

## Kapsam

PsikoTakip, psikolog–danışan ilişkisini dijitalleştiren tam yığın web uygulamasıdır.

---

## Özellikler

### Kimlik Doğrulama & Yetkilendirme
- JWT erişim tokeni (15dk) + yenileme tokeni (7 gün, DB'de saklanır, iptal edilebilir)
- 4 rol: ADMIN, PSYCHOLOGIST, CLIENT, GUEST
- Tüm korumalı route'larda RBAC uygulanır

### Randevu Yönetimi
- Danışan psikolog seçip tarih/saat/seans türü belirleyerek randevu oluşturur
- Backend çakışma kontrolü: aynı zaman dilimine çift randevu engellenir
- Online seans için UUID video toplantı linki otomatik atanır
- Psikolog: onayla / iptal et / tamamlandı / gelmedi işlemleri

### Psikolojik Testler
- BDE-II (21 soru), BAE (21 soru), SCL-90 (90 soru)
- Her soru kendi davranış tanımlayıcı seçeneklerine sahip (şiddet etiketi yok)
- Otomatik puanlama (SumScoringStrategy) ve kategori eşleme
- Test cevapları AES-256-CBC ile şifreli saklanır
- Psikolog sonucu danışanla paylaşana kadar danışan göremez

### Seans Notları
- AES-256-CBC şifreli not içeriği
- Duygusal durum ve hedef/ödev alanları
- Danışanla paylaş toggle'ı

### Admin Paneli
- Kullanıcı listesi, arama, rol filtresi
- Psikolog onay/ret işlemleri
- Audit log: tüm kritik işlemlerin izlenebilirliği (action filtresi, sayfalama)

### KVKK Uyumu
- `GET /api/v1/users/me/export` — Kişisel verilerin tamamını JSON olarak indir
- `DELETE /api/v1/users/me` — Hesabı soft-delete + kişisel verileri anonim hale getir

---

## Teknik Altyapı

| Katman | Teknoloji |
|--------|-----------|
| Backend | NestJS 10, Prisma ORM, PostgreSQL 15 |
| Frontend | Next.js 14 (App Router), TanStack Query, Tailwind CSS |
| Güvenlik | bcrypt(12), AES-256-CBC, Helmet, Rate Limiting |
| Test | Jest, 61 test, tüm coverage eşikleri geçti |
| CI/CD | GitHub Actions (lint + test + build) |
| Konteyner | Docker Compose (db + backend + frontend) |

---

## Bilinen Sınırlamalar

- E-posta bildirimleri dev ortamında console log'a düşer, SMTP ayarlanmamış
- `typedRoutes` experimental olduğundan bazı tip uyarıları olabilir
- Video toplantı linki gerçek bir meeting servisiyle entegre değil (UUID placeholder)

---

## Rollback Planı

### 1. Frontend Rollback (< 2 dakika)
```bash
# Önceki Next.js build'i geri yükle
git checkout v0.9.0 -- apps/frontend
npm run build --workspace=apps/frontend
pm2 restart psikotakip-frontend
```

### 2. Backend Rollback (< 3 dakika)
```bash
git checkout v0.9.0 -- apps/backend/src
npm run build --workspace=apps/backend
pm2 restart psikotakip-backend
```

### 3. DB Rollback (kritik — dikkatli uygula)
```bash
# Sadece migration geri almak gerekiyorsa
cd apps/backend
npx prisma migrate resolve --rolled-back 20260419195252_init
# Veri kaybını önlemek için öncesinde pg_dump alınmalı
```

### 4. Docker ile Tam Rollback
```bash
docker compose down
git checkout v0.9.0
docker compose up --build -d
```

### Acil Durum Kontakları
- Release Owner: DevOps sorumlusu (Nihat Furkan Çakmakcı)
- DB backup: `pg_dump psikotakip > backup_$(date +%Y%m%d_%H%M).sql`

---

## Sonraki İterasyon (v1.1.0) — Backlog

- Gerçek video konferans entegrasyonu (Jitsi / Daily.co)
- E-posta bildirimleri (randevu hatırlatma, onay)
- Danışan arama ve filtreleme
- Randevu takvim görünümü (haftalık/aylık)
- Test sonuçlarının PDF olarak indirilmesi
- 2FA desteği
