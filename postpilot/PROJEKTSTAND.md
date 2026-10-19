# Postpilot: Projektstand

Stand: 2026-10-19. Branch: `claude/postpilot-mvp` (Repo `steuer-cockpit-landing`, kein PR).

## Ziel
App, die gescannte Post (aus Caya) automatisch ausliest, daraus Aufgaben und Fristen macht, Antworten vorbereitet und als Brief über einen Postdienstleister versendet. Zielgruppe: Privatpersonen und kleine Selbstständige. Leitprinzip: Zero-Touch. Die App fragt nur nach, wenn sie unsicher ist, alles andere passiert still und ist rückgängig machbar.

Ablauf: Post → Caya scannt → E-Mail an die App → Regeln lesen aus (KI nur als Rückfall) → Aufgaben und Frist → Antwort in drei Tipps → Brief-PDF → Versand (bisher nur Trockenlauf).

## Links
- Artifact (privat, Version 3): https://claude.ai/artifact/GpRPXjJ3afPZNGJWa4AmPT

## Dateien
App (`postpilot/`):
- `index.html`: die App (mobil-first, Hell und Dunkel, bereits artifact-tauglich: kein `confirm`, kein Download, kein Print)
- `fristen.js`: deterministische Fristenlogik (Bekanntgabe +3 Tage, +1 Monat, Wochenende → Montag), mit `fristen.test.js`
- `postpilot-standalone.html`: Einzeldatei mit eingebetteter Fristenlogik (Doppelklick zum Öffnen)

Server (`api/`, Vercel-Stil):
- `lib/extract.js`: Regel-Erkennung ohne KI (IBAN mit Prüfsumme, Beträge, Fristen, Typ, Aufgabenvorlagen), Test `extract.test.js`
- `lib/analyse.js`: Regeln zuerst, KI nur bei Unsicherheit
- `lib/claude.js`: Aufruf der Claude-API (Modell per `ANTHROPIC_MODEL`, Standard `claude-sonnet-5-5`)
- `post-analyze.js`, `post-reply.js`: KI-Analyse und Antwortentwurf
- `inbound-mail.js`, `inbox.js`, `lib/store.js`, `lib/auth.js`: E-Mail-Posteingang über Redis-REST
- `lib/letter-pdf.js`, `post-letter.js`, `lib/versender.js`: Brief-PDF nach DIN 5008 und Versender (nur Trockenlauf)
- `lib/server.test.js`: Test für Posteingang und Brief

Tests ausführen: `node postpilot/fristen.test.js`, `node api/lib/extract.test.js`, `node api/lib/server.test.js`, `node api/lib/letter-pdf.test.js /tmp/x.pdf`.

Hinweis: Die Artifact-Variante wird aus `index.html` plus Rahmen und Farb-Tokens gebaut (Bauskript lag nur im Scratchpad und ist nicht im Repo). Die Hauptdatei `index.html` ist die Quelle.

## Umgebungsvariablen (für den echten Betrieb)
`ANTHROPIC_API_KEY`, `INBOUND_SECRET`, `POSTPILOT_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` (oder `UPSTASH_REDIS_REST_URL`/`_TOKEN`), optional `POSTPILOT_VERSENDER`.

## Erkenntnisse
- **Caya:** keine öffentliche API gefunden. Vorhanden sind Zapier (über E-Mail), Workflows, die ein Dokument aus einem Ordner per E-Mail weiterleiten, und eine DATEV-Anbindung. Der Weg über E-Mail geht ohne Genehmigung. Die Caya-Seiten waren aus der Sandbox nicht erreichbar, die Angaben stammen aus Suchergebnissen. Kein Scraping des Document Cockpit (vermutlich gegen die Nutzungsbedingungen).
- **Postversand:** Favorit zum Start ist LetterXpress (Deutschland, API, Base64-PDF, ältere Preise ca. 0,67–0,81 € netto pro Brief, aktuelle Preise und Einschreiben ungeklärt). Später die Deutsche Post E-POSTBUSINESS API (Partnervertrag, ca. 0,80 € s/w). Pingen unklar für Deutschland. Letterstream ist ein US-Dienst und scheidet aus.
- **Skills:** Es gibt keinen installierbaren Skill zum Finden von Skills. Die Suche ist in den Werkzeugen eingebaut. Document Vault und Email Triage sind Community-Plugins, nicht installiert.
- **Regel-Erkennung:** Alle vier Beispielbriefe werden ohne KI korrekt gelesen. Das ist nur an eigenen Beispielen getestet, nicht an echten Briefen.

## Offene Punkte
1. Echte, geschwärzte Briefe zum Testen der Regel-Erkennung beschaffen.
2. E-Mail-Posteingang einrichten: Redis-Speicher (Vercel KV oder Upstash), E-Mail-Dienst (z. B. Postmark, Mailgun, Cloudflare), Variablen setzen, Caya-Weiterleitung konfigurieren.
3. LetterXpress-Konto anlegen und nach Testmodus, Einschreiben und aktuellen Preisen fragen. Danach echten Versender anbinden.
4. Rechtliche Prüfung: Fristlogik, Schriftform (Unterschrift bei Kündigungen und Einsprüchen), Zustellnachweis, Datenschutz (Auftragsverarbeitung mit dem Postdienstleister).
5. Bei Caya nachfragen: API-Zugang, Partnerprogramm, ob die Weiterleitung PDF und Metadaten enthält.
6. Feiertage je Bundesland in die Fristberechnung aufnehmen.
7. Fristenregelwerk, Dokumenttypen-Katalog und Briefvorlagen als eigene Skills anlegen (mit `skill-creator`).
8. Später: Girocode (QR) für Überweisungen, Kalender-Sync, Konten und Cloud-Speicher, Push-Erinnerungen, Gmail-Antworten.
9. Preis und Marge für den Briefversand (Prepaid-Guthaben) festlegen, sobald Einkaufspreise feststehen.

## Entscheidungen
- Zero-Touch mit einer Ausnahme: Bei Steuerbescheiden, Mahnungen und Behördenpost gibt es einen Ein-Tipp-Check, wegen der Folgen falscher Fristen.
- Der Versand verlangt eine einzige Bestätigung, weil er Geld kostet und nicht rückholbar ist.
- Daten liegen vorerst lokal im Browser. Der Posteingang geht über einen Redis-Eingangskorb.
- Die KI rechnet keine Fristen. Sie liest nur Datum oder Regel, gerechnet wird in `fristen.js`.
