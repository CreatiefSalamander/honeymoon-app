'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { useLanguage } from '@/lib/i18n'
import { getSavedPlaces, deleteSavedPlace, addItineraryItem } from '@/lib/supabase'
import { Log } from '@/lib/activityLog'

const CAT_ICONS = {
  restaurant: '🍽️', cafe: '☕', tourist_attraction: '🏛️', park: '🏖️',
  shopping_mall: '🛍️', supermarket: '🛒', pharmacy: '💊', atm: '🏧',
  taxi_stand: '🚕', jewelry_store: '💍', spa: '💆', art_gallery: '🎨',
  night_club: '🎉', hospital: '🏥', place_of_worship: '🕌',
}

function PlaceFoto({ plek }) {
  const photoRef = plek.data?.photoRef
  const [error, setError] = useState(false)
  if (!photoRef || error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-4xl"
           style={{ background: 'rgba(201,162,75,0.08)' }}>
        {CAT_ICONS[plek.category] || '📍'}
      </div>
    )
  }
  return (
    <img src={`/api/places/photo?name=${encodeURIComponent(photoRef)}&w=400`}
         alt={plek.name} className="w-full h-full object-cover"
         onError={() => setError(true)} loading="lazy" />
  )
}

export default function FavorietenPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const { t } = useLanguage()
  const [plekken, setPlekken] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('alles')
  const [toasterMsg, setToasterMsg] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(null)
  const [planForm, setPlanForm] = useState({ date: '', time_slot: 'Middag' })

  useEffect(() => {
    getSavedPlaces().then(data => { setPlekken(data); setLoading(false) })
  }, [])

  function toon(msg) {
    setToasterMsg(msg)
    setTimeout(() => setToasterMsg(null), 2500)
  }

  async function verwijder(id) {
    await deleteSavedPlace(id)
    setPlekken(prev => prev.filter(p => p.id !== id))
    toon('Verwijderd uit favorieten')
  }

  async function voegToeAanReis() {
    if (!showPlanModal || !planForm.date) return
    const plek = plekken.find(p => p.id === showPlanModal)
    if (!plek) return
    await addItineraryItem({
      date: planForm.date,
      time_slot: planForm.time_slot,
      activity: plek.name,
      location: plek.data?.address || '',
      lat: plek.lat,
      lng: plek.lng,
      place_id: plek.place_id,
      phone: plek.data?.phone || null,
      type: 'activiteit',
      created_by: user,
    })
    Log.reis(plek.name, planForm.date, user)
    setShowPlanModal(null)
    toon(`✓ ${plek.name} toegevoegd aan agenda!`)
  }

  const categorieen = [...new Set(plekken.map(p => p.category).filter(Boolean))]
  const gefilterd = activeFilter === 'alles' ? plekken : plekken.filter(p => p.category === activeFilter)

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">❤️ {t('favorieten')}</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
                {plekken.length} bewaard{plekken.length !== 1 ? '' : 'e'} plek{plekken.length !== 1 ? 'ken' : ''}
              </p>
            </div>
            <a href="/ontdek" className="btn-ghost text-xs px-3 py-1.5">+ Ontdek meer</a>
          </div>

          {/* Filters */}
          {categorieen.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              <button onClick={() => setActiveFilter('alles')} className={`chip flex-shrink-0 ${activeFilter === 'alles' ? 'active' : ''}`}>
                🗂️ Alles ({plekken.length})
              </button>
              {categorieen.map(cat => (
                <button key={cat} onClick={() => setActiveFilter(cat)}
                        className={`chip flex-shrink-0 ${activeFilter === cat ? 'active' : ''}`}>
                  {CAT_ICONS[cat] || '📍'} {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="masonry">{[1,2,3,4].map(i => <div key={i} className={`masonry-item skeleton rounded-3xl`} style={{ height: i%2===0?180:150 }} />)}</div>
          ) : gefilterd.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">❤️</p>
              <h3 className="serif text-xl mb-2">Nog geen favorieten</h3>
              <p className="serif-italic text-sm mb-4" style={{ color: 'var(--brown-soft)' }}>
                Sla plekken op via het hart-icoon in Ontdek
              </p>
              <a href="/ontdek" className="btn-gold px-6 py-2.5 inline-block">Ga naar Ontdek →</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gefilterd.map(plek => (
                <div key={plek.id} className="place-card overflow-hidden">
                  {/* Foto */}
                  <div className="h-36 relative">
                    <PlaceFoto plek={plek} />
                    <div className="absolute inset-0 hero-gradient" />
                    <div className="absolute bottom-2 left-3 right-10">
                      <p className="font-bold text-white text-sm leading-tight drop-shadow">{plek.name}</p>
                    </div>
                    {/* Verwijder-knop */}
                    <button onClick={() => verwijder(plek.id)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
                      <span className="text-base">❤️</span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-sm">{CAT_ICONS[plek.category] || '📍'}</span>
                      <span className="text-xs" style={{ color: 'var(--brown-soft)' }}>
                        {plek.data?.rating && `⭐ ${plek.data.rating.toFixed(1)}`}
                      </span>
                    </div>
                    {/* Actie-knoppen */}
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => setShowPlanModal(plek.id)}
                              className="btn-gold py-1.5 text-xs w-full">
                        📅 Plan in reis
                      </button>
                      <div className="flex gap-1.5">
                        {plek.lat && (
                          <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plek.name)}&query_place_id=${plek.place_id}`, '_blank')}
                                  className="btn-ghost py-1.5 text-xs flex-1">
                            🧭
                          </button>
                        )}
                        {plek.data?.phone && (
                          <a href={`tel:${plek.data.phone}`} className="btn-ghost py-1.5 text-xs flex-1 text-center">
                            📞
                          </a>
                        )}
                        <button onClick={() => verwijder(plek.id)} className="py-1.5 text-xs flex-1 rounded-xl"
                                style={{ background: 'rgba(227,166,181,0.1)', color: 'var(--rose)' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan in reis modal */}
        {showPlanModal && (
          <div className="overlay" onClick={() => setShowPlanModal(null)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <h2 className="serif text-xl mb-1">Inplannen</h2>
              <p className="text-sm mb-4 serif-italic" style={{ color: 'var(--brown-soft)' }}>
                {plekken.find(p => p.id === showPlanModal)?.name}
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--brown-soft)' }}>Datum</label>
                  <input type="date" value={planForm.date} onChange={e => setPlanForm(p => ({...p, date: e.target.value}))} className="input" />
                </div>
                <div>
                  <label className="text-xs mb-2 block" style={{ color: 'var(--brown-soft)' }}>Tijdslot</label>
                  <div className="flex gap-2">
                    {['Ochtend','Middag','Avond','Nacht'].map(s => (
                      <button key={s} onClick={() => setPlanForm(p => ({...p, time_slot: s}))}
                              className={`chip flex-1 justify-center text-xs ${planForm.time_slot === s ? 'active' : ''}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowPlanModal(null)} className="flex-1 btn-ghost">Annuleer</button>
                <button onClick={voegToeAanReis} disabled={!planForm.date} className="flex-1 btn-gold disabled:opacity-40">
                  📅 Toevoegen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toaster */}
        {toasterMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium"
               style={{ background: 'var(--brown)', color: 'white', boxShadow: '0 8px 24px rgba(46,38,32,0.3)' }}>
            {toasterMsg}
          </div>
        )}

        <BottomNav />
        <FloatingAI currentUser={user} pagina="favorieten" />
      </div>
    </div>
  )
}
