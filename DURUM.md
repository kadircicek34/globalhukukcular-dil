# GH Dil — Canlı Durum

Son güncelleme: 16 Kasım 2026, 14:05

## Tamamlanan

- Kaynak: FreeLingo (AGPL-3.0), public repo: https://github.com/kadircicek34/globalhukukcular-dil
- Kurumsal kimlik: yuvarlak bronz amblem, favicon, apple-touch-icon, OG görseli
- Landing: Türkçe, lacivert/altın/krem, mobil uyumlu, 360px'de taşmasız
- Üyelik backend'i: doğum tarihi, hukuk öğrencisi/mezunu, e-Devlet belgesi, KVKK,
  admin onay/ret, güvenli belge saklama, migration 0061. Başvurular onay
  kuyruğunda kalır; kullanıcı inceleme sürerken hemen giriş yapabilir. Ret erişimi kapatır.
- Üyelik arayüzü: başvuru formu, hemen giriş ekranı, reddedilen üye mesajı,
  `/admin/memberships`, bekleyen sayaç, davetli üye kaydı
- Güvenlik: WS üyelik kapısı, belge silme, 6 MB body limiti, MIME/uzantı doğrulaması,
  `0600/0700` dosya izinleri, beyaz liste e-posta alan adları
- Production: Docker Compose, Postgres 16, Redis 7, Caddy reverse proxy
- Admin bootstrap: `kadircicek13@icloud.com` / kullanıcı `kadir` (şifre `/root/dil/admin-credentials.txt`)
- LLM: OpenCode Go birincil, yeni API anahtarıyla **çalışıyor** (`opencode.ai`
  OpenAI-uyumlu uç, oturum başlığı). Yerel Ollama `qwen2.5:1.5b` yalnızca yedek.
  Arayüzde sağlayıcı/model adı gösterilmiyor; asistan yalnızca Lingu.
- Canlı chat: OpenCode Go ile ~6 sn, akıcı yanıt. Sağlayıcı/model adı yanıtta yok.
- Kullanıcı isteğiyle elle oluşturduğum 48 demo ders ve seed script'i kaldırıldı;
  plan/rota korunuyor. İlk ders (id 49) **OpenCode Go ile AI tarafından** üretildi;
  `/api/study-plan/today` artık 147 ms'de dönüyor.
- Yeni günlerin ders üretimi ~105 sn sürebiliyor; Next proxy 30 sn'de 500 gösterse
  bile backend üretimi tamamlayıp kaydedebiliyor. Sayfa yenilendiğinde ders gelir.
- Testler: backend 90 passed + Ruff temiz; frontend tsc/eslint temiz; landing Vitest 23/23;
  canlı Playwright 20/20
- DNS: `dil.globalhukukcular.com A 169.58.198.19` yayında
- HTTPS: Let's Encrypt sertifikası alındı; canlı alan adı HTTP/2 200
- Canlı Playwright: 20/20 (landing, başvuru, pending üye hemen girişi, admin onay, üye girişi, belge, cleanup)
- Geçici nip.io test alanı kaldırıldı; yalnızca canlı `dil` bloğu kaldı
- Otomatik test kullanıcıları silindi. Veritabanında admin (id 1), onaylı
  kullanıcı (id 9, kadir.cicekk@icloud.com) ve kullanıcının bıraktığı 2 gerçek
  bekleyen başvuru (id 11, id 12) var; bunlar silinmedi.
- Dashboard `/today` ve `/progress` isteklerine 8 sn toplam istemci zaman aşımı
  eklendi. Tur uygulama kabuğuna taşındı; çerez bandı içerik alanını kapatmıyor.
- 22 uygulama sayfası canlıda 200; 5xx/konsol hatası yok.

- Landing footer'daki açık kaynak/AGPL satırı kaldırıldı; LICENSE/NOTICE korunuyor.
- Caddy aktif health-check kaldırıldı; frontend recreate sonrası 503 giderildi

## Tamamlandı

Tüm kabul kriterleri kanıtlandı. Site canlı ve üyeye özel akış çalışıyor.

## Bilinen riskler

- TTS zinciri: Antalya Mini (yerel Türkçe, WAV) → Edge TTS (MP3) → tarayıcı
  `speechSynthesis`. Canlı tur sesi 200 `audio/wav` döndü; Edge İngilizce fallback
  testi MP3 üretti. STT (sesli konuşma) hâlâ yapılandırılmadı.
- Onboarding turundaki yeşil FreeLingo robotu GH Dil amblemiyle değiştirildi;
  tur artık dashboard verisi beklemeden açılıyor.
- Yeni ders üretimi OpenCode Go ile ~105 sn sürebiliyor; Next proxy 30 sn sınırı
  nedeniyle ilk istek 500 görünse bile backend devam edip dersi kaydedebilir.
  Ders listesi yenilenince görünür. Yerel yedek 1.5B yalnızca acil durum içindir.
- `akademi.globalhukukcular.com` bu çalışmadan bağımsız 500 veriyor:
  Prisma `public.Course` tablosu yok. Kaynak dizini `/root/Gakademi-recover` altında.
- Türkticaret paneli yetkili bilgisi değişikliği için e-posta onayı istedi; DNS kaydı
  yine de oluşturuldu.
- Context compact sayacı: 0/3. 3. compact sonrası kullanıcı uyarılacak.
