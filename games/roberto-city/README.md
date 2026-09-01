# Roberto City

Ein Liefer- und Fluchtspiel im Browser. Reines HTML5-Canvas, keine Abhängigkeiten,
kein Build. `index.html` doppelklicken, fertig.

## Spielregeln

- **Lager** (oranges Haus, oben links): auffüllen, Grundkapazität 3 Ladungen
- **Kundenpins** (rot): mit Ware ranlaufen zahlt aus, Pin verfällt nach 18 Sekunden
- **Bunker** (lila Haus, unten rechts): Cash einzahlen. Der Bunker ist gleichzeitig
  das Konto für den Shop und bei einem Zugriff unantastbar
- **Fahndung**: 5 Sterne. Jede Lieferung +0,55. Ab 1 Stern nehmen Streifenwagen die
  Verfolgung auf, pro Stern kommt ein Wagen dazu (max. 4) und sie werden schneller
- **Bust**: Ware und Bargeld weg, kurze Haft, Fahndung zurück auf null
- **Schicht**: 110 Sekunden

## Steuerung

Pfeiltasten oder WASD, am Handy die Tasten unter dem Feld oder Wischen auf dem Feld.
Bewegung ist Pac-Man-artig: Richtung vorgeben, Roberto läuft bis zur nächsten
Kreuzung weiter. Richtungen lassen sich vorwählen.

## Aufbau

Alles steckt in `index.html`. Wichtige Stellen im Script:

| Bereich | Was da passiert |
|---|---|
| `XS` / `YS` | Fahrspurraster, bestimmt Stadtlayout und Kollision |
| `UP` / `apply()` | Shop-Upgrades und ihre Effekte auf die Spielwerte |
| `moveCop()` | Streifen-KI, Kreuzungsentscheidung mit `cool`-Sperre |
| `step()` | Spiellogik pro Frame |
| `draw()` | gesamte Darstellung |

Der `cool`-Zähler in `moveCop()` ist kein Schmuck: ohne ihn gilt ein Wagen mehrere
Frames lang als "an der Kreuzung", setzt sich jedes Mal zurück und zappelt auf der
Stelle.

## Ideenliste

Grafik: Schatten unter Figuren, Straßenlaternen, Zebrastreifen, laufende Beine,
Lichtkegel bei Verfolgung, Partikel beim Einzahlen.

Gameplay: Sprint mit Ausdauer, Gassen als Abkürzung, Zivilverkehr als Hindernis,
Straßensperren ab 4 Sternen, Nachtschicht mit höheren Sätzen.

Feeling: Kameraruckeln beim Bust, kurze Zeitlupe vor dem Zugriff, Kombo-Anzeige.

Technik: Fortschritt in `localStorage`, Highscore-Tabelle, Sound über die Web Audio API.

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

## Lizenz

Mach damit, was du willst.
