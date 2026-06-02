'use client'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  { href: '/',        icon: '🏠', label: 'Thuis' },
  { href: '/reis',    icon: '🗺️', label: 'Reis' },
  { href: '/ontdek',  icon: '🧭', label: 'Ontdek' },
  { href: '/dagboek', icon: '📸', label: 'Dagboek' },
  { href: '/budget',  icon: '💰', label: 'Budget' },
]

const SIDEBAR_EXTRA = [
  { href: '/lijsten',      icon: '✅', label: 'Lijsten' },
  { href: '/weer',         icon: '⛅', label: 'Weer' },
  { href: '/vluchten',     icon: '✈️', label: 'Vluchten zoeken' },
  { href: '/instellingen', icon: '⚙️', label: 'Instellingen' },
]

export function Sidebar({ currentUser }) {
  const pathname = usePathname()
  const router = useRouter()

  function nav(href) { router.push(href) }

  return (
    <aside className="hidden md:flex flex-col sidebar-width h-screen sticky top-0 border-r overflow-y-auto flex-shrink-0"
           style={{ background: 'rgba(251,246,239,0.96)', backdropFilter: 'blur(20px)', borderColor: 'var(--gold-line)' }}>
      {/* Logo */}
      <div className="px-6 pt-8 pb-5">
        <h1 className="serif text-xl font-bold gold-text">Abdul &amp; Lilia</h1>
        <p className="text-xs serif-italic mt-0.5" style={{ color: 'var(--brown-soft)' }}>Onze huwelijksreis 💍</p>
      </div>
      <div className="gold-line mx-6" />

      {/* Hoofd-navigatie */}
      <nav className="px-3 py-4 flex flex-col gap-1">
        {[...TABS, ...SIDEBAR_EXTRA].map(tab => {
          const active = pathname === tab.href
          return (
            <button key={tab.href} onClick={() => nav(tab.href)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all duration-150 w-full"
                    style={{
                      background: active ? 'rgba(201,162,75,0.12)' : 'transparent',
                      color: active ? 'var(--gold)' : 'var(--brown-soft)',
                    }}>
              <span className="text-base w-5 text-center">{tab.icon}</span>
              <span className="font-medium text-sm">{tab.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />}
            </button>
          )
        })}
      </nav>

      {/* Gebruiker onderaan */}
      <div className="mt-auto px-4 pb-6 pt-2 border-t" style={{ borderColor: 'var(--gold-line)' }}>
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="text-2xl">{currentUser === 'lilia' ? '👰' : '🤵'}</span>
          <div>
            <p className="text-sm font-semibold capitalize" style={{ color: 'var(--brown)' }}>{currentUser || '—'}</p>
            <button onClick={() => nav('/instellingen')} className="text-xs" style={{ color: 'var(--gold)' }}>Instellingen</button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  function handleTab(href) {
    if ('vibrate' in navigator) navigator.vibrate(8)
    router.push(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
         style={{
           background: 'rgba(251,246,239,0.95)',
           backdropFilter: 'blur(20px)',
           WebkitBackdropFilter: 'blur(20px)',
           borderTop: '1px solid rgba(201,162,75,0.2)',
           paddingBottom: 'env(safe-area-inset-bottom, 0px)',
         }}>
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
        {TABS.map(tab => {
          const active = pathname === tab.href
          return (
            <button key={tab.href} onClick={() => handleTab(tab.href)}
                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl flex-1 transition-all duration-150 active:scale-90 relative"
                    style={{ background: active ? 'rgba(201,162,75,0.1)' : 'transparent' }}>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                      style={{ background: 'var(--gold)' }} />
              )}
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="text-[9px] font-medium leading-none"
                    style={{ color: active ? 'var(--gold)' : 'var(--brown-soft)', fontFamily: 'DM Sans' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
        {/* Meer knop → Lijsten (meest gebruikt extra) */}
        <button onClick={() => handleTab('/lijsten')}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl flex-1 transition-all active:scale-90 relative"
                style={{ background: pathname === '/lijsten' ? 'rgba(201,162,75,0.1)' : 'transparent' }}>
          {pathname === '/lijsten' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: 'var(--gold)' }} />}
          <span className="text-base leading-none">✅</span>
          <span className="text-[9px] font-medium leading-none" style={{ color: pathname === '/lijsten' ? 'var(--gold)' : 'var(--brown-soft)', fontFamily: 'DM Sans' }}>Lijsten</span>
        </button>
      </div>
    </nav>
  )
}
