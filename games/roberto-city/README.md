# Roberto City

Eine kleine Unterwelt-Simulation im Browser. Nachts ausliefern, tags ein Imperium
bauen: Viertel freischalten, Lokale kaufen, Personal einstellen, Steuern zahlen,
Kontakte im Ausland aufbauen und irgendwann vor den Richter.

Reines HTML5-Canvas, keine Abhängigkeiten, kein Build. `index.html` doppelklicken.

## Tag und Nacht

**Nacht** ist das Spiel: 90 Sekunden ausliefern, bunkern, der Streife entkommen.
**Tag** ist alles andere: Ware kaufen, Aufträge annehmen, Viertel freischalten, Lokale
kaufen, Personal einstellen, Steuern zahlen, und an manchen Tagen vor den Richter.

## Steuerung

**Roberto läuft nur, solange du eine Taste hältst.** Loslassen heißt stehenbleiben.
Pfeiltasten oder WASD am Rechner, am Handy die Tasten unter dem Feld halten oder den
Finger auf dem Feld ziehen. Leertaste startet die Nacht, `M` schaltet den Ton.

Hältst du quer zur Fahrtrichtung, läuft er bis zur nächsten Kreuzung weiter und biegt
dort ab. Steht er mitten auf einer Straße und du hältst quer, geht er erst zur
Kreuzung. Ohne diese gepufferte Kurve müsste man jede Abzweigung auf den Pixel treffen.

## Die Stadt

Ein Raster aus **8 × 8 Blöcken**, 780 × 780 Pixel, rund fünfmal so groß wie das alte
Spielfeld. Das Sichtfenster bleibt 360 × 440, die **Kamera folgt Roberto** und stößt an
den Stadtmauern an. Unten links liegt eine Minikarte mit Spieler, Streifen, offenen
Aufträgen, Hafen und Bunker.

Die Stadt hat vier Viertel. Nur die Altstadt ist von Anfang an offen, der Rest ist
hinter einem Bauzaun gesperrt und muss freigeschaltet werden:

| Viertel | Ansehen | Preis |
|---|---|---|
| Altstadt | — | von Anfang an |
| Hafenviertel | 25 | 1 500 € |
| Neustadt | 70 | 6 000 € |
| Villenhang | 150 | 20 000 € |

Freigeschaltet wird der Reihe nach. Jedes Viertel bringt eine eigene Wache, ein eigenes
Versteck, neue Blöcke für Kontakte und zwei Lokale.

**Ansehen** ist die zweite Währung neben Geld. Es kommt aus erfüllten Aufträgen (+1),
neuen Kontakten (+1), Rangaufstiegen (+3), gekauften Lokalen (+3), gezahlten Steuern
(+1) und guten Auslandsgesprächen. Eine Verurteilung kostet 5.

## Imperium

### Lokale

Acht Läden über die Stadt verteilt, jeder in einem bestimmten Viertel. Ein gekauftes
Lokal zahlt **jeden Tag** in den Bunker, ob du nachts arbeitest oder nicht.

| Lokal | Viertel | Preis | am Tag |
|---|---|---|---|
| Späti am Eck | Altstadt | 2 500 € | 180 € |
| Imbiss Pinar | Altstadt | 4 200 € | 290 € |
| Hafenbar Anker | Hafenviertel | 9 000 € | 620 € |
| Club Neon | Hafenviertel | 16 000 € | 1 100 € |
| Ristorante Vito | Neustadt | 24 000 € | 1 600 € |
| Spielhalle Royal | Neustadt | 38 000 € | 2 400 € |
| Hotel Belvedere | Villenhang | 70 000 € | 4 200 € |
| Marina Club | Villenhang | 120 000 € | 7 000 € |

### Personal

| Rolle | ab Ansehen | Lohn am Tag | Wirkung |
|---|---|---|---|
| Läufer (bis 4) | 5 | 120 € | liefert nachts zwei Packs selbstständig, 10 % Risiko einer Akte |
| Fahrer | 15 | 200 € | +2 Ware pro Ladung |
| Aufpasser | 30 | 250 € | Streifen erkennen dich 15 % später |
| Buchhalter | 45 | 300 € | Steuersatz 10 Punkte niedriger |

Löhne werden **jeden Tag** abgezogen. Reicht der Bunker nicht, ist am nächsten Morgen
die ganze Mannschaft weg.

### Steuern

Alle sieben Tage kommt ein Bescheid: **30 % der Lokaleinnahmen** der letzten Woche, mit
Buchhalter 20 %. Wer zahlt, bekommt +1 Ansehen. Wer nicht zahlt, bekommt **zwei Akten**,
und der Bescheid wächst um 20 %. Aus Steuerschulden wird also ein Gerichtstermin.

## Ausland

Drei Verbindungen, die den Einkauf drücken, wo im Inland nichts mehr geht. Jede
verlangt Ansehen, einen bezahlten Flug und ein Gespräch vor Ort. Der Flug kostet einen
ganzen Tag, egal wie es ausgeht.

| Ziel | ab Ansehen | Flug | Einkauf | Höchstmenge |
|---|---|---|---|---|
| Amsterdam | 20 | 2 500 € | 24 % | 60 Pack |
| Tanger | 60 | 5 000 € | 18 % | 90 Pack |
| Neapel | 120 | 9 000 € | 12 % | 140 Pack |

Am Tisch hast du drei Wege:

| Einlassung | Wirkung |
|---|---|
| **Hart verhandeln** | 45 % der volle Preisvorteil und +4 Ansehen. Sonst stehen sie auf, der Flug ist verbrannt. |
| **Entgegenkommen** | Klappt immer, aber sie diktieren: 25 % schlechterer Einkauf. |
| **Geschenk mitbringen** | Kostet 30 % des Flugpreises extra, klappt sicher, +8 Ansehen. |

Zum Vergleich: der Container am Hafen nimmt 55 % vom Straßenpreis. Neapel nimmt 12 %.

## Rang und Ware

Zwölf Ränge vom Läufer bis zur Legende. XP kommen aus Lieferungen, nicht aus Geld.
Der Bedarf je Stufe wächst um rund das 1,35-fache, nie um das Doppelte: der
`balance-review`-Skill wertet einen Sprung über 2× als Klippe.

| Rang | | Rang | | Rang | |
|---|---|---|---|---|---|
| 1 Läufer | 0 XP | 5 Bezirksmann | 700 | 9 Konsul | 3900 |
| 2 Zusteller | 80 | 6 Großhändler | 1150 | 10 Pate | 5500 |
| 3 Stammkraft | 200 | 7 Statthalter | 1800 | 11 Don | 7600 |
| 4 Dealer | 400 | 8 Boss | 2700 | 12 Legende | 10400 |

| Ware | ab Rang | Basis | Hitze je Lieferung | XP |
|---|---|---|---|---|
| Cannabis | 1 | 40 € | 0,28 | 6 |
| Speed | 4 | 95 € | 0,48 | 14 |
| Kokain | 8 | 210 € | 0,75 | 30 |

## Telefon, Kontakte, Aufträge

Es liegen keine Zufallspins herum. Wer nachts auf dich wartet, hat vorher angerufen.

**Kontakte** sind benannte Abnehmer in je einem Block. Du fängst mit zweien an. Nachts
taucht alle 26 Sekunden ein blaues Fragezeichen auf: hinfahren heißt ein Kontakt mehr.

**Aufträge** kommen tagsüber. Zusagen sind begrenzt auf 2 + Rang/3, mit Zweithandy
einen mehr. Ein voll erfüllter Auftrag bringt +0,55 Vertrauen, eine geplatzte Zusage
kostet **0,6** — mehr, als eine Erfüllung bringt.

## Nachschub

Ware kaufst du tagsüber auf eigene Rechnung. Sie liegt am **Hafen** und muss nachts
dort abgeholt werden. Ist der Hafen leer, ist die Nacht gelaufen. Startkapital sind
200 €. Was du am Morgen noch am Mann hast, wandert zurück in den Vorrat; verloren geht
Ware nur beim Zugriff.

## Fahndung

Die Fahndung fällt nicht dauernd ein bisschen, sondern gar nicht, solange dich ein
Wagen sieht. Erst wenn dich **6 Sekunden** (mit Funkscanner 3,5) niemand gesehen hat,
kühlt sie mit 0,5 pro Sekunde ab. Das **Versteck** setzt die Ruhezeit sofort auf null,
kühlt mit 1,5 pro Sekunde und macht dich unsichtbar — die Uhr läuft trotzdem.

Streifen kommen aus der **Wache des nächstgelegenen offenen Viertels** und fahren
dorthin zurück. In gesperrte Viertel fahren sie nicht.

## Gericht und Haft

| Lage beim Zugriff | Folge |
|---|---|
| Normal | kurze Festnahme, eine Akte mehr |
| Dritter Zugriff derselben Nacht | 1 Tag Haft, Nacht sofort vorbei |
| Fahndung bei fünf Sternen | 1 Tag Haft, Nacht sofort vorbei |
| Offener Haftbefehl | 2 Tage Haft, Nacht sofort vorbei |

Aus den Akten wird ein Verfahren. Drei Tage nach der ersten Akte steht der Termin.

### Welches Gericht

Die Zuständigkeit richtet sich nach der Schwere, wie im echten Leben:

| Gericht | Besetzung | zuständig ab | Verhandlungstage | Härte |
|---|---|---|---|---|
| Amtsgericht, **Strafrichter** | ein Richter | kleine Sachen | 2 | 1,0 |
| Amtsgericht, **Schöffengericht** | ein Richter, zwei Schöffen | 3 Akten oder 2 Vorstrafen | 3 | 1,15 |
| Landgericht, **Große Strafkammer** | drei Richter, zwei Schöffen | 6 Akten, 4 Vorstrafen oder Kokain | 4 | 1,4 |

Die Schöffen sitzen ohne Robe neben der Kammer, den Hammer hat der Vorsitzende.

### Der Prozess

Ein Verfahren zieht sich über mehrere **Verhandlungstage**, und jeder kostet einen
Spieltag. Nachts kannst du weiterarbeiten, aber neue Akten wandern in dieselbe Anklage.

| Tag | Was passiert | Beim Strafrichter | Schöffengericht | Große Strafkammer |
|---|---|---|---|---|
| 1 | Anklageverlesung und Einlassung | ✓ | ✓ | ✓ |
| 2 | Beweisaufnahme, ein Zeuge sagt aus | — | ✓ | ✓ |
| 3 | Zweiter Zeuge | — | — | ✓ |
| letzter | Plädoyers und letztes Wort, dann Urteil | ✓ | ✓ | ✓ |

**Einlassung:** Gestehen senkt die Strafe auf 65 % und nimmt einen Hafttag, macht die
Verurteilung aber sicher. Schweigen lässt das Gericht nach Aktenlage urteilen.
Bestreiten bringt mit Anwalt 45 % Freispruch am Amtsgericht, 32 % am Landgericht; ohne
Anwalt 35 % mehr Strafe und einen Tag drauf.

**Beweisaufnahme:** Widersprechen wirkt nur mit Anwalt (Strafe auf 85 %), ohne ihn geht
es nach hinten los. Oder du packst aus:

> **Auspacken nach Paragraf 31** senkt die Strafe auf 35 % und nimmt zwei Hafttage.
> Dafür kostet es 25 Ansehen, alle Kontakte verlieren einen ganzen Vertrauenspunkt, und
> dein bester Auslandskontakt nimmt keine Anrufe mehr an.

**Zweiter Zeuge** (nur Landgericht): Anzweifeln ist mit Anwalt eine 50-50-Sache, sonst
schadet es. Bestätigen bringt sichere 8 % Nachlass.

**Plädoyers:** Die Staatsanwaltschaft nennt ihre Forderung, du hast das letzte Wort.
Reue bringt 10 % Nachlass, Unschuld beteuern nach einem Geständnis 15 % Aufschlag.

**Vorstrafen** bleiben: jede erhöht die Forderung um 22 %, je zwei bringen einen
zusätzlichen Hafttag. Eine Verurteilung kostet zusätzlich 5 Ansehen.

### Berufung

Gegen ein Urteil des Amtsgerichts kannst du Berufung einlegen: 600 € Gerichtskosten,
Strafe und Haft werden ausgesetzt, und die Große Strafkammer verhandelt vier Tage neu.
Mit Anwalt fällt das neue Urteil zu 55 % um ein Drittel milder aus, sonst 25 % härter.
Gegen ein Urteil des Landgerichts gibt es diesen Weg nicht mehr.

### Die Zelle

Haft ist eine eigene Szene mit Strichliste an der Wand. Jeder Tag würfelt ein Ereignis:
Hofgang bringt einen Kontakt, Ärger im Trakt einen Tag mehr, ein Anwaltsbesuch einen
weniger.

## Ausrüstung

Roberto fängt mit nichts an. Vier Dinge sieht man ihm an.

| Stück | ab Rang | Preis | Wirkung | sichtbar |
|---|---|---|---|---|
| Sonnenbrille | 1 | 120 € | Fahndung kühlt 30 % schneller ab | ja |
| Laufschuhe I–III | 1 | 180 / 420 / 900 € | je +12 % Tempo | nein |
| Bauchtasche | 2 | 280 € | +2 Ware | ja |
| Kapuzenjacke | 3 | 520 € | 25 % später erkannt | ja |
| Anwalt auf Abruf | 3 | 800 € | halbe Strafe, ein Hafttag weniger | nein |
| Funkscanner | 4 | 650 € | Wache rückt später aus, Ruhezeit 3,5 s | nein |
| Zweithandy | 6 | 1 100 € | +25 % je Lieferung, ein Auftrag mehr | nein |
| Gebrauchtwagen | 9 | 3 800 € | +60 % Tempo, +3 Ware, 40 % besser sichtbar | ja |

## Aufbau

Alles steckt in `index.html`. Wichtige Stellen im Script:

| Bereich | Was da passiert |
|---|---|
| `VIERTEL` / `offen` / `qvon()` | Viertel, Freischaltung, Zugehörigkeit eines Blocks |
| `passierbar()` / `zaun()` | Sperre an der Viertelgrenze, sichtbar und wirksam |
| `kamera()` / `minikarte()` | mitlaufendes Sichtfenster und Übersichtskarte |
| `hold` / `halt()` / `los()` | Halten statt Automatik, samt gepufferter Kurve |
| `LOKALE` / `ROLLEN` / `nextDay()` | Einnahmen, Löhne, Steuerbescheid am Tageswechsel |
| `AUSLAND` / `fliegen()` / `verhandeln()` | Flug, Gespräch, freigeschaltete Lieferanten |
| `kontakte` / `neuerKontakt()` | benannte Abnehmer, Vertrauen, neue Bekanntschaften |
| `spawnCop()` / `moveCop()` | Ausrücken aus der nächsten Wache, Verfolgung, Rückfahrt |
| `GERICHTE` / `zustaendig()` | drei Instanzen, Besetzung, Verhandlungstage |
| `prozessWeiter()` | Schritt und Verhandlungstag, Übergang in den nächsten Spieltag |
| `forderung()` / `urteilSprechen()` | Antrag der Anklage und Strafzumessung |
| `berufung()` | Rechtsmittel ans Landgericht |
| `gerichtSzene()` / `richter()` / `schoeffe()` / `zeuge()` | Saal je nach Besetzung |
| `zelleSzene()` / `flugSzene()` / `gespraechSzene()` | die weiteren Einzelbilder |
| `loop()` | feste Schrittweite, entkoppelt von der Bildwiederholrate |
| `save()` / `load()` | Fortschritt im `localStorage`, versioniert und migriert |

**Der Radius 48 ist kein runder Wert, sondern Geometrie.** Eine Blockmitte liegt
`CELL/2` = 45 px von der nächsten Fahrspur entfernt, weil Roberto auf den Kanten fährt.
Jede Prüfung "ist Roberto an diesem Block" muss über 45 liegen. Versteck und
Kontaktmarker standen einmal auf 44 und waren damit unerreichbar: die Marker
erschienen, ließen sich aber nicht einsammeln.

**Wer einen Timer in `step()` laufen lässt, muss die Oberfläche selbst nachziehen.**
`ui()` läuft nur bei Zustandswechseln, nicht pro Frame. Der Landeknopf beim Flug hing
an `flugRest` und blieb deshalb dauerhaft gesperrt: ein Softlock mitten im Flugzeug.
Deshalb ruft der Countdown beim Nulldurchgang selbst `ui()` auf.

Der `cool`-Zähler in `moveCop()` ist kein Schmuck: ohne ihn gilt ein Wagen mehrere
Frames lang als "an der Kreuzung", setzt sich jedes Mal zurück und zappelt auf der
Stelle.

`AudioContext` entsteht erst beim ersten Tastendruck. Wird er beim Laden angelegt,
blockt ihn der Browser und der Ton bleibt für die Sitzung stumm.

`loop()` sammelt die vergangene Zeit in `acc` und ruft `step()` in festen Schritten von
1/60 s auf. Gemessen: bei 240 Hz verbrauchte eine Schicht vorher in 30 s Wanduhr nur
17 s. Nach dem Umbau verbrauchen 30, 60, 144 und 240 Hz exakt gleich viel.

Haft und Standbild ziehen keine Schichtzeit ab. Eine Nacht dauert 90 Sekunden
Spielzeit, aber mehr Wanduhr, je öfter Roberto hochgeht.

Hafttage werden in `tagAbsitzen()` abgezogen, nicht in `nextDay()`. Sonst zieht das
Urteil selbst schon einen Tag ab und meldet direkt nach "2 Tage Haft" nur noch einen.

Der Speicherstand trägt ein `v`-Feld. `load()` liest `robertoCity.v6`, fällt sonst auf
v5 zurück und rechnet die Kontakte der drei alten Kleinstädte in die Altstadt des
neuen Rasters um. Kaputtes JSON landet im `catch` und setzt auf Startwerte.

`prefers-reduced-motion: reduce` schaltet das Kameraruckeln ab.

## Messungen statt Vermutungen

Der Skill `performance-optimization` verlangt: erst profilen, dann fixen. Gemessen in
Chromium, geseedetes `Math.random`, `requestAnimationFrame` durch einen festen Timer
ersetzt.

| Messwert | vorher | nachher | Budget bei 60 fps |
|---|---|---|---|
| CPU pro Frame, Mittel | 0,378 ms | 0,282 ms | 16,67 ms |
| CPU pro Frame bei `devicePixelRatio` 3 | — | 0,463 ms | 16,67 ms |
| Schichtzeit nach 40 s bei 240 Hz | 17 s statt 40 | 40 s | — |

Das Spiel war nie langsam. Der Defekt war die Kopplung an die Bildwiederholrate. Die
statische Stadt vorzurendern wurde bewusst gelassen: bei der Auslastung ist das
Komplexität ohne messbaren Gewinn, und genau das nennt der Skill als Fehler. Mit der
5× größeren Karte werden nur noch die Blöcke im Sichtfenster gezeichnet.

## Offen

- **Die Ökonomie ist nicht durchgerechnet.** Der `balance-review`-Skill liegt im Repo,
  seine Spike-Regel ist auf die Rangkurve angewandt, aber der volle Durchlauf steht
  aus. Ob 120 000 € für den Marina Club zum Ertrag passen, ob Steuern und Löhne den
  Lokalgewinn richtig bremsen, ob 150 Ansehen für den Villenhang erreichbar sind, ohne
  zu grinden: alles geschätzt, nichts gemessen.
- **Kokain ist hart an der Grenze.** Im Messlauf war die Fahndung nach zwei Sekunden am
  Anschlag. Der Testbot nutzt allerdings weder Versteck noch Rückzug.
- **Kein Zwischenspeichern innerhalb einer Nacht.** Tab zu heißt laufende Schicht weg.
- **Läufer sind blind.** Sie liefern pauschal zwei Packs, unabhängig von deinen
  Aufträgen und Kontakten. Richtig wäre, dass sie zugesagte Aufträge abarbeiten.
- **Overload bei gleichzeitigen Ereignissen** bleibt bei 1/2 aus dem Feel-Pass.

## Ideenliste

Grafik: Schatten unter Figuren, Straßenlaternen, Zebrastreifen, laufende Beine,
Lichtkegel bei Verfolgung.

Gameplay: Sprint mit Ausdauer, Gassen als Abkürzung, Zivilverkehr, Straßensperren ab
4 Sternen, Wochentage mit unterschiedlichen Sätzen, Konkurrenz um dieselben Kunden,
Bestechung statt Prozess, Läufer die echte Aufträge abarbeiten, Schutzgeld auf fremde
Lokale, Geldwäsche über die eigenen.

Feeling: kurze Zeitlupe vor dem Zugriff, Prioritätsregel für gleichzeitige Effekte.

Technik: Highscore, Musik mit Tempo nach Fahndungsstufe.

## Game-Dev-Skills nachrüsten

Die Skills laufen in Claude Code, nicht in der Chat-App. Im Projektordner:

```bash
# Sammlung mit Web-Engines (Phaser, PixiJS, three.js) plus Router
claude plugin marketplace add gamedev-skills/awesome-gamedev-agent-skills
claude plugin install gamedev@awesome-gamedev-agent-skills

# Design- und Playability-Reviews, baut nichts, bewertet nur
git clone https://github.com/fagemx/gstack-game
mkdir -p .claude/skills
cp -r gstack-game/skills/* .claude/skills/
```

Danach `claude` im Projektordner starten. Der Router erkennt an den Projektdateien,
womit er es zu tun hat; bei reinem Canvas ohne Engine-Marker fragt er nach.

Im Repo liegen unter `.claude/skills/` bereits sechs Stück:

| Skill | Herkunft | Wofür hier benutzt |
|---|---|---|
| `feel-pass` | gstack-game | Diagnose der Rückmeldungsketten |
| `performance-optimization` | awesome-gamedev | Messmethode, Frame-Budget, Bildraten-Fund |
| `save-systems` | awesome-gamedev | Versioniertes Schema, Migration von v2, defensives Laden |
| `game-ui-ux` | awesome-gamedev | HUD schreibt nur bei Änderung, Phasenwechsel als Zustand |
| `game-feel` | awesome-gamedev | Standbilder, Ruckeln, Easing |
| `balance-review` | gstack-game | Spike-Regel auf die Rangkurve, voller Durchlauf offen |

## Lizenz

Mach damit, was du willst.
