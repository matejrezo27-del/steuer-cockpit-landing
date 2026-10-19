/* Fristenlogik: deterministisch, ohne KI. Läuft im Browser und in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Fristen = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const addMonths = (d, n) => {
    const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(d.getDate(), last));
    return r;
  };
  // Fristende auf Samstag/Sonntag → nächster Werktag (§ 108 AO / § 193 BGB). Feiertage: siehe Hinweis in der UI.
  const nextWerktag = (d) => {
    const w = d.getDay();
    return w === 6 ? addDays(d, 2) : w === 0 ? addDays(d, 1) : d;
  };

  const REGELN = {
    // Bekanntgabe gilt 3 Tage nach Aufgabe zur Post (§ 122 Abs. 2 AO), Einspruch 1 Monat (§ 355 AO)
    einspruch_1m: { label: 'Einspruch: 1 Monat ab Bekanntgabe', bekanntgabeTage: 3, monate: 1 },
    widerspruch_1m: { label: 'Widerspruch: 1 Monat ab Bekanntgabe', bekanntgabeTage: 3, monate: 1 },
  };

  /**
   * @param {{datum?:string, frist_datum?:string, frist_regel?:string, frist_tage?:number}} f
   * @returns {{datum:string|null, quelle:'brief'|'regel'|'tage'|null, erklaerung:string}}
   */
  function berechne(f) {
    if (f.frist_datum && parse(f.frist_datum)) {
      return { datum: f.frist_datum, quelle: 'brief', erklaerung: 'Im Schreiben genannte Frist.' };
    }
    const brief = parse(f.datum);
    if (!brief) return { datum: null, quelle: null, erklaerung: 'Kein Briefdatum erkannt, Frist bitte manuell setzen.' };
    const regel = REGELN[f.frist_regel];
    if (regel) {
      const bekannt = addDays(brief, regel.bekanntgabeTage);
      const ende = nextWerktag(addMonths(bekannt, regel.monate));
      return {
        datum: iso(ende), quelle: 'regel',
        erklaerung: `${regel.label}. Briefdatum ${iso(brief)} + ${regel.bekanntgabeTage} Tage = Bekanntgabe ${iso(bekannt)}, +${regel.monate} Monat.`,
      };
    }
    if (f.frist_tage > 0) {
      const ende = nextWerktag(addDays(brief, f.frist_tage));
      return { datum: iso(ende), quelle: 'tage', erklaerung: `${f.frist_tage} Tage ab Briefdatum ${iso(brief)}.` };
    }
    return { datum: null, quelle: null, erklaerung: 'Keine Frist erkannt.' };
  }

  function tageBis(isoDatum, heute = new Date()) {
    const d = parse(isoDatum);
    if (!d) return null;
    const h = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
    return Math.round((d - h) / 86400000);
  }

  return { berechne, tageBis, iso, parse, addDays, nextWerktag, REGELN };
});
