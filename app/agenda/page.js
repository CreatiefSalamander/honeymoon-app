'use client'
import { useState, useEffect, useCallback } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { useLanguage } from '@/lib/i18n'
import { getItinerary, getFlights, getSavedPlaces } from '@/lib/supabase'

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10
}

function dagNaamNL(datum) {
  const d = new Date(datum)
  const namen = ['zo','ma','di','wo','do','vr','za']
  const maanden = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']
  return `${namen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]}`
}

function DagKolom({ datum, items, vluchten, locatie, budgetPerDag }) {
  const isVandaag = datum === new Date().toISOString().split('T')[0]
  const isGisteren = datum === new Date(Date.now()-86400000).toISOString().split('T')[0]
  const isMorgen = datum === new Date(Date.now()+86400000).toISOString().split('T')[0]

  const label = isVandaag ? 'Vandaag' : isMorgen ? 'Morgen' : isGisteren ? 'Gisteren' : dagNaamNL(datum)

  // Bereken afstanden tussen opeenvolgende items met lat/lng
  const metAfstand = items.map((item, i) => {
    if (i === 0 || !item.lat || !items[i-1].lat) return { ...item, afstand: null }
    return { ...item, afstand: haversine(items[i-1].lat, items[i-1].lng, item.lat, item.lng) }
  })

  const vluchtVandaag = vluchten.filter(f => f.depart_at?.startsWith(datum) || f.arrive_at?.startsWith(datum))

  const SLOT_KLEUREN = { Ochtend: '#F0D060', Middag: '#E3A6B5', Avond: '#C9A24B', Nacht: '#8B7A8B' }

  return (
    <div className={`glass p-0 overflow-hidden mb-4 ${isVandaag ? 'ring-2' : ''}`}
         style={{ '--tw-ring-color': 'rgba(201,162,75,0.5)' }}>
      {/* Dag-header */}
      <div className="px-4 py-3 flex items-center justify-between"
           style={{ background: isVandaag ? 'linear-gradient(135deg,rgba(201,162,75,0.15),rgba(227,166,181,0.15))' : 'rgba(201,162,75,0.05)' }}>
        <div>
          <p className="font-bold text-sm" style={{ color: isVandaag ? 'var(--gold)' : 'var(--brown)' }}>{label}</p>
          <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>{new Date(datum).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        {budgetPerDag > 0 && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(201,162,75,0.15)', color: 'var(--gold)' }}>
            ≈ €{budgetPerDag}
          </span>
        )}
        {isVandaag && <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--gold)', color: 'white' }}>NU</span>}
      </div>

      {/* Vluchten */}
      {vluchtVandaag.map(v => (
        <div key={v.id} className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--gold-line)', background: 'rgba(33,150,243,0.05)' }}>
          <span className="text-2xl">✈️</span>
          <div className="flex-1">
            <p className="font-bold text-sm">{v.flight_no} · {v.from_code} → {v.to_code}</p>
            <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>
              {v.depart_at ? new Date(v.depart_at).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}) : ''}
              {v.arrive_at ? ' → ' + new Date(v.arrive_at).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}) : ''}
              {v.seat ? ` · Stoel ${v.seat}` : ''}
            </p>
          </div>
        </div>
      ))}

      {/* Activiteiten */}
      {metAfstand.length === 0 && vluchtVandaag.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-2xl mb-1">🌴</p>
          <p className="text-xs serif-italic" style={{ color: 'var(--brown-soft)' }}>Vrije dag — geniet!</p>
        </div>
      ) : (
        metAfstand.map((item, i) => (
          <div key={item.id}>
            {item.afstand !== null && item.afstand > 0 && (
              <div className="flex items-center gap-2 px-5 py-1.5" style={{ background: 'rgba(201,162,75,0.04)' }}>
                <div className="w-px h-4" style={{ background: 'rgba(201,162,75,0.3)', marginLeft: 10 }} />
                <span className="text-xs" style={{ color: 'var(--brown-soft)' }}>🚶 {item.afstand} km</span>
              </div>
            )}
            <div className="flex items-start gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--gold-line)' }}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-2 h-2 rounded-full mt-1" style={{ background: SLOT_KLEUREN[item.time_slot] || 'var(--gold)' }} />
                <span className="text-[10px] font-medium" style={{ color: SLOT_KLEUREN[item.time_slot] || 'var(--gold)', writingMode: 'horizontal-tb' }}>
                  {item.time_slot?.substring(0,3) || '—'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--brown)' }}>{item.activity || item.title}</p>
                {item.location && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--brown-soft)' }}>📍 {item.location}</p>
                )}
                {item.hotel && (
                  <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>🏨 {item.hotel}</p>
                )}
                {item.notes && (
                  <p className="text-xs mt-1 text-ellipsis overflow-hidden" style={{ color: 'var(--brown-soft)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.notes}
                  </p>
                )}
              </div>
              {item.price && <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>€{item.price}</span>}
            </div>
          </div>
        ))
      )}

      {/* Locatie */}
      {locatie && (isVandaag || isMorgen) && (
        <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(76,175,80,0.05)', borderTop: '1px solid var(--gold-line)' }}>
          <span className="text-sm">📍</span>
          <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>
            {isVandaag ? `Jouw locatie: ${locatie.city || 'Ophalen...'}` : `Morgen naar: ${items[0]?.location || '—'}`}
          </p>
        </div>
      )}
    </div>
  )
}

export default function AgendaPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [vluchten, setVluchten] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('week') // 'week' | 'dag' | 'lijst'
  const [locatie, setLocatie] = useState(null)
  const [geselecteerdeDag, setGeselecteerdeDag] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    Promise.all([getItinerary(), getFlights()]).then(([it, fl]) => {
      setItems(it)
      setVluchten(fl)
      setLoading(false)
    })
    // GPS
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(pos => {
        fetch(`/api/weather?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          .then(r => r.json()).then(d => { if (!d.error) setLocatie({ ...pos.coords, city: d.city }) })
          .catch(() => setLocatie(pos.coords))
      }, () => {}, { enableHighAccuracy: false, timeout: 10000 })
    }
  }, [])

  // Groepeer per datum
  const alleData = [...new Set(items.map(i => i.date))].sort()

  // Huidige en volgende 7 dagen
  const vandaag = new Date()
  const weekDagen = Array.from({length:7}, (_, i) => {
    const d = new Date(vandaag)
    d.setDate(d.getDate() + i - 1)
    return d.toISOString().split('T')[0]
  })

  // Week-view data
  const weekData = view === 'week' ? weekDagen : alleData.length > 0 ? alleData : weekDagen

  // Budget schatting per dag (gemiddelde)
  const itemsMetPrijs = items.filter(i => i.price)
  const gemPrijsPerDag = itemsMetPrijs.length > 0 ? Math.round(itemsMetPrijs.reduce((s,i) => s + Number(i.price), 0) / Math.max(alleData.length, 1)) : 0

  // Statistieken
  const totaalItems = items.length
  const gedaanItems = items.filter(i => new Date(i.date) < vandaag).length

  const VIEWS = [
    { key: 'week',  label: '📅 7 Dagen' },
    { key: 'all',   label: '🗓️ Alles' },
    { key: 'lijst', label: '📋 Lijst' },
  ]

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">📅 {t('agenda')}</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
                Smart reiskalender {locatie?.city ? `· 📍 ${locatie.city}` : ''}
              </p>
            </div>
            <a href="/reis" className="btn-ghost text-xs px-3 py-1.5">+ Toevoegen</a>
          </div>

          {/* Stats */}
          {!loading && items.length > 0 && (
            <div className="glass-sm p-4 mb-4 grid grid-cols-3 gap-3">
              {[
                { v: alleData.length, l: 'Reisdagen' },
                { v: totaalItems, l: 'Activiteiten' },
                { v: gemPrijsPerDag > 0 ? `€${gemPrijsPerDag}` : '—', l: 'Per dag (gem.)' },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <p className="serif font-bold text-xl gold-text">{s.v}</p>
                  <p className="text-[10px]" style={{ color: 'var(--brown-soft)' }}>{s.l}</p>
                </div>
              ))}
            </div>
          )}

          {/* View toggle */}
          <div className="flex gap-2 mb-4">
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                      className={`chip flex-1 justify-center text-xs ${view === v.key ? 'active' : ''}`}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-40" />)}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📅</p>
              <h3 className="serif text-xl mb-2">Agenda is leeg</h3>
              <p className="serif-italic text-sm mb-4" style={{ color: 'var(--brown-soft)' }}>
                Voeg activiteiten toe in het Reisschema
              </p>
              <a href="/reis" className="btn-gold px-6 py-2.5 inline-block">Ga naar Reis →</a>
            </div>
          ) : view === 'lijst' ? (
            // Lijst-weergave
            <div className="flex flex-col gap-2">
              {items.map(item => (
                <div key={item.id} className="glass-sm p-3 flex items-center gap-3">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
                      {new Date(item.date).toLocaleDateString('nl-NL', { day:'numeric', month:'short' })}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--brown-soft)' }}>{item.time_slot?.substring(0,3)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.activity || item.title}</p>
                    {item.location && <p className="text-xs truncate" style={{ color: 'var(--brown-soft)' }}>📍 {item.location}</p>}
                  </div>
                  {item.price && <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>€{item.price}</span>}
                </div>
              ))}
            </div>
          ) : (
            // Dag/week weergave
            (view === 'week' ? weekDagen : alleData).map(datum => {
              const dagItems = items.filter(i => i.date === datum)
              const dagVluchten = vluchten.filter(f => f.depart_at?.startsWith(datum) || f.arrive_at?.startsWith(datum))
              if (dagItems.length === 0 && dagVluchten.length === 0 && view === 'week') {
                return (
                  <div key={datum} className="glass-sm px-4 py-3 mb-2 flex items-center justify-between opacity-60">
                    <p className="text-sm font-medium">{dagNaamNL(datum)}</p>
                    <p className="text-xs serif-italic" style={{ color: 'var(--brown-soft)' }}>Vrij</p>
                  </div>
                )
              }
              return (
                <DagKolom key={datum} datum={datum} items={dagItems} vluchten={dagVluchten}
                           locatie={locatie} budgetPerDag={gemPrijsPerDag} />
              )
            })
          )}

          {/* Voeg favorieten toe suggestie */}
          {!loading && items.length > 0 && (
            <div className="glass p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">❤️</span>
                <p className="font-semibold text-sm serif">Bewaarde plekken toevoegen?</p>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--brown-soft)' }}>
                Je hebt plekken bewaard in Ontdek. Wil je ze in het reisschema zetten?
              </p>
              <div className="flex gap-2">
                <a href="/favorieten" className="btn-ghost text-xs px-3 py-1.5 flex-1 text-center">Bekijk favorieten</a>
                <a href="/reis" className="btn-gold text-xs px-3 py-1.5 flex-1 text-center">Toevoegen aan Reis</a>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
        <FloatingAI currentUser={user} pagina="agenda" />
      </div>
    </div>
  )
}
