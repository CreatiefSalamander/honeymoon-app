import Anthropic from '@anthropic-ai/sdk'

// Server-side: reviews ophalen + Claude-samenvatting
export async function POST(request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const googleKey = process.env.GOOGLE_PLACES_API_KEY
  if (!anthropicKey) return Response.json({ error: 'Anthropic-sleutel ontbreekt' }, { status: 500 })

  try {
    const { placeId, name, reviews: providedReviews } = await request.json()

    let reviews = providedReviews || []

    // Haal reviews op via Google als we ze niet al hebben
    if (!reviews.length && placeId && googleKey) {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=nl`, {
        headers: {
          'X-Goog-Api-Key': googleKey,
          'X-Goog-FieldMask': 'reviews,rating',
        },
      })
      const data = await res.json()
      reviews = (data.reviews || []).slice(0, 8).map(r => ({
        rating: r.rating,
        text: r.text?.text?.substring(0, 400),
        author: r.authorAttribution?.displayName,
      }))
    }

    if (!reviews.length) {
      return Response.json({ summary: null, reviews: [] })
    }

    const client = new Anthropic({ apiKey: anthropicKey })

    const reviewText = reviews.map(r =>
      `⭐ ${r.rating}/5 (${r.author || 'Anoniem'}): "${r.text}"`
    ).join('\n\n')

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Je bent een vriendelijke reisassistent voor een koppel op huwelijksreis.
Analyseer deze reviews voor "${name}" en geef een eerlijke, persoonlijke samenvatting in het Nederlands.

REVIEWS:
${reviewText}

Antwoord EXACT in dit JSON-formaat (geen extra tekst):
{
  "positief": ["punt 1", "punt 2", "punt 3"],
  "aandachtspunten": ["punt 1", "punt 2"],
  "onzeTip": "één persoonlijke tip voor Abdul & Lilia"
}`,
      }],
    })

    let summary = null
    try {
      summary = JSON.parse(msg.content[0].text)
    } catch {
      summary = { positief: [], aandachtspunten: [], onzeTip: msg.content[0].text }
    }

    return Response.json({ summary, reviews: reviews.slice(0, 3) })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
