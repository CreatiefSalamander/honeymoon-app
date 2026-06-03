import { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BottomNav, { Sidebar } from './Nav'
import { onToasts } from '@/lib/notify'

function Toaster() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])
  useEffect(() => onToasts(setToasts), [])
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </div>
  )
}

function FAB() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const actions = [
    { icon: '📍', label: t('home.fab.nearby'), go: '/explore' },
    { icon: '➕', label: t('home.fab.add'), go: '/agenda' },
    { icon: '💬', label: t('home.fab.ai'), go: '/chat' },
  ]
  return (
    <>
      {open && (
        <div className="overlay" style={{ alignItems: 'flex-end', background: 'rgba(20,30,45,.3)' }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'calc(var(--nav-h) + 80px)', marginRight: 18, alignItems: 'flex-end', width: '100%', maxWidth: 560, paddingRight: 4 }}>
            {actions.map(a => (
              <button key={a.go} className="glass" style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14 }}
                onClick={() => { setOpen(false); nav(a.go) }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button className="fab" onClick={() => setOpen(o => !o)} aria-label="Acties">{open ? '✕' : '✦'}</button>
    </>
  )
}

export default function Shell({ children, fab = true }: { children: ReactNode; fab?: boolean }) {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="page">{children}</div>
      </main>
      <BottomNav />
      {fab && <FAB />}
      <Toaster />
    </div>
  )
}
