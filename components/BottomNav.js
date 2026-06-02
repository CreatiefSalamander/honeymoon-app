'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLanguage, TALEN } from '@/lib/i18n'

// Professionele SVG-iconen (geen emoji)
const Icons = {
  home:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  map:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  compass:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>,
  cal:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  budget: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  bell:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  heart:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  gear:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  globe:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  diary:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
  check:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  plane:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  weather:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>,
}

const MAIN_TABS = [
  { href:'/',         icon:'home',    labelKey:'thuis'   },
  { href:'/reis',     icon:'map',     labelKey:'reis'    },
  { href:'/ontdek',   icon:'compass', labelKey:'ontdek'  },
  { href:'/agenda',   icon:'cal',     labelKey:'agenda'  },
  { href:'/budget',   icon:'budget',  labelKey:'budget'  },
]

const SIDEBAR_TABS = [
  { href:'/dagboek',      icon:'diary',   labelKey:'dagboek'      },
  { href:'/lijsten',      icon:'check',   labelKey:'lijsten'      },
  { href:'/favorieten',   icon:'heart',   labelKey:'favorieten'   },
  { href:'/meldingen',    icon:'bell',    labelKey:'meldingen'    },
  { href:'/vluchten',     icon:'plane',   labelKey:'vluchten'     },
  { href:'/weer',         icon:'weather', labelKey:'weer'         },
  { href:'/instellingen', icon:'gear',    labelKey:'instellingen' },
]

function NavIcon({ name, size = 22 }) {
  return <span style={{ width: size, height: size, display: 'inline-flex' }}>{Icons[name]}</span>
}

function TaalModal({ onClose }) {
  const { lang, setLang } = useLanguage()
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <h2 className="serif" style={{ fontSize:'1.2rem', fontWeight:700, marginBottom:20 }}>Taal / Language</h2>
        {TALEN.map(tl => (
          <button key={tl.code} onClick={() => { setLang(tl.code); onClose() }}
                  className="btn btn-ghost" style={{ width:'100%', justifyContent:'flex-start', marginBottom:8, padding:'12px 16px' }}>
            <span style={{ fontSize:'1.4rem', marginRight:12 }}>{tl.vlag}</span>
            <span style={{ flex:1, textAlign:'left', fontWeight:500 }}>{tl.naam}</span>
            {lang === tl.code && <span style={{ color:'var(--gold)', fontWeight:700 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Sidebar({ currentUser }) {
  const pathname = usePathname()
  const { t, lang } = useLanguage()
  const [showTaal, setShowTaal] = useState(false)
  const taalInfo = TALEN.find(l => l.code === lang)

  return (
    <>
      <aside className="sidebar-nav hidden md:flex flex-col overflow-y-auto flex-shrink-0"
             style={{ width: 'var(--sidebar-w)', height: '100vh', position: 'sticky', top: 0 }}>
        {/* Logo */}
        <div style={{ padding: '28px 20px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,var(--rose),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'1rem', filter:'brightness(0) invert(1)' }}>💍</span>
            </div>
            <div>
              <p className="serif" style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text)', lineHeight:1.2 }}>Abdul &amp; Lilia</p>
              <p style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:1 }}>Huwelijksreis</p>
            </div>
          </div>
        </div>

        <div style={{ height:1, background:'var(--border)', margin:'0 16px 12px' }} />

        {/* Nav items */}
        <nav style={{ padding:'4px 10px', flex:1 }}>
          {[...MAIN_TABS, ...SIDEBAR_TABS].map(tab => {
            const active = pathname === tab.href
            return (
              <Link key={tab.href} href={tab.href}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'9px 12px', borderRadius:10, marginBottom:2,
                      textDecoration:'none',
                      background: active ? 'var(--gold-light)' : 'transparent',
                      color: active ? 'var(--gold)' : 'var(--text-soft)',
                      fontWeight: active ? 600 : 400,
                      fontSize: '0.84rem',
                      transition: 'all 0.12s ease',
                    }}>
                <span style={{ width:18, height:18, opacity: active ? 1 : 0.65 }}>
                  {Icons[tab.icon]}
                </span>
                <span>{t(tab.labelKey)}</span>
                {active && <span style={{ marginLeft:'auto', width:5, height:5, borderRadius:'50%', background:'var(--gold)' }} />}
              </Link>
            )
          })}
        </nav>

        {/* Taal + profiel */}
        <div style={{ padding:'12px 10px 20px', borderTop:'1px solid var(--border)' }}>
          <button onClick={() => setShowTaal(true)}
                  style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', borderRadius:10, background:'transparent', border:'none', cursor:'pointer', color:'var(--text-soft)', fontSize:'0.82rem' }}>
            <span style={{ fontSize:'1.1rem' }}>{taalInfo?.vlag}</span>
            <span>{taalInfo?.naam}</span>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', marginTop:4 }}>
            <span style={{ fontSize:'1.3rem' }}>{currentUser === 'lilia' ? '👰' : '🤵'}</span>
            <span style={{ fontSize:'0.82rem', fontWeight:500, textTransform:'capitalize', color:'var(--text)' }}>{currentUser}</span>
          </div>
        </div>
      </aside>
      {showTaal && <TaalModal onClose={() => setShowTaal(false)} />}
    </>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const { t, lang } = useLanguage()
  const [showTaal, setShowTaal] = useState(false)
  const taalInfo = TALEN.find(l => l.code === lang)

  return (
    <>
      <nav className="bottom-nav-bar md:hidden" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:40,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <div style={{ display:'flex', alignItems:'stretch', padding:'6px 4px 6px' }}>
          {MAIN_TABS.map(tab => {
            const active = pathname === tab.href
            return (
              <Link key={tab.href} href={tab.href} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 0', textDecoration:'none', position:'relative', color: active ? 'var(--gold)' : 'var(--text-muted)' }}>
                {active && (
                  <span style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:20, height:2, borderRadius:1, background:'var(--gold)' }} />
                )}
                <span style={{ width:22, height:22 }}>{Icons[tab.icon]}</span>
                <span style={{ fontSize:'0.62rem', fontWeight: active ? 600 : 400, letterSpacing:'0.01em' }}>
                  {t(tab.labelKey)}
                </span>
              </Link>
            )
          })}
          {/* Taal-knop */}
          <button onClick={() => setShowTaal(true)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 0', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
            <span style={{ width:22, height:22 }}>{Icons.globe}</span>
            <span style={{ fontSize:'0.62rem', fontWeight:400 }}>{taalInfo?.vlag}</span>
          </button>
          {/* Instellingen */}
          <Link href="/instellingen" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 0', textDecoration:'none', position:'relative', color: pathname === '/instellingen' ? 'var(--gold)' : 'var(--text-muted)' }}>
            {pathname === '/instellingen' && <span style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:20, height:2, borderRadius:1, background:'var(--gold)' }} />}
            <span style={{ width:22, height:22 }}>{Icons.gear}</span>
            <span style={{ fontSize:'0.62rem', fontWeight: pathname==='/instellingen' ? 600 : 400 }}>{t('instellingen')}</span>
          </Link>
        </div>
      </nav>
      {showTaal && <TaalModal onClose={() => setShowTaal(false)} />}
    </>
  )
}
