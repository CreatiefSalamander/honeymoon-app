'use client'
import { useState, useEffect } from 'react'

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${3 + Math.random() * 2}s`,
    color: ['#E8A4B8', '#D4AF37', '#FFF0F5', '#F5C0D0', '#F0D060'][Math.floor(Math.random() * 5)],
    size: `${6 + Math.random() * 8}px`,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece absolute"
             style={{
               left: p.left,
               top: '-20px',
               background: p.color,
               width: p.size,
               height: p.size,
               borderRadius: Math.random() > 0.5 ? '50%' : '2px',
               animationDuration: p.duration,
               animationDelay: p.delay,
             }} />
      ))}
    </div>
  )
}

export default function CountdownTimer({ targetDate, onEdit, currentUser }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const [married, setMarried] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!targetDate) return

    function calculate() {
      const now = new Date()
      const target = new Date(targetDate)
      const diff = target - now

      if (diff <= 0) {
        setMarried(true)
        setShowConfetti(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!targetDate || !timeLeft) {
    return (
      <div className="glass-card p-6 text-center">
        <p style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>
          Datum nog niet ingesteld
        </p>
        {currentUser === 'abdul' && (
          <button onClick={onEdit} className="btn-gold mt-3 text-sm px-4 py-2">
            Datum instellen
          </button>
        )}
      </div>
    )
  }

  if (married) {
    return (
      <>
        {showConfetti && <Confetti />}
        <div className="glass-card p-8 text-center" style={{ borderColor: 'rgba(212,175,55,0.4)' }}>
          <div className="text-6xl mb-4 heart-beat">💍</div>
          <h2 className="heading-playfair text-2xl mb-2"
              style={{ background: 'linear-gradient(135deg, #E8A4B8, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Jullie zijn getrouwd!
          </h2>
          <p className="heading-italic" style={{ color: '#9B8080' }}>
            Voor altijd samen 💕
          </p>
        </div>
      </>
    )
  }

  const blocks = [
    { value: timeLeft.days,    label: 'Dagen' },
    { value: timeLeft.hours,   label: 'Uren' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ]

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-playfair text-lg" style={{ color: '#3D2B1F' }}>
          Nog tot de grote dag
        </h2>
        {currentUser === 'abdul' && (
          <button onClick={onEdit} className="text-lg opacity-60 active:opacity-100 transition-opacity">
            ✏️
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {blocks.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="glass-card-sm py-3 mb-1 animate-pulse-soft"
                 style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
              <span className="heading-playfair text-2xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #E8A4B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider"
                  style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="gold-line mt-4" />
      <p className="text-center text-sm mt-3 heading-italic" style={{ color: '#9B8080' }}>
        {new Date(targetDate).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  )
}
