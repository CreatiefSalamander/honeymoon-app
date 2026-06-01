import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── Countdown ──────────────────────────────────────────────
export async function getCountdown() {
  const { data } = await supabase.from('countdown').select('*').limit(1).maybeSingle()
  return data
}
export async function upsertCountdown(wedding_date, partner1 = 'Abdul', partner2 = 'Lilia') {
  const { data: existing } = await supabase.from('countdown').select('id').limit(1).maybeSingle()
  if (existing) {
    const { data } = await supabase.from('countdown').update({ wedding_date, partner1, partner2, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single()
    return data
  }
  const { data } = await supabase.from('countdown').insert({ wedding_date, partner1, partner2 }).select().single()
  return data
}

// ── Itinerary ──────────────────────────────────────────────
export async function getItinerary() {
  const { data } = await supabase.from('itinerary').select('*').order('date').order('time_slot')
  return data || []
}
export async function addItineraryItem(item) {
  const { data } = await supabase.from('itinerary').insert(item).select().single()
  return data
}
export async function updateItineraryItem(id, updates) {
  const { data } = await supabase.from('itinerary').update(updates).eq('id', id).select().single()
  return data
}
export async function deleteItineraryItem(id) {
  await supabase.from('itinerary').delete().eq('id', id)
}
export function subscribeToItinerary(cb) {
  return supabase.channel('itinerary').on('postgres_changes', { event: '*', schema: 'public', table: 'itinerary' }, cb).subscribe()
}

// ── Vluchten ───────────────────────────────────────────────
export async function getFlights() {
  const { data } = await supabase.from('flights').select('*').order('depart_at')
  return data || []
}
export async function addFlight(flight) {
  const { data } = await supabase.from('flights').insert(flight).select().single()
  return data
}
export async function deleteFlight(id) {
  await supabase.from('flights').delete().eq('id', id)
}

// ── Memories / Dagboek ─────────────────────────────────────
export async function getMemories() {
  const { data } = await supabase.from('memories').select('*').order('created_at', { ascending: false })
  return data || []
}
export async function uploadPhoto(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('memories').upload(path, file, { cacheControl: '3600' })
  if (error) return null
  const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(path)
  return publicUrl
}
export async function addMemory(memory) {
  const { data } = await supabase.from('memories').insert(memory).select().single()
  return data
}
export async function toggleLike(id, userId) {
  const { data: m } = await supabase.from('memories').select('liked_by').eq('id', id).single()
  if (!m) return null
  const liked = m.liked_by || []
  const newLiked = liked.includes(userId) ? liked.filter(u => u !== userId) : [...liked, userId]
  const { data } = await supabase.from('memories').update({ liked_by: newLiked }).eq('id', id).select().single()
  return data
}
export async function deleteMemory(id) {
  await supabase.from('memories').delete().eq('id', id)
}
export function subscribeToMemories(cb) {
  return supabase.channel('memories').on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, cb).subscribe()
}

// ── Notities ───────────────────────────────────────────────
export async function getNotes() {
  const { data } = await supabase.from('notes').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false })
  return data || []
}
export async function addNote(note) {
  const { data } = await supabase.from('notes').insert(note).select().single()
  return data
}
export async function updateNote(id, updates) {
  const { data } = await supabase.from('notes').update(updates).eq('id', id).select().single()
  return data
}
export async function deleteNote(id) { await supabase.from('notes').delete().eq('id', id) }
export function subscribeToNotes(cb) {
  return supabase.channel('notes').on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, cb).subscribe()
}

// ── Lijsten ────────────────────────────────────────────────
export async function getLists(type) {
  const q = supabase.from('lists').select('*, list_items(*)').order('created_at')
  if (type) q.eq('type', type)
  const { data } = await q
  return data || []
}
export async function addList(list) {
  const { data } = await supabase.from('lists').insert(list).select().single()
  return data
}
export async function addListItem(item) {
  const { data } = await supabase.from('list_items').insert(item).select().single()
  return data
}
export async function toggleListItem(id, checked) {
  const { data } = await supabase.from('list_items').update({ checked }).eq('id', id).select().single()
  return data
}
export async function deleteListItem(id) { await supabase.from('list_items').delete().eq('id', id) }
export function subscribeToLists(cb) {
  return supabase.channel('lists').on('postgres_changes', { event: '*', schema: 'public', table: 'list_items' }, cb).subscribe()
}

// ── Budget ─────────────────────────────────────────────────
export async function getBudget() {
  const { data } = await supabase.from('budget').select('*').limit(1).maybeSingle()
  return data
}
export async function upsertBudget(total_budget, currency = 'EUR') {
  const { data: existing } = await supabase.from('budget').select('id').limit(1).maybeSingle()
  if (existing) {
    const { data } = await supabase.from('budget').update({ total_budget, currency, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single()
    return data
  }
  const { data } = await supabase.from('budget').insert({ total_budget, currency }).select().single()
  return data
}
export async function getExpenses() {
  const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
  return data || []
}
export async function addExpense(expense) {
  const { data } = await supabase.from('expenses').insert(expense).select().single()
  return data
}
export async function deleteExpense(id) { await supabase.from('expenses').delete().eq('id', id) }

// ── Bewaarde plekken ───────────────────────────────────────
export async function getSavedPlaces() {
  const { data } = await supabase.from('saved_places').select('*').order('created_at', { ascending: false })
  return data || []
}
export async function savePlace(place) {
  const { data } = await supabase.from('saved_places').upsert(place, { onConflict: 'place_id' }).select().single()
  return data
}
export async function deleteSavedPlace(id) {
  await supabase.from('saved_places').delete().eq('id', id)
}
