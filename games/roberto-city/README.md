# Roberto City

Ein Liefer- und Fluchtspiel im Browser. Nachts liefern, tags aufsteigen, und
irgendwann vor den Richter. Reines HTML5-Canvas, keine Abhängigkeiten, kein Build.
`index.html` doppelklicken, fertig.

Steuerung nachts: Pfeiltasten oder WASD, am Handy die Tasten unter dem Feld oder
Wischen. Leertaste startet die Nacht, `M` schaltet den Ton.

## Tag und Nacht

Das Spiel läuft in Runden aus zwei Phasen.

**Nacht** ist das Spiel: 75 Sekunden ausliefern, bunkern, der Streife entkommen.
Nur nachts bewegt sich Roberto.

**Tag** ist alles andere: Ware für die kommende Nacht wählen, im Shop kaufen, die
Bilanz der letzten Nacht lesen, und an manchen Tagen vor den Richter.

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

Drei Warenstufen, jede teurer und heißer als die davor. Ausgewählt wird tagsüber.

| Ware | ab Rang | Basis | Hitze je Lieferung | XP |
|---|---|---|---|---|
| Cannabis | 1 | 40 € | 0,30 | 6 |
| Speed | 4 | 95 € | 0,55 | 14 |
| Kokain | 8 | 210 € | 0,95 | 30 |

Kokain zahlt gut das Fünffache, treibt die Fahndung aber dreimal so schnell hoch.
Mit einer Ladung Koks ist der vierte Streifenwagen nach wenigen Lieferungen da.

## Kundenstamm

Jeder Block ist ein Kunde, der bei null anfängt. Jede Lieferung dorthin hebt ihn um
ein Drittel einer Stufe, maximal Stufe 5. Eine höhere Stufe zahlt +12 % je Stufe und
lässt dort öfter einen Pin erscheinen. Die grünen Balken unten rechts am Haus zeigen
den Stand. Kunden bleiben über Nächte hinweg erhalten, pro Stadt getrennt.

Ein frischer Block wirft also wenig ab und meldet sich selten. Erst der aufgebaute
Stamm trägt.

## Städte

| Stadt | ab Rang | Raster |
|---|---|---|
| Altstadt | 1 | 3 × 4 |
| Hafenviertel | 5 | 4 × 5 |
| Neustadt | 10 | 5 × 5 |

Die Karte wächst mit, das Canvas ebenfalls. Jede Stadt hat Lager, Bunker und Wache an
anderer Stelle, und einen eigenen Kundenstamm.

## Polizei

Streifen kommen aus der **Wache** und nirgendwo sonst. Steigt die Fahndung auf einen
Stern, rollt alle 2,2 Sekunden ein Wagen raus, bis das Soll erreicht ist. Fällt die
Fahndung, drehen die Wagen um, fahren zurück und verschwinden im Tor. Wer in der Nähe
der Wache arbeitet, hat sie sofort im Nacken. Wer weit weg liefert, gewinnt Sekunden.

Der **Funkscanner** verlangsamt das Ausrücken auf 3,4 Sekunden. Das ist der Unterschied
zwischen einer Lieferung mehr und einem Zugriff.

Die **Mauer** schließt die Stadt ringsum ab. Raus geht nicht, und von außen kommt auch
nichts rein.

## Gericht und Haft

Ein Zugriff kostet das Bargeld und bringt eine kurze Festnahme auf der Straße, aber
nicht mehr die alte Wartestrafe. Stattdessen wächst eine **Akte**.

1. Beim ersten Eintrag wird ein Termin auf **Tag + 3** gesetzt.
2. Am Termin ersetzt das Amtsgericht die Tagesansicht. Zwei Knöpfe.
3. **Zum Gericht**: der Richter urteilt nach Aktenlage.

| Akten | Geldstrafe | Haft |
|---|---|---|
| 1 | 180 € | keine |
| 2 bis 3 | 260 € je Akte | keine |
| 4 bis 5 | 300 € je Akte | 2 Tage |
| ab 6 | 350 € je Akte | 4 Tage |

Der **Anwalt** halbiert die Geldstrafe und nimmt einen Hafttag weg. Reicht der Bunker
nicht, wandelt das Gericht je angefangene 400 € in einen weiteren Hafttag um.

4. **Nicht hingehen**: Haftbefehl, eine Akte mehr, Termin zwei Tage später. Mit
   Haftbefehl jagen die Streifen ab null Sternen und die Festnahme dauert doppelt so
   lang. Beim nächsten Prozess zählen zwei Akten extra.
5. **Haft** heißt aussetzen. Der einzige Knopf ist "Tag verstreichen lassen", der Shop
   ist zu, der Bunker bleibt unangetastet.

## Ausrüstung

Roberto fängt mit nichts an. Vier Dinge sieht man ihm an.

| Stück | ab Rang | Preis | Wirkung | sichtbar |
|---|---|---|---|---|
| Sonnenbrille | 1 | 120 € | Fahndung fällt 20 % schneller | ja |
| Laufschuhe I–III | 1 | 180 / 420 / 900 € | je +12 % Tempo | nein |
| Bauchtasche | 2 | 280 € | +2 Ware | ja |
| Kapuzenjacke | 3 | 520 € | 25 % später erkannt | ja |
| Anwalt auf Abruf | 3 | 800 € | halbe Strafe, ein Hafttag weniger | nein |
| Funkscanner | 4 | 650 € | Wache rückt später aus | nein |
| Zweithandy | 6 | 1100 € | +25 % je Lieferung | nein |
| Gebrauchtwagen | 9 | 3800 € | +60 % Tempo, +3 Ware, 40 % besser sichtbar | ja |

Das Auto ist kein reiner Gewinn. Es ist schnell und fasst viel, aber die Streife sieht
es aus dem Anderthalbfachen der Entfernung.

## Aufbau

Alles steckt in `index.html`. Wichtige Stellen im Script:

| Bereich | Was da passiert |
|---|---|
| `STADT` / `buildCity()` | Raster, Canvasgröße, Lage von Lager, Bunker und Wache |
| `WARE` / `RANG` / `UP` | Warenstufen, Rangschwellen, Ausrüstung mit Rangsperre |
| `kunden` / `kd()` / `newTarget()` | Kundenstamm und gewichtete Pin-Verteilung |
| `spawnCop()` / `moveCop()` | Ausrücken aus der Wache, Verfolgung, Rückfahrt |
| `urteil()` / `zumGericht()` | Strafzumessung, Haft, Haftbefehl |
| `roberto()` / `auto()` | Figur samt sichtbarer Ausrüstung |
| `mauer()` | geschlossene Umrandung |
| `loop()` | feste Schrittweite, entkoppelt von der Bildwiederholrate |
| `save()` / `load()` | Fortschritt im `localStorage`, versioniert und migriert |

Der `cool`-Zähler in `moveCop()` ist kein Schmuck: ohne ihn gilt ein Wagen mehrere
Frames lang als "an der Kreuzung", setzt sich jedes Mal zurück und zappelt auf der
Stelle.

`AudioContext` entsteht erst beim ersten Tastendruck. Wird er beim Laden angelegt,
blockt ihn der Browser und der Ton bleibt für die Sitzung stumm.

`loop()` sammelt die vergangene Zeit in `acc` und ruft `step()` in festen Schritten von
1/60 s auf. Vorher lief ein `step()` pro Frame mit fest verdrahteten `1/60`, das koppelt
die Spielgeschwindigkeit an die Bildwiederholrate. Gemessen: bei 240 Hz verbrauchte eine
Schicht in 30 s Wanduhr nur 17 s. Nach dem Umbau verbrauchen 30, 60, 144 und 240 Hz
exakt gleich viel.

Haft und Standbild ziehen keine Schichtzeit ab. Eine Nacht dauert deshalb 75 Sekunden
Spielzeit, aber mehr Wanduhr, je öfter Roberto hochgeht.

Hafttage werden in `tagVerstreichen()` abgezogen, nicht in `nextDay()`. Sonst zieht das
Urteil selbst schon einen Tag ab und das Spiel meldet direkt nach "2 Tage Haft" nur noch
"Noch 1 Tag".

Der Speicherstand trägt ein `v`-Feld. `load()` liest `robertoCity.v4`, fällt sonst auf
v3 und dann v2 zurück, rechnet alte Stände in XP und das neue Ausrüstungsschema um und
schreibt einmal als v4 zurück. Kaputtes JSON landet im `catch` und setzt auf Startwerte,
statt das Spiel zu blockieren. Alte Schlüssel bleiben als Sicherung liegen.

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

Das Spiel war nie langsam, es braucht 2,3 % des Budgets. Der Defekt war die Kopplung an
die Bildwiederholrate. Die statische Stadt vorzurendern wurde bewusst gelassen: bei der
Auslastung ist das Komplexität ohne messbaren Gewinn, und genau das nennt der Skill als
Fehler.

## Offen

- **Die Ökonomie ist nicht durchgerechnet.** Der `balance-review`-Skill liegt im Repo,
  seine Spike-Regel ist auf die Rangkurve angewandt, aber der volle Durchlauf steht aus.
  Ob 3800 € für das Auto zum Ertrag bei Rang 9 passen, ist geschätzt, nicht geprüft.
- **Overload bei gleichzeitigen Ereignissen** bleibt bei 1/2 aus dem Feel-Pass.
  Einzahlen während einer Verfolgung stapelt Vignette, Ruckeln, Münzen und Fließtext.
- Kein Zwischenspeichern innerhalb einer Nacht. Wer den Tab schließt, verliert die
  laufende Schicht, nicht aber den Rang.

## Ideenliste

Grafik: Schatten unter Figuren, Straßenlaternen, Zebrastreifen, laufende Beine,
Lichtkegel bei Verfolgung.

Gameplay: Sprint mit Ausdauer, Gassen als Abkürzung, Zivilverkehr, Straßensperren ab
4 Sternen, Wochentage mit unterschiedlichen Sätzen, Miete als feste Ausgabe, Konkurrenz
um dieselben Kunden, Bestechung statt Prozess.

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
