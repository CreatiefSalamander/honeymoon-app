// Server-side: OpenWeather forecast
const CACHE = new Map()
const CACHE_TTL = 30 * 60 * 1000 // 30 minuten

export async function GET(request) {
  const key = process.env.OPENWEATHER_KEY
  if (!key) return Response.json({ error: 'OpenWeather-sleutel ontbreekt' }, { status: 500 })

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const city = searchParams.get('city')

  const cacheKey = lat ? `${lat},${lng}` : city
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return Response.json(cached.data)
  }

  try {
    const q = lat ? `lat=${lat}&lon=${lng}` : `q=${encodeURIComponent(city)}`
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${q}&units=metric&lang=nl&cnt=8&appid=${key}`
    )
    const raw = await res.json()
    if (!res.ok) return Response.json({ error: raw.message }, { status: res.status })

    const current = raw.list[0]
    const data = {
      city: raw.city.name,
      country: raw.city.country,
      temp: Math.round(current.main.temp),
      feels: Math.round(current.main.feels_like),
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      humidity: current.main.humidity,
      wind: Math.round(current.wind.speed),
      forecast: raw.list.slice(0, 8).map(item => ({
        time: item.dt_txt,
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      })),
    }

    CACHE.set(cacheKey, { data, time: Date.now() })
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
