import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// AI Agent systeem prompt voor Abdul & Lilia
const AGENT_SYSTEEM_PROMPT = `Je bent de AI Agent van Abdul & Lilia (huwelijksreis Indonesie 2026).
Route: Lombok - Gili Air - Bali. Periode: 12 juni - 24 juli 2026. Budget: EUR 10.000.
LILIA ALLERGIEEN: gras (geen jungle/bos) + chloor (geen zwembad) - altijd strand/zee aanbevelen.
Beide moslim - halal eten noemen bij restauranttips.
NAVIGATIE: gebruik [NAVIGATE:/pad] voor: / /locatie /ontdek /agenda /budget /vluchten /weer /dagboek /fotos /instellingen
ACTIES: [ACTION:ADD_AGENDA:naam:datum:tijd] of [ACTION:ADD_BUDGET:omschrijving:bedrag:categorie]
Stijl: warm persoonlijk max 150 woorden emoji ok taal van gebruiker`

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Anthropic-sleutel ontbreekt' }, { status: 500 })
  }
  try {
    const { messages, context, systemExtra, lang } = await request.json()
    if (!messages?.length) return Response.json({ error: 'Geen berichten' }, { status: 400 })
    let systemPrompt = AGENT_SYSTEEM_PROMPT
    if (lang && lang !== 'nl') systemPrompt += (lang === 'en' ? ' Respond in English.' : ' Reageer in Armeens.')
    if (systemExtra) systemPrompt = systemExtra + '\n\n' + systemPrompt
    if (context) {
      const ctx = []
      if (context.page) ctx.push('Pagina: ' + context.page)
      if (context.location) ctx.push('GPS: ' + context.location)
      if (context.destination) ctx.push('Bestemming: ' + context.destination)
      if (context.today) ctx.push('Vandaag: ' + context.today)
      if (context.budget_remaining) ctx.push('Budget over: EUR ' + context.budget_remaining)
      if (ctx.length) systemPrompt += '\n\nContext:\n' + ctx.join('\n')
    }
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6', max_tokens: 1024, system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })
    const text = response.content[0]?.text || 'Sorry, probeer het opnieuw.'
    const actions = []
    const nav = text.match(/\[NAVIGATE:([^\]]+)\]/); if (nav) actions.push({ type: 'navigate', path: nav[1] })
    const ag = text.match(/\[ACTION:ADD_AGENDA:([^:]+):([^:]+):([^\]]+)\]/); if (ag) actions.push({ type: 'add_agenda', title: ag[1], date: ag[2], time: ag[3] })
    const bu = text.match(/\[ACTION:ADD_BUDGET:([^:]+):([^:]+):([^\]]+)\]/); if (bu) actions.push({ type: 'add_budget', description: bu[1], amount: parseFloat(bu[2]), category: bu[3] })
    return Response.json({ message: text, actions: actions.length ? actions : undefined })
  } catch (err) {
    console.error('AI Agent fout:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
