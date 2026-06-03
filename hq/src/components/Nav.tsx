import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { LANGS, setLang } from '@/lib/i18n'

const Icon = {
  home: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  agenda: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  explore: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></svg>,
  budget: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  more: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
}

const MAIN = [
  { to: '/', key: 'nav.home', icon: 'home' },
  { to: '/agenda', key: 'nav.agenda', icon: 'agenda' },
  { to: '/explore', key: 'nav.explore', icon: 'explore' },
  { to: '/budget', key: 'nav.budget', icon: 'budget' },
]

const MORE = [
  { to: '/travel', key: 'more.travelPlan', icon: '✈️' },
  { to: '/packing', key: 'more.packing', icon: '🧳' },
  { to: '/bucketlist', key: 'more.bucketlist', icon: '🥾' },
  { to: '/chat', key: 'more.chat', icon: '💬' },
  { to: '/settings', key: 'more.settings', icon: '⚙️' },
  { to: '/profile', key: 'more.profile', icon: '👤' },
]

export function MoreDrawer({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  function go(to: string) { nav(to); onClose() }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="s-head"><div className="s-title">{t('nav.more')}</div><button onClick={onClose} style={{ fontSize: 22, color: 'var(--ink-3)' }}>✕</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {MORE.map(m => (
            <button key={m.to} className="card" onClick={() => go(m.to)} style={{ padding: '16px 14px', textAlign: 'left' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t(m.key)}</div>
            </button>
          ))}
        </div>
        {/* Taal */}
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>🌐 {t('settings.language')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {LANGS.map(l => (
              <button key={l.code} className={`pill ${i18n.language === l.code ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setLang(l.code)}>{l.flag} {l.name}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const loc = useLocation()
  const all = [...MAIN, ...MORE]
  return (
    <aside className="sidebar">
      <div style={{ padding: '26px 20px 16px' }}>
        <div className="serif" style={{ fontStyle: 'italic', fontWeight: 600, fontSize: 22, color: 'var(--ocean-deep)' }}>Abdul &amp; Lilia</div>
        <div className="eyebrow" style={{ marginTop: 2 }}>Indonesia · 2026</div>
      </div>
      <nav style={{ padding: '4px 12px', flex: 1 }}>
        {all.map(item => {
          const on = loc.pathname === item.to
          return (
            <button key={item.to} onClick={() => nav(item.to)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '10px 12px', borderRadius: 12, marginBottom: 2, textAlign: 'left', color: on ? 'var(--ocean)' : 'var(--ink-2)', background: on ? 'var(--glass-2)' : 'transparent', fontWeight: on ? 600 : 400, fontSize: 14 }}>
              <span style={{ width: 20, display: 'inline-flex', justifyContent: 'center' }}>{(Icon as any)[item.icon] || item.icon}</span>
              {t(item.key)}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '12px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {LANGS.map(l => (
            <button key={l.code} className={`pill ${i18n.language === l.code ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '5px 4px' }} onClick={() => setLang(l.code)}>{l.flag}</button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default function BottomNav() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const loc = useLocation()
  const [more, setMore] = useState(false)
  function tap(to: string) { if ('vibrate' in navigator) navigator.vibrate(8); nav(to) }
  return (
    <>
      <div className="bnav">
        <div className="bnav-in">
          {MAIN.map(item => {
            const on = loc.pathname === item.to
            return (
              <button key={item.to} className={on ? 'on' : ''} onClick={() => tap(item.to)}>
                {(Icon as any)[item.icon]}<span className="lb">{t(item.key)}</span>
              </button>
            )
          })}
          <button className={['/travel','/packing','/bucketlist','/chat','/settings','/profile'].includes(loc.pathname) ? 'on' : ''} onClick={() => setMore(true)}>
            {Icon.more}<span className="lb">{t('nav.more')}</span>
          </button>
        </div>
      </div>
      {more && <MoreDrawer onClose={() => setMore(false)} />}
    </>
  )
}
