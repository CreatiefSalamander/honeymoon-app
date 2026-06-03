// ══════════════════════════════════════════════════════════════
//  GEO — platform-geïsoleerd (Fase 2: vervang door Capacitor Geolocation)
//  Schrijft laatst bekende locatie naar Supabase wanneer de app open is.
// ══════════════════════════════════════════════════════════════
import { supabase, hasSupabase } from './supabase'

export type Coords = { lat: number; lng: number; ts: number }

export function getCurrentLocation(): Promise<Coords | null> {
  return new Promise(resolve => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    )
  })
}

// Schrijf locatie naar Supabase (gebruikt door scheduled-engine voor suggesties)
export async function pushLocation(phone: string, c: Coords) {
  localStorage.setItem('hq_location', JSON.stringify(c))
  if (!hasSupabase) return
  try {
    await supabase.from('phone_location').upsert(
      { phone, lat: c.lat, lng: c.lng, updated_at: new Date(c.ts).toISOString() },
      { onConflict: 'phone' }
    )
  } catch {}
}

export function getCachedLocation(): Coords | null {
  try { const v = localStorage.getItem('hq_location'); return v ? JSON.parse(v) : null } catch { return null }
}

// Haversine afstand (km)
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10
}
