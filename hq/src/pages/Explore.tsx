import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { ACTIVITIES, ACTIVITY_FILTERS, Activity } from '@/data/trip'
import { api } from '@/lib/api'
import { addAgenda, saveFavorite, getFavorites } from '@/lib/supabase'
import { downloadICS } from '@/lib/ics'
import { toast } from '@/lib/notify'
import { distanceKm } from '@/lib/geo'

const CATS = [
  { key: 'restaurant', icon: '🍽️', label: 'Eten' }, { key: 'tourist_attraction', icon: '🏛️', label: 'Cultuur' },
  { key: 'natural_feature', icon: '🏖️', label: 'Strand' }, { key: 'spa', icon: '💆', label: 'Wellness' },
  { key: 'night_club', icon: '🎭', label: 'Uitgaan' }, { key: 'store', icon: '🛍️', label: 'Shoppen' },
  { key: 'hospital', icon: '🏥', label: 'Zorg' }, { key: 'place_of_worship', icon: '🕌', label: 'Spiritueel' },
]

function PlanSheet({ item, onClose }: { item: any; onClose: () => void }) {
  const { t } = useTranslation()
  const { phone } = useTrip()
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('Middag')
  const [price, setPrice] = useState('')
  async function add(toPhone = false) {
    if (!date) { toast('📅 ' + t('budget.date')); return }
    await addAgenda({ date, time_slot: slot, activity: item.name, location: item.address || '', lat: item.lat, lng: item.lng, place_id: item.id, type: 'activiteit', price: price ? Number(price) : null, created_by: phone })
    if (toPhone) downloadICS({ title: item.name, date, timeSlot: slot, location: item.address, note: '' })
    toast('✓ ' + t('explore.addToAgenda'))
    onClose()
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="eyebrow">{t('agenda.title')}</div>
        <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>{item.name}</div>
        <label className="eyebrow">{t('budget.date')}</label>
        <input type="date" className="input" value={date} min="2026-06-12" max="2026-07-24" onChange={e => setDate(e.target.value)} style={{ marginTop: 6, marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['Ochtend', 'Middag', 'Avond', 'Nacht'].map(s => <button key={s} className={`pill ${slot === s ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSlot(s)}>{s}</button>)}
        </div>
        <label className="eyebrow">{t('budget.amount')} (€)</label>
        <input type="number" className="input" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" style={{ marginTop: 6, marginBottom: 16 }} />
        <button className="btn btn-gold" style={{ width: '100%', marginBottom: 8 }} onClick={() => add(false)}>📅 {t('explore.addToAgenda')}</button>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => add(true)}>🍎 {t('agenda.addToPhone')}</button>
      </div>
    </div>
  )
}

function ActivityCard({ a, lang, onPlan, onFav, faved }: { a: Activity; lang: string; onPlan: (x: any) => void; onFav: (x: any) => void; faved: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="photo-card reveal" style={{ marginBottom: 12 }}>
      <div onClick={() => setOpen(o => !o)} style={{ height: 150, position: 'relative', backgroundImage: `url(${a.img})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }}>
        <div className="hero-grad" style={{ position: 'absolute', inset: 0 }} />
        <button onClick={e => { e.stopPropagation(); onFav({ place_id: a.id, name: (a.name as any)[lang] || a.name.en, category: a.cat, lat: a.lat, lng: a.lng, data: a }) }}
          style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.9)', fontSize: 16 }}>{faved ? '❤️' : '♡'}</button>
        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, color: '#fff' }}>
          <div className="serif" style={{ fontSize: 18, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{a.icon} {(a.name as any)[lang] || a.name.en}</div>
          <div style={{ fontSize: 12, opacity: .85 }}>{a.price} · {a.phase}</div>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{(a.desc as any)[lang] || a.desc.en}</p>
        {a.allergy && <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 10, background: 'var(--gold-pale)', fontSize: 12.5, color: 'var(--ink-2)' }}>{(a.allergy as any)[lang] || a.allergy.en}</div>}
        {open && (
          <div style={{ marginTop: 10 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{a.providers.length} aanbieders</div>
            {a.providers.map((p, i) => (
              <div key={i} className="glass" style={{ padding: '10px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name} <span style={{ color: 'var(--gold)', fontWeight: 400 }}>{p.rating}</span></div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.price} · {p.addr}</div>
                </div>
                {p.phone && p.phone.startsWith('+') && <a className="btn btn-ghost btn-sm" href={`tel:${p.phone.replace(/\s/g, '')}`}>📞</a>}
                {p.url && <a className="btn btn-ghost btn-sm" href={p.url} target="_blank" rel="noreferrer">🌐</a>}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => onPlan({ id: a.id, name: (a.name as any)[lang] || a.name.en, address: a.providers[0]?.addr, lat: a.lat, lng: a.lng })}>📅 {t2('Plan')}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>{open ? '▲' : '▼ ' + (a.providers.length) + ' opties'}</button>
        </div>
      </div>
    </div>
  )
}
function t2(s: string) { return s }

export default function Explore() {
  const { t, i18n } = useTranslation()
  const { location, settings } = useTrip()
  const lang = i18n.language
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [needKey, setNeedKey] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [favs, setFavs] = useState<Set<string>>(new Set())

  useEffect(() => { getFavorites().then((f: any[]) => setFavs(new Set(f.map(x => x.place_id)))) }, [])

  const acts = filter === 'all' ? ACTIVITIES : ACTIVITIES.filter(a => a.cat === filter)

  async function search(cat?: string, q?: string) {
    setLoading(true); setPlaces([]); setNeedKey(false)
    try {
      const body: any = { radius: settings.defaultRadius }
      if (location) { body.lat = location.lat; body.lng = location.lng }
      if (q) body.query = q + (location ? '' : ' Bali Lombok')
      else if (cat) body.type = cat
      const r = await api.places(body)
      if (r.needKey || r.error?.includes?.('key')) { setNeedKey(true); return }
      setPlaces(r.places || [])
    } catch { setNeedKey(true) } finally { setLoading(false) }
  }

  async function onFav(p: any) { await saveFavorite(p); setFavs(s => new Set([...s, p.place_id])); toast('❤️ ' + t('common.saved')) }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('explore.title')}</div></div>

      <form onSubmit={e => { e.preventDefault(); search(undefined, query) }} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="input" placeholder={t('explore.searchPh')} value={query} onChange={e => setQuery(e.target.value)} />
        <button className="btn btn-ocean btn-sm" type="submit">🔍</button>
      </form>

      {/* Live Places categorieën */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }} className="no-sb">
        {CATS.map(c => <button key={c.key} className="pill" onClick={() => search(c.key)}>{c.icon} {c.label}</button>)}
      </div>

      {/* Activity filters (seeded) */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 14 }} className="no-sb">
        {ACTIVITY_FILTERS.map(f => <button key={f.key} className={`pill ${filter === f.key ? 'on' : ''}`} onClick={() => { setFilter(f.key); setPlaces([]) }}>{t('explore.' + (f.key === 'all' ? 'mapView' : f.key)) !== 'explore.' + f.key ? '' : ''}{f.key === 'all' ? 'Alles' : f.key}</button>)}
      </div>

      {/* Live resultaten */}
      {needKey && <div className="card" style={{ padding: 18, textAlign: 'center', marginBottom: 14 }}><div style={{ fontSize: 28 }}>🔑</div><p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>{t('explore.needKey')}</p></div>}
      {loading && [1, 2].map(i => <div key={i} className="skel" style={{ height: 180, marginBottom: 12 }} />)}
      {places.map(p => {
        const km = location && p.lat ? distanceKm(location, p) : null
        return (
          <div key={p.id} className="photo-card reveal" style={{ marginBottom: 12 }}>
            <div style={{ height: 140, position: 'relative', background: 'var(--glass-2)' }}>
              {p.photoRef ? <img src={api.placePhoto(p.photoRef, 600)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>📍</div>}
              <div className="hero-grad" style={{ position: 'absolute', inset: 0 }} />
              <button onClick={() => onFav({ place_id: p.id, name: p.name, category: 'place', lat: p.lat, lng: p.lng, data: p })} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.9)' }}>{favs.has(p.id) ? '❤️' : '♡'}</button>
              <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, color: '#fff' }}>
                <div className="serif" style={{ fontSize: 17, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{p.name}</div>
                <div style={{ fontSize: 12, opacity: .85 }}>{p.rating ? `★ ${p.rating}` : ''} {km ? `· ${km} km` : ''} {p.open !== undefined ? `· ${p.open ? t('explore.openNow') : t('explore.closedNow')}` : ''}</div>
              </div>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
              <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => setPlan({ id: p.id, name: p.name, address: p.address, lat: p.lat, lng: p.lng, phone: p.phone })}>📅 {t('explore.addToAgenda')}</button>
              <a className="btn btn-ghost btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`} target="_blank" rel="noreferrer">🧭</a>
              {p.phone && <a className="btn btn-ghost btn-sm" href={`tel:${p.phone}`}>📞</a>}
            </div>
          </div>
        )
      })}

      {/* Seeded activiteiten */}
      {places.length === 0 && !loading && acts.map(a => (
        <ActivityCard key={a.id} a={a} lang={lang} faved={favs.has(a.id)} onPlan={setPlan} onFav={onFav} />
      ))}

      {plan && <PlanSheet item={plan} onClose={() => setPlan(null)} />}
    </Shell>
  )
}
