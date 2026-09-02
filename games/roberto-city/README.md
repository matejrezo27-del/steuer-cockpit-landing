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
Finger auf dem Feld ziehen.

| Taste | nachts | tagsüber |
|---|---|---|
| Pfeiltasten | laufen, solange gehalten | schieben die Karte |
| Enter | einem Anruf zusagen | — |
| Leertaste | im Versteck Feierabend machen | Nacht beginnen |
| `M` | Ton | Ton |
| Tipp auf die Karte | Anruf annehmen | Lokal kaufen |

Hältst du quer zur Fahrtrichtung, läuft er bis zur nächsten Kreuzung weiter und biegt
dort ab. Steht er mitten auf einer Straße und du hältst quer, geht er erst zur
Kreuzung. Ohne diese gepufferte Kurve müsste man jede Abzweigung auf den Pixel treffen.

## Die Stadt

Ein Raster aus **8 × 8 Blöcken**, 780 × 780 Pixel, rund fünfmal so groß wie das alte
Spielfeld. Das Sichtfenster bleibt 360 × 440, die **Kamera folgt Roberto** und stößt an
den Stadtmauern an. Tagsüber schiebst du die Karte selbst mit den Pfeiltasten, um Lokale
zu suchen und anzuklicken.

Das **Versteck jedes Viertels ist Robertos Zuhause**. Wer hineingeht, kühlt die Fahndung
und kann mit der Leertaste **Feierabend machen** — die Nacht endet dann sofort, mit
allem was bis dahin im Bunker liegt. Wer bis zum Morgen draußen bleibt, riskiert mehr.

Die Stadt hat vier Viertel. Nur die Altstadt ist von Anfang an offen, der Rest ist
hinter einem Bauzaun gesperrt und muss freigeschaltet werden:

| Viertel | Ansehen | Preis |
|---|---|---|
| Altstadt | — | von Anfang an |
| Hafenviertel | 25 | 2 500 € |
| Neustadt | 70 | 14 000 € |
| Villenhang | 150 | 60 000 € |

Freigeschaltet wird der Reihe nach. Jedes Viertel bringt eine eigene Wache, ein eigenes
Versteck, neue Blöcke für Kontakte und zwei Lokale.

**Ansehen** ist die zweite Währung neben Geld. Es kommt aus erfüllten Aufträgen (+1),
neuen Kontakten (+1), Rangaufstiegen (+3), gekauften Lokalen (+3), gezahlten Steuern
(+1) und guten Auslandsgesprächen. Eine Verurteilung kostet 5.

## Imperium

### Lokale

Acht Läden über die Stadt verteilt, jeder in einem bestimmten Viertel. Ein gekauftes
Lokal zahlt **jeden Tag** in den Bunker, ob du nachts arbeitest oder nicht.

Kaufen geht auf zwei Wegen: über die Liste im Imperium-Tab, oder **direkt auf der
Karte** — tagsüber die Karte mit den Pfeiltasten hinschieben und den Laden antippen.

| Lokal | Viertel | Preis | am Tag |
|---|---|---|---|
| Späti am Eck | Altstadt | 2 500 € | 240 € |
| Imbiss Pinar | Altstadt | 4 200 € | 350 € |
| Hafenbar Anker | Hafenviertel | 9 000 € | 660 € |
| Club Neon | Hafenviertel | 16 000 € | 1 060 € |
| Ristorante Vito | Neustadt | 24 000 € | 1 440 € |
| Spielhalle Royal | Neustadt | 38 000 € | 2 090 € |
| Hotel Belvedere | Villenhang | 70 000 € | 3 550 € |
| Marina Club | Villenhang | 120 000 € | 5 640 € |

### Personal

| Rolle | ab Ansehen | Lohn am Tag | Wirkung |
|---|---|---|---|
| Läufer (bis 4) | 5 | 60 € | arbeitet nachts vier Packs zum Grundpreis ab, 10 % Risiko einer Akte |
| Fahrer | 15 | 200 € | +2 Ware pro Ladung |
| Aufpasser | 30 | 250 € | Streifen erkennen dich 15 % später |
| Buchhalter | 45 | 300 € | Steuersatz 10 Punkte niedriger |

Löhne werden **jeden Tag** abgezogen. Reicht der Bunker nicht, ist am nächsten Morgen
die ganze Mannschaft weg.

### Laufende Kosten

| Posten | Höhe | wann |
|---|---|---|
| Löhne | Summe der Tagessätze | täglich |
| Betriebskosten | 1,5 % des Kaufpreises aller Lokale | täglich |
| Abgabe nach oben | 12 % des Nachtertrags, entfällt als Legende | täglich |
| Steuerbescheid | 30 % der Lokaleinnahmen der Woche plus 20 % geschätzt auf das Nachtgeschäft, mit Buchhalter 20 % | alle 7 Tage |

Nicht gezahlte Steuern bringen **zwei Akten** und einen um 20 % höheren Bescheid.

## Was die Ökonomie vorher kaputt gemacht hat

Der `balance-review`-Skill verlangt ein gerechnetes Modell statt Bauchgefühl. Gerechnet
wurde über fünf Spielstände von Rang 1 bis Rang 10.

**Läufer waren ein Verlustgeschäft.** Bei 120 € Lohn und zwei Packs zu 75 % des
Grundpreises:

| Ware | Umsatz | Wareneinsatz | Lohn | Ergebnis |
|---|---|---|---|---|
| Cannabis | 60 € | 44 € | 120 € | **−104 €/Tag** |
| Speed | 143 € | 105 € | 120 € | **−82 €/Tag** |
| Kokain | 315 € | 231 € | 120 € | **−36 €/Tag** |

Jetzt 60 € Lohn und vier Packs zum vollen Grundpreis: +12 €/Tag bei Cannabis, +318 bei
Kokain, mit gutem Grossisten +478. Der Läufer lohnt sich also erst mit besserer Ware,
und das ist beabsichtigt.

**Alle Lokale amortisierten gleich** in 20 bis 24 Tagen, egal ob Späti oder Marina Club.
Neu gestaffelt mit Betriebskosten: 19 Tage beim Späti bis 56 beim Marina Club. Kleine
Läden sind der schnelle Einstieg, große eine echte Langfristanlage.

**Die Multiplikatorkette explodierte.** Vertrauen, Sterne und Kombo multiplizierten sich
alle auf den Grundpreis, der selbst je Stufe verfünffacht. Ergebnis: Rang 10 verdiente
das **26-fache** von Rang 1. Die Faktoren sind von 0,14 auf 0,08 und von 0,22 auf 0,12
gesenkt, die Kombo zahlt jetzt pauschal. Spreizung noch 14-fach.

**Das Geld hatte keinen Abfluss.** Faucet gegen Sink:

| Tag | vorher | nachher |
|---|---|---|
| 1 | 365 | 3,1 |
| 7 | 7,1 | 2,3 |
| 14 | 5,3 | 2,3 |
| 30 | 5,4 | 2,1 |
| 60 | 9,7 | 2,0 |

Gesund wären 0,9 bis 1,1. Von 5 bis 9 auf rund 2 ist eine Halbierung, aber **das Spiel
ist weiterhin inflationär**. Ab etwa Tag 30 liegt mehr im Bunker als das teuerste Ziel
kostet. Um auf 1,0 zu kommen, müsste entweder der Nachtertrag im Endspiel halbiert
werden oder ein großer wiederkehrender Abfluss dazukommen: Geldwäsche mit Gebühr,
Schutzgeld an eine Konkurrenz, oder Lokale, die überfallen werden können. Das steht aus.

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

**Aufträge kommen nachts per Anruf.** Alle 10 bis 18 Sekunden meldet sich jemand, wer
dir mehr vertraut öfter und mit mehr Packs. Ein Anruf steht sieben Sekunden: **Enter**
oder ein Tipp auf das Band sagt zu, ignorieren kostet nichts. Gleichzeitig offen sein
können 2 + Rang/3 Aufträge, mit Zweithandy einer mehr.

Ein voll erfüllter Auftrag bringt +0,55 Vertrauen, eine **geplatzte Zusage kostet 0,6**
— mehr, als eine Erfüllung bringt. Zusagen ist also eine Verpflichtung, kein Sammeln.

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

### Revision zum Bundesgerichtshof

Gegen ein Urteil der Großen Strafkammer gibt es keine Berufung mehr, sondern die
Revision. Die ist **etwas ganz anderes als eine Verhandlung**: der Senat hört keine
Zeugen, stellt keine Tatsachen fest und tagt in der Regel gar nicht. Er entscheidet nach
Aktenlage im Beschlusswege, § 349 StPO. Im Spiel gibt es dafür keinen Saal, sondern
sechs Tage später Post aus Karlsruhe.

**Nur mit Anwalt.** Die Revisionsbegründung muss von einem Verteidiger unterschrieben
sein, § 345 Abs. 2 StPO. Ohne den Anwalt aus dem Shop steht der Weg nicht offen.

Beim Einlegen wählst du die Rüge:

| Rüge | Kosten | Wirkung |
|---|---|---|
| **Sachrüge** | 2 500 € | Die allgemeine Rüge, immer zulässig. Der Senat prüft nur das Urteil selbst. |
| **Verfahrensrüge** | 3 200 € | Wirkt fast nur, wenn im Prozess wirklich ein Fehler passiert ist. |
| **Beide** | 5 000 € | Teuer, deckt aber beides ab. |

Ob ein Verfahrensfehler vorlag, entscheidet sich **während des Prozesses**. Bei der
Großen Strafkammer passiert es in 38 % der Fälle, dass die Kammer einen Beweisantrag
ohne Begründung ablehnt. Wenn das geschieht, steht es in der Beweisaufnahme auf dem
Bildschirm. Wer aufpasst, weiß später, ob sich die Verfahrensrüge lohnt.

Erfolgsaussicht: 12 % Grundchance, +18 % für die Sachrüge, +35 % für die Verfahrensrüge
**wenn ein Fehler vorlag**, sonst nur +3 %. Über 24 Testläufe mit beiden Rügen gemessen:

| | erfolgreich | verworfen |
|---|---|---|
| mit Verfahrensfehler | 8 von 12 | 4 von 12 |
| ohne | 3 von 12 | 9 von 12 |

Vier mögliche Beschlüsse:

| Beschluss | Folge |
|---|---|
| **Verworfen** (§ 349 II) | Das Urteil ist rechtskräftig, Strafe und Haft werden vollstreckt, die Kosten sind weg. |
| **Strafausspruch aufgehoben** (§ 353) | Nur die Strafzumessung fällt, neu festgesetzt auf 55 % und zwei Hafttage weniger. |
| **Aufgehoben und zurückverwiesen** (§ 354 II) | Eine andere Strafkammer verhandelt vier Tage von vorn, eine Vorstrafe fällt weg. |
| **Freispruch** (§ 354 I) | Der Senat entscheidet selbst. Vorstrafe getilgt, +12 Ansehen. |

Bis der Beschluss da ist, wird **nichts vollstreckt** und du spielst normal weiter.

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
| `kamera()` / `kameraTag()` | Sichtfenster, nachts folgend, tagsüber selbst geschoben |
| `neuerAnruf()` / `anrufAnnehmen()` | nächtliche Aufträge per Anruf |
| `feierabend()` | Nacht im Versteck beenden |
| `setTab()` | vier Reiter statt einer langen Seite |
| `hold` / `halt()` / `los()` | Halten statt Automatik, samt gepufferter Kurve |
| `LOKALE` / `ROLLEN` / `nextDay()` | Einnahmen, Löhne, Steuerbescheid am Tageswechsel |
| `AUSLAND` / `fliegen()` / `verhandeln()` | Flug, Gespräch, freigeschaltete Lieferanten |
| `kontakte` / `neuerKontakt()` | benannte Abnehmer, Vertrauen, neue Bekanntschaften |
| `spawnCop()` / `moveCop()` | Ausrücken aus der nächsten Wache, Verfolgung, Rückfahrt |
| `GERICHTE` / `zustaendig()` | drei Instanzen, Besetzung, Verhandlungstage |
| `prozessWeiter()` | Schritt und Verhandlungstag, Übergang in den nächsten Spieltag |
| `forderung()` / `urteilSprechen()` | Antrag der Anklage und Strafzumessung |
| `berufung()` | Rechtsmittel ans Landgericht |
| `RUEGEN` / `revisionEinlegen()` | Sach- und Verfahrensrüge, Kosten, Aussetzung |
| `revisionEntscheiden()` | der Beschluss des Senats nach Aktenlage |
| `revisionSzene()` | Post aus Karlsruhe statt Gerichtssaal |
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
- **Läufer arbeiten pauschal.** Sie räumen vier Packs zum Grundpreis ab, statt gezielt
  zugesagte Aufträge zu bedienen. Rechnerisch stimmt es jetzt, inhaltlich noch nicht.
- **Die Ökonomie bleibt inflationär**, siehe den eigenen Abschnitt. Von 5–9 auf 2,0
  gesenkt, gesund wären 1,0.
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
