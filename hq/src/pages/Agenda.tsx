import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { getAgenda, addAgenda, updateAgenda, deleteAgenda, getFlights, logActivity } from '@/lib/supabase'
import { downloadICS } from '@/lib/ics'
import { toast } from '@/lib/notify'
import { TRIP } from '@/data/trip'

// Tijdslot → startuur + standaardduur, met kleur (categorie)
const SLOTS = [
  { key: 'Ochtend', start: 8, h: 3, color: '#4ECDC4', label: 'Ochtend' },
  { key: 'Middag', start: 12, h: 4, color: '#C9A84C', label: 'Middag' },
  { key: 'Avond', start: 18, h: 3, color: '#E0856B', label: 'Avond' },
  { key: 'Nacht', start: 21, h: 2, color: '#6C7BBF', label: 'Nacht' },
]
const TYPE_COLOR: Record<string, string> = { activiteit: '#4ECDC4', restaurant: '#C9A84C', hotel: '#6C7BBF', transport: '#8A9AB5', rest: '#4CAF82', vlucht: '#E0856B' }
const START_H = 7, END_H = 23, HOUR = 58

const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

export default function Agenda() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { phone } = useTrip()
  const [items, setItems] = useState<any[]>([])
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(() => {
    const today = new Date().toISOString().split('T')[0]
    return today >= TRIP.start && today <= TRIP.end ? today : TRIP.start
  })
  const [detail, setDetail] = useState<any>(null)
  const [add, setAdd] = useState(false)
  const [form, setForm] = useState({ time_slot: 'Middag', activity: '', location: '', price: '' })
  const [note, setNote] = useState('')

  useEffect(() => { Promise.all([getAgenda(), getFlights()]).then(([a, f]) => { setItems(a); setFlights(f); setLoading(false) }) }, [])

  // Week-strip rond geselecteerde dag (binnen reis)
  const week = useMemo(() => {
    const base = new Date(sel); const arr: string[] = []
    for (let i = -3; i <= 3; i++) { const d = new Date(base); d.setDate(d.getDate() + i); arr.push(d.toISOString().split('T')[0]) }
    return arr
  }, [sel])

  const dayItems = items.filter(i => i.date === sel)
  const dayFlights = flights.filter(f => (f.depart_at || '').startsWith(sel) || (f.arrive_at || '').startsWith(sel))
  const today = new Date().toISOString().split('T')[0]

  async function save() {
    if (!form.activity) { toast(t('explore.searchPh')); return }
    const slot = SLOTS.find(s => s.key === form.time_slot)!
    const n = await addAgenda({ date: sel, time_slot: form.time_slot, activity: form.activity, location: form.location, price: form.price ? Number(form.price) : null, type: 'activiteit', created_by: phone })
    if (n) { setItems(p => [...p, n]); logActivity('reis', `${phone === 'lilia' ? 'Lilia' : 'Abdul'} plande "${form.activity}"`, phone) }
    setAdd(false); setForm({ time_slot: 'Middag', activity: '', location: '', price: '' })
    toast('✓ ' + t('common.add'))
  }
  async function del(id: string) { await deleteAgenda(id); setItems(p => p.filter(i => i.id !== id)); setDetail(null); toast('✓') }
  async function saveNote() { if (!detail) return; await updateAgenda(detail.id, { notes: note }); setItems(p => p.map(i => i.id === detail.id ? { ...i, notes: note } : i)); toast('✓ ' + t('common.save')); setDetail(null) }

  function openDetail(it: any) { setDetail(it); setNote(it.notes || '') }
  function dayLabel(d: string) { return d === today ? t('agenda.today') : new Date(d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }) }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('agenda.title')}</div><button className="btn btn-gold btn-sm" onClick={() => setAdd(true)}>+ {t('common.add')}</button></div>

      {/* Week-strip */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }} className="no-sb">
        {week.map(d => {
          const dt = new Date(d); const on = d === sel; const isToday = d === today
          const cnt = items.filter(i => i.date === d).length
          return (
            <button key={d} onClick={() => setSel(d)} style={{
              flex: '0 0 46px', padding: '8px 0', borderRadius: 16, textAlign: 'center',
              background: on ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'var(--glass)',
              color: on ? '#0A1628' : 'var(--text-2)', border: '1px solid var(--line)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: .8 }}>{dayNames[dt.getDay()]}</div>
              <div className="serif" style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>{dt.getDate()}</div>
              <div style={{ height: 4, marginTop: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                {cnt > 0 && <span style={{ width: 4, height: 4, borderRadius: 2, background: on ? '#0A1628' : 'var(--gold)' }} />}
                {isToday && <span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--teal)' }} />}
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-2)', textTransform: 'capitalize', marginBottom: 8 }}>{dayLabel(sel)}</div>

      {/* Vluchten van de dag (bovenaan, opvallend) */}
      {dayFlights.map(f => (
        <div key={f.id} className="card" style={{ padding: '12px 14px', marginBottom: 10, borderLeft: '3px solid #E0856B', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>✈️</span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{f.flight_no} · {f.from_code}→{f.to_code}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{f.depart_at ? new Date(f.depart_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : ''}{f.seat ? ` · stoel ${f.seat}` : ''}</div></div>
        </div>
      ))}

      {/* ROOSTER — uur-tijdlijn met gekleurde blokken */}
      {loading ? <div className="skel" style={{ height: 400 }} /> : (
        <div className="card" style={{ position: 'relative', height: (END_H - START_H) * HOUR + 16, padding: '8px 0', overflow: 'hidden' }}>
          {/* uur-lijnen */}
          {Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i).map((h, i) => (
            <div key={h} style={{ position: 'absolute', top: 8 + i * HOUR, left: 0, right: 0, height: HOUR, borderTop: '1px solid var(--line-2)', display: 'flex' }}>
              <span className="mono" style={{ width: 46, fontSize: 11, color: 'var(--text-3)', paddingLeft: 12, paddingTop: 2 }}>{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
          {/* nu-lijn */}
          {sel === today && (() => { const now = new Date(); const hh = now.getHours() + now.getMinutes() / 60; if (hh < START_H || hh > END_H) return null; return (
            <div style={{ position: 'absolute', top: 8 + (hh - START_H) * HOUR, left: 46, right: 8, height: 2, background: 'var(--teal)', zIndex: 3 }}>
              <span style={{ position: 'absolute', left: -6, top: -3, width: 8, height: 8, borderRadius: 4, background: 'var(--teal)' }} /></div>
          ) })()}
          {/* activiteit-blokken */}
          {dayItems.map(it => {
            const slot = SLOTS.find(s => s.key === it.time_slot) || SLOTS[1]
            const top = 8 + (slot.start - START_H) * HOUR + 2
            const height = slot.h * HOUR - 6
            const color = TYPE_COLOR[it.type] || slot.color
            // schik naast elkaar als zelfde slot
            const sameSlot = dayItems.filter(x => (x.time_slot || 'Middag') === it.time_slot)
            const idx = sameSlot.indexOf(it); const n = sameSlot.length
            const leftBase = 54, gap = 6, avail = 100
            return (
              <button key={it.id} onClick={() => openDetail(it)} style={{
                position: 'absolute', top, height, left: `calc(${leftBase}px + ${idx} * ((100% - ${leftBase}px - 10px) / ${n}))`,
                width: `calc((100% - ${leftBase}px - 10px) / ${n} - ${n > 1 ? gap : 0}px)`,
                borderRadius: 14, padding: '8px 10px', textAlign: 'left', overflow: 'hidden',
                background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#0A1628',
                boxShadow: `0 4px 14px ${color}55`, border: 'none',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: .7, textTransform: 'uppercase', letterSpacing: '.04em' }}>{slot.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.15, marginTop: 2 }}>{it.activity || it.title}</div>
                {it.location && <div style={{ fontSize: 11, opacity: .8, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {it.location}</div>}
                {it.price && <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>€{it.price}</div>}
              </button>
            )
          })}
          {dayItems.length === 0 && dayFlights.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ fontSize: 34 }}>🌿</div>
              <div className="serif" style={{ fontSize: 18, color: 'var(--text-2)' }}>{t('agenda.restDayText').replace('🌿 ', '')}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-gold btn-sm" onClick={() => setAdd(true)}>+ {t('common.add')}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/explore')}>{t('agenda.suggest')}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAIL sheet */}
      {detail && (
        <div className="overlay" onClick={() => setDetail(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="eyebrow">{detail.time_slot} · {dayLabel(sel)}</div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{detail.activity || detail.title}</div>
            {detail.location && <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 10 }}>📍 {detail.location}</div>}
            {detail.price && <span className="badge badge-gold" style={{ marginBottom: 10 }}>€{detail.price}</span>}
            <label className="eyebrow" style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>{t('agenda.now') && 'Opmerking'}</label>
            <textarea className="input" style={{ minHeight: 70 }} placeholder={t('travel.notePh')} value={note} onChange={e => setNote(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={saveNote}>💾 {t('common.save')}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => nav('/explore')}>✦ {t('agenda.suggest')}</button>
              {detail.location && <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent(detail.location)}`}>🧭</a>}
              <button className="btn btn-ghost btn-sm" onClick={() => downloadICS({ title: detail.activity || detail.title, date: detail.date, timeSlot: detail.time_slot, location: detail.location })}>🍎</button>
              <button className="btn btn-sm" style={{ background: 'rgba(224,85,85,.16)', color: 'var(--bad)' }} onClick={() => del(detail.id)}>🗑️</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD sheet — datum is al gekozen (geselecteerde dag) */}
      {add && (
        <div className="overlay" onClick={() => setAdd(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="eyebrow">{dayLabel(sel)}</div>
            <div className="s-title" style={{ fontSize: 22, marginBottom: 12 }}>{t('common.add')}</div>
            <input className="input" placeholder={t('explore.searchPh')} value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>{SLOTS.map(s => <button key={s.key} className={`pill ${form.time_slot === s.key ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setForm(f => ({ ...f, time_slot: s.key }))}>{s.label}</button>)}</div>
            <input className="input" placeholder={t('travel.address')} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={{ marginBottom: 10 }} />
            <input type="number" className="input" placeholder={t('budget.amount') + ' (€)'} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => nav('/explore')}>✦ {t('agenda.suggest')}</button>
              <button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
