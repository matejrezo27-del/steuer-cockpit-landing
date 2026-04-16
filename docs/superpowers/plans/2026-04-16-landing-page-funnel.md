# Steuerbase Landing Page Booking-Funnel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den CTA-Bereich auf steuerbase.de durch einen 5-Step Booking-Funnel ersetzen — mit Google Calendar Integration und Gmail E-Mails, ohne externe Tools.

**Architecture:** Statische HTML-Seite mit Inline-CSS/JS für den Funnel (Vanilla JS). Backend über Vercel Serverless Functions (`/api/`) für Google Calendar Slots und Buchung. Google OAuth2 mit Refresh Token für Calendar + Gmail API.

**Tech Stack:** Vanilla HTML/CSS/JS (kein Framework), Vercel Serverless Functions (Node.js), Google Calendar API, Gmail API, googleapis npm package.

---

## File Structure

| Datei | Verantwortung |
|---|---|
| `api/lib/google.js` | Google OAuth2 Client erstellen, Access Token holen |
| `api/lib/email.js` | E-Mail-Templates (HTML), Gmail API Versand |
| `api/calendar-slots.js` | GET-Endpoint: Freie 30-Min-Slots aus Google Calendar |
| `api/book.js` | POST-Endpoint: Validierung, Calendar Event, E-Mails |
| `package.json` | googleapis Dependency |
| `vercel.json` | API Routing |
| `index.html` | CTA-Sektion → Funnel HTML + CSS + JS |
| `vertrieb/landingpage/index.html` | Kopie von index.html |

---

## Task 1: Projekt-Setup (package.json + vercel.json)

**Files:**
- Create: `package.json`
- Create: `vercel.json`

- [ ] **Step 1: package.json erstellen**

```json
{
  "name": "steuer-cockpit-landing",
  "private": true,
  "dependencies": {
    "googleapis": "^144.0.0"
  }
}
```

- [ ] **Step 2: vercel.json erstellen**

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

- [ ] **Step 3: Dependencies installieren**

Run: `cd /Users/matejrezo/Desktop/test-cc && npm install`
Expected: `node_modules/` wird erstellt, `package-lock.json` generiert.

- [ ] **Step 4: .gitignore prüfen/erstellen**

Prüfe ob `.gitignore` existiert. Falls nicht, erstelle:

```
node_modules/
.env
```

Falls vorhanden, sicherstellen dass `node_modules/` und `.env` drin stehen.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vercel.json .gitignore
git commit -m "chore: Projekt-Setup für Vercel API Functions"
```

---

## Task 2: Google Auth Helper (api/lib/google.js)

**Files:**
- Create: `api/lib/google.js`

- [ ] **Step 1: Verzeichnis erstellen**

```bash
mkdir -p /Users/matejrezo/Desktop/test-cc/api/lib
```

- [ ] **Step 2: google.js schreiben**

```js
const { google } = require('googleapis');

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return client;
}

function getCalendar() {
  const auth = getOAuth2Client();
  return google.calendar({ version: 'v3', auth });
}

function getGmail() {
  const auth = getOAuth2Client();
  return google.gmail({ version: 'v1', auth });
}

function getCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || 'primary';
}

module.exports = { getOAuth2Client, getCalendar, getGmail, getCalendarId };
```

- [ ] **Step 3: Commit**

```bash
git add api/lib/google.js
git commit -m "feat: Google OAuth2 Auth Helper"
```

---

## Task 3: E-Mail Helper (api/lib/email.js)

**Files:**
- Create: `api/lib/email.js`

- [ ] **Step 1: email.js schreiben**

```js
const { getGmail } = require('./google');

function buildNotificationEmail(data) {
  const { name, kanzlei, email, telefon, mandanten, datev, herausforderung, termin } = data;
  const subject = `Neuer Demo-Termin — ${kanzlei}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #2563eb; margin-bottom: 24px;">Neuer Demo-Termin</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Kanzlei</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${kanzlei}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Name</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${name}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">E-Mail</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Telefon</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${telefon}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Mandanten</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${mandanten}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">DATEV</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${datev}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Herausforderung</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${herausforderung}</td></tr>
        <tr style="background: #f0f9ff;"><td style="padding: 12px; color: #2563eb; font-weight: 600;">Termin</td><td style="padding: 12px; font-weight: 600; color: #2563eb;">${termin.datum}, ${termin.uhrzeit} (30 Min)</td></tr>
      </table>
    </div>
  `;
  return { subject, html };
}

function buildConfirmationEmail(data) {
  const { name, kanzlei, email, telefon, termin } = data;
  const firstName = name.split(' ')[0];
  const subject = `Ihr Steuerbase Demo-Termin am ${termin.datum}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2563eb; font-size: 24px; margin: 0;">Steuerbase</h1>
      </div>
      <h2 style="color: #0f172a; margin-bottom: 8px;">Termin bestätigt!</h2>
      <p style="color: #475569; line-height: 1.6;">
        Hallo ${firstName},<br><br>
        Ihr Demo-Termin für <strong>${kanzlei}</strong> ist bestätigt.
      </p>
      <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #bfdbfe;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">TERMIN</p>
        <p style="margin: 0; font-size: 20px; font-weight: 600; color: #0f172a;">${termin.datum}</p>
        <p style="margin: 4px 0 0; font-size: 18px; color: #2563eb;">${termin.uhrzeit} — 30 Minuten</p>
      </div>
      <p style="color: #475569; line-height: 1.6;">
        Matej Rezo wird Sie unter <strong>${telefon}</strong> anrufen.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      <p style="color: #94a3b8; font-size: 13px; text-align: center;">
        Fragen? <a href="mailto:info@steuerbase.de" style="color: #2563eb;">info@steuerbase.de</a> · +49 151 70857052
      </p>
    </div>
  `;
  return { subject, html };
}

function encodeEmail({ from, to, subject, html }) {
  const message = [
    `From: Steuerbase <${from}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');
  return Buffer.from(message).toString('base64url');
}

async function sendEmail({ to, subject, html }) {
  const gmail = getGmail();
  const from = process.env.GOOGLE_CALENDAR_ID || 'info@steuerbase.de';
  const raw = encodeEmail({ from, to, subject, html });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
}

module.exports = { buildNotificationEmail, buildConfirmationEmail, sendEmail };
```

- [ ] **Step 2: Commit**

```bash
git add api/lib/email.js
git commit -m "feat: E-Mail Helper — Templates + Gmail API Versand"
```

---

## Task 4: Calendar Slots API (api/calendar-slots.js)

**Files:**
- Create: `api/calendar-slots.js`

- [ ] **Step 1: calendar-slots.js schreiben**

```js
const { getCalendar, getCalendarId } = require('./lib/google');

const WEEKDAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const SLOT_DURATION = 30;
const BUFFER_MINUTES = 15;
const START_HOUR = 9;
const END_HOUR = 18;
const MAX_WEEKS_AHEAD = 4;

function getWeekBounds(mondayStr) {
  // Parse as Europe/Berlin date
  const monday = new Date(mondayStr + 'T00:00:00+02:00');
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { start: monday, end: friday };
}

function generateSlotGrid(start, end) {
  const slots = [];
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Skip weekends
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        for (let min = 0; min < 60; min += SLOT_DURATION) {
          // Last slot starts at 17:30 (ends 18:00)
          if (hour === END_HOUR - 1 && min + SLOT_DURATION > 60) continue;
          const slotTime = new Date(current);
          slotTime.setHours(hour, min, 0, 0);
          slots.push(slotTime);
        }
      }
    }
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  return slots;
}

function isSlotFree(slotTime, busyPeriods) {
  const slotEnd = new Date(slotTime.getTime() + SLOT_DURATION * 60000);
  const bufferStart = new Date(slotTime.getTime() - BUFFER_MINUTES * 60000);
  const bufferEnd = new Date(slotEnd.getTime() + BUFFER_MINUTES * 60000);

  for (const busy of busyPeriods) {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    // Check overlap with buffer
    if (bufferEnd > busyStart && bufferStart < busyEnd) {
      return false;
    }
  }
  return true;
}

function formatSlot(slotTime) {
  const date = slotTime.toISOString().split('T')[0];
  const hours = String(slotTime.getHours()).padStart(2, '0');
  const minutes = String(slotTime.getMinutes()).padStart(2, '0');
  const weekday = WEEKDAYS_DE[slotTime.getDay()];
  return {
    date,
    weekday,
    time: `${hours}:${minutes}`,
    datetime: slotTime.toISOString(),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const weekParam = req.query.week;
    if (!weekParam || !/^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
      return res.status(400).json({ error: 'Parameter "week" fehlt oder ungültig (Format: YYYY-MM-DD)' });
    }

    // Check max weeks ahead
    const now = new Date();
    const requestedMonday = new Date(weekParam + 'T00:00:00+02:00');
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + MAX_WEEKS_AHEAD * 7);
    if (requestedMonday > maxDate) {
      return res.status(400).json({ error: 'Maximal 4 Wochen im Voraus buchbar.' });
    }

    const { start, end } = getWeekBounds(weekParam);
    const calendar = getCalendar();
    const calendarId = getCalendarId();

    // Get busy periods
    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: 'Europe/Berlin',
        items: [{ id: calendarId }],
      },
    });

    const busyPeriods = freeBusyRes.data.calendars[calendarId]?.busy || [];

    // Generate slots and filter
    const allSlots = generateSlotGrid(start, end);
    const freeSlots = allSlots
      .filter(slot => slot > now) // Remove past slots
      .filter(slot => isSlotFree(slot, busyPeriods))
      .map(formatSlot);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ week: weekParam, slots: freeSlots });
  } catch (err) {
    console.error('Calendar slots error:', err);
    return res.status(500).json({ error: 'Termine konnten nicht geladen werden.' });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add api/calendar-slots.js
git commit -m "feat: Calendar Slots API — freie 30-Min-Slots aus Google Calendar"
```

---

## Task 5: Booking API (api/book.js)

**Files:**
- Create: `api/book.js`

- [ ] **Step 1: book.js schreiben**

```js
const { getCalendar, getCalendarId } = require('./lib/google');
const { buildNotificationEmail, buildConfirmationEmail, sendEmail } = require('./lib/email');

const SLOT_DURATION = 30;
const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WEEKDAYS_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function validateBody(body) {
  const required = ['mandanten', 'datev', 'herausforderung', 'name', 'kanzlei', 'email', 'telefon', 'slot'];
  for (const field of required) {
    if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
      return `Feld "${field}" fehlt oder ist leer.`;
    }
  }
  // Email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Ungültige E-Mail-Adresse.';
  }
  // Slot must be valid ISO date
  const slotDate = new Date(body.slot);
  if (isNaN(slotDate.getTime())) {
    return 'Ungültiger Termin-Slot.';
  }
  // Slot must be in the future
  if (slotDate <= new Date()) {
    return 'Der gewählte Termin liegt in der Vergangenheit.';
  }
  // Slot must be Mon-Fri
  const day = slotDate.getDay();
  if (day === 0 || day === 6) {
    return 'Termine sind nur Mo–Fr verfügbar.';
  }
  // Slot must be 9-18
  const hour = slotDate.getHours();
  if (hour < 9 || hour >= 18) {
    return 'Termine sind nur zwischen 9:00 und 18:00 Uhr verfügbar.';
  }
  return null;
}

function formatTermin(slotDate) {
  const weekday = WEEKDAYS_DE[slotDate.getDay()];
  const day = slotDate.getDate();
  const month = MONTHS_DE[slotDate.getMonth()];
  const year = slotDate.getFullYear();
  const hours = String(slotDate.getHours()).padStart(2, '0');
  const minutes = String(slotDate.getMinutes()).padStart(2, '0');
  return {
    datum: `${weekday}, ${day}. ${month} ${year}`,
    uhrzeit: `${hours}:${minutes} Uhr`,
    dauer: '30 Minuten',
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Validate
    const validationError = validateBody(body);
    if (validationError) {
      return res.status(400).json({ error: 'validation', message: validationError });
    }

    const slotDate = new Date(body.slot);
    const slotEnd = new Date(slotDate.getTime() + SLOT_DURATION * 60000);
    const calendar = getCalendar();
    const calendarId = getCalendarId();

    // Double-booking check
    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: slotDate.toISOString(),
        timeMax: slotEnd.toISOString(),
        timeZone: 'Europe/Berlin',
        items: [{ id: calendarId }],
      },
    });

    const busyPeriods = freeBusyRes.data.calendars[calendarId]?.busy || [];
    if (busyPeriods.length > 0) {
      return res.status(409).json({
        error: 'slot_taken',
        message: 'Dieser Termin ist leider nicht mehr verfügbar. Bitte wählen Sie einen anderen.',
      });
    }

    const termin = formatTermin(slotDate);

    // Create calendar event
    const eventDescription = [
      `Kanzlei: ${body.kanzlei}`,
      `Name: ${body.name}`,
      `E-Mail: ${body.email}`,
      `Telefon: ${body.telefon}`,
      `Mandanten: ${body.mandanten}`,
      `DATEV: ${body.datev}`,
      `Herausforderung: ${body.herausforderung}`,
    ].join('\n');

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Steuerbase Demo — ${body.kanzlei}`,
        description: eventDescription,
        start: { dateTime: slotDate.toISOString(), timeZone: 'Europe/Berlin' },
        end: { dateTime: slotEnd.toISOString(), timeZone: 'Europe/Berlin' },
        attendees: [{ email: body.email }],
        reminders: { useDefault: true },
      },
    });

    // Send emails (parallel, don't block on failure)
    const emailData = { ...body, termin };
    const notif = buildNotificationEmail(emailData);
    const confirm = buildConfirmationEmail(emailData);

    await Promise.allSettled([
      sendEmail({ to: calendarId, subject: notif.subject, html: notif.html }),
      sendEmail({ to: body.email, subject: confirm.subject, html: confirm.html }),
    ]);

    return res.status(200).json({ success: true, termin });
  } catch (err) {
    console.error('Booking error:', err);
    return res.status(500).json({ error: 'server', message: 'Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.' });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add api/book.js
git commit -m "feat: Booking API — Termin erstellen + E-Mails senden"
```

---

## Task 6: Funnel CSS in index.html

**Files:**
- Modify: `index.html` (CSS im `<style>`-Block, vor dem schließenden `</style>`)
- Modify: `vertrieb/landingpage/index.html` (gleiche Änderung)

- [ ] **Step 1: Funnel-CSS einfügen**

Füge die folgenden CSS-Regeln **vor** dem schließenden `</style>`-Tag ein (nach den bestehenden `.cta-*` Regeln, vor `@keyframes`):

```css
  /* --- Funnel --- */
  .funnel-section {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 32px 100px;
  }
  .funnel-section .section-title {
    text-align: center;
    margin-bottom: 40px;
  }
  .funnel-container {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    position: relative;
    overflow: hidden;
  }

  /* Progress Bar */
  .funnel-progress {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    position: relative;
    padding: 0 8px;
  }
  .funnel-progress::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 28px;
    right: 28px;
    height: 3px;
    background: #e2e8f0;
    z-index: 0;
  }
  .funnel-progress-fill {
    position: absolute;
    top: 14px;
    left: 28px;
    height: 3px;
    background: #2563eb;
    z-index: 1;
    transition: width 0.4s ease;
  }
  .funnel-step-dot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 2;
    cursor: default;
  }
  .funnel-step-dot .dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid #e2e8f0;
    background: #fff;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .funnel-step-dot .dot svg {
    display: none;
    width: 14px;
    height: 14px;
  }
  .funnel-step-dot.completed .dot {
    background: #2563eb;
    border-color: #2563eb;
  }
  .funnel-step-dot.completed .dot svg {
    display: block;
  }
  .funnel-step-dot.active .dot {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.15);
    animation: funnelPulse 2s ease-in-out infinite;
  }
  .funnel-step-dot .label {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    white-space: nowrap;
  }
  .funnel-step-dot.active .label { color: #2563eb; font-weight: 600; }
  .funnel-step-dot.completed .label { color: #2563eb; }
  @keyframes funnelPulse {
    0%, 100% { box-shadow: 0 0 0 4px rgba(37,99,235,0.15); }
    50% { box-shadow: 0 0 0 8px rgba(37,99,235,0.08); }
  }

  /* Step Panels */
  .funnel-steps-wrapper {
    position: relative;
    overflow: hidden;
  }
  .funnel-step-panel {
    display: none;
    animation: funnelSlideIn 0.35s ease;
  }
  .funnel-step-panel.active {
    display: block;
  }
  @keyframes funnelSlideIn {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .funnel-step-panel h3 {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 600;
    color: #0f172a;
    text-align: center;
    margin-bottom: 28px;
    line-height: 1.3;
  }

  /* Choice Buttons */
  .funnel-choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .funnel-choice-btn {
    padding: 18px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }
  .funnel-choice-btn:hover {
    border-color: #2563eb;
    color: #2563eb;
    background: #f0f7ff;
  }
  .funnel-choice-btn.selected {
    border-color: #2563eb;
    background: #2563eb;
    color: #fff;
  }

  /* Contact Form */
  .funnel-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .funnel-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .funnel-input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #0f172a;
    background: #fff;
    transition: border-color 0.2s;
    outline: none;
  }
  .funnel-input:focus { border-color: #2563eb; }
  .funnel-input.error { border-color: #ef4444; }
  .funnel-error-msg {
    color: #ef4444;
    font-size: 13px;
    margin-top: -8px;
    display: none;
  }
  .funnel-error-msg.visible { display: block; }

  /* Buttons */
  .funnel-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 32px;
    border: none;
    border-radius: 12px;
    background: #2563eb;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }
  .funnel-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
  .funnel-btn:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }
  .funnel-btn.loading { pointer-events: none; opacity: 0.7; }
  .funnel-back-btn {
    position: absolute;
    top: 40px;
    left: 36px;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    transition: color 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .funnel-back-btn:hover { color: #2563eb; }

  /* Calendar Picker */
  .calendar-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .calendar-nav-btn {
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s;
  }
  .calendar-nav-btn:hover { border-color: #2563eb; color: #2563eb; }
  .calendar-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .calendar-week-label {
    font-weight: 600;
    color: #0f172a;
    font-size: 15px;
  }
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }
  .calendar-day {
    text-align: center;
  }
  .calendar-day-header {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 8px;
  }
  .calendar-day-date {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .calendar-slots {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .calendar-slot {
    padding: 8px 4px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    transition: all 0.15s;
  }
  .calendar-slot:hover { border-color: #2563eb; color: #2563eb; background: #f0f7ff; }
  .calendar-slot.selected { background: #2563eb; color: #fff; border-color: #2563eb; }
  .calendar-empty {
    color: #cbd5e1;
    font-size: 12px;
    padding: 12px 4px;
  }
  .calendar-loading {
    text-align: center;
    padding: 40px;
    color: #64748b;
  }
  .calendar-error {
    text-align: center;
    padding: 24px;
    color: #ef4444;
    font-size: 14px;
  }

  /* Confirmation */
  .funnel-confirmation {
    text-align: center;
    padding: 20px 0;
  }
  .funnel-confirmation .check-icon {
    width: 64px;
    height: 64px;
    background: #059669;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }
  .funnel-confirmation h3 {
    color: #059669;
    margin-bottom: 16px;
  }
  .funnel-confirmation .summary {
    background: #f0f9ff;
    border-radius: 12px;
    padding: 20px;
    margin: 16px 0 24px;
    border: 1px solid #bfdbfe;
  }
  .funnel-confirmation .summary p {
    margin: 4px 0;
    color: #334155;
    font-size: 15px;
  }
  .funnel-confirmation .summary .date {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
  }
  .funnel-confirmation .contact-info {
    color: #64748b;
    font-size: 14px;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .funnel-section { padding: 0 20px 60px; }
    .funnel-container { padding: 32px 20px; }
    .funnel-choices { grid-template-columns: 1fr; }
    .funnel-form-row { grid-template-columns: 1fr; }
    .funnel-back-btn { top: 32px; left: 20px; }
    .calendar-grid { grid-template-columns: repeat(3, 1fr); }
    .funnel-step-dot .label { font-size: 10px; }
    .funnel-step-dot .dot { width: 24px; height: 24px; }
    .funnel-progress::before, .funnel-progress-fill { top: 12px; left: 20px; right: 20px; }
  }
  @media (max-width: 480px) {
    .calendar-grid { grid-template-columns: repeat(2, 1fr); }
  }
```

- [ ] **Step 2: Kopie nach vertrieb/landingpage/index.html**

```bash
cp index.html vertrieb/landingpage/index.html
```

- [ ] **Step 3: Commit**

```bash
git add index.html vertrieb/landingpage/index.html
git commit -m "style: Funnel CSS — Progress Bar, Steps, Calendar, Confirmation"
```

---

## Task 7: Funnel HTML in index.html

**Files:**
- Modify: `index.html` (den `<!-- CTA -->` Abschnitt ersetzen)
- Modify: `vertrieb/landingpage/index.html` (Kopie)

- [ ] **Step 1: CTA-Sektion ersetzen**

Ersetze den gesamten Block von `<!-- CTA -->` bis einschließlich `</section>` (Zeilen 1254–1282 in `vertrieb/landingpage/index.html`) durch:

```html
<!-- Funnel -->
<section class="funnel-section reveal" id="kontakt">
  <h2 class="section-title">Kostenlose Demo buchen</h2>
  <div class="funnel-container">
    <!-- Progress Bar -->
    <div class="funnel-progress">
      <div class="funnel-progress-fill" id="progressFill" style="width: 0%"></div>
      <div class="funnel-step-dot active" data-step="1">
        <div class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>
        <span class="label">Kanzlei</span>
      </div>
      <div class="funnel-step-dot" data-step="2">
        <div class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>
        <span class="label">DATEV</span>
      </div>
      <div class="funnel-step-dot" data-step="3">
        <div class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>
        <span class="label">Heraus&shy;forderung</span>
      </div>
      <div class="funnel-step-dot" data-step="4">
        <div class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>
        <span class="label">Kontakt</span>
      </div>
      <div class="funnel-step-dot" data-step="5">
        <div class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>
        <span class="label">Termin</span>
      </div>
    </div>

    <!-- Back Button (hidden on step 1) -->
    <button class="funnel-back-btn" id="funnelBack" style="display:none" onclick="funnelPrev()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Zurück
    </button>

    <div class="funnel-steps-wrapper">
      <!-- Step 1: Kanzleigröße -->
      <div class="funnel-step-panel active" data-panel="1">
        <h3>Wie viele Mandanten betreut Ihre Kanzlei?</h3>
        <div class="funnel-choices">
          <button class="funnel-choice-btn" onclick="funnelSelect('mandanten', '1–50')">1–50</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('mandanten', '51–200')">51–200</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('mandanten', '201–500')">201–500</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('mandanten', '500+')">500+</button>
        </div>
      </div>

      <!-- Step 2: DATEV -->
      <div class="funnel-step-panel" data-panel="2">
        <h3>Nutzen Sie aktuell DATEV?</h3>
        <div class="funnel-choices">
          <button class="funnel-choice-btn" onclick="funnelSelect('datev', 'Ja')">Ja</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('datev', 'Nein')">Nein</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('datev', 'Andere Software')">Andere Software</button>
        </div>
      </div>

      <!-- Step 3: Herausforderung -->
      <div class="funnel-step-panel" data-panel="3">
        <h3>Was ist Ihre größte Herausforderung?</h3>
        <div class="funnel-choices">
          <button class="funnel-choice-btn" onclick="funnelSelect('herausforderung', 'Fachkräftemangel')">Fachkräftemangel</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('herausforderung', 'Digitalisierung')">Digitalisierung</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('herausforderung', 'Mandanten liefern nicht')">Mandanten liefern nicht</button>
          <button class="funnel-choice-btn" onclick="funnelSelect('herausforderung', 'Zu viel Routine')">Zu viel Routine</button>
        </div>
      </div>

      <!-- Step 4: Kontaktdaten -->
      <div class="funnel-step-panel" data-panel="4">
        <h3>Wie erreichen wir Sie?</h3>
        <div class="funnel-form">
          <div class="funnel-form-row">
            <div>
              <input class="funnel-input" id="funnelName" type="text" placeholder="Ihr Name" required>
              <p class="funnel-error-msg" id="errorName">Bitte geben Sie Ihren Namen ein.</p>
            </div>
            <div>
              <input class="funnel-input" id="funnelKanzlei" type="text" placeholder="Name Ihrer Kanzlei" required>
              <p class="funnel-error-msg" id="errorKanzlei">Bitte geben Sie den Kanzleinamen ein.</p>
            </div>
          </div>
          <div class="funnel-form-row">
            <div>
              <input class="funnel-input" id="funnelEmail" type="email" placeholder="E-Mail-Adresse" required>
              <p class="funnel-error-msg" id="errorEmail">Bitte geben Sie eine gültige E-Mail ein.</p>
            </div>
            <div>
              <input class="funnel-input" id="funnelTelefon" type="tel" placeholder="Telefonnummer" required>
              <p class="funnel-error-msg" id="errorTelefon">Bitte geben Sie Ihre Telefonnummer ein.</p>
            </div>
          </div>
          <button class="funnel-btn" onclick="funnelValidateContact()">
            Weiter zur Terminauswahl
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <!-- Step 5: Terminauswahl -->
      <div class="funnel-step-panel" data-panel="5">
        <h3>Wann passt es Ihnen?</h3>
        <div id="calendarContainer">
          <div class="calendar-loading" id="calendarLoading">Verfügbare Termine werden geladen...</div>
          <div class="calendar-error" id="calendarError" style="display:none">
            Termine können gerade nicht geladen werden.<br>
            Bitte kontaktieren Sie uns direkt: <a href="mailto:info@steuerbase.de">info@steuerbase.de</a>
          </div>
          <div id="calendarContent" style="display:none">
            <div class="calendar-nav">
              <button class="calendar-nav-btn" id="calPrev" onclick="calendarNavWeek(-1)">← Vorherige</button>
              <span class="calendar-week-label" id="calWeekLabel"></span>
              <button class="calendar-nav-btn" id="calNext" onclick="calendarNavWeek(1)">Nächste →</button>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
          </div>
        </div>
        <button class="funnel-btn" id="bookBtn" disabled onclick="funnelBook()">
          Termin buchen ✓
        </button>
      </div>

      <!-- Confirmation -->
      <div class="funnel-step-panel" data-panel="done">
        <div class="funnel-confirmation">
          <div class="check-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3>Termin gebucht!</h3>
          <div class="summary">
            <p class="date" id="confirmDate"></p>
            <p id="confirmTime"></p>
            <p>Dauer: 30 Minuten</p>
          </div>
          <p>Sie erhalten eine Bestätigung an <strong id="confirmEmail"></strong></p>
          <p class="contact-info" style="margin-top: 20px;">Bei Fragen: <a href="mailto:info@steuerbase.de">info@steuerbase.de</a> · +49 151 70857052</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Kopie nach vertrieb/landingpage/index.html**

```bash
cp index.html vertrieb/landingpage/index.html
```

- [ ] **Step 3: Commit**

```bash
git add index.html vertrieb/landingpage/index.html
git commit -m "feat: Funnel HTML — 5-Step Booking-Funnel ersetzt CTA"
```

---

## Task 8: Funnel JavaScript in index.html

**Files:**
- Modify: `index.html` (JS im `<script>`-Block am Ende)
- Modify: `vertrieb/landingpage/index.html` (Kopie)

- [ ] **Step 1: Funnel-JS einfügen**

Füge den folgenden JavaScript-Block **am Anfang** des bestehenden `<script>`-Tags ein (vor `// Demo Tabs`):

```js
  // =====================
  // BOOKING FUNNEL
  // =====================
  const funnelData = {};
  let funnelStep = 1;
  let selectedSlot = null;
  let calendarWeekOffset = 0;

  function getMonday(offset) {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function formatDateISO(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function funnelGoTo(step) {
    funnelStep = step;
    // Update panels
    document.querySelectorAll('.funnel-step-panel').forEach(p => p.classList.remove('active'));
    const target = document.querySelector(`.funnel-step-panel[data-panel="${step === 6 ? 'done' : step}"]`);
    if (target) target.classList.add('active');

    // Update progress dots
    document.querySelectorAll('.funnel-step-dot').forEach(dot => {
      const s = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'completed');
      if (s < step) dot.classList.add('completed');
      else if (s === step) dot.classList.add('active');
    });

    // Update progress fill
    const fill = document.getElementById('progressFill');
    const pct = step <= 1 ? 0 : step >= 6 ? 100 : ((step - 1) / 4) * 100;
    fill.style.width = pct + '%';

    // Back button
    const backBtn = document.getElementById('funnelBack');
    backBtn.style.display = (step > 1 && step <= 5) ? 'flex' : 'none';

    // Load calendar on step 5
    if (step === 5) {
      calendarWeekOffset = 0;
      loadCalendarSlots();
    }

    // Scroll into view
    document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function funnelPrev() {
    if (funnelStep > 1) funnelGoTo(funnelStep - 1);
  }

  function funnelSelect(field, value) {
    funnelData[field] = value;
    // Visual feedback
    const panel = document.querySelector(`.funnel-step-panel[data-panel="${funnelStep}"]`);
    panel.querySelectorAll('.funnel-choice-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    // Auto-advance after brief delay
    setTimeout(() => funnelGoTo(funnelStep + 1), 300);
  }

  function funnelValidateContact() {
    let valid = true;

    const fields = [
      { id: 'funnelName', key: 'name', errorId: 'errorName', check: v => v.trim().length > 0 },
      { id: 'funnelKanzlei', key: 'kanzlei', errorId: 'errorKanzlei', check: v => v.trim().length > 0 },
      { id: 'funnelEmail', key: 'email', errorId: 'errorEmail', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { id: 'funnelTelefon', key: 'telefon', errorId: 'errorTelefon', check: v => v.trim().length >= 5 },
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const error = document.getElementById(f.errorId);
      const val = input.value;
      if (!f.check(val)) {
        input.classList.add('error');
        error.classList.add('visible');
        valid = false;
      } else {
        input.classList.remove('error');
        error.classList.remove('visible');
        funnelData[f.key] = val.trim();
      }
    });

    if (valid) funnelGoTo(5);
  }

  // Calendar
  async function loadCalendarSlots() {
    const loading = document.getElementById('calendarLoading');
    const errorEl = document.getElementById('calendarError');
    const content = document.getElementById('calendarContent');
    const grid = document.getElementById('calendarGrid');

    loading.style.display = 'block';
    errorEl.style.display = 'none';
    content.style.display = 'none';
    selectedSlot = null;
    document.getElementById('bookBtn').disabled = true;

    const monday = getMonday(calendarWeekOffset);
    const weekStr = formatDateISO(monday);

    try {
      const res = await fetch('/api/calendar-slots?week=' + weekStr);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      // Week label
      const friday = new Date(monday);
      friday.setDate(friday.getDate() + 4);
      document.getElementById('calWeekLabel').textContent =
        monday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) +
        ' – ' +
        friday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });

      // Prev/Next buttons
      document.getElementById('calPrev').disabled = calendarWeekOffset <= 0;
      document.getElementById('calNext').disabled = calendarWeekOffset >= 3;

      // Build grid — group slots by date
      const days = {};
      const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
      for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        const key = formatDateISO(d);
        days[key] = { weekday: WEEKDAYS[i], date: d, slots: [] };
      }
      data.slots.forEach(s => {
        if (days[s.date]) days[s.date].slots.push(s);
      });

      grid.innerHTML = '';
      Object.values(days).forEach(day => {
        const col = document.createElement('div');
        col.className = 'calendar-day';
        col.innerHTML = `
          <div class="calendar-day-header">${day.weekday}</div>
          <div class="calendar-day-date">${day.date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</div>
          <div class="calendar-slots"></div>
        `;
        const slotsContainer = col.querySelector('.calendar-slots');
        if (day.slots.length === 0) {
          slotsContainer.innerHTML = '<div class="calendar-empty">–</div>';
        } else {
          day.slots.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'calendar-slot';
            btn.textContent = s.time;
            btn.onclick = () => selectSlot(btn, s.datetime);
            slotsContainer.appendChild(btn);
          });
        }
        grid.appendChild(col);
      });

      loading.style.display = 'none';
      content.style.display = 'block';
    } catch (err) {
      console.error('Calendar load error:', err);
      loading.style.display = 'none';
      errorEl.style.display = 'block';
    }
  }

  function selectSlot(btn, datetime) {
    document.querySelectorAll('.calendar-slot').forEach(s => s.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSlot = datetime;
    document.getElementById('bookBtn').disabled = false;
  }

  function calendarNavWeek(dir) {
    calendarWeekOffset += dir;
    if (calendarWeekOffset < 0) calendarWeekOffset = 0;
    if (calendarWeekOffset > 3) calendarWeekOffset = 3;
    loadCalendarSlots();
  }

  async function funnelBook() {
    if (!selectedSlot) return;
    const btn = document.getElementById('bookBtn');
    btn.classList.add('loading');
    btn.textContent = 'Wird gebucht...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...funnelData, slot: selectedSlot }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'slot_taken') {
          alert(data.message);
          btn.classList.remove('loading');
          btn.textContent = 'Termin buchen ✓';
          btn.disabled = true;
          selectedSlot = null;
          loadCalendarSlots();
          return;
        }
        throw new Error(data.message || 'Buchung fehlgeschlagen');
      }

      // Show confirmation
      document.getElementById('confirmDate').textContent = data.termin.datum;
      document.getElementById('confirmTime').textContent = data.termin.uhrzeit + ' — 30 Minuten';
      document.getElementById('confirmEmail').textContent = funnelData.email;

      // Hide progress dots and back button
      document.querySelector('.funnel-progress').style.display = 'none';
      document.getElementById('funnelBack').style.display = 'none';

      funnelGoTo(6);
    } catch (err) {
      console.error('Booking error:', err);
      alert('Buchung fehlgeschlagen: ' + err.message + '\n\nBitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.');
      btn.classList.remove('loading');
      btn.textContent = 'Termin buchen ✓';
      btn.disabled = false;
    }
  }
```

- [ ] **Step 2: Alte CTA-Links aktualisieren**

Die Hero-Buttons und der Pricing-Button verlinken auf `#kontakt`. Das bleibt korrekt — die neue Funnel-Section hat die gleiche ID `kontakt`. Prüfe, dass die smooth-scroll-Funktion im bestehenden JS weiter funktioniert (tut sie, da der `<script>`-Block alle `a[href^="#"]` abfängt).

- [ ] **Step 3: Kopie nach vertrieb/landingpage/index.html**

```bash
cp index.html vertrieb/landingpage/index.html
```

- [ ] **Step 4: Commit**

```bash
git add index.html vertrieb/landingpage/index.html
git commit -m "feat: Funnel JavaScript — Navigation, Kalender-Picker, Buchung"
```

---

## Task 9: Google Cloud Setup + Vercel Env Vars

**Files:** Keine Code-Änderungen — manuelle Einrichtung

- [ ] **Step 1: Google Cloud Projekt erstellen**

1. Gehe zu https://console.cloud.google.com/
2. Neues Projekt: "Steuerbase Funnel"
3. Wähle das Projekt aus

- [ ] **Step 2: APIs aktivieren**

1. Gehe zu "APIs & Services" → "Library"
2. Suche "Google Calendar API" → Aktivieren
3. Suche "Gmail API" → Aktivieren

- [ ] **Step 3: OAuth Consent Screen**

1. Gehe zu "APIs & Services" → "OAuth consent screen"
2. User Type: "External" (oder "Internal" falls Google Workspace)
3. App name: "Steuerbase Funnel"
4. User support email: info@steuerbase.de
5. Scopes hinzufügen:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/gmail.send`
6. Test users: info@steuerbase.de
7. Speichern

- [ ] **Step 4: OAuth Client ID erstellen**

1. Gehe zu "APIs & Services" → "Credentials"
2. "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Steuerbase Funnel"
5. Authorized redirect URIs: `https://developers.google.com/oauthplayground`
6. Speichern → Client ID und Client Secret notieren

- [ ] **Step 5: Refresh Token holen**

1. Gehe zu https://developers.google.com/oauthplayground/
2. Klick auf Zahnrad (oben rechts) → "Use your own OAuth credentials" anhaken
3. Client ID und Client Secret eintragen
4. Links unter "Step 1": diese Scopes eingeben:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/gmail.send`
5. "Authorize APIs" klicken → Mit `info@steuerbase.de` einloggen → Erlauben
6. "Step 2": "Exchange authorization code for tokens" klicken
7. **Refresh Token** kopieren

- [ ] **Step 6: Vercel Environment Variables setzen**

```bash
cd /Users/matejrezo/Desktop/test-cc
npx vercel env add GOOGLE_CLIENT_ID production
npx vercel env add GOOGLE_CLIENT_SECRET production
npx vercel env add GOOGLE_REFRESH_TOKEN production
npx vercel env add GOOGLE_CALENDAR_ID production
```

Für `GOOGLE_CALENDAR_ID` den Wert `info@steuerbase.de` eingeben.

Alternativ über Vercel Dashboard: Project Settings → Environment Variables.

---

## Task 10: Deploy + End-to-End Test

**Files:** Keine Code-Änderungen

- [ ] **Step 1: Alles pushen**

```bash
cd /Users/matejrezo/Desktop/test-cc
git push origin main
```

Vercel deployed automatisch.

- [ ] **Step 2: Frontend-Test**

1. Öffne https://steuerbase.de
2. Scrolle zum Funnel
3. Prüfe: Fortschrittsbalken sichtbar, 5 Punkte
4. Klicke durch Schritte 1–3 (Auto-Advance)
5. Fülle Schritt 4 aus (Validierung prüfen)
6. Prüfe Kalender-Ansicht (Schritt 5)
7. Prüfe Zurück-Button
8. Prüfe Mobile-Ansicht (DevTools → Responsive)

- [ ] **Step 3: Booking-Test**

1. Wähle einen freien Slot
2. Klicke "Termin buchen"
3. Prüfe: Bestätigungs-Screen erscheint
4. Prüfe: E-Mail an info@steuerbase.de angekommen
5. Prüfe: Bestätigungs-E-Mail an Test-Adresse angekommen
6. Prüfe: Google Calendar Event erstellt mit allen Daten

- [ ] **Step 4: Error-Test**

1. Prüfe was passiert wenn kein Slot gewählt → Button disabled
2. Prüfe was passiert bei leerem Kontaktformular → Fehlermeldungen
3. Lösche den Google Calendar Event und teste erneut
