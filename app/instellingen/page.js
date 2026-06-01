'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import { upsertCountdown, getCountdown } from '@/lib/supabase'

export default function InstellingenPage() {
  const [user, setUser] = useState('abdul')
  const [dark, setDark] = useState(false)
  const [weddingDate, setWeddingDate] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setUser(localStorage.getItem('honeymoon_user') || 'abdul')
    setDark(document.documentElement.classList.contains('dark'))
    getCountdown().then(cd => { if (cd?.wedding_date) setWeddingDate(cd.wedding_date) })
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function saveDate() {
    if (!weddingDate) return
    await upsertCountdown(weddingDate)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function switchUser(name) {
    localStorage.setItem('honeymoon_user', name)
    setUser(name)
  }

  function resetApp() {
    if (!confirm('Alle lokale instellingen wissen? Data in Supabase blijft bewaard.')) return
    localStorage.clear()
    window.location.href = '/'
  }

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          <div className="mb-6">
            <h1 className="serif text-2xl font-bold">⚙️ Instellingen</h1>
            <p className="serif-italic text-xs mt-0.5" style={{ color:'var(--brown-soft)' }}>Persoonlijke voorkeuren</p>
          </div>

          {/* Profiel */}
          <div className="glass p-4 mb-4">
            <h3 className="serif font-semibold mb-3">Profiel</h3>
            <div className="flex gap-3">
              {['abdul','lilia'].map(name => (
                <button key={name} onClick={() => switchUser(name)}
                        className={`flex-1 p-4 rounded-2xl text-center transition-all ${user===name?'ring-2':''}`}
                        style={{ background:user===name?'rgba(201,162,75,0.12)':'rgba(201,162,75,0.04)', ringColor:'var(--gold)' }}>
                  <div className="text-4xl mb-1">{name==='lilia'?'👰':'🤵'}</div>
                  <p className="font-semibold capitalize text-sm">{name}</p>
                  {user===name && <p className="text-xs mt-0.5" style={{ color:'var(--gold)' }}>Geselecteerd</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Huwelijksdatum */}
          <div className="glass p-4 mb-4">
            <h3 className="serif font-semibold mb-3">Huwelijksdatum</h3>
            <div className="flex gap-2">
              <input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} className="input flex-1" />
              <button onClick={saveDate} className={`btn-gold px-4 transition-all ${saved?'opacity-50':''}`}>
                {saved ? '✓' : 'Sla op'}
              </button>
            </div>
          </div>

          {/* Weergave */}
          <div className="glass p-4 mb-4">
            <h3 className="serif font-semibold mb-3">Weergave</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{dark?'🌙':'☀️'}</span>
                <span className="text-sm">{dark?'Nacht modus':'Dag modus'}</span>
              </div>
              <button onClick={toggleDark}
                      className="w-12 h-6 rounded-full relative transition-all"
                      style={{ background:dark?'var(--gold)':'rgba(201,162,75,0.2)' }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                      style={{ left:dark?26:2 }} />
              </button>
            </div>
          </div>

          {/* App info */}
          <div className="glass p-4 mb-4">
            <h3 className="serif font-semibold mb-2">Over de app</h3>
            <p className="text-xs serif-italic" style={{ color:'var(--brown-soft)' }}>
              Abdul &amp; Lilia Huwelijksreis App v2.0 💍<br/>
              Gemaakt met liefde ✨
            </p>
          </div>

          {/* Reset */}
          <button onClick={resetApp} className="w-full py-3 rounded-2xl text-sm"
                  style={{ background:'rgba(227,166,181,0.08)', color:'var(--rose)', border:'1px solid rgba(227,166,181,0.2)' }}>
            Lokale instellingen wissen
          </button>
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
