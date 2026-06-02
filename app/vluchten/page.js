'use client'
import { useState } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'

const POPULAIRE_ROUTES = [
  { van: 'AMS', naar: 'DXB', label: 'Amsterdam → Dubai', vlag: '🇦🇪' },
  { van: 'AMS', naar: 'IST', label: 'Amsterdam → Istanbul', vlag: '🇹🇷' },
  { van: 'AMS', naar: 'BCN', label: 'Amsterdam → Barcelona', vlag: '🇪🇸' },
  { van: 'AMS', naar: 'CMN', label: 'Amsterdam → Marrakech', vlag: '🇲🇦' },
  { van: 'AMS', naar: 'BKK', label: 'Amsterdam → Bangkok', vlag: '🇹🇭' },
  { van: 'AMS', naar: 'MLE', label: 'Amsterdam → Maldiven', vlag: '🇲🇻' },
]

const AIRPORT_CODES = [
  'AMS — Amsterdam Schiphol',
  'RTM — Rotterdam The Hague',
  'EIN — Eindhoven',
  'BRU — Brussel',
  'DUS — Düsseldorf',
  'DXB — Dubai',
  'IST — Istanbul',
  'BCN — Barcelona',
  'CMN — Casablanca/Marrakech',
  'BKK — Bangkok',
  'MLE — Malé (Maldiven)',
  'CDG — Parijs Charles de Gaulle',
  'FCO — Rome',
  'ATH — Athene',
  'LHR — Londen Heathrow',
]

function BookingSiteCard({ site }) {
  return (
    <a href={site.url} target="_blank" rel="noreferrer"
       className="place-card p-4 flex items-center gap-3 active:scale-98 transition-transform no-underline block">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
           style={{ background: `${site.color}20` }}>
        {site.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: 'var(--brown)' }}>{site.site}</p>
        <p className="text-xs truncate" style={{ color: 'var(--brown-soft)' }}>{site.tip}</p>
      </div>
      <span className="text-lg" style={{ color: 'var(--gold)' }}>→</span>
    </a>
  )
}

function AmadeusOffer({ offer, currency }) {
  const vertrek = offer.departure ? new Date(offer.departure).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '—'
  const aankomst = offer.arrival ? new Date(offer.arrival).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '—'
  return (
    <div className="glass-sm p-4 flex items-center justify-between">
      <div>
        <p className="font-bold text-sm">{offer.airline}</p>
        <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>
          {vertrek} → {aankomst} · {offer.stops === 0 ? 'Direct' : `${offer.stops} stop`} · {offer.duration}
        </p>
      </div>
      <div className="text-right">
        <p className="serif font-bold gold-text text-xl">{offer.price}</p>
        <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>{offer.currency} p.p.</p>
      </div>
    </div>
  )
}

export default function VluchtenPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [van, setVan] = useState('AMS')
  const [naar, setNaar] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function zoekVluchten(e) {
    e?.preventDefault()
    if (!van || !naar) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch('/api/flight/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: van, to: naar, departDate, returnDate: returnDate || null, adults }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResults(data)
    } catch {
      setError('Verbindingsfout — probeer opnieuw')
    } finally {
      setLoading(false)
    }
  }

  function laadRoute(route) {
    setVan(route.van)
    setNaar(route.naar)
  }

  const vandaag = new Date().toISOString().split('T')[0]

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="serif text-2xl font-bold">✈️ Vluchten zoeken</h1>
            <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
              Vergelijk prijzen op alle grote boekingssites
            </p>
          </div>

          {/* Zoekformulier */}
          <form onSubmit={zoekVluchten} className="glass p-4 mb-5">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--brown-soft)' }}>Van (IATA-code)</label>
                <input value={van} onChange={e => setVan(e.target.value.toUpperCase())}
                       placeholder="bijv. AMS" className="input font-mono" maxLength={3} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--brown-soft)' }}>Naar (IATA-code)</label>
                <input value={naar} onChange={e => setNaar(e.target.value.toUpperCase())}
                       placeholder="bijv. DXB" className="input font-mono" maxLength={3} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--brown-soft)' }}>Heenvlucht</label>
                <input type="date" value={departDate} min={vandaag} onChange={e => setDepartDate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--brown-soft)' }}>Terugvlucht (optioneel)</label>
                <input type="date" value={returnDate} min={departDate || vandaag} onChange={e => setReturnDate(e.target.value)} className="input" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <label className="text-xs" style={{ color: 'var(--brown-soft)' }}>Reizigers:</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))} className="w-8 h-8 rounded-full btn-ghost text-lg">−</button>
                <span className="font-bold w-4 text-center">{adults}</span>
                <button type="button" onClick={() => setAdults(a => Math.min(9, a + 1))} className="w-8 h-8 rounded-full btn-ghost text-lg">+</button>
              </div>
              <span className="text-xs" style={{ color: 'var(--brown-soft)' }}>{adults === 1 ? 'persoon' : 'personen'}</span>
            </div>

            <button type="submit" disabled={!van || !naar || loading} className="btn-rose w-full py-3 text-base disabled:opacity-40">
              {loading ? '⏳ Zoeken...' : '🔍 Zoek vluchten'}
            </button>
          </form>

          {/* Populaire IATA-codes */}
          <div className="glass-sm p-3 mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gold)' }}>Veelgebruikte codes</p>
            <div className="flex flex-col gap-1">
              {AIRPORT_CODES.map(c => (
                <button key={c} onClick={() => { const code = c.split(' ')[0]; if (!van || van === 'AMS') setNaar(code); else setNaar(code) }}
                        className="text-left text-xs py-0.5" style={{ color: 'var(--brown-soft)' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Populaire routes */}
          {!results && !loading && (
            <div className="mb-5">
              <h2 className="serif font-semibold mb-3">✨ Populaire huwelijksroutes</h2>
              <div className="flex flex-col gap-2">
                {POPULAIRE_ROUTES.map(route => (
                  <button key={route.label} onClick={() => { laadRoute(route); setTimeout(zoekVluchten, 100) }}
                          className="place-card p-3 flex items-center gap-3 text-left active:scale-98 transition-transform">
                    <span className="text-2xl">{route.vlag}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{route.label}</p>
                      <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>Tik voor boekingslinks</p>
                    </div>
                    <span style={{ color: 'var(--gold)' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fout */}
          {error && (
            <div className="glass p-4 text-center mb-4">
              <p className="text-2xl mb-2">⚠️</p>
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Resultaten */}
          {results && (
            <>
              {/* Route header */}
              <div className="glass p-4 mb-4">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <span className="serif font-bold text-2xl gold-text">{results.from}</span>
                  <span className="text-2xl">✈️</span>
                  <span className="serif font-bold text-2xl gold-text">{results.to}</span>
                </div>
                <p className="text-center text-sm" style={{ color: 'var(--brown-soft)' }}>
                  {results.departDate ? new Date(results.departDate).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'long' }) : ''}
                  {results.returnDate ? ` — ${new Date(results.returnDate).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'long' })}` : ' (enkele reis)'}
                  {' · '}{results.adults} {results.adults === 1 ? 'persoon' : 'personen'}
                </p>
              </div>

              {/* Amadeus echte prijzen */}
              {results.hasRealPrices && (
                <div className="mb-5">
                  <h2 className="serif font-semibold mb-3">💰 Live prijzen (Amadeus)</h2>
                  <div className="flex flex-col gap-2">
                    {results.amadeusOffers.map((offer, i) => (
                      <AmadeusOffer key={i} offer={offer} currency={offer.currency} />
                    ))}
                  </div>
                </div>
              )}

              {/* Amadeus nota */}
              {results.amadeusNote && (
                <div className="glass-sm p-3 mb-4 flex items-start gap-2">
                  <span>💡</span>
                  <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>{results.amadeusNote}</p>
                </div>
              )}

              {/* Boekingssites */}
              <div className="mb-5">
                <h2 className="serif font-semibold mb-3">🌐 Vergelijk op boekingssites</h2>
                <p className="text-xs mb-3" style={{ color: 'var(--brown-soft)' }}>
                  Tik op een site — de zoekopdracht is al ingevuld. Vergelijk altijd minstens 3 sites!
                </p>
                <div className="flex flex-col gap-2">
                  {results.bookingLinks.map(site => (
                    <BookingSiteCard key={site.site} site={site} />
                  ))}
                </div>
              </div>

              {/* Nabijgelegen vliegvelden */}
              {results.nearbyAirports?.length > 1 && (
                <div className="glass p-4 mb-5">
                  <h2 className="serif font-semibold mb-3">🗺️ Vlieg ook vanuit...</h2>
                  <p className="text-xs mb-3" style={{ color: 'var(--brown-soft)' }}>
                    Vliegvelden in de buurt — soms veel goedkoper!
                  </p>
                  <div className="flex flex-col gap-2">
                    {results.nearbyAirports.filter(a => a.code !== results.from).map(airport => (
                      <button key={airport.code} onClick={() => { setVan(airport.code); zoekVluchten() }}
                              className="flex items-center gap-3 p-3 glass-sm active:scale-98 transition-transform">
                        <span className="text-xl">✈️</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{airport.name} ({airport.code})</p>
                          <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>± {airport.km} km van {results.from}</p>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--gold)' }}>Zoek →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="glass p-4 mb-4">
                <h2 className="serif font-semibold mb-3">💡 Tips voor goedkope vluchten</h2>
                <div className="flex flex-col gap-2">
                  {results.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-sm" style={{ color: 'var(--brown-soft)' }}>
                      <span className="flex-shrink-0">{tip.slice(0, 2)}</span>
                      <span>{tip.slice(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <BottomNav />
        <FloatingAI currentUser={user} pagina="vluchten zoeken" />
      </div>
    </div>
  )
}
