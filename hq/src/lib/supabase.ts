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
export async function updateAgenda(id: string, patch: any) {
  if (!hasSupabase) { cacheSet('agenda', cacheGet<any[]>('agenda', []).map(i => i.id === id ? { ...i, ...patch } : i)); return }
  const { data } = await supabase.from('itinerary').update(patch).eq('id', id).select().single(); return data
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

// ── Checklist-status (paklijst + bucketlist) — eigen tabel app_checks (id text) ──
export function getChecks(): Record<string, any> { return cacheGet('checks', {}) }
export function setCheck(id: string, val: any) {
  const c = getChecks(); if (val == null) delete c[id]; else c[id] = val; cacheSet('checks', c)
  if (hasSupabase) supabase.from('app_checks').upsert({ id, val, updated_at: new Date().toISOString() }, { onConflict: 'id' }).then(() => {}, () => {})
}
// Eenmalig ophalen + samenvoegen met lokale cache (cross-telefoon sync)
export async function pullChecks() {
  if (!hasSupabase) return
  try {
    const { data } = await supabase.from('app_checks').select('id,val')
    if (data) { const c = getChecks(); data.forEach((r: any) => { if (r.val != null) c[r.id] = r.val }); cacheSet('checks', c) }
  } catch {}
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

// ── Realtime chat (groeps-chat + @claude) ──
export function subscribeChat(cb: (m: any) => void) {
  if (!hasSupabase) return { unsubscribe() {} }
  return supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (p: any) => cb(p.new)).subscribe()
}

// ── Foto-dagboek (memories) ──
export async function getMemories() {
  if (!hasSupabase) return cacheGet('memories', [])
  const { data } = await supabase.from('memories').select('*').order('created_at', { ascending: false })
  if (data) cacheSet('memories', data)
  return data || cacheGet('memories', [])
}
export async function uploadPhoto(file: File, userId: string) {
  if (!hasSupabase) return URL.createObjectURL(file)
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('memories').upload(path, file, { cacheControl: '3600' })
  if (error) return null
  return supabase.storage.from('memories').getPublicUrl(path).data.publicUrl
}
export async function addMemory(m: any) {
  if (!hasSupabase) { const a = cacheGet<any[]>('memories', []); const n = { ...m, id: crypto.randomUUID(), created_at: new Date().toISOString() }; cacheSet('memories', [n, ...a]); return n }
  const { data } = await supabase.from('memories').insert(m).select().single(); return data
}
export async function toggleLike(id: string, userId: string) {
  if (!hasSupabase) return null
  const { data: m } = await supabase.from('memories').select('liked_by').eq('id', id).single()
  const liked = m?.liked_by || []
  const next = liked.includes(userId) ? liked.filter((u: string) => u !== userId) : [...liked, userId]
  const { data } = await supabase.from('memories').update({ liked_by: next }).eq('id', id).select().single(); return data
}
export async function deleteMemory(id: string) { if (hasSupabase) await supabase.from('memories').delete().eq('id', id); else cacheSet('memories', cacheGet<any[]>('memories', []).filter(m => m.id !== id)) }

// ── Vluchten ──
export async function getFlights() {
  if (!hasSupabase) return cacheGet('flights', [])
  const { data } = await supabase.from('flights').select('*').order('depart_at'); if (data) cacheSet('flights', data); return data || cacheGet('flights', [])
}
export async function addFlight(f: any) {
  if (!hasSupabase) { const a = cacheGet<any[]>('flights', []); const n = { ...f, id: crypto.randomUUID() }; cacheSet('flights', [...a, n]); return n }
  const { data } = await supabase.from('flights').insert(f).select().single(); return data
}
export async function deleteFlight(id: string) { if (hasSupabase) await supabase.from('flights').delete().eq('id', id); else cacheSet('flights', cacheGet<any[]>('flights', []).filter(f => f.id !== id)) }

// ── Live locaties (Snapchat-stijl kaart) ──
export async function getLocations() {
  if (!hasSupabase) { const c = cacheGet<any>('location', null); return c ? [{ phone: 'me', ...c }] : [] }
  const { data } = await supabase.from('phone_location').select('*')
  return data || []
}
export function subscribeLocations(cb: (row: any) => void) {
  if (!hasSupabase) return { unsubscribe() {} }
  return supabase.channel('loc').on('postgres_changes', { event: '*', schema: 'public', table: 'phone_location' }, (p: any) => cb(p.new)).subscribe()
}

// ── Activiteiten-log (Meldingen) ──
export async function logActivity(type: string, description: string, by: string) {
  if (hasSupabase) supabase.from('activity_log').insert({ type, description, created_by: by }).then(() => {}, () => {})
  const a = cacheGet<any[]>('activity', []); cacheSet('activity', [{ type, description, created_by: by, created_at: new Date().toISOString(), id: crypto.randomUUID() }, ...a].slice(0, 80))
}
export async function getActivity() {
  if (!hasSupabase) return cacheGet('activity', [])
  const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(80)
  return data || cacheGet('activity', [])
}
export function subscribeActivity(cb: (m: any) => void) {
  if (!hasSupabase) return { unsubscribe() {} }
  return supabase.channel('activity').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (p: any) => cb(p.new)).subscribe()
}
