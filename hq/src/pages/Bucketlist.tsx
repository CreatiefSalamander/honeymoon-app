import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { BUCKET_SEED, IMAGES } from '@/data/trip'
import { getChecks, setCheck } from '@/lib/supabase'

function confettiBurst() {
  if (document.documentElement.getAttribute('data-anim') === 'off') return
  const colors = ['#C2922F', '#E9C97A', '#2E7DAA', '#4ECDC4', '#fff']
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-bit'
    el.style.left = Math.random() * 100 + 'vw'; el.style.top = '-12px'
    el.style.width = el.style.height = 6 + Math.random() * 6 + 'px'
    el.style.background = colors[i % colors.length]
    el.style.borderRadius = Math.random() > .5 ? '50%' : '2px'
    el.style.animationDuration = 1.8 + Math.random() * 1.6 + 's'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 3600)
  }
}

export default function Bucketlist() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const lang = i18n.language
  const [checks, setChecks] = useState<Record<string, any>>({})
  const [custom, setCustom] = useState<{ id: string; text: any; cat: string }[]>([])
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    setChecks(getChecks())
    try { const c = localStorage.getItem('hq_bucket_custom'); if (c) setCustom(JSON.parse(c)) } catch {}
  }, [])

  const all = [...BUCKET_SEED, ...custom]
  const done = all.filter(i => checks[i.id]?.done).length

  function toggle(id: string) {
    const wasDone = checks[id]?.done
    const val = wasDone ? null : { done: true, doneAt: new Date().toISOString() }
    setCheck(id, val); setChecks(getChecks())
    if (!wasDone) { confettiBurst(); if ('vibrate' in navigator) navigator.vibrate([12, 30, 12]) }
  }
  function addCustom() {
    if (!newItem.trim()) return
    const item = { id: 'bl_c' + Date.now(), text: { en: newItem, nl: newItem, hy: newItem }, cat: 'other' }
    const next = [...custom, item]; setCustom(next); localStorage.setItem('hq_bucket_custom', JSON.stringify(next)); setNewItem('')
  }

  return (
    <Shell>
      <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 16, minHeight: 120 }}>
        <img src={IMAGES.coupleA} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .35 }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
        <div style={{ position: 'relative', padding: 20 }}>
          <div className="s-title">{t('bucketlist.title')}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{t('bucketlist.progress', { x: done, y: all.length })}</div>
          <div className="prog" style={{ marginTop: 10 }}><i style={{ width: `${all.length ? done / all.length * 100 : 0}%` }} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input className="input" placeholder={t('bucketlist.addItem')} value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} />
        <button className="btn btn-gold btn-sm" onClick={addCustom}>+</button>
      </div>

      {all.map(item => {
        const isDone = checks[item.id]?.done
        return (
          <div key={item.id} className="card reveal" style={{ padding: '13px 15px', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 12, ...(isDone ? { borderColor: 'var(--gold)' } : {}) }}>
            <button onClick={() => toggle(item.id)} style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${isDone ? 'var(--gold)' : 'var(--line)'}`, background: isDone ? 'var(--gold)' : 'transparent', color: '#fff', flexShrink: 0, fontSize: 13 }}>{isDone ? '✓' : ''}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--gold)' : 'var(--ink)' }}>{(item.text as any)[lang] || item.text.en}</div>
              {isDone && checks[item.id]?.doneAt && <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t('bucketlist.doneOn', { date: new Date(checks[item.id].doneAt).toLocaleDateString('nl-NL') })}</div>}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('/explore')}>🔎</button>
          </div>
        )
      })}
    </Shell>
  )
}
