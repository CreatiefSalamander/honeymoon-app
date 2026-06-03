import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCurrentLocation, pushLocation, getCachedLocation, Coords } from './geo'

export type Phone = 'abdul' | 'lilia'
export type Settings = {
  notifGlobal: boolean; reminders: '1h' | '30m' | 'both' | 'off'
  suggestEmpty: boolean; suggestFreq: '1h' | '2h' | '4h' | 'never'; maxPerDay: number
  nearbyAlerts: boolean; bucketAlerts: boolean; quietFrom: string; quietTo: string
  defaultRadius: number; defaultTransport: 'walk' | 'scooter' | 'boat'
  totalBudget: number; currency: 'EUR' | 'IDR'; animations: 'full' | 'reduced' | 'off'
  theme: 'light' | 'night'
}

const DEFAULT_SETTINGS: Settings = {
  notifGlobal: true, reminders: 'both', suggestEmpty: true, suggestFreq: '4h', maxPerDay: 5,
  nearbyAlerts: true, bucketAlerts: true, quietFrom: '22:00', quietTo: '08:00',
  defaultRadius: 5000, defaultTransport: 'scooter', totalBudget: 7000, currency: 'EUR',
  animations: 'full', theme: 'light',
}

type Ctx = {
  phone: Phone; setPhone: (p: Phone) => void
  hotel: string; setHotel: (h: string) => void
  location: Coords | null
  settings: Settings; updateSettings: (s: Partial<Settings>) => void
}
const TripCtx = createContext<Ctx>(null as any)

export function TripProvider({ children }: { children: ReactNode }) {
  const [phone, setPhoneState] = useState<Phone>('abdul')
  const [hotel, setHotelState] = useState('')
  const [location, setLocation] = useState<Coords | null>(getCachedLocation())
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const p = localStorage.getItem('hq_phone') as Phone | null
    if (p) setPhoneState(p)
    const h = localStorage.getItem('hq_hotel'); if (h) setHotelState(h)
    try { const s = localStorage.getItem('hq_settings'); if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) }) } catch {}
  }, [])

  // Thema + animaties toepassen
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
    document.documentElement.setAttribute('data-anim', settings.animations === 'off' ? 'off' : 'on')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', settings.theme === 'night' ? '#0A1628' : '#1A5C82')
  }, [settings.theme, settings.animations])

  // Locatie ophalen wanneer app opent (Fase 1: alleen bij open app)
  useEffect(() => {
    getCurrentLocation().then(c => { if (c) { setLocation(c); pushLocation(phone, c) } })
  }, [phone])

  function setPhone(p: Phone) { setPhoneState(p); localStorage.setItem('hq_phone', p) }
  function setHotel(h: string) { setHotelState(h); localStorage.setItem('hq_hotel', h) }
  function updateSettings(s: Partial<Settings>) {
    setSettings(prev => { const next = { ...prev, ...s }; localStorage.setItem('hq_settings', JSON.stringify(next)); return next })
  }

  return <TripCtx.Provider value={{ phone, setPhone, hotel, setHotel, location, settings, updateSettings }}>{children}</TripCtx.Provider>
}

export const useTrip = () => useContext(TripCtx)
