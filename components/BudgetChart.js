'use client'
import { useEffect, useRef } from 'react'

const CATEGORY_COLORS = {
  'Hotel':       '#E8A4B8',
  'Vlucht':      '#D4AF37',
  'Eten':        '#F5C0D0',
  'Activiteiten':'#B8960C',
  'Shopping':    '#F0D060',
  'Transport':   '#C8A8B0',
  'Overig':      '#E0C880',
}

const CATEGORY_ICONS = {
  'Hotel':       '🏨',
  'Vlucht':      '✈️',
  'Eten':        '🍽️',
  'Activiteiten':'🎭',
  'Shopping':    '🛍️',
  'Transport':   '🚕',
  'Overig':      '🎁',
}

export function PieChart({ expenses }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || expenses.length === 0) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 10

    const totals = {}
    for (const e of expenses) {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount)
    }
    const total = Object.values(totals).reduce((a, b) => a + b, 0)
    if (total === 0) return

    ctx.clearRect(0, 0, size, size)
    let startAngle = -Math.PI / 2

    for (const [cat, amount] of Object.entries(totals)) {
      const slice = (amount / total) * 2 * Math.PI
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, startAngle + slice)
      ctx.closePath()
      ctx.fillStyle = CATEGORY_COLORS[cat] || '#ccc'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,248,240,0.8)'
      ctx.lineWidth = 2
      ctx.stroke()
      startAngle += slice
    }

    // Gat in het midden (donut)
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.55, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255,248,240,0.95)'
    ctx.fill()
  }, [expenses])

  return <canvas ref={canvasRef} width={160} height={160} />
}

export function CategoryBreakdown({ expenses, currency }) {
  const totals = {}
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount)
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1])
  const total = Object.values(totals).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([cat, amount]) => (
        <div key={cat} className="flex items-center gap-2">
          <span className="text-base w-6">{CATEGORY_ICONS[cat] || '🎁'}</span>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ fontFamily: 'DM Sans', color: '#3D2B1F' }}>{cat}</span>
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>
                {currency} {amount.toFixed(2)}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"
                   style={{
                     width: `${(amount / total) * 100}%`,
                     background: CATEGORY_COLORS[cat] || '#D4AF37',
                   }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { CATEGORY_ICONS, CATEGORY_COLORS }
