// Korte actuele context rond een plek (via Claude). Houd output kort.
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' }

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return { statusCode: 200, headers: CORS, body: JSON.stringify({ info: '' }) }
  try {
    const { place } = JSON.parse(event.body || '{}')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', max_tokens: 200,
        messages: [{ role: 'user', content: `Give a 2-sentence practical note about visiting "${place}" in Indonesia: best time of day, what to expect, one tip. Be concise.` }],
      }),
    })
    const data = await res.json()
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ info: data.content?.[0]?.text || '' }) }
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) }
  }
}
