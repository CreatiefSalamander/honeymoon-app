'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { useLanguage } from '@/lib/i18n'
import { getLists, addList, addListItem, toggleListItem, deleteListItem, subscribeToLists } from '@/lib/supabase'
import { Log } from '@/lib/activityLog'

// ── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const kleuren = ['#E3A6B5','#C9A24B','#FBF6EF','#F0C0CC','#E0BE75']
  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden>
      {Array.from({length:18},(_,i) => (
        <div key={i} className="confetti-piece" style={{
          left:`${Math.random()*100}%`, top:'-10px',
          background: kleuren[i%kleuren.length],
          width:`${5+Math.random()*8}px`, height:`${5+Math.random()*8}px`,
          borderRadius: Math.random()>.5?'50%':'3px',
          animationDuration:`${1.5+Math.random()*2}s`,
          animationDelay:`${Math.random()*.8}s`,
        }} />
      ))}
    </div>
  )
}

// ── Preset paklijst-items ─────────────────────────────────────────────────────
const PAKLIJST_PRESET = [
  { cat:'📋 Documenten', items:['Paspoort (geldig + kopie)','Vliegtickets (offline opslaan)','Reisverzekeringspolis','Hotel-boekingen','Visum (indien nodig)','EHIC/zorgpas'] },
  { cat:'💊 Gezondheid',  items:['Medicijnen (met bijsluiter)','Pijnstillers','Zonnebrand SPF50+','Insectenwerende spray','Pleisters & verband','Handgel'] },
  { cat:'👗 Kleding',     items:['Zomerse kleding','Avondkleding (restaurant)','Badkleding','Lichte jas voor avond','Wandelschoenen','Slippers'] },
  { cat:'🔌 Elektronica', items:['Telefoon-oplader','Reisstekker-adapter','Powerbank','Koptelefoon','Camera + geheugenkaart'] },
  { cat:'🧴 Toilettas',   items:['Tandenborstel + pasta','Deodorant','Shampoo & conditioner','Scheerapparaat','Make-up essentials'] },
  { cat:'💼 Handig',      items:['Contant geld (lokale valuta)','Creditcard','Slotje voor koffer','Neklampje of kleine rugzak','Waterflessen'] },
]

const BUCKET_IDEEEN = [
  'Zonsopgang kijken samen','Lokaal eten proberen','Boottochtje maken',
  'Foto maken op een beroemd plein','Lokale markt bezoeken','Traditionele kleding uitproberen',
  'Romantisch diner bij kaarslicht','Sterren kijken','Lokale muziek horen',
  'Een dagboek bijhouden samen','Eerste foto op huwelijksreis bewaren',
]

const LIST_TYPES = [
  { key:'packing',  icon:'🧳', label:'Paklijst',   kleur:'#C9A24B',  bgColor:'rgba(201,162,75,0.1)' },
  { key:'bucket',   icon:'✨', label:'Bucketlist', kleur:'#E3A6B5',  bgColor:'rgba(227,166,181,0.1)' },
  { key:'todo',     icon:'✅', label:'To-do',      kleur:'#4CAF50',  bgColor:'rgba(76,175,80,0.1)' },
  { key:'shopping', icon:'🛍️', label:'Shopping',  kleur:'#9C27B0',  bgColor:'rgba(156,39,176,0.1)' },
]

function VoortgangsBalk({ gedaan, totaal, kleur }) {
  const pct = totaal > 0 ? (gedaan / totaal) * 100 : 0
  return (
    <div className="progress-track mt-1">
      <div className="progress-fill" style={{ width: `${pct}%`, background: kleur }} />
    </div>
  )
}

function LijstKaart({ lijst, onToggle, onDelete, onAdd, kleur, bgColor }) {
  const [open, setOpen] = useState(true)
  const [nieuwItem, setNieuwItem] = useState('')
  const items = lijst.list_items || []
  const gedaan = items.filter(i => i.checked).length
  const openItems = items.filter(i => !i.checked)
  const gedaanItems = items.filter(i => i.checked)

  async function submit(e) {
    e?.preventDefault()
    if (!nieuwItem.trim()) return
    await onAdd(lijst.id, nieuwItem.trim())
    setNieuwItem('')
  }

  return (
    <div className="glass overflow-hidden mb-4">
      {/* Header */}
      <button onClick={() => setOpen(!open)}
              className="w-full px-5 py-4 flex items-center gap-3 text-left"
              style={{ background: bgColor }}>
        <span className="text-2xl">{LIST_TYPES.find(t=>t.key===lijst.type)?.icon || '📋'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--brown)' }}>{lijst.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
            {gedaan}/{items.length} voltooid
          </p>
          {items.length > 0 && <VoortgangsBalk gedaan={gedaan} totaal={items.length} kleur={kleur} />}
        </div>
        <span className="text-lg" style={{ color: 'var(--brown-soft)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div>
          {/* Open items */}
          <div className="px-4 pt-3 pb-1 flex flex-col gap-1.5">
            {openItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-1 group">
                <button onClick={() => onToggle(item.id, true)}
                        className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all active:scale-90"
                        style={{ borderColor: kleur }} />
                <span className="flex-1 text-sm" style={{ color: 'var(--brown)' }}>{item.text}</span>
                <button onClick={() => onDelete(item.id)}
                        className="opacity-0 group-hover:opacity-60 text-sm transition-opacity flex-shrink-0">🗑️</button>
              </div>
            ))}
          </div>

          {/* Toevoegen */}
          <form onSubmit={submit} className="px-4 py-2 flex gap-2">
            <input autoComplete="off" value={nieuwItem} onChange={e => setNieuwItem(e.target.value)}
                   placeholder="Item toevoegen..." className="input flex-1 py-2 text-sm" />
            <button type="submit" className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: kleur, color: 'white' }}>+</button>
          </form>

          {/* Afgevinkt (ingeklapt) */}
          {gedaanItems.length > 0 && (
            <details className="px-4 pb-3">
              <summary className="text-xs cursor-pointer py-1" style={{ color: 'var(--brown-soft)' }}>
                ✓ {gedaanItems.length} afgevinkt
              </summary>
              <div className="flex flex-col gap-1.5 mt-2">
                {gedaanItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <button onClick={() => onToggle(item.id, false)}
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: kleur }}>
                      <span className="text-white text-xs">✓</span>
                    </button>
                    <span className="flex-1 text-sm line-through" style={{ color: 'var(--brown-soft)' }}>{item.text}</span>
                    <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-60 text-sm">🗑️</button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

export default function LijstenPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('packing')
  const [lijsten, setLijsten] = useState([])
  const [loading, setLoading] = useState(true)
  const [confetti, setConfetti] = useState(false)
  const [showNieuw, setShowNieuw] = useState(false)
  const [nieuweNaam, setNieuweNaam] = useState('')

  const actieveType = LIST_TYPES.find(t => t.key === activeTab)

  useEffect(() => {
    load()
    const sub = subscribeToLists(load)
    return () => sub.unsubscribe()
  }, [activeTab])

  async function load() {
    setLoading(true)
    const data = await getLists(activeTab)
    setLijsten(data)
    setLoading(false)
  }

  async function genereerPaklijst() {
    const bestaand = lijsten.find(l => l.title === 'Basis paklijst')
    let lijstId = bestaand?.id
    if (!lijstId) {
      const nl = await addList({ type: 'packing', title: 'Basis paklijst', created_by: user })
      lijstId = nl?.id
    }
    if (!lijstId) return
    for (const sectie of PAKLIJST_PRESET) {
      await addListItem({ list_id: lijstId, text: `── ${sectie.cat} ──`, checked: false, created_by: user })
      for (const item of sectie.items) {
        await addListItem({ list_id: lijstId, text: item, checked: false, created_by: user })
      }
    }
    await load()
  }

  async function genereerBucketlist() {
    const bestaand = lijsten.find(l => l.title === 'Bucketlist')
    let lijstId = bestaand?.id
    if (!lijstId) {
      const nl = await addList({ type: 'bucket', title: 'Bucketlist 💕', created_by: user })
      lijstId = nl?.id
    }
    if (!lijstId) return
    for (const item of BUCKET_IDEEEN) {
      await addListItem({ list_id: lijstId, text: item, checked: false, created_by: user })
    }
    await load()
  }

  async function maakLijst(e) {
    e.preventDefault()
    if (!nieuweNaam.trim()) return
    await addList({ type: activeTab, title: nieuweNaam.trim(), created_by: user })
    setNieuweNaam('')
    setShowNieuw(false)
    await load()
  }

  async function handleToggle(itemId, checked) {
    const item = lijsten.flatMap(l => l.list_items || []).find(i => i.id === itemId)
    await toggleListItem(itemId, checked)
    if (checked) {
      if ('vibrate' in navigator) navigator.vibrate([10, 20, 10])
      if (activeTab === 'bucket') { setConfetti(true); setTimeout(() => setConfetti(false), 3000) }
      if (item) Log.lijst(item.text, user)
    }
    await load()
  }

  async function handleDelete(itemId) {
    await deleteListItem(itemId)
    await load()
  }

  async function handleAdd(lijstId, tekst) {
    await addListItem({ list_id: lijstId, text: tekst, checked: false, created_by: user })
    await load()
  }

  // Statistieken
  const totaalItems = lijsten.flatMap(l => l.list_items || []).length
  const gedaanItems = lijsten.flatMap(l => l.list_items || []).filter(i => i.checked).length

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      {confetti && <Confetti />}
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">{actieveType?.icon} {actieveType?.label}</h1>
              {totaalItems > 0 && (
                <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
                  {gedaanItems}/{totaalItems} voltooid
                  {totaalItems > 0 && <span className="ml-2 font-bold" style={{ color: actieveType?.kleur }}>
                    ({Math.round(gedaanItems/totaalItems*100)}%)
                  </span>}
                </p>
              )}
            </div>
            <button onClick={() => setShowNieuw(!showNieuw)} className="btn-gold px-4 py-2 text-sm">+ Lijst</button>
          </div>

          {/* Type-tabs */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {LIST_TYPES.map(type => (
              <button key={type.key} onClick={() => setActiveTab(type.key)}
                      className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all"
                      style={{
                        background: activeTab === type.key ? type.bgColor : 'rgba(201,162,75,0.05)',
                        border: `2px solid ${activeTab === type.key ? type.kleur + '60' : 'transparent'}`,
                      }}>
                <span className="text-2xl">{type.icon}</span>
                <span className="text-[10px] font-medium" style={{ color: activeTab === type.key ? type.kleur : 'var(--brown-soft)' }}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          {/* Nieuwe lijst formulier */}
          {showNieuw && (
            <form onSubmit={maakLijst} className="glass-sm p-4 mb-4 flex gap-2">
              <input autoFocus value={nieuweNaam} onChange={e => setNieuweNaam(e.target.value)}
                     placeholder={`Naam voor nieuwe ${actieveType?.label}...`} className="input flex-1" />
              <button type="submit" className="btn-gold px-4">Aanmaken</button>
            </form>
          )}

          {/* Snelle genereer-knoppen */}
          {activeTab === 'packing' && lijsten.length === 0 && (
            <button onClick={genereerPaklijst} className="btn-rose w-full py-3 mb-4">
              🧳 Genereer complete paklijst
            </button>
          )}
          {activeTab === 'bucket' && lijsten.length === 0 && (
            <button onClick={genereerBucketlist} className="btn-rose w-full py-3 mb-4">
              ✨ Genereer bucketlist-ideeën
            </button>
          )}

          {/* Lijsten */}
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2].map(i => <div key={i} className="skeleton h-40" />)}</div>
          ) : lijsten.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">{actieveType?.icon}</p>
              <h3 className="serif text-lg mb-1">Geen {actieveType?.label} gevonden</h3>
              <p className="serif-italic text-sm" style={{ color: 'var(--brown-soft)' }}>
                Maak je eerste lijst aan met de + knop
              </p>
            </div>
          ) : (
            lijsten.map(lijst => (
              <LijstKaart key={lijst.id} lijst={lijst} kleur={actieveType?.kleur || 'var(--gold)'}
                          bgColor={actieveType?.bgColor || 'rgba(201,162,75,0.05)'}
                          onToggle={handleToggle} onDelete={handleDelete} onAdd={handleAdd} />
            ))
          )}

          {/* Tips onderaan bij paklijst */}
          {activeTab === 'packing' && (
            <div className="glass-sm p-4 mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gold)' }}>💡 Vergeet dit niet</p>
              <div className="flex flex-col gap-1.5">
                {['Weeg koffer vóór terugvlucht (check limiet op ticket)', 'Medicijnen in handbagage in originele verpakking', 'Download offline kaarten (Google Maps → Gebied opslaan)', 'Douane: max €10.000 cash zonder aangifte (EU)', 'Check stekker-type bestemming (type C/F = Europa)'].map((tip, i) => (
                  <div key={i} className="flex gap-2 text-xs" style={{ color: 'var(--brown-soft)' }}>
                    <span className="flex-shrink-0">→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <BottomNav />
        <FloatingAI currentUser={user} pagina={`${actieveType?.label} lijst`} />
      </div>
    </div>
  )
}
