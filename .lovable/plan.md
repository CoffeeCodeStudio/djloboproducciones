
# Ändringar i admin-panelen

Nedan visas exakt vad jag tänker göra. Inget sparas förrän du säger OK.

---

## 1. Stream-URL flyttas till admin

**Databas (migration):**
- Ny kolumn `radio_stream_url TEXT` i `site_branding` (default: `'https://stream.zeno.fm/gzzqvbuy0d7uv'`).

**Kod:**
- `src/hooks/useBranding.ts` → exportera `radioStreamUrl`.
- `src/components/admin/RadioTab.tsx` → nytt textfält "Stream-URL (ZenoFM)" med Spara-knapp.
- `src/components/NowPlayingBar.tsx` → använd `branding.radioStreamUrl` med fallback till hårdkodad URL om tom.

**Frågor:**
- Ska även Footer-länken `zeno.fm/radio/dj-lobo-radio-o85p/` (spelar-sidan) flyttas till admin i samma veva? Idag frågade jag om detta tidigare — säg till om ja så lägger jag till en andra kolumn `radio_player_url`. Annars lämnar jag den orörd.

---

## 2. Prisredigerare i admin

**Databas (migration):**
- Ny tabell `public.pricing_packages`:
  - `key` (basic/standard/premium)
  - `sort_order`, `price` (text, t.ex. "7 000"), `active`
  - Namn + beskrivning per språk: `name_sv/en/es`, `guests_sv/en/es`
- RLS: publik SELECT, admin ALL. GRANT till anon/authenticated/service_role.
- Seedas med nuvarande värden från `PricingGrid.tsx`.

**Kod:**
- Ny flik i admin: **"Priser"** (egen flik – tydligare än under Hem).
- `src/components/admin/PricingTab.tsx` – tre kort (Basic/Standard/Premium) med fält: Pris, Namn (SV/EN/ES), Beskrivning gäster (SV/EN/ES). Spara per paket.
- `src/components/PricingGrid.tsx` → läser från DB istället för hårdkodad array. Behåller översatta statiska texter (timmar, ljud/ljus, CTA osv.) – bara paketnamn/pris/gäster blir redigerbara.

**Fråga:**
- OK att bara pris + paketnamn + gäst-text är redigerbara? Eller vill du också kunna ändra "4 timmar spelning", "Ljud & ljus ingår", tillägg-priset osv.? (Jag rekommenderar att börja litet – kan utökas senare.)

---

## 3. Radera Utrustning

- Ta bort flik i `SpelningarTab.tsx` (blir bara Kalender kvar → förenkla till att rendera `ScheduleTab` direkt, eller behålla som är?).
- Radera filer: `src/components/admin/EquipmentTab.tsx`, `src/components/EquipmentSection.tsx`.
- Ta bort `equipment`-referenser i `BookingSection.tsx`.
- Migration: `DROP TABLE public.equipment CASCADE;`

**Fråga:**
- `EquipmentSection.tsx` – används den på någon publik sida (t.ex. prislistan)? Jag kollar och rapporterar, men bekräfta gärna att du vill ta bort helt även för besökare.

---

## 4. Oanvända filer

Bekräftat: `BioTab.tsx` och `MixcloudTab.tsx` importeras ingenstans (verifierat via sökning i `src/`).
→ Radera båda.

---

## 5. Guiden (HelpTab)

Konkreta ändringar:
- Filstorlek: "max 1 MB" → **"max 2 MB"** (5 MB där det gäller större bilder – jag dubbelkollar mot faktiska limits i uppladdningskomponenterna först).
- "Klicka på bilderna" → **"Klicka på Ladda upp-knappen"**.
- Ny kort sektion: **"Beskär bilden"** — förklarar att en beskärare öppnas efter uppladdning så du kan välja utsnitt innan du sparar.
- Flytta "Sajtnamn/Tagline"-instruktionen från Utseende-sektionen till **Hem-sektionen**.
- "API-nyckeln uppdateras via Lovable Chat" → **"Kontakta Coffee Code Studio om nyckeln behöver bytas."**
- Språkgenomgång: korta meningar, inga tekniska termer (byter ut "endpoint", "credentials", "RLS" osv. mot vardagsspråk).
- Lägg till saknade sektioner: **Reklam** och **Konto** (som saknades helt).

---

## Ordning för genomförande

1. Migration (stream-URL + pricing_packages + drop equipment) – kräver din approval.
2. Kod-ändringar efter att migrationen är körd och types regenererats.
3. Radering av oanvända filer.
4. HelpTab-omskrivning.

**Rör inte navbar** – bekräftat.

---

## Vänta med svar på:
1. Footer ZenoFM-länk också till admin? (ja/nej)
2. Prisredigerare – bara pris/namn/gäster, eller även övriga rader? 
3. `EquipmentSection` – bekräfta radering även från publik sida.

Säg "kör" så börjar jag med migrationen.
