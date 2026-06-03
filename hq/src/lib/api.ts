// Frontend → Netlify Functions (alle secrets blijven server-side)
const BASE = '/.netlify/functions'

async function post(fn: string, body: unknown) {
  const res = await fetch(`${BASE}/${fn}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => 'fout'))
  return res.json()
}
async function get(fn: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/${fn}?${qs}`)
  if (!res.ok) throw new Error(await res.text().catch(() => 'fout'))
  return res.json()
}

export const api = {
  chat: (messages: any[], system?: string) => post('claude', { messages, system }),
  places: (body: { lat?: number; lng?: number; query?: string; type?: string; radius?: number }) => post('places', body),
  placePhoto: (name: string, w = 800) => `${BASE}/place-photo?name=${encodeURIComponent(name)}&w=${w}`,
  weather: (lat: number, lng: number) => get('weather', { lat: String(lat), lng: String(lng) }),
  webInfo: (place: string) => post('web-info', { place }),
}
