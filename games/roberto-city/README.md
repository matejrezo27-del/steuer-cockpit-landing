# Roberto City

Eine kleine Unterwelt-Simulation im Browser. Nachts ausliefern, tags ein Imperium
bauen: Viertel freischalten, Lokale kaufen, Personal einstellen, Steuern zahlen,
Kontakte im Ausland aufbauen und irgendwann vor den Richter.

Reines HTML5-Canvas, keine Abhängigkeiten, kein Build. `index.html` doppelklicken.

## Tag und Nacht

**Nacht** ist das Spiel: 90 Sekunden ausliefern, bunkern, der Streife entkommen.
**Tag** ist alles andere: Ware kaufen, Viertel freischalten, Lokale kaufen, Personal
einstellen, Steuern zahlen, und an manchen Tagen vor den Richter.

Über dem Feld steht eine **Statuszeile**: die Phase, was im Lager liegt, was Roberto
gerade trägt, was die Lokale bringen, was sie kosten, und in Rot alles, was drückt —
offene Steuern, Akten, Haftbefehl, Prozess, Gerichtstermin. Nachts läuft darüber ein
Balken für die Restzeit der Schicht, die Uhr rechts zeigt sie als `1:29`. Vorher stand
das verstreut in drei Reitern, und die Steuer tauchte erst auf, als sie fällig war.

## Steuerung

**Roberto läuft nur, solange du eine Taste hältst.** Loslassen heißt stehenbleiben.
Pfeiltasten oder WASD am Rechner, am Handy die Tasten unter dem Feld halten oder den
Finger auf dem Feld ziehen.

| Taste | nachts | tagsüber |
|---|---|---|
| Pfeiltasten | laufen, solange gehalten | laufen, solange gehalten |
| Enter | einem Anruf zusagen | — |
| Leertaste | im Versteck Feierabend machen | Nacht beginnen |
| `M` | Ton | Ton |
| Tipp auf die Karte | Anruf annehmen | Lokal kaufen |

Hältst du quer zur Fahrtrichtung, läuft er bis zur nächsten Kreuzung weiter und biegt
dort ab. Steht er mitten auf einer Straße und du hältst quer, geht er erst zur
Kreuzung. Ohne diese gepufferte Kurve müsste man jede Abzweigung auf den Pixel treffen.

## Die Stadt

Ein Raster aus **8 × 8 Blöcken**, 780 × 780 Pixel, rund fünfmal so groß wie das alte
Spielfeld. Das Sichtfenster bleibt 360 × 440.

**Der Zoom richtet sich danach, wie viel Stadt offen ist.** Er wird so weit
herausgezogen, dass der freigeschaltete Teil ins Bild passt — bis zur Grenze von 0,68,
darunter würden die Beschriftungen unlesbar. Passt alles hinein, steht die Karte still
und nur Roberto läuft. Passt es nicht mehr, **geht die Kamera mit ihm mit** und hält
ihn mittig.

| offen | Zoom | sichtbar | Kamera |
|---|---|---|---|
| Altstadt | 0,92 | 390 × 477 von 390 × 390 | steht still, alle 16 Blöcke im Bild |
| zwei Viertel | 0,68 | 529 × 647 von 780 × 390 | folgt waagerecht, senkrecht mittig |
| alle vier | 0,68 | 529 × 647 von 780 × 780 | folgt Roberto in beide Richtungen |

Gemessen beim Halten von "rechts" auf der vollen Karte: Roberto läuft von 165 auf 540
Weltpixel, die Kamera zieht von 0 auf 251 mit, und er steht dabei bei Bildschirm-x 197
von 360 — also durchgehend mittig.

Vorher stand eine **Totzone** von 25 % darin: die Karte blieb stehen, bis Roberto den
äußeren Rand erreichte. Das löste zwar das Problem, dass sich optisch die Welt statt
der Figur bewegt, ließ aber bei nur einem offenen Viertel drei Viertel der Altstadt
außerhalb des Bildes. Der Zoom löst beides auf einmal: früh sieht man alles, spät
folgt die Kamera.

Roberto läuft **auch tagsüber**, nur ohne Streifen, Aufträge und Uhr. So kommst du zu
den Lokalen, die du anklicken willst.

**Was außerhalb des Bildes liegt, zeigt ein Pfeil am Rand.** Neue Kontakte (blaues
Fragezeichen) und offene Aufträge (rote Nadel mit der Stückzahl) kleben mit Richtung
und Entfernung am Bildschirmrand, sobald sie aus dem Ausschnitt laufen. Vorher tauchte
hinten in der Stadt jemand auf, und man erfuhr es nie.

**Dazu eine Übersicht in der Ecke**, Tag wie Nacht. Sie zeigt die ganze Stadt als Punkte
— Lager, Bunker, Wachen, Verstecke, deine Lokale, offene Aufträge, neue Kontakte, deine
Läufer, Streifen, Roberto — plus einen Rahmen für das, was gerade im Bild ist. Das ist
die Antwort auf „das ganze Spielfeld sehen, ohne dass alles zu klein wird": das Feld
bleibt groß, die Übersicht ist klein, und weil sie nur Punkte zeichnet, bleibt sie
lesbar. Die Randpfeile weichen ihr aus.

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
| Läufer (bis 4) | 5 | 60 € | läuft nachts mit, +1 Auftrag gleichzeitig |
| Fahrer | 15 | 200 € | +2 Ware pro Ladung |
| Aufpasser | 30 | 250 € | Streifen erkennen dich 15 % später, Läufer fliegen seltener auf |
| Buchhalter | 45 | 300 € | Steuersatz 10 Punkte niedriger |

Löhne werden **jeden Tag** abgezogen. Reicht der Bunker nicht, ist am nächsten Morgen
die ganze Mannschaft weg.

#### Läufer laufen wirklich mit

Sie standen vorher nicht auf der Karte. Beim Morgengrauen räumten sie pauschal vier
Packs Restware ab — und wer sauber spielt, hat morgens nichts liegen. Also taten sie
sichtbar nichts und kosteten nur Lohn.

Jetzt sind sie nachts als graue Figuren unterwegs und arbeiten dieselbe Schleife wie
Roberto: **im Lager laden** (3 Pack, die im Telefon ausgewählte Ware), **zu einem
zugesagten Auftrag laufen**, abliefern, zurück. Das Geld geht direkt in den Bunker. Sie
bekommen keinen Sternbonus und keinen Pünktlichkeitsaufschlag — sie liefern nur ab —,
und **eine Streife kann sie aufgreifen**: Ware weg, eine Akte für dich, 14 Sekunden
raus. Der Aufpasser drückt dieses Risiko von 0,75 auf 0,35 pro Sekunde in Reichweite.

Zwei Dinge mussten sich dafür ändern, beide gemessen:

* **Erledigte Aufträge blieben ewig in der Liste**, weil ihr Zeitzähler erst nach dem
  `offen`-Test lief. Sie werden jetzt entfernt.
* **Ein leeres Fach legte den ganzen Betrieb lahm.** Zeigte die Warenwahl auf eine
  Sorte, von der nichts dalag, blieben Roberto und die Läufer vor vollem Lager stehen —
  und nachts lässt sich die Wahl nicht umstellen. Jetzt wird nachgeladen, was da ist:
  dieselbe Sorte weiter, sonst die gewählte, sonst die wertvollste verfügbare.
* **Die Anrufrate hing an nichts.** Alle 10 bis 18 Sekunden ein Anruf, egal wie groß
  der Laden war — damit war die *Nachfrage* der Deckel, nicht das Personal. Im Test
  stand der zweite Läufer die halbe Nacht mit voller Tasche da, weil es keinen zweiten
  Auftrag gab. Jetzt teilt sich das Intervall durch `1 + Kontakte × 0,10 + Läufer ×
  0,30`, und `MAXAUF` steigt um einen je Läufer: mehr Leute heißt mehr Betrieb.

Gemessen über eine Nacht, Mittelspiel mit sechs Kontakten und zwei Läufern, Roberto
steht still:

| | vorher | nach dem Umbau |
|---|---|---|
| von Läufern geliefert | 4 Pack / 170 € | **13 Pack / 650 €** |
| Proben mit Ware, aber ohne Auftrag | 166 von 168 | 84 von 173 |

Bei 120 € Lohn und rund 182 € Wareneinsatz bleiben so etwa **350 € je Nacht** übrig,
bei Kokain ein Vielfaches. Vorher war es ein Minusgeschäft.

#### Was Personal kostet, wenn es schiefgeht

Ein aufgegriffener Läufer kostete anfangs nur Ware und eine Akte — zu billig für ein
System, das so viel Geld verdient. Jetzt gilt:

| | |
|---|---|
| **Seine Strafe, deine Rechnung** | 120 € + 1,2 × Grundpreis der Ware, also rund 170 € bei Cannabis und 370 € bei Kokain. Fällig am Tageswechsel. Deckt der Bunker sie nicht, gibt es stattdessen eine Akte. |
| **Nur manchmal redet er** | In 30 % der Fälle kommt zusätzlich eine Akte auf deinen Namen. |
| **Schwund** | Mit 12 % Wahrscheinlichkeit behält ein Läufer 30 bis 60 % einer Auszahlung für sich. Der Aufpasser halbiert das auf 6 %. |

Der Aufpasser verdient damit sein Geld doppelt: er senkt das Aufgriffsrisiko von 0,75
auf 0,35 je Sekunde in Reichweite **und** den Schwund. Die Ladung liegt bei zwei Packs,
damit ein Läufer nicht mehr trägt als Roberto am Anfang.

### Laufende Kosten

| Posten | Höhe | wann |
|---|---|---|
| Löhne | Summe der Tagessätze | täglich |
| Betriebskosten | 1,5 % des Kaufpreises aller Lokale | täglich |
| Abgabe nach oben | 12 % des Nachtertrags, entfällt als Legende | täglich |
| Bankzinsen | 1,2 bis 3,0 % der Restschuld, je nach Bonität | täglich |
| Zinsen auf der Straße | 5 bis 9 % der Restschuld, je nach Zahlungstreue | täglich |
| Kommission | 1,6-facher Einkaufspreis der vorgestreckten Ware | am Tag danach |
| Steuerbescheid | 30 % der Lokaleinnahmen der Woche, mit Buchhalter 20 % | alle 7 Tage |

Nicht gezahlte Steuern bringen **zwei Akten** und einen um 20 % höheren Bescheid.

**Besteuert wird nur, was angemeldet ist.** Das Finanzamt sieht die Lokale, nicht das
Nachtgeschäft — vorher schätzte es 20 % auf den Nachtumsatz dazu, was weder zum Rest
der Fiktion passte noch im Bescheid nachvollziehbar war. Wer ohne Lokale spielt, kriegt
also nie einen Bescheid. Was der Unterwelt zusteht, holt sie sich selbst: die **Abgabe
nach oben**, und seit die Streife wirklich fährt, jeder Zugriff.

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
| Cannabis | 1 | 40 € | 0,40 | 6 |
| Speed | 4 | 95 € | 0,68 | 14 |
| Kokain | 8 | 210 € | 1,05 | 30 |

**Jede Ware hat ihr eigenes Fach im Lager.** Umsteigen geht jederzeit, auch mit voller
Kiste — vorher war der Wechsel gesperrt, solange noch etwas dalag, und weil Restware
über Nacht liegen bleibt, hieß das in der Praxis: nie. Der Grund für die Sperre war,
dass billiges Gras beim Wechsel zu teurem Kokain geworden wäre. Getrennte Fächer lösen
das sauberer. Was Roberto trägt, behält seine Sorte bis zur Übergabe; abgeholt wird
immer die im Telefon ausgewählte Ware, und wer schon etwas anderes trägt, muss das
erst loswerden.

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

**Pünktlichkeit statt Kombo.** Jeder Auftrag hat eine Frist von 34 Sekunden plus 10 je
Pack. Wie viel davon noch übrig ist, zählt: bis **+30 % auf die Auszahlung**, und wer
über die Hälfte der Frist übrig lässt, bekommt +0,75 Vertrauen statt +0,55. Der
dringendste Auftrag steht unten links mit Restzeit und Balken.

Vorher gab es dafür eine Kombo, die zehn Sekunden nach jeder Lieferung ablief. Die kann
nicht funktionieren, seit die Aufträge zufällig per Anruf reinkommen: ob zwei Kunden
nah beieinander wohnen und ob überhaupt zwei gleichzeitig offen sind, entscheidet der
Zufall, nicht der Spieler. Eine Frist ist dagegen etwas, das man wirklich einhalten
kann.

## Nachschub

Zwei Orte, zwei Dinge, und die Karte sagt beides:

* **LAGER** (gelb) ist die **Ware**. Egal bei wem du kaufst — Hafen, Tarek, Nadja,
  Werft oder Amsterdam —, geliefert wird immer dorthin. Die Zahl auf dem Block ist der
  gesamte Bestand, gelb wenn die ausgewählte Sorte dabei ist.
* **BUNKER** (violett) ist das **Geld**. Nachts trägst du den Umsatz dorthin.

Der Block hieß vorher HAFEN, obwohl er längst jede Quelle bediente, und im Telefon
stand weiter „am Hafen liegen …“, auch wenn man bei der Werft kaufte. Das war schlicht
falsch beschriftet.

Ware kaufst du tagsüber auf eigene Rechnung, Startkapital sind 200 €. Was du am Morgen
noch am Mann hast, wandert in sein Fach zurück; verloren geht Ware nur beim Zugriff.

## Fahndung

**Ein Wagen je vollem Stern.** Bei einem Stern rückt eine Streife aus, bei zwei zwei,
höchstens vier. Zwischen zwei Ausrückungen liegen **4 Sekunden** (mit Funkscanner 5,5).
Vorher waren es bei einem Stern schon zwei Wagen im Abstand von 2,2 Sekunden — das kam
als Schwarm heraus, nicht als Fahndung.

**Fahndung entsteht nicht durch Lieferungen, sondern durchs Tragen.** Wer nachts mit
Ware oder Bargeld durch die Stadt läuft, fällt jede Sekunde ein Stück weiter auf — mit
`Hitze × 0,055` pro Sekunde, bei Cannabis also 0,022, bei Kokain 0,058. Dazu kommt der
Sprung pro Übergabe (Tabelle oben, an einer Wache × 1,3).

Sauber wird man nur an zwei Orten: im **Bunker** (Geld abgeben senkt die Fahndung um
einen ganzen Stern) und im **Versteck**. Solange etwas dabei ist, kühlt gar nichts ab.
Ist man leer, beginnt nach **5 Sekunden** Ruhe (mit Funkscanner 3) das Abkühlen mit
**0,16 pro Sekunde**, mit Sonnenbrille 0,21. Ein Stern braucht damit rund sechs
Sekunden statt drei: die Fahndung ist ein Zustand, kein Aufblitzen. Nach einem Zugriff
bleibst du bei 0,6 Sternen stehen, damit nicht sofort der nächste Wagen kommt.

Streifen rücken ab **0,8 Sternen** aus, kommen aus der **Wache des nächstgelegenen
offenen Viertels** und fahren dorthin zurück. In gesperrte Viertel fahren sie nicht.

### Warum die Polizei vorher nie kam

Gemessen, nicht vermutet. Hitze entstand ausschließlich pro Lieferung (+0,28 bei
Cannabis) und fiel nach 6 Sekunden Ruhe mit 0,5 pro Sekunde. Eine Cannabis-Lieferung
war damit nach 6,6 Sekunden restlos verschwunden. Seit die Aufträge zufällig alle 10
bis 18 Sekunden reinkommen, lagen zwischen zwei Übergaben fast immer mehr als 6,6
Sekunden — die Fahndung erreichte nie einen Stern, und unter einem Stern rückte keine
Streife aus. Damit war auch das Versteck sinnlos: es hatte nie etwas abzukühlen.

Nach dem Umbau, über je eine volle Nacht im Browser gemessen (Bot ohne Ausrüstung):

| Spielweise | max. Sterne | Ø Sterne | max. Streifen | Nacht mit Streife | Zugriffe |
|---|---|---|---|---|---|
| Cannabis, bankt nach jeder Lieferung | 1,41 | 0,15 | 1 | 13 % | 0 |
| Cannabis, bankt erst ab 300 € | 1,70 | 0,37 | 2 | 39 % | 2 |
| Kokain, bankt erst ab 900 € | 2,11 | 1,13 | 3 | 71 % | 3 |

Vorsichtig spielen wird belohnt, gierig spielen kostet. Genau das war der Punkt.

### Das Versteck

Man geht wirklich hinein, statt nur in der Nähe zu stehen. **Halte die Richtung zum
Block**, dann zieht es dich hinein — vorbeilaufen genügt nicht, und das ist Absicht:
die Fahrspur liegt nur 45 px von der Blockmitte, ein reiner Näherungsradius hätte jeden
erwischt, der vorbeikommt. Im Messlauf blieb der Testbot damit die halbe Nacht in
fremden Verstecken hängen.

Drinnen ist die Tür für **1,2 + 1,5 × Sterne Sekunden** zu. Ohne Fahndung geht sie
nach 0,3 Sekunden wieder auf — dann ist es einfach Robertos Wohnung und keine Falle.
Heiß wird daraus der Unterschlupf: bei drei Sternen bleibt sie knapp sechs Sekunden zu.
Solange:

* keine Bewegung, außen läuft ein Ring als Uhr;
* Abkühlen mit **1,6 pro Sekunde**, Streifen verlieren dich sofort;
* nach 1,2 Sekunden bringt der Mann im Versteck dein **Bargeld weg — für 20 %**. Der
  lange Weg zum Bunker bringt alles, wenn man ankommt. Das ist die Entscheidung.

Ist die Zeit um, trägt dich die **gehaltene Richtung wieder auf die Straße**. Danach
greift der Sog erst wieder, wenn du den Block einmal verlassen hast — sonst würde der
Ausgang, der ja auf der Fahrspur liegt, dich sofort zurücksaugen.

### Feierabend

**Den Hauptknopf drei Sekunden halten** beendet die Schicht, im Versteck genügt eine
Sekunde. Der Knopf füllt sich dabei sichtbar. Die Leertaste tut dasselbe.

Vorher ging Feierabend nur im Versteck und nur per Leertaste. Wer keine Ware mehr hatte,
saß die Nacht ab. Ein kurzer Tastendruck darf die Schicht aber auch nicht aus Versehen
beenden — daher das Halten. Dass ein Fehltipp auf die Texte darunter Buchstaben
markierte, war derselbe Ärger: die Bedienleisten sind jetzt `user-select: none`.

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

### Verteidiger im laufenden Verfahren

Der **Anwalt auf Abruf** im Shop ist ein Mandat auf Vorrat: 800 €, aber Tage vorher zu
kaufen. Wer erst im Saal merkt, dass es eng wird, kann jetzt einen **Wahlverteidiger
für dieses Verfahren** beauftragen — in jeder Phase bis zum letzten Wort.

| Gericht | Preis |
|---|---|
| Amtsgericht, Strafrichter | 900 € |
| Amtsgericht, Schöffengericht | 1400 € |
| Landgericht, Große Strafkammer | 2200 € |

Teurer als der Vorrat, dafür genau dann, wenn man ihn braucht. Er wirkt sofort: halbe
Geldstrafe, ein Hafttag weniger, und Bestreiten, Widerspruch und die Revision zum BGH
werden überhaupt erst aussichtsreich. Er bleibt bis zum Ende des Verfahrens, die
Revision eingeschlossen, und ist danach weg.

### Bewährung und Strafantritt

**Haft wird nicht mehr sofort angetreten.** Das war vorher so: Urteil, und der nächste
Knopf hieß „In die Zelle". Jetzt gibt es zwei Wege.

**Bewährung** (§ 56 StGB) bei bis zu 3 Tagen Haft, höchstens 2 Vorstrafen und wenn du
nicht bestritten hast. Die Vollstreckung wird ausgesetzt, Bewährungszeit 14 Tage, dazu
eine **Geldauflage von 450 € je Tag** (§ 56b). Zahlst du sie und bleibst sauber, ist
die Strafe erlassen und **eine Vorstrafe fällt weg** (§ 56g). Bleibt die Auflage am Ende
offen, wird widerrufen. Wirst du in der Bewährungszeit erneut verurteilt, kommen die
ausgesetzten Tage oben drauf (§ 56f).

**Ladung zum Strafantritt** sonst: du musst dich in **3 Tagen** stellen, bist bis dahin
aber frei und spielst normal weiter — Nächte, Einkauf, Lokale, Shop, alles offen. Genau
dafür ist die Frist da: Ware zu Geld machen, Löhne vorstrecken, Schulden tilgen, bevor
die Tür zugeht. Der Nebenknopf tritt die Strafe früher an.

Am Antrittstag hast du noch eine Wahl: **stellen** oder **nicht stellen**. Wer nicht
erscheint, bekommt einen **Vollstreckungshaftbefehl**, einen Tag mehr und einen Termin
zwei Tage später — und die Streife jagt ihn ab sofort auch ohne Fahndungsstern, mit
sofortiger Haft beim Zugriff. Das nutzt die Fahndung, die es ohnehin schon gibt.

Beim **Zugriff auf frischer Tat** gibt es keine Ladung. Da wird sofort abgesessen.

### Die Zelle

Haft ist eine eigene Szene mit Strichliste an der Wand. Jeder Tag würfelt ein Ereignis:
Hofgang bringt einen Kontakt, Ärger im Trakt einen Tag mehr, ein Anwaltsbesuch einen
weniger.

## Tagesabschluss

Nach jeder Nacht steht unter dem Feld eine **Plus-Minus-Rechnung**: das Nachtgeschäft,
darunter jede Bewegung des Tageswechsels einzeln — Lokale, Löhne, Betriebskosten, was
die Läufer gebracht und was sie gekostet haben, Zinsen, die Abgabe nach oben — und
unterm Strich die Summe. Darunter der Bunkerstand und die Schulden.

Was **kein Geld bewegt**, steht getrennt als Notiz darunter: der Steuerbescheid ist
eine Forderung, keine Zahlung, und Akten sind gar kein Betrag. Vorher gab es nur eine
Liste von Zeilen ohne Summe; man sah, was passiert war, aber nicht, ob der Tag sich
gelohnt hat.

## Geld leihen

Zwei Quellen, zwei Preise. Der Zins läuft täglich auf die Restschuld und wird sofort
vom Bunker abgebucht; die Schuld selbst bleibt stehen, bis du tilgst.

### Die Bank will Zahlen sehen

Die **Bonität** ist ein Wert von 0 bis 100 und zählt nur, was angemeldet ist. Das
Nachtgeschäft taucht in keiner Buchhaltung auf und hilft hier deshalb auch nicht — das
ist der Punkt: die Bank ist der Lohn dafür, legal aufgebaut zu haben.

| zählt dazu | zählt ab |
|---|---|
| Kaufpreis deiner Lokale ÷ 1200 | offener Steuerbescheid: −18 |
| gezahlte Steuern ÷ 1500 | je Akte: −6 |
| Buchhalter: +12 | je Vorstrafe: −14, Haftbefehl: −20 |

Ab Bonität 20 leiht die Bank, der Rahmen ist `Bonität² × 9 €`, der Zins fällt von 3,0 %
auf 1,2 % am Tag. Gemessen: drei Lokale, 9000 € gezahlte Steuern und ein Buchhalter
ergeben Bonität 31, also 8600 € zu 2,4 %. Ein offener Steuerbescheid und zwei Akten
drücken dieselbe Lage auf Bonität 1 — und damit auf null Kredit.

Drei Tage die Zinsen nicht bedienen, und die Bank **verwertet die Sicherheit**: dein
billigstes Lokal ist weg, dafür sinkt die Schuld um 60 % seines Kaufpreises.

### Die Straße will Leute sehen

Ab **zwei Kontakten** in offenen Vierteln, Rahmen `Ansehen × 60 + Kontakte × 400`, und
zwar zu **12 % am Tag**. Der Geldgeber ist namentlich der Kontakt, dem du am meisten
vertraust. Zwei Tage nicht bedient, und es kommt jemand vorbei: **40 % der Ware aus dem
Lager und 8 Ansehen** sind weg. Wer voll zurückzahlt, bekommt 3 Ansehen.

Das ist kein Ersatz für die Bank, sondern der Notgroschen: die Geldstrafe bezahlen,
bevor sie in Ersatzhaft umschlägt, oder die erste Ladung Ware kaufen, wenn noch kein
Lokal steht. Deshalb ist der Rahmen klein — ein zweistelliger Tagessatz auf eine große
Summe wäre eine Falle ohne Ausweg. Aus demselben Grund liegt der Satz bei **9 % statt
12 %**.

### Wieder herauskommen

Drei Wege aus der Zinsfalle, weil ein hoher Satz allein nur frustriert:

* **Umschulden.** Die Straßenschuld mit Bankgeld ablösen: 3 % Gebühr, und der Bankrahmen
  muss reichen. Aus 4000 € zu 9 % werden 4120 € zu 2,4 % am Tag — das ist der eigentliche
  Lohn dafür, Bonität aufgebaut zu haben.
* **Pünktlich bedienen senkt den Zins.** Jeder Tag, an dem alle Zinsen aus dem Bunker
  gedeckt sind, zählt: je drei Tage 0,2 Punkte weniger bei der Bank (bis 0,8 %), je vier
  Tage ein Punkt weniger auf der Straße (bis 5 %). Ein Zahlungsausfall setzt den Zähler
  auf null. Gemessen: nach neun sauberen Tagen fiel der Bankzins von 2,4 auf 1,8 %.
* **Ware auf Kommission.** Wenn das Lager leer ist und du mindestens zwei Kontakte hast,
  streckt dir die Straße bis zu `2 + Ansehen/25 + Kontakte` Pack vor, höchstens zehn —
  zum **1,6-fachen Einkaufspreis**, abgerechnet am nächsten Tageswechsel, verkauft oder
  nicht. Reicht der Bunker dann nicht, wird daraus Straßenschuld. Das ist das Netz nach
  einem Zugriff: ohne Ware und ohne Geld gäbe es sonst keinen Weg zurück.

### Pleite

Es gibt ein Ende. Stehen **drei Tage in Folge** Schulden von mehr als dem
Anderthalbfachen deines Vermögens (Lokale + Bunker + Lagerwert) gegen einen Bunker unter
200 €, ist Schluss: eine eigene Szene mit dem Insolvenzbeschluss, der Abschlussbilanz
(überlebte Tage, Nächte, höchster Rang, beste Nacht, Schulden am Ende) und einem Knopf,
der von vorn anfängt. Ein einzelner schlechter Tag reicht ausdrücklich nicht — die drei
Tage sind da, damit man umschulden, ein Lokal verkaufen oder auf Kommission gehen kann,
bevor es vorbei ist. Die Statuszeile warnt ab dem ersten Tag mit einem Countdown.

### Wofür man sich Geld leiht

Ein Späti kostet 2500 € und bringt 240 € am Tag, nach Steuer und Betriebskosten rund
5,2 %. Bei 3 % Bankzins lohnt es sich, ihn auf Kredit zu kaufen. Der Marina Club bringt
auf seinen Kaufpreis nur 1,8 % netto — der lohnt erst, wenn die Bonität den Zins unter
2 % gedrückt hat. Genau diese Rechnung ist die Entscheidung.

## Ausrüstung

Roberto fängt mit nichts an. Vier Dinge sieht man ihm an.

| Stück | ab Rang | Preis | Wirkung | sichtbar |
|---|---|---|---|---|
| Sonnenbrille | 1 | 120 € | Fahndung kühlt 30 % schneller ab | ja |
| Laufschuhe I–III | 1 | 180 / 420 / 900 € | je +12 % Tempo | nein |
| Bauchtasche | 2 | 280 € | +2 Ware | ja |
| Kapuzenjacke | 3 | 520 € | 25 % später erkannt | ja |
| Anwalt auf Abruf | 3 | 800 € | halbe Strafe, ein Hafttag weniger; im Saal geht auch ein Wahlverteidiger | nein |
| Funkscanner | 4 | 650 € | Wache rückt später aus, Ruhezeit 3,5 s | nein |
| Zweithandy | 6 | 1 100 € | +25 % je Lieferung, ein Auftrag mehr | nein |
| Gebrauchtwagen | 9 | 3 800 € | +60 % Tempo, +3 Ware, 40 % besser sichtbar | ja |

## Aufbau

Alles steckt in `index.html`. Wichtige Stellen im Script:

| Bereich | Was da passiert |
|---|---|
| `VIERTEL` / `offen` / `qvon()` | Viertel, Freischaltung, Zugehörigkeit eines Blocks |
| `passierbar()` / `zaun()` | Sperre an der Viertelgrenze, sichtbar und wirksam |
| `kamera()` / `offenRahmen()` | Zoom auf den offenen Teil, Kamera folgt erst, wenn es nicht mehr passt |
| `neuerAnruf()` / `anrufAnnehmen()` | nächtliche Aufträge per Anruf |
| `feierabend()` | Nacht im Versteck beenden |
| `setTab()` | vier Reiter statt einer langen Seite |
| `hold` / `halt()` / `los()` | Halten statt Automatik, samt gepufferter Kurve |
| `LOKALE` / `ROLLEN` / `nextDay()` | Einnahmen, Löhne, Steuerbescheid am Tageswechsel |
| `AUSLAND` / `fliegen()` / `verhandeln()` | Flug, Gespräch, freigeschaltete Lieferanten |
| `kontakte` / `neuerKontakt()` | benannte Abnehmer, Vertrauen, neue Bekanntschaften |
| `spawnCop()` / `moveCop()` | Ausrücken aus der nächsten Wache, Verfolgung, Rückfahrt |
| `stepCrew()` / `gehZu()` / `auftragFuer()` | Läufer holen Ware und beliefern Aufträge |
| `vsDrin` / `vsAusgang()` / `vsAus` | Versteck betreten, Tür zu, wieder heraus |
| `febStart()` / `febTick()` | Schicht beenden durch Halten |
| `randzeiger()` / `randPfeil()` | Wegweiser zu Zielen außerhalb des Bildes |
| `betragZeile()` / `betragVon()` | Kredit mit eingebbarer Summe |
| `besteWare()` | Fallback, wenn das gewählte Fach leer ist |
| `bilanz` / `bilanzUI()` | Plus-Minus-Rechnung nach jeder Nacht |
| `umschulden()` / `treue` / `zinsS()` | Straßenschuld ablösen, Zins durch Pünktlichkeit |
| `kommMax()` / `kommNehmen()` | Ware auf Kommission als Netz nach dem Zugriff |
| `pleitePruefen()` / `pleiteSzene()` | Insolvenz nach drei aussichtslosen Tagen |
| `uebersicht()` | Stadtplan in der Ecke |
| `lager` / `lagerSumme()` / `packW` | ein Fach je Ware, plus die Sorte, die Roberto trägt |
| `chips()` | Statuszeile über dem Feld: Phase, Lager, Kosten, Steuer, Verfahren |
| `passtext()` | verkleinert eine Meldung, bis sie in die Breite passt |
| `GERICHTE` / `zustaendig()` | drei Instanzen, Besetzung, Verhandlungstage |
| `prozessWeiter()` | Schritt und Verhandlungstag, Übergang in den nächsten Spieltag |
| `forderung()` / `urteilSprechen()` | Antrag der Anklage und Strafzumessung |
| `berufung()` | Rechtsmittel ans Landgericht |
| `verteidigerBuchen()` / `anwDa()` | Wahlverteidiger mitten im Verfahren |
| `bewaehrung` / `bewaehrungTag()` | Aussetzung, Geldauflage, Widerruf, Straferlass |
| `antrittTag` / `inHaft()` | Ladung zum Strafantritt statt sofortiger Zelle |
| `bonitaet()` / `limitB()` / `kreditTag()` | Bank und Straße, Zins und Verwertung |
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

**Ein Zähler, der schneller fällt als er steigt, existiert nicht.** Die Fahndung stieg
nur pro Lieferung um 0,28 und fiel mit 0,5 pro Sekunde — bei einem Ereignisabstand von
10 bis 18 Sekunden ist der Zähler dauerhaft null, und alles, was daran hängt (Streifen,
Versteck, Zugriff, Gericht), ist totes Gewicht. Wer die Quelle an ein Ereignis hängt,
muss die Senke gegen den **tatsächlichen Ereignisabstand** rechnen, nicht gegen das
Gefühl. Die Lösung war eine zweite Quelle, die nicht am Ereignis hängt: Tragen kostet
pro Sekunde, und solange etwas dabei ist, läuft die Ruhezeit gar nicht erst an.

**Wer eine Senke entfernt, verschiebt die ganze Bilanz.** Die 20 % geschätzte Steuer
auf das Nachtgeschäft waren im späten Spiel rund 600 €/Tag. Sie fällt weg, weil sie
inhaltlich nicht zu tragen war — dafür ist der Zugriff jetzt eine echte Senke. Dass
das rechnerisch aufgeht, ist ausdrücklich nicht gemessen, siehe „Offen".

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
- **Kokain ist hart an der Grenze.** Im Messlauf endete die Nacht dreimal von drei
  Läufen im Zugriff, auch mit voller Ausrüstung. Der Testbot läuft allerdings in
  geraden Linien und nutzt weder Versteck noch Rückzug — ein Mensch hat Werkzeuge, die
  er nicht anfasst. Ungetestet bleibt es trotzdem.
- **Kein Zwischenspeichern innerhalb einer Nacht.** Tab zu heißt laufende Schicht weg.
- **Die Pleitegrenze ist gesetzt, nicht gemessen.** Anderthalbfaches Vermögen, drei Tage,
  200 € im Bunker: plausibel, aber nicht an echten Verläufen geprüft. Ob man in der Praxis
  je hineinrutscht, ohne es kommen zu sehen, weiß ich nicht.
- **Läufer nehmen keine eigenen Kontakte auf.** Sie bedienen nur, was Roberto zugesagt
  hat, plus verfallene Anrufe. Ein eigener Kundenstamm je Mitarbeiter wäre der nächste
  Schritt.
- **Die Fahndung ist nur gegen einen dummen Testbot gemessen.** Er läuft geradeaus,
  nutzt weder Versteck noch Rückzug und kommt deshalb auf drei Zugriffe je Nacht. Wie
  sich die langsamere Abkühlung für einen Menschen anfühlt, der die Werkzeuge benutzt,
  ist ungetestet.
- **Die Ökonomie bleibt inflationär**, siehe den eigenen Abschnitt. Von 5–9 auf 2,0
  gesenkt, gesund wären 1,0. Seit es Zinsen, Läuferstrafen, Schwund und die Kommission
  gibt, ist die Senkenseite deutlich größer geworden — nachgerechnet ist das Verhältnis
  aber immer noch nicht. Der Wegfall der Nachtsteuer nimmt im späten Spiel rund
  600 €/Tag Senke heraus; dagegen stehen die Zugriffe, die es vorher praktisch nicht
  gab, und die 20 % Gebühr im Versteck. Gemessen ist das noch nicht — eine
  Mittelspiel-Nacht (Rang 6, ein Lokal, ein Läufer, 14 Pack Einkauf) endete mit
  +688 € über Nacht und Tagesabrechnung, bei zwei Zugriffen.
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
