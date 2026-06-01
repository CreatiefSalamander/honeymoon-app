// Server-side: Google Places Nearby/Text Search
export async function POST(request) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return Response.json({ error: 'Google Places API-sleutel ontbreekt' }, { status: 500 })

  try {
    const { lat, lng, radius = 1500, category, query } = await request.json()

    let url, body

    if (query) {
      // Tekst-gebaseerd zoeken
      url = 'https://places.googleapis.com/v1/places:searchText'
      body = JSON.stringify({
        textQuery: query,
        locationBias: lat && lng ? { circle: { center: { latitude: lat, longitude: lng }, radius } } : undefined,
        maxResultCount: 20,
        languageCode: 'nl',
      })
    } else {
      // Zoekopdracht op basis van type
      const typeMap = {
        eten: 'restaurant', cafe: 'cafe', bezienswaardigheid: 'tourist_attraction',
        natuur: 'park', shopping: 'shopping_mall', supermarkt: 'supermarket',
        apotheek: 'pharmacy', geldautomaat: 'atm', vervoer: 'taxi_stand',
        goudwinkel: 'jewelry_store',
      }
      const includedType = typeMap[category] || 'point_of_interest'
      url = 'https://places.googleapis.com/v1/places:searchNearby'
      body = JSON.stringify({
        includedTypes: [includedType],
        maxResultCount: 20,
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius },
        },
        languageCode: 'nl',
      })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.businessStatus,places.currentOpeningHours,places.location,places.photos,places.nationalPhoneNumber,places.websiteUri,places.primaryType',
      },
      body,
    })

    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error?.message || 'Google fout' }, { status: res.status })

    const places = (data.places || []).map(p => ({
      id: p.id,
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      rating: p.rating,
      reviewCount: p.userRatingCount,
      priceLevel: p.priceLevel,
      open: p.currentOpeningHours?.openNow,
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      phone: p.nationalPhoneNumber,
      website: p.websiteUri,
      type: p.primaryType,
      photoRef: p.photos?.[0]?.name,
    }))

    return Response.json({ places })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
