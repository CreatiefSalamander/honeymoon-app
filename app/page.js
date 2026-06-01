'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { getCountdown, upsertCountdown, getItinerary, getBudget, getExpenses } from '@/lib/supabase'

// Hartjes-achtergrond
function Hearts() {
  const items = ['💕','🌹','✨','🌸','💫']
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {items.map((e,i) => (
        <span key={i} className="float-heart text-xl select-none"
              style={{ left:`${8+i*20}%`, bottom:'-2rem', animationDuration:`${7+i*1.5}s`, animationDelay:`${i*1.2}s` }}>
          {e}
        </span>
      ))}
    </div>
  )
}

// Countdown
function Countdown({ date }) {
  const [t, setT] = useState(null)
  const [married, setMarried] = useState(false)

  useEffect(() => {
    if (!date) return
    const tick = () => {
      const diff = new Date(date) - new Date()
      if (diff <= 0) { setMarried(true); setT({ d:0,h:0,m:0,s:0 }); return }
      setT({
        d: Math.floor(diff/86400000),
        h: Math.floor(diff%86400000/3600000),
        m: Math.floor(diff%3600000/60000),
        s: Math.floor(diff%60000/1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [date])

  if (!date) return null
  if (married) return (
    <div className="glass text-center py-8">
      <div className="text-5xl mb-3">💍</div>
      <h2 className="serif text-2xl gold-text">Jullie zijn getrouwd!</h2>
      <p className="serif-italic mt-1" style={{ color:'var(--brown-soft)' }}>Voor altijd samen 💕</p>
    </div>
  )
  if (!t) return <div className="skeleton h-36" />

  return (
    <div className="glass p-5">
      <p className="serif-italic text-sm mb-3" style={{ color:'var(--brown-soft)' }}>Nog tot de grote dag</p>
      <div className="grid grid-cols-4 gap-2">
        {[['Dagen',t.d],['Uren',t.h],['Min',t.m],['Sec',t.s]].map(([l,v]) => (
          <div key={l} className="glass-sm py-3 text-center">
            <p className="serif text-2xl font-bold gold-text">{String(v).padStart(2,'0')}</p>
            <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color:'var(--brown-soft)' }}>{l}</p>
          </div>
        ))}
      </div>
      <div className="gold-line mt-4" />
      <p className="text-center text-xs mt-2 serif-italic" style={{ color:'var(--brown-soft)' }}>
        {new Date(date).toLocaleDateString('nl-NL', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
      </p>
    </div>
  )
}

// Uur-groet
function greeting(name) {
  const h = new Date().getHours()
  const gr = h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond'
  return `${gr} ${name || 'lieverd'} ❤️`
}

export default function HomePage() {
  const [splash, setSplash] = useState(true)
  const [user, setUser] = useState(null)
  const [showUserSelect, setShowUserSelect] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [todayItems, setTodayItems] = useState([])
  const [budget, setBudget] = useState(null)
  const [spent, setSpent] = useState(0)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    // Splash 2.5s
    const t = setTimeout(() => setSplash(false), 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const u = localStorage.getItem('honeymoon_user')
    if (u) setUser(u); else setShowUserSelect(true)
  }, [])

  useEffect(() => {
    Promise.all([getCountdown(), getItinerary(), getBudget(), getExpenses()]).then(([cd, it, bud, exp]) => {
      setCountdown(cd)
      if (cd?.wedding_date) setEditDate(cd.wedding_date)
      const today = new Date().toISOString().split('T')[0]
      setTodayItems(it.filter(i => i.date === today).slice(0, 3))
      setBudget(bud)
      setSpent(exp.reduce((s, e) => s + Number(e.amount), 0))
    })
  }, [])

  // Weer ophalen op basis van geplande bestemming of locatie
  useEffect(() => {
    if (todayItems[0]?.location) {
      fetch(`/api/weather?city=${encodeURIComponent(todayItems[0].location)}`).then(r => r.json()).then(setWeather).catch(() => {})
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        fetch(`/api/weather?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`).then(r => r.json()).then(setWeather).catch(() => {})
      }, () => {})
    }
  }, [todayItems])

  function selectUser(name) {
    localStorage.setItem('honeymoon_user', name)
    setUser(name)
    setShowUserSelect(false)
    if ('vibrate' in navigator) navigator.vibrate([15, 40, 15])
  }

  async function saveDate() {
    if (!editDate) return
    const data = await upsertCountdown(editDate)
    setCountdown(data)
    setShowEdit(false)
  }

  // Splash scherm
  if (splash) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
           style={{ background: 'linear-gradient(160deg, #FBF6EF 0%, #F5EDE0 100%)' }}>
        <div className="text-6xl mb-5" style={{ animation: 'fadeIn 0.8s ease-out 0.3s both' }}>💍</div>
        <h1 className="serif text-4xl font-bold text-center" style={{ animation: 'slideUp 0.6s ease-out 0.6s both' }}>
          <span className="gold-text">Abdul</span>
          <br/><span style={{ color:'var(--brown-soft)' }}>&amp;</span><br/>
          <span className="rose-text">Lilia</span>
        </h1>
        <p className="serif-italic mt-3 text-sm" style={{ color:'var(--brown-soft)', animation:'fadeIn 0.6s ease-out 1s both' }}>
          Onze huwelijksreis ✨
        </p>
      </div>
    )
  }

  const totalBudget = budget?.total_budget || 0
  const pct = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0
  const progressColor = pct < 50 ? '#4CAF50' : pct < 80 ? 'var(--gold)' : 'var(--rose)'

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <Sidebar currentUser={user} />

      <div className="main-area relative">
        <Hearts />

        {/* Profiel kiezen modal */}
        {showUserSelect && (
          <div className="overlay">
            <div className="sheet">
              <h2 className="serif text-2xl text-center mb-1">Wie ben jij?</h2>
              <p className="serif-italic text-center mb-6 text-sm" style={{ color:'var(--brown-soft)' }}>Kies je profiel 💕</p>
              <div className="flex gap-4">
                {['abdul','lilia'].map(name => (
                  <button key={name} onClick={() => selectUser(name)}
                          className="flex-1 glass p-6 text-center active:scale-95 transition-transform">
                    <div className="text-5xl mb-2">{name==='lilia'?'👰':'🤵'}</div>
                    <p className="serif font-bold text-lg capitalize">{name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Datum bewerken */}
        {showEdit && (
          <div className="overlay" onClick={() => setShowEdit(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <h2 className="serif text-xl mb-4">Huwelijksdatum instellen</h2>
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="input mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowEdit(false)} className="flex-1 btn-ghost">Annuleer</button>
                <button onClick={saveDate} className="flex-1 btn-gold">Opslaan</button>
              </div>
            </div>
          </div>
        )}

        {/* Pagina-inhoud */}
        <div className="page-content px-4 max-w-xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pt-1">
            <div>
              <h1 className="serif text-2xl font-bold" style={{ color:'var(--brown)' }}>
                {greeting(user ? user.charAt(0).toUpperCase()+user.slice(1) : '')}
              </h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color:'var(--brown-soft)' }}>Onze huwelijksreis</p>
            </div>
            <button onClick={() => setShowUserSelect(true)}
                    className="glass-sm px-3 py-2 flex items-center gap-2 active:scale-95 transition-transform">
              <span className="text-lg">{user==='lilia'?'👰':'🤵'}</span>
              <span className="text-xs font-medium capitalize" style={{ color:'var(--brown)' }}>{user}</span>
            </button>
          </div>

          {/* Countdown */}
          <div className="mb-4 relative">
            <Countdown date={countdown?.wedding_date} />
            {!countdown?.wedding_date && (
              <button onClick={() => setShowEdit(true)} className="btn-ghost w-full mt-2 text-sm">📅 Datum instellen</button>
            )}
            {countdown?.wedding_date && user === 'abdul' && (
              <button onClick={() => setShowEdit(true)}
                      className="absolute top-3 right-3 text-lg opacity-50 hover:opacity-100 transition-opacity">✏️</button>
            )}
          </div>

          {/* Vandaag */}
          {todayItems.length > 0 && (
            <div className="glass p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📅</span>
                <h2 className="serif font-semibold">Vandaag</h2>
              </div>
              <div className="flex flex-col gap-2">
                {todayItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl"
                       style={{ background:'rgba(201,162,75,0.06)' }}>
                    <span className="text-sm w-16 flex-shrink-0" style={{ color:'var(--gold)' }}>
                      {item.time_slot || '—'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.activity || item.title}</p>
                      {item.location && <p className="text-xs truncate" style={{ color:'var(--brown-soft)' }}>📍 {item.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <a href="/reis" className="block text-center text-xs mt-3" style={{ color:'var(--gold)' }}>
                Volledig schema →
              </a>
            </div>
          )}

          {/* Weer + budget rij */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Weer */}
            <div className="glass-sm p-4">
              <p className="text-xs mb-2 serif-italic" style={{ color:'var(--brown-soft)' }}>Weer</p>
              {weather ? (
                <div>
                  <div className="flex items-center gap-2">
                    <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt="" className="w-8 h-8" />
                    <span className="serif text-2xl font-bold gold-text">{weather.temp}°</span>
                  </div>
                  <p className="text-xs capitalize mt-1" style={{ color:'var(--brown-soft)' }}>{weather.city}</p>
                  <p className="text-xs capitalize" style={{ color:'var(--brown-soft)' }}>{weather.description}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="skeleton h-8 w-20" />
                  <div className="skeleton h-3 w-16" />
                </div>
              )}
            </div>

            {/* Budget glimp */}
            <div className="glass-sm p-4">
              <p className="text-xs mb-2 serif-italic" style={{ color:'var(--brown-soft)' }}>Budget</p>
              {totalBudget > 0 ? (
                <>
                  <p className="serif text-lg font-bold gold-text">
                    {budget.currency} {(totalBudget - spent).toFixed(0)}
                  </p>
                  <p className="text-xs" style={{ color:'var(--brown-soft)' }}>nog over</p>
                  <div className="progress-track mt-2">
                    <div className="progress-fill" style={{ width:`${pct}%`, background:progressColor }} />
                  </div>
                </>
              ) : (
                <a href="/budget" className="text-xs" style={{ color:'var(--gold)' }}>Budget instellen →</a>
              )}
            </div>
          </div>

          {/* Snelknoppen */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { href:'/dagboek', icon:'📸', title:"Foto toevoegen", sub:'Herinnering vastleggen' },
              { href:'/budget',  icon:'💸', title:"Uitgave noteren", sub:'Snel bijhouden' },
              { href:'/ontdek',  icon:'🧭', title:"Ontdek omgeving", sub:'In de buurt' },
              { href:'/lijsten', icon:'✅', title:"Checklist",        sub:'Niets vergeten' },
            ].map(item => (
              <a key={item.href} href={item.href}
                 className="glass-sm p-4 flex flex-col gap-1 active:scale-95 transition-transform no-underline">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-semibold text-sm" style={{ color:'var(--brown)' }}>{item.title}</p>
                <p className="text-xs" style={{ color:'var(--brown-soft)' }}>{item.sub}</p>
              </a>
            ))}
          </div>

          {/* Quote */}
          <div className="glass p-5 text-center mb-4">
            <p className="serif-italic" style={{ color:'var(--brown-soft)' }}>
              "Niet waarheen je reist, maar met wie."
            </p>
            <p className="text-xs mt-2" style={{ color:'var(--gold)', opacity:0.7 }}>— Voor altijd samen 💕</p>
          </div>
        </div>

        <BottomNav />
        <FloatingAI currentUser={user} />
      </div>
    </div>
  )
}
