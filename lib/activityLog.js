import { supabase } from './supabase'

// Centraal activiteiten-log systeem
export async function logActivity(type, description, createdBy, data = null) {
  try {
    await supabase.from('activity_log').insert({
      type,
      description,
      created_by: createdBy,
      data,
    })
  } catch (e) {
    // Stil falen — activiteitslog is niet kritiek
  }
}

// Specifieke log-helpers
export const Log = {
  foto: (naam, door) => logActivity('foto', `📸 ${door === 'lilia' ? 'Lilia' : 'Abdul'} voegde een foto toe${naam ? ': ' + naam : ''}`, door),
  uitgave: (bedrag, cat, valuta, door) => logActivity('uitgave', `💸 ${door === 'lilia' ? 'Lilia' : 'Abdul'} noteerde ${valuta} ${bedrag} voor ${cat}`, door, { bedrag, cat, valuta }),
  reis: (activiteit, datum, door) => logActivity('reis', `🗺️ ${door === 'lilia' ? 'Lilia' : 'Abdul'} voegde toe: ${activiteit} op ${datum}`, door),
  vlucht: (nr, van, naar, door) => logActivity('vlucht', `✈️ ${door === 'lilia' ? 'Lilia' : 'Abdul'} voegde vlucht ${nr} toe (${van} → ${naar})`, door),
  notitie: (inhoud, door) => logActivity('notitie', `📝 ${door === 'lilia' ? 'Lilia' : 'Abdul'} schreef een notitie`, door, { preview: inhoud.substring(0, 50) }),
  plek: (naam, door) => logActivity('plek', `❤️ ${door === 'lilia' ? 'Lilia' : 'Abdul'} bewaarde: ${naam}`, door),
  lijst: (item, door) => logActivity('lijst', `✅ ${door === 'lilia' ? 'Lilia' : 'Abdul'} vinkte af: ${item}`, door),
  budget: (totaal, valuta, door) => logActivity('budget', `💰 ${door === 'lilia' ? 'Lilia' : 'Abdul'} stelde budget in: ${valuta} ${totaal}`, door),
}

export async function getActivityLog(limit = 50) {
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

export function subscribeToActivity(callback) {
  return supabase.channel('activity')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, callback)
    .subscribe()
}
