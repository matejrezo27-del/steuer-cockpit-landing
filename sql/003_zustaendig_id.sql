-- Sicherstellen dass zustaendig_id auf mandanten existiert
-- (Idempotent — kann mehrfach ausgefuehrt werden)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'mandanten'
    AND column_name = 'zustaendig_id'
  ) THEN
    ALTER TABLE public.mandanten
      ADD COLUMN zustaendig_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

    CREATE INDEX idx_mandanten_zustaendig ON public.mandanten(zustaendig_id);
  END IF;
END $$;

-- Demo-Zuweisung: Fachkraft-Demo-Account bekommt Mandant 1 und 3 zugewiesen
-- (STB behaelt alle im Ueberblick, Fachkraft sieht nur 2 von 3)
DO $$
DECLARE
  fachkraft_id uuid;
BEGIN
  SELECT id INTO fachkraft_id FROM auth.users
  WHERE email = 'fachkraft@demo-cockpit.example.com';

  IF fachkraft_id IS NOT NULL THEN
    -- Weise 2 von 3 Demo-Mandanten der Fachkraft zu
    UPDATE public.mandanten
    SET zustaendig_id = fachkraft_id
    WHERE firmenname IN ('Müller Webdesign', 'Weber Fotografie')
      AND zustaendig_id IS NULL;
  END IF;
END $$;
