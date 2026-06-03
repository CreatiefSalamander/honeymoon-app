import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { PACK_ITEMS, PACK_GROUPS } from '@/data/trip'
import { getChecks, setCheck } from '@/lib/supabase'

export default function Packing() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [checks, setChecks] = useState<Record<string, any>>({})
  const [openG, setOpenG] = useState<string | null>('docs')

  useEffect(() => setChecks(getChecks()), [])

  const allItems = Object.values(PACK_ITEMS).flat()
  const done = allItems.filter(i => checks[i.id]).length

  function toggle(id: string) { setCheck(id, !checks[id]); setChecks(getChecks()); if ('vibrate' in navigator) navigator.vibrate(8) }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('packing.title')}</div></div>
      <div className="card reveal" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}><span>{t('packing.progress', { x: done, y: allItems.length })}</span><span style={{ color: 'var(--gold)', fontWeight: 600 }}>{Math.round(done / allItems.length * 100)}%</span></div>
        <div className="prog"><i style={{ width: `${done / allItems.length * 100}%` }} /></div>
      </div>

      {PACK_GROUPS.map(g => {
        const items = PACK_ITEMS[g.key]
        const gDone = items.filter(i => checks[i.id]).length
        const isOpen = openG === g.key
        return (
          <div key={g.key} className="card reveal" style={{ marginBottom: 12, overflow: 'hidden' }}>
            <button onClick={() => setOpenG(isOpen ? null : g.key)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 20 }}>{g.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{t('packing.' + g.key)}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{gDone}/{items.length}</div>
              </div>
              <span style={{ color: 'var(--ink-3)' }}>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 16px 12px' }}>
                {items.map(it => {
                  const ck = !!checks[it.id]
                  const txt = lang === 'nl' ? it.nl : it.en
                  return (
                    <button key={it.id} onClick={() => toggle(it.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', textAlign: 'left', borderTop: '1px solid var(--line)' }}>
                      <span style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${ck ? 'var(--ocean)' : 'var(--line)'}`, background: ck ? 'var(--ocean)' : 'transparent', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ck ? '✓' : ''}</span>
                      <span style={{ fontSize: 13.5, color: ck ? 'var(--ink-3)' : 'var(--ink)', textDecoration: ck ? 'line-through' : 'none' }}>{txt}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </Shell>
  )
}
