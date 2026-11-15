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

## Sağlık kontrolü

```bash
curl -fsS https://dil.globalhukukcular.com/api/health
curl -fsS https://akademi.globalhukukcular.com/ >/dev/null && echo akademi-ok
```
