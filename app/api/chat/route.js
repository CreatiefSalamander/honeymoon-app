import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Jij bent de persoonlijke reisassistent van Abdul en Lilia op hun huwelijksreis.
Je geeft warme, persoonlijke adviezen over reizen, romantische activiteiten en lokale tips.
Je spreekt altijd Nederlands en gebruikt soms kleine romantische accenten in je antwoorden.
Houd je antwoorden vriendelijk, beknopt en praktisch.
Als iemand je vraagt wat je kunt doen, geef dan een overzicht van je mogelijkheden als reisassistent.`

export async function POST(request) {
  try {
    const { messages, user } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Ongeldige berichten' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    })

    const message = response.content[0]?.text || 'Sorry, ik kon geen antwoord genereren.'
    return Response.json({ message })
  } catch (error) {
    console.error('Chat API fout:', error)
    return Response.json({ error: 'Interne serverfout' }, { status: 500 })
  }
}
