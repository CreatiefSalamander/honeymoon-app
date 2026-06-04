# CLAUDE.md — Honeymoon-app (Abdul & Lilia)

## Project
Huwelijksreis-app voor Abdul & Lilia. Indonesie (Lombok/Gili/Bali), 12 juni - 24 juli 2026.
Live: https://honeymoon-app.netlify.app
GitHub: https://github.com/CreatiefSalamander/honeymoon-app
Status: **Ver gevorderd — alle 16 pagina's aanwezig**

## Stack
- Next.js **14.2.5** App Router + JavaScript (**geen TypeScript**)
- React 18
- Supabase (krvjhuvgjywhhxycirub.supabase.co)
- Anthropic SDK (AI chat)
- Framer Motion, Recharts, Leaflet
- Tailwind CSS 3, Playfair Display + DM Sans fonts
- PWA + Web Push VAPID
- i18n: NL/EN/Armeens via useLanguage hook
- Hosting: Netlify

## Paginas (app/) — alle aanwezig ✅
- [x] / (page.js) - Home: countdown, weer, budget, agenda, AI tip
- [x] /agenda - Kalender en tijdlijn
- [x] /ontdek - Explore: Google Places, Leaflet kaart
- [x] /budget - Budget tracker EUR/IDR
- [x] /reis - Tijdlijn Lombok-Gili-Bali
- [x] /vluchten - Vluchttracker (AviationStack)
- [x] /weer - Weersverwachting
- [x] /dagboek - Reisdagboek
- [x] /fotos - Fotos en herinneringen
- [x] /lijsten - Paklijst en bucketlist
- [x] /favorieten - Opgeslagen plekken
- [x] /activiteiten - Activiteiten
- [x] /notities - Notities
- [x] /meldingen - Notificaties
- [x] /meer - Extra menu
- [x] /instellingen - Taal, gebruiker, notificaties

## API routes (app/api/) — alle aanwezig ✅
- [x] /api/chat - Claude AI proxy
- [x] /api/places/nearby + details + photo - Google Places proxy
- [x] /api/weather - OpenWeatherMap
- [x] /api/currency - Wisselkoersen
- [x] /api/flight/search + status + parse - Vluchtdata
- [x] /api/budget/scan - Budget operaties
- [x] /api/reviews - Reviews

## Components
- AIChat.js, BottomNav.js (+ Sidebar), BudgetChart.js
- CountdownTimer.js, FloatingAI.js, SplashScreen.js

## Lib
- lib/i18n.js - Meertaligheid (NL/EN/Armeens)
- lib/supabase.js - Supabase client + queries
- lib/tripContext.js - Trip-wide state provider
- lib/activityLog.js - Activiteitenlog

## Env vars (instellen op Netlify)
- NEXT_PUBLIC_SUPABASE_URL (al in netlify.toml)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (al in netlify.toml)
- ANTHROPIC_API_KEY
- GOOGLE_PLACES_API_KEY
- OPENWEATHER_API_KEY
- VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY

## Supabase tabellen
countdown, itinerary, budget, expenses, app_checks

## Belangrijk
- Twee gebruikers: Abdul + Lilia (2 iPhones)
- PWA installatie via Safari: Deel -> Zet op beginscherm
- Push notificaties: Web Push VAPID (server-side, geen Firebase)
- Kaart: Leaflet met live avatars (Snapchat-stijl)
- legacy/ map = oude versies, niet actief
- hq/ map = v2 feature set

## Gouden regels
1. Lees dit bestand EERST — altijd
2. Verander NOOIT de tech stack zonder toestemming
3. Schrijf altijd kleine gerichte wijzigingen — nooit alles tegelijk herschrijven
4. Framer Motion zit al in het project — gebruik voor alle animaties
5. Na elke sessie: update dit bestand + push naar GitHub
6. Code-comments in het Nederlands
7. Bij twijfel: vraag eerst, doe daarna

## Sessie Log
| Datum | Wat gedaan | Wat volgende keer |
|-------|-----------|-------------------|
| 2026-06-04 | CLAUDE.md bijgewerkt: Next.js versie gecorrigeerd naar 14.2.5, alle 16 pagina's afgevinkt, status toegevoegd | — |
