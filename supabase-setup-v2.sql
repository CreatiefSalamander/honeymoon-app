-- ══════════════════════════════════════════════════════
-- HONEYMOON APP v2 — Supabase SQL Setup
-- Voer uit in: supabase.com → project honeymoon-hq → SQL Editor
-- ══════════════════════════════════════════════════════

-- Bestaande tabellen bijwerken (behoud data)
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS type text DEFAULT 'activiteit';
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS lat float8;
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS lng float8;
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS place_id text;
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE itinerary ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE memories ADD COLUMN IF NOT EXISTS place_id text;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS lat float8;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS lng float8;

-- Nieuwe tabellen
CREATE TABLE IF NOT EXISTS flights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid,
  flight_no text NOT NULL,
  airline text,
  from_code text,
  to_code text,
  depart_at timestamptz,
  arrive_at timestamptz,
  seat text,
  confirmation text,
  doc_url text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid,
  type text NOT NULL,         -- packing, bucket, todo, shopping
  title text NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS list_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid REFERENCES lists(id) ON DELETE CASCADE,
  text text NOT NULL,
  checked boolean DEFAULT false,
  meta jsonb,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_places (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid,
  place_id text UNIQUE,
  name text,
  category text,
  lat float8,
  lng float8,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Voeg paid_by toe aan expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS paid_by text;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url text;

-- RLS uitschakelen (privé app voor 2 personen)
ALTER TABLE flights       DISABLE ROW LEVEL SECURITY;
ALTER TABLE lists         DISABLE ROW LEVEL SECURITY;
ALTER TABLE list_items    DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places  DISABLE ROW LEVEL SECURITY;

-- Realtime aanzetten voor nieuwe tabellen
-- (in Supabase dashboard: Database → Replication → schakel aan voor flights, lists, list_items)

-- Storage bucket voor documenten
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('docs', 'docs', false, 52428800)  -- 50MB, niet-publiek
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- KLAAR! Alle tabellen zijn aangemaakt/bijgewerkt.
-- ══════════════════════════════════════════════════════
