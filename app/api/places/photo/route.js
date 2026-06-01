// Server-side proxy voor Google Place Photos (vermijdt CORS + verbergt API-sleutel)
export async function GET(request) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return new Response('Sleutel ontbreekt', { status: 500 })

  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') // bijv. places/xxx/photos/yyy
  const maxW = searchParams.get('w') || '800'

  if (!name) return new Response('name verplicht', { status: 400 })

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxW}&skipHttpRedirect=true`,
      { headers: { 'X-Goog-Api-Key': key } }
    )
    const data = await res.json()
    if (!res.ok || !data.photoUri) return new Response('Foto niet gevonden', { status: 404 })

    // Haal de echte foto op en stream door
    const photo = await fetch(data.photoUri)
    const blob = await photo.arrayBuffer()
    return new Response(blob, {
      headers: {
        'Content-Type': photo.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    return new Response(err.message, { status: 500 })
  }
}
