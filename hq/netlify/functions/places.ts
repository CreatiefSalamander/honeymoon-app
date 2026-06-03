// Proxy → Google Places API (New). Verbergt GOOGLE_PLACES_API_KEY.
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' }

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return { statusCode: 200, headers: CORS, body: JSON.stringify({ needKey: true, places: [] }) }

  try {
    const { lat, lng, query, type, radius = 5000 } = JSON.parse(event.body || '{}')
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.location,places.photos,places.nationalPhoneNumber,places.websiteUri,places.primaryType'

    let url: string, body: any
    if (query) {
      url = 'https://places.googleapis.com/v1/places:searchText'
      body = { textQuery: query, maxResultCount: 20, languageCode: 'en', ...(lat && lng ? { locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } } } : {}) }
    } else {
      url = 'https://places.googleapis.com/v1/places:searchNearby'
      body = { includedTypes: [type || 'tourist_attraction'], maxResultCount: 20, languageCode: 'en', locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } } }
    }

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': fieldMask }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.error) {
      const k = data.error.message?.includes('API key') || data.error.message?.includes('authentication')
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ needKey: k, error: data.error.message, places: [] }) }
    }
    const places = (data.places || []).map((p: any) => ({
      id: p.id, name: p.displayName?.text, address: p.formattedAddress, rating: p.rating, reviewCount: p.userRatingCount,
      priceLevel: p.priceLevel, open: p.currentOpeningHours?.openNow, lat: p.location?.latitude, lng: p.location?.longitude,
      phone: p.nationalPhoneNumber, website: p.websiteUri, type: p.primaryType, photoRef: p.photos?.[0]?.name,
    }))
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ places }) }
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message, places: [] }) }
  }
}
