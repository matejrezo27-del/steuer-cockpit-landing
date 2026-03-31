-- Demo-Daten Update fuer Demo-Video (31.03.2026)
-- Voraussetzung: Demo-Accounts existieren bereits in Supabase Auth
-- Dieses Skript ergaenzt/aktualisiert die bestehenden Demo-Daten

-- ===== 1. Profile aktualisieren =====
-- Fachkraft-Profil mit Name versehen
DO $$
DECLARE
  fachkraft_id uuid;
  stb_id uuid;
  mandant_user_id uuid;
BEGIN
  SELECT id INTO fachkraft_id FROM auth.users WHERE email = 'fachkraft@demo-cockpit.example.com';
  SELECT id INTO stb_id FROM auth.users WHERE email = 'stb@demo-cockpit.example.com';
  SELECT id INTO mandant_user_id FROM auth.users WHERE email = 'mandant@demo-cockpit.example.com';

  -- Fachkraft-Profil aktualisieren
  IF fachkraft_id IS NOT NULL THEN
    UPDATE public.profiles
    SET vorname = 'Sarah', nachname = 'Fischer', aktiv = true
    WHERE id = fachkraft_id;
  END IF;

  -- STB-Profil aktualisieren
  IF stb_id IS NOT NULL THEN
    UPDATE public.profiles
    SET vorname = 'Dr. Thomas', nachname = 'Bergmann'
    WHERE id = stb_id;
  END IF;

  -- Mandant mit User verknuepfen (Müller Webdesign)
  IF mandant_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET vorname = 'Anna', nachname = 'Müller'
    WHERE id = mandant_user_id;

    UPDATE public.mandanten
    SET user_id = mandant_user_id
    WHERE firmenname = 'Müller Webdesign'
      AND user_id IS NULL;
  END IF;

  -- ===== 2. Fachkraft-Zuweisung =====
  IF fachkraft_id IS NOT NULL THEN
    -- Mueller Webdesign + Weber Fotografie der Fachkraft zuweisen
    UPDATE public.mandanten
    SET zustaendig_id = fachkraft_id
    WHERE firmenname IN ('Müller Webdesign', 'Weber Fotografie');

    -- Schmidt Online-Shop bleibt ohne Zuweisung (damit STB den Unterschied sieht)
  END IF;

  -- ===== 3. Weitere Belege fuer Maerz 2026 (aktueller Monat) =====
  -- Damit das Dashboard im Video aktuelle Zahlen zeigt

  -- Neue Belege fuer Mueller Webdesign (Maerz)
  INSERT INTO public.belege (mandant_id, typ, datum, netto, brutto, mwst_satz, mwst_betrag, lieferant_kunde, rechnungsnummer, beschreibung, zahlungsstatus, monat, jahr, steuerart, skr03_konto)
  SELECT m.id, 'ausgang', '2026-03-28', 1750.00, 2082.50, 19, 332.50, 'Praxis Dr. Klein', 'RN-2026-006', 'Website-Relaunch Phase 2', 'offen', 3, 2026, 'steuerpflichtig_19', '8400'
  FROM public.mandanten m WHERE m.firmenname = 'Müller Webdesign'
  AND NOT EXISTS (SELECT 1 FROM public.belege WHERE rechnungsnummer = 'RN-2026-006');

  -- Neue Belege fuer Weber Fotografie (Maerz)
  INSERT INTO public.belege (mandant_id, typ, datum, netto, brutto, mwst_satz, mwst_betrag, lieferant_kunde, rechnungsnummer, beschreibung, zahlungsstatus, monat, jahr, steuerart, skr03_konto)
  SELECT m.id, 'ausgang', '2026-03-22', 2200.00, 2618.00, 19, 418.00, 'Hotel Luisenhof', 'FOTO-003', 'Business-Portraits Fuehrungsteam', 'offen', 3, 2026, 'steuerpflichtig_19', '8400'
  FROM public.mandanten m WHERE m.firmenname = 'Weber Fotografie'
  AND NOT EXISTS (SELECT 1 FROM public.belege WHERE rechnungsnummer = 'FOTO-003');

  -- ===== 4. Frische Aufgaben (damit Video aktuelle Daten zeigt) =====

  -- Neue offene Aufgabe fuer Weber Fotografie
  INSERT INTO public.aufgaben (mandant_id, kanzlei_id, erstellt_von, titel, beschreibung, typ, prioritaet, frist, status)
  SELECT m.id, m.kanzlei_id, stb_id, 'Fahrtenbuch Maerz nachreichen', 'Bitte das Fahrtenbuch fuer Maerz hochladen.', 'sonstiges', 'normal', '2026-04-15', 'offen'
  FROM public.mandanten m WHERE m.firmenname = 'Weber Fotografie'
  AND stb_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.aufgaben WHERE titel = 'Fahrtenbuch Maerz nachreichen');

END $$;

-- ===== 5. Monatsabschluss auf 2026 aktualisieren =====
-- Die bestehenden Demo-Daten nutzen 2025 — wir brauchen auch 2026-Eintraege

DO $$
DECLARE
  m1_id uuid;
  m2_id uuid;
  m3_id uuid;
  stb_id uuid;
BEGIN
  SELECT id INTO m1_id FROM public.mandanten WHERE firmenname = 'Müller Webdesign' LIMIT 1;
  SELECT id INTO m2_id FROM public.mandanten WHERE firmenname = 'Schmidt Online-Shop' LIMIT 1;
  SELECT id INTO m3_id FROM public.mandanten WHERE firmenname = 'Weber Fotografie' LIMIT 1;
  SELECT id INTO stb_id FROM auth.users WHERE email = 'stb@demo-cockpit.example.com';

  IF m1_id IS NOT NULL THEN
    INSERT INTO public.monatsabschluss (mandant_id, jahr, monat, status, festgeschrieben_von, festgeschrieben_am) VALUES
      (m1_id, 2026, 1, 'exportiert', stb_id, '2026-02-08'),
      (m1_id, 2026, 2, 'festgeschrieben', stb_id, '2026-03-09'),
      (m1_id, 2026, 3, 'in_pruefung', NULL, NULL)
    ON CONFLICT (mandant_id, jahr, monat) DO NOTHING;
  END IF;

  IF m2_id IS NOT NULL THEN
    INSERT INTO public.monatsabschluss (mandant_id, jahr, monat, status) VALUES
      (m2_id, 2026, 1, 'exportiert'),
      (m2_id, 2026, 2, 'festgeschrieben'),
      (m2_id, 2026, 3, 'offen')
    ON CONFLICT (mandant_id, jahr, monat) DO NOTHING;
  END IF;

  IF m3_id IS NOT NULL THEN
    INSERT INTO public.monatsabschluss (mandant_id, jahr, monat, status) VALUES
      (m3_id, 2026, 1, 'festgeschrieben'),
      (m3_id, 2026, 2, 'offen'),
      (m3_id, 2026, 3, 'offen')
    ON CONFLICT (mandant_id, jahr, monat) DO NOTHING;
  END IF;
END $$;
