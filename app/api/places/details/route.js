// Server-side: Google Place Details
export async function GET(request) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return Response.json({ error: 'Google Places API-sleutel ontbreekt' }, { status: 500 })

  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('id')
  if (!placeId) return Response.json({ error: 'id verplicht' }, { status: 400 })

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=nl`, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,priceLevel,currentOpeningHours,regularOpeningHours,location,photos,nationalPhoneNumber,websiteUri,reviews,editorialSummary',
      },
    })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error?.message }, { status: res.status })

    return Response.json({
      id: data.id,
      name: data.displayName?.text,
      address: data.formattedAddress,
      rating: data.rating,
      reviewCount: data.userRatingCount,
      priceLevel: data.priceLevel,
      open: data.currentOpeningHours?.openNow,
      hours: data.regularOpeningHours?.weekdayDescriptions || [],
      lat: data.location?.latitude,
      lng: data.location?.longitude,
      phone: data.nationalPhoneNumber,
      website: data.websiteUri,
      summary: data.editorialSummary?.text,
      photos: (data.photos || []).slice(0, 5).map(p => p.name),
      reviews: (data.reviews || []).slice(0, 5).map(r => ({
        author: r.authorAttribution?.displayName,
        rating: r.rating,
        text: r.text?.text?.substring(0, 300),
        time: r.publishTime,
      })),
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
