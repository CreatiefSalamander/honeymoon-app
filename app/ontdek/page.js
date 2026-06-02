'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { useLanguage } from '@/lib/i18n'
import { useTrip, afstand, looptijd } from '@/lib/tripContext'
import { savePlace, getSavedPlaces, addItineraryItem, addExpense, getBudget } from '@/lib/supabase'
import { Log } from '@/lib/activityLog'

const CATEGORIEEN = [
  { key:'restaurant',        icon:'🍽️', label:'Eten'          },
  { key:'cafe',              icon:'☕',  label:'Café'          },
  { key:'tourist_attraction',icon:'🏛️', label:'Zien'          },
  { key:'park',              icon:'🌿', label:'Natuur'        },
  { key:'night_club',        icon:'🎶', label:'Uitgaan'       },
  { key:'shopping_mall',     icon:'🛍️', label:'Shopping'      },
  { key:'supermarket',       icon:'🛒', label:'Super'         },
  { key:'pharmacy',          icon:'💊', label:'Apotheek'      },
  { key:'atm',               icon:'🏧', label:'ATM'           },
  { key:'spa',               icon:'💆', label:'Spa'           },
  { key:'art_gallery',       icon:'🎨', label:'Museum'        },
  { key:'place_of_worship',  icon:'🕌', label:'Gebedsplaats'  },
  { key:'jewelry_store',     icon:'💍', label:'Juwelier'      },
  { key:'hospital',          icon:'🏥', label:'Ziekenhuis'    },
]

const KEUKEN = ['Halal','Lokaal','Turks','Arabisch','Italiaans','Vis','Vegetarisch','Aziatisch','Ontbijt']

function StarsRow({ rating, count }) {
  if (!rating) return null
  const full = Math.floor(rating)
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      <span style={{ color:'#EAB308', fontSize:'0.75rem' }}>{'★'.repeat(full)}{'☆'.repeat(5-full)}</span>
      <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{rating.toFixed(1)}{count ? ` (${count})` : ''}</span>
    </span>
  )
}

// Voeg aan agenda toe modal
function AgendaModal({ plek, onClose, user, budgetData }) {
  const [datum, setDatum] = useState('')
  const [tijdslot, setTijdslot] = useState('Middag')
  const [prijs, setPrijs] = useState('')
  const [loading, setLoading] = useState(false)
  const [gedaan, setGedaan] = useState(false)

  async function voegToe() {
    if (!datum) return
    setLoading(true)
    try {
      const item = await addItineraryItem({
        date: datum, time_slot: tijdslot,
        activity: plek.name, location: plek.address || '',
        lat: plek.lat, lng: plek.lng, place_id: plek.id,
        phone: plek.phone || null, type: 'activiteit',
        price: prijs ? Number(prijs) : null,
        created_by: user,
      })
      if (item) {
        Log.reis(plek.name, datum, user)
        // Voeg automatisch toe aan budget als prijs ingevuld
        if (prijs && Number(prijs) > 0 && budgetData) {
          await addExpense({
            amount: Number(prijs), category: 'Activiteiten',
            description: plek.name, currency: budgetData.currency || 'EUR',
            date: datum, paid_by: user,
          })
          Log.uitgave(prijs, 'Activiteiten', budgetData.currency || 'EUR', user)
        }
        setGedaan(true)
        setTimeout(onClose, 1500)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        {gedaan ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
            <p className="serif" style={{ fontSize:'1.2rem', fontWeight:700 }}>Toegevoegd aan Agenda!</p>
            <p style={{ color:'var(--text-soft)', marginTop:6, fontSize:'0.875rem' }}>
              {plek.name} staat nu in je planning
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:20 }}>
              <p className="label" style={{ marginBottom:4 }}>Toevoegen aan planning</p>
              <h2 className="serif" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text)' }}>{plek.name}</h2>
              {plek.address && <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>📍 {plek.address}</p>}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="label" style={{ display:'block', marginBottom:6 }}>Datum *</label>
                <input type="date" value={datum} onChange={e => setDatum(e.target.value)} className="input"
                       min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="label" style={{ display:'block', marginBottom:8 }}>Tijdslot</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['Ochtend','Middag','Avond','Nacht'].map(s => (
                    <button key={s} onClick={() => setTijdslot(s)}
                            className={`chip ${tijdslot===s?'active':''}`} style={{ flex:1, justifyContent:'center' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label" style={{ display:'block', marginBottom:6 }}>Geschatte kosten (optioneel)</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>{budgetData?.currency || 'EUR'}</span>
                  <input type="number" value={prijs} onChange={e => setPrijs(e.target.value)}
                         placeholder="0" className="input" inputMode="decimal" />
                </div>
                {prijs && <p style={{ fontSize:'0.72rem', color:'var(--gold)', marginTop:4 }}>
                  → Wordt automatisch toegevoegd aan budget
                </p>}
              </div>
            </div>

            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              <button onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Annuleer</button>
              <button onClick={voegToe} disabled={!datum || loading} className="btn btn-gold" style={{ flex:2 }}>
                {loading ? 'Toevoegen...' : '📅 Toevoegen aan agenda'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PlaceCard({ place, opgeslagen, onSla, onPlan }) {
  const [uitgevouwen, setUitgevouwen] = useState(false)
  const [fotoFout, setFotoFout] = useState(false)
  const { currentLocation, hotel } = useTrip()

  const basis = currentLocation || (hotel ? { lat: hotel.lat, lng: hotel.lng } : null)
  const km = basis ? afstand(basis.lat, basis.lng, place.lat, place.lng) : null
  const looptijdStr = km ? looptijd(km) : null

  const prijsNiveaus = { PRICE_LEVEL_FREE:'Gratis', PRICE_LEVEL_INEXPENSIVE:'€', PRICE_LEVEL_MODERATE:'€€', PRICE_LEVEL_EXPENSIVE:'€€€', PRICE_LEVEL_VERY_EXPENSIVE:'€€€€' }

  function openRoute() {
    const q = encodeURIComponent(`${place.name} ${place.address || ''}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
  }

  return (
    <div className="place-card" style={{ marginBottom:12 }}>
      {/* Foto */}
      <div style={{ height:180, position:'relative', overflow:'hidden', cursor:'pointer' }} onClick={() => setUitgevouwen(!uitgevouwen)}>
        {!fotoFout && place.photoRef ? (
          <img src={`/api/places/photo?name=${encodeURIComponent(place.photoRef)}&w=600`}
               alt={place.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
               loading="lazy" onError={() => setFotoFout(true)} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-subtle)', fontSize:'3rem' }}>
            {CATEGORIEEN.find(c => c.key === place.type)?.icon || '📍'}
          </div>
        )}
        <div className="hero-gradient" style={{ position:'absolute', inset:0 }} />

        {/* Status badge */}
        {place.open !== undefined && (
          <span className={`badge ${place.open ? 'badge-green' : 'badge-red'}`}
                style={{ position:'absolute', top:12, left:12 }}>
            {place.open ? '● Open' : '● Gesloten'}
          </span>
        )}

        {/* Bewaar-hart */}
        <button onClick={e => { e.stopPropagation(); onSla(place) }}
                style={{ position:'absolute', top:10, right:10, width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
          {opgeslagen ? '❤️' : '♡'}
        </button>

        {/* Naam overlay */}
        <div style={{ position:'absolute', bottom:12, left:14, right:14 }}>
          <h3 style={{ color:'white', fontFamily:'Playfair Display,serif', fontSize:'1rem', fontWeight:700, margin:0, textShadow:'0 1px 4px rgba(0,0,0,0.4)' }}>{place.name}</h3>
          {place.address && <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.72rem', margin:'2px 0 0', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{place.address}</p>}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding:'12px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <StarsRow rating={place.rating} count={place.reviewCount} />
            {place.priceLevel && <span className="badge badge-gold">{prijsNiveaus[place.priceLevel]}</span>}
          </div>
          {km !== null && (
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
              📍 {km} km {looptijdStr ? `(${looptijdStr})` : ''}{hotel ? ' van hotel' : ''}
            </span>
          )}
        </div>

        {/* Actie-knoppen */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => onPlan(place)} className="btn btn-gold btn-sm" style={{ flex:'1 1 auto' }}>
            📅 Plan in agenda
          </button>
          <button onClick={openRoute} className="btn btn-ghost btn-sm">
            🧭 Route
          </button>
          {place.phone && (
            <a href={`tel:${place.phone}`} className="btn btn-ghost btn-sm">📞</a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🌐</a>
          )}
        </div>

        {/* Uitklap: extra info */}
        {uitgevouwen && (
          <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
            {place.phone && <p style={{ fontSize:'0.8rem', color:'var(--text-soft)', marginBottom:4 }}>📞 {place.phone}</p>}
            {place.website && <a href={place.website} target="_blank" rel="noreferrer" style={{ fontSize:'0.8rem', color:'var(--gold)' }}>🌐 Website →</a>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OntdekPage() {
  const { t } = useLanguage()
  const { user, currentLocation, hotel } = useTrip()
  const [activeCat, setActiveCat] = useState(null)
  const [zoekInput, setZoekInput] = useState('')
  const [locatieInput, setLocatieInput] = useState('')
  const [straal, setStraal] = useState(1500)
  const [plaatsen, setPlaatsen] = useState([])
  const [loading, setLoading] = useState(false)
  const [heeftGezocht, setHeeftGezocht] = useState(false)
  const [error, setError] = useState(null)
  const [missingKey, setMissingKey] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(new Set())
  const [planModal, setPlanModal] = useState(null)
  const [budgetData, setBudgetData] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('wachten')

  useEffect(() => {
    getSavedPlaces().then(ps => setOpgeslagen(new Set(ps.map(p => p.place_id))))
    getBudget().then(b => { if (b) setBudgetData(b) })
    if (currentLocation) setGpsStatus('ok')
    else {
      navigator.geolocation?.getCurrentPosition(() => setGpsStatus('ok'), () => setGpsStatus('fout'), { timeout: 8000 })
    }
    if (hotel?.naam) setLocatieInput(hotel.naam)
  }, [currentLocation, hotel])

  async function zoek({ cat, query } = {}) {
    setLoading(true)
    setError(null)
    setHeeftGezocht(true)
    const basis = currentLocation || (hotel ? { lat: hotel.lat, lng: hotel.lng } : null)

    try {
      const body = {}
      if (basis) { body.lat = basis.lat; body.lng = basis.lng }
      body.radius = straal
      if (query || zoekInput) {
        body.query = (query || zoekInput) + (locatieInput ? ` in ${locatieInput}` : '')
      } else if (cat) {
        body.category = cat
        if (!basis && locatieInput) body.query = `${cat} in ${locatieInput}`
      }

      const res = await fetch('/api/places/nearby', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.missingKey) { setMissingKey(true); return }
      if (data.error) { setError(data.error); return }
      setPlaatsen(data.places || [])
      setMissingKey(false)
    } catch { setError('Verbindingsfout') }
    finally { setLoading(false) }
  }

  async function handleSla(place) {
    if (opgeslagen.has(place.id)) return
    await savePlace({ place_id: place.id, name: place.name, category: activeCat, lat: place.lat, lng: place.lng, data: place })
    setOpgeslagen(prev => new Set([...prev, place.id]))
    Log.plek(place.name, user)
    if ('vibrate' in navigator) navigator.vibrate(20)
  }

  const hotelBasis = hotel ? ` vanuit ${hotel.naam}` : currentLocation ? '' : ''

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content" style={{ padding:'20px 16px', maxWidth:520, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom:20 }}>
            <p className="label" style={{ marginBottom:4 }}>
              {gpsStatus === 'ok' ? `📍 GPS actief${hotelBasis}` : hotel?.naam ? `📍 ${hotel.naam}` : 'Locatie instellen'}
            </p>
            <h1 className="page-title">{t('ontdek')}</h1>
          </div>

          {/* Zoekbalk + locatie */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            <form onSubmit={e => { e.preventDefault(); setActiveCat(null); zoek() }} style={{ display:'flex', gap:8 }}>
              <input value={zoekInput} onChange={e => setZoekInput(e.target.value)}
                     placeholder={`Zoek bijv. "halal restaurant", "strand"...`} className="input" style={{ flex:1 }} />
              <button type="submit" className="btn btn-gold btn-sm">→</button>
            </form>
            <div style={{ display:'flex', gap:8 }}>
              <input value={locatieInput} onChange={e => setLocatieInput(e.target.value)}
                     placeholder="📍 Stad / bestemming (optioneel)" className="input" style={{ flex:1, fontSize:'0.82rem' }} />
              {gpsStatus === 'ok' && (
                <button onClick={() => { setLocatieInput(''); if (activeCat) zoek({ cat: activeCat }) }}
                        className="btn btn-ghost btn-sm">GPS</button>
              )}
            </div>
          </div>

          {/* Straal */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Straal:</span>
            {[500,1000,2000,5000].map(r => (
              <button key={r} onClick={() => { setStraal(r); if (activeCat) zoek({ cat: activeCat }) }}
                      className={`chip ${straal===r?'active':''}`} style={{ fontSize:'0.72rem', padding:'4px 10px' }}>
                {r<1000?r+'m':r/1000+'km'}
              </button>
            ))}
          </div>

          {/* Categorieën */}
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:16 }} className="no-scrollbar">
            {CATEGORIEEN.map(c => (
              <button key={c.key} onClick={() => { setActiveCat(c.key); zoek({ cat: c.key }) }}
                      className={`chip ${activeCat===c.key?'active':''}`} style={{ flexShrink:0 }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Keukentype (bij eten) */}
          {activeCat === 'restaurant' && (
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:12 }} className="no-scrollbar">
              {KEUKEN.map(k => (
                <button key={k} onClick={() => zoek({ query: k + ' restaurant' })}
                        className="chip" style={{ flexShrink:0, fontSize:'0.72rem' }}>{k}</button>
              ))}
            </div>
          )}

          {/* API sleutel nodig */}
          {missingKey && (
            <div className="card" style={{ padding:20, textAlign:'center', marginBottom:16 }}>
              <p style={{ fontSize:'2rem', marginBottom:8 }}>🔑</p>
              <h3 className="serif" style={{ fontSize:'1.1rem', marginBottom:8 }}>Google Places sleutel nodig</h3>
              <p style={{ fontSize:'0.82rem', color:'var(--text-soft)', marginBottom:16 }}>
                Voeg <code style={{ background:'var(--gold-light)', padding:'2px 6px', borderRadius:4, fontSize:'0.75rem' }}>GOOGLE_PLACES_API_KEY</code> toe in Netlify → Site settings → Environment variables
              </p>
              <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="btn btn-gold btn-sm">
                Google Cloud Console →
              </a>
            </div>
          )}

          {/* Fout */}
          {error && !missingKey && (
            <div className="card" style={{ padding:20, textAlign:'center', marginBottom:16 }}>
              <p style={{ color:'var(--text-soft)', fontSize:'0.875rem' }}>😕 {error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:220, borderRadius:20 }} />)}
            </div>
          )}

          {/* Resultaten */}
          {!loading && !error && !missingKey && heeftGezocht && (
            plaatsen.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <p style={{ fontSize:'3rem', marginBottom:12 }}>🗺️</p>
                <h3 className="serif" style={{ fontSize:'1.2rem', marginBottom:8 }}>Niets gevonden</h3>
                <p style={{ color:'var(--text-soft)', fontSize:'0.875rem' }}>
                  Probeer een grotere straal, andere categorie of typ een stad in
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:12 }}>
                  {plaatsen.length} resultaten gevonden
                </p>
                {plaatsen.map(p => (
                  <PlaceCard key={p.id} place={p} opgeslagen={opgeslagen.has(p.id)}
                             onSla={handleSla} onPlan={() => setPlanModal(p)} />
                ))}
              </>
            )
          )}

          {/* Lege staat */}
          {!loading && !heeftGezocht && !missingKey && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <p style={{ fontSize:'4rem', marginBottom:16 }}>🧭</p>
              <h3 className="serif" style={{ fontSize:'1.3rem', marginBottom:8 }}>Ontdek de omgeving</h3>
              <p style={{ color:'var(--text-soft)', fontSize:'0.875rem', marginBottom:24 }}>
                Kies een categorie of zoek op naam.<br/>
                {gpsStatus !== 'ok' && 'Typ een stad in het zoekveld.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
                {CATEGORIEEN.slice(0,6).map(c => (
                  <button key={c.key} onClick={() => { setActiveCat(c.key); zoek({ cat: c.key }) }} className="chip">
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plan modal */}
        {planModal && (
          <AgendaModal plek={planModal} user={user} budgetData={budgetData}
                       onClose={() => setPlanModal(null)} />
        )}

        <BottomNav />
        <FloatingAI currentUser={user} pagina="ontdek" />
      </div>
    </div>
  )
}
