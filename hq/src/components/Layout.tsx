import { ReactNode, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopBar, Drawer } from './Nav'
import { onToasts } from '@/lib/notify'

function Toaster() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])
  useEffect(() => onToasts(setToasts), [])
  return <div className="toast-wrap">{toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}</div>
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
        <div className="overlay" style={{ background: 'rgba(5,12,24,.4)', alignItems: 'flex-end' }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', padding: '0 18px 88px', width: '100%' }}>
            {actions.map(a => (
              <button key={a.go} className="glass" style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14 }} onClick={() => { setOpen(false); nav(a.go) }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button className="fab" onClick={() => setOpen(o => !o)} aria-label="AI & acties">{open ? '✕' : '✦'}</button>
    </>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false)
  const touchX = useRef<number | null>(null)
  const loc = useLocation()

  // Swipe vanaf linkerrand opent het menu
  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current != null && touchX.current < 28 && e.changedTouches[0].clientX - touchX.current > 60) setDrawer(true)
    touchX.current = null
  }

  return (
    <div className="app-bg">
      <div className="frame" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <TopBar onMenu={() => setDrawer(true)} />
        <div className="scroll no-sb" id="scroll">{children}</div>
        {loc.pathname !== '/chat' && <FAB />}
        <Drawer open={drawer} onClose={() => setDrawer(false)} />
        <Toaster />
      </div>
    </div>
  )
}
