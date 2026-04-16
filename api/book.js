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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Ungültige E-Mail-Adresse.';
  }
  const slotDate = new Date(body.slot);
  if (isNaN(slotDate.getTime())) {
    return 'Ungültiger Termin-Slot.';
  }
  if (slotDate <= new Date()) {
    return 'Der gewählte Termin liegt in der Vergangenheit.';
  }
  const day = slotDate.getDay();
  if (day === 0 || day === 6) {
    return 'Termine sind nur Mo–Fr verfügbar.';
  }
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

    const validationError = validateBody(body);
    if (validationError) {
      return res.status(400).json({ error: 'validation', message: validationError });
    }

    const slotDate = new Date(body.slot);
    const slotEnd = new Date(slotDate.getTime() + SLOT_DURATION * 60000);
    const calendar = getCalendar();
    const calendarId = getCalendarId();

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
