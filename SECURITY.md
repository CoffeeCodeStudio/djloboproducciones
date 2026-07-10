# 🛡️ Säkerhet – DJ Lobo Producciones

Detta dokument beskriver hur säkerheten är uppsatt i projektet: åtkomstkontroll, databaspolicies, edge functions, rate limiting och HTTP-headers.

Senast uppdaterad: **2026-07-10**

---

## 1. Autentisering & Roller

### Modell
- **Auth:** Supabase Auth (email + lösenord). Inga anonyma registreringar.
- **Roller:** Enum `app_role` (`admin`, `moderator`, `user`), lagrade i separat tabell `user_roles` (aldrig på `profiles`).
- **Rollkontroll:** Security-definer-funktion `public.has_role(_user_id, _role)` används i alla RLS-policies för att undvika rekursiva loopar.

```sql
public.has_role(auth.uid(), 'admin')  -- används i policies
```

- **Klientsidan:** `useAuth.ts` läser `user_roles` direkt via RLS för att sätta `isAdmin`. Ingen roll-info sparas i `localStorage`.

---

## 2. RLS-policies per tabell

Alla publika tabeller har `ROW LEVEL SECURITY` aktiverat. Grants följer principle of least privilege.

### `bookings` (kontakt/bokningsförfrågningar)
- **INSERT:** publik (formuläret på `/prislista`)
- **SELECT / UPDATE / DELETE:** endast admin
- **CHECK-constraint:** validerar `event_type`, `package_type`

### `chat_messages` (livechat)
- **INSERT:** publik, men trigger `check_chat_rate_limit` blockerar > 5 meddelanden / 30 s per session
- **SELECT:** går via view `chat_messages_public` (döljer `session_id`)
- **UPDATE / DELETE:** endast admin
- Auto-purge äldre än 90 dagar via `pg_cron`

### `chat_bans`
- **SELECT / INSERT / UPDATE / DELETE:** endast admin
- Läses av `is_session_banned(session_id)` (security definer) innan chatt-inlägg tillåts

### `contact_submissions`
- **INSERT:** publik (kontaktformulär)
- **SELECT / UPDATE / DELETE:** endast admin

### `mixcloud_mixes`
- **SELECT:** publik (endast där `hidden = false`)
- **INSERT / UPDATE / DELETE:** admin + service_role (för edge function `fetch-mixcloud`)
- `hidden_reason` = `admin` skyddas mot auto-unhide

### `site_branding` (singleton)
- **SELECT:** publik (logo, färger, radio-URL)
- **UPDATE:** endast admin
- Känsliga värden (t.ex. `google_calendar_id`) ligger i separata `site_secrets`

### `site_secrets`
- **SELECT / INSERT / UPDATE / DELETE:** endast admin + service_role
- Aldrig exponerad publikt

### `pricing_packages` + `pricing_settings`
- **SELECT:** publik
- **INSERT / UPDATE / DELETE:** endast admin

### `promos` + `promo_events`
- **SELECT (promos där aktiv):** publik
- **INSERT / UPDATE / DELETE:** endast admin
- `promo_events` (analytics): INSERT publik, SELECT/UPDATE/DELETE admin
- Trigger `validate_promo_event_type` skyddar mot okända event-typer

### `gallery_images`
- **SELECT:** publik
- **INSERT / UPDATE / DELETE:** endast admin

### `user_roles`
- **SELECT:** authenticated (för egen kontroll)
- **INSERT / UPDATE / DELETE:** endast admin

---

## 3. Edge Functions

Alla edge functions ligger under `supabase/functions/` och körs på Deno.

| Function | Auth | Rate limit | Anteckningar |
|---|---|---|---|
| `send-contact-email` | Publik (CORS) | – | Skickar via Resend till `djloboproducciones75@gmail.com` |
| `send-booking-notification` | Publik (CORS) | 1h på DB-nivå (unique on email + timestamp) | Trigger vid bokning |
| `google-calendar` | Publik läs | Cache 5 min | Läser `google_calendar_id` från `site_secrets` med service role |
| `fetch-mixcloud` | Admin JWT ELLER `x-cron-secret` | – | CRON_SECRET från Vault, admin verifieras via `has_role` |
| `list-admin-users` | Admin JWT (`has_role`) | – | Använder service role för att läsa `auth.users` emails |
| `check-cron-jobs` | Admin JWT (`has_role`) | – | Läser `cron.job` via SECURITY DEFINER-funktion |

### JWT-verifieringsmönster
Alla admin-endpoints följer samma flöde:
1. Läs `Authorization`-header
2. Skapa anon-klient med JWT för att hämta `user`
3. Kontrollera `user_roles.role = 'admin'`
4. Först då används service role client

### CRON_SECRET
Ligger i Supabase Vault. Läses av edge functions via `get_cron_secret()` (SECURITY DEFINER). Aldrig loggad, aldrig returnerad i response.

---

## 4. Chat: Rate Limit & Ban-system

- **Rate limit:** Trigger `check_chat_rate_limit` på `chat_messages` – max 5 meddelanden / 30 sekunder per `session_id` (UUID i localStorage).
- **Ban-system:** Admin kan banna en `session_id` via `chat_bans` (med valfri `expires_at`).
- **Kontroll:** `is_session_banned(p_session_id)` läses vid varje inlägg.
- **Ingen IP-tracking** – GDPR-medvetet val, UUID-baserad session är tillräckligt för missbrukskontroll.
- **Publik view:** `chat_messages_public` döljer `session_id` från alla publika läsningar.

---

## 5. HTTP-säkerhetsheaders (`public/_headers`)

Sätts av Lovable Cloud CDN för alla routes:

```
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=(), encrypted-media=*
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.mixcloud.com https://w.soundcloud.com https://www.youtube.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://*.mixcloud.com https://*.sndcdn.com https://i.ytimg.com; media-src 'self' blob: https://stream.zeno.fm https://*.mixcloud.com https://*.sndcdn.com; frame-src https://www.mixcloud.com https://player.mixcloud.com https://w.soundcloud.com https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mixcloud.com https://api.soundcloud.com https://www.googleapis.com https://stream.zeno.fm; object-src 'none'; base-uri 'self'; form-action 'self'
```

### Motivering
- **`encrypted-media=*`** i Permissions-Policy krävs för Mixcloud DRM cross-origin
- **`object-src 'none'`** blockar `<object>`/`<embed>` (Flash-liknande vektorer)
- **`frame-src` whitelistad** – enbart Mixcloud / SoundCloud / YouTube tillåts
- **`connect-src`** exkluderar allt utanför Supabase, Google Calendar och streaming-APIer
- **`unsafe-inline` + `unsafe-eval`** i script-src är en accepterad kompromiss för Vite + widget-skript. Bör hårdare låsas om SSR införs.

---

## 6. Storage

### Bucket: `branding` (public)
- **Publik läs:** ja (logotyper, promo-bilder, DJ-foton)
- **Skriv / delete:** endast admin (RLS på `storage.objects`)
- **Filstorleksgräns:** hanteras i klienten via `ImageCropper.tsx` (2 MB / 5 MB beroende på bildtyp)
- **Format:** WebP-konvertering via Supabase `/render/image/public/` transform

---

## 7. GDPR & Data Retention

- **Bokningar:** raderas ej automatiskt – juridisk grund: fullgörande av avtal
- **Chat-meddelanden:** auto-purge > 90 dagar (`pg_cron`)
- **Cookies/localStorage:** samtyckesstamp via `CookieConsent.tsx`, ingen banner krävs (endast tekniska cookies)
- **Tredjepartsöverföringar:** Resend (USA), Mixcloud (UK), Google (USA) – dokumenterade i Privacy Policy
- **DPA/PUB-avtal:** genererade och sparade

---

## 8. Öppna punkter / Framtida förbättringar

Följande är kända men inte implementerade:

- **HIBP (Have I Been Pwned) integration** – Supabase Auth stödjer lösenordskontroll mot HIBP, men är inte aktiverat. Rekommenderat att slå på för admin-konton.
- **MFA (Multi-Factor Authentication)** – Ej aktiverat för admin-inloggning. Bör läggas till, särskilt eftersom `/admin` ger full CRUD på pris, bokningar och innehåll.
- **Öppna kontakt-endpoints utan CAPTCHA** – `send-contact-email` och `send-booking-notification` saknar bot-skydd. En hCaptcha eller Turnstile-integration bör läggas till för att förhindra spam.
- **Stramare CSP** – `'unsafe-inline'` och `'unsafe-eval'` i `script-src` kan tas bort med nonce-baserad SSR eller strict CSP-migration.
- **Audit-logg för admin-åtgärder** – Inga ändringar i `pricing_packages`, `site_branding` etc. loggas idag. En audit-tabell skulle underlätta felsökning och compliance.

---

## Rapportera säkerhetsproblem

Kontakta **Coffee Code Studio** eller `info@djloboproducciones.com` vid misstänkta sårbarheter. Rapportera ALDRIG publikt via GitHub Issues.
