# CLAUDE.md — Honeymoon-app (Abdul & Lilia)

## Project
Huwelijksreis-app voor Abdul & Lilia. Indonesie (Lombok/Gili/Bali), 12 juni - 24 juli 2026.
Live: https://honeymoon-app.netlify.app
GitHub: https://github.com/CreatiefSalamander/honeymoon-app

## Stack
- Next.js 15 App Router + JavaScript (geen TypeScript)
- Supabase (krvjhuvgjywhhxycirub.supabase.co)
- Anthropic SDK (AI chat)
- Framer Motion, Recharts, Leaflet
- Tailwind CSS, Playfair Display + DM Sans fonts
- PWA + Web Push VAPID
- i18n: NL/EN/Armeens via useLanguage hook
- Hosting: Netlify

## Paginas (app/)
- / (page.js) - Home: countdown, weer, budget, agenda, AI tip
- /ontdek - Explore: Google Places, Leaflet kaart, 443 regels
- /agenda - Kalender en tijdlijn
- /budget - Budget tracker EUR/IDR
- /reis - Tijdlijn Lombok-Gili-Bali
- /vluchten - Vluchttracker (AviationStack)
- /weer - Weersverwachting
- /dagboek - Reisdagboek
- /fotos - Fotos en herinneringen
- /lijsten - Paklijst en bucketlist
- /favorieten - Opgeslagen plekken
- /activiteiten - Activiteiten
- /notities - Notities
- /meldingen - Notificaties
- /meer - Extra menu
- /instellingen - Taal, gebruiker, notificaties

## API routes (app/api/)
- /api/chat - Claude AI proxy
- /api/places - Google Places proxy
- /api/weather - OpenWeatherMap
- /api/currency - Wisselkoersen
- /api/flight - Vluchtdata
- /api/budget - Budget operaties
- /api/reviews - Reviews

## Components
- AIChat.js, BottomNav.js (+ Sidebar), BudgetChart.js
- CountdownTimer.js, FloatingAI.js, SplashScreen.js

## Lib
- lib/i18n.js - Meertaligheid
- lib/supabase.js - Supabase client + queries
- lib/tripContext.js - Trip-wide state provider

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
