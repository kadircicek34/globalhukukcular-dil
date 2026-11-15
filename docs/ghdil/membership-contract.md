# GH Dil — Üyelik API Sözleşmesi (v1)

Bu sözleşme backend ve frontend ajanları için bağlayıcıdır. Alan adları ve durum kodları değiştirilemez.

## Üyelik durumları

`users.membership_status`: `pending` | `approved` | `rejected`

- Mevcut kullanıcılar ve migration: `approved`
- Yeni public başvuru: `pending`
- Admin tarafından oluşturulan kullanıcı: `approved`
- İlk kullanıcı (bootstrap admin): `approved`

## Public başvuru

`POST /api/auth/apply` — `multipart/form-data`, rate limit 5/dakika.

Zorunlu alanlar:

- `username` (3-50, `^[\w.-]+$`)
- `email`
- `password` (10-25, en az 1 büyük harf, 1 rakam, 1 sembol)
- `display_name` (2-100)
- `birth_date` (`YYYY-MM-DD`, geçmiş tarih, en az 15 yaş)
- `law_status` (`student` | `graduate`)
- `law_school` (2-200)
- `kvkk_accepted` (`true`)
- `terms_accepted` (`true`)
- `e_devlet_document` (dosya, zorunlu)

Opsiyonel:

- `phone` (5-30)
- `graduation_year` (mezun ise 1950..bu yıl)
- `native_language` (varsayılan `tr`)

Dosya kuralları:

- PDF (`application/pdf`, `%PDF-`), JPEG (`image/jpeg`), PNG (`image/png`)
- En fazla 5 MB
- Uzantı ve MIME birlikte doğrulanır
- `DATA_PATH/membership_docs/{uuid}.{ext}` altında saklanır; public dizinde değildir.

Başarılı yanıt `201`:

```json
{
  "status": "pending",
  "application_id": 42,
  "message": "Başvurunuz alındı. Yönetici onayından sonra giriş yapabilirsiniz."
}
```

Hatalar:

- `409` e-posta/kullanıcı adı dolu
- `422` doğrulama hatası (Pydantic veya açık mesaj)
- `413` dosya büyük
- `400` geçersiz dosya türü/içeriği

Başvuru oturum açmaz; access/refresh token döndürmez.

## Giriş

`POST /api/auth/login`

- `membership_status == "approved"` değilse `403`:
  - pending: `{"detail": "Membership pending approval"}`
  - rejected: `{"detail": "Membership application rejected"}`
- `is_active == false` ise mevcut davranış: `401 Invalid credentials`
- Onaylı üye mevcut token akışıyla giriş yapar.

`POST /api/auth/refresh` ve `get_current_user` de `approved` olmayan kullanıcıyı reddeder.
Onay bekleyen kullanıcının eski token'ı varsa `403` döner.

## Admin uçları

Tümü `require_admin` gerektirir.

`GET /api/admin/memberships?status=pending&page=1&page_size=20`

```json
{
  "items": [
    {
      "id": 42,
      "username": "ornek",
      "email": "ornek@example.com",
      "display_name": "Örnek Üye",
      "birth_date": "2000-05-17",
      "law_status": "student",
      "law_school": "İstanbul Üniversitesi Hukuk Fakültesi",
      "graduation_year": null,
      "phone": "+90...",
      "membership_status": "pending",
      "membership_note": null,
      "document_name": "edevlet.pdf",
      "document_mime": "application/pdf",
      "application_submitted_at": "2026-11-15T18:00:00",
      "created_at": "2026-11-15T18:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

`GET /api/admin/memberships/{id}/document`

- `FileResponse`, `Cache-Control: private, no-store`
- `Content-Disposition: inline; filename="..."` (sanitize)
- Admin değilse `403`, kayıt yoksa `404`, dosya diskte yoksa `404`.

`POST /api/admin/memberships/{id}/approve`

```json
{ "status": "approved" }
```

- `membership_status=approved`, `is_verified=true`, `membership_reviewed_at=now`, `membership_reviewed_by=admin.id`
- Onay e-postası yalnızca `EMAIL_ENABLED=true` ise gönderilir; hata akışı bozmaz.

`POST /api/admin/memberships/{id}/reject`

```json
{ "reason": "e-Devlet belgesi okunamadı" }
```

- `reason` 3-500 karakter, zorunlu
- `membership_status=rejected`, `membership_note=reason`
- Kullanıcı silinmez; tekrar incelenebilir.

`GET /api/admin/stats` yanıtına `memberships_pending` alanı eklenir.

## Admin panel

- Rota: `/admin/memberships`
- `AdminNav` içinde "Üyelikler" maddesi ve bekleyen sayısı.
- Liste: durum filtresi, ad, e-posta, doğum tarihi, hukuk durumu, okul, başvuru tarihi.
- Belge: bearer token ile `fetch` edilip blob olarak yeni sekmede açılır.
- Onay ve ret (gerekçeli) işlemleri; işlem sonrası liste yenilenir.

## Frontend başvuru akışı

- Rota: `/register` (mevcut rota korunur).
- Form `FormData` ile `/api/auth/apply` çağırır.
- Başarıda token yazılmaz; teşekkür/onay bekleme ekranı gösterilir.
- Doğum tarihi, hukuk durumu, okul, e-Devlet belgesi ve KVKK olmadan submit engellenir.
- `e-Devlet` belgesi için kabul edilen türler ve 5 MB sınırı istemcide de kontrol edilir.

## Güvenlik notları

- Belge yolu asla API yanıtında dönmez; yalnızca dosya adı/MIME döner.
- Belge indirme uç noktası admin rolü olmadan erişilemez.
- Başvuru formu honeypot veya ek koruma gerektirmez; rate limit yeterlidir.
- Loglara belge içeriği, şifre veya token yazılmaz.
