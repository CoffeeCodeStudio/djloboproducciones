## Mål
1. Visa korta tips i kampanj-editorn så kunden vet rekommenderade format.
2. Eliminera svarta kanter (letterboxing) i popup-annonsen så bild/video alltid fyller rutan.

## Ändringar

### 1. `src/components/admin/PromoEditor.tsx`
Lägg till två små hjälptexter (`<p className="text-xs text-muted-foreground">`) — minimalt och i linje med befintlig stil.

- Under **Flyer-bild (1:1)**-fältet (efter `</div>` på rad ~387):
  > *Tips: Kvadratisk (1080×1080), max 2 MB.*

- Under **video-uppladdningsknappen** inuti `mediaType === "video"`-blocket (rad ~470):
  > *Tips: Kvadratisk, max 15 sek, utan ljud, max 50 MB.*

### 2. `src/components/PromoPopup.tsx` (rad 696–726)
Ändra media-containern från fri höjd + `object-contain` till **kvadratisk + `object-cover`**:

- Ta bort `style={{ maxHeight: "40vh" }}` på wrappern och ge den `aspect-square` istället.
- `<video>`: byt `w-full h-auto max-h-[40vh] object-contain` → `w-full h-full object-cover`.
- `<img>`: byt `w-full h-auto max-h-[40vh] object-contain` → `w-full h-full object-cover`.
- YouTube `<iframe>`-grenen lämnas oförändrad (16:9 video kan inte kvadratbeskäras utan att klippa ansikten — `aspect-video` med `object-cover` bibehålls). Alternativt kan vi byta även den till `aspect-square` om du vill ha helt enhetligt utseende — säg till.

`PromoMiniCard.tsx` använder redan `object-cover` och behöver inte röras.

## Resultat
- Kunden ser tipsen direkt i editorn — ingen behov av att läsa guiden.
- Uppladdade kvadratiska bilder/videor fyller hela popup-rutan utan svarta kanter. Om kunden ändå laddar upp icke-kvadratiskt material beskärs det automatiskt (cover) istället för att letterboxas.
