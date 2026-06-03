import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { DESTINATIONS, TRIP } from '@/data/trip'
import { getNote, setNote } from '@/lib/supabase'
import { api } from '@/lib/api'
import { toast } from '@/lib/notify'

function nights(a: string, b: string) { return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) }

export default function TravelPlan() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const lang = i18n.language
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [weather, setWeather] = useState<Record<string, any>>({})
  const [open, setOpen] = useState<string | null>('lombok')

  useEffect(() => {
    const n: Record<string, string> = {}; DESTINATIONS.forEach(d => n[d.id] = getNote(d.id)); setNotes(n)
    DESTINATIONS.forEach(d => api.weather(d.lat, d.lng).then(w => setWeather(prev => ({ ...prev, [d.id]: w }))).catch(() => {}))
  }, [])

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('travel.whereWeStay')}</div></div>

      {/* Route */}
      <div className="card reveal" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {['🇦🇲 Yerevan', '✈️', '🌴 Lombok', '🏝️ Gili/Bali'].map((s, i) => (
          <span key={i} style={{ fontSize: i % 2 ? 12 : 13, fontWeight: i % 2 ? 400 : 600, color: i % 2 ? 'var(--ink-3)' : 'var(--ink)' }}>{s}</span>
        ))}
      </div>
      <div className="eyebrow" style={{ marginBottom: 16 }}>{t('home.soloLeg')} {(TRIP.soloLeg as any)[lang] || TRIP.soloLeg.en}</div>

      {DESTINATIONS.map(d => (
        <div key={d.id} className="photo-card reveal" style={{ marginBottom: 14 }}>
          <div onClick={() => setOpen(open === d.id ? null : d.id)} style={{ height: 160, position: 'relative', backgroundImage: `url(${d.img})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }}>
            <div className="hero-grad" style={{ position: 'absolute', inset: 0 }} />
            <span className="badge badge-gold" style={{ position: 'absolute', top: 12, left: 12 }}>{(d.weekBadge as any)[lang] || d.weekBadge.en}</span>
            {weather[d.id] && !weather[d.id].error && (
              <span className="badge" style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.9)', color: 'var(--ocean-deep)' }}>
                {weather[d.id].icon && <img src={`https://openweathermap.org/img/wn/${weather[d.id].icon}.png`} width={22} height={22} alt="" />}{Math.round(weather[d.id].temp)}°
              </span>
            )}
            <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, color: '#fff' }}>
              <div className="serif" style={{ fontSize: 20, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{(d.name as any)[lang] || d.name.en}</div>
              <div style={{ fontSize: 12, opacity: .85 }}>{d.location}</div>
            </div>
          </div>
          {open === d.id && (
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <div><div className="eyebrow">{t('travel.checkIn')}</div><div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(d.checkIn).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</div></div>
                <div><div className="eyebrow">{t('travel.checkOut')}</div><div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(d.checkOut).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</div></div>
                <div><div className="eyebrow">{t('travel.duration')}</div><div style={{ fontSize: 14, fontWeight: 600 }}>{nights(d.checkIn, d.checkOut)} {t('travel.nights')}</div></div>
              </div>
              {d.allergy && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--gold-pale)', fontSize: 12.5, marginBottom: 12 }}>🌿 {(d.allergy as any)[lang] || d.allergy.en}</div>}
              <div className="eyebrow" style={{ marginBottom: 6 }}>{t('travel.highlights')}</div>
              {d.highlights.map((h, i) => <div key={i} style={{ fontSize: 13, color: 'var(--ink-2)', padding: '3px 0' }}>· {(h as any)[lang] || h.en}</div>)}
              <textarea className="input" style={{ marginTop: 12, minHeight: 70 }} placeholder={t('travel.notePh')} value={notes[d.id] || ''} onChange={e => setNotes(n => ({ ...n, [d.id]: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setNote(d.id, notes[d.id] || ''); toast('✓ ' + t('common.save')) }}>{t('common.save')}</button>
                <button className="btn btn-ocean btn-sm" style={{ flex: 1 }} onClick={() => nav('/explore')}>{t('travel.exploreHere')} →</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </Shell>
  )
}
