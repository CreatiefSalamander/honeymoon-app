// Server-side: valutakoersen via Frankfurter (gratis, geen sleutel nodig)
const CACHE = new Map()
const CACHE_TTL = 60 * 60 * 1000 // 1 uur

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const base = (searchParams.get('base') || 'EUR').toUpperCase()
  const symbols = searchParams.get('symbols') || 'USD,GBP,TRY,MAD,THB,JPY,AED,EGP'

  const cacheKey = `${base}-${symbols}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return Response.json(cached.data)
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${base}&to=${symbols}`
    )
    const raw = await res.json()
    if (!res.ok) return Response.json({ error: 'Koersen niet beschikbaar' }, { status: 502 })

    const data = { base: raw.base, date: raw.date, rates: raw.rates }
    CACHE.set(cacheKey, { data, time: Date.now() })
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
