import Anthropic from '@anthropic-ai/sdk'

// Server-side: boardingpass/ticket foto of tekst → vluchtvelden extraheren
export async function POST(request) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return Response.json({ error: 'Anthropic-sleutel ontbreekt' }, { status: 500 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const text = formData.get('text')

    const client = new Anthropic({ apiKey: key })

    let messages

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mediaType = file.type || 'image/jpeg'

      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: 'Dit is een boarding pass of vliegticket. Extraheer alle vluchtinformatie en geef het terug als JSON.',
          },
        ],
      }]
    } else if (text) {
      messages = [{
        role: 'user',
        content: `Extraheer vluchtinformatie uit deze tekst:\n\n${text}`,
      }]
    } else {
      return Response.json({ error: 'Geen bestand of tekst meegegeven' }, { status: 400 })
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `Je bent een assistent die vluchtgegevens extraheert uit boarding passes en tickets.
Antwoord ALLEEN met geldig JSON in dit formaat:
{
  "flightNo": "KL1234",
  "airline": "KLM",
  "fromCode": "AMS",
  "fromCity": "Amsterdam",
  "toCode": "IST",
  "toCity": "Istanbul",
  "departDate": "2026-07-15",
  "departTime": "09:45",
  "arriveDate": "2026-07-15",
  "arriveTime": "13:30",
  "seat": "23A",
  "confirmation": "ABC123",
  "class": "Economy"
}
Als een veld niet gevonden wordt, gebruik null.`,
      messages,
    })

    let parsed = null
    try { parsed = JSON.parse(msg.content[0].text) } catch { parsed = { rawText: msg.content[0].text } }
    return Response.json(parsed)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
