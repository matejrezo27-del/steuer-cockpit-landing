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
