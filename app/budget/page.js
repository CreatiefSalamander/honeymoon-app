'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { getBudget, upsertBudget, getExpenses, addExpense, deleteExpense } from '@/lib/supabase'

const CATS = [
  { key:'Hotel',       icon:'🏨' },
  { key:'Vlucht',      icon:'✈️' },
  { key:'Eten',        icon:'🍽️' },
  { key:'Activiteiten',icon:'🎭' },
  { key:'Shopping',    icon:'🛍️' },
  { key:'Transport',   icon:'🚕' },
  { key:'Overig',      icon:'🎁' },
]
const CURRENCIES = ['EUR','USD','GBP','TRY','MAD','THB','JPY','AED']

function CurrencyConverter({ base }) {
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState(base || 'EUR')
  const [to, setTo] = useState('TRY')
  const [rates, setRates] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch(`/api/currency?base=${from}&symbols=${CURRENCIES.join(',')}`)
      .then(r => r.json()).then(d => setRates(d.rates)).catch(() => {})
  }, [from])

  function convert() {
    if (!rates || !amount) return
    const rate = to === from ? 1 : (rates[to] || 1)
    setResult((parseFloat(amount) * rate).toFixed(2))
  }

  return (
    <div className="glass p-4 mb-4">
      <h3 className="serif font-semibold mb-3">💱 Valuta-omrekenen</h3>
      <div className="flex gap-2 mb-3">
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
               placeholder="Bedrag" className="input flex-1" inputMode="decimal" />
        <select value={from} onChange={e => setFrom(e.target.value)} className="input w-24">
          {CURRENCIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="flex items-center text-lg" style={{ color:'var(--gold)' }}>→</span>
        <select value={to} onChange={e => setTo(e.target.value)} className="input w-24">
          {CURRENCIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <button onClick={convert} className="btn-gold w-full py-2.5 mb-3">Bereken</button>
      {result && (
        <div className="text-center p-3 rounded-2xl" style={{ background:'rgba(201,162,75,0.1)' }}>
          <p className="serif text-2xl font-bold gold-text">{result} {to}</p>
          <p className="text-xs mt-1" style={{ color:'var(--brown-soft)' }}>
            {amount} {from} = {result} {to}
          </p>
        </div>
      )}
      {!rates && <p className="text-xs text-center" style={{ color:'var(--brown-soft)' }}>Koersen laden...</p>}
    </div>
  )
}

function PieChart({ expenses }) {
  const totals = {}
  for (const e of expenses) totals[e.category] = (totals[e.category] || 0) + Number(e.amount)
  const total = Object.values(totals).reduce((a,b) => a+b, 0)
  if (total === 0) return null

  const colors = { Hotel:'#E3A6B5', Vlucht:'#C9A24B', Eten:'#F0C0CC', Activiteiten:'#B8960C', Shopping:'#F0D060', Transport:'#C8A8B0', Overig:'#D9C7B0' }

  return (
    <div className="flex gap-4 items-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        {(() => {
          let angle = -90
          return Object.entries(totals).map(([cat, amt]) => {
            const pct = amt / total
            const sweep = pct * 360
            const r = 40, cx = 50, cy = 50
            const start = { x: cx + r*Math.cos(angle*Math.PI/180), y: cy + r*Math.sin(angle*Math.PI/180) }
            angle += sweep
            const end = { x: cx + r*Math.cos(angle*Math.PI/180), y: cy + r*Math.sin(angle*Math.PI/180) }
            const lg = sweep > 180 ? 1 : 0
            return (
              <path key={cat} d={`M${cx},${cy} L${start.x},${start.y} A${r},${r} 0 ${lg},1 ${end.x},${end.y} Z`}
                    fill={colors[cat]||'#ccc'} stroke="rgba(251,246,239,0.8)" strokeWidth="1" />
            )
          })
        })()}
        <circle cx="50" cy="50" r="22" fill="rgba(251,246,239,0.95)" />
      </svg>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {Object.entries(totals).map(([cat, amt]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:colors[cat]||'#ccc' }} />
            <span className="text-xs truncate flex-1" style={{ color:'var(--brown-soft)' }}>{cat}</span>
            <span className="text-xs font-semibold" style={{ color:'var(--brown)' }}>{(amt/total*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [budget, setBudgetData] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showExpForm, setShowExpForm] = useState(false)
  const [showBudForm, setShowBudForm] = useState(false)
  const [form, setForm] = useState({ amount:'', category:'Eten', description:'', date:'' })
  const [budForm, setBudForm] = useState({ total:'', currency:'EUR' })
  const [activeTab, setActiveTab] = useState('overzicht')

  useEffect(() => {
    Promise.all([getBudget(), getExpenses()]).then(([b, e]) => {
      setBudgetData(b)
      setExpenses(e)
      if (b) setBudForm({ total: b.total_budget, currency: b.currency })
      setLoading(false)
    })
  }, [])

  async function handleSaveBudget() {
    const data = await upsertBudget(Number(budForm.total), budForm.currency)
    setBudgetData(data)
    setShowBudForm(false)
  }

  async function handleAddExpense() {
    if (!form.amount) return
    const exp = await addExpense({
      amount: Number(form.amount), category: form.category,
      description: form.description || null, currency: budget?.currency || 'EUR',
      date: form.date || new Date().toISOString().split('T')[0],
      paid_by: user,
    })
    if (exp) setExpenses(prev => [exp, ...prev])
    setForm({ amount:'', category:'Eten', description:'', date:'' })
    setShowExpForm(false)
  }

  async function handleDelete(id) {
    await deleteExpense(id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const total = budget?.total_budget || 0
  const spent = expenses.reduce((s,e) => s + Number(e.amount), 0)
  const over = total - spent
  const pct = total > 0 ? Math.min((spent/total)*100, 100) : 0
  const barColor = pct < 50 ? '#4CAF50' : pct < 80 ? 'var(--gold)' : 'var(--rose)'
  const curr = budget?.currency || 'EUR'

  const TABS = [{ key:'overzicht', label:'📊 Overzicht' }, { key:'uitgaven', label:'📋 Lijst' }, { key:'valuta', label:'💱 Valuta' }]

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">💰 Budget</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color:'var(--brown-soft)' }}>Financieel overzicht</p>
            </div>
            <button onClick={() => setShowExpForm(true)} className="btn-gold px-4 py-2 text-sm">+ Uitgave</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`chip flex-1 justify-center ${activeTab===t.key?'active':''}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Overzicht tab */}
          {activeTab === 'overzicht' && (
            <>
              <div className="glass p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="serif text-3xl font-bold gold-text">{curr} {over.toFixed(0)}</p>
                    <p className="text-sm" style={{ color:'var(--brown-soft)' }}>nog beschikbaar</p>
                  </div>
                  <button onClick={() => setShowBudForm(true)} className="text-xl opacity-50 hover:opacity-100 transition-opacity">✏️</button>
                </div>

                {total > 0 ? (
                  <>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span style={{ color:'var(--brown-soft)' }}>Uitgegeven</span>
                      <span className="font-semibold" style={{ color:barColor }}>{curr} {spent.toFixed(2)} / {total.toFixed(2)}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width:`${pct}%`, background:barColor }} />
                    </div>
                    <p className="text-xs text-right mt-1" style={{ color:'var(--brown-soft)' }}>{pct.toFixed(0)}% gebruikt</p>
                  </>
                ) : (
                  <button onClick={() => setShowBudForm(true)} className="btn-ghost w-full">Totaalbudget instellen</button>
                )}
              </div>

              {/* Pie chart */}
              {expenses.length > 0 && (
                <div className="glass p-4 mb-4">
                  <h3 className="serif font-semibold mb-3">Per categorie</h3>
                  <PieChart expenses={expenses} />
                  <div className="gold-line mt-3" />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {CATS.map(c => {
                      const catTotal = expenses.filter(e=>e.category===c.key).reduce((s,e)=>s+Number(e.amount),0)
                      if (!catTotal) return null
                      return (
                        <div key={c.key} className="flex items-center gap-2 text-sm">
                          <span>{c.icon}</span>
                          <span style={{ color:'var(--brown-soft)' }}>{c.key}</span>
                          <span className="ml-auto font-semibold" style={{ color:'var(--brown)' }}>{curr} {catTotal.toFixed(0)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Lijst tab */}
          {activeTab === 'uitgaven' && (
            <div>
              {loading ? (
                <div className="flex flex-col gap-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16" />)}</div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">💸</p>
                  <p className="serif-italic" style={{ color:'var(--brown-soft)' }}>Nog geen uitgaven</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {expenses.map(exp => (
                    <div key={exp.id} className="glass-sm p-3 flex items-center gap-3">
                      <span className="text-xl flex-shrink-0">{CATS.find(c=>c.key===exp.category)?.icon||'🎁'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="font-semibold text-sm truncate">{exp.description || exp.category}</p>
                          <span className="font-bold text-sm ml-2" style={{ color:'var(--gold)' }}>{curr} {Number(exp.amount).toFixed(2)}</span>
                        </div>
                        <p className="text-xs" style={{ color:'var(--brown-soft)' }}>
                          {exp.category} · {new Date(exp.date).toLocaleDateString('nl-NL')} · {exp.paid_by==='lilia'?'👰':'🤵'}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(exp.id)} className="text-sm opacity-40 hover:opacity-80 flex-shrink-0">🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Valuta tab */}
          {activeTab === 'valuta' && <CurrencyConverter base={curr} />}
        </div>

        {/* Uitgave modal */}
        {showExpForm && (
          <div className="overlay" onClick={() => setShowExpForm(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <h2 className="serif text-xl mb-4">Uitgave toevoegen</h2>
              <div className="flex flex-col gap-3">
                <input type="number" placeholder="Bedrag" value={form.amount} onChange={e => setForm(p=>({...p,amount:e.target.value}))} className="input" inputMode="decimal" />
                <div className="flex flex-wrap gap-2">
                  {CATS.map(c => (
                    <button key={c.key} onClick={() => setForm(p=>({...p,category:c.key}))}
                            className={`chip ${form.category===c.key?'active':''}`}>
                      {c.icon} {c.key}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Omschrijving (optioneel)" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} className="input" />
                <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} className="input" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowExpForm(false)} className="flex-1 btn-ghost">Annuleer</button>
                <button onClick={handleAddExpense} disabled={!form.amount} className="flex-1 btn-gold disabled:opacity-40">Toevoegen</button>
              </div>
            </div>
          </div>
        )}

        {/* Budget modal */}
        {showBudForm && (
          <div className="overlay" onClick={() => setShowBudForm(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <h2 className="serif text-xl mb-4">Budget instellen</h2>
              <input type="number" placeholder="Totaal budget" value={budForm.total} onChange={e => setBudForm(p=>({...p,total:e.target.value}))} className="input mb-3" inputMode="decimal" />
              <div className="flex flex-wrap gap-2 mb-4">
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setBudForm(p=>({...p,currency:c}))}
                          className={`chip ${budForm.currency===c?'active':''}`}>{c}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowBudForm(false)} className="flex-1 btn-ghost">Annuleer</button>
                <button onClick={handleSaveBudget} className="flex-1 btn-gold">Opslaan</button>
              </div>
            </div>
          </div>
        )}

        <BottomNav />
        <FloatingAI currentUser={user} />
      </div>
    </div>
  )
}
