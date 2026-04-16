const { getCalendar, getCalendarId } = require('./lib/google');

const WEEKDAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const SLOT_DURATION = 30;
const BUFFER_MINUTES = 15;
const START_HOUR = 9;
const END_HOUR = 18;
const MAX_WEEKS_AHEAD = 4;

function getWeekBounds(mondayStr) {
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
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        for (let min = 0; min < 60; min += SLOT_DURATION) {
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

    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: 'Europe/Berlin',
        items: [{ id: calendarId }],
      },
    });

    const busyPeriods = freeBusyRes.data.calendars[calendarId]?.busy || [];

    const allSlots = generateSlotGrid(start, end);
    const freeSlots = allSlots
      .filter(slot => slot > now)
      .filter(slot => isSlotFree(slot, busyPeriods))
      .map(formatSlot);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ week: weekParam, slots: freeSlots });
  } catch (err) {
    console.error('Calendar slots error:', err);
    return res.status(500).json({
      error: 'Termine konnten nicht geladen werden.',
      debug: {
        message: err.message,
        code: err.code,
        status: err.status,
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'NOT SET',
      }
    });
  }
};
