'use client'
import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  { href: '/',          icon: '🏠', label: 'Home' },
  { href: '/reis',      icon: '🗺️', label: 'Reis' },
  { href: '/fotos',     icon: '📸', label: "Foto's" },
  { href: '/notities',  icon: '📝', label: 'Notities' },
  { href: '/meer',      icon: '⚙️', label: 'Meer' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  function handleTab(href) {
    if ('vibrate' in navigator) navigator.vibrate(10)
    router.push(href)
  }

  return (
    <nav className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40"
         style={{ background: 'rgba(255,248,240,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(tab => {
          const active = pathname === tab.href
          return (
            <button
              key={tab.href}
              onClick={() => handleTab(tab.href)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 relative"
              style={active ? { background: 'rgba(232,164,184,0.15)' } : {}}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #D4AF37, #E8A4B8)' }} />
              )}
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium leading-none"
                    style={{ color: active ? '#D4AF37' : '#9B8080', fontFamily: 'DM Sans, sans-serif' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
