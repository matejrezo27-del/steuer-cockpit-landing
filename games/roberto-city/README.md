# Roberto City

Ein Liefer- und Fluchtspiel im Browser. Reines HTML5-Canvas, keine Abhängigkeiten,
kein Build. `index.html` doppelklicken, fertig.

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

Bunker, Höchststand und gekaufte Upgrades liegen im `localStorage` und überleben den
Tab-Neustart. Der Knopf unter dem Feld löscht sie wieder.

## Steuerung

Pfeiltasten oder WASD, am Handy die Tasten unter dem Feld oder Wischen auf dem Feld.
`M` schaltet den Ton. Bewegung ist Pac-Man-artig: Richtung vorgeben, Roberto läuft
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
| `save()` / `load()` / `wipe()` | Fortschritt im `localStorage` |

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

## Feel-Pass

Überarbeitet mit dem Skill [`feel-pass`](https://github.com/fagemx/gstack-game) aus
`fagemx/gstack-game` (v0.5.0, Commit `7259ab9`), installiert unter
`.claude/skills/feel-pass/`. Zielbild: Ausliefern soll knackig sein, der Zugriff
soll wehtun.

| Dimension | vorher | nachher | Was sich geändert hat |
|---|---|---|---|
| Responsiveness | 1/2 | 2/2 | Vorgewählte Richtung war unsichtbar, bis zu 570 ms bis zur nächsten Kreuzung ohne jede Rückmeldung. Jetzt Pfeil an der Zielkreuzung, ein Frame nach der Eingabe |
| Clarity | 1/2 | 2/2 | Verfolgerstatus war nirgends ablesbar, Pin-Restzeit nur als Blinken unter 5 s. Jetzt roter Ring am verfolgenden Wagen, Restzeit-Arc am Pin, grüner Ring wenn Roberto Cash trägt |
| Impact | 0/2 | 2/2 | Lieferung war eine reine Zahlenänderung im HTML über dem Feld, null Kanäle am Ort der Handlung. Jetzt Zahl, Ring, 50 ms Standbild, 2,5 px Ruckeln, Zweiklang. Bust: 220 ms Standbild, 14 px Ruckeln, Vignette, Rauschen plus Sägezahn |
| Rhythm | 1/2 | 1/2 | Sirene steigt mit der Nähe, Kombo-Fenster erzeugt Druck. Bleibt bei 1: Layout und Streifen-KI wiederholen sich ab der 50. Lieferung unverändert |
| Payoff | 1/2 | 2/2 | Kombo lief mit, wurde aber nie angezeigt, und der Betrag erschien nur außerhalb des Blickfelds. Jetzt Betrag am Lieferort, Kombo-Anzeige mit Fensterbalken, Münzkaskade beim Einzahlen skaliert mit der Summe |
| Dead Time | 1/2 | 2/2 | 2,5 s Haft ohne Eingabe, über der 1-Sekunden-Grenze. Jetzt Hämmern statt Warten, real 0,5 bis 1,5 s |
| Overload | 2/2 | 1/2 | Neu erkauft: Einzahlen während einer Verfolgung stapelt Vignette, Ruckeln, Münzen und Fließtext. Beobachten |
| **Summe** | **7/14 FLAT** | **12/14 ALIVE** | |

Offen: Rhythmus über die lange Sitzung (Layoutwechsel, zweites Streifenverhalten)
und der Overload-Stapel bei gleichzeitigen Ereignissen.

## Ideenliste

Grafik: Schatten unter Figuren, Straßenlaternen, Zebrastreifen, laufende Beine,
Lichtkegel bei Verfolgung.

Gameplay: Sprint mit Ausdauer, Gassen als Abkürzung, Zivilverkehr als Hindernis,
Straßensperren ab 4 Sternen, Nachtschicht mit höheren Sätzen, wechselndes Stadtlayout
pro Schicht.

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

`feel-pass` liegt bereits im Repo. Die übrigen Skills der Sammlung, unter anderem
`balance-review` für die Shop-Preise und `player-experience` für die erste Schicht,
holt der Befehl oben dazu.

## Lizenz

Mach damit, was du willst.
