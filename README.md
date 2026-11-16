# GH Dil

**Global Hukukçular Derneği üyelerine özel, yapay zekâ destekli dil öğrenme platformu.**

Canlı: [dil.globalhukukcular.com](https://dil.globalhukukcular.com)

GH Dil, hukuk öğrencileri ve hukuk profesyonellerinin İngilizce, Almanca ve Fransızca
becerilerini mesleki bağlamda geliştirmesi için tasarlanmıştır. Platform yalnızca
Global Hukukçular Derneği üyelerine açıktır.

## Üyelik akışı

1. Aday, `/register` üzerinden ad soyad, e-posta, doğum tarihi, hukuk öğrencisi/mezunu
   durumu, hukuk fakültesi ve **e-Devlet öğrenci/mezun belgesi** ile başvurur.
2. KVKK aydınlatma metni ve üyelik koşulları zorunludur.
3. Başvuru `pending` olarak yönetici inceleme kuyruğuna düşer; aday **hemen giriş yapabilir**.
4. Dernek yöneticisi `/admin/memberships` panelinden belgeyi ve bilgileri inceler.
5. Onay üyeliği kalıcılaştırır; ret sonraki istekte erişimi kapatır.

Yüklenen e-Devlet belgeleri public dizinde tutulmaz. Belge indirme ucu yalnızca
`admin` rolüne açıktır ve `Cache-Control: private, no-store` döner.

## Özellikler

- A1–C2 yapılandırılmış öğrenme planı ve seviye belirleme
- Hukuk odaklı ders, kelime ve konuşma senaryoları
- Yapay zekâ tutoru **Lingu** ile metin ve ses pratiği
- Flashcard tekrarı, dinleme/okuma alıştırmaları, oyunlar ve ilerleme takibi
- Çoklu dil desteği; üyelik, kota ve ayarlar kullanıcı bazında
- Yönetici paneli: üyelik onayı, kullanıcı yönetimi, içerik ve sistem kontrolleri

## Mimari

- `frontend/` — Next.js 16 App Router, Tailwind CSS, next-intl, Zustand
- `backend/` — FastAPI, SQLAlchemy async, Alembic, Pydantic v2
- PostgreSQL 16 + Redis 7
- LLM: OpenCode Go (birincil), Ollama (yerel yedek), OpenAI, Anthropic
- Ses: Antalya Mini (yerel Türkçe TTS) → Edge TTS → tarayıcı sesi; STT için faster-whisper/OpenAI
- Üretim: Docker Compose + Caddy reverse proxy

Frontend, LLM/TTS/STT sağlayıcılarına doğrudan erişmez; tüm sağlayıcı çağrıları
backend üzerinden yapılır.


## Yerel geliştirme

```bash
cp .env.example .env
# SECRET_KEY, veritabanı ve Redis parolalarını düzenleyin
docker compose -f docker-compose.dev.yml up -d --build
```

Ayrıntılar: [DEVELOPMENT.md](DEVELOPMENT.md)

## Üretim dağıtımı

GH Dil, mevcut sunucuda Caddy arkasında çalışır. Mevcut `akademi.globalhukukcular.com`
servisine dokunmadan `dil.globalhukukcular.com` eklenir.

```bash
cd deploy
cp .env.production.example .env.production
# sırları doldurun
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Caddy bloğu: `deploy/Caddyfile.dil.snippet`
Dağıtım notları: `deploy/README.md`

## Güvenlik

- Şifreler bcrypt ile hashlenir; JWT access + rotating refresh token kullanılır.
- Üyelik durumu backend'de kontrol edilir; reddedilen kullanıcı erişemez.
  İnceleme bekleyen başvuru sahibi platformu kullanabilir.
- Başvuru ve belge uçları rate limitlidir.
- E-Devlet belgesi türü, boyutu ve dosya imzası doğrulanır.
- `.env` ve üretim sırları repoya eklenmez.

## Lisans ve atıf

Bu proje, [FreeLingo](https://github.com/artcc/freelingo) (AGPL-3.0) tabanlıdır.
Global Hukukçular Derneği için yapılan özelleştirmeler aynı lisans altında
paylaşılır. Ayrıntılar: [LICENSE](LICENSE) ve [NOTICE](NOTICE).

Ticari/özel lisans talepleri için upstream projenin
[COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md) dosyasına bakın.
