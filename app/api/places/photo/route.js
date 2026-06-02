// Server-side proxy voor Google Place Photos
// Verbergt API-sleutel, voegt caching toe
const FOTO_CACHE = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 uur

export async function GET(request) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return new Response('API sleutel ontbreekt', { status: 500 })

  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') // bijv. places/ChIJxxx/photos/AXXXnXX
  const maxW = searchParams.get('w') || '800'

  if (!name) return new Response('name parameter verplicht', { status: 400 })

  // Check cache
  const cacheKey = `${name}-${maxW}`
  const cached = FOTO_CACHE.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return new Response(cached.data, {
      headers: { 'Content-Type': cached.type, 'Cache-Control': 'public, max-age=86400' }
    })
  }

  try {
    // Stap 1: Haal de foto-URI op
    const mediaRes = await fetch(
      `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxW}&skipHttpRedirect=true`,
      { headers: { 'X-Goog-Api-Key': key } }
    )
    const mediaData = await mediaRes.json()

    if (!mediaRes.ok || !mediaData.photoUri) {
      // Fallback: probeer zonder skipHttpRedirect (redirect volgen)
      const directRes = await fetch(
        `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxW}`,
        { headers: { 'X-Goog-Api-Key': key }, redirect: 'follow' }
      )
      if (!directRes.ok) return new Response('Foto niet beschikbaar', { status: 404 })

      const blob = await directRes.arrayBuffer()
      const contentType = directRes.headers.get('content-type') || 'image/jpeg'
      FOTO_CACHE.set(cacheKey, { data: blob, type: contentType, time: Date.now() })
      return new Response(blob, {
        headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' }
      })
    }

    // Stap 2: Download de foto van de URI
    const fotoRes = await fetch(mediaData.photoUri)
    if (!fotoRes.ok) return new Response('Foto download mislukt', { status: 502 })

    const blob = await fotoRes.arrayBuffer()
    const contentType = fotoRes.headers.get('content-type') || 'image/jpeg'

    FOTO_CACHE.set(cacheKey, { data: blob, type: contentType, time: Date.now() })

    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Photo-Name': name.substring(0, 30),
      }
    })
  } catch (err) {
    return new Response(err.message, { status: 500 })
  }
}
