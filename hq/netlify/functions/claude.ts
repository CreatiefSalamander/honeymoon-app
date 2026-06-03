// Proxy → Anthropic Messages API (verbergt ANTHROPIC_API_KEY)
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' }

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return { statusCode: 200, headers: CORS, body: JSON.stringify({ message: 'AI is nog niet geconfigureerd — voeg ANTHROPIC_API_KEY toe in Netlify.' }) }
  try {
    const { messages, system } = JSON.parse(event.body || '{}')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: system || 'You are a warm, helpful honeymoon travel companion for Abdul & Lilia.',
        messages: (messages || []).map((m: any) => ({ role: m.role, content: m.content })),
      }),
    })
    const data = await res.json()
    if (data.error) return { statusCode: 200, headers: CORS, body: JSON.stringify({ message: data.error.message }) }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ message: data.content?.[0]?.text || '' }) }
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) }
  }
}
