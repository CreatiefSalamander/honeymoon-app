import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Anthropic-sleutel ontbreekt' }, { status: 500 })
  }

  try {
    const { messages, context } = await request.json()
    if (!messages?.length) return Response.json({ error: 'Geen berichten' }, { status: 400 })

    const systemPrompt = `Jij bent de persoonlijke reisassistent van Abdul en Lilia op hun huwelijksreis.
Je bent warm, behulpzaam en persoonlijk. Je spreekt altijd Nederlands.
Je geeft concrete, praktische adviezen — geen vage algemeenheden.

${context?.page ? `De gebruiker is momenteel op de pagina: ${context.page}.` : ''}
${context?.location ? `Huidige locatie: ${context.location}.` : ''}
${context?.destination ? `Reisbestemming: ${context.destination}.` : ''}
${context?.today ? `Vandaag op het programma: ${context.today}.` : ''}

Tips:
- Bij vragen over eten: noem halal-opties als dat relevant is
- Bij vragen over geld: denk aan wisselkoersen en fooi-gewoontes
- Wees geruststellend als iemand gestrest is ("alles staat klaar, geniet van jullie dag!")
- Houd antwoorden beknopt tenzij gevraagd om meer detail`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    return Response.json({ message: response.content[0]?.text || 'Sorry, probeer het opnieuw.' })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
