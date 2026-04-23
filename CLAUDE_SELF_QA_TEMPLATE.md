# Claude Self-QA Template

Bu dosya, Claude Code'un her faz sonunda kendi ciktilarini puanlamasi icin zorunlu oz-denetim sablonudur.

## Kullanım Kuralı
- Her faz bitiminde bu sablona gore self-check yap.
- Puanlama 0-2 araliginda olsun:
  - 0 = karsilanmadi
  - 1 = kismen
  - 2 = tam karsilandi
- Toplam puani ve kritik eksikleri raporla.
- Toplam puan 16/20 altindaysa faz "tamamlandi" sayma; eksikleri kapatip tekrar degerlendir.

## Kriterler (10 madde, max 20 puan)
1) Kapsam Uygunlugu  
Plan disi ozellik eklenmedi, kapsam disina cikilmadi.

2) Mimari Uygunluk  
Teknoloji ve katman prensipleri plana uygun.

3) Dogru Dosya Degisikligi  
Degisen dosyalar faz amaciyla dogrudan iliskili.

4) Test Kaniti  
Lint/test/build veya ilgili dogrulamalar calisti ve sonucu raporlandi.

5) Guvenlik Gereksinimi  
RBAC, auth, veri koruma veya faza uygun guvenlik onlemleri ihmal edilmedi.

6) KVKK/Uyumluluk Izlenebilirligi  
Audit/log/izin/gizlilik gereksinimlerinde geriye donuk iz birakildi.

7) Hata ve Risk Yonetimi  
Bilinen riskler acik yazildi; gecici cozumler not edildi.

8) Kod Kalitesi  
Asiri karmasiklasma yok; degisiklikler okunabilir ve bakimi kolay.

9) Dokumantasyon Guncelligi  
Gerekli md/readme/komut notlari guncellendi.

10) Faz Cikis Kriteri  
Faz dosyasindaki "Done When" maddeleri objektif sekilde saglandi.

## Faz Sonu Self-QA Rapor Formati
- Self-QA Puani: X/20
- Kriter Bazli Puanlar:
  - K1: x/2
  - K2: x/2
  - K3: x/2
  - K4: x/2
  - K5: x/2
  - K6: x/2
  - K7: x/2
  - K8: x/2
  - K9: x/2
  - K10: x/2
- Kritik Eksikler:
- Duzeltme Plani:
- Faz Durumu: (GECTI / TEKRAR CALISILACAK)
