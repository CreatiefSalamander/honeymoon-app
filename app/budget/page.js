'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useLanguage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

const CATS = [
  { id: 'verblijf', label: 'Verblijf', emoji: '🏨', color: '#c9a84c' },
  { id: 'eten', label: 'Eten', emoji: '🍜', color: '#4ecdc4' },
  { id: 'activiteiten', label: 'Activiteiten', emoji: '🏄', color: '#e8813a' },
  { id: 'transport', label: 'Transport', emoji: '🚗', color: '#9b59b6' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#e74c3c' },
  { id: 'diversen', label: 'Diversen', emoji: '✨', color: '#3498db' },
]
const IDR_RATE = 17500
const TOTAAL = 10000

function fmt(amount, currency) {
  if (currency === 'IDR') return 'Rp ' + Math.round(amount * IDR_RATE).toLocaleString('nl')
  return '\u20ac' + amount.toFixed(2).replace('.', ',')
}

export default function BudgetPage() {
  const [currency, setCurrency] = useState('EUR')
  const [tab, setTab] = useState('overzicht')
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ omschrijving: '', bedrag: '', categorie: 'eten', datum: new Date().toISOString().split('T')[0], notitie: '' })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('expenses').select('*').order('datum', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const totaalUit = expenses.reduce((s, e) => s + (e.bedrag || 0), 0)
  const rest = TOTAAL - totaalUit
  const pct = Math.min((totaalUit / TOTAAL) * 100, 100)

  const perCat = CATS.map(cat => ({ ...cat, total: expenses.filter(e => e.categorie === cat.id).reduce((s, e) => s + (e.bedrag || 0), 0) })).filter(c => c.total > 0)

  const perDag = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    perDag.push({ datum: d.toLocaleDateString('nl', { day: 'numeric', month: 'short' }), total: expenses.filter(e => e.datum === ds).reduce((s, e) => s + (e.bedrag || 0), 0) })
  }

  const grouped = {}
  expenses.forEach(e => { const d = e.datum || new Date().toISOString().split('T')[0]; if (!grouped[d]) grouped[d] = []; grouped[d].push(e) })

  const save = async () => {
    if (!form.omschrijving || !form.bedrag) return
    const data = { omschrijving: form.omschrijving, bedrag: parseFloat(form.bedrag), categorie: form.categorie, datum: form.datum, notitie: form.notitie }
    if (editItem) await supabase.from('expenses').update(data).eq('id', editItem.id)
    else await supabase.from('expenses').insert(data)
    setForm({ omschrijving: '', bedrag: '', categorie: 'eten', datum: new Date().toISOString().split('T')[0], notitie: '' })
    setShowForm(false); setEditItem(null); load()
  }

  const del = async (id) => { if (!confirm('Verwijderen?')) return; await supabase.from('expenses').delete().eq('id', id); load() }
  const edit = (item) => { setEditItem(item); setForm({ omschrijving: item.omschrijving, bedrag: String(item.bedrag), categorie: item.categorie || 'eten', datum: item.datum || '', notitie: item.notitie || '' }); setShowForm(true) }

  return (
    <div className="page-content">
      <div style={{ padding: '20px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#8a9ab5', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Budget</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.7rem', fontWeight: 700, color: '#f0ece4', margin: 0 }}>Huwelijksreis</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setCurrency(c => c === 'EUR' ? 'IDR' : 'EUR')} style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.30)', color: '#c9a84c', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{currency === 'EUR' ? '\u20ac EUR' : 'Rp IDR'}</button>
          <button onClick={() => { setEditItem(null); setForm({ omschrijving: '', bedrag: '', categorie: 'eten', datum: new Date().toISOString().split('T')[0], notitie: '' }); setShowForm(true) }} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', border: 'none', cursor: 'pointer', color: '#0a1628', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
        </div>
      </div>

      {/* Dashboard kaart */}
      <div style={{ margin: '16px 16px 0' }}>
        <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg,rgba(201,168,76,0.10),rgba(10,22,40,0.9))', borderColor: 'rgba(201,168,76,0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ color: '#8a9ab5', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px' }}>Resterend</p>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '2.2rem', fontWeight: 700, color: rest > 2000 ? '#4ecdc4' : rest > 0 ? '#c9a84c' : '#ef4444', margin: 0, lineHeight: 1 }}>{fmt(rest, currency)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#8a9ab5', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px' }}>Uitgegeven</p>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.3rem', fontWeight: 600, color: '#f0ece4', margin: 0 }}>{fmt(totaalUit, currency)}</p>
              <p style={{ color: '#8a9ab5', fontSize: '0.65rem', margin: '2px 0 0' }}>van {fmt(TOTAAL, currency)}</p>
            </div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 1, delay: 0.3 }}
              style={{ height: '100%', background: pct > 85 ? 'linear-gradient(90deg,#ef4444,#f87171)' : pct > 60 ? 'linear-gradient(90deg,#c9a84c,#e8c97a)' : 'linear-gradient(90deg,#4ecdc4,#c9a84c)', borderRadius: 4 }} />
          </div>
          <p style={{ color: '#8a9ab5', fontSize: '0.62rem', margin: 0, fontFamily: "'DM Mono',monospace" }}>{Math.round(pct)}% gebruikt</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '12px 16px 0', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
        {[['overzicht','Overzicht'],['transacties','Transacties'],['grafiek','Grafiek']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: 8, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, background: tab === id ? 'rgba(201,168,76,0.18)' : 'transparent', color: tab === id ? '#c9a84c' : '#8a9ab5' }}>{lbl}</button>
        ))}
      </div>

      <div style={{ padding: '12px 16px 40px' }}>
        {tab === 'overzicht' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {perCat.length > 0 ? (
              <>
                <div className="card" style={{ padding: 16, marginBottom: 10 }}>
                  <p style={{ color: '#8a9ab5', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Verdeling</p>
                  <div style={{ height: 160, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={perCat} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="total">
                        {perCat.map((c, i) => <Cell key={i} fill={c.color} />)}
                      </Pie><Tooltip formatter={v => fmt(v, currency)} /></PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                      <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '1rem', fontWeight: 700, color: '#f0ece4', margin: 0 }}>{Math.round(pct)}%</p>
                      <p style={{ color: '#8a9ab5', fontSize: '0.58rem', margin: 0 }}>gebruikt</p>
                    </div>
                  </div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  {perCat.sort((a,b) => b.total - a.total).map((cat, i) => (
                    <div key={cat.id} style={{ marginBottom: i < perCat.length-1 ? 12 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ color: '#f0ece4', fontSize: '0.8rem' }}>{cat.emoji} {cat.label}</span>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.8rem', color: cat.color, fontWeight: 700 }}>{fmt(cat.total, currency)}</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: (cat.total/totaalUit*100)+'%' }} transition={{ duration: 0.8, delay: i*0.1 }} style={{ height: '100%', background: cat.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', margin: '0 0 10px' }}>💰</p>
                <p style={{ color: '#f0ece4', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', margin: '0 0 6px' }}>Nog geen uitgaven</p>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Toevoegen</button>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'transacties' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(dag => (
              <div key={dag} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ color: '#8a9ab5', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{new Date(dag).toLocaleDateString('nl', { weekday: 'short', day: 'numeric', month: 'long' })}</p>
                  <p style={{ color: '#8a9ab5', fontSize: '0.65rem', fontFamily: "'DM Mono',monospace", margin: 0 }}>{fmt(grouped[dag].reduce((s,e)=>s+(e.bedrag||0),0), currency)}</p>
                </div>
                <div className="card" style={{ padding: '2px 0', overflow: 'hidden' }}>
                  {grouped[dag].map((exp, i) => {
                    const cat = CATS.find(c => c.id === exp.categorie) || CATS[5]
                    return (
                      <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: i < grouped[dag].length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }} onClick={() => edit(exp)}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: cat.color+'18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{cat.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: '#f0ece4', fontSize: '0.82rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.omschrijving}</p>
                          <span style={{ fontSize: '0.62rem', color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.9rem', fontWeight: 700, color: '#f0ece4', margin: 0 }}>{fmt(exp.bedrag, currency)}</p>
                          <button onClick={e=>{e.stopPropagation();del(exp.id)}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.62rem', padding: 0 }}>verwijder</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {expenses.length === 0 && <div className="card" style={{ padding: 24, textAlign: 'center' }}><p style={{ color: '#8a9ab5', fontSize: '0.82rem', margin: 0 }}>Geen transacties</p></div>}
          </motion.div>
        )}

        {tab === 'grafiek' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card" style={{ padding: 16, marginBottom: 10 }}>
              <p style={{ color: '#8a9ab5', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 10px' }}>Afgelopen 14 dagen</p>
              <div style={{ height: 170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perDag}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="datum" tick={{ fill: '#8a9ab5', fontSize: 8 }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={{ fill: '#8a9ab5', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => '\u20ac'+v} />
                    <Tooltip formatter={v => fmt(v, currency)} contentStyle={{ background: '#111f3a', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f0ece4', fontSize: '0.72rem' }} />
                    <Line type="monotone" dataKey="total" stroke="#c9a84c" strokeWidth={2} dot={{ fill: '#c9a84c', r: 3 }} activeDot={{ r: 5, fill: '#e8c97a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Totaal uitgegeven', fmt(totaalUit,currency),'💰'],['Resterend', fmt(rest,currency),'🎯'],['Daggemiddelde', fmt(totaalUit/Math.max(perDag.filter(d=>d.total>0).length,1),currency),'📅'],['Categorien', perCat.length+'x','📊']].map(([l,v,e],i) => (
                <div key={i} className="card" style={{ padding: 12 }}>
                  <p style={{ fontSize: '1.1rem', margin: '0 0 3px' }}>{e}</p>
                  <p style={{ color: '#8a9ab5', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 2px' }}>{l}</p>
                  <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.9rem', fontWeight: 700, color: '#f0ece4', margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Formulier */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay" onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="sheet" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <h2 className="serif" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0ece4', margin: 0 }}>{editItem ? 'Bewerk' : 'Nieuwe uitgave'}</h2>
                <button onClick={() => { setShowForm(false); setEditItem(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '1.2rem' }}>x</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="input" placeholder="Omschrijving" value={form.omschrijving} onChange={e => setForm(p => ({ ...p, omschrijving: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="input" type="number" placeholder="Bedrag (EUR)" value={form.bedrag} onChange={e => setForm(p => ({ ...p, bedrag: e.target.value }))} />
                  <input className="input" type="date" value={form.datum} onChange={e => setForm(p => ({ ...p, datum: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CATS.map(cat => (
                    <button key={cat.id} onClick={() => setForm(p => ({ ...p, categorie: cat.id }))}
                      style={{ padding: '5px 11px', borderRadius: 100, border: '1px solid ' + (form.categorie === cat.id ? cat.color : 'rgba(255,255,255,0.10)'), background: form.categorie === cat.id ? cat.color+'20' : 'transparent', color: form.categorie === cat.id ? cat.color : '#8a9ab5', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
                <button onClick={save} className="btn btn-primary" style={{ padding: 13 }}>{editItem ? 'Opslaan' : '+ Toevoegen'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  }
