'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLanguage, TALEN } from '@/lib/i18n'

const TABS = [
  { href: '/',         iconKey: '🏠', labelKey: 'thuis'    },
  { href: '/reis',     iconKey: '🗺️', labelKey: 'reis'     },
  { href: '/ontdek',   iconKey: '🧭', labelKey: 'ontdek'   },
  { href: '/agenda',   iconKey: '📅', labelKey: 'agenda'   },
  { href: '/budget',   iconKey: '💰', labelKey: 'budget'   },
]

const SIDEBAR_ITEMS = [
  { href: '/dagboek',      icon: '📸', labelKey: 'dagboek'      },
  { href: '/lijsten',      icon: '✅', labelKey: 'lijsten'      },
  { href: '/favorieten',   icon: '❤️', labelKey: 'favorieten'   },
  { href: '/meldingen',    icon: '🔔', labelKey: 'meldingen'    },
  { href: '/vluchten',     icon: '✈️', labelKey: 'reis'         },
  { href: '/weer',         icon: '⛅', labelKey: 'thuis'        },
  { href: '/instellingen', icon: '⚙️', labelKey: 'instellingen' },
]

function TaalKiezer({ onClose }) {
  const { lang, setLang } = useLanguage()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="sheet w-full max-w-sm mx-auto" onClick={e => e.stopPropagation()}>
        <h2 className="serif text-xl font-bold mb-4 text-center">🌐 Taal / Language</h2>
        <div className="flex flex-col gap-2">
          {TALEN.map(t => (
            <button key={t.code} onClick={() => { setLang(t.code); onClose() }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                    style={{
                      background: lang === t.code ? 'rgba(201,162,75,0.15)' : 'rgba(201,162,75,0.05)',
                      border: `1px solid ${lang === t.code ? 'rgba(201,162,75,0.4)' : 'transparent'}`,
                    }}>
              <span className="text-2xl">{t.vlag}</span>
              <div className="text-left">
                <p className="font-semibold text-sm" style={{ color: 'var(--brown)' }}>{t.naam}</p>
                <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>{t.code.toUpperCase()}</p>
              </div>
              {lang === t.code && <span className="ml-auto" style={{ color: 'var(--gold)' }}>✓</span>}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="btn-ghost w-full mt-4">
          Sluiten / Close
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ currentUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [showTaal, setShowTaal] = useState(false)
  const taalInfo = TALEN.find(l => l.code === lang)

  return (
    <>
      <aside className="hidden md:flex flex-col sidebar-width h-screen sticky top-0 border-r overflow-y-auto flex-shrink-0"
             style={{ background: 'rgba(251,246,239,0.96)', backdropFilter: 'blur(20px)', borderColor: 'var(--gold-line)' }}>
        <div className="px-6 pt-8 pb-5">
          <h1 className="serif text-xl font-bold gold-text">Abdul &amp; Lilia</h1>
          <p className="text-xs serif-italic mt-0.5" style={{ color: 'var(--brown-soft)' }}>Onze huwelijksreis 💍</p>
        </div>
        <div className="gold-line mx-6" />
        <nav className="px-3 py-4 flex flex-col gap-1 flex-1">
          {[...TABS, ...SIDEBAR_ITEMS].map(tab => {
            const active = pathname === tab.href
            return (
              <button key={tab.href} onClick={() => router.push(tab.href)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all duration-150 w-full"
                      style={{ background: active ? 'rgba(201,162,75,0.12)' : 'transparent', color: active ? 'var(--gold)' : 'var(--brown-soft)' }}>
                <span className="text-base w-5 text-center">{tab.iconKey || tab.icon}</span>
                <span className="font-medium text-sm">{t(tab.labelKey)}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto px-4 pb-6 pt-2 border-t" style={{ borderColor: 'var(--gold-line)' }}>
          <button onClick={() => setShowTaal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl w-full mb-2 transition-all"
                  style={{ background: 'rgba(201,162,75,0.08)', color: 'var(--brown-soft)' }}>
            <span className="text-lg">{taalInfo?.vlag}</span>
            <span className="text-sm font-medium">{taalInfo?.naam}</span>
          </button>
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="text-xl">{currentUser === 'lilia' ? '👰' : '🤵'}</span>
            <div>
              <p className="text-sm font-semibold capitalize" style={{ color: 'var(--brown)' }}>{currentUser || '—'}</p>
              <button onClick={() => router.push('/instellingen')} className="text-xs" style={{ color: 'var(--gold)' }}>
                {t('instellingen')}
              </button>
            </div>
          </div>
        </div>
      </aside>
      {showTaal && <TaalKiezer onClose={() => setShowTaal(false)} />}
    </>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [showTaal, setShowTaal] = useState(false)
  const taalInfo = TALEN.find(l => l.code === lang)

  function go(href) {
    if ('vibrate' in navigator) navigator.vibrate(8)
    router.push(href)
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
           style={{ background: 'rgba(251,246,239,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(201,162,75,0.2)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
          {TABS.map(tab => {
            const active = pathname === tab.href
            return (
              <button key={tab.href} onClick={() => go(tab.href)}
                      className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl flex-1 transition-all active:scale-90 relative"
                      style={{ background: active ? 'rgba(201,162,75,0.1)' : 'transparent' }}>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: 'var(--gold)' }} />}
                <span className="text-base leading-none">{tab.iconKey}</span>
                <span className="text-[9px] font-medium leading-none" style={{ color: active ? 'var(--gold)' : 'var(--brown-soft)' }}>
                  {t(tab.labelKey)}
                </span>
              </button>
            )
          })}
          {/* Taal-icoon */}
          <button onClick={() => setShowTaal(true)}
                  className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl flex-1 transition-all active:scale-90"
                  style={{ background: 'transparent' }}>
            <span className="text-base leading-none">{taalInfo?.vlag || '🌐'}</span>
            <span className="text-[9px] font-medium leading-none" style={{ color: 'var(--brown-soft)' }}>
              {lang.toUpperCase()}
            </span>
          </button>
          {/* Instellingen icoon */}
          <button onClick={() => go('/instellingen')}
                  className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl flex-1 transition-all active:scale-90"
                  style={{ background: pathname === '/instellingen' ? 'rgba(201,162,75,0.1)' : 'transparent' }}>
            {pathname === '/instellingen' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: 'var(--gold)' }} />}
            <span className="text-base leading-none">⚙️</span>
            <span className="text-[9px] font-medium leading-none" style={{ color: pathname === '/instellingen' ? 'var(--gold)' : 'var(--brown-soft)' }}>
              {t('instellingen')}
            </span>
          </button>
        </div>
      </nav>
      {showTaal && <TaalKiezer onClose={() => setShowTaal(false)} />}
    </>
  )
}
