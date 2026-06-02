import Anthropic from '@anthropic-ai/sdk'

// Server-side: bonnetje-foto scannen → bedrag, categorie, beschrijving extraheren
export async function POST(request) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return Response.json({ error: 'Anthropic-sleutel ontbreekt' }, { status: 500 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || file.size === 0) return Response.json({ error: 'Geen bestand' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = file.type?.startsWith('image/') ? file.type : 'image/jpeg'

    const client = new Anthropic({ apiKey: key })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `Je extraheert bonnetje-informatie. Antwoord ALLEEN met geldig JSON, geen extra tekst.`,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: `Extraheer het totaalbedrag, categorie en beschrijving van dit bonnetje.
Gebruik deze categorieën: Hotel, Vlucht, Eten, Activiteiten, Shopping, Transport, Overig.
Antwoord in dit JSON formaat:
{
  "amount": 45.50,
  "category": "Eten",
  "description": "Restaurant naam of omschrijving",
  "date": "2026-07-15",
  "currency": "EUR"
}
Als je het bedrag niet kunt lezen, gebruik null voor amount.` }
        ],
      }],
    })

    let data = null
    try { data = JSON.parse(msg.content[0].text) } catch { data = { rawText: msg.content[0].text } }
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
