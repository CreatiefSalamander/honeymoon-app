import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { getFavorites, removeFavorite, addAgenda, logActivity } from '@/lib/supabase'
import { api } from '@/lib/api'
import { toast } from '@/lib/notify'

export default function Favorieten() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { phone } = useTrip()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<any>(null)

  useEffect(() => { getFavorites().then((d: any[]) => { setItems(d); setLoading(false) }) }, [])

  async function remove(placeId: string) { await removeFavorite(placeId); setItems(p => p.filter(x => x.place_id !== placeId)); toast('✓') }
  async function planNow(fav: any, slot: string) {
    const today = new Date().toISOString().split('T')[0]
    await addAgenda({ date: today, time_slot: slot, activity: fav.name, location: fav.data?.address || '', lat: fav.lat, lng: fav.lng, place_id: fav.place_id, type: 'activiteit', created_by: phone })
    logActivity('reis', `${phone === 'lilia' ? 'Lilia' : 'Abdul'} plande "${fav.name}"`, phone)
    setPlan(null); toast('✓ ' + t('explore.addToAgenda')); nav('/agenda')
  }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('more.bucketlist') && 'Favorieten'}</div><button className="btn btn-ghost btn-sm" onClick={() => nav('/explore')}>+ {t('nav.explore')}</button></div>
      {loading ? [1, 2, 3].map(i => <div key={i} className="skel" style={{ height: 90, marginBottom: 10 }} />) :
        items.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>❤️</div>
            <p className="serif" style={{ fontSize: 18, marginTop: 8 }}>Nog geen favorieten</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Tik op het hartje bij een plek in {t('nav.explore')}</p>
            <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={() => nav('/explore')}>{t('nav.explore')} →</button>
          </div>
        ) : items.map(f => (
          <div key={f.place_id} className="photo-card" style={{ marginBottom: 12, display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: 96, flexShrink: 0, background: 'var(--glass-2)' }}>
              {f.data?.photoRef ? <img src={api.placePhoto(f.data.photoRef, 200)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 28 }}>📍</div>}
            </div>
            <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{f.data?.rating ? `★ ${f.data.rating}` : ''} {f.category || ''}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button className="btn btn-gold btn-sm" onClick={() => setPlan(f)}>📅 {t('explore.addToAgenda')}</button>
                <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent(f.name)}`}>🧭</a>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(f.place_id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}

      {plan && (
        <div className="overlay" onClick={() => setPlan(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{plan.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>Plan vandaag in — kies een dagdeel:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Ochtend', 'Middag', 'Avond', 'Nacht'].map(s => <button key={s} className="pill" style={{ flex: 1, justifyContent: 'center' }} onClick={() => planNow(plan, s)}>{s}</button>)}
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 14 }} onClick={() => setPlan(null)}>{t('common.cancel')}</button>
          </div>
        </div>
      )}
    </Shell>
  )
}
