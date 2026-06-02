'use client'
import { useState, useEffect, useCallback } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'

function WeatherIcon({ icon, size = 48 }) {
  if (!icon) return null
  return <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="" style={{ width: size, height: size }} />
}

function formatTime(unix, tz) {
  if (!unix) return '—'
  return new Date((unix + tz) * 1000).toUTCString().slice(17, 22)
}

function WindRoos({ dir }) {
  const dirs = { N: 0, NO: 45, O: 90, ZO: 135, Z: 180, ZW: 225, W: 270, NW: 315 }
  const deg = dirs[dir] || 0
  return (
    <div className="flex items-center gap-1">
      <span style={{ display: 'inline-block', transform: `rotate(${deg}deg)`, fontSize: '1rem' }}>↑</span>
      <span>{dir}</span>
    </div>
  )
}

const POPULAIRE_STEDEN = [
  { naam: 'Istanbul', vlag: '🇹🇷' }, { naam: 'Dubai', vlag: '🇦🇪' },
  { naam: 'Barcelona', vlag: '🇪🇸' }, { naam: 'Marrakech', vlag: '🇲🇦' },
  { naam: 'Bali', vlag: '🇮🇩' }, { naam: 'Santorini', vlag: '🇬🇷' },
  { naam: 'Parijs', vlag: '🇫🇷' }, { naam: 'Rome', vlag: '🇮🇹' },
  { naam: 'Maldiven', vlag: '🇲🇻' }, { naam: 'Tokio', vlag: '🇯🇵' },
]

const KLEDING_TIPS = (temp) => {
  if (temp >= 30) return { icon: '☀️👙', tip: 'Licht zomers, zonnebrandcrème essentieel' }
  if (temp >= 24) return { icon: '😎👕', tip: 'Warm en aangenaam — t-shirt weer' }
  if (temp >= 18) return { icon: '🌤️👔', tip: 'Aangenaam — lichte jas voor de avond' }
  if (temp >= 10) return { icon: '🧥', tip: 'Fris — neem een jas mee' }
  return { icon: '🧤🧣', tip: 'Koud — warme kleding nodig' }
}

export default function WeerPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [weer, setWeer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [zoekInput, setZoekInput] = useState('')
  const [gpsUsed, setGpsUsed] = useState(false)
  const [missingKey, setMissingKey] = useState(false)

  const fetchWeer = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`/api/weather?${qs}`)
      const data = await res.json()
      if (data.missingKey) { setMissingKey(true); return }
      if (data.error) { setError(data.error); return }
      setWeer(data)
      setMissingKey(false)
    } catch (e) {
      setError('Verbindingsfout — probeer opnieuw')
    } finally {
      setLoading(false)
    }
  }, [])

  // GPS bij laden
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => { setGpsUsed(true); fetchWeer({ lat: pos.coords.latitude, lng: pos.coords.longitude }) },
        () => {},
        { timeout: 6000 }
      )
    }
  }, [fetchWeer])

  function handleZoek(e) {
    e.preventDefault()
    if (!zoekInput.trim()) return
    setGpsUsed(false)
    fetchWeer({ city: zoekInput.trim() })
  }

  function handleStad(stad) {
    setZoekInput(stad)
    setGpsUsed(false)
    fetchWeer({ city: stad })
  }

  const kleding = weer ? KLEDING_TIPS(weer.temp) : null

  const dagNamen = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">⛅ Weer</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
                {gpsUsed ? '📍 Jouw locatie' : 'Zoek een bestemming'}
              </p>
            </div>
            {weer && (
              <button onClick={() => { setGpsUsed(false); navigator.geolocation?.getCurrentPosition(pos => { setGpsUsed(true); fetchWeer({ lat: pos.coords.latitude, lng: pos.coords.longitude }) }) }}
                      className="btn-ghost text-xs px-3 py-1.5">📍 GPS</button>
            )}
          </div>

          {/* Zoekbalk */}
          <form onSubmit={handleZoek} className="flex gap-2 mb-4">
            <input value={zoekInput} onChange={e => setZoekInput(e.target.value)}
                   placeholder="Zoek stad of bestemming..."
                   className="input flex-1" />
            <button type="submit" className="btn-gold px-4">Zoek</button>
          </form>

          {/* Populaire steden */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {POPULAIRE_STEDEN.map(s => (
              <button key={s.naam} onClick={() => handleStad(s.naam)}
                      className={`chip flex-shrink-0 ${weer?.city?.toLowerCase() === s.naam.toLowerCase() ? 'active' : ''}`}>
                {s.vlag} {s.naam}
              </button>
            ))}
          </div>

          {/* API sleutel nodig */}
          {missingKey && (
            <div className="glass p-5 mb-4 text-center">
              <p className="text-3xl mb-3">🔑</p>
              <h3 className="serif font-semibold mb-2">OpenWeather sleutel nodig</h3>
              <p className="text-sm" style={{ color: 'var(--brown-soft)' }}>
                Voeg <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(201,162,75,0.15)' }}>OPENWEATHER_KEY</code> toe
                in Netlify → Site settings → Environment variables
              </p>
              <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" className="btn-gold inline-block mt-4 text-sm px-5 py-2">
                Gratis sleutel halen →
              </a>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              <div className="skeleton h-52 rounded-3xl" />
              <div className="skeleton h-32 rounded-3xl" />
              <div className="skeleton h-40 rounded-3xl" />
            </div>
          )}

          {/* Fout */}
          {error && !loading && (
            <div className="glass p-4 text-center">
              <p className="text-2xl mb-2">😕</p>
              <p className="font-semibold">{error}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--brown-soft)' }}>Controleer de plaatsnaam of probeer een andere stad</p>
            </div>
          )}

          {/* Weer data */}
          {!loading && !error && weer && (
            <>
              {/* Hoofd-kaart */}
              <div className="glass p-6 mb-4 text-center relative overflow-hidden">
                {/* Achtergrond kleur op basis van temp */}
                <div className="absolute inset-0 opacity-10 rounded-3xl"
                     style={{ background: weer.temp >= 25 ? 'linear-gradient(135deg,#ff9800,#ffeb3b)' : weer.temp >= 15 ? 'linear-gradient(135deg,#4CAF50,#8BC34A)' : 'linear-gradient(135deg,#2196F3,#90CAF9)' }} />

                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="serif font-bold text-xl" style={{ color: 'var(--brown)' }}>{weer.city}, {weer.country}</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-3">
                    <WeatherIcon icon={weer.icon} size={80} />
                    <div className="text-left">
                      <p className="serif font-bold" style={{ fontSize: '4rem', lineHeight: 1, color: 'var(--brown)' }}>{weer.temp}°</p>
                      <p className="text-sm capitalize" style={{ color: 'var(--brown-soft)' }}>{weer.description}</p>
                      <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>Voelt als {weer.feels}°</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 text-sm" style={{ color: 'var(--brown-soft)' }}>
                    <span>↑{weer.tempMax}°</span>
                    <span>↓{weer.tempMin}°</span>
                  </div>
                </div>
              </div>

              {/* Kleding-tip */}
              {kleding && (
                <div className="glass-sm p-3 mb-4 flex items-center gap-3">
                  <span className="text-2xl">{kleding.icon}</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Kleding-tip</p>
                    <p className="text-sm" style={{ color: 'var(--brown-soft)' }}>{kleding.tip}</p>
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="glass p-4 mb-4">
                <h3 className="serif font-semibold mb-3">Details</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '💧', label: 'Vochtigheid', val: `${weer.humidity}%` },
                    { icon: '💨', label: 'Wind', val: `${weer.wind} km/u` },
                    { icon: '🧭', label: 'Windrichting', val: <WindRoos dir={weer.windDir} /> },
                    { icon: '🌡️', label: 'Luchtdruk', val: `${weer.pressure} hPa` },
                    { icon: '👁️', label: 'Zicht', val: `${weer.visibility} km` },
                    { icon: '☁️', label: 'Bewolking', val: `${weer.clouds}%` },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="glass-sm p-3 text-center">
                      <p className="text-xl mb-1">{icon}</p>
                      <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>{label}</p>
                      <p className="font-semibold text-sm" style={{ color: 'var(--brown)' }}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Zon op/onder */}
                {weer.sunrise && (
                  <div className="flex justify-around mt-3 pt-3 border-t" style={{ borderColor: 'var(--gold-line)' }}>
                    <div className="text-center">
                      <p className="text-xl">🌅</p>
                      <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>Zonsopgang</p>
                      <p className="font-semibold text-sm">{formatTime(weer.sunrise, weer.timezone)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl">🌇</p>
                      <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>Zonsondergang</p>
                      <p className="font-semibold text-sm">{formatTime(weer.sunset, weer.timezone)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Uurlijkse forecast */}
              {weer.hourly?.length > 0 && (
                <div className="glass p-4 mb-4">
                  <h3 className="serif font-semibold mb-3">Vandaag per uur</h3>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {weer.hourly.map((h, i) => (
                      <div key={i} className="flex-shrink-0 text-center glass-sm p-2" style={{ minWidth: 60 }}>
                        <p className="text-xs" style={{ color: 'var(--brown-soft)' }}>
                          {new Date(h.time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <WeatherIcon icon={h.icon} size={36} />
                        <p className="font-bold text-sm">{h.temp}°</p>
                        {h.pop > 0 && <p className="text-xs" style={{ color: '#64B5F6' }}>💧{h.pop}%</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7-daagse forecast */}
              {weer.daily?.length > 0 && (
                <div className="glass p-4 mb-4">
                  <h3 className="serif font-semibold mb-3">7-daagse voorspelling</h3>
                  <div className="flex flex-col gap-2">
                    {weer.daily.map((d, i) => {
                      const datum = new Date(d.date)
                      const dagNaam = i === 0 ? 'Vandaag' : i === 1 ? 'Morgen' : dagNamen[datum.getDay()]
                      return (
                        <div key={d.date} className="flex items-center gap-3">
                          <p className="w-16 text-sm capitalize font-medium" style={{ color: 'var(--brown)' }}>{dagNaam}</p>
                          <WeatherIcon icon={d.icon} size={32} />
                          <p className="flex-1 text-xs capitalize" style={{ color: 'var(--brown-soft)' }}>{d.description}</p>
                          {d.pop > 10 && <span className="text-xs" style={{ color: '#64B5F6' }}>💧{d.pop}%</span>}
                          <div className="flex gap-2 text-sm font-semibold">
                            <span style={{ color: 'var(--rose)' }}>↑{d.tempMax}°</span>
                            <span style={{ color: 'var(--brown-soft)' }}>↓{d.tempMin}°</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Wind info */}
              {weer.windGust && (
                <div className="glass-sm p-3 mb-4 flex items-center gap-3">
                  <span className="text-2xl">💨</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Wind</p>
                    <p className="text-sm" style={{ color: 'var(--brown-soft)' }}>
                      {weer.wind} km/u uit het {weer.windDir} · windstoten tot {weer.windGust} km/u
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Lege staat (geen data, geen loading) */}
          {!loading && !error && !weer && !missingKey && (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🌍</p>
              <h3 className="serif text-xl mb-2">Zoek het weer op</h3>
              <p className="serif-italic text-sm" style={{ color: 'var(--brown-soft)' }}>
                Typ een stad of gebruik GPS voor het weer op jouw locatie
              </p>
            </div>
          )}
        </div>

        <BottomNav />
        <FloatingAI currentUser={user} pagina="weer" locatieNaam={weer?.city} />
      </div>
    </div>
  )
}
