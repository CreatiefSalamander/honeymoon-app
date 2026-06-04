import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { api } from '@/lib/api'
import { DESTINATIONS } from '@/data/trip'

function Card({ title, w }: { title: string; w: any }) {
  if (!w) return <div className="skel" style={{ height: 150, marginBottom: 12 }} />
  if (w.error || w.missingKey) return (
    <div className="card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 6 }}>{w.missingKey ? '🔑 OpenWeather-sleutel nodig (zie rapport)' : 'Weer niet beschikbaar'}</div>
    </div>
  )
  return (
    <div className="card reveal" style={{ padding: 18, marginBottom: 12 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {w.icon && <img src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`} width={64} height={64} alt="" />}
        <div>
          <div className="serif" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: 'var(--gold)' }}>{Math.round(w.temp)}°</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', textTransform: 'capitalize' }}>{w.description}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 12, color: 'var(--text-3)' }}>
          <div>💧 {w.humidity}%</div><div>💨 {Math.round(w.wind)} m/s</div><div>🌡️ voelt {Math.round(w.feels)}°</div>
        </div>
      </div>
      {w.forecast?.length > 0 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-2)' }} className="no-sb">
          {w.forecast.map((f: any, i: number) => (
            <div key={i} style={{ textAlign: 'center', flexShrink: 0, minWidth: 50 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(f.time).toLocaleTimeString('nl-NL', { hour: '2-digit' })}</div>
              <img src={`https://openweathermap.org/img/wn/${f.icon}.png`} width={36} height={36} alt="" />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.temp}°</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Weer() {
  const { t } = useTranslation()
  const { location } = useTrip()
  const [here, setHere] = useState<any>(undefined)
  const [dest, setDest] = useState<Record<string, any>>({})

  useEffect(() => {
    if (location) api.weather(location.lat, location.lng).then(setHere).catch(() => setHere({ error: true }))
    else setHere({ error: true })
    DESTINATIONS.forEach(d => api.weather(d.lat, d.lng).then(w => setDest(p => ({ ...p, [d.id]: w }))).catch(() => {}))
  }, [location])

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('settings.themeNight') && 'Weer'}</div></div>
      {location && <Card title="📍 Jouw locatie" w={here} />}
      {DESTINATIONS.map(d => <Card key={d.id} title={`🏝️ ${d.name.en}`} w={dest[d.id]} />)}
    </Shell>
  )
}
