-- Voer dit uit in Supabase > SQL Editor
-- Project: honeymoon-hq

-- Countdown tabel
CREATE TABLE IF NOT EXISTS countdown (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_date date NOT NULL,
  partner1 text DEFAULT 'Abdul',
  partner2 text DEFAULT 'Lilia',
  updated_at timestamptz DEFAULT now()
);

-- Itinerary tabel
CREATE TABLE IF NOT EXISTS itinerary (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  location text,
  activity text NOT NULL,
  hotel text,
  notes text,
  time_slot text DEFAULT 'Ochtend',
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Herinneringen tabel
CREATE TABLE IF NOT EXISTS memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text NOT NULL,
  caption text,
  location text,
  liked_by text[] DEFAULT '{}',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Notities tabel
CREATE TABLE IF NOT EXISTS notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  category text DEFAULT 'idee',
  pinned boolean DEFAULT false,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Budget tabel
CREATE TABLE IF NOT EXISTS budget (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  total_budget numeric DEFAULT 0,
  currency text DEFAULT 'EUR',
  updated_at timestamptz DEFAULT now()
);

-- Uitgaven tabel
CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  amount numeric NOT NULL,
  category text NOT NULL,
  description text,
  date date DEFAULT CURRENT_DATE,
  added_by text,
  created_at timestamptz DEFAULT now()
);

-- RLS uitschakelen (prive app, geen login systeem)
ALTER TABLE countdown   DISABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary   DISABLE ROW LEVEL SECURITY;
ALTER TABLE memories    DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes       DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget      DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses    DISABLE ROW LEVEL SECURITY;

-- Storage bucket aanmaken voor foto's
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage beleid: iedereen mag lezen en uploaden
CREATE POLICY IF NOT EXISTS "Public memories access"
  ON storage.objects FOR ALL
  USING (bucket_id = 'memories')
  WITH CHECK (bucket_id = 'memories');
