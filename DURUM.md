# GH Dil — Canlı Durum

Son güncelleme: 16 Kasım 2026, 03:05

## Tamamlanan

- Kaynak: FreeLingo (AGPL-3.0), public repo: https://github.com/kadircicek34/globalhukukcular-dil
- Kurumsal kimlik: yuvarlak bronz amblem, favicon, apple-touch-icon, OG görseli
- Landing: Türkçe, lacivert/altın/krem, mobil uyumlu, 360px'de taşmasız
- Üyelik backend'i: doğum tarihi, hukuk öğrencisi/mezunu, e-Devlet belgesi, KVKK,
  admin onay/ret, güvenli belge saklama, migration 0061
- Üyelik arayüzü: başvuru formu, onay bekleme ekranı, login 403 mesajları,
  `/admin/memberships`, bekleyen sayaç, davetli üye kaydı
- Güvenlik: WS üyelik kapısı, belge silme, 6 MB body limiti, MIME/uzantı doğrulaması,
  `0600/0700` dosya izinleri, beyaz liste e-posta alan adları
- Production: Docker Compose, Postgres 16, Redis 7, Caddy reverse proxy
- Admin bootstrap: `kadircicek13@icloud.com` / kullanıcı `kadir` (şifre `/root/dil/admin-credentials.txt`)
- Yerel LLM: Ollama `qwen2.5:3b`, backend `172.17.0.1:11434`
- Testler: backend 90 passed + Ruff temiz; frontend tsc/eslint temiz; landing Vitest 23/23;
  canlı Playwright 20/20
- DNS: `dil.globalhukukcular.com A 169.58.198.19` yayında
- HTTPS: Let's Encrypt sertifikası alındı; canlı alan adı HTTP/2 200
- Canlı Playwright: 20/20 (landing, başvuru, pending 403, admin onay, üye girişi, belge, cleanup)
- Geçici nip.io test alanı kaldırıldı; yalnızca canlı `dil` bloğu kaldı
- Test kullanıcıları silindi; veritabanında yalnızca admin var

## Tamamlandı

Tüm kabul kriterleri kanıtlandı. Site canlı ve üyeye özel akış çalışıyor.

## Bilinen riskler

- TTS/STT servisleri yapılandırılmadı; sesli özellikler çalışmaz. Metin AI aktiftir.
- `akademi.globalhukukcular.com` bu çalışmadan bağımsız 500 veriyor:
  Prisma `public.Course` tablosu yok. Kaynak dizini `/root/Gakademi-recover` altında.
- Türkticaret paneli yetkili bilgisi değişikliği için e-posta onayı istedi; DNS kaydı
  yine de oluşturuldu.
- Context compact sayacı: 0/3. 3. compact sonrası kullanıcı uyarılacak.
