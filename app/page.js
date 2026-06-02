'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { useLanguage } from '@/lib/i18n'
import { useTrip } from '@/lib/tripContext'
import { getCountdown, upsertCountdown, getItinerary, getBudget, getExpenses } from '@/lib/supabase'

function Countdown({ date, t }) {
  const [tijd, setTijd] = useState(null)
  const [getrouwd, setGetrouwd] = useState(false)

  useEffect(() => {
    if (!date) return
    const tick = () => {
      const diff = new Date(date) - new Date()
      if (diff <= 0) { setGetrouwd(true); return }
      setTijd({ d: Math.floor(diff/86400000), h: Math.floor(diff%86400000/3600000), m: Math.floor(diff%3600000/60000), s: Math.floor(diff%60000/1000) })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [date])

  if (!date) return null
  if (getrouwd) return (
    <div className="card" style={{ padding:'28px 20px', textAlign:'center' }}>
      <div style={{ fontSize:'3rem', marginBottom:12 }}>💍</div>
      <p className="serif" style={{ fontSize:'1.5rem', fontWeight:700 }}>{t('getrouwd')}</p>
    </div>
  )
  if (!tijd) return <div className="skeleton" style={{ height:120 }} />

  return (
    <div className="card" style={{ padding:'20px 16px' }}>
      <p className="label" style={{ textAlign:'center', marginBottom:14 }}>{t('nogTot')}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {[['d',tijd.d,t('dag')+'en'],['h',tijd.h,t('dag').replace('ag','ur')+'en'],['m',tijd.m,'Min'],['s',tijd.s,'Sec']].map(([k,v,l]) => (
          <div key={k} className="card-gold" style={{ padding:'12px 6px', textAlign:'center' }}>
            <p className="serif" style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--gold)', lineHeight:1 }}>
              {String(v).padStart(2,'0')}
            </p>
            <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', marginTop:3 }}>{l}</p>
          </div>
        ))}
      </div>
      <p style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--text-muted)', marginTop:10 }}>
        {new Date(date).toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
      </p>
    </div>
  )
}

function FloatingHearts() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }} aria-hidden>
      {['💕','🌹','✨','🌸'].map((e,i) => (
        <span key={i} className="float-heart" style={{ left:`${12+i*22}%`, bottom:'-2rem', fontSize:'1.2rem', animationDuration:`${8+i*1.5}s`, animationDelay:`${i*1.3}s` }}>{e}</span>
      ))}
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
  const { user, setUser, hotel, setHotel } = useTrip()
  const [splash, setSplash] = useState(false)
  const [showUserSelect, setShowUserSelect] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [vandaag, setVandaag] = useState([])
  const [budgetData, setBudgetData] = useState(null)
  const [gespendeerd, setGespendeerd] = useState(0)
  const [weer, setWeer] = useState(null)
  const [hotelNaam, setHotelNaam] = useState(hotel?.naam || '')

  useEffect(() => {
    if (!sessionStorage.getItem('splashSeen')) {
      setSplash(true)
      sessionStorage.setItem('splashSeen','1')
      setTimeout(() => setSplash(false), 2000)
    }
    if (!localStorage.getItem('honeymoon_user')) setShowUserSelect(true)
  }, [])

  useEffect(() => {
    Promise.all([getCountdown(), getItinerary(), getBudget(), getExpenses()]).then(([cd, it, bud, exp]) => {
      setCountdown(cd)
      if (cd?.wedding_date) setEditDate(cd.wedding_date)
      const heute = new Date().toISOString().split('T')[0]
      setVandaag(it.filter(i => i.date === heute).slice(0,3))
      setBudgetData(bud)
      setGespendeerd(exp.reduce((s,e) => s+Number(e.amount),0))
    })
    // Weer ophalen
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        fetch(`/api/weather?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`).then(r=>r.json()).then(d => { if (!d.error) setWeer(d) }).catch(()=>{})
      }, () => {})
    }
  }, [])

  function selectUser(naam) {
    setUser(naam)
    setShowUserSelect(false)
    if ('vibrate' in navigator) navigator.vibrate([15,40,15])
  }

  function slaHotelOp() {
    if (!hotelNaam.trim()) return
    setHotel({ naam: hotelNaam.trim() })
    setShowEdit(false)
  }

  async function slaDateOp() {
    if (!editDate) return
    const data = await upsertCountdown(editDate)
    setCountdown(data)
    setShowEdit(false)
  }

  const uur = new Date().getHours()
  const groet = t(uur < 12 ? 'goedemorgen' : uur < 18 ? 'goedemiddag' : 'goedenavond')
  const naam = user ? user.charAt(0).toUpperCase()+user.slice(1) : ''

  const totaal = budgetData?.total_budget || 0
  const pct = totaal > 0 ? Math.min(gespendeerd/totaal*100,100) : 0
  const curr = budgetData?.currency || 'EUR'

  // Splash
  if (splash) return (
    <div style={{ position:'fixed', inset:0, background:'white', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,var(--rose),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', marginBottom:20, animation:'fadeIn 0.5s ease-out 0.2s both' }}>
        💍
      </div>
      <h1 className="serif" style={{ fontSize:'2.2rem', fontWeight:700, textAlign:'center', lineHeight:1.2, animation:'slideUp 0.5s ease-out 0.5s both' }}>
        <span style={{ color:'var(--rose)' }}>Abdul</span>
        {' & '}
        <span style={{ color:'var(--gold)' }}>Lilia</span>
      </h1>
      <p className="serif-italic" style={{ color:'var(--text-muted)', marginTop:8, fontSize:'0.9rem', animation:'fadeIn 0.5s ease-out 0.9s both' }}>
        Huwelijksreis ✨
      </p>
    </div>
  )

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area" style={{ position:'relative' }}>
        <FloatingHearts />

        {/* Profiel kiezen */}
        {showUserSelect && (
          <div className="overlay">
            <div className="sheet" style={{ maxWidth:380 }}>
              <h2 className="serif" style={{ fontSize:'1.4rem', fontWeight:700, textAlign:'center', marginBottom:6 }}>Wie ben jij?</h2>
              <p className="serif-italic" style={{ textAlign:'center', color:'var(--text-soft)', fontSize:'0.875rem', marginBottom:24 }}>Kies je profiel om te beginnen 💕</p>
              <div style={{ display:'flex', gap:14 }}>
                {['abdul','lilia'].map(n => (
                  <button key={n} onClick={() => selectUser(n)} className="card" style={{ flex:1, padding:'24px 12px', textAlign:'center', cursor:'pointer', border:'2px solid transparent', transition:'all 0.15s' }}>
                    <div style={{ fontSize:'3.2rem', marginBottom:8 }}>{n==='lilia'?'👰':'🤵'}</div>
                    <p className="serif" style={{ fontWeight:700, fontSize:'1rem', textTransform:'capitalize' }}>{n}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Datum/hotel bewerken */}
        {showEdit && (
          <div className="overlay" onClick={() => setShowEdit(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxWidth:420 }}>
              <h2 className="serif" style={{ fontSize:'1.2rem', fontWeight:700, marginBottom:20 }}>Instellingen</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label className="label" style={{ display:'block', marginBottom:6 }}>Huwelijksdatum</label>
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label" style={{ display:'block', marginBottom:6 }}>Huidig verblijf / hotel</label>
                  <input type="text" value={hotelNaam} onChange={e => setHotelNaam(e.target.value)} placeholder="Naam van hotel of verblijf" className="input" />
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button onClick={() => setShowEdit(false)} className="btn btn-ghost" style={{ flex:1 }}>Annuleer</button>
                <button onClick={() => { slaDateOp(); slaHotelOp() }} className="btn btn-gold" style={{ flex:2 }}>Opslaan</button>
              </div>
            </div>
          </div>
        )}

        {/* Pagina-inhoud */}
        <div className="page-content" style={{ padding:'20px 16px', maxWidth:520, margin:'0 auto', position:'relative', zIndex:1 }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
            <div>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:4, fontWeight:500 }}>
                {new Date().toLocaleDateString('nl-NL',{weekday:'long', day:'numeric', month:'long'})}
              </p>
              <h1 className="serif" style={{ fontSize:'1.6rem', fontWeight:700, lineHeight:1.2, margin:0 }}>
                {groet}<br/>
                <span style={{ color:'var(--rose)' }}>{naam}</span> ❤️
              </h1>
              {hotel?.naam && (
                <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>🏨 {hotel.naam}</p>
              )}
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <button onClick={() => setShowEdit(true)} style={{ width:38, height:38, borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>✏️</button>
              <button onClick={() => setShowUserSelect(true)} style={{ width:38, height:38, borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>
                {user === 'lilia' ? '👰' : '🤵'}
              </button>
            </div>
          </div>

          {/* Countdown */}
          <div style={{ marginBottom:16 }}>
            <Countdown date={countdown?.wedding_date} t={t} />
            {!countdown?.wedding_date && (
              <button onClick={() => setShowEdit(true)} className="btn btn-ghost" style={{ width:'100%', marginTop:8 }}>
                📅 Huwelijksdatum instellen
              </button>
            )}
          </div>

          {/* Vandaag */}
          {vandaag.length > 0 && (
            <div className="card" style={{ padding:'16px 18px', marginBottom:16 }}>
              <div className="section-header">
                <h2 className="section-title">{t('vandaag')}</h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {vandaag.map(item => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 10px', borderRadius:10, background:'var(--bg-soft)' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--gold)', width:52, flexShrink:0 }}>{item.time_slot?.substring(0,3) || '—'}</span>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:600, fontSize:'0.875rem', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{item.activity||item.title}</p>
                      {item.location && <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>📍 {item.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <a href="/agenda" style={{ display:'block', textAlign:'center', fontSize:'0.78rem', color:'var(--gold)', marginTop:10, textDecoration:'none', fontWeight:500 }}>
                Volledig schema →
              </a>
            </div>
          )}

          {/* Weer + Budget rij */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <a href="/weer" className="card" style={{ padding:'16px 14px', textDecoration:'none', display:'block' }}>
              <p className="label" style={{ marginBottom:8 }}>{t('vandaag').replace('aag','er') === 'Wer' ? 'Weer' : 'Weer'}</p>
              {weer ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <img src={`https://openweathermap.org/img/wn/${weer.icon}.png`} alt="" style={{ width:32, height:32 }} />
                    <span className="serif" style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--gold)' }}>{weer.temp}°</span>
                  </div>
                  <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2, textTransform:'capitalize' }}>{weer.city}</p>
                  <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'capitalize' }}>{weer.description}</p>
                </>
              ) : (
                <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Tik voor weersinfo →</p>
              )}
            </a>
            <a href="/budget" className="card" style={{ padding:'16px 14px', textDecoration:'none', display:'block' }}>
              <p className="label" style={{ marginBottom:8 }}>{t('budget')}</p>
              {totaal > 0 ? (
                <>
                  <p className="serif" style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--gold)', lineHeight:1 }}>
                    {curr} {Math.max(0, totaal-gespendeerd).toFixed(0)}
                  </p>
                  <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:2 }}>{t('nogOver')}</p>
                  <div className="progress-track" style={{ marginTop:8 }}>
                    <div className="progress-fill" style={{ width:`${pct}%`, background: pct<50?'#22C55E':pct<80?'var(--gold)':'var(--rose)' }} />
                  </div>
                </>
              ) : (
                <p style={{ fontSize:'0.78rem', color:'var(--gold)', fontWeight:500 }}>Instellen →</p>
              )}
            </a>
          </div>

          {/* Snelknoppen */}
          <div style={{ marginBottom:16 }}>
            <p className="label" style={{ marginBottom:10 }}>Snel toevoegen</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { href:'/dagboek', icon:'📷', t:'Foto toevoegen',  s:'Vastleggen' },
                { href:'/budget',  icon:'💸', t:'Uitgave noteren', s:'Bijhouden' },
                { href:'/ontdek',  icon:'🧭', t:'Ontdek omgeving', s:'Activiteiten & eten' },
                { href:'/vluchten',icon:'✈️', t:'Vlucht zoeken',   s:'Vergelijk prijzen' },
              ].map(item => (
                <a key={item.href} href={item.href} className="card" style={{ padding:'14px 12px', textDecoration:'none', display:'block', transition:'box-shadow 0.15s' }}>
                  <span style={{ fontSize:'1.5rem', display:'block', marginBottom:6 }}>{item.icon}</span>
                  <p style={{ fontWeight:600, fontSize:'0.82rem', color:'var(--text)', marginBottom:2 }}>{item.t}</p>
                  <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{item.s}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="card-gold" style={{ padding:'18px 20px', textAlign:'center' }}>
            <p className="serif-italic" style={{ color:'var(--text-soft)', fontSize:'0.95rem' }}>
              "Niet waarheen je reist, maar met wie."
            </p>
            <p style={{ fontSize:'0.72rem', color:'var(--gold)', marginTop:8, fontWeight:500 }}>— Voor altijd samen 💕</p>
          </div>
        </div>

        <BottomNav />
        <FloatingAI currentUser={user} pagina="home" locatieNaam={hotel?.naam || weer?.city} />
      </div>
    </div>
  )
}
