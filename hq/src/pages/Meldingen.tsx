import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { getActivity, subscribeActivity } from '@/lib/supabase'

const ICON: Record<string, string> = { reis: '🗺️', foto: '📸', uitgave: '💸', budget: '💰', plek: '❤️', lijst: '✅', vlucht: '✈️', notitie: '📝', chat: '💬' }

function ago(ts: string) {
  const d = Date.now() - new Date(ts).getTime(); const m = Math.floor(d / 60000)
  if (m < 1) return 'nu'; if (m < 60) return m + 'm'; const h = Math.floor(m / 60); if (h < 24) return h + 'u'; return Math.floor(h / 24) + 'd'
}

export default function Meldingen() {
  const { t } = useTranslation()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivity().then((d: any[]) => { setItems(d); setLoading(false) })
    const sub = subscribeActivity((m: any) => setItems(p => [m, ...p]))
    return () => { try { (sub as any).unsubscribe() } catch {} }
  }, [])

  return (
    <Shell>
      <div className="s-head"><div className="s-title">Meldingen</div></div>
      {loading ? [1, 2, 3, 4].map(i => <div key={i} className="skel" style={{ height: 64, marginBottom: 8 }} />) :
        items.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>🔔</div>
            <p className="serif" style={{ fontSize: 18, marginTop: 8 }}>Nog geen activiteit</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Wat jij of Lilia toevoegt, verschijnt hier.</p>
          </div>
        ) : items.map((a, i) => (
          <div key={a.id || i} className="card" style={{ padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--glass-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ICON[a.type] || '✦'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: 'var(--text)' }}>{a.description}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.created_by === 'lilia' ? '👰 Lilia' : '🤵 Abdul'} · {ago(a.created_at)}</div>
            </div>
          </div>
        ))}
    </Shell>
  )
}
