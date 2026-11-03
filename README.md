# Signale und Systeme Lerntool

Lernapp zur Vorlesung Signale und Systeme (DHBW Stuttgart), als Webseite und als iOS-App.

## Aufbau

- `web/src`: Oberfläche, Plotter (`plot.js`), Labore (`labs.js`), Aufgabengeneratoren (`engine.js`)
- `web/content`: Lerninhalte nach Kapiteln, Übungsblatt-Aufgaben und Probeklausuren
- `web/vendor/katex`: Formelsatz (KaTeX 0.16.11, MIT-Lizenz), in die Seite eingebettet
- `SignaleLernApp`: iOS-Hülle (WKWebView), speichert den Lernstand zusätzlich in einer Datei
- `tools`: Build und Tests

Die Skripte und Übungsblätter liegen nicht im Repository, nur daraus abgeleitete Aufgaben und Erklärungen.

## Befehle

```bash
node tools/test.js
```

Prüft alle Formeln und Aufgaben, lässt jeden Generator 300-mal laufen und rechnet die Lösungen der Übungsblätter numerisch nach.

```bash
node tools/build.js --test
```

Baut `SignaleLernApp/Resources/index.html` und im Studienordner `../Signale_Lerntool.html`.

```bash
node tools/test-ui.js
```

Klickt in Chrome alle Seiten, Aufgaben, Labore und Probeklausuren bei Handy- und Desktopbreite durch.

## iPhone

Jeder Push nach `main` baut per GitHub Actions eine unsignierte IPA (Artefakt `SignaleLernApp-ipa`), die mit xtool signiert und installiert wird.
