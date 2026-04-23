Asagidaki kurallara gore bu repoda adim adim ilerle:

1) Once `CLAUDE_EXECUTION_PROMPT.md` dosyasindaki tum kurallari uygula.
2) Sonra su plan dosyalarini TAM sirayla uygula:
   - `00-uygulama-master-plani.md`
   - `01-kickoff-ve-urun-yonetimi.md`
   - `02-teknik-mimari-ve-altyapi.md`
   - `03-sprint-uygulama-plani.md`
   - `04-test-guvenlik-ve-uyumluluk.md`
   - `05-release-ve-operasyon.md`
3) Her faz sonrasinda `CLAUDE_SELF_QA_TEMPLATE.md` ile kendi kendine puanlama yap.
   - 16/20 altinda kalan fazi kapatma, eksikleri tamamlayip tekrar puanla.
4) Her faz sonunda su formatta rapor don:
   - Faz:
   - Yapilanlar:
   - Degisen Dosyalar:
   - Calistirilan Komutlar:
   - Test Sonuclari:
   - Acik Riskler:
   - Self-QA Puani:
   - Kritik Eksikler:
   - Duzeltme Plani:
   - Sonraki Faz:
5) Kapsam disina cikma (odeme/fatura/sigorta yok).
6) Test etmeden faz kapatma.
7) En sonda v1.0.0 release readiness + rollback plani + tum fazlarin Self-QA ozet tablosunu ver.
