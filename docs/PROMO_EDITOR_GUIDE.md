# 📣 Guide: Kampanj-editorn (Promo Editor)

> **Vad är detta?**
> "Redigera kampanj" / "Skapa ny kampanj" är admin-dialogen där du bygger
> reklamkampanjer som syns på sajten — som popup, mini-spelare eller
> mobilbanner. Detta är samma verktyg som styr alla annonser och flyers
> som besökarna ser.

**Plats i admin:** `/admin` → fliken **Kampanjer (Promos)** → klicka på en kampanj eller "+ Ny kampanj".

**Filer:**
- UI: `src/components/admin/PromoEditor.tsx`
- Lista: `src/components/admin/PromosTab.tsx`
- Datalager: `src/hooks/usePromosAdmin.ts`
- Visning på sajten: `src/components/PromoManager.tsx`, `PromoPopup.tsx`, `PromoMiniCard.tsx`

---

## 🧩 Sektioner i editorn

Dialogen är uppdelad i **3 sektioner**:

### 1. Innehåll
Det som besökaren faktiskt ser.

| Fält | Beskrivning | Begränsning |
|------|-------------|-------------|
| **Titel** ⭐ obligatorisk | Stora rubriken på popupen | Max 80 tecken |
| **Undertitel** | Liten textrad under titeln | Max 120 tecken |
| **Flyer-bild (1:1)** | Kvadratisk bild som visas i popup + som fallback om ingen video finns | Max 2 MB, beskärs automatiskt till 1:1 |
| **Media-typ** | Välj mellan: `Ingen video`, `Ladda upp video`, `YouTube-länk` | Endast en åt gången |
| **Uppladdad video** | MP4-fil som loopar autoplay i mini-spelaren | Max **50 MB** |
| **YouTube-länk** | Använd istället för video-fil om filen är för stor | youtube.com / youtu.be |
| **CTA-knapp text** | T.ex. "Köp biljett", "Läs mer" | Visas bara om URL finns |
| **CTA-knapp URL** | Vart knappen länkar | Full URL inkl. https:// |

> 💡 **Bästa praxis:** Använd YouTube-länk för längre videor — det sparar lagring och är gratis. Egen MP4 är bäst för korta loopar (5–15 sek) utan ljud.

### 2. Tids-styrning
Bestämmer **när** kampanjen är aktiv.

Två lägen via radioknappar:

- **Koppla till Google Calendar-event** — Välj ett kommande event från `djloboproducciones75@gmail.com`. Systemet sätter automatiskt:
  - `Aktiv från` = 14 dagar före eventet
  - `Aktiv till` = 1 dag efter eventet
- **Ange datum manuellt** — Du väljer själv start- och slutdatum med kalender-pickern.

> ⚠️ Slutdatum måste vara **efter** startdatum, annars vägrar systemet spara.

### 3. Inställningar
Hur kampanjen prioriteras och om den körs.

| Fält | Beskrivning |
|------|-------------|
| **Prioritet** (0–10) | Om flera kampanjer är aktiva samtidigt visas den med högst siffra först |
| **Aktiv** (toggle) | Master-switch. Av = kampanjen visas inte, oavsett datum |

---

## 🎬 Hur visas kampanjen för besökaren?

Allt styrs av `PromoManager.tsx`. Logiken:

1. **Första besöket** → Stor popup mitt på skärmen (`PromoPopup`).
2. **Användaren stänger** → Tidsstämpel sparas i `localStorage` (24-timmars cooldown).
3. **Återkommande besök inom 24h** → Liten mini-spelare:
   - **Desktop:** flytande kort längst ner till höger
   - **Mobil (<768px):** helbredds-banner inuti mix-griden efter 4:e mixen
4. **Stäng mini-spelaren** → Försvinner för resten av webbläsar-sessionen
5. **"Visa inte igen"** → Permanent dolt via `localStorage`

Se: `src/components/PromoManager.tsx` rad 6–10 för storage-nycklarna.

---

## 🔘 Knappar längst ner i dialogen

| Knapp | Funktion |
|-------|----------|
| **Avbryt** | Stänger utan att spara |
| **Förhandsgranska** | Öppnar en livevisning av popupen exakt som besökaren ser den |
| **Spara** | Validerar och sparar till databasen (`promos`-tabellen) |

---

## ✅ Snabb checklista innan du sparar

- [ ] Titel är ifylld och max 80 tecken
- [ ] Antingen flyer-bild **eller** video är uppladdad (helst båda — bild används som fallback)
- [ ] Datumen är satta och slutdatum är efter startdatum
- [ ] CTA-knappen har både text **och** URL (eller ingen av dem)
- [ ] "Aktiv" är på om du vill att den ska synas direkt
- [ ] Klicka **Förhandsgranska** för att se hur det blir

---

## 🛠 Vanliga felmeddelanden

| Fel | Orsak | Lösning |
|-----|-------|---------|
| "Videon är för stor. Max 50 MB" | MP4-filen för stor | Komprimera eller använd YouTube-länk |
| "Bilden är för stor (max 2 MB)" | Flyer för stor | Optimera i t.ex. squoosh.app |
| "Ogiltig YouTube-länk" | Fel URL-format | Använd hela `https://youtube.com/watch?v=...` |
| "Välj ett kalender-event" | Källa = Calendar men inget event valt | Välj från dropdown eller byt till "Manuellt" |
