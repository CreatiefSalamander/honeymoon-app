// ══════════════════════════════════════════════════════════════
//  NOTIFY — in-app meldingen + lokale notificaties
//  (Fase 2: vervang local-notification deel door Capacitor)
// ══════════════════════════════════════════════════════════════
type Toast = { id: number; msg: string }
let listeners: ((t: Toast[]) => void)[] = []
let toasts: Toast[] = []

export function onToasts(cb: (t: Toast[]) => void) {
  listeners.push(cb); cb(toasts)
  return () => { listeners = listeners.filter(l => l !== cb) }
}
export function toast(msg: string) {
  const t = { id: Date.now() + Math.random(), msg }
  toasts = [...toasts, t]; listeners.forEach(l => l(toasts))
  setTimeout(() => { toasts = toasts.filter(x => x.id !== t.id); listeners.forEach(l => l(toasts)) }, 2600)
}

// Lokale notificatie (alleen wanneer app open is — Fase 1)
export async function localNotify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.ready
    if (reg) reg.showNotification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' })
    else new Notification(title, { body })
  } catch {}
}
