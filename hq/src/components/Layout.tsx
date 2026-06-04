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

// Volgorde voor swipe-navigatie tussen pagina's
const SWIPE_ORDER = ['/', '/agenda', '/explore', '/kaart', '/budget', '/chat', '/dagboek', '/favorieten', '/bucketlist', '/travel', '/vluchten', '/weer', '/packing', '/meldingen', '/profile', '/settings']

export default function Layout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false)
  const touch = useRef<{ x: number; y: number; inScroller: boolean } | null>(null)
  const loc = useLocation()
  const nav = useNavigate()

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    const inScroller = !!(e.target as HTMLElement).closest?.('.no-sb, input, textarea, .drawer')
    touch.current = { x: t.clientX, y: t.clientY, inScroller }
  }
  function onTouchEnd(e: React.TouchEvent) {
    const s = touch.current; touch.current = null
    if (!s) return
    const dx = e.changedTouches[0].clientX - s.x
    const dy = e.changedTouches[0].clientY - s.y
    // 1) Swipe vanaf linkerrand → menu openen
    if (s.x < 28 && dx > 55) { setDrawer(true); return }
    // 2) Horizontale swipe → vorige/volgende pagina (niet in horizontale scrollers/inputs)
    if (!s.inScroller && Math.abs(dx) > 80 && Math.abs(dy) < 55) {
      const i = SWIPE_ORDER.indexOf(loc.pathname)
      if (i === -1) return
      if (dx < 0 && i < SWIPE_ORDER.length - 1) { if ('vibrate' in navigator) navigator.vibrate(6); nav(SWIPE_ORDER[i + 1]) }
      else if (dx > 0 && i > 0) { if ('vibrate' in navigator) navigator.vibrate(6); nav(SWIPE_ORDER[i - 1]) }
    }
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
