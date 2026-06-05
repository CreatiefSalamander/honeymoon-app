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
      style={{ background: '#0a1628' }}>

      {[0,1,2,3,4].map((i) => (
        <span key={i} className="fixed pointer-events-none select-none"
          style={{
            left: `${10 + i * 20}%`,
            top: `${15 + (i % 3) * 22}%`,
            opacity: phase >= 2 ? 0.25 : 0,
            transition: `opacity 0.8s ease ${i * 0.1}s`,
            fontSize: `${0.8 + (i % 3) * 0.4}rem`,
            color: i % 2 === 0 ? '#c9a84c' : '#4ecdc4',
          }}>
          {i % 2 === 0 ? '✦' : '✧'}
        </span>
      ))}

      <div className="text-center px-8">
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a84c, #4ecdc4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 0 40px rgba(201,168,76,0.35), 0 0 80px rgba(78,205,196,0.15)',
          transform: phase >= 1 ? 'scale(1)' : 'scale(0)',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <span style={{ fontSize: '2rem', filter: 'brightness(0) invert(1)' }}>💍</span>
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '2.8rem', fontWeight: 600, color: '#f0ece4',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
          lineHeight: 1.2, letterSpacing: '0.02em',
        }}>
          Abdul<br />&amp; Lilia
        </h1>

        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic',
          color: '#8a9ab5', fontSize: '1rem', marginTop: 12,
          opacity: phase >= 3 ? 1 : 0, transition: 'opacity 0.5s ease',
          letterSpacing: '0.05em',
        }}>
          Onze huwelijksreis ✨
        </p>
      </div>

      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i === phase % 3 ? '#c9a84c' : 'rgba(201,168,76,0.25)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}
