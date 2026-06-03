// Verstuur Web Push (VAPID). Verbergt VAPID_PRIVATE_KEY.
// Vereist: npm i web-push  (staat in package.json)
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' }

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: false, reason: 'no-vapid' }) }
  try {
    const webpush = (await import('web-push')).default as any
    webpush.setVapidDetails('mailto:abdul9009@hotmail.com', pub, priv)
    const { subscription, title, body, url } = JSON.parse(event.body || '{}')
    await webpush.sendNotification(subscription, JSON.stringify({ title: title || 'Honeymoon HQ', body: body || '✦', url: url || '/' }))
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: e.message }) }
  }
}
