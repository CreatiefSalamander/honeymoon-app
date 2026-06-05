'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

const ACT_CATS = [
  { id: 'strand', label: 'Strand', emoji: '🏖️', color: '#4ecdc4' },
  { id: 'eten', label: 'Eten', emoji: '🍜', color: '#e8813a' },
  { id: 'activiteit', label: 'Activiteit', emoji: '🏄', color: '#c9a84c' },
  { id: 'vervoer', label: 'Vervoer', emoji: '✈️', color: '#9b59b6' },
  { id: 'verblijf', label: 'Verblijf', emoji: '🏨', color: '#3498db' },
  { id: 'overig', label: 'Overig', emoji: '✨', color: '#8a9ab5' },
]
const REIS_START = new Date('2026-06-12')
const REIS_EIND = new Date('2026-07-24')
const MAANDEN = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const DAGNAMEN = ['Ma','Di','Wo','Do','Vr','Za','Zo']

function toStr(d) { return d.toISOString().split('T')[0] }
function isReis(d) { return d >= REIS_START && d <= REIS_EIND }

function dagInMaand(jaar, maand) {
  const days = []
  const eerste = new Date(jaar, maand, 1)
  for (let i = 0; i < (eerste.getDay() || 7) - 1; i++) days.push(null)
  for (let d = 1; d <= new Date(jaar, maand + 1, 0).getDate(); d++) days.push(new Date(jaar, maand, d))
  return days
}

export default function AgendaPage() {
  const now = new Date()
  const [jaar, setJaar] = useState(2026)
  const [maand, setMaand] = useState(5)
  const [selDate, setSelDate] = useState(toStr(now < REIS_START ? REIS_START : now))
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ title: '', time: '10:00', type: 'activiteit', datum: selDate, prijs: '', notitie: '', duur: '2' })

  const load = async () => {
    const { data } = await supabase.from('itinerary').select('*').order('time')
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  const forDay = (ds) => items.filter(i => (i.date || i.datum) === ds)
  const hasDots = new Set(items.map(i => i.date || i.datum))
  const dagItems = forDay(selDate).sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const prevM = () => { if (maand === 0) { setMaand(11); setJaar(j => j-1) } else setMaand(m => m-1) }
  const nextM = () => { if (maand === 11) { setMaand(0); setJaar(j => j+1) } else setMaand(m => m+1) }

  const save = async () => {
    if (!form.title) return
    const data = { title: form.title, time: form.time, type: form.type, date: form.datum, datum: form.datum, prijs: form.prijs ? parseFloat(form.prijs) : null, notitie: form.notitie, duur: parseInt(form.duur)||1 }
    if (editItem) await supabase.from('itinerary').update(data).eq('id', editItem.id)
    else await supabase.from('itinerary').insert(data)
    setShowForm(false); setEditItem(null)
    setForm({ title: '', time: '10:00', type: 'activiteit', datum: selDate, prijs: '', notitie: '', duur: '2' })
    load()
  }

  const del = async (id) => { if (!confirm('Verwijderen?')) return; await supabase.from('itinerary').delete().eq('id', id); load() }
  const openEdit = (item) => { setEditItem(item); setForm({ title: item.title||item.naam||'', time: item.time||'10:00', type: item.type||'activiteit', datum: item.date||item.datum||selDate, prijs: item.prijs?String(item.prijs):'', notitie: item.notitie||'', duur: item.duur?String(item.duur):'2' }); setShowForm(true) }
  const openNew = () => { setEditItem(null); setForm({ title: '', time: '10:00', type: 'activiteit', datum: selDate, prijs: '', notitie: '', duur: '2' }); setShowForm(true) }

  const selDateObj = new Date(selDate)

  return (
    <div className="page-content">
      <div style={{ padding: '20px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#8a9ab5', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Agenda</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.7rem', fontWeight: 700, color: '#f0ece4', margin: 0 }}>Huwelijksreis</h1>
        </div>
        <button onClick={openNew} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', border: 'none', cursor: 'pointer', color: '#0a1628', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
      </div>

      {/* Kalender */}
      <div style={{ margin: '14px 16px 0' }}>
        <div className="card" style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevM} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '1rem' }}>‹</button>
            <p style={{ color: '#f0ece4', fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{MAANDEN[maand]} {jaar}</p>
            <button onClick={nextM} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '1rem' }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
            {DAGNAMEN.map(d => <p key={d} style={{ color: '#8a9ab5', fontSize: '0.58rem', fontWeight: 700, textAlign: 'center', margin: 0 }}>{d}</p>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {dagInMaand(jaar, maand).map((dag, i) => {
              if (!dag) return <div key={i} />
              const ds = toStr(dag)
              const reis = isReis(dag)
              const dot = hasDots.has(ds)
              const sel = ds === selDate
              const tod = toStr(dag) === toStr(now)
              return (
                <button key={i} onClick={() => setSelDate(ds)} style={{ aspectRatio: '1', borderRadius: 8, border: tod ? '2px solid #c9a84c' : sel ? '2px solid #4ecdc4' : 'none', background: sel ? 'rgba(78,205,196,0.18)' : reis ? 'rgba(201,168,76,0.05)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: sel||tod ? 700 : 400, color: sel ? '#4ecdc4' : tod ? '#c9a84c' : reis ? '#f0ece4' : '#8a9ab5' }}>{dag.getDate()}</span>
                  {dot && <span style={{ width: 4, height: 4, borderRadius: '50%', background: sel ? '#4ecdc4' : '#c9a84c', display: 'block' }} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tijdlijn geselecteerde dag */}
      <div style={{ padding: '12px 16px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ color: '#f0ece4', fontWeight: 700, fontSize: '1rem', margin: 0, fontFamily: "'Cormorant Garamond',serif" }}>
              {selDateObj.toLocaleDateString('nl', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p style={{ color: '#8a9ab5', fontSize: '0.65rem', margin: 0 }}>
              {isReis(selDateObj) ? '🏝️ Reisdag' : '📅 Buiten reis'}{dagItems.length > 0 ? ' · ' + dagItems.length + ' activiteit' + (dagItems.length>1?'en':'') : ''}
            </p>
          </div>
          <button onClick={openNew} className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem', padding: '5px 12px' }}>+ Toevoegen</button>
        </div>

        {dagItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dagItems.map((item, i) => {
              const cat = ACT_CATS.find(c => c.id === item.type) || ACT_CATS[5]
              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.06 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44, flexShrink: 0 }}>
                      <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', color: '#8a9ab5', margin: '8px 0 4px', fontWeight: 600 }}>{item.time||'--:--'}</p>
                      <div style={{ width: 2, flex: 1, background: cat.color+'35', borderRadius: 1, minHeight: 16 }} />
                    </div>
                    <div className="card" style={{ flex: 1, padding: '10px 14px', borderLeft: '3px solid ' + cat.color, cursor: 'pointer' }} onClick={() => openEdit(item)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span>{cat.emoji}</span>
                            <p style={{ color: '#f0ece4', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>{item.title||item.naam}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {item.duur && <span style={{ color: '#8a9ab5', fontSize: '0.62rem' }}>⏱️{item.duur}u</span>}
                            {item.prijs && <span style={{ color: '#c9a84c', fontSize: '0.62rem', fontFamily: "'DM Mono',monospace" }}>€{item.prijs}</span>}
                            <span style={{ fontSize: '0.6rem', color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                          </div>
                          {item.notitie && <p style={{ color: '#8a9ab5', fontSize: '0.68rem', margin: '3px 0 0' }}>{item.notitie}</p>}
                        </div>
                        <button onClick={e=>{e.stopPropagation();del(item.id)}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0 0 0 8px', fontSize: '0.9rem', flexShrink: 0 }}>×</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '1.8rem', margin: '0 0 8px' }}>{isReis(selDateObj) ? '🌴' : '📅'}</p>
            <p style={{ color: '#f0ece4', fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', margin: '0 0 4px' }}>
              {isReis(selDateObj) ? 'Vrije dag!' : 'Buiten reisperiode'}
            </p>
            {isReis(selDateObj) && (
              <button onClick={openNew} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px', marginTop: 10 }}>+ Activiteit plannen</button>
            )}
          </div>
        )}
      </div>

      {/* Formulier */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay" onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="sheet" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0ece4', margin: 0 }}>{editItem ? 'Bewerk' : 'Nieuwe activiteit'}</h2>
                <button onClick={() => { setShowForm(false); setEditItem(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '1.2rem' }}>x</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="input" placeholder="Naam activiteit" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <input className="input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                  <input className="input" type="number" placeholder="Uren" value={form.duur} onChange={e => setForm(p => ({ ...p, duur: e.target.value }))} min="0.5" step="0.5" />
                  <input className="input" type="number" placeholder="Prijs" value={form.prijs} onChange={e => setForm(p => ({ ...p, prijs: e.target.value }))} />
                </div>
                <input className="input" type="date" value={form.datum} onChange={e => setForm(p => ({ ...p, datum: e.target.value }))} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {ACT_CATS.map(cat => (
                    <button key={cat.id} onClick={() => setForm(p => ({ ...p, type: cat.id }))}
                      style={{ padding: '4px 10px', borderRadius: 100, border: '1px solid ' + (form.type===cat.id ? cat.color : 'rgba(255,255,255,0.10)'), background: form.type===cat.id ? cat.color+'20' : 'transparent', color: form.type===cat.id ? cat.color : '#8a9ab5', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
                <textarea className="input" placeholder="Notitie" rows={2} value={form.notitie} onChange={e => setForm(p => ({ ...p, notitie: e.target.value }))} style={{ resize: 'none' }} />
                <button onClick={save} className="btn btn-primary" style={{ padding: 13 }}>{editItem ? 'Opslaan' : '+ Toevoegen'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  }
