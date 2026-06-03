import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const hasSupabase = Boolean(url && key)
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')

// ── Generieke helpers met localStorage-cache (offline-first) ──
// Firebase-paden uit de brief → Supabase-tabellen:
//   agenda → itinerary | budget/transacties → expenses | bucketlist → lists/list_items
//   favorites → saved_places | chat → chat_messages | settings → app_settings (jsonb)

function cacheGet<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem('hq_' + key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function cacheSet(key: string, val: unknown) {
  try { localStorage.setItem('hq_' + key, JSON.stringify(val)) } catch {}
}

// ── Agenda (itinerary) ──
export async function getAgenda() {
  if (!hasSupabase) return cacheGet('agenda', [])
  const { data } = await supabase.from('itinerary').select('*').order('date').order('time_slot')
  if (data) cacheSet('agenda', data)
  return data || cacheGet('agenda', [])
}
export async function addAgenda(item: any) {
  if (!hasSupabase) { const a = cacheGet<any[]>('agenda', []); const n = { ...item, id: crypto.randomUUID() }; cacheSet('agenda', [...a, n]); return n }
  const { data } = await supabase.from('itinerary').insert(item).select().single()
  return data
}
export async function deleteAgenda(id: string) {
  if (!hasSupabase) { cacheSet('agenda', cacheGet<any[]>('agenda', []).filter(i => i.id !== id)); return }
  await supabase.from('itinerary').delete().eq('id', id)
}

// ── Budget ──
export async function getExpenses() {
  if (!hasSupabase) return cacheGet('expenses', [])
  const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
  if (data) cacheSet('expenses', data)
  return data || cacheGet('expenses', [])
}
export async function addExpense(e: any) {
  if (!hasSupabase) { const a = cacheGet<any[]>('expenses', []); const n = { ...e, id: crypto.randomUUID() }; cacheSet('expenses', [n, ...a]); return n }
  const { data } = await supabase.from('expenses').insert(e).select().single()
  return data
}
export async function deleteExpense(id: string) {
  if (!hasSupabase) { cacheSet('expenses', cacheGet<any[]>('expenses', []).filter(i => i.id !== id)); return }
  await supabase.from('expenses').delete().eq('id', id)
}
export async function getBudget() {
  if (!hasSupabase) return cacheGet('budget', null)
  const { data } = await supabase.from('budget').select('*').limit(1).maybeSingle()
  return data
}

// ── Favorieten (saved_places) ──
export async function getFavorites() {
  if (!hasSupabase) return cacheGet('favorites', [])
  const { data } = await supabase.from('saved_places').select('*').order('created_at', { ascending: false })
  if (data) cacheSet('favorites', data)
  return data || cacheGet('favorites', [])
}
export async function saveFavorite(p: any) {
  if (!hasSupabase) { const a = cacheGet<any[]>('favorites', []); if (a.find(x => x.place_id === p.place_id)) return; cacheSet('favorites', [{ ...p, id: crypto.randomUUID() }, ...a]); return }
  const { data } = await supabase.from('saved_places').upsert(p, { onConflict: 'place_id' }).select().single()
  return data
}
export async function removeFavorite(placeId: string) {
  if (!hasSupabase) { cacheSet('favorites', cacheGet<any[]>('favorites', []).filter(i => i.place_id !== placeId)); return }
  await supabase.from('saved_places').delete().eq('place_id', placeId)
}

// ── Checklist-status (paklijst + bucketlist) via key-value in localStorage + Supabase notes ──
export function getChecks(): Record<string, any> { return cacheGet('checks', {}) }
export function setCheck(id: string, val: any) {
  const c = getChecks(); c[id] = val; cacheSet('checks', c)
  if (hasSupabase) supabase.from('list_items').upsert({ id, checked: !!val, meta: val }).then(() => {}, () => {})
}

// ── Chat ──
export async function getChat() {
  if (!hasSupabase) return cacheGet('chat', [])
  const { data } = await supabase.from('chat_messages').select('*').order('created_at')
  return data || cacheGet('chat', [])
}
export async function addChat(msg: any) {
  const a = cacheGet<any[]>('chat', []); cacheSet('chat', [...a, msg])
  if (hasSupabase) supabase.from('chat_messages').insert(msg).then(() => {}, () => {})
}

// ── Notities per bestemming ──
export function getNote(dest: string) { return cacheGet<Record<string, string>>('notes', {})[dest] || '' }
export function setNote(dest: string, text: string) {
  const n = cacheGet<Record<string, string>>('notes', {}); n[dest] = text; cacheSet('notes', n)
}
