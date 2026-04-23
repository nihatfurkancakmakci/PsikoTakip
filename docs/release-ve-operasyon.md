# PsikoTakip v1.0.0 – Release ve Operasyon Kılavuzu

## 1. Release Branch Stratejisi
- `main` → production (korumalı, PR zorunlu, CI geçmeli)
- `develop` → staging
- `sprint/N` → sprint geliştirme branch'leri
- Hotfix: `hotfix/kısa-açıklama` → main'e merge + cherry-pick to develop

## 2. Production Deployment Sırası

### Adım 1 – Veritabanı
```bash
# Supabase migration (Railway'den)
npx prisma migrate deploy
```

### Adım 2 – Backend (Railway)
```bash
# Railway CLI ile
railway up --detach
# Smoke test
curl https://api.psikotakip.com/api/v1/auth/me  # → 401 (beklenmedik değil)
```

### Adım 3 – Frontend (Vercel)
- GitHub main'e push → Vercel otomatik deploy
- `vercel --prod` komutu ile manuel

### Adım 4 – Smoke Test
```bash
# Login testi
curl -X POST https://api.psikotakip.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@psikotakip.com","password":"Admin1234!"}'
```

## 3. Rollback Prosedürü

### Backend Rollback (Railway)
```bash
railway rollback   # önceki deployment'a geri döner
# veya git ile
git revert HEAD --no-edit
git push origin main
```

### Frontend Rollback (Vercel)
```bash
vercel rollback    # Vercel dashboard'dan da yapılabilir
```

### Database Rollback
```bash
# UYARI: Migration geri almak veri kaybı riski taşır!
npx prisma migrate resolve --rolled-back <migration_name>
# DB snapshot'a dönmek için Supabase PITR kullanılır
```

## 4. Post-Release Gözlem Planı (İlk 24 Saat)

| Metrik | Eşik | Kaynak |
|---|---|---|
| API error rate | < %1 | Railway logs |
| P95 API latency | < 2000ms | Railway metrics |
| Login success rate | > %99 | Audit logs |
| Randevu oluşturma başarı | > %99 | Audit logs |
| DB connection pool | < %80 | Supabase |

## 5. Olay Yönetimi (Incident Response)

**P0 – Sistem Çökmesi**
1. Release owner'ı bilgilendir (Arda Özkaya)
2. Rollback kararını 5 dakika içinde ver
3. Kullanıcılara status sayfasında bilgi ver
4. Kök neden analizi (RCA) raporu 24 saat içinde

**P1 – Güvenlik İhlali**
1. Etkilenen kullanıcıların token'larını iptal et
2. Audit log'u incele
3. KVKK kapsamında gerekiyorsa 72 saat içinde bildiri

## 6. Operasyonel Dokümantasyon

### Ortam Değişkenleri (Production)
| Değişken | Açıklama |
|---|---|
| DATABASE_URL | Supabase PgBouncer URL |
| DIRECT_URL | Supabase direkt URL (migration için) |
| JWT_ACCESS_SECRET | Min 32 karakter, rastgele üretilmeli |
| JWT_REFRESH_SECRET | Min 32 karakter, rastgele üretilmeli |
| ENCRYPTION_KEY | Tam 32 byte, hex veya UTF-8 |
| SMTP_* | Nodemailer SMTP yapılandırması |
| FRONTEND_URL | https://psikotakip.com |

### Seed (İlk Yükleme)
```bash
# Sadece production başlangıcında
npx ts-node prisma/seed.ts
# Ardından admin şifresini değiştir!
```

## 7. Bakım Takvimi
- **Hotfix akışı**: `hotfix/*` branch → test → merge main → release tag
- **Teknik borç sprintleri**: Her 3 sprint'te bir %30 kapasite
- **Dependency update**: Her sprint başında `npm audit`
- **Backup kontrolü**: Supabase PITR günlük otomatik

## 8. v1.0.x Bakım Takvimi
- v1.0.1: Kullanıcı silme (GDPR) + data export
- v1.0.2: SMS bildirimi aktivasyonu
- v1.0.3: WCAG 2.1 AA erişilebilirlik iyileştirmeleri
