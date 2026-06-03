import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { getExpenses, addExpense, deleteExpense } from '@/lib/supabase'
import { getRate, fmt } from '@/lib/currency'
import { toast } from '@/lib/notify'
import { TRIP } from '@/data/trip'
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

const CATS = [
  { key: 'Hotel', icon: '🏨', color: '#2E7DAA' }, { key: 'Vlucht', icon: '✈️', color: '#1A5C82' },
  { key: 'Eten', icon: '🍽️', color: '#C2922F' }, { key: 'Activiteiten', icon: '🎭', color: '#E9C97A' },
  { key: 'Shopping', icon: '🛍️', color: '#7B96A8' }, { key: 'Transport', icon: '🚕', color: '#4ECDC4' },
  { key: 'Overig', icon: '🎁', color: '#C0503B' },
]

export default function Budget() {
  const { t } = useTranslation()
  const { phone } = useTrip()
  const [exp, setExp] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [add, setAdd] = useState(false)
  const [rate, setRate] = useState(17000)
  const [form, setForm] = useState({ amount: '', category: 'Eten', description: '', date: new Date().toISOString().split('T')[0] })

  useEffect(() => { getExpenses().then(d => { setExp(d); setLoading(false) }); getRate('EUR', 'IDR').then(setRate) }, [])

  const spent = exp.reduce((s, e) => s + Number(e.amount || 0), 0)
  const planned = TRIP.budgetBase + spent
  const remaining = TRIP.budgetTotal - planned
  const pct = Math.min(100, Math.round(planned / TRIP.budgetTotal * 100))
  const status = pct < 70 ? 'green' : pct < 95 ? 'yellow' : 'red'

  const byCat = CATS.map(c => ({ ...c, total: exp.filter(e => e.category === c.key).reduce((s, e) => s + Number(e.amount || 0), 0) })).filter(c => c.total > 0)

  async function save() {
    if (!form.amount) return
    const n = await addExpense({ amount: Number(form.amount), category: form.category, description: form.description, date: form.date, paid_by: phone, currency: 'EUR' })
    if (n) setExp(p => [n, ...p])
    setAdd(false); setForm({ amount: '', category: 'Eten', description: '', date: new Date().toISOString().split('T')[0] })
    toast('✓ ' + t('budget.addExpense'))
  }
  async function del(id: string) { await deleteExpense(id); setExp(p => p.filter(e => e.id !== id)) }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('budget.title')}</div><button className="btn btn-gold btn-sm" onClick={() => setAdd(true)}>+ {t('budget.addExpense')}</button></div>
      <div className="eyebrow" style={{ marginTop: -8, marginBottom: 14 }}>{t('budget.subtitle')}</div>

      {/* Overzicht */}
      <div className="glass glass-lg reveal" style={{ padding: 20, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="serif" style={{ fontSize: 36, fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>{fmt(Math.max(0, remaining))}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{t('budget.remaining', { x: '' })}</div>
          </div>
          <span className="badge" style={{ background: 'var(--glass-2)', color: status === 'green' ? 'var(--ok)' : status === 'yellow' ? 'var(--warn)' : 'var(--bad)' }}>{t('budget.' + status)}</span>
        </div>
        <div className="prog" style={{ marginTop: 14 }}><i style={{ width: `${pct}%`, background: status === 'red' ? 'linear-gradient(90deg,#C0503B,#e07a68)' : undefined }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
          <span>{t('budget.spent')}: {fmt(planned)}</span><span>{t('budget.ofPlanned', { t: fmt(TRIP.budgetTotal) })}</span>
        </div>
        <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--gold-pale)', fontSize: 13, color: 'var(--ink-2)' }}>{t('budget.' + status + 'Tip')}</div>
      </div>

      {/* Donut + categorieën */}
      {byCat.length > 0 ? (
        <div className="card reveal" style={{ padding: 18, marginBottom: 14, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 130, height: 130 }}>
            <Doughnut data={{ labels: byCat.map(c => c.key), datasets: [{ data: byCat.map(c => c.total), backgroundColor: byCat.map(c => c.color), borderWidth: 0 }] }}
              options={{ cutout: '62%', plugins: { legend: { display: false } } }} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            {byCat.map(c => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color }} />
                <span style={{ fontSize: 13, flex: 1 }}>{c.icon} {c.key}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 18, marginBottom: 14, fontSize: 13.5, color: 'var(--ink-2)' }}>{t('budget.empty')}</div>
      )}

      {/* Valuta */}
      <div className="card reveal" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow">EUR ↔ IDR</div>
        <div className="mono" style={{ fontSize: 13 }}>€1 ≈ {fmt(rate, 'IDR')}</div>
      </div>

      {/* Transacties */}
      {loading ? [1, 2, 3].map(i => <div key={i} className="skel" style={{ height: 56, marginBottom: 8 }} />) :
        exp.map(e => {
          const cat = CATS.find(c => c.key === e.category)
          return (
            <div key={e.id} className="card" style={{ padding: '11px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ fontSize: 18 }}>{cat?.icon || '🎁'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{e.description || e.category}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{e.category} · {new Date(e.date).toLocaleDateString('nl-NL')} · {e.paid_by === 'lilia' ? '👰' : '🤵'}</div>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{fmt(Number(e.amount))}</span>
              <button onClick={() => del(e.id)} style={{ opacity: .5, fontSize: 14 }}>🗑️</button>
            </div>
          )
        })}

      {add && (
        <div className="overlay" onClick={() => setAdd(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="s-title" style={{ fontSize: 22, marginBottom: 14 }}>{t('budget.addExpense')}</div>
            <input type="number" className="input" placeholder={t('budget.amount')} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>{CATS.map(c => <button key={c.key} className={`pill ${form.category === c.key ? 'on' : ''}`} onClick={() => setForm(f => ({ ...f, category: c.key }))}>{c.icon} {c.key}</button>)}</div>
            <input className="input" placeholder={t('budget.description')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ marginBottom: 10 }} />
            <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAdd(false)}>{t('common.cancel')}</button><button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>{t('common.save')}</button></div>
          </div>
        </div>
      )}
    </Shell>
  )
}
