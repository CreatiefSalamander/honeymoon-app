// Boarding pass / ticket (foto) → vluchtvelden via Claude vision
const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
export const handler = async (event: any) => {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: 'AI niet geconfigureerd' }) }
  try {
    // multipart parse — Netlify levert base64 body
    const ct = event.headers['content-type'] || event.headers['Content-Type'] || ''
    const boundary = ct.split('boundary=')[1]
    if (!boundary) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'geen bestand' }) }
    const raw = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
    const parts = raw.toString('latin1').split('--' + boundary)
    let fileBuf: Buffer | null = null, media = 'image/jpeg'
    for (const part of parts) {
      if (part.includes('filename=')) {
        const idx = part.indexOf('\r\n\r\n')
        if (idx === -1) continue
        const header = part.slice(0, idx)
        const mt = header.match(/Content-Type:\s*([^\r\n]+)/i); if (mt) media = mt[1].trim()
        const content = part.slice(idx + 4, part.lastIndexOf('\r\n'))
        fileBuf = Buffer.from(content, 'latin1')
      }
    }
    if (!fileBuf) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'geen bestand' }) }
    if (media === 'application/pdf') return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: 'Maak liever een foto van de boarding pass' }) }
    const b64 = fileBuf.toString('base64')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', max_tokens: 400,
        system: 'Extract flight info from this boarding pass. Reply ONLY with JSON: {"flightNo","airline","fromCode","toCode","departDate":"YYYY-MM-DD","departTime":"HH:MM","seat","confirmation"}. Use null if unknown.',
        messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: media, data: b64 } }, { type: 'text', text: 'Extract the flight details as JSON.' }] }],
      }),
    })
    const data = await res.json()
    let parsed: any = {}; try { parsed = JSON.parse(data.content?.[0]?.text || '{}') } catch { parsed = { error: 'kon niet lezen' } }
    return { statusCode: 200, headers: CORS, body: JSON.stringify(parsed) }
  } catch (e: any) { return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) } }
}
