# Claude Handoff Checklist

Bu listeyi, Claude Code'a dosyalari verirken uygula.

## 1) Baslatmadan Once
- [ ] Repo klasorunde oldugundan emin ol.
- [ ] Plan dosyalari mevcut:
  - [ ] `00-uygulama-master-plani.md`
  - [ ] `01-kickoff-ve-urun-yonetimi.md`
  - [ ] `02-teknik-mimari-ve-altyapi.md`
  - [ ] `03-sprint-uygulama-plani.md`
  - [ ] `04-test-guvenlik-ve-uyumluluk.md`
  - [ ] `05-release-ve-operasyon.md`
  - [ ] `CLAUDE_EXECUTION_PROMPT.md`
  - [ ] `CLAUDE_SELF_QA_TEMPLATE.md`

## 2) Claude'a Verilecek Ilk Mesaj
- [ ] Once `CLAUDE_EXECUTION_PROMPT.md` icerigini ver.
- [ ] Ardindan "plan dosyalarini sirasiyla uygula" de.
- [ ] "Her faz sonunda rapor formatina gore don" de.

## 3) Calisma Sirasinda Kontrol
- [ ] Her faz sonrasi "Degisen Dosyalar + Test Sonuclari" geldi mi?
- [ ] Her faz sonrasi "Self-QA Puani + Kritik Eksikler + Duzeltme Plani" geldi mi?
- [ ] Faz atlama veya kapsam kaymasi oldu mu?
- [ ] Kapsam disi ozellik eklenmeye calisildiysa durduruldu mu?
- [ ] Kritik gereksinimler (RBAC, KVKK, audit log, cakisma kontrolu) korunuyor mu?

## 4) Final Oncesi
- [ ] Coverage %80+ raporlandi.
- [ ] E2E kritik akislar gecti.
- [ ] Release readiness ozeti verildi.
- [ ] Rollback plani yazildi.
- [ ] Fazlarin Self-QA toplu puan ozeti verildi.

## 5) Final Teslim
- [ ] v1.0.0 cikis notu alindi.
- [ ] Bilinen riskler listelendi.
- [ ] Sonraki iterasyon backlog maddeleri cikarildi.
