# GH Dil — Üretim Dağıtımı

Hedef: `https://dil.globalhukukcular.com`

## Sunucu gerçekleri

- Mevcut Caddy container'ı `gakademi-caddy-1` 80/443 portlarını kullanır.
- Mevcut ağ: `gakademi_default`.
- GH Dil frontend container'ı bu ağa `ghdil-frontend` alias'ı ile bağlanır.
- Mevcut Gakademi container'larına, volume'larına ve veritabanına dokunulmaz.
- GH Dil kendi Postgres/Redis container'larını `ghdil_internal` ağında çalıştırır.

## İlk kurulum

```bash
cd /root/dil/freelingo/deploy
cp .env.production.example .env.production
# .env.production içindeki sırları doldur
mkdir -p /root/dil/data/{postgres,redis,avatars,audio,tts_previews,membership_docs}
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## Caddy

`Caddyfile.dil.snippet` içeriğini `/root/Gakademi/deploy/Caddyfile` sonuna ekle.
Değişiklikten önce yedek al:

```bash
cp /root/Gakademi/deploy/Caddyfile /root/Gakademi/deploy/Caddyfile.bak-ghdil
cat Caddyfile.dil.snippet >> /root/Gakademi/deploy/Caddyfile
docker exec gakademi-caddy-1 caddy validate --config /etc/caddy/Caddyfile
docker exec gakademi-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```

## DNS

`dil.globalhukukcular.com` A kaydı: `169.58.198.19` (Türkticaret DNS paneli).

## Ses (TTS)

GH Dil ses zinciri:

1. **Antalya Mini** — yerel Türkçe TTS sidecar'ı (`ghdil-antalia:8099`, CPU, WAV).
2. **Edge TTS** — Antalya erişilemezse veya metin Türkçe değilse ücretsiz MP3.
3. **Tarayıcı `speechSynthesis`** — iki sunucu tarafı da başarısızsa cihaz sesi.

Antalya modeli host'ta `/root/antalia/antalia-mini` altında durur ve salt-okunur
olarak `antalia` konteynerine bağlanır. Sidecar imajı `deploy/antalia/Dockerfile`
ile build edilir. Model farklı bir sunucudaysa volume yolunu güncelleyin.

## Yerel LLM (Ollama)

Compose, Ollama'yı `ghdil-ollama` servisi olarak `ghdil_internal` ağında çalıştırır.
Backend `OLLAMA_BASE_URL=http://ollama:11434` kullanır; host ağ izolasyonu gerekmez.

Model dosyaları host'taki `/usr/share/ollama/.ollama` dizininden salt-okunur biçimde
container'a bağlanır. Farklı bir sunucuda modeli container içinden indirin:

```bash
docker exec ghdil-ollama ollama pull qwen2.5:3b
```

## Admin bootstrap

Public başvurunun ilk admin olmasını engellemek için `FIRST_USER_IS_ADMIN=false`
kullanılır. İlk admin, migrasyonlardan sonra container içinde oluşturulur:

```bash
docker exec -e PYTHONPATH=/app ghdil-backend \
  python scripts/create_admin.py \
  --email kadircicek13@icloud.com \
  --username kadir --name "Kadir Çiçek" \
  --password 'GUCLU_SIFRE'
```

## Sağlık kontrolü

```bash
curl -fsS https://dil.globalhukukcular.com/api/config
curl -fsS https://akademi.globalhukukcular.com/ >/dev/null && echo akademi-ok
```
