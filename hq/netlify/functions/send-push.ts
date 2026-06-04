// Web Push (VAPID) — stuurt naar opgeslagen subscriptions van een telefoon.
// Geen Firebase. Gebruikt web-push + Supabase push_subscriptions tabel.
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' }

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const mailto = process.env.VAPID_MAILTO || 'mailto:abdul9009@hotmail.com'
  if (!pub || !priv) return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: false, reason: 'no-vapid' }) }

  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supaKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  try {
    const { phone, title, body, url, subscription } = JSON.parse(event.body || '{}')
    const webpush = (await import('web-push')).default as any
    webpush.setVapidDetails(mailto, pub, priv)
    const payload = JSON.stringify({ title: title || 'Honeymoon HQ ✦', body: body || '', url: url || '/' })

    // Directe subscription meegegeven? stuur meteen.
    let subs: any[] = []
    if (subscription) subs = [{ subscription }]
    else if (supaUrl && supaKey) {
      const q = phone ? `&phone=eq.${encodeURIComponent(phone)}` : ''
      const res = await fetch(`${supaUrl}/rest/v1/push_subscriptions?select=subscription,phone${q}`, { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } })
      subs = await res.json()
    }
    if (!Array.isArray(subs) || subs.length === 0) return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: false, reason: 'no-subs', sent: 0 }) }

    let sent = 0, failed = 0
    for (const s of subs) {
      try { await webpush.sendNotification(s.subscription, payload); sent++ }
      catch (e: any) { failed++ /* 410 = verlopen; kon hier opruimen */ }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, sent, failed }) }
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: e.message }) }
  }
}
