-- ══════════════════════════════════════════════════════
-- HONEYMOON APP v3 — Voer uit in Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- Activiteiten-log voor Meldingen pagina
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  description text NOT NULL,
  created_by text,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Realtime aan voor activity_log
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;

-- Prijs kolom voor itinerary (voor budget-koppeling)
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS price numeric;

-- Saved places: voeg created_at toe als die ontbreekt
ALTER TABLE saved_places ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Index voor snelle queries
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_itinerary_date ON itinerary(date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- ══════════════════════════════════════════════════════
-- Realtime inschakelen (doe dit via Supabase Dashboard):
-- Database → Replication → Schakel aan voor: activity_log
-- ══════════════════════════════════════════════════════
