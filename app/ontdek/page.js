'use client'
import { useState, useEffect, useRef } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { savePlace, getSavedPlaces } from '@/lib/supabase'

const CATEGORIEEN = [
  { key: 'restaurant',       icon: '🍽️', label: 'Eten',           zoek: 'restaurant' },
  { key: 'cafe',             icon: '☕',  label: 'Café',           zoek: 'cafe coffee shop' },
  { key: 'tourist_attraction',icon:'🏛️', label: 'Bezienswaardig', zoek: 'tourist attraction' },
  { key: 'park',             icon: '🏖️', label: 'Natuur & park',  zoek: 'park beach nature' },
  { key: 'night_club',       icon: '🎉', label: 'Uitgaan',         zoek: 'bar nightclub' },
  { key: 'shopping_mall',    icon: '🛍️', label: 'Shopping',        zoek: 'shopping mall' },
  { key: 'supermarket',      icon: '🛒', label: 'Supermarkt',      zoek: 'supermarket grocery' },
  { key: 'pharmacy',         icon: '💊', label: 'Apotheek',        zoek: 'pharmacy drugstore' },
  { key: 'atm',              icon: '🏧', label: 'Geldautomaat',    zoek: 'ATM bank' },
  { key: 'hospital',         icon: '🏥', label: 'Ziekenhuis',      zoek: 'hospital emergency' },
  { key: 'taxi_stand',       icon: '🚕', label: 'Taxi / OV',       zoek: 'taxi bus station' },
  { key: 'jewelry_store',    icon: '💍', label: 'Juwelier',        zoek: 'jewelry gold shop' },
  { key: 'spa',              icon: '💆', label: 'Spa / Wellness',  zoek: 'spa hammam massage' },
  { key: 'art_gallery',      icon: '🎨', label: 'Museum / Kunst',  zoek: 'museum art gallery' },
  { key: 'place_of_worship', icon: '🕌', label: 'Moskee / Kerk',   zoek: 'mosque church temple' },
]

const KEUKEN_TYPES = [
  { label: 'Halal', emoji: '🕌' }, { label: 'Lokaal', emoji: '🍴' },
  { label: 'Turks', emoji: '🇹🇷' }, { label: 'Arabisch', emoji: '🇦🇪' },
  { label: 'Italiaans', emoji: '🇮🇹' }, { label: 'Vis & Zee', emoji: '🐟' },
  { label: 'Vegetarisch', emoji: '🥗' }, { label: 'Frans', emoji: '🇫🇷' },
  { label: 'Aziatisch', emoji: '🥢' }, { label: 'Fast food', emoji: '🍔' },
  { label: 'Ontbijt', emoji: '🍳' }, { label: 'Dessert', emoji: '🍰' },
]

const AFSTAND_OPTIES = [
  { label: '500 m', m: 500 }, { label: '1 km', m: 1000 },
  { label: '2 km', m: 2000 }, { label: '5 km', m: 5000 },
]

function PlacePhoto({ photoRef, name, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (!photoRef || failed) {
    return (
      <div className={`flex items-center justify-center text-4xl ${className}`}
           style={{ background: 'rgba(201,162,75,0.08)' }}>
        📍
      </div>
    )
  }
  return (
    <img src={`/api/places/photo?name=${encodeURIComponent(photoRef)}&w=600`}
         alt={name} className={`object-cover ${className}`}
         loading="lazy" onError={() => setFailed(true)} />
  )
}

function Sterren({ rating, count }) {
  if (!rating) return null
  const vol = Math.floor(rating)
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs" style={{ color: '#FFC107' }}>{'★'.repeat(vol)}{'☆'.repeat(5 - vol)}</span>
      <span className="text-xs" style={{ color: 'var(--brown-soft)' }}>{rating.toFixed(1)}{count ? ` (${count})` : ''}</span>
    </span>
  )
}

function ReviewBlok({ placeId, naam }) {
  const [samenvatting, setSamenvatting] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    if (samenvatting || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, name: naam }),
      })
      const data = await res.json()
      setSamenvatting(data.summary)
    } finally { setLoading(false) }
  }

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); load() }}
              className="w-full text-xs mt-2 py-1.5 rounded-xl"
              style={{ background: 'rgba(201,162,75,0.08)', color: 'var(--gold)', border: '1px solid rgba(201,162,75,0.2)' }}>
        ✦ AI-samenvatting van reviews
      </button>
    )
  }

  return (
    <div className="mt-2">
      {loading ? (
        <div className="flex gap-1 py-3 justify-center">
          {[0, 1, 2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
        </div>
      ) : samenvatting ? (
        <div className="glass-sm p-3 text-xs flex flex-col gap-2">
          {samenvatting.positief?.length > 0 && (
            <div>
              <p className="font-semibold mb-0.5" style={{ color: '#4CAF50' }}>✅ Positief</p>
              {samenvatting.positief.map((p, i) => <p key={i} style={{ color: 'var(--brown-soft)' }}>• {p}</p>)}
            </div>
          )}
          {samenvatting.aandachtspunten?.length > 0 && (
            <div>
              <p className="font-semibold mb-0.5" style={{ color: 'var(--rose)' }}>⚠️ Let op</p>
              {samenvatting.aandachtspunten.map((p, i) => <p key={i} style={{ color: 'var(--brown-soft)' }}>• {p}</p>)}
            </div>
          )}
          {samenvatting.onzeTip && (
            <div className="p-2 rounded-lg" style={{ background: 'rgba(201,162,75,0.1)' }}>
              <p className="font-semibold" style={{ color: 'var(--gold)' }}>💡 Tip voor jullie</p>
              <p style={{ color: 'var(--brown-soft)' }}>{samenvatting.onzeTip}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-center" style={{ color: 'var(--brown-soft)' }}>Geen reviews beschikbaar</p>
      )}
    </div>
  )
}

function PlaceKaart({ place, opgeslagen, onSla }) {
  const [uitgevouwen, setUitgevouwen] = useState(false)
  const prijsNiveaus = { PRICE_LEVEL_FREE: 'Gratis', PRICE_LEVEL_INEXPENSIVE: '€', PRICE_LEVEL_MODERATE: '€€', PRICE_LEVEL_EXPENSIVE: '€€€', PRICE_LEVEL_VERY_EXPENSIVE: '€€€€' }

  function openRoute() {
    const q = encodeURIComponent(`${place.name} ${place.address || ''}`)
    const isApple = /iPhone|iPad|Mac/.test(navigator.userAgent)
    window.open(isApple ? `maps://maps.apple.com/?q=${q}&ll=${place.lat},${place.lng}` : `https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
  }

  return (
    <div className="place-card mb-3">
      {/* Foto + naam */}
      <div className="h-44 relative cursor-pointer overflow-hidden" onClick={() => setUitgevouwen(!uitgevouwen)}>
        <PlacePhoto photoRef={place.photoRef} naam={place.name} className="w-full h-full" />
        <div className="absolute inset-0 hero-gradient" />
        {place.open !== undefined && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: place.open ? 'rgba(76,175,80,0.9)' : 'rgba(244,67,54,0.9)', color: 'white' }}>
            {place.open ? '● Open' : '● Gesloten'}
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-12">
          <h3 className="font-bold text-white text-base leading-snug drop-shadow">{place.name}</h3>
          {place.address && <p className="text-white/70 text-xs truncate mt-0.5">{place.address}</p>}
        </div>
        {/* Bewaar-hart */}
        <button onClick={e => { e.stopPropagation(); onSla(place) }}
                className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
          <span className="text-lg">{opgeslagen ? '❤️' : '🤍'}</span>
        </button>
      </div>

      {/* Info balk */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <Sterren rating={place.rating} count={place.reviewCount} />
          <span className="text-xs" style={{ color: 'var(--brown-soft)' }}>{prijsNiveaus[place.priceLevel] || ''}</span>
        </div>

        {/* Actie-knoppen */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={openRoute} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1">
            🧭 Route
          </button>
          {place.phone && (
            <a href={`tel:${place.phone}`} className="btn-ghost text-xs px-3 py-1.5">📞 Bel</a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5">🌐 Website</a>
          )}
          <button onClick={() => setUitgevouwen(!uitgevouwen)}
                  className="btn-ghost text-xs px-3 py-1.5 ml-auto">
            {uitgevouwen ? '▲ Minder' : '▼ Meer'}
          </button>
        </div>

        {/* Uitklap */}
        {uitgevouwen && (
          <div className="mt-2">
            <ReviewBlok placeId={place.id} naam={place.name} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function OntdekPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [locatie, setLocatie] = useState(null)
  const [activeCat, setActiveCat] = useState(null)
  const [zoekInput, setZoekInput] = useState('')
  const [plaatsen, setPlaatsen] = useState([])
  const [loading, setLoading] = useState(false)
  const [heeftGezocht, setHeeftGezocht] = useState(false)
  const [error, setError] = useState(null)
  const [missingKey, setMissingKey] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(new Set())
  const [locatieInput, setLocatieInput] = useState('')
  const [gpsStatus, setGpsStatus] = useState('ophalen') // 'ophalen' | 'ok' | 'fout'
  const [straal, setStraal] = useState(1500)
  const [activeKeuken, setActiveKeuken] = useState(null)
  const zoekRef = useRef(null)

  useEffect(() => {
    getSavedPlaces().then(ps => setOpgeslagen(new Set(ps.map(p => p.place_id))))
  }, [])

  useEffect(() => {
    setGpsStatus('ophalen')
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => { setLocatie({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus('ok') },
        () => setGpsStatus('fout'),
        { timeout: 8000, enableHighAccuracy: false }
      )
    } else setGpsStatus('fout')
  }, [])

  async function zoek({ cat, query, lat, lng, radius }) {
    setLoading(true)
    setError(null)
    setHeeftGezocht(true)
    try {
      const body = {
        lat: lat ?? locatie?.lat,
        lng: lng ?? locatie?.lng,
        radius: radius ?? straal,
      }

      if (query) {
        body.query = query
      } else if (cat) {
        const catObj = CATEGORIEEN.find(c => c.key === cat)
        body.query = `${catObj?.zoek || cat} near`
        body.category = cat
      }

      const res = await fetch('/api/places/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.error?.includes('API') || data.error?.includes('sleutel') || data.error?.includes('key')) {
        setMissingKey(true)
        return
      }
      if (data.error) { setError(data.error); return }
      setPlaatsen(data.places || [])
      setMissingKey(false)
    } catch (e) {
      setError('Verbindingsfout — controleer internet')
    } finally {
      setLoading(false)
    }
  }

  function handleCatKlik(cat) {
    setActiveCat(cat)
    setActiveKeuken(null)
    setZoekInput('')
    zoek({ cat })
  }

  function handleKeukenKlik(keuken) {
    setActiveKeuken(keuken)
    setActiveCat('restaurant')
    zoek({ query: `${keuken} restaurant` })
  }

  function handleZoekFormulier(e) {
    e?.preventDefault()
    if (!zoekInput.trim()) return
    setActiveCat(null)
    setActiveKeuken(null)

    if (locatieInput.trim()) {
      // Zoek op ingevoerde locatie (stad)
      zoek({ query: `${zoekInput} in ${locatieInput}` })
    } else {
      zoek({ query: zoekInput })
    }
  }

  function handleLocatieZoek(e) {
    e?.preventDefault()
    if (locatieInput.trim()) {
      // Zoek stad, gebruik dan als zoeklocatie via Google Places text search
      zoek({ query: `${activeCat ? CATEGORIEEN.find(c => c.key === activeCat)?.zoek || activeCat : (zoekInput || 'attraction')} in ${locatieInput}` })
    }
  }

  async function handleSla(place) {
    if (opgeslagen.has(place.id)) return
    if ('vibrate' in navigator) navigator.vibrate(20)
    await savePlace({ place_id: place.id, name: place.name, category: activeCat, lat: place.lat, lng: place.lng, data: place })
    setOpgeslagen(prev => new Set([...prev, place.id]))
  }

  const catObj = CATEGORIEEN.find(c => c.key === activeCat)
  const isEten = activeCat === 'restaurant' || activeCat === null

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">🧭 Ontdek</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
                {gpsStatus === 'ok' ? '📍 GPS actief' : gpsStatus === 'ophalen' ? '⏳ Locatie ophalen...' : '📍 Geen GPS — zoek op stad'}
              </p>
            </div>
          </div>

          {/* Locatie invoer */}
          <form onSubmit={handleLocatieZoek} className="flex gap-2 mb-3">
            <input value={locatieInput} onChange={e => setLocatieInput(e.target.value)}
                   placeholder="📍 Stad / bestemming (optioneel)..."
                   className="input flex-1 text-sm" />
            {locatieInput && (
              <button type="submit" className="btn-gold px-3 text-sm">Stel in</button>
            )}
            {gpsStatus === 'ok' && (
              <button type="button" onClick={() => { setLocatieInput(''); if (activeCat) zoek({ cat: activeCat }) }}
                      className="btn-ghost px-3 text-sm">GPS</button>
            )}
          </form>

          {/* Vrij zoeken */}
          <form onSubmit={handleZoekFormulier} className="flex gap-2 mb-3" ref={zoekRef}>
            <input value={zoekInput} onChange={e => setZoekInput(e.target.value)}
                   placeholder="🔍 Zoek bijv. 'halal restaurant' of 'strand'..."
                   className="input flex-1 text-sm" />
            <button type="submit" className="btn-rose px-4">Zoek</button>
          </form>

          {/* Straal */}
          <div className="flex gap-2 mb-4">
            <span className="text-xs self-center" style={{ color: 'var(--brown-soft)' }}>Straal:</span>
            {AFSTAND_OPTIES.map(opt => (
              <button key={opt.m} onClick={() => { setStraal(opt.m); if (activeCat) zoek({ cat: activeCat, radius: opt.m }) }}
                      className={`chip text-xs ${straal === opt.m ? 'active' : ''}`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Categorieën — scrollbaar */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {CATEGORIEEN.map(c => (
              <button key={c.key} onClick={() => handleCatKlik(c.key)}
                      className={`chip flex-shrink-0 ${activeCat === c.key ? 'active' : ''}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Keukentype (alleen bij eten) */}
          {isEten && (
            <div className="mb-4">
              <p className="text-xs mb-2" style={{ color: 'var(--brown-soft)' }}>Keuken kiezen:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {KEUKEN_TYPES.map(k => (
                  <button key={k.label} onClick={() => handleKeukenKlik(k.label)}
                          className={`chip flex-shrink-0 ${activeKeuken === k.label ? 'active' : ''}`}>
                    {k.emoji} {k.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API sleutel nodig */}
          {missingKey && (
            <div className="glass p-5 mb-4 text-center">
              <p className="text-3xl mb-3">🔑</p>
              <h3 className="serif font-semibold mb-2">Google Places sleutel nodig</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--brown-soft)' }}>
                Voeg <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(201,162,75,0.15)' }}>GOOGLE_PLACES_API_KEY</code> toe
                in Netlify → Site settings → Environment variables
              </p>
              <div className="text-left glass-sm p-3 text-xs" style={{ color: 'var(--brown-soft)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--brown)' }}>Hoe doe je dat?</p>
                <p>1. Ga naar <strong>console.cloud.google.com</strong></p>
                <p>2. Maak een project of selecteer bestaand</p>
                <p>3. Schakel <strong>Places API (New)</strong> in</p>
                <p>4. Ga naar Credentials → Create API Key</p>
                <p>5. Voeg de key toe in Netlify env vars</p>
              </div>
              <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="btn-gold inline-block mt-4 text-sm px-5 py-2">
                Google Cloud Console →
              </a>
            </div>
          )}

          {/* Foutmelding */}
          {error && !missingKey && (
            <div className="glass p-4 text-center mb-4">
              <p className="text-2xl mb-2">😕</p>
              <p className="font-semibold text-sm">{error}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--brown-soft)' }}>Probeer een andere categorie of controleer de locatie</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <div className="skeleton h-44" />
                  <div className="p-3 flex flex-col gap-1.5">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resultaten */}
          {!loading && !error && !missingKey && heeftGezocht && (
            plaatsen.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🗺️</p>
                <h3 className="serif text-lg mb-1">Niets gevonden</h3>
                <p className="serif-italic text-sm" style={{ color: 'var(--brown-soft)' }}>
                  Probeer een grotere straal, andere categorie of typ een stad in
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs mb-3" style={{ color: 'var(--brown-soft)' }}>
                  {plaatsen.length} plekken gevonden {catObj ? `voor ${catObj.icon} ${catObj.label}` : ''} {locatieInput ? `in ${locatieInput}` : ''}
                </p>
                {plaatsen.map(place => (
                  <PlaceKaart key={place.id} place={place} opgeslagen={opgeslagen.has(place.id)} onSla={handleSla} />
                ))}
              </>
            )
          )}

          {/* Lege staat (nog niet gezocht) */}
          {!loading && !heeftGezocht && !missingKey && (
            <div className="text-center py-10">
              <p className="text-5xl mb-4">🧭</p>
              <h3 className="serif text-xl mb-2">Ontdek de omgeving</h3>
              <p className="serif-italic text-sm mb-6" style={{ color: 'var(--brown-soft)' }}>
                Kies een categorie hierboven of zoek op naam.<br/>
                {gpsStatus === 'fout' ? 'Typ een stad in het locatieveld bovenaan.' : 'We gebruiken je GPS-locatie.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIEEN.slice(0, 6).map(c => (
                  <button key={c.key} onClick={() => handleCatKlik(c.key)}
                          className="chip">
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <BottomNav />
        <FloatingAI currentUser={user} pagina="ontdek" />
      </div>
    </div>
  )
}
