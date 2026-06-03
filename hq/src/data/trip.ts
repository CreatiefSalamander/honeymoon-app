// ══════════════════════════════════════════════════════════════
//  TRIP DATA — gemigreerd uit de legacy app (niets verloren)
//  Indonesië: Lombok → Gili → Bali · 12 jun – 24 jul 2026
// ══════════════════════════════════════════════════════════════

export type Lang = 'en' | 'nl' | 'hy'
export type LocalText = { en: string; nl: string; hy?: string }

export const TRIP = {
  start: '2026-06-12',
  end: '2026-07-24',
  soloLeg: { en: 'Netherlands → Yerevan · Jun 8 (before we meet)', nl: 'Nederland → Yerevan · 8 jun (voordat we samen zijn)', hy: 'Նիդեռլանդներ → Երևան · հունիս 8' },
  budgetTotal: 7000,
  budgetBase: 4200,
}

export const DESTINATIONS = [
  {
    id: 'lombok',
    name: { en: 'Selong Belanak, Lombok', nl: 'Selong Belanak, Lombok', hy: 'Սելong Բելանաk, Լոմբոկ' },
    location: 'South Lombok, Indonesia',
    address: 'Selong Belanak, Lombok Tengah, NTB 83573',
    checkIn: '2026-06-12', checkOut: '2026-07-10',
    weekBadge: { en: 'Weeks 1–4', nl: 'Weken 1–4', hy: '1–4 Շաբաթ' },
    allergy: { en: 'No jungle or rice fields — right by the sea', nl: 'Geen jungle of rijstvelden — direct aan zee', hy: 'Ոչ ջունգլի, ոչ բրնձի դաշտեր — ծովի մոտ' },
    lat: -8.906, lng: 116.012,
    img: 'https://images.unsplash.com/photo-1559628233-100c798642d4?w=1000&q=80&auto=format&fit=crop',
    highlights: [
      { en: 'Pristine white-sand beach — one of the most beautiful in Lombok', nl: 'Prachtig wit zandstrand — een van de mooiste van Lombok' },
      { en: 'Dry season Jun–Jul: ideal weather, little rain', nl: 'Droogseizoen jun–jul: ideaal weer, weinig regen' },
      { en: 'Horse riding on the beach available', nl: 'Paardrijden op het strand mogelijk' },
      { en: 'Local Sasak culture and authentic food', nl: 'Lokale Sasak cultuur en authentiek eten' },
      { en: 'Gili Islands just 30 min by speedboat', nl: 'Gili eilanden op 30 min speedboat' },
    ],
  },
  {
    id: 'bali',
    name: { en: 'Gili Air or Uluwatu, Bali', nl: 'Gili Air of Uluwatu, Bali', hy: 'Գիլի Էյր կամ Ուլուվատու, Բալի' },
    location: 'Gili Islands / Bali',
    address: '— to be confirmed —',
    checkIn: '2026-07-10', checkOut: '2026-07-24',
    weekBadge: { en: 'Weeks 5–6', nl: 'Weken 5–6', hy: '5–6 Շաբաթ' },
    allergy: null,
    lat: -8.356, lng: 116.083,
    img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1000&q=80&auto=format&fit=crop',
    highlights: [
      { en: 'Option A: Gili Meno — smallest Gili, most romantic', nl: 'Optie A: Gili Meno — kleinste Gili, meest romantisch' },
      { en: 'Option B: Nusa Penida, Bali — dramatic cliffs & top snorkelling', nl: 'Optie B: Nusa Penida — dramatische kliffen & topsnorkelen' },
      { en: 'Option C: Komodo/Flores — overwater villa, manta rays', nl: 'Optie C: Komodo/Flores — overwater villa, mantaroggen' },
      { en: 'Option D: Stay longer in Lombok and explore more', nl: 'Optie D: Langer in Lombok blijven' },
    ],
  },
]

export type Provider = { name: string; price: string; phone: string; addr: string; url: string; rating: string }
export type Activity = {
  id: string; icon: string; cat: string; phase: string; price: string
  name: LocalText; desc: LocalText; allergy: LocalText | null
  img: string; providers: Provider[]
}

export const ACTIVITIES: Activity[] = [
  { id:'swim', icon:'🏊', cat:'learn', phase:'🇮🇩🏝️', price:'€25–45/les',
    name:{ en:'Sea Swimming Lessons', nl:'Zwemlessen in zee', hy:'Ծովում լողի դասեր' },
    desc:{ en:'Private lessons in open sea with certified coach. After 5–10 lessons you\'ll swim confidently. Sea only — no pool (chlorine allergy).', nl:'Privélessen in open zee. Na 5–10 lessen zwem je zelfverzekerd. Alleen zee — geen zwembad ivm chloorallergie.', hy:'Անհատական դասեր բաց ծովում հավատարմագրված մարզչի հետ:' },
    allergy:{ en:'💧 100% safe — sea only, no chlorine', nl:'💧 100% veilig — alleen zee, geen chloor', hy:'💧 Անվտանգ — միայն ծով, ոչ քլոր' },
    img:'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'JustSwim Bali', price:'€35/les', phone:'+62 813-3757-2580', addr:'Seminyak, Bali', url:'https://justswim.co.id', rating:'⭐ 4.9' },
      { name:'Lombok Beach Coach', price:'€25/les', phone:'+62 878-6500-0001', addr:'Selong Belanak', url:'', rating:'⭐ 4.7' },
    ]},
  { id:'horse', icon:'🐴', cat:'learn', phase:'🇮🇩', price:'€25–60/sessie',
    name:{ en:'Horse Riding on the Beach', nl:'Paardrijden op strand', hy:'Ձիավարություն ծովափին' },
    desc:{ en:'Beginner lessons on the white sand beach of Selong Belanak. Ride together along the waterfront at sunset.', nl:'Beginnerslessen op het witte strand van Selong Belanak. Na een paar sessies rijd je samen langs het water.', hy:'Սկսնակների դասեր Սելong Բելանաkի սպիտակ ավազի ծովափին:' },
    allergy:null,
    img:'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Selong Belanak Horse Riding', price:'€30/uur', phone:'+62 819-1600-0001', addr:'Selong Belanak Beach', url:'https://getyourguide.com', rating:'⭐ 4.8' },
      { name:'Lombok Horse Experience', price:'€40/2u', phone:'+62 878-1234-5678', addr:'Kuta Lombok Beach', url:'https://viator.com', rating:'⭐ 4.6' },
    ]},
  { id:'skydive', icon:'🪂', cat:'adventure', phase:'🏝️', price:'$1.200 p.p.',
    name:{ en:'Tandem Skydive Bali', nl:'Tandem Skydive Bali', hy:'Տանդեմ Սկայդայվ Բալի' },
    desc:{ en:'15,000 feet, 60 seconds freefall above the Bali coast. Each jumps separately with own instructor but simultaneously — side by side in the air. Video + photo included.', nl:'15.000 voet, 60 sec vrije val. Elk apart met eigen instructor maar tegelijk naast elkaar. Video + foto inbegrepen.', hy:'15.000 ոտնաչափ, 60 վայրկյան ազատ անկում Բալիի ափի վերևում:' },
    allergy:{ en:'⚠️ Each jumps SEPARATELY with own instructor — not together on 1 parachute. But at the same time!', nl:'⚠️ Elk APART met eigen instructor — niet samen op 1 parachute. Wel tegelijk!', hy:'⚠️ Ամեն մեկը ԱՌԱՆՁԻՆ իր մարզչի հետ — ոչ միասին 1 պարաշյուտի վրա:' },
    img:'https://images.unsplash.com/photo-1521673252667-e05da380b252?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'The Skydive Bali', price:'$1.200 p.p.', phone:'+62 361-849-6050', addr:'Buleleng, Noord-Bali', url:'https://theskydivebali.com', rating:'⭐ 4.9' },
    ]},
  { id:'parasail', icon:'🪁', cat:'romance', phase:'🏝️', price:'€40–70 voor 2',
    name:{ en:'Tandem Parasailing (together!)', nl:'Tandem Parasailing (samen!)', hy:'Տանդեմ Պարասեյլինգ (միասին!)' },
    desc:{ en:'You and your wife on the same rope above the Indian Ocean. THIS can be done together! The romantic alternative to flying together.', nl:'Jij en je vrouw aan hetzelfde touw boven de Indische Oceaan. KAN WEL samen!', hy:'Դուք և ձեր կինը նույն պարանի վրա Հնդկական օվկիանոսի վերևում:' },
    allergy:{ en:'✅ CAN be done together on 1 rope — you really fly as one!', nl:'✅ KAN samen aan 1 touw — jullie vliegen echt als één!', hy:'✅ ԿԱՐԵԼԻ Է միասին 1 պարանի վրա — թռչում եք որպես մեկ:' },
    img:'https://images.unsplash.com/photo-1599580546666-c26bca85d6a1?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Tanjung Benoa Water Sports', price:'€55 voor 2', phone:'+62 361-771-757', addr:'Tanjung Benoa, Bali', url:'https://viator.com', rating:'⭐ 4.6' },
      { name:'Bali Parasailing Center', price:'€65 voor 2', phone:'+62 361-700-001', addr:'Nusa Dua, Bali', url:'https://klook.com', rating:'⭐ 4.5' },
    ]},
  { id:'snorkel', icon:'🤿', cat:'sea', phase:'🇮🇩🏝️', price:'€30–80 p.p.',
    name:{ en:'Snorkelling + Sea Turtles', nl:'Snorkelen + Zeeschildpadden', hy:'Սնորքլինգ + Ծովային կրիաներ' },
    desc:{ en:'Snorkelling at the Gili Islands — sea turtles literally swim beside you. PADI intro dive also available.', nl:'Snorkelen bij de Gili eilanden — zeeschildpadden zwemmen letterlijk naast je.', hy:'Սնորքլինգ Գիլի կղզիներում — ծովային կրիաները լողում են կողքիդ:' },
    allergy:null,
    img:'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Gili Air Dive Center', price:'€35 p.p.', phone:'+62 370-642-337', addr:'Gili Air pier', url:'https://divegiliair.com', rating:'⭐ 4.8' },
      { name:'Blue Marlin Dive', price:'€45 p.p.', phone:'+62 370-614-497', addr:'Gili Trawangan', url:'https://bluemarlindive.com', rating:'⭐ 4.7' },
    ]},
  { id:'dinner', icon:'🕯️', cat:'romance', phase:'🇮🇩🏝️', price:'€60–120 voor 2',
    name:{ en:'Private Beach Dinner', nl:'Privé Stranddiner', hy:'Մասնավոր ընթրիք ծովափին' },
    desc:{ en:'Candlelit dinner on the beach at sunset. Private chef, fresh seafood, flower petal decoration. The most romantic moment of the honeymoon.', nl:'Candlelit diner op het strand bij zonsondergang. Eigen chef, verse zeevruchten, bloemblaadjes.', hy:'Մոմերի լույսի ներքո ընթրիք ծովափին մայրամուտի ժամանակ:' },
    allergy:null,
    img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Selong Belanak Beach Dinner', price:'€80 voor 2', phone:'Via resort', addr:'Selong Belanak Beach', url:'', rating:'⭐ 5.0' },
      { name:'Jimbaran Bay Seafood BBQ', price:'€65 voor 2', phone:'+62 361-701-010', addr:'Jimbaran Bay, Bali', url:'https://jimbaran-seafood.com', rating:'⭐ 4.7' },
    ]},
  { id:'phinisi', icon:'⛵', cat:'sea', phase:'🇮🇩🏝️', price:'€80–150 voor 2',
    name:{ en:'Private Gili Island Boat Tour', nl:'Privé Bootdagtocht Gili', hy:'Մասնավոր նավ Գիլի կղզիներ' },
    desc:{ en:'Your own private boat to all 3 Gili Islands. Snorkelling with manta rays, lunch on board, swimming from the boat.', nl:'Eigen privéboot langs alle 3 Gili eilanden. Snorkelen bij mantaroggen, lunch aan boord.', hy:'Ձեր սեփական նավը 3 Գիլի կղզիներ: Սնորքլինգ մանտա ճառագայթների հետ:' },
    allergy:null,
    img:'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Lombok Phinisi Charter', price:'€120 (hele dag)', phone:'+62 817-5700-1234', addr:'Bangsal Haven, Lombok', url:'https://getyourguide.com', rating:'⭐ 4.8' },
    ]},
  { id:'massage', icon:'💆', cat:'relax', phase:'🇮🇩🏝️', price:'€20–45/uur',
    name:{ en:'In-villa Massage', nl:'In-villa Massage', hy:'Վիլլայում մերսում' },
    desc:{ en:'Masseuse comes to your villa. Balinese massage, aromatherapy. Together in your own private space.', nl:'Masseur komt naar jullie villa. Balinese massage, aromatherapie. Samen in jullie eigen privéruimte.', hy:'Մերսողը գալիս է ձեր վիլլա: Բալիական մերսում, արոմաթերապիա:' },
    allergy:null,
    img:'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Mobile Massage Lombok', price:'€25/uur p.p.', phone:'+62 819-2233-4455', addr:'Komt naar je villa', url:'', rating:'⭐ 4.7' },
      { name:'Selong Selo Spa', price:'€45/uur', phone:'Via resort', addr:'Selong Selo Resort', url:'https://selongselo.com', rating:'⭐ 4.9' },
    ]},
  { id:'cooking', icon:'🍜', cat:'culture', phase:'🇮🇩', price:'€25–45 voor 2',
    name:{ en:'Sasak Cooking Class', nl:'Sasak Kookcursus', hy:'Սասաք խոհարարության դաս' },
    desc:{ en:'Learn traditional Lombok/Sasak dishes at a local family\'s home. Market visit included. Ayam taliwang, plecing kangkung.', nl:'Leer traditionele Sasak gerechten bij een lokale familie. Marktbezoek inbegrepen.', hy:'Սովորեք ավանդական Լոմբոկ/Սասաք ուտեստներ տեղական ընտանիքի տանը:' },
    allergy:null,
    img:'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Warung Selong Local Kitchen', price:'€25 voor 2', phone:'+62 819-5566-7788', addr:'Selong Belanak', url:'', rating:'⭐ 4.8' },
      { name:'Lombok Cooking Class', price:'€35 voor 2', phone:'+62 878-6400-1122', addr:'Mataram, Lombok', url:'https://viator.com', rating:'⭐ 4.6' },
    ]},
  { id:'gold', icon:'🥇', cat:'other', phase:'🇮🇩🏝️', price:'±€165/gram (24K)',
    name:{ en:'Buy Gold — Pegadaian', nl:'Goud kopen — Pegadaian', hy:'Ոսկի գնել — Pegadaian' },
    desc:{ en:'Official certified gold from the Indonesian state company. Wife takes it to Armenia. Keep the RECEIPT — required for Armenian customs.', nl:'Officieel gecertificeerd goud van het Indonesische staatsbedrijf. Bewaar de BON — verplicht voor Armeense douane.', hy:'Պաշտոնական հավատարմագրված ոսկի Ինդոնեզիայի պետական ընկերությունից:' },
    allergy:{ en:'📋 Max €500 duty-free into Armenia, then 15% customs. ALWAYS keep receipt.', nl:'📋 Max €500 vrij naar Armenië, daarna 15% heffing. BON ALTIJD bewaren.', hy:'📋 Առավելագույնը €500 ազատ Հայաստան, ապա 15% մաքս: ԿՏՐՈՆԸ ՊԱՀԵՔ:' },
    img:'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Pegadaian Mataram, Lombok', price:'Dagprijs op site', phone:'+62 370-623-005', addr:'Jl. Pejanggik, Mataram, Lombok', url:'https://pegadaian.co.id', rating:'⭐ 4.8' },
      { name:'Antam Butik Emas Bali', price:'Spotprijs +5%', phone:'+62 361-000-000', addr:'Denpasar, Bali', url:'https://logammulia.com', rating:'⭐ 4.9' },
    ]},
  { id:'dive', icon:'🐠', cat:'sea', phase:'🏝️', price:'€60–100 p.p.',
    name:{ en:'PADI Intro Dive', nl:'PADI Intro Duikles', hy:'PADI սուզում' },
    desc:{ en:'Beginner dives at Gili Air — best diving area in the region. No experience needed. Dive to 12 metres. Sea turtles and manta rays guaranteed.', nl:'Beginnersdives bij Gili Air — het beste duikgebied. Geen ervaring nodig. Na intro duik tot 12 meter. Schildpadden en mantaroggen.', hy:'Սկսնակ սուզումներ Գիլի Էյրում — տարածաշրջանի լավագույն վայրը:' },
    allergy:null,
    img:'https://images.unsplash.com/photo-1544551763-7ef420be5dd6?w=800&q=80&auto=format&fit=crop',
    providers:[
      { name:'Gili Air Dive Center', price:'€65 p.p.', phone:'+62 370-642-337', addr:'Gili Air pier', url:'https://divegiliair.com', rating:'⭐ 4.8' },
    ]},
]

export const ACTIVITY_FILTERS: { key: string; i18n: string }[] = [
  { key: 'all', i18n: 'filterAll' },
  { key: 'learn', i18n: 'filterLearn' },
  { key: 'adventure', i18n: 'filterAdventure' },
  { key: 'romance', i18n: 'filterRomance' },
  { key: 'sea', i18n: 'filterSea' },
  { key: 'culture', i18n: 'filterCulture' },
  { key: 'relax', i18n: 'filterRelax' },
  { key: 'other', i18n: 'filterOther' },
]

export type PackItem = { id: string; en: string; nl: string }
export const PACK_ITEMS: Record<string, PackItem[]> = {
  docs: [
    { id:'pk_pass', en:'Passport & copies', nl:'Paspoort & kopieën' },
    { id:'pk_tick', en:'Flight tickets (print + digital)', nl:'Vliegtickets (print + digitaal)' },
    { id:'pk_ins',  en:'Travel insurance card', nl:'Reisverzekeringspas' },
    { id:'pk_lic',  en:'International driving licence', nl:'Internationaal rijbewijs' },
    { id:'pk_visa', en:'Visa B211A confirmation', nl:'Visa B211A bevestiging' },
    { id:'pk_vacc', en:'Vaccination card', nl:'Vaccinatiepas' },
  ],
  health: [
    { id:'pk_anti', en:'Antihistamine — 6 weeks supply (GRASS ALLERGY)', nl:'Antihistamine — 6 weken (GRASALLERGIE)' },
    { id:'pk_sun',  en:'Sunscreen SPF50+', nl:'Zonbrandcrème SPF50+' },
    { id:'pk_mosk', en:'Mosquito spray with DEET', nl:'Muggenspray met DEET' },
    { id:'pk_dia',  en:'Anti-diarrhea + painkillers', nl:'Diarreemedicatie + pijnstillers' },
    { id:'pk_wpho', en:'Waterproof phone case', nl:'Waterdicht telefoonhoesje' },
  ],
  clothes: [
    { id:'pk_dres', en:'Light dresses / summer wear (cotton)', nl:'Lichte jurken (katoen)' },
    { id:'pk_swim', en:'Swimwear (2–3 sets)', nl:'Zwemkleding (2–3 stuks)' },
    { id:'pk_saro', en:'Sarong / pareo (required at Balinese temples)', nl:'Sarong / pareo (verplicht bij tempels)' },
    { id:'pk_card', en:'Light cardigan (plane/AC)', nl:'Lichte cardigan (vliegtuig/airco)' },
    { id:'pk_shoe', en:'Sport shoes (for horse riding)', nl:'Sportschoenen (voor paardrijden)' },
    { id:'pk_sand', en:'Sandals + flip-flops', nl:'Sandalen + slippers' },
  ],
  tech: [
    { id:'pk_adap', en:'Universal travel adapter', nl:'Universele reisadapter' },
    { id:'pk_powr', en:'Power bank (large)', nl:'Powerbank (groot formaat)' },
    { id:'pk_apps', en:'Apps downloaded: Grab, Gojek, Maps.me offline', nl:'Apps: Grab, Gojek, Maps.me offline' },
    { id:'pk_sim',  en:'Buy local SIM at arrival (Telkomsel)', nl:'Lokale SIM kopen bij aankomst (Telkomsel)' },
  ],
}
export const PACK_GROUPS = [
  { key: 'docs', icon: '📄', i18n: 'packingDocs' },
  { key: 'health', icon: '💊', i18n: 'packingHealth' },
  { key: 'clothes', icon: '👗', i18n: 'packingClothes' },
  { key: 'tech', icon: '📱', i18n: 'packingTech' },
]

// Bucketlist — voorgevuld (brief §5), bewerkbaar in de app
export const BUCKET_SEED: { id: string; text: LocalText; cat: string }[] = [
  { id:'bl_para', cat:'adventure', text:{ en:'Paragliding', nl:'Paragliden', hy:'Պարագլայդինգ' } },
  { id:'bl_sky',  cat:'adventure', text:{ en:'Skydiving', nl:'Parachutespringen / skydiven', hy:'Սկայդայվինգ' } },
  { id:'bl_boat', cat:'sea',       text:{ en:'Boat trip', nl:'Boottocht', hy:'Նավով ճանապարհորդություն' } },
  { id:'bl_swim', cat:'learn',     text:{ en:'Swimming lessons', nl:'Zwemles', hy:'Լողի դասեր' } },
  { id:'bl_horse',cat:'learn',     text:{ en:'Horse riding lesson', nl:'Paardrijles', hy:'Ձիավարության դաս' } },
  { id:'bl_hike', cat:'adventure', text:{ en:'Hiking', nl:'Hiken', hy:'Արշավ' } },
  { id:'bl_bbq',  cat:'food',      text:{ en:'Grill / BBQ restaurant', nl:'Grill-/BBQ-restaurant', hy:'Գրիլ / BBQ ռեստորան' } },
  { id:'bl_snork',cat:'sea',       text:{ en:'Snorkelling', nl:'Snorkelen', hy:'Սնորքլինգ' } },
  { id:'bl_dive', cat:'sea',       text:{ en:'Diving', nl:'Duiken', hy:'Սուզում' } },
  { id:'bl_sauna',cat:'relax',     text:{ en:'Sauna', nl:'Sauna', hy:'Սաունա' } },
  { id:'bl_ice',  cat:'relax',     text:{ en:'Ice bath', nl:'IJsbad', hy:'Սառցե լոգանք' } },
  { id:'bl_gym',  cat:'relax',     text:{ en:'Gym / work-out', nl:'Gym / work-out', hy:'Մարզասրահ' } },
  { id:'bl_museum',cat:'culture',  text:{ en:'Visit a museum', nl:'Museum bezoeken', hy:'Թանգարան այցելել' } },
  { id:'bl_pilot',cat:'business',  text:{ en:'Inquire about pilot careers', nl:'Informeren naar pilotenbanen', hy:'Հարցնել օդաչուի կարիերայի մասin' } },
  { id:'bl_kvk',  cat:'business',  text:{ en:'Indonesian Chamber of Commerce (KvK / business no.)', nl:'Kamer van Koophandel Indonesië (KvK-nummer)', hy:'Ինդոնեզիայի առևտրի պալատ' } },
  { id:'bl_corp', cat:'business',  text:{ en:'Research Indonesian company structures', nl:'Ondernemingsvormen Indonesië onderzoeken', hy:'Ուսումնասիրել ընկերության կառուցվածքները' } },
  { id:'bl_cost', cat:'business',  text:{ en:'Research monthly/yearly company obligations & costs', nl:'Maandelijkse & jaarlijkse bedrijfskosten/eisen onderzoeken', hy:'Ուսումնասիրել ընկերության ծախսերը' } },
  { id:'bl_cloth',cat:'shopping',  text:{ en:'Buy clothes (together)', nl:'Kleding kopen (samen)', hy:'Հագուստ գնել (միասին)' } },
  { id:'bl_jewel',cat:'shopping',  text:{ en:'Buy jewellery', nl:'Sieraden kopen', hy:'Զարդեր գնել' } },
  { id:'bl_lilia',cat:'romance',   text:{ en:'Eat Lilia up (with love) 😄', nl:'Lilia opeten (met liefde) 😄', hy:'Լիլիային ուտել (սիրով) 😄' } },
]

export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1600&q=80&auto=format&fit=crop',
  // Eigen foto's van het stel (vervang later via /public/assets):
  coupleA: '/assets/couple-a.jpg',
  coupleB: '/assets/couple-b.jpg',
  liliaVideo: '/assets/lilia.mp4',
}

// Snelle AI-vragen (trilingual)
export const QUICK_QS: Record<Lang, string[]> = {
  en: ['Can we horse ride AND swim same day?', 'How to get from Lombok to Gili Air?', 'Good restaurants near Selong Belanak?', 'Gold customs rules for Armenia?', 'What to do if it rains in Lombok?', 'Which activities suit our allergy?'],
  nl: ['Kunnen we paardrijden én zwemmen op 1 dag?', 'Hoe van Lombok naar Gili Air?', 'Goede restaurants bij Selong Belanak?', 'Douaneregels goud naar Armenië?', 'Wat doen bij regen op Lombok?', 'Welke activiteit past bij allergie?'],
  hy: ['Կարո՞ղ ենք ձիավարել և լողալ նույն օրը:', 'Ինչպե՞ս հասնել Լոմբոկից Գիլի Էյր:', 'Լավ ռեստորաններ Սելong Բելանաkի մոտ:', 'Ոսկու մաքսային կանոններ Հայաստանի համար:', 'Ի՞նչ անել, եթե անձրև գա Լոմբոկում:', 'Ո՞ր ակտիվությունները հարմար են մեր ալերգիային:'],
}
