# Life Dashboard – Design-Spezifikation

**Datum:** 31.03.2026
**Format:** Einzelne HTML-Datei
**Datenspeicherung:** LocalStorage (Browser)
**Charting:** Chart.js (CDN)
**Theme:** Dark

---

## Grundstruktur

Sidebar-Layout: Feste Navigation links, Hauptbereich rechts. 7 Bereiche:

1. Dashboard
2. Gesundheit
3. Ernährung
4. Tagesplan
5. Routinen
6. Aufgaben
7. Ziele

Alle Daten werden im LocalStorage gespeichert, pro Bereich ein eigener Key.

---

## 1. Dashboard (Startseite)

**Obere Reihe – KPI-Kacheln:**
- Aktuelles Gewicht + Trend-Pfeil (↓ grün Richtung Ziel, ↑ rot weg vom Ziel)
- kcal heute / Tagesziel (z.B. 1.840 / 2.200)
- Tasks erledigt heute (z.B. 5/8)
- Routinen erledigt heute (z.B. 3/5)

**Mittlere Reihe – Verlaufsgrafiken:**
- Gewichtskurve (letzte 30 Tage) – Chart.js Line Chart
- Kalorien-Verlauf (letzte 7 Tage) – Chart.js Bar Chart

**Untere Reihe – Schnellzugriff:**
- Heutiger Tagesplan als kompakte Vorschau
- Nächste 3 anstehende Aufgaben

---

## 2. Gesundheit

- **Gewicht-Eingabe:** Feld + automatisches Datum + Speichern-Button
- **Muskelmasse-Eingabe:** Gleiches Prinzip (kg oder %)
- **Zielwerte:** Einstellbar (z.B. Zielgewicht 78kg, Zielmuskelmasse 40%)
- **Verlaufskurven:** Chart.js Line Charts für beide Metriken
- **KPI-Kacheln:** Aktuell → Ziel, Differenz, Trend-Pfeil

---

## 3. Ernährung

- **Mahlzeiten pro Tag:** Frühstück, Mittagessen, Abendessen, Snacks
- **Pro Mahlzeit:** Name/Beschreibung + kcal + Protein (g) + Kohlenhydrate (g) + Fett (g)
- **Tagesübersicht:** Summe aller Makros vs. Tagesziel
- **Tagesziele einstellbar:** z.B. 2.200 kcal, 150g Protein, 250g Carbs, 70g Fett
- **Fortschrittsbalken:** Pro Makro farbig, füllt sich über den Tag

---

## 4. Tagesplan

- **Kalender-Ansicht:** Tagesansicht 06:00–22:00 (Zeitraum einstellbar)
- **Stundenraster:** Links die Uhrzeiten, rechts die Blöcke
- **Blöcke erstellen:** Klick auf Zeitslot → Name + Farbe + Kategorie eingeben
- **Drag & Drop:** Blöcke verschieben und in der Länge anpassen
- **Routinen-Blöcke:** Aus Routinen-Bereich als fertigen Block einplanbar
- **Navigation:** Pfeil-Buttons (Tag vor/zurück), "Heute"-Button, Datum-Anzeige
- **Farbschema Kategorien:**
  - Grün = Fitness/Gesundheit
  - Blau = Business
  - Lila = Persönlich
  - Orange = Routinen

**Drag & Drop Implementierung:** Nativer HTML5 Drag & Drop API. Blöcke sind draggable, Zeitslots sind Drop-Targets. Resize durch Ziehen am unteren Rand des Blocks.

---

## 5. Routinen

- **Routine erstellen:** Name + Einzelschritte mit geschätzter Dauer
- **Beispiel:** "Morgenroutine" → Aufstehen (5 Min), Wasser trinken (2 Min), Stretching (10 Min)
- **Gesamtdauer:** Automatisch berechnet aus Einzelschritten
- **Wiederholung:** Täglich, bestimmte Wochentage, oder manuell
- **Im Tagesplan:** Erscheint als zusammenhängender Block, aufklappbar zu Einzelschritten
- **Tägliche Checkliste:** Schritte einzeln abhaken, Fortschrittsbalken

---

## 6. Aufgaben

- **Kategorien:** Business / Privat (farblich getrennt: Blau / Lila)
- **Einmal-Aufgaben:** Titel, optionale Beschreibung, Fälligkeitsdatum, Priorität (hoch/mittel/niedrig)
- **Wiederkehrende Aufgaben:** + Wiederholungsregel (täglich, wöchentlich bestimmte Tage, monatlich)
- **Tägliche Anzeige:** Fällige wiederkehrende Aufgaben automatisch als offene Tasks
- **Erledigte Tasks:** Verschwinden aus aktiver Liste, bleiben im Verlauf

---

## 7. Ziele

- **Ziel erstellen:** Name, Kategorie (Gesundheit/Business/Persönlich), Startwert, Zielwert, Einheit
- **Beispiele:** "Gewicht → 78kg", "Umsatz → 10.000€/Monat", "50 Kunden"
- **KPI-Kachel pro Ziel:** Aktueller Wert, Zielwert, Trend-Pfeil, Prozent-Fortschritt
- **Verlaufsdiagramm:** Sparkline pro Ziel
- **Werte eintragen:** Manuell, oder bei Gewicht automatisch aus Gesundheits-Bereich
- **Status:** Als "erreicht" markierbar

---

## Technische Details

- **Eine HTML-Datei:** Alles inline (CSS + JS)
- **Externe Abhängigkeit:** Chart.js via CDN (`<script src="https://cdn.jsdelivr.net/npm/chart.js">`)
- **LocalStorage Keys:** `lifeos_health`, `lifeos_nutrition`, `lifeos_schedule`, `lifeos_routines`, `lifeos_tasks`, `lifeos_goals`, `lifeos_settings`
- **Dark Theme:** Hintergrund #0d1117, Sidebar #1a1a2e, Karten #1a1a2e, Text #e0e0e0, Akzent #64ffda
- **Drag & Drop:** HTML5 native API
- **Responsive:** Sidebar kollabiert auf kleinen Bildschirmen zu Icons
