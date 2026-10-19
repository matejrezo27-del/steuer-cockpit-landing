/* Versand-Schnittstelle. Aktuell nur Trockenlauf: Der Brief wird fertig als PDF erzeugt, aber nicht verschickt.
 * Ein echter Anbieter (z. B. LetterXpress, Deutsche Post E-POSTBUSINESS) wird als weiterer Eintrag ergänzt:
 *   senden({pdf, empfaenger, optionen}) → {id, status, kosten}
 */
const trockenlauf = {
  name: 'trockenlauf',
  async senden({ pdf, optionen = {} }) {
    return { id: 'dry-' + Date.now().toString(36), status: 'nicht versendet (Trockenlauf)', kosten: null, bytes: pdf.length, einschreiben: !!optionen.einschreiben };
  },
};
const anbieter = { trockenlauf };
const waehle = (name) => anbieter[name] || trockenlauf;
module.exports = { waehle };
