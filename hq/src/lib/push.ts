// ══════════════════════════════════════════════════════════════
//  PUSH — platform-geïsoleerd (Fase 2: vervang door Capacitor Push)
//  Fase 1: VAPID Web Push via service worker.
// ══════════════════════════════════════════════════════════════
import { supabase, hasSupabase } from './supabase'

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export async function enablePush(phone: string): Promise<{ ok: boolean; reason?: string }> {
  if (!pushSupported()) return { ok: false, reason: 'not-supported' }
  if (!VAPID_PUBLIC) return { ok: false, reason: 'no-vapid-key' }

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return { ok: false, reason: 'denied' }

  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    })
    if (hasSupabase) {
      await supabase.from('push_subscriptions').upsert(
        { phone, subscription: sub.toJSON() }, { onConflict: 'phone' }
      )
    }
    localStorage.setItem('hq_push', 'on')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'error' }
  }
}

export function pushEnabled() {
  return localStorage.getItem('hq_push') === 'on' && Notification?.permission === 'granted'
}
