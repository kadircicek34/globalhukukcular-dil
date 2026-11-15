# GH Dil — Canlı Durum

Son güncelleme: 15 Kasım 2026, 20:25

## Tamamlanan

- FreeLingo kaynağı indirildi; AGPL atfı korunarak `kadircicek34/globalhukukcular-dil` public reposu açıldı.
- Kurumsal logo işlendi: yuvarlak bronz amblem, favicon, apple-touch-icon ve OG görseli.
- Üyelik backend'i: doğum tarihi, hukuk öğrencisi/mezunu, e-Devlet belgesi, KVKK, admin onay/ret, belge güvenliği, migration 0061.
- Üyelik arayüzü: yeni başvuru formu, onay bekleme ekranı, login 403 mesajları, `/admin/memberships` paneli.
- Landing ve marka: Türkçe GH Dil landing page, lacivert/altın/krem tasarım, varsayılan dil Türkçe, metadata/manifest/OG.
- Backend testleri: 14 üyelik + 94 auth/admin testi geçti; ruff temiz.
- Frontend typecheck/lint ve landing unit testleri (23/23) geçti.
- Üretim compose, Caddy snippet, env örneği ve deploy dokümantasyonu hazır.
- Yerel LLM: `qwen2.5:3b` Ollama üzerinde hazır; backend erişimi `172.17.0.1:11434`.
- Caddy mevcut yapısı incelendi; Gakademi'ye dokunulmadan `gakademi_default` ağına alias ile bağlanacak.

## Devam eden

- Docker image build (backend + frontend).
- Bağımsız reviewer raporları (backend, üyelik UI).
- DNS: Türkticaret panelinde 4 alan adının yetkili bilgisi atanmamış; DNS yönetimi bu nedenle kilitli. Atama 2FA kodu istiyor (kadircicek13@icloud.com).
- Caddy site bloğu ve container ayağa kaldırma.
- Admin bootstrap ve canlı Playwright testleri.

## Bilinen riskler / kararlar

- Türkticaret paneli DNS kaydı için e-posta 2FA kodu gerektiriyor; kod kullanıcıdan alınacak.
- TTS/STT yerel GPU servisleri bu sunucuda yok; metin tabanlı AI çalışır, sesli özellikler yapılandırılmadıkça hata verir.
- Mevcut `akademi.globalhukukcular.com` servisine dokunulmayacak.
- Context compact sayacı: 0/3. 3. compact sonrası kullanıcı uyarılacak.
