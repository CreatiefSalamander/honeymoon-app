// Server-side: Google Places Nearby/Text Search (Places API New)
export async function POST(request) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) {
    return Response.json({ error: 'GOOGLE_PLACES_API_KEY ontbreekt — voeg toe in Netlify env vars', missingKey: true }, { status: 200 })
  }

  try {
    const { lat, lng, radius = 1500, category, query } = await request.json()

    let url, body, fieldMask

    fieldMask = [
      'places.id', 'places.displayName', 'places.formattedAddress',
      'places.rating', 'places.userRatingCount', 'places.priceLevel',
      'places.businessStatus', 'places.currentOpeningHours',
      'places.location', 'places.photos', 'places.nationalPhoneNumber',
      'places.websiteUri', 'places.primaryType', 'places.types',
    ].join(',')

    if (query) {
      // Tekst-gebaseerd zoeken
      url = 'https://places.googleapis.com/v1/places:searchText'
      body = JSON.stringify({
        textQuery: query,
        maxResultCount: 20,
        languageCode: 'nl',
        ...(lat && lng ? { locationBias: { circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: parseFloat(radius) } } } : {}),
      })
    } else {
      // Nabijgelegen zoeken op type
      const typeMap = {
        restaurant: 'restaurant', cafe: 'cafe', tourist_attraction: 'tourist_attraction',
        park: 'park', night_club: 'night_club', shopping_mall: 'shopping_mall',
        supermarket: 'supermarket', pharmacy: 'pharmacy', atm: 'atm',
        hospital: 'hospital', taxi_stand: 'taxi_stand', jewelry_store: 'jewelry_store',
        spa: 'spa', art_gallery: 'art_gallery', place_of_worship: 'place_of_worship',
      }
      const includedType = typeMap[category] || 'point_of_interest'
      url = 'https://places.googleapis.com/v1/places:searchNearby'
      body = JSON.stringify({
        includedTypes: [includedType],
        maxResultCount: 20,
        locationRestriction: { circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: parseFloat(radius) } },
        languageCode: 'nl',
      })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': fieldMask,
      },
      body,
    })

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data.error?.message || 'Google Places fout'
      const isKeyError = errMsg.includes('API key') || errMsg.includes('OAuth') || errMsg.includes('authentication')
      return Response.json({ error: errMsg, missingKey: isKeyError }, { status: 200 })
    }

    const places = (data.places || []).map(p => {
      // Pak de eerste foto met unieke naam per plek
      const photoRef = p.photos?.[0]?.name || null
      return {
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
        photoRef,                          // Uniek per plek
        photoCount: p.photos?.length || 0, // Hoeveel foto's beschikbaar
      }
    })

    return Response.json({ places })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
