import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BASIS_SYSTEEM_PROMPT = `Jij bent de persoonlijke reisassistent van Abdul en Lilia op hun huwelijksreis.
Je bent warm, behulpzaam en persoonlijk. Je spreekt altijd Nederlands.
Je geeft concrete, praktische adviezen — geen vage algemeenheden.

Tips:
- Bij vragen over eten: noem halal-opties als dat relevant is
- Bij vragen over geld: denk aan wisselkoersen en fooi-gewoontes
- Wees geruststellend als iemand gestrest is ("alles staat klaar, geniet van jullie dag!")
- Houd antwoorden beknopt tenzij gevraagd om meer detail
- Als iemand vraagt naar een functie, leg dan uit hoe die werkt in de app`

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Anthropic-sleutel ontbreekt in Netlify env vars' }, { status: 500 })
  }

  try {
    const { messages, context, systemExtra } = await request.json()
    if (!messages?.length) return Response.json({ error: 'Geen berichten' }, { status: 400 })

    let systemPrompt = BASIS_SYSTEEM_PROMPT

    // Voeg app-kennis toe als meegegeven
    if (systemExtra) {
      systemPrompt = systemExtra + '\n\n' + BASIS_SYSTEEM_PROMPT
    }

    // Voeg context toe
    if (context) {
      const contextLines = []
      if (context.page) contextLines.push(`Huidige pagina: ${context.page}`)
      if (context.location) contextLines.push(`Locatie: ${context.location}`)
      if (context.destination) contextLines.push(`Bestemming: ${context.destination}`)
      if (context.today) contextLines.push(`Vandaag op schema: ${context.today}`)
      if (contextLines.length) systemPrompt += '\n\nContext:\n' + contextLines.join('\n')
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    return Response.json({ message: response.content[0]?.text || 'Sorry, probeer het opnieuw.' })
  } catch (err) {
    console.error('Chat fout:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
