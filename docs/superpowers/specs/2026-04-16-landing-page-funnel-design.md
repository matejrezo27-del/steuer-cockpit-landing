# Steuerbase Landing Page Funnel — Design Spec

## Ziel

Den aktuellen CTA-Bereich (`#kontakt`) auf steuerbase.de durch einen 5-Step Booking-Funnel ersetzen (Perspective/ClickFunnels-Style). Der Interessent qualifiziert sich selbst, gibt Kontaktdaten ein und bucht direkt einen 30-Minuten Demo-Termin. Keine externen Tools, keine laufenden Kosten.

## Kontext

- **Repo:** `steuer-cockpit-landing` (GitHub: `matejrezo27-del/steuer-cockpit-landing`)
- **Lokaler Pfad:** `/Users/matejrezo/Desktop/test-cc/`
- **Deployment:** Vercel via Git Integration (Push auf `main` → auto-deploy)
- **Aktuell:** Statische HTML-Seite mit Inline-CSS/JS, kein Build-Step
- **Domain:** steuerbase.de
- **E-Mail:** `info@steuerbase.de` (Google Workspace)

## Architektur

```
steuer-cockpit-landing/
├── index.html                    ← Landing Page mit Funnel inline
├── vertrieb/landingpage/
│   └── index.html                ← Kopie (synchron halten)
├── api/
│   ├── calendar-slots.js         ← GET: Freie Slots aus Google Calendar
│   ├── book.js                   ← POST: Termin buchen + E-Mails senden
│   └── lib/
│       ├── google.js             ← Google OAuth2 Token-Handling
│       └── email.js              ← E-Mail-Templates + Gmail API Versand
└── vercel.json                   ← Routing (API + SPA Fallback)
```

## Frontend: 5-Step Funnel

### Fortschrittsbalken

Immer sichtbar oben im Funnel-Container. Zeigt 5 Punkte mit Labels:

- **Abgeschlossene Schritte:** Steuerbase-Blau (`#2563EB`), ausgefüllter Punkt
- **Aktueller Schritt:** Blauer Punkt mit Puls-Animation
- **Offene Schritte:** Grau (`#CBD5E1`), leerer Punkt
- Labels unter den Punkten: Kanzlei · DATEV · Herausforderung · Kontakt · Termin

### Schritt 1 — Kanzleigröße

- Überschrift: "Wie viele Mandanten betreut Ihre Kanzlei?"
- 4 große Auswahl-Buttons nebeneinander (2×2 auf Mobile):
  - `1–50` · `51–200` · `201–500` · `500+`
- **Auto-Advance:** Klick auf Button → speichert Wert → animiert zu Schritt 2
- Keine "Weiter"-Taste nötig

### Schritt 2 — DATEV-Nutzung

- Überschrift: "Nutzen Sie aktuell DATEV?"
- 3 Buttons: `Ja` · `Nein` · `Andere Software`
- **Auto-Advance** bei Klick

### Schritt 3 — Größte Herausforderung

- Überschrift: "Was ist Ihre größte Herausforderung?"
- 4 Buttons: `Fachkräftemangel` · `Digitalisierung` · `Mandanten liefern nicht` · `Zu viel Routine`
- **Auto-Advance** bei Klick

### Schritt 4 — Kontaktdaten

- Überschrift: "Wie erreichen wir Sie?"
- Formularfelder:
  - Name (Pflicht)
  - Kanzleiname (Pflicht)
  - E-Mail (Pflicht, Format-Validierung)
  - Telefon (Pflicht)
- Button: "Weiter zur Terminauswahl →"
- Client-seitige Validierung vor Weiter

### Schritt 5 — Terminauswahl

- Überschrift: "Wann passt es Ihnen?"
- Kalender-UI:
  - Wochennavigation mit Pfeilen (← Diese Woche · Nächste Woche →)
  - Tages-Spalten Mo–Fr, Wochenenden ausgeblendet
  - Zeigt freie 30-Min-Slots als klickbare Chips (z.B. "10:00", "10:30", "14:00")
  - Nur Slots zwischen 9:00 und 18:00 Uhr
  - Vergangene Tage/Slots ausgeblendet
  - Ladeanzeige während API-Call
- Klick auf Slot → visuell markiert (blau)
- Button: "Termin buchen ✓" (erst aktiv wenn Slot gewählt)
- Loading-State auf dem Button während des API-Calls

### Bestätigungs-Screen

- Grüner Haken-Icon
- "Termin gebucht!"
- Zusammenfassung: Datum, Uhrzeit, Dauer (30 Min)
- "Sie erhalten eine Bestätigung an [E-Mail-Adresse]"
- "Bei Fragen: info@steuerbase.de oder +49 151 70857052"

### Navigation

- **Zurück-Pfeil** links oben ab Schritt 2 (geht einen Schritt zurück, Antwort bleibt erhalten)
- Schritte 1–3: Auto-Advance, kein extra Button
- Schritt 4: Expliziter "Weiter"-Button
- Schritt 5: Expliziter "Buchen"-Button
- Smooth Slide-Animation zwischen Schritten (CSS transition, links/rechts)

### Styling

- Passt zum bestehenden Landing-Page-Design (DM Sans, Fraunces, Steuerbase-Blau)
- Funnel-Container: weißer Hintergrund, abgerundete Ecken, subtiler Schatten
- Buttons: Steuerbase-Blau Outline, bei Hover/Selection gefüllt
- Responsive: funktioniert auf Desktop und Mobile
- Vanilla CSS inline im `<style>`-Block der `index.html`

## Backend: Vercel Serverless Functions

### `GET /api/calendar-slots`

**Query-Parameter:**
- `week` — ISO-Datum des Montags der angefragten Woche (z.B. `2026-04-20`)

**Einschränkungen:**
- Maximal 4 Wochen in die Zukunft buchbar
- Timezone: `Europe/Berlin`

**Ablauf:**
1. Berechne Start (Montag 00:00) und Ende (Freitag 23:59) der Woche in `Europe/Berlin`
2. Google Calendar FreeBusy API aufrufen für `info@steuerbase.de`
3. 30-Min-Raster generieren: 9:00, 9:30, 10:00, ..., 17:30 (letzter Start-Slot)
4. Belegte Zeiten rausfiltern
5. Vergangene Slots rausfiltern (wenn aktuelle Woche)
6. Puffer: 15 Minuten vor/nach gebuchten Terminen ebenfalls blockieren

**Response:**
```json
{
  "week": "2026-04-20",
  "slots": [
    { "date": "2026-04-21", "weekday": "Di", "time": "10:00", "datetime": "2026-04-21T10:00:00+02:00" },
    { "date": "2026-04-21", "weekday": "Di", "time": "10:30", "datetime": "2026-04-21T10:30:00+02:00" }
  ]
}
```

**Fehler:** `{ "error": "message" }` mit HTTP 500

### `POST /api/book`

**Request Body:**
```json
{
  "mandanten": "51–200",
  "datev": "Ja",
  "herausforderung": "Fachkräftemangel",
  "name": "Thomas Schmidt",
  "kanzlei": "Schmidt Consulting",
  "email": "schmidt@kanzlei.de",
  "telefon": "+49 511 1234567",
  "slot": "2026-04-21T10:00:00+02:00"
}
```

**Validierung:**
- Alle Felder Pflicht
- E-Mail-Format prüfen
- Slot muss in der Zukunft liegen
- Slot muss innerhalb Geschäftszeiten sein (Mo–Fr, 9–18 Uhr)
- Double-Booking-Check: FreeBusy nochmal prüfen bevor Event erstellt wird

**Ablauf (parallel wo möglich):**
1. Validierung
2. FreeBusy-Check (Race-Condition verhindern)
3. Google Calendar Event erstellen
4. E-Mail an Matej senden (Gmail API)
5. Bestätigungs-E-Mail an Interessent senden (Gmail API)

**Response:**
```json
{
  "success": true,
  "termin": {
    "datum": "Di, 21. April 2026",
    "uhrzeit": "10:00 Uhr",
    "dauer": "30 Minuten"
  }
}
```

**Fehler-Cases:**
- Slot inzwischen belegt → `{ "error": "slot_taken", "message": "Dieser Termin ist leider nicht mehr verfügbar." }` → Frontend zeigt Meldung und lädt Slots neu
- Validierung fehlgeschlagen → `{ "error": "validation", "message": "..." }`
- Google API Fehler → `{ "error": "server", "message": "..." }`

### `api/lib/google.js` — Google Auth

- OAuth2 Client mit Refresh Token
- Access Token wird bei jedem Request frisch geholt (Refresh Token läuft nicht ab)
- Credentials aus Vercel Environment Variables:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`
  - `GOOGLE_CALENDAR_ID` (= `info@steuerbase.de`)

### `api/lib/email.js` — E-Mail-Versand

Versendet über Gmail API (kein SMTP, kein externer Dienst).

**E-Mail an Matej** (`info@steuerbase.de`):
- Von: `info@steuerbase.de`
- An: `info@steuerbase.de`
- Betreff: "Neuer Demo-Termin — [Kanzleiname]"
- Body: Alle Funnel-Daten tabellarisch + Termin-Details

**Bestätigungs-E-Mail an Interessent:**
- Von: `info@steuerbase.de`
- An: E-Mail des Interessenten
- Betreff: "Ihr Steuerbase Demo-Termin am [Datum]"
- Body:
  - Persönliche Anrede
  - Termin-Details (Datum, Uhrzeit, 30 Minuten)
  - "Matej Rezo wird Sie unter [Telefon] anrufen."
  - Kontakt für Rückfragen

E-Mails als sauberes HTML mit Inline-Styles (E-Mail-kompatibel).

### Google Calendar Event

- **Titel:** "Steuerbase Demo — [Kanzleiname]"
- **Dauer:** 30 Minuten
- **Beschreibung:** Alle Funnel-Daten (Mandanten, DATEV, Herausforderung, Kontaktdaten)
- **Teilnehmer:** E-Mail des Interessenten (optional — sendet Google-Kalender-Einladung)
- **Erinnerung:** 15 Minuten vorher (Google Calendar Default)

## Google Cloud Einrichtung

### Einmalige Schritte

1. Google Cloud Projekt erstellen: "Steuerbase Funnel"
2. APIs aktivieren: Google Calendar API, Gmail API
3. OAuth Consent Screen konfigurieren
4. OAuth2 Client ID erstellen (Typ: Web Application)
5. Autorisierungs-Flow mit `info@steuerbase.de` durchlaufen
6. Refresh Token sichern
7. Vercel Environment Variables setzen

### Environment Variables (Vercel)

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=info@steuerbase.de
```

## Vercel-Konfiguration

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

## Error Handling

- **Kalender nicht erreichbar:** Funnel zeigt "Termine können gerade nicht geladen werden. Bitte kontaktieren Sie uns direkt: info@steuerbase.de"
- **Slot vergeben (Race Condition):** Meldung "Dieser Termin ist leider nicht mehr verfügbar" + Slots automatisch neu laden
- **E-Mail-Versand fehlgeschlagen:** Termin wird trotzdem erstellt, Matej bekommt Fallback-Info über Calendar-Event-Beschreibung
- **Netzwerk-Fehler:** Retry-Button im Frontend
- **Rate Limiting:** Maximal 5 Buchungen pro IP pro Stunde (einfacher In-Memory-Check in der Serverless Function, reicht gegen Missbrauch)

## Dateien die geändert werden

| Datei | Aktion |
|---|---|
| `index.html` | CTA-Sektion durch Funnel ersetzen, JS + CSS hinzufügen |
| `vertrieb/landingpage/index.html` | Kopie von `index.html` nach jeder Änderung (`cp index.html vertrieb/landingpage/index.html`) |
| `api/calendar-slots.js` | Neu — Freie Slots API |
| `api/book.js` | Neu — Buchungs-API |
| `api/lib/google.js` | Neu — Google Auth Helper |
| `api/lib/email.js` | Neu — E-Mail Templates + Versand |
| `vercel.json` | Neu — API Routing |
| `package.json` | Neu — googleapis Dependency |

## Kosten

- Google Calendar API: kostenlos (bis 1M Requests/Tag)
- Gmail API: kostenlos (bis 100 E-Mails/Tag, reicht dicke)
- Vercel Serverless Functions: kostenlos (Hobby Plan)
- **Gesamt: 0€/Monat**

## Nicht im Scope

- Analytics/Tracking der Funnel-Schritte (kann später ergänzt werden)
- Termin-Stornierung/Umbuchung durch den Interessenten
- Admin-Dashboard für Buchungsübersicht
- SMS-Erinnerungen
