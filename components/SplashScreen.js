'use client'
import { useState, useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2000)
    const t4 = setTimeout(() => onDone(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
         style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF8E7 100%)' }}>
      {/* Achtergrond harten */}
      {['💕','🌹','✨','💫','🌸'].map((e, i) => (
        <span key={i} className="fixed text-2xl pointer-events-none select-none"
              style={{
                left: `${10 + i * 20}%`,
                top: `${20 + (i % 3) * 20}%`,
                opacity: phase >= 2 ? 0.4 : 0,
                transform: `rotate(${-20 + i * 10}deg)`,
                transition: `opacity 0.8s ease ${i * 0.1}s`,
                fontSize: `${1.2 + (i % 3) * 0.6}rem`,
              }}>
          {e}
        </span>
      ))}

      <div className="text-center px-8">
        {/* Hart */}
        <div style={{
          fontSize: '4rem',
          transform: phase >= 1 ? 'scale(1)' : 'scale(0)',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          marginBottom: '24px',
        }}>
          💍
        </div>

        {/* Namen */}
        <h1 className="heading-playfair" style={{
          fontSize: '2.5rem',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
          background: 'linear-gradient(135deg, #E8A4B8, #D4AF37)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.2,
        }}>
          Abdul<br />&amp; Lilia
        </h1>

        {/* Subtitel */}
        <p className="heading-italic mt-3" style={{
          color: '#9B8080',
          fontSize: '1rem',
          opacity: phase >= 3 ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          Onze huwelijksreis ✨
        </p>
      </div>

      {/* Laad indicator */}
      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: i === phase % 3 ? '#D4AF37' : 'rgba(212,175,55,0.3)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}
