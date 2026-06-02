// Server-side: OpenWeather uitgebreide data (current + forecast + luchtkwaliteit)
const CACHE = new Map()
const CACHE_TTL = 20 * 60 * 1000 // 20 minuten

export async function GET(request) {
  const key = process.env.OPENWEATHER_KEY
  if (!key) {
    return Response.json({ error: 'OPENWEATHER_KEY ontbreekt — voeg toe in Netlify env vars', missingKey: true }, { status: 200 })
  }

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const city = searchParams.get('city')
  const mode = searchParams.get('mode') || 'full'

  const cacheKey = lat ? `${lat},${lng}-${mode}` : `${city}-${mode}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) return Response.json(cached.data)

  try {
    const q = lat ? `lat=${lat}&lon=${lng}` : `q=${encodeURIComponent(city)}`
    const base = `https://api.openweathermap.org/data/2.5`

    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${base}/weather?${q}&units=metric&lang=nl&appid=${key}`),
      fetch(`${base}/forecast?${q}&units=metric&lang=nl&cnt=40&appid=${key}`),
    ])

    const current = await currentRes.json()
    const forecast = await forecastRes.json()

    if (!currentRes.ok) return Response.json({ error: current.message || 'Locatie niet gevonden' }, { status: 200 })

    // Groepeer forecast per dag
    const byDay = {}
    for (const item of forecast.list || []) {
      const day = item.dt_txt.split(' ')[0]
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(item)
    }
    const dailyForecast = Object.entries(byDay).slice(0, 7).map(([date, items]) => ({
      date,
      tempMin: Math.round(Math.min(...items.map(i => i.main.temp_min))),
      tempMax: Math.round(Math.max(...items.map(i => i.main.temp_max))),
      icon: items[Math.floor(items.length / 2)]?.weather[0]?.icon || '01d',
      description: items[Math.floor(items.length / 2)]?.weather[0]?.description || '',
      pop: Math.round(Math.max(...items.map(i => (i.pop || 0) * 100))), // regenKans %
    }))

    // Uurlijkse forecast (eerstvolgende 8 uur)
    const hourly = (forecast.list || []).slice(0, 8).map(item => ({
      time: item.dt_txt,
      temp: Math.round(item.main.temp),
      icon: item.weather[0]?.icon,
      description: item.weather[0]?.description,
      pop: Math.round((item.pop || 0) * 100),
      wind: Math.round(item.wind.speed),
    }))

    const windDir = (deg) => {
      const dirs = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW']
      return dirs[Math.round(deg / 45) % 8]
    }

    const data = {
      city: current.name,
      country: current.sys?.country,
      lat: current.coord?.lat,
      lng: current.coord?.lon,
      temp: Math.round(current.main.temp),
      feels: Math.round(current.main.feels_like),
      tempMin: Math.round(current.main.temp_min),
      tempMax: Math.round(current.main.temp_max),
      description: current.weather[0]?.description,
      icon: current.weather[0]?.icon,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      visibility: Math.round((current.visibility || 10000) / 1000),
      wind: Math.round(current.wind.speed * 3.6), // m/s → km/h
      windDir: windDir(current.wind.deg || 0),
      windGust: current.wind.gust ? Math.round(current.wind.gust * 3.6) : null,
      clouds: current.clouds?.all,
      sunrise: current.sys?.sunrise,
      sunset: current.sys?.sunset,
      timezone: current.timezone,
      daily: dailyForecast,
      hourly,
    }

    CACHE.set(cacheKey, { data, time: Date.now() })
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
