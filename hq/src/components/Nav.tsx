import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { LANGS, setLang } from '@/lib/i18n'
import { useTrip } from '@/lib/store'
import { DESTINATIONS, ACTIVITIES } from '@/data/trip'

const I = (p: string) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: p }} />
const ICONS: Record<string, JSX.Element> = {
  '/': I('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  '/agenda': I('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  '/explore': I('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/>'),
  '/budget': I('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'),
  '/bucketlist': I('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>'),
  '/travel': I('<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>'),
  '/packing': I('<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>'),
  '/chat': I('<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>'),
  '/settings': I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>'),
  '/profile': I('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  '/dagboek': I('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
  '/meldingen': I('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>'),
  '/favorieten': I('<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/>'),
  '/weer': I('<path d="M18 10h-1.3A8 8 0 109 20h9a5 5 0 000-10z"/>'),
  '/vluchten': I('<path d="M17.8 19.8L9 15l-5 2v-2l4-2.5L2 9V7l6 1.5L12 3l1.5.5L11 9l5 1.5 3-3 1.5.5-2 4 1.8 6.8z"/>'),
}

const MENU = [
  { to: '/', key: 'nav.home' },
  { to: '/agenda', key: 'nav.agenda' },
  { to: '/explore', key: 'nav.explore', thumb: ACTIVITIES.find(a => a.id === 'snorkel')?.img },
  { to: '/kaart', key: 'nav.explore', label: 'Kaart (live)', thumb: DESTINATIONS[1]?.img },
  { to: '/budget', key: 'nav.budget' },
  { to: '/chat', key: 'more.chat' },
  { to: '/dagboek', key: 'more.profile', label: 'Dagboek', thumb: ACTIVITIES.find(a => a.id === 'dinner')?.img },
  { to: '/favorieten', key: 'more.bucketlist', label: 'Favorieten' },
  { to: '/bucketlist', key: 'more.bucketlist', thumb: ACTIVITIES.find(a => a.id === 'skydive')?.img },
  { to: '/travel', key: 'more.travelPlan', thumb: DESTINATIONS[0]?.img },
  { to: '/vluchten', key: 'nav.explore', label: 'Vluchten' },
  { to: '/weer', key: 'nav.home', label: 'Weer' },
  { to: '/packing', key: 'more.packing' },
  { to: '/meldingen', key: 'more.profile', label: 'Meldingen' },
  { to: '/profile', key: 'more.profile' },
  { to: '/settings', key: 'more.settings' },
]

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="topbar">
      <button className="menu-btn" onClick={onMenu} aria-label="Menu">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="19" y2="18" /></svg>
      </button>
      <div className="tb-title">
        <div className="t">Abdul &amp; Lilia ✦</div>
        <div className="s">Indonesia · 2026</div>
      </div>
    </div>
  )
}

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const { phone, logout } = useTrip()
  const nav = useNavigate()
  const loc = useLocation()
  function go(to: string) { if ('vibrate' in navigator) navigator.vibrate(8); nav(to); onClose() }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-overlay" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }} />
          <motion.div className="drawer no-sb"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
            <div className="drawer-head">
              <div className="drawer-avatar">{phone === 'lilia' ? '👰' : '🤵'}</div>
              <div>
                <div className="serif" style={{ fontStyle: 'italic', fontWeight: 600, fontSize: 19, color: 'var(--text)' }}>Abdul &amp; Lilia</div>
                <div className="eyebrow">{t('appTagline').split('·')[0]}</div>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 20 }}>✕</button>
            </div>
            <div className="hr" style={{ margin: '4px 0 8px' }} />
            <nav style={{ flex: 1 }}>
              {MENU.map(m => {
                const on = loc.pathname === m.to
                return (
                  <button key={m.to} className={`drawer-item ${on ? 'on' : ''}`} onClick={() => go(m.to)} style={{ width: '100%', textAlign: 'left', marginBottom: 2 }}>
                    {m.thumb ? <img className="thumb" src={m.thumb} alt="" /> : <span className="ico">{ICONS[m.to]}</span>}
                    <span style={{ fontSize: 15, fontWeight: on ? 600 : 500 }}>{(m as any).label || t(m.key)}</span>
                  </button>
                )
              })}
            </nav>
            <div className="hr" />
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {LANGS.map(l => (
                <button key={l.code} className={`pill ${i18n.language === l.code ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setLang(l.code)}>{l.flag}</button>
              ))}
            </div>
            <button onClick={() => { onClose(); logout() }} className="drawer-item" style={{ width: '100%', color: 'var(--bad)' }}>
              <span className="ico">↩</span><span style={{ fontSize: 14 }}>{t('settings.uitloggen') !== 'settings.uitloggen' ? t('settings.uitloggen') : 'Wissel profiel'}</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
