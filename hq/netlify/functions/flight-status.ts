// Live vluchtstatus via AviationStack (verbergt sleutel)
const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
export const handler = async (event: any) => {
  const key = process.env.AVIATIONSTACK_KEY
  if (!key) return { statusCode: 200, headers: CORS, body: JSON.stringify({ needKey: true }) }
  const flight = event.queryStringParameters?.flight
  const date = event.queryStringParameters?.date
  if (!flight) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'flight required' }) }
  try {
    const p = new URLSearchParams({ access_key: key, flight_iata: flight.toUpperCase(), ...(date ? { flight_date: date } : {}) })
    const data = await fetch(`http://api.aviationstack.com/v1/flights?${p}`).then(r => r.json())
    const f = data.data?.[0]
    if (!f) return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: 'niet gevonden' }) }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ status: f.flight_status, departure: f.departure, arrival: f.arrival, airline: f.airline?.name }) }
  } catch (e: any) { return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) } }
}
