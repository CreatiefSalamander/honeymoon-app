// Server-side: vluchtstatus via AviationStack
export async function GET(request) {
  const key = process.env.AVIATIONSTACK_KEY
  if (!key) return Response.json({ error: 'AviationStack-sleutel ontbreekt. Voeg toe in Netlify env vars.' }, { status: 500 })

  const { searchParams } = new URL(request.url)
  const flightNo = searchParams.get('flight')
  const date = searchParams.get('date') // YYYY-MM-DD

  if (!flightNo) return Response.json({ error: 'flight verplicht' }, { status: 400 })

  try {
    const params = new URLSearchParams({
      access_key: key,
      flight_iata: flightNo.toUpperCase(),
      ...(date && { flight_date: date }),
    })
    const res = await fetch(`http://api.aviationstack.com/v1/flights?${params}`)
    const data = await res.json()

    if (data.error) return Response.json({ error: data.error.message }, { status: 400 })

    const flight = data.data?.[0]
    if (!flight) return Response.json({ error: 'Vlucht niet gevonden' }, { status: 404 })

    return Response.json({
      flightNo: flight.flight?.iata,
      airline: flight.airline?.name,
      status: flight.flight_status,
      departure: {
        airport: flight.departure?.airport,
        iata: flight.departure?.iata,
        scheduled: flight.departure?.scheduled,
        estimated: flight.departure?.estimated,
        actual: flight.departure?.actual,
        terminal: flight.departure?.terminal,
        gate: flight.departure?.gate,
        delay: flight.departure?.delay,
      },
      arrival: {
        airport: flight.arrival?.airport,
        iata: flight.arrival?.iata,
        scheduled: flight.arrival?.scheduled,
        estimated: flight.arrival?.estimated,
        actual: flight.arrival?.actual,
        terminal: flight.arrival?.terminal,
        gate: flight.arrival?.gate,
        delay: flight.arrival?.delay,
      },
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
