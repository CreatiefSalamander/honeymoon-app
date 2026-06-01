'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import SplashScreen from '@/components/SplashScreen'
import CountdownTimer from '@/components/CountdownTimer'
import { getCountdown, updateCountdown } from '@/lib/supabase'

const HEARTS = ['💕', '🌹', '💖', '✨', '🌸', '💫', '🦋', '🌺']

function FloatingHearts() {
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: HEARTS[i % HEARTS.length],
      left: `${8 + i * 12}%`,
      delay: `${i * 0.8}s`,
      duration: `${6 + (i % 3) * 2}s`,
      size: `${1 + (i % 3) * 0.4}rem`,
    }))
    setHearts(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map(h => (
        <span key={h.id} className="float-heart select-none"
              style={{
                left: h.left,
                bottom: '-2rem',
                fontSize: h.size,
                animationDuration: h.duration,
                animationDelay: h.delay,
              }}>
          {h.emoji}
        </span>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [splash, setSplash] = useState(true)
  const [user, setUser] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [showUserSelect, setShowUserSelect] = useState(false)
  const [showDateEdit, setShowDateEdit] = useState(false)
  const [editDate, setEditDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('honeymoon_user')
    if (saved) setUser(saved)
    else setShowUserSelect(true)
  }, [])

  useEffect(() => {
    async function load() {
      const data = await getCountdown()
      setCountdown(data)
      if (data?.wedding_date) setEditDate(data.wedding_date)
      setLoading(false)
    }
    load()
  }, [])

  function selectUser(name) {
    localStorage.setItem('honeymoon_user', name)
    setUser(name)
    setShowUserSelect(false)
    if ('vibrate' in navigator) navigator.vibrate([20, 50, 20])
  }

  async function saveDate() {
    if (!editDate) return
    const data = await updateCountdown(editDate)
    setCountdown(data)
    setShowDateEdit(false)
  }

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />

  return (
    <div className="min-h-dvh relative">
      <FloatingHearts />

      {/* Gebruiker selecteren */}
      {showUserSelect && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <h2 className="heading-playfair text-2xl text-center mb-2">Wie ben jij?</h2>
            <p className="heading-italic text-center mb-8" style={{ color: '#9B8080' }}>
              Kies je profiel om te beginnen 💕
            </p>
            <div className="flex gap-4">
              <button onClick={() => selectUser('abdul')}
                      className="flex-1 glass-card p-6 text-center active:scale-95 transition-transform">
                <div className="text-5xl mb-2">🤵</div>
                <p className="heading-playfair font-bold text-lg">Abdul</p>
              </button>
              <button onClick={() => selectUser('lilia')}
                      className="flex-1 glass-card p-6 text-center active:scale-95 transition-transform">
                <div className="text-5xl mb-2">👰</div>
                <p className="heading-playfair font-bold text-lg">Lilia</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datum bewerken (alleen Abdul) */}
      {showDateEdit && (
        <div className="modal-overlay" onClick={() => setShowDateEdit(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="heading-playfair text-xl mb-4">Huwelijksdatum instellen</h2>
            <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                   className="input-field mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowDateEdit(false)}
                      className="flex-1 py-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', color: '#9B8080' }}>
                Annuleer
              </button>
              <button onClick={saveDate} className="flex-1 btn-gold py-3">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="page-content px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div>
            <h1 className="heading-playfair text-xl"
                style={{ background: 'linear-gradient(135deg, #E8A4B8, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Abdul &amp; Lilia 💍
            </h1>
            <p className="text-xs heading-italic" style={{ color: '#9B8080' }}>
              Onze huwelijksreis
            </p>
          </div>
          {user && (
            <button onClick={() => setShowUserSelect(true)}
                    className="glass-card-sm px-3 py-2 flex items-center gap-2 active:scale-95 transition-transform">
              <span className="text-lg">{user === 'lilia' ? '👰' : '🤵'}</span>
              <span className="text-xs font-medium capitalize"
                    style={{ color: '#3D2B1F', fontFamily: 'DM Sans' }}>
                {user}
              </span>
            </button>
          )}
        </div>

        <div className="gold-line mb-6" />

        {/* Countdown */}
        {loading ? (
          <div className="skeleton h-48 mb-4" />
        ) : (
          <CountdownTimer
            targetDate={countdown?.wedding_date}
            currentUser={user}
            onEdit={() => setShowDateEdit(true)}
          />
        )}

        {/* Snelle acties */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { href: '/reis',     icon: '🗺️', title: 'Reisplanning',    sub: 'Ons itinerary' },
            { href: '/fotos',    icon: '📸', title: "Foto's",           sub: 'Herinneringen' },
            { href: '/notities', icon: '📝', title: 'Notities',         sub: 'Gedeeld notitieblok' },
            { href: '/meer',     icon: '💰', title: 'Budget',           sub: 'Uitgaven bijhouden' },
          ].map(item => (
            <a key={item.href} href={item.href}
               className="glass-card-sm p-4 flex flex-col gap-1 active:scale-95 transition-transform no-underline">
              <span className="text-2xl">{item.icon}</span>
              <p className="font-semibold text-sm" style={{ color: '#3D2B1F', fontFamily: 'DM Sans' }}>
                {item.title}
              </p>
              <p className="text-xs" style={{ color: '#9B8080' }}>{item.sub}</p>
            </a>
          ))}
        </div>

        {/* Romantische quote */}
        <div className="glass-card p-5 mt-4 text-center">
          <p className="heading-italic text-base" style={{ color: '#9B8080' }}>
            "Niet waarheen je reist, maar met wie."
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(212,175,55,0.7)', fontFamily: 'DM Sans' }}>
            — Voor altijd samen 💕
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
