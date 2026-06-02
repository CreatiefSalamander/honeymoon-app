'use client'
import { createContext, useContext, useState, useEffect } from 'react'

// ── Trip Context — persiste through hele app ──────────────────────────────────
// Slaat op: huidig verblijf (hotel), huidige locatie (GPS), reisinfo
const TripCtx = createContext({
  hotel: null, setHotel: () => {},
  currentLocation: null,
  tripName: 'Onze huwelijksreis',
  user: 'abdul', setUser: () => {},
  destination: '',
})

export function TripProvider({ children }) {
  const [hotel, setHotelState] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [user, setUserState] = useState('abdul')

  useEffect(() => {
    // Laad opgeslagen hotel
    try {
      const h = localStorage.getItem('honeymoon_hotel')
      if (h) setHotelState(JSON.parse(h))
    } catch {}
    // Laad gebruiker
    const u = localStorage.getItem('honeymoon_user') || 'abdul'
    setUserState(u)
    // GPS-locatie ophalen en bijhouden
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        pos => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => {},
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      )
      return () => navigator.geolocation.clearWatch(id)
    }
  }, [])

  function setHotel(h) {
    setHotelState(h)
    if (h) localStorage.setItem('honeymoon_hotel', JSON.stringify(h))
    else localStorage.removeItem('honeymoon_hotel')
  }

  function setUser(u) {
    setUserState(u)
    localStorage.setItem('honeymoon_user', u)
  }

  const destination = hotel?.name || hotel?.city || ''

  return (
    <TripCtx.Provider value={{ hotel, setHotel, currentLocation, user, setUser, destination, tripName: 'Abdul & Lilia' }}>
      {children}
    </TripCtx.Provider>
  )
}

export function useTrip() {
  return useContext(TripCtx)
}

// Haversine afstand in km
export function afstand(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10
}

// Looptijd schatting (gemiddeld 5km/u)
export function looptijd(km) {
  if (!km) return null
  const min = Math.round(km / 5 * 60)
  if (min < 60) return `${min} min lopen`
  return `${Math.floor(min/60)}u ${min%60}min`
}
