# PsikoTakip – Terim Sözlüğü

## Kullanıcı Rolleri
| Terim | Açıklama |
|---|---|
| Misafir (Guest) | Sisteme giriş yapmamış, yalnızca genel bilgilere erişen kullanıcı |
| Danışan (Client) | Psikolog ile randevu alan, test çözen, portal kullanan kayıtlı kullanıcı |
| Psikolog (Psychologist) | Admin tarafından onaylanan, randevu/seans/not yöneten uzman |
| Admin | Sistemi yöneten klinik yöneticisi; psikolog onayı ve sistem ayarları |

## Alan Terimleri
| Terim | Açıklama |
|---|---|
| Randevu (Appointment) | Danışan ile psikolog arasında planlanan görüşme kaydı |
| Seans (Session) | Gerçekleşen randevu; seans notu bağlanabilir |
| Seans Notu (SessionNote) | Psikologun seans sonrası tuttuğu şifreli not; gizli/paylaşımlı |
| Psikolojik Test (PsychologicalTest) | BDE-II, BAE, SCL-90 gibi standart değerlendirme araçları |
| Test Sonucu (TestResult) | Danışana ait otomatik skorlanmış test çıktısı |
| İlerleme Grafiği | Danışanın test skorlarının zaman serisi görselleştirmesi |
| Bildirim (Notification) | E-posta/uygulama içi mesaj (randevu hatırlatma vb.) |
| Audit Log | Kritik işlemlerin KVKK uyumlu denetim kaydı |
| Video Link | Online seans için UUID tabanlı otomatik üretilen bağlantı |

## Durum Kodları
| Varlık | Durum Değerleri |
|---|---|
| Randevu | PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW |
| Psikolog Onayı | PENDING_APPROVAL, APPROVED, REJECTED |
| Seans Türü | IN_PERSON, ONLINE |
| Test Skoru | NORMAL, HAFIF, ORTA, AGIR |
| Bildirim Kanalı | EMAIL, SMS (SMS başlangıçta pasif) |

## Endpoint Dil Standardı
- Tüm API endpoint'leri İngilizce, kebab-case: `/api/v1/appointments`
- Response body alanları: camelCase
- Hata kodları: HTTP standart + özel `errorCode` alanı
