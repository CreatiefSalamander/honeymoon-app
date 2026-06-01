'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { getLists, addList, addListItem, toggleListItem, deleteListItem, subscribeToLists } from '@/lib/supabase'

const LIST_TYPES = [
  { key:'packing',  icon:'🧳', label:'Paklijst' },
  { key:'bucket',   icon:'✨', label:'Bucketlist' },
  { key:'todo',     icon:'✅', label:'To-do' },
  { key:'shopping', icon:'🛍️', label:'Boodschappen' },
]

const PAKLIJST_BASIS = [
  'Paspoort + kopie','Vliegtickets (offline)','Reisverzekering','Medicijnen',
  'Oplader + adapter','Zonnebrandcrème','Bagage-slot','Contant geld',
  'Creditcard','Telefoon-oplader','Fotocamera','Tandenborstel',
]

const HERINNERINGEN = [
  { icon:'⚖️', tekst:'Weeg je bagage voor terugvlucht — max 23kg (check vluchtticktet)' },
  { icon:'🔌', tekst:'Check het stekker-type op je bestemming (type C/F in Europa, type A in VS)' },
  { icon:'💊', tekst:'Medicijnen in handbagage? Bewaar in originele verpakking' },
  { icon:'💰', tekst:'Check de douane-regels voor cash meenemen (max €10.000 EU)' },
  { icon:'🛂', tekst:'Sommige landen vereisen een retourticket bij inreiscontrole' },
  { icon:'📱', tekst:'Download kaarten offline (Google Maps → gebied opslaan)' },
  { icon:'🎁', tekst:'Souvenirs binnen vloeibare limiet? Vloeistoffen max 100ml in handbagage' },
]

function Confetti() {
  const colors = ['#E3A6B5','#C9A24B','#FBF6EF','#F0C0CC','#E0BE75']
  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden>
      {Array.from({length:20},(_,i) => (
        <div key={i} className="confetti-piece"
             style={{
               left:`${Math.random()*100}%`, top:'-10px',
               background:colors[Math.floor(Math.random()*colors.length)],
               width:`${6+Math.random()*8}px`, height:`${6+Math.random()*8}px`,
               borderRadius:Math.random()>.5?'50%':'2px',
               animationDuration:`${2+Math.random()*2}s`,
               animationDelay:`${Math.random()*1}s`,
             }} />
      ))}
    </div>
  )
}

function ListSection({ list, currentUser, onToggle, onDelete, onAdd }) {
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  const done = (list.list_items || []).filter(i => i.checked).length
  const total = (list.list_items || []).length
  const pct = total > 0 ? (done/total)*100 : 0

  async function submitItem(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    await onAdd(list.id, newItem.trim())
    setNewItem('')
    setAdding(false)
  }

  const pinned = (list.list_items || []).filter(i => !i.checked)
  const checked = (list.list_items || []).filter(i => i.checked)

  return (
    <div className="glass p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="serif font-semibold">{list.title}</h3>
        {total > 0 && (
          <span className="text-xs font-medium" style={{ color:'var(--gold)' }}>{done}/{total}</span>
        )}
      </div>

      {total > 0 && (
        <div className="progress-track mb-3">
          <div className="progress-fill" style={{ width:`${pct}%`, background:pct<50?'#4CAF50':pct<80?'var(--gold)':'var(--rose)' }} />
        </div>
      )}

      {/* Niet afgevinkte items */}
      <div className="flex flex-col gap-1.5 mb-2">
        {pinned.map(item => (
          <div key={item.id} className="flex items-center gap-2.5 group">
            <button onClick={() => onToggle(item.id, true)}
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                    style={{ borderColor:'var(--gold)' }} />
            <span className="flex-1 text-sm" style={{ color:'var(--brown)' }}>{item.text}</span>
            <button onClick={() => onDelete(item.id)}
                    className="opacity-0 group-hover:opacity-60 text-sm transition-opacity">🗑️</button>
          </div>
        ))}
      </div>

      {/* Afgevinkte items (ingeklapt) */}
      {checked.length > 0 && (
        <details className="mb-2">
          <summary className="text-xs cursor-pointer" style={{ color:'var(--brown-soft)' }}>
            {checked.length} afgevinkt
          </summary>
          <div className="flex flex-col gap-1.5 mt-2">
            {checked.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 group">
                <button onClick={() => onToggle(item.id, false)}
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background:'var(--gold)', borderColor:'var(--gold)' }}>
                  <span className="text-white text-xs">✓</span>
                </button>
                <span className="flex-1 text-sm line-through" style={{ color:'var(--brown-soft)' }}>{item.text}</span>
                <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-60 text-sm">🗑️</button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Item toevoegen */}
      {adding ? (
        <form onSubmit={submitItem} className="flex gap-2 mt-2">
          <input autoFocus value={newItem} onChange={e => setNewItem(e.target.value)}
                 placeholder="Item toevoegen..." className="input flex-1 text-sm py-2" />
          <button type="submit" className="btn-gold px-3 py-2 text-sm">+</button>
          <button type="button" onClick={() => setAdding(false)} className="btn-ghost px-3 py-2 text-sm">✕</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs mt-1" style={{ color:'var(--gold)' }}>+ Toevoegen</button>
      )}
    </div>
  )
}

export default function LijstenPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [activeTab, setActiveTab] = useState('packing')
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    loadLists()
    const sub = subscribeToLists(loadLists)
    return () => sub.unsubscribe()
  }, [activeTab])

  async function loadLists() {
    setLoading(true)
    const data = await getLists(activeTab)
    setLists(data)
    setLoading(false)
  }

  async function handleGenPacking() {
    const existing = lists.find(l => l.type === 'packing' && l.title === 'Basis paklijst')
    let listId
    if (!existing) {
      const nl = await addList({ type:'packing', title:'Basis paklijst', created_by:user })
      listId = nl?.id
    } else {
      listId = existing.id
    }
    if (!listId) return
    for (const item of PAKLIJST_BASIS) {
      await addListItem({ list_id:listId, text:item, checked:false, created_by:user })
    }
    await loadLists()
  }

  async function handleAddList(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addList({ type:activeTab, title:newTitle.trim(), created_by:user })
    setNewTitle('')
    setShowNew(false)
    await loadLists()
  }

  async function handleToggle(itemId, checked) {
    await toggleListItem(itemId, checked)
    if (checked && 'vibrate' in navigator) navigator.vibrate([10,20,10])
    // Confetti bij bucket-list afvinken
    if (checked && activeTab === 'bucket') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    await loadLists()
  }

  async function handleDelete(itemId) {
    await deleteListItem(itemId)
    await loadLists()
  }

  async function handleAddItem(listId, text) {
    await addListItem({ list_id:listId, text, checked:false, created_by:user })
    await loadLists()
  }

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      {showConfetti && <Confetti />}
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">✅ Lijsten</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color:'var(--brown-soft)' }}>Checklists, paklijst & bucketlist</p>
            </div>
            <button onClick={() => setShowNew(!showNew)} className="btn-gold px-4 py-2 text-sm">+ Lijst</button>
          </div>

          {/* Type tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {LIST_TYPES.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`chip flex-shrink-0 ${activeTab===t.key?'active':''}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Paklijst genereren knop */}
          {activeTab === 'packing' && lists.length === 0 && (
            <button onClick={handleGenPacking} className="btn-rose w-full py-3 mb-4">
              🧳 Genereer basis paklijst
            </button>
          )}

          {/* Nieuwe lijst formulier */}
          {showNew && (
            <form onSubmit={handleAddList} className="glass-sm p-4 mb-4 flex gap-2">
              <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                     placeholder="Naam van de lijst..." className="input flex-1" />
              <button type="submit" className="btn-gold px-4">Aanmaken</button>
            </form>
          )}

          {/* Lijsten */}
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2].map(i => <div key={i} className="skeleton h-40" />)}</div>
          ) : lists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">{LIST_TYPES.find(t=>t.key===activeTab)?.icon}</p>
              <h3 className="serif text-lg mb-1">Geen lijsten</h3>
              <p className="serif-italic text-sm" style={{ color:'var(--brown-soft)' }}>Maak je eerste lijst aan</p>
            </div>
          ) : (
            lists.map(list => (
              <ListSection key={list.id} list={list} currentUser={user}
                           onToggle={handleToggle} onDelete={handleDelete} onAdd={handleAddItem} />
            ))
          )}

          {/* "Niets vergeten" herinneringen */}
          <div className="glass p-4 mt-2">
            <h3 className="serif font-semibold mb-3">💡 Vergeet dit niet</h3>
            <div className="flex flex-col gap-2">
              {HERINNERINGEN.map((h,i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0 mt-0.5">{h.icon}</span>
                  <p className="text-xs leading-relaxed" style={{ color:'var(--brown-soft)' }}>{h.tekst}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <a href="/ontdek?cat=supermarkt" className="chip text-xs">🛒 Dichtstbijzijnde supermarkt</a>
              <a href="/ontdek?cat=apotheek" className="chip text-xs">💊 Apotheek</a>
              <a href="/ontdek?cat=geldautomaat" className="chip text-xs">🏧 Geldautomaat</a>
            </div>
          </div>
        </div>
        <BottomNav />
        <FloatingAI currentUser={user} />
      </div>
    </div>
  )
}
