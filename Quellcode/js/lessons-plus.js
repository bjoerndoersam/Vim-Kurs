/* Vimsical · Aufbaukapitel 6 bis 10
   Präzise Bewegungen, fortgeschrittenes Bearbeiten, Befehlszeile und Regex,
   Dateien/Puffer/Fenster/Tabs und Vim anpassen. Gleiches Format wie lessons.js. */
(function (root) {
  'use strict';
  const { T, gen, genLines } = root.VK;
  const win = ws => ws.windows();

  const CHAPTERS = [
    /* =================================================================== */
    {
      id: 'praezise', title: T('Präzise bewegen', 'Precise motions'), lessons: [
        {
          id: 'saetze', title: T('Sätze', 'Sentences'),
          intro: T('Zwischen Wort und Absatz liegt eine dritte Einheit: der Satz.', 'Between word and paragraph there is a third unit: the sentence.'),
          keys: [[')', T('Zum Anfang des nächsten Satzes', 'To the start of the next sentence')], ['(', T('Zum Anfang des aktuellen bzw. vorherigen Satzes', 'To the start of the current or previous sentence')], ['is / as', T('Satz ohne / mit folgendem Leerraum', 'Sentence without / with trailing space')]],
          body: T(`<p>Für Vim endet ein Satz mit <code>.</code>, <code>!</code> oder <code>?</code>, gefolgt von einem Leerzeichen oder dem Zeilenende. Auch eine Leerzeile beendet einen Satz. <kbd>)</kbd> springt zum nächsten Satzanfang, <kbd>(</kbd> zurück.</p>
<p>Sätze sind auch Textobjekte: <kbd>das</kbd> löscht den Satz unter dem Cursor samt Leerzeichen, <kbd>cis</kbd> ersetzt ihn. Das ist ideal für Prosa, E-Mails und Dokumentation.</p>`,
            `<p>To Vim a sentence ends with <code>.</code>, <code>!</code> or <code>?</code> followed by a space or the end of the line. A blank line ends a sentence too. <kbd>)</kbd> jumps to the next sentence start, <kbd>(</kbd> goes back.</p>
<p>Sentences are text objects as well: <kbd>das</kbd> deletes the sentence under the cursor including its space, <kbd>cis</kbd> replaces it. Ideal for prose, emails and documentation.</p>`),
          demo: {
            text: T('¶Vim ist alt. Er ist schnell! Und er ist überall.', '¶Vim is old. It is fast! And it is everywhere.'),
            steps: [[')', T('<kbd>)</kbd>: nächster Satzanfang.', '<kbd>)</kbd>: next sentence start.')], [')', T('Und noch einer.', 'And another.')], ['(', T('<kbd>(</kbd>: zurück.', '<kbd>(</kbd>: back.')], ['das', T('<kbd>das</kbd> löscht den ganzen Satz samt Leerzeichen.', '<kbd>das</kbd> deletes the whole sentence including the space.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe mit <kbd>)</kbd> von Satz zu Satz.', 'Jump from sentence to sentence with <kbd>)</kbd>.'),
              text: T('¶Vim ist alt. ◊Er ist schnell! ◊Und überall? ◊Ja.', '¶Vim is old. ◊It is fast! ◊And everywhere? ◊Yes.'), block: 'hjklwbeWBE', sol: ')))' },
            { tier: 'basic', task: T('Lösche den mittleren Satz mit einem Textobjekt.', 'Delete the middle sentence with a text object.'),
              text: T('Vim ist alt. Er ist ¶sehr, sehr schnell! Und überall.', 'Vim is old. It is ¶very, very fast! And everywhere.'), goal: T('Vim ist alt. Und überall.', 'Vim is old. And everywhere.'), sol: 'das',
              hint: T('<kbd>as</kbd> nimmt das Leerzeichen danach mit, damit keine doppelten Leerzeichen bleiben.', '<kbd>as</kbd> takes the following space so no double spaces remain.') },
            { tier: 'combo', task: T('Ersetze den mittleren Satz durch einen neuen.', 'Replace the middle sentence with a new one.'),
              text: T('Erster Satz. Zweiter ¶Satz ist falsch. Dritter Satz.', 'First sentence. Second ¶sentence is wrong. Third sentence.'),
              goal: T('Erster Satz. Zweiter Satz stimmt. Dritter Satz.', 'First sentence. Second sentence is right. Third sentence.'),
              sol: T('cisZweiter Satz stimmt.<Esc>', 'cisSecond sentence is right.<Esc>'), hint: T('<kbd>cis</kbd>: Satz ändern, ohne das Leerzeichen danach.', '<kbd>cis</kbd>: change the sentence without the space after it.') },
            { tier: 'final', task: T('Abschluss: Entferne die beiden überflüssigen Sätze „Er ist modal.“ und „Dieser Satz ist überflüssig.“', 'Wrap-up: remove the two unnecessary sentences “It is modal.” and “This sentence is useless.”'),
              text: T('¶Vim ist ein Editor. Er ist modal. Das heißt,\njede Taste hat je nach Modus eine andere\nBedeutung. Dieser Satz ist überflüssig. Am Ende\nsteht ein Fazit.', '¶Vim is an editor. It is modal. That means\nevery key does something different\ndepending on the mode. This sentence is useless. At the\nend there is a summary.'),
              goal: T('Vim ist ein Editor. Das heißt,\njede Taste hat je nach Modus eine andere\nBedeutung. Am Ende\nsteht ein Fazit.', 'Vim is an editor. That means\nevery key does something different\ndepending on the mode. At the\nend there is a summary.'),
              sol: ')das)das', hint: T('Sätze können über mehrere Zeilen gehen. <kbd>)</kbd> findet trotzdem den nächsten Anfang.', 'Sentences can span several lines. <kbd>)</kbd> still finds the next start.') }
          ]
        },
        {
          id: 'klammer-spruenge', title: T('Aus Blöcken herausspringen', 'Jumping out of blocks'),
          intro: T('Von irgendwo im Block direkt zu seiner Klammer.', 'From anywhere in a block straight to its bracket.'),
          keys: [['[{', T('Zur umschließenden öffnenden { springen', 'To the enclosing opening {')], [']}', T('Zur umschließenden schließenden } springen', 'To the enclosing closing }')], ['[(', T('Zur umschließenden ( springen', 'To the enclosing (')], ['])', T('Zur umschließenden ) springen', 'To the enclosing )')], ['[[ / ]]', T('Zur vorherigen / nächsten { in Spalte 1', 'To the previous / next { in column 1')]],
          body: T(`<p><kbd>%</kbd> braucht eine Klammer in der Zeile. <kbd>[{</kbd> dagegen funktioniert von überall innerhalb eines Blocks: Vim sucht rückwärts die öffnende Klammer, die noch nicht geschlossen wurde. Wiederholt gedrückt geht es Block für Block nach außen.</p>
<p><kbd>[[</kbd> und <kbd>]]</kbd> springen zu Zeilen, die mit <code>{</code> beginnen. In C und Java steht die öffnende Klammer einer Funktion oft genau dort.</p>`,
            `<p><kbd>%</kbd> needs a bracket on the line. <kbd>[{</kbd>, on the other hand, works from anywhere inside a block: Vim searches backwards for the opening bracket that has not been closed yet. Pressed repeatedly it goes outwards block by block.</p>
<p><kbd>[[</kbd> and <kbd>]]</kbd> jump to lines that start with <code>{</code>. In C and Java a function's opening brace often sits exactly there.</p>`),
          demo: {
            text: 'function f(a) {\n    if (a > 0) {\n        ¶log(a);\n    }\n}',
            steps: [['[{', T('<kbd>[{</kbd>: zur öffnenden Klammer des if-Blocks.', '<kbd>[{</kbd>: to the opening brace of the if block.')], ['[{', T('Noch einmal: eine Ebene weiter nach außen.', 'Again: one level further out.')], [']}', T('<kbd>]}</kbd>: zur passenden schließenden Klammer.', '<kbd>]}</kbd>: to the matching closing brace.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe zur öffnenden Klammer des if-Blocks und dann zur schließenden Klammer der Funktion.', 'Jump to the opening brace of the if block, then to the closing brace of the function.'),
              text: 'function f(a) {\n    if (a > 0) ◊{\n        ¶log(a, b);\n    }\n◊}', block: 'hjklwbeWBE', sol: '[{]}]}',
              hint: T('Von der öffnenden Klammer des if-Blocks bringt dich <kbd>]}</kbd> erst zu dessen Ende, dann eine Ebene weiter.', 'From the if block\'s opening brace <kbd>]}</kbd> first takes you to its end, then one level further.') },
            { tier: 'basic', task: T('Springe zur Klammer von <code>second</code> und dann zur Klammer von <code>compute</code>.', 'Jump to the bracket of <code>second</code>, then to the bracket of <code>compute</code>.'),
              text: 'result = compute◊(first, second◊(¶x), third)', order: [1, 0], block: 'hjklwbeWBEfFtT', sol: '[([(' },
            { tier: 'combo', task: T('Lösche den Funktionskörper samt Klammern: Springe zur umschließenden { und lösche bis zur passenden.', 'Delete the function body including braces: jump to the enclosing { and delete to its partner.'),
              text: 'function f()\n{\n    ¶return 1;\n}\nnext();', goal: 'function f()\n\nnext();', sol: '[{d%',
              hint: T('Zwei bekannte Bausteine: diese Lektion zum Hinspringen, <kbd>d%</kbd> aus Kapitel 4 zum Löschen.', 'Two known building blocks: this lesson to jump there, <kbd>d%</kbd> from chapter 4 to delete.') },
            { tier: 'final', task: T('Abschluss: Ergänze in der aktuellen und der nächsten Funktion direkt nach der öffnenden Klammer die Zeile <code>// start</code>.', 'Wrap-up: in the current and the next function add the line <code>// start</code> right after the opening brace.'),
              text: 'int main()\n{\n    run();\n}\n\nvoid run()\n{\n    ¶print("x");\n}\n\nvoid stop()\n{\n}',
              goal: 'int main()\n{\n    run();\n}\n\nvoid run()\n{\n    // start\n    print("x");\n}\n\nvoid stop()\n{\n    // start\n}',
              sol: '[[o<Tab>// start<Esc>]]o<Tab>// start<Esc>', hint: T('<kbd>[[</kbd> führt zur { der aktuellen Funktion, <kbd>]]</kbd> zur nächsten. Die Einrückung kommt mit <kbd>Tab</kbd>.', '<kbd>[[</kbd> leads to the current function\'s {, <kbd>]]</kbd> to the next one. Indent with <kbd>Tab</kbd>.') }
          ]
        },
        {
          id: 'sprungliste', title: T('Sprung- und Änderungsliste', 'Jump list and change list'),
          intro: T('Vim merkt sich, wo du warst und wo du etwas geändert hast.', 'Vim remembers where you have been and where you changed things.'),
          keys: [['<C-o>', T('Zurück zur vorherigen Sprungposition', 'Back to the previous jump position')], ['<C-i>', T('Wieder vorwärts in der Sprungliste', 'Forward again in the jump list')], ['g;', T('Zur letzten Änderung', 'To the last change')], ['g,', T('Zur neueren Änderung', 'To a newer change')], ['gi', T('Dort weiter einfügen, wo du zuletzt eingefügt hast', 'Insert where you last inserted')], [':jumps / :changes', T('Listen anzeigen', 'Show the lists')]],
          body: T(`<p>Sprünge sind große Bewegungen: <kbd>G</kbd>, <kbd>gg</kbd>, Suchen, <kbd>%</kbd>, Marken, <kbd>{</kbd> und <kbd>}</kbd>. Kleine Bewegungen wie <kbd>j</kbd> oder <kbd>w</kbd> zählen nicht. <kbd>Ctrl-o</kbd> bringt dich zur Position vor dem letzten Sprung, <kbd>Ctrl-i</kbd> wieder vorwärts. So kannst du nach einem Abstecher in eine andere Ecke der Datei sofort zurück.</p>
<p>Unabhängig davon führt Vim eine Liste deiner Änderungen. <kbd>g;</kbd> springt zur letzten Änderung, jedes weitere <kbd>g;</kbd> eine ältere zurück.</p>`,
            `<p>Jumps are big motions: <kbd>G</kbd>, <kbd>gg</kbd>, searches, <kbd>%</kbd>, marks, <kbd>{</kbd> and <kbd>}</kbd>. Small motions like <kbd>j</kbd> or <kbd>w</kbd> don't count. <kbd>Ctrl-o</kbd> takes you to where you were before the last jump, <kbd>Ctrl-i</kbd> forward again. After a detour to another corner of the file you are back instantly.</p>
<p>Separately, Vim keeps a list of your changes. <kbd>g;</kbd> jumps to the last change, each further <kbd>g;</kbd> to an older one.</p>`),
          tip: T('Im Browser ist die Tab-Taste für die Navigation reserviert. Nutze <kbd>Ctrl-i</kbd>, das ist in Vim dieselbe Taste.', 'In the browser the Tab key is reserved for navigation. Use <kbd>Ctrl-i</kbd>, which is the same key in Vim.'),
          demo: {
            text: gen(20, 'line', { 2: '¶' }), height: 8,
            steps: [['15G', T('Ein Sprung nach Zeile 15.', 'A jump to line 15.')], ['5G', T('Noch ein Sprung.', 'Another jump.')], ['<C-o>', T('<kbd>Ctrl-o</kbd>: zurück nach Zeile 15.', '<kbd>Ctrl-o</kbd>: back to line 15.')], ['<C-o>', T('Und zum Anfang zurück.', 'And back to the start.')], ['<C-i>', T('<kbd>Ctrl-i</kbd>: wieder vorwärts.', '<kbd>Ctrl-i</kbd>: forward again.')]]
          },
          ex: [
            { tier: 'basic', task: T('Springe zu Zeile 18, mit <kbd>Ctrl-o</kbd> zurück und mit <kbd>Ctrl-i</kbd> wieder hin.', 'Jump to line 18, back with <kbd>Ctrl-o</kbd> and there again with <kbd>Ctrl-i</kbd>.'),
              text: gen(20, 'line', { 2: '◊¶', 17: '◊' }), order: [1, 0, 1], height: 10, require: ['<C-o>', '<C-i>'], sol: '18G<C-o><C-i>' },
            { tier: 'basic', task: T('Jemand hat in einer Zeile ein Zeichen geändert. Springe mit <kbd>g;</kbd> dorthin.', 'Someone changed a character on one line. Jump there with <kbd>g;</kbd>.'),
              text: T('eins\nzwei\ndrei\n◊vier\nfünf\nsechs\nsieben\n¶acht', 'one\ntwo\nthree\n◊four\nfive\nsix\nseven\n¶eight'), pre: 'gg3jrXG', require: ['g;'], sol: 'g;' },
            { tier: 'combo', task: T('Du hast in Zeile 3 getippt und bist danach weggesprungen. Tippe mit <kbd>gi</kbd> an derselben Stelle weiter: „, Brot“.', 'You typed on line 3 and then jumped away. Continue at the same spot with <kbd>gi</kbd>: “, bread”.'),
              text: T('Notizen\n\n- Einkaufen\n\n¶Ende', 'Notes\n\n- Shopping\n\n¶End'), pre: T('ggjjA: Milch<Esc>G', 'ggjjA: milk<Esc>G'),
              goal: T('Notizen\n\n- Einkaufen: Milch, Brot\n\nEnde', 'Notes\n\n- Shopping: milk, bread\n\nEnd'), require: ['gi'], sol: T('gi, Brot<Esc>', 'gi, bread<Esc>') },
            { tier: 'final', task: T('Abschluss: Hänge an Zeile 20 „ A“ an, springe mit <kbd>Ctrl-o</kbd> zurück und hänge „ B“ an, dann springe mit <kbd>g;</kbd> zur ersten Änderung und hänge „ C“ an.', 'Wrap-up: append “ A” to line 20, jump back with <kbd>Ctrl-o</kbd> and append “ B”, then jump to the first change with <kbd>g;</kbd> and append “ C”.'),
              text: gen(25, 'line', { 3: '¶' }), goal: lang => { const ls = genLines(lang, 25, 'line'); ls[19] += ' A C'; ls[3] += ' B'; return ls.join('\n'); }, height: 10,
              require: ['<C-o>', 'g;'], sol: '20GA A<Esc><C-o>A B<Esc>g;g;A C<Esc>',
              hint: T('Die Änderungsliste speichert jede Änderung. Das erste <kbd>g;</kbd> führt zur jüngsten, das zweite eine weiter zurück.', 'The change list stores every change. The first <kbd>g;</kbd> leads to the most recent one, the second one further back.') }
          ]
        },
        {
          id: 'suche-plus', title: T('Gezielter suchen', 'Searching precisely'),
          intro: T('Suchen mit Versatz, ohne Wortgrenzen und nach Definitionen.', 'Search with offsets, without word boundaries and for definitions.'),
          keys: [['/x/e', T('Auf dem Ende des Treffers landen', 'Land on the end of the match')], ['/x/+1', T('Auf der Zeile nach dem Treffer landen', 'Land on the line after the match')], ['g* / g#', T('Wort unter dem Cursor suchen, auch als Teil anderer Wörter', 'Search the word under the cursor, also inside other words')], ['gd', T('Zur lokalen Deklaration springen', 'Go to the local declaration')], ['gD', T('Zur ersten Erwähnung in der Datei springen', 'Go to the first mention in the file')], ['50%', T('Zur Hälfte der Datei springen', 'Jump to the middle of the file')]],
          body: T(`<p>Hinter dem Suchmuster kannst du einen <b>Versatz</b> angeben: <code>/Ziel/e</code> landet auf dem letzten Zeichen des Treffers, <code>/Ziel/e+1</code> eins dahinter, <code>/Ziel/+2</code> zwei Zeilen tiefer. Das spart nach der Suche weitere Bewegungen.</p>
<p><kbd>gd</kbd> („go to declaration“) springt zur ersten Stelle des Wortes in der aktuellen Funktion, <kbd>gD</kbd> zur ersten Stelle in der ganzen Datei. Für lokale und globale Variablen ist das ein schneller Weg zur Definition.</p>`,
            `<p>After the search pattern you can add an <b>offset</b>: <code>/target/e</code> lands on the last character of the match, <code>/target/e+1</code> one past it, <code>/target/+2</code> two lines below. That saves extra motions after the search.</p>
<p><kbd>gd</kbd> (“go to declaration”) jumps to the first occurrence of the word in the current function, <kbd>gD</kbd> to the first occurrence in the whole file. For local and global variables that is a quick way to the definition.</p>`),
          demo: {
            text: 'let total = 0;\nfunction add(n) {\n    let total = n;\n    return ¶total;\n}',
            steps: [['gd', T('<kbd>gd</kbd>: zur Deklaration in dieser Funktion.', '<kbd>gd</kbd>: to the declaration in this function.')], ['gD', T('<kbd>gD</kbd>: zur ersten Erwähnung in der Datei.', '<kbd>gD</kbd>: to the first mention in the file.')], ['/add/e<CR>', T('<code>/add/e</code> landet auf dem Ende des Treffers.', '<code>/add/e</code> lands on the end of the match.')]]
          },
          ex: [
            { tier: 'basic', task: T('Lande mit einem Versatz auf dem letzten Buchstaben des Zielworts, dann mit <code>+1</code> auf der Zeile darunter.', 'Use an offset to land on the last letter of the target word, then with <code>+1</code> on the line below.'),
              text: T('¶Gesucht ist das Ende des Wortes Zie◊l und dann die Zeile darunter.\n◊Hier.', '¶We want the end of the word targe◊t and then the line below.\n◊Here.'),
              block: 'hjklwbeWBEfFtT;,', sol: T('/Ziel/e<CR>/Ziel/+1<CR>', '/target/e<CR>/target/+1<CR>') },
            { tier: 'basic', task: T('Springe zur lokalen Deklaration von <code>count</code> und danach zur globalen.', 'Jump to the local declaration of <code>count</code>, then to the global one.'),
              text: 'let ◊count = 0;\nfunction tick() {\n    let ◊count = 1;\n    return ¶count;\n}', order: [1, 0], block: 'hjklwbeWBE', sol: 'gdgD' },
            { tier: 'combo', task: T('Finde mit <kbd>g*</kbd> auch die Stellen, an denen „log“ in anderen Wörtern steckt.', 'Use <kbd>g*</kbd> to also find places where “log” sits inside other words.'),
              text: '¶log ◊logger cata◊log', block: 'hjklwbeWBE', sol: 'g*n', hint: T('<kbd>*</kbd> sucht nur das ganze Wort, <kbd>g*</kbd> ohne Wortgrenzen.', '<kbd>*</kbd> only searches the whole word, <kbd>g*</kbd> without word boundaries.') },
            { tier: 'final', task: T('Abschluss: Hänge an die Zeile in der Mitte der Datei „ // Mitte“ an. Springe dann von <code>LIMIT</code> in der letzten Zeile mit <kbd>gD</kbd> zur Definition und setze den Wert auf 20.', 'Wrap-up: append “ // middle” to the line in the middle of the file. Then jump from <code>LIMIT</code> on the last line to its definition with <kbd>gD</kbd> and set the value to 20.'),
              text: () => ['const LIMIT = 10;'].concat(Array.from({ length: 18 }, (x, i) => 'step(' + (i + 1) + ');'), ['¶check(LIMIT);']).join('\n'),
              goal: lang => { const ls = ['const LIMIT = 20;'].concat(Array.from({ length: 18 }, (x, i) => 'step(' + (i + 1) + ');'), ['check(LIMIT);']); ls[9] += lang === 'en' ? ' // middle' : ' // Mitte'; return ls.join('\n'); },
              height: 10, sol: T('50%A // Mitte<Esc>G0fLgDf1cw20<Esc>', '50%A // middle<Esc>G0fLgDf1cw20<Esc>'),
              hint: T('<kbd>50%</kbd> springt in die Mitte der Datei. Für <kbd>gD</kbd> muss der Cursor auf dem Wort stehen.', '<kbd>50%</kbd> jumps to the middle of the file. For <kbd>gD</kbd> the cursor has to be on the word.') }
          ]
        },
        {
          id: 'scrollen-plus', title: T('Feiner scrollen', 'Fine scrolling'),
          intro: T('Den Bildausschnitt bewegen, ohne den Cursor zu verlieren.', 'Move the view without losing the cursor.'),
          keys: [['<C-e>', T('Ansicht eine Zeile nach unten schieben', 'Scroll the view down one line')], ['<C-y>', T('Ansicht eine Zeile nach oben schieben', 'Scroll the view up one line')], ['zt / zb', T('Aktuelle Zeile nach oben / unten im Bild', 'Current line to the top / bottom of the screen')], ['+ / -', T('Erstes Zeichen der nächsten / vorigen Zeile', 'First character of the next / previous line')], [':set so=3', T('Immer drei Zeilen Abstand zum Rand halten', 'Always keep three lines from the edge')]],
          body: T(`<p><kbd>Ctrl-e</kbd> und <kbd>Ctrl-y</kbd> schieben den Text zeilenweise, der Cursor bleibt auf seiner Zeile, solange sie sichtbar ist. <kbd>zt</kbd> holt die aktuelle Zeile an den oberen Rand, <kbd>zb</kbd> an den unteren. So siehst du gezielt, was darunter oder darüber kommt.</p>
<p>Die Option <code>scrolloff</code> (kurz <code>so</code>) sorgt dafür, dass oberhalb und unterhalb des Cursors immer einige Zeilen sichtbar bleiben.</p>`,
            `<p><kbd>Ctrl-e</kbd> and <kbd>Ctrl-y</kbd> move the text line by line; the cursor stays on its line as long as it is visible. <kbd>zt</kbd> brings the current line to the top, <kbd>zb</kbd> to the bottom. That way you choose what you see below or above.</p>
<p>The option <code>scrolloff</code> (short <code>so</code>) keeps a few lines visible above and below the cursor at all times.</p>`),
          demo: {
            text: gen(30, 'sec', { 4: '¶' }), height: 8,
            steps: [['<C-e>', T('<kbd>Ctrl-e</kbd>: eine Zeile nach unten schieben.', '<kbd>Ctrl-e</kbd>: scroll down one line.')], ['3<C-e>', T('Mit Zahl: drei Zeilen.', 'With a count: three lines.')], ['<C-y>', T('<kbd>Ctrl-y</kbd>: zurück.', '<kbd>Ctrl-y</kbd>: back.')], ['zt', T('<kbd>zt</kbd>: Zeile an den oberen Rand.', '<kbd>zt</kbd>: line to the top.')], ['zb', T('<kbd>zb</kbd>: an den unteren Rand.', '<kbd>zb</kbd>: to the bottom.')]]
          },
          ex: [
            { tier: 'basic', task: T('Schiebe die Ansicht mit <kbd>Ctrl-e</kbd>, bis Abschnitt 11 ganz oben steht.', 'Scroll the view with <kbd>Ctrl-e</kbd> until section 11 is at the very top.'),
              text: gen(40, 'sec', { 2: '¶' }), height: 10, block: 'jkGHML', test: ws => ws.active.top === 10, sol: '10<C-e>',
              hint: T('Auch hier funktioniert eine Zahl davor.', 'A count in front works here too.') },
            { tier: 'basic', task: T('Bringe die Zeile mit dem Cursor an den oberen Rand.', 'Bring the cursor line to the top edge.'),
              text: gen(40, 'sec', { 6: '¶' }), height: 10, test: ws => ws.active.top === 6 && ws.active.r === 6, sol: 'zt' },
            { tier: 'combo', task: T('Springe mit <kbd>+</kbd> und <kbd>-</kbd> zu den ersten Zeichen der Zeilen.', 'Jump to the first characters of the lines with <kbd>+</kbd> and <kbd>-</kbd>.'),
              text: 'def f():\n    ¶a = 1\n        ◊b = 2\n    ◊c = 3', order: [1, 0], block: 'jkhl0^$wbe', sol: '++-' },
            { tier: 'final', task: T('Abschluss: Setze <code>scrolloff</code> auf 2, springe zu Zeile 20 und schiebe sie mit <kbd>zb</kbd> nach unten. Dank scrolloff bleiben zwei Zeilen darunter sichtbar.', 'Wrap-up: set <code>scrolloff</code> to 2, jump to line 20 and push it to the bottom with <kbd>zb</kbd>. Thanks to scrolloff two lines below stay visible.'),
              text: gen(40, 'sec', { 0: '¶' }), height: 10, require: ['zb'], test: ws => ws.active.o.scrolloff === 2 && ws.active.r === 19 && ws.active.top === 12, sol: ':set so=2<CR>20Gzb',
              hint: T('Optionen setzt du mit <code>:set name=wert</code>.', 'Set options with <code>:set name=value</code>.') }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'bearbeiten-plus', title: T('Fortgeschritten bearbeiten', 'Advanced editing'), lessons: [
        {
          id: 'einfuege-tricks', title: T('Einfügemodus-Tricks', 'Insert mode tricks'),
          intro: T('Im Einfügemodus gibt es mehr als Buchstaben.', 'There is more to insert mode than letters.'),
          keys: [['<C-w>', T('Wort vor dem Cursor löschen', 'Delete the word before the cursor')], ['<C-u>', T('Bis zum Zeilenanfang löschen', 'Delete to the start of the line')], ['<C-o>', T('Einen Normalbefehl ausführen, dann weiter tippen', 'Run one normal command, then keep typing')], ['<C-t> / <C-d>', T('Zeile ein- / ausrücken', 'Indent / unindent the line')], ['<C-a>', T('Zuletzt eingefügten Text noch einmal einfügen', 'Insert the last inserted text again')], ['<C-y> / <C-e>', T('Zeichen aus der Zeile darüber / darunter kopieren', 'Copy the character from the line above / below')], ['20i=<Esc>', T('Einfügen mit Zahl wiederholt den Text', 'Insert with a count repeats the text')]],
          body: T(`<p>Für kleine Korrekturen musst du den Einfügemodus nicht verlassen. <kbd>Ctrl-w</kbd> löscht das letzte Wort, <kbd>Ctrl-u</kbd> alles bis zum Zeilenanfang. <kbd>Ctrl-o</kbd> erlaubt genau einen Befehl aus dem Normalmodus, etwa <kbd>Ctrl-o $</kbd> zum Zeilenende, danach tippst du weiter.</p>
<p>Eine Zahl vor <kbd>i</kbd> oder <kbd>a</kbd> wiederholt den getippten Text: <kbd>20i=</kbd><kbd>Esc</kbd> erzeugt zwanzig Gleichheitszeichen.</p>`,
            `<p>You don't have to leave insert mode for small corrections. <kbd>Ctrl-w</kbd> deletes the last word, <kbd>Ctrl-u</kbd> everything to the start of the line. <kbd>Ctrl-o</kbd> allows exactly one normal-mode command, for example <kbd>Ctrl-o $</kbd> to the end of the line, then you keep typing.</p>
<p>A count before <kbd>i</kbd> or <kbd>a</kbd> repeats the typed text: <kbd>20i=</kbd><kbd>Esc</kbd> produces twenty equals signs.</p>`),
          tip: T('Unter Windows und Linux belegt der Browser <kbd>Ctrl-w</kbd>, <kbd>Ctrl-t</kbd> und <kbd>Ctrl-n</kbd> selbst. Im Kurs funktionieren dort ersatzweise <kbd>Alt-w</kbd>, <kbd>Alt-t</kbd> und <kbd>Alt-n</kbd>.', 'On Windows and Linux the browser claims <kbd>Ctrl-w</kbd>, <kbd>Ctrl-t</kbd> and <kbd>Ctrl-n</kbd>. In the course you can use <kbd>Alt-w</kbd>, <kbd>Alt-t</kbd> and <kbd>Alt-n</kbd> there instead.'),
          demo: {
            text: T('Ich lerne¶', 'I learn¶'),
            steps: [['A Emacs', T('Hoppla, falsches Wort getippt.', 'Oops, wrong word typed.')], ['<C-w>', T('<kbd>Ctrl-w</kbd> löscht es, ohne den Einfügemodus zu verlassen.', '<kbd>Ctrl-w</kbd> deletes it without leaving insert mode.')], ['Vim<C-o>0', T('<kbd>Ctrl-o 0</kbd>: kurz an den Zeilenanfang.', '<kbd>Ctrl-o 0</kbd>: briefly to the start of the line.')], ['» <Esc>', T('Und dort weiter tippen.', 'And keep typing there.')]]
          },
          ex: [
            { tier: 'basic', task: T('Hänge „ Emacs“ an, lösche es sofort mit <kbd>Ctrl-w</kbd> und tippe „Vim“.', 'Append “ Emacs”, delete it right away with <kbd>Ctrl-w</kbd> and type “Vim”.'),
              text: T('¶Ich lerne', '¶I learn'), goal: T('Ich lerne Vim', 'I learn Vim'), require: ['<C-w>'], sol: 'A Emacs<C-w>Vim<Esc>' },
            { tier: 'basic', task: T('Rücke die Zeile im Einfügemodus mit <kbd>Ctrl-t</kbd> ein.', 'Indent the line in insert mode with <kbd>Ctrl-t</kbd>.'), text: 'if x:\n¶print(x)', goal: 'if x:\n    print(x)', require: ['<C-t>'], sol: 'A<C-t><Esc>' },
            { tier: 'basic', task: T('Ziehe unter dem Titel eine Linie aus 20 Gleichheitszeichen.', 'Draw a line of 20 equals signs under the title.'), text: T('Titel\n¶', 'Title\n¶'), goal: T('Titel\n====================', 'Title\n===================='), sol: '20i=<Esc>',
              hint: T('Eine Zahl vor <kbd>i</kbd> wiederholt alles, was du bis <kbd>Esc</kbd> tippst.', 'A count before <kbd>i</kbd> repeats everything you type until <kbd>Esc</kbd>.') },
            { tier: 'combo', task: T('Setze das Wort in eckige Klammern, ohne den Einfügemodus zwischendurch zu verlassen.', 'Put the word in square brackets without leaving insert mode in between.'),
              text: T('¶wichtig', '¶important'), goal: T('[wichtig]', '[important]'), require: ['<C-o>'], sol: 'i[<C-o>$]<Esc>',
              hint: T('<kbd>Ctrl-o</kbd> und dann eine Bewegung zum Zeilenende.', '<kbd>Ctrl-o</kbd> and then a motion to the end of the line.') },
            { tier: 'combo', task: T('Setze „TODO: “ vor beide Zeilen. Tippe es nur einmal und nutze beim zweiten Mal <kbd>Ctrl-a</kbd>.', 'Put “TODO: ” in front of both lines. Type it only once and use <kbd>Ctrl-a</kbd> the second time.'),
              text: T('¶aufräumen\nputzen', '¶tidy up\nclean'), goal: T('TODO: aufräumen\nTODO: putzen', 'TODO: tidy up\nTODO: clean'), require: ['<C-a>'], sol: 'ITODO: <Esc>jI<C-a><Esc>' },
            { tier: 'final', task: T('Abschluss: Übernimm den Betrag aus der Zeile darüber Zeichen für Zeichen mit <kbd>Ctrl-y</kbd>.', 'Wrap-up: take over the amount from the line above character by character with <kbd>Ctrl-y</kbd>.'),
              text: T('¶Brutto: 1234,56 Euro\nNetto:  ', '¶Gross: 1234.56 EUR\nNet:   '), goal: T('Brutto: 1234,56 Euro\nNetto:  1234,56 Euro', 'Gross: 1234.56 EUR\nNet:   1234.56 EUR'),
              require: ['<C-y>'], sol: T('jA' + '<C-y>'.repeat(12) + '<Esc>', 'jA' + '<C-y>'.repeat(11) + '<Esc>'),
              hint: T('<kbd>Ctrl-y</kbd> kopiert das Zeichen, das genau darüber steht. Beide Beschriftungen sind gleich lang.', '<kbd>Ctrl-y</kbd> copies the character directly above. Both labels have the same length.') }
          ]
        },
        {
          id: 'vervollstaendigen', title: T('Vervollständigen', 'Completion'),
          intro: T('Lange Namen tippst du nur einmal.', 'You type long names only once.'),
          keys: [['<C-n>', T('Nächstes passende Wort', 'Next matching word')], ['<C-p>', T('Vorheriges passende Wort', 'Previous matching word')], ['<C-x><C-l>', T('Ganze Zeile vervollständigen', 'Complete a whole line')]],
          body: T(`<p>Tippe den Anfang eines Wortes und drücke <kbd>Ctrl-n</kbd>. Vim sucht im Text nach Wörtern mit diesem Anfang und setzt das erste ein. Weiteres <kbd>Ctrl-n</kbd> blättert durch die Treffer, <kbd>Ctrl-p</kbd> rückwärts. <kbd>Ctrl-n</kbd> sucht zuerst unterhalb des Cursors, <kbd>Ctrl-p</kbd> zuerst oberhalb.</p>
<p><kbd>Ctrl-x</kbd> öffnet weitere Vervollständigungsarten. <kbd>Ctrl-x Ctrl-l</kbd> ergänzt eine ganze Zeile, die so beginnt wie das, was du schon getippt hast.</p>`,
            `<p>Type the beginning of a word and press <kbd>Ctrl-n</kbd>. Vim searches the text for words with that beginning and inserts the first one. More <kbd>Ctrl-n</kbd> cycles through the matches, <kbd>Ctrl-p</kbd> backwards. <kbd>Ctrl-n</kbd> searches below the cursor first, <kbd>Ctrl-p</kbd> above first.</p>
<p><kbd>Ctrl-x</kbd> opens further kinds of completion. <kbd>Ctrl-x Ctrl-l</kbd> completes a whole line that starts like what you have typed so far.</p>`),
          demo: {
            text: 'const connectionTimeout = 30;\nconst connectionRetries = 3;\n¶',
            steps: [['iprint(conn', T('Nur den Anfang tippen ...', 'Type only the beginning ...')], ['<C-n>', T('... <kbd>Ctrl-n</kbd> ergänzt den ersten Treffer.', '... <kbd>Ctrl-n</kbd> completes the first match.')], ['<C-n>', T('Noch einmal: der nächste Treffer.', 'Again: the next match.')], [');<Esc>', T('Fertig.', 'Done.')]]
          },
          ex: [
            { tier: 'basic', task: T('Schreibe <code>print(connectionTimeout);</code>, tippe vom Namen aber nur „conn“.', 'Write <code>print(connectionTimeout);</code> but type only “conn” of the name.'),
              text: 'const connectionTimeout = 30;\n¶', goal: 'const connectionTimeout = 30;\nprint(connectionTimeout);', require: ['<C-n>'], sol: 'iprint(conn<C-n>);<Esc>' },
            { tier: 'basic', task: T('Ergänze mit <kbd>Ctrl-p</kbd> den Namen aus der Zeile direkt darüber.', 'Complete the name from the line directly above with <kbd>Ctrl-p</kbd>.'),
              text: 'userName = 1\nuserId = 2\n¶', goal: 'userName = 1\nuserId = 2\nuserId + 1', require: ['<C-p>'], sol: 'iuser<C-p> + 1<Esc>',
              hint: T('<kbd>Ctrl-p</kbd> sucht zuerst rückwärts, also oberhalb des Cursors.', '<kbd>Ctrl-p</kbd> searches backwards first, so above the cursor.') },
            { tier: 'combo', task: T('Blättere mit <kbd>Ctrl-n</kbd> bis zum passenden Treffer <code>alpine</code>.', 'Cycle with <kbd>Ctrl-n</kbd> to the right match <code>alpine</code>.'),
              text: 'alpha = 1\nalphabet = 2\nalpine = 3\n¶', goal: 'alpha = 1\nalphabet = 2\nalpine = 3\nalpine', require: ['<C-n>'], sol: 'ialp<C-n><C-n><C-n><Esc>' },
            { tier: 'final', task: T('Abschluss: Dupliziere die erste Zeile per Zeilenvervollständigung und ändere darin <code>debug</code> in <code>info</code>.', 'Wrap-up: duplicate the first line with line completion and change <code>debug</code> to <code>info</code> in it.'),
              text: "logger.debug('Start', { user, time });\n¶", goal: "logger.debug('Start', { user, time });\nlogger.info('Start', { user, time });", require: ['<C-x><C-l>'], sol: 'ilog<C-x><C-l><Esc>0fdciwinfo<Esc>',
              hint: T('Tippe den Zeilenanfang, dann <kbd>Ctrl-x</kbd> und <kbd>Ctrl-l</kbd>. Danach ein Textobjekt für das Wort.', 'Type the start of the line, then <kbd>Ctrl-x</kbd> and <kbd>Ctrl-l</kbd>. Then a text object for the word.') }
          ]
        },
        {
          id: 'digraphen', title: T('Sonderzeichen', 'Special characters'),
          intro: T('€, →, ° und Anführungszeichen ohne Zeichentabelle.', '€, →, ° and quotation marks without a character map.'),
          keys: [['<C-k>{zz}', T('Sonderzeichen per Digraph einfügen', 'Insert a special character by digraph')], [':dig', T('Alle Digraphen anzeigen', 'List all digraphs')], ['ga', T('Code des Zeichens unter dem Cursor anzeigen', 'Show the code of the character under the cursor')], ['<C-v>u20ac', T('Zeichen per Unicode-Nummer einfügen', 'Insert a character by Unicode number')]],
          body: T(`<p>Ein <b>Digraph</b> ist ein Kürzel aus zwei Zeichen. Im Einfügemodus drückst du <kbd>Ctrl-k</kbd> und dann die beiden Zeichen: <code>Eu</code> wird zu €, <code>-></code> zu →, <code>DG</code> zu °, <code>a:</code> zu ä. Die Kürzel sind meist so gewählt, wie das Zeichen aussieht.</p>
<p>Deutsche Anführungszeichen „…“ sind <code>:9</code> und <code>"6</code>, englische “…” sind <code>"6</code> und <code>"9</code>. <kbd>ga</kbd> verrät dir im Normalmodus den Code eines Zeichens.</p>`,
            `<p>A <b>digraph</b> is a two-character shortcut. In insert mode press <kbd>Ctrl-k</kbd> followed by the two characters: <code>Eu</code> becomes €, <code>-></code> becomes →, <code>DG</code> becomes °, <code>a:</code> becomes ä. The shortcuts usually look like the character.</p>
<p>English quotation marks “…” are <code>"6</code> and <code>"9</code>, German ones „…“ are <code>:9</code> and <code>"6</code>. In normal mode <kbd>ga</kbd> tells you a character's code.</p>`),
          demo: {
            text: '¶Preis 5',
            steps: [['A <C-k>Eu', T('<kbd>Ctrl-k</kbd> <code>Eu</code> ergibt €.', '<kbd>Ctrl-k</kbd> <code>Eu</code> gives €.')], [' <C-k>-> ', T('<code>-></code> ergibt einen Pfeil.', '<code>-></code> gives an arrow.')], ['ok<Esc>', T('Weiter tippen.', 'Keep typing.')], ['0ga', T('<kbd>ga</kbd> zeigt den Code des Zeichens.', '<kbd>ga</kbd> shows the character\'s code.')]]
          },
          ex: [
            { tier: 'basic', task: T('Hänge das Euro-Zeichen an.', 'Append the euro sign.'), text: T('¶Preis: 5 ', '¶Price: 5 '), goal: T('Preis: 5 €', 'Price: 5 €'), sol: 'A<C-k>Eu<Esc>' },
            { tier: 'basic', task: T('Füge zwischen den Wörtern einen Pfeil ein.', 'Insert an arrow between the words.'), text: T('¶Start Ziel', '¶Start Goal'), goal: T('Start → Ziel', 'Start → Goal'), sol: 'ea <C-k>-><Esc>' },
            { tier: 'combo', task: T('Lass dir mit <kbd>ga</kbd> den Code des „ß“ anzeigen.', 'Show the code of the “ß” with <kbd>ga</kbd>.'), text: 'Stra¶ße', test: ws => !!ws.active.message && /223/.test(ws.active.message.text), sol: 'ga' },
            { tier: 'final', task: T('Abschluss: Setze typografische Anführungszeichen und ersetze „Grad“ durch „°C“.', 'Wrap-up: add typographic quotation marks and replace “degrees” with “°C”.'),
              text: T('¶Es sind 25 Grad, sagte er.', '¶It is 25 degrees, he said.'), goal: T('„Es sind 25 °C“, sagte er.', '“It is 25 °C”, he said.'),
              sol: T('I<C-k>:9<Esc>fGcw<C-k>DGC<Esc>f,i<C-k>"6<Esc>', 'I<C-k>"6<Esc>fdcw<C-k>DGC<Esc>f,i<C-k>"9<Esc>'),
              hint: T('Drei Stellen: vorne <code>:9</code>, das Wort mit <code>DG</code> plus C, vor dem Komma <code>"6</code>.', 'Three spots: in front <code>"6</code>, the word with <code>DG</code> plus C, before the comma <code>"9</code>.') }
          ]
        },
        {
          id: 'formatieren', title: T('Formatieren und Einrücken', 'Formatting and indenting'),
          intro: T('Fließtext umbrechen und Code automatisch einrücken.', 'Wrap prose and indent code automatically.'),
          keys: [['gq{Bewegung}', T('Text auf Zeilenbreite umbrechen', 'Wrap text to the line width')], ['gqip', T('Absatz umbrechen', 'Wrap the paragraph')], ['gw{Bewegung}', T('Umbrechen, Cursor bleibt stehen', 'Wrap, the cursor stays')], [':set tw=60', T('Zeilenbreite festlegen', 'Set the line width')], ['= {Bewegung} / ==', T('Code automatisch einrücken', 'Indent code automatically')], ['gg=G', T('Ganze Datei einrücken', 'Indent the whole file')], ['g?{Bewegung}', T('ROT13-Verschlüsselung', 'ROT13 encoding')]],
          body: T(`<p><kbd>gq</kbd> ist ein Operator, der Text auf die Breite aus <code>textwidth</code> umbricht. Kurze Zeilen werden zusammengezogen, lange an Wortgrenzen geteilt. Mit <kbd>gqip</kbd> formatierst du einen ganzen Absatz. Ist <code>textwidth</code> gesetzt, bricht Vim auch beim Tippen automatisch um.</p>
<p><kbd>=</kbd> rückt Code anhand der Klammern neu ein. <kbd>gg=G</kbd> repariert die Einrückung der ganzen Datei.</p>`,
            `<p><kbd>gq</kbd> is an operator that wraps text to the width in <code>textwidth</code>. Short lines are joined, long ones split at word boundaries. <kbd>gqip</kbd> formats a whole paragraph. With <code>textwidth</code> set, Vim also wraps automatically while you type.</p>
<p><kbd>=</kbd> re-indents code based on its brackets. <kbd>gg=G</kbd> fixes the indentation of the whole file.</p>`),
          demo: {
            text: T('¶Kurze\nZeilen\nwerden zu einem Absatz.\n\nif (a) {\nrun();\n}', '¶Short\nlines\nbecome one paragraph.\n\nif (a) {\nrun();\n}'),
            steps: [['gqip', T('<kbd>gqip</kbd> zieht den Absatz zusammen.', '<kbd>gqip</kbd> joins the paragraph.')], ['G=ip', T('<kbd>=ip</kbd> rückt den Code neu ein.', '<kbd>=ip</kbd> re-indents the code.')]]
          },
          ex: [
            { tier: 'basic', task: T('Brich die lange Zeile mit <kbd>gqq</kbd> um. <code>textwidth</code> steht auf 30.', 'Wrap the long line with <kbd>gqq</kbd>. <code>textwidth</code> is 30.'), pre: ':set tw=30<CR>',
              text: T('¶Vim bricht lange Zeilen auf Wunsch sauber an Wortgrenzen um.', '¶Vim wraps long lines neatly at word boundaries on request.'),
              goal: T('Vim bricht lange Zeilen auf\nWunsch sauber an Wortgrenzen\num.', 'Vim wraps long lines neatly at\nword boundaries on request.'), sol: 'gqq' },
            { tier: 'basic', task: T('Füge den Absatz mit <kbd>gqip</kbd> zusammen. <code>textwidth</code> steht auf 30.', 'Join the paragraph with <kbd>gqip</kbd>. <code>textwidth</code> is 30.'), pre: ':set tw=30<CR>',
              text: T('¶Kurze\nZeilen\nwerden\nzusammengefügt.', '¶Short\nlines\nget\njoined together.'), goal: T('Kurze Zeilen werden\nzusammengefügt.', 'Short lines get joined\ntogether.'), sol: 'gqip' },
            { tier: 'basic', task: T('Rücke den ganzen Code automatisch ein.', 'Indent all the code automatically.'), text: 'function f() {\n¶if (a) {\nreturn 1;\n}\n}', goal: 'function f() {\n    if (a) {\n        return 1;\n    }\n}', sol: 'gg=G' },
            { tier: 'combo', task: T('Entschlüssele den ROT13-Text.', 'Decode the ROT13 text.'), text: '¶Uryyb Ivz!', goal: 'Hello Vim!', sol: 'g??', hint: T('Wie bei <kbd>gUU</kbd>: doppelter Operator heißt ganze Zeile.', 'Like <kbd>gUU</kbd>: a doubled operator means the whole line.') },
            { tier: 'final', task: T('Abschluss: Brich den Absatz auf 40 Zeichen um und rücke danach den Code darunter ein.', 'Wrap-up: wrap the paragraph to 40 characters, then indent the code below.'), pre: ':set tw=40<CR>',
              text: T('¶Vim ist ein freier Editor. Er wurde 1991 von Bram Moolenaar veröffentlicht und ist heute auf fast jedem System zu finden.\n\nfunction f() {\nreturn 1;\n}', '¶Vim is a free editor. It was released by Bram Moolenaar in 1991 and today it can be found on almost every system.\n\nfunction f() {\nreturn 1;\n}'),
              goal: T('Vim ist ein freier Editor. Er wurde 1991\nvon Bram Moolenaar veröffentlicht und\nist heute auf fast jedem System zu\nfinden.\n\nfunction f() {\n    return 1;\n}', 'Vim is a free editor. It was released by\nBram Moolenaar in 1991 and today it can\nbe found on almost every system.\n\nfunction f() {\n    return 1;\n}'),
              sol: 'gqipG=ip', hint: T('Zwei Operatoren mit demselben Textobjekt: erst Text, dann Code.', 'Two operators with the same text object: text first, then code.') }
          ]
        },
        {
          id: 'register-plus', title: T('Register für Fortgeschrittene', 'Registers in depth'),
          intro: T('Spezialregister, Rechnen und Einfügen mit passender Einrückung.', 'Special registers, arithmetic and putting with matching indentation.'),
          keys: [['".', T('Zuletzt eingefügter Text', 'Last inserted text')], ['"%', T('Name der aktuellen Datei', 'Name of the current file')], ['":', T('Letzter Befehl der Befehlszeile', 'Last command-line command')], ['<C-r>=', T('Im Einfügemodus rechnen', 'Calculate in insert mode')], ['"+y / "+p', T('Systemzwischenablage', 'System clipboard')], [':let @a="…"', T('Register direkt setzen', 'Set a register directly')], ['gp / gP', T('Einfügen, Cursor landet dahinter', 'Put, cursor lands after it')], [']p', T('Einfügen mit passender Einrückung', 'Put with matching indentation')]],
          body: T(`<p>Einige Register füllt Vim selbst: <code>".</code> enthält den zuletzt getippten Text, <code>"%</code> den Dateinamen, <code>":</code> den letzten Befehl. Du holst sie wie jedes Register mit <kbd>"xp</kbd> oder im Einfügemodus mit <kbd>Ctrl-r x</kbd>.</p>
<p>Das <b>Ausdrucksregister</b> rechnet: Im Einfügemodus öffnet <kbd>Ctrl-r =</kbd> eine Eingabezeile, und das Ergebnis von <code>12*7</code> landet direkt im Text. <code>"+</code> ist die Zwischenablage des Betriebssystems.</p>`,
            `<p>Vim fills some registers itself: <code>".</code> holds the last typed text, <code>"%</code> the file name, <code>":</code> the last command. You get them like any register with <kbd>"xp</kbd> or in insert mode with <kbd>Ctrl-r x</kbd>.</p>
<p>The <b>expression register</b> calculates: in insert mode <kbd>Ctrl-r =</kbd> opens an input line and the result of <code>12*7</code> lands right in the text. <code>"+</code> is the operating system's clipboard.</p>`),
          demo: {
            text: T('¶Fläche 12 * 7 = ', '¶Area 12 * 7 = '),
            steps: [['A<C-r>=', T('<kbd>Ctrl-r =</kbd> öffnet das Ausdrucksregister.', '<kbd>Ctrl-r =</kbd> opens the expression register.')], ['12*7<CR>', T('Das Ergebnis landet im Text.', 'The result lands in the text.')], ['<Esc>o<C-r>%<Esc>', T('<code>"%</code> enthält den Dateinamen.', '<code>"%</code> holds the file name.')]]
          },
          ex: [
            { tier: 'basic', task: T('Lass Vim das Ergebnis ausrechnen und einfügen.', 'Let Vim calculate and insert the result.'), text: T('¶Fläche 12 * 7 = ', '¶Area 12 * 7 = '), goal: T('Fläche 12 * 7 = 84', 'Area 12 * 7 = 84'), require: ['<C-r>='], sol: 'A<C-r>=12*7<CR><Esc>' },
            { tier: 'basic', task: T('Füge den Dateinamen aus dem Register <code>%</code> ein.', 'Insert the file name from register <code>%</code>.'), files: { 'notes.txt': T('¶Datei: ', '¶File: ') }, goal: T('Datei: notes.txt', 'File: notes.txt'), require: ['<C-r>%'], sol: 'A<C-r>%<Esc>' },
            { tier: 'basic', task: T('Tippe „Vim“ in Zeile 1 und füge den zuletzt getippten Text mit <kbd>".p</kbd> in Zeile 2 ein.', 'Type “Vim” on line 1 and put the last typed text on line 2 with <kbd>".p</kbd>.'),
              text: T('Ich lerne ¶\nDu lernst ', 'I learn ¶\nYou learn '), goal: T('Ich lerne Vim\nDu lernst Vim', 'I learn Vim\nYou learn Vim'), require: ['".'], sol: 'AVim<Esc>j".p' },
            { tier: 'combo', task: T('Füge die Zeile dreimal mit <kbd>gp</kbd> ein und schreibe danach „Ende“ groß. <kbd>gp</kbd> lässt den Cursor hinter dem Eingefügten stehen.', 'Put the line three times with <kbd>gp</kbd>, then uppercase “End”. <kbd>gp</kbd> leaves the cursor after what it put.'),
              text: T('¶- [ ]\nEnde', '¶- [ ]\nEnd'), goal: T('- [ ]\n- [ ]\n- [ ]\n- [ ]\nENDE', '- [ ]\n- [ ]\n- [ ]\n- [ ]\nEND'), require: ['gp'], sol: 'yy3gpgUU' },
            { tier: 'combo', task: T('Füge die kopierte Zeile mit <kbd>]p</kbd> im Block ein, sodass sie die Einrückung übernimmt.', 'Put the yanked line inside the block with <kbd>]p</kbd> so it takes over the indentation.'),
              text: "¶log('x');\nif (ok) {\n    run();\n}", goal: "log('x');\nif (ok) {\n    run();\n    log('x');\n}", require: [']p'], sol: 'yyjj]p' },
            { tier: 'final', task: T('Abschluss: Lege per <code>:let</code> in Register <code>q</code> ein Makro ab, das ein Semikolon anhängt und eine Zeile tiefer springt, und spiele es dreimal ab.', 'Wrap-up: use <code>:let</code> to store a macro in register <code>q</code> that appends a semicolon and moves one line down, then play it three times.'),
              text: T('¶eins\nzwei\ndrei', '¶one\ntwo\nthree'), goal: T('eins;\nzwei;\ndrei;', 'one;\ntwo;\nthree;'), require: [':let'], sol: ':let @q="A;\\ej"<CR>3@q',
              hint: T('In doppelten Anführungszeichen steht <code>\\e</code> für Esc. Ein Register ist einfach Text, also auch ein Makro.', 'Inside double quotes <code>\\e</code> stands for Esc. A register is just text, so it can be a macro.') }
          ]
        },
        {
          id: 'undo-baum', title: T('Der Undo-Baum', 'The undo tree'),
          intro: T('In Vim geht keine Änderung verloren, nicht einmal nach Undo.', 'In Vim no change is ever lost, not even after undo.'),
          keys: [['U', T('Alle Änderungen der letzten Zeile zurücknehmen', 'Undo all changes on the last changed line')], ['g-', T('Zum zeitlich vorherigen Textstand', 'To the chronologically previous text state')], ['g+', T('Zum zeitlich nächsten Textstand', 'To the chronologically next text state')], [':earlier 3', T('Drei Stände zurück (auch 10s, 2m, 1h)', 'Three states back (also 10s, 2m, 1h)')], [':later 3', T('Drei Stände vor', 'Three states forward')], [':undo 0', T('Zurück zum Ausgangszustand', 'Back to the original state')]],
          body: T(`<p>Machst du nach einem <kbd>u</kbd> eine neue Änderung, entsteht ein neuer Zweig. Der alte Zweig ist mit <kbd>Ctrl-r</kbd> nicht mehr erreichbar, aber nicht weg. Vim nummeriert jeden Textstand fortlaufend. <kbd>g-</kbd> und <kbd>g+</kbd> laufen in dieser zeitlichen Reihenfolge, über alle Zweige hinweg.</p>
<p><kbd>:earlier 10s</kbd> stellt den Text so her, wie er vor zehn Sekunden aussah. <kbd>U</kbd> ist ein Sonderfall: Es setzt die zuletzt bearbeitete Zeile komplett zurück.</p>`,
            `<p>If you make a new change after <kbd>u</kbd>, a new branch is created. The old branch can no longer be reached with <kbd>Ctrl-r</kbd>, but it is not gone. Vim numbers every text state in sequence. <kbd>g-</kbd> and <kbd>g+</kbd> walk this chronological order across all branches.</p>
<p><kbd>:earlier 10s</kbd> restores the text as it looked ten seconds ago. <kbd>U</kbd> is a special case: it resets the last edited line completely.</p>`),
          demo: {
            text: '¶Version A',
            steps: [['ccVersion B<Esc>', T('Stand 1: Version B.', 'State 1: version B.')], ['u', T('Rückgängig: wieder A.', 'Undo: back to A.')], ['ccVersion C<Esc>', T('Stand 2: Version C. B scheint verloren.', 'State 2: version C. B seems lost.')], ['g-', T('<kbd>g-</kbd> geht zeitlich zurück: Stand 1, Version B.', '<kbd>g-</kbd> goes back in time: state 1, version B.')], ['g+', T('<kbd>g+</kbd> wieder vor zu Version C.', '<kbd>g+</kbd> forward again to version C.')]]
          },
          ex: [
            { tier: 'basic', task: T('Die Zeile wurde mehrfach verändert. Setze sie mit <kbd>U</kbd> zurück.', 'The line was changed several times. Reset it with <kbd>U</kbd>.'),
              text: T('¶Diese Zeile bleibt', '¶This line stays'), pre: 'xxxwx', goal: T('Diese Zeile bleibt', 'This line stays'), require: ['U'], sol: 'U' },
            { tier: 'basic', task: T('„Version B“ wurde rückgängig gemacht und durch „Version C“ ersetzt. Hol B zurück.', '“Version B” was undone and replaced by “Version C”. Get B back.'),
              text: '¶Version A', pre: 'ccVersion B<Esc>uccVersion C<Esc>', goal: 'Version B', require: ['g-'], sol: 'g-',
              hint: T('<kbd>u</kbd> führt zu A, <kbd>Ctrl-r</kbd> findet B nicht. Gehe zeitlich zurück.', '<kbd>u</kbd> leads to A, <kbd>Ctrl-r</kbd> won\'t find B. Go back in time.') },
            { tier: 'combo', task: T('Gehe mit <code>:earlier</code> drei Stände zurück.', 'Go back three states with <code>:earlier</code>.'), text: '¶a', pre: 'A1<Esc>A2<Esc>A3<Esc>A4<Esc>', goal: 'a1', require: [':ea'], sol: ':earlier 3<CR>' },
            { tier: 'final', task: T('Abschluss: „ZWEI“ wurde durch Undo verloren und durch „Zwo“ ersetzt. Hol den Stand mit „ZWEI“ zurück und schreibe danach die letzte Zeile groß.', 'Wrap-up: “TWO” was lost by undo and replaced with “Two”. Get the state with “TWO” back, then uppercase the last line.'),
              text: T('¶eins\nzwei\ndrei', '¶one\ntwo\nthree'), pre: T('ccEINS<Esc>jccZWEI<Esc>uccZwo<Esc>', 'ccONE<Esc>jccTWO<Esc>uccTwo<Esc>'),
              goal: T('EINS\nZWEI\nDREI', 'ONE\nTWO\nTHREE'), require: ['g-'], sol: 'g-jgUU' }
          ]
        },
        {
          id: 'filter', title: T('Text durch Programme filtern', 'Filtering text through programs'),
          intro: T('Vim kann Zeilen an andere Programme schicken und das Ergebnis einsetzen.', 'Vim can send lines to other programs and put the result back.'),
          keys: [['!{Bewegung}', T('Zeilen durch ein Programm filtern', 'Filter lines through a program')], ['!!', T('Aktuelle Zeile filtern', 'Filter the current line')], [':%!sort', T('Ganze Datei sortieren', 'Sort the whole file')], [':r !date', T('Ausgabe eines Programms einfügen', 'Insert a program\'s output')], [':!cmd', T('Programm ausführen und Ausgabe zeigen', 'Run a program and show its output')]],
          body: T(`<p><kbd>!</kbd> ist ein Operator. <kbd>!ip</kbd> öffnet die Befehlszeile mit dem Bereich des Absatzes und einem Ausrufezeichen. Du tippst den Programmnamen, etwa <code>sort</code>, und Vim ersetzt die Zeilen durch die Ausgabe des Programms.</p>
<p>In echtem Vim steht dir jedes Programm deines Systems zur Verfügung. Der Kurs-Editor bildet die wichtigsten nach: <code>sort</code> (mit <code>-r</code>, <code>-n</code>, <code>-u</code>), <code>uniq</code>, <code>tac</code>, <code>rev</code>, <code>nl</code>, <code>tr</code>, <code>grep</code>, <code>head</code>, <code>tail</code>, <code>wc</code> und <code>date</code>.</p>`,
            `<p><kbd>!</kbd> is an operator. <kbd>!ip</kbd> opens the command line with the paragraph's range and an exclamation mark. You type the program name, for example <code>sort</code>, and Vim replaces the lines with the program's output.</p>
<p>Real Vim can use any program on your system. The course editor emulates the most important ones: <code>sort</code> (with <code>-r</code>, <code>-n</code>, <code>-u</code>), <code>uniq</code>, <code>tac</code>, <code>rev</code>, <code>nl</code>, <code>tr</code>, <code>grep</code>, <code>head</code>, <code>tail</code>, <code>wc</code> and <code>date</code>.</p>`),
          demo: {
            text: T('¶kiwi\napfel\nkiwi\nbanane', '¶kiwi\napple\nkiwi\nbanana'),
            steps: [['!ip', T('<kbd>!ip</kbd> füllt die Befehlszeile mit dem Bereich vor.', '<kbd>!ip</kbd> fills in the range on the command line.')], ['sort -u<CR>', T('<code>sort -u</code> sortiert und entfernt Doppelte.', '<code>sort -u</code> sorts and removes duplicates.')], [':%!nl<CR>', T('<code>nl</code> nummeriert die Zeilen.', '<code>nl</code> numbers the lines.')]]
          },
          ex: [
            { tier: 'basic', task: T('Sortiere den ersten Absatz mit <kbd>!ip</kbd> und <code>sort</code>.', 'Sort the first paragraph with <kbd>!ip</kbd> and <code>sort</code>.'), text: T('¶birne\napfel\nkiwi\n\nEnde', '¶pear\napple\nkiwi\n\nEnd'), goal: T('apfel\nbirne\nkiwi\n\nEnde', 'apple\nkiwi\npear\n\nEnd'), sol: '!ipsort<CR>' },
            { tier: 'basic', task: T('Entferne aufeinanderfolgende Doppelte mit <code>uniq</code>.', 'Remove consecutive duplicates with <code>uniq</code>.'), text: '¶a\na\nb\nb\nc', goal: 'a\nb\nc', sol: ':%!uniq<CR>' },
            { tier: 'combo', task: T('Schreibe die erste Zeile mit <kbd>!!</kbd> und <code>tr</code> in Großbuchstaben.', 'Uppercase the first line with <kbd>!!</kbd> and <code>tr</code>.'), text: T('¶laut\nleise', '¶loud\nquiet'), goal: T('LAUT\nleise', 'LOUD\nquiet'), sol: '!!tr a-z A-Z<CR>' },
            { tier: 'combo', task: T('Füge unter der Zeile das aktuelle Datum mit <code>:r !date</code> ein.', 'Insert the current date below the line with <code>:r !date</code>.'), text: T('¶Protokoll vom:', '¶Log from:'), test: ws => ws.active.lines.length === 2 && /\d\d:\d\d:\d\d/.test(ws.active.lines[1]), sol: ':r !date<CR>' },
            { tier: 'final', task: T('Abschluss: Sortiere die Liste, entferne Doppelte und nummeriere sie.', 'Wrap-up: sort the list, remove duplicates and number it.'),
              text: T('¶kiwi\napfel\nkiwi\nbanane', '¶kiwi\napple\nkiwi\nbanana'), goal: T('     1  apfel\n     2  banane\n     3  kiwi', '     1  apple\n     2  banana\n     3  kiwi'), sol: ':%!sort -u<CR>:%!nl<CR>',
              hint: T('Zwei Filter nacheinander auf die ganze Datei.', 'Two filters in a row on the whole file.') }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'befehlszeile', title: T('Befehlszeile und Regex', 'Command line and regex'), lessons: [
        {
          id: 'bereiche', title: T('Bereiche', 'Ranges'),
          intro: T('Jeder Ex-Befehl kann auf genau die Zeilen wirken, die du angibst.', 'Every Ex command can act on exactly the lines you specify.'),
          keys: [[':2,5d', T('Zeilen 2 bis 5', 'Lines 2 to 5')], [':.,+2', T('Von hier bis zwei Zeilen weiter', 'From here to two lines further')], [":'a,'b", T('Zwischen zwei Marken', 'Between two marks')], [':/start/,/ende/', T('Zwischen zwei Suchtreffern', 'Between two search matches')], [':t.', T('Zeile duplizieren', 'Duplicate the line')], [':1t$', T('Zeile 1 ans Ende kopieren', 'Copy line 1 to the end')]],
          body: T(`<p>Vor einem Befehl steht der <b>Bereich</b>. Adressen sind Zeilennummern, <code>.</code> (aktuelle Zeile), <code>$</code> (letzte Zeile), Marken wie <code>'a</code> oder Suchmuster wie <code>/BEGIN/</code>. Mit <code>+</code> und <code>-</code> verschiebst du sie: <code>/BEGIN/+1</code> ist die Zeile nach dem Treffer.</p>
<p><code>:t</code> kopiert Zeilen hinter eine Adresse, <code>:m</code> verschiebt sie. <code>:t.</code> dupliziert also die aktuelle Zeile.</p>`,
            `<p>The <b>range</b> comes before a command. Addresses are line numbers, <code>.</code> (current line), <code>$</code> (last line), marks like <code>'a</code> or search patterns like <code>/BEGIN/</code>. <code>+</code> and <code>-</code> shift them: <code>/BEGIN/+1</code> is the line after the match.</p>
<p><code>:t</code> copies lines after an address, <code>:m</code> moves them. So <code>:t.</code> duplicates the current line.</p>`),
          demo: {
            text: T('¶Anfang\n# BEGIN\nweg 1\nweg 2\n# END\nRest', '¶Start\n# BEGIN\ngone 1\ngone 2\n# END\nRest'),
            steps: [[':/BEGIN/+1,/END/-1d<CR>', T('Alles zwischen den Markierungen löschen.', 'Delete everything between the markers.')], [':1t$<CR>', T('Zeile 1 ans Ende kopieren.', 'Copy line 1 to the end.')]]
          },
          ex: [
            { tier: 'basic', task: T('Lösche die Zeilen 2 bis 4.', 'Delete lines 2 to 4.'), text: T('¶eins\nzwei\ndrei\nvier\nfünf', '¶one\ntwo\nthree\nfour\nfive'), goal: T('eins\nfünf', 'one\nfive'), sol: ':2,4d<CR>' },
            { tier: 'basic', task: T('Setze vor die aktuelle und die zwei folgenden Zeilen „- “.', 'Put “- ” in front of the current line and the next two.'), text: 'a\nb\n¶c\nd\ne\nf', goal: 'a\nb\n- c\n- d\n- e\nf', sol: ':.,+2s/^/- /<CR>' },
            { tier: 'basic', task: T('Kopiere die erste Zeile ans Ende.', 'Copy the first line to the end.'), text: T('¶Titel\nA\nB', '¶Title\nA\nB'), goal: T('Titel\nA\nB\nTitel', 'Title\nA\nB\nTitle'), sol: ':1t$<CR>' },
            { tier: 'combo', task: T('Lösche alles zwischen den Markierungen BEGIN und END, die Markierungen bleiben.', 'Delete everything between the BEGIN and END markers; the markers stay.'),
              text: T('¶Anfang\n# BEGIN\nweg 1\nweg 2\n# END\nRest', '¶Start\n# BEGIN\ngone 1\ngone 2\n# END\nRest'), goal: T('Anfang\n# BEGIN\n# END\nRest', 'Start\n# BEGIN\n# END\nRest'), sol: ':/BEGIN/+1,/END/-1d<CR>',
              hint: T('Zwei Suchmuster als Adressen, jeweils um eine Zeile nach innen verschoben.', 'Two search patterns as addresses, each shifted one line inwards.') },
            { tier: 'final', task: T('Abschluss: Setze Marken auf die erste und letzte Zeile des Blocks und verschiebe ihn mit <code>:m</code> ans Dateiende.', 'Wrap-up: set marks on the first and last line of the block and move it to the end of the file with <code>:m</code>.'),
              text: T('¶function a() {}\n// Block Start\nhelper1();\nhelper2();\n// Block Ende\nfunction b() {}', '¶function a() {}\n// block start\nhelper1();\nhelper2();\n// block end\nfunction b() {}'),
              goal: T('function a() {}\nfunction b() {}\n// Block Start\nhelper1();\nhelper2();\n// Block Ende', 'function a() {}\nfunction b() {}\n// block start\nhelper1();\nhelper2();\n// block end'),
              require: ['ma', 'mb'], sol: "jma3jmb:'a,'bm$<CR>" }
          ]
        },
        {
          id: 'regex-plus', title: T('Reguläre Ausdrücke vertieft', 'Regular expressions in depth'),
          intro: T('Weniger Backslashes, genauere Treffer.', 'Fewer backslashes, more precise matches.'),
          keys: [['\\v', T('„Sehr magisch“: ( ) + ? { } ohne Backslash', '“Very magic”: ( ) + ? { } without backslash')], ['\\zs / \\ze', T('Wo der Treffer beginnt / endet', 'Where the match starts / ends')], ['\\{2,4} / {2,4}', T('Zwei bis vier Wiederholungen', 'Two to four repetitions')], ['\\c', T('Groß/klein ignorieren', 'Ignore case')], ['\\u \\U \\E', T('Im Ersatz: groß ab hier', 'In the replacement: uppercase from here')], [':%s/x//gn', T('Treffer nur zählen', 'Only count matches')]],
          body: T(`<p>In normalen Vim-Mustern brauchen Gruppen und Quantoren einen Backslash: <code>\\(\\w\\+\\)</code>. Beginnt das Muster mit <code>\\v</code> („very magic“), sind diese Zeichen von selbst besonders: <code>\\v(\\w+)</code>. Das liest sich wie in anderen Programmiersprachen.</p>
<p><code>\\zs</code> und <code>\\ze</code> legen fest, welcher Teil des Musters ersetzt wird. <code>Version \\zs1</code> findet nur die 1 hinter „Version “. Im Ersatz schreibt <code>\\u</code> das nächste Zeichen groß, <code>\\U</code> alles bis <code>\\E</code>.</p>`,
            `<p>In normal Vim patterns groups and quantifiers need a backslash: <code>\\(\\w\\+\\)</code>. If the pattern starts with <code>\\v</code> (“very magic”) these characters are special by themselves: <code>\\v(\\w+)</code>. That reads like other programming languages.</p>
<p><code>\\zs</code> and <code>\\ze</code> decide which part of the pattern gets replaced. <code>Version \\zs1</code> only finds the 1 after “Version ”. In the replacement <code>\\u</code> uppercases the next character, <code>\\U</code> everything up to <code>\\E</code>.</p>`),
          demo: {
            text: '¶ada lovelace',
            steps: [[':s/\\v<(\\w)/\\u\\1/g<CR>', T('Jeder Wortanfang wird großgeschrieben.', 'Every word start becomes uppercase.')], [':s/\\v(\\w+) (\\w+)/\\2, \\1/<CR>', T('Mit <code>\\v</code> ohne Backslash-Gestrüpp vertauschen.', 'Swap with <code>\\v</code> without backslash clutter.')]]
          },
          ex: [
            { tier: 'basic', task: T('Drehe die Namen mit einem „very magic“-Muster um.', 'Swap the names with a “very magic” pattern.'), text: '¶Lovelace, Ada', goal: 'Ada Lovelace', require: ['\\v'], sol: ':s/\\v(\\w+), (\\w+)/\\2 \\1/<CR>' },
            { tier: 'basic', task: T('Ersetze nur die Zahl direkt hinter „Version “.', 'Replace only the number right after “Version ”.'), text: '¶Version 1.0 von 2021', goal: 'Version 2.0 von 2021', require: ['\\zs'], sol: ':s/Version \\zs1/2/<CR>' },
            { tier: 'basic', task: T('Maskiere fünfstellige Zahlen, aber nicht die vierstellige.', 'Mask five-digit numbers but not the four-digit one.'), text: T('¶PLZ: 12345, Tel: 1234', '¶ZIP: 12345, phone: 1234'), goal: T('PLZ: XXXXX, Tel: 1234', 'ZIP: XXXXX, phone: 1234'), sol: ':s/\\v<\\d{5}>/XXXXX/g<CR>',
              hint: T('<code>\\d{5}</code> sind genau fünf Ziffern, <code>&lt;</code> und <code>&gt;</code> sind in <code>\\v</code> die Wortgrenzen.', '<code>\\d{5}</code> is exactly five digits; in <code>\\v</code> <code>&lt;</code> and <code>&gt;</code> are word boundaries.') },
            { tier: 'combo', task: T('Schreibe jeden Wortanfang groß.', 'Capitalise every word.'), text: '¶ada lovelace', goal: 'Ada Lovelace', sol: ':s/\\v<(\\w)/\\u\\1/g<CR>' },
            { tier: 'combo', task: T('Zähle, wie oft „Vim“ mit großem V vorkommt, ohne etwas zu ändern.', 'Count how often “Vim” with a capital V occurs without changing anything.'), text: '¶Vim vim VIM\nVim ist toll', test: ws => ws.active.text() === 'Vim vim VIM\nVim ist toll' && /\b2\b/.test(ws.active.message ? ws.active.message.text : ''), sol: ':%s/Vim//gn<CR>' },
            { tier: 'final', task: T('Abschluss: Mach aus jeder Zeile „Datum: Name“ im Format Tag.Monat.Jahr und mit großen Anfangsbuchstaben, mit einem einzigen Befehl.', 'Wrap-up: turn every line into “date: Name” in day.month.year format with capitalised names, using a single command.'),
              text: '¶2026-10-28,ada lovelace\n2026-01-05,linus torvalds', goal: '28.10.2026: Ada Lovelace\n05.01.2026: Linus Torvalds', sol: ':%s/\\v(\\d{4})-(\\d{2})-(\\d{2}),(\\w+) (\\w+)/\\3.\\2.\\1: \\u\\4 \\u\\5/<CR>',
              hint: T('Fünf Gruppen: Jahr, Monat, Tag, Vorname, Nachname.', 'Five groups: year, month, day, first name, last name.') }
          ]
        },
        {
          id: 'ersetzen-plus', title: T('Ersetzen mit Bestätigung', 'Substitute with confirmation'),
          intro: T('Jeden Treffer einzeln entscheiden und Ersetzungen wiederholen.', 'Decide on every match and repeat substitutions.'),
          keys: [[':%s/a/b/gc', T('Jede Ersetzung bestätigen', 'Confirm every substitution')], ['y / n / a / q / l', T('Ja / Nein / Alle / Abbrechen / Diese und Schluss', 'Yes / no / all / quit / this one and stop')], ['&', T('Letztes Ersetzen in dieser Zeile wiederholen', 'Repeat the last substitution on this line')], ['g&', T('Letztes Ersetzen in allen Zeilen wiederholen', 'Repeat the last substitution on all lines')], ['\\r', T('Im Ersatz: Zeilenumbruch', 'In the replacement: line break')]],
          body: T(`<p>Das Flag <code>c</code> (<i>confirm</i>) fragt bei jedem Treffer nach. Der Treffer wird hervorgehoben, und du antwortest mit <kbd>y</kbd> (ersetzen), <kbd>n</kbd> (überspringen), <kbd>a</kbd> (alle restlichen), <kbd>l</kbd> (diesen und dann aufhören) oder <kbd>q</kbd> (abbrechen).</p>
<p><kbd>g&</kbd> wiederholt das letzte <code>:s</code> mit denselben Flags auf der ganzen Datei. Im Ersatztext fügt <code>\\r</code> einen Zeilenumbruch ein. Achtung: <code>\\n</code> wäre dort ein Nullzeichen.</p>`,
            `<p>The <code>c</code> flag (<i>confirm</i>) asks at every match. The match is highlighted and you answer <kbd>y</kbd> (replace), <kbd>n</kbd> (skip), <kbd>a</kbd> (all remaining), <kbd>l</kbd> (this one, then stop) or <kbd>q</kbd> (quit).</p>
<p><kbd>g&</kbd> repeats the last <code>:s</code> with the same flags on the whole file. In the replacement <code>\\r</code> inserts a line break. Careful: <code>\\n</code> would be a null character there.</p>`),
          demo: {
            text: T('¶rot blau rot', '¶red blue red'),
            steps: [[T(':s/rot/grün/gc<CR>', ':s/red/green/gc<CR>'), T('Vim fragt beim ersten Treffer nach.', 'Vim asks at the first match.')], ['y', T('<kbd>y</kbd>: ersetzen.', '<kbd>y</kbd>: replace.')], ['n', T('<kbd>n</kbd>: diesen nicht.', '<kbd>n</kbd>: not this one.')]]
          },
          ex: [
            { tier: 'basic', task: T('Ersetze „rot“ durch „grün“, aber nur beim ersten und dritten Treffer.', 'Replace “red” with “green”, but only at the first and third match.'), text: T('¶rot blau rot gelb rot', '¶red blue red yellow red'), goal: T('grün blau rot gelb grün', 'green blue red yellow green'), sol: T(':s/rot/grün/gc<CR>yny', ':s/red/green/gc<CR>yny') },
            { tier: 'basic', task: T('Mach aus der Liste je eine Zeile pro Eintrag.', 'Turn the list into one line per item.'), text: '¶a, b, c', goal: 'a\nb\nc', sol: ':s/, /\\r/g<CR>' },
            { tier: 'combo', task: T('Ersetze in der ersten Zeile das erste „alt“ und wiederhole das mit <kbd>g&</kbd> auf allen Zeilen.', 'Replace the first “old” on the first line, then repeat it on all lines with <kbd>g&</kbd>.'),
              text: T('¶alt alt\nalt\nneu alt', '¶old old\nold\nnew old'), goal: T('neu neu\nneu\nneu neu', 'new new\nnew\nnew new'), require: ['g&'], sol: T(':s/alt/neu/<CR>g&', ':s/old/new/<CR>g&'),
              hint: T('<kbd>g&</kbd> wendet das letzte Ersetzen auf jede Zeile an, auch noch einmal auf die erste.', '<kbd>g&</kbd> applies the last substitution to every line, including the first one again.') },
            { tier: 'final', task: T('Abschluss: Ersetze nur das erste „Apfel“ durch „Orange“ (mit Bestätigung) und teile danach die erste Zeile an „: “ und „, “ in einzelne Zeilen.', 'Wrap-up: replace only the first “Apple” with “Orange” (with confirmation), then split the first line at “: ” and “, ” into single lines.'),
              text: T('¶Obst: Apfel, Birne, Kiwi\nGemüse: Apfel? Nein, Kohl', '¶Fruit: Apple, Pear, Kiwi\nVeg: Apple? No, cabbage'), goal: T('Obst\nOrange\nBirne\nKiwi\nGemüse: Apfel? Nein, Kohl', 'Fruit\nOrange\nPear\nKiwi\nVeg: Apple? No, cabbage'),
              sol: T(':%s/Apfel/Orange/gc<CR>yngg:s/: \\|, /\\r/g<CR>', ':%s/Apple/Orange/gc<CR>yngg:s/: \\|, /\\r/g<CR>'),
              hint: T('<code>\\|</code> heißt „oder“ im Muster.', '<code>\\|</code> means “or” in the pattern.') }
          ]
        },
        {
          id: 'befehlszeile-tricks', title: T('Die Befehlszeile beherrschen', 'Mastering the command line'),
          intro: T('Historie, Vervollständigung und Wörter aus dem Text.', 'History, completion and words from the text.'),
          keys: [[':<Up>', T('Frühere Befehle durchblättern', 'Browse earlier commands')], ['<Tab>', T('Befehl oder Name vervollständigen', 'Complete a command or name')], ['<C-r><C-w>', T('Wort unter dem Cursor einfügen', 'Insert the word under the cursor')], ['@:', T('Letzten Befehl wiederholen', 'Repeat the last command')], ['3:', T('Befehlszeile mit Bereich für drei Zeilen', 'Command line with a range for three lines')]],
          body: T(`<p>Die Befehlszeile hat eine eigene <b>Historie</b>. Tippe <kbd>:</kbd> und drücke <kbd>↑</kbd>: Du siehst deine früheren Befehle. Hast du schon ein paar Zeichen getippt, zeigt <kbd>↑</kbd> nur Befehle, die so beginnen. <kbd>Tab</kbd> vervollständigt Befehlsnamen, Optionen und Dateinamen.</p>
<p><kbd>Ctrl-r Ctrl-w</kbd> holt das Wort unter dem Cursor in die Befehlszeile, ideal für <code>:%s/</code>. <kbd>@:</kbd> wiederholt den letzten Befehl, danach auch <kbd>@@</kbd>.</p>`,
            `<p>The command line has its own <b>history</b>. Type <kbd>:</kbd> and press <kbd>↑</kbd>: you see your earlier commands. If you have already typed a few characters, <kbd>↑</kbd> only shows commands starting like that. <kbd>Tab</kbd> completes command names, options and file names.</p>
<p><kbd>Ctrl-r Ctrl-w</kbd> pulls the word under the cursor into the command line, ideal for <code>:%s/</code>. <kbd>@:</kbd> repeats the last command, after that <kbd>@@</kbd> does too.</p>`),
          demo: {
            text: 'let ¶connectionCounter = 0;\nconnectionCounter++;',
            steps: [[':%s/<C-r><C-w>', T('<kbd>Ctrl-r Ctrl-w</kbd> holt das Wort unter dem Cursor.', '<kbd>Ctrl-r Ctrl-w</kbd> fetches the word under the cursor.')], ['/count/g<CR>', T('Ersetzen ohne Abtippen.', 'Substitute without retyping.')], [':<Up>', T('<kbd>↑</kbd> zeigt den letzten Befehl wieder.', '<kbd>↑</kbd> shows the last command again.')], ['<Esc>', T('Abbrechen.', 'Cancel.')]]
          },
          ex: [
            { tier: 'basic', task: T('Wiederhole den letzten Befehl mit <kbd>:</kbd> und <kbd>↑</kbd> auf dieser Zeile.', 'Repeat the last command on this line with <kbd>:</kbd> and <kbd>↑</kbd>.'), text: 'x\n¶x\nx', pre: 'gg:s/x/y/<CR>j', goal: 'y\ny\nx', require: ['<Up>'], sol: ':<Up><CR>' },
            { tier: 'basic', task: T('Wiederhole den letzten Befehl mit <kbd>@:</kbd> und in der nächsten Zeile mit <kbd>@@</kbd>.', 'Repeat the last command with <kbd>@:</kbd> and on the next line with <kbd>@@</kbd>.'), text: 'a\n¶a\na', pre: 'gg:s/a/b/<CR>j', goal: 'b\nb\nb', require: ['@:', '@@'], sol: '@:j@@' },
            { tier: 'combo', task: T('Benenne die Variable überall um, ohne ihren Namen abzutippen.', 'Rename the variable everywhere without typing its name.'), text: 'let ¶connectionCounter = 0;\nconnectionCounter++;', goal: 'let count = 0;\ncount++;', require: ['<C-r><C-w>'], sol: ':%s/<C-r><C-w>/count/g<CR>' },
            { tier: 'combo', task: T('Setze „- “ vor die nächsten drei Zeilen. Eine Zahl vor <kbd>:</kbd> erzeugt den Bereich.', 'Put “- ” in front of the next three lines. A count before <kbd>:</kbd> creates the range.'), text: '¶a\nb\nc\nd', goal: '- a\n- b\n- c\nd', sol: '3:s/^/- /<CR>' },
            { tier: 'final', task: T('Abschluss: Sortiere mit einem per <kbd>Tab</kbd> vervollständigten Befehl und ersetze dann das Wort in der letzten Zeile überall durch Großbuchstaben, ohne es abzutippen.', 'Wrap-up: sort with a command completed by <kbd>Tab</kbd>, then replace the word on the last line everywhere with capitals without typing it.'),
              text: '¶zebra\napple\nzebra\nmango', goal: 'apple\nmango\nZEBRA\nZEBRA', require: ['<Tab>', '<C-r><C-w>'], sol: ':sor<Tab><CR>G:%s/<C-r><C-w>/ZEBRA/<CR>' }
          ]
        },
        {
          id: 'global-plus', title: T(':global für Fortgeschrittene', ':global in depth'),
          intro: T('Ein Befehl für jede passende Zeile.', 'One command for every matching line.'),
          keys: [[':g/x/normal A;', T('Normalbefehl auf jeder Trefferzeile', 'Normal command on every matching line')], [':g/x/t$', T('Trefferzeilen ans Ende kopieren', 'Copy matching lines to the end')], [':g/^/m0', T('Reihenfolge umkehren', 'Reverse the order')], [':v/x/d', T('Alles außer Treffern löschen', 'Delete everything except matches')], [':g/x/s/a/b/', T('Nur in Trefferzeilen ersetzen', 'Substitute only in matching lines')]],
          body: T(`<p><kbd>:g/Muster/Befehl</kbd> markiert zuerst alle passenden Zeilen und führt dann den Befehl auf jeder einzelnen aus. Der Befehl kann jeder Ex-Befehl sein: <code>d</code>, <code>s</code>, <code>t</code>, <code>m</code> oder <code>normal</code> mit beliebigen Tasten.</p>
<p><code>:g/^/m0</code> ist ein bekannter Trick: Jede Zeile passt zu <code>^</code> und wird nacheinander an den Anfang verschoben. Am Ende steht die Datei auf dem Kopf.</p>`,
            `<p><kbd>:g/pattern/command</kbd> first marks all matching lines and then runs the command on each one. The command can be any Ex command: <code>d</code>, <code>s</code>, <code>t</code>, <code>m</code> or <code>normal</code> with any keys.</p>
<p><code>:g/^/m0</code> is a well-known trick: every line matches <code>^</code> and is moved to the top one after another. In the end the file is upside down.</p>`),
          demo: {
            text: '¶let a = 1\n// note\nlet b = 2',
            steps: [[':g/let/normal A;<CR>', T('Semikolon nur an den let-Zeilen.', 'Semicolon only on the let lines.')], [':g/^/m0<CR>', T('Reihenfolge umgedreht.', 'Order reversed.')]]
          },
          ex: [
            { tier: 'basic', task: T('Hänge nur an die <code>let</code>-Zeilen ein Semikolon.', 'Append a semicolon only to the <code>let</code> lines.'), text: '¶let a = 1\n// note\nlet b = 2', goal: 'let a = 1;\n// note\nlet b = 2;', sol: ':g/let/normal A;<CR>' },
            { tier: 'basic', task: T('Kopiere alle TODO-Zeilen ans Ende.', 'Copy all TODO lines to the end.'), text: T('¶TODO: a\nfertig\nTODO: b', '¶TODO: a\ndone\nTODO: b'), goal: T('TODO: a\nfertig\nTODO: b\nTODO: a\nTODO: b', 'TODO: a\ndone\nTODO: b\nTODO: a\nTODO: b'), sol: ':g/TODO/t$<CR>' },
            { tier: 'combo', task: T('Behalte nur die Fehlerzeilen.', 'Keep only the error lines.'), text: '¶Error: a\nInfo: b\nError: c', goal: 'Error: a\nError: c', sol: ':v/Error/d<CR>' },
            { tier: 'combo', task: T('Ersetze die Farbe nur in den Zeilen, die mit „x:“ beginnen.', 'Replace the colour only on lines starting with “x:”.'), text: T('¶x: rot\ny: rot\nx: rot', '¶x: red\ny: red\nx: red'), goal: T('x: blau\ny: rot\nx: blau', 'x: blue\ny: red\nx: blue'), sol: T(':g/x:/s/rot/blau/<CR>', ':g/x:/s/red/blue/<CR>') },
            { tier: 'final', task: T('Abschluss: Kehre die Liste um und hänge an jede TODO-Zeile „ (!)“ an.', 'Wrap-up: reverse the list and append “ (!)” to every TODO line.'),
              text: T('¶TODO waschen\nkochen\nTODO putzen\nlesen', '¶TODO wash\ncook\nTODO clean\nread'), goal: T('lesen\nTODO putzen (!)\nkochen\nTODO waschen (!)', 'read\nTODO clean (!)\ncook\nTODO wash (!)'), sol: ':g/^/m0<CR>:g/TODO/normal A (!)<CR>' }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'dateien', title: T('Dateien, Puffer und Fenster', 'Files, buffers and windows'), lessons: [
        {
          id: 'dateien-speichern', title: T('Dateien öffnen und speichern', 'Opening and saving files'),
          intro: T('Vim bearbeitet Puffer und schreibt sie auf Wunsch in Dateien.', 'Vim edits buffers and writes them to files when you say so.'),
          keys: [[':e datei', T('Datei öffnen', 'Open a file')], [':w', T('Speichern', 'Save')], [':w kopie.txt', T('Unter anderem Namen speichern', 'Save under another name')], [':sav neu.txt', T('Speichern unter und weiter mit der neuen Datei', 'Save as and continue with the new file')], [':e!', T('Änderungen verwerfen', 'Discard changes')], [':q! / :wq / :x', T('Ohne Speichern / mit Speichern beenden', 'Quit without / with saving')], ['<C-g>', T('Dateiname und Position anzeigen', 'Show file name and position')]],
          body: T(`<p>Was du in Vim bearbeitest, ist ein <b>Puffer</b>: eine Kopie der Datei im Speicher. Erst <kbd>:w</kbd> schreibt sie zurück. Ungespeicherte Änderungen zeigt die Statuszeile mit <code>[+]</code>. Willst du mit ungespeicherten Änderungen beenden, meldet Vim <code>E37</code>. Dann entscheidest du: <kbd>:w</kbd> zum Speichern oder <kbd>:q!</kbd> zum Verwerfen.</p>
<p>Der Kurs-Editor hat dafür eine eigene kleine Festplatte. Was du mit <kbd>:w</kbd> speicherst, liegt dort, und <kbd>:e</kbd> öffnet es wieder.</p>`,
            `<p>What you edit in Vim is a <b>buffer</b>: a copy of the file in memory. Only <kbd>:w</kbd> writes it back. The status line shows unsaved changes with <code>[+]</code>. If you try to quit with unsaved changes, Vim reports <code>E37</code>. Then you decide: <kbd>:w</kbd> to save or <kbd>:q!</kbd> to discard.</p>
<p>The course editor has its own little disk for this. Whatever you save with <kbd>:w</kbd> lands there, and <kbd>:e</kbd> opens it again.</p>`),
          demo: {
            files: { 'notiz.txt': T('¶Einkaufen: Milch', '¶Shopping: milk'), 'idee.txt': T('Eine Idee', 'An idea') },
            steps: [[T('A, Brot<Esc>', 'A, bread<Esc>'), T('Geändert: Die Statuszeile zeigt [+].', 'Changed: the status line shows [+].')], [':w<CR>', T('<kbd>:w</kbd> speichert, das [+] verschwindet.', '<kbd>:w</kbd> saves and the [+] disappears.')], [':e idee.txt<CR>', T('<kbd>:e</kbd> öffnet eine andere Datei.', '<kbd>:e</kbd> opens another file.')], ['<C-g>', T('<kbd>Ctrl-g</kbd> zeigt Name und Position.', '<kbd>Ctrl-g</kbd> shows name and position.')]]
          },
          ex: [
            { tier: 'basic', task: T('Ergänze „, Brot“ und speichere die Datei.', 'Add “, bread” and save the file.'), files: { 'notiz.txt': T('¶Einkaufen: Milch', '¶Shopping: milk') }, goalFiles: { 'notiz.txt': T('Einkaufen: Milch, Brot', 'Shopping: milk, bread') }, sol: T('A, Brot<Esc>:w<CR>', 'A, bread<Esc>:w<CR>') },
            { tier: 'basic', task: T('Öffne <code>zweite.txt</code>, hänge „ (gelesen)“ an und speichere.', 'Open <code>second.txt</code>, append “ (read)” and save.'),
              files: T({ 'haupt.txt': '¶Hauptdatei', 'zweite.txt': 'zweite Datei' }, { 'main.txt': '¶Main file', 'second.txt': 'second file' }), goalFiles: T({ 'zweite.txt': 'zweite Datei (gelesen)' }, { 'second.txt': 'second file (read)' }),
              sol: T(':e zweite.txt<CR>A (gelesen)<Esc>:w<CR>', ':e second.txt<CR>A (read)<Esc>:w<CR>') },
            { tier: 'basic', task: T('Jemand hat den Brief verunstaltet. Verwirf alle ungespeicherten Änderungen.', 'Someone mangled the letter. Discard all unsaved changes.'),
              files: T({ 'brief.txt': '¶Liebe Ada,' }, { 'letter.txt': '¶Dear Ada,' }), pre: 'ccQuatsch<Esc>', goal: T('Liebe Ada,', 'Dear Ada,'), require: [':e!'], sol: ':e!<CR>' },
            { tier: 'combo', task: T('Speichere eine Kopie als <code>backup.txt</code>, ohne die Originaldatei umzubenennen.', 'Save a copy as <code>backup.txt</code> without renaming the original file.'),
              files: T({ 'daten.txt': '¶wichtig' }, { 'data.txt': '¶important' }), goalFiles: T({ 'backup.txt': 'wichtig', 'daten.txt': 'wichtig' }, { 'backup.txt': 'important', 'data.txt': 'important' }), test: ws => ws.active.buf.name !== 'backup.txt', sol: ':w backup.txt<CR>' },
            { tier: 'combo', task: T('Speichere den Entwurf als <code>final.txt</code>, arbeite dort weiter, hänge „!“ an und speichere.', 'Save the draft as <code>final.txt</code>, continue there, append “!” and save.'),
              files: T({ 'entwurf.txt': '¶Text' }, { 'draft.txt': '¶Text' }), goalFiles: { 'final.txt': 'Text!' }, test: ws => ws.active.buf.name === 'final.txt', sol: ':sav final.txt<CR>A!<Esc>:w<CR>' },
            { tier: 'final', task: T('Abschluss: Lege <code>kapitel1.txt</code> mit dem Inhalt „Kapitel 1“ an und speichere sie. Trage sie dann im Inhaltsverzeichnis ein: Mit <kbd>Ctrl-r #</kbd> fügst du den Namen der zuletzt bearbeiteten Datei ein.', 'Wrap-up: create <code>chapter1.txt</code> containing “Chapter 1” and save it. Then add it to the table of contents: <kbd>Ctrl-r #</kbd> inserts the name of the previously edited file.'),
              files: T({ 'inhalt.txt': '¶Inhalt:' }, { 'contents.txt': '¶Contents:' }),
              goalFiles: T({ 'kapitel1.txt': 'Kapitel 1', 'inhalt.txt': 'Inhalt:\n- kapitel1.txt' }, { 'chapter1.txt': 'Chapter 1', 'contents.txt': 'Contents:\n- chapter1.txt' }),
              sol: T(':e kapitel1.txt<CR>iKapitel 1<Esc>:w<CR>:e inhalt.txt<CR>Go- <C-r>#<Esc>:w<CR>', ':e chapter1.txt<CR>iChapter 1<Esc>:w<CR>:e contents.txt<CR>Go- <C-r>#<Esc>:w<CR>'),
              hint: T('<kbd>:e</kbd> mit einem neuen Namen legt eine leere Datei an. <code>#</code> ist das Register für die vorherige Datei.', '<kbd>:e</kbd> with a new name creates an empty file. <code>#</code> is the register for the previous file.') }
          ]
        },
        {
          id: 'puffer', title: T('Puffer', 'Buffers'),
          intro: T('Viele Dateien gleichzeitig offen halten und zwischen ihnen wechseln.', 'Keep many files open and switch between them.'),
          keys: [[':ls', T('Liste aller Puffer', 'List all buffers')], [':b2 / :b name', T('Zu Puffer 2 bzw. per Namensteil wechseln', 'Switch to buffer 2 or by part of the name')], [':bn / :bp', T('Nächster / vorheriger Puffer', 'Next / previous buffer')], ['<C-^>', T('Zwischen den letzten zwei Puffern pendeln', 'Toggle between the last two buffers')], [':bd', T('Puffer schließen', 'Close a buffer')], [':bufdo cmd', T('Befehl in jedem Puffer ausführen', 'Run a command in every buffer')], [':wa', T('Alle geänderten Puffer speichern', 'Save all changed buffers')]],
          body: T(`<p>Jede geöffnete Datei bleibt als Puffer im Speicher, auch wenn du gerade eine andere ansiehst. <kbd>:ls</kbd> zeigt die Liste: <code>%a</code> ist der aktuelle Puffer, <code>#</code> der vorherige, <code>+</code> heißt ungespeichert. <kbd>Ctrl-^</kbd> (meist <kbd>Ctrl-6</kbd>) springt zum vorherigen Puffer zurück.</p>
<p><kbd>:bufdo</kbd> führt einen Befehl in allen Puffern aus. Zusammen mit <code>| update</code> (speichern, falls geändert) ersetzt <code>:bufdo %s/alt/neu/ge | update</code> einen Begriff in allen offenen Dateien.</p>`,
            `<p>Every opened file stays in memory as a buffer, even while you look at another one. <kbd>:ls</kbd> shows the list: <code>%a</code> is the current buffer, <code>#</code> the previous one, <code>+</code> means unsaved. <kbd>Ctrl-^</kbd> (usually <kbd>Ctrl-6</kbd>) jumps back to the previous buffer.</p>
<p><kbd>:bufdo</kbd> runs a command in all buffers. Together with <code>| update</code> (save if changed) <code>:bufdo %s/old/new/ge | update</code> replaces a term in all open files.</p>`),
          demo: {
            files: { 'a.txt': '¶eins', 'b.txt': 'zwei', 'c.txt': 'drei' },
            steps: [[':ls<CR>', T('<kbd>:ls</kbd> listet alle Puffer.', '<kbd>:ls</kbd> lists all buffers.')], [':b3<CR>', T('<kbd>:b3</kbd> wechselt zu Puffer 3.', '<kbd>:b3</kbd> switches to buffer 3.')], ['<C-^>', T('<kbd>Ctrl-^</kbd> zurück zum vorherigen.', '<kbd>Ctrl-^</kbd> back to the previous one.')], [':bn<CR>', T('<kbd>:bn</kbd> zum nächsten.', '<kbd>:bn</kbd> to the next.')]]
          },
          ex: [
            { tier: 'basic', task: T('Wechsle zu Puffer 3 und hänge „!“ an.', 'Switch to buffer 3 and append “!”.'), files: { 'a.txt': '¶eins', 'b.txt': 'zwei', 'c.txt': 'drei' }, goalBuffers: { 'c.txt': 'drei!' }, sol: ':b3<CR>A!<Esc>' },
            { tier: 'basic', task: T('Ergänze die Hilfedatei, springe mit <kbd>Ctrl-^</kbd> zurück und ergänze die Hauptdatei.', 'Add to the help file, jump back with <kbd>Ctrl-^</kbd> and add to the main file.'),
              files: T({ 'haupt.txt': '¶Haupt', 'hilfe.txt': 'Hilfe' }, { 'main.txt': '¶Main', 'help.txt': 'Help' }), goalBuffers: T({ 'hilfe.txt': 'Hilfe gelesen', 'haupt.txt': 'Haupt fertig' }, { 'help.txt': 'Help read', 'main.txt': 'Main done' }),
              require: ['<C-^>'], sol: T(':b hilfe<CR>A gelesen<Esc><C-^>A fertig<Esc>', ':b help<CR>A read<Esc><C-^>A done<Esc>'), hint: T('<kbd>:b</kbd> reicht ein eindeutiger Teil des Namens.', 'For <kbd>:b</kbd> a unique part of the name is enough.') },
            { tier: 'basic', task: T('Schließe den Puffer <code>b.txt</code>.', 'Close the buffer <code>b.txt</code>.'), files: { 'a.txt': '¶eins', 'b.txt': 'zwei', 'c.txt': 'drei' }, test: ws => ws.shared.buffers.map(b => b.name).join(',') === 'a.txt,c.txt', sol: ':bd b<CR>' },
            { tier: 'combo', task: T('Erhöhe die Versionsnummer in allen Dateien auf einen Schlag und speichere sie.', 'Bump the version number in all files at once and save them.'),
              files: { 'a.txt': '¶version 1', 'b.txt': 'version 1', 'c.txt': 'version 1' }, goalFiles: { 'a.txt': 'version 2', 'b.txt': 'version 2', 'c.txt': 'version 2' }, sol: ':bufdo %s/1/2/ | update<CR>',
              hint: T('<code>:bufdo</code>, dann das Ersetzen, dann <code>| update</code>.', '<code>:bufdo</code>, then the substitution, then <code>| update</code>.') },
            { tier: 'final', task: T('Abschluss: Benenne die Funktion <code>load</code> in allen Dateien in <code>fetchData</code> um und speichere alles.', 'Wrap-up: rename the function <code>load</code> to <code>fetchData</code> in all files and save everything.'),
              files: T({ 'main.js': '¶import { load } from "./util";\nload();', 'util.js': 'export function load() {}', 'notizen.txt': 'Funktion umbenennen' }, { 'main.js': '¶import { load } from "./util";\nload();', 'util.js': 'export function load() {}', 'notes.txt': 'rename function' }),
              goalFiles: { 'main.js': 'import { fetchData } from "./util";\nfetchData();', 'util.js': 'export function fetchData() {}' }, sol: ':bufdo %s/\\<load\\>/fetchData/ge<CR>:wa<CR>',
              hint: T('Das Flag <code>e</code> unterdrückt Fehler in Puffern ohne Treffer. <kbd>:wa</kbd> speichert danach alles.', 'The <code>e</code> flag suppresses errors in buffers without matches. <kbd>:wa</kbd> saves everything afterwards.') }
          ]
        },
        {
          id: 'fenster', title: T('Fenster', 'Windows'),
          intro: T('Mehrere Dateien oder Stellen nebeneinander sehen.', 'See several files or places side by side.'),
          keys: [[':sp / <C-w>s', T('Fenster waagerecht teilen', 'Split the window horizontally')], [':vs / <C-w>v', T('Fenster senkrecht teilen', 'Split the window vertically')], ['<C-w>w', T('Zum nächsten Fenster', 'To the next window')], ['<C-w>h/j/k/l', T('Fenster links / unten / oben / rechts', 'Window left / below / above / right')], ['<C-w>c / :q', T('Fenster schließen', 'Close the window')], ['<C-w>o', T('Nur dieses Fenster behalten', 'Keep only this window')], ['<C-w>=', T('Alle Fenster gleich groß', 'Make all windows equal')]],
          body: T(`<p><kbd>:sp</kbd> teilt das Fenster waagerecht, <kbd>:vs</kbd> senkrecht. Ohne Dateiname zeigen beide Fenster denselben Puffer, an zwei Stellen. Änderungen erscheinen sofort in beiden. Mit Dateiname, etwa <kbd>:vs hilfe.txt</kbd>, öffnet sich die Datei im neuen Fenster.</p>
<p>Fensterbefehle beginnen mit <kbd>Ctrl-w</kbd>. Danach wählst du mit <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd> die Richtung, wie beim Cursor.</p>`,
            `<p><kbd>:sp</kbd> splits the window horizontally, <kbd>:vs</kbd> vertically. Without a file name both windows show the same buffer, at two places. Changes appear in both immediately. With a file name, for example <kbd>:vs help.txt</kbd>, the file opens in the new window.</p>
<p>Window commands start with <kbd>Ctrl-w</kbd>. Then you pick the direction with <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd>, just like the cursor.</p>`),
          tip: T('Unter Windows und Linux schließt <kbd>Ctrl-w</kbd> im Browser den Tab. Nutze im Kurs dort <kbd>Alt-w</kbd>.', 'On Windows and Linux <kbd>Ctrl-w</kbd> closes the browser tab. Use <kbd>Alt-w</kbd> there in the course.'),
          demo: {
            files: { 'code.txt': '¶function f() {}', 'hilfe.txt': 'Hilfe zu f' },
            steps: [[':vs hilfe.txt<CR>', T('Senkrecht teilen, neue Datei links.', 'Split vertically, new file on the left.')], ['<C-w>l', T('<kbd>Ctrl-w l</kbd>: ins rechte Fenster.', '<kbd>Ctrl-w l</kbd>: into the right window.')], ['<C-w>s', T('<kbd>Ctrl-w s</kbd>: noch einmal waagerecht teilen.', '<kbd>Ctrl-w s</kbd>: split again horizontally.')], ['<C-w>o', T('<kbd>Ctrl-w o</kbd>: nur noch dieses Fenster.', '<kbd>Ctrl-w o</kbd>: only this window left.')]]
          },
          ex: [
            { tier: 'basic', task: T('Öffne <code>hilfe.txt</code> in einem senkrecht geteilten Fenster.', 'Open <code>help.txt</code> in a vertically split window.'),
              files: T({ 'code.txt': '¶x', 'hilfe.txt': 'Hilfe' }, { 'code.txt': '¶x', 'help.txt': 'Help' }), test: ws => win(ws).length === 2 && /^(hilfe|help)\.txt$/.test(ws.active.buf.name), sol: T(':vs hilfe.txt<CR>', ':vs help.txt<CR>') },
            { tier: 'basic', task: T('Teile das Fenster mit <kbd>Ctrl-w s</kbd>, wechsle mit <kbd>Ctrl-w j</kbd> ins untere und hänge „ (unten)“ an.', 'Split the window with <kbd>Ctrl-w s</kbd>, switch to the lower one with <kbd>Ctrl-w j</kbd> and append “ (below)”.'),
              files: T({ 'a.txt': '¶oben' }, { 'a.txt': '¶top' }), goalBuffers: T({ 'a.txt': 'oben (unten)' }, { 'a.txt': 'top (below)' }), test: ws => win(ws).length === 2 && win(ws).indexOf(ws.win) === 1, sol: T('<C-w>s<C-w>jA (unten)<Esc>', '<C-w>s<C-w>jA (below)<Esc>') },
            { tier: 'basic', task: T('Schließe alle Fenster außer dem aktuellen.', 'Close all windows except the current one.'), files: { 'a.txt': '¶x' }, pre: ':sp<CR>:vs<CR>', test: ws => win(ws).length === 1, sol: '<C-w>o' },
            { tier: 'combo', task: T('Öffne <code>ziel.txt</code> links daneben, kopiere die Zeile aus <code>quelle.txt</code> und füge sie in <code>ziel.txt</code> ein.', 'Open <code>target.txt</code> to the left, yank the line from <code>source.txt</code> and put it into <code>target.txt</code>.'),
              files: T({ 'quelle.txt': '¶Wichtiger Satz.', 'ziel.txt': 'Notizen:' }, { 'source.txt': '¶Important sentence.', 'target.txt': 'Notes:' }), goalBuffers: T({ 'ziel.txt': 'Notizen:\nWichtiger Satz.' }, { 'target.txt': 'Notes:\nImportant sentence.' }),
              sol: T(':vs ziel.txt<CR><C-w>lyy<C-w>hp', ':vs target.txt<CR><C-w>lyy<C-w>hp'), hint: T('Das neue Fenster erscheint links. Register gelten in allen Fenstern.', 'The new window appears on the left. Registers work across all windows.') },
            { tier: 'final', task: T('Abschluss: Baue ein Layout aus drei Fenstern (links oben, links unten, rechts) und hänge in jeder Datei „ (ok)“ an.', 'Wrap-up: build a layout of three windows (top left, bottom left, right) and append “ (ok)” in every file.'),
              files: T({ 'haupt.txt': '¶Hauptteil', 'links.txt': 'Links', 'rechts.txt': 'Rechts' }, { 'main.txt': '¶Main part', 'left.txt': 'Left', 'right.txt': 'Right' }),
              goalBuffers: T({ 'haupt.txt': 'Hauptteil (ok)', 'links.txt': 'Links (ok)', 'rechts.txt': 'Rechts (ok)' }, { 'main.txt': 'Main part (ok)', 'left.txt': 'Left (ok)', 'right.txt': 'Right (ok)' }), test: ws => win(ws).length === 3,
              sol: T(':vs links.txt<CR>A (ok)<Esc>:sp rechts.txt<CR>A (ok)<Esc><C-w>lA (ok)<Esc>', ':vs left.txt<CR>A (ok)<Esc>:sp right.txt<CR>A (ok)<Esc><C-w>lA (ok)<Esc>') }
          ]
        },
        {
          id: 'tabs', title: T('Tabs', 'Tab pages'),
          intro: T('Ganze Fensteranordnungen auf eigenen Seiten.', 'Whole window layouts on their own pages.'),
          keys: [[':tabnew', T('Neuer, leerer Tab', 'New empty tab')], [':tabe datei', T('Datei in neuem Tab öffnen', 'Open a file in a new tab')], ['gt / gT', T('Nächster / vorheriger Tab', 'Next / previous tab')], ['2gt', T('Zu Tab 2', 'To tab 2')], [':tabc', T('Tab schließen', 'Close the tab')], [':tabo', T('Nur diesen Tab behalten', 'Keep only this tab')], ['<C-w>T', T('Fenster in einen eigenen Tab verschieben', 'Move the window into its own tab')]],
          body: T(`<p>Ein Tab in Vim ist keine Datei, sondern eine Sammlung von Fenstern. Du kannst zum Beispiel im ersten Tab Code und Tests nebeneinander haben und im zweiten Tab die Dokumentation. Die Tableiste oben zeigt alle Tabs.</p>
<p><kbd>gt</kbd> wechselt zum nächsten Tab, <kbd>gT</kbd> zum vorherigen. Mit einer Zahl davor springt <kbd>gt</kbd> zu genau diesem Tab.</p>`,
            `<p>A tab in Vim is not a file but a collection of windows. You might have code and tests side by side in the first tab and the documentation in the second. The tab line at the top shows all tabs.</p>
<p><kbd>gt</kbd> goes to the next tab, <kbd>gT</kbd> to the previous one. With a count in front <kbd>gt</kbd> jumps to exactly that tab.</p>`),
          demo: {
            files: { 'code.js': '¶run();', 'tests.js': 'test(run);' },
            steps: [[':tabe tests.js<CR>', T('Neuer Tab mit den Tests.', 'New tab with the tests.')], ['gt', T('<kbd>gt</kbd>: nächster Tab (hier wieder der erste).', '<kbd>gt</kbd>: next tab (here the first one again).')], ['gT', T('<kbd>gT</kbd>: vorheriger.', '<kbd>gT</kbd>: previous.')], [':tabs<CR>', T('<kbd>:tabs</kbd> listet alle Tabs.', '<kbd>:tabs</kbd> lists all tabs.')]]
          },
          ex: [
            { tier: 'basic', task: T('Öffne <code>b.txt</code> in einem neuen Tab.', 'Open <code>b.txt</code> in a new tab.'), files: { 'a.txt': '¶A', 'b.txt': 'B' }, test: ws => ws.tabs.length === 2 && ws.active.buf.name === 'b.txt', sol: ':tabe b.txt<CR>' },
            { tier: 'basic', task: T('Gehe zum ersten Tab und hänge „!“ an.', 'Go to the first tab and append “!”.'), files: { 'a.txt': '¶A', 'b.txt': 'B', 'c.txt': 'C' }, pre: ':tabe b.txt<CR>:tabe c.txt<CR>', goalBuffers: { 'a.txt': 'A!' }, test: ws => ws.tabIdx === 0, sol: '1gtA!<Esc>' },
            { tier: 'combo', task: T('Verschiebe das obere Fenster in einen eigenen Tab.', 'Move the upper window into its own tab.'), files: { 'a.txt': '¶A', 'b.txt': 'B' }, pre: ':sp b.txt<CR>', test: ws => ws.tabs.length === 2 && ws.windows(ws.tabs[0]).length === 1, sol: '<C-w>T' },
            { tier: 'final', task: T('Abschluss: Öffne Tests und Doku in je einem eigenen Tab, ergänze jeweils eine Notiz und kehre mit <kbd>gt</kbd> zum Code zurück, um ihn ebenfalls zu ergänzen.', 'Wrap-up: open the tests and the docs each in its own tab, add a note to each, and return to the code with <kbd>gt</kbd> to add one there too.'),
              files: { 'code.js': '¶run();', 'tests.js': 'test(run);', 'docs.txt': 'run' }, goalBuffers: { 'code.js': 'run(); // ok', 'tests.js': 'test(run); // ok', 'docs.txt': 'run (ok)' }, test: ws => ws.tabs.length === 3,
              sol: ':tabe tests.js<CR>A // ok<Esc>:tabe docs.txt<CR>A (ok)<Esc>gtA // ok<Esc>', hint: T('<kbd>gt</kbd> springt vom letzten Tab wieder zum ersten.', '<kbd>gt</kbd> wraps from the last tab back to the first.') }
          ]
        },
        {
          id: 'quickfix', title: T('Projektweit suchen', 'Project-wide search'),
          intro: T('In allen Dateien suchen, Treffer abarbeiten und Dateimarken setzen.', 'Search all files, work through the matches and set file marks.'),
          keys: [[':vimgrep /x/ *', T('In allen Dateien suchen', 'Search all files')], [':cn / :cp', T('Nächster / vorheriger Treffer', 'Next / previous match')], [':copen', T('Trefferliste anzeigen', 'Show the list of matches')], [':cdo cmd', T('Befehl auf jedem Treffer ausführen', 'Run a command on every match')], ['mA / \'A', T('Dateimarke setzen / dorthin springen, auch aus anderen Dateien', 'Set a file mark / jump there, even from other files')]],
          body: T(`<p><kbd>:vimgrep /Muster/ *</kbd> durchsucht alle Dateien und füllt die <b>Quickfix-Liste</b> mit den Treffern. Vim springt zum ersten, <kbd>:cn</kbd> zum nächsten, auch in andere Dateien. <kbd>:copen</kbd> zeigt die Liste.</p>
<p><kbd>:cdo</kbd> führt einen Befehl auf jedem Eintrag aus, etwa <code>:cdo s/alt/neu/ | update</code>. Großbuchstaben-Marken wie <kbd>mA</kbd> gelten dateiübergreifend: <kbd>'A</kbd> bringt dich aus jeder Datei dorthin zurück.</p>`,
            `<p><kbd>:vimgrep /pattern/ *</kbd> searches all files and fills the <b>quickfix list</b> with the matches. Vim jumps to the first one, <kbd>:cn</kbd> to the next, even into other files. <kbd>:copen</kbd> shows the list.</p>
<p><kbd>:cdo</kbd> runs a command on every entry, for example <code>:cdo s/old/new/ | update</code>. Capital-letter marks like <kbd>mA</kbd> work across files: <kbd>'A</kbd> takes you back there from any file.</p>`),
          demo: {
            files: { 'a.txt': '¶eins\nTODO: a', 'b.txt': 'zwei', 'c.txt': 'TODO: c' },
            steps: [[':vimgrep /TODO/ *<CR>', T('Suche in allen Dateien, Sprung zum ersten Treffer.', 'Search all files, jump to the first match.')], [':cn<CR>', T('<kbd>:cn</kbd>: nächster Treffer, hier in einer anderen Datei.', '<kbd>:cn</kbd>: next match, here in another file.')], [':copen<CR>', T('<kbd>:copen</kbd> zeigt die Liste.', '<kbd>:copen</kbd> shows the list.')]]
          },
          ex: [
            { tier: 'basic', task: T('Finde das TODO in allen Dateien.', 'Find the TODO across all files.'), files: { 'a.txt': '¶eins', 'b.txt': 'zwei\nTODO: fixen', 'c.txt': 'drei' }, test: ws => ws.active.buf.name === 'b.txt' && ws.active.r === 1, sol: ':vimgrep /TODO/ *<CR>' },
            { tier: 'basic', task: T('Suche alle TODOs und springe zum zweiten Treffer.', 'Search all TODOs and jump to the second match.'), files: { 'a.txt': '¶TODO: a', 'b.txt': 'nichts', 'c.txt': 'TODO: c' }, test: ws => ws.active.buf.name === 'c.txt', sol: ':vimgrep /TODO/ *<CR>:cn<CR>' },
            { tier: 'combo', task: T('Ersetze FIXME in allen Dateien durch DONE: suchen, dann <code>:cdo</code> mit Speichern.', 'Replace FIXME with DONE in all files: search, then <code>:cdo</code> with saving.'),
              files: { 'a.txt': '¶FIXME eins', 'b.txt': 'ok', 'c.txt': 'zwei FIXME' }, goalFiles: { 'a.txt': 'DONE eins', 'c.txt': 'zwei DONE' }, sol: ':vimgrep /FIXME/ *<CR>:cdo s/FIXME/DONE/ | update<CR>' },
            { tier: 'combo', task: T('Setze eine Dateimarke, wechsle zu <code>b.txt</code>, hänge an und springe mit <kbd>\'A</kbd> zurück.', 'Set a file mark, switch to <code>b.txt</code>, append, and jump back with <kbd>\'A</kbd>.'),
              files: T({ 'a.txt': '¶Startpunkt', 'b.txt': 'Ziel' }, { 'a.txt': '¶Start', 'b.txt': 'Target' }), goalBuffers: T({ 'a.txt': 'Startpunkt (zurück)', 'b.txt': 'Ziel (besucht)' }, { 'a.txt': 'Start (back)', 'b.txt': 'Target (visited)' }),
              require: ['mA'], sol: T("mA:b b<CR>A (besucht)<Esc>'AA (zurück)<Esc>", "mA:b b<CR>A (visited)<Esc>'AA (back)<Esc>") },
            { tier: 'final', task: T('Abschluss: Benenne <code>oldName</code> im ganzen Projekt in <code>newName</code> um und speichere alle betroffenen Dateien.', 'Wrap-up: rename <code>oldName</code> to <code>newName</code> across the whole project and save all affected files.'),
              files: { 'main.js': '¶oldName();\nlog(oldName);', 'util.js': 'export const oldName = 1;', 'readme.txt': 'Projekt' },
              goalFiles: { 'main.js': 'newName();\nlog(newName);', 'util.js': 'export const newName = 1;' }, sol: ':vimgrep /oldName/ *<CR>:cdo s/oldName/newName/g | update<CR>' }
          ]
        }
      ]
    },
    /* =================================================================== */
    {
      id: 'anpassen', title: T('Vim anpassen', 'Customising Vim'), lessons: [
        {
          id: 'optionen', title: T('Optionen', 'Options'),
          intro: T('Mit :set stellst du Vim so ein, wie du arbeitest.', 'With :set you configure Vim the way you work.'),
          keys: [[':set rnu', T('Relative Zeilennummern', 'Relative line numbers')], [':set ic scs', T('Groß/klein ignorieren, außer das Muster enthält Großbuchstaben', 'Ignore case unless the pattern has capitals')], [':set list', T('Zeilenenden und Leerzeichen am Ende zeigen', 'Show line ends and trailing spaces')], [':set tw=72', T('Zeilenbreite für Umbruch', 'Line width for wrapping')], [':set nu?', T('Wert einer Option abfragen', 'Query an option\'s value')], [':set hls!', T('Option umschalten', 'Toggle an option')], [':set tw&', T('Option auf den Standard zurücksetzen', 'Reset an option to its default')]],
          body: T(`<p>Ein-/Aus-Optionen setzt du mit <code>:set name</code> und schaltest sie mit <code>:set noname</code> ab. <code>:set name!</code> schaltet um, <code>:set name?</code> zeigt den Wert, <code>:set name&</code> setzt ihn zurück. Zahlenwerte setzt du mit <code>:set name=wert</code>. Fast jede Option hat eine Kurzform: <code>rnu</code> für <code>relativenumber</code>.</p>
<p>Eine beliebte Kombination ist <code>ignorecase</code> mit <code>smartcase</code>: Kleingeschriebene Suchen finden alles, sobald ein Großbuchstabe im Muster steht, wird genau gesucht.</p>`,
            `<p>You turn on/off options on with <code>:set name</code> and off with <code>:set noname</code>. <code>:set name!</code> toggles, <code>:set name?</code> shows the value, <code>:set name&</code> resets it. Numeric values are set with <code>:set name=value</code>. Almost every option has a short form: <code>rnu</code> for <code>relativenumber</code>.</p>
<p>A popular combination is <code>ignorecase</code> with <code>smartcase</code>: lower-case searches find everything; as soon as the pattern contains a capital letter, the search is exact.</p>`),
          demo: {
            text: '¶vim VIM Vim   \nzweite Zeile',
            steps: [[':set rnu<CR>', T('Relative Zeilennummern.', 'Relative line numbers.')], [':set list<CR>', T('<code>list</code> zeigt Zeilenenden und Leerzeichen am Ende.', '<code>list</code> shows line ends and trailing spaces.')], [':set ic scs<CR>/Vim<CR>', T('Mit smartcase findet <code>/Vim</code> nur das große Vim.', 'With smartcase <code>/Vim</code> only finds the capitalised Vim.')], [':set rnu?<CR>', T('<code>?</code> fragt den Wert ab.', '<code>?</code> queries the value.')]]
          },
          ex: [
            { tier: 'basic', task: T('Schalte <code>ignorecase</code> und <code>smartcase</code> ein und suche nach „Vim“ mit großem V.', 'Turn on <code>ignorecase</code> and <code>smartcase</code> and search for “Vim” with a capital V.'),
              text: '¶vim VIM Vim', test: ws => ws.active.o.ignorecase && ws.active.o.smartcase && ws.active.r === 0 && ws.active.c === 8, sol: ':set ic scs<CR>/Vim<CR>' },
            { tier: 'basic', task: T('Schalte die Hervorhebung von Suchtreffern mit einem einzigen Befehl um.', 'Toggle the highlighting of search matches with a single command.'), text: T('¶Suchtreffer', '¶Search matches'), test: ws => ws.active.o.hlsearch === false, sol: ':set hls!<CR>' },
            { tier: 'combo', task: T('Mach mit <code>:set list</code> die Leerzeichen am Zeilenende sichtbar und entferne sie mit einem Ersetzen.', 'Make trailing spaces visible with <code>:set list</code> and remove them with a substitution.'),
              text: T('¶eins   \nzwei \ndrei', '¶one   \ntwo \nthree'), goal: T('eins\nzwei\ndrei', 'one\ntwo\nthree'), test: ws => ws.active.o.list, sol: ':set list<CR>:%s/\\s\\+$//<CR>',
              hint: T('<code>\\s\\+$</code>: ein oder mehr Leerzeichen direkt vor dem Zeilenende.', '<code>\\s\\+$</code>: one or more spaces right before the end of the line.') },
            { tier: 'final', task: T('Abschluss: Setze die Zeilenbreite auf 20 und tippe den Satz aus dem Ziel in einem Zug. Vim bricht beim Tippen selbst um.', 'Wrap-up: set the line width to 20 and type the sentence from the goal in one go. Vim wraps while you type.'),
              text: '¶', goal: T('Vim bricht beim\nTippen automatisch\num', 'Vim wraps\nautomatically while\ntyping'), sol: T(':set tw=20<CR>iVim bricht beim Tippen automatisch um<Esc>', ':set tw=20<CR>iVim wraps automatically while typing<Esc>'),
              hint: T('Tippe einfach weiter, auch über das Zeilenende hinaus. Keine Enter-Taste nötig.', 'Just keep typing past the end of the line. No Enter needed.') }
          ]
        },
        {
          id: 'mappings', title: T('Eigene Tastenkürzel', 'Your own key mappings'),
          intro: T('Mit Zuordnungen machst du aus jeder Taste das, was du brauchst.', 'With mappings you turn any key into what you need.'),
          keys: [[':nnoremap Q dd', T('Taste im Normalmodus belegen', 'Map a key in normal mode')], [':inoremap jk <Esc>', T('Taste im Einfügemodus belegen', 'Map a key in insert mode')], [':vnoremap', T('Taste im visuellen Modus belegen', 'Map a key in visual mode')], [':let mapleader=","', T('Leader-Taste festlegen', 'Set the leader key')], [':nnoremap <leader>w :w<CR>', T('Kürzel mit Leader', 'Mapping with leader')], [':nmap', T('Zuordnungen anzeigen', 'List mappings')], [':nunmap Q', T('Zuordnung entfernen', 'Remove a mapping')]],
          body: T(`<p><code>:nnoremap links rechts</code> sorgt dafür, dass Vim beim Drücken von <i>links</i> im Normalmodus die Tasten <i>rechts</i> ausführt. Das <code>n</code> steht für Normalmodus, <code>i</code> für Einfüge-, <code>v</code> für visuellen Modus. <code>nore</code> heißt „nicht rekursiv“: Die rechte Seite wird nicht noch einmal übersetzt. Nimm fast immer die <code>nore</code>-Varianten.</p>
<p>Sondertasten schreibst du in spitzen Klammern: <code>&lt;Esc&gt;</code>, <code>&lt;CR&gt;</code>, <code>&lt;Space&gt;</code>. <code>&lt;leader&gt;</code> ist eine frei wählbare Vorschalttaste, standardmäßig der Backslash. Tippe diese Namen in der Befehlszeile wörtlich, Buchstabe für Buchstabe.</p>`,
            `<p><code>:nnoremap lhs rhs</code> makes Vim run the keys <i>rhs</i> when you press <i>lhs</i> in normal mode. The <code>n</code> stands for normal mode, <code>i</code> for insert, <code>v</code> for visual mode. <code>nore</code> means “non-recursive”: the right side is not translated again. Almost always use the <code>nore</code> variants.</p>
<p>Special keys are written in angle brackets: <code>&lt;Esc&gt;</code>, <code>&lt;CR&gt;</code>, <code>&lt;Space&gt;</code>. <code>&lt;leader&gt;</code> is a prefix key of your choice, by default the backslash. Type these names literally on the command line, letter by letter.</p>`),
          demo: {
            text: '¶eins\nzwei\ndrei',
            steps: [[':nnoremap Q dd<CR>', T('<kbd>Q</kbd> löscht ab jetzt eine Zeile.', 'From now on <kbd>Q</kbd> deletes a line.')], ['Q', T('Ausprobiert.', 'Tried out.')], [':inoremap jk <lt>Esc><CR>', T('<code>jk</code> verlässt den Einfügemodus.', '<code>jk</code> leaves insert mode.')], ['Aneu jk', T('Tippen, dann <code>jk</code> statt Esc.', 'Type, then <code>jk</code> instead of Esc.')], [':nmap<CR>', T('<kbd>:nmap</kbd> listet die Zuordnungen.', '<kbd>:nmap</kbd> lists the mappings.')]]
          },
          ex: [
            { tier: 'basic', task: T('Belege <kbd>Q</kbd> mit <kbd>dd</kbd> und lösche damit die beiden oberen Zeilen.', 'Map <kbd>Q</kbd> to <kbd>dd</kbd> and use it to delete the two top lines.'), text: T('¶weg\nweg\nbleibt', '¶gone\ngone\nstays'), goal: T('bleibt', 'stays'), require: ['QQ'], sol: ':nnoremap Q dd<CR>QQ' },
            { tier: 'basic', task: T('Belege <code>jk</code> im Einfügemodus mit Esc und beende damit das Tippen.', 'Map <code>jk</code> to Esc in insert mode and use it to finish typing.'), text: '¶', goal: T('hallo', 'hello'), require: ['jk'], sol: T(':inoremap jk <lt>Esc><CR>ihallojk', ':inoremap jk <lt>Esc><CR>ihellojk'),
              hint: T('Tippe <code>&lt;Esc&gt;</code> als fünf Zeichen in die Befehlszeile.', 'Type <code>&lt;Esc&gt;</code> as five characters on the command line.') },
            { tier: 'combo', task: T('Lege das Komma als Leader fest, belege <code>&lt;leader&gt;u</code> mit <kbd>gUiw</kbd> und nutze es.', 'Set comma as leader, map <code>&lt;leader&gt;u</code> to <kbd>gUiw</kbd> and use it.'), text: T('¶wichtig', '¶important'), goal: T('WICHTIG', 'IMPORTANT'), require: [',u'], sol: ':let mapleader=","<CR>:nnoremap <lt>leader>u gUiw<CR>,u' },
            { tier: 'final', task: T('Abschluss: Lege <code>&lt;leader&gt;w</code> als Speichern-Kürzel an, ergänze dann „!“ und speichere mit deinem Kürzel. Der Leader ist der Backslash.', 'Wrap-up: create <code>&lt;leader&gt;w</code> as a save shortcut, then add “!” and save with your shortcut. The leader is the backslash.'),
              files: T({ 'notiz.txt': '¶Notiz' }, { 'note.txt': '¶Note' }), goalFiles: T({ 'notiz.txt': 'Notiz!' }, { 'note.txt': 'Note!' }), require: ['\\w'], sol: ':nnoremap <lt>leader>w :w<lt>CR><CR>A!<Esc>\\w',
              hint: T('Auf der rechten Seite steht der komplette Befehl: <code>:w&lt;CR&gt;</code>.', 'The right side holds the complete command: <code>:w&lt;CR&gt;</code>.') }
          ]
        },
        {
          id: 'abkuerzungen-vimrc', title: T('Abkürzungen und die vimrc', 'Abbreviations and the vimrc'),
          intro: T('Einstellungen dauerhaft machen und Tipparbeit sparen.', 'Make settings permanent and save typing.'),
          keys: [[':iab mfg Mit freundlichen Grüßen', T('Abkürzung im Einfügemodus', 'Abbreviation in insert mode')], [':una mfg', T('Abkürzung entfernen', 'Remove an abbreviation')], ['~/.vimrc', T('Datei mit deinen Einstellungen', 'File with your settings')], [':so %', T('Aktuelle Datei als Befehle ausführen', 'Run the current file as commands')], ['" Kommentar', T('Kommentarzeile in der vimrc', 'Comment line in the vimrc')]],
          body: T(`<p>Eine <b>Abkürzung</b> wird ersetzt, sobald du nach dem Wort ein Leerzeichen, Satzzeichen oder <kbd>Esc</kbd> tippst. <code>:iab teh the</code> korrigiert so einen häufigen Tippfehler automatisch.</p>
<p>Alles, was du mit <kbd>:</kbd> eintippst, kannst du in die Datei <code>~/.vimrc</code> schreiben, eine Zeile pro Befehl und ohne Doppelpunkt. Vim führt sie bei jedem Start aus. Nach einer Änderung lädst du sie mit <kbd>:so %</kbd> sofort neu. Kommentare beginnen mit einem Anführungszeichen <code>"</code>. In der Spielwiese gibt es eine <code>.vimrc</code>, die jedes Mal geladen wird.</p>`,
            `<p>An <b>abbreviation</b> is replaced as soon as you type a space, punctuation or <kbd>Esc</kbd> after the word. <code>:iab teh the</code> fixes a common typo automatically that way.</p>
<p>Everything you type after <kbd>:</kbd> can go into the file <code>~/.vimrc</code>, one command per line and without the colon. Vim runs it at every start. After a change, <kbd>:so %</kbd> reloads it immediately. Comments start with a double quote <code>"</code>. The playground has a <code>.vimrc</code> that is loaded every time.</p>`),
          demo: {
            files: { '.vimrc': '¶" Meine Einstellungen\nset relativenumber', 'notiz.txt': 'x' },
            steps: [['Goset ignorecase<Esc>', T('Eine Zeile ergänzen, ohne Doppelpunkt.', 'Add a line, without colon.')], [':w<CR>:so %<CR>', T('Speichern und mit <kbd>:so %</kbd> laden.', 'Save and load with <kbd>:so %</kbd>.')], [':set ic?<CR>', T('Die Option ist jetzt aktiv.', 'The option is active now.')]]
          },
          ex: [
            { tier: 'basic', task: T('Lege die Abkürzung „mfg“ an und schreibe damit den Gruß aus dem Ziel.', 'Create the abbreviation “br” and use it to write the closing from the goal.'), text: '¶', goal: T('Mit freundlichen Grüßen, Ada', 'Best regards, Ada'), sol: T(':iab mfg Mit freundlichen Grüßen<CR>imfg, Ada<Esc>', ':iab br Best regards<CR>ibr, Ada<Esc>') },
            { tier: 'combo', task: T('Korrigiere einen typischen Tippfehler per Abkürzung und tippe den Satz mit dem Fehler.', 'Fix a typical typo with an abbreviation and type the sentence with the typo.'), text: '¶', goal: T('das Auto und das Haus', 'the cat and the dog'), sol: T(':iab dsa das<CR>idsa Auto und dsa Haus<Esc>', ':iab teh the<CR>iteh cat and teh dog<Esc>') },
            { tier: 'combo', task: T('Ergänze in der <code>.vimrc</code> die Zeile <code>set ignorecase</code>, speichere und lade sie.', 'Add the line <code>set ignorecase</code> to the <code>.vimrc</code>, save and load it.'),
              files: { '.vimrc': '¶" Meine Einstellungen\nset relativenumber', 'notiz.txt': 'x' }, goalFiles: { '.vimrc': '" Meine Einstellungen\nset relativenumber\nset ignorecase' }, test: ws => ws.active.o.ignorecase && ws.active.o.relativenumber, sol: 'Goset ignorecase<Esc>:w<CR>:so %<CR>' },
            { tier: 'final', task: T('Abschluss: Trage in die vimrc eine Zuordnung <code>nnoremap Q gUU</code> und eine Abkürzung ein, speichere, lade sie und nutze beides in der Notiz.', 'Wrap-up: add a mapping <code>nnoremap Q gUU</code> and an abbreviation to the vimrc, save, load it and use both in the note.'),
              files: T({ '.vimrc': '¶" vimrc', 'notiz.txt': 'Notizen' }, { '.vimrc': '¶" vimrc', 'notes.txt': 'Notes' }),
              goalFiles: T({ '.vimrc': '" vimrc\nnnoremap Q gUU\niab vk Vim-Kurs' }, { '.vimrc': '" vimrc\nnnoremap Q gUU\niab vc Vim course' }), goalBuffers: T({ 'notiz.txt': 'NOTIZEN Vim-Kurs' }, { 'notes.txt': 'NOTES Vim course' }),
              sol: T('onnoremap Q gUU<CR>iab vk Vim-Kurs<Esc>:w<CR>:so %<CR>:b notiz<CR>QA vk<Esc>', 'onnoremap Q gUU<CR>iab vc Vim course<Esc>:w<CR>:so %<CR>:b notes<CR>QA vc<Esc>') }
          ]
        },
        {
          id: 'falten', title: T('Falten', 'Folding'),
          intro: T('Blöcke einklappen, um den Überblick zu behalten.', 'Collapse blocks to keep the overview.'),
          keys: [['zf{Bewegung}', T('Faltung anlegen', 'Create a fold')], ['zo / zc', T('Faltung öffnen / schließen', 'Open / close a fold')], ['za', T('Faltung umschalten', 'Toggle a fold')], ['zR / zM', T('Alle öffnen / alle schließen', 'Open all / close all')], ['zd / zE', T('Faltung löschen / alle löschen', 'Delete a fold / all folds')], [':set fdm=indent', T('Automatisch nach Einrückung falten', 'Fold automatically by indentation')]],
          body: T(`<p>Eine geschlossene Faltung erscheint als eine einzige Zeile mit der Anzahl der versteckten Zeilen. <kbd>j</kbd> und <kbd>k</kbd> springen über sie hinweg, und zeilenweise Befehle wie <kbd>dd</kbd> wirken auf die ganze Faltung.</p>
<p>Von Hand faltest du mit dem Operator <kbd>zf</kbd>, etwa <kbd>zfip</kbd> für einen Absatz. Mit <code>:set foldmethod=indent</code> legt Vim die Faltungen selbst anhand der Einrückung an. Das ist praktisch für Python oder YAML.</p>`,
            `<p>A closed fold appears as a single line showing the number of hidden lines. <kbd>j</kbd> and <kbd>k</kbd> jump over it, and linewise commands like <kbd>dd</kbd> act on the whole fold.</p>
<p>You fold by hand with the operator <kbd>zf</kbd>, for example <kbd>zfip</kbd> for a paragraph. With <code>:set foldmethod=indent</code> Vim creates the folds itself based on indentation. Handy for Python or YAML.</p>`),
          demo: {
            text: 'def a():\n    x = 1\n    return x\n\ndef b():\n    return 2',
            steps: [[':set fdm=indent<CR>', T('Vim faltet die Funktionskörper nach Einrückung.', 'Vim folds the function bodies by indentation.')], ['j', T('<kbd>j</kbd> landet auf der Faltung.', '<kbd>j</kbd> lands on the fold.')], ['zo', T('<kbd>zo</kbd> öffnet sie.', '<kbd>zo</kbd> opens it.')], ['zM', T('<kbd>zM</kbd> schließt alle.', '<kbd>zM</kbd> closes all.')], ['zR', T('<kbd>zR</kbd> öffnet alle.', '<kbd>zR</kbd> opens all.')]]
          },
          ex: [
            { tier: 'basic', task: T('Falte den ersten Absatz mit <kbd>zfip</kbd>.', 'Fold the first paragraph with <kbd>zfip</kbd>.'), text: T('¶Absatz eins\nzwei Zeilen\n\nAbsatz zwei', '¶Paragraph one\ntwo lines\n\nParagraph two'), test: ws => { const f = ws.active.folds; return f.length === 1 && f[0].s === 0 && f[0].e === 1 && f[0].closed; }, sol: 'zfip' },
            { tier: 'basic', task: T('Alles ist nach Einrückung gefaltet. Öffne alle Faltungen auf einmal.', 'Everything is folded by indentation. Open all folds at once.'), text: '¶def a():\n    pass\ndef b():\n    pass', pre: ':set fdm=indent<CR>', test: ws => ws.active.folds.length > 0 && ws.active.folds.every(f => !f.closed), sol: 'zR' },
            { tier: 'combo', task: T('Falte die Funktion und lösche sie dann mit einem einzigen <kbd>dd</kbd>.', 'Fold the function and then delete it with a single <kbd>dd</kbd>.'), text: '¶function a() {\n    x();\n    y();\n}\nnext();', goal: 'next();', sol: 'zf3jdd' },
            { tier: 'combo', task: T('Springe mit <kbd>j</kbd> über die gefalteten Funktionskörper zur Funktion <code>c</code> und benenne sie in <code>d</code> um.', 'Jump over the folded function bodies with <kbd>j</kbd> to function <code>c</code> and rename it to <code>d</code>.'),
              text: '¶def a():\n    x = 1\n    y = 2\n    return x\ndef b():\n    x = 1\n    y = 2\n    return y\ndef c():\n    pass', pre: ':set fdm=indent<CR>',
              goal: 'def a():\n    x = 1\n    y = 2\n    return x\ndef b():\n    x = 1\n    y = 2\n    return y\ndef d():\n    pass', block: 'G/', sol: 'jjjjwrd' },
            { tier: 'final', task: T('Abschluss: Falte beide Funktionen einzeln, schließe alle, öffne nur die zweite und ändere darin TODO in DONE.', 'Wrap-up: fold both functions separately, close all, open only the second one and change TODO to DONE in it.'),
              text: 'function a() {\n    // TODO a\n}\nfunction b() {\n    // TODO b\n}',
              goal: 'function a() {\n    // TODO a\n}\nfunction b() {\n    // DONE b\n}', test: ws => { const f = ws.active.folds; return f.length === 2 && f.some(x => x.s === 0 && x.closed) && f.some(x => x.s === 3 && !x.closed); },
              sol: 'zf2jjzf2jzMzojfTcwDONE<Esc>', hint: T('Nach <kbd>zf2j</kbd> ist die Faltung zu, und <kbd>j</kbd> springt direkt hinter sie.', 'After <kbd>zf2j</kbd> the fold is closed and <kbd>j</kbd> jumps right past it.') }
          ]
        },
        {
          id: 'hilfe-ausblick', title: T('Hilfe und Ausblick', 'Help and what\'s next'),
          intro: T('Wie du selbst weiterlernst und was es in echtem Vim noch gibt.', 'How to keep learning on your own and what else real Vim offers.'),
          keys: [[':h befehl', T('Hilfe zu einem Befehl', 'Help for a command')], [':set spell', T('Rechtschreibprüfung: ]s und z=', 'Spell check: ]s and z=')], [':terminal', T('Terminal im Fenster', 'Terminal in a window')], ['vimdiff a b', T('Dateien vergleichen: ]c, dp, do', 'Compare files: ]c, dp, do')], [':mksession', T('Sitzung mit Fenstern speichern', 'Save a session with windows')], [':Ex', T('Dateibrowser', 'File browser')], ['<C-]>', T('Zur Definition springen (Tags)', 'Jump to the definition (tags)')]],
          body: T(`<p>In echtem Vim ist <kbd>:help</kbd> die beste Quelle: <code>:h ciw</code>, <code>:h :s</code>, <code>:h 'tw'</code>. Im Kurs-Editor durchsucht <kbd>:h</kbd> alle Befehle dieses Kurses.</p>
<p>Einiges kann ein Editor im Browser nicht nachbilden. Probiere es in deinem echten Vim aus:</p>
<ul>
<li><b>Rechtschreibung:</b> Mit <code>:set spell</code> unterstreicht Vim Fehler. <kbd>]s</kbd> springt zum nächsten Fehler, <kbd>z=</kbd> schlägt Korrekturen vor, <kbd>zg</kbd> merkt sich ein Wort.</li>
<li><b>Diff:</b> <code>vimdiff a.txt b.txt</code> zeigt zwei Dateien nebeneinander. <kbd>]c</kbd> springt zur nächsten Änderung, <kbd>do</kbd> und <kbd>dp</kbd> übernehmen sie.</li>
<li><b>Terminal und Dateien:</b> <code>:terminal</code> öffnet eine Shell im Fenster, <code>:Ex</code> einen Dateibrowser.</li>
<li><b>Sitzungen und Tags:</b> <code>:mksession</code> speichert Fenster und Puffer. Mit <code>ctags</code> springt <kbd>Ctrl-]</kbd> zu Definitionen.</li>
<li><b>Plugins:</b> Pakete legst du unter <code>~/.vim/pack/</code> ab. In Neovim kannst du mit Lua konfigurieren.</li>
</ul>`,
            `<p>In real Vim <kbd>:help</kbd> is the best source: <code>:h ciw</code>, <code>:h :s</code>, <code>:h 'tw'</code>. In the course editor <kbd>:h</kbd> searches all commands of this course.</p>
<p>Some things an editor in the browser can't emulate. Try them in your real Vim:</p>
<ul>
<li><b>Spelling:</b> with <code>:set spell</code> Vim underlines mistakes. <kbd>]s</kbd> jumps to the next one, <kbd>z=</kbd> suggests corrections, <kbd>zg</kbd> remembers a word.</li>
<li><b>Diff:</b> <code>vimdiff a.txt b.txt</code> shows two files side by side. <kbd>]c</kbd> jumps to the next change, <kbd>do</kbd> and <kbd>dp</kbd> take it over.</li>
<li><b>Terminal and files:</b> <code>:terminal</code> opens a shell in a window, <code>:Ex</code> a file browser.</li>
<li><b>Sessions and tags:</b> <code>:mksession</code> saves windows and buffers. With <code>ctags</code>, <kbd>Ctrl-]</kbd> jumps to definitions.</li>
<li><b>Plugins:</b> packages go under <code>~/.vim/pack/</code>. In Neovim you can configure with Lua.</li>
</ul>`),
          demo: {
            text: '¶Hilfe',
            steps: [[':h ciw<CR>', T('<kbd>:h</kbd> zeigt, was der Befehl tut und wo er im Kurs vorkommt.', '<kbd>:h</kbd> shows what the command does and where it appears in the course.')], [':h gq<CR>', T('Noch ein Beispiel.', 'Another example.')]]
          },
          ex: [
            { tier: 'basic', task: T('Schlage <code>ciw</code> in der Hilfe nach.', 'Look up <code>ciw</code> in the help.'), text: '¶', expect: '^h(elp)?\\s+ciw$', sol: ':h ciw<CR>' },
            { tier: 'basic', task: T('Schlage <code>gq</code> in der Hilfe nach.', 'Look up <code>gq</code> in the help.'), text: '¶', expect: '^h(elp)?\\s+gq\\w*$', sol: ':h gq<CR>' },
            { tier: 'final', task: T('Großes Finale: Modernisiere das Skript mit allem, was du gelernt hast.', 'Grand finale: modernise the script with everything you have learned.'),
              text: T("¶var name = 'ada'\nvar langs = ['js', 'py']\n// TODO: entfernen\nconsole.log(name)", "¶var name = 'ada'\nvar langs = ['js', 'py']\n// TODO: remove\nconsole.log(name)"),
              goal: "const name = 'Ada';\nconst langs = ['js', 'py'];\nconsole.log(name);", sol: ":%s/var/const/<CR>:g/TODO/d<CR>:%norm A;<CR>gg0f'l~",
              hint: T('Vier Schritte: ersetzen, eine Zeile per <code>:g</code> löschen, per <code>:norm</code> Semikolons anhängen, einen Buchstaben großschreiben.', 'Four steps: substitute, delete a line with <code>:g</code>, append semicolons with <code>:norm</code>, capitalise one letter.') }
          ]
        }
      ]
    }
  ];

  root.VK.COURSE.push(...CHAPTERS);
})(typeof window !== 'undefined' ? window : this);
