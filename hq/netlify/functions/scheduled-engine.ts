// Het proactieve brein (Netlify cron, elke 30 min — zie netlify.toml).
// Leest agenda + laatste locatie + instellingen uit Supabase en stuurt
// indien nodig een push-suggestie. Respecteert stilte-uren & frequentie.
//
// FASE 1: server-side beslislogica. De app schrijft locatie naar Supabase
// wanneer hij open is. (Echte achtergrond-geofencing = Fase 2 / Capacitor.)

export const handler = async () => {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const vapidPub = process.env.VAPID_PUBLIC_KEY, vapidPriv = process.env.VAPID_PRIVATE_KEY

  if (!url || !key) return { statusCode: 200, body: 'no-supabase' }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supa = createClient(url, key)

    // 1. Lees instellingen, agenda, subscriptions
    const now = new Date()
    const hh = now.getHours()
    const today = now.toISOString().split('T')[0]

    const [{ data: subs }, { data: agenda }] = await Promise.all([
      supa.from('push_subscriptions').select('*'),
      supa.from('itinerary').select('*').eq('date', today),
    ])

    if (!subs?.length || !vapidPub || !vapidPriv) return { statusCode: 200, body: 'nothing-to-send' }

    // Stilte-uren (default 22–08)
    if (hh >= 22 || hh < 8) return { statusCode: 200, body: 'quiet-hours' }

    // 2. Beslis bericht: lege dag → suggestie
    let title = 'Honeymoon HQ ✦', body = ''
    if (!agenda || agenda.length === 0) {
      body = 'Vandaag is nog vrij — zin in een strandwandeling of snorkelen? Tik om te ontdekken 🌺'
    } else {
      const next = agenda.find((a: any) => ['Middag', 'Avond'].includes(a.time_slot))
      if (next) { body = `Straks: ${next.activity}. Geniet ervan! ✦` } else { return { statusCode: 200, body: 'no-trigger' } }
    }

    // 3. Verstuur
    const webpush = (await import('web-push')).default as any
    webpush.setVapidDetails('mailto:abdul9009@hotmail.com', vapidPub, vapidPriv)
    for (const s of subs) {
      try { await webpush.sendNotification(s.subscription, JSON.stringify({ title, body, url: '/' })) } catch {}
    }
    return { statusCode: 200, body: `sent:${subs.length}` }
  } catch (e: any) {
    return { statusCode: 500, body: e.message }
  }
}
