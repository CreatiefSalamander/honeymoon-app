// Proxy → OpenWeatherMap (verbergt OPENWEATHER_API_KEY)
const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }

export const handler = async (event: any) => {
  const key = process.env.OPENWEATHER_API_KEY
  if (!key) return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: 'no-key', missingKey: true }) }
  const { lat, lng } = event.queryStringParameters || {}
  if (!lat || !lng) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'lat/lng required' }) }
  try {
    const [cur, fc] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=en&appid=${key}`).then(r => r.json()),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&lang=en&cnt=8&appid=${key}`).then(r => r.json()),
    ])
    if (cur.cod && String(cur.cod) !== '200') return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: cur.message }) }
    return {
      statusCode: 200, headers: CORS, body: JSON.stringify({
        city: cur.name, temp: cur.main?.temp, feels: cur.main?.feels_like, icon: cur.weather?.[0]?.icon,
        description: cur.weather?.[0]?.description, humidity: cur.main?.humidity, wind: cur.wind?.speed,
        forecast: (fc.list || []).slice(0, 8).map((i: any) => ({ time: i.dt_txt, temp: Math.round(i.main.temp), icon: i.weather[0].icon })),
      }),
    }
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) }
  }
}
