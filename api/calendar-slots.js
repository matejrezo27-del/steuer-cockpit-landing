const { getCalendar, getCalendarId } = require('./lib/google');

const WEEKDAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const SLOT_DURATION = 30;
const BUFFER_MINUTES = 15;
const START_HOUR = 9;
const END_HOUR = 18;
const MAX_WEEKS_AHEAD = 4;
const BERLIN_OFFSET = 2; // CEST (April–Oktober). TODO: Automatisch CEST/CET erkennen

// Erstellt ein Date-Objekt, dessen UTC-Werte der Berlin-Wanduhrzeit entsprechen.
// So vermeiden wir Timezone-Probleme auf UTC-Servern (Vercel).
function berlinDate(year, month, day, hour, min, sec, ms) {
  return new Date(Date.UTC(year, month, day, hour || 0, min || 0, sec || 0, ms || 0));
}

function parseMondayStr(mondayStr) {
  const [y, m, d] = mondayStr.split('-').map(Number);
  return berlinDate(y, m - 1, d);
}

function getWeekBounds(mondayStr) {
  const monday = parseMondayStr(mondayStr);
  const friday = new Date(Date.UTC(
    monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 4, 23, 59, 59, 999
  ));
  return { start: monday, end: friday };
}

function generateSlotGrid(start, end) {
  const slots = [];
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getUTCDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        for (let min = 0; min < 60; min += SLOT_DURATION) {
          if (hour === END_HOUR - 1 && min + SLOT_DURATION > 60) continue;
          const slotTime = new Date(Date.UTC(
            current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), hour, min
          ));
          slots.push(slotTime);
        }
      }
    }
    current.setUTCDate(current.getUTCDate() + 1);
    current.setUTCHours(0, 0, 0, 0);
  }
  return slots;
}

function isSlotFree(slotTime, busyPeriods) {
  // slotTime ist in "Berlin-UTC", busy-Zeiten kommen von Google in echtem UTC.
  // Konvertiere slotTime zu echtem UTC für den Vergleich.
  const realUtcMs = slotTime.getTime() - BERLIN_OFFSET * 3600000;
  const slotEndMs = realUtcMs + SLOT_DURATION * 60000;
  const bufferStartMs = realUtcMs - BUFFER_MINUTES * 60000;
  const bufferEndMs = slotEndMs + BUFFER_MINUTES * 60000;

  for (const busy of busyPeriods) {
    const busyStart = new Date(busy.start).getTime();
    const busyEnd = new Date(busy.end).getTime();
    if (bufferEndMs > busyStart && bufferStartMs < busyEnd) {
      return false;
    }
  }
  return true;
}

function formatSlot(slotTime) {
  const y = slotTime.getUTCFullYear();
  const m = String(slotTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(slotTime.getUTCDate()).padStart(2, '0');
  const hours = String(slotTime.getUTCHours()).padStart(2, '0');
  const minutes = String(slotTime.getUTCMinutes()).padStart(2, '0');
  const weekday = WEEKDAYS_DE[slotTime.getUTCDay()];
  const date = `${y}-${m}-${d}`;
  // Echte ISO-Datetime mit Berlin-Offset für die Buchungs-API
  const datetime = `${date}T${hours}:${minutes}:00+0${BERLIN_OFFSET}:00`;
  return { date, weekday, time: `${hours}:${minutes}`, datetime };
}

// Wählt max `limit` Slots, gut verteilt über verschiedene Tage und Uhrzeiten.
// Bevorzugt: ein Slot pro Tag, verteilt über vormittags/nachmittags.
function smartSelectSlots(slots, limit) {
  if (slots.length <= limit) return slots;

  // Gruppiere nach Tag
  const byDay = {};
  slots.forEach(s => {
    if (!byDay[s.date]) byDay[s.date] = [];
    byDay[s.date].push(s);
  });

  const days = Object.keys(byDay).sort();
  const selected = [];

  // Runde 1: Ein Vormittags-Slot pro Tag (9:00–12:00)
  for (const day of days) {
    if (selected.length >= limit) break;
    const morning = byDay[day].find(s => {
      const h = parseInt(s.time.split(':')[0]);
      return h >= 9 && h < 12;
    });
    if (morning) selected.push(morning);
  }

  // Runde 2: Ein Nachmittags-Slot pro Tag (13:00–17:00), nur wenn noch Platz
  for (const day of days) {
    if (selected.length >= limit) break;
    const afternoon = byDay[day].find(s => {
      const h = parseInt(s.time.split(':')[0]);
      return h >= 13 && h < 17 && !selected.includes(s);
    });
    if (afternoon) selected.push(afternoon);
  }

  // Runde 3: Restliche auffüllen falls nötig
  for (const s of slots) {
    if (selected.length >= limit) break;
    if (!selected.includes(s)) selected.push(s);
  }

  // Chronologisch sortieren
  selected.sort((a, b) => a.datetime.localeCompare(b.datetime));
  return selected;
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

    // "now" in Berlin-UTC für Vergleich mit unseren Berlin-UTC Slots
    const realNow = new Date();
    const nowBerlin = new Date(realNow.getTime() + BERLIN_OFFSET * 3600000);

    const requestedMonday = parseMondayStr(weekParam);
    const maxDate = new Date(nowBerlin.getTime() + MAX_WEEKS_AHEAD * 7 * 86400000);
    if (requestedMonday > maxDate) {
      return res.status(400).json({ error: 'Maximal 4 Wochen im Voraus buchbar.' });
    }

    const { start, end } = getWeekBounds(weekParam);
    const calendar = getCalendar();
    const calendarId = getCalendarId();

    // FreeBusy in echtem UTC abfragen
    const realStart = new Date(start.getTime() - BERLIN_OFFSET * 3600000);
    const realEnd = new Date(end.getTime() - BERLIN_OFFSET * 3600000);

    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: realStart.toISOString(),
        timeMax: realEnd.toISOString(),
        timeZone: 'Europe/Berlin',
        items: [{ id: calendarId }],
      },
    });

    const busyPeriods = freeBusyRes.data.calendars[calendarId]?.busy || [];

    const allSlots = generateSlotGrid(start, end);
    const freeSlots = allSlots
      .filter(slot => slot > nowBerlin)
      .filter(slot => isSlotFree(slot, busyPeriods))
      .map(formatSlot);

    // Smart-Selection: max 6 Slots, gut über die Woche verteilt
    const selectedSlots = smartSelectSlots(freeSlots, 6);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ week: weekParam, slots: selectedSlots });
  } catch (err) {
    console.error('Calendar slots error:', err);
    return res.status(500).json({ error: 'Termine konnten nicht geladen werden.' });
  }
};
