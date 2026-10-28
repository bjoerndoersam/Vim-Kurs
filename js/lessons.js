/* Normalmodus · Kursinhalte
   Markierungen im Übungstext: ¶ = Startposition des Cursors, ◊ = Ziel (vor dem Zielzeichen). */
(function (root) {
  'use strict';

  const PHRASES = [
    'Vim startet im Normalmodus.', 'Jede Taste ist ein Befehl.', 'Esc bringt dich immer zurück.',
    'Operator plus Bewegung ergibt eine Aktion.', 'Zahlen wiederholen Befehle.', 'Der Punkt wiederholt die letzte Änderung.',
    'Textobjekte sparen Tastendrücke.', 'Register merken sich Text.', 'Makros erledigen Fleißarbeit.', 'Übung macht den Meister.'
  ];
  function gen(n, prefix, marks) {
    const out = [];
    for (let i = 0; i < n; i++) out.push((marks[i] || '') + prefix + ' ' + (i + 1) + ' · ' + PHRASES[i % PHRASES.length]);
    return out.join('\n');
  }

  const COURSE = [
    {
      id: 'grundlagen', title: 'Erste Schritte', lessons: [
        {
          id: 'modi', title: 'Modi verstehen',
          intro: 'Vim ist ein modaler Editor. Dieselbe Taste tut je nach Modus etwas völlig anderes.',
          keys: [['i', 'Einfügemodus vor dem Cursor'], ['<Esc>', 'Zurück in den Normalmodus'], [':', 'Befehlszeile öffnen'], ['<CR>', 'Befehl in der Befehlszeile ausführen']],
          body: `<p>Im <b>Normalmodus</b> sind Tasten Befehle: Du bewegst dich, löschst, kopierst und änderst Text. Im <b>Einfügemodus</b> tippst du wie in jedem anderen Editor. Über die <b>Befehlszeile</b> mit <kbd>:</kbd> gibst du längere Befehle ein, etwa zum Speichern oder Ersetzen.</p>
<p>Die Statuszeile unten im Editor zeigt dir jederzeit, in welchem Modus du bist. Gewöhn dir an, nach jeder Eingabe sofort <kbd>Esc</kbd> zu drücken. Der Normalmodus ist dein Zuhause.</p>`,
          tip: '<kbd>Ctrl-[</kbd> wirkt genau wie <kbd>Esc</kbd> und liegt näher an der Grundreihe.',
          ex: [
            { task: 'Füge vor dem Punkt das Wort „Vim“ ein und kehre mit <kbd>Esc</kbd> in den Normalmodus zurück.', text: 'Ich lerne ¶.', goal: 'Ich lerne Vim.', sol: 'iVim<Esc>' },
            { task: 'Ergänze das fehlende Wort „ein“ samt Leerzeichen.', text: 'Das ist ¶Editor.', goal: 'Das ist ein Editor.', sol: 'iein <Esc>' },
            { task: 'Die berühmteste Vim-Frage: Wie kommt man wieder raus? Tippe <kbd>:q</kbd> und drücke <kbd>Enter</kbd>.', text: '¶Hier kommst du nur mit einem Befehl wieder raus.', expect: '^(q|quit|wq|x|q!|qa|qa!|wq!)$', sol: ':q<CR>' }
          ]
        },
        {
          id: 'hjkl', title: 'Cursor bewegen',
          intro: 'Die vier wichtigsten Tasten liegen direkt unter deiner rechten Hand.',
          keys: [['h', 'Ein Zeichen nach links'], ['j', 'Eine Zeile nach unten'], ['k', 'Eine Zeile nach oben'], ['l', 'Ein Zeichen nach rechts']],
          body: `<p>Statt zu den Pfeiltasten zu greifen, bleibt deine Hand auf der Grundreihe. <kbd>h</kbd> liegt links, <kbd>l</kbd> rechts. Merkhilfe: Das <kbd>j</kbd> hat unten einen Haken und zeigt nach unten.</p>
<p>In den Übungen leuchten <span class="demo-target">Ziele</span> auf. Bewege den Cursor auf das aktuelle Ziel, dann erscheint das nächste. Die Pfeiltasten sind in dieser Lektion gesperrt.</p>`,
          tip: 'Beim Wechsel zwischen unterschiedlich langen Zeilen merkt sich Vim die gewünschte Spalte.',
          ex: [
            { task: 'Erreiche die beiden Ziele nur mit <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd>.', text: '¶Bewege den Cursor\nmit h, j, k und l\nzu den ◊markierten\nFeldern im ◊Text.', block: '←↑→↓', sol: 'jjllllllljllll' },
            { task: 'Sammle alle Ziele auf dem Raster ein.', text: '¶. . . . . . . .\n. . . . . ◊. .\n. ◊. . . . . .\n. . . . . . . ◊.\n◊. . . . . . . .', block: '←↑→↓', sol: 'j' + 'l'.repeat(10) + 'j' + 'h'.repeat(8) + 'j' + 'l'.repeat(12) + 'j' + 'h'.repeat(14) }
          ]
        },
        {
          id: 'woerter', title: 'Wortweise springen',
          intro: 'Zeichen für Zeichen ist langsam. Springe lieber ganze Wörter.',
          keys: [['w', 'Anfang des nächsten Wortes'], ['b', 'Anfang des vorherigen Wortes'], ['e', 'Ende des Wortes']],
          body: `<p>Ein <b>Wort</b> besteht in Vim aus Buchstaben, Ziffern und Unterstrichen. Satzzeichen wie <code>.</code>, <code>(</code> oder <code>,</code> bilden jeweils eigene Wörter. Deshalb hält <kbd>w</kbd> in <code>foo.bar(baz)</code> ganze fünfmal an.</p>
<p><kbd>w</kbd> und <kbd>b</kbd> springen an Wortanfänge, <kbd>e</kbd> ans Wortende. In diesen Übungen sind <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd> gesperrt.</p>`,
          ex: [
            { task: 'Springe mit <kbd>w</kbd> von Wort zu Wort.', text: '¶Das ◊ist ◊ein ◊Satz ◊mit ◊vielen ◊Wörtern.', block: 'hjkl', sol: 'wwwwww' },
            { task: 'Springe mit <kbd>e</kbd> an jedes Wortende.', text: '¶Spring◊e an◊s End◊e jede◊s Worte◊s', block: 'hjkl', sol: 'eeeee' },
            { task: 'Jetzt rückwärts mit <kbd>b</kbd>.', text: '◊Zurück ◊geht ◊es ◊mit ¶b', order: 'reverse', block: 'hjkl', sol: 'bbbb' },
            { task: 'Satzzeichen sind eigene Wörter. Springe mit <kbd>w</kbd> durch den Code.', text: '¶foo◊.◊bar◊(◊baz◊, ◊42◊);', block: 'hjkl', sol: 'wwwwwww' }
          ]
        },
        {
          id: 'worte-gross', title: 'WORTE und ge',
          intro: 'Großbuchstaben machen Wortsprünge größer: Ein WORT reicht bis zum nächsten Leerzeichen.',
          keys: [['W', 'Anfang des nächsten WORTES'], ['B', 'Anfang des vorherigen WORTES'], ['E', 'Ende des WORTES'], ['ge', 'Ende des vorherigen Wortes'], ['gE', 'Ende des vorherigen WORTES']],
          body: `<p>Ein <b>WORT</b> ist alles zwischen Leerzeichen. <code>user@mail.de</code> ist ein einziges WORT, aber fünf Wörter. Mit <kbd>W</kbd>, <kbd>B</kbd> und <kbd>E</kbd> überspringst du URLs, Pfade und verkettete Ausdrücke in einem Satz.</p>
<p><kbd>ge</kbd> ist das Gegenstück zu <kbd>e</kbd>: Es springt rückwärts ans Ende des vorherigen Wortes.</p>`,
          ex: [
            { task: 'Springe mit <kbd>W</kbd> über die zusammengesetzten Ausdrücke.', text: '¶user@mail.de ◊schrieb: ◊foo-bar ◊ist ◊(fast) ◊fertig.', block: 'hjklwbe', sol: 'WWWWW' },
            { task: 'Springe mit <kbd>E</kbd> an das Ende jedes WORTES.', text: '¶ein-wor◊t zwei.wor◊t drei/wor◊t', block: 'hjklwbe', sol: 'EEE' },
            { task: 'Rückwärts mit <kbd>B</kbd>.', text: '◊http://vim.org ◊ist ◊die ◊Heimat ◊von ¶Vim', order: 'reverse', block: 'hjklwbe', sol: 'BBBBB' },
            { task: 'Springe mit <kbd>ge</kbd> rückwärts an die Wortenden.', text: 'Ein◊s zwe◊i dre◊i ¶vier', order: 'reverse', block: 'hjklwbe', sol: 'gegege' }
          ]
        },
        {
          id: 'zeile', title: 'Anfang und Ende der Zeile',
          intro: 'Drei Tasten bringen dich sofort an die Ränder einer Zeile.',
          keys: [['0', 'Erste Spalte der Zeile'], ['^', 'Erstes Zeichen, das kein Leerzeichen ist'], ['$', 'Letztes Zeichen der Zeile']],
          body: `<p><kbd>0</kbd> springt in die allererste Spalte, <kbd>^</kbd> zum ersten echten Zeichen nach der Einrückung. <kbd>$</kbd> landet auf dem letzten Zeichen. Bei eingerücktem Code ist <kbd>^</kbd> meist das, was du willst.</p>
<p>Die Zeichen kennst du aus regulären Ausdrücken: <code>^</code> steht für den Anfang, <code>$</code> für das Ende.</p>`,
          tip: 'Auf deutschen Tastaturen ist <kbd>^</kbd> eine Tottaste. Drücke danach die Leertaste, damit das Zeichen ankommt.',
          ex: [
            { task: 'Erreiche die Ziele mit <kbd>$</kbd>, <kbd>0</kbd> und <kbd>^</kbd>. Für den Zeilenwechsel ist <kbd>j</kbd> erlaubt.', text: '¶    const name = "Vim";\n    const version = 9◊;\n◊    let modus = "normal";\n    ◊return modus;', block: 'hlwbeWBE', sol: 'j$j0j^' },
            { task: 'Erst ganz an den Anfang, dann ans Ende.', text: '◊   ¶mitten im Text, am Rand ist das Ziel◊.', block: 'hlwbeWBE', sol: '0$' }
          ]
        },
        {
          id: 'finden', title: 'Zeichen finden',
          intro: 'Springe direkt zu einem bestimmten Zeichen in der Zeile.',
          keys: [['f{z}', 'Zum nächsten Zeichen z'], ['F{z}', 'Zum vorherigen Zeichen z'], ['t{z}', 'Bis vor das nächste Zeichen z'], ['T{z}', 'Bis hinter das vorherige Zeichen z'], [';', 'Letzte Suche wiederholen'], [',', 'Letzte Suche rückwärts wiederholen']],
          body: `<p><kbd>f</kbd> steht für <i>find</i>: <kbd>fx</kbd> springt auf das nächste <code>x</code> in der Zeile. <kbd>t</kbd> steht für <i>till</i> und hält ein Zeichen davor an. Das ist später mit Operatoren Gold wert: <kbd>dt)</kbd> löscht alles bis zur Klammer.</p>
<p>Großbuchstaben suchen rückwärts. Mit <kbd>;</kbd> wiederholst du die letzte Suche, mit <kbd>,</kbd> gehst du in die Gegenrichtung.</p>`,
          ex: [
            { task: 'Springe mit <kbd>f</kbd> zu den Zielen.', text: '¶Vim macht Spaß, ◊wirklich! Probier◊s aus◊!', block: 'hlwbeWBE', sol: 'fwfsf!' },
            { task: 'Lande mit <kbd>t</kbd> jeweils vor dem Trennzeichen. <kbd>;</kbd> hilft.', text: '¶ergebnis = berechne(◊x, ◊y, ◊z);', block: 'hlwbeWBE', sol: 't,;t)' },
            { task: 'Rückwärts mit <kbd>F</kbd> und <kbd>;</kbd>.', text: '◊ab ◊ab ◊ab ¶!', order: 'reverse', block: 'hlwbeWBE', sol: 'Fa;;' }
          ]
        }
      ]
    },
    {
      id: 'bearbeiten', title: 'Text bearbeiten', lessons: [
        {
          id: 'einfuegen', title: 'Einfügen an jeder Stelle',
          intro: 'Vier Wege in den Einfügemodus, jeder für einen anderen Ort.',
          keys: [['i', 'Vor dem Cursor einfügen'], ['a', 'Nach dem Cursor einfügen'], ['I', 'Am Zeilenanfang einfügen'], ['A', 'Am Zeilenende einfügen']],
          body: `<p><kbd>i</kbd> (<i>insert</i>) und <kbd>a</kbd> (<i>append</i>) unterscheiden sich nur um ein Zeichen. Die großen Varianten sparen dir den Weg: <kbd>A</kbd> springt ans Zeilenende und beginnt dort mit dem Einfügen, <kbd>I</kbd> am ersten Zeichen der Zeile.</p>`,
          ex: [
            { task: 'Füge nach dem „o“ ein Komma ein.', text: 'Hall¶o Welt', goal: 'Hallo, Welt', sol: 'a,<Esc>' },
            { task: 'Hänge ein Semikolon an das Zeilenende.', text: '¶let x = 5', goal: 'let x = 5;', sol: 'A;<Esc>' },
            { task: 'Kommentiere die Zeile aus.', text: '    console.lo¶g(x);', goal: '    // console.log(x);', sol: 'I// <Esc>' },
            { task: 'Setze das Wort zwischen Sternchen.', text: '¶wichtig', goal: '*wichtig*', sol: 'I*<Esc>A*<Esc>' }
          ]
        },
        {
          id: 'neue-zeilen', title: 'Neue Zeilen öffnen',
          intro: 'Neue Zeile darunter oder darüber, und du tippst sofort los.',
          keys: [['o', 'Neue Zeile unterhalb öffnen'], ['O', 'Neue Zeile oberhalb öffnen']],
          body: `<p><kbd>o</kbd> legt unter der aktuellen Zeile eine neue an und wechselt in den Einfügemodus, egal wo der Cursor in der Zeile steht. <kbd>O</kbd> macht dasselbe oberhalb. Die Einrückung der aktuellen Zeile wird übernommen.</p>`,
          ex: [
            { task: 'Ergänze „- Brot“ unter der Milch.', text: '¶Einkaufsliste:\n- Milch', goal: 'Einkaufsliste:\n- Milch\n- Brot', sol: 'jo- Brot<Esc>' },
            { task: 'Füge über dem print einen Kommentar „# Sagt Hallo“ ein.', text: 'def gruss():\n    ¶print("Hallo")', goal: 'def gruss():\n    # Sagt Hallo\n    print("Hallo")', sol: 'O# Sagt Hallo<Esc>' },
            { task: 'Füge zwischen Titel und Text eine Leerzeile ein.', text: '¶Titel\nText', goal: 'Titel\n\nText', sol: 'o<Esc>' }
          ]
        },
        {
          id: 'loeschen', title: 'Löschen',
          intro: 'x löscht ein Zeichen, d löscht alles, wohin du dich bewegen kannst.',
          keys: [['x', 'Zeichen unter dem Cursor löschen'], ['X', 'Zeichen vor dem Cursor löschen'], ['dw', 'Bis zum nächsten Wort löschen'], ['dd', 'Ganze Zeile löschen'], ['D', 'Bis zum Zeilenende löschen'], ['d{Bewegung}', 'Löschen, so weit die Bewegung reicht']],
          body: `<p>Hier lernst du das wichtigste Prinzip von Vim: <b>Operator + Bewegung</b>. <kbd>d</kbd> ist der Lösch-Operator. Danach sagst du, wie weit: <kbd>dw</kbd> löscht bis zum nächsten Wort, <kbd>d$</kbd> bis zum Zeilenende, <kbd>dt)</kbd> bis vor die Klammer.</p>
<p>Ein doppelter Operator wirkt auf die ganze Zeile: <kbd>dd</kbd>. Alles Gelöschte landet übrigens in einem Register und kann wieder eingefügt werden.</p>`,
          ex: [
            { task: 'Entferne die überzähligen Buchstaben mit <kbd>x</kbd>.', text: 'V¶iimmm ist super', goal: 'Vim ist super', sol: 'xlxx' },
            { task: 'Lösche das doppelte „sehr“.', text: 'Das ist ¶sehr sehr gut', goal: 'Das ist sehr gut', sol: 'dw' },
            { task: 'Lösche die mittlere Zeile.', text: 'Zeile eins\n¶Diese Zeile muss weg\nZeile zwei', goal: 'Zeile eins\nZeile zwei', sol: 'dd' },
            { task: 'Entferne den Kommentar bis zum Zeilenende.', text: 'let x = 5;¶ // alter Kommentar', goal: 'let x = 5;', sol: 'D' },
            { task: 'Lösche alles bis vor das „c“.', text: 'summe(¶a + b + c)', goal: 'summe(c)', sol: 'dtc' }
          ]
        },
        {
          id: 'undo', title: 'Rückgängig und wiederholen',
          intro: 'Fehler sind in Vim billig. Ein Tastendruck und alles ist wie vorher.',
          keys: [['u', 'Letzte Änderung rückgängig machen'], ['<C-r>', 'Rückgängig gemachte Änderung wiederherstellen']],
          body: `<p><kbd>u</kbd> nimmt die letzte Änderung zurück. Eine Änderung ist dabei immer ein ganzer Befehl: Alles, was du in einem Einfügemodus-Durchgang tippst, verschwindet mit einem einzigen <kbd>u</kbd>. <kbd>Ctrl-r</kbd> stellt sie wieder her.</p>`,
          tip: 'Mit einer Zahl davor machst du mehrere Schritte auf einmal rückgängig, zum Beispiel <kbd>3u</kbd>.',
          ex: [
            { task: 'Lösche „richtig“ mit <kbd>dw</kbd> und hole es mit <kbd>u</kbd> zurück.', text: 'Das ist ¶richtig.', goal: 'Das ist richtig.', require: ['dw', 'u'], sol: 'dwu' },
            { task: 'Lösche „zwei“, mache es rückgängig und stelle die Löschung mit <kbd>Ctrl-r</kbd> wieder her.', text: 'Eins ¶zwei drei', goal: 'Eins drei', require: ['u', '<C-r>'], sol: 'dwu<C-r>' }
          ]
        },
        {
          id: 'aendern', title: 'Ändern',
          intro: 'c ist löschen und einfügen in einem Schritt.',
          keys: [['cw', 'Wort ändern'], ['c{Bewegung}', 'Ändern, so weit die Bewegung reicht'], ['cc', 'Ganze Zeile ändern'], ['C', 'Bis zum Zeilenende ändern'], ['s', 'Zeichen ersetzen und einfügen'], ['S', 'Zeile ersetzen (wie cc)']],
          body: `<p><kbd>c</kbd> (<i>change</i>) funktioniert wie <kbd>d</kbd>, wechselt danach aber direkt in den Einfügemodus. Statt <kbd>dw</kbd> und <kbd>i</kbd> tippst du nur <kbd>cw</kbd>. Das spart nicht nur eine Taste: Die gesamte Änderung lässt sich später mit dem Punkt wiederholen.</p>`,
          ex: [
            { task: 'Ersetze „Emacs“ durch „Vim“.', text: 'Ich mag ¶Emacs.', goal: 'Ich mag Vim.', sol: 'cwVim<Esc>' },
            { task: 'Ändere den Rest der Zeile zu „online“.', text: 'status: ¶offline seit gestern', goal: 'status: online', sol: 'Conline<Esc>' },
            { task: 'Ersetze die mittlere Zeile durch „Zeile B“.', text: 'Zeile A\n¶Ersetze mich komplett\nZeile C', goal: 'Zeile A\nZeile B\nZeile C', sol: 'ccZeile B<Esc>' },
            { task: 'Der Preis steigt auf 5 Euro.', text: 'Kaffee kostet ¶3 Euro', goal: 'Kaffee kostet 5 Euro', sol: 's5<Esc>' },
            { task: 'Ändere „rot“ zu „blau“, aber behalte das Komma.', text: 'farbe(¶rot, gruen)', goal: 'farbe(blau, gruen)', sol: 'ct,blau<Esc>' }
          ]
        },
        {
          id: 'zaehlen', title: 'Zählen',
          intro: 'Eine Zahl vor einem Befehl wiederholt ihn.',
          keys: [['3w', 'Drei Wörter weiter'], ['5j', 'Fünf Zeilen nach unten'], ['d3w', 'Drei Wörter löschen'], ['3dd', 'Drei Zeilen löschen'], ['4x', 'Vier Zeichen löschen']],
          body: `<p>Fast jeder Befehl nimmt eine Zahl an. <kbd>5j</kbd> geht fünf Zeilen nach unten, <kbd>3x</kbd> löscht drei Zeichen. Bei Operatoren kann die Zahl vor oder nach dem Operator stehen: <kbd>d3w</kbd> und <kbd>3dw</kbd> tun dasselbe.</p>
<p>Lies Vim-Befehle wie Sätze: <kbd>d3w</kbd> heißt „lösche drei Wörter“.</p>`,
          ex: [
            { task: 'Springe jeweils drei Wörter weiter.', text: '¶eins zwei drei ◊vier fünf sechs ◊sieben acht neun ◊zehn', block: 'hjkl', sol: '3w3w3w' },
            { task: 'Lösche die vier überflüssigen Wörter auf einmal.', text: 'Das ist ¶ein sehr sehr langer Satz.', goal: 'Das ist Satz.', sol: 'd4w' },
            { task: 'Springe mit Zahlen zu Punkt 6 und dann zurück zu Punkt 2.', text: '¶Punkt 1\n◊Punkt 2\nPunkt 3\nPunkt 4\nPunkt 5\n◊Punkt 6\nPunkt 7\nPunkt 8', order: 'reverse', sol: '5j4k' },
            { task: 'Lösche die drei „weg“-Zeilen mit einem Befehl.', text: 'behalten\n¶weg 1\nweg 2\nweg 3\nbehalten', goal: 'behalten\nbehalten', sol: '3dd' },
            { task: 'Ein Ausrufezeichen reicht.', text: 'Hallo¶!!!!!', goal: 'Hallo!', sol: '4x' }
          ]
        },
        {
          id: 'ersetzen', title: 'Zeichen ersetzen',
          intro: 'Einzelne Zeichen tauschen, ohne den Normalmodus zu verlassen.',
          keys: [['r{z}', 'Zeichen unter dem Cursor durch z ersetzen'], ['R', 'Ersetzungsmodus: überschreibt beim Tippen'], ['~', 'Groß- und Kleinschreibung umschalten']],
          body: `<p><kbd>r</kbd> ersetzt genau ein Zeichen und du bleibst im Normalmodus. <kbd>R</kbd> startet den Ersetzungsmodus, in dem jedes getippte Zeichen das vorhandene überschreibt. Mit <kbd>Backspace</kbd> holst du im Ersetzungsmodus das Original zurück.</p>`,
          ex: [
            { task: 'Korrigiere den Tippfehler.', text: 'Hallo Wel¶f', goal: 'Hallo Welt', sol: 'rt' },
            { task: 'Überschreibe die Jahreszahl mit 2026.', text: 'Das Jahr ist ¶1999', goal: 'Das Jahr ist 2026', sol: 'R2026<Esc>' },
            { task: 'Mach aus den Unterstrichen Pluszeichen.', text: 'a ¶_ b _ c', goal: 'a + b + c', sol: 'r+f_r+' }
          ]
        }
      ]
    },
    {
      id: 'kopieren', title: 'Kopieren und Auswählen', lessons: [
        {
          id: 'yank-put', title: 'Kopieren und Einfügen',
          intro: 'In Vim heißt Kopieren „yank“ und Einfügen „put“.',
          keys: [['yy', 'Zeile kopieren'], ['y{Bewegung}', 'Kopieren, so weit die Bewegung reicht'], ['p', 'Nach dem Cursor einfügen'], ['P', 'Vor dem Cursor einfügen']],
          body: `<p><kbd>y</kbd> ist ein Operator wie <kbd>d</kbd>, nur dass der Text stehen bleibt. <kbd>p</kbd> fügt ein. Ganze Zeilen landen darunter, Wortstücke direkt hinter dem Cursor.</p>
<p>Weil auch <kbd>d</kbd> und <kbd>x</kbd> den Text speichern, sind sie eigentlich „Ausschneiden“. Daraus entstehen zwei klassische Kniffe: <kbd>ddp</kbd> tauscht zwei Zeilen, <kbd>xp</kbd> tauscht zwei Buchstaben.</p>`,
          ex: [
            { task: 'Verdopple die Zeile.', text: '¶Zeile zum Kopieren', goal: 'Zeile zum Kopieren\nZeile zum Kopieren', sol: 'yyp' },
            { task: 'Bring die Zeilen in die richtige Reihenfolge.', text: '¶zwei\neins\ndrei', goal: 'eins\nzwei\ndrei', sol: 'ddp' },
            { task: 'Tausche die vertauschten Buchstaben.', text: 'V¶mi ist toll', goal: 'Vim ist toll', sol: 'xp' },
            { task: 'Verdopple das Wort „sehr“.', text: '¶sehr gut', goal: 'sehr sehr gut', sol: 'ywP' }
          ]
        },
        {
          id: 'visuell', title: 'Visueller Modus',
          intro: 'Erst markieren, dann handeln.',
          keys: [['v', 'Zeichenweise markieren'], ['V', 'Zeilenweise markieren'], ['<C-v>', 'Rechteckig markieren (Block)'], ['o', 'Zum anderen Ende der Markierung'], ['d / y / c / > / U', 'Auf die Markierung anwenden'], ['I / A', 'Im Block vor bzw. nach jeder Zeile einfügen']],
          body: `<p>Im visuellen Modus siehst du, worauf ein Befehl wirkt. Starte mit <kbd>v</kbd>, bewege dich mit allen bekannten Bewegungen und drücke dann einen Operator wie <kbd>d</kbd>, <kbd>y</kbd>, <kbd>c</kbd> oder <kbd>></kbd>.</p>
<p>Der Blockmodus mit <kbd>Ctrl-v</kbd> markiert ein Rechteck. Mit <kbd>I</kbd> tippst du Text, der nach <kbd>Esc</kbd> in jeder markierten Zeile erscheint. Perfekt zum Auskommentieren.</p>`,
          ex: [
            { task: 'Markiere „diesen ganzen Teil hier “ und lösche ihn.', text: 'Lösche ¶diesen ganzen Teil hier und behalte den Rest.', goal: 'Lösche und behalte den Rest.', sol: 'vtud' },
            { task: 'Lösche die beiden „Weg damit“-Zeilen zeilenweise.', text: 'Behalten\n¶Weg damit 1\nWeg damit 2\nAuch behalten', goal: 'Behalten\nAuch behalten', sol: 'Vjd' },
            { task: 'Rücke beide log-Zeilen ein.', text: 'if (ok) {\n¶log("a");\nlog("b");\n}', goal: 'if (ok) {\n    log("a");\n    log("b");\n}', sol: 'Vj>' },
            { task: 'Kommentiere alle drei Zeilen mit dem Blockmodus aus.', text: '¶alpha();\nbeta();\ngamma();', goal: '// alpha();\n// beta();\n// gamma();', sol: '<C-v>jjI// <Esc>' },
            { task: 'Schreibe „dies“ in Großbuchstaben.', text: 'Mach ¶dies groß', goal: 'Mach DIES groß', sol: 'veU' }
          ]
        },
        {
          id: 'textobjekte', title: 'Textobjekte',
          intro: 'Sag Vim, was du meinst: das Wort, die Klammer, den Absatz.',
          keys: [['iw / aw', 'Inneres Wort / Wort mit Leerzeichen'], ['i" / a"', 'Inhalt der Anführungszeichen / mit Zeichen'], ['i( / a(', 'Inhalt der Klammer / mit Klammern'], ['i{ / i[ / i<', 'Inhalt geschweifter, eckiger, spitzer Klammern'], ['it / at', 'Inhalt eines HTML-Tags / mit Tag'], ['ip / ap', 'Absatz / Absatz mit Leerzeile']],
          body: `<p>Textobjekte funktionieren nur nach einem Operator oder im visuellen Modus. <kbd>i</kbd> heißt <i>inner</i>, <kbd>a</kbd> heißt <i>around</i>. Das Schöne: Der Cursor muss nur irgendwo im Objekt stehen. <kbd>ciw</kbd> ändert das Wort, egal ob du am Anfang, in der Mitte oder am Ende stehst.</p>
<p><kbd>ci"</kbd>, <kbd>di(</kbd> und <kbd>cit</kbd> wirst du beim Programmieren täglich benutzen.</p>`,
          ex: [
            { task: 'Ändere die Farbe zu „rot“. Der Cursor steht mitten im Wort.', text: 'Die Farbe ist bl¶au.', goal: 'Die Farbe ist rot.', sol: 'ciwrot<Esc>' },
            { task: 'Ersetze den Titel innerhalb der Anführungszeichen durch „Neu“.', text: 'titel = "Alter ¶Titel";', goal: 'titel = "Neu";', sol: 'ci"Neu<Esc>' },
            { task: 'Leere die Klammer.', text: 'berechne(¶a, b, c)', goal: 'berechne()', sol: 'di(' },
            { task: 'Entferne das Wort samt Leerzeichen.', text: 'Das ist ein ¶unnötiges Wort.', goal: 'Das ist ein Wort.', sol: 'daw' },
            { task: 'Leere den Funktionskörper.', text: 'function f() {\n    ¶return 1;\n}', goal: 'function f() {\n}', sol: 'di{' },
            { task: 'Ersetze den Inhalt des Tags durch „Neuer Text“.', text: '<p>¶Alter Text</p>', goal: '<p>Neuer Text</p>', sol: 'citNeuer Text<Esc>' },
            { task: 'Lösche den mittleren Absatz komplett.', text: 'Absatz eins.\n\n¶Dieser Absatz\nsoll weg.\n\nAbsatz drei.', goal: 'Absatz eins.\n\nAbsatz drei.', sol: 'dap' }
          ]
        },
        {
          id: 'punkt', title: 'Der Punkt-Befehl',
          intro: 'Der mächtigste einzelne Tastendruck in Vim.',
          keys: [['.', 'Letzte Änderung wiederholen']],
          body: `<p><kbd>.</kbd> wiederholt die letzte Änderung, samt allem, was du im Einfügemodus getippt hast. Wenn du <kbd>A;</kbd><kbd>Esc</kbd> einmal ausführst, hängt jeder weitere Punkt ein Semikolon an.</p>
<p>Das Muster „Bewegung, Punkt, Bewegung, Punkt“ ersetzt viele Makros. Plane deine Änderungen so, dass sie sich wiederholen lassen.</p>`,
          ex: [
            { task: 'Hänge an jede Zeile ein Semikolon. Einmal tippen, dann wiederholen.', text: '¶let a = 1\nlet b = 2\nlet c = 3\nlet d = 4', goal: 'let a = 1;\nlet b = 2;\nlet c = 3;\nlet d = 4;', sol: 'A;<Esc>j.j.j.' },
            { task: 'Ersetze jedes „foo“ durch „bar“.', text: '¶foo + foo * foo', goal: 'bar + bar * bar', sol: 'cwbar<Esc>ww.ww.' },
            { task: 'Lösche alle „weg“-Zeilen mit <kbd>dd</kbd> und dem Punkt.', text: '¶weg\nweg\nweg\nweg\nbleibt', goal: 'bleibt', sol: 'dd...' }
          ]
        }
      ]
    },
    {
      id: 'navigation', title: 'Navigation', lessons: [
        {
          id: 'datei', title: 'Durch die Datei springen',
          intro: 'Anfang, Ende oder eine bestimmte Zeilennummer, alles in einem Zug.',
          keys: [['gg', 'Zur ersten Zeile'], ['G', 'Zur letzten Zeile'], ['17G', 'Zu Zeile 17'], [':17', 'Zu Zeile 17 (Befehlszeile)']],
          body: `<p><kbd>gg</kbd> und <kbd>G</kbd> bringen dich an Anfang und Ende der Datei. Mit einer Zahl davor springt <kbd>G</kbd> zu genau dieser Zeile. Dasselbe erreichst du mit <kbd>:17</kbd> und <kbd>Enter</kbd>.</p>
<p>Kombiniert mit Operatoren: <kbd>dG</kbd> löscht bis zum Dateiende, <kbd>ygg</kbd> kopiert alles bis zum Anfang.</p>`,
          ex: [
            { task: 'Besuche die letzte Zeile, dann die erste, dann Zeile 17 und zuletzt Zeile 23.', text: gen(30, 'Zeile', { 0: '◊¶', 16: '◊', 22: '◊', 29: '◊' }), order: [3, 0, 1, 2], height: 10, sol: 'Ggg:17<CR>23G' }
          ]
        },
        {
          id: 'absaetze', title: 'Absätze',
          intro: 'Springe von Leerzeile zu Leerzeile.',
          keys: [['}', 'Zum nächsten Absatzende'], ['{', 'Zum vorherigen Absatzanfang']],
          body: `<p>Ein Absatz endet an einer Leerzeile. <kbd>}</kbd> springt zur nächsten, <kbd>{</kbd> zur vorherigen. In Code trennen Leerzeilen meist Funktionen oder Blöcke, deshalb kommst du so schnell von Abschnitt zu Abschnitt.</p>`,
          ex: [
            { task: 'Springe mit <kbd>}</kbd> von Leerzeile zu Leerzeile.', text: '¶Vim erschien 1991 und stammt von\nBram Moolenaar.\n◊\nDer Name steht für „Vi IMproved“,\nalso verbesserter vi.\n◊\nHeute ist Vim auf fast jedem\nUnix-System vorinstalliert.\n◊\nNeovim ist ein moderner Ableger\nmit eigener Community.', sol: '}}}' },
            { task: 'Und mit <kbd>{</kbd> wieder zurück nach oben.', text: 'Vim erschien 1991 und stammt von\nBram Moolenaar.\n◊\nDer Name steht für „Vi IMproved“,\nalso verbesserter vi.\n◊\nHeute ist Vim auf fast jedem\nUnix-System vorinstalliert.\n◊\nNeovim ist ein moderner Ableger\n¶mit eigener Community.', order: 'reverse', sol: '{{{' }
          ]
        },
        {
          id: 'bildschirm', title: 'Bildschirm und Scrollen',
          intro: 'Bewege dich relativ zum sichtbaren Ausschnitt.',
          keys: [['H', 'Oberste sichtbare Zeile (High)'], ['M', 'Mittlere sichtbare Zeile'], ['L', 'Unterste sichtbare Zeile (Low)'], ['<C-d>', 'Halbe Seite nach unten'], ['<C-u>', 'Halbe Seite nach oben'], ['<C-f> / <C-b>', 'Ganze Seite vor / zurück'], ['zz', 'Aktuelle Zeile in die Bildschirmmitte']],
          body: `<p><kbd>H</kbd>, <kbd>M</kbd> und <kbd>L</kbd> springen an den oberen Rand, in die Mitte und an den unteren Rand des sichtbaren Bereichs. <kbd>Ctrl-d</kbd> und <kbd>Ctrl-u</kbd> scrollen eine halbe Seite und nehmen den Cursor mit.</p>
<p><kbd>zz</kbd> verschiebt die Ansicht so, dass die aktuelle Zeile in der Mitte steht. Der Cursor bleibt dabei, wo er ist.</p>`,
          ex: [
            { task: 'Springe zum unteren Rand, zum oberen Rand und in die Mitte.', text: gen(40, 'Abschnitt', { 0: '◊¶', 4: '◊', 9: '◊' }), order: [2, 0, 1], height: 10, block: 'jk', sol: 'LHM' },
            { task: 'Scrolle mit <kbd>Ctrl-d</kbd> zu Abschnitt 31 und mit <kbd>Ctrl-u</kbd> zurück zu Abschnitt 21.', text: gen(40, 'Abschnitt', { 0: '¶', 20: '◊', 30: '◊' }), order: 'reverse', height: 10, block: 'jk', sol: '<C-d><C-d><C-d><C-d><C-d><C-d><C-u><C-u>' }
          ]
        },
        {
          id: 'suche', title: 'Suchen',
          intro: 'Der schnellste Weg zu jedem Ort, den du benennen kannst.',
          keys: [['/{Muster}', 'Vorwärts suchen'], ['?{Muster}', 'Rückwärts suchen'], ['n', 'Nächster Treffer'], ['N', 'Vorheriger Treffer'], [':noh', 'Hervorhebung ausschalten']],
          body: `<p>Tippe <kbd>/</kbd>, dann das Suchwort und <kbd>Enter</kbd>. Der Cursor springt zum nächsten Treffer, alle Treffer werden hervorgehoben. <kbd>n</kbd> geht zum nächsten, <kbd>N</kbd> zum vorherigen. Am Dateiende beginnt die Suche wieder oben.</p>
<p>Das Muster ist ein regulärer Ausdruck: <code>/\\&lt;Vim\\&gt;</code> findet nur das ganze Wort.</p>`,
          ex: [
            { task: 'Suche nach „Ziel“ und springe mit <kbd>n</kbd> weiter.', text: '¶Die Suche ist der schnellste Weg durch große Dateien.\nIrgendwo hier versteckt sich das erste ◊Ziel.\nMit n springst du zum nächsten Treffer,\nund das zweite ◊Ziel liegt in dieser Zeile.\nMit N geht es zurück. Das dritte ◊Ziel ist hier.', block: 'hjklwbeWBE', sol: '/Ziel<CR>nn' },
            { task: 'Suche mit <kbd>?</kbd> rückwärts nach „echo“.', text: '◊echo "start"\n◊echo "mitte"\n◊echo "ende"\n¶# Rückwärts suchen mit ?', order: 'reverse', block: 'hjklwbeWBE', sol: '?echo<CR>nn' }
          ]
        },
        {
          id: 'spruenge', title: 'Klammern und Wörter',
          intro: 'Zwei Abkürzungen für Programmierer.',
          keys: [['%', 'Zur passenden Klammer springen'], ['*', 'Wort unter dem Cursor vorwärts suchen'], ['#', 'Wort unter dem Cursor rückwärts suchen']],
          body: `<p><kbd>%</kbd> springt zwischen zusammengehörigen Klammern <code>()</code>, <code>[]</code> und <code>{}</code> hin und her. Steht der Cursor nicht auf einer Klammer, nimmt Vim die nächste in der Zeile.</p>
<p><kbd>*</kbd> sucht das Wort unter dem Cursor, ganz ohne Tippen. Ideal, um alle Stellen einer Variablen zu finden.</p>`,
          ex: [
            { task: 'Springe zur schließenden runden Klammer und danach zur schließenden geschweiften.', text: '¶function test(a, b◊) {\n    return (a + b) * 2;\n◊}', sol: '%$%' },
            { task: 'Finde mit <kbd>*</kbd> und <kbd>n</kbd> alle Stellen von „zaehler“.', text: 'let ¶zaehler = 0;\nfor (const x of liste) {\n    ◊zaehler += x;\n}\nconsole.log(◊zaehler);', block: 'hjklwbeWBE', sol: '*n' }
          ]
        },
        {
          id: 'marken', title: 'Marken',
          intro: 'Lesezeichen setzen und jederzeit zurückspringen.',
          keys: [['m{a-z}', 'Marke an der Cursorposition setzen'], ['`{a-z}', 'Genau zur Marke springen'], ["'{a-z}", 'Zur Zeile der Marke springen'], ['``', 'Zurück zur Position vor dem letzten Sprung'], [':marks', 'Alle Marken anzeigen']],
          body: `<p>Mit <kbd>ma</kbd> merkst du dir die aktuelle Stelle unter dem Namen <code>a</code>. Später bringt dich <kbd>\`a</kbd> exakt dorthin zurück, <kbd>'a</kbd> an den Anfang der Zeile. Marken funktionieren auch als Bewegung: <kbd>d'a</kbd> löscht alle Zeilen bis zur Marke.</p>`,
          tip: 'Das Zeichen <kbd>`</kbd> ist auf deutschen Tastaturen eine Tottaste. Drücke danach die Leertaste.',
          ex: [
            { task: 'Setze eine Marke, springe zu Zeile 20 und dann exakt zurück zum Startpunkt.', text: gen(25, 'Zeile', { 19: '◊' }).split('\n').map((l, i) => i === 2 ? 'Zeile ◊¶3 · Hier liegt dein Startpunkt.' : l).join('\n'), order: [1, 0], height: 10, require: ['m', '`|\''], sol: 'ma20G`a' }
          ]
        }
      ]
    },
    {
      id: 'profi', title: 'Profi-Werkzeuge', lessons: [
        {
          id: 'gross-klein', title: 'Verbinden und Groß/Klein',
          intro: 'Zeilen zusammenführen und Schreibweisen umstellen.',
          keys: [['J', 'Nächste Zeile anhängen (mit Leerzeichen)'], ['gJ', 'Anhängen ohne Leerzeichen'], ['~', 'Groß/klein des Zeichens umschalten'], ['gU{Bewegung}', 'In Großbuchstaben'], ['gu{Bewegung}', 'In Kleinbuchstaben'], ['g~{Bewegung}', 'Groß/klein umschalten']],
          body: `<p><kbd>J</kbd> (<i>join</i>) holt die nächste Zeile hoch und setzt ein Leerzeichen dazwischen. Mit einer Zahl verbindest du mehrere Zeilen auf einmal.</p>
<p><kbd>gU</kbd>, <kbd>gu</kbd> und <kbd>g~</kbd> sind Operatoren und funktionieren mit jeder Bewegung und jedem Textobjekt: <kbd>gUiw</kbd> macht ein Wort groß, <kbd>guu</kbd> eine ganze Zeile klein.</p>`,
          ex: [
            { task: 'Füge die drei Zeilen zu einem Satz zusammen.', text: '¶Dieser Satz wurde\nversehentlich\numgebrochen.', goal: 'Dieser Satz wurde versehentlich umgebrochen.', sol: '3J' },
            { task: 'Schreibe „vim“ groß.', text: '¶vim', goal: 'VIM', sol: '3~' },
            { task: 'Mache die Variable zur Konstante in Großbuchstaben.', text: 'const ¶max_wert = 10;', goal: 'const MAX_WERT = 10;', sol: 'gUiw' },
            { task: 'Diese Zeile soll nicht mehr schreien.', text: '¶DIESE ZEILE SCHREIT', goal: 'diese zeile schreit', sol: 'guu' }
          ]
        },
        {
          id: 'einruecken', title: 'Einrücken',
          intro: 'Code nach links und rechts schieben.',
          keys: [['>>', 'Zeile einrücken'], ['<<', 'Zeile ausrücken'], ['>{Bewegung}', 'Bereich einrücken'], ['>i{', 'Inhalt der geschweiften Klammer einrücken']],
          body: `<p><kbd>></kbd> und <kbd><</kbd> sind Operatoren. Doppelt gedrückt wirken sie auf die aktuelle Zeile, mit Zahl auf mehrere: <kbd>3>></kbd>. Eine Stufe entspricht hier vier Leerzeichen (<code>shiftwidth=4</code>).</p>
<p>Mit Textobjekten wird es elegant: <kbd>>i{</kbd> rückt den kompletten Inhalt eines Blocks ein, ohne dass du Zeilen zählen musst.</p>`,
          ex: [
            { task: 'Rücke den Funktionskörper ein.', text: 'def f():\n¶return 1', goal: 'def f():\n    return 1', sol: '>>' },
            { task: 'Nimm bei allen drei Zeilen eine Einrückungsstufe weg.', text: '¶        a\n        b\n        c', goal: '    a\n    b\n    c', sol: '3<<' },
            { task: 'Rücke den Inhalt des Blocks ein.', text: 'if (x) {\n¶a();\nb();\nc();\n}', goal: 'if (x) {\n    a();\n    b();\n    c();\n}', sol: '>i{' }
          ]
        },
        {
          id: 'zahlen', title: 'Zahlen hoch- und runterzählen',
          intro: 'Rechnen, ohne die Zahl anzutippen.',
          keys: [['<C-a>', 'Nächste Zahl um 1 erhöhen'], ['<C-x>', 'Nächste Zahl um 1 verringern'], ['5<C-a>', 'Um 5 erhöhen'], ['g<C-a>', 'Im visuellen Modus: fortlaufend hochzählen']],
          body: `<p><kbd>Ctrl-a</kbd> addiert, <kbd>Ctrl-x</kbd> subtrahiert. Der Cursor muss nicht auf der Zahl stehen, Vim nimmt die nächste Zahl in der Zeile. Eine Zahl davor gibt den Betrag an.</p>
<p>Im visuellen Modus zählt <kbd>g Ctrl-a</kbd> fortlaufend: Die erste markierte Zeile bekommt +1, die zweite +2 und so weiter. So entstehen nummerierte Listen.</p>`,
          ex: [
            { task: 'Erhöhe den Preis auf 10.', text: 'Preis: ¶9 Euro', goal: 'Preis: 10 Euro', sol: '<C-a>' },
            { task: 'Mache das Element 50 Pixel breiter. Der Cursor steht am Zeilenanfang.', text: '¶breite: 100px;', goal: 'breite: 150px;', sol: '50<C-a>' },
            { task: 'Zähle von 10 auf 3 herunter.', text: 'Countdown: ¶10', goal: 'Countdown: 3', sol: '7<C-x>' },
            { task: 'Nummeriere die Liste mit visuellem Modus und <kbd>g Ctrl-a</kbd> durch.', text: '¶0. Punkt\n0. Punkt\n0. Punkt', goal: '1. Punkt\n2. Punkt\n3. Punkt', sol: 'VGg<C-a>' }
          ]
        },
        {
          id: 'register', title: 'Register',
          intro: 'Vim hat nicht eine Zwischenablage, sondern Dutzende.',
          keys: [['"ayy', 'Zeile in Register a kopieren'], ['"ap', 'Aus Register a einfügen'], ['"_d', 'Löschen ohne Register zu überschreiben'], ['"0p', 'Zuletzt Kopiertes einfügen'], ['<C-r>{Reg}', 'Im Einfügemodus Register einfügen'], [':reg', 'Alle Register anzeigen']],
          body: `<p>Mit <kbd>"</kbd> und einem Buchstaben wählst du vor einem Befehl ein Register. <kbd>"ayy</kbd> kopiert die Zeile nach <code>a</code>, <kbd>"ap</kbd> fügt sie ein. Großbuchstaben hängen an: <kbd>"Ayy</kbd> ergänzt Register <code>a</code>.</p>
<p>Wichtige Sonderregister: <code>"0</code> enthält immer das zuletzt Kopierte, auch wenn du danach gelöscht hast. <code>"_</code> ist das schwarze Loch: Was dort landet, ist weg und überschreibt nichts.</p>`,
          ex: [
            { task: 'Kopiere die erste Zeile in Register a und füge sie am Ende ein.', text: '¶Wichtig: Backup machen!\nZeile zwei\nZeile drei', goal: 'Wichtig: Backup machen!\nZeile zwei\nZeile drei\nWichtig: Backup machen!', require: ['"a'], sol: '"ayyG"ap' },
            { task: 'Kopiere Zeile 1, lösche Zeile 2 ins schwarze Loch und füge Zeile 1 am Ende ein.', text: '¶Kopiere mich\nLösche mich\nEnde', goal: 'Kopiere mich\nEnde\nKopiere mich', require: ['"_'], sol: 'yyj"_ddp' },
            { task: 'Kopiere den Namen und füge ihn im Einfügemodus mit <kbd>Ctrl-r "</kbd> vor dem Ausrufezeichen ein.', text: 'Name: ¶Ada\nGruß: Hallo !', goal: 'Name: Ada\nGruß: Hallo Ada!', require: ['<C-r>'], sol: 'yiwj$i<C-r>"<Esc>' }
          ]
        },
        {
          id: 'makros', title: 'Makros',
          intro: 'Nimm Tastendrücke auf und spiele sie beliebig oft ab.',
          keys: [['q{a-z}', 'Aufnahme in Register starten'], ['q', 'Aufnahme beenden'], ['@{a-z}', 'Makro abspielen'], ['@@', 'Letztes Makro wiederholen'], ['5@a', 'Makro fünfmal abspielen']],
          body: `<p>Ein Makro ist eine aufgezeichnete Tastenfolge. <kbd>qa</kbd> startet die Aufnahme, du bearbeitest eine Zeile, springst mit <kbd>j</kbd> zur nächsten und beendest mit <kbd>q</kbd>. Danach wiederholt <kbd>@a</kbd> alles.</p>
<p>Gute Makros enden an der Stelle, an der der nächste Durchlauf beginnen soll. Schlägt eine Bewegung fehl, etwa <kbd>j</kbd> in der letzten Zeile, bricht das Makro ab. Deshalb darf die Zahl ruhig zu groß sein.</p>`,
          ex: [
            { task: 'Setze jede Frucht in Anführungszeichen mit Komma. Nimm ein Makro auf und spiele es ab.', text: '¶apfel\nbirne\nkirsche\npflaume\nmango', goal: '"apfel",\n"birne",\n"kirsche",\n"pflaume",\n"mango",', require: ['q'], sol: 'qaI"<Esc>A",<Esc>jq4@a' },
            { task: 'Hake alle Aufgaben mit einem Makro ab.', text: '¶- [ ] Einkaufen\n- [ ] Aufräumen\n- [ ] Vim lernen\n- [ ] Feiern', goal: '- [x] Einkaufen\n- [x] Aufräumen\n- [x] Vim lernen\n- [x] Feiern', require: ['q'], sol: 'qa0f[lrxjq3@a' }
          ]
        },
        {
          id: 'substitute', title: 'Suchen und Ersetzen',
          intro: 'Der Befehl :s ersetzt Text per Muster.',
          keys: [[':s/alt/neu/', 'Ersten Treffer in der Zeile ersetzen'], [':s/alt/neu/g', 'Alle Treffer in der Zeile'], [':%s/alt/neu/g', 'Alle Treffer in der Datei'], [":'<,'>s/a/b/", 'Nur in der Markierung'], ['&', 'Letztes Ersetzen in dieser Zeile wiederholen'], ['\\1, \\2', 'Gruppen im Ersatztext verwenden']],
          body: `<p><kbd>:s</kbd> heißt <i>substitute</i>. Ohne Bereich wirkt der Befehl auf die aktuelle Zeile, <code>%</code> steht für die ganze Datei. Das Flag <code>g</code> ersetzt alle Treffer pro Zeile statt nur den ersten, <code>i</code> ignoriert Groß- und Kleinschreibung.</p>
<p>Drückst du <kbd>:</kbd> im visuellen Modus, setzt Vim automatisch <code>'&lt;,'&gt;</code> ein, den Bereich deiner Markierung. Gruppen schreibst du als <code>\\(…\\)</code> und setzt sie mit <code>\\1</code> wieder ein.</p>`,
          ex: [
            { task: 'Ersetze in der Zeile jedes „alt“ durch „neu“.', text: '¶Das alte Haus ist alt.', goal: 'Das neue Haus ist neu.', sol: ':s/alt/neu/g<CR>' },
            { task: 'Ersetze in der ganzen Datei „var“ durch „let“.', text: '¶var a = 1;\nvar b = 2;\nvar c = a + b;', goal: 'let a = 1;\nlet b = 2;\nlet c = a + b;', sol: ':%s/var/let/<CR>' },
            { task: 'Ersetze „foo“ nur in den ersten beiden Zeilen. Markiere sie vorher visuell.', text: '¶foo\nfoo\nfoo\nfoo', goal: 'bar\nbar\nfoo\nfoo', sol: 'Vj:s/foo/bar/<CR>' },
            { task: 'Drehe Nach- und Vorname mit Gruppen um.', text: '¶Lovelace, Ada', goal: 'Ada Lovelace', sol: ':s/\\(\\w\\+\\), \\(\\w\\+\\)/\\2 \\1/<CR>' }
          ]
        },
        {
          id: 'ex-befehle', title: 'Ex-Befehle',
          intro: 'Die Befehlszeile kann viel mehr als speichern.',
          keys: [[':g/Muster/d', 'Alle passenden Zeilen löschen'], [':v/Muster/d', 'Alle nicht passenden Zeilen löschen'], [':sort', 'Zeilen sortieren'], [':m$', 'Zeile ans Ende verschieben'], [':%norm A;', 'Normalbefehl auf jede Zeile anwenden'], [':set rnu', 'Relative Zeilennummern einschalten']],
          body: `<p><kbd>:g</kbd> (<i>global</i>) führt einen Befehl auf jeder Zeile aus, die zu einem Muster passt. <kbd>:g/TODO/d</kbd> löscht alle TODO-Zeilen. <kbd>:norm</kbd> spielt Normalmodus-Tasten auf jeder Zeile eines Bereichs ab, wie ein Makro ohne Aufnahme.</p>
<p>Relative Zeilennummern zeigen, wie weit jede Zeile vom Cursor entfernt ist. Damit siehst du sofort, ob du <kbd>4j</kbd> oder <kbd>7k</kbd> brauchst.</p>`,
          ex: [
            { task: 'Lösche alle TODO-Zeilen mit einem Befehl.', text: '¶aufräumen()\n// TODO: entfernen\nspeichern()\n// TODO: auch weg\nbeenden()', goal: 'aufräumen()\nspeichern()\nbeenden()', sol: ':g/TODO/d<CR>' },
            { task: 'Sortiere die Liste alphabetisch.', text: '¶kirsche\napfel\nbanane', goal: 'apfel\nbanane\nkirsche', sol: ':sort<CR>' },
            { task: 'Verschiebe die erste Zeile ans Ende.', text: '¶drei\neins\nzwei', goal: 'eins\nzwei\ndrei', sol: ':m$<CR>' },
            { task: 'Schalte relative Zeilennummern ein.', text: '¶Relative Nummern zeigen den Abstand.\nZwei Zeilen tiefer ist eine 2.\nDrei Zeilen tiefer ist eine 3.\nSo planst du Sprünge wie 3j.', expect: '^se(t)?\\s+(rnu|relativenumber)$', sol: ':set rnu<CR>' }
          ]
        }
      ]
    }
  ];

  const CHALLENGES = [
    { id: 'komma', title: 'Kommaliste', level: 1, task: 'Trenne die Früchte mit Kommas.', text: '¶apfel birne kirsche', goal: 'apfel, birne, kirsche', sol: 'ea,<Esc>e.' },
    { id: 'gross', title: 'Konstanten', level: 1, task: 'Schreibe beide Namen in Großbuchstaben.', text: "const ¶api_url = '/v1';\nconst max_retries = 3;", goal: "const API_URL = '/v1';\nconst MAX_RETRIES = 3;", sol: 'gUiwj.' },
    { id: 'quotes', title: 'Anführungszeichen', level: 1, task: 'Ersetze die einfachen durch doppelte Anführungszeichen.', text: "¶print('Hallo Welt')", goal: 'print("Hallo Welt")', sol: "f'r\";r\"" },
    { id: 'html', title: 'Tag umbenennen', level: 2, task: 'Mache aus dem div ein span, öffnend und schließend.', text: '<¶div>Hallo</div>', goal: '<span>Hallo</span>', sol: 'cwspan<Esc>f/l.' },
    { id: 'bedingung', title: 'Bedingung vereinfachen', level: 2, task: 'Ersetze die komplette Bedingung durch „ok“.', text: 'if (¶alter && komplizierter || ausdruck) {', goal: 'if (ok) {', sol: 'ci(ok<Esc>' },
    { id: 'doppelt', title: 'Block verdoppeln', level: 2, task: 'Hänge beide Listeneinträge noch einmal unten an.', text: '¶<li>Eins</li>\n<li>Zwei</li>', goal: '<li>Eins</li>\n<li>Zwei</li>\n<li>Eins</li>\n<li>Zwei</li>', sol: 'yjGp' },
    { id: 'nummern', title: 'Durchnummerieren', level: 2, task: 'Die Liste soll von 1 bis 4 zählen.', text: '¶1. Brot\n1. Milch\n1. Eier\n1. Käse', goal: '1. Brot\n2. Milch\n3. Eier\n4. Käse', sol: 'jVGg<C-a>' },
    { id: 'semikolon', title: 'Semikolons überall', level: 2, task: 'Jede Zeile braucht ein Semikolon am Ende.', text: "¶const a = 1\nconst b = 2\nconst c = 3\nconst d = 4\nconsole.log(a + b + c + d)", goal: "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconsole.log(a + b + c + d);", sol: ':%norm A;<CR>' },
    { id: 'tauschen', title: 'Argumente tauschen', level: 3, task: 'Vertausche die beiden Argumente.', text: 'teile(¶divisor, dividend)', goal: 'teile(dividend, divisor)', sol: 'dWea, <C-r>"<BS><BS><Esc>' },
    { id: 'kommentare', title: 'Kommentare raus', level: 3, task: 'Entferne alle Kommentarzeilen, auch die eingerückte.', text: '¶const a = 1;\n// Kommentar\nconst b = 2;\n    // eingerückter Kommentar\nconst c = a + b;', goal: 'const a = 1;\nconst b = 2;\nconst c = a + b;', sol: ':g/\\/\\//d<CR>' },
    { id: 'umdrehen', title: 'Zeilen umdrehen', level: 3, task: 'Kehre die Reihenfolge aller Zeilen um.', text: '¶eins\nzwei\ndrei\nvier', goal: 'vier\ndrei\nzwei\neins', sol: ':g/^/m0<CR>' },
    { id: 'csv', title: 'CSV zu Tabelle', level: 3, task: 'Ersetze jedes Komma durch „ | “ (mit Leerzeichen).', text: '¶name,alter,stadt\nAda,36,London\nLinus,28,Helsinki', goal: 'name | alter | stadt\nAda | 36 | London\nLinus | 28 | Helsinki', sol: ':%s/,/ | /g<CR>' }
  ];

  const WELCOME = {
    task: 'Bewege den Cursor mit <kbd>l</kbd> nach rechts und mit <kbd>j</kbd> nach unten bis zum leuchtenden Ziel.',
    text: '¶Willkommen bei Normalmodus.\nDrücke l für rechts und j für unten.\nDas leuchtende Feld ist dein ◊Ziel.',
    sol: 'jj' + 'l'.repeat(29)
  };

  const DRILL_TEXT = [
    'function zielscheibe(punkte) {',
    '    const treffer = [];',
    '    for (const p of punkte) {',
    '        if (p.x > 0 && p.y > 0) {',
    '            treffer.push({ x: p.x, y: p.y });',
    '        } else {',
    '            console.warn("daneben", p);',
    '        }',
    '    }',
    '    return treffer.length * 10;',
    '}',
    '',
    'export default zielscheibe;'
  ].join('\n');

  /* ---------- Übungen vorbereiten und prüfen ---------- */
  const ARROWS = { '←': '\uE001', '→': '\uE002', '↑': '\uE003', '↓': '\uE004' };

  function parseMarked(src) {
    let start = { r: 0, c: 0 };
    const targets = [];
    const lines = src.split('\n').map((ln, r) => {
      let s = '';
      for (const ch of ln) {
        if (ch === '¶') { start = { r, c: s.length }; continue; }
        if (ch === '◊') { targets.push({ r, c: s.length }); continue; }
        s += ch;
      }
      return s;
    });
    return { text: lines.join('\n'), start, targets };
  }

  function prepare(raw) {
    const Vim = root.Vim;
    const parsed = parseMarked(raw.text);
    let targets = parsed.targets;
    if (raw.order === 'reverse') targets = targets.slice().reverse();
    else if (Array.isArray(raw.order)) targets = raw.order.map(i => parsed.targets[i]);
    const type = raw.goal != null ? 'match' : raw.expect ? 'cmd' : 'targets';
    const solKeys = raw.sol ? Vim.parseNotation(raw.sol) : null;
    const block = new Set();
    if (raw.block) for (const ch of raw.block) block.add(ARROWS[ch] || ch);
    if (block.has('h') && block.has('l')) for (const a of Object.values(ARROWS)) block.add(a);
    const require = (raw.require || []).map(r => r.split('|').map(alt => Vim.parseNotation(alt).join('')));
    return Object.assign({}, raw, { type, text: parsed.text, start: parsed.start, targets, solKeys, par: raw.par || (solKeys ? solKeys.length : 0), blockSet: block, requireKeys: require });
  }

  function newState() { return { ti: 0, hist: '', keys: 0, done: false }; }

  function isBlocked(ex, v, key) {
    if (!ex.blockSet.size || v.mode !== 'normal') return false;
    if (!/^("[\s\S])?\d*$/.test(v.pending)) return false;
    if (/^\d$/.test(key) && (key !== '0' || /\d$/.test(v.pending))) return false;
    return ex.blockSet.has(key);
  }

  function check(ex, st, v) {
    if (ex.type === 'targets') {
      while (st.ti < ex.targets.length && v.mode === 'normal' && v.r === ex.targets[st.ti].r && v.c === ex.targets[st.ti].c) st.ti++;
      return st.ti >= ex.targets.length;
    }
    const reqOk = ex.requireKeys.every(alts => alts.some(a => st.hist.includes(a)));
    if (!reqOk) return false;
    if (ex.type === 'match') return v.mode === 'normal' && v.text() === ex.goal;
    const re = new RegExp(ex.expect);
    return v.exLog.some(c => re.test(c));
  }

  function stars(keys, par) {
    if (!par) return 3;
    if (keys <= par) return 3;
    if (keys <= Math.ceil(par * 1.6)) return 2;
    return 1;
  }

  root.VK = { COURSE, CHALLENGES, WELCOME, DRILL_TEXT, prepare, newState, isBlocked, check, stars, parseMarked };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.VK;
})(typeof window !== 'undefined' ? window : this);
