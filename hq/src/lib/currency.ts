// EUR ↔ IDR wisselkoers via gratis Frankfurter API, met cache
const CACHE_KEY = 'hq_fx'
const TTL = 6 * 60 * 60 * 1000 // 6 uur

export async function getRate(from = 'EUR', to = 'IDR'): Promise<number> {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    if (cached && cached.from === from && cached.to === to && Date.now() - cached.ts < TTL) return cached.rate
  } catch {}
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`)
    const data = await res.json()
    const rate = data.rates?.[to]
    if (rate) { localStorage.setItem(CACHE_KEY, JSON.stringify({ from, to, rate, ts: Date.now() })); return rate }
  } catch {}
  // Fallback geschatte koers
  return from === 'EUR' && to === 'IDR' ? 17000 : 1
}

export function fmt(amount: number, currency = 'EUR') {
  const symbols: Record<string, string> = { EUR: '€', IDR: 'Rp', USD: '$', GBP: '£' }
  const s = symbols[currency] || currency + ' '
  return `${s}${Math.round(amount).toLocaleString('nl-NL')}`
}
