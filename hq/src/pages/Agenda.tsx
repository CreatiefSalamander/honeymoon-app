import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { getAgenda, addAgenda, deleteAgenda } from '@/lib/supabase'
import { downloadICS } from '@/lib/ics'
import { distanceKm } from '@/lib/geo'
import { toast } from '@/lib/notify'
import { TRIP } from '@/data/trip'

const SLOT_COLORS: Record<string, string> = { Ochtend: '#E9C97A', Middag: '#2E7DAA', Avond: '#C2922F', Nacht: '#41596E' }

export default function Agenda() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { phone, location } = useTrip()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [add, setAdd] = useState(false)
  const [form, setForm] = useState({ date: '', time_slot: 'Middag', activity: '', location: '', price: '' })

  useEffect(() => { getAgenda().then(d => { setItems(d); setLoading(false) }) }, [])

  // Dagen van de reis
  const days: string[] = []
  const s = new Date(TRIP.start), e = new Date(TRIP.end)
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) days.push(d.toISOString().split('T')[0])
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  // toon vandaag + 6 dagen (of eerste 7 reisdagen als reis nog niet begon)
  const startIdx = Math.max(0, days.indexOf(today))
  const window = days.slice(startIdx, startIdx + 7).length ? days.slice(startIdx, startIdx + 7) : days.slice(0, 7)

  async function save() {
    if (!form.activity || !form.date) { toast(t('budget.date')); return }
    const n = await addAgenda({ ...form, price: form.price ? Number(form.price) : null, created_by: phone })
    if (n) setItems(p => [...p, n])
    setAdd(false); setForm({ date: '', time_slot: 'Middag', activity: '', location: '', price: '' })
    toast('✓ ' + t('common.add'))
  }
  async function del(id: string) { await deleteAgenda(id); setItems(p => p.filter(i => i.id !== id)) }

  function label(d: string) {
    if (d === today) return t('agenda.today'); if (d === tomorrow) return t('agenda.tomorrow')
    return new Date(d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' })
  }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('agenda.title')}</div><button className="btn btn-gold btn-sm" onClick={() => setAdd(true)}>+ {t('common.add')}</button></div>

      {loading ? [1, 2, 3].map(i => <div key={i} className="skel" style={{ height: 90, marginBottom: 12 }} />) :
        items.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗓️</div>
            <p className="serif" style={{ fontSize: 18 }}>{t('agenda.empty')}</p>
            <button className="btn btn-ocean" style={{ marginTop: 14 }} onClick={() => nav('/explore')}>{t('nav.explore')} →</button>
          </div>
        ) : window.map(d => {
          const dayItems = items.filter(i => i.date === d).sort((a, b) => ['Ochtend', 'Middag', 'Avond', 'Nacht'].indexOf(a.time_slot) - ['Ochtend', 'Middag', 'Avond', 'Nacht'].indexOf(b.time_slot))
          const isToday = d === today
          return (
            <div key={d} className="card reveal" style={{ marginBottom: 12, overflow: 'hidden', ...(isToday ? { border: '1.5px solid var(--gold)' } : {}) }}>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isToday ? 'var(--gold-pale)' : 'var(--glass-2)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize', color: isToday ? 'var(--gold)' : 'var(--ink)' }}>{label(d)}</div>
                {isToday && <span className="badge badge-gold">NU</span>}
              </div>
              {dayItems.length === 0 ? (
                <div style={{ padding: '14px 16px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-3)', flex: 1 }}>{t('agenda.freeTime', { when: label(d) })}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => nav('/explore')}>{t('agenda.suggest')}</button>
                  <button className="btn btn-ghost btn-sm" onClick={async () => { const n = await addAgenda({ date: d, time_slot: 'Middag', activity: t('agenda.restDayText'), type: 'rest', created_by: phone }); if (n) setItems(p => [...p, n]) }}>🌿 {t('agenda.restDay')}</button>
                </div>
              ) : dayItems.map((it, idx) => {
                const km = idx > 0 && it.lat && dayItems[idx - 1].lat ? distanceKm(dayItems[idx - 1], it) : null
                return (
                  <div key={it.id}>
                    {km != null && km > 0 && <div style={{ padding: '2px 16px 2px 24px', fontSize: 11, color: 'var(--ink-3)' }}>↓ {km} km</div>}
                    <div style={{ padding: '11px 16px', display: 'flex', gap: 11, alignItems: 'flex-start', borderTop: '1px solid var(--line)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: SLOT_COLORS[it.time_slot] || 'var(--ocean)', marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{it.activity || it.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{it.time_slot}{it.location ? ` · 📍 ${it.location}` : ''}{it.price ? ` · €${it.price}` : ''}</div>
                      </div>
                      <button onClick={() => downloadICS({ title: it.activity || it.title, date: it.date, timeSlot: it.time_slot, location: it.location })} style={{ fontSize: 15, opacity: .6 }} title={t('agenda.addToPhone')}>🍎</button>
                      <button onClick={() => del(it.id)} style={{ fontSize: 14, opacity: .5 }}>🗑️</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

      {add && (
        <div className="overlay" onClick={() => setAdd(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="s-title" style={{ fontSize: 22, marginBottom: 14 }}>{t('common.add')}</div>
            <input className="input" placeholder={t('explore.searchPh')} value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} style={{ marginBottom: 10 }} />
            <input type="date" className="input" min="2026-06-12" max="2026-07-24" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>{['Ochtend', 'Middag', 'Avond', 'Nacht'].map(sl => <button key={sl} className={`pill ${form.time_slot === sl ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setForm(f => ({ ...f, time_slot: sl }))}>{sl}</button>)}</div>
            <input className="input" placeholder={t('travel.address')} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={{ marginBottom: 10 }} />
            <input type="number" className="input" placeholder={t('budget.amount') + ' (€)'} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAdd(false)}>{t('common.cancel')}</button>
              <button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
