# PsikoTakip – RACI Matrisi

R=Responsible (Yapan), A=Accountable (Onaylayan), C=Consulted (Danışılan), I=Informed (Bilgilendirilen)

| Görev | PO (Arda) | SM (Arda) | BE (Recep) | FE (Mesut) | QA (Hasan) | DevOps (Furkan) |
|---|---|---|---|---|---|---|
| Gereksinim önceliklendirme | A/R | C | C | C | C | I |
| Sprint planlama | A | R | C | C | C | C |
| Backend API geliştirme | I | I | R/A | C | C | I |
| Frontend UI geliştirme | I | I | C | R/A | C | I |
| Prisma şema tasarımı | C | I | R/A | C | C | I |
| JWT + RBAC implementasyonu | I | I | R/A | C | C | I |
| CI/CD pipeline kurulumu | I | C | C | C | C | R/A |
| Unit/integration testler | I | I | R | R | A | I |
| E2E testler | I | I | C | C | R/A | I |
| Güvenlik sertleştirme | A | I | R | C | C | R |
| KVKK uyumluluk kontrolü | A/R | C | C | C | C | C |
| Production deployment | A | I | C | C | I | R |
| Rollback kararı | A | R | C | C | C | R |
| Sprint review sunumu | A/R | R | C | C | C | C |

## Değişiklik Yönetimi Kuralı
1. Kapsam değişiklik talebi **Product Owner** (Arda Özkaya) onayı gerektirir.
2. Her değişiklik Sprint Planning'de tüm ekiple değerlendirilir.
3. Onaylanan değişiklik backlog'a eklenir, WH listesi güncellenir.
4. Sprint içi kapsam değişikliği kabul edilmez; bir sonraki sprint'e alınır.
