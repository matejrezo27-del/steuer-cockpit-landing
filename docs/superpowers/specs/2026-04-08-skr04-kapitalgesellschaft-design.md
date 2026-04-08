# SKR04 / Kapitalgesellschaft Support — Design Spec

**Datum:** 08.04.2026  
**Status:** Geplant  
**Ziel:** Steuerbase soll neben Einzelunternehmen (SKR03/EÜR) auch Kapitalgesellschaften (GmbH, UG, AG) mit SKR04/Bilanz unterstützen.

---

## Ausgangslage

- Datenbank: `mandanten.kontenrahmen` unterstützt bereits `'SKR03'` und `'SKR04'`
- Datenbank: `mandanten.rechtsform` Feld existiert bereits
- Datenbank: `belege.skr03_konto` speichert Kontonummern als TEXT (funktioniert für beide)
- Frontend: Dropdown für Kontenrahmen-Auswahl existiert in Mandanten-Verwaltung
- Aktuell: Alle Logik ist hardcoded auf SKR03 (12 Konten in `skr03.ts`)

---

## Phase A — SKR04 Buchungskonten (Priorität: JETZT)

### A1: SKR04 Kontendefinitionen

**Neue Datei:** `src/lib/skr04.ts`

Konten nach Bilanzgliederungsprinzip:

**Erlöskonten (Klasse 4):**
| Konto | Name | Anwendung |
|-------|------|-----------|
| 4000 | Umsatzerlöse 19% | Standard-Dienstleistungen/Waren |
| 4100 | Umsatzerlöse 7% | Ermäßigter Steuersatz |
| 4120 | Steuerfreie Umsätze | Exporte, EU-Lieferungen |
| 4200 | Sonstige betriebliche Erträge | Nebeneinnahmen |

**Zahlungskonten (Klasse 1):**
| Konto | Name |
|-------|------|
| 1600 | Kasse (Bargeld) |
| 1800 | Bank (Geschäftskonto) |

**Steuerkonten:**
| Konto | Name |
|-------|------|
| 1570 | Vorsteuer 19% |
| 1571 | Vorsteuer 7% |
| 3730 | Umsatzsteuer 19% |

**Ausgabenkonten (Klasse 5-7):**
| Konto | Name | Kategorie |
|-------|------|-----------|
| 5000 | Wareneinkauf 19% | Material |
| 5100 | Wareneinkauf 7% | Material |
| 5900 | Fremdleistungen | Material |
| 6010 | Geschäftsführer-Gehalt | Personal |
| 6020 | Gehälter Arbeitnehmer | Personal |
| 6110 | Gesetzl. Sozialaufwendungen | Personal |
| 7100 | Miete und Pacht | Betrieb |
| 7200 | Versicherungen | Betrieb |
| 7300 | Fahrzeugkosten | Betrieb |
| 7400 | Marketing & Werbung | Betrieb |
| 7500 | Reisekosten | Betrieb |
| 7600 | Software & Bürokosten | Betrieb |
| 7650 | Telefon / Internet | Betrieb |
| 7680 | Porto | Betrieb |
| 7690 | Bankgebühren | Betrieb |
| 7800 | Abschreibungen (AfA) | Betrieb |
| 8000 | Zinsaufwand | Finanzen |

**Steueraufwand (Klasse 8):**
| Konto | Name |
|-------|------|
| 8200 | Körperschaftsteuer |
| 8220 | Gewerbesteuer |
| 8240 | Solidaritätszuschlag |

### A2: Abstrahierte Konten-Logik

**Neue Datei:** `src/lib/kontenrahmen.ts`

```
getKonten(rahmen: 'SKR03' | 'SKR04') → KontoDefinition[]
getKontoLabel(rahmen, nummer) → string
getKontoOptions(rahmen, belegTyp) → KontoOption[]
suggestKonto(rahmen, beleg) → string | null
getGegenkonto(rahmen, zahlungsart) → string
getDefaultKonto(rahmen, typ) → string   // Fallback für DATEV
```

**Mapping-Tabelle SKR03 ↔ SKR04 (für Migration/Vergleich):**
| Zweck | SKR03 | SKR04 |
|-------|-------|-------|
| Erlöse 19% | 8400 | 4000 |
| Erlöse 7% | 8300 | 4100 |
| Steuerfrei | 8120 | 4120 |
| Bank | 1001 | 1800 |
| Kasse | 1000 | 1600 |
| Vorsteuer 19% | 1576 | 1570 |
| USt 19% | 1776 | 3730 |
| Marketing | 4100 | 7400 |
| Software | 4946 | 7600 |
| Bankgebühren | 4970 | 7690 |
| Reisekosten | 4660 | 7500 |
| Sonstige Ausg. | 4900 | 7690 |
| Privateinlage | 1890 | 2180 |
| Privatentnahme | 1800 | 2100 |
| §13b Rev.Charge | 3125 | 5900 |

### A3: Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/skr03.ts` | Bleibt, wird aber über `kontenrahmen.ts` aufgerufen |
| `src/lib/skr04.ts` | NEU — SKR04-Konten und Auto-Vorschläge |
| `src/lib/kontenrahmen.ts` | NEU — Abstraktionsschicht |
| `src/lib/datevExport.ts` | Gegenkonto + Fallback-Konten aus `kontenrahmen.ts` laden |
| `src/lib/datevConfig.ts` | `getGegenkonto()` rahmenabhängig machen |
| `src/pages/EUR.tsx` | ELSTER-Zeilen-Mapping für SKR04 einbauen |
| `src/pages/BWA.tsx` | Kontogruppen rahmenabhängig laden |
| `src/pages/UStVA.tsx` | Gegenkonto + §13b-Konto rahmenabhängig |
| `src/pages/stb/MeineAufgaben.tsx` | Auto-Erkennung rahmenabhängig (1890→2180 etc.) |
| `src/pages/Belege.tsx` | Konto-Dropdown zeigt richtige Konten |
| `src/pages/Erfassen.tsx` | Konto-Auswahl rahmenabhängig |
| `src/components/dashboard/ClaudeKorrektur.tsx` | Korrektur-Vorschläge rahmenabhängig |

### A4: Compliance-Prüfung (Phase A)

- [x] Steuerschlüssel bleiben identisch (1, 2, 3, 4, 0, 84) — SKR-unabhängig
- [x] S/H-Richtung bleibt identisch — SKR-unabhängig
- [x] DATEV-Format bleibt identisch — nur Kontonummern ändern sich
- [x] ELSTER-Kennzahlen (81, 66, 52, 60, 83) bleiben identisch — USt ist SKR-unabhängig
- [x] GoBD-Regeln gelten für beide gleich (8-Tage-Frist, Belegnummern, Audit-Trail)
- [x] Disclaimer: "Ersetzt keine steuerliche Beratung" muss bleiben

---

## Phase B — Bilanz & GmbH-Steuern (Priorität: NÄCHSTE SESSION)

### B1: Bilanz-Ansicht (neue Seite)

Statt EÜR zeigt ein GmbH-Mandant die **Bilanz-Ansicht**:

**Aktiva (links):**
- Anlagevermögen (Klasse 0: 0100-0999)
- Umlaufvermögen (Klasse 1: 1000-1999)

**Passiva (rechts):**
- Eigenkapital (Klasse 2: 2000-2999)
- Rückstellungen (2990er)
- Verbindlichkeiten (Klasse 3: 3000-3999)

**Summe Aktiva muss = Summe Passiva** (Prüfhinweis wenn nicht)

### B2: GuV statt EÜR

Für GmbH-Mandanten wird statt der EÜR-Seite eine **GuV** (Gewinn- und Verlustrechnung) angezeigt:

```
  Umsatzerlöse (Klasse 4)
- Materialaufwand (Klasse 5)
- Personalaufwand (Klasse 6)
- Betriebliche Aufwendungen (Klasse 7)
+ Sonstige Erträge
- Finanzaufwand (Klasse 8)
- Steuern (8200, 8220, 8240)
────────────────────────────
= Jahresüberschuss / Jahresfehlbetrag
```

### B3: KSt/GewSt-Berechnung

**Körperschaftsteuer:**
- 15% flat auf Gewinn
- Soli: 5,5% auf KSt (effektiv 15,825%)

**Gewerbesteuer:**
- Messzahl 3,5% × Hebesatz (pro Mandant konfigurierbar)
- Kein Freibetrag für Kapitalgesellschaften

**Neues Feld:** `mandanten.gewerbesteuer_hebesatz` (INTEGER, Default 400)

### B4: Vorauszahlungs-Erinnerungen

- KSt-Vorauszahlungen: 10.03. / 10.06. / 10.09. / 10.12.
- GewSt-Vorauszahlungen: 15.02. / 15.05. / 15.08. / 15.11.
- Als Prüfhinweise im System anzeigen

### B5: Neue Datenbank-Felder

```sql
ALTER TABLE mandanten ADD COLUMN IF NOT EXISTS gewerbesteuer_hebesatz INTEGER DEFAULT 400;
ALTER TABLE mandanten ADD COLUMN IF NOT EXISTS stammkapital NUMERIC(12,2);
ALTER TABLE mandanten ADD COLUMN IF NOT EXISTS handelsregister TEXT;  -- z.B. "HRB 12345"
```

---

## Phase C — Volle GmbH-Suite (Priorität: SPÄTER)

### C1: Holding-Unterstützung

- Mandant-Typ: "Holding" als Rechtsform
- Beteiligungsverzeichnis: Welche GmbH hält Anteile an welcher
- §8b KStG Steuerfreistellung: 95% der Dividenden steuerfrei
- Schachtelprivileg-Prüfung (ab 15% Beteiligung)

### C2: vGA-Prüfung (Verdeckte Gewinnausschüttung)

Automatische Prüfhinweise für:
- GF-Gehalt über Branchenvergleich (Fremdvergleich)
- Private Ausgaben auf Firmenkonto
- Zinslose Gesellschafter-Darlehen
- Rückwirkende Tantiemevereinbarungen

### C3: Bundesanzeiger-Erinnerung

- Automatische Erinnerung: "Jahresabschluss muss bis [Datum] im Bundesanzeiger veröffentlicht werden"
- Frist: 12 Monate nach Geschäftsjahresende
- Prüfhinweis-Typ: "kritisch" wenn Frist < 30 Tage

### C4: Gewinnverwendungsbeschluss

- Gesellschafterversammlung: Protokoll-Vorlage
- Optionen: Thesaurierung, Ausschüttung, Rücklagen
- Berechnung Kapitalertragsteuer bei Ausschüttung (26,375%)

### C5: Eigenkapitalveränderungsrechnung

- Stammkapital → Veränderungen → Gewinnvortrag → Jahresüberschuss
- Übersicht über mehrere Jahre

---

## Technische Architektur

### Konten-System (Phase A)

```
src/lib/
  ├── kontenrahmen.ts      ← NEU: Abstraktionsschicht
  ├── skr03.ts             ← Bestehend: SKR03-Definitionen
  ├── skr04.ts             ← NEU: SKR04-Definitionen
  ├── datevExport.ts       ← Anpassen: rahmenabhängig
  └── datevConfig.ts       ← Anpassen: rahmenabhängig
```

### Mandant-Context

Der `useMandant()` Hook liefert bereits `kontenrahmen`. Alle Komponenten lesen den Kontenrahmen des aktiven Mandanten und laden die passenden Konten.

### Prüfhinweise

Bestehende Prüflogik in `src/lib/kiFlags.ts` wird erweitert:
- "Falscher Kontenrahmen" — SKR03-Konto bei SKR04-Mandant (und umgekehrt)
- "Unbekanntes Konto" — Kontonummer passt zu keinem der beiden Rahmen

---

## Compliance-Checkliste

| Regel | Status | Anmerkung |
|-------|--------|-----------|
| DATEV-Export korrekte Kontonummern | Offen | SKR04-Konten im Export |
| ELSTER UStVA Kennzahlen | OK | Identisch für SKR03/SKR04 |
| GoBD Belegpflichten | OK | Identisch für beide |
| Steuerschlüssel (1-4, 0, 84) | OK | SKR-unabhängig |
| §13b Reverse Charge | Offen | Konto 5900 statt 3125 |
| Disclaimer "keine Steuerberatung" | OK | Bereits vorhanden |
| KSt/GewSt-Berechnung korrekt | Phase B | 15% + Hebesatz |
| vGA-Warnung | Phase C | Fremdvergleich |
| Bundesanzeiger-Frist | Phase C | 12 Monate |

---

## Nicht im Scope

- Lohnbuchhaltung / Gehaltsabrechnung (bleibt beim Steuerberater)
- Konzernabschluss (zu komplex, braucht WP)
- Kapitalertragsteuer-Anmeldung (Sonderthema)
- Internationale Verrechnungspreise
