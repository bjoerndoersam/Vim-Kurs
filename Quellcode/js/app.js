/* Vimsical · Oberfläche */
(function () {
  'use strict';
  const VKd = window.VK;
  const { COURSE, CHALLENGES, WELCOME, DRILL_TEXT } = VKd;
  const K = Vim.keys;

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = html => { const tpl = document.createElement('template'); tpl.innerHTML = html.trim(); return tpl.content.firstElementChild; };
  const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Einstellungen ---------- */
  const SET_KEY = 'normalmodus.einstellungen.v1';
  const DEFAULTS = (() => {
    const nav = navigator.language || 'de';
    const plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    return {
      lang: /^de/i.test(nav) ? 'de' : 'en',
      os: /mac/i.test(plat) ? 'mac' : /win/i.test(plat) ? 'win' : 'linux',
      layout: /^de/i.test(nav) ? 'de' : /^en-GB/i.test(nav) ? 'uk' : 'us',
      theme: 'system', accent: 'green', fontUi: 'plex', fontHead: 'bricolage', fontMono: 'jetbrains', edSize: 15,
      sound: false, effects: true, hintsOpen: false, blink: true, rnu: false, onboarded: false
    };
  })();
  const Settings = {
    data: Object.assign({}, DEFAULTS),
    load() { try { const s = localStorage.getItem(SET_KEY); if (s) Object.assign(this.data, JSON.parse(s)); } catch (e) { /* ohne Speicher weiter */ } },
    save() { try { localStorage.setItem(SET_KEY, JSON.stringify(this.data)); } catch (e) { /* ohne Speicher weiter */ } }
  };
  Settings.load();
  const S = Settings.data;

  /* ---------- Texte ---------- */
  const STR = {
    de: {
      'nav.start': 'Start', 'nav.lessons': 'Lektionen', 'nav.challenges': 'Challenges', 'nav.drill': 'Zielscheibe', 'nav.play': 'Spielwiese', 'nav.sheet': 'Spickzettel', 'nav.ach': 'Erfolge',
      'nav.settings': 'Einstellungen', 'nav.menu': 'Kursinhalt anzeigen',
      'sb.ex': (a, b) => `<b>${a} von ${b}</b> Übungen`, 'sb.stars': (a, b) => `${a} von ${b} Sternen`, 'sb.reset': 'Fortschritt zurücksetzen',
      'reset.q': 'Alle Sterne, Bestwerte und Erfolge löschen?', 'reset.yes': 'Löschen', 'reset.no': 'Abbrechen', 'reset.done': 'Fortschritt gelöscht.',
      'mode.normal': 'NORMAL', 'mode.insert': 'EINFÜGEN', 'mode.replace': 'ERSETZEN', 'mode.visual': 'VISUELL', 'mode.vline': 'V-ZEILE', 'mode.vblock': 'V-BLOCK', 'mode.cmdline': 'BEFEHL', 'mode.confirm': 'BESTÄTIGEN',
      'line.insert': '-- EINFÜGEN --', 'line.replace': '-- ERSETZEN --', 'line.visual': '-- VISUELL --', 'line.vline': '-- VISUELL ZEILE --', 'line.vblock': '-- VISUELL BLOCK --',
      'ed.click': 'Klicke hier und tippe los', 'ed.rec': r => 'Aufnahme @' + r, 'ed.more': 'Weiter mit einer beliebigen Taste', 'ed.blocked': k => k + ' ist in dieser Übung gesperrt',
      'ed.label': 'Vim-Editor', 'ed.practice': 'Übungseditor',
      'pr.ex': (i, n) => `Übung ${i} von ${n}`, 'pr.keys': 'Tasten', 'pr.par': 'Ziel', 'pr.best': 'Bestwert', 'pr.goal': 'Ziel', 'pr.reached': 'erreicht', 'pr.pressEsc': 'Esc drücken',
      'pr.lines': (a, b) => `${a} von ${b} Zeilen`, 'pr.missing': 'fehlt noch oder ist anders', 'pr.remove': 'muss noch weg', 'pr.extra': n => `${n} Zeile${n > 1 ? 'n' : ''} zu viel`, 'pr.log': 'Deine Tastendrücke erscheinen hier.',
      'pr.reset': 'Neu starten', 'pr.hints': 'Hinweise', 'pr.hide': 'Hinweise ausblenden', 'pr.skip': 'Überspringen', 'pr.next': 'Weiter', 'pr.finish': 'Abschließen',
      'pr.perfect': 'Perfekt gelöst', 'pr.solved': 'Gelöst', 'pr.done': 'Geschafft', 'pr.with': (k) => `mit ${k} ${k === 1 ? 'Taste' : 'Tasten'}`, 'pr.goalN': p => `(Ziel: ${p})`,
      'pr.bestWas': b => `Bestwert ${b}`, 'pr.newBest': 'Neuer Bestwert', 'pr.enterNext': 'nächste Übung', 'pr.enterFinish': 'abschließen', 'pr.again': 'nochmal',
      'tier.basic': 'Einstieg', 'tier.combo': 'Kombination', 'tier.final': 'Abschlussübung',
      'h.title': 'Hinweise', 'h.lesson': 'Lektion', 'h.helpFor': s => 'Hilfe zu ' + s + ' im Kurs:', 'pr.saved': 'gespeichert', 'kb.altNote': 'Unter Windows und Linux belegt der Browser Ctrl-w, Ctrl-t und Ctrl-n selbst. Nutze stattdessen Alt-w, Alt-t und Alt-n.', 'set.blink': 'Cursor blinkt', 'pg.bufs': 'Puffer', 'pg.vimrcDefault': '" Deine vimrc für die Spielwiese. Jede Zeile ist ein Ex-Befehl ohne Doppelpunkt.\nset incsearch\n" set relativenumber\n" nnoremap Q gUU', 'pg.vimrcNote': 'Die Datei .vimrc wird beim Öffnen der Spielwiese geladen. Öffne sie mit :e .vimrc und speichere mit :w.', 'h.concept': 'Worauf es ankommt', 'h.cmds': 'Nützliche Befehle', 'h.showCmds': 'Befehle zeigen', 'h.showSol': 'Lösung zeigen', 'h.sol': 'Eine mögliche Lösung',
      'h.generic': 'Schau dir die Befehlskarten dieser Lektion an. Lies die Aufgabe als Satz: Was soll passieren, und wie weit?', 'h.cmdsNote': 'Reihenfolge nach erstem Auftreten in einer möglichen Lösung, ohne Zahlen und getippten Text.',
      'demo.title': 'Vorführung', 'demo.play': 'Abspielen', 'demo.pause': 'Pause', 'demo.step': 'Schritt', 'demo.restart': 'Von vorn', 'demo.ready': 'Drücke „Abspielen“ und schau zu, was jede Taste bewirkt.',
      'demo.done': 'Fertig. Jetzt bist du dran.',
      'l.eyebrow': (c, title, n, total) => `Kapitel ${c} · ${title} <span class="sep">/</span> Lektion ${n} von ${total}`, 'l.cmds': 'Befehle dieser Lektion', 'l.tip': 'Tipp',
      'l.prev': 'Vorherige Lektion', 'l.next': 'Nächste Lektion', 'l.courseDone': 'Kurs geschafft', 'l.toCh': 'Zu den Challenges', 'l.nextLesson': 'Nächste Lektion',
      'l.doneTitle': 'Lektion abgeschlossen', 'l.done3': 'Jede Übung im Zielwert gelöst.', 'l.doneMore': 'Für drei Sterne: Löse jede Übung mit höchstens so vielen Tasten wie das Ziel vorgibt.',
      'l.continue': t => 'Weiter: ' + t, 'kb.title': (lay, os) => `Sonderzeichen auf deiner Tastatur (${lay}, ${os})`, 'kb.dead': 'Tottasten zeigen erst etwas an, wenn du danach die Leertaste drückst.', 'kb.then': 'dann Leertaste',
      'kb.settings': 'Tastatur ändern',
      'st.eyebrow': (n, c) => `Interaktiver Vim-Kurs · ${n} Lektionen · ${c} Challenges`, 'st.h1': 'Lerne Vim, indem du Vim benutzt.',
      'st.lede': 'Jede Lektion zeigt dir in einer Vorführung, was die Befehle tun, und lässt dich sie danach in einem echten Vim-Editor üben: erst einzeln, dann kombiniert, zum Schluss in einer Abschlussübung mit mehr Text. Dein Fortschritt bleibt gespeichert.',
      'st.continue': n => 'Weiter mit Lektion ' + n, 'st.begin': 'Mit Lektion 1 beginnen', 'st.sheet': 'Spickzettel öffnen', 'st.try': 'Probier es direkt aus', 'st.first': 'Erste Bewegung', 'st.toL1': 'Zu Lektion 1',
      'st.lessons': 'Lektionen', 'st.stars': 'Sterne', 'st.ch': 'Challenges', 'st.xp': 'Erfahrung', 'st.course': 'Der Kurs', 'st.chapter': n => 'Kapitel ' + n,
      'st.training': 'Training', 'st.trainH': 'Üben ohne Anleitung', 'st.chDesc': n => `${n} Aufgaben im Vim-Golf-Stil: so wenige Tasten wie möglich.`,
      'st.drillDesc': '60 Sekunden Bewegungstraining gegen die Uhr.', 'st.playDesc': 'Freier Editor mit Registern, Marken und eigenem Text.',
      'ch.lede': 'Kleine Bearbeitungsaufgaben im Stil von Vim-Golf. Es gibt keinen vorgegebenen Weg. Jede Aufgabe hat einen Zielwert an Tasten, und wer darunter bleibt, bekommt drei Sterne.',
      'ch.open': 'offen', 'ch.close': 'Schließen', 'ch.of': (i, n) => `Challenge ${i} von ${n}`, 'ch.next': 'Nächste Challenge', 'ch.overview': 'Zur Übersicht', 'ch.level': n => `Schwierigkeit ${n} von 3`,
      'dr.lede': 'Ein Ziel nach dem anderen leuchtet im Code auf. Triff in 60 Sekunden so viele wie möglich. Die Uhr startet mit deinem ersten Tastendruck. Nutze alles, was du kennst: w, f, /, Zahlen und Zeilensprünge.',
      'dr.time': 'Zeit', 'dr.hits': 'Treffer', 'dr.eff': 'Tasten pro Treffer', 'dr.best': 'Rekord', 'dr.new': 'Neue Runde', 'dr.start': 'Die Uhr startet mit deinem ersten Tastendruck.',
      'dr.over': (h, rec, best) => `<b>Zeit ist um: ${h} Treffer.</b> ${rec ? 'Neuer Rekord!' : 'Rekord: ' + best + '.'} <kbd>Enter</kbd> startet eine neue Runde.`,
      'pg.lede': 'Ein freier Vim-Editor ohne Aufgaben. Rechts siehst du live, was in den Registern und Marken steckt.', 'pg.opts': 'Optionen', 'pg.rnu': 'Relative Zeilennummern', 'pg.hls': 'Suchtreffer hervorheben',
      'pg.ic': 'Groß/klein bei Suche ignorieren', 'pg.regs': 'Register', 'pg.marks': 'Marken', 'pg.last': 'Zuletzt', 'pg.regsEmpty': 'Noch leer. Kopiere etwas mit <kbd>y</kbd>.',
      'pg.marksEmpty': 'Setze eine mit <kbd>ma</kbd>.', 'pg.lastEmpty': 'Letzte Änderung, Suche und Befehl erscheinen hier.', 'pg.mark': (r, c) => `Zeile ${r}, Spalte ${c}`,
      'pg.sample': 'Beispieltext laden', 'pg.clear': 'Leeren', 'pg.own': 'Eigenen Text einfügen', 'pg.ownHint': 'Füge Text ein, zum Beispiel Code aus deinem Projekt.', 'pg.load': 'In den Editor laden',
      'cs.eyebrow': 'Nachschlagen', 'cs.lede': 'Alle Befehle aus dem Kurs, sortiert nach Lektion. Ein Klick auf die Lektion bringt dich zur passenden Übung.', 'cs.search': 'Suchen, zum Beispiel „löschen“, „ci“ oder „Register“',
      'cs.searchLabel': 'Befehle durchsuchen', 'cs.empty': 'Kein Befehl passt zu dieser Suche.',
      'ach.eyebrow': 'Dein Weg', 'ach.lede': 'Erfahrungspunkte gibt es für jeden Stern, jede Abschlussübung, jede Challenge und jeden Erfolg. Je mehr du übst, desto höher steigt dein Rang.',
      'ach.rank': 'Rang', 'ach.next': (n, r) => `Noch ${n} XP bis „${r}“`, 'ach.max': 'Höchster Rang erreicht', 'ach.streak': 'Tage in Folge', 'ach.list': 'Erfolge', 'ach.unlocked': 'Erfolg freigeschaltet',
      'ach.days': n => `${n} ${n === 1 ? 'Tag' : 'Tage'} in Folge`, 'ach.levelUp': r => 'Neuer Rang: ' + r,
      'set.title': 'Einstellungen', 'set.close': 'Schließen', 'set.lang': 'Sprache', 'set.look': 'Darstellung', 'set.theme': 'Farbmodus', 'set.system': 'System', 'set.light': 'Hell', 'set.dark': 'Dunkel',
      'set.accent': 'Akzentfarbe', 'set.fontUi': 'Schrift für Text', 'set.fontHead': 'Schrift für Überschriften', 'set.fontMono': 'Schrift für Code und Editor', 'set.edSize': 'Schriftgröße im Editor',
      'set.kb': 'Tastatur', 'set.os': 'Betriebssystem', 'set.layout': 'Tastaturbelegung', 'set.kbPreview': 'So tippst du die wichtigsten Sonderzeichen:', 'set.kbNone': 'Alle Vim-Zeichen liegen auf dieser Belegung direkt erreichbar, höchstens mit Shift.',
      'set.learn': 'Lernen', 'set.hintsOpen': 'Hinweis-Feld standardmäßig öffnen', 'set.sound': 'Töne bei Erfolgen', 'set.effects': 'Feuerwerk und Animationen',
      'set.progress': 'Fortschritt', 'set.progressNote': 'Dein Fortschritt wird automatisch gespeichert und bleibt erhalten, wenn du die App schließt.',
      'set.export': 'Fortschritt sichern', 'set.import': 'Sicherung laden', 'set.reset': 'Fortschritt zurücksetzen', 'set.exported': 'Sicherung erstellt. Falls kein Download startet, kopiere den Text unten.',
      'set.copy': 'Kopieren', 'set.copied': 'Kopiert.', 'set.importPaste': 'Oder füge den Inhalt einer Sicherung hier ein:', 'set.importDo': 'Einfügen und laden', 'set.imported': 'Sicherung geladen.', 'set.importBad': 'Diese Datei ist keine gültige Sicherung.',
      'ob.title': 'Willkommen bei Vimsical', 'ob.lede': 'Zwei kurze Fragen, damit Tastenhinweise und Sprache passen. Du kannst alles später in den Einstellungen ändern.', 'ob.go': 'Los geht’s',
      'os.mac': 'macOS', 'os.win': 'Windows', 'os.linux': 'Linux', 'lay.de': 'Deutsch (QWERTZ)', 'lay.us': 'Englisch US (QWERTY)', 'lay.uk': 'Englisch UK (QWERTY)',
      'acc.green': 'Vim-Grün', 'acc.blue': 'Blau', 'acc.violet': 'Violett', 'acc.orange': 'Orange', 'acc.pink': 'Pink', 'acc.teal': 'Petrol',
      'fireworks': 'Feuerwerk', 'toast.close': 'Schließen'
    },
    en: {
      'nav.start': 'Home', 'nav.lessons': 'Lessons', 'nav.challenges': 'Challenges', 'nav.drill': 'Target practice', 'nav.play': 'Playground', 'nav.sheet': 'Cheat sheet', 'nav.ach': 'Achievements',
      'nav.settings': 'Settings', 'nav.menu': 'Show course contents',
      'sb.ex': (a, b) => `<b>${a} of ${b}</b> exercises`, 'sb.stars': (a, b) => `${a} of ${b} stars`, 'sb.reset': 'Reset progress',
      'reset.q': 'Delete all stars, best scores and achievements?', 'reset.yes': 'Delete', 'reset.no': 'Cancel', 'reset.done': 'Progress deleted.',
      'mode.normal': 'NORMAL', 'mode.insert': 'INSERT', 'mode.replace': 'REPLACE', 'mode.visual': 'VISUAL', 'mode.vline': 'V-LINE', 'mode.vblock': 'V-BLOCK', 'mode.cmdline': 'COMMAND', 'mode.confirm': 'CONFIRM',
      'line.insert': '-- INSERT --', 'line.replace': '-- REPLACE --', 'line.visual': '-- VISUAL --', 'line.vline': '-- VISUAL LINE --', 'line.vblock': '-- VISUAL BLOCK --',
      'ed.click': 'Click here and start typing', 'ed.rec': r => 'recording @' + r, 'ed.more': 'Press any key to continue', 'ed.blocked': k => k + ' is blocked in this exercise',
      'ed.label': 'Vim editor', 'ed.practice': 'Practice editor',
      'pr.ex': (i, n) => `Exercise ${i} of ${n}`, 'pr.keys': 'keys', 'pr.par': 'Par', 'pr.best': 'Best', 'pr.goal': 'Goal', 'pr.reached': 'reached', 'pr.pressEsc': 'press Esc',
      'pr.lines': (a, b) => `${a} of ${b} lines`, 'pr.missing': 'still missing or different', 'pr.remove': 'still has to go', 'pr.extra': n => `${n} line${n > 1 ? 's' : ''} too many`, 'pr.log': 'Your keystrokes appear here.',
      'pr.reset': 'Restart', 'pr.hints': 'Hints', 'pr.hide': 'Hide hints', 'pr.skip': 'Skip', 'pr.next': 'Next', 'pr.finish': 'Finish',
      'pr.perfect': 'Perfect', 'pr.solved': 'Solved', 'pr.done': 'Done', 'pr.with': k => `in ${k} ${k === 1 ? 'key' : 'keys'}`, 'pr.goalN': p => `(par: ${p})`,
      'pr.bestWas': b => `best ${b}`, 'pr.newBest': 'new best', 'pr.enterNext': 'next exercise', 'pr.enterFinish': 'finish', 'pr.again': 'again',
      'tier.basic': 'Warm-up', 'tier.combo': 'Combination', 'tier.final': 'Final exercise',
      'h.title': 'Hints', 'h.lesson': 'lesson', 'h.helpFor': s => 'Help for ' + s + ' in the course:', 'pr.saved': 'saved', 'kb.altNote': 'On Windows and Linux the browser claims Ctrl-w, Ctrl-t and Ctrl-n. Use Alt-w, Alt-t and Alt-n instead.', 'set.blink': 'Blinking cursor', 'pg.bufs': 'Buffers', 'pg.vimrcDefault': '" Your vimrc for the playground. Every line is an Ex command without the colon.\nset incsearch\n" set relativenumber\n" nnoremap Q gUU', 'pg.vimrcNote': 'The file .vimrc is loaded when the playground opens. Open it with :e .vimrc and save with :w.', 'h.concept': 'What matters', 'h.cmds': 'Useful commands', 'h.showCmds': 'Show commands', 'h.showSol': 'Show solution', 'h.sol': 'One possible solution',
      'h.generic': 'Look at this lesson\'s command cards. Read the task as a sentence: what should happen, and how far?', 'h.cmdsNote': 'In order of first use in one possible solution, without counts or typed text.',
      'demo.title': 'Demo', 'demo.play': 'Play', 'demo.pause': 'Pause', 'demo.step': 'Step', 'demo.restart': 'Restart', 'demo.ready': 'Press “Play” and watch what each key does.',
      'demo.done': 'Done. Now it\'s your turn.',
      'l.eyebrow': (c, title, n, total) => `Chapter ${c} · ${title} <span class="sep">/</span> Lesson ${n} of ${total}`, 'l.cmds': 'Commands in this lesson', 'l.tip': 'Tip',
      'l.prev': 'Previous lesson', 'l.next': 'Next lesson', 'l.courseDone': 'Course complete', 'l.toCh': 'Go to challenges', 'l.nextLesson': 'Next lesson',
      'l.doneTitle': 'Lesson complete', 'l.done3': 'Every exercise solved within par.', 'l.doneMore': 'For three stars, solve every exercise in at most as many keys as the par.',
      'l.continue': t => 'Next: ' + t, 'kb.title': (lay, os) => `Special characters on your keyboard (${lay}, ${os})`, 'kb.dead': 'Dead keys only show a character after you press the space bar.', 'kb.then': 'then Space',
      'kb.settings': 'Change keyboard',
      'st.eyebrow': (n, c) => `Interactive Vim course · ${n} lessons · ${c} challenges`, 'st.h1': 'Learn Vim by using Vim.',
      'st.lede': 'Every lesson shows you in a demo what the commands do, then lets you practise them in a real Vim editor: first on their own, then combined, and finally in a wrap-up exercise with more text. Your progress is saved.',
      'st.continue': n => 'Continue with lesson ' + n, 'st.begin': 'Start with lesson 1', 'st.sheet': 'Open cheat sheet', 'st.try': 'Try it right here', 'st.first': 'First move', 'st.toL1': 'Go to lesson 1',
      'st.lessons': 'Lessons', 'st.stars': 'Stars', 'st.ch': 'Challenges', 'st.xp': 'Experience', 'st.course': 'The course', 'st.chapter': n => 'Chapter ' + n,
      'st.training': 'Training', 'st.trainH': 'Practice without guidance', 'st.chDesc': n => `${n} Vim golf tasks: as few keys as possible.`,
      'st.drillDesc': '60 seconds of movement training against the clock.', 'st.playDesc': 'A free editor with registers, marks and your own text.',
      'ch.lede': 'Small editing tasks in the style of Vim golf. There is no prescribed path. Every task has a par, and staying within it earns three stars.',
      'ch.open': 'open', 'ch.close': 'Close', 'ch.of': (i, n) => `Challenge ${i} of ${n}`, 'ch.next': 'Next challenge', 'ch.overview': 'Back to overview', 'ch.level': n => `Difficulty ${n} of 3`,
      'dr.lede': 'One target after another lights up in the code. Hit as many as you can in 60 seconds. The clock starts with your first key. Use everything you know: w, f, /, counts and line jumps.',
      'dr.time': 'Time', 'dr.hits': 'Hits', 'dr.eff': 'Keys per hit', 'dr.best': 'Record', 'dr.new': 'New round', 'dr.start': 'The clock starts with your first key.',
      'dr.over': (h, rec, best) => `<b>Time's up: ${h} hits.</b> ${rec ? 'New record!' : 'Record: ' + best + '.'} <kbd>Enter</kbd> starts a new round.`,
      'pg.lede': 'A free Vim editor without tasks. On the right you see live what is stored in registers and marks.', 'pg.opts': 'Options', 'pg.rnu': 'Relative line numbers', 'pg.hls': 'Highlight search matches',
      'pg.ic': 'Ignore case when searching', 'pg.regs': 'Registers', 'pg.marks': 'Marks', 'pg.last': 'Recent', 'pg.regsEmpty': 'Empty so far. Yank something with <kbd>y</kbd>.',
      'pg.marksEmpty': 'Set one with <kbd>ma</kbd>.', 'pg.lastEmpty': 'Last change, search and command appear here.', 'pg.mark': (r, c) => `line ${r}, column ${c}`,
      'pg.sample': 'Load sample text', 'pg.clear': 'Clear', 'pg.own': 'Paste your own text', 'pg.ownHint': 'Paste some text, for example code from your project.', 'pg.load': 'Load into editor',
      'cs.eyebrow': 'Reference', 'cs.lede': 'Every command in the course, sorted by lesson. Click a lesson to jump to its exercises.', 'cs.search': 'Search, for example “delete”, “ci” or “register”',
      'cs.searchLabel': 'Search commands', 'cs.empty': 'No command matches this search.',
      'ach.eyebrow': 'Your journey', 'ach.lede': 'You earn experience for every star, every final exercise, every challenge and every achievement. The more you practise, the higher your rank.',
      'ach.rank': 'Rank', 'ach.next': (n, r) => `${n} XP to “${r}”`, 'ach.max': 'Highest rank reached', 'ach.streak': 'Day streak', 'ach.list': 'Achievements', 'ach.unlocked': 'Achievement unlocked',
      'ach.days': n => `${n}-day streak`, 'ach.levelUp': r => 'New rank: ' + r,
      'set.title': 'Settings', 'set.close': 'Close', 'set.lang': 'Language', 'set.look': 'Appearance', 'set.theme': 'Colour mode', 'set.system': 'System', 'set.light': 'Light', 'set.dark': 'Dark',
      'set.accent': 'Accent colour', 'set.fontUi': 'Text font', 'set.fontHead': 'Heading font', 'set.fontMono': 'Code and editor font', 'set.edSize': 'Editor font size',
      'set.kb': 'Keyboard', 'set.os': 'Operating system', 'set.layout': 'Keyboard layout', 'set.kbPreview': 'How to type the most important special characters:', 'set.kbNone': 'Every Vim character is directly reachable on this layout, at most with Shift.',
      'set.learn': 'Learning', 'set.hintsOpen': 'Open the hint panel by default', 'set.sound': 'Sounds on success', 'set.effects': 'Fireworks and animations',
      'set.progress': 'Progress', 'set.progressNote': 'Your progress is saved automatically and kept when you close the app.',
      'set.export': 'Back up progress', 'set.import': 'Load backup', 'set.reset': 'Reset progress', 'set.exported': 'Backup created. If no download starts, copy the text below.',
      'set.copy': 'Copy', 'set.copied': 'Copied.', 'set.importPaste': 'Or paste the contents of a backup here:', 'set.importDo': 'Paste and load', 'set.imported': 'Backup loaded.', 'set.importBad': 'This is not a valid backup.',
      'ob.title': 'Welcome to Vimsical', 'ob.lede': 'Two quick questions so key hints and language fit. You can change everything later in the settings.', 'ob.go': 'Let\'s go',
      'os.mac': 'macOS', 'os.win': 'Windows', 'os.linux': 'Linux', 'lay.de': 'German (QWERTZ)', 'lay.us': 'English US (QWERTY)', 'lay.uk': 'English UK (QWERTY)',
      'acc.green': 'Vim green', 'acc.blue': 'Blue', 'acc.violet': 'Violet', 'acc.orange': 'Orange', 'acc.pink': 'Pink', 'acc.teal': 'Teal',
      'fireworks': 'Fireworks', 'toast.close': 'Close'
    }
  };
  const t = (k, ...a) => {
    const d = STR[S.lang] || STR.de;
    const v = d[k] !== undefined ? d[k] : STR.de[k] !== undefined ? STR.de[k] : k;
    return typeof v === 'function' ? v(...a) : v;
  };
  const L = x => VKd.L(x, S.lang);

  /* ---------- Tastatur ---------- */
  const KB_DE = { '!': 'S+1', '"': 'S+2', '$': 'S+4', '%': 'S+5', '&': 'S+6', '/': 'S+7', '(': 'S+8', ')': 'S+9', '=': 'S+0', '?': 'S+ß', '*': 'S++', "'": 'S+#', ':': 'S+.', ';': 'S+,', '_': 'S+-', '>': 'S+<' };
  const KB = {
    'de-mac': Object.assign({}, KB_DE, { '{': 'A+8', '}': 'A+9', '[': 'A+5', ']': 'A+6', '|': 'A+7', '\\': 'SA+7', '@': 'A+L', '~': 'DA+N', '^': 'D^', '`': 'DS+´' }),
    'de-pc': Object.assign({}, KB_DE, { '{': 'R+7', '[': 'R+8', ']': 'R+9', '}': 'R+0', '\\': 'R+ß', '|': 'R+<', '@': 'R+Q', '~': 'R++', '^': 'D^', '`': 'DS+´' }),
    'uk-pc': { '"': 'S+2', '@': "S+'", '~': 'S+#', '|': 'S+\\' },
    'uk-mac': { '#': 'A+3', '@': 'S+2', '"': "S+'", '~': 'S+`', '|': 'S+\\' },
    'us-mac': {}, 'us-pc': {}
  };
  const kbMap = () => KB[S.layout + '-' + (S.os === 'mac' ? 'mac' : 'pc')] || {};
  function kbHow(ch) {
    const spec = kbMap()[ch];
    if (!spec) return null;
    let s = spec, dead = false;
    if (s[0] === 'D') { dead = true; s = s.slice(1); }
    let out;
    const plus = s.indexOf('+');
    if (plus <= 0) out = s;
    else {
      const mods = s.slice(0, plus), key = s.slice(plus + 1);
      const names = S.os === 'mac' ? { S: '⇧', A: '⌥', R: '⌥' } : { S: 'Shift+', A: 'Alt+', R: 'AltGr+' };
      out = Array.from(mods).map(m => names[m]).join('') + key;
    }
    return { text: out, dead };
  }
  function kbHowText(ch) { const h = kbHow(ch); if (!h) return null; return h.text + (h.dead ? ' (' + t('kb.then') + ')' : ''); }
  function ctrlLabel(letter) { return S.os === 'mac' ? '⌃' + letter.toUpperCase() : 'Ctrl-' + letter; }
  function keyLabel(k) {
    const code = k.charCodeAt(0);
    if (code < 32 && ![8, 9, 13, 27].includes(code)) return ctrlLabel(String.fromCharCode(code + 96));
    return Vim.keyLabel(k);
  }
  const fmtKey = s => esc(s.replace(/<C-(.)>/g, (m, c) => '\u0001' + c + '\u0002').replace(/<Esc>/g, 'Esc').replace(/<CR>/g, 'Enter'))
    .replace(/\u0001(.)\u0002/g, (m, c) => esc(ctrlLabel(c)));
  function charsOf(spec) { return Array.from(new Set(Array.from(spec.replace(/<[^>]+>/g, '').replace(/\{[A-Za-zÄÖÜäöüß\- ]+\}/g, '')))); }
  function annotateKbd(root, visible) {
    if (!Object.keys(kbMap()).length) return;
    $$('kbd:not([data-kb])', root).forEach(k => {
      k.dataset.kb = '1';
      const parts = charsOf(k.textContent).map(ch => { const h = kbHowText(ch); return h ? ch + ' ' + h : null; }).filter(Boolean);
      if (!parts.length) return;
      k.title = parts.join(' · ');
      if (visible) k.insertAdjacentHTML('afterend', `<span class="kb-how">${esc(parts.join(' · '))}</span>`);
    });
  }

  /* ---------- Fortschritt ---------- */
  const LESSONS = [];
  COURSE.forEach((ch, ci) => ch.lessons.forEach(l => { l.chapter = ch; l.ci = ci; l.num = LESSONS.length + 1; LESSONS.push(l); }));
  const TOTAL_EX = LESSONS.reduce((n, l) => n + l.ex.length, 0);

  const STORE_KEY = 'normalmodus.fortschritt.v1';
  const emptyProgress = () => ({ ex: {}, ch: {}, drill: 0, days: [], ach: {} });
  const Store = {
    data: emptyProgress(),
    load() { try { const s = localStorage.getItem(STORE_KEY); if (s) this.data = Object.assign(emptyProgress(), JSON.parse(s)); } catch (e) { /* ohne Speicher weiter */ } },
    save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch (e) { /* ohne Speicher weiter */ } },
    record(key, keys, stars) {
      const isCh = key.startsWith('ch:');
      const bucket = isCh ? this.data.ch : this.data.ex;
      const id = isCh ? key.slice(3) : key;
      const prev = bucket[id];
      const better = !prev || keys < prev.best;
      bucket[id] = { best: better ? keys : prev.best, stars: Math.max(stars, prev ? prev.stars : 0) };
      this.touchDay();
      this.save();
      return { prev, better };
    },
    touchDay() { const d = today(); if (!this.data.days.includes(d)) { this.data.days.push(d); this.data.days = this.data.days.slice(-400); } },
    get(key) { return key.startsWith('ch:') ? this.data.ch[key.slice(3)] : this.data.ex[key]; },
    reset() { this.data = emptyProgress(); this.save(); }
  };
  Store.load();

  function lessonStatus(l) {
    let done = 0, min = 3;
    l.ex.forEach((e, i) => { const r = Store.data.ex[l.id + ':' + i]; if (r) { done++; min = Math.min(min, r.stars); } });
    return { done, total: l.ex.length, complete: done === l.ex.length, stars: done === l.ex.length ? min : 0 };
  }
  function nextLesson() { return LESSONS.find(l => !lessonStatus(l).complete) || LESSONS[LESSONS.length - 1]; }

  function streak() {
    const set = new Set(Store.data.days);
    let n = 0;
    const d = new Date();
    if (!set.has(today())) d.setDate(d.getDate() - 1);
    for (;;) {
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (!set.has(k)) break;
      n++; d.setDate(d.getDate() - 1);
    }
    return n;
  }

  const ACH = [
    { id: 'first', icon: '1', name: ['Erster Schritt', 'First step'], desc: ['Löse deine erste Übung.', 'Solve your first exercise.'], test: s => s.ex >= 1 },
    { id: 'lesson', icon: 'L', name: ['Lektion gemeistert', 'Lesson mastered'], desc: ['Schließe eine ganze Lektion ab.', 'Complete a whole lesson.'], test: s => s.lessons >= 1 },
    { id: 'perfect', icon: '★', name: ['Perfektionist', 'Perfectionist'], desc: ['Schließe eine Lektion mit drei Sternen ab.', 'Complete a lesson with three stars.'], test: s => s.perfectLessons >= 1 },
    { id: 'final5', icon: 'F', name: ['Abschlussprofi', 'Wrap-up pro'], desc: ['Löse fünf Abschlussübungen.', 'Solve five final exercises.'], test: s => s.finals >= 5 },
    { id: 'ch1', icon: 'I', name: ['Erste Schritte', 'First steps'], desc: ['Schließe Kapitel 1 ab.', 'Complete chapter 1.'], test: s => s.chapters[0] },
    { id: 'ch2', icon: 'II', name: ['Textschmied', 'Wordsmith'], desc: ['Schließe Kapitel 2 ab.', 'Complete chapter 2.'], test: s => s.chapters[1] },
    { id: 'ch3', icon: 'III', name: ['Ausschneidekünstler', 'Cut-and-paste artist'], desc: ['Schließe Kapitel 3 ab.', 'Complete chapter 3.'], test: s => s.chapters[2] },
    { id: 'ch4', icon: 'IV', name: ['Navigator', 'Navigator'], desc: ['Schließe Kapitel 4 ab.', 'Complete chapter 4.'], test: s => s.chapters[3] },
    { id: 'ch5', icon: 'V', name: ['Werkzeugmeister', 'Toolmaster'], desc: ['Schließe Kapitel 5 ab.', 'Complete chapter 5.'], test: s => s.chapters[4] },
    { id: 'ch6', icon: 'VI', name: ['Präzisionsarbeit', 'Precision work'], desc: ['Schließe Kapitel 6 ab.', 'Complete chapter 6.'], test: s => s.chapters[5] },
    { id: 'ch7', icon: 'VII', name: ['Feinschliff', 'Fine tuning'], desc: ['Schließe Kapitel 7 ab.', 'Complete chapter 7.'], test: s => s.chapters[6] },
    { id: 'ch8', icon: 'VIII', name: ['Befehlszeilen-Profi', 'Command-line pro'], desc: ['Schließe Kapitel 8 ab.', 'Complete chapter 8.'], test: s => s.chapters[7] },
    { id: 'ch9', icon: 'IX', name: ['Fensterputzer', 'Window juggler'], desc: ['Schließe Kapitel 9 ab.', 'Complete chapter 9.'], test: s => s.chapters[8] },
    { id: 'ch10', icon: 'X', name: ['Eigene Handschrift', 'Made it yours'], desc: ['Schließe Kapitel 10 ab.', 'Complete chapter 10.'], test: s => s.chapters[9] },
    { id: 'all', icon: '∞', name: ['Kurs geschafft', 'Course complete'], desc: ['Schließe alle Lektionen ab.', 'Complete every lesson.'], test: s => s.lessons >= LESSONS.length },
    { id: 'macro', icon: 'q', name: ['Makro-Magier', 'Macro wizard'], desc: ['Schließe die Lektion über Makros ab.', 'Complete the macros lesson.'], test: s => s.lessonDone.makros },
    { id: 'regex', icon: '\\1', name: ['Muster-Meister', 'Pattern master'], desc: ['Schließe die Lektion über Suchen und Ersetzen ab.', 'Complete the search and replace lesson.'], test: s => s.lessonDone.substitute },
    { id: 'golf1', icon: '⛳', name: ['Golfer', 'Golfer'], desc: ['Löse deine erste Challenge.', 'Solve your first challenge.'], test: s => s.ch >= 1 },
    { id: 'golfall', icon: '♛', name: ['Platzrekord', 'Course record'], desc: ['Löse alle Challenges mit drei Sternen.', 'Solve every challenge with three stars.'], test: s => s.ch3 >= CHALLENGES.length },
    { id: 'drill', icon: '◎', name: ['Scharfschütze', 'Sharpshooter'], desc: ['Triff 15 Ziele in einer Runde Zielscheibe.', 'Hit 15 targets in one round of target practice.'], test: s => s.drill >= 15 },
    { id: 'streak3', icon: '3', name: ['Dranbleiben', 'Keep going'], desc: ['Übe an drei Tagen in Folge.', 'Practise three days in a row.'], test: s => s.streak >= 3 },
    { id: 'streak7', icon: '7', name: ['Gewohnheit', 'Habit'], desc: ['Übe an sieben Tagen in Folge.', 'Practise seven days in a row.'], test: s => s.streak >= 7 }
  ];
  const RANKS = [[0, 'Neuling', 'Newcomer'], [500, 'Lehrling', 'Apprentice'], [1500, 'Geselle', 'Journeyman'], [3000, 'Experte', 'Expert'], [5000, 'Meister', 'Master'], [7500, 'Vim-Guru', 'Vim guru']];
  const li = () => (S.lang === 'en' ? 1 : 0);

  function stats() {
    let ex = 0, stars = 0, lessons = 0, finals = 0, perfectLessons = 0;
    const lessonDone = {};
    LESSONS.forEach(l => {
      const s = lessonStatus(l);
      ex += s.done;
      if (s.complete) { lessons++; lessonDone[l.id] = true; if (s.stars === 3) perfectLessons++; }
      l.ex.forEach((e, i) => { const r = Store.data.ex[l.id + ':' + i]; if (r) { stars += r.stars; if (e.tier === 'final') finals++; } });
    });
    const chapters = COURSE.map(c => c.lessons.every(l => lessonStatus(l).complete));
    const chVals = CHALLENGES.map(c => Store.data.ch[c.id]).filter(Boolean);
    const out = {
      ex, stars, lessons, finals, perfectLessons, lessonDone, chapters, maxStars: TOTAL_EX * 3,
      ch: chVals.length, ch3: chVals.filter(r => r.stars === 3).length, chStars: chVals.reduce((n, r) => n + r.stars, 0),
      drill: Store.data.drill || 0, streak: streak()
    };
    out.achCount = Object.keys(Store.data.ach).length;
    out.xp = stars * 10 + finals * 25 + out.chStars * 15 + Math.min(out.drill, 40) * 3 + out.achCount * 30;
    let ri = 0;
    RANKS.forEach((r, i) => { if (out.xp >= r[0]) ri = i; });
    out.rankIdx = ri;
    out.rank = RANKS[ri][1 + li()];
    out.nextRank = RANKS[ri + 1] || null;
    return out;
  }

  function checkAchievements() {
    const before = stats();
    const fresh = [];
    ACH.forEach(a => { if (!Store.data.ach[a.id] && a.test(before)) { Store.data.ach[a.id] = today(); fresh.push(a); } });
    if (fresh.length) Store.save();
    const after = stats();
    fresh.forEach((a, i) => setTimeout(() => {
      toast(`<span class="toast-ach">${esc(a.icon)}</span><span><b>${t('ach.unlocked')}</b><br>${esc(a.name[li()])}</span>`, 'ach');
      sound('ach');
    }, 400 + i * 700));
    return { before, after, fresh };
  }

  /* ---------- Effekte ---------- */
  let audio = null;
  function sound(kind) {
    if (!S.sound) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      const notes = { solve: [660, 880], lesson: [523, 659, 784, 1047], ach: [784, 988, 1175], block: [180] }[kind] || [440];
      notes.forEach((f, i) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = kind === 'block' ? 'square' : 'triangle';
        o.frequency.value = f;
        const t0 = audio.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(kind === 'block' ? 0.04 : 0.12, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
        o.connect(g).connect(audio.destination);
        o.start(t0); o.stop(t0 + 0.3);
      });
    } catch (e) { /* ohne Ton weiter */ }
  }

  function palette() {
    const cs = getComputedStyle(document.documentElement);
    return ['--accent', '--amber', '--violet', '--pink', '--cursor'].map(v => cs.getPropertyValue(v).trim()).filter(Boolean);
  }
  function particleCanvas() {
    let c = $('#fx');
    if (!c) { c = el('<canvas id="fx" aria-hidden="true"></canvas>'); document.body.appendChild(c); }
    c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
    return c;
  }
  let fxParticles = [], fxRunning = false;
  function fxLoop() {
    const c = particleCanvas(), ctx = c.getContext('2d');
    fxRunning = true;
    let last = performance.now();
    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, c.width, c.height);
      const dpr = devicePixelRatio;
      fxParticles = fxParticles.filter(p => p.life > 0);
      for (const p of fxParticles) {
        if (p.rocket) {
          p.y += p.vy * dt; p.vy += 260 * dt; p.life -= dt;
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x * dpr, p.y * dpr, 2.4 * dpr, 0, 7); ctx.fill();
          if (p.vy > -40 || p.life <= 0) { p.life = 0; explode(p.x, p.y, p.color, 70); }
          continue;
        }
        p.vy += (p.g || 180) * dt; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max * 1.4));
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x * dpr, p.y * dpr, p.size * dpr, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (fxParticles.length) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, c.width, c.height); fxRunning = false; }
    };
    requestAnimationFrame(frame);
  }
  function explode(x, y, color, n) {
    const cols = palette();
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 240;
      const life = 0.9 + Math.random() * 0.9;
      fxParticles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, size: 1.4 + Math.random() * 1.8, color: Math.random() < 0.6 ? color : cols[Math.floor(Math.random() * cols.length)] });
    }
  }
  function fireworks() {
    if (!S.effects || reduceMotion()) return;
    const cols = palette();
    const shots = 7;
    for (let i = 0; i < shots; i++) {
      setTimeout(() => {
        fxParticles.push({ rocket: true, x: innerWidth * (0.15 + Math.random() * 0.7), y: innerHeight + 10, vy: -(innerHeight * 0.9 + Math.random() * innerHeight * 0.5), life: 2.5, color: cols[i % cols.length] });
        if (!fxRunning) fxLoop();
      }, i * 260);
    }
  }
  function burst(target) {
    if (!S.effects || reduceMotion() || !target) return;
    const r = target.getBoundingClientRect();
    const cols = palette();
    for (let i = 0; i < 36; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4, sp = 120 + Math.random() * 220;
      const life = 0.6 + Math.random() * 0.5;
      fxParticles.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 420, life, max: life, size: 1.5 + Math.random() * 2, color: cols[i % cols.length] });
    }
    if (!fxRunning) fxLoop();
  }

  function toast(html, kind) {
    let box = $('#toasts');
    if (!box) { box = el('<div id="toasts" role="status" aria-live="polite"></div>'); document.body.appendChild(box); }
    const n = el(`<div class="toast ${kind || ''}">${html}</div>`);
    box.appendChild(n);
    setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 400); }, 3600);
  }

  /* ---------- Darstellung ---------- */
  const ACCENTS = {
    green: { l: ['#0b7a4b', '#ddefe5'], d: ['#5cc796', '#163024'], ed: '#46d697' },
    blue: { l: ['#1f5fbf', '#dfe8f8'], d: ['#73a9ff', '#162540'], ed: '#73a9ff' },
    violet: { l: ['#6a42c9', '#ebe4fa'], d: ['#b49dff', '#261e3e'], ed: '#b49dff' },
    orange: { l: ['#b0500a', '#f8e7d8'], d: ['#ffa75e', '#3a2414'], ed: '#ffa75e' },
    pink: { l: ['#b5336a', '#f8e0ea'], d: ['#ff80b2', '#3b1829'], ed: '#ff80b2' },
    teal: { l: ['#0e7380', '#d9eef1'], d: ['#4fd2d9', '#10302f'], ed: '#4fd2d9' }
  };
  const FONTS = {
    ui: { plex: ["'IBM Plex Sans'", 'IBM Plex Sans'], atkinson: ["'Atkinson Hyperlegible'", 'Atkinson Hyperlegible'], nunito: ["'Nunito'", 'Nunito'], serif: ["'Source Serif 4'", 'Source Serif 4'] },
    head: { bricolage: ["'Bricolage Grotesque'", 'Bricolage Grotesque'], fraunces: ["'Fraunces'", 'Fraunces'], space: ["'Space Grotesk'", 'Space Grotesk'], same: [null, null] },
    mono: { jetbrains: ["'JetBrains Mono'", 'JetBrains Mono'], fira: ["'Fira Code'", 'Fira Code'], plexmono: ["'IBM Plex Mono'", 'IBM Plex Mono'], sourcecode: ["'Source Code Pro'", 'Source Code Pro'] }
  };
  function applyTheme() {
    const a = ACCENTS[S.accent] || ACCENTS.green;
    const ui = (FONTS.ui[S.fontUi] || FONTS.ui.plex)[0];
    const head = (FONTS.head[S.fontHead] || FONTS.head.bricolage)[0] || ui;
    const mono = (FONTS.mono[S.fontMono] || FONTS.mono.jetbrains)[0];
    const light = `--accent:${a.l[0]};--accent-soft:${a.l[1]};--accent-ink:#ffffff;`;
    const dark = `--accent:${a.d[0]};--accent-soft:${a.d[1]};--accent-ink:#06120c;`;
    const css = `:root{${light}--m-normal:${a.ed};--tgt:${a.ed};--display:${head},'Avenir Next','Segoe UI',system-ui,sans-serif;--body:${ui},'Helvetica Neue','Segoe UI',system-ui,sans-serif;--mono:${mono},ui-monospace,'SF Mono',Menlo,Consolas,monospace;--ed-size:${S.edSize}px}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}}}
:root[data-theme="dark"]{${dark}}`;
    let st = $('#theme-style');
    if (!st) { st = document.createElement('style'); st.id = 'theme-style'; document.head.appendChild(st); }
    st.textContent = css;
    if (S.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', S.theme);
    document.documentElement.lang = S.lang;
    document.documentElement.classList.toggle('blink', S.blink !== false);
    Vim.setLang(S.lang);
  }

  /* ---------- Tastatureingabe ---------- */
  function mapKey(e, mode) {
    if (e.metaKey) return null;
    const k = e.key;
    if (e.ctrlKey && !e.altKey) {
      if (k === '[') return K.ESC;
      if (k === ']') return K.CTRL[']'];
      if (k === '^' || k === '6' || e.code === 'Digit6') return K.CTRL['^'];
      if (/^[a-zA-Z]$/.test(k)) return K.CTRL[k.toLowerCase()];
      return null;
    }
    if (e.altKey && !e.ctrlKey && S.os !== 'mac' && /^Key[NTW]$/.test(e.code)) return K.CTRL[e.code.slice(3).toLowerCase()];
    switch (k) {
      case 'Escape': return K.ESC;
      case 'Enter': return K.CR;
      case 'Backspace': return K.BS;
      case 'Delete': return K.DEL;
      case 'Tab': return mode === 'insert' || mode === 'cmdline' ? K.TAB : null;
      case 'ArrowLeft': return K.LEFT;
      case 'ArrowRight': return K.RIGHT;
      case 'ArrowUp': return K.UP;
      case 'ArrowDown': return K.DOWN;
    }
    if (k.length === 1) return k;
    return null;
  }

  /* ---------- Editor-Ansicht (Fenster, Tabs, Faltungen) ---------- */
  function helpLookup(topic) {
    const q = topic.replace(/^:/, '').trim().toLowerCase();
    if (!q) return null;
    const exact = [], partial = [];
    LESSONS.forEach(l => l.keys.forEach(k => {
      const spec = k[0].replace(/<C-(.)>/g, 'Ctrl-$1');
      const parts = spec.toLowerCase().split(/\s*\/\s*|\s+/);
      const row = spec.padEnd(18) + ' ' + L(k[1]) + '   (' + t('h.lesson') + ': ' + L(l.title) + ')';
      if (parts.some(p => p === q || p === ':' + q || p.replace(/\{.*\}$/, '') === q)) exact.push(row);
      else if (spec.toLowerCase().includes(q) || L(k[1]).toLowerCase().includes(q)) partial.push(row);
    }));
    const rows = exact.length ? exact : partial.slice(0, 12);
    return rows.length ? [t('h.helpFor', topic)].concat(rows) : null;
  }
  function clipboardWrite(text) { try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* ohne Zwischenablage weiter */ } }
  function newWorkspace(ex, opts) {
    const ws = VKd.makeWorkspace(ex, Object.assign({ help: helpLookup, onClipboard: clipboardWrite }, opts || {}));
    ws.shared.o.relativenumber = !!S.rnu;
    return ws;
  }

  class EditorView {
    constructor(host, opts) {
      this.opts = opts || {};
      const passive = !!this.opts.passive;
      this.el = el(`<div class="editor${passive ? ' passive' : ''}" data-mode="normal">
        <div class="ed-tabs" hidden></div>
        <div class="ed-panes" aria-hidden="true"></div>
        <pre class="ed-list" hidden></pre>
        <div class="ed-status"><span class="ed-mode">NORMAL</span><span class="ed-pending"></span><span class="ed-rec" hidden></span><span class="ed-file"></span><span class="ed-pos"></span></div>
        <div class="ed-cmd"></div>
        <div class="ed-toast" role="status" hidden></div>
        ${passive ? '' : `<textarea class="ed-input" rows="1" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="${esc(this.opts.label || t('ed.label'))}"></textarea>
        <div class="ed-overlay" aria-hidden="true"><span>${esc(t('ed.click'))}</span></div>
        <div class="ed-touch"><button type="button" data-k="esc">Esc</button><button type="button" data-k="ctrl" aria-pressed="false">Ctrl</button></div>`}
      </div>`);
      host.appendChild(this.el);
      this.panes = $('.ed-panes', this.el);
      this.ta = $('.ed-input', this.el);
      this.ctrlArmed = false;
      this.dead = false;
      if (!passive) this.bind();
    }

    get v() { return this.ws ? this.ws.active : null; }
    setWorkspace(ws) { this.ws = ws; this.render(); }

    bind() {
      const ta = this.ta;
      ta.addEventListener('focus', () => this.el.classList.add('focused'));
      ta.addEventListener('blur', () => this.el.classList.remove('focused'));
      ta.addEventListener('keydown', e => {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === 'Dead') { this.dead = true; return; }
        if (this.dead) { this.dead = false; return; }
        const k = mapKey(e, this.v && this.v.mode);
        if (k == null) return;
        e.preventDefault();
        e.stopPropagation();
        this.input(k);
      });
      const flush = () => {
        const val = ta.value;
        ta.value = '';
        this.dead = false;
        for (const ch of val) this.input(ch === '\n' ? K.CR : ch);
      };
      ta.addEventListener('input', e => { if (!e.isComposing) flush(); });
      ta.addEventListener('compositionend', flush);
      this.el.addEventListener('click', e => {
        const b = e.target.closest('.ed-touch button');
        if (b) {
          e.preventDefault();
          if (b.dataset.k === 'esc') this.input(K.ESC);
          else { this.ctrlArmed = !this.ctrlArmed; b.setAttribute('aria-pressed', String(this.ctrlArmed)); }
        }
        this.focus();
      });
    }

    input(k) {
      if (this.ctrlArmed && k.length === 1 && /[a-z\[^6\]]/i.test(k)) {
        k = k === '[' ? K.ESC : k === '^' || k === '6' ? K.CTRL['^'] : k === ']' ? K.CTRL[']'] : K.CTRL[k.toLowerCase()];
        this.ctrlArmed = false;
        const b = $('[data-k="ctrl"]', this.el);
        if (b) b.setAttribute('aria-pressed', 'false');
      }
      if (this.opts.onKey) this.opts.onKey(k); else this.ws.feed(k);
      this.render();
    }

    focus() { if (!this.ta) return; try { this.ta.focus({ preventScroll: true }); } catch (e) { this.ta.focus(); } }

    toast(text) {
      const tt = $('.ed-toast', this.el);
      tt.textContent = text; tt.hidden = false;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { tt.hidden = true; }, 1600);
    }

    renderLines(v, active, dec) {
      const Ls = v.lines, h = v.o.height;
      const vis = active && (v.mode === 'visual' || v.mode === 'vline' || v.mode === 'vblock' || (v.mode === 'cmdline' && v.cmdFrom && /^v/.test(v.cmdFrom.mode)));
      let sel = null;
      if (vis && v.vs) {
        const saved = v.mode;
        if (v.mode === 'cmdline') v.mode = v.cmdFrom.mode;
        sel = v.visualRange();
        v.mode = saved;
      }
      const re = (v.hls && v.o.hlsearch && v.lastSearch && v.lastSearch.re) ? v.lastSearch.re : null;
      const showNum = v.o.number || v.o.relativenumber;
      const gw = Math.max(3, String(Ls.length).length + 1);
      const rows = v.visibleRows(v.top, h);
      const curRow = v.displayRow(Math.min(v.r, v.last));
      let html = '';
      for (let i = 0; i < h; i++) {
        const row = rows[i];
        if (!row) {
          html += `<div class="ed-line tilde">${showNum ? `<span class="ed-gut" style="width:${gw}ch"></span>` : ''}<span class="ed-txt">~</span></div>`;
          continue;
        }
        const r = row.r;
        const isCur = r === curRow;
        let num = '';
        if (showNum) {
          const n = v.o.relativenumber && !isCur ? Math.abs(r - curRow) : r + 1;
          num = `<span class="ed-gut${isCur ? ' now' : ''}${v.o.relativenumber && isCur ? ' left' : ''}" style="width:${gw}ch">${n}</span>`;
        }
        if (row.fold) {
          const f = row.fold;
          const label = Vim.M('foldLine', f.e - f.s + 1, Ls[f.s].trim());
          const curCls = isCur && active ? (v.mode === 'insert' ? ' cur-ins' : ' cur') : '';
          html += `<div class="ed-line fold${isCur && v.o.cursorline ? ' curline' : ''}">${num}<span class="ed-txt"><span class="foldtxt${curCls}">${esc(label)}</span></span></div>`;
          continue;
        }
        const line = Ls[r], len = line.length;
        const cls = new Array(len + 1).fill('');
        const add = (a, b, name) => { for (let x = Math.max(0, a); x < Math.min(len + 1, b); x++) cls[x] += ' ' + name; };
        if (sel) {
          if (sel.type === 'line' && r >= sel.sr && r <= sel.er) add(0, len + 1, 'sel');
          else if (sel.type === 'block' && r >= sel.sr && r <= sel.er) add(sel.sc, sel.toEnd ? len : sel.ec, 'sel');
          else if (sel.type === 'char' && r >= sel.sr && r <= sel.er) add(r === sel.sr ? sel.sc : 0, r === sel.er ? sel.ec : len + 1, 'sel');
        }
        if (re) {
          re.lastIndex = 0;
          let m;
          while ((m = re.exec(line))) {
            if (!m[0].length) { re.lastIndex++; continue; }
            add(m.index, m.index + m[0].length, 'hl');
          }
        }
        if (active && v.inc && v.inc.r === r) add(v.inc.c, v.inc.c + v.inc.len, 'inc');
        if (dec && dec.targets) for (const tg of dec.targets) if (tg.r === r) add(Math.min(tg.c, len), Math.min(tg.c, len) + 1, tg.kind);
        let trail = len;
        if (v.o.list) { trail = line.search(/ +$/); if (trail < 0) trail = len; add(trail, len, 'trail'); }
        if (r === v.r) {
          const cc = Math.min(v.c, len);
          const kind = !active ? 'cur-off' : v.mode === 'insert' ? 'cur-ins' : v.mode === 'replace' ? 'cur-rep' : (v.mode === 'cmdline' || v.mode === 'confirm') ? 'cur-dim' : 'cur';
          add(cc, cc + 1, kind);
        }
        let txt = '', run = '', runCls = null;
        const flushRun = () => { if (run) txt += runCls ? `<span class="${runCls.trim()}">${esc(run)}</span>` : esc(run); run = ''; };
        const end = cls[len] ? len + 1 : len;
        for (let x = 0; x < end; x++) {
          let ch = x < len ? line[x] : ' ';
          if (v.o.list && x >= trail && x < len) ch = '·';
          if (cls[x] !== runCls) { flushRun(); runCls = cls[x]; }
          run += ch;
        }
        flushRun();
        if (v.o.list) txt += '<span class="eol">$</span>';
        html += `<div class="ed-line${isCur && v.o.cursorline ? ' curline' : ''}">${num}<span class="ed-txt">${txt}</span></div>`;
      }
      return html;
    }

    renderNode(node, dec, multi) {
      if (node.type === 'win') {
        const v = node.win.v, active = node.win === this.ws.win;
        const status = multi ? `<div class="win-status${active ? ' on' : ''}"><span>${esc(v.buf.name)}${v.buf.modified ? ' [+]' : ''}</span><span>${v.r + 1}:${v.c + 1}</span></div>` : '';
        return `<div class="ed-pane${active ? ' active' : ''}"><div class="ed-screen" style="--rows:${v.o.height}">${this.renderLines(v, active, active ? dec : null)}</div>${status}</div>`;
      }
      const total = node.sizes.reduce((a, b) => a + b, 0);
      return `<div class="ed-split ${node.dir}">${node.children.map((c, i) => `<div class="ed-cell" style="flex:${(node.sizes[i] / total).toFixed(3)} 1 0">${this.renderNode(c, dec, multi)}</div>`).join('')}</div>`;
    }

    render() {
      const ws = this.ws;
      if (!ws) return;
      const v = ws.active;
      const dec = this.opts.decorate ? this.opts.decorate() : null;
      const tabs = $('.ed-tabs', this.el);
      if (ws.tabs.length > 1) {
        tabs.hidden = false;
        tabs.innerHTML = ws.tabs.map((tb, i) => { const b = tb.cur.v.buf; return `<span class="ed-tab${i === ws.tabIdx ? ' on' : ''}">${i + 1} ${esc(b.name)}${b.modified ? ' +' : ''}</span>`; }).join('');
      } else tabs.hidden = true;
      const multi = ws.windowCount() > 1;
      this.panes.innerHTML = this.renderNode(ws.tab.root, dec, multi);
      this.el.classList.toggle('multi', multi);
      this.el.dataset.mode = v.mode === 'cmdline' && v.cmdFrom ? 'cmdline' : v.mode;
      $('.ed-mode', this.el).textContent = t('mode.' + v.mode);
      const pend = (v.pending || '') + (v.mapBuf || '');
      $('.ed-pending', this.el).textContent = pend ? Array.from(pend).map(keyLabel).join('') : (v.insertRegPending ? '"' : v.ctrlX ? '^X' : v.digraph !== null ? '^K' : '');
      const rec = $('.ed-rec', this.el);
      rec.hidden = !v.recording;
      rec.textContent = v.recording ? t('ed.rec', v.recording) : '';
      const showFile = this.opts.showFile || ws.shared.buffers.length > 1 || multi;
      $('.ed-file', this.el).textContent = showFile ? v.buf.name + (v.buf.modified ? ' [+]' : '') : '';
      $('.ed-pos', this.el).textContent = (v.r + 1) + ':' + (v.c + 1);
      const cmd = $('.ed-cmd', this.el);
      if (v.mode === 'cmdline') {
        cmd.className = 'ed-cmd typing';
        cmd.innerHTML = `${esc(v.cmdType)}${esc(v.cmdText)}<span class="cmd-cur"> </span>`;
      } else if (v.message) {
        cmd.className = 'ed-cmd ' + v.message.type;
        cmd.textContent = v.message.text;
      } else {
        cmd.className = 'ed-cmd mode';
        cmd.textContent = ['insert', 'replace', 'visual', 'vline', 'vblock'].includes(v.mode) ? t('line.' + v.mode) : (v.recording ? t('ed.rec', v.recording) : '');
      }
      const list = $('.ed-list', this.el);
      if (v.list) { list.hidden = false; list.textContent = v.list.join('\n') + '\n\n' + t('ed.more'); }
      else list.hidden = true;
      const pane = $('.ed-pane.active .ed-screen', this.panes) || $('.ed-screen', this.panes);
      const cur = pane && $('.cur, .cur-ins, .cur-rep, .cur-dim', pane);
      if (cur) {
        const sx = pane.scrollLeft, w = pane.clientWidth, x = cur.offsetLeft;
        if (x < sx + 40) pane.scrollLeft = Math.max(0, x - 40);
        else if (x > sx + w - 60) pane.scrollLeft = x - w + 60;
      }
    }
  }

  function keycaps(keys) { return keys.map(k => `<kbd>${esc(keyLabel(k))}</kbd>`).join(''); }

  /* ---------- Vorführung ---------- */
  class DemoPlayer {
    constructor(host, demo) {
      this.demo = demo;
      this.el = el(`<section class="demo" aria-label="${esc(t('demo.title'))}">
        <header class="demo-h"><span class="demo-title">${esc(t('demo.title'))}</span>
          <div class="demo-ctl">
            <button type="button" class="btn small primary" data-d="play">${esc(t('demo.play'))}</button>
            <button type="button" class="btn small ghost" data-d="step">${esc(t('demo.step'))} ›</button>
            <button type="button" class="btn small ghost" data-d="restart">${esc(t('demo.restart'))}</button>
          </div></header>
        <div class="demo-body">
          <div class="demo-ed"></div>
          <div class="demo-side">
            <div class="demo-keys" aria-live="off"></div>
            <p class="demo-cap"></p>
            <div class="demo-dots"></div>
          </div>
        </div>
      </section>`);
      host.appendChild(this.el);
      this.view = new EditorView($('.demo-ed', this.el), { passive: true });
      this.el.addEventListener('click', e => {
        const b = e.target.closest('[data-d]');
        if (!b) return;
        if (b.dataset.d === 'play') this.toggle();
        if (b.dataset.d === 'step') { this.stop(); this.step(); }
        if (b.dataset.d === 'restart') { this.stop(); this.reset(); }
      });
      this.reset();
    }
    reset() {
      const d = this.demo;
      const ex = VKd.prepare({ text: d.text || '¶', files: d.files, height: d.height }, S.lang);
      const lines = (ex.files ? ex.files.map[ex.files.order[0]] : ex.text).split('\n').length;
      this.ws = newWorkspace(ex, { height: d.height || Math.max(3, Math.min(8, lines + 1)) });
      this.i = 0;
      this.view.setWorkspace(this.ws);
      $('.demo-keys', this.el).innerHTML = '';
      $('.demo-cap', this.el).innerHTML = esc(t('demo.ready'));
      this.dots();
    }
    dots() {
      $('.demo-dots', this.el).innerHTML = this.demo.steps.map((s, j) => `<span class="${j < this.i ? 'done' : ''}${j === this.i - 1 ? ' now' : ''}"></span>`).join('');
    }
    toggle() {
      if (this.playing) { this.stop(); return; }
      if (this.i >= this.demo.steps.length) this.reset();
      this.playing = true;
      $('[data-d="play"]', this.el).textContent = t('demo.pause');
      this.loop();
    }
    stop() {
      this.playing = false;
      clearTimeout(this.timer);
      $('[data-d="play"]', this.el).textContent = t('demo.play');
    }
    loop() {
      if (!this.playing) return;
      if (this.i >= this.demo.steps.length) { this.stop(); return; }
      this.step(() => { this.timer = setTimeout(() => this.loop(), 1700); });
    }
    step(done) {
      if (this.i >= this.demo.steps.length) { if (done) done(); return; }
      const [notation, cap] = this.demo.steps[this.i];
      const keys = Vim.parseNotation(L(notation));
      const keyBox = $('.demo-keys', this.el);
      keyBox.innerHTML = '';
      $('.demo-cap', this.el).innerHTML = L(cap);
      annotateKbd($('.demo-cap', this.el), false);
      this.i++;
      this.dots();
      let j = 0;
      const typeNext = () => {
        if (j >= keys.length) { if (this.i >= this.demo.steps.length) $('.demo-cap', this.el).insertAdjacentHTML('beforeend', ` <span class="demo-end">${esc(t('demo.done'))}</span>`); if (done) done(); return; }
        const k = keys[j++];
        keyBox.insertAdjacentHTML('beforeend', `<kbd class="pop">${esc(keyLabel(k))}</kbd>`);
        this.ws.feed(k);
        this.view.render();
        this.timer = setTimeout(typeNext, keys.length > 8 ? 90 : 320);
      };
      typeNext();
    }
  }

  /* ---------- Hinweise aus der Lösung ableiten ---------- */
  const NAMES = {
    de: {
      op: { d: 'löschen', c: 'ändern', y: 'kopieren', '>': 'einrücken', '<': 'ausrücken', gU: 'Großbuchstaben', gu: 'Kleinbuchstaben', 'g~': 'Groß/klein umschalten', gq: 'umbrechen', gw: 'umbrechen, Cursor bleibt', 'g?': 'ROT13', '=': 'automatisch einrücken', '!': 'durch Programm filtern', zf: 'Faltung anlegen' },
      motion: { h: 'links', j: 'runter', k: 'hoch', l: 'rechts', w: 'nächster Wortanfang', W: 'nächstes WORT', b: 'Wortanfang zurück', B: 'WORT zurück', e: 'Wortende', E: 'WORT-Ende', ge: 'Ende des vorherigen Wortes', gE: 'Ende des vorherigen WORTES', '0': 'Zeilenanfang', '^': 'erstes Zeichen', '$': 'Zeilenende', gg: 'erste Zeile', G: 'letzte Zeile / Zeile N', '{': 'Leerzeile darüber', '}': 'Leerzeile darunter', '(': 'Satzanfang zurück', ')': 'nächster Satzanfang', '%': 'passende Klammer / Prozent der Datei', H: 'oben im Bild', M: 'Mitte des Bildes', L: 'unten im Bild', n: 'nächster Treffer', N: 'vorheriger Treffer', '*': 'Wort unter dem Cursor suchen', '#': 'Wort rückwärts suchen', 'g*': 'Wort suchen ohne Wortgrenzen', 'g#': 'rückwärts ohne Wortgrenzen', gd: 'lokale Deklaration', gD: 'erste Erwähnung in der Datei', '[(': 'umschließende (', '[{': 'umschließende {', '])': 'schließende )', ']}': 'schließende }', '[[': 'vorherige { in Spalte 1', ']]': 'nächste { in Spalte 1', f: 'zum Zeichen', F: 'zum Zeichen rückwärts', t: 'bis vor ein Zeichen', T: 'bis hinter ein Zeichen rückwärts', ';': 'Zeichensuche wiederholen', ',': 'Zeichensuche rückwärts wiederholen', "'": 'zur Zeile der Marke', '`': 'genau zur Marke', '+': 'Anfang der nächsten Zeile', '-': 'Anfang der vorigen Zeile', '\x04': 'halbe Seite runter', '\x15': 'halbe Seite hoch', '\x06': 'Seite vor', '\x02': 'Seite zurück' },
      cmd: { x: 'Zeichen löschen', X: 'Zeichen davor löschen', s: 'Zeichen ersetzen und tippen', S: 'Zeile ersetzen', D: 'bis Zeilenende löschen', C: 'bis Zeilenende ändern', Y: 'Zeile kopieren', p: 'einfügen dahinter/darunter', P: 'einfügen davor/darüber', gp: 'einfügen, Cursor dahinter', gP: 'einfügen davor, Cursor dahinter', ']p': 'einfügen mit Einrückung', u: 'rückgängig', U: 'Zeile zurücksetzen', '\x12': 'wiederherstellen', 'g-': 'zeitlich zurück', 'g+': 'zeitlich vor', '.': 'letzte Änderung wiederholen', i: 'Einfügemodus', a: 'Einfügen dahinter', I: 'Einfügen am Zeilenanfang', A: 'Einfügen am Zeilenende', gi: 'Einfügen an der letzten Stelle', o: 'neue Zeile darunter', O: 'neue Zeile darüber', R: 'Ersetzungsmodus', v: 'visuell markieren', V: 'Zeilen markieren', '\x16': 'Block markieren', J: 'Zeilen verbinden', '~': 'Groß/klein umschalten', r: 'ein Zeichen ersetzen', m: 'Marke setzen', q: 'Makro aufnehmen', '@': 'Makro abspielen', '\x01': 'Zahl erhöhen', '\x18': 'Zahl verringern', ':': 'Befehlszeile', '/': 'Suche', '?': 'Suche rückwärts', zt: 'Zeile nach oben', zb: 'Zeile nach unten', zz: 'Zeile in die Mitte', zo: 'Faltung öffnen', zc: 'Faltung schließen', za: 'Faltung umschalten', zR: 'alle Faltungen öffnen', zM: 'alle Faltungen schließen', zd: 'Faltung löschen', ga: 'Zeichencode', '\x0f': 'zurück in der Sprungliste', '\t': 'vor in der Sprungliste', 'g;': 'zur letzten Änderung', 'g,': 'zur neueren Änderung', '\x05': 'Ansicht runter', '\x19': 'Ansicht hoch', '\x17': 'Fensterbefehl', '\x1e': 'vorheriger Puffer', gt: 'nächster Tab', gT: 'vorheriger Tab', 'g&': 'Ersetzen auf alle Zeilen' },
      vcmd: { d: 'Markierung löschen', x: 'Markierung löschen', c: 'Markierung ändern', y: 'Markierung kopieren', '>': 'Markierung einrücken', '<': 'Markierung ausrücken', U: 'Markierung groß', u: 'Markierung klein', '~': 'Groß/klein umschalten', I: 'vor jeder Zeile einfügen', A: 'nach jeder Zeile einfügen', J: 'Zeilen verbinden', r: 'jedes Zeichen ersetzen', p: 'Markierung ersetzen', ['g\x01']: 'fortlaufend hochzählen', '\x01': 'Zahlen erhöhen', ':': 'Befehl für die Markierung' },
      obj: { w: 'Wort', W: 'WORT', s: 'Satz', p: 'Absatz', '"': 'Anführungszeichen', "'": 'Anführungszeichen', '(': 'Klammer', ')': 'Klammer', b: 'Klammer', '{': 'geschweifte Klammer', '}': 'geschweifte Klammer', B: 'geschweifte Klammer', '[': 'eckige Klammer', ']': 'eckige Klammer', '<': 'spitze Klammer', t: 'Tag' },
      inner: 'innen', around: 'mit Rahmen', line: 'ganze Zeile', reg: 'Register wählen', count: 'Zahl davor', insreg: 'Register im Einfügemodus einfügen', search: 'Suche mit Muster', goto: 'zu Zeile springen',
      ex: { s: 'suchen und ersetzen', g: 'Befehl auf passende Zeilen', v: 'Befehl auf nicht passende Zeilen', sort: 'sortieren', sor: 'sortieren', norm: 'Normalbefehl pro Zeile', normal: 'Normalbefehl pro Zeile', m: 'Zeilen verschieben', t: 'Zeilen kopieren', d: 'Zeilen löschen', set: 'Option setzen', se: 'Option setzen', w: 'speichern', q: 'beenden', j: 'Zeilen verbinden', reg: 'Register zeigen', e: 'Datei öffnen', sav: 'speichern unter', b: 'Puffer wechseln', bn: 'nächster Puffer', bd: 'Puffer schließen', bufdo: 'Befehl in allen Puffern', wa: 'alles speichern', sp: 'Fenster teilen', vs: 'Fenster senkrecht teilen', tabe: 'Datei in neuem Tab', vimgrep: 'in allen Dateien suchen', cn: 'nächster Treffer', cdo: 'Befehl auf jedem Treffer', let: 'Variable oder Register setzen', nnoremap: 'Taste im Normalmodus belegen', inoremap: 'Taste im Einfügemodus belegen', iab: 'Abkürzung anlegen', so: 'Datei als Befehle ausführen', r: 'Datei oder Ausgabe einfügen', earlier: 'zeitlich zurück', h: 'Hilfe' }
    },
    en: {
      op: { d: 'delete', c: 'change', y: 'yank', '>': 'indent', '<': 'unindent', gU: 'uppercase', gu: 'lowercase', 'g~': 'toggle case', gq: 'wrap', gw: 'wrap, cursor stays', 'g?': 'ROT13', '=': 'auto-indent', '!': 'filter through a program', zf: 'create a fold' },
      motion: { h: 'left', j: 'down', k: 'up', l: 'right', w: 'next word start', W: 'next WORD', b: 'back to word start', B: 'back a WORD', e: 'end of word', E: 'end of WORD', ge: 'end of previous word', gE: 'end of previous WORD', '0': 'start of line', '^': 'first non-blank', '$': 'end of line', gg: 'first line', G: 'last line / line N', '{': 'blank line above', '}': 'blank line below', '(': 'previous sentence start', ')': 'next sentence start', '%': 'matching bracket / percent of file', H: 'top of screen', M: 'middle of screen', L: 'bottom of screen', n: 'next match', N: 'previous match', '*': 'search word under cursor', '#': 'search word backwards', 'g*': 'search word without boundaries', 'g#': 'backwards without boundaries', gd: 'local declaration', gD: 'first mention in the file', '[(': 'enclosing (', '[{': 'enclosing {', '])': 'closing )', ']}': 'closing }', '[[': 'previous { in column 1', ']]': 'next { in column 1', f: 'to character', F: 'to character backwards', t: 'until a character', T: 'until a character backwards', ';': 'repeat character find', ',': 'repeat find backwards', "'": 'to the mark\'s line', '`': 'exactly to the mark', '+': 'start of next line', '-': 'start of previous line', '\x04': 'half page down', '\x15': 'half page up', '\x06': 'page forward', '\x02': 'page back' },
      cmd: { x: 'delete character', X: 'delete character before', s: 'substitute character', S: 'substitute line', D: 'delete to end of line', C: 'change to end of line', Y: 'yank line', p: 'put after/below', P: 'put before/above', gp: 'put, cursor after', gP: 'put before, cursor after', ']p': 'put with indentation', u: 'undo', U: 'reset line', '\x12': 'redo', 'g-': 'back in time', 'g+': 'forward in time', '.': 'repeat last change', i: 'insert mode', a: 'append after', I: 'insert at line start', A: 'append at line end', gi: 'insert at last spot', o: 'open line below', O: 'open line above', R: 'replace mode', v: 'visual select', V: 'select lines', '\x16': 'select block', J: 'join lines', '~': 'toggle case', r: 'replace one character', m: 'set mark', q: 'record macro', '@': 'play macro', '\x01': 'increment number', '\x18': 'decrement number', ':': 'command line', '/': 'search', '?': 'search backwards', zt: 'line to top', zb: 'line to bottom', zz: 'line to middle', zo: 'open fold', zc: 'close fold', za: 'toggle fold', zR: 'open all folds', zM: 'close all folds', zd: 'delete fold', ga: 'character code', '\x0f': 'back in the jump list', '\t': 'forward in the jump list', 'g;': 'to the last change', 'g,': 'to a newer change', '\x05': 'scroll down', '\x19': 'scroll up', '\x17': 'window command', '\x1e': 'previous buffer', gt: 'next tab', gT: 'previous tab', 'g&': 'substitute on all lines' },
      vcmd: { d: 'delete selection', x: 'delete selection', c: 'change selection', y: 'yank selection', '>': 'indent selection', '<': 'unindent selection', U: 'uppercase selection', u: 'lowercase selection', '~': 'toggle case', I: 'insert before every line', A: 'append after every line', J: 'join lines', r: 'replace every character', p: 'replace selection', ['g\x01']: 'increment progressively', '\x01': 'increment numbers', ':': 'command for the selection' },
      obj: { w: 'word', W: 'WORD', s: 'sentence', p: 'paragraph', '"': 'quotes', "'": 'quotes', '(': 'brackets', ')': 'brackets', b: 'brackets', '{': 'curly brackets', '}': 'curly brackets', B: 'curly brackets', '[': 'square brackets', ']': 'square brackets', '<': 'angle brackets', t: 'tag' },
      inner: 'inner', around: 'around', line: 'whole line', reg: 'choose register', count: 'count in front', insreg: 'insert register in insert mode', search: 'search with a pattern', goto: 'jump to line',
      ex: { s: 'search and replace', g: 'command on matching lines', v: 'command on non-matching lines', sort: 'sort', sor: 'sort', norm: 'normal command per line', normal: 'normal command per line', m: 'move lines', t: 'copy lines', d: 'delete lines', set: 'set an option', se: 'set an option', w: 'write', q: 'quit', j: 'join lines', reg: 'show registers', e: 'open a file', sav: 'save as', b: 'switch buffer', bn: 'next buffer', bd: 'close buffer', bufdo: 'command in all buffers', wa: 'write all', sp: 'split window', vs: 'split vertically', tabe: 'file in a new tab', vimgrep: 'search all files', cn: 'next match', cdo: 'command on every match', let: 'set a variable or register', nnoremap: 'map a key in normal mode', inoremap: 'map a key in insert mode', iab: 'create an abbreviation', so: 'run a file as commands', r: 'insert a file or output', earlier: 'back in time', h: 'help' }
    }
  };
  function describeSolution(ex) {
    const N = NAMES[S.lang] || NAMES.de;
    const ws = newWorkspace(ex);
    const items = [], seen = new Set();
    const add = (keys, label) => { const id = keys + '|' + label; if (seen.has(id)) return; seen.add(id); items.push({ keys, label }); };
    const ARG = { f: 'f{z}', F: 'F{z}', t: 't{z}', T: 'T{z}', r: 'r{z}', m: 'm{a}', q: 'q{a}', '@': '@{a}', "'": "'{a}", '`': '`{a}', '\x17': '<C-w>{x}' };
    ws.shared.onCmd = p => {
      if (p.type === 'ex') {
        if (p.cmdType === '=') return;
        if (p.cmdType !== ':') { add(p.cmdType + '…', N.search); return; }
        const m = p.text.replace(/^[\s:]*/, '').match(/^([%.$,;0-9+\-\s]|'[<>a-z]|\/[^/]*\/)*\s*([a-zA-Z]+|&|!)?/);
        const name = m && m[2];
        const range = /^\s*%/.test(p.text) ? '%' : /^'<,'>/.test(p.text) ? "'<,'>" : '';
        if (!name) { add(':N', N.goto); return; }
        add(':' + range + name, N.ex[name] || name);
        if (/\\\(|\\v.*\(/.test(p.text)) add('\\( \\) \\1', S.lang === 'en' ? 'groups' : 'Gruppen');
        if (/\\</.test(p.text)) add('\\< \\>', S.lang === 'en' ? 'word boundaries' : 'Wortgrenzen');
        if (/\|\s*\w/.test(p.text) && !/\\\|/.test(p.text)) add('|', S.lang === 'en' ? 'chain commands' : 'Befehle verketten');
        return;
      }
      if (p.type === 'insreg') { add('<C-r>', N.insreg); return; }
      if (p.reg) add('"{r}', N.reg);
      if (p.count && !(p.type === 'motion' && (p.key === 'G' || p.key === 'gg' || p.key === '%'))) add('3…', N.count);
      if (p.type === 'op') {
        add(p.op, N.op[p.op] || p.op);
        if (p.double) add(p.op + (p.op.length === 2 ? p.op[1] : p.op), N.line);
        else if (p.obj) add(p.obj, (p.obj[0] === 'i' ? N.inner : N.around) + ' · ' + (N.obj[p.obj[1]] || p.obj[1]));
        else if (p.key) add(ARG[p.key] || p.key, N.motion[p.key] || p.key);
        return;
      }
      if (p.type === 'motion') { add(ARG[p.key] || p.key, N.motion[p.key] || p.key); return; }
      if (p.visual && (p.key === 'i' || p.key === 'a')) { add(p.key + p.arg, (p.key === 'i' ? N.inner : N.around) + ' · ' + (N.obj[p.arg] || p.arg)); return; }
      const table = p.visual ? N.vcmd : N.cmd;
      add(ARG[p.key] || p.key, table[p.key] || N.cmd[p.key] || p.key);
    };
    ex.solKeys.forEach(k => ws.feed(k));
    return items;
  }
  const specToHtml = s => fmtKey(s.replace(/\x01/g, '<C-a>').replace(/\x18/g, '<C-x>').replace(/\x12/g, '<C-r>').replace(/\x16/g, '<C-v>').replace(/\x04/g, '<C-d>').replace(/\x15/g, '<C-u>')
    .replace(/\x06/g, '<C-f>').replace(/\x02/g, '<C-b>').replace(/\x0f/g, '<C-o>').replace(/\t/g, '<C-i>').replace(/\x05/g, '<C-e>').replace(/\x19/g, '<C-y>').replace(/\x17/g, '<C-w>').replace(/\x1e/g, '<C-^>'));

  /* Markiert in einer Zielzeile, was im aktuellen Text noch fehlt (gd-add) und wo noch etwas entfernt werden muss (gd-del). */
  function goalDiffHtml(goal, cur) {
    if (cur == null) return goal ? `<span class="gd-add">${esc(goal)}</span>` : ' ';
    const a = Array.from(goal), b = Array.from(cur);
    if (a.length * b.length > 40000) return `<span class="gd-add">${esc(goal)}</span>`;
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    let i = 0, j = 0, html = '', add = '', del = '';
    const flush = () => {
      if (del) { html += `<del class="gd-del">${esc(del)}</del>`; del = ''; }
      if (add) { html += `<span class="gd-add">${esc(add)}</span>`; add = ''; }
    };
    while (i < n || j < m) {
      if (i < n && j < m && a[i] === b[j]) { flush(); html += esc(a[i]); i++; j++; }
      else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) { del += b[j]; j++; }
      else { add += a[i]; i++; }
    }
    flush();
    return html || ' ';
  }

  function lineSimilarity(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return a.length === b.length ? 1 : 0;
    const x = Array.from(a), y = Array.from(b);
    if (x.length * y.length > 40000) return 0;
    let prev = new Uint16Array(y.length + 1), row = new Uint16Array(y.length + 1);
    for (let i = 1; i <= x.length; i++) {
      for (let j = 1; j <= y.length; j++) row[j] = x[i - 1] === y[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], row[j - 1]);
      [prev, row] = [row, prev];
    }
    return 2 * prev[y.length] / (x.length + y.length);
  }
  /* Ordnet Ziel- und aktuelle Zeilen einander zu: gleiche oder ähnliche Zeilen werden gepaart, der Rest gilt als fehlend (add) oder überzählig (del). */
  function alignLines(goal, cur) {
    const n = goal.length, m = cur.length;
    const sim = goal.map(g => cur.map(c => { const s = lineSimilarity(g, c); return s >= 0.5 ? s : 0; }));
    const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1], sim[i][j] ? dp[i + 1][j + 1] + sim[i][j] : 0);
    const out = [];
    let i = 0, j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && sim[i][j] && dp[i][j] === dp[i + 1][j + 1] + sim[i][j]) { out.push({ type: 'pair', g: goal[i], c: cur[j] }); i++; j++; }
      else if (j < m && (i >= n || dp[i][j] === dp[i][j + 1])) { out.push({ type: 'del', c: cur[j] }); j++; }
      else { out.push({ type: 'add', g: goal[i] }); i++; }
    }
    return out;
  }

  /* ---------- Übungspanel ---------- */
  class Practice {
    constructor(host, opts) {
      this.opts = opts;
      this.items = opts.exercises.map(x => VKd.prepare(x, S.lang));
      this.el = el(`<section class="practice">
        <header class="pr-head">
          <div class="pr-steps" role="group"></div>
          <div class="pr-meter">
            <span class="pr-keys"><b>0</b> ${esc(t('pr.keys'))}</span>
            <span class="pr-par"></span>
            <span class="pr-best"></span>
          </div>
        </header>
        <div class="pr-taskrow"><span class="tier"></span><p class="pr-task"></p></div>
        <div class="pr-stage">
          <div class="pr-ed"></div>
          <aside class="pr-goal" hidden><div class="pr-goal-h"><span class="pr-goal-name">${esc(t('pr.goal'))}</span><span class="pr-goal-state"></span></div><pre class="pr-goal-text"></pre><div class="gd-legend"><span><span class="gd-add">abc</span> ${esc(t('pr.missing'))}</span><span><del class="gd-del">abc</del> ${esc(t('pr.remove'))}</span></div></aside>
        </div>
        <div class="pr-done" hidden></div>
        <div class="pr-log" aria-label="Log"></div>
        <div class="pr-hints" hidden>
          <div class="ph-block"><h4>${esc(t('h.concept'))}</h4><p class="ph-concept"></p></div>
          <div class="ph-block"><h4>${esc(t('h.cmds'))}</h4><div class="ph-cmds"></div></div>
          <div class="ph-block"><h4>${esc(t('h.sol'))}</h4><div class="ph-sol"></div></div>
        </div>
        <div class="pr-foot">
          <div class="pr-actions">
            <button type="button" class="btn ghost" data-act="reset">${esc(t('pr.reset'))}</button>
            <button type="button" class="btn ghost" data-act="hints" aria-expanded="false">${esc(t('pr.hints'))}</button>
          </div>
          <button type="button" class="btn primary" data-act="next">${esc(t('pr.skip'))}</button>
        </div>
      </section>`);
      host.appendChild(this.el);
      this.hintsOpen = !!S.hintsOpen;
      this.view = new EditorView($('.pr-ed', this.el), { onKey: k => this.key(k), decorate: () => this.decorate(), label: t('ed.practice') });
      this.el.addEventListener('click', e => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const act = b.dataset.act;
        if (act === 'reset') { this.load(this.i); this.view.focus(); }
        if (act === 'hints') { this.hintsOpen = !this.hintsOpen; this.renderHints(); }
        if (act === 'cmds') this.showCmds();
        if (act === 'sol') this.showSol();
        if (act === 'next') this.advance();
        if (act === 'step') { this.load(+b.dataset.i); this.view.focus(); }
      });
      this.load(opts.start || 0);
    }

    get v() { return this.ws.active; }
    keyFor(i) { return this.opts.storeKey ? this.opts.storeKey(i) : null; }

    load(i) {
      this.i = i;
      this.ex = this.items[i];
      this.st = VKd.newState();
      this.solved = false;
      this.log = [];
      this.ws = newWorkspace(this.ex);
      const tier = $('.tier', this.el);
      tier.textContent = t('tier.' + this.ex.tier);
      tier.className = 'tier ' + this.ex.tier;
      this.el.classList.toggle('final', this.ex.tier === 'final');
      $('.pr-task', this.el).innerHTML = this.ex.task;
      annotateKbd($('.pr-task', this.el), false);
      $('.pr-done', this.el).hidden = true;
      const gv = this.ex.goalView;
      $('.pr-goal', this.el).hidden = !gv;
      this.el.classList.toggle('has-goal', !!gv);
      $('.pr-goal-name', this.el).textContent = gv && gv.name ? t('pr.goal') + (gv.all && Object.keys(gv.all).length > 1 ? '' : ' · ' + gv.name) + (gv.saved ? ' (' + t('pr.saved') + ')' : '') : t('pr.goal');
      $('.ph-concept', this.el).innerHTML = this.ex.hint || esc(t('h.generic'));
      annotateKbd($('.ph-concept', this.el), false);
      $('.ph-cmds', this.el).innerHTML = `<button type="button" class="btn small ghost" data-act="cmds">${esc(t('h.showCmds'))}</button>`;
      $('.ph-sol', this.el).innerHTML = `<button type="button" class="btn small ghost" data-act="sol">${esc(t('h.showSol'))}</button>`;
      this.renderHints();
      this.renderSteps();
      this.view.opts.showFile = !!this.ex.files;
      this.view.setWorkspace(this.ws);
      this.update();
    }

    renderHints() {
      $('.pr-hints', this.el).hidden = !this.hintsOpen;
      const b = $('[data-act="hints"]', this.el);
      b.textContent = this.hintsOpen ? t('pr.hide') : t('pr.hints');
      b.setAttribute('aria-expanded', String(this.hintsOpen));
    }
    showCmds() {
      const items = describeSolution(this.ex);
      const box = $('.ph-cmds', this.el);
      box.innerHTML = `<div class="chips">${items.map(it => `<span class="chip"><kbd>${specToHtml(it.keys)}</kbd><span>${esc(it.label)}</span></span>`).join('')}</div><p class="ph-note">${esc(t('h.cmdsNote'))}</p>`;
      annotateKbd(box, true);
    }
    showSol() {
      const box = $('.ph-sol', this.el);
      box.innerHTML = `<div class="sol-keys">${keycaps(this.ex.solKeys)}</div>`;
      annotateKbd(box, false);
    }

    renderSteps() {
      const steps = $('.pr-steps', this.el);
      if (this.items.length < 2) { steps.innerHTML = this.opts.heading ? `<span class="pr-heading">${esc(this.opts.heading)}</span>` : ''; return; }
      steps.innerHTML = '<span class="pr-heading">' + esc(t('pr.ex', this.i + 1, this.items.length)) + '</span>' + this.items.map((x, j) => {
        const k = this.keyFor(j);
        const done = k && Store.get(k);
        return `<button type="button" class="step ${x.tier}${j === this.i ? ' now' : ''}${done ? ' done' : ''}" data-act="step" data-i="${j}" title="${esc(t('tier.' + x.tier))}" aria-label="${esc(t('pr.ex', j + 1, this.items.length))}"></button>`;
      }).join('');
    }

    decorate() {
      if (this.ex.type !== 'targets') return null;
      const tg = [];
      this.ex.targets.forEach((p, j) => {
        if (j === this.st.ti) tg.push({ r: p.r, c: p.c, kind: 'tgt' });
        else if (j > this.st.ti) tg.push({ r: p.r, c: p.c, kind: 'tgt-later' });
      });
      return { targets: tg };
    }

    key(k) {
      const v = this.v;
      if (this.solved) {
        if (k === K.CR) this.advance();
        else if (k === 'r' || k === K.BS) this.load(this.i);
        return;
      }
      if (VKd.isBlocked(this.ex, v, k)) { this.view.toast(t('ed.blocked', keyLabel(k))); sound('block'); return; }
      this.ws.feed(k);
      this.st.hist += k;
      this.st.keys++;
      this.log.push(k);
      if (VKd.check(this.ex, this.st, this.ws)) this.solve();
      this.update();
    }

    solve() {
      this.solved = true;
      const keys = this.st.keys, par = this.ex.par;
      const stars = VKd.stars(keys, par);
      const key = this.keyFor(this.i);
      let rec = { prev: null, better: true };
      const rankBefore = stats().rankIdx;
      if (key) rec = Store.record(key, keys, stars);
      const best = rec.prev && !rec.better ? ' · ' + t('pr.bestWas', rec.prev.best) : (rec.prev && rec.better ? ' · ' + t('pr.newBest') : '');
      const last = this.i === this.items.length - 1;
      const msg = stars === 3 ? t('pr.perfect') : stars === 2 ? t('pr.solved') : t('pr.done');
      const d = $('.pr-done', this.el);
      d.innerHTML = `<span class="done-stars s${stars}" aria-label="${stars}/3">${starStr(stars)}</span>
        <span class="done-text"><b>${esc(msg)}</b> ${esc(t('pr.with', keys))}${par ? ' ' + esc(t('pr.goalN', par)) : ''}${esc(best)}</span>
        <span class="done-hint"><kbd>Enter</kbd> ${esc(last ? t('pr.enterFinish') : t('pr.enterNext'))} · <kbd>r</kbd> ${esc(t('pr.again'))}</span>`;
      d.hidden = false;
      this.renderSteps();
      sound('solve');
      burst($('.pr-ed', this.el));
      if (key) {
        const res = checkAchievements();
        if (res.after.rankIdx > rankBefore) setTimeout(() => toast(`<span class="toast-ach">↑</span><span><b>${esc(t('ach.levelUp', res.after.rank))}</b></span>`, 'ach'), 900);
        updateXpChip();
      }
      if (this.opts.onSolve) this.opts.onSolve(this.i, { keys, stars });
    }

    advance() {
      if (this.i < this.items.length - 1) { this.load(this.i + 1); this.view.focus(); }
      else if (this.opts.onFinish) this.opts.onFinish(this.solved);
    }

    update() {
      const v = this.v, ex = this.ex;
      $('.pr-keys b', this.el).textContent = this.st.keys;
      $('.pr-par', this.el).innerHTML = ex.par ? `${esc(t('pr.par'))} <b>≤ ${ex.par}</b>` : '';
      const k = this.keyFor(this.i), rec = k && Store.get(k);
      $('.pr-best', this.el).innerHTML = rec ? `<span class="mini-stars">${starStr(rec.stars)}</span> ${esc(t('pr.best'))} ${rec.best}` : '';
      $('.pr-keys', this.el).classList.toggle('over', !!(ex.par && this.st.keys > ex.par && !this.solved));
      const next = $('[data-act="next"]', this.el);
      next.textContent = this.solved ? (this.i < this.items.length - 1 ? t('pr.next') : (this.opts.finishLabel || t('pr.finish'))) : t('pr.skip');
      next.hidden = !this.solved && this.items.length === 1 && !this.opts.allowSkipSingle;
      const logEl = $('.pr-log', this.el);
      const shown = this.log.slice(-28);
      logEl.innerHTML = shown.length ? keycaps(shown) : `<span class="log-empty">${esc(t('pr.log'))}</span>`;
      const gv = ex.goalView;
      if (gv) {
        const entries = gv.name ? Object.entries(gv.all || { [gv.name]: gv.text }) : [[null, gv.text]];
        let okAll = 0, totalAll = 0, html = '', allSame = true;
        entries.forEach(([name, text], idx) => {
          const goal = text.split('\n');
          let curText;
          if (!name) curText = v.text();
          else if (gv.saved) curText = this.ws.shared.files[name];
          else curText = this.ws.bufferText(name);
          const cur = curText == null ? [] : curText.split('\n');
          let ok = 0;
          if (entries.length > 1) html += (idx ? '\n' : '') + `<span class="gl-file">${esc(name)}</span>\n`;
          html += alignLines(goal, cur).map(p => {
            if (p.type === 'del') return `<span class="gl"><del class="gd-del">${esc(p.c) || ' '}</del></span>`;
            if (p.type === 'pair' && p.g === p.c) { ok++; return `<span class="gl ok">${esc(p.g) || ' '}</span>`; }
            return `<span class="gl diff">${goalDiffHtml(p.g, p.type === 'pair' ? p.c : null)}</span>`;
          }).join('\n');
          okAll += ok; totalAll += goal.length;
          if (!(ok === goal.length && cur.length === goal.length)) allSame = false;
        });
        $('.pr-goal-text', this.el).innerHTML = html;
        $('.pr-goal-state', this.el).textContent = allSame ? (v.mode === 'normal' ? t('pr.reached') : t('pr.pressEsc')) : t('pr.lines', okAll, totalAll);
        $('.pr-goal', this.el).classList.toggle('reached', allSame);
      }
    }
  }

  /* ---------- Gerüst & Navigation ---------- */
  const main = $('#main');
  const sidebar = $('#sidebar');
  let currentLesson = null;
  let drillTimer = null;

  function renderChrome() {
    const nav = $('.topnav');
    const items = [['start', '#start'], ['lessons', '#l-' + (currentLesson || nextLesson().id)], ['challenges', '#challenges'], ['drill', '#zielscheibe'], ['play', '#spielwiese'], ['sheet', '#spickzettel']];
    nav.innerHTML = items.map(([k, h]) => `<a href="${h}" data-nav="${k}">${esc(t('nav.' + k))}</a>`).join('');
    nav.setAttribute('aria-label', 'Navigation');
    $('#menu-btn').setAttribute('aria-label', t('nav.menu'));
    $('#settings-btn').setAttribute('aria-label', t('nav.settings'));
    $('#settings-btn').title = t('nav.settings');
    updateXpChip();
  }
  function updateXpChip() {
    const s = stats();
    const chip = $('#xp-chip');
    const lo = RANKS[s.rankIdx][0], hi = s.nextRank ? s.nextRank[0] : lo;
    const pct = s.nextRank ? Math.round((s.xp - lo) / (hi - lo) * 100) : 100;
    chip.innerHTML = `<span class="xp-lv">${s.rankIdx + 1}</span><span class="xp-txt"><b>${esc(s.rank)}</b><span>${s.xp} XP${s.streak ? ' · ' + esc(t('ach.days', s.streak)) : ''}</span></span><span class="xp-bar"><span style="width:${pct}%"></span></span>`;
    chip.setAttribute('aria-label', t('nav.ach') + ': ' + s.rank + ', ' + s.xp + ' XP');
  }
  function setNav(name) { $$('.topnav a').forEach(a => a.classList.toggle('now', a.dataset.nav === name)); }

  function renderSidebar(activeId) {
    const s = stats();
    const pct = Math.round(s.ex / TOTAL_EX * 100);
    let html = `<div class="sb-progress">
      <div class="sb-ring" style="--p:${pct}"><span>${pct}%</span></div>
      <div>${t('sb.ex', s.ex, TOTAL_EX)}<br><span class="muted">${esc(t('sb.stars', s.stars, s.maxStars))}</span></div>
    </div>`;
    COURSE.forEach((ch, ci) => {
      html += `<div class="sb-ch"><div class="sb-ch-h"><span class="sb-num">${ci + 1}</span>${esc(L(ch.title))}</div><ol>`;
      ch.lessons.forEach(l => {
        const st = lessonStatus(l);
        const state = st.complete ? 'done' : st.done ? 'started' : '';
        html += `<li><a href="#l-${l.id}" class="sb-l ${state}${l.id === activeId ? ' now' : ''}"${l.id === activeId ? ' aria-current="page"' : ''}>
          <span class="sb-dot" aria-hidden="true"></span><span class="sb-t">${esc(L(l.title))}</span>
          <span class="sb-st">${st.complete ? starStr(st.stars) : st.done ? st.done + '/' + st.total : ''}</span></a></li>`;
      });
      html += '</ol></div>';
    });
    html += `<div class="sb-foot" id="sb-foot"><button type="button" class="linkish" data-reset>${esc(t('sb.reset'))}</button></div>`;
    sidebar.innerHTML = html;
  }

  function resetConfirm(box, after) {
    box.innerHTML = `<span>${esc(t('reset.q'))}</span><div class="confirm"><button type="button" class="btn danger small" data-reset-yes>${esc(t('reset.yes'))}</button><button type="button" class="btn ghost small" data-reset-no>${esc(t('reset.no'))}</button></div>`;
    $('[data-reset-yes]', box).addEventListener('click', () => { Store.reset(); toast(esc(t('reset.done'))); after(true); });
    $('[data-reset-no]', box).addEventListener('click', () => after(false));
  }
  sidebar.addEventListener('click', e => {
    if (e.target.closest('[data-reset]')) { resetConfirm($('#sb-foot'), () => route()); return; }
    if (e.target.closest('a')) document.body.classList.remove('nav-open');
  });
  $('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
  $('#settings-btn').addEventListener('click', () => openSettings());

  function route() {
    clearInterval(drillTimer);
    const hash = location.hash.replace(/^#/, '');
    document.body.classList.remove('nav-open');
    currentLesson = null;
    if (hash.startsWith('l-')) {
      const l = LESSONS.find(x => x.id === hash.slice(2));
      if (l) currentLesson = l.id;
    }
    renderChrome();
    renderSidebar(currentLesson);
    if (currentLesson) { setNav('lessons'); renderLesson(LESSONS.find(x => x.id === currentLesson)); }
    else if (hash === 'challenges' || hash.startsWith('c-')) { setNav('challenges'); renderChallenges(hash.startsWith('c-') ? hash.slice(2) : null); }
    else if (hash === 'zielscheibe') { setNav('drill'); renderDrill(); }
    else if (hash === 'spielwiese') { setNav('play'); renderPlayground(); }
    else if (hash === 'spickzettel') { setNav('sheet'); renderCheatsheet(); }
    else if (hash === 'erfolge') { setNav(''); renderAchievements(); }
    else { setNav('start'); renderStart(); }
    annotateKbd(main, false);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- Start ---------- */
  function shortKeys(l) {
    const out = [];
    let width = 0;
    for (const k of l.keys) {
      const spec = k[0].split(' / ')[0].replace(/<C-(.)>/g, '^$1');
      if (spec.length > 6 || /\{/.test(spec)) continue;
      if (width + spec.length > 11 || out.length >= 3) break;
      out.push(k[0].split(' / ')[0]);
      width += spec.length + 1;
    }
    return out;
  }
  function renderStart() {
    const s = stats();
    const nl = nextLesson();
    main.innerHTML = `<div class="page start">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">${esc(t('st.eyebrow', LESSONS.length, CHALLENGES.length))}</p>
          <h1>${esc(t('st.h1'))}</h1>
          <p class="lede">${esc(t('st.lede'))}</p>
          <div class="hero-cta">
            <a class="btn primary" href="#l-${nl.id}">${esc(s.ex ? t('st.continue', nl.num) : t('st.begin'))}</a>
            <a class="btn ghost" href="#spickzettel">${esc(t('st.sheet'))}</a>
          </div>
          <dl class="stats">
            <div><dt>${esc(t('st.lessons'))}</dt><dd>${s.lessons}<small>/${LESSONS.length}</small></dd></div>
            <div><dt>${esc(t('st.stars'))}</dt><dd>${s.stars}<small>/${s.maxStars}</small></dd></div>
            <div><dt>${esc(t('st.ch'))}</dt><dd>${s.ch}<small>/${CHALLENGES.length}</small></dd></div>
            <div><dt>${esc(t('st.xp'))}</dt><dd>${s.xp}<small> XP</small></dd></div>
          </dl>
        </div>
        <div class="hero-try"><p class="try-label">${esc(t('st.try'))}</p><div id="welcome"></div></div>
      </section>
      <section class="chapters">
        <h2>${esc(t('st.course'))}</h2>
        <div class="ch-grid">${COURSE.map((ch, ci) => {
          const st = ch.lessons.map(lessonStatus);
          const done = st.filter(x => x.complete).length;
          return `<article class="ch-card">
            <div class="ch-top"><span class="ch-num">${esc(t('st.chapter', ci + 1))}</span><span class="ch-count">${done}/${ch.lessons.length}</span></div>
            <h3>${esc(L(ch.title))}</h3>
            <div class="bar"><span style="width:${Math.round(done / ch.lessons.length * 100)}%"></span></div>
            <ol>${ch.lessons.map((l, j) => `<li><a href="#l-${l.id}" class="${st[j].complete ? 'done' : st[j].done ? 'started' : ''}"><span class="sb-dot" aria-hidden="true"></span>${esc(L(l.title))}</a> <span class="ch-keys">${shortKeys(l).map(k => `<kbd>${fmtKey(k)}</kbd>`).join('')}</span></li>`).join('')}</ol>
          </article>`;
        }).join('')}
          <article class="ch-card extra">
            <div class="ch-top"><span class="ch-num">${esc(t('st.training'))}</span></div>
            <h3>${esc(t('st.trainH'))}</h3>
            <ul class="extra-list">
              <li><a href="#challenges"><b>${esc(t('nav.challenges'))}</b><span>${esc(t('st.chDesc', CHALLENGES.length))}</span></a></li>
              <li><a href="#zielscheibe"><b>${esc(t('nav.drill'))}</b><span>${esc(t('st.drillDesc'))}</span></a></li>
              <li><a href="#spielwiese"><b>${esc(t('nav.play'))}</b><span>${esc(t('st.playDesc'))}</span></a></li>
            </ul>
          </article>
        </div>
      </section>
    </div>`;
    new Practice($('#welcome'), {
      exercises: [WELCOME], heading: t('st.first'), finishLabel: t('st.toL1'),
      onFinish: () => { location.hash = '#l-' + LESSONS[0].id; }
    });
  }

  /* ---------- Lektion ---------- */
  function keyboardBox(l) {
    const map = kbMap();
    const chars = new Set();
    let specs = l.keys.map(k => k[0]).join(' ');
    l.keys.forEach(k => charsOf(k[0]).forEach(c => chars.add(c)));
    l.ex.forEach(x => { const sol = L(x.sol); if (sol) { specs += ' ' + sol; charsOf(sol).forEach(c => chars.add(c)); } });
    const rows = Array.from(chars).filter(c => map[c]).sort();
    const reserved = S.os !== 'mac' && /<C-[wnt]>/.test(specs);
    if (!rows.length && !reserved) return '';
    const anyDead = rows.some(c => map[c][0] === 'D');
    return `<aside class="kbbox"><h4>${esc(t('kb.title', t('lay.' + S.layout), t('os.' + S.os)))}</h4>
      <div class="kb-grid">${rows.map(c => `<div><kbd data-kb="1">${esc(c)}</kbd><span>${esc(kbHowText(c))}</span></div>`).join('')}</div>
      ${anyDead ? `<p class="muted">${esc(t('kb.dead'))}</p>` : ''}
      ${reserved ? `<p class="kb-note">${esc(t('kb.altNote'))}</p>` : ''}
      <button type="button" class="linkish" data-open-settings>${esc(t('kb.settings'))}</button></aside>`;
  }

  function renderLesson(l) {
    const idx = LESSONS.indexOf(l);
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    const st = lessonStatus(l);
    const startAt = Math.max(0, l.ex.findIndex((e, i) => !Store.data.ex[l.id + ':' + i]));
    const tip = L(l.tip), concept = L(l.concept);
    main.innerHTML = `<article class="page lesson">
      <header class="l-head">
        <p class="eyebrow">${t('l.eyebrow', l.ci + 1, esc(L(l.chapter.title)), l.num, LESSONS.length)}</p>
        <h1>${esc(L(l.title))}</h1>
        <p class="lede">${L(l.intro)}</p>
      </header>
      <section class="l-keys" aria-label="${esc(t('l.cmds'))}">${l.keys.map(k => `<div class="keycard"><kbd>${fmtKey(k[0])}</kbd><span>${esc(L(k[1]))}</span></div>`).join('')}</section>
      <div class="l-learn">
        <div class="prose">${L(l.body)}${tip ? `<p class="tip"><b>${esc(t('l.tip'))}</b> ${tip}</p>` : ''}${concept ? `<div class="concept">${concept}</div>` : ''}</div>
        ${keyboardBox(l)}
      </div>
      <div id="demo"></div>
      <div id="practice"></div>
      <div id="lesson-done" hidden></div>
      <nav class="pager" aria-label="${esc(t('nav.lessons'))}">
        ${prev ? `<a href="#l-${prev.id}" class="pg prev"><small>${esc(t('l.prev'))}</small><span>${esc(L(prev.title))}</span></a>` : '<span></span>'}
        ${next ? `<a href="#l-${next.id}" class="pg next"><small>${esc(t('l.next'))}</small><span>${esc(L(next.title))}</span></a>` : `<a href="#challenges" class="pg next"><small>${esc(t('l.courseDone'))}</small><span>${esc(t('l.toCh'))}</span></a>`}
      </nav>
    </article>`;
    annotateKbd($('.l-keys', main), true);
    const ob = $('[data-open-settings]', main);
    if (ob) ob.addEventListener('click', () => openSettings('kb'));
    if (l.demo) new DemoPlayer($('#demo'), l.demo);
    let wasComplete = st.complete;
    const showDone = celebrate => {
      const s2 = lessonStatus(l);
      const box = $('#lesson-done');
      if (!s2.complete) return;
      box.hidden = false;
      box.innerHTML = `<div class="done-card">
        <span class="done-stars s${s2.stars}">${starStr(s2.stars)}</span>
        <div><h2>${esc(t('l.doneTitle'))}</h2><p>${esc(s2.stars === 3 ? t('l.done3') : t('l.doneMore'))}</p></div>
        ${next ? `<a class="btn primary" href="#l-${next.id}">${esc(t('l.continue', L(next.title)))}</a>` : `<a class="btn primary" href="#challenges">${esc(t('l.toCh'))}</a>`}
      </div>`;
      if (celebrate) { fireworks(); sound('lesson'); }
    };
    const p = new Practice($('#practice'), {
      exercises: l.ex,
      start: st.complete ? 0 : startAt,
      storeKey: i => l.id + ':' + i,
      finishLabel: next ? t('l.nextLesson') : t('l.toCh'),
      allowSkipSingle: true,
      onSolve: () => {
        renderSidebar(l.id);
        const now = lessonStatus(l).complete;
        showDone(now && !wasComplete);
        wasComplete = now;
      },
      onFinish: () => { location.hash = next ? '#l-' + next.id : '#challenges'; }
    });
    showDone(false);
    p.view.focus();
  }

  /* ---------- Challenges ---------- */
  function renderChallenges(activeId) {
    const active = CHALLENGES.find(c => c.id === activeId);
    const lvl = n => `<span class="lvl" aria-label="${esc(t('ch.level', n))}">${'●'.repeat(n)}${'○'.repeat(3 - n)}</span>`;
    main.innerHTML = `<div class="page challenges">
      <header class="l-head"><p class="eyebrow">${esc(t('st.training'))}</p><h1>${esc(t('nav.challenges'))}</h1><p class="lede">${esc(t('ch.lede'))}</p></header>
      <div id="ch-active"></div>
      <div class="cards">${CHALLENGES.map((c, i) => {
        const r = Store.data.ch[c.id];
        const par = VKd.prepare(c, S.lang).par;
        return `<a class="cc${c.id === activeId ? ' now' : ''}${r ? ' done' : ''}" href="#c-${c.id}">
          <span class="cc-top"><span class="cc-num">${String(i + 1).padStart(2, '0')}</span>${lvl(c.level)}</span>
          <b>${esc(L(c.title))}</b><span class="cc-task">${esc(L(c.task))}</span>
          <span class="cc-foot"><span>${esc(t('pr.par'))} ≤ ${par}</span><span>${r ? `<span class="mini-stars">${starStr(r.stars)}</span> ${r.best}` : esc(t('ch.open'))}</span></span>
        </a>`;
      }).join('')}</div>
    </div>`;
    if (!active) return;
    const i = CHALLENGES.indexOf(active), nx = CHALLENGES[i + 1];
    const box = $('#ch-active');
    box.innerHTML = `<div class="ch-active-h"><h2>${esc(L(active.title))}</h2><a class="linkish" href="#challenges">${esc(t('ch.close'))}</a></div>`;
    const p = new Practice(box, {
      exercises: [active], heading: t('ch.of', i + 1, CHALLENGES.length),
      storeKey: () => 'ch:' + active.id,
      finishLabel: nx ? t('ch.next') : t('ch.overview'), allowSkipSingle: true,
      onSolve: () => {
        const card = $(`.cc[href="#c-${active.id}"]`);
        const r = Store.data.ch[active.id];
        if (card && r) { card.classList.add('done'); $('.cc-foot span:last-child', card).innerHTML = `<span class="mini-stars">${starStr(r.stars)}</span> ${r.best}`; }
        if (CHALLENGES.every(c => Store.data.ch[c.id])) fireworks();
      },
      onFinish: () => { location.hash = nx ? '#c-' + nx.id : '#challenges'; }
    });
    p.view.focus();
  }

  /* ---------- Zielscheibe ---------- */
  function renderDrill() {
    const DURATION = 60;
    main.innerHTML = `<div class="page drill">
      <header class="l-head"><p class="eyebrow">${esc(t('st.training'))}</p><h1>${esc(t('nav.drill'))}</h1><p class="lede">${esc(t('dr.lede'))}</p></header>
      <div class="drill-bar">
        <div class="db"><span>${esc(t('dr.time'))}</span><b id="d-time">60,0</b></div>
        <div class="db"><span>${esc(t('dr.hits'))}</span><b id="d-hits">0</b></div>
        <div class="db"><span>${esc(t('dr.eff'))}</span><b id="d-eff">–</b></div>
        <div class="db"><span>${esc(t('dr.best'))}</span><b id="d-best">${Store.data.drill || 0}</b></div>
      </div>
      <div class="drill-meter"><span id="d-bar"></span></div>
      <div id="d-ed"></div>
      <div class="drill-foot"><p id="d-msg" class="muted"></p><button type="button" class="btn primary" id="d-new">${esc(t('dr.new'))}</button></div>
    </div>`;
    const dec = S.lang === 'de' ? ',' : '.';
    let ws, target, hits, keys, startT, running, over;
    const view = new EditorView($('#d-ed'), {
      label: t('nav.drill'),
      decorate: () => target ? { targets: [{ r: target.r, c: target.c, kind: 'tgt' }] } : null,
      onKey: k => {
        if (over) { if (k === K.CR) reset(); return; }
        if (!running) { running = true; startT = performance.now(); drillTimer = setInterval(tick, 100); }
        ws.feed(k); keys++;
        const v = ws.active;
        if (v.mode === 'normal' && v.r === target.r && v.c === target.c) { hits++; sound('solve'); pick(); }
        showStats();
      }
    });
    const cells = [];
    DRILL_TEXT.split('\n').forEach((line, r) => { for (let c = 0; c < line.length; c++) if (line[c] !== ' ') cells.push({ r, c }); });
    function pick() {
      let tg;
      do { tg = cells[Math.floor(Math.random() * cells.length)]; } while (target && Math.abs(tg.r - ws.active.r) + Math.abs(tg.c - ws.active.c) < 6);
      target = tg;
    }
    function showStats() {
      $('#d-hits').textContent = hits;
      $('#d-eff').textContent = hits ? (keys / hits).toFixed(1).replace('.', dec) : '–';
    }
    function tick() {
      const left = Math.max(0, DURATION - (performance.now() - startT) / 1000);
      $('#d-time').textContent = left.toFixed(1).replace('.', dec);
      $('#d-bar').style.width = (left / DURATION * 100) + '%';
      if (left <= 0) finish();
    }
    function finish() {
      clearInterval(drillTimer);
      over = true; running = false;
      const best = Store.data.drill || 0;
      const rec = hits > best;
      if (rec) { Store.data.drill = hits; Store.touchDay(); Store.save(); $('#d-best').textContent = hits; fireworks(); }
      $('#d-msg').innerHTML = t('dr.over', hits, rec, best);
      target = null; view.render();
      checkAchievements(); updateXpChip();
    }
    function reset() {
      clearInterval(drillTimer);
      ws = newWorkspace({ text: DRILL_TEXT, start: { r: 0, c: 0 }, height: 13 });
      hits = 0; keys = 0; running = false; over = false; target = null;
      pick();
      view.setWorkspace(ws);
      $('#d-time').textContent = '60' + dec + '0';
      $('#d-bar').style.width = '100%';
      $('#d-msg').textContent = t('dr.start');
      showStats();
      view.focus();
    }
    $('#d-new').addEventListener('click', reset);
    reset();
  }

  /* ---------- Spielwiese ---------- */
  const SAMPLE = {
    de: ['# Spielwiese', '', 'Hier kannst du alles ausprobieren, was du gelernt hast.', 'Nichts wird bewertet, nichts kann kaputtgehen. Mit u machst du alles rückgängig.', ''],
    en: ['# Playground', '', 'Try out everything you have learned here.', 'Nothing is graded and nothing can break. u undoes everything.', '']
  };
  const SAMPLE_CODE = ['function greeting(name, language) {', '    const texts = {', '        de: "Hallo",', '        en: "Hello",', '        fr: "Bonjour",', '    };', '    return `${texts[language]}, ${name}!`;', '}', '',
    'const guests = ["Ada", "Linus", "Grace", "Bram"];', 'for (const guest of guests) {', '    console.log(greeting(guest, "de"));', '}', '', '<ul class="list">', '    <li>One</li>', '    <li>Two</li>', '    <li>Three</li>', '</ul>'];
  const sampleText = () => SAMPLE[S.lang].concat(SAMPLE_CODE).join('\n');

  function renderPlayground() {
    main.innerHTML = `<div class="page playground">
      <header class="l-head"><p class="eyebrow">${esc(t('st.training'))}</p><h1>${esc(t('nav.play'))}</h1><p class="lede">${esc(t('pg.lede'))}</p></header>
      <div class="pg-grid">
        <div id="pg-ed"></div>
        <aside class="pg-side">
          <section><h3>${esc(t('pg.opts'))}</h3>
            <label class="check"><input type="checkbox" id="pg-rnu"> ${esc(t('pg.rnu'))}</label>
            <label class="check"><input type="checkbox" id="pg-hls" checked> ${esc(t('pg.hls'))}</label>
            <label class="check"><input type="checkbox" id="pg-ic"> ${esc(t('pg.ic'))}</label>
          </section>
          <section><h3>${esc(t('pg.regs'))}</h3><div id="pg-regs" class="pg-table"></div></section>
          <section><h3>${esc(t('pg.marks'))}</h3><div id="pg-marks" class="pg-table"></div></section>
          <section><h3>${esc(t('pg.last'))}</h3><div id="pg-last" class="pg-table"></div></section>
          <section><h3>${esc(t('pg.bufs'))}</h3><div id="pg-bufs" class="pg-table"></div><p class="muted small">${esc(t('pg.vimrcNote'))}</p></section>
        </aside>
      </div>
      <div class="pg-tools">
        <button type="button" class="btn ghost" id="pg-sample">${esc(t('pg.sample'))}</button>
        <button type="button" class="btn ghost" id="pg-clear">${esc(t('pg.clear'))}</button>
        <details class="pg-own"><summary>${esc(t('pg.own'))}</summary>
          <label for="pg-own" class="muted">${esc(t('pg.ownHint'))}</label>
          <textarea id="pg-own" rows="6" spellcheck="false"></textarea>
          <button type="button" class="btn primary small" id="pg-load">${esc(t('pg.load'))}</button>
        </details>
      </div>
    </div>`;
    const notesName = S.lang === 'en' ? 'playground.txt' : 'spielwiese.txt';
    const vimrc = typeof S.vimrc === 'string' ? S.vimrc : t('pg.vimrcDefault');
    let ws;
    const boot = text => {
      ws = newWorkspace({ files: { order: [notesName, '.vimrc'], map: { [notesName]: text, '.vimrc': vimrc } }, start: { r: 0, c: 0 }, height: 18 });
      const a = ws.active;
      a.ex('so .vimrc'); a.exLog.length = 0; a.message = null; a.list = null;
    };
    boot(sampleText());
    const view = new EditorView($('#pg-ed'), { label: t('nav.play'), showFile: true, onKey: k => {
      ws.feed(k);
      const saved = ws.shared.files['.vimrc'];
      if (saved !== undefined && saved !== S.vimrc) { S.vimrc = saved; Settings.save(); }
      side();
    } });
    view.setWorkspace(ws);
    const side = () => {
      const v = ws.active;
      const rows = [];
      ['"', '0', '1', '2', '3', '-'].concat('abcdefghijklmnopqrstuvwxyz'.split('')).forEach(r => { if (v.regs[r]) rows.push(`<div><kbd>"${esc(r)}</kbd><code>${esc(v.regs[r].text.replace(/\n/g, '⏎').slice(0, 48)) || '∅'}</code></div>`); });
      $('#pg-regs').innerHTML = rows.join('') || `<p class="muted">${t('pg.regsEmpty')}</p>`;
      const marks = Object.keys(v.marks).filter(k => /[a-zA-Z]/.test(k)).sort();
      $('#pg-marks').innerHTML = marks.map(k => `<div><kbd>${k}</kbd><code>${esc(t('pg.mark', v.marks[k].r + 1, v.marks[k].c + 1))}</code></div>`).join('') || `<p class="muted">${t('pg.marksEmpty')}</p>`;
      const last = [];
      if (v.dot) last.push(`<div><kbd>.</kbd><code>${esc(Vim.toNotation(v.dot))}</code></div>`);
      if (v.lastEx) last.push(`<div><kbd>:</kbd><code>${esc(v.lastEx)}</code></div>`);
      if (v.lastSearch) last.push(`<div><kbd>/</kbd><code>${esc(v.lastSearch.src)}</code></div>`);
      $('#pg-last').innerHTML = last.join('') || `<p class="muted">${esc(t('pg.lastEmpty'))}</p>`;
      $('#pg-bufs').innerHTML = ws.shared.buffers.map(b => `<div><kbd>${b.id}</kbd><code>${esc(b.name)}${b.modified ? ' [+]' : ''}${b === v.buf ? ' ●' : ''}</code></div>`).join('');
      $('#pg-rnu').checked = v.o.relativenumber;
      $('#pg-hls').checked = v.o.hlsearch;
      $('#pg-ic').checked = v.o.ignorecase;
    };
    const load = text => { boot(text); view.setWorkspace(ws); side(); view.focus(); };
    $('#pg-rnu').addEventListener('change', e => { ws.shared.o.relativenumber = e.target.checked; view.render(); });
    $('#pg-hls').addEventListener('change', e => { ws.shared.o.hlsearch = e.target.checked; view.render(); });
    $('#pg-ic').addEventListener('change', e => { ws.shared.o.ignorecase = e.target.checked; });
    $('#pg-sample').addEventListener('click', () => load(sampleText()));
    $('#pg-clear').addEventListener('click', () => load(''));
    $('#pg-load').addEventListener('click', () => { const tx = $('#pg-own').value; if (tx) load(tx); });
    side();
    view.focus();
  }

  /* ---------- Spickzettel ---------- */
  function renderCheatsheet() {
    main.innerHTML = `<div class="page cheatsheet">
      <header class="l-head">
        <p class="eyebrow">${esc(t('cs.eyebrow'))}</p><h1>${esc(t('nav.sheet'))}</h1><p class="lede">${esc(t('cs.lede'))}</p>
        <div class="search"><label for="cs-q" class="sr">${esc(t('cs.searchLabel'))}</label><input type="search" id="cs-q" placeholder="${esc(t('cs.search'))}" autocomplete="off"></div>
      </header>
      <div class="cs-grid">${COURSE.map((ch, ci) => `<section class="cs-ch"><h2><span>${ci + 1}</span>${esc(L(ch.title))}</h2>${ch.lessons.map(l => `
        <div class="cs-l"><h3><a href="#l-${l.id}">${esc(L(l.title))}</a></h3><dl>${l.keys.map(k => `<div class="cs-row" data-s="${esc((k[0] + ' ' + L(k[1]) + ' ' + L(l.title)).toLowerCase())}"><dt><kbd>${fmtKey(k[0])}</kbd></dt><dd>${esc(L(k[1]))}</dd></div>`).join('')}</dl></div>`).join('')}</section>`).join('')}
      </div>
      <p class="cs-empty muted" hidden>${esc(t('cs.empty'))}</p>
    </div>`;
    annotateKbd($('.cs-grid', main), true);
    const q = $('#cs-q');
    q.addEventListener('input', () => {
      const s = q.value.trim().toLowerCase();
      let any = false;
      $$('.cs-row').forEach(r => { const hit = !s || r.dataset.s.includes(s); r.hidden = !hit; any = any || hit; });
      $$('.cs-l').forEach(x => { x.hidden = !$$('.cs-row', x).some(r => !r.hidden); });
      $$('.cs-ch').forEach(c => { c.hidden = !$$('.cs-l', c).some(x => !x.hidden); });
      $('.cs-empty').hidden = any;
    });
  }

  /* ---------- Erfolge ---------- */
  function renderAchievements() {
    const s = stats();
    const lo = RANKS[s.rankIdx][0];
    const pct = s.nextRank ? Math.round((s.xp - lo) / (s.nextRank[0] - lo) * 100) : 100;
    main.innerHTML = `<div class="page achievements">
      <header class="l-head"><p class="eyebrow">${esc(t('ach.eyebrow'))}</p><h1>${esc(t('nav.ach'))}</h1><p class="lede">${esc(t('ach.lede'))}</p></header>
      <section class="rank-card">
        <div class="rank-badge"><span>${s.rankIdx + 1}</span></div>
        <div class="rank-info"><p class="eyebrow">${esc(t('ach.rank'))}</p><h2>${esc(s.rank)}</h2>
          <div class="bar big"><span style="width:${pct}%"></span></div>
          <p class="muted">${s.xp} XP · ${esc(s.nextRank ? t('ach.next', s.nextRank[0] - s.xp, s.nextRank[1 + li()]) : t('ach.max'))}</p></div>
        <div class="rank-streak"><b>${s.streak}</b><span>${esc(t('ach.streak'))}</span></div>
      </section>
      <section class="ach-sec"><h2>${esc(t('ach.list'))} <span class="muted">${s.achCount}/${ACH.length}</span></h2>
        <div class="ach-grid">${ACH.map(a => {
          const got = Store.data.ach[a.id];
          return `<div class="ach${got ? ' got' : ''}"><span class="ach-ic">${esc(a.icon)}</span><div><b>${esc(a.name[li()])}</b><span>${esc(a.desc[li()])}</span></div></div>`;
        }).join('')}</div>
      </section>
    </div>`;
  }

  /* ---------- Einstellungen ---------- */
  let modalOpen = null;
  function openModal(html, onMount, cls) {
    closeModal();
    const m = el(`<div class="modal-wrap" role="dialog" aria-modal="true"><div class="modal ${cls || ''}">${html}</div></div>`);
    document.body.appendChild(m);
    modalOpen = m;
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(); });
    if (onMount) onMount($('.modal', m));
    const f = $('button, select, input', m);
    if (f) f.focus();
  }
  function closeModal() { if (modalOpen) { modalOpen.remove(); modalOpen = null; } }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOpen && !e.defaultPrevented) closeModal(); });

  const opt = (val, cur, label) => `<option value="${val}"${val === cur ? ' selected' : ''}>${esc(label)}</option>`;
  function kbPreview() {
    const map = kbMap();
    const keys = ['{', '}', '[', ']', '(', ')', '\\', '|', '~', '^', '`', '@', '/', ':', '"', "'", '$', '%', '<', '>'].filter(c => map[c]);
    if (!keys.length) return `<p class="muted">${esc(t('set.kbNone'))}</p>`;
    return `<p class="muted">${esc(t('set.kbPreview'))}</p><div class="kb-grid">${keys.map(c => `<div><kbd data-kb="1">${esc(c)}</kbd><span>${esc(kbHowText(c))}</span></div>`).join('')}</div>`;
  }
  function settingsHtml() {
    const seg = (name, val, opts) => `<div class="seg" role="radiogroup">${opts.map(([v, lab]) => `<button type="button" role="radio" aria-checked="${v === val}" data-set="${name}" data-val="${v}">${esc(lab)}</button>`).join('')}</div>`;
    return `<header class="modal-h"><h2>${esc(t('set.title'))}</h2><button type="button" class="btn ghost small" data-close>${esc(t('set.close'))}</button></header>
      <div class="modal-body">
        <section><h3>${esc(t('set.lang'))}</h3>${seg('lang', S.lang, [['de', 'Deutsch'], ['en', 'English']])}</section>
        <section><h3>${esc(t('set.look'))}</h3>
          <label class="field"><span>${esc(t('set.theme'))}</span>${seg('theme', S.theme, [['system', t('set.system')], ['light', t('set.light')], ['dark', t('set.dark')]])}</label>
          <div class="field"><span>${esc(t('set.accent'))}</span><div class="swatches">${Object.keys(ACCENTS).map(a => `<button type="button" class="sw${a === S.accent ? ' on' : ''}" data-set="accent" data-val="${a}" style="--c:${ACCENTS[a].l[0]};--c2:${ACCENTS[a].d[0]}" aria-label="${esc(t('acc.' + a))}" title="${esc(t('acc.' + a))}"></button>`).join('')}</div></div>
          <label class="field"><span>${esc(t('set.fontUi'))}</span><select data-sel="fontUi">${Object.keys(FONTS.ui).map(k => opt(k, S.fontUi, FONTS.ui[k][1])).join('')}</select></label>
          <label class="field"><span>${esc(t('set.fontHead'))}</span><select data-sel="fontHead">${Object.keys(FONTS.head).map(k => opt(k, S.fontHead, FONTS.head[k][1] || (S.lang === 'en' ? 'Same as text' : 'Wie Text'))).join('')}</select></label>
          <label class="field"><span>${esc(t('set.fontMono'))}</span><select data-sel="fontMono">${Object.keys(FONTS.mono).map(k => opt(k, S.fontMono, FONTS.mono[k][1])).join('')}</select></label>
          <label class="field"><span>${esc(t('set.edSize'))} <b id="ed-size-val">${S.edSize}px</b></span><input type="range" min="12" max="20" step="1" value="${S.edSize}" data-range="edSize"></label>
          <div class="font-preview"><span class="fp-h">Vim</span> <span class="fp-b">Vimsical · ${esc(t('st.h1'))}</span> <code>ciw dap :%s/a/b/g</code></div>
        </section>
        <section id="set-kb"><h3>${esc(t('set.kb'))}</h3>
          <label class="field"><span>${esc(t('set.os'))}</span>${seg('os', S.os, [['mac', t('os.mac')], ['win', t('os.win')], ['linux', t('os.linux')]])}</label>
          <label class="field"><span>${esc(t('set.layout'))}</span>${seg('layout', S.layout, [['de', t('lay.de')], ['us', t('lay.us')], ['uk', t('lay.uk')]])}</label>
          <div class="kb-preview">${kbPreview()}</div>
        </section>
        <section><h3>${esc(t('set.learn'))}</h3>
          <label class="check"><input type="checkbox" data-chk="blink"${S.blink !== false ? ' checked' : ''}> ${esc(t('set.blink'))}</label>
          <label class="check"><input type="checkbox" data-chk="hintsOpen"${S.hintsOpen ? ' checked' : ''}> ${esc(t('set.hintsOpen'))}</label>
          <label class="check"><input type="checkbox" data-chk="sound"${S.sound ? ' checked' : ''}> ${esc(t('set.sound'))}</label>
          <label class="check"><input type="checkbox" data-chk="effects"${S.effects ? ' checked' : ''}> ${esc(t('set.effects'))}</label>
        </section>
        <section><h3>${esc(t('set.progress'))}</h3>
          <p class="muted">${esc(t('set.progressNote'))}</p>
          <div class="row-btns">
            <button type="button" class="btn ghost small" data-act="export">${esc(t('set.export'))}</button>
            <label class="btn ghost small file-btn">${esc(t('set.import'))}<input type="file" accept="application/json,.json" data-act="importfile"></label>
            <button type="button" class="btn ghost small" data-act="reset">${esc(t('set.reset'))}</button>
          </div>
          <div class="io-box" id="io-box"></div>
        </section>
      </div>`;
  }
  function openSettings(focus) {
    openModal(settingsHtml(), m => {
      if (focus === 'kb') { const kb = $('#set-kb', m); if (kb) kb.scrollIntoView(); }
      m.addEventListener('click', e => {
        const b = e.target.closest('[data-set]');
        if (b) { S[b.dataset.set] = b.dataset.val; commit(); return; }
        const a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'export') doExport($('#io-box', m));
        if (a.dataset.act === 'reset') resetConfirm($('#io-box', m), done => { if (done) { updateXpChip(); route(); } $('#io-box', m) && ($('#io-box', m).innerHTML = ''); });
      });
      m.addEventListener('change', e => {
        const s = e.target.closest('[data-sel]'), c = e.target.closest('[data-chk]'), f = e.target.closest('[data-act="importfile"]');
        if (s) { S[s.dataset.sel] = s.value; commit(); }
        if (c) { S[c.dataset.chk] = c.checked; Settings.save(); applyTheme(); }
        if (f && f.files[0]) { const rd = new FileReader(); rd.onload = () => doImport(rd.result, $('#io-box', m)); rd.readAsText(f.files[0]); }
      });
      m.addEventListener('input', e => {
        const r = e.target.closest('[data-range]');
        if (r) { S.edSize = +r.value; $('#ed-size-val', m).textContent = S.edSize + 'px'; Settings.save(); applyTheme(); }
      });
    }, 'settings');
    function commit() {
      const scrolled = modalOpen ? $('.modal-body', modalOpen).scrollTop : 0;
      Settings.save(); applyTheme(); route();
      openSettings();
      if (modalOpen) $('.modal-body', modalOpen).scrollTop = scrolled;
    }
  }
  function doExport(box) {
    const data = JSON.stringify({ app: 'vimsical', version: 2, saved: new Date().toISOString(), progress: Store.data, settings: S }, null, 1);
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      a.download = 'vimsical-fortschritt-' + today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { /* Download nicht möglich, Text bleibt sichtbar */ }
    box.innerHTML = `<p class="muted">${esc(t('set.exported'))}</p><textarea id="io-text" rows="4" readonly spellcheck="false">${esc(data)}</textarea><button type="button" class="btn ghost small" id="io-copy">${esc(t('set.copy'))}</button>`;
    $('#io-copy', box).addEventListener('click', () => {
      const ta = $('#io-text', box);
      const ok = () => toast(esc(t('set.copied')));
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(ok, () => { ta.select(); });
      else ta.select();
    });
    box.insertAdjacentHTML('beforeend', `<p class="muted">${esc(t('set.importPaste'))}</p><textarea id="io-paste" rows="3" spellcheck="false"></textarea><button type="button" class="btn ghost small" id="io-load">${esc(t('set.importDo'))}</button>`);
    $('#io-load', box).addEventListener('click', () => doImport($('#io-paste', box).value, box));
  }
  function doImport(text, box) {
    try {
      const d = JSON.parse(text);
      if (!d || !/^(vimsical|normalmodus)$/.test(d.app) || !d.progress) throw new Error('bad');
      Store.data = Object.assign(emptyProgress(), d.progress);
      Store.save();
      if (d.settings) { Object.assign(S, d.settings, { onboarded: true }); Settings.save(); applyTheme(); }
      toast(esc(t('set.imported')));
      closeModal(); route();
    } catch (e) { if (box) box.innerHTML = `<p class="err">${esc(t('set.importBad'))}</p>`; }
  }

  function openOnboarding() {
    const render = () => {
      const seg = (name, val, opts) => `<div class="seg" role="radiogroup">${opts.map(([v, lab]) => `<button type="button" role="radio" aria-checked="${v === val}" data-set="${name}" data-val="${v}">${esc(lab)}</button>`).join('')}</div>`;
      return `<div class="ob">
        <div class="ob-logo">${(document.querySelector('.brand-logo') || { outerHTML: '' }).outerHTML}</div>
        <h2>${esc(t('ob.title'))}</h2><p class="muted">${esc(t('ob.lede'))}</p>
        <label class="field"><span>${esc(t('set.lang'))}</span>${seg('lang', S.lang, [['de', 'Deutsch'], ['en', 'English']])}</label>
        <label class="field"><span>${esc(t('set.os'))}</span>${seg('os', S.os, [['mac', t('os.mac')], ['win', t('os.win')], ['linux', t('os.linux')]])}</label>
        <label class="field"><span>${esc(t('set.layout'))}</span>${seg('layout', S.layout, [['de', t('lay.de')], ['us', t('lay.us')], ['uk', t('lay.uk')]])}</label>
        <div class="field"><span>${esc(t('set.accent'))}</span><div class="swatches">${Object.keys(ACCENTS).map(a => `<button type="button" class="sw${a === S.accent ? ' on' : ''}" data-set="accent" data-val="${a}" style="--c:${ACCENTS[a].l[0]};--c2:${ACCENTS[a].d[0]}" aria-label="${esc(t('acc.' + a))}"></button>`).join('')}</div></div>
        <button type="button" class="btn primary ob-go" data-go>${esc(t('ob.go'))}</button>
      </div>`;
    };
    openModal(render(), m => {
      m.addEventListener('click', e => {
        const b = e.target.closest('[data-set]');
        if (b) { S[b.dataset.set] = b.dataset.val; Settings.save(); applyTheme(); m.innerHTML = render(); renderChrome(); return; }
        if (e.target.closest('[data-go]')) { S.onboarded = true; Settings.save(); closeModal(); route(); }
      });
    }, 'onboard');
  }

  /* ---------- Start ---------- */
  applyTheme();
  route();
  if (!S.onboarded) openOnboarding();
})();
