# Roberto City

Ein Liefer- und Fluchtspiel im Browser. Reines HTML5-Canvas, keine Abhängigkeiten,
kein Build. `index.html` doppelklicken, fertig.

## Tag und Nacht

Das Spiel läuft in Runden aus zwei Phasen.

**Nacht** ist das Spiel: 110 Sekunden ausliefern, bunkern, der Streife entkommen.
Nur nachts bewegt sich Roberto, nur nachts fahren Streifen, nur nachts gibt es Pins.

**Tag** ist die Kasse: der Shop hat auf, unter *Robertos Sachen* steht, was die
gekauften Dinge konkret bewirken, und die Bilanz der letzten Nacht liegt auf dem
Feld. Roberto steht vor dem Lager und wartet. Bewegen lässt er sich nicht.

Leertaste oder der Knopf startet die nächste Nacht, der Tageszähler läuft mit.
Der Shop ist nachts gesperrt, die Knöpfe sind dann sichtbar deaktiviert.

## Spielregeln

- **Lager** (oranges Haus, oben links): auffüllen, Grundkapazität 3 Ladungen
- **Kundenpins** (rot): mit Ware ranlaufen zahlt aus, Pin verfällt nach 18 Sekunden,
  der Ring um den Pin zeigt die Restzeit
- **Bunker** (lila Haus, unten rechts): Cash einzahlen. Der Bunker ist gleichzeitig
  das Konto für den Shop und bei einem Zugriff unantastbar
- **Kombo**: jede Lieferung zählt hoch und bringt bis zu 50 € Aufschlag. Das Fenster
  läuft 12 Sekunden, danach steht die Kombo wieder auf null
- **Fahndung**: 5 Sterne. Jede Lieferung +0,55. Ab 1 Stern nehmen Streifenwagen die
  Verfolgung auf, pro Stern kommt ein Wagen dazu (max. 4) und sie werden schneller.
  Ein Wagen, der dich verfolgt, trägt einen roten Ring
- **Bust**: Ware und Bargeld weg, kurze Haft, Fahndung zurück auf null
- **Haft**: Tasten hämmern verkürzt sie, jeder Tastendruck 0,09 Sekunden
- **Schicht**: 110 Sekunden

Bunker, Tag, Statistik und gekaufte Upgrades liegen im `localStorage` und überleben
den Tab-Neustart. Der Knopf unter dem Feld löscht sie wieder.

## Steuerung

Nachts Pfeiltasten oder WASD, am Handy die Tasten unter dem Feld oder Wischen auf dem
Feld. Leertaste startet die Nacht, `M` schaltet den Ton. Bewegung ist Pac-Man-artig: Richtung vorgeben, Roberto läuft
bis zur nächsten Kreuzung weiter. Eine vorgewählte Richtung erscheint als Pfeil an
der Kreuzung, an der sie greift.

## Aufbau

Alles steckt in `index.html`. Wichtige Stellen im Script:

| Bereich | Was da passiert |
|---|---|
| `XS` / `YS` | Fahrspurraster, bestimmt Stadtlayout und Kollision |
| `UP` / `apply()` | Shop-Upgrades und ihre Effekte auf die Spielwerte |
| `ac()` / `tone()` / `noise()` | Tonerzeugung über die Web Audio API, ohne Dateien |
| `siren()` | Dauerton der Streife, Lautstärke folgt der Distanz |
| `fx` / `stepFx()` / `drawFx()` | Zahlen, Ringe, Münzen |
| `kick()` / `shake` / `freeze` | Kameraruckeln und Standbild-Frames |
| `moveCop()` | Streifen-KI, Kreuzungsentscheidung mit `cool`-Sperre |
| `step()` | Spiellogik pro Frame |
| `draw()` | gesamte Darstellung |
| `nightStart()` / `nightEnd()` | Phasenwechsel, Bilanz und Statistik |
| `PAL` / `palette()` / `dayF` | Tag- und Nachtpalette, Dämmerung dazwischen |
| `loop()` | feste Schrittweite, entkoppelt von der Bildwiederholrate |
| `kit()` | Panel "Robertos Sachen", zeigt die Wirkung der Upgrades |
| `save()` / `load()` / `wipe()` | Fortschritt im `localStorage`, versioniert |

Der `cool`-Zähler in `moveCop()` ist kein Schmuck: ohne ihn gilt ein Wagen mehrere
Frames lang als "an der Kreuzung", setzt sich jedes Mal zurück und zappelt auf der
Stelle.

`AudioContext` entsteht erst beim ersten Tastendruck oder Tipp. Wird er beim Laden
angelegt, blockt ihn der Browser und der Ton bleibt für die ganze Sitzung stumm.

`freeze` hält die Spiellogik an, nicht die Darstellung. Effekte und Uhr laufen
darüber weiter, deshalb schiebt jeder Freeze-Frame `t0` um dieselbe Zeit nach hinten,
sonst kostet ein Bust Schichtzeit.

Beim Bust wird Roberto erst nach dem Freeze in die Ecke gesetzt (`jailPos`). Sonst
steht er schon im Gefängnis, während der Aufprallring noch am Tatort hängt.

`prefers-reduced-motion: reduce` schaltet das Kameraruckeln ab, der Rest bleibt.

`loop()` sammelt die vergangene Zeit in `acc` und ruft `step()` in festen Schritten
von 1/60 s auf. Vorher lief ein `step()` pro Frame mit fest verdrahteten `1/60`, das
koppelt die gesamte Spielgeschwindigkeit an die Bildwiederholrate des Monitors.
`MAXSTEP` deckelt das Nachholen auf fünf Schritte, sonst holt ein zurückgekehrter
Hintergrund-Tab minutenlang auf.

Haft und Standbild ziehen keine Schichtzeit ab. Eine Nacht dauert deshalb 110 Sekunden
Spielzeit, aber mehr Wanduhr, je öfter Roberto hochgeht.

Der Speicherstand trägt ein `v`-Feld. `load()` liest zuerst `robertoCity.v3`, fällt
sonst auf den alten Schlüssel `robertoCity.v2` zurück, hebt ihn auf das neue Schema
und schreibt ihn einmal als v3 zurück. Kaputtes JSON landet im `catch` und setzt auf
Startwerte, statt das Spiel zu blockieren. Der alte Schlüssel bleibt als Sicherung
liegen.

## Messungen statt Vermutungen

Der Skill `performance-optimization` hat eine harte Regel: erst profilen, dann fixen.
Gemessen wurde in Chromium, 30 s Lauf, geseedetes `Math.random`, `requestAnimationFrame`
durch einen festen Timer ersetzt.

| Messwert | vorher | nachher | Budget bei 60 fps |
|---|---|---|---|
| CPU pro Frame, Mittel | 0,378 ms | 0,282 ms | 16,67 ms |
| CPU pro Frame, p95 | 0,5 ms | 0,4 ms | — |
| CPU pro Frame bei `devicePixelRatio` 3 | — | 0,463 ms (p95 1,1) | 16,67 ms |
| Canvas-Aufrufe pro Frame | 353 | 371 | — |

**Das Spiel war nie langsam.** Es braucht 2,3 % des Frame-Budgets. Der Befund war ein
anderer: die Spiellogik hing an der Bildwiederholrate.

| Schichtzeit verbraucht nach 40 s Wanduhr, ohne Eingaben | vorher | nachher |
|---|---|---|
| 30 Hz | — | 40 s |
| 60 Hz | 30 s | 40 s |
| 144 Hz | — | 40 s |
| 240 Hz | 17 s | 40 s |

Auf einem 120-Hz-Handy lief Roberto doppelt so schnell, Pins verfielen doppelt so
schnell, und jeder Haft-Frame schob die Uhr um 16,67 ms vor, während real 8,33 ms
vergingen. Die Haft *erzeugte* Schichtzeit. Behoben durch die feste Schrittweite in
`loop()` und einen Schichtzähler in Spielsekunden statt `Date.now()`.

Bewusst **nicht** gemacht: die statische Stadt in ein zweites Canvas vorrendern. Das
hätte die 371 Aufrufe pro Frame etwa halbiert, aber bei 2,3 % Budgetauslastung ist das
Komplexität ohne messbaren Gewinn. Der Skill nennt das ausdrücklich als Fehler.

Gemacht: `devicePixelRatio`-Skalierung. Das Canvas war 360 × 440 und wurde per CSS
hochgezogen, auf Retina-Displays also unscharf. Jetzt 1080 × 1320 bei dpr 3, und die
gemessenen 0,463 ms zeigen, dass das Budget das trägt.

## Was im Shop kaputt war

- Kaufen ging mechanisch, aber **nichts zeigte die Wirkung**. "+12 % Tempo" stand als
  Text da, der tatsächliche Wert war nirgends sichtbar. Jetzt listet *Robertos Sachen*
  Tempo, Ladung, Auszahlung, Sichtweite, Haft und Bust-Rettung als konkrete Zahlen,
  Verbessertes in Grün.
- Die Meldung "Bunker reicht nicht" blieb kleben, auch nach Klicks auf andere Zeilen.
  Jetzt steht an jeder unbezahlbaren Zeile, **wie viel genau fehlt**, und der Text
  aktualisiert sich nach jedem Kauf.
- Unbezahlbare Knöpfe sahen aus wie kaufbare. Jetzt gestrichelter Rand.
- Einkaufen mitten in der 110-Sekunden-Schicht war möglich, aber sinnlos. Der Shop hat
  jetzt nur tagsüber offen.

## Feel-Pass

Überarbeitet mit dem Skill [`feel-pass`](https://github.com/fagemx/gstack-game) aus
`fagemx/gstack-game` (v0.5.0, Commit `7259ab9`). Zielbild: Ausliefern soll knackig
sein, der Zugriff soll wehtun.

| Dimension | vorher | nachher | Was sich geändert hat |
|---|---|---|---|
| Responsiveness | 1/2 | 2/2 | Vorgewählte Richtung war unsichtbar, bis zu 570 ms bis zur nächsten Kreuzung ohne Rückmeldung. Jetzt Pfeil an der Zielkreuzung |
| Clarity | 1/2 | 2/2 | Verfolgerstatus war nicht ablesbar. Jetzt roter Ring am verfolgenden Wagen, Restzeit-Arc am Pin, grüner Ring wenn Roberto Cash trägt |
| Impact | 0/2 | 2/2 | Lieferung war eine Zahlenänderung im HTML über dem Feld. Jetzt Zahl, Ring, 50 ms Standbild, Ruckeln, Zweiklang. Bust: 220 ms Standbild, 14 px Ruckeln, Vignette |
| Rhythm | 1/2 | 2/2 | Sirene steigt mit der Nähe, Kombo-Fenster erzeugt Druck. Der Tag/Nacht-Wechsel gibt der langen Sitzung endlich eine Gliederung, das war der offene Punkt aus der ersten Runde |
| Payoff | 1/2 | 2/2 | Betrag am Lieferort, Kombo-Anzeige, Münzkaskade beim Einzahlen. Dazu die Tagesbilanz als Abschluss der Nacht |
| Dead Time | 1/2 | 2/2 | 2,5 s Haft ohne Eingabe. Jetzt Hämmern statt Warten |
| Overload | 2/2 | 1/2 | Einzahlen während einer Verfolgung stapelt Vignette, Ruckeln, Münzen und Fließtext. Unverändert offen |
| **Summe** | **7/14 FLAT** | **13/14 ALIVE** | |

Offen bleibt der Overload-Stapel bei gleichzeitigen Ereignissen. Eine Prioritätsregel
für Effekte fehlt.

## Nicht gemacht

Der Skill `balance-review` liegt im Repo, ist aber **nicht gelaufen**. Die Shop-Preise
stammen aus der Zeit ohne Tagesphase: damals wurde mitten in der Schicht gekauft, jetzt
gesammelt zwischen zwei Nächten. Ob 150 bis 600 € pro Stufe nach einer Nacht mit
250 bis 800 € Ertrag passen, ist ungeprüft.

## Ideenliste

Grafik: Schatten unter Figuren, Straßenlaternen, Zebrastreifen, laufende Beine,
Lichtkegel bei Verfolgung.

Gameplay: Sprint mit Ausdauer, Gassen als Abkürzung, Zivilverkehr als Hindernis,
Straßensperren ab 4 Sternen, wechselndes Stadtlayout pro Nacht, Wochentage mit
unterschiedlichen Sätzen, Miete oder Schulden als Ausgabe am Tag.

Feeling: kurze Zeitlupe vor dem Zugriff, Prioritätsregel für gleichzeitige Effekte.

Technik: Highscore-Tabelle, Musik mit Tempo nach Fahndungsstufe.

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
| `balance-review` | gstack-game | noch nicht gelaufen, siehe oben |

## Lizenz

Mach damit, was du willst.
