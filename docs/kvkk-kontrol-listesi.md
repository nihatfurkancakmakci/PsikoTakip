# PsikoTakip – KVKK Uyumluluk Kontrol Listesi

## Veri İşleme Temeli
- [x] Danışan kayıt sırasında rıza metni gösteriliyor (kayıt formu KVKK notu içeriyor)
- [x] Özel nitelikli kişisel veriler (sağlık notu) AES-256-CBC ile şifrelenerek saklanıyor
- [x] Seans notları AES-256-CBC şifreli, IV ayrı kolonda saklanıyor
- [x] Test yanıtları AES-256-CBC şifreli saklanıyor

## Erişim Kontrolü
- [x] JWT + RBAC ile her endpoint rol bazlı korumalı
- [x] Danışan yalnızca kendi verisine erişebiliyor
- [x] Psikolog yalnızca kendi danışanlarının verilerine erişiyor
- [x] Gizli seans notları danışanla paylaşılmadan görüntülenemiyor
- [x] Admin tam yetki + her işlem audit log'a yazılıyor

## Audit Log
- [x] Kullanıcı kimliği (userId) her log kaydında mevcut
- [x] İşlem türü (action: CREATE/UPDATE/DELETE/LOGIN/LOGOUT/LOGIN_FAILED/ACCESS_DENIED/APPROVE/REJECT)
- [x] Varlık adı (entity) ve varlık ID'si kayıt altında
- [x] IP adresi kaydediliyor
- [x] Zaman damgası (createdAt) otomatik
- [x] Başarısız giriş denemeleri loglanıyor

## Veri Saklama ve Silme
- [ ] Kullanıcı hesap silme endpoint'i (soft-delete)
- [ ] Danışanın kendi verilerini export etme endpoint'i
- [ ] Veri saklama süresi politikası (örn. 5 yıl)
- [ ] Aylık audit log arşivleme

## Transit Veri Güvenliği
- [x] TLS 1.2+ (Vercel ve Railway otomatik)
- [x] CORS kısıtlaması (yalnızca frontend origin)
- [x] Helmet.js güvenlik header'ları aktif

## At-Rest Şifreleme
- [x] Supabase disk şifrelemesi (AES-256 at-rest, provider seviyesi)
- [x] Uygulama seviyesi AES-256 (sağlık notu, seans notu, test yanıtları)

## Şifre Güvenliği
- [x] bcrypt (salt rounds: 12) ile hash
- [x] Şifre ham metin olarak asla saklanmıyor

## Açık Maddeler (Sprint 6 sonunda kapatılacak)
- [ ] Kullanıcı silme (GDPR uyumlu soft-delete)
- [ ] Data export endpoint
- [ ] Rıza güncelleme mekanizması
