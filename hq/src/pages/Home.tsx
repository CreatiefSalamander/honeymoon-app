import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { TRIP, IMAGES, ACTIVITIES } from '@/data/trip'
import { getAgenda, getExpenses } from '@/lib/supabase'
import { api } from '@/lib/api'
import { fmt } from '@/lib/currency'

function useCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000 * 30); return () => clearInterval(id) }, [])
  const start = new Date(TRIP.start).getTime()
  const end = new Date(TRIP.end).getTime()
  const days = Math.ceil((start - now) / 86400000)
  const dayOf = Math.floor((now - start) / 86400000) + 1
  const total = Math.round((end - start) / 86400000)
  return { days, dayOf, total, started: now >= start, ended: now > end }
}

function FloatHearts() {
  const items = ['✦', '🌺', '🤍', '✦', '🌊']
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} aria-hidden>
      {items.map((e, i) => (
        <span key={i} style={{ position: 'fixed', left: `${10 + i * 19}%`, bottom: '-20px', fontSize: 18, opacity: .5, animation: `floatUp ${9 + i * 1.4}s linear ${i * 1.5}s infinite` }}>{e}</span>
      ))}
    </div>
  )
}

export default function Home() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const { phone } = useTrip()
  const cd = useCountdown()
  const [welcome, setWelcome] = useState(!sessionStorage.getItem('welcomed'))
  const [agenda, setAgenda] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [weather, setWeather] = useState<any>(null)
  const [tip, setTip] = useState<string>('')

  useEffect(() => {
    if (welcome) { sessionStorage.setItem('welcomed', '1'); const tmo = setTimeout(() => setWelcome(false), 1700); return () => clearTimeout(tmo) }
  }, [])

  useEffect(() => {
    getAgenda().then(setAgenda)
    getExpenses().then(setExpenses)
    const dest = TRIP.start && Date.now() >= new Date(TRIP.start).getTime() ? { lat: -8.906, lng: 116.012 } : { lat: -8.65, lng: 115.21 }
    api.weather(dest.lat, dest.lng).then(setWeather).catch(() => {})
    // AI-tip van de dag (dagelijks gecached)
    const today = new Date().toDateString()
    const cached = localStorage.getItem('hq_tip')
    if (cached) { try { const c = JSON.parse(cached); if (c.day === today) { setTip(c.tip); return } } catch {} }
    api.chat([{ role: 'user', content: `Geef één warme, concrete reistip (max 22 woorden) voor Abdul & Lilia op huwelijksreis in Lombok/Bali. Taal: ${i18n.language}. Alleen de tip, geen inleiding.` }])
      .then(r => { const tip = r.message || ''; setTip(tip); localStorage.setItem('hq_tip', JSON.stringify({ day: today, tip })) })
      .catch(() => setTip(t('chat.welcome')))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayItems = useMemo(() => agenda.filter(a => a.date === today).slice(0, 3), [agenda, today])
  const spent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const plannedTotal = TRIP.budgetBase + spent
  const pct = Math.min(100, Math.round(plannedTotal / TRIP.budgetTotal * 100))

  const hour = new Date().getHours()
  const greet = hour < 12 ? t('greeting.morning') : hour < 18 ? t('greeting.afternoon') : t('greeting.evening')

  if (welcome) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-grad)' }}>
        <div className="reveal" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>✦</div>
          <div className="serif" style={{ fontSize: 30, fontStyle: 'italic', color: 'var(--ocean-deep)' }}>{t('home.welcome')}</div>
          <div className="eyebrow" style={{ marginTop: 8 }}>{t('appTagline')}</div>
        </div>
      </div>
    )
  }

  return (
    <Shell>
      <FloatHearts />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div className="hero reveal" style={{ marginBottom: 16 }}>
          <img className="hero-media" src={IMAGES.coupleB} alt="" onError={e => { (e.target as HTMLImageElement).src = IMAGES.hero }} />
          <div className="hero-grad" />
          <div className="hero-body">
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>{greet}, {phone === 'lilia' ? 'Lilia' : 'Abdul'} ✦</div>
            <div className="serif" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.1, marginTop: 4 }}>
              {cd.ended ? t('home.after') : cd.started ? t('home.dayOf', { x: cd.dayOf }) : `${cd.days}`}
            </div>
            {!cd.started && !cd.ended && <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>{t('home.daysToGo')}</div>}
            {cd.started && !cd.ended && <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }} className="mono">Day {cd.dayOf} / {cd.total}</div>}
          </div>
        </div>

        {/* Widget-rij */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {/* Weer */}
          <button className="card reveal" onClick={() => nav('/explore')} style={{ padding: 16, textAlign: 'left' }}>
            <div className="eyebrow">{t('home.weatherCard')}</div>
            {weather && !weather.error ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                {weather.icon && <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} width={36} height={36} alt="" />}
                <span className="serif" style={{ fontSize: 30, fontWeight: 600, color: 'var(--ocean-deep)' }}>{Math.round(weather.temp)}°</span>
              </div>
            ) : <div className="skel" style={{ height: 36, marginTop: 6 }} />}
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, textTransform: 'capitalize' }}>{weather?.city || 'Indonesia'}</div>
          </button>

          {/* Budget mini */}
          <button className="card reveal" onClick={() => nav('/budget')} style={{ padding: 16, textAlign: 'left' }}>
            <div className="eyebrow">{t('home.budgetCard')}</div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, color: 'var(--gold)', marginTop: 6 }}>{fmt(TRIP.budgetTotal - plannedTotal)}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t('budget.remaining', { x: '' })}</div>
            <div className="prog" style={{ marginTop: 8 }}><i style={{ width: `${pct}%` }} /></div>
          </button>
        </div>

        {/* Vandaag */}
        {todayItems.length > 0 && (
          <div className="card reveal" style={{ padding: '16px 18px', marginBottom: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{t('home.todayCard')}</div>
            {todayItems.map(it => (
              <div key={it.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0' }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--gold)', width: 56 }}>{it.time_slot || '—'}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{it.activity || it.title}</span>
              </div>
            ))}
            <button onClick={() => nav('/agenda')} style={{ fontSize: 12.5, color: 'var(--ocean)', marginTop: 6, fontWeight: 600 }}>{t('nav.agenda')} →</button>
          </div>
        )}

        {/* AI-tip */}
        <div className="card reveal" style={{ padding: '16px 18px', marginBottom: 12, borderLeft: '3px solid var(--gold)' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>✦ {t('home.tipCard')}</div>
          {tip ? <div className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.45 }}>{tip}</div> : <div className="skel" style={{ height: 20 }} />}
        </div>

        {/* Snel ontdekken */}
        <div className="s-head" style={{ marginTop: 18 }}><div className="s-title">{t('nav.explore')}</div><button onClick={() => nav('/explore')} style={{ fontSize: 13, color: 'var(--ocean)' }}>{t('common.search')} →</button></div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }} className="no-sb">
          {ACTIVITIES.slice(0, 6).map(a => (
            <button key={a.id} onClick={() => nav('/explore')} className="photo-card reveal" style={{ flex: '0 0 140px', textAlign: 'left' }}>
              <div style={{ height: 90, backgroundImage: `url(${a.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{a.icon} {(a.name as any)[i18n.language] || a.name.en}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{a.price}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  )
}
