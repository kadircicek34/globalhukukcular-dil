# GH Dil — Test Raporu

Tarih: 16 Kasım 2026
Canlı: https://dil.globalhukukcular.com
Sertifika: Let's Encrypt (CN=dil.globalhukukcular.com), 13 Şubat 2027'ye kadar geçerli

## Tarayıcı (Playwright, Chromium)

Canlı alan adında 20/20 test geçti:

- Landing HTTP 200, başlık ve H1 doğru
- Kurumsal logo 5 yerde görünür
- Üyelik CTA'ları `/register` (6 bağlantı)
- Mobil 390px: yatay taşma yok
- Girişsiz `/dashboard` -> `/login`
- Başvuru formu gönderildi (GHD-00006)
- Onaysız üye girişi 403 + Türkçe "onay bekliyor" mesajı
- Admin girişi başarılı
- Admin bekleyen başvuruyu ve e-Devlet belgesini gördü
- Admin nav bekleyen sayacı = 1
- e-Devlet belgesi yeni sekmede açıldı (bearer + blob)
- Admin onayı başarılı
- Onaylı üye `/dashboard` erişimi başarılı
- Oturum açmış landing CTA'ları `/dashboard` (6 bağlantı)
- Test üyesi temizlendi (204)
- Beklenmeyen console hatası yok
- Sunucu 5xx yok

Ekran görüntüleri: `/root/dil/screenshots/`
- `01-landing-desktop.png`
- `02-landing-mobile.png`
- `03-register-form.png`
- `04-application-received.png`
- `05-admin-memberships.png`
- `06-admin-approved.png`
- `07-member-dashboard.png`
- `08-pending-login.png`
- `09-admin-dashboard.png`

## API / güvenlik

- `POST /api/auth/apply` 201 pending; doğum tarihi, hukuk durumu, belge ve KVKK zorunlu
- Pending giriş 403 `Membership pending approval`
- Admin onayı sonrası üye girişi 200
- `/api/auth/me` pending token ile 403
- Admin belge indirme 200 `application/pdf`; normal üye 403
- Kullanıcı silindiğinde e-Devlet belgesi diskten silindi
- Belge dizini `/root/dil/data/membership_docs`, dosya izni `0600`, dizin `0700`
- Public register, `MEMBERSHIP_REQUIRED=true` iken davetsiz 403
- Production `FIRST_USER_IS_ADMIN=false`; admin ayrı bootstrap script'iyle oluşturuldu

## Otomatik testler

- Backend: 90 test geçti (`test_membership`, `test_auth`, `test_admin`)
- Ruff: temiz
- Frontend TypeScript: 0 hata
- ESLint: 0 hata
- Landing Vitest: 23/23
- Canlı LLM adapter testi (Ollama `qwen2.5:3b`): `provider=ollama`, yanıt `OK`
- Canlı admin paneli: 0 console hatası, 0 sunucu 5xx
- Not: panelde kullanıcı tarafından bırakılmış 1 gerçek bekleyen başvuru
  (`kadir.cicekk@icloud.com`) korunmuştur; otomatik test verileri silinmiştir.

## Bilinen sınırlamalar

- TTS/STT yerel servisleri bu sunucuda çalıştırılmadı; metin tabanlı AI (Ollama `qwen2.5:3b`) aktiftir.
- `akademi.globalhukukcular.com` bu çalışmadan bağımsız olarak 500 döndürüyor:
  Prisma `public.Course` tablosu veritabanında yok. GH Dil container'ları bu servise dokunmaz.
- `dil.globalhukukcular.com` A kaydı 169.58.198.19 olarak yayında; HTTPS 200 ve sertifika geçerli.
  Geçici nip.io test alanı kaldırıldı.
