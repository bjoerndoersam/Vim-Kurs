# Vimsical · Quellcode

Diesen Ordner brauchst du nur, wenn du den Kurs verändern willst. Zum Lernen reicht `Vimsical.app` eine Ebene höher.

| Datei | Inhalt |
| --- | --- |
| `page.html` | Seitengerüst und alle Stile |
| `js/engine.js` | Der Vim-Emulator |
| `js/lessons.js` | Kapitel 1 bis 5, Challenges und die Prüflogik der Übungen (Deutsch und Englisch) |
| `js/lessons-plus.js` | Kapitel 6 bis 10 (Deutsch und Englisch) |
| `js/app.js` | Oberfläche, Einstellungen, Fortschritt, Erfolge |
| `build/build.sh` | Baut App, Windows-Starter und Einzeldatei |
| `build/fonts.sh` | Lädt die Schriften einmalig herunter und bettet sie ein |

Nach einer Änderung neu bauen:

```sh
./build/build.sh
```

Das erzeugt eine Ebene höher `Vimsical.app`, `Vimsical (Windows).cmd` und `Vimsical (Browser).html`.

Der Fortschritt der App liegt im eigenen Browserprofil unter `~/Library/Application Support/Vimsical` (bzw. im alten Ordner `VimKurs`, falls es ihn schon gibt). Ein neuer Build überschreibt ihn nicht.
