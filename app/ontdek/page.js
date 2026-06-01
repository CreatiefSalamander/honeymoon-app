'use client'
import { useState, useEffect, useCallback } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { savePlace, getSavedPlaces } from '@/lib/supabase'

const CATEGORIEEN = [
  { key:'eten',           icon:'🍽️', label:'Eten' },
  { key:'cafe',           icon:'☕',  label:'Café' },
  { key:'bezienswaardigheid', icon:'🏛️', label:'Zien' },
  { key:'natuur',         icon:'🏖️', label:'Natuur' },
  { key:'shopping',       icon:'🛍️', label:'Shopping' },
  { key:'supermarkt',     icon:'🛒', label:'Super' },
  { key:'apotheek',       icon:'💊', label:'Apotheek' },
  { key:'geldautomaat',   icon:'🏧', label:'ATM' },
  { key:'vervoer',        icon:'🚕', label:'Taxi/OV' },
  { key:'goudwinkel',     icon:'💍', label:'Juwelen' },
]

const KEUKEN_TYPES = ['Lokaal','Halal','Italiaans','Vis','Vegetarisch','Turks','Arabisch','Frans','Aziatisch']

function PlacePhoto({ photoRef, name }) {
  if (!photoRef) return <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background:'rgba(201,162,75,0.08)' }}>📍</div>
  return <img src={`/api/places/photo?name=${encodeURIComponent(photoRef)}&w=400`} alt={name} className="w-full h-full object-cover" loading="lazy" />
}

function StarsDisplay({ rating }) {
  const full = Math.floor(rating || 0)
  return (
    <span className="text-xs">
      {'★'.repeat(full)}{'☆'.repeat(5-full)}
      <span className="ml-1" style={{ color:'var(--brown-soft)' }}>{rating?.toFixed(1)}</span>
    </span>
  )
}

function ReviewBlock({ placeId, name, reviews: initialReviews }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function loadReviews() {
    if (summary || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, name, reviews: initialReviews }),
      })
      const data = await res.json()
      setSummary(data.summary)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      {!expanded ? (
        <button onClick={() => { setExpanded(true); loadReviews() }}
                className="text-xs btn-ghost w-full">
          ✦ AI-samenvatting van reviews
        </button>
      ) : loading ? (
        <div className="flex gap-1 py-2 justify-center">
          {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ animationDelay:`${i*0.2}s` }} />)}
        </div>
      ) : summary ? (
        <div className="glass-sm p-3 mt-2 text-xs flex flex-col gap-2">
          {summary.positief?.length > 0 && (
            <div>
              <p className="font-semibold mb-1" style={{ color:'#4CAF50' }}>✅ Wat mensen waarderen</p>
              {summary.positief.map((p,i) => <p key={i} style={{ color:'var(--brown-soft)' }}>• {p}</p>)}
            </div>
          )}
          {summary.aandachtspunten?.length > 0 && (
            <div>
              <p className="font-semibold mb-1" style={{ color:'var(--rose)' }}>⚠️ Let op</p>
              {summary.aandachtspunten.map((p,i) => <p key={i} style={{ color:'var(--brown-soft)' }}>• {p}</p>)}
            </div>
          )}
          {summary.onzeTip && (
            <div className="p-2 rounded-lg" style={{ background:'rgba(201,162,75,0.1)' }}>
              <p className="font-semibold" style={{ color:'var(--gold)' }}>💡 Onze tip</p>
              <p style={{ color:'var(--brown-soft)' }}>{summary.onzeTip}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function PlaceCard({ place, onSave, saved }) {
  const [expanded, setExpanded] = useState(false)
  const priceLevels = { PRICE_LEVEL_FREE:'Gratis', PRICE_LEVEL_INEXPENSIVE:'€', PRICE_LEVEL_MODERATE:'€€', PRICE_LEVEL_EXPENSIVE:'€€€', PRICE_LEVEL_VERY_EXPENSIVE:'€€€€' }

  function openMaps() {
    const q = encodeURIComponent(place.name + ' ' + (place.address || ''))
    const url = /iPhone|iPad|Mac/.test(navigator.userAgent)
      ? `maps://maps.apple.com/?q=${q}&ll=${place.lat},${place.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${q}`
    window.open(url, '_blank')
  }

  return (
    <div className="place-card mb-3">
      {/* Foto */}
      <div className="h-40 overflow-hidden relative cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <PlacePhoto photoRef={place.photoRef} name={place.name} />
        <div className="absolute inset-0 hero-gradient" />
        {place.open !== undefined && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: place.open ? 'rgba(76,175,80,0.85)' : 'rgba(244,67,54,0.85)', color:'white' }}>
            {place.open ? 'Open' : 'Gesloten'}
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-base leading-tight">{place.name}</h3>
          {place.address && <p className="text-white/75 text-xs truncate mt-0.5">{place.address}</p>}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {place.rating && <StarsDisplay rating={place.rating} />}
            {place.reviewCount && <span className="text-xs" style={{ color:'var(--brown-soft)' }}>({place.reviewCount})</span>}
            {place.priceLevel && <span className="text-xs" style={{ color:'var(--brown-soft)' }}>{priceLevels[place.priceLevel] || ''}</span>}
          </div>
          <button onClick={() => onSave(place)}
                  className="text-xl transition-transform active:scale-90"
                  style={{ color: saved ? 'var(--rose)' : 'var(--brown-soft)' }}>
            {saved ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Actieknoppen */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={openMaps} className="btn-ghost text-xs px-3 py-1.5">🧭 Route</button>
          {place.phone && (
            <a href={`tel:${place.phone}`} className="btn-ghost text-xs px-3 py-1.5">📞 Bellen</a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5">🌐 Website</a>
          )}
        </div>

        {/* Uitklap: reviews */}
        {expanded && (
          <ReviewBlock placeId={place.id} name={place.name} reviews={[]} />
        )}
      </div>
    </div>
  )
}

export default function OntdekPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState(false)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCat, setActiveCat] = useState('eten')
  const [searchQ, setSearchQ] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())
  const [showKeuken, setShowKeuken] = useState(false)
  const [selectedKeuken, setSelectedKeuken] = useState(null)
  const [manualCity, setManualCity] = useState('')
  const [useManual, setUseManual] = useState(false)

  useEffect(() => {
    getSavedPlaces().then(ps => setSavedIds(new Set(ps.map(p => p.place_id))))
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { setLocError(true); setUseManual(true) }
      )
    } else { setLocError(true); setUseManual(true) }
  }, [])

  const zoek = useCallback(async (cat, q) => {
    if (!location && !useManual) return
    setLoading(true)
    setPlaces([])
    try {
      const body = useManual
        ? { query: `${q || cat} ${manualCity}`, radius: 2000 }
        : { lat: location?.lat, lng: location?.lng, category: cat, query: q, radius: 1500 }
      const res = await fetch('/api/places/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setPlaces(data.places || [])
    } finally {
      setLoading(false)
    }
  }, [location, useManual, manualCity])

  useEffect(() => {
    if (location || (useManual && manualCity)) zoek(activeCat, selectedKeuken)
  }, [location, activeCat, selectedKeuken, useManual, manualCity, zoek])

  async function handleSave(place) {
    const isAlreadySaved = savedIds.has(place.id)
    if (isAlreadySaved) return
    await savePlace({ place_id: place.id, name: place.name, category: activeCat, lat: place.lat, lng: place.lng, data: place })
    setSavedIds(prev => new Set([...prev, place.id]))
    if ('vibrate' in navigator) navigator.vibrate(20)
  }

  function handleSearch(e) {
    e.preventDefault()
    zoek(activeCat, searchQ)
  }

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">🧭 Ontdek</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color:'var(--brown-soft)' }}>
                {location ? '📍 Op basis van jouw locatie' : useManual ? `📍 ${manualCity || 'Typ een plaats'}` : 'Locatie ophalen...'}
              </p>
            </div>
            <button onClick={() => setUseManual(m => !m)} className="btn-ghost text-xs px-3 py-1.5">
              {useManual ? '📍 GPS' : '🔍 Zoek plaats'}
            </button>
          </div>

          {/* Handmatige stadsinvoer */}
          {useManual && (
            <form onSubmit={e => { e.preventDefault(); zoek(activeCat, selectedKeuken) }} className="flex gap-2 mb-4">
              <input value={manualCity} onChange={e => setManualCity(e.target.value)}
                     placeholder="Bijv. Istanbul, Turkije..." className="input flex-1" />
              <button type="submit" className="btn-gold px-4">Zoek</button>
            </form>
          )}

          {/* Vrij zoeken */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                   placeholder="Vrij zoeken..." className="input flex-1" />
            <button type="submit" className="btn-rose px-4">→</button>
          </form>

          {/* Categorie chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {CATEGORIEEN.map(c => (
              <button key={c.key}
                      onClick={() => { setActiveCat(c.key); setSelectedKeuken(null); setShowKeuken(false) }}
                      className={`chip flex-shrink-0 ${activeCat === c.key ? 'active' : ''}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Keukentype (voor eten) */}
          {activeCat === 'eten' && (
            <div className="mb-4">
              <button onClick={() => setShowKeuken(!showKeuken)} className="chip mb-2">
                🍴 {selectedKeuken || 'Keukentype kiezen'} {showKeuken ? '▲' : '▼'}
              </button>
              {showKeuken && (
                <div className="flex flex-wrap gap-2">
                  {KEUKEN_TYPES.map(k => (
                    <button key={k} onClick={() => { setSelectedKeuken(k); setShowKeuken(false); zoek('eten', k) }}
                            className={`chip ${selectedKeuken === k ? 'active' : ''}`}>
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resultaten */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-52 rounded-2xl" />)}
            </div>
          ) : places.length === 0 && !loading ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🧭</p>
              <h3 className="serif text-lg mb-2">Geen plekken gevonden</h3>
              <p className="serif-italic text-sm" style={{ color:'var(--brown-soft)' }}>
                Probeer een andere categorie of zoek op naam
              </p>
            </div>
          ) : (
            places.map(place => (
              <PlaceCard key={place.id} place={place} onSave={handleSave} saved={savedIds.has(place.id)} />
            ))
          )}
        </div>
        <BottomNav />
        <FloatingAI currentUser={user} />
      </div>
    </div>
  )
}
