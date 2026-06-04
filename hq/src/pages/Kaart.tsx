import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { getLocations, subscribeLocations, getFavorites } from '@/lib/supabase'
import { pushLocation, getCurrentLocation } from '@/lib/geo'
import { api } from '@/lib/api'

declare const L: any

const AVATAR: Record<string, string> = { abdul: '🤵', lilia: '👰' }

function avatarIcon(emoji: string, color: string) {
  return L.divIcon({
    className: '', iconSize: [48, 56], iconAnchor: [24, 54],
    html: `<div style="position:relative;width:48px;height:56px;">
      <div style="width:46px;height:46px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:24px;">${emoji}</div>
      <div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #fff;"></div>
    </div>`,
  })
}
function placeIcon() {
  return L.divIcon({ className: '', iconSize: [26, 26], iconAnchor: [13, 26],
    html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#C9A84C,#E8C97A);border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35);"></div>` })
}

export default function Kaart() {
  const { t } = useTranslation()
  const { phone } = useTrip()
  const nav = useNavigate()
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const [locs, setLocs] = useState<any[]>([])
  const [places, setPlaces] = useState<any[]>([])
  const [status, setStatus] = useState('Locatie ophalen…')
  const [nearby, setNearby] = useState<any[]>([])

  // Init map
  useEffect(() => {
    if (typeof L === 'undefined') { setStatus('Kaart laadt…'); return }
    if (mapRef.current) return
    const map = L.map('hq-map', { zoomControl: false, attributionControl: false }).setView([-8.65, 116.0], 9)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map
  }, [])

  // Schrijf eigen locatie + laad alles
  useEffect(() => {
    getCurrentLocation().then(c => { if (c) pushLocation(phone, c) })
    refresh()
    getFavorites().then(setPlaces)
    const sub = subscribeLocations(() => refresh())
    const iv = setInterval(() => { getCurrentLocation().then(c => { if (c) pushLocation(phone, c) }); refresh() }, 20000)
    return () => { clearInterval(iv); try { (sub as any).unsubscribe() } catch {} }
  }, [phone])

  async function refresh() {
    const data = await getLocations()
    setLocs(data)
    if (data.length) setStatus(`${data.length} ${data.length === 1 ? 'persoon' : 'personen'} live`)
    else setStatus('Nog geen locaties — open de app op beide telefoons')
  }

  // Plot markers
  useEffect(() => {
    const map = mapRef.current; if (!map || typeof L === 'undefined') return
    // personen
    locs.forEach(l => {
      if (!l.lat || !l.lng) return
      const key = 'p_' + l.phone
      const color = l.phone === 'lilia' ? '#E3A6B5' : '#4ECDC4'
      if (markersRef.current[key]) markersRef.current[key].setLatLng([l.lat, l.lng])
      else markersRef.current[key] = L.marker([l.lat, l.lng], { icon: avatarIcon(AVATAR[l.phone] || '📍', color), zIndexOffset: 1000 }).addTo(map).bindPopup(`<b>${l.phone === 'lilia' ? 'Lilia 👰' : 'Abdul 🤵'}</b><br>${new Date(l.updated_at).toLocaleTimeString('nl-NL')}`)
    })
    // bewaarde plekken
    places.forEach(p => {
      if (!p.lat || !p.lng) return
      const key = 'pl_' + p.place_id
      if (!markersRef.current[key]) markersRef.current[key] = L.marker([p.lat, p.lng], { icon: placeIcon() }).addTo(map).bindPopup(`<b>${p.name}</b>`)
    })
    // center op eigen positie eerste keer
    const me = locs.find(l => l.phone === phone)
    if (me && !(map as any)._centered) { map.setView([me.lat, me.lng], 13); (map as any)._centered = true }
  }, [locs, places, phone])

  function centerOn(who: string) {
    const map = mapRef.current; const l = locs.find(x => x.phone === who)
    if (map && l) map.setView([l.lat, l.lng], 14)
  }
  async function findNearby() {
    const me = locs.find(l => l.phone === phone) || locs[0]
    if (!me) return
    setNearby([{ loading: true }])
    try { const r = await api.places({ lat: me.lat, lng: me.lng, type: 'restaurant', radius: 1500 }); setNearby(r.places || []) }
    catch { setNearby([]) }
  }

  return (
    <Shell fab={false}>
      <div className="s-head"><div className="s-title">Kaart</div><span className="badge badge-gold">{status}</span></div>

      {/* Kaart */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        <div id="hq-map" style={{ width: '100%', height: 380 }} />
      </div>

      {/* Snelknoppen */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => centerOn(phone)}>📍 Ik</button>
        <button className="btn btn-ghost btn-sm" onClick={() => centerOn(phone === 'abdul' ? 'lilia' : 'abdul')}>{phone === 'abdul' ? '👰 Lilia' : '🤵 Abdul'}</button>
        <button className="btn btn-gold btn-sm" onClick={findNearby}>🍽️ Eten in de buurt</button>
        <button className="btn btn-ghost btn-sm" onClick={() => nav('/explore')}>🧭 Ontdek</button>
      </div>

      {/* Wie is live */}
      <div className="card" style={{ padding: 14, marginBottom: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Live posities</div>
        {locs.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Nog niemand zichtbaar. Zet locatie aan en open de app op beide telefoons.</div> :
          locs.map(l => (
            <div key={l.phone} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <span style={{ fontSize: 22 }}>{AVATAR[l.phone] || '📍'}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{l.phone}{l.phone === phone ? ' (jij)' : ''}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Laatst: {new Date(l.updated_at).toLocaleTimeString('nl-NL')}</div></div>
              <button className="btn btn-ghost btn-sm" onClick={() => centerOn(l.phone)}>Toon</button>
            </div>
          ))}
      </div>

      {/* Eten in de buurt resultaten */}
      {nearby.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>🍽️ Dichtbij</div>
          {nearby[0]?.loading ? <div className="skel" style={{ height: 40 }} /> :
            nearby.slice(0, 6).map(p => (
              <a key={p.id} className="" href={`https://www.google.com/maps/search/${encodeURIComponent(p.name)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: 10, padding: '7px 0', alignItems: 'center' }}>
                <span>📍</span><div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{p.rating ? `★ ${p.rating}` : ''} {p.open !== undefined ? (p.open ? '· open' : '· gesloten') : ''}</div></div><span style={{ color: 'var(--gold)' }}>→</span>
              </a>
            ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 14 }}>
        Live posities verschijnen zolang de app open is (PWA-limiet iOS). Echte achtergrond-tracking = Fase 2 (Capacitor).
      </p>
    </Shell>
  )
}
