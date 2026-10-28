/* Normalmodus · Kursinhalte (Deutsch und Englisch)
   Markierungen im Übungstext: ¶ = Startposition des Cursors, ◊ = Ziel (vor dem Zielzeichen).
   Felder können ein String (für beide Sprachen), ein Objekt {de, en} oder eine Funktion (lang) => String sein.
   Stufen: basic = Einstieg, combo = Kombination mit früheren Befehlen, final = Abschlussübung. */
(function (root) {
  'use strict';

  const T = (de, en) => ({ de, en });

  const PHRASES = {
    de: ['Vim startet im Normalmodus.', 'Jede Taste ist ein Befehl.', 'Esc bringt dich immer zurück.',
      'Operator plus Bewegung ergibt eine Aktion.', 'Zahlen wiederholen Befehle.', 'Der Punkt wiederholt die letzte Änderung.',
      'Textobjekte sparen Tastendrücke.', 'Register merken sich Text.', 'Makros erledigen Fleißarbeit.', 'Übung macht den Meister.'],
    en: ['Vim starts in normal mode.', 'Every key is a command.', 'Esc always brings you back.',
      'Operator plus motion makes an action.', 'Counts repeat commands.', 'The dot repeats the last change.',
      'Text objects save keystrokes.', 'Registers remember text.', 'Macros do the busywork.', 'Practice makes perfect.']
  };
  const WORD = { line: T('Zeile', 'Line'), sec: T('Abschnitt', 'Section') };
  function genLines(lang, n, kind) {
    const prefix = WORD[kind][lang];
    const out = [];
    for (let i = 0; i < n; i++) out.push(prefix + ' ' + (i + 1) + ' · ' + PHRASES[lang][i % 10]);
    return out;
  }
  const gen = (n, kind, marks, edit) => lang => {
    const ls = genLines(lang, n, kind);
    if (edit) edit(ls, lang);
    return ls.map((l, i) => (marks && marks[i] ? marks[i] : '') + l).join('\n');
  };

  const COURSE = [
    /* =================================================================== */
    {
      id: 'grundlagen', title: T('Erste Schritte', 'First steps'), lessons: [
        {
          id: 'modi', title: T('Modi verstehen', 'Understanding modes'),
          intro: T('Vim ist ein modaler Editor. Dieselbe Taste tut je nach Modus etwas völlig anderes.',
            'Vim is a modal editor. The same key does something completely different depending on the mode.'),
          keys: [['i', T('Einfügemodus vor dem Cursor', 'Insert mode before the cursor')], ['<Esc>', T('Zurück in den Normalmodus', 'Back to normal mode')], [':', T('Befehlszeile öffnen', 'Open the command line')], ['<CR>', T('Befehl ausführen', 'Run the command')]],
          body: T(`<p>Im <b>Normalmodus</b> sind Tasten Befehle: Du bewegst dich, löschst, kopierst und änderst Text. Im <b>Einfügemodus</b> tippst du wie in jedem anderen Editor. Über die <b>Befehlszeile</b> mit <kbd>:</kbd> gibst du längere Befehle ein, etwa <code>:w</code> zum Speichern oder <code>:q</code> zum Beenden.</p>
<p>Stell es dir so vor: Der Normalmodus ist dein Werkzeugkasten, der Einfügemodus ist der Stift. Du nimmst den Stift nur kurz in die Hand und legst ihn mit <kbd>Esc</kbd> sofort wieder weg. Die Statuszeile unten im Editor zeigt dir jederzeit, in welchem Modus du bist.</p>`,
            `<p>In <b>normal mode</b> keys are commands: you move, delete, copy and change text. In <b>insert mode</b> you type like in any other editor. The <b>command line</b>, opened with <kbd>:</kbd>, takes longer commands such as <code>:w</code> to save or <code>:q</code> to quit.</p>
<p>Think of it like this: normal mode is your toolbox, insert mode is the pen. You pick up the pen briefly and put it down again right away with <kbd>Esc</kbd>. The status line at the bottom of the editor always shows which mode you are in.</p>`),
          tip: T('<kbd>Ctrl-[</kbd> wirkt genau wie <kbd>Esc</kbd> und liegt näher an der Grundreihe.', '<kbd>Ctrl-[</kbd> does exactly what <kbd>Esc</kbd> does and is closer to the home row.'),
          demo: {
            text: T('Ich lerne ¶.', 'I am learning ¶.'),
            steps: [
              ['i', T('<kbd>i</kbd> öffnet den Einfügemodus. Der Cursor wird zum Strich vor dem Punkt.', '<kbd>i</kbd> opens insert mode. The cursor becomes a bar in front of the full stop.')],
              ['Vim', T('Jetzt landet jede Taste als Text im Dokument.', 'Now every key lands in the document as text.')],
              ['<Esc>', T('<kbd>Esc</kbd> beendet das Tippen. Wir sind zurück im Normalmodus.', '<kbd>Esc</kbd> ends typing. We are back in normal mode.')],
              [':w<CR>', T('<kbd>:w</kbd> und <kbd>Enter</kbd> speichern die Datei.', '<kbd>:w</kbd> and <kbd>Enter</kbd> save the file.')]
            ]
          },
          ex: [
            { tier: 'basic', task: T('Füge vor dem Punkt das Wort „Vim“ ein und kehre mit <kbd>Esc</kbd> in den Normalmodus zurück.', 'Insert the word “Vim” before the full stop and return to normal mode with <kbd>Esc</kbd>.'),
              text: T('Ich lerne ¶.', 'I am learning ¶.'), goal: T('Ich lerne Vim.', 'I am learning Vim.'), sol: 'iVim<Esc>',
              hint: T('Der Cursor steht schon richtig. <kbd>i</kbd> fügt <b>vor</b> dem Zeichen unter dem Cursor ein.', 'The cursor is already in place. <kbd>i</kbd> inserts <b>before</b> the character under the cursor.') },
            { tier: 'basic', task: T('Ergänze das fehlende Wort „ein“ samt Leerzeichen.', 'Add the missing word “an” including the space.'),
              text: T('Das ist ¶Editor.', 'This is ¶editor.'), goal: T('Das ist ein Editor.', 'This is an editor.'), sol: T('iein <Esc>', 'ian <Esc>'),
              hint: T('Vergiss das Leerzeichen nach dem Wort nicht. Erst danach <kbd>Esc</kbd>.', 'Don\'t forget the space after the word. Then press <kbd>Esc</kbd>.') },
            { tier: 'basic', task: T('Die berühmteste Vim-Frage: Wie kommt man wieder raus? Tippe <kbd>:q</kbd> und drücke <kbd>Enter</kbd>.', 'The most famous Vim question: how do you get out? Type <kbd>:q</kbd> and press <kbd>Enter</kbd>.'),
              text: T('¶Hier kommst du nur mit einem Befehl wieder raus.', '¶You can only get out of here with a command.'), expect: '^(q|quit|wq|x|q!|qa|qa!|wq!)$', sol: ':q<CR>',
              hint: T('Befehle beginnen mit einem Doppelpunkt. Sie erscheinen unten in der Befehlszeile.', 'Commands start with a colon. They appear in the command line at the bottom.') },
            { tier: 'final', task: T('Abschluss: Ergänze „drei “ vor „Modi“ und speichere danach mit <kbd>:w</kbd>.', 'Wrap-up: add “three ” before “modes”, then save with <kbd>:w</kbd>.'),
              text: T('Vim hat ¶Modi: Normal, Einfügen und Befehl.', 'Vim has ¶modes: normal, insert and command.'),
              goal: T('Vim hat drei Modi: Normal, Einfügen und Befehl.', 'Vim has three modes: normal, insert and command.'), expect: '^(w|write|wq|x)$',
              sol: T('idrei <Esc>:w<CR>', 'ithree <Esc>:w<CR>'),
              hint: T('Zwei Schritte: erst im Einfügemodus tippen, dann mit <kbd>Esc</kbd> raus und in der Befehlszeile speichern.', 'Two steps: type in insert mode, leave with <kbd>Esc</kbd>, then save on the command line.') }
          ]
        },
        {
          id: 'hjkl', title: T('Cursor bewegen', 'Moving the cursor'),
          intro: T('Die vier wichtigsten Tasten liegen direkt unter deiner rechten Hand.', 'The four most important keys sit right under your right hand.'),
          keys: [['h', T('Ein Zeichen nach links', 'One character left')], ['j', T('Eine Zeile nach unten', 'One line down')], ['k', T('Eine Zeile nach oben', 'One line up')], ['l', T('Ein Zeichen nach rechts', 'One character right')]],
          body: T(`<p>Statt zu den Pfeiltasten zu greifen, bleibt deine Hand auf der Grundreihe. <kbd>h</kbd> liegt links, <kbd>l</kbd> rechts. Merkhilfe: Das <kbd>j</kbd> hat unten einen Haken und zeigt nach unten.</p>
<p>In den Übungen leuchten <span class="demo-target">Ziele</span> auf. Bewege den Cursor auf das aktuelle Ziel, dann erscheint das nächste. Die Pfeiltasten sind in dieser Lektion gesperrt, damit sich die neuen Griffe einprägen.</p>`,
            `<p>Instead of reaching for the arrow keys, your hand stays on the home row. <kbd>h</kbd> is on the left, <kbd>l</kbd> on the right. Memory aid: <kbd>j</kbd> has a hook at the bottom and points down.</p>
<p>In the exercises <span class="demo-target">targets</span> light up. Move the cursor onto the current target and the next one appears. Arrow keys are blocked in this lesson so the new moves stick.</p>`),
          tip: T('Beim Wechsel zwischen unterschiedlich langen Zeilen merkt sich Vim die gewünschte Spalte.', 'When moving between lines of different length, Vim remembers the column you wanted.'),
          demo: {
            text: '¶a b c\nd e f\ng h i',
            steps: [['l', T('<kbd>l</kbd>: ein Zeichen nach rechts.', '<kbd>l</kbd>: one character right.')], ['ll', T('Noch zweimal. Leerzeichen zählen auch als Zeichen.', 'Twice more. Spaces count as characters too.')], ['j', T('<kbd>j</kbd>: eine Zeile nach unten.', '<kbd>j</kbd>: one line down.')], ['j', T('Und noch eine.', 'And another.')], ['hh', T('<kbd>h</kbd>: zurück nach links.', '<kbd>h</kbd>: back to the left.')], ['k', T('<kbd>k</kbd>: eine Zeile hoch.', '<kbd>k</kbd>: one line up.')]]
          },
          ex: [
            { tier: 'basic', task: T('Erreiche die beiden Ziele nur mit <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd>.', 'Reach both targets using only <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd>.'),
              text: T('¶Bewege den Cursor\nmit h, j, k und l\nzu den ◊markierten\nFeldern im ◊Text.', '¶Move the cursor\nwith h, j, k and l\nto the ◊highlighted\nspots in the ◊text.'),
              block: '←↑→↓', sol: T('jjllllllljllll', 'jjllllllljllllll'),
              hint: T('Erst mit <kbd>j</kbd> in die richtige Zeile, dann mit <kbd>l</kbd> nach rechts.', 'First go to the right line with <kbd>j</kbd>, then right with <kbd>l</kbd>.') },
            { tier: 'basic', task: T('Sammle alle Ziele auf dem Raster ein.', 'Collect all targets on the grid.'),
              text: '¶. . . . . . . .\n. . . . . ◊. .\n. ◊. . . . . .\n. . . . . . . ◊.\n◊. . . . . . . .', block: '←↑→↓',
              sol: 'j' + 'l'.repeat(10) + 'j' + 'h'.repeat(8) + 'j' + 'l'.repeat(12) + 'j' + 'h'.repeat(14),
              hint: T('Plane den Weg zum nächsten leuchtenden Feld: erst die Zeile, dann die Spalte.', 'Plan the route to the next glowing cell: line first, then column.') },
            { tier: 'combo', task: T('Bewege dich zur doppelten Lücke und füge dort „guter“ ein.', 'Move to the double space and insert “great” there.'),
              text: T('¶Vim ist\nein  Editor.', '¶Vim is\na  editor.'), goal: T('Vim ist\nein guter Editor.', 'Vim is\na great editor.'), block: '←↑→↓',
              sol: T('jlllliguter<Esc>', 'jlligreat<Esc>'),
              hint: T('Stell den Cursor auf das <b>zweite</b> Leerzeichen und drücke dort <kbd>i</kbd>.', 'Put the cursor on the <b>second</b> space and press <kbd>i</kbd> there.') },
            { tier: 'final', task: T('Abschluss: In zwei Wörtern fehlt ein Buchstabe. Bewege dich hin und ergänze ihn.', 'Wrap-up: two words are missing a letter. Move there and add it.'),
              text: T('¶Mit h, j, k und l bewegst\ndu dich ohne Pfeiltsten.\nDie Hand bleibt auf der\nGrundrehe.', '¶With h, j, k and l you\nmove without arow keys.\nYour hands stay on the\nhome rw.'),
              goal: T('Mit h, j, k und l bewegst\ndu dich ohne Pfeiltasten.\nDie Hand bleibt auf der\nGrundreihe.', 'With h, j, k and l you\nmove without arrow keys.\nYour hands stay on the\nhome row.'),
              block: '←↑→↓', sol: T('j' + 'l'.repeat(19) + 'ia<Esc>jjhhii<Esc>', 'j' + 'l'.repeat(15) + 'ir<Esc>jjhio<Esc>'),
              hint: T('„Pfeiltasten“ und „Grundreihe“. Nach <kbd>Esc</kbd> merkt sich Vim die Spalte, das hilft beim Sprung nach unten.', '“arrow” and “row”. After <kbd>Esc</kbd> Vim remembers the column, which helps when moving down.') }
          ]
        },
        {
          id: 'woerter', title: T('Wortweise springen', 'Moving by words'),
          intro: T('Zeichen für Zeichen ist langsam. Springe lieber ganze Wörter.', 'Character by character is slow. Jump whole words instead.'),
          keys: [['w', T('Anfang des nächsten Wortes', 'Start of the next word')], ['b', T('Anfang des vorherigen Wortes', 'Start of the previous word')], ['e', T('Ende des Wortes', 'End of the word')]],
          body: T(`<p>Ein <b>Wort</b> besteht in Vim aus Buchstaben, Ziffern und Unterstrichen. Satzzeichen wie <code>.</code>, <code>(</code> oder <code>,</code> bilden eigene Wörter. Deshalb hält <kbd>w</kbd> in <code>foo.bar(baz)</code> fünfmal an: <code>foo</code>, <code>.</code>, <code>bar</code>, <code>(</code>, <code>baz</code>.</p>
<p><kbd>w</kbd> (<i>word</i>) und <kbd>b</kbd> (<i>back</i>) springen an Wortanfänge, <kbd>e</kbd> (<i>end</i>) ans Wortende. In den Zielübungen sind <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd> gesperrt.</p>`,
            `<p>A <b>word</b> in Vim is made of letters, digits and underscores. Punctuation like <code>.</code>, <code>(</code> or <code>,</code> forms words of its own. That is why <kbd>w</kbd> stops five times in <code>foo.bar(baz)</code>: <code>foo</code>, <code>.</code>, <code>bar</code>, <code>(</code>, <code>baz</code>.</p>
<p><kbd>w</kbd> (<i>word</i>) and <kbd>b</kbd> (<i>back</i>) jump to word starts, <kbd>e</kbd> (<i>end</i>) to the end of a word. In the target exercises <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd> are blocked.</p>`),
          demo: {
            text: '¶foo.bar(baz, 42);',
            steps: [['w', T('<kbd>w</kbd> hält am Punkt, denn Satzzeichen sind eigene Wörter.', '<kbd>w</kbd> stops at the dot because punctuation is a word of its own.')], ['w', T('Weiter zu <code>bar</code>.', 'On to <code>bar</code>.')], ['ww', T('Über <code>(</code> zu <code>baz</code>.', 'Past <code>(</code> to <code>baz</code>.')], ['e', T('<kbd>e</kbd> springt ans Ende des Wortes.', '<kbd>e</kbd> jumps to the end of the word.')], ['bb', T('<kbd>b</kbd> geht rückwärts zu Wortanfängen.', '<kbd>b</kbd> goes back to word starts.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe mit <kbd>w</kbd> von Wort zu Wort.', 'Jump from word to word with <kbd>w</kbd>.'),
              text: T('¶Das ◊ist ◊ein ◊Satz ◊mit ◊vielen ◊Wörtern.', '¶This ◊is ◊a ◊sentence ◊with ◊many ◊words.'), block: 'hjkl', sol: 'wwwwww' },
            { tier: 'basic', task: T('Springe mit <kbd>e</kbd> an jedes Wortende.', 'Jump to the end of every word with <kbd>e</kbd>.'),
              text: T('¶Spring◊e an◊s End◊e jede◊s Worte◊s', '¶Jum◊p t◊o th◊e en◊d agai◊n'), block: 'hjkl', sol: 'eeeee' },
            { tier: 'basic', task: T('Jetzt rückwärts mit <kbd>b</kbd>.', 'Now backwards with <kbd>b</kbd>.'),
              text: T('◊Zurück ◊geht ◊es ◊mit ¶b', '◊Going ◊back ◊works ◊with ¶b'), order: 'reverse', block: 'hjkl', sol: 'bbbb' },
            { tier: 'basic', task: T('Satzzeichen sind eigene Wörter. Springe mit <kbd>w</kbd> durch den Code.', 'Punctuation is its own word. Jump through the code with <kbd>w</kbd>.'),
              text: '¶foo◊.◊bar◊(◊baz◊, ◊42◊);', block: 'hjkl', sol: 'wwwwwww',
              hint: T('Zähle mit: Jedes Satzzeichen ist ein Halt, <code>);</code> zusammen ist ein Wort.', 'Count along: every punctuation mark is a stop, <code>);</code> together is one word.') },
            { tier: 'combo', task: T('Springe mit <kbd>w</kbd> zur Lücke und füge „ein “ ein.', 'Jump to the gap with <kbd>w</kbd> and insert “an ”.'),
              text: T('¶Vim ist Editor mit vielen Modi.', '¶Vim is editor with many modes.'), goal: T('Vim ist ein Editor mit vielen Modi.', 'Vim is an editor with many modes.'), block: 'hjkl',
              sol: T('wwiein <Esc>', 'wwian <Esc>'), hint: T('Mit <kbd>w</kbd> auf „Editor“ springen, dann <kbd>i</kbd>.', 'Jump onto “editor” with <kbd>w</kbd>, then <kbd>i</kbd>.') },
            { tier: 'final', task: T('Abschluss: Ergänze die drei fehlenden Wörter. Bewege dich dabei nur mit Wortsprüngen und <kbd>j</kbd>.', 'Wrap-up: add the three missing words. Move only with word motions and <kbd>j</kbd>.'),
              text: T('¶Vim ist Editor, der\nschon über Jahre alt ist.\nEr läuft auf fast System.', '¶Vim is editor that\nhas been around years.\nIt runs on almost system.'),
              goal: T('Vim ist ein Editor, der\nschon über 30 Jahre alt ist.\nEr läuft auf fast jedem System.', 'Vim is an editor that\nhas been around for 30 years.\nIt runs on almost every system.'),
              block: 'hl', sol: T('wwiein <Esc>ji30 <Esc>jwijedem <Esc>', 'wwian <Esc>jwifor 30 <Esc>jbievery <Esc>'),
              hint: T('Nach <kbd>j</kbd> landest du in derselben Spalte. Prüfe, ob du schon richtig stehst, bevor du <kbd>w</kbd> oder <kbd>b</kbd> drückst.', 'After <kbd>j</kbd> you land in the same column. Check whether you are already in place before pressing <kbd>w</kbd> or <kbd>b</kbd>.') }
          ]
        },
        {
          id: 'worte-gross', title: T('WORTE und ge', 'WORDS and ge'),
          intro: T('Großbuchstaben machen Wortsprünge größer: Ein WORT reicht bis zum nächsten Leerzeichen.', 'Capital letters make word jumps bigger: a WORD lasts until the next space.'),
          keys: [['W', T('Anfang des nächsten WORTES', 'Start of the next WORD')], ['B', T('Anfang des vorherigen WORTES', 'Start of the previous WORD')], ['E', T('Ende des WORTES', 'End of the WORD')], ['ge', T('Ende des vorherigen Wortes', 'End of the previous word')], ['gE', T('Ende des vorherigen WORTES', 'End of the previous WORD')]],
          body: T(`<p>Ein <b>WORT</b> ist alles zwischen Leerzeichen. <code>user@mail.de</code> ist ein einziges WORT, aber fünf Wörter. Mit <kbd>W</kbd>, <kbd>B</kbd> und <kbd>E</kbd> überspringst du URLs, Pfade und verkettete Ausdrücke in einem Satz.</p>
<p><kbd>ge</kbd> ist das Gegenstück zu <kbd>e</kbd>: Es springt rückwärts ans Ende des vorherigen Wortes.</p>`,
            `<p>A <b>WORD</b> is everything between spaces. <code>user@mail.com</code> is a single WORD but five words. With <kbd>W</kbd>, <kbd>B</kbd> and <kbd>E</kbd> you skip URLs, paths and chained expressions in one go.</p>
<p><kbd>ge</kbd> is the counterpart to <kbd>e</kbd>: it jumps backwards to the end of the previous word.</p>`),
          demo: {
            text: '¶cp ./src/main.c ./build/',
            steps: [['w', T('<kbd>w</kbd> hält schon beim Punkt in <code>./src</code>.', '<kbd>w</kbd> already stops at the dot in <code>./src</code>.')], ['b', T('Zurück.', 'Back.')], ['W', T('<kbd>W</kbd> springt über den ganzen Pfad hinweg zum nächsten WORT.', '<kbd>W</kbd> jumps over the whole path to the next WORD.')], ['E', T('<kbd>E</kbd> landet am Ende des WORTES.', '<kbd>E</kbd> lands at the end of the WORD.')], ['W', T('Nächstes WORT.', 'Next WORD.')], ['B', T('<kbd>B</kbd> geht ein WORT zurück.', '<kbd>B</kbd> goes one WORD back.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe mit <kbd>W</kbd> über die zusammengesetzten Ausdrücke.', 'Jump over the compound expressions with <kbd>W</kbd>.'),
              text: T('¶user@mail.de ◊schrieb: ◊foo-bar ◊ist ◊(fast) ◊fertig.', '¶user@mail.com ◊wrote: ◊foo-bar ◊is ◊(almost) ◊done.'), block: 'hjklwbe', sol: 'WWWWW' },
            { tier: 'basic', task: T('Springe mit <kbd>E</kbd> an das Ende jedes WORTES.', 'Jump to the end of every WORD with <kbd>E</kbd>.'),
              text: '¶one-wor◊d two.wor◊d three/wor◊d', block: 'hjklwbe', sol: 'EEE' },
            { tier: 'basic', task: T('Rückwärts mit <kbd>B</kbd>.', 'Backwards with <kbd>B</kbd>.'),
              text: T('◊http://vim.org ◊ist ◊die ◊Heimat ◊von ¶Vim', '◊http://vim.org ◊is ◊the ◊home ◊of ¶Vim'), order: 'reverse', block: 'hjklwbe', sol: 'BBBBB' },
            { tier: 'basic', task: T('Springe mit <kbd>ge</kbd> rückwärts an die Wortenden.', 'Jump backwards to word ends with <kbd>ge</kbd>.'),
              text: T('Ein◊s zwe◊i dre◊i ¶vier', 'On◊e tw◊o thre◊e ¶four'), order: 'reverse', block: 'hjklwbe', sol: 'gegege' },
            { tier: 'combo', task: T('Springe hinter die Mailadresse und füge „bitte “ ein.', 'Jump past the email address and insert “right ”.'),
              text: T('¶Mail an user@example.com senden', '¶Mail user@example.com now'), goal: T('Mail an user@example.com bitte senden', 'Mail user@example.com right now'), block: 'hjklwbe',
              sol: T('WWWibitte <Esc>', 'WWiright <Esc>'), hint: T('Mit <kbd>w</kbd> bräuchtest du viele Sprünge. <kbd>W</kbd> nimmt die Adresse in einem Satz.', 'With <kbd>w</kbd> you would need many jumps. <kbd>W</kbd> takes the address in one go.') },
            { tier: 'final', task: T('Abschluss: Ergänze in jeder Zeile eine Option (<code>-v</code>, <code>-v</code>, <code>-h</code>) vor dem Pfad.', 'Wrap-up: add an option (<code>-v</code>, <code>-v</code>, <code>-h</code>) before the path in every line.'),
              text: '¶cp ./src/main.c ./build/main.o\nrm -rf ./tmp/cache\nls -la ~/projects', goal: 'cp -v ./src/main.c ./build/main.o\nrm -rf -v ./tmp/cache\nls -la -h ~/projects',
              block: 'hlwbe', sol: 'Wi-v <Esc>jWi-v <Esc>jBi-h <Esc>',
              hint: T('Pfade sind lange WORTE. Nach <kbd>j</kbd> stehst du manchmal mitten im WORT: <kbd>B</kbd> bringt dich an seinen Anfang.', 'Paths are long WORDS. After <kbd>j</kbd> you sometimes land inside a WORD: <kbd>B</kbd> takes you to its start.') }
          ]
        },
        {
          id: 'zeile', title: T('Anfang und Ende der Zeile', 'Start and end of line'),
          intro: T('Drei Tasten bringen dich sofort an die Ränder einer Zeile.', 'Three keys take you straight to the edges of a line.'),
          keys: [['0', T('Erste Spalte der Zeile', 'First column of the line')], ['^', T('Erstes Zeichen, das kein Leerzeichen ist', 'First non-blank character')], ['$', T('Letztes Zeichen der Zeile', 'Last character of the line')]],
          body: T(`<p><kbd>0</kbd> springt in die allererste Spalte, <kbd>^</kbd> zum ersten echten Zeichen nach der Einrückung. <kbd>$</kbd> landet auf dem letzten Zeichen. Bei eingerücktem Code ist <kbd>^</kbd> meist das, was du willst.</p>
<p>Die Zeichen kennst du vielleicht aus regulären Ausdrücken: <code>^</code> steht für den Anfang, <code>$</code> für das Ende.</p>`,
            `<p><kbd>0</kbd> jumps to the very first column, <kbd>^</kbd> to the first real character after the indentation. <kbd>$</kbd> lands on the last character. In indented code <kbd>^</kbd> is usually what you want.</p>
<p>You may know the characters from regular expressions: <code>^</code> means start, <code>$</code> means end.</p>`),
          demo: {
            text: '    let ¶x = 10;',
            steps: [['0', T('<kbd>0</kbd>: ganz an den Rand, auch vor die Einrückung.', '<kbd>0</kbd>: all the way to the edge, even before the indentation.')], ['^', T('<kbd>^</kbd>: zum ersten Zeichen, das kein Leerzeichen ist.', '<kbd>^</kbd>: to the first non-blank character.')], ['$', T('<kbd>$</kbd>: aufs letzte Zeichen.', '<kbd>$</kbd>: onto the last character.')]]
          },
          ex: [
            { tier: 'basic', task: T('Erreiche die Ziele mit <kbd>$</kbd>, <kbd>0</kbd> und <kbd>^</kbd>. Für den Zeilenwechsel ist <kbd>j</kbd> erlaubt.', 'Reach the targets with <kbd>$</kbd>, <kbd>0</kbd> and <kbd>^</kbd>. <kbd>j</kbd> is allowed for changing lines.'),
              text: '¶    const name = "Vim";\n    const version = 9◊;\n◊    let mode = "normal";\n    ◊return mode;', block: 'hlwbeWBE', sol: 'j$j0j^' },
            { tier: 'basic', task: T('Erst ganz an den Anfang, dann ans Ende.', 'First to the very start, then to the end.'),
              text: T('◊   ¶mitten im Text, am Rand ist das Ziel◊.', '◊   ¶in the middle, the target is at the edge◊.'), block: 'hlwbeWBE', sol: '0$' },
            { tier: 'combo', task: T('Kommentiere die Zeile aus: <code>// </code> gehört vor das erste Zeichen nach der Einrückung.', 'Comment out the line: <code>// </code> goes before the first character after the indentation.'),
              text: '    return ¶x;', goal: '    // return x;', block: 'hlwbeWBE', sol: '^i// <Esc>',
              hint: T('<kbd>0</kbd> wäre zu weit links. Welche Taste überspringt die Einrückung?', '<kbd>0</kbd> would be too far left. Which key skips the indentation?') },
            { tier: 'final', task: T('Abschluss: Kommentiere alle <code>debug</code>-Zeilen aus und ergänze in der Rechnung <code> + c</code> vor dem Semikolon.', 'Wrap-up: comment out every <code>debug</code> line and add <code> + c</code> before the semicolon in the calculation.'),
              text: '¶    debug(a);\n    debug(b);\nresult = a + b;\n    debug(result);', goal: '    // debug(a);\n    // debug(b);\nresult = a + b + c;\n    // debug(result);',
              block: 'hlwbeWBE', sol: '^i// <Esc>j^i// <Esc>j$i + c<Esc>j^i// <Esc>',
              hint: T('<kbd>^</kbd> für die Kommentare. Für die Rechnung: <kbd>$</kbd> steht auf dem Semikolon, und <kbd>i</kbd> fügt davor ein.', '<kbd>^</kbd> for the comments. For the calculation: <kbd>$</kbd> lands on the semicolon and <kbd>i</kbd> inserts before it.') }
          ]
        },
        {
          id: 'finden', title: T('Zeichen finden', 'Finding characters'),
          intro: T('Springe direkt zu einem bestimmten Zeichen in der Zeile.', 'Jump straight to a specific character in the line.'),
          keys: [['f{z}', T('Zum nächsten Zeichen z', 'To the next character z')], ['F{z}', T('Zum vorherigen Zeichen z', 'To the previous character z')], ['t{z}', T('Bis vor das nächste Zeichen z', 'Until just before the next z')], ['T{z}', T('Bis hinter das vorherige Zeichen z', 'Until just after the previous z')], [';', T('Letzte Suche wiederholen', 'Repeat the last find')], [',', T('Letzte Suche rückwärts wiederholen', 'Repeat the last find backwards')]],
          body: T(`<p><kbd>f</kbd> steht für <i>find</i>: <kbd>fx</kbd> springt auf das nächste <code>x</code> in der Zeile. <kbd>t</kbd> steht für <i>till</i> und hält ein Zeichen davor an. Das ist später mit Operatoren Gold wert: <kbd>dt)</kbd> löscht alles bis zur Klammer, die Klammer selbst bleibt.</p>
<p>Großbuchstaben suchen rückwärts. Mit <kbd>;</kbd> wiederholst du die letzte Suche in dieselbe Richtung, mit <kbd>,</kbd> in die Gegenrichtung.</p>`,
            `<p><kbd>f</kbd> stands for <i>find</i>: <kbd>fx</kbd> jumps onto the next <code>x</code> in the line. <kbd>t</kbd> stands for <i>till</i> and stops one character before it. This becomes gold with operators: <kbd>dt)</kbd> deletes everything up to the bracket and keeps the bracket.</p>
<p>Capital letters search backwards. <kbd>;</kbd> repeats the last find in the same direction, <kbd>,</kbd> in the opposite one.</p>`),
          demo: {
            text: '¶sum(a, b, c);',
            steps: [['f,', T('<kbd>f,</kbd> springt <b>auf</b> das erste Komma.', '<kbd>f,</kbd> jumps <b>onto</b> the first comma.')], [';', T('<kbd>;</kbd> wiederholt: nächstes Komma.', '<kbd>;</kbd> repeats: next comma.')], ['0t)', T('<kbd>t)</kbd> hält ein Zeichen <b>vor</b> der Klammer.', '<kbd>t)</kbd> stops one character <b>before</b> the bracket.')], ['F(', T('<kbd>F(</kbd> sucht rückwärts.', '<kbd>F(</kbd> searches backwards.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe mit <kbd>f</kbd> zu den Zielen.', 'Jump to the targets with <kbd>f</kbd>.'),
              text: T('¶Vim macht Spaß, ◊wirklich! Probier◊s aus◊!', '¶Vim is fun, ◊really! ◊Give it a try◊!'), block: 'hlwbeWBE', sol: T('fwfsf!', 'frfGf!'),
              hint: T('<kbd>f</kbd> plus das Zeichen, auf dem das Ziel liegt. Das erste passende Zeichen rechts vom Cursor gewinnt.', '<kbd>f</kbd> plus the character the target is on. The first match to the right of the cursor wins.') },
            { tier: 'basic', task: T('Lande mit <kbd>t</kbd> jeweils vor dem Trennzeichen. <kbd>;</kbd> hilft.', 'Use <kbd>t</kbd> to land just before each separator. <kbd>;</kbd> helps.'),
              text: '¶result = compute(◊x, ◊y, ◊z);', block: 'hlwbeWBE', sol: 't,;t)' },
            { tier: 'basic', task: T('Rückwärts mit <kbd>F</kbd> und <kbd>;</kbd>.', 'Backwards with <kbd>F</kbd> and <kbd>;</kbd>.'),
              text: '◊ab ◊ab ◊ab ¶!', order: 'reverse', block: 'hlwbeWBE', sol: 'Fa;;' },
            { tier: 'combo', task: T('Ergänze das fehlende Komma nach der Zeichenkette.', 'Add the missing comma after the string.'),
              text: '¶console.log("total:" total);', goal: 'console.log("total:", total);', block: 'hlwbeWBE', sol: 'f i,<Esc>',
              hint: T('Man kann auch nach einem Leerzeichen suchen: <kbd>f</kbd> und dann die Leertaste.', 'You can also find a space: <kbd>f</kbd> followed by the space bar.') },
            { tier: 'combo', task: T('Setze <code>0, </code> als erstes Argument ein.', 'Insert <code>0, </code> as the first argument.'),
              text: 'max(a, b¶)', goal: 'max(0, a, b)', block: 'hlwbeWBE', sol: 'T(i0, <Esc>',
              hint: T('Rückwärts bis <b>hinter</b> die öffnende Klammer: Das ist genau die Aufgabe von <kbd>T</kbd>.', 'Backwards to just <b>after</b> the opening bracket: that is exactly what <kbd>T</kbd> does.') },
            { tier: 'final', task: T('Abschluss: Ergänze die drei fehlenden Kommas zwischen den Argumenten.', 'Wrap-up: add the three missing commas between the arguments.'),
              text: '¶sum(a b) + max(c d)\nlog("done" ok)', goal: 'sum(a, b) + max(c, d)\nlog("done", ok)', block: 'hlwbeWBE', sol: 'f i,<Esc>f(f i,<Esc>jF i,<Esc>',
              hint: T('Springe zuerst zur passenden Klammer mit <kbd>f(</kbd>, dann zum Leerzeichen. In der zweiten Zeile geht es rückwärts schneller.', 'First jump to the right bracket with <kbd>f(</kbd>, then to the space. In the second line going backwards is quicker.') }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'bearbeiten', title: T('Text bearbeiten', 'Editing text'), lessons: [
        {
          id: 'einfuegen', title: T('Einfügen an jeder Stelle', 'Inserting anywhere'),
          intro: T('Vier Wege in den Einfügemodus, jeder für einen anderen Ort.', 'Four ways into insert mode, each for a different place.'),
          keys: [['i', T('Vor dem Cursor einfügen', 'Insert before the cursor')], ['a', T('Nach dem Cursor einfügen', 'Append after the cursor')], ['I', T('Am Zeilenanfang einfügen', 'Insert at the start of the line')], ['A', T('Am Zeilenende einfügen', 'Append at the end of the line')]],
          body: T(`<p><kbd>i</kbd> (<i>insert</i>) und <kbd>a</kbd> (<i>append</i>) unterscheiden sich nur um ein Zeichen: <kbd>i</kbd> schreibt vor das Zeichen unter dem Cursor, <kbd>a</kbd> dahinter. Die großen Varianten sparen dir den Weg: <kbd>A</kbd> springt ans Zeilenende und beginnt dort, <kbd>I</kbd> am ersten Zeichen der Zeile.</p>
<p>Faustregel: Großbuchstaben machen in Vim oft „dasselbe, nur für die ganze Zeile“.</p>`,
            `<p><kbd>i</kbd> (<i>insert</i>) and <kbd>a</kbd> (<i>append</i>) differ by just one character: <kbd>i</kbd> writes before the character under the cursor, <kbd>a</kbd> after it. The capital versions save you the trip: <kbd>A</kbd> jumps to the end of the line and starts there, <kbd>I</kbd> at the first character of the line.</p>
<p>Rule of thumb: capital letters in Vim often mean “the same, but for the whole line”.</p>`),
          demo: {
            text: 'Hall¶o',
            steps: [['i[<Esc>', T('<kbd>i</kbd> schreibt <b>vor</b> das Zeichen unter dem Cursor.', '<kbd>i</kbd> writes <b>before</b> the character under the cursor.')], ['la]<Esc>', T('<kbd>a</kbd> schreibt <b>dahinter</b>.', '<kbd>a</kbd> writes <b>after</b> it.')], ['I> <Esc>', T('<kbd>I</kbd>: an den Zeilenanfang, egal wo der Cursor steht.', '<kbd>I</kbd>: at the start of the line, wherever the cursor is.')], ['A!<Esc>', T('<kbd>A</kbd>: ans Zeilenende.', '<kbd>A</kbd>: at the end of the line.')]]
          },
          ex: [
            { tier: 'basic', task: T('Füge nach dem „o“ ein Komma ein.', 'Add a comma after the “o”.'), text: T('Hall¶o Welt', 'Hell¶o world'), goal: T('Hallo, Welt', 'Hello, world'), sol: 'a,<Esc>' },
            { tier: 'basic', task: T('Hänge ein Semikolon an das Zeilenende.', 'Append a semicolon to the end of the line.'), text: '¶let x = 5', goal: 'let x = 5;', sol: 'A;<Esc>' },
            { tier: 'basic', task: T('Kommentiere die Zeile aus.', 'Comment out the line.'), text: '    console.lo¶g(x);', goal: '    // console.log(x);', sol: 'I// <Esc>' },
            { tier: 'basic', task: T('Setze das Wort zwischen Sternchen.', 'Put the word between asterisks.'), text: T('¶wichtig', '¶important'), goal: T('*wichtig*', '*important*'), sol: 'I*<Esc>A*<Esc>' },
            { tier: 'combo', task: T('Komma nach dem ersten Wort, Ausrufezeichen ans Ende.', 'Comma after the first word, exclamation mark at the end.'),
              text: T('¶Hallo Welt', '¶Hello world'), goal: T('Hallo, Welt!', 'Hello, world!'), sol: 'ea,<Esc>A!<Esc>',
              hint: T('<kbd>e</kbd> bringt dich ans Wortende, <kbd>a</kbd> schreibt dahinter.', '<kbd>e</kbd> takes you to the end of the word, <kbd>a</kbd> writes after it.') },
            { tier: 'final', task: T('Abschluss: Mach aus den Zeilen eine Markdown-Liste mit Überschrift.', 'Wrap-up: turn the lines into a Markdown list with a heading.'),
              text: T('¶Einkaufsliste\nMilch\nBrot\nKäse', '¶Shopping list\nMilk\nBread\nCheese'),
              goal: T('# Einkaufsliste\n- Milch (2x)\n- Brot\n- Käse!', '# Shopping list\n- Milk (2x)\n- Bread\n- Cheese!'),
              sol: 'I# <Esc>jI- <Esc>A (2x)<Esc>jI- <Esc>jI- <Esc>A!<Esc>',
              hint: T('Jede Zeile braucht etwas am Anfang (<kbd>I</kbd>), manche zusätzlich etwas am Ende (<kbd>A</kbd>). Wo der Cursor in der Zeile steht, ist egal.', 'Every line needs something at the start (<kbd>I</kbd>), some also at the end (<kbd>A</kbd>). Where the cursor is in the line does not matter.') }
          ]
        },
        {
          id: 'neue-zeilen', title: T('Neue Zeilen öffnen', 'Opening new lines'),
          intro: T('Neue Zeile darunter oder darüber, und du tippst sofort los.', 'A new line below or above, and you start typing right away.'),
          keys: [['o', T('Neue Zeile unterhalb öffnen', 'Open a new line below')], ['O', T('Neue Zeile oberhalb öffnen', 'Open a new line above')]],
          body: T(`<p><kbd>o</kbd> legt unter der aktuellen Zeile eine neue an und wechselt in den Einfügemodus, egal wo der Cursor in der Zeile steht. <kbd>O</kbd> macht dasselbe oberhalb. Die Einrückung der aktuellen Zeile wird übernommen, und <kbd>Tab</kbd> rückt im Einfügemodus um vier Leerzeichen ein.</p>`,
            `<p><kbd>o</kbd> creates a new line below the current one and switches to insert mode, no matter where the cursor is in the line. <kbd>O</kbd> does the same above. The indentation of the current line is kept, and <kbd>Tab</kbd> in insert mode indents by four spaces.</p>`),
          demo: {
            text: 'def hi():\n    ¶print("a")',
            steps: [['o', T('<kbd>o</kbd>: neue Zeile darunter, mit derselben Einrückung.', '<kbd>o</kbd>: new line below, with the same indentation.')], ['print("b")<Esc>', T('Tippen, dann <kbd>Esc</kbd>.', 'Type, then <kbd>Esc</kbd>.')], ['kO', T('<kbd>O</kbd>: neue Zeile oberhalb.', '<kbd>O</kbd>: new line above.')], ['# start<Esc>', T('Fertig.', 'Done.')]]
          },
          ex: [
            { tier: 'basic', task: T('Ergänze „- Brot“ unter der Milch.', 'Add “- Bread” below the milk.'), text: T('¶Einkaufsliste:\n- Milch', '¶Shopping list:\n- Milk'), goal: T('Einkaufsliste:\n- Milch\n- Brot', 'Shopping list:\n- Milk\n- Bread'), sol: T('jo- Brot<Esc>', 'jo- Bread<Esc>') },
            { tier: 'basic', task: T('Füge über dem print einen Kommentar ein.', 'Add a comment above the print.'), text: 'def greet():\n    ¶print("Hello")', goal: T('def greet():\n    # Sagt Hallo\n    print("Hello")', 'def greet():\n    # Says hello\n    print("Hello")'), sol: T('O# Sagt Hallo<Esc>', 'O# Says hello<Esc>'),
              hint: T('Die Einrückung wird automatisch übernommen. Tippe nur den Kommentar.', 'The indentation is kept automatically. Just type the comment.') },
            { tier: 'basic', task: T('Füge zwischen Titel und Text eine Leerzeile ein.', 'Insert a blank line between title and text.'), text: T('¶Titel\nText', '¶Title\nText'), goal: T('Titel\n\nText', 'Title\n\nText'), sol: 'o<Esc>' },
            { tier: 'combo', task: T('Gib der Funktion einen Körper: <code>return 1</code>, eingerückt.', 'Give the function a body: <code>return 1</code>, indented.'),
              text: '¶def hello():', goal: 'def hello():\n    return 1', sol: 'o<Tab>return 1<Esc>',
              hint: T('Die erste Zeile ist nicht eingerückt, also musst du selbst einrücken: <kbd>Tab</kbd> im Einfügemodus.', 'The first line is not indented, so you have to indent yourself: <kbd>Tab</kbd> in insert mode.') },
            { tier: 'final', task: T('Abschluss: Ergänze einen Kommentar über der Funktion und die return-Zeile darin.', 'Wrap-up: add a comment above the function and the return line inside it.'),
              text: '¶function add(a, b) {\n}', goal: T('// Addiert zwei Zahlen\nfunction add(a, b) {\n    return a + b;\n}', '// Adds two numbers\nfunction add(a, b) {\n    return a + b;\n}'),
              sol: T('O// Addiert zwei Zahlen<Esc>jo<Tab>return a + b;<Esc>', 'O// Adds two numbers<Esc>jo<Tab>return a + b;<Esc>'),
              hint: T('Erst <kbd>O</kbd> für die Zeile darüber, dann zurück zur Funktionszeile und <kbd>o</kbd> für die Zeile darunter.', 'First <kbd>O</kbd> for the line above, then back to the function line and <kbd>o</kbd> for the line below.') }
          ]
        },
        {
          id: 'loeschen', title: T('Löschen', 'Deleting'),
          intro: T('x löscht ein Zeichen, d löscht alles, wohin du dich bewegen kannst.', 'x deletes a character, d deletes anything you can move over.'),
          keys: [['x', T('Zeichen unter dem Cursor löschen', 'Delete the character under the cursor')], ['X', T('Zeichen vor dem Cursor löschen', 'Delete the character before the cursor')], ['dw', T('Bis zum nächsten Wort löschen', 'Delete to the next word')], ['dd', T('Ganze Zeile löschen', 'Delete the whole line')], ['D', T('Bis zum Zeilenende löschen', 'Delete to the end of the line')], ['d{Bewegung}', T('Löschen, so weit die Bewegung reicht', 'Delete as far as the motion goes')]],
          body: T(`<p>Hier lernst du das wichtigste Prinzip von Vim: <b>Operator + Bewegung</b>. <kbd>d</kbd> ist der Lösch-Operator. Er tut erst etwas, wenn du danach sagst, wie weit: <kbd>dw</kbd> löscht bis zum nächsten Wort, <kbd>d$</kbd> bis zum Zeilenende, <kbd>dt)</kbd> bis vor die Klammer. Jede Bewegung, die du gelernt hast, wird so zu einem Löschbefehl.</p>
<p>Ein doppelter Operator wirkt auf die ganze Zeile: <kbd>dd</kbd>. Alles Gelöschte landet übrigens in einem Register und kann wieder eingefügt werden. Löschen ist in Vim also eigentlich Ausschneiden.</p>`,
            `<p>Here you learn Vim's most important principle: <b>operator + motion</b>. <kbd>d</kbd> is the delete operator. It does nothing until you say how far: <kbd>dw</kbd> deletes to the next word, <kbd>d$</kbd> to the end of the line, <kbd>dt)</kbd> up to the bracket. Every motion you have learned becomes a delete command this way.</p>
<p>A doubled operator works on the whole line: <kbd>dd</kbd>. Everything you delete is stored in a register and can be put back. So deleting in Vim is really cutting.</p>`),
          concept: T(`<h4>Operator + Bewegung</h4><p>Lies Befehle wie kleine Sätze: <kbd>d</kbd> „lösche“ + <kbd>w</kbd> „bis zum nächsten Wort“. <kbd>d</kbd> + <kbd>$</kbd> „bis zum Zeilenende“. <kbd>d</kbd> + <kbd>t,</kbd> „bis vor das Komma“. Nach dem <kbd>d</kbd> wartet Vim auf die Bewegung, die Statuszeile zeigt das <code>d</code> so lange an.</p>`,
            `<h4>Operator + motion</h4><p>Read commands like little sentences: <kbd>d</kbd> “delete” + <kbd>w</kbd> “to the next word”. <kbd>d</kbd> + <kbd>$</kbd> “to the end of the line”. <kbd>d</kbd> + <kbd>t,</kbd> “until the comma”. After <kbd>d</kbd> Vim waits for the motion and the status line shows the <code>d</code> meanwhile.</p>`),
          demo: {
            text: '¶let total = sum(a, b); // old',
            steps: [['dw', T('<kbd>dw</kbd>: lösche bis zum nächsten Wort.', '<kbd>dw</kbd>: delete to the next word.')], ['f(', T('Zur Klammer springen ...', 'Jump to the bracket ...')], ['ldt)', T('... und mit <kbd>dt)</kbd> alles bis vor die schließende Klammer löschen.', '... and use <kbd>dt)</kbd> to delete everything up to the closing bracket.')], ['f D', T('<kbd>D</kbd> löscht bis zum Zeilenende.', '<kbd>D</kbd> deletes to the end of the line.')]]
          },
          ex: [
            { tier: 'basic', task: T('Entferne die überzähligen Buchstaben mit <kbd>x</kbd>.', 'Remove the extra letters with <kbd>x</kbd>.'), text: T('V¶iimmm ist super', 'V¶iimmm is great'), goal: T('Vim ist super', 'Vim is great'), sol: 'xlxx' },
            { tier: 'basic', task: T('Lösche das doppelte Wort.', 'Delete the doubled word.'), text: T('Das ist ¶sehr sehr gut', 'This is ¶very very good'), goal: T('Das ist sehr gut', 'This is very good'), sol: 'dw' },
            { tier: 'basic', task: T('Lösche die mittlere Zeile.', 'Delete the middle line.'), text: T('Zeile eins\n¶Diese Zeile muss weg\nZeile zwei', 'Line one\n¶This line has to go\nLine two'), goal: T('Zeile eins\nZeile zwei', 'Line one\nLine two'), sol: 'dd' },
            { tier: 'basic', task: T('Entferne den Kommentar bis zum Zeilenende.', 'Remove the comment up to the end of the line.'), text: 'let x = 5;¶ // old comment', goal: 'let x = 5;', sol: 'D' },
            { tier: 'combo', task: T('Lösche alles bis vor das „c“.', 'Delete everything up to the “c”.'), text: 'sum(¶a + b + c)', goal: 'sum(c)', sol: 'dtc',
              hint: T('Operator plus eine Bewegung aus der letzten Lektion: „bis vor das Zeichen“.', 'Operator plus a motion from the last lesson: “until the character”.') },
            { tier: 'combo', task: T('Entferne die doppelten Klammern.', 'Remove the doubled brackets.'), text: '¶print(("Hi"));', goal: 'print("Hi");', sol: 'f(xf)x',
              hint: T('Springe mit <kbd>f</kbd> hin und lösche mit <kbd>x</kbd>.', 'Jump there with <kbd>f</kbd> and delete with <kbd>x</kbd>.') },
            { tier: 'final', task: T('Abschluss: Räum den Text auf, bis er dem Ziel entspricht.', 'Wrap-up: clean up the text until it matches the goal.'),
              text: T('¶Dies ist ist ein Text,,\nDIESE ZEILE IST ÜBERFLÜSSIG\nmit ein paar Fehlern drin. // TODO entfernen', '¶This is is a text,,\nTHIS LINE IS SUPERFLUOUS\nwith a few mistakes in it. // TODO remove'),
              goal: T('Dies ist ein Text,\nmit ein paar Fehlern drin.', 'This is a text,\nwith a few mistakes in it.'), sol: 'wdwf,xjddf.lD',
              hint: T('Vier Fehler: ein doppeltes Wort, ein doppeltes Komma, eine ganze Zeile und ein Kommentar am Zeilenende.', 'Four problems: a doubled word, a doubled comma, a whole line and a comment at the end of a line.') }
          ]
        },
        {
          id: 'undo', title: T('Rückgängig und wiederholen', 'Undo and redo'),
          intro: T('Fehler sind in Vim billig. Ein Tastendruck und alles ist wie vorher.', 'Mistakes are cheap in Vim. One key and everything is back.'),
          keys: [['u', T('Letzte Änderung rückgängig machen', 'Undo the last change')], ['<C-r>', T('Rückgängig gemachte Änderung wiederherstellen', 'Redo an undone change')]],
          body: T(`<p><kbd>u</kbd> nimmt die letzte Änderung zurück. Eine Änderung ist dabei immer ein ganzer Befehl: Alles, was du in einem Einfügemodus-Durchgang tippst, verschwindet mit einem einzigen <kbd>u</kbd>. <kbd>Ctrl-r</kbd> stellt sie wieder her.</p>
<p>Undo und Redo bilden eine Kette. Machst du nach einem <kbd>u</kbd> eine neue Änderung, ist das Rückgängiggemachte nicht mehr per <kbd>Ctrl-r</kbd> erreichbar.</p>`,
            `<p><kbd>u</kbd> takes back the last change. A change is always one whole command: everything you type in one trip through insert mode disappears with a single <kbd>u</kbd>. <kbd>Ctrl-r</kbd> brings it back.</p>
<p>Undo and redo form a chain. If you make a new change after <kbd>u</kbd>, the undone change can no longer be reached with <kbd>Ctrl-r</kbd>.</p>`),
          demo: {
            text: '¶one two three',
            steps: [['dw', T('Lösche „one“.', 'Delete “one”.')], ['dw', T('Und „two“.', 'And “two”.')], ['u', T('<kbd>u</kbd> holt „two“ zurück.', '<kbd>u</kbd> brings back “two”.')], ['u', T('Noch einmal: „one“ ist auch zurück.', 'Again: “one” is back too.')], ['<C-r>', T('<kbd>Ctrl-r</kbd> wiederholt die erste Löschung.', '<kbd>Ctrl-r</kbd> redoes the first deletion.')]]
          },
          ex: [
            { tier: 'basic', task: T('Lösche „richtig“ mit <kbd>dw</kbd> und hole es mit <kbd>u</kbd> zurück.', 'Delete “right” with <kbd>dw</kbd> and bring it back with <kbd>u</kbd>.'),
              text: T('Das ist ¶richtig.', 'This is ¶right.'), goal: T('Das ist richtig.', 'This is right.'), require: ['dw', 'u'], sol: 'dwu' },
            { tier: 'basic', task: T('Lösche das mittlere Wort, mache es rückgängig und stelle die Löschung mit <kbd>Ctrl-r</kbd> wieder her.', 'Delete the middle word, undo it and redo the deletion with <kbd>Ctrl-r</kbd>.'),
              text: T('Eins ¶zwei drei', 'One ¶two three'), goal: T('Eins drei', 'One three'), require: ['u', '<C-r>'], sol: 'dwu<C-r>' },
            { tier: 'final', task: T('Abschluss: Jemand hat zuerst versehentlich eine Zeile gelöscht und danach „ (erledigt)“ an die erste Zeile gehängt. Mache beides rückgängig und hänge „ (erledigt)“ selbst wieder an.', 'Wrap-up: someone accidentally deleted a line and then appended “ (done)” to the first line. Undo both and append “ (done)” again yourself.'),
              text: T('Einkaufen\nWichtig: Steuern\nSport', 'Shopping\nImportant: taxes\nSport'), pre: T('jddkA (erledigt)<Esc>', 'jddkA (done)<Esc>'),
              goal: T('Einkaufen (erledigt)\nWichtig: Steuern\nSport', 'Shopping (done)\nImportant: taxes\nSport'), require: ['u'], sol: T('uukA (erledigt)<Esc>', 'uukA (done)<Esc>'),
              hint: T('Undo geht nur der Reihe nach rückwärts. Um an die Löschung zu kommen, musst du erst die spätere Änderung zurücknehmen.', 'Undo only goes backwards in order. To reach the deletion you first have to undo the later change.') }
          ]
        },
        {
          id: 'aendern', title: T('Ändern', 'Changing'),
          intro: T('c ist Löschen und Einfügen in einem Schritt.', 'c is delete and insert in one step.'),
          keys: [['cw', T('Wort ändern', 'Change word')], ['c{Bewegung}', T('Ändern, so weit die Bewegung reicht', 'Change as far as the motion goes')], ['cc', T('Ganze Zeile ändern', 'Change the whole line')], ['C', T('Bis zum Zeilenende ändern', 'Change to the end of the line')], ['s', T('Zeichen ersetzen und einfügen', 'Substitute character and insert')], ['S', T('Zeile ersetzen (wie cc)', 'Substitute line (like cc)')]],
          body: T(`<p><kbd>c</kbd> (<i>change</i>) funktioniert wie <kbd>d</kbd>, wechselt danach aber direkt in den Einfügemodus. Statt <kbd>dw</kbd> und <kbd>i</kbd> tippst du nur <kbd>cw</kbd>. Das spart nicht nur eine Taste: Die gesamte Änderung zählt als ein Befehl und lässt sich später mit dem Punkt wiederholen.</p>
<p>Kleine Besonderheit: <kbd>cw</kbd> ändert nur bis zum Wortende, nicht bis zum nächsten Wort. Das Leerzeichen danach bleibt stehen.</p>`,
            `<p><kbd>c</kbd> (<i>change</i>) works like <kbd>d</kbd> but then switches straight to insert mode. Instead of <kbd>dw</kbd> and <kbd>i</kbd> you just type <kbd>cw</kbd>. That saves more than a key: the whole change counts as one command and can later be repeated with the dot.</p>
<p>A small quirk: <kbd>cw</kbd> only changes to the end of the word, not to the next word. The space after it stays.</p>`),
          demo: {
            text: '¶let color = "red";',
            steps: [['cwconst<Esc>', T('<kbd>cw</kbd> löscht „let“ und lässt dich sofort tippen.', '<kbd>cw</kbd> deletes “let” and lets you type right away.')], ['f"l', T('In die Zeichenkette springen.', 'Jump into the string.')], ['ct"blue<Esc>', T('<kbd>ct"</kbd>: ändere bis vor das Anführungszeichen.', '<kbd>ct"</kbd>: change up to the quote.')]]
          },
          ex: [
            { tier: 'basic', task: T('Ersetze „Emacs“ durch „Vim“.', 'Replace “Emacs” with “Vim”.'), text: T('Ich mag ¶Emacs.', 'I like ¶Emacs.'), goal: T('Ich mag Vim.', 'I like Vim.'), sol: 'cwVim<Esc>' },
            { tier: 'basic', task: T('Ändere den Rest der Zeile zu „online“.', 'Change the rest of the line to “online”.'), text: T('status: ¶offline seit gestern', 'status: ¶offline since yesterday'), goal: 'status: online', sol: 'Conline<Esc>' },
            { tier: 'basic', task: T('Ersetze die mittlere Zeile durch „Zeile B“.', 'Replace the middle line with “Line B”.'), text: T('Zeile A\n¶Ersetze mich komplett\nZeile C', 'Line A\n¶Replace me completely\nLine C'), goal: T('Zeile A\nZeile B\nZeile C', 'Line A\nLine B\nLine C'), sol: T('ccZeile B<Esc>', 'ccLine B<Esc>') },
            { tier: 'basic', task: T('Der Preis steigt auf 5 Euro.', 'The price goes up to 5 euros.'), text: T('Kaffee kostet ¶3 Euro', 'Coffee costs ¶3 euros'), goal: T('Kaffee kostet 5 Euro', 'Coffee costs 5 euros'), sol: 's5<Esc>' },
            { tier: 'combo', task: T('Ändere „red“ zu „blue“, aber behalte das Komma.', 'Change “red” to “blue” but keep the comma.'), text: 'color(¶red, green)', goal: 'color(blue, green)', sol: 'ct,blue<Esc>',
              hint: T('<kbd>c</kbd> plus „bis vor das Komma“.', '<kbd>c</kbd> plus “until the comma”.') },
            { tier: 'final', task: T('Abschluss: Baue den Code wie im Ziel um.', 'Wrap-up: rework the code to match the goal.'),
              text: '¶let color = "red";\nlet size = 10;\nconsole.log(color, size);', goal: 'const color = "blue";\nconst size = 12;\nprint(color, size);',
              sol: 'cwconst<Esc>f"lct"blue<Esc>j0cwconst<Esc>f1cw12<Esc>j0ct(print<Esc>',
              hint: T('Fünf Änderungen. Für <code>console.log</code> hilft „ändern bis vor die Klammer“, für die Zahl ein Sprung mit <kbd>f</kbd>.', 'Five changes. For <code>console.log</code> use “change until the bracket”, for the number a jump with <kbd>f</kbd>.') }
          ]
        },
        {
          id: 'zaehlen', title: T('Zählen', 'Counts'),
          intro: T('Eine Zahl vor einem Befehl wiederholt ihn.', 'A number before a command repeats it.'),
          keys: [['3w', T('Drei Wörter weiter', 'Three words forward')], ['5j', T('Fünf Zeilen nach unten', 'Five lines down')], ['d3w', T('Drei Wörter löschen', 'Delete three words')], ['3dd', T('Drei Zeilen löschen', 'Delete three lines')], ['4x', T('Vier Zeichen löschen', 'Delete four characters')]],
          body: T(`<p>Fast jeder Befehl nimmt eine Zahl an. <kbd>5j</kbd> geht fünf Zeilen nach unten, <kbd>3x</kbd> löscht drei Zeichen. Bei Operatoren kann die Zahl vor oder nach dem Operator stehen: <kbd>d3w</kbd> und <kbd>3dw</kbd> tun dasselbe.</p>
<p>Lies Vim-Befehle wie Sätze: <kbd>d3w</kbd> heißt „lösche drei Wörter“.</p>`,
            `<p>Almost every command accepts a number. <kbd>5j</kbd> moves five lines down, <kbd>3x</kbd> deletes three characters. With operators the number can go before or after the operator: <kbd>d3w</kbd> and <kbd>3dw</kbd> do the same thing.</p>
<p>Read Vim commands like sentences: <kbd>d3w</kbd> means “delete three words”.</p>`),
          demo: {
            text: '¶one two three four five six',
            steps: [['3w', T('<kbd>3w</kbd>: drei Wörter weiter.', '<kbd>3w</kbd>: three words forward.')], ['d2w', T('<kbd>d2w</kbd>: lösche zwei Wörter.', '<kbd>d2w</kbd>: delete two words.')], ['0', T('Zurück an den Anfang.', 'Back to the start.')], ['3x', T('<kbd>3x</kbd>: drei Zeichen weg.', '<kbd>3x</kbd>: three characters gone.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe jeweils drei Wörter weiter.', 'Jump three words at a time.'), text: T('¶eins zwei drei ◊vier fünf sechs ◊sieben acht neun ◊zehn', '¶one two three ◊four five six ◊seven eight nine ◊ten'), block: 'hjkl', sol: '3w3w3w' },
            { tier: 'basic', task: T('Lösche die vier überflüssigen Wörter auf einmal.', 'Delete the four unnecessary words at once.'), text: T('Das ist ¶ein sehr sehr langer Satz.', 'This is ¶a very very long sentence.'), goal: T('Das ist Satz.', 'This is sentence.'), sol: 'd4w' },
            { tier: 'basic', task: T('Springe mit Zahlen zu Punkt 6 und dann zurück zu Punkt 2.', 'Use counts to jump to item 6 and back to item 2.'),
              text: T('¶Punkt 1\n◊Punkt 2\nPunkt 3\nPunkt 4\nPunkt 5\n◊Punkt 6\nPunkt 7\nPunkt 8', '¶Item 1\n◊Item 2\nItem 3\nItem 4\nItem 5\n◊Item 6\nItem 7\nItem 8'), order: 'reverse', sol: '5j4k' },
            { tier: 'basic', task: T('Lösche die drei „weg“-Zeilen mit einem Befehl.', 'Delete the three “gone” lines with one command.'), text: T('behalten\n¶weg 1\nweg 2\nweg 3\nbehalten', 'keep\n¶gone 1\ngone 2\ngone 3\nkeep'), goal: T('behalten\nbehalten', 'keep\nkeep'), sol: '3dd' },
            { tier: 'basic', task: T('Ein Ausrufezeichen reicht.', 'One exclamation mark is enough.'), text: T('Hallo¶!!!!!', 'Hello¶!!!!!'), goal: T('Hallo!', 'Hello!'), sol: '4x' },
            { tier: 'final', task: T('Abschluss: Lösche die drei „alt“-Zeilen, die drei überflüssigen Wörter und die überzähligen Ausrufezeichen.', 'Wrap-up: delete the three “old” lines, the three extra words and the surplus exclamation marks.'),
              text: T('¶Notizen:\nalt\nalt\nalt\nDas ist ein sehr sehr sehr langer Satz.\nEnde!!!!!', '¶Notes:\nold\nold\nold\nThis is a very very very long sentence.\nEnd!!!!!'),
              goal: T('Notizen:\nDas ist ein langer Satz.\nEnde!', 'Notes:\nThis is a long sentence.\nEnd!'), sol: 'j3dd3wd3wj0f!4x',
              hint: T('Jeder Teil ist ein Befehl mit Zahl: Zeilen, Wörter, Zeichen.', 'Each part is a command with a count: lines, words, characters.') }
          ]
        },
        {
          id: 'ersetzen', title: T('Zeichen ersetzen', 'Replacing characters'),
          intro: T('Einzelne Zeichen tauschen, ohne den Normalmodus zu verlassen.', 'Swap single characters without leaving normal mode.'),
          keys: [['r{z}', T('Zeichen unter dem Cursor durch z ersetzen', 'Replace the character under the cursor with z')], ['R', T('Ersetzungsmodus: überschreibt beim Tippen', 'Replace mode: overwrite while typing')], ['~', T('Groß- und Kleinschreibung umschalten', 'Toggle upper/lower case')]],
          body: T(`<p><kbd>r</kbd> ersetzt genau ein Zeichen, und du bleibst im Normalmodus. <kbd>R</kbd> startet den Ersetzungsmodus, in dem jedes getippte Zeichen das vorhandene überschreibt, wie die Einfg-Taste in anderen Editoren. Mit <kbd>Backspace</kbd> holst du im Ersetzungsmodus das Original zurück.</p>
<p><kbd>~</kbd> schaltet Groß- und Kleinschreibung des Zeichens um und rückt einen Schritt weiter.</p>`,
            `<p><kbd>r</kbd> replaces exactly one character and you stay in normal mode. <kbd>R</kbd> starts replace mode, where every typed character overwrites the existing one, like the Insert key in other editors. <kbd>Backspace</kbd> in replace mode restores the original.</p>
<p><kbd>~</kbd> toggles the case of the character and moves one step on.</p>`),
          demo: {
            text: 'year ¶1999, Vim',
            steps: [['R2026<Esc>', T('<kbd>R</kbd> überschreibt Zeichen für Zeichen.', '<kbd>R</kbd> overwrites character by character.')], ['f,r;', T('<kbd>r;</kbd> ersetzt genau ein Zeichen.', '<kbd>r;</kbd> replaces exactly one character.')], ['0~', T('<kbd>~</kbd> schaltet die Schreibweise um.', '<kbd>~</kbd> toggles the case.')]]
          },
          ex: [
            { tier: 'basic', task: T('Korrigiere den Tippfehler.', 'Fix the typo.'), text: T('Hallo Wel¶f', 'Hello worl¶f'), goal: T('Hallo Welt', 'Hello world'), sol: T('rt', 'rd') },
            { tier: 'basic', task: T('Überschreibe die Jahreszahl mit 2026.', 'Overwrite the year with 2026.'), text: T('Das Jahr ist ¶1999', 'The year is ¶1999'), goal: T('Das Jahr ist 2026', 'The year is 2026'), sol: 'R2026<Esc>' },
            { tier: 'basic', task: T('Schreibe „vIM“ richtig.', 'Fix the case of “vIM”.'), text: T('¶vIM ist toll', '¶vIM is great'), goal: T('Vim ist toll', 'Vim is great'), sol: '3~' },
            { tier: 'combo', task: T('Mach aus den Unterstrichen Pluszeichen.', 'Turn the underscores into plus signs.'), text: 'a ¶_ b _ c', goal: 'a + b + c', sol: 'r+f_r+',
              hint: T('Ersetzen, zum nächsten Unterstrich springen, wieder ersetzen.', 'Replace, jump to the next underscore, replace again.') },
            { tier: 'final', task: T('Abschluss: Aktualisiere Datum, Schreibweise und Preis.', 'Wrap-up: update date, capitalisation and price.'),
              text: T('¶Datum: 1999-12-31\nstatus: offen\nPreis: 9.99', '¶Date: 1999-12-31\nstatus: open\nPrice: 9.99'),
              goal: T('Datum: 2026-10-28\nStatus: offen\nPreis: 9,99', 'Date: 2026-10-28\nStatus: open\nPrice: 8.99'),
              sol: T('f1R2026-10-28<Esc>j0~jf.r,', 'f1R2026-10-28<Esc>j0~jf9r8'),
              hint: T('Das Datum ist ein Fall für <kbd>R</kbd>, der Rest sind einzelne Zeichen.', 'The date is a job for <kbd>R</kbd>, the rest are single characters.') }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'kopieren', title: T('Kopieren und Auswählen', 'Copying and selecting'), lessons: [
        {
          id: 'yank-put', title: T('Kopieren und Einfügen', 'Yank and put'),
          intro: T('In Vim heißt Kopieren „yank“ und Einfügen „put“.', 'In Vim, copy is called “yank” and paste is called “put”.'),
          keys: [['yy', T('Zeile kopieren', 'Yank the line')], ['y{Bewegung}', T('Kopieren, so weit die Bewegung reicht', 'Yank as far as the motion goes')], ['p', T('Hinter dem Cursor bzw. unter der Zeile einfügen', 'Put after the cursor or below the line')], ['P', T('Vor dem Cursor bzw. über der Zeile einfügen', 'Put before the cursor or above the line')]],
          body: T(`<p><kbd>y</kbd> ist ein Operator wie <kbd>d</kbd>, nur dass der Text stehen bleibt. Zum Einfügen gibt es zwei Tasten, und welche du brauchst, hängt davon ab, <b>was</b> du kopiert hast:</p>
<p>Hast du <b>ganze Zeilen</b> kopiert (<kbd>yy</kbd>, <kbd>dd</kbd>), fügt <kbd>p</kbd> sie <b>unter</b> der aktuellen Zeile ein und <kbd>P</kbd> <b>darüber</b>. Hast du <b>ein Stück Text</b> kopiert (<kbd>yw</kbd>, <kbd>x</kbd>), landet es mit <kbd>p</kbd> <b>hinter</b> dem Cursor und mit <kbd>P</kbd> <b>davor</b>.</p>
<p>Weil auch <kbd>d</kbd> und <kbd>x</kbd> den Text speichern, entstehen zwei klassische Kniffe: <kbd>ddp</kbd> tauscht zwei Zeilen, <kbd>xp</kbd> tauscht zwei Buchstaben.</p>`,
            `<p><kbd>y</kbd> is an operator like <kbd>d</kbd>, except the text stays where it is. There are two keys for putting, and which one you need depends on <b>what</b> you yanked:</p>
<p>If you yanked <b>whole lines</b> (<kbd>yy</kbd>, <kbd>dd</kbd>), <kbd>p</kbd> puts them <b>below</b> the current line and <kbd>P</kbd> <b>above</b> it. If you yanked <b>a piece of text</b> (<kbd>yw</kbd>, <kbd>x</kbd>), <kbd>p</kbd> puts it <b>after</b> the cursor and <kbd>P</kbd> <b>before</b> it.</p>
<p>Because <kbd>d</kbd> and <kbd>x</kbd> store the text too, two classic tricks follow: <kbd>ddp</kbd> swaps two lines, <kbd>xp</kbd> swaps two letters.</p>`),
          concept: T(`<h4>Kleines p oder großes P?</h4><p>Merkhilfe: <b>P</b> ist das „größere“ Zeichen und schiebt sich <b>vor</b> den Cursor. Bei Zeilen heißt „vor“ einfach „darüber“. Kleines <b>p</b> kommt dahinter bzw. darunter.</p>`,
            `<h4>Small p or capital P?</h4><p>Memory aid: <b>P</b> is the “bigger” one and pushes itself <b>in front of</b> the cursor. For lines, “in front” simply means “above”. Small <b>p</b> goes after or below.</p>`),
          demo: {
            text: '¶first\nsecond',
            steps: [['yy', T('<kbd>yy</kbd> kopiert die ganze Zeile.', '<kbd>yy</kbd> yanks the whole line.')], ['jp', T('<kbd>p</kbd>: ganze Zeilen landen <b>unter</b> der aktuellen Zeile.', '<kbd>p</kbd>: whole lines go <b>below</b> the current line.')], ['P', T('<kbd>P</kbd>: dieselbe Zeile noch einmal, diesmal <b>darüber</b>.', '<kbd>P</kbd>: the same line again, this time <b>above</b>.')], ['ggyw', T('<kbd>yw</kbd> kopiert nur ein Wort, also ein Stück Text.', '<kbd>yw</kbd> yanks just a word, so a piece of text.')], ['$p', T('Ein Stück Text landet mit <kbd>p</kbd> <b>hinter</b> dem Cursor.', 'With <kbd>p</kbd> a piece of text goes <b>after</b> the cursor.')]]
          },
          ex: [
            { tier: 'basic', task: T('Verdopple die Zeile.', 'Duplicate the line.'), text: T('¶Zeile zum Kopieren', '¶Line to copy'), goal: T('Zeile zum Kopieren\nZeile zum Kopieren', 'Line to copy\nLine to copy'), sol: 'yyp' },
            { tier: 'basic', task: T('Kopiere die letzte Zeile und füge sie mit <kbd>P</kbd> ganz oben <b>über</b> der ersten Zeile ein.', 'Yank the last line and use <kbd>P</kbd> to put it at the very top, <b>above</b> the first line.'),
              text: T('Zeile A\nZeile B\n¶Titel', 'Line A\nLine B\n¶Title'), goal: T('Titel\nZeile A\nZeile B\nTitel', 'Title\nLine A\nLine B\nTitle'), sol: 'yykkP',
              hint: T('Ganze Zeilen fügt <kbd>P</kbd> über der Zeile ein, auf der der Cursor steht. Geh also erst auf die erste Zeile.', '<kbd>P</kbd> puts whole lines above the line the cursor is on. So go to the first line first.') },
            { tier: 'basic', task: T('Bring die Zeilen in die richtige Reihenfolge.', 'Put the lines in the right order.'), text: T('¶zwei\neins\ndrei', '¶two\none\nthree'), goal: T('eins\nzwei\ndrei', 'one\ntwo\nthree'), sol: 'ddp',
              hint: T('<kbd>dd</kbd> schneidet die Zeile aus, und <kbd>p</kbd> fügt sie unter der nächsten wieder ein.', '<kbd>dd</kbd> cuts the line and <kbd>p</kbd> puts it back below the next one.') },
            { tier: 'basic', task: T('Tausche die vertauschten Buchstaben.', 'Swap the swapped letters.'), text: T('V¶mi ist toll', 'V¶mi is great'), goal: T('Vim ist toll', 'Vim is great'), sol: 'xp' },
            { tier: 'basic', task: T('Verdopple das erste Wort mit <kbd>yw</kbd> und <kbd>P</kbd>.', 'Duplicate the first word with <kbd>yw</kbd> and <kbd>P</kbd>.'), text: T('¶sehr gut', '¶very good'), goal: T('sehr sehr gut', 'very very good'), sol: 'ywP',
              hint: T('<kbd>yw</kbd> kopiert das Wort samt Leerzeichen. <kbd>P</kbd> setzt es <b>vor</b> den Cursor.', '<kbd>yw</kbd> yanks the word including the space. <kbd>P</kbd> puts it <b>before</b> the cursor.') },
            { tier: 'combo', task: T('Verschiebe das Wort an die richtige Stelle.', 'Move the word to the right place.'), text: T('Ein ¶Auto rotes fährt.', 'A ¶car red drives.'), goal: T('Ein rotes Auto fährt.', 'A red car drives.'), sol: 'dwwP',
              hint: T('Ausschneiden mit <kbd>dw</kbd>, dann vor das übernächste Wort setzen.', 'Cut with <kbd>dw</kbd>, then put it in front of the word after next.') },
            { tier: 'final', task: T('Abschluss: Sortiere die Schritte und korrigiere den Buchstabendreher in der letzten Zeile.', 'Wrap-up: sort the steps and fix the swapped letters in the last line.'),
              text: T('¶3. Testen\n1. Planen\n2. Bauen\nFretig', '¶3. Test\n1. Plan\n2. Build\nDnoe'), goal: T('1. Planen\n2. Bauen\n3. Testen\nFertig', '1. Plan\n2. Build\n3. Test\nDone'), sol: 'ddpddpjlxp',
              hint: T('Zeile 3 muss zweimal eine Zeile nach unten wandern. Für den Dreher reicht ein Paar aus zwei Tasten.', 'Line 3 has to move down one line twice. The swapped letters need a two-key pair.') }
          ]
        },
        {
          id: 'visuell', title: T('Visueller Modus', 'Visual mode'),
          intro: T('Erst markieren, dann handeln.', 'Select first, then act.'),
          keys: [['v', T('Zeichenweise markieren', 'Select characters')], ['V', T('Zeilenweise markieren', 'Select lines')], ['<C-v>', T('Rechteckig markieren (Block)', 'Select a rectangle (block)')], ['o', T('Zum anderen Ende der Markierung', 'Go to the other end of the selection')], ['d / y / c / > / U', T('Auf die Markierung anwenden', 'Apply to the selection')], ['I / A', T('Im Block vor bzw. nach jeder Zeile einfügen', 'In block mode insert before or after on every line')]],
          body: T(`<p>Im visuellen Modus siehst du, worauf ein Befehl wirkt. Starte mit <kbd>v</kbd>, bewege dich mit allen bekannten Bewegungen und drücke dann einen Operator wie <kbd>d</kbd>, <kbd>y</kbd>, <kbd>c</kbd> oder <kbd>></kbd>. Die Reihenfolge ist also umgekehrt: erst die Strecke, dann die Aktion.</p>
<p>Der Blockmodus mit <kbd>Ctrl-v</kbd> markiert ein Rechteck. Mit <kbd>I</kbd> tippst du Text, der nach <kbd>Esc</kbd> in jeder markierten Zeile erscheint. Perfekt zum Auskommentieren.</p>`,
            `<p>Visual mode shows you what a command will affect. Start with <kbd>v</kbd>, move with any motion you know and then press an operator like <kbd>d</kbd>, <kbd>y</kbd>, <kbd>c</kbd> or <kbd>></kbd>. The order is reversed: the stretch first, then the action.</p>
<p>Block mode with <kbd>Ctrl-v</kbd> selects a rectangle. With <kbd>I</kbd> you type text that appears on every selected line after <kbd>Esc</kbd>. Perfect for commenting out.</p>`),
          demo: {
            text: '¶alpha();\nbeta();\ngamma();',
            steps: [['Vj', T('<kbd>V</kbd> markiert ganze Zeilen, <kbd>j</kbd> erweitert.', '<kbd>V</kbd> selects whole lines, <kbd>j</kbd> extends.')], ['>', T('<kbd>></kbd> rückt die Markierung ein.', '<kbd>></kbd> indents the selection.')], ['G0<C-v>kk', T('<kbd>Ctrl-v</kbd> markiert einen Block, hier eine Spalte über drei Zeilen.', '<kbd>Ctrl-v</kbd> selects a block, here one column across three lines.')], ['I# <Esc>', T('<kbd>I</kbd>, tippen, <kbd>Esc</kbd>: Der Text erscheint in jeder Zeile.', '<kbd>I</kbd>, type, <kbd>Esc</kbd>: the text appears on every line.')]]
          },
          ex: [
            { tier: 'basic', task: T('Markiere „diesen ganzen Teil hier “ und lösche ihn.', 'Select “this whole part here ” and delete it.'), text: T('Lösche ¶diesen ganzen Teil hier und behalte den Rest.', 'Delete ¶this whole bit here and keep the rest.'), goal: T('Lösche und behalte den Rest.', 'Delete and keep the rest.'), sol: T('vtud', 'vtad'),
              hint: T('Starte mit <kbd>v</kbd> und erweitere bis vor das Wort, das bleiben soll. <kbd>t</kbd> funktioniert auch hier.', 'Start with <kbd>v</kbd> and extend up to the word that should stay. <kbd>t</kbd> works here too.') },
            { tier: 'basic', task: T('Lösche die beiden mittleren Zeilen zeilenweise.', 'Delete the two middle lines linewise.'), text: T('Behalten\n¶Weg damit 1\nWeg damit 2\nAuch behalten', 'Keep\n¶Get rid of 1\nGet rid of 2\nAlso keep'), goal: T('Behalten\nAuch behalten', 'Keep\nAlso keep'), sol: 'Vjd' },
            { tier: 'basic', task: T('Rücke beide log-Zeilen ein.', 'Indent both log lines.'), text: 'if (ok) {\n¶log("a");\nlog("b");\n}', goal: 'if (ok) {\n    log("a");\n    log("b");\n}', sol: 'Vj>' },
            { tier: 'basic', task: T('Kommentiere alle drei Zeilen mit dem Blockmodus aus.', 'Comment out all three lines using block mode.'), text: '¶alpha();\nbeta();\ngamma();', goal: '// alpha();\n// beta();\n// gamma();', sol: '<C-v>jjI// <Esc>',
              hint: T('Block über die erste Spalte aller drei Zeilen, dann <kbd>I</kbd>. Der Text erscheint erst nach <kbd>Esc</kbd> in allen Zeilen.', 'Block over the first column of all three lines, then <kbd>I</kbd>. The text shows up on all lines only after <kbd>Esc</kbd>.') },
            { tier: 'combo', task: T('Schreibe das mittlere Wort in Großbuchstaben.', 'Make the middle word uppercase.'), text: T('Mach ¶dies groß', 'Make ¶this loud'), goal: T('Mach DIES groß', 'Make THIS loud'), sol: 'veU',
              hint: T('Markieren bis zum Wortende, dann <kbd>U</kbd> für Großbuchstaben.', 'Select to the end of the word, then <kbd>U</kbd> for uppercase.') },
            { tier: 'final', task: T('Abschluss: Entferne den alten Code oben und kommentiere die beiden log-Zeilen eingerückt aus.', 'Wrap-up: remove the old code at the top and comment out the two log lines, indented.'),
              text: '¶// old code\nfoo();\nbar();\nif (debug) {\nlog("a");\nlog("b");\n}', goal: 'if (debug) {\n    // log("a");\n    // log("b");\n}',
              sol: 'Vjjdj<C-v>jI// <Esc>Vj>',
              hint: T('Drei Schritte mit drei Markierungsarten: Zeilen löschen, Block für die Kommentare, Zeilen einrücken.', 'Three steps with three selection kinds: delete lines, block for the comments, indent lines.') }
          ]
        },
        {
          id: 'textobjekte', title: T('Textobjekte', 'Text objects'),
          intro: T('Sag Vim, was du meinst: das Wort, die Klammer, den Absatz.', 'Tell Vim what you mean: the word, the bracket, the paragraph.'),
          keys: [['iw / aw', T('Inneres Wort / Wort mit Leerzeichen', 'Inner word / word with space')], ['i" / a"', T('Inhalt der Anführungszeichen / mit Zeichen', 'Inside quotes / including quotes')], ['i( / a(', T('Inhalt der Klammer / mit Klammern', 'Inside brackets / including brackets')], ['i{ / i[ / i<', T('Inhalt geschweifter, eckiger, spitzer Klammern', 'Inside curly, square, angle brackets')], ['it / at', T('Inhalt eines HTML-Tags / mit Tag', 'Inside an HTML tag / including the tag')], ['ip / ap', T('Absatz / Absatz mit Leerzeile', 'Paragraph / paragraph with blank line')]],
          body: T(`<p>Textobjekte funktionieren nur nach einem Operator oder im visuellen Modus. <kbd>i</kbd> heißt <i>inner</i> (nur der Inhalt), <kbd>a</kbd> heißt <i>around</i> (Inhalt plus Rahmen). Das Schöne: Der Cursor muss nur irgendwo im Objekt stehen. <kbd>ciw</kbd> ändert das Wort, egal ob du am Anfang, in der Mitte oder am Ende stehst.</p>
<p><kbd>ci"</kbd>, <kbd>di(</kbd> und <kbd>cit</kbd> wirst du beim Programmieren täglich benutzen.</p>`,
            `<p>Text objects only work after an operator or in visual mode. <kbd>i</kbd> means <i>inner</i> (just the content), <kbd>a</kbd> means <i>around</i> (content plus its frame). The nice part: the cursor only has to be somewhere inside the object. <kbd>ciw</kbd> changes the word whether you are at its start, middle or end.</p>
<p>You will use <kbd>ci"</kbd>, <kbd>di(</kbd> and <kbd>cit</kbd> every day when programming.</p>`),
          demo: {
            text: 'call(¶"old name", 42)',
            steps: [['ci"', T('<kbd>ci"</kbd>: Inhalt der Anführungszeichen ändern. Die Zeichen selbst bleiben.', '<kbd>ci"</kbd>: change inside the quotes. The quotes themselves stay.')], ['new<Esc>', T('Neuen Inhalt tippen.', 'Type the new content.')], ['di(', T('<kbd>di(</kbd>: Klammerinhalt löschen, von irgendwo innerhalb.', '<kbd>di(</kbd>: delete the bracket content from anywhere inside.')], ['u', T('Rückgängig ...', 'Undo ...')], ['da(', T('... und <kbd>da(</kbd> nimmt die Klammern mit.', '... and <kbd>da(</kbd> takes the brackets too.')]]
          },
          ex: [
            { tier: 'basic', task: T('Ändere die Farbe zu „rot“. Der Cursor steht mitten im Wort.', 'Change the colour to “red”. The cursor is in the middle of the word.'), text: T('Die Farbe ist bl¶au.', 'The colour is bl¶ue.'), goal: T('Die Farbe ist rot.', 'The colour is red.'), sol: T('ciwrot<Esc>', 'ciwred<Esc>') },
            { tier: 'basic', task: T('Ersetze den Inhalt der Anführungszeichen durch „New“.', 'Replace the contents of the quotes with “New”.'), text: 'title = "Old ¶title";', goal: 'title = "New";', sol: 'ci"New<Esc>' },
            { tier: 'basic', task: T('Leere die Klammer.', 'Empty the brackets.'), text: 'compute(¶a, b, c)', goal: 'compute()', sol: 'di(' },
            { tier: 'basic', task: T('Entferne das Wort samt Leerzeichen.', 'Remove the word including its space.'), text: T('Das ist ein ¶unnötiges Wort.', 'This is a ¶totally useful tip.'), goal: T('Das ist ein Wort.', 'This is a useful tip.'), sol: 'daw',
              hint: T('<kbd>aw</kbd> nimmt das Leerzeichen mit, <kbd>iw</kbd> nicht.', '<kbd>aw</kbd> takes the space with it, <kbd>iw</kbd> does not.') },
            { tier: 'basic', task: T('Leere den Funktionskörper.', 'Empty the function body.'), text: 'function f() {\n    ¶return 1;\n}', goal: 'function f() {\n}', sol: 'di{' },
            { tier: 'basic', task: T('Ersetze den Inhalt des Tags durch „New text“.', 'Replace the tag content with “New text”.'), text: '<p>¶Old text</p>', goal: '<p>New text</p>', sol: 'citNew text<Esc>' },
            { tier: 'combo', task: T('Lösche den mittleren Absatz komplett.', 'Delete the middle paragraph completely.'), text: T('Absatz eins.\n\n¶Dieser Absatz\nsoll weg.\n\nAbsatz drei.', 'Paragraph one.\n\n¶This paragraph\nhas to go.\n\nParagraph three.'), goal: T('Absatz eins.\n\nAbsatz drei.', 'Paragraph one.\n\nParagraph three.'), sol: 'dap' },
            { tier: 'final', task: T('Abschluss: Baue Funktion und HTML wie im Ziel um.', 'Wrap-up: rework the function and the HTML to match the goal.'),
              text: 'function ¶greet(name, greeting) {\n    return "Hello " + name;\n}\n<p class="old">Old text</p>', goal: 'function greet(user) {\n    return "Hi " + user;\n}\n<p class="new">New text</p>',
              sol: 'f(ci(user<Esc>jf"ci"Hi <Esc>fnciwuser<Esc>jj0ci"new<Esc>citNew text<Esc>',
              hint: T('Fünf Textobjekte: Klammer, Anführungszeichen, Wort, Anführungszeichen, Tag. Für die Klammer musst du erst hineinspringen.', 'Five text objects: bracket, quotes, word, quotes, tag. For the bracket you first have to jump inside.') }
          ]
        },
        {
          id: 'punkt', title: T('Der Punkt-Befehl', 'The dot command'),
          intro: T('Der mächtigste einzelne Tastendruck in Vim.', 'The most powerful single key in Vim.'),
          keys: [['.', T('Letzte Änderung wiederholen', 'Repeat the last change')]],
          body: T(`<p><kbd>.</kbd> wiederholt die letzte Änderung, samt allem, was du im Einfügemodus getippt hast. Wenn du <kbd>A;</kbd><kbd>Esc</kbd> einmal ausführst, hängt jeder weitere Punkt ein Semikolon an die Zeile, in der du gerade stehst.</p>
<p>Das Muster „Bewegung, Punkt, Bewegung, Punkt“ ersetzt viele Makros. Plane deine Änderungen so, dass sie sich wiederholen lassen: <kbd>cw</kbd> ist wiederholbar, <kbd>dw</kbd> plus <kbd>i</kbd> sind zwei Änderungen.</p>`,
            `<p><kbd>.</kbd> repeats the last change, including everything you typed in insert mode. Run <kbd>A;</kbd><kbd>Esc</kbd> once and every following dot appends a semicolon to whichever line you are on.</p>
<p>The pattern “move, dot, move, dot” replaces many macros. Plan your changes so they can be repeated: <kbd>cw</kbd> is repeatable, <kbd>dw</kbd> plus <kbd>i</kbd> are two changes.</p>`),
          demo: {
            text: '¶let a = 1\nlet b = 2\nlet c = 3',
            steps: [['A;<Esc>', T('Einmal ausführen: Semikolon anhängen.', 'Do it once: append a semicolon.')], ['j', T('Nächste Zeile.', 'Next line.')], ['.', T('<kbd>.</kbd> wiederholt die ganze Änderung.', '<kbd>.</kbd> repeats the whole change.')], ['j.', T('Und noch einmal.', 'And once more.')]]
          },
          ex: [
            { tier: 'basic', task: T('Hänge an jede Zeile ein Semikolon. Einmal tippen, dann wiederholen.', 'Append a semicolon to every line. Type it once, then repeat.'), text: '¶let a = 1\nlet b = 2\nlet c = 3\nlet d = 4', goal: 'let a = 1;\nlet b = 2;\nlet c = 3;\nlet d = 4;', sol: 'A;<Esc>j.j.j.' },
            { tier: 'basic', task: T('Lösche alle „weg“-Zeilen mit <kbd>dd</kbd> und dem Punkt.', 'Delete all “gone” lines with <kbd>dd</kbd> and the dot.'), text: T('¶weg\nweg\nweg\nweg\nbleibt', '¶gone\ngone\ngone\ngone\nstays'), goal: T('bleibt', 'stays'), sol: 'dd...' },
            { tier: 'combo', task: T('Ersetze jedes „foo“ durch „bar“.', 'Replace every “foo” with “bar”.'), text: '¶foo + foo * foo', goal: 'bar + bar * bar', sol: 'cwbar<Esc>ww.ww.',
              hint: T('Ändere das erste Wort so, dass die Änderung wiederholbar ist, dann springe weiter.', 'Change the first word in a repeatable way, then move on.') },
            { tier: 'final', task: T('Abschluss: Mach aus jeder <code>print</code>-Zeile einen <code>console.log</code>-Aufruf.', 'Wrap-up: turn every <code>print</code> line into a <code>console.log</code> call.'),
              text: '¶print "a"\nprint "b"\nprint "c"\nprint "d"', goal: 'console.log("a");\nconsole.log("b");\nconsole.log("c");\nconsole.log("d");', sol: 'ct"console.log(<Esc>j0.j0.j0.A);<Esc>k.k.k.',
              hint: T('Jede Zeile braucht zwei Änderungen, aber der Punkt merkt sich nur die letzte. Erledige also erst die eine Änderung in allen Zeilen, dann die andere.', 'Each line needs two changes, but the dot only remembers the last one. So do one change on all lines first, then the other.') }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'navigation', title: T('Navigation', 'Navigation'), lessons: [
        {
          id: 'datei', title: T('Durch die Datei springen', 'Jumping through the file'),
          intro: T('Anfang, Ende oder eine bestimmte Zeilennummer, alles in einem Zug.', 'Start, end or a specific line number, all in one move.'),
          keys: [['gg', T('Zur ersten Zeile', 'To the first line')], ['G', T('Zur letzten Zeile', 'To the last line')], ['17G', T('Zu Zeile 17', 'To line 17')], [':17', T('Zu Zeile 17 (Befehlszeile)', 'To line 17 (command line)')]],
          body: T(`<p><kbd>gg</kbd> und <kbd>G</kbd> bringen dich an Anfang und Ende der Datei. Mit einer Zahl davor springt <kbd>G</kbd> zu genau dieser Zeile. Dasselbe erreichst du mit <kbd>:17</kbd> und <kbd>Enter</kbd>.</p>
<p>Kombiniert mit Operatoren: <kbd>dG</kbd> löscht bis zum Dateiende, <kbd>ygg</kbd> kopiert alles bis zum Anfang.</p>`,
            `<p><kbd>gg</kbd> and <kbd>G</kbd> take you to the start and end of the file. With a number in front, <kbd>G</kbd> jumps to exactly that line. <kbd>:17</kbd> and <kbd>Enter</kbd> do the same.</p>
<p>Combined with operators: <kbd>dG</kbd> deletes to the end of the file, <kbd>ygg</kbd> yanks everything up to the start.</p>`),
          demo: {
            text: gen(30, 'line', { 0: '¶' }), height: 8,
            steps: [['G', T('<kbd>G</kbd>: zur letzten Zeile.', '<kbd>G</kbd>: to the last line.')], ['gg', T('<kbd>gg</kbd>: zurück an den Anfang.', '<kbd>gg</kbd>: back to the start.')], ['15G', T('<kbd>15G</kbd>: direkt zu Zeile 15.', '<kbd>15G</kbd>: straight to line 15.')], [':3<CR>', T('<kbd>:3</kbd> geht über die Befehlszeile.', '<kbd>:3</kbd> goes via the command line.')]]
          },
          ex: [
            { tier: 'basic', task: T('Besuche die letzte Zeile, dann die erste, dann Zeile 17 und zuletzt Zeile 23.', 'Visit the last line, then the first, then line 17 and finally line 23.'),
              text: gen(30, 'line', { 0: '◊¶', 16: '◊', 22: '◊', 29: '◊' }), order: [3, 0, 1, 2], height: 10, sol: 'Ggg:17<CR>23G' },
            { tier: 'combo', task: T('Lösche Zeile 5.', 'Delete line 5.'), text: gen(12, 'line', { 0: '¶' }), goal: lang => genLines(lang, 12, 'line').filter((l, i) => i !== 4).join('\n'), height: 8, sol: ':5<CR>dd',
              hint: T('Erst hinspringen, dann löschen.', 'Jump there first, then delete.') },
            { tier: 'final', task: T('Abschluss: Lösche alles ab Zeile 20 bis zum Dateiende und hänge eine Kopie der ersten Zeile unten an.', 'Wrap-up: delete everything from line 20 to the end and append a copy of the first line at the bottom.'),
              text: gen(25, 'line', { 0: '¶' }), goal: lang => { const ls = genLines(lang, 25, 'line'); return ls.slice(0, 19).concat([ls[0]]).join('\n'); }, height: 10, sol: '20GdGggyyGp',
              hint: T('<kbd>G</kbd> ist auch eine Bewegung für Operatoren: <kbd>dG</kbd> löscht bis zum Ende.', '<kbd>G</kbd> is also a motion for operators: <kbd>dG</kbd> deletes to the end.') }
          ]
        },
        {
          id: 'absaetze', title: T('Absätze', 'Paragraphs'),
          intro: T('Springe von Leerzeile zu Leerzeile.', 'Jump from blank line to blank line.'),
          keys: [['}', T('Zur nächsten Leerzeile', 'To the next blank line')], ['{', T('Zur vorherigen Leerzeile', 'To the previous blank line')], ['d}', T('Bis zum Absatzende löschen', 'Delete to the end of the paragraph')]],
          body: T(`<p>Ein Absatz endet an einer Leerzeile. <kbd>}</kbd> springt zur nächsten, <kbd>{</kbd> zur vorherigen. In Code trennen Leerzeilen meist Funktionen oder Blöcke, deshalb kommst du so schnell von Abschnitt zu Abschnitt.</p>`,
            `<p>A paragraph ends at a blank line. <kbd>}</kbd> jumps to the next one, <kbd>{</kbd> to the previous one. In code, blank lines usually separate functions or blocks, so this gets you from section to section quickly.</p>`),
          demo: {
            text: '¶a = 1\nb = 2\n\nc = 3\nd = 4\n\ne = 5',
            steps: [['}', T('<kbd>}</kbd>: zur nächsten Leerzeile.', '<kbd>}</kbd>: to the next blank line.')], ['}', T('Und zur übernächsten.', 'And to the one after.')], ['{', T('<kbd>{</kbd>: zurück.', '<kbd>{</kbd>: back.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe mit <kbd>}</kbd> von Leerzeile zu Leerzeile.', 'Jump from blank line to blank line with <kbd>}</kbd>.'),
              text: T('¶Vim erschien 1991 und stammt von\nBram Moolenaar.\n◊\nDer Name steht für Vi IMproved,\nalso verbesserter vi.\n◊\nHeute ist Vim auf fast jedem\nUnix-System vorinstalliert.\n◊\nNeovim ist ein moderner Ableger\nmit eigener Community.', '¶Vim was released in 1991 by\nBram Moolenaar.\n◊\nThe name stands for Vi IMproved,\nan improved vi.\n◊\nToday Vim comes preinstalled\non almost every Unix system.\n◊\nNeovim is a modern fork\nwith its own community.'),
              block: 'jk', sol: '}}}' },
            { tier: 'basic', task: T('Und mit <kbd>{</kbd> wieder zurück nach oben.', 'And back up with <kbd>{</kbd>.'),
              text: T('Vim erschien 1991 und stammt von\nBram Moolenaar.\n◊\nDer Name steht für Vi IMproved,\nalso verbesserter vi.\n◊\nHeute ist Vim auf fast jedem\nUnix-System vorinstalliert.\n◊\nNeovim ist ein moderner Ableger\n¶mit eigener Community.', 'Vim was released in 1991 by\nBram Moolenaar.\n◊\nThe name stands for Vi IMproved,\nan improved vi.\n◊\nToday Vim comes preinstalled\non almost every Unix system.\n◊\nNeovim is a modern fork\n¶with its own community.'),
              order: 'reverse', block: 'jk', sol: '{{{' },
            { tier: 'combo', task: T('Lösche den mittleren Absatz mit <kbd>d}</kbd> und danach die überzählige Leerzeile.', 'Delete the middle paragraph with <kbd>d}</kbd> and then the extra blank line.'),
              text: T('Absatz A\n\n¶Absatz B\nzweite Zeile\n\nAbsatz C', 'Paragraph A\n\n¶Paragraph B\nsecond line\n\nParagraph C'), goal: T('Absatz A\n\nAbsatz C', 'Paragraph A\n\nParagraph C'), sol: 'd}dd',
              hint: T('<kbd>d}</kbd> löscht bis zur Leerzeile, die Leerzeile selbst bleibt stehen.', '<kbd>d}</kbd> deletes up to the blank line; the blank line itself stays.') },
            { tier: 'final', task: T('Abschluss: Hänge an die letzte Zeile jedes Absatzes „ (ok)“ an.', 'Wrap-up: append “ (ok)” to the last line of every paragraph.'),
              text: T('¶Vim erschien 1991 und stammt von\nBram Moolenaar.\n\nDer Name steht für Vi IMproved,\nalso verbesserter vi.\n\nHeute ist Vim auf fast jedem\nUnix-System vorinstalliert.\n\nEnde', '¶Vim was released in 1991 by\nBram Moolenaar.\n\nThe name stands for Vi IMproved,\nan improved vi.\n\nToday Vim comes preinstalled\non almost every Unix system.\n\nEnd'),
              goal: T('Vim erschien 1991 und stammt von\nBram Moolenaar. (ok)\n\nDer Name steht für Vi IMproved,\nalso verbesserter vi. (ok)\n\nHeute ist Vim auf fast jedem\nUnix-System vorinstalliert. (ok)\n\nEnde', 'Vim was released in 1991 by\nBram Moolenaar. (ok)\n\nThe name stands for Vi IMproved,\nan improved vi. (ok)\n\nToday Vim comes preinstalled\non almost every Unix system. (ok)\n\nEnd'),
              sol: '}kA (ok)<Esc>}}k.}}k.',
              hint: T('Die letzte Zeile eines Absatzes liegt direkt über der Leerzeile. Danach hilft der Punkt.', 'The last line of a paragraph sits right above the blank line. After that the dot helps.') }
          ]
        },
        {
          id: 'bildschirm', title: T('Bildschirm und Scrollen', 'Screen and scrolling'),
          intro: T('Bewege dich relativ zum sichtbaren Ausschnitt.', 'Move relative to the visible window.'),
          keys: [['H', T('Oberste sichtbare Zeile (High)', 'Top visible line (High)')], ['M', T('Mittlere sichtbare Zeile', 'Middle visible line')], ['L', T('Unterste sichtbare Zeile (Low)', 'Bottom visible line (Low)')], ['<C-d>', T('Halbe Seite nach unten', 'Half a page down')], ['<C-u>', T('Halbe Seite nach oben', 'Half a page up')], ['<C-f> / <C-b>', T('Ganze Seite vor / zurück', 'Full page forward / back')], ['zz', T('Aktuelle Zeile in die Bildschirmmitte', 'Current line to the middle of the screen')]],
          body: T(`<p><kbd>H</kbd>, <kbd>M</kbd> und <kbd>L</kbd> springen an den oberen Rand, in die Mitte und an den unteren Rand des sichtbaren Bereichs. <kbd>Ctrl-d</kbd> und <kbd>Ctrl-u</kbd> scrollen eine halbe Seite und nehmen den Cursor mit.</p>
<p><kbd>zz</kbd> verschiebt die Ansicht so, dass die aktuelle Zeile in der Mitte steht. Der Cursor bleibt dabei, wo er ist.</p>`,
            `<p><kbd>H</kbd>, <kbd>M</kbd> and <kbd>L</kbd> jump to the top, middle and bottom of the visible area. <kbd>Ctrl-d</kbd> and <kbd>Ctrl-u</kbd> scroll half a page and take the cursor along.</p>
<p><kbd>zz</kbd> moves the view so the current line sits in the middle. The cursor stays where it is.</p>`),
          demo: {
            text: gen(40, 'sec', { 0: '¶' }), height: 8,
            steps: [['L', T('<kbd>L</kbd>: unterste sichtbare Zeile.', '<kbd>L</kbd>: bottom visible line.')], ['<C-d>', T('<kbd>Ctrl-d</kbd>: eine halbe Seite runter.', '<kbd>Ctrl-d</kbd>: half a page down.')], ['<C-d>', T('Noch einmal.', 'Again.')], ['zz', T('<kbd>zz</kbd>: Zeile in die Mitte holen.', '<kbd>zz</kbd>: bring the line to the middle.')], ['H', T('<kbd>H</kbd>: oberste sichtbare Zeile.', '<kbd>H</kbd>: top visible line.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe zum unteren Rand, zum oberen Rand und in die Mitte.', 'Jump to the bottom edge, the top edge and the middle.'), text: gen(40, 'sec', { 0: '◊¶', 4: '◊', 9: '◊' }), order: [2, 0, 1], height: 10, block: 'jk', sol: 'LHM' },
            { tier: 'basic', task: T('Scrolle mit <kbd>Ctrl-d</kbd> zu Abschnitt 31 und mit <kbd>Ctrl-u</kbd> zurück zu Abschnitt 21.', 'Scroll to section 31 with <kbd>Ctrl-d</kbd> and back to section 21 with <kbd>Ctrl-u</kbd>.'), text: gen(40, 'sec', { 0: '¶', 20: '◊', 30: '◊' }), order: 'reverse', height: 10, block: 'jk', sol: '<C-d><C-d><C-d><C-d><C-d><C-d><C-u><C-u>' },
            { tier: 'combo', task: T('Lösche die unterste sichtbare Zeile.', 'Delete the bottom visible line.'), text: gen(20, 'sec', { 0: '¶' }), goal: lang => genLines(lang, 20, 'sec').filter((l, i) => i !== 9).join('\n'), height: 10, block: 'jk', sol: 'Ldd' },
            { tier: 'final', task: T('Abschluss: Hänge an Abschnitt 21 ein „!“ an und setze dann vor Abschnitt 1 ein „# “. Nur scrollen, nicht mit <kbd>j</kbd>, <kbd>k</kbd> oder <kbd>G</kbd>.', 'Wrap-up: append “!” to section 21, then put “# ” in front of section 1. Scroll only, no <kbd>j</kbd>, <kbd>k</kbd> or <kbd>G</kbd>.'),
              text: gen(40, 'sec', { 0: '¶' }), goal: lang => { const ls = genLines(lang, 40, 'sec'); ls[20] += '!'; ls[0] = '# ' + ls[0]; return ls.join('\n'); }, height: 10, block: 'jkG',
              sol: '<C-d><C-d><C-d><C-d>A!<Esc><C-u><C-u><C-u><C-u>I# <Esc>',
              hint: T('Eine halbe Seite sind hier fünf Zeilen.', 'Half a page is five lines here.') }
          ]
        },
        {
          id: 'suche', title: T('Suchen', 'Searching'),
          intro: T('Der schnellste Weg zu jedem Ort, den du benennen kannst.', 'The fastest way to any place you can name.'),
          keys: [['/{Muster}', T('Vorwärts suchen', 'Search forward')], ['?{Muster}', T('Rückwärts suchen', 'Search backward')], ['n', T('Nächster Treffer', 'Next match')], ['N', T('Vorheriger Treffer', 'Previous match')], ['\\< \\>', T('Wortgrenzen im Muster', 'Word boundaries in a pattern')], [':noh', T('Hervorhebung ausschalten', 'Turn off highlighting')]],
          body: T(`<p>Tippe <kbd>/</kbd>, dann das Suchwort und <kbd>Enter</kbd>. Der Cursor springt zum nächsten Treffer, alle Treffer werden hervorgehoben. <kbd>n</kbd> geht zum nächsten, <kbd>N</kbd> zum vorherigen. Am Dateiende beginnt die Suche wieder oben.</p>
<p>Das Muster ist ein regulärer Ausdruck. <code>/i</code> findet jedes „i“, auch mitten in Wörtern. <code>/\\&lt;i\\&gt;</code> findet nur das alleinstehende Wort: <code>\\&lt;</code> heißt „hier beginnt ein Wort“, <code>\\&gt;</code> „hier endet eins“.</p>`,
            `<p>Type <kbd>/</kbd>, then the search term and <kbd>Enter</kbd>. The cursor jumps to the next match and all matches are highlighted. <kbd>n</kbd> goes to the next one, <kbd>N</kbd> to the previous one. At the end of the file the search wraps to the top.</p>
<p>The pattern is a regular expression. <code>/i</code> finds every “i”, even inside words. <code>/\\&lt;i\\&gt;</code> only finds the standalone word: <code>\\&lt;</code> means “a word starts here”, <code>\\&gt;</code> “a word ends here”.</p>`),
          demo: {
            text: '¶let i = 0;\nlet items = [];\nitems.push(i);',
            steps: [['/i<CR>', T('<kbd>/i</kbd> findet jedes „i“, auch in „items“.', '<kbd>/i</kbd> finds every “i”, even in “items”.')], ['n', T('<kbd>n</kbd>: nächster Treffer.', '<kbd>n</kbd>: next match.')], ['gg/\\<i\\><CR>', T('Mit <code>\\&lt;</code> und <code>\\&gt;</code> nur das ganze Wort.', 'With <code>\\&lt;</code> and <code>\\&gt;</code> only the whole word.')], ['n', T('Der nächste Treffer überspringt „items“.', 'The next match skips “items”.')]]
          },
          ex: [
            { tier: 'basic', task: T('Suche nach dem Zielwort und springe mit <kbd>n</kbd> weiter.', 'Search for the target word and move on with <kbd>n</kbd>.'),
              text: T('¶Die Suche ist der schnellste Weg durch große Dateien.\nIrgendwo hier versteckt sich das erste ◊Ziel.\nMit n springst du zum nächsten Treffer,\nund das zweite ◊Ziel liegt in dieser Zeile.\nMit N geht es zurück. Das dritte ◊Ziel ist hier.', '¶Searching is the fastest way through big files.\nSomewhere in here hides the first ◊target.\nWith n you jump to the next match,\nand the second ◊target is on this line.\nN goes back. The third ◊target is here.'),
              block: 'hjklwbeWBE', sol: T('/Ziel<CR>nn', '/target<CR>nn') },
            { tier: 'basic', task: T('Suche mit <kbd>?</kbd> rückwärts nach „echo“.', 'Search backwards for “echo” with <kbd>?</kbd>.'), text: T('◊echo "start"\n◊echo "mitte"\n◊echo "ende"\n¶# Rückwärts suchen mit ?', '◊echo "start"\n◊echo "middle"\n◊echo "end"\n¶# search backwards with ?'), order: 'reverse', block: 'hjklwbeWBE', sol: '?echo<CR>nn' },
            { tier: 'combo', task: T('Ändere jede Farbe zu „blau“: suchen, ändern, mit <kbd>n</kbd> und <kbd>.</kbd> wiederholen.', 'Change every colour to “blue”: search, change, repeat with <kbd>n</kbd> and <kbd>.</kbd>.'),
              text: T('¶Das Auto ist rot.\nDer Himmel ist nicht rot.\nDie Rose ist rot.', '¶The car is red.\nThe sky is not red.\nThe rose is red.'), goal: T('Das Auto ist blau.\nDer Himmel ist nicht blau.\nDie Rose ist blau.', 'The car is blue.\nThe sky is not blue.\nThe rose is blue.'),
              sol: T('/rot<CR>cwblau<Esc>n.n.', '/red<CR>cwblue<Esc>n.n.'), hint: T('Das ist das Muster „suchen, ändern, n, Punkt“.', 'This is the “search, change, n, dot” pattern.') },
            { tier: 'final', task: T('Abschluss: Benenne die Variable <code>i</code> überall in <code>idx</code> um, ohne <code>items</code> anzufassen.', 'Wrap-up: rename the variable <code>i</code> to <code>idx</code> everywhere without touching <code>items</code>.'),
              text: '¶let i = 0;\nlet items = [];\nfor (i = 0; i < 10; i++) {\n    items.push(i);\n}', goal: 'let idx = 0;\nlet items = [];\nfor (idx = 0; idx < 10; idx++) {\n    items.push(idx);\n}',
              sol: '/\\<i\\><CR>ciwidx<Esc>n.n.n.n.',
              hint: T('Eine normale Suche nach „i“ träfe auch „items“. Grenze das Muster auf ganze Wörter ein.', 'A plain search for “i” would also hit “items”. Restrict the pattern to whole words.') }
          ]
        },
        {
          id: 'spruenge', title: T('Klammern und Wörter', 'Brackets and words'),
          intro: T('Zwei Abkürzungen für Programmierer.', 'Two shortcuts for programmers.'),
          keys: [['%', T('Zur passenden Klammer springen', 'Jump to the matching bracket')], ['d%', T('Bis zur passenden Klammer löschen', 'Delete to the matching bracket')], ['*', T('Wort unter dem Cursor vorwärts suchen', 'Search the word under the cursor forward')], ['#', T('Wort unter dem Cursor rückwärts suchen', 'Search the word under the cursor backward')]],
          body: T(`<p><kbd>%</kbd> springt zwischen zusammengehörigen Klammern <code>()</code>, <code>[]</code> und <code>{}</code> hin und her, auch über mehrere Zeilen. Es gibt zwei Regeln:</p>
<p><b>1.</b> Steht der Cursor auf einer Klammer, springt <kbd>%</kbd> zu ihrem Gegenstück. <b>2.</b> Steht er auf etwas anderem, sucht Vim die nächste Klammer <b>rechts davon in derselben Zeile</b> und springt zu deren Gegenstück. Bei verschachtelten Klammern zählt Vim mit und findet immer das richtige Paar.</p>
<p><kbd>*</kbd> sucht das Wort unter dem Cursor, ganz ohne Tippen. Ideal, um alle Stellen einer Variablen zu finden.</p>`,
            `<p><kbd>%</kbd> jumps back and forth between matching brackets <code>()</code>, <code>[]</code> and <code>{}</code>, even across lines. There are two rules:</p>
<p><b>1.</b> If the cursor is on a bracket, <kbd>%</kbd> jumps to its partner. <b>2.</b> If it is on something else, Vim looks for the next bracket <b>to the right on the same line</b> and jumps to that bracket's partner. With nested brackets Vim counts along and always finds the right pair.</p>
<p><kbd>*</kbd> searches for the word under the cursor without any typing. Ideal for finding every use of a variable.</p>`),
          concept: T(`<h4>So zählt %</h4><p>In <code>((a) b)</code> gehört die erste <code>(</code> zur letzten <code>)</code>. Vim zählt: jede öffnende Klammer +1, jede schließende −1. Wo der Zähler wieder auf null fällt, liegt das Gegenstück. Probier die Vorführung aus und achte darauf, wo der Cursor landet.</p>`,
            `<h4>How % counts</h4><p>In <code>((a) b)</code> the first <code>(</code> belongs to the last <code>)</code>. Vim counts: every opening bracket +1, every closing −1. Where the count drops back to zero is the partner. Watch the demo and notice where the cursor lands.</p>`),
          demo: {
            text: '¶if ((a && b) || c) {\n    run();\n}',
            steps: [['%', T('Der Cursor steht auf „i“. Vim nimmt die nächste Klammer rechts, die äußere <code>(</code>, und springt zu ihrem Gegenstück.', 'The cursor is on “i”. Vim takes the next bracket to the right, the outer <code>(</code>, and jumps to its partner.')], ['%', T('Auf einer Klammer springt <kbd>%</kbd> einfach zurück.', 'On a bracket <kbd>%</kbd> simply jumps back.')], ['l%', T('Eins weiter steht die innere <code>(</code>. Ihr Gegenstück ist die Klammer nach „b“.', 'One further is the inner <code>(</code>. Its partner is the bracket after “b”.')], ['$%', T('<code>{</code> am Zeilenende: <kbd>%</kbd> findet die schließende <code>}</code> zwei Zeilen tiefer.', '<code>{</code> at the end of the line: <kbd>%</kbd> finds the closing <code>}</code> two lines down.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe zur schließenden runden Klammer und danach zur schließenden geschweiften.', 'Jump to the closing round bracket and then to the closing curly one.'), text: '¶function test(a, b◊) {\n    return (a + b) * 2;\n◊}', sol: '%$%',
              hint: T('Vom Wortanfang aus nimmt <kbd>%</kbd> die erste Klammer rechts in der Zeile. Für die zweite musst du erst auf die <code>{</code>.', 'From the start of the line <kbd>%</kbd> takes the first bracket to the right. For the second you first need to be on the <code>{</code>.') },
            { tier: 'basic', task: T('Verschachtelt: Springe erst zur äußeren schließenden Klammer, dann zur inneren.', 'Nested: jump to the outer closing bracket first, then to the inner one.'), text: '¶if ((a && b◊) || c◊) {', order: [1, 0], sol: '%%l%',
              hint: T('Von der äußeren schließenden Klammer bringt dich <kbd>%</kbd> zurück zur äußeren öffnenden. Die innere öffnende liegt direkt daneben.', 'From the outer closing bracket <kbd>%</kbd> takes you back to the outer opening one. The inner opening bracket is right next to it.') },
            { tier: 'combo', task: T('Lösche den Klammerausdruck samt Klammern mit <kbd>d%</kbd>.', 'Delete the bracket expression including brackets with <kbd>d%</kbd>.'), text: 'compute¶(a, (b + c)) + 1', goal: 'compute + 1', sol: 'd%',
              hint: T('<kbd>%</kbd> ist eine Bewegung wie jede andere, also funktioniert sie mit <kbd>d</kbd>.', '<kbd>%</kbd> is a motion like any other, so it works with <kbd>d</kbd>.') },
            { tier: 'basic', task: T('Finde mit <kbd>*</kbd> und <kbd>n</kbd> alle Stellen von „counter“.', 'Find every “counter” with <kbd>*</kbd> and <kbd>n</kbd>.'), text: 'let ¶counter = 0;\nfor (const x of list) {\n    ◊counter += x;\n}\nconsole.log(◊counter);', block: 'hjklwbeWBE', sol: '*n' },
            { tier: 'final', task: T('Abschluss: Benenne <code>x</code> überall in <code>value</code> um. Nutze <kbd>*</kbd>, ändere und wiederhole.', 'Wrap-up: rename <code>x</code> to <code>value</code> everywhere. Use <kbd>*</kbd>, change and repeat.'),
              text: '¶function calc(x) {\n    if (x > 0) {\n        return x * 2;\n    }\n    return 0;\n}', goal: 'function calc(value) {\n    if (value > 0) {\n        return value * 2;\n    }\n    return 0;\n}',
              sol: 'fx*ciwvalue<Esc>n.n.',
              hint: T('Stell den Cursor auf ein <code>x</code> und drücke <kbd>*</kbd>. Die Suche läuft am Ende wieder oben weiter.', 'Put the cursor on an <code>x</code> and press <kbd>*</kbd>. The search wraps around to the top.') }
          ]
        },
        {
          id: 'marken', title: T('Marken', 'Marks'),
          intro: T('Lesezeichen setzen und jederzeit zurückspringen.', 'Set bookmarks and jump back any time.'),
          keys: [['m{a-z}', T('Marke an der Cursorposition setzen', 'Set a mark at the cursor')], ['`{a-z}', T('Genau zur Marke springen', 'Jump exactly to the mark')], ["'{a-z}", T('Zur Zeile der Marke springen', 'Jump to the mark\'s line')], ['``', T('Zurück zur Position vor dem letzten Sprung', 'Back to the position before the last jump')], [':marks', T('Alle Marken anzeigen', 'List all marks')]],
          body: T(`<p>Mit <kbd>ma</kbd> merkst du dir die aktuelle Stelle unter dem Namen <code>a</code>. Später bringt dich <kbd>\`a</kbd> exakt dorthin zurück, <kbd>'a</kbd> an den Anfang der Zeile. Marken funktionieren auch als Bewegung: <kbd>d'a</kbd> löscht alle Zeilen bis zur Marke.</p>`,
            `<p><kbd>ma</kbd> remembers the current spot under the name <code>a</code>. Later <kbd>\`a</kbd> takes you back exactly there, <kbd>'a</kbd> to the start of its line. Marks also work as motions: <kbd>d'a</kbd> deletes all lines up to the mark.</p>`),
          demo: {
            text: gen(20, 'line', { 2: '¶' }), height: 8,
            steps: [['wwma', T('<kbd>ma</kbd> setzt Marke <code>a</code> hier.', '<kbd>ma</kbd> sets mark <code>a</code> here.')], ['15G', T('Weit weg springen.', 'Jump far away.')], ['`a', T('<kbd>`a</kbd> bringt dich exakt zurück.', '<kbd>`a</kbd> takes you back exactly.')], ['``', T('<kbd>``</kbd> springt zur Stelle vor dem letzten Sprung.', '<kbd>``</kbd> jumps to where you were before the last jump.')]]
          },
          ex: [
            { tier: 'basic', task: T('Setze eine Marke, springe zu Zeile 20 und dann exakt zurück zum Startpunkt.', 'Set a mark, jump to line 20 and then exactly back to the start.'),
              text: gen(25, 'line', { 19: '◊' }, (ls, lang) => { ls[2] = lang === 'en' ? 'Line ◊¶3 · Your starting point is here.' : 'Zeile ◊¶3 · Hier liegt dein Startpunkt.'; }), order: [1, 0], height: 10, require: ['m', '`|\''], sol: 'ma20G`a' },
            { tier: 'combo', task: T('Setze eine Marke, gehe drei Zeilen tiefer und lösche mit <kbd>d\'a</kbd> alles bis zur Marke.', 'Set a mark, go three lines down and delete everything up to the mark with <kbd>d\'a</kbd>.'),
              text: gen(10, 'line', { 2: '¶' }), goal: lang => genLines(lang, 10, 'line').filter((l, i) => i < 2 || i > 5).join('\n'), require: ['m'], sol: "majjjd'a" },
            { tier: 'final', task: T('Abschluss: Kopiere Zeile 3 unter Zeile 17, springe per Marke zurück und hänge an Zeile 3 „ (kopiert)“ an.', 'Wrap-up: copy line 3 below line 17, jump back with a mark and append “ (copied)” to line 3.'),
              text: gen(20, 'line', { 2: '¶' }), goal: lang => { const ls = genLines(lang, 20, 'line'); const copy = ls[2]; ls.splice(17, 0, copy); ls[2] += lang === 'en' ? ' (copied)' : ' (kopiert)'; return ls.join('\n'); },
              height: 10, require: ['m', '`|\''], sol: T('mayy17Gp`aA (kopiert)<Esc>', 'mayy17Gp`aA (copied)<Esc>'),
              hint: T('Setze die Marke, bevor du wegspringst.', 'Set the mark before you jump away.') }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'profi', title: T('Profi-Werkzeuge', 'Power tools'), lessons: [
        {
          id: 'gross-klein', title: T('Verbinden und Groß/Klein', 'Joining and case'),
          intro: T('Zeilen zusammenführen und Schreibweisen umstellen.', 'Join lines and change case.'),
          keys: [['J', T('Nächste Zeile anhängen (mit Leerzeichen)', 'Join the next line (with a space)')], ['gJ', T('Anhängen ohne Leerzeichen', 'Join without a space')], ['~', T('Groß/klein des Zeichens umschalten', 'Toggle case of the character')], ['gU{Bewegung}', T('In Großbuchstaben', 'To uppercase')], ['gu{Bewegung}', T('In Kleinbuchstaben', 'To lowercase')], ['g~{Bewegung}', T('Groß/klein umschalten', 'Toggle case')]],
          body: T(`<p><kbd>J</kbd> (<i>join</i>) holt die nächste Zeile hoch und setzt ein Leerzeichen dazwischen. Mit einer Zahl verbindest du mehrere Zeilen auf einmal.</p>
<p><kbd>gU</kbd>, <kbd>gu</kbd> und <kbd>g~</kbd> sind Operatoren und funktionieren mit jeder Bewegung und jedem Textobjekt: <kbd>gUiw</kbd> macht ein Wort groß, <kbd>guu</kbd> eine ganze Zeile klein (doppelter Operator heißt wieder „ganze Zeile“).</p>`,
            `<p><kbd>J</kbd> (<i>join</i>) pulls the next line up and puts a space in between. With a count you join several lines at once.</p>
<p><kbd>gU</kbd>, <kbd>gu</kbd> and <kbd>g~</kbd> are operators and work with any motion and text object: <kbd>gUiw</kbd> uppercases a word, <kbd>guu</kbd> lowercases a whole line (a doubled operator again means “whole line”).</p>`),
          demo: {
            text: '¶select name\nfrom users',
            steps: [['gUiw', T('<kbd>gUiw</kbd>: Wort in Großbuchstaben.', '<kbd>gUiw</kbd>: word to uppercase.')], ['j.', T('Der Punkt wiederholt das in der nächsten Zeile.', 'The dot repeats it on the next line.')], ['kJ', T('<kbd>J</kbd> verbindet beide Zeilen.', '<kbd>J</kbd> joins both lines.')]]
          },
          ex: [
            { tier: 'basic', task: T('Füge die drei Zeilen zu einem Satz zusammen.', 'Join the three lines into one sentence.'), text: T('¶Dieser Satz wurde\nversehentlich\numgebrochen.', '¶This sentence was\naccidentally\nwrapped.'), goal: T('Dieser Satz wurde versehentlich umgebrochen.', 'This sentence was accidentally wrapped.'), sol: '3J' },
            { tier: 'basic', task: T('Schreibe „vim“ groß.', 'Write “vim” in capitals.'), text: '¶vim', goal: 'VIM', sol: '3~' },
            { tier: 'basic', task: T('Mache den Variablennamen zur Konstante in Großbuchstaben.', 'Turn the variable name into an uppercase constant.'), text: 'const ¶max_value = 10;', goal: 'const MAX_VALUE = 10;', sol: 'gUiw' },
            { tier: 'basic', task: T('Diese Zeile soll nicht mehr schreien.', 'This line should stop shouting.'), text: T('¶DIESE ZEILE SCHREIT', '¶THIS LINE IS SHOUTING'), goal: T('diese zeile schreit', 'this line is shouting'), sol: 'guu' },
            { tier: 'final', task: T('Abschluss: Schreibe die SQL-Schlüsselwörter groß und hole <code>name;</code> in die ORDER-BY-Zeile.', 'Wrap-up: uppercase the SQL keywords and pull <code>name;</code> up into the ORDER BY line.'),
              text: '¶SELECT name, age\nfrom users\nwhere age > 18\norder by\nname;', goal: 'SELECT name, age\nFROM users\nWHERE age > 18\nORDER BY name;', sol: 'jgUiwj.jgUUJ',
              hint: T('Einmal <kbd>gUiw</kbd>, dann der Punkt. Für „order by“ passt die ganze Zeile, danach verbinden.', 'Once <kbd>gUiw</kbd>, then the dot. For “order by” the whole line fits, then join.') }
          ]
        },
        {
          id: 'einruecken', title: T('Einrücken', 'Indenting'),
          intro: T('Code nach links und rechts schieben.', 'Shift code left and right.'),
          keys: [['>>', T('Zeile einrücken', 'Indent the line')], ['<<', T('Zeile ausrücken', 'Unindent the line')], ['>{Bewegung}', T('Bereich einrücken', 'Indent a range')], ['>i{', T('Inhalt der geschweiften Klammer einrücken', 'Indent inside curly brackets')]],
          body: T(`<p><kbd>></kbd> und <kbd><</kbd> sind Operatoren. Doppelt gedrückt wirken sie auf die aktuelle Zeile, mit Zahl auf mehrere: <kbd>3>></kbd> rückt drei Zeilen ein. Eine Stufe entspricht hier vier Leerzeichen (<code>shiftwidth=4</code>).</p>
<p>Mit Textobjekten wird es elegant: <kbd>>i{</kbd> rückt den kompletten Inhalt eines Blocks ein, ohne dass du Zeilen zählen musst.</p>`,
            `<p><kbd>></kbd> and <kbd><</kbd> are operators. Doubled they act on the current line, with a count on several: <kbd>3>></kbd> indents three lines. One level is four spaces here (<code>shiftwidth=4</code>).</p>
<p>With text objects it gets elegant: <kbd>>i{</kbd> indents the entire content of a block without counting lines.</p>`),
          demo: {
            text: 'if (x) {\n¶a();\nb();\n}',
            steps: [['>>', T('<kbd>>></kbd> rückt die aktuelle Zeile ein.', '<kbd>>></kbd> indents the current line.')], ['u', T('Rückgängig.', 'Undo.')], ['>i{', T('<kbd>>i{</kbd> rückt den ganzen Blockinhalt ein.', '<kbd>>i{</kbd> indents the whole block content.')]]
          },
          ex: [
            { tier: 'basic', task: T('Rücke den Funktionskörper ein.', 'Indent the function body.'), text: 'def f():\n¶return 1', goal: 'def f():\n    return 1', sol: '>>' },
            { tier: 'basic', task: T('Nimm bei allen drei Zeilen eine Einrückungsstufe weg.', 'Remove one indentation level from all three lines.'), text: '¶        a\n        b\n        c', goal: '    a\n    b\n    c', sol: '3<<' },
            { tier: 'combo', task: T('Rücke den Inhalt des Blocks ein, ohne Zeilen zu zählen.', 'Indent the block content without counting lines.'), text: 'if (x) {\n¶a();\nb();\nc();\n}', goal: 'if (x) {\n    a();\n    b();\n    c();\n}', sol: '>i{',
              hint: T('Operator plus Textobjekt aus Kapitel 3.', 'Operator plus a text object from chapter 3.') },
            { tier: 'final', task: T('Abschluss: Rücke das Python-Programm korrekt ein.', 'Wrap-up: indent the Python program correctly.'),
              text: T('¶def main():\nprint("start")\nfor i in range(3):\nprint(i)\nprint("ende")', '¶def main():\nprint("start")\nfor i in range(3):\nprint(i)\nprint("end")'),
              goal: T('def main():\n    print("start")\n    for i in range(3):\n        print(i)\n    print("ende")', 'def main():\n    print("start")\n    for i in range(3):\n        print(i)\n    print("end")'), sol: 'j4>>jj>>',
              hint: T('Erst alles unter <code>def</code> eine Stufe, dann die Zeile in der Schleife eine weitere.', 'First everything under <code>def</code> one level, then the line inside the loop one more.') }
          ]
        },
        {
          id: 'zahlen', title: T('Zahlen hoch- und runterzählen', 'Incrementing numbers'),
          intro: T('Rechnen, ohne die Zahl anzutippen.', 'Do arithmetic without typing the number.'),
          keys: [['<C-a>', T('Nächste Zahl um 1 erhöhen', 'Increase the next number by 1')], ['<C-x>', T('Nächste Zahl um 1 verringern', 'Decrease the next number by 1')], ['5<C-a>', T('Um 5 erhöhen', 'Increase by 5')], ['g<C-a>', T('Im visuellen Modus: fortlaufend hochzählen', 'In visual mode: increase progressively')]],
          body: T(`<p><kbd>Ctrl-a</kbd> addiert, <kbd>Ctrl-x</kbd> subtrahiert. Der Cursor muss nicht auf der Zahl stehen, Vim nimmt die nächste Zahl rechts davon in der Zeile. Eine Zahl davor gibt den Betrag an.</p>
<p>Im visuellen Modus zählt <kbd>g Ctrl-a</kbd> fortlaufend: Die erste markierte Zeile bekommt +1, die zweite +2 und so weiter. So entstehen nummerierte Listen.</p>`,
            `<p><kbd>Ctrl-a</kbd> adds, <kbd>Ctrl-x</kbd> subtracts. The cursor does not need to be on the number; Vim takes the next number to its right on the line. A count in front sets the amount.</p>
<p>In visual mode <kbd>g Ctrl-a</kbd> counts progressively: the first selected line gets +1, the second +2 and so on. That is how numbered lists happen.</p>`),
          demo: {
            text: '¶width: 100px;',
            steps: [['<C-a>', T('<kbd>Ctrl-a</kbd>: plus eins. Der Cursor sucht sich die Zahl selbst.', '<kbd>Ctrl-a</kbd>: plus one. The cursor finds the number by itself.')], ['49<C-a>', T('<kbd>49 Ctrl-a</kbd>: plus 49.', '<kbd>49 Ctrl-a</kbd>: plus 49.')], ['50<C-x>', T('<kbd>50 Ctrl-x</kbd>: minus 50.', '<kbd>50 Ctrl-x</kbd>: minus 50.')]]
          },
          ex: [
            { tier: 'basic', task: T('Erhöhe den Preis auf 10.', 'Raise the price to 10.'), text: T('Preis: ¶9 Euro', 'Price: ¶9 euros'), goal: T('Preis: 10 Euro', 'Price: 10 euros'), sol: '<C-a>' },
            { tier: 'basic', task: T('Mache das Element 50 Pixel breiter. Der Cursor steht am Zeilenanfang.', 'Make the element 50 pixels wider. The cursor is at the start of the line.'), text: '¶width: 100px;', goal: 'width: 150px;', sol: '50<C-a>' },
            { tier: 'basic', task: T('Zähle von 10 auf 3 herunter.', 'Count down from 10 to 3.'), text: 'Countdown: ¶10', goal: 'Countdown: 3', sol: '7<C-x>' },
            { tier: 'combo', task: T('Nummeriere die Liste mit visuellem Modus und <kbd>g Ctrl-a</kbd> durch.', 'Number the list using visual mode and <kbd>g Ctrl-a</kbd>.'), text: T('¶0. Punkt\n0. Punkt\n0. Punkt', '¶0. Item\n0. Item\n0. Item'), goal: T('1. Punkt\n2. Punkt\n3. Punkt', '1. Item\n2. Item\n3. Item'), sol: 'VGg<C-a>',
              hint: T('Alle Zeilen zeilenweise markieren, dann <kbd>g</kbd> und <kbd>Ctrl-a</kbd>.', 'Select all lines linewise, then <kbd>g</kbd> and <kbd>Ctrl-a</kbd>.') },
            { tier: 'final', task: T('Abschluss: Passe alle Werte im CSS an das Ziel an.', 'Wrap-up: adjust every value in the CSS to the goal.'),
              text: '¶.box {\n    width: 100px;\n    height: 50px;\n    margin: 10px;\n    z-index: 3;\n}', goal: '.box {\n    width: 200px;\n    height: 25px;\n    margin: 12px;\n    z-index: 4;\n}', sol: 'j100<C-a>j25<C-x>j2<C-a>j<C-a>',
              hint: T('Rechne die Differenz aus und gib sie als Zahl vor <kbd>Ctrl-a</kbd> oder <kbd>Ctrl-x</kbd> ein.', 'Work out the difference and type it as a count before <kbd>Ctrl-a</kbd> or <kbd>Ctrl-x</kbd>.') }
          ]
        },
        {
          id: 'register', title: T('Register', 'Registers'),
          intro: T('Vim hat nicht eine Zwischenablage, sondern Dutzende.', 'Vim has dozens of clipboards, not just one.'),
          keys: [['"ayy', T('Zeile in Register a kopieren', 'Yank the line into register a')], ['"ap', T('Aus Register a einfügen', 'Put from register a')], ['"_d', T('Löschen ohne Register zu überschreiben', 'Delete without overwriting a register')], ['"0p', T('Zuletzt Kopiertes einfügen', 'Put the last yank')], ['<C-r>{Reg}', T('Im Einfügemodus Register einfügen', 'Insert a register in insert mode')], [':reg', T('Alle Register anzeigen', 'List all registers')]],
          body: T(`<p>Mit <kbd>"</kbd> und einem Buchstaben wählst du vor einem Befehl ein Register. <kbd>"ayy</kbd> kopiert die Zeile nach <code>a</code>, <kbd>"ap</kbd> fügt sie ein. Großbuchstaben hängen an: <kbd>"Ayy</kbd> ergänzt Register <code>a</code>.</p>
<p>Wichtige Sonderregister: <code>"0</code> enthält immer das zuletzt Kopierte, auch wenn du danach gelöscht hast. <code>"_</code> ist das schwarze Loch: Was dort landet, ist weg und überschreibt nichts. <kbd>:reg</kbd> zeigt dir, was wo liegt.</p>`,
            `<p><kbd>"</kbd> followed by a letter picks a register for the next command. <kbd>"ayy</kbd> yanks the line into <code>a</code>, <kbd>"ap</kbd> puts it. Capital letters append: <kbd>"Ayy</kbd> adds to register <code>a</code>.</p>
<p>Important special registers: <code>"0</code> always holds the last yank, even if you deleted something afterwards. <code>"_</code> is the black hole: whatever goes there is gone and overwrites nothing. <kbd>:reg</kbd> shows what is where.</p>`),
          demo: {
            text: '¶apple\nbanana\n',
            steps: [['"ayy', T('<kbd>"ayy</kbd>: Zeile in Register <code>a</code>.', '<kbd>"ayy</kbd>: line into register <code>a</code>.')], ['jdd', T('Etwas löschen: Das überschreibt das normale Register, aber nicht <code>a</code>.', 'Delete something: this overwrites the default register but not <code>a</code>.')], ['"ap', T('<kbd>"ap</kbd> holt den Inhalt von <code>a</code>.', '<kbd>"ap</kbd> fetches the content of <code>a</code>.')], [':reg<CR>', T('<kbd>:reg</kbd> zeigt alle Register.', '<kbd>:reg</kbd> lists all registers.')]]
          },
          ex: [
            { tier: 'basic', task: T('Kopiere die erste Zeile in Register a und füge sie am Ende ein.', 'Yank the first line into register a and put it at the end.'), text: T('¶Wichtig: Backup machen!\nZeile zwei\nZeile drei', '¶Important: make a backup!\nLine two\nLine three'), goal: T('Wichtig: Backup machen!\nZeile zwei\nZeile drei\nWichtig: Backup machen!', 'Important: make a backup!\nLine two\nLine three\nImportant: make a backup!'), require: ['"a'], sol: '"ayyG"ap' },
            { tier: 'basic', task: T('Kopiere Zeile 1, lösche Zeile 2 ins schwarze Loch und füge Zeile 1 am Ende ein.', 'Yank line 1, delete line 2 into the black hole and put line 1 at the end.'), text: T('¶Kopiere mich\nLösche mich\nEnde', '¶Copy me\nDelete me\nEnd'), goal: T('Kopiere mich\nEnde\nKopiere mich', 'Copy me\nEnd\nCopy me'), require: ['"_'], sol: 'yyj"_ddp',
              hint: T('Ohne <code>"_</code> würde das Löschen das Kopierte überschreiben.', 'Without <code>"_</code> the delete would overwrite what you yanked.') },
            { tier: 'combo', task: T('Kopiere den Namen und füge ihn im Einfügemodus mit <kbd>Ctrl-r "</kbd> vor dem Ausrufezeichen ein.', 'Yank the name and insert it before the exclamation mark with <kbd>Ctrl-r "</kbd> in insert mode.'), text: T('Name: ¶Ada\nGruß: Hallo !', 'Name: ¶Ada\nGreeting: Hello !'), goal: T('Name: Ada\nGruß: Hallo Ada!', 'Name: Ada\nGreeting: Hello Ada!'), require: ['<C-r>'], sol: 'yiwj$i<C-r>"<Esc>' },
            { tier: 'final', task: T('Abschluss: Kopiere Name und Ort in die Register <code>a</code> und <code>b</code> und setze sie unten ein.', 'Wrap-up: yank name and place into registers <code>a</code> and <code>b</code> and fill them in below.'),
              text: T('¶name = "Ada"\nstadt = "London"\n\nGruß: \nOrt: ', '¶name = "Ada"\ncity = "London"\n\nHello: \nPlace: '),
              goal: T('name = "Ada"\nstadt = "London"\n\nGruß: Ada\nOrt: London', 'name = "Ada"\ncity = "London"\n\nHello: Ada\nPlace: London'), require: ['"a', '"b'], sol: '"ayi"j"byi"jjA<C-r>a<Esc>jA<C-r>b<Esc>',
              hint: T('Textobjekt <kbd>i"</kbd> mit Register davor. Im Einfügemodus holt <kbd>Ctrl-r</kbd> plus Registername den Inhalt.', 'Text object <kbd>i"</kbd> with a register in front. In insert mode <kbd>Ctrl-r</kbd> plus the register name brings the content.') }
          ]
        },
        {
          id: 'makros', title: T('Makros', 'Macros'),
          intro: T('Nimm Tastendrücke auf und spiele sie beliebig oft ab.', 'Record keystrokes and replay them as often as you like.'),
          keys: [['q{a-z}', T('Aufnahme in Register starten', 'Start recording into a register')], ['q', T('Aufnahme beenden', 'Stop recording')], ['@{a-z}', T('Makro abspielen', 'Play a macro')], ['@@', T('Letztes Makro wiederholen', 'Repeat the last macro')], ['5@a', T('Makro fünfmal abspielen', 'Play the macro five times')]],
          body: T(`<p>Ein Makro ist eine aufgezeichnete Tastenfolge. <kbd>qa</kbd> startet die Aufnahme, du bearbeitest eine Zeile, springst mit <kbd>j</kbd> zur nächsten und beendest mit <kbd>q</kbd>. Danach wiederholt <kbd>@a</kbd> alles.</p>
<p>Gute Makros beginnen an einem festen Punkt (etwa mit <kbd>0</kbd>) und enden dort, wo der nächste Durchlauf beginnen soll. Schlägt eine Bewegung fehl, etwa <kbd>j</kbd> in der letzten Zeile, bricht das Makro ab. Deshalb darf die Zahl ruhig zu groß sein.</p>`,
            `<p>A macro is a recorded sequence of keys. <kbd>qa</kbd> starts recording, you edit a line, move to the next with <kbd>j</kbd> and stop with <kbd>q</kbd>. Afterwards <kbd>@a</kbd> repeats it all.</p>
<p>Good macros start from a fixed point (for example with <kbd>0</kbd>) and end where the next run should begin. If a motion fails, like <kbd>j</kbd> on the last line, the macro stops. So the count may safely be too big.</p>`),
          demo: {
            text: '¶a\nb\nc\nd',
            steps: [['qa', T('<kbd>qa</kbd>: Aufnahme läuft, siehe Statuszeile.', '<kbd>qa</kbd>: recording, see the status line.')], ['A;<Esc>j', T('Eine Zeile bearbeiten und zur nächsten springen.', 'Edit one line and move to the next.')], ['q', T('<kbd>q</kbd> beendet die Aufnahme.', '<kbd>q</kbd> stops recording.')], ['@a', T('<kbd>@a</kbd> spielt alles ab.', '<kbd>@a</kbd> replays it.')], ['@@', T('<kbd>@@</kbd> wiederholt das letzte Makro.', '<kbd>@@</kbd> repeats the last macro.')]]
          },
          ex: [
            { tier: 'combo', task: T('Setze jede Frucht in Anführungszeichen mit Komma. Nimm ein Makro auf und spiele es ab.', 'Put every fruit in quotes followed by a comma. Record a macro and play it.'), text: '¶apple\npear\ncherry\nplum\nmango', goal: '"apple",\n"pear",\n"cherry",\n"plum",\n"mango",', require: ['q'], sol: 'qaI"<Esc>A",<Esc>jq4@a',
              hint: T('Zeichne eine Zeile auf: vorne, hinten, eine Zeile tiefer. Dann viermal abspielen.', 'Record one line: front, back, one line down. Then play it four times.') },
            { tier: 'combo', task: T('Hake alle Aufgaben mit einem Makro ab.', 'Tick off every task with a macro.'), text: T('¶- [ ] Einkaufen\n- [ ] Aufräumen\n- [ ] Vim lernen\n- [ ] Feiern', '¶- [ ] Shopping\n- [ ] Tidy up\n- [ ] Learn Vim\n- [ ] Celebrate'), goal: T('- [x] Einkaufen\n- [x] Aufräumen\n- [x] Vim lernen\n- [x] Feiern', '- [x] Shopping\n- [x] Tidy up\n- [x] Learn Vim\n- [x] Celebrate'), require: ['q'], sol: 'qa0f[lrxjq3@a',
              hint: T('Beginne das Makro mit <kbd>0</kbd>, damit jeder Durchlauf an derselben Stelle startet.', 'Start the macro with <kbd>0</kbd> so every run starts at the same spot.') },
            { tier: 'final', task: T('Abschluss: Mach aus jeder Datenzeile einen Satz wie in der ersten Zielzeile.', 'Wrap-up: turn every data line into a sentence like the first goal line.'),
              text: '¶ada,36\nlinus,28\ngrace,85\nbram,62', goal: T('Ada ist 36 Jahre alt.\nLinus ist 28 Jahre alt.\nGrace ist 85 Jahre alt.\nBram ist 62 Jahre alt.', 'Ada is 36 years old.\nLinus is 28 years old.\nGrace is 85 years old.\nBram is 62 years old.'),
              require: ['q'], sol: T('qa~f,s ist <Esc>A Jahre alt.<Esc>j0q3@a', 'qa~f,s is <Esc>A years old.<Esc>j0q3@a'),
              hint: T('Pro Zeile: ersten Buchstaben groß, Komma ersetzen, Rest anhängen, zur nächsten Zeile an den Anfang.', 'Per line: capitalise the first letter, replace the comma, append the rest, go to the start of the next line.') }
          ]
        },
        {
          id: 'substitute', title: T('Suchen und Ersetzen', 'Search and replace'),
          intro: T('Der Befehl :s ersetzt Text per Muster.', 'The :s command replaces text by pattern.'),
          keys: [[':s/alt/neu/', T('Ersten Treffer in der Zeile ersetzen', 'Replace the first match in the line')], [':s/alt/neu/g', T('Alle Treffer in der Zeile', 'All matches in the line')], [':%s/alt/neu/g', T('Alle Treffer in der Datei', 'All matches in the file')], [":'<,'>s/a/b/", T('Nur in der Markierung', 'Only in the selection')], ['&', T('Im Ersatztext: der ganze Treffer', 'In the replacement: the whole match')], ['\\( \\) und \\1', T('Teile merken und wieder einsetzen', 'Capture parts and reuse them')]],
          body: T(`<p><kbd>:s</kbd> heißt <i>substitute</i>. Der Aufbau ist immer <code>:Bereich s/Muster/Ersatz/Flags</code>. Ohne Bereich wirkt der Befehl auf die aktuelle Zeile, <code>%</code> steht für die ganze Datei. Das Flag <code>g</code> ersetzt alle Treffer pro Zeile statt nur den ersten, <code>i</code> ignoriert Groß- und Kleinschreibung.</p>
<p>Drückst du <kbd>:</kbd> im visuellen Modus, setzt Vim automatisch <code>'&lt;,'&gt;</code> ein, den Bereich deiner Markierung.</p>`,
            `<p><kbd>:s</kbd> means <i>substitute</i>. It is always built like <code>:range s/pattern/replacement/flags</code>. Without a range it acts on the current line, <code>%</code> means the whole file. The flag <code>g</code> replaces every match per line instead of just the first, <code>i</code> ignores case.</p>
<p>If you press <kbd>:</kbd> in visual mode, Vim fills in <code>'&lt;,'&gt;</code>, the range of your selection.</p>`),
          concept: T(`<h4>Treffer wiederverwenden: &amp; und Gruppen</h4>
<p><b>Schritt 1:</b> Im Ersatztext steht <code>&amp;</code> für den gesamten Treffer. <code>:s/[0-9]\\+/[&amp;]/</code> macht aus <code>404</code> ein <code>[404]</code>. <code>[0-9]\\+</code> heißt „eine oder mehr Ziffern“.</p>
<p><b>Schritt 2:</b> Willst du nur <b>Teile</b> des Treffers wiederverwenden, setzt du sie im Muster in <code>\\(</code> und <code>\\)</code>. Vim nummeriert die Klammern von links: die erste ist <code>\\1</code>, die zweite <code>\\2</code>.</p>
<p><b>Beispiel:</b> Muster <code>\\(\\w\\+\\), \\(\\w\\+\\)</code> auf <code>Lovelace, Ada</code>. <code>\\w\\+</code> heißt „ein Wort“. Gruppe 1 merkt sich <code>Lovelace</code>, Gruppe 2 merkt sich <code>Ada</code>. Der Ersatz <code>\\2 \\1</code> schreibt sie vertauscht: <code>Ada Lovelace</code>.</p>
<p>Die Backslashes vor den Klammern sind nötig, weil normale Klammern in Vim-Mustern ganz normale Zeichen sind.</p>`,
            `<h4>Reusing the match: &amp; and groups</h4>
<p><b>Step 1:</b> In the replacement, <code>&amp;</code> stands for the whole match. <code>:s/[0-9]\\+/[&amp;]/</code> turns <code>404</code> into <code>[404]</code>. <code>[0-9]\\+</code> means “one or more digits”.</p>
<p><b>Step 2:</b> To reuse only <b>parts</b> of the match, wrap them in <code>\\(</code> and <code>\\)</code> in the pattern. Vim numbers the groups from the left: the first is <code>\\1</code>, the second <code>\\2</code>.</p>
<p><b>Example:</b> pattern <code>\\(\\w\\+\\), \\(\\w\\+\\)</code> on <code>Lovelace, Ada</code>. <code>\\w\\+</code> means “a word”. Group 1 captures <code>Lovelace</code>, group 2 captures <code>Ada</code>. The replacement <code>\\2 \\1</code> writes them swapped: <code>Ada Lovelace</code>.</p>
<p>The backslashes before the brackets are needed because plain brackets are ordinary characters in Vim patterns.</p>`),
          demo: {
            text: '¶Lovelace, Ada',
            steps: [[':s/\\w\\+/[&]/<CR>', T('<code>&amp;</code> ist der ganze Treffer, hier das erste Wort.', '<code>&amp;</code> is the whole match, here the first word.')], ['u', T('Rückgängig.', 'Undo.')], [':s/\\(\\w\\+\\), \\(\\w\\+\\)/\\2 \\1/<CR>', T('Zwei Gruppen merken sich die Wörter, <code>\\2 \\1</code> vertauscht sie.', 'Two groups capture the words, <code>\\2 \\1</code> swaps them.')]]
          },
          ex: [
            { tier: 'basic', task: T('Ersetze in der Zeile jedes „alt“ durch „neu“.', 'Replace every “old” in the line with “new”.'), text: T('¶Das alte Haus ist alt.', '¶The old house is old.'), goal: T('Das neue Haus ist neu.', 'The new house is new.'), sol: T(':s/alt/neu/g<CR>', ':s/old/new/g<CR>') },
            { tier: 'basic', task: T('Ersetze in der ganzen Datei „var“ durch „let“.', 'Replace “var” with “let” in the whole file.'), text: '¶var a = 1;\nvar b = 2;\nvar c = a + b;', goal: 'let a = 1;\nlet b = 2;\nlet c = a + b;', sol: ':%s/var/let/<CR>' },
            { tier: 'basic', task: T('Ersetze „foo“ nur in den ersten beiden Zeilen. Markiere sie vorher visuell.', 'Replace “foo” only in the first two lines. Select them visually first.'), text: '¶foo\nfoo\nfoo\nfoo', goal: 'bar\nbar\nfoo\nfoo', sol: 'Vj:s/foo/bar/<CR>' },
            { tier: 'combo', task: T('Ersetze alle Schreibweisen von „vim“ durch „Neovim“, egal ob groß oder klein.', 'Replace every spelling of “vim” with “Neovim”, whatever the case.'), text: '¶Vim vim VIM', goal: 'Neovim Neovim Neovim', sol: ':s/vim/Neovim/gi<CR>',
              hint: T('Zwei Flags: alle Treffer und Groß/klein ignorieren.', 'Two flags: all matches and ignore case.') },
            { tier: 'basic', task: T('Schritt 1 zu Gruppen: Setze die Zahl mit <code>&amp;</code> in eckige Klammern.', 'Step 1 towards groups: put the number in square brackets using <code>&amp;</code>.'), text: T('¶Fehler: 404', '¶Error: 404'), goal: T('Fehler: [404]', 'Error: [404]'), sol: ':s/[0-9]\\+/[&]/<CR>',
              hint: T('Muster für „Ziffern“: <code>[0-9]\\+</code>. Im Ersatz steht <code>&amp;</code> für den gefundenen Text.', 'Pattern for “digits”: <code>[0-9]\\+</code>. In the replacement <code>&amp;</code> stands for the matched text.') },
            { tier: 'basic', task: T('Schritt 2: Drehe Nach- und Vorname mit zwei Gruppen um.', 'Step 2: swap last and first name using two groups.'), text: '¶Lovelace, Ada', goal: 'Ada Lovelace', sol: ':s/\\(\\w\\+\\), \\(\\w\\+\\)/\\2 \\1/<CR>',
              hint: T('Zwei Wörter, je in <code>\\(</code> <code>\\)</code>, dazwischen Komma und Leerzeichen. Im Ersatz zuerst <code>\\2</code>.', 'Two words, each inside <code>\\(</code> <code>\\)</code>, with comma and space between. In the replacement <code>\\2</code> first.') },
            { tier: 'combo', task: T('Schritt 3: Wandle das Datum mit drei Gruppen in das deutsche Format um.', 'Step 3: convert the date to day.month.year with three groups.'), text: T('¶Datum: 2026-10-28', '¶Date: 2026-10-28'), goal: T('Datum: 28.10.2026', 'Date: 28.10.2026'), sol: ':s/\\(\\d\\+\\)-\\(\\d\\+\\)-\\(\\d\\+\\)/\\3.\\2.\\1/<CR>',
              hint: T('<code>\\d\\+</code> heißt „Ziffern“. Drei Gruppen, getrennt durch Bindestriche, im Ersatz rückwärts.', '<code>\\d\\+</code> means “digits”. Three groups separated by hyphens, reversed in the replacement.') },
            { tier: 'final', task: T('Abschluss: Entferne die Kopfzeile und mach aus jeder CSV-Zeile mit einem einzigen <code>:%s</code> einen Satz.', 'Wrap-up: remove the header line and turn every CSV row into a sentence with a single <code>:%s</code>.'),
              text: T('¶name,alter\nAda,36\nLinus,28\nGrace,85', '¶name,age\nAda,36\nLinus,28\nGrace,85'), goal: T('Ada ist 36 Jahre alt.\nLinus ist 28 Jahre alt.\nGrace ist 85 Jahre alt.', 'Ada is 36 years old.\nLinus is 28 years old.\nGrace is 85 years old.'),
              sol: T('dd:%s/\\(\\w\\+\\),\\(\\d\\+\\)/\\1 ist \\2 Jahre alt./<CR>', 'dd:%s/\\(\\w\\+\\),\\(\\d\\+\\)/\\1 is \\2 years old./<CR>'),
              hint: T('Gruppe 1 ist der Name, Gruppe 2 die Zahl. Den Rest des Satzes schreibst du in den Ersatz.', 'Group 1 is the name, group 2 the number. The rest of the sentence goes into the replacement.') }
          ]
        },
        {
          id: 'ex-befehle', title: T('Ex-Befehle', 'Ex commands'),
          intro: T('Die Befehlszeile kann viel mehr als speichern.', 'The command line can do much more than save.'),
          keys: [[':g/Muster/d', T('Alle passenden Zeilen löschen', 'Delete all matching lines')], [':v/Muster/d', T('Alle nicht passenden Zeilen löschen', 'Delete all non-matching lines')], [':sort', T('Zeilen sortieren', 'Sort lines')], [':m$', T('Zeile ans Ende verschieben', 'Move the line to the end')], [':%norm A;', T('Normalbefehl auf jede Zeile anwenden', 'Run a normal command on every line')], [':set rnu', T('Relative Zeilennummern einschalten', 'Turn on relative line numbers')]],
          body: T(`<p><kbd>:g</kbd> (<i>global</i>) führt einen Befehl auf jeder Zeile aus, die zu einem Muster passt. <kbd>:g/TODO/d</kbd> löscht alle TODO-Zeilen, <kbd>:g/^$/d</kbd> alle leeren Zeilen (<code>^$</code> heißt „Anfang direkt gefolgt vom Ende“). <kbd>:norm</kbd> spielt Normalmodus-Tasten auf jeder Zeile eines Bereichs ab, wie ein Makro ohne Aufnahme.</p>
<p>Relative Zeilennummern zeigen, wie weit jede Zeile vom Cursor entfernt ist. Damit siehst du sofort, ob du <kbd>4j</kbd> oder <kbd>7k</kbd> brauchst.</p>`,
            `<p><kbd>:g</kbd> (<i>global</i>) runs a command on every line that matches a pattern. <kbd>:g/TODO/d</kbd> deletes all TODO lines, <kbd>:g/^$/d</kbd> all empty lines (<code>^$</code> means “start immediately followed by end”). <kbd>:norm</kbd> plays normal-mode keys on every line of a range, like a macro without recording.</p>
<p>Relative line numbers show how far each line is from the cursor. That way you see at once whether you need <kbd>4j</kbd> or <kbd>7k</kbd>.</p>`),
          demo: {
            text: '¶b\n# note\na\n\nc',
            steps: [[':g/^#/d<CR>', T('Alle Zeilen, die mit <code>#</code> beginnen, verschwinden.', 'Every line starting with <code>#</code> disappears.')], [':g/^$/d<CR>', T('Leere Zeilen löschen.', 'Delete empty lines.')], [':sort<CR>', T('<kbd>:sort</kbd> sortiert.', '<kbd>:sort</kbd> sorts.')], [':%norm A;<CR>', T('<kbd>:%norm A;</kbd> hängt an jede Zeile ein Semikolon.', '<kbd>:%norm A;</kbd> appends a semicolon to every line.')]]
          },
          ex: [
            { tier: 'basic', task: T('Lösche alle TODO-Zeilen mit einem Befehl.', 'Delete all TODO lines with one command.'), text: '¶tidy()\n// TODO: remove\nsave()\n// TODO: also gone\nquit()', goal: 'tidy()\nsave()\nquit()', sol: ':g/TODO/d<CR>' },
            { tier: 'basic', task: T('Sortiere die Liste alphabetisch.', 'Sort the list alphabetically.'), text: '¶cherry\napple\nbanana', goal: 'apple\nbanana\ncherry', sol: ':sort<CR>' },
            { tier: 'basic', task: T('Verschiebe die erste Zeile ans Ende.', 'Move the first line to the end.'), text: T('¶drei\neins\nzwei', '¶three\none\ntwo'), goal: T('eins\nzwei\ndrei', 'one\ntwo\nthree'), sol: ':m$<CR>' },
            { tier: 'combo', task: T('Hänge mit <kbd>:norm</kbd> an jede Zeile ein Semikolon.', 'Append a semicolon to every line with <kbd>:norm</kbd>.'), text: '¶let a = 1\nlet b = 2\nlet c = 3', goal: 'let a = 1;\nlet b = 2;\nlet c = 3;', sol: ':%norm A;<CR>',
              hint: T('Bereich <code>%</code>, dann <code>norm</code> und die Tasten, die du im Normalmodus drücken würdest.', 'Range <code>%</code>, then <code>norm</code> and the keys you would press in normal mode.') },
            { tier: 'basic', task: T('Schalte relative Zeilennummern ein.', 'Turn on relative line numbers.'), text: T('¶Relative Nummern zeigen den Abstand.\nZwei Zeilen tiefer ist eine 2.\nDrei Zeilen tiefer ist eine 3.\nSo planst du Sprünge wie 3j.', '¶Relative numbers show the distance.\nTwo lines down shows a 2.\nThree lines down shows a 3.\nThat is how you plan jumps like 3j.'), expect: '^se(t)?\\s+(rnu|relativenumber)$', sol: ':set rnu<CR>' },
            { tier: 'final', task: T('Abschluss: Entferne Kommentare und Leerzeilen, sortiere und entferne Doppelte ohne Rücksicht auf Groß/klein.', 'Wrap-up: remove comments and blank lines, sort, and drop duplicates ignoring case.'),
              text: T('¶banane\n\nApfel\n# Kommentar\nkirsche\n\napfel', '¶banana\n\nApple\n# comment\ncherry\n\napple'), goal: T('Apfel\nbanane\nkirsche', 'Apple\nbanana\ncherry'),
              sol: ':g/^#/d<CR>:g/^$/d<CR>:sort ui<CR>',
              hint: T('Zweimal <kbd>:g</kbd> mit verschiedenen Mustern, dann <kbd>:sort</kbd> mit den Flags <code>u</code> (eindeutig) und <code>i</code> (Groß/klein egal).', 'Twice <kbd>:g</kbd> with different patterns, then <kbd>:sort</kbd> with the flags <code>u</code> (unique) and <code>i</code> (ignore case).') }
          ]
        }
      ]
    }
  ];

  const CHALLENGES = [
    { id: 'komma', title: T('Kommaliste', 'Comma list'), level: 1, task: T('Trenne die Früchte mit Kommas.', 'Separate the fruits with commas.'), text: '¶apple pear cherry', goal: 'apple, pear, cherry', sol: 'ea,<Esc>e.' },
    { id: 'gross', title: T('Konstanten', 'Constants'), level: 1, task: T('Schreibe beide Namen in Großbuchstaben.', 'Write both names in capitals.'), text: "const ¶api_url = '/v1';\nconst max_retries = 3;", goal: "const API_URL = '/v1';\nconst MAX_RETRIES = 3;", sol: 'gUiwj.' },
    { id: 'quotes', title: T('Anführungszeichen', 'Quotes'), level: 1, task: T('Ersetze die einfachen durch doppelte Anführungszeichen.', 'Replace the single quotes with double quotes.'), text: "¶print('Hello world')", goal: 'print("Hello world")', sol: "f'r\";r\"" },
    { id: 'html', title: T('Tag umbenennen', 'Rename a tag'), level: 2, task: T('Mache aus dem div ein span, öffnend und schließend.', 'Turn the div into a span, opening and closing.'), text: '<¶div>Hello</div>', goal: '<span>Hello</span>', sol: 'cwspan<Esc>f/l.' },
    { id: 'bedingung', title: T('Bedingung vereinfachen', 'Simplify a condition'), level: 2, task: T('Ersetze die komplette Bedingung durch „ok“.', 'Replace the whole condition with “ok”.'), text: 'if (¶old && complicated || expression) {', goal: 'if (ok) {', sol: 'ci(ok<Esc>' },
    { id: 'doppelt', title: T('Block verdoppeln', 'Duplicate a block'), level: 2, task: T('Hänge beide Listeneinträge noch einmal unten an.', 'Append both list items again at the bottom.'), text: '¶<li>One</li>\n<li>Two</li>', goal: '<li>One</li>\n<li>Two</li>\n<li>One</li>\n<li>Two</li>', sol: 'yjGp' },
    { id: 'nummern', title: T('Durchnummerieren', 'Numbering'), level: 2, task: T('Die Liste soll von 1 bis 4 zählen.', 'The list should count from 1 to 4.'), text: '¶1. Bread\n1. Milk\n1. Eggs\n1. Cheese', goal: '1. Bread\n2. Milk\n3. Eggs\n4. Cheese', sol: 'jVGg<C-a>' },
    { id: 'semikolon', title: T('Semikolons überall', 'Semicolons everywhere'), level: 2, task: T('Jede Zeile braucht ein Semikolon am Ende.', 'Every line needs a semicolon at the end.'), text: '¶const a = 1\nconst b = 2\nconst c = 3\nconst d = 4\nconsole.log(a + b + c + d)', goal: 'const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconsole.log(a + b + c + d);', sol: ':%norm A;<CR>' },
    { id: 'tauschen', title: T('Argumente tauschen', 'Swap arguments'), level: 3, task: T('Vertausche die beiden Argumente.', 'Swap the two arguments.'), text: 'divide(¶divisor, dividend)', goal: 'divide(dividend, divisor)', sol: 'dWea, <C-r>"<BS><BS><Esc>' },
    { id: 'kommentare', title: T('Kommentare raus', 'Strip comments'), level: 3, task: T('Entferne alle Kommentarzeilen, auch die eingerückte.', 'Remove all comment lines, including the indented one.'), text: '¶const a = 1;\n// comment\nconst b = 2;\n    // indented comment\nconst c = a + b;', goal: 'const a = 1;\nconst b = 2;\nconst c = a + b;', sol: ':g/\\/\\//d<CR>' },
    { id: 'umdrehen', title: T('Zeilen umdrehen', 'Reverse lines'), level: 3, task: T('Kehre die Reihenfolge aller Zeilen um.', 'Reverse the order of all lines.'), text: '¶one\ntwo\nthree\nfour', goal: 'four\nthree\ntwo\none', sol: ':g/^/m0<CR>' },
    { id: 'csv', title: T('CSV zu Tabelle', 'CSV to table'), level: 3, task: T('Ersetze jedes Komma durch „ | “ (mit Leerzeichen).', 'Replace every comma with “ | ” (with spaces).'), text: '¶name,age,city\nAda,36,London\nLinus,28,Helsinki', goal: 'name | age | city\nAda | 36 | London\nLinus | 28 | Helsinki', sol: ':%s/,/ | /g<CR>' }
  ];

  const WELCOME = {
    task: T('Bewege den Cursor mit <kbd>l</kbd> nach rechts und mit <kbd>j</kbd> nach unten bis zum leuchtenden Ziel.', 'Move the cursor right with <kbd>l</kbd> and down with <kbd>j</kbd> until you reach the glowing target.'),
    text: T('¶Willkommen bei Vimsical.\nDrücke l für rechts und j für unten.\nDas leuchtende Feld ist dein ◊Ziel.', '¶Welcome to Vimsical.\nPress l for right and j for down.\nThe glowing cell is your ◊goal.'),
    sol: T('jj' + 'l'.repeat(29), 'jj' + 'l'.repeat(25))
  };

  const DRILL_TEXT = [
    'function target(points) {', '    const hits = [];', '    for (const p of points) {', '        if (p.x > 0 && p.y > 0) {',
    '            hits.push({ x: p.x, y: p.y });', '        } else {', '            console.warn("miss", p);', '        }', '    }',
    '    return hits.length * 10;', '}', '', 'export default target;'
  ].join('\n');

  /* ---------- Übungen vorbereiten und prüfen ---------- */
  const ARROWS = { '←': '', '→': '', '↑': '', '↓': '' };

  function L(x, lang) {
    if (x == null) return x;
    if (typeof x === 'function') return x(lang);
    if (typeof x === 'object' && !Array.isArray(x) && ('de' in x || 'en' in x)) return x[lang] != null ? x[lang] : x.de;
    return x;
  }
  function Lmap(obj, lang) {
    if (!obj) return null;
    const o = L(obj, lang);
    const out = {};
    for (const k in o) out[k] = L(o[k], lang);
    return out;
  }

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

  function prepare(raw, lang) {
    const Vim = root.Vim;
    lang = lang || 'de';
    let files = Lmap(raw.files, lang);
    let parsed;
    if (files) {
      const first = raw.active || Object.keys(files)[0];
      parsed = parseMarked(files[first]);
      files = Object.assign({}, files);
      for (const k in files) files[k] = k === first ? parsed.text : parseMarked(files[k]).text;
      files = { order: [first].concat(Object.keys(files).filter(k => k !== first)), map: files };
    } else parsed = parseMarked(L(raw.text, lang));
    let targets = parsed.targets;
    if (raw.order === 'reverse') targets = targets.slice().reverse();
    else if (Array.isArray(raw.order)) targets = raw.order.map(i => parsed.targets[i]);
    const goal = L(raw.goal, lang);
    const goalFiles = Lmap(raw.goalFiles, lang), goalBuffers = Lmap(raw.goalBuffers, lang);
    const type = (goal != null || goalFiles || goalBuffers || raw.test) ? 'match' : raw.expect ? 'cmd' : 'targets';
    const sol = L(raw.sol, lang);
    const solKeys = sol ? Vim.parseNotation(sol) : null;
    const block = new Set();
    if (raw.block) for (const ch of raw.block) block.add(ARROWS[ch] || ch);
    if (block.has('h') && block.has('l')) for (const a of Object.values(ARROWS)) block.add(a);
    const require = (raw.require || []).map(r => r.split('|').map(alt => Vim.parseNotation(alt).join('')));
    const pre = L(raw.pre, lang);
    let goalView = null;
    if (goal != null) goalView = { name: null, text: goal };
    else if (goalBuffers) { const k = Object.keys(goalBuffers)[0]; goalView = { name: k, text: goalBuffers[k], all: goalBuffers }; }
    else if (goalFiles) { const k = Object.keys(goalFiles)[0]; goalView = { name: k, text: goalFiles[k], saved: true, all: goalFiles }; }
    return Object.assign({}, raw, {
      type, text: parsed.text, files, start: parsed.start, targets, goal, goalFiles, goalBuffers, goalView, solKeys, sol,
      task: L(raw.task, lang), hint: L(raw.hint, lang), title: L(raw.title, lang),
      preKeys: pre ? Vim.parseNotation(pre) : null,
      par: raw.par || (solKeys ? solKeys.length : 0), blockSet: block, requireKeys: require, tier: raw.tier || 'basic'
    });
  }

  function makeWorkspace(ex, opts) {
    const Vim = root.Vim;
    opts = opts || {};
    const lines = (ex.files ? ex.files.map[ex.files.order[0]] : ex.text).split('\n').length;
    const height = ex.height || opts.height || Math.max(ex.files ? 8 : 4, Math.min(14, lines + 1));
    const wsOpts = { height };
    if (ex.files) {
      const ordered = {};
      ex.files.order.forEach(k => { ordered[k] = ex.files.map[k]; });
      wsOpts.files = ordered;
    } else wsOpts.text = ex.text;
    const ws = new Vim.Workspace(wsOpts);
    if (opts.help) ws.shared.help = opts.help;
    if (opts.onClipboard) ws.shared.onClipboard = opts.onClipboard;
    const v = ws.active;
    v.setCursor(ex.start.r, ex.start.c);
    if (ex.preKeys) { ex.preKeys.forEach(k => ws.feed(k)); ws.allWindows().forEach(w => { w.v.message = null; w.v.list = null; }); ws.shared.exLog.length = 0; }
    return ws;
  }

  function newState() { return { ti: 0, hist: '', keys: 0, done: false }; }

  function isBlocked(ex, v, key) {
    if (!ex.blockSet.size || v.mode !== 'normal') return false;
    if (!/^("[\s\S])?\d*$/.test(v.pending)) return false;
    if (/^\d$/.test(key) && (key !== '0' || /\d$/.test(v.pending))) return false;
    return ex.blockSet.has(key);
  }

  function check(ex, st, ws) {
    const v = ws.active || ws;
    const shared = v.shared;
    if (ex.type === 'targets') {
      while (st.ti < ex.targets.length && v.mode === 'normal' && v.r === ex.targets[st.ti].r && v.c === ex.targets[st.ti].c) st.ti++;
      return st.ti >= ex.targets.length;
    }
    const reqOk = ex.requireKeys.every(alts => alts.some(a => st.hist.includes(a)));
    if (!reqOk) return false;
    if (ex.expect) {
      const re = new RegExp(ex.expect);
      if (!shared.exLog.some(c => re.test(c))) return false;
    }
    if (ex.type === 'cmd') return true;
    if (v.mode !== 'normal') return false;
    if (ex.goal != null && v.text() !== ex.goal) return false;
    if (ex.goalBuffers) for (const k in ex.goalBuffers) {
      const b = shared.buffers.find(x => x.name === k);
      if (!b || b.lines.join('\n') !== ex.goalBuffers[k]) return false;
    }
    if (ex.goalFiles) for (const k in ex.goalFiles) if (shared.files[k] !== ex.goalFiles[k]) return false;
    if (ex.test && !ex.test(ws.active ? ws : { active: v, shared })) return false;
    return true;
  }

  function stars(keys, par) {
    if (!par) return 3;
    if (keys <= par) return 3;
    if (keys <= Math.ceil(par * 1.6)) return 2;
    return 1;
  }

  root.VK = { COURSE, CHALLENGES, WELCOME, DRILL_TEXT, prepare, makeWorkspace, newState, isBlocked, check, stars, parseMarked, L, T, genLines, gen };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.VK;
})(typeof window !== 'undefined' ? window : this);
