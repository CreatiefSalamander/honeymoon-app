# 💍 Honeymoon HQ — Eindrapport

> **🔴 LIVE:** https://honeymoon-app-v2.netlify.app — dit is **Honeymoon-app v2** (de echte app).
> De oude app (`honeymoon-app.netlify.app`, Next.js/cream) = **v1**, blijft als archief staan.

## 🔎 Zelf-analyse v2 (wat ik nagekeken & toegevoegd heb)
Ik heb mijn eigen werk vergeleken met al je eerdere wensen. Toegevoegd in deze ronde:
- ✅ **Persoonlijk login-scherm** (Abdul / Lilia) met sfeerfoto — kiest wie de telefoon is.
- ✅ **Agenda = echt rooster**: week-strip + uur-tijdlijn (07:00–23:00) met grote gekleurde blokken (geen lelijke witte vakken). Tik een blok → opmerking noteren, suggesties zoeken, route, verwijderen. Toevoegen zonder ouderwets datum-prutsen (de gekozen dag staat al klaar).
- ✅ **Gedeelde chat + @claude**: jij en Lilia in één chat, realtime gesynct. Claude leest mee en antwoordt zodra je **@claude** typt (en springt af en toe spontaan bij) — als coworker die plekken/agenda/budget voorstelt.
- ✅ **Vergeten pagina's teruggezet & werkend**: 📸 Dagboek (foto's uploaden/liken/lightbox), 🔔 Meldingen (wie deed wat, realtime), ❤️ Favorieten, ⛅ Weer (jouw locatie + Lombok + Bali), ✈️ Vluchten (zoek & vergelijk + boarding-pass scannen + live status).
- ✅ **Soepelere nihi-achtige glij-overgangen** + **swipe tussen álle pagina's**.
- ✅ **Alles gekoppeld**: foto/uitgave/reis-plek → verschijnt in Meldingen; plek uit Explore/Favorieten → in Agenda → kosten → in Budget.
- ✅ **Live & veilig**: AI werkt (server-side key), Supabase synct tussen telefoons, alle externe calls via Netlify-functies (geen sleutels in de app).

### Nog te activeren (3 gratis sleutels — anders nette fallback):
| Functie | Sleutel |
|---|---|
| Live plekken + foto's in Explore | `GOOGLE_PLACES_API_KEY` |
| Echte weergegevens | `OPENWEATHER_API_KEY` |
| Live vluchtstatus (gate/vertraging) | `AVIATIONSTACK_KEY` |

De ingebouwde **kaartweergave** in Explore werkt al (Google-kaart-embed, zónder sleutel); een kaart met geclusterde pins is de volgende verfijning.

---

> Origineel v4-rapport hieronder.

## ✦ Wat veranderde in de restyle (v4.1)
- **Donker premium glas-thema** (#0A1628 + goud) is nu de standaard-look; "Horizon licht" blijft als toggle in Instellingen.
- **Zwevend telefoon-frame** op een zachte lichte achtergrond op desktop (met grote zachte schaduw, ronde hoeken); full-screen op mobiel.
- **Slide-out menu** vervangt de onderbalk: open via de menuknop linksboven óf swipe vanaf de linkerrand. Met lijn-iconen + mini-foto's (Lombok, snorkelen, skydive) en gouden accent op de actieve pagina.
- **Soepele glij-overgangen** tussen pagina's (Framer Motion, horizontale slide + fade), respecteert "reduce motion".
- **Zwevende gouden AI-knop** (✦) op elke pagina.
- Alle functies, teksten (EN/NL/Armeens) en data ongewijzigd behouden.

---


Herbouw van de Indonesië-huwelijksreisapp (Abdul & Lilia) op een moderne, onderhoudbare stack.
Gebouwd op branch **`v4-vite`** in de map **`hq/`** — je huidige live app op `main` blijft volledig ongemoeid.

---

## 1. Wat is er gedaan

**Nieuwe stack** (zoals de family-app, dus kennis is overdraagbaar):
Vite + React 18 + TypeScript + Tailwind + react-i18next + Chart.js + Supabase + vite-plugin-pwa.

> **Belangrijke ontdekking vooraf:** de repo's `abdulilia` en `honeymoon-app` zijn **dezelfde repository** (één is een hernoeming van de ander). De "oude vanilla `index.html`" is veiliggesteld in **`legacy/index.html`** (1216 regels) én blijft in de git-historie (commit `82fc23f`). Niets verloren.
>
> De brief noemde Firebase, maar de legacy app gebruikte zelf al **Supabase** — en jij koos "blijf bij Supabase". Daarom: Firebase-datamodel uit de brief → vertaald naar Supabase-tabellen.

### Per pagina

| Pagina | Status | Behouden uit oud / Nieuw |
|---|---|---|
| 🏠 **Home** | ✅ | Countdown (vóór/tijdens reis), hero met jullie foto, weer-widget, budget-mini, AI-tip van de dag, snel-ontdekken-rij, FAB |
| 🗓️ **Agenda** | ✅ | Dag-tijdlijn, lege-dag-detectie + "rustdag", afstand tussen items, `.ics`-export naar iPhone-agenda, zelf toevoegen |
| 📍 **Explore** | ✅ | **Alle 11 activiteiten behouden** (zwemmen, paardrijden, skydive, parasailing, snorkelen, diner, boot, massage, koken, goud, duiken) met providers/prijzen/telefoon/allergie-notities. + live Google Places zoeken, categorieën, "plan in agenda"-flow die ook het budget bijwerkt |
| 💰 **Budget** | ✅ | Totaal €7000 / basis €4200 behouden, donut (Chart.js), per-categorie, EUR↔IDR live koers, status-tips (groen/geel/rood), transacties |
| 🥾 **Bucketlist** | ✅ | Voorgevuld (20 items incl. de zakelijke KvK/ondernemingsvragen en het grappige "Lilia opeten"), afvinken met confetti, "vind in de buurt", eigen items |
| ✈️ **Reisplan** | ✅ | Lombok (12 jun–10 jul) + Gili/Bali (10–24 jul) + solo-leg Yerevan, highlights, weer per bestemming, notities, route, "ontdek hier" |
| 🧳 **Paklijst** | ✅ | Alle items behouden (Documenten/Gezondheid+allergie/Kleding/Tech), inklapbaar, afvinkbaar, voortgang |
| 💬 **AI Chat** | ✅ | Via serverfunctie (key verborgen), kent reis/allergie/budget, trilingual snelvragen, gedeelde conversatie |
| ⚙️ **Instellingen** | ✅ | Volledig: wie-is-deze-telefoon, taal, thema (Licht/Nacht), animaties, alle notificatie-opties, Explore/kaart, budget, locatie, verbindingsstatus |
| 👤 **Profiel** | ✅ | Datateller, Bahasa-zinnenkaart, noodinfo (alarmnummers Indonesië + ambassade) |

**Talen:** Engels (standaard), Nederlands, Armeens — alle teksten via i18n-JSON (`src/locales/`). Alle bestaande teksten gemigreerd.

---

## 2. Wat werkt 100% / gedeeltelijk / niet

**✅ Werkt nu volledig** (ook zonder extra keys, dankzij localStorage-cache):
Navigatie, talen, alle pagina's, activiteiten, paklijst, bucketlist, agenda met `.ics`-export, budget met grafieken & valutakoers, thema's, PWA-installatie, offline app-shell.

**🟡 Werkt zodra Abdul de keys zet** (zie §3):
- AI-tip & AI-chat → `ANTHROPIC_API_KEY`
- Live plekken zoeken + foto's in Explore → `GOOGLE_PLACES_API_KEY`
- Weer → `OPENWEATHER_API_KEY`
- Gedeelde sync tussen 2 telefoons → `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- Push-notificaties → VAPID-keys

**🟠 Gedeeltelijk / bewust vereenvoudigd (betrouwbaar boven breekbaar):**
- **Kaart met clustering**: Explore is nu lijst-eerst met live foto's + "open in Google Maps"-knop per plek. De in-app geclusterde kaart (`@vis.gl/react-google-maps`) is een gedocumenteerde volgende stap — bewust uitgesteld om de build stabiel te houden. De `VITE_GOOGLE_MAPS_API_KEY` staat al klaar in `.env.example`.
- **Push op iPhone**: werkt alleen als de app via Safari op het beginscherm staat (iOS 16.4+). Het proactieve brein (`scheduled-engine`) draait server-side op Netlify-cron en stuurt suggesties o.b.v. agenda + laatst bekende locatie.

**🔴 Kan niet in Fase 1 (iOS-grens):**
- Continue achtergrond-locatie & geofencing ("je loopt nu langs iets leuks" terwijl de telefoon op zak zit en de app dicht is). Apple staat dit niet toe voor web-apps. → **Fase 2 (Capacitor)**, zie §6.

---

## 3. Alle keys / env-vars (waar vandaan, waar in Netlify)

Zet deze in **Netlify → jouw nieuwe site → Site settings → Environment variables**.
`VITE_`-prefix = mag in frontend (publiek). Zonder prefix = alleen server.

| Variable | Waar vandaan |
|---|---|
| `VITE_SUPABASE_URL` | supabase.com → project → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | zelfde pagina → anon public key |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `GOOGLE_PLACES_API_KEY` | console.cloud.google.com → Places API (New) inschakelen → Credentials → API Key |
| `VITE_GOOGLE_MAPS_API_KEY` | zelfde, aparte key → beperk tot je Netlify-domein (Maps JavaScript API) |
| `OPENWEATHER_API_KEY` | openweathermap.org → API keys (gratis) |
| `VITE_VAPID_PUBLIC_KEY` + `VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` → publieke key (in beide) |
| `VAPID_PRIVATE_KEY` | zelfde commando → private key (alleen server) |

---

## 4. Stap-voor-stap voor Abdul

1. **Nieuwe Netlify-site** koppelen aan deze repo, branch `v4-vite`:
   - Base directory: `hq`
   - Build command: `npm run build` · Publish: `dist` (staat al in `hq/netlify.toml`)
2. **Env-vars** toevoegen (§3). Supabase-keys kun je hergebruiken van je huidige app.
3. **VAPID genereren**: lokaal `npx web-push generate-vapid-keys` → keys in Netlify zetten.
4. **Google Cloud**: Places API (New) + Maps JavaScript API aanzetten, billing koppelen (gratis tot een volume), Maps-key beperken tot je Netlify-domein.
5. **OpenWeather** gratis key ophalen → in Netlify.
6. **Supabase-tabellen** (zie §5) aanmaken als ze nog niet bestaan.
7. **Op de iPhone** (beide): Safari → je nieuwe site-URL → Deel → "Zet op beginscherm" → openen → Instellingen → kies wie de telefoon is → locatie + meldingen toestaan.
8. Tevreden? Dan kun je `v4-vite` naar `main` mergen en de hoofd-site omzetten.

---

## 5. Supabase-tabellen (te plakken in SQL Editor)

```sql
create table if not exists itinerary (id uuid default gen_random_uuid() primary key, date date, time_slot text, activity text, title text, location text, lat float8, lng float8, place_id text, type text, price numeric, created_by text, created_at timestamptz default now());
create table if not exists expenses (id uuid default gen_random_uuid() primary key, amount numeric, category text, description text, date date, paid_by text, currency text default 'EUR', created_at timestamptz default now());
create table if not exists budget (id uuid default gen_random_uuid() primary key, total_budget numeric default 7000, currency text default 'EUR');
create table if not exists saved_places (id uuid default gen_random_uuid() primary key, place_id text unique, name text, category text, lat float8, lng float8, data jsonb, created_at timestamptz default now());
create table if not exists list_items (id text primary key, checked boolean default false, meta jsonb);
create table if not exists chat_messages (id uuid default gen_random_uuid() primary key, role text, content text, name text, created_at timestamptz default now());
create table if not exists phone_location (phone text primary key, lat float8, lng float8, updated_at timestamptz);
create table if not exists push_subscriptions (phone text primary key, subscription jsonb);

alter table itinerary disable row level security;
alter table expenses disable row level security;
alter table budget disable row level security;
alter table saved_places disable row level security;
alter table list_items disable row level security;
alter table chat_messages disable row level security;
alter table phone_location disable row level security;
alter table push_subscriptions disable row level security;
```

> **Beveiliging:** dit is een privé-app voor 2 personen. RLS staat hierboven uit voor eenvoud. Wil je het dichttimmeren: zet RLS aan en voeg een policy toe die een gedeeld geheim controleert, of gebruik Supabase Auth met 2 accounts. (Aanbevolen vóór je gevoelige data toevoegt.)

---

## 6. Fase 2 — native iOS (Capacitor)

Doel: échte achtergrond-locatie + geofencing + native push, ook met app dicht.
De codebase is er klaar voor: alle platform-logica zit geïsoleerd in `src/lib/push.ts`, `src/lib/geo.ts`, `src/lib/notify.ts`. In Fase 2 vervang je **alleen de binnenkant** van die drie bestanden.

Stappen (later, vereist Apple Developer-account + Mac/Xcode):
```
npm i @capacitor/core && npm i -D @capacitor/cli
npx cap init   # config staat al klaar in capacitor.config.ts
npx cap add ios
# plugins:
npm i @capacitor/push-notifications @capacitor/geolocation @capacitor/app @capacitor/splash-screen
npm i @capacitor-community/background-geolocation   # geofencing
npx cap sync && npx cap open ios
```
Zie `capacitor.config.ts` voor app-id, naam en de plugin-lijst.

---

## 7. Bekende aandachtspunten / TODO

- **In-app kaart met clustering** toevoegen (`@vis.gl/react-google-maps`) — nu lijst + externe Maps-link.
- **Eigen foto's/video** in `hq/public/assets/` plaatsen (`couple-a.jpg`, `couple-b.jpg`, `lilia.mp4`) — nu nette Unsplash-fallback.
- **App-icons** in `hq/public/icons/` (192/512 px) voor de PWA-homescreen-icoon.
- **RLS** aanzetten in Supabase vóór gevoelige data.
- Bundle is 686 kB — prima voor nu; later code-splitten als gewenst.

---

## 8. Wat ik extra toevoegde (§10) en waarom

- **Twee thema's** (Horizon Light + Night Ocean) in Instellingen — je vroeg eerder om de "horizon stijl" en "niet te donker"; nu kies je zelf.
- **Bahasa-zinnenkaart + noodinfo** onder Profiel — praktisch en offline.
- **`.ics`-export per agenda-item** met ingebouwde herinnering (−1u) — werkt direct op iPhone zonder login.
- **Budget-koppeling vanuit Explore**: plan je een activiteit met prijs, dan stroomt die direct in het budget.
- **Offline-first**: zonder Supabase werkt alles via localStorage; zodra keys er zijn synct het tussen telefoons.

---

*Gemaakt met ❤️ voor Abdul & Lilia. Veilig getest op een aparte branch — je live app draait gewoon door.*
