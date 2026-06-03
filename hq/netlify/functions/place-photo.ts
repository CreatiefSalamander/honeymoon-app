// Proxy → Google Place Photo (verbergt key, geen CORS-probleem)
export const handler = async (event: any) => {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return { statusCode: 404, body: 'no key' }
  const name = event.queryStringParameters?.name
  const w = event.queryStringParameters?.w || '800'
  if (!name) return { statusCode: 400, body: 'name required' }
  try {
    const metaRes = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=${w}&skipHttpRedirect=true`, { headers: { 'X-Goog-Api-Key': key } })
    const meta = await metaRes.json()
    if (!meta.photoUri) return { statusCode: 404, body: 'no photo' }
    const img = await fetch(meta.photoUri)
    const buf = Buffer.from(await img.arrayBuffer())
    return {
      statusCode: 200,
      headers: { 'Content-Type': img.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
      body: buf.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (e: any) {
    return { statusCode: 500, body: e.message }
  }
}
