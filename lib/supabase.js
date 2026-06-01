import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Countdown ────────────────────────────────────────
export async function getCountdown() {
  const { data, error } = await supabase
    .from('countdown')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') console.error('Countdown ophalen:', error)
  return data
}

export async function updateCountdown(weddingDate, partner1 = 'Abdul', partner2 = 'Lilia') {
  const { data: existing } = await supabase.from('countdown').select('id').limit(1).single()
  if (existing) {
    const { data, error } = await supabase
      .from('countdown')
      .update({ wedding_date: weddingDate, partner1, partner2, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) console.error('Countdown updaten:', error)
    return data
  } else {
    const { data, error } = await supabase
      .from('countdown')
      .insert({ wedding_date: weddingDate, partner1, partner2 })
      .select()
      .single()
    if (error) console.error('Countdown aanmaken:', error)
    return data
  }
}

// ── Itinerary ────────────────────────────────────────
export async function getItinerary() {
  const { data, error } = await supabase
    .from('itinerary')
    .select('*')
    .order('date', { ascending: true })
  if (error) console.error('Itinerary ophalen:', error)
  return data || []
}

export async function addItineraryItem(item) {
  const { data, error } = await supabase
    .from('itinerary')
    .insert(item)
    .select()
    .single()
  if (error) console.error('Itinerary toevoegen:', error)
  return data
}

export async function updateItineraryItem(id, updates) {
  const { data, error } = await supabase
    .from('itinerary')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) console.error('Itinerary updaten:', error)
  return data
}

export async function deleteItineraryItem(id) {
  const { error } = await supabase.from('itinerary').delete().eq('id', id)
  if (error) console.error('Itinerary verwijderen:', error)
}

export function subscribeToItinerary(callback) {
  return supabase
    .channel('itinerary-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'itinerary' }, callback)
    .subscribe()
}

// ── Memories / Foto's ────────────────────────────────
export async function getMemories() {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Memories ophalen:', error)
  return data || []
}

export async function uploadMemory(file, userId) {
  const ext = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${ext}`
  const { data: storageData, error: storageError } = await supabase.storage
    .from('memories')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (storageError) {
    console.error('Foto uploaden:', storageError)
    return null
  }
  const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(fileName)
  return publicUrl
}

export async function addMemory(memory) {
  const { data, error } = await supabase
    .from('memories')
    .insert(memory)
    .select()
    .single()
  if (error) console.error('Memory toevoegen:', error)
  return data
}

export async function toggleMemoryLike(id, userId) {
  const { data: memory } = await supabase.from('memories').select('liked_by').eq('id', id).single()
  if (!memory) return
  const liked = memory.liked_by || []
  const newLiked = liked.includes(userId)
    ? liked.filter(u => u !== userId)
    : [...liked, userId]
  const { data, error } = await supabase
    .from('memories')
    .update({ liked_by: newLiked })
    .eq('id', id)
    .select()
    .single()
  if (error) console.error('Like toggling:', error)
  return data
}

export async function deleteMemory(id, url) {
  const fileName = url.split('/').pop()
  await supabase.storage.from('memories').remove([fileName])
  const { error } = await supabase.from('memories').delete().eq('id', id)
  if (error) console.error('Memory verwijderen:', error)
}

export function subscribeToMemories(callback) {
  return supabase
    .channel('memories-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, callback)
    .subscribe()
}

// ── Notes ────────────────────────────────────────────
export async function getNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) console.error('Notities ophalen:', error)
  return data || []
}

export async function addNote(note) {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()
  if (error) console.error('Notitie toevoegen:', error)
  return data
}

export async function updateNote(id, updates) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) console.error('Notitie updaten:', error)
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) console.error('Notitie verwijderen:', error)
}

export function subscribeToNotes(callback) {
  return supabase
    .channel('notes-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, callback)
    .subscribe()
}

// ── Budget ───────────────────────────────────────────
export async function getBudget() {
  const { data, error } = await supabase
    .from('budget')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') console.error('Budget ophalen:', error)
  return data
}

export async function setBudget(totalBudget, currency = 'EUR') {
  const { data: existing } = await supabase.from('budget').select('id').limit(1).single()
  if (existing) {
    const { data, error } = await supabase
      .from('budget')
      .update({ total_budget: totalBudget, currency, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) console.error('Budget updaten:', error)
    return data
  } else {
    const { data, error } = await supabase
      .from('budget')
      .insert({ total_budget: totalBudget, currency })
      .select()
      .single()
    if (error) console.error('Budget aanmaken:', error)
    return data
  }
}

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
  if (error) console.error('Uitgaven ophalen:', error)
  return data || []
}

export async function addExpense(expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()
  if (error) console.error('Uitgave toevoegen:', error)
  return data
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) console.error('Uitgave verwijderen:', error)
}
