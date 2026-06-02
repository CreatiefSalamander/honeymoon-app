'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import { useLanguage, TALEN } from '@/lib/i18n'
import { upsertCountdown, getCountdown, upsertBudget, getBudget } from '@/lib/supabase'

const VALUTAS = ['EUR','USD','GBP','TRY','MAD','THB','JPY','AED','RUB','AMD']
const THEMAS = [
  { key: 'auto',  icon: '🌓', label: 'Automatisch (systeem)' },
  { key: 'light', icon: '☀️', label: 'Licht / Light / فاتح' },
  { key: 'dark',  icon: '🌙', label: 'Donker / Dark / داكن' },
]

function SettingsGroep({ titel, children }) {
  return (
    <div className="glass p-0 mb-4 overflow-hidden">
      <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--gold-line)', background: 'rgba(201,162,75,0.04)' }}>
        <p className="serif font-semibold text-sm" style={{ color: 'var(--gold)' }}>{titel}</p>
      </div>
      <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--gold-line)' }}>
        {children}
      </div>
    </div>
  )
}

function SettingsRij({ icon, label, sublabel, children, onClick }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 cursor-pointer active:bg-amber-50/30 transition-colors"
         onClick={onClick} style={{ borderBottom: '1px solid var(--gold-line)' }}>
      <span className="text-xl w-7 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--brown)' }}>{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>{sublabel}</p>}
      </div>
      {children}
    </div>
  )
}

function WisselKnop({ aan, onChange }) {
  return (
    <button onClick={() => onChange(!aan)} className="w-12 h-6 rounded-full relative flex-shrink-0 transition-all"
            style={{ background: aan ? 'var(--gold)' : 'rgba(201,162,75,0.2)' }}>
      <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
            style={{ left: aan ? 26 : 2 }} />
    </button>
  )
}

export default function InstellingenPage() {
  const { lang, setLang, t } = useLanguage()
  const [user, setUser] = useState('abdul')
  const [thema, setThema] = useState('auto')
  const [weddingDate, setWeddingDate] = useState('')
  const [valuta, setValuta] = useState('EUR')
  const [budget, setBudgetVal] = useState('')
  const [notifs, setNotifs] = useState({ partner: true, budget: true, weer: false, vlucht: true })
  const [locatie, setLocatieAan] = useState(true)
  const [opgeslagen, setOpgeslagen] = useState(false)
  const [taalOpen, setTaalOpen] = useState(false)
  const [themaOpen, setThemaOpen] = useState(false)
  const [valutaOpen, setValutaOpen] = useState(false)

  useEffect(() => {
    setUser(localStorage.getItem('honeymoon_user') || 'abdul')
    const t = localStorage.getItem('theme') || 'auto'
    setThema(t)
    const notifSaved = localStorage.getItem('notifs')
    if (notifSaved) try { setNotifs(JSON.parse(notifSaved)) } catch {}
    setLocatieAan(localStorage.getItem('locatie') !== 'uit')
    getCountdown().then(cd => { if (cd?.wedding_date) setWeddingDate(cd.wedding_date) })
    getBudget().then(b => { if (b) { setBudgetVal(b.total_budget); setValuta(b.currency || 'EUR') } })
  }, [])

  function wisselThema(k) {
    setThema(k)
    localStorage.setItem('theme', k)
    if (k === 'dark') document.documentElement.classList.add('dark')
    else if (k === 'light') document.documentElement.classList.remove('dark')
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
    setThemaOpen(false)
  }

  function wisselProfiel(naam) {
    localStorage.setItem('honeymoon_user', naam)
    setUser(naam)
  }

  function wisselNotif(key) {
    const nieuw = { ...notifs, [key]: !notifs[key] }
    setNotifs(nieuw)
    localStorage.setItem('notifs', JSON.stringify(nieuw))
  }

  async function slaOp() {
    if (weddingDate) await upsertCountdown(weddingDate)
    if (budget) await upsertBudget(Number(budget), valuta)
    setOpgeslagen(true)
    setTimeout(() => setOpgeslagen(false), 2000)
  }

  function resetApp() {
    if (!confirm('Alle lokale instellingen wissen? Supabase-data blijft bewaard.')) return
    localStorage.clear()
    window.location.href = '/'
  }

  const taalInfo = TALEN.find(l => l.code === lang)
  const themaInfo = THEMAS.find(t => t.key === thema)

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          <div className="mb-6">
            <h1 className="serif text-2xl font-bold">⚙️ {t('instellingen')}</h1>
            <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
              Alles aanpassen aan jullie wensen
            </p>
          </div>

          {/* ── Profiel ── */}
          <SettingsGroep titel={`👤 ${t('profiel')}`}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--gold-line)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--brown-soft)' }}>Wie gebruik de app nu?</p>
              <div className="flex gap-3">
                {['abdul', 'lilia'].map(naam => (
                  <button key={naam} onClick={() => wisselProfiel(naam)}
                          className="flex-1 p-4 rounded-2xl text-center transition-all"
                          style={{ background: user === naam ? 'rgba(201,162,75,0.15)' : 'rgba(201,162,75,0.04)', border: `2px solid ${user === naam ? 'rgba(201,162,75,0.5)' : 'transparent'}` }}>
                    <div className="text-4xl mb-1">{naam === 'lilia' ? '👰' : '🤵'}</div>
                    <p className="font-bold capitalize text-sm">{naam}</p>
                    {user === naam && <p className="text-xs mt-0.5" style={{ color: 'var(--gold)' }}>Actief ✓</p>}
                  </button>
                ))}
              </div>
            </div>
          </SettingsGroep>

          {/* ── Reis ── */}
          <SettingsGroep titel="💍 Reis & Datum">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--gold-line)' }}>
              <label className="text-xs mb-2 block" style={{ color: 'var(--brown-soft)' }}>Huwelijksdatum</label>
              <input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} className="input" />
            </div>
            <div className="px-5 py-4 border-b" style={{ borderBottom: '1px solid var(--gold-line)' }}>
              <label className="text-xs mb-2 block" style={{ color: 'var(--brown-soft)' }}>Totaalbudget</label>
              <div className="flex gap-2">
                <input type="number" value={budget} onChange={e => setBudgetVal(e.target.value)}
                       placeholder="0" className="input flex-1" inputMode="decimal" />
                <select value={valuta} onChange={e => setValuta(e.target.value)} className="input w-24">
                  {VALUTAS.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </SettingsGroep>

          {/* ── Taal ── */}
          <SettingsGroep titel={`🌐 ${t('taal')}`}>
            <SettingsRij icon={taalInfo?.vlag} label="Taal / Language" sublabel={taalInfo?.naam} onClick={() => setTaalOpen(!taalOpen)}>
              <span style={{ color: 'var(--gold)' }}>›</span>
            </SettingsRij>
            {taalOpen && (
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--gold-line)', background: 'rgba(201,162,75,0.03)' }}>
                <div className="flex flex-col gap-1.5">
                  {TALEN.map(tl => (
                    <button key={tl.code} onClick={() => { setLang(tl.code); setTaalOpen(false) }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                            style={{ background: lang === tl.code ? 'rgba(201,162,75,0.15)' : 'transparent' }}>
                      <span className="text-xl">{tl.vlag}</span>
                      <span className="font-medium text-sm flex-1 text-left">{tl.naam}</span>
                      {lang === tl.code && <span style={{ color: 'var(--gold)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </SettingsGroep>

          {/* ── Weergave ── */}
          <SettingsGroep titel="🎨 Weergave">
            <SettingsRij icon={themaInfo?.icon} label="Thema" sublabel={themaInfo?.label} onClick={() => setThemaOpen(!themaOpen)}>
              <span style={{ color: 'var(--gold)' }}>›</span>
            </SettingsRij>
            {themaOpen && (
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--gold-line)', background: 'rgba(201,162,75,0.03)' }}>
                {THEMAS.map(th => (
                  <button key={th.key} onClick={() => wisselThema(th.key)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full mb-1 transition-all"
                          style={{ background: thema === th.key ? 'rgba(201,162,75,0.15)' : 'transparent' }}>
                    <span className="text-xl">{th.icon}</span>
                    <span className="font-medium text-sm flex-1 text-left">{th.label}</span>
                    {thema === th.key && <span style={{ color: 'var(--gold)' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </SettingsGroep>

          {/* ── Locatie ── */}
          <SettingsGroep titel="📍 Locatie & Privacy">
            <SettingsRij icon="📍" label="Locatie delen" sublabel="Voor Ontdek, Agenda en Weer">
              <WisselKnop aan={locatie} onChange={v => { setLocatieAan(v); localStorage.setItem('locatie', v ? 'aan' : 'uit') }} />
            </SettingsRij>
            <SettingsRij icon="🔒" label="Chatgeschiedenis wissen" sublabel="AI-gesprekken blijven privé">
              <button onClick={() => { if (confirm('Chat wissen?')) localStorage.removeItem('honeymoon_chat_v2') }}
                      className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(201,162,75,0.1)', color: 'var(--gold)' }}>
                Wis
              </button>
            </SettingsRij>
          </SettingsGroep>

          {/* ── Meldingen ── */}
          <SettingsGroep titel="🔔 Meldingen">
            {[
              { key: 'partner', icon: '💑', label: 'Partner-activiteiten', sub: 'Wanneer de ander iets toevoegt' },
              { key: 'budget',  icon: '💰', label: 'Budget-waarschuwingen', sub: 'Als je boven 80% komt' },
              { key: 'vlucht',  icon: '✈️', label: 'Vlucht-updates',        sub: 'Vertraging of gate-wijziging' },
              { key: 'weer',    icon: '⛅', label: 'Weerswaarschuwingen',   sub: 'Regen of extreme temperaturen' },
            ].map(n => (
              <SettingsRij key={n.key} icon={n.icon} label={n.label} sublabel={n.sub}>
                <WisselKnop aan={notifs[n.key]} onChange={() => wisselNotif(n.key)} />
              </SettingsRij>
            ))}
          </SettingsGroep>

          {/* ── App ── */}
          <SettingsGroep titel="ℹ️ App">
            <SettingsRij icon="📖" label="Over de app" sublabel="Abdul & Lilia v3.0 — Gemaakt met ❤️">
              <span className="text-xs" style={{ color: 'var(--brown-soft)' }}>v3.0</span>
            </SettingsRij>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--gold-line)' }}>
              <button onClick={resetApp} className="w-full py-2.5 rounded-xl text-sm"
                      style={{ background: 'rgba(227,166,181,0.1)', color: 'var(--rose)', border: '1px solid rgba(227,166,181,0.2)' }}>
                🔄 App resetten (lokale data)
              </button>
            </div>
          </SettingsGroep>

          {/* Opslaan */}
          <button onClick={slaOp} className="btn-gold w-full py-3.5 text-base mb-6">
            {opgeslagen ? '✓ Opgeslagen!' : `💾 ${t('opslaan')}`}
          </button>
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
