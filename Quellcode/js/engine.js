/* Vimsical · Vim-Engine
   Ein Vim-Emulator im Browser: Modi, Bewegungen, Operatoren, Textobjekte, Register, Makros,
   Marken, Sprung- und Änderungsliste, Undo-Baum, Suche, Ex-Befehle, Puffer, Fenster, Tabs,
   Faltungen, Zuordnungen, Abkürzungen, Vervollständigung und Filter. */
(function (root) {
  'use strict';

  const ESC = '\x1b', CR = '\r', BS = '\b', TAB = '\t', DEL = '\x7f';
  const LEFT = '', RIGHT = '', UP = '', DOWN = '';
  const CTRL = {};
  for (const ch of 'abcdefghijklmnopqrstuvwxyz') CTRL[ch] = String.fromCharCode(ch.charCodeAt(0) - 96);
  CTRL['^'] = '\x1e'; CTRL[']'] = '\x1d';

  /* ---------- Meldungen ---------- */
  const MSG = {
    de: {
      e191: 'E191: Ungültiges Argument für m', e748: 'E748: Kein zuvor verwendetes Register',
      noSub: 'E35: Kein vorheriges Ersetzen', noPat: 'E35: Kein vorheriges Suchmuster',
      e348: 'E348: Kein Wort unter dem Cursor', e20: 'E20: Marke nicht gesetzt',
      e486: s => 'E486: Muster nicht gefunden: ' + s, badPat: s => 'E486: Ungültiges Muster: ' + s,
      wrapBottom: 'Suche erreichte das ENDE und machte am ANFANG weiter',
      wrapTop: 'Suche erreichte den ANFANG und machte am ENDE weiter',
      yanked: n => n + ' Zeilen kopiert', fewer: n => n + ' Zeilen weniger', more: n => n + ' Zeilen mehr',
      shifted: (n, op) => n + ' Zeilen ' + op + ' 1-mal eingerückt',
      e353: r => 'E353: Nichts in Register ' + r, regEmpty: r => 'E748: Register ' + r + ' ist leer',
      oldest: 'Bereits bei der ältesten Änderung', newest: 'Bereits bei der neuesten Änderung',
      e16: 'E16: Ungültiger Bereich', e492: s => 'E492: Kein Editor-Befehl: ' + s,
      written: (name, n) => '"' + name + '" ' + n + 'Z geschrieben',
      quit: 'Geschafft, du hast Vim verlassen! Hier bleibt der Editor offen, damit du weiterüben kannst.',
      help: 'Tipp: Der Spickzettel oben in der Navigation listet alle Befehle dieses Kurses.',
      helpNone: s => 'E149: Leider keine Hilfe für ' + s,
      windows: 'Fenster und Tabs gibt es nur im Fenster-Editor dieses Kurses.',
      e146: 'E146: Reguläre Ausdrücke können nicht durch Buchstaben getrennt werden',
      e476: 'E476: Ungültiger Befehl', e134: 'E134: Zeilen können nicht in sich selbst verschoben werden',
      e518: s => 'E518: Unbekannte Option: ' + s,
      subs: (c, l) => c + (c === 1 ? ' Ersetzung' : ' Ersetzungen') + ' in ' + l + (l === 1 ? ' Zeile' : ' Zeilen'),
      setHelp: 'Optionen: number, relativenumber, hlsearch, incsearch, ignorecase, smartcase, autoindent, shiftwidth, textwidth, list, hidden, scrolloff, foldmethod',
      regHead: 'Typ  Name  Inhalt', regNone: 'Alle Register sind leer.',
      markHead: 'Marke Zeile Spalte Text', markNone: 'Keine Marken gesetzt.',
      e37: 'E37: Kein Schreibvorgang seit der letzten Änderung (füge ! hinzu, um zu erzwingen)',
      e89: n => 'E89: Puffer ' + n + ' wurde seit dem letzten Schreiben geändert (füge ! hinzu, um zu erzwingen)',
      e94: s => 'E94: Kein passender Puffer für ' + s, e86: n => 'E86: Puffer ' + n + ' existiert nicht',
      e85: 'E85: Es gibt keinen gelisteten Puffer', e32: 'E32: Kein Dateiname',
      newFile: n => '"' + n + '" [Neu]', fileInfo: (n, l, m) => '"' + n + '"' + (m ? ' [Geändert]' : '') + ' ' + l + ' Zeilen',
      e484: n => 'E484: Datei kann nicht geöffnet werden: ' + n,
      e444: 'E444: Das letzte Fenster kann nicht geschlossen werden', e784: 'E784: Der letzte Tab kann nicht geschlossen werden',
      e42: 'E42: Keine Treffer in der Quickfix-Liste', e553: 'E553: Keine weiteren Einträge',
      qfItem: (i, n, txt) => '(' + i + ' von ' + n + '): ' + txt,
      e490: 'E490: Keine Faltung gefunden', foldLine: (n, txt) => '+--' + String(n).padStart(3) + ' Zeilen: ' + txt,
      e31: 'E31: Keine solche Zuordnung', noMaps: 'Keine Zuordnung gefunden',
      e24: 'E24: Keine solche Abkürzung', noAbbr: 'Keine Abkürzung gefunden',
      e15: s => 'E15: Ungültiger Ausdruck: ' + s,
      shellNA: c => 'Shell-Befehl nicht verfügbar: ' + c + '. Der Kurs-Editor kennt sort, uniq, tac, rev, nl, tr, grep, head, tail, wc, cat und date.',
      confirm: r => 'ersetzen durch ' + r + ' (y/n/a/q/l)?',
      state: s => 'Änderungsstand #' + s,
      e662: 'E662: Am Anfang der Änderungsliste', e663: 'E663: Am Ende der Änderungsliste', e664: 'E664: Die Änderungsliste ist leer',
      jumpsHead: ' Sprung Zeile Spalte Text', changesHead: ' Änd. Zeile Spalte Text',
      ga: (ch, c) => '<' + ch + '> ' + c + ', Hex ' + c.toString(16).padStart(2, '0') + ', Oktal ' + c.toString(8),
      ctrlg: (n, m, l, p) => '"' + n + '"' + (m ? ' [Geändert]' : '') + ' ' + l + ' Zeilen --' + p + '%--',
      compl: (i, n) => '-- Schlüsselwortvervollständigung (^N^P) Treffer ' + i + ' von ' + n,
      complNone: '-- Schlüsselwortvervollständigung (^N^P) Muster nicht gefunden',
      complLine: (i, n) => '-- Zeilenvervollständigung (^L^N^P) Treffer ' + i + ' von ' + n,
      ctrlx: '-- ^X-Modus (^L^N^P)', sourced: n => n + ' Befehle aus der Datei ausgeführt',
      tabHead: n => 'Tab ' + n, digHead: 'Digraphen (Ctrl-k und zwei Zeichen):',
      leader: k => 'mapleader ist jetzt "' + k + '"', letDone: s => s + ' gesetzt'
    },
    en: {
      e191: 'E191: Argument must be a letter or forward/backward quote', e748: 'E748: No previously used register',
      noSub: 'E35: No previous substitute', noPat: 'E35: No previous regular expression',
      e348: 'E348: No string under cursor', e20: 'E20: Mark not set',
      e486: s => 'E486: Pattern not found: ' + s, badPat: s => 'E486: Invalid pattern: ' + s,
      wrapBottom: 'search hit BOTTOM, continuing at TOP', wrapTop: 'search hit TOP, continuing at BOTTOM',
      yanked: n => n + ' lines yanked', fewer: n => n + ' fewer lines', more: n => n + ' more lines',
      shifted: (n, op) => n + ' lines ' + op + 'ed 1 time',
      e353: r => 'E353: Nothing in register ' + r, regEmpty: r => 'E748: Register ' + r + ' is empty',
      oldest: 'Already at oldest change', newest: 'Already at newest change',
      e16: 'E16: Invalid range', e492: s => 'E492: Not an editor command: ' + s,
      written: (name, n) => '"' + name + '" ' + n + 'L written',
      quit: 'You made it out of Vim! The editor stays open here so you can keep practising.',
      help: 'Tip: the cheat sheet in the top navigation lists every command in this course.',
      helpNone: s => 'E149: Sorry, no help for ' + s,
      windows: 'Windows and tabs only exist in this course\'s window editor.',
      e146: 'E146: Regular expressions can\'t be delimited by letters',
      e476: 'E476: Invalid command', e134: 'E134: Cannot move a range of lines into itself',
      e518: s => 'E518: Unknown option: ' + s,
      subs: (c, l) => c + (c === 1 ? ' substitution' : ' substitutions') + ' on ' + l + (l === 1 ? ' line' : ' lines'),
      setHelp: 'Options: number, relativenumber, hlsearch, incsearch, ignorecase, smartcase, autoindent, shiftwidth, textwidth, list, hidden, scrolloff, foldmethod',
      regHead: 'Type Name Content', regNone: 'All registers are empty.',
      markHead: 'mark line  col file/text', markNone: 'No marks set.',
      e37: 'E37: No write since last change (add ! to override)',
      e89: n => 'E89: No write since last change for buffer ' + n + ' (add ! to override)',
      e94: s => 'E94: No matching buffer for ' + s, e86: n => 'E86: Buffer ' + n + ' does not exist',
      e85: 'E85: There is no listed buffer', e32: 'E32: No file name',
      newFile: n => '"' + n + '" [New]', fileInfo: (n, l, m) => '"' + n + '"' + (m ? ' [Modified]' : '') + ' ' + l + ' lines',
      e484: n => 'E484: Can\'t open file ' + n,
      e444: 'E444: Cannot close last window', e784: 'E784: Cannot close last tab page',
      e42: 'E42: No matches in the quickfix list', e553: 'E553: No more items',
      qfItem: (i, n, txt) => '(' + i + ' of ' + n + '): ' + txt,
      e490: 'E490: No fold found', foldLine: (n, txt) => '+--' + String(n).padStart(3) + ' lines: ' + txt,
      e31: 'E31: No such mapping', noMaps: 'No mapping found',
      e24: 'E24: No such abbreviation', noAbbr: 'No abbreviation found',
      e15: s => 'E15: Invalid expression: ' + s,
      shellNA: c => 'Shell command not available: ' + c + '. The course editor knows sort, uniq, tac, rev, nl, tr, grep, head, tail, wc, cat and date.',
      confirm: r => 'replace with ' + r + ' (y/n/a/q/l)?',
      state: s => 'change #' + s,
      e662: 'E662: At start of changelist', e663: 'E663: At end of changelist', e664: 'E664: changelist is empty',
      jumpsHead: ' jump line  col text', changesHead: 'change line  col text',
      ga: (ch, c) => '<' + ch + '> ' + c + ', Hex ' + c.toString(16).padStart(2, '0') + ', Octal ' + c.toString(8),
      ctrlg: (n, m, l, p) => '"' + n + '"' + (m ? ' [Modified]' : '') + ' ' + l + ' lines --' + p + '%--',
      compl: (i, n) => '-- Keyword completion (^N^P) match ' + i + ' of ' + n,
      complNone: '-- Keyword completion (^N^P) Pattern not found',
      complLine: (i, n) => '-- Whole line completion (^L^N^P) match ' + i + ' of ' + n,
      ctrlx: '-- ^X mode (^L^N^P)', sourced: n => n + ' commands executed from the file',
      tabHead: n => 'Tab page ' + n, digHead: 'Digraphs (Ctrl-k plus two characters):',
      leader: k => 'mapleader is now "' + k + '"', letDone: s => s + ' set'
    }
  };
  let LANG = 'de';
  function M(key, ...args) {
    const v = (MSG[LANG] || MSG.de)[key];
    return typeof v === 'function' ? v(...args) : v;
  }

  const INS = { insert: true, replace: true };
  const VIS = { visual: true, vline: true, vblock: true };
  const WORD_RE = /[\p{L}\p{N}_]/u;
  const cls = (ch, big) => {
    if (ch === undefined || ch === ' ' || ch === '\t') return 0;
    if (big) return 1;
    return WORD_RE.test(ch) ? 1 : 2;
  };
  const isPrintable = k => k.length === 1 && k >= ' ' && k !== DEL && !(k >= '' && k <= '');
  const cmp = (a, b) => (a.r - b.r) || (a.c - b.c);
  const rot13 = ch => {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return String.fromCharCode((c - 65 + 13) % 26 + 65);
    if (c >= 97 && c <= 122) return String.fromCharCode((c - 97 + 13) % 26 + 97);
    return ch;
  };
  const caseFn = op => {
    let f;
    if (op.endsWith('?')) f = rot13;
    else if (op.endsWith('~')) f = ch => { const u = ch.toUpperCase(); if (u !== ch) return u.length === 1 ? u : ch; return ch.toLowerCase(); };
    else if (op.endsWith('U')) f = ch => { const u = ch.toUpperCase(); return u.length === 1 ? u : ch; };
    else f = ch => ch.toLowerCase();
    return s => Array.from(s).map(f).join('');
  };

  const DIGRAPHS = {
    'a:': 'ä', 'o:': 'ö', 'u:': 'ü', 'A:': 'Ä', 'O:': 'Ö', 'U:': 'Ü', 'ss': 'ß', 'e\'': 'é', 'e!': 'è', 'a\'': 'á', 'a!': 'à',
    'e>': 'ê', 'c,': 'ç', 'n?': 'ñ', 'o\'': 'ó', 'i\'': 'í', 'u\'': 'ú', 'Eu': '€', '=e': '€', 'Pd': '£', 'Ye': '¥', 'Co': '©',
    'Rg': '®', 'TM': '™', '->': '→', '<-': '←', '-!': '↑', '-v': '↓', 'OK': '✓', 'XX': '✗', '12': '½', '14': '¼', '34': '¾',
    '*X': '×', '-:': '÷', 'DG': '°', 'My': 'µ', 'SE': '§', '<<': '«', '>>': '»', '"6': '“', '"9': '”', ':9': '„', '\'6': '‘', '\'9': '’', '+-': '±', '!=': '≠',
    '=<': '≤', '>=': '≥', 'a*': 'α', 'b*': 'β', 'p*': 'π', 'l*': 'λ', 'm*': 'μ', '2S': '²', '3S': '³', '..': '…', '-N': '–', '-M': '—'
  };

  /* ---------- Tasten-Notation ---------- */
  const NAMES = { [ESC]: 'Esc', [CR]: 'Enter', [BS]: '⌫', [TAB]: 'Tab', [DEL]: 'Entf', ' ': '␣', [LEFT]: '←', [RIGHT]: '→', [UP]: '↑', [DOWN]: '↓' };
  function keyLabel(k) {
    if (NAMES[k]) return NAMES[k];
    const code = k.charCodeAt(0);
    if (code === 0x1e) return 'Ctrl-^';
    if (code === 0x1d) return 'Ctrl-]';
    if (code < 32) return 'Ctrl-' + String.fromCharCode(code + 96);
    return k;
  }
  const NOTATION = { esc: ESC, cr: CR, enter: CR, return: CR, bs: BS, tab: TAB, del: DEL, space: ' ', left: LEFT, right: RIGHT, up: UP, down: DOWN, lt: '<', bar: '|', bslash: '\\' };
  function parseNotation(s, leader) {
    const out = [];
    let i = 0;
    while (i < s.length) {
      if (s[i] === '<') {
        const j = s.indexOf('>', i);
        if (j > i + 1) {
          const name = s.slice(i + 1, j).toLowerCase();
          let k = null;
          if (NOTATION[name] !== undefined) k = NOTATION[name];
          else if (name === 'leader') k = leader === undefined ? '\\' : leader;
          else {
            const m = name.match(/^c-(.)$/);
            if (m) k = m[1] === '[' ? ESC : m[1] === '^' || m[1] === '6' ? '\x1e' : m[1] === ']' ? '\x1d' : CTRL[m[1]];
          }
          if (k !== null && k !== undefined) { for (const ch of k) out.push(ch); i = j + 1; continue; }
        }
      }
      out.push(s[i]); i++;
    }
    return out;
  }
  function toNotation(keys) {
    return keys.map(k => {
      if (k === ESC) return '<Esc>';
      if (k === CR) return '<CR>';
      if (k === BS) return '<BS>';
      if (k === TAB) return '<Tab>';
      if (k === DEL) return '<Del>';
      if (k === LEFT) return '<Left>';
      if (k === RIGHT) return '<Right>';
      if (k === UP) return '<Up>';
      if (k === DOWN) return '<Down>';
      if (k === '<') return '<lt>';
      const code = k.charCodeAt(0);
      if (code === 0x1e) return '<C-^>';
      if (code === 0x1d) return '<C-]>';
      if (code < 32) return '<C-' + String.fromCharCode(code + 96) + '>';
      return k;
    }).join('');
  }

  /* ---------- Vim-Regex nach JS übersetzen ---------- */
  const KW = '[\\p{L}\\p{N}_]';
  const POSIX = { alpha: '\\p{L}', digit: '0-9', alnum: '\\p{L}\\p{N}', lower: '\\p{Ll}', upper: '\\p{Lu}', space: '\\s', punct: '!-\\/:-@\\[-`{-~', xdigit: '0-9A-Fa-f', blank: ' \\t' };
  function veryMagicToMagic(p) {
    let out = '';
    for (let i = 0; i < p.length; i++) {
      const ch = p[i];
      if (ch === '\\') {
        const n = p[i + 1];
        if (n === undefined) { out += '\\\\'; break; }
        if ('()|+?{}=<>@'.includes(n)) out += n;
        else out += '\\' + n;
        i++; continue;
      }
      if ('()|+?{=<>'.includes(ch)) { out += '\\' + ch; continue; }
      if (ch === '}') { out += '}'; continue; }
      out += ch;
    }
    return out;
  }
  function convertMagic(pat) {
    let out = '', i = 0, inClass = false;
    while (i < pat.length) {
      const ch = pat[i];
      if (inClass) {
        if (ch === ']') { inClass = false; out += ']'; i++; continue; }
        if (ch === '[' && pat[i + 1] === ':') {
          const j = pat.indexOf(':]', i + 2);
          if (j > 0) { const name = pat.slice(i + 2, j); if (POSIX[name]) { out += POSIX[name]; i = j + 2; continue; } }
        }
        if (ch === '\\') {
          const n = pat[i + 1];
          if (n === undefined) out += '\\\\';
          else if ('dswDSWnt]\\^-'.includes(n)) out += '\\' + n;
          else out += /[\^$\\.*+?()[\]{}|\/]/.test(n) ? '\\' + n : n;
          i += 2; continue;
        }
        if ('()|{}'.includes(ch)) { out += '\\' + ch; i++; continue; }
        out += ch; i++; continue;
      }
      if (ch === '\\') {
        const n = pat[i + 1];
        i += 2;
        switch (n) {
          case '(': out += '('; break;
          case '%': if (pat[i] === '(') { out += '(?:'; i++; } else out += '%'; break;
          case ')': out += ')'; break;
          case '|': out += '|'; break;
          case '+': out += '+'; break;
          case '=': case '?': out += '?'; break;
          case '{': {
            const j = pat.indexOf('}', i);
            if (j < 0) { out += '\\{'; break; }
            let q = pat.slice(i, j), lazy = false;
            if (q.endsWith('\\')) q = q.slice(0, -1);
            if (q.startsWith('-')) { lazy = true; q = q.slice(1); }
            if (q === '') q = '0,';
            else if (q.startsWith(',')) q = '0' + q;
            out += '{' + q + '}' + (lazy ? '?' : '');
            i = j + 1; break;
          }
          case '<': out += '(?<!' + KW + ')'; break;
          case '>': out += '(?!' + KW + ')'; break;
          case 'w': out += KW; break;
          case 'W': out += '[^\\p{L}\\p{N}_]'; break;
          case 'a': out += '\\p{L}'; break;
          case 'A': out += '\\P{L}'; break;
          case 'h': out += '[\\p{L}_]'; break;
          case 'u': out += '\\p{Lu}'; break;
          case 'l': out += '\\p{Ll}'; break;
          case 'x': out += '[0-9A-Fa-f]'; break;
          case 'd': case 'D': case 's': case 'S': out += '\\' + n; break;
          case 'n': out += '\\n'; break;
          case 't': out += '\\t'; break;
          case undefined: out += '\\\\'; break;
          default: out += /[\^$\\.*+?()[\]{}|\/]/.test(n) ? '\\' + n : n;
        }
        continue;
      }
      if (ch === '[') {
        inClass = true; out += '['; i++;
        if (pat[i] === '^') { out += '^'; i++; }
        if (pat[i] === ']') { out += '\\]'; i++; }
        continue;
      }
      if ('()|+?{}]'.includes(ch)) { out += '\\' + ch; i++; continue; }
      out += ch; i++;
    }
    return out;
  }
  function compileVim(pat, ic, smart) {
    if (/\\c/.test(pat)) { ic = true; pat = pat.replace(/\\c/g, ''); }
    else if (/\\C/.test(pat)) { ic = false; pat = pat.replace(/\\C/g, ''); }
    else if (ic && smart && /\p{Lu}/u.test(pat.replace(/\\./g, ''))) ic = false;
    if (pat.startsWith('\\v')) pat = veryMagicToMagic(pat.slice(2));
    else if (pat.startsWith('\\V')) pat = pat.slice(2).replace(/[.*~[\]^$]/g, m => '\\' + m);
    else if (pat.startsWith('\\m')) pat = pat.slice(2);
    let pre = null, post = null, body = pat;
    const zs = body.indexOf('\\zs');
    if (zs >= 0) { pre = body.slice(0, zs); body = body.slice(zs + 3); }
    const ze = body.indexOf('\\ze');
    if (ze >= 0) { post = body.slice(ze + 3); body = body.slice(0, ze); }
    const out = (pre !== null ? '(?<=' + convertMagic(pre) + ')' : '') + convertMagic(body) + (post !== null ? '(?=' + convertMagic(post) + ')' : '');
    try { return new RegExp(out, 'gu' + (ic ? 'i' : '')); } catch (e) { return null; }
  }

  function vimReplace(rep, m, prevRep) {
    let out = '', i = 0, caseMode = null, one = null;
    const emit = s => {
      for (const ch of s) {
        let x = ch;
        if (one) { x = one === 'u' ? x.toUpperCase() : x.toLowerCase(); one = null; }
        else if (caseMode) x = caseMode === 'U' ? x.toUpperCase() : x.toLowerCase();
        out += x;
      }
    };
    while (i < rep.length) {
      const ch = rep[i];
      if (ch === '\\') {
        const n = rep[i + 1];
        i += 2;
        if (n === undefined) out += '\\';
        else if (n >= '0' && n <= '9') emit(m[+n] || '');
        else if (n === 'r' || n === 'n') out += '\n';
        else if (n === 't') out += '\t';
        else if (n === 'u' || n === 'l') one = n;
        else if (n === 'U' || n === 'L') caseMode = n;
        else if (n === 'E' || n === 'e') caseMode = null;
        else emit(n);
        continue;
      }
      if (ch === '&') { emit(m[0]); i++; continue; }
      if (ch === '~' && prevRep != null) { emit(prevRep); i++; continue; }
      emit(ch); i++;
    }
    return out;
  }

  function evalExpr(s) {
    const src = s.trim();
    if (!/^[\d\s+\-*/%().]+$/.test(src)) return null;
    try {
      const v = Function('"use strict";return (' + src + ')')();
      if (typeof v !== 'number' || !isFinite(v)) return null;
      return String(/\./.test(src) ? v : Math.trunc(v));
    } catch (e) { return null; }
  }

  function runFilter(cmd, lines) {
    const parts = cmd.trim().match(/'[^']*'|"[^"]*"|\S+/g) || [];
    const unq = s => s.replace(/^['"]|['"]$/g, '');
    const name = parts[0], args = parts.slice(1).map(unq);
    const flags = args.filter(a => a.startsWith('-')).join('');
    switch (name) {
      case 'sort': {
        let out = lines.slice();
        const ci = flags.includes('f'), num = flags.includes('n');
        out.sort((a, b) => {
          if (num) { const x = parseFloat(a) || 0, y = parseFloat(b) || 0; return x - y; }
          const x = ci ? a.toLowerCase() : a, y = ci ? b.toLowerCase() : b;
          return x < y ? -1 : x > y ? 1 : 0;
        });
        if (flags.includes('r')) out.reverse();
        if (flags.includes('u')) out = out.filter((l, i) => i === 0 || l !== out[i - 1]);
        return out;
      }
      case 'uniq': return lines.filter((l, i) => i === 0 || l !== lines[i - 1]);
      case 'tac': return lines.slice().reverse();
      case 'rev': return lines.map(l => Array.from(l).reverse().join(''));
      case 'cat': return lines.slice();
      case 'nl': { let n = 0; return lines.map(l => l.trim() ? String(++n).padStart(6) + '  ' + l : l); }
      case 'wc': return [String(flags.includes('l') ? lines.length : lines.join(' ').split(/\s+/).filter(Boolean).length)];
      case 'head': { const n = parseInt(args.find(a => /^\d+$/.test(a)) || (flags.match(/\d+/) || ['10'])[0], 10); return lines.slice(0, n); }
      case 'tail': { const n = parseInt(args.find(a => /^\d+$/.test(a)) || (flags.match(/\d+/) || ['10'])[0], 10); return lines.slice(-n); }
      case 'grep': {
        const pat = args.filter(a => !a.startsWith('-'))[0] || '';
        let re; try { re = new RegExp(pat, flags.includes('i') ? 'i' : ''); } catch (e) { return null; }
        return lines.filter(l => re.test(l) !== flags.includes('v'));
      }
      case 'tr': {
        const [a, b] = args;
        const up = s => /a-z|lower/.test(s), low = s => /A-Z|upper/.test(s);
        if (a && b && up(a) && low(b) && !low(a)) return lines.map(l => l.toUpperCase());
        if (a && b && low(a) && up(b)) return lines.map(l => l.toLowerCase());
        if (a && b && a.length === b.length) return lines.map(l => Array.from(l).map(ch => { const i = a.indexOf(ch); return i >= 0 ? b[i] : ch; }).join(''));
        return null;
      }
      case 'date': {
        const d = new Date();
        return [d.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'de-DE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toTimeString().slice(0, 8)];
      }
    }
    return null;
  }

  /* ---------- Befehlstabellen ---------- */
  const MOTIONS = {
    h: 0, j: 0, k: 0, l: 0, [BS]: 0, ' ': 0, [LEFT]: 0, [RIGHT]: 0, [UP]: 0, [DOWN]: 0,
    w: 0, W: 0, b: 0, B: 0, e: 0, E: 0, ge: 0, gE: 0, '0': 0, '^': 0, '$': 0, g_: 0, '|': 0,
    gg: 0, G: 0, '{': 0, '}': 0, '(': 0, ')': 0, '%': 0, H: 0, M: 0, L: 0, _: 0, '+': 0, '-': 0, [CR]: 0,
    n: 0, N: 0, '*': 0, '#': 0, 'g*': 0, 'g#': 0, gd: 0, gD: 0,
    '[(': 0, '[{': 0, '])': 0, ']}': 0, '[[': 0, ']]': 0,
    [CTRL.d]: 0, [CTRL.u]: 0, [CTRL.f]: 0, [CTRL.b]: 0,
    f: 1, F: 1, t: 1, T: 1, ';': 0, ',': 0, "'": 1, '`': 1
  };
  const OPS = ['g~', 'gu', 'gU', 'gq', 'gw', 'g?', 'zf', 'd', 'c', 'y', '>', '<', '=', '!'];
  const NCMDS = {
    x: 0, X: 0, [DEL]: 0, s: 0, S: 0, D: 0, C: 0, Y: 0, p: 0, P: 0, gp: 0, gP: 0, ']p': 0, '[p': 0,
    u: 0, U: 0, [CTRL.r]: 0, '.': 0, 'g-': 0, 'g+': 0,
    i: 0, a: 0, I: 0, A: 0, o: 0, O: 0, R: 0, gi: 0, v: 0, V: 0, [CTRL.v]: 0, gv: 0, J: 0, gJ: 0, '~': 0,
    zz: 0, zt: 0, zb: 0, zF: 0, zo: 0, zO: 0, zc: 0, zC: 0, za: 0, zA: 0, zR: 0, zM: 0, zd: 0, zD: 0, zE: 0, zj: 0, zk: 0,
    ZZ: 0, ZQ: 0, ':': 0, '/': 0, '?': 0, [CTRL.a]: 0, [CTRL.x]: 0, '&': 0, 'g&': 0,
    ga: 0, [CTRL.g]: 0, 'g;': 0, 'g,': 0, gt: 0, gT: 0, [CTRL.o]: 0, [TAB]: 0, [CTRL.e]: 0, [CTRL.y]: 0,
    [CTRL.l]: 0, '\x1e': 0, [CTRL.w]: 1,
    r: 1, m: 1, q: 1, '@': 1
  };
  const VCMDS = {
    d: 0, x: 0, [DEL]: 0, X: 0, D: 0, c: 0, s: 0, C: 0, S: 0, R: 0, y: 0, Y: 0, '>': 0, '<': 0,
    '~': 0, u: 0, U: 0, 'g~': 0, gu: 0, gU: 0, 'g?': 0, gq: 0, gw: 0, '=': 0, '!': 0, zf: 0, J: 0, gJ: 0, r: 1, p: 0, P: 0,
    o: 0, O: 0, I: 0, A: 0, v: 0, V: 0, [CTRL.v]: 0, ':': 0, '/': 0, '?': 0, [CTRL.a]: 0, [CTRL.x]: 0,
    ['g' + CTRL.a]: 0, ['g' + CTRL.x]: 0, i: 1, a: 1
  };
  const CHANGE_CMDS = new Set(['x', 'X', DEL, 's', 'S', 'D', 'C', 'p', 'P', 'gp', 'gP', ']p', '[p', 'J', 'gJ', '~', 'r',
    'i', 'a', 'I', 'A', 'o', 'O', 'R', 'gi', CTRL.a, CTRL.x, '&']);
  const VCHANGES = new Set(['d', 'x', DEL, 'X', 'D', 'c', 's', 'C', 'S', 'R', '>', '<', '~', 'u', 'U', 'g~', 'gu', 'gU', 'g?', 'gq', '=', 'J', 'gJ', 'r']);
  const JUMPS = new Set(['G', 'gg', 'n', 'N', '*', '#', 'g*', 'g#', '%', '{', '}', '(', ')', "'", '`', 'H', 'M', 'L', 'gd', 'gD', '[[', ']]']);
  const EXCMDS = ['abbreviate', 'bdelete', 'bfirst', 'blast', 'bnext', 'bprevious', 'buffer', 'buffers', 'bufdo', 'cc', 'cdo', 'cfirst', 'changes',
    'clast', 'close', 'cnext', 'copen', 'copy', 'cprevious', 'delete', 'digraphs', 'earlier', 'edit', 'enew', 'file', 'fold', 'global', 'help',
    'iabbrev', 'imap', 'inoremap', 'join', 'jumps', 'later', 'let', 'ls', 'map', 'mapclear', 'marks', 'move', 'new', 'nmap', 'nnoremap',
    'nohlsearch', 'noremap', 'normal', 'only', 'put', 'quit', 'qall', 'read', 'redo', 'registers', 'retab', 'saveas', 'set', 'sort',
    'source', 'split', 'substitute', 'tabclose', 'tabedit', 'tabnew', 'tabnext', 'tabonly', 'tabprevious', 'tabs', 'undo', 'unabbreviate',
    'unmap', 'update', 'vglobal', 'vimgrep', 'vmap', 'vnew', 'vnoremap', 'vsplit', 'wall', 'windo', 'wq', 'write', 'xall', 'xit', 'yank'];
  const OPTS = ['number', 'relativenumber', 'hlsearch', 'incsearch', 'ignorecase', 'smartcase', 'autoindent', 'shiftwidth', 'textwidth', 'list',
    'hidden', 'scrolloff', 'foldmethod', 'cursorline', 'wrapscan'];
  const ALIAS = { nu: 'number', rnu: 'relativenumber', hls: 'hlsearch', is: 'incsearch', ic: 'ignorecase', scs: 'smartcase', ai: 'autoindent',
    sw: 'shiftwidth', tw: 'textwidth', hid: 'hidden', so: 'scrolloff', fdm: 'foldmethod', cul: 'cursorline', ws: 'wrapscan' };
  const OPT_DEFAULTS = { shiftwidth: 4, autoindent: true, number: true, relativenumber: false, hlsearch: true, incsearch: true, ignorecase: false,
    smartcase: false, textwidth: 0, list: false, hidden: true, scrolloff: 0, foldmethod: 'manual', cursorline: true, wrapscan: true };

  function look(rest, tab) {
    let inc = false;
    for (const k in tab) {
      const need = k.length + (tab[k] ? 1 : 0);
      if (rest.length >= k.length && rest.startsWith(k)) {
        if (rest.length === need) return { key: k, arg: tab[k] ? rest[k.length] : null };
        if (rest.length < need) inc = true;
      } else if (k.startsWith(rest)) inc = true;
    }
    return inc ? 'inc' : null;
  }

  /* ---------- Puffer und gemeinsamer Zustand ---------- */
  class Buffer {
    constructor(id, name, text, unsaved) {
      this.id = id; this.name = name;
      this.lines = String(text == null ? '' : text).replace(/\t/g, '    ').split('\n');
      this.undoStack = []; this.redoStack = [];
      this.marks = {};
      this.savedText = unsaved ? null : this.lines.join("\n");
      this.seq = 0; this.seqLast = 0; this.savedSeq = 0;
      this.states = [{ lines: this.lines.slice(), r: 0, c: 0, seq: 0, t: Date.now() }];
      this.changes = []; this.changeIdx = 0; this.uLine = null; this.lastPos = { r: 0, c: 0 };
    }
    get modified() { return this.savedText === null ? (this.lines.length > 1 || this.lines[0] !== "") : this.lines.join("\n") !== this.savedText; }
    set modified(v) { if (!v) this.savedText = this.lines.join("\n"); }
  }
  function makeShared(o) {
    return {
      regs: {}, gmarks: {}, lastSearch: null, lastSub: null, lastEx: null, exLog: [],
      maps: { n: {}, i: {}, v: {} }, abbr: {}, leader: '\\', hist: { ':': [], '/': [] },
      buffers: [], files: {}, nextBuf: 1, qf: { list: [], idx: -1 },
      o: Object.assign({}, OPT_DEFAULTS, o || {}), help: null, onClipboard: null, ws: null
    };
  }

  /* ---------- Engine (ein Fenster) ---------- */
  class Vim {
    constructor(text, o, ws) {
      o = o || {};
      this.ws = ws || null;
      this.shared = ws ? ws.shared : makeShared();
      this.o = Object.create(this.shared.o);
      this.o.height = o.height || 12;
      if (!ws) for (const k in o) if (k !== 'height' && k !== 'buf') this.shared.o[k] = o[k];
      if (o.buf) this.buf = o.buf;
      else {
        this.buf = new Buffer(this.shared.nextBuf++, o.name || (LANG === 'en' ? 'practice.txt' : 'uebung.txt'), text || '');
        this.shared.buffers.push(this.buf);
      }
      this.foldsByBuf = {};
      this.resetWin();
    }

    get lines() { return this.buf.lines; }
    set lines(v) { this.buf.lines = v; }
    get undoStack() { return this.buf.undoStack; }
    get redoStack() { return this.buf.redoStack; }
    get marks() { return this.buf.marks; }
    get regs() { return this.shared.regs; }
    get lastSearch() { return this.shared.lastSearch; }
    set lastSearch(v) { this.shared.lastSearch = v; }
    get lastSub() { return this.shared.lastSub; }
    set lastSub(v) { this.shared.lastSub = v; }
    get lastEx() { return this.shared.lastEx; }
    set lastEx(v) { this.shared.lastEx = v; }
    get exLog() { return this.shared.exLog; }
    set exLog(v) { this.shared.exLog = v; }
    get folds() { return this.foldsByBuf[this.buf.id] || (this.foldsByBuf[this.buf.id] = []); }
    set folds(v) { this.foldsByBuf[this.buf.id] = v; }

    resetWin() {
      this.r = 0; this.c = 0; this.want = 0; this.top = 0;
      this.mode = 'normal'; this.pending = ''; this.mapBuf = '';
      this.insertPre = null; this.insertKeys = []; this.insertRepeat = null; this.insertedText = '';
      this.dot = null; this.dotPending = null; this.replayingDot = false;
      this.recording = null; this.recBuf = [];
      this.cmdType = ''; this.cmdText = ''; this.cmdFrom = null;
      this.vs = null; this.lastVisual = null;
      this.lastFind = null; this.hls = false;
      this.lastMacro = null; this.lastJump = null; this.jumps = []; this.jumpIdx = 0;
      this.message = null; this.list = null;
      this.depth = 0; this.steps = 0; this.macroDepth = 0;
      this.failed = false; this.keystrokes = 0;
      this.blockInsert = null; this.autoIndentRow = null; this.insertRegPending = false;
      this.cmdRegPending = false; this.replaceStack = [];
      this.ctrlO = false; this.ctrlOFresh = false; this.compl = null; this.ctrlX = false;
      this.digraph = null; this.literal = null; this.confirm = null; this.inc = null;
      this.histIdx = -1; this.histBase = null; this.cmdCompl = null; this.alt = null;
    }

    setText(text) {
      const b = this.buf;
      b.lines = String(text).replace(/\t/g, '    ').split('\n');
      b.undoStack = []; b.redoStack = []; b.marks = {}; b.savedText = b.lines.join("\n");
      b.seq = 0; b.seqLast = 0; b.savedSeq = 0;
      b.states = [{ lines: b.lines.slice(), r: 0, c: 0, seq: 0, t: Date.now() }];
      b.changes = []; b.changeIdx = 0; b.uLine = null;
      this.folds = [];
      this.resetWin();
    }

    text() { return this.lines.join('\n'); }
    setCursor(r, c) { this.r = r; this.c = c; this.want = c; this.clampNormal(); this.scrollToCursor(); }
    get last() { return this.lines.length - 1; }
    pos() { return { buf: this.buf, r: this.r, c: this.c }; }

    msg(text, type) { this.message = { text, type: type || 'info' }; }
    fail(text) { this.failed = true; if (text) this.msg(text, 'error'); return false; }

    snap() { return { lines: this.lines.slice(), r: this.r, c: this.c }; }
    changed(s) {
      if (s.lines.length !== this.lines.length) return true;
      for (let i = 0; i < s.lines.length; i++) if (s.lines[i] !== this.lines[i]) return true;
      return false;
    }
    pushUndoOther(pre) {
      const b = pre.buf;
      if (pre.lines.length === b.lines.length && pre.lines.every((l, i) => l === b.lines[i])) return;
      b.undoStack.push({ lines: pre.lines, r: pre.r, c: pre.c, seq: b.seq });
      b.redoStack = [];
      b.seqLast++; b.seq = b.seqLast;
      b.states[b.seq] = { lines: b.lines.slice(), r: pre.r, c: pre.c, seq: b.seq, t: Date.now() };
    }
    pushUndo(pre) {
      const b = this.buf;
      pre.seq = b.seq;
      b.undoStack.push(pre);
      if (b.undoStack.length > 400) b.undoStack.shift();
      b.redoStack = [];
      b.seqLast++; b.seq = b.seqLast;
      b.states[b.seq] = { lines: this.lines.slice(), r: this.r, c: this.c, seq: b.seq, t: Date.now() };
      this.recordChange(pre);
    }
    recordChange(pre) {
      const b = this.buf, L = this.lines;
      let d = 0;
      while (d < pre.lines.length && d < L.length && pre.lines[d] === L[d]) d++;
      const pos = { r: Math.min(this.r, this.last), c: this.c };
      b.changes.push(pos);
      if (b.changes.length > 100) b.changes.shift();
      b.changeIdx = b.changes.length;
      b.marks['.'] = { r: pos.r, c: pos.c };
      if (pre.lines.length === L.length) {
        let diffs = 0, at = -1;
        for (let i = 0; i < L.length; i++) if (pre.lines[i] !== L[i]) { diffs++; at = i; }
        if (diffs === 1) { if (!b.uLine || b.uLine.r !== at) b.uLine = { r: at, text: pre.lines[at] }; }
        else if (diffs > 1) b.uLine = null;
      } else b.uLine = null;
      const delta = L.length - pre.lines.length;
      if (delta && this.folds.length) {
        this.folds = this.folds.filter(f => {
          if (f.s > d) { f.s += delta; f.e += delta; }
          else if (f.e >= d) f.e += delta;
          return f.e >= f.s && f.s >= 0;
        });
      }
      if (this.o.foldmethod === 'indent') this.computeIndentFolds();
    }

    fnb(r) {
      const s = this.lines[r];
      const m = s.search(/\S/);
      return m < 0 ? Math.max(0, s.length - 1) : m;
    }
    indentLen(r) { return this.lines[r].match(/^\s*/)[0].length; }
    colFor(r) {
      const max = Math.max(0, this.lines[r].length - 1);
      return this.want === Infinity ? max : Math.min(this.want, max);
    }
    clampNormal() {
      if (this.r < 0) this.r = 0;
      if (this.r > this.last) this.r = this.last;
      const len = this.lines[this.r].length;
      this.c = Math.max(0, Math.min(this.c, len > 0 ? len - 1 : 0));
    }
    clampInsert() {
      if (this.r > this.last) this.r = this.last;
      this.c = Math.max(0, Math.min(this.c, this.lines[this.r].length));
    }

    /* ---- Faltungen und sichtbare Zeilen ---- */
    closedFoldAt(r) {
      let best = null;
      for (const f of this.folds) if (f.closed && r >= f.s && r <= f.e && (!best || f.s < best.s || (f.s === best.s && f.e > best.e))) best = f;
      return best;
    }
    displayRow(r) { const f = this.closedFoldAt(r); return f ? f.s : r; }
    visibleRows(top, n) {
      const out = [];
      let r = this.displayRow(Math.min(top, this.last));
      while (out.length < n && r <= this.last) {
        const f = this.closedFoldAt(r);
        if (f) { out.push({ r: f.s, fold: f }); r = f.e + 1; } else { out.push({ r, fold: null }); r++; }
      }
      return out;
    }
    stepLine(r, dir) {
      if (dir > 0) { const f = this.closedFoldAt(r); const nx = (f ? f.e : r) + 1; if (nx > this.last) return null; return this.displayRow(nx); }
      const f = this.closedFoldAt(r); const pv = (f ? f.s : r) - 1; if (pv < 0) return null; return this.displayRow(pv);
    }
    scrollToCursor() {
      const h = this.o.height, so = Math.min(this.o.scrolloff || 0, Math.floor((h - 1) / 2));
      const dr = this.displayRow(this.r);
      let top = this.displayRow(Math.min(this.top, this.last));
      const countBetween = (a, b) => { let n = 0, r = a; while (r !== null && r < b) { r = this.stepLine(r, 1); n++; } return n; };
      let up = dr;
      for (let i = 0; i < so; i++) { const p = this.stepLine(up, -1); if (p === null) break; up = p; }
      if (up < top) top = up;
      else {
        let down = dr;
        for (let i = 0; i < so; i++) { const nx = this.stepLine(down, 1); if (nx === null) break; down = nx; }
        while (countBetween(top, down) >= h) { const nx = this.stepLine(top, 1); if (nx === null) break; top = nx; }
      }
      this.top = Math.max(0, top);
    }
    computeIndentFolds() {
      const L = this.lines, out = [], old = this.folds;
      const ind = r => L[r].trim() ? L[r].match(/^\s*/)[0].length : -1;
      for (let r = 0; r < L.length - 1; r++) {
        const base = ind(r);
        if (base < 0) continue;
        let nx = r + 1;
        while (nx < L.length && ind(nx) < 0) nx++;
        if (nx >= L.length || ind(nx) <= base) continue;
        let e = nx;
        for (let k = nx; k < L.length; k++) { const i = ind(k); if (i < 0) continue; if (i > base) e = k; else break; }
        const prev = old.find(f => f.s === r + 1);
        out.push({ s: r + 1, e, closed: prev ? prev.closed : true, auto: true });
      }
      this.folds = old.filter(f => !f.auto).concat(out);
    }
    foldUnderCursor(innermost) {
      const fs = this.folds.filter(f => this.r >= f.s && this.r <= f.e);
      if (!fs.length) return null;
      fs.sort((a, b) => (a.e - a.s) - (b.e - b.s));
      return innermost ? fs[0] : fs[fs.length - 1];
    }

    setJump() {
      this.lastJump = { r: this.r, c: this.c };
      this.jumps = this.jumps.slice(0, this.jumpIdx);
      const p = this.pos();
      const lastJ = this.jumps[this.jumps.length - 1];
      if (!lastJ || lastJ.buf !== p.buf || lastJ.r !== p.r) this.jumps.push(p);
      if (this.jumps.length > 100) this.jumps.shift();
      this.jumpIdx = this.jumps.length;
    }
    gotoPos(p) {
      if (p.buf && p.buf !== this.buf) { if (!this.shared.buffers.includes(p.buf)) return false; this.setBuffer(p.buf); }
      this.r = Math.min(p.r, this.last); this.c = p.c; this.clampNormal();
      return true;
    }

    /* ---- Eingabe ---- */
    feed(key) {
      this.failed = false;
      this.list = null;
      if (this.mode !== 'cmdline' && this.mode !== 'confirm') this.message = null;
      this.keystrokes++;
      if (this.recording) this.recBuf.push(key);
      this.steps = 0;
      this.feedKey(key, 0);
      this.scrollToCursor();
    }

    mapMode() {
      if (this.mode === 'normal' && this.pending === '') return 'n';
      if (this.mode === 'insert' && !this.insertRegPending && !this.digraph && this.literal === null && !this.ctrlX) return 'i';
      if (VIS[this.mode] && this.pending === '') return 'v';
      return null;
    }
    feedKey(key, depth) {
      const mm = this.mapMode();
      const tbl = mm ? this.shared.maps[mm] : null;
      if (!tbl || (!this.mapBuf && !Object.keys(tbl).length)) {
        if (this.mapBuf) { const b = this.mapBuf; this.mapBuf = ''; for (const k of b) this.dispatch(k); }
        return this.dispatch(key);
      }
      this.mapBuf += key;
      const buf = this.mapBuf;
      let exact = null, longer = false;
      for (const lhs in tbl) { if (lhs === buf) exact = tbl[lhs]; else if (lhs.startsWith(buf)) longer = true; }
      if (longer) return;
      this.mapBuf = '';
      if (exact) return this.runMap(exact, depth);
      for (let n = buf.length - 1; n >= 1; n--) {
        const p = buf.slice(0, n);
        if (tbl[p]) { this.runMap(tbl[p], depth); for (const k of buf.slice(n)) this.feedKey(k, depth); return; }
      }
      this.dispatch(buf[0]);
      for (const k of buf.slice(1)) this.feedKey(k, depth);
    }
    runMap(m, depth) {
      if (depth > 40) return this.fail();
      for (const k of m.rhs) { if (m.noremap) this.dispatch(k); else this.feedKey(k, depth + 1); if (this.failed) break; }
    }

    dispatch(key) {
      if (++this.steps > 200000) { this.failed = true; return; }
      this.depth++;
      const before = this.mode;
      const top = this.depth === 1;
      const pre = (top && !INS[before]) ? Object.assign(this.snap(), { buf: this.buf }) : null;
      if (INS[before]) {
        if (this.dotPending && !this.replayingDot) this.dotPending.push(key);
        if (before === 'insert' && key !== ESC && !this.insertRegPending) this.insertKeys.push(key);
      }
      switch (this.mode) {
        case 'normal': this.normalKey(key); break;
        case 'insert': this.insertKey(key); break;
        case 'replace': this.replaceKey(key); break;
        case 'cmdline': this.cmdKey(key); break;
        case 'confirm': this.confirmKey(key); break;
        default: this.visualKey(key);
      }
      if (this.ctrlO && !this.ctrlOFresh && this.mode === 'normal' && !this.pending) {
        this.ctrlO = false; this.mode = 'insert'; this.clampInsert();
      }
      if (top) this.ctrlOFresh = false;
      if (top && this.skipUndo) {
        this.skipUndo = false;
      } else if (top) {
        if (pre && pre.buf !== this.buf) {
          this.pushUndoOther(pre);
        } else if (pre) {
          if (INS[this.mode]) { if (!this.insertPre) this.insertPre = pre; }
          else if (this.changed(pre)) this.pushUndo(pre);
        } else if (INS[before] && !INS[this.mode]) {
          if (this.insertPre && this.changed(this.insertPre)) this.pushUndo(this.insertPre);
          this.insertPre = null;
        }
      }
      this.depth--;
    }

    parse(s, visual) {
      let i = 0, reg = null;
      if (s[0] === '"') { if (s.length < 2) return 'inc'; reg = s[1]; i = 2; }
      let cs = '';
      while (i < s.length && (/[1-9]/.test(s[i]) || (cs && /[0-9]/.test(s[i])))) cs += s[i++];
      if (i >= s.length) return 'inc';
      const count = cs ? parseInt(cs, 10) : 0;
      const rest = s.slice(i);
      const base = { count, reg };
      if (!visual && this.recording && rest === 'q') return Object.assign(base, { type: 'cmd', key: 'q', stop: true });
      let inc = false;
      let m = look(rest, visual ? VCMDS : NCMDS);
      if (m === 'inc') inc = true; else if (m) return Object.assign(base, { type: 'cmd', key: m.key, arg: m.arg });
      m = look(rest, MOTIONS);
      if (m === 'inc') inc = true; else if (m) return Object.assign(base, { type: 'motion', key: m.key, arg: m.arg });
      if (!visual) {
        for (const op of OPS) {
          if (rest.startsWith(op)) {
            let j = op.length, cs2 = '';
            while (j < rest.length && (/[1-9]/.test(rest[j]) || (cs2 && /[0-9]/.test(rest[j])))) cs2 += rest[j++];
            const r2 = rest.slice(j);
            if (!r2) return 'inc';
            const cnt = (count || cs2) ? (count || 1) * (cs2 ? parseInt(cs2, 10) : 1) : 0;
            const ob = Object.assign(base, { count: cnt, type: 'op', op });
            const dbl = op.length === 1 ? op : op[1];
            if (r2 === dbl || r2 === op) return Object.assign(ob, { double: true });
            if (op.length === 2 && op.startsWith(r2)) return 'inc';
            if (r2[0] === 'i' || r2[0] === 'a') {
              if (r2.length < 2) return 'inc';
              if (r2.length === 2) return Object.assign(ob, { obj: r2 });
              return null;
            }
            const mm = look(r2, MOTIONS);
            if (mm === 'inc') return 'inc';
            if (mm) return Object.assign(ob, { key: mm.key, arg: mm.arg });
            return null;
          } else if (op.startsWith(rest)) inc = true;
        }
      }
      return inc ? 'inc' : null;
    }

    /* ---- Normalmodus ---- */
    normalKey(key) {
      if (key === ESC) { this.pending = ''; if (this.ctrlO) { this.ctrlO = false; this.mode = 'insert'; } return; }
      this.pending += key;
      const p = this.parse(this.pending, false);
      if (p === 'inc') return;
      const keys = this.pending;
      this.pending = '';
      if (!p) return this.fail();
      if (this.onCmd || this.shared.onCmd) (this.onCmd || this.shared.onCmd)(p);
      this.keepWant = false;
      this.execNormal(p);
      if (this.mode === 'normal' && !this.ctrlO) {
        this.clampNormal();
        if (!this.keepWant) this.want = this.c;
      }
      if (!this.replayingDot && this.isChange(p)) {
        if (INS[this.mode]) this.dotPending = Array.from(keys);
        else if (!this.failed) this.dot = Array.from(keys);
      }
    }

    isChange(p) {
      if (p.type === 'op') return !['y', 'zf', '!'].includes(p.op);
      if (p.type !== 'cmd') return false;
      return CHANGE_CMDS.has(p.key);
    }

    applyMotion(p) {
      const m = this.motion(p.key, p.arg, p.count, false);
      if (!m) return this.fail();
      if (JUMPS.has(p.key) || m.jump) this.setJump();
      if (m.buf && m.buf !== this.buf) this.setBuffer(m.buf);
      if (m.scroll != null) this.top = m.scroll;
      this.r = m.r; this.c = m.c;
      if (m.type === 'line' && m.keepWant) { const f = this.closedFoldAt(this.r); if (f) this.r = f.s; }
      if (p.key === '$') { this.want = Infinity; this.keepWant = true; if (this.ctrlO) this.c = this.lines[this.r].length; }
      else if (m.keepWant) this.keepWant = true;
      return true;
    }

    execNormal(p) {
      const L = this.lines, n = p.count || 1, r = this.r, c = this.c;
      if (p.arg === ESC) return;
      if (p.type === 'motion') return this.applyMotion(p);
      if (p.type === 'op') return this.execOp(p);
      const len = L[r].length;
      switch (p.key) {
        case 'x': case DEL:
          if (!len) return this.fail();
          return this.applyOp('d', { type: 'char', sr: r, sc: c, er: r, ec: Math.min(len, c + n) }, p.reg);
        case 'X':
          if (c === 0) return this.fail();
          return this.applyOp('d', { type: 'char', sr: r, sc: Math.max(0, c - n), er: r, ec: c }, p.reg);
        case 's':
          if (!len) { this.startInsert('i', 1); return; }
          return this.applyOp('c', { type: 'char', sr: r, sc: c, er: r, ec: Math.min(len, c + n) }, p.reg);
        case 'S':
          return this.applyOp('c', { type: 'line', sr: r, er: Math.min(this.last, r + n - 1) }, p.reg);
        case 'C': case 'D': {
          const er = Math.min(this.last, r + n - 1);
          return this.applyOp(p.key === 'C' ? 'c' : 'd', { type: 'char', sr: r, sc: c, er, ec: L[er].length }, p.reg);
        }
        case 'Y':
          return this.applyOp('y', { type: 'line', sr: r, er: Math.min(this.last, r + n - 1) }, p.reg);
        case 'p': return this.put(false, p.reg, n);
        case 'P': return this.put(true, p.reg, n);
        case 'gp': return this.put(false, p.reg, n, 'after');
        case 'gP': return this.put(true, p.reg, n, 'after');
        case ']p': return this.put(false, p.reg, n, 'indent');
        case '[p': return this.put(true, p.reg, n, 'indent');
        case 'u': for (let i = 0; i < n; i++) if (!this.undo()) break; return;
        case CTRL.r: for (let i = 0; i < n; i++) if (!this.redo()) break; return;
        case 'U': return this.lineUndo();
        case 'g-': return this.travel(this.buf.seq - n);
        case 'g+': return this.travel(this.buf.seq + n);
        case '.': return this.repeatDot(p.count);
        case 'i': return this.startInsert('i', n);
        case 'a': if (len) this.c++; return this.startInsert('a', n);
        case 'I': this.c = this.indentLen(r); return this.startInsert('I', n);
        case 'A': this.c = len; return this.startInsert('A', n);
        case 'o': this.openLine(false); return this.startInsert('o', n);
        case 'O': this.openLine(true); return this.startInsert('O', n);
        case 'gi': {
          const mk = this.marks['^'];
          if (mk) { this.r = Math.min(mk.r, this.last); this.c = mk.c; }
          return this.startInsert('i', n);
        }
        case 'R': this.mode = 'replace'; this.replaceStack = []; this.insertKeys = []; this.insertRepeat = null; return;
        case 'v': return this.startVisual('visual');
        case 'V': return this.startVisual('vline');
        case CTRL.v: return this.startVisual('vblock');
        case 'gv': {
          const lv = this.lastVisual;
          if (!lv) return this.fail();
          this.mode = lv.mode; this.vs = Object.assign({}, lv.vs);
          this.vs.r = Math.min(this.vs.r, this.last);
          this.r = Math.min(lv.ve.r, this.last); this.c = lv.ve.c;
          return;
        }
        case 'J': return this.join(n, true);
        case 'gJ': return this.join(n, false);
        case '~': {
          if (!len) return this.fail();
          const e = Math.min(len, c + n);
          L[r] = L[r].slice(0, c) + caseFn('~')(L[r].slice(c, e)) + L[r].slice(e);
          this.c = Math.min(len - 1, e);
          return;
        }
        case 'r': {
          if (c + n > len) return this.fail();
          if (p.arg === CR) {
            const line = L[r];
            L[r] = line.slice(0, c);
            L.splice(r + 1, 0, line.slice(c + n));
            this.r++; this.c = 0;
            return;
          }
          L[r] = L[r].slice(0, c) + p.arg.repeat(n) + L[r].slice(c + n);
          this.c = c + n - 1;
          return;
        }
        case 'm':
          if (/^[a-z]$/.test(p.arg)) { this.marks[p.arg] = { r, c }; return; }
          if (/^[A-Z]$/.test(p.arg)) { this.shared.gmarks[p.arg] = { buf: this.buf, r, c }; return; }
          if (p.arg === '`' || p.arg === "'") { this.setJump(); return; }
          return this.fail(M('e191'));
        case 'q':
          if (p.stop) {
            this.recBuf.pop();
            const name = this.recording, keys = this.recBuf.slice();
            this.recording = null; this.recBuf = [];
            const lower = name.toLowerCase();
            if (name !== lower && this.regs[lower] && this.regs[lower].keys) {
              const all = this.regs[lower].keys.concat(keys);
              this.regs[lower] = { text: toNotation(all), keys: all, linewise: false };
            } else this.regs[lower] = { text: toNotation(keys), keys, linewise: false };
            return;
          }
          if (!/^[a-zA-Z0-9"]$/.test(p.arg)) return this.fail();
          this.recording = p.arg; this.recBuf = [];
          return;
        case '@': {
          let name = p.arg;
          if (name === '@') name = this.lastMacro;
          if (!name) return this.fail(M('e748'));
          if (name === ':') { if (!this.lastEx) return this.fail(); this.lastMacro = ':'; for (let i = 0; i < n; i++) this.ex(this.lastEx); return; }
          return this.runMacro(name, n);
        }
        case 'zz': this.top = this.rowsAbove(this.displayRow(r), Math.floor((this.o.height - 1) / 2)); return;
        case 'zt': this.top = this.displayRow(r); return;
        case 'zb': this.top = this.rowsAbove(this.displayRow(r), this.o.height - 1); return;
        case 'zF': return this.createFold(r, Math.min(this.last, r + n - 1));
        case 'zo': case 'zO': {
          const fs = this.folds.filter(f => f.closed && r >= f.s && r <= f.e);
          if (!fs.length) return this.fail(M('e490'));
          if (p.key === 'zO') fs.forEach(f => { f.closed = false; });
          else { fs.sort((a, b) => (b.e - b.s) - (a.e - a.s)); for (let i = 0; i < n && i < fs.length; i++) fs[i].closed = false; }
          return;
        }
        case 'zc': case 'zC': {
          const fs = this.folds.filter(f => r >= f.s && r <= f.e);
          if (!fs.length) return this.fail(M('e490'));
          if (p.key === 'zC') fs.forEach(f => { f.closed = true; });
          else {
            const open = fs.filter(f => !f.closed).sort((a, b) => (a.e - a.s) - (b.e - b.s));
            (open[0] || fs[0]).closed = true;
          }
          this.r = this.displayRow(r);
          return;
        }
        case 'za': case 'zA': {
          const closed = this.closedFoldAt(r);
          if (closed) { if (p.key === 'zA') this.folds.filter(f => r >= f.s && r <= f.e).forEach(f => { f.closed = false; }); else closed.closed = false; return; }
          const f = this.foldUnderCursor(true);
          if (!f) return this.fail(M('e490'));
          if (p.key === 'zA') this.folds.filter(x => r >= x.s && r <= x.e).forEach(x => { x.closed = true; }); else f.closed = true;
          this.r = this.displayRow(r);
          return;
        }
        case 'zR': this.folds.forEach(f => { f.closed = false; }); return;
        case 'zM': this.folds.forEach(f => { f.closed = true; }); this.r = this.displayRow(r); return;
        case 'zd': case 'zD': {
          const f = this.closedFoldAt(r) || this.foldUnderCursor(true);
          if (!f) return this.fail(M('e490'));
          if (p.key === 'zD') this.folds = this.folds.filter(x => !(x.s >= f.s && x.e <= f.e));
          else this.folds = this.folds.filter(x => x !== f);
          return;
        }
        case 'zE': this.folds = []; return;
        case 'zj': { const nx = this.folds.filter(f => f.s > r).sort((a, b) => a.s - b.s)[0]; if (!nx) return this.fail(); this.r = nx.s; this.c = 0; return; }
        case 'zk': { const pv = this.folds.filter(f => f.e < r).sort((a, b) => b.e - a.e)[0]; if (!pv) return this.fail(); this.r = pv.e; this.c = 0; return; }
        case 'ZZ': return this.ex('x');
        case 'ZQ': return this.ex('q!');
        case ':': return this.openCmd(':', p.count ? (p.count === 1 ? '.' : '.,.+' + (p.count - 1)) : '');
        case '/': case '?': return this.openCmd(p.key, '');
        case CTRL.a: return this.increment(n);
        case CTRL.x: return this.increment(-n);
        case '&':
          if (!this.lastSub) return this.fail(M('noSub'));
          return this.substitute([r, r], this.lastSub.pat, this.lastSub.rep, '');
        case 'g&':
          if (!this.lastSub) return this.fail(M('noSub'));
          return this.substitute([0, this.last], this.lastSub.pat, this.lastSub.rep, this.lastSub.flags.replace(/c/g, ''));
        case 'ga': {
          const ch = L[r][c];
          if (ch === undefined) return this.msg('NUL');
          return this.msg(M('ga', ch, ch.codePointAt(0)));
        }
        case CTRL.g: return this.msg(M('ctrlg', this.buf.name, this.buf.modified, L.length, Math.round((r + 1) / L.length * 100)));
        case 'g;': case 'g,': {
          const b = this.buf;
          if (!b.changes.length) return this.fail(M('e664'));
          const idx = b.changeIdx + (p.key === 'g;' ? -n : n);
          if (idx < 0) return this.fail(M('e662'));
          if (idx >= b.changes.length) return this.fail(M('e663'));
          b.changeIdx = idx;
          const pos = b.changes[idx];
          this.r = Math.min(pos.r, this.last); this.c = pos.c;
          return;
        }
        case CTRL.o: return this.jumpOlder(n);
        case TAB: return this.jumpNewer(n);
        case CTRL.e: case CTRL.y: {
          const maxTop = Math.max(0, this.last);
          if (p.key === CTRL.e) { for (let i = 0; i < n; i++) { const nx = this.stepLine(this.top, 1); if (nx === null) break; this.top = nx; } }
          else for (let i = 0; i < n; i++) { const pv = this.stepLine(this.top, -1); if (pv === null) break; this.top = pv; }
          this.top = Math.min(this.top, maxTop);
          const rows = this.visibleRows(this.top, this.o.height);
          const first = rows[0].r, lastRow = rows[rows.length - 1];
          const lastR = lastRow.fold ? lastRow.fold.e : lastRow.r;
          if (this.r < first) { this.r = first; this.c = this.colFor(first); }
          else if (this.r > lastR) { this.r = lastRow.r; this.c = this.colFor(lastRow.r); }
          this.keepWant = true;
          return;
        }
        case CTRL.l: return;
        case '\x1e': {
          if (!this.alt || !this.shared.buffers.includes(this.alt)) return this.fail(M('e86', '#'));
          return this.switchTo(this.alt, false);
        }
        case CTRL.w:
          if (!this.ws) return this.msg(M('windows'));
          return this.ws.wincmd(this, p.arg, p.count);
        case 'gt': case 'gT':
          if (!this.ws) return this.msg(M('windows'));
          return this.ws.tabcmd(p.key === 'gt' ? (p.count ? 'goto' : 'next') : 'prev', p.count);
      }
    }

    rowsAbove(r, n) {
      let t = r;
      for (let i = 0; i < n; i++) { const pv = this.stepLine(t, -1); if (pv === null) break; t = pv; }
      return t;
    }

    jumpOlder(n) {
      if (this.jumpIdx >= this.jumps.length) {
        const p = this.pos(), lj = this.jumps[this.jumps.length - 1];
        if (!lj || lj.buf !== p.buf || lj.r !== p.r) { this.jumps.push(p); this.jumpIdx = this.jumps.length - 1; }
        else this.jumpIdx = this.jumps.length - 1;
      }
      const t = this.jumpIdx - n;
      if (t < 0) return this.fail();
      this.jumpIdx = t;
      if (!this.gotoPos(this.jumps[t])) return this.fail();
    }
    jumpNewer(n) {
      const t = this.jumpIdx + n;
      if (t >= this.jumps.length) return this.fail();
      this.jumpIdx = t;
      if (!this.gotoPos(this.jumps[t])) return this.fail();
    }

    /* ---- Bewegungen ---- */
    motion(key, arg, count, op) {
      const L = this.lines, last = this.last, n = count || 1;
      const r = this.r, c = this.c, len = L[r].length;
      switch (key) {
        case 'h': case BS: case LEFT:
          if (c === 0) return null;
          return { r, c: Math.max(0, c - n), type: 'excl' };
        case 'l': case ' ': case RIGHT:
          if (op) { if (!len) return null; return { r, c: Math.min(len, c + n), type: 'excl' }; }
          if (c >= len - 1) return null;
          return { r, c: Math.min(len - 1, c + n), type: 'excl' };
        case 'j': case DOWN: case 'k': case UP: {
          const dir = key === 'j' || key === DOWN ? 1 : -1;
          let nr = r, moved = 0;
          for (let i = 0; i < n; i++) { const s = this.stepLine(nr, dir); if (s === null) break; nr = s; moved++; }
          if (!moved) return null;
          return { r: nr, c: this.colFor(nr), type: 'line', keepWant: true };
        }
        case '+': case CR:
          if (r + n > last) return null;
          return { r: r + n, c: this.fnb(r + n), type: 'line' };
        case '-':
          if (r - n < 0) return null;
          return { r: r - n, c: this.fnb(r - n), type: 'line' };
        case '_': {
          const nr = Math.min(last, r + n - 1);
          return { r: nr, c: this.fnb(nr), type: 'line' };
        }
        case 'w': case 'W': {
          const big = key === 'W';
          let p = { r, c }, prev = p;
          for (let i = 0; i < n; i++) {
            const q = this.nextWordStart(p, big);
            prev = p; p = q;
            if (q.eof) break;
          }
          if (op) {
            if (!p.eof && p.r > prev.r) p = { r: prev.r, c: L[prev.r].length };
            return { r: p.r, c: p.c, type: 'excl' };
          }
          if (p.eof) {
            p = { r: p.r, c: Math.max(0, L[p.r].length - 1) };
            if (p.r === r && p.c === c) return null;
          }
          return { r: p.r, c: p.c, type: 'excl' };
        }
        case 'e': case 'E': {
          let p = { r, c };
          for (let i = 0; i < n; i++) {
            const q = this.wordEnd(p, key === 'E');
            if (!q) { if (i === 0) return null; break; }
            p = q;
          }
          if (p.r === r && p.c === c) return null;
          return { r: p.r, c: p.c, type: 'incl' };
        }
        case 'b': case 'B': {
          let p = { r, c };
          for (let i = 0; i < n; i++) {
            const q = this.wordBack(p, key === 'B');
            if (!q) { if (i === 0) return null; break; }
            p = q;
          }
          return { r: p.r, c: p.c, type: 'excl' };
        }
        case 'ge': case 'gE': {
          let p = { r, c };
          for (let i = 0; i < n; i++) p = this.wordEndBack(p, key === 'gE');
          if (p.r === r && p.c === c) return null;
          return { r: p.r, c: p.c, type: 'incl' };
        }
        case '0': return { r, c: 0, type: 'excl' };
        case '^': return { r, c: this.fnb(r), type: 'excl' };
        case '$': {
          const nr = Math.min(last, r + n - 1);
          if (op) return { r: nr, c: L[nr].length, type: 'excl' };
          return { r: nr, c: Math.max(0, L[nr].length - 1), type: 'incl' };
        }
        case 'g_': {
          const nr = Math.min(last, r + n - 1);
          const m = L[nr].search(/\s*$/);
          return { r: nr, c: Math.max(0, m - 1), type: 'incl' };
        }
        case '|': return { r, c: Math.min(n - 1, Math.max(0, len - 1)), type: 'excl' };
        case 'gg': case 'G': {
          const nr = count ? Math.min(last, count - 1) : (key === 'gg' ? 0 : last);
          return { r: nr, c: this.fnb(nr), type: 'line' };
        }
        case '}': {
          if (r >= last && c >= Math.max(0, len - 1)) return null;
          let rr = r;
          for (let i = 0; i < n; i++) {
            while (rr < last && L[rr].length === 0) rr++;
            while (rr < last && L[rr].length > 0) rr++;
          }
          if (L[rr].length > 0) return { r: rr, c: op ? L[rr].length : Math.max(0, L[rr].length - 1), type: 'excl' };
          return { r: rr, c: 0, type: 'excl' };
        }
        case '{': {
          if (r === 0 && c === 0) return null;
          let rr = r;
          for (let i = 0; i < n; i++) {
            while (rr > 0 && L[rr].length === 0) rr--;
            while (rr > 0 && L[rr].length > 0) rr--;
          }
          return { r: rr, c: 0, type: 'excl' };
        }
        case ')': case '(': {
          const starts = this.sentenceStarts();
          const text = this.lines.join('\n');
          let off = this.offset(r, Math.min(c, len));
          for (let i = 0; i < n; i++) {
            let nx;
            if (key === ')') { nx = starts.find(s => s > off); if (nx === undefined) { if (i === 0 && off >= text.length - 1) return null; nx = Math.max(0, text.length - (op ? 0 : 1)); } }
            else { nx = -1; for (const s of starts) if (s < off) nx = s; if (nx < 0) { if (i === 0 && off === 0) return null; nx = 0; } }
            off = nx;
          }
          const q = this.posAt(off);
          return { r: q.r, c: q.c, type: 'excl' };
        }
        case '[(': case '[{': case '])': case ']}': {
          const open = key[1] === '(' || key[1] === ')' ? '(' : '{', close = open === '(' ? ')' : '}';
          const text = this.lines.join('\n');
          let off = this.offset(r, Math.min(c, len));
          for (let i = 0; i < n; i++) {
            let depth = 0, found = -1;
            if (key[0] === '[') {
              for (let j = off - 1; j >= 0; j--) { if (text[j] === close) depth++; else if (text[j] === open) { if (!depth) { found = j; break; } depth--; } }
            } else {
              for (let j = off + 1; j < text.length; j++) { if (text[j] === open) depth++; else if (text[j] === close) { if (!depth) { found = j; break; } depth--; } }
            }
            if (found < 0) { if (i === 0) return null; break; }
            off = found;
          }
          const q = this.posAt(off);
          return { r: q.r, c: q.c, type: key[0] === ']' ? 'incl' : 'excl' };
        }
        case '[[': case ']]': {
          let rr = r;
          for (let i = 0; i < n; i++) {
            let k = rr + (key === ']]' ? 1 : -1);
            while (k >= 0 && k <= last && L[k][0] !== '{') k += key === ']]' ? 1 : -1;
            if (k < 0) { rr = 0; break; }
            if (k > last) { rr = last; break; }
            rr = k;
          }
          if (rr === r) return null;
          return { r: rr, c: 0, type: op ? 'excl' : 'excl' };
        }
        case '%': {
          if (count) {
            const nr = Math.min(last, Math.max(0, Math.floor((count * L.length + 99) / 100) - 1));
            return { r: nr, c: this.fnb(nr), type: 'line', jump: true };
          }
          const q = this.matchPair();
          if (!q) return null;
          return { r: q.r, c: q.c, type: 'incl' };
        }
        case 'H': case 'M': case 'L': {
          const rows = this.visibleRows(this.top, this.o.height);
          let idx;
          if (key === 'H') idx = Math.min(rows.length - 1, n - 1);
          else if (key === 'L') idx = Math.max(0, rows.length - n);
          else idx = Math.floor((rows.length - 1) / 2);
          const nr = rows[idx].r;
          return { r: nr, c: this.fnb(nr), type: 'line' };
        }
        case CTRL.d: case CTRL.u: case CTRL.f: case CTRL.b: {
          const h = this.o.height;
          const half = key === CTRL.d || key === CTRL.u;
          const amt = half ? Math.max(1, Math.floor(h / 2)) : Math.max(1, h - 2);
          const down = key === CTRL.d || key === CTRL.f;
          if (down ? r >= last : r <= 0) return null;
          const maxTop = Math.max(0, L.length - h);
          const nt = down ? Math.min(maxTop, this.top + amt) : Math.max(0, this.top - amt);
          const nr = down ? Math.min(last, r + amt) : Math.max(0, r - amt);
          return { r: nr, c: this.fnb(nr), type: 'line', scroll: nt };
        }
        case 'f': case 'F': case 't': case 'T': {
          const q = this.findChar(key, arg, n, false);
          this.lastFind = { key, ch: arg };
          return q;
        }
        case ';': case ',': {
          if (!this.lastFind) return null;
          let k = this.lastFind.key;
          if (key === ',') k = { f: 'F', F: 'f', t: 'T', T: 't' }[k];
          return this.findChar(k, this.lastFind.ch, n, true);
        }
        case 'n': case 'N': {
          const ls = this.lastSearch;
          if (!ls) { this.fail(M('noPat')); return null; }
          const dir = ls.dir * (key === 'N' ? -1 : 1);
          const q = this.searchPos(ls.re, dir, n, null, ls.src, ls.off);
          if (!q) return null;
          this.hls = true;
          this.msg((dir > 0 ? '/' : '?') + ls.src, this.message ? this.message.type : 'info');
          return Object.assign(this.applyOffset(q, ls.off), { type: ls.off && /^[+-]?\d/.test(ls.off) ? 'line' : 'excl' });
        }
        case '*': case '#': case 'g*': case 'g#': {
          const w = this.wordAt();
          if (!w) { this.fail(M('e348')); return null; }
          const whole = key.length === 1;
          const src = whole ? '\\<' + w.word + '\\>' : w.word;
          const re = this.compile(src);
          const dir = key.endsWith('*') ? 1 : -1;
          this.lastSearch = { src, re, dir, off: '' };
          this.hls = true;
          this.pushHist('/', src);
          const q = this.searchPos(re, dir, n, { r, c: w.s }, src);
          if (!q) return null;
          if (!this.message || this.message.type !== 'warn') this.msg((dir > 0 ? '/' : '?') + src);
          return { r: q.r, c: q.c, type: 'excl' };
        }
        case 'gd': case 'gD': {
          const w = this.wordAt();
          if (!w) { this.fail(M('e348')); return null; }
          const src = '\\<' + w.word + '\\>';
          const re = this.compile(src);
          this.lastSearch = { src, re, dir: 1, off: '' };
          this.hls = true;
          let startRow = 0;
          if (key === 'gd') {
            const text = this.lines.join('\n'), off = this.offset(r, c);
            let depth = 0, outer = -1;
            for (let j = off - 1; j >= 0; j--) { if (text[j] === '}') depth++; else if (text[j] === '{') { if (!depth) outer = j; else depth--; } }
            if (outer >= 0) startRow = this.posAt(outer).r;
          }
          const ms = this.allMatches(re).filter(m => m.r >= startRow);
          const first = ms[0] || this.allMatches(re)[0];
          if (!first) { this.fail(M('e486', src)); return null; }
          return { r: first.r, c: first.c, type: 'excl' };
        }
        case "'": case '`': {
          const mk = this.getMark(arg);
          if (!mk) { this.fail(M('e20')); return null; }
          if (mk.buf && mk.buf !== this.buf) {
            if (op || !this.shared.buffers.includes(mk.buf)) { this.fail(M('e20')); return null; }
            const mr = Math.min(mk.r, mk.buf.lines.length - 1);
            return { r: mr, c: key === '`' ? mk.c : 0, type: 'excl', buf: mk.buf };
          }
          const mr = Math.min(mk.r, last);
          if (key === "'") return { r: mr, c: this.fnb(mr), type: 'line' };
          return { r: mr, c: Math.min(mk.c, Math.max(0, L[mr].length - (op ? 0 : 1))), type: 'excl' };
        }
      }
      return null;
    }

    getMark(m) {
      if (m === '`' || m === "'") return this.lastJump;
      if (/^[A-Z]$/.test(m)) return this.shared.gmarks[m] || null;
      return this.marks[m] || null;
    }

    sentenceStarts() {
      const text = this.lines.join('\n');
      const starts = new Set();
      const firstNb = text.search(/\S/);
      starts.add(firstNb < 0 ? 0 : firstNb);
      const re = /[.!?][)\]"'’”]*[ \t\n]+/g;
      let m;
      while ((m = re.exec(text))) { const s = m.index + m[0].length; if (s < text.length) starts.add(s); }
      const lineRe = /\n\n+/g;
      while ((m = lineRe.exec(text))) {
        starts.add(m.index + 1);
        const after = m.index + m[0].length;
        if (after < text.length) starts.add(after);
      }
      return Array.from(starts).sort((a, b) => a - b);
    }

    nextWordStart(p, big) {
      const L = this.lines;
      let r = p.r, c = p.c, line = L[r];
      if (line.length > 0 && c < line.length) {
        const k = cls(line[c], big);
        if (k !== 0) while (c < line.length && cls(line[c], big) === k) c++;
      }
      while (true) {
        line = L[r];
        if (c >= line.length) {
          if (r >= L.length - 1) return { r, c: line.length, eof: true };
          r++; c = 0;
          if (L[r].length === 0) return { r, c: 0 };
          continue;
        }
        if (cls(line[c], big) === 0) { c++; continue; }
        return { r, c };
      }
    }

    wordEnd(p, big) {
      const L = this.lines;
      let r = p.r, c = p.c;
      const fwd = () => {
        if (c + 1 < L[r].length) { c++; return true; }
        if (r < L.length - 1) { r++; c = 0; return true; }
        return false;
      };
      if (!fwd()) return null;
      while (L[r].length === 0 || cls(L[r][c], big) === 0) {
        if (!fwd()) return { r, c: Math.max(0, L[r].length - 1) };
      }
      const k = cls(L[r][c], big);
      while (c + 1 < L[r].length && cls(L[r][c + 1], big) === k) c++;
      return { r, c };
    }

    wordBack(p, big) {
      const L = this.lines;
      let r = p.r, c = p.c;
      const back = () => {
        if (c > 0) { c--; return true; }
        if (r > 0) { r--; c = Math.max(0, L[r].length - 1); return true; }
        return false;
      };
      if (!back()) return null;
      while (L[r].length > 0 && cls(L[r][c], big) === 0) { if (!back()) return { r, c }; }
      if (L[r].length === 0) return { r, c: 0 };
      const k = cls(L[r][c], big);
      while (c > 0 && cls(L[r][c - 1], big) === k) c--;
      return { r, c };
    }

    wordEndBack(p, big) {
      const L = this.lines;
      let r = p.r, c = p.c;
      const back = () => {
        if (c > 0) { c--; return true; }
        if (r > 0) { r--; c = Math.max(0, L[r].length - 1); return true; }
        return false;
      };
      const line = L[r];
      if (line.length > 0) {
        const k = cls(line[c], big);
        if (k !== 0) while (c > 0 && cls(line[c - 1], big) === k) c--;
      }
      if (!back()) return { r: 0, c: 0 };
      while (L[r].length > 0 && cls(L[r][c], big) === 0) { if (!back()) return { r: 0, c: 0 }; }
      return { r, c };
    }

    findChar(key, ch, n, repeat) {
      const line = this.lines[this.r], c = this.c;
      if (key === 'f' || key === 't') {
        let pos = c + (repeat && key === 't' ? 1 : 0);
        for (let i = 0; i < n; i++) { pos = line.indexOf(ch, pos + 1); if (pos < 0) return null; }
        return { r: this.r, c: key === 'f' ? pos : pos - 1, type: 'incl' };
      }
      let pos = c - (repeat && key === 'T' ? 1 : 0);
      for (let i = 0; i < n; i++) {
        if (pos - 1 < 0) return null;
        pos = line.lastIndexOf(ch, pos - 1);
        if (pos < 0) return null;
      }
      return { r: this.r, c: key === 'F' ? pos : pos + 1, type: 'excl' };
    }

    matchPair() {
      const L = this.lines, P = '(){}[]';
      const line = L[this.r];
      let c = this.c;
      while (c < line.length && P.indexOf(line[c]) < 0) c++;
      if (c >= line.length) return null;
      const ch = line[c], idx = P.indexOf(ch), open = idx % 2 === 0, mate = P[open ? idx + 1 : idx - 1];
      let depth = 0;
      if (open) {
        for (let rr = this.r; rr < L.length; rr++) {
          const s = L[rr];
          for (let cc = (rr === this.r ? c : 0); cc < s.length; cc++) {
            if (s[cc] === ch) depth++;
            else if (s[cc] === mate) { depth--; if (depth === 0) return { r: rr, c: cc }; }
          }
        }
      } else {
        for (let rr = this.r; rr >= 0; rr--) {
          const s = L[rr];
          for (let cc = (rr === this.r ? c : s.length - 1); cc >= 0; cc--) {
            if (s[cc] === ch) depth++;
            else if (s[cc] === mate) { depth--; if (depth === 0) return { r: rr, c: cc }; }
          }
        }
      }
      return null;
    }

    compile(src) { return compileVim(src, this.o.ignorecase, this.o.smartcase); }

    allMatches(re) {
      const out = [];
      this.lines.forEach((s, r) => {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(s))) {
          out.push({ r, c: m.index, len: m[0].length });
          if (m[0].length === 0) re.lastIndex++;
        }
      });
      return out;
    }

    searchPos(re, dir, n, from, src) {
      from = from || { r: this.r, c: this.c };
      const ms = this.allMatches(re);
      if (!ms.length) { this.fail(M('e486', src || '')); return null; }
      let cur = from, wrapped = false;
      for (let i = 0; i < n; i++) {
        let found = null;
        if (dir > 0) {
          found = ms.find(m => m.r > cur.r || (m.r === cur.r && m.c > cur.c));
          if (!found) { if (!this.o.wrapscan) { this.fail(M('e486', src || '')); return null; } found = ms[0]; wrapped = true; }
        } else {
          for (let k = ms.length - 1; k >= 0; k--) {
            const m = ms[k];
            if (m.r < cur.r || (m.r === cur.r && m.c < cur.c)) { found = m; break; }
          }
          if (!found) { if (!this.o.wrapscan) { this.fail(M('e486', src || '')); return null; } found = ms[ms.length - 1]; wrapped = true; }
        }
        cur = found;
      }
      if (wrapped) this.msg(dir > 0 ? M('wrapBottom') : M('wrapTop'), 'warn');
      return cur;
    }

    applyOffset(q, off) {
      if (!off) return { r: q.r, c: q.c };
      const L = this.lines;
      let m = off.match(/^([esb])([+-]\d*)?$/);
      if (m) {
        const n = m[2] ? (m[2] === '+' ? 1 : m[2] === '-' ? -1 : parseInt(m[2], 10)) : 0;
        let c = (m[1] === 'e' ? q.c + Math.max(0, q.len - 1) : q.c) + n;
        c = Math.max(0, Math.min(c, Math.max(0, L[q.r].length - 1)));
        return { r: q.r, c };
      }
      m = off.match(/^([+-]?)(\d*)$/);
      if (m) {
        const n = (m[1] === '-' ? -1 : 1) * (m[2] ? parseInt(m[2], 10) : (m[1] ? 1 : 0));
        const r = Math.max(0, Math.min(this.last, q.r + n));
        return { r, c: this.fnb(r) };
      }
      return { r: q.r, c: q.c };
    }

    wordAt(big) {
      const line = this.lines[this.r];
      const isW = ch => big ? (ch !== undefined && ch !== ' ') : WORD_RE.test(ch);
      let c = this.c;
      while (c < line.length && !isW(line[c])) c++;
      if (c >= line.length) return null;
      let s = c, e = c;
      while (s > 0 && isW(line[s - 1])) s--;
      while (e + 1 < line.length && isW(line[e + 1])) e++;
      return { word: line.slice(s, e + 1), s };
    }

    /* ---- Operatoren ---- */
    execOp(p) {
      const op = p.op, L = this.lines;
      let rg;
      if (p.double) {
        const n = p.count || 1;
        if (this.r + n - 1 > this.last && n > 1 && this.r === this.last) return this.fail();
        let er = this.r;
        for (let k = 1; k < n; k++) { const nx = this.stepLine(er, 1); if (nx === null) break; er = nx; }
        rg = { type: 'line', sr: this.r, er: Math.min(this.last, er) };
      } else if (p.obj) {
        rg = this.textObject(p.obj, p.count || 1);
        if (!rg) return this.fail();
      } else {
        if (p.arg === ESC) return;
        let key = p.key;
        if (op === 'c' && (key === 'w' || key === 'W')) {
          const line = L[this.r], ch = line[this.c];
          if (ch !== undefined && ch !== ' ') {
            const big = key === 'W';
            const k = cls(ch, big);
            if ((p.count || 1) === 1 && cls(line[this.c + 1], big) !== k) {
              rg = { type: 'char', sr: this.r, sc: this.c, er: this.r, ec: this.c + 1 };
            } else key = big ? 'E' : 'e';
          }
        }
        if (!rg) {
          const m = this.motion(key, p.arg, p.count, true);
          if (!m) return this.fail();
          if (m.type === 'line') {
            rg = { type: 'line', sr: Math.min(this.r, m.r), er: Math.max(this.r, m.r) };
          } else {
            let s = { r: this.r, c: this.c }, e = { r: m.r, c: m.c };
            if (cmp(e, s) < 0) { const t = s; s = e; e = t; }
            if (m.type === 'incl') e.c += 1;
            else if (e.c === 0 && e.r > s.r) {
              if (s.c <= this.indentLen(s.r)) rg = { type: 'line', sr: s.r, er: e.r - 1 };
              else e = { r: e.r - 1, c: L[e.r - 1].length };
            }
            if (!rg) rg = { type: 'char', sr: s.r, sc: s.c, er: e.r, ec: Math.min(e.c, L[e.r].length) };
          }
        }
      }
      if (rg.type === 'line') {
        const fs = this.closedFoldAt(rg.sr), fe = this.closedFoldAt(rg.er);
        if (fs) rg.sr = fs.s;
        if (fe) rg.er = fe.e;
      }
      this.applyOp(op, rg, p.reg);
    }

    textObject(obj, count) {
      const around = obj[0] === 'a', ch = obj[1];
      switch (ch) {
        case 'w': return this.wordObj(false, around);
        case 'W': return this.wordObj(true, around);
        case 's': return this.sentenceObj(around);
        case 'p': return this.paraObj(around);
        case '"': case "'": case '`': return this.quoteObj(ch, around);
        case '(': case ')': case 'b': return this.bracketObj('(', ')', around, count);
        case '{': case '}': case 'B': return this.bracketObj('{', '}', around, count);
        case '[': case ']': return this.bracketObj('[', ']', around, count);
        case '<': case '>': return this.bracketObj('<', '>', around, count);
        case 't': return this.tagObj(around);
      }
      return null;
    }

    wordObj(big, around) {
      const line = this.lines[this.r];
      if (!line.length) return null;
      const c = Math.min(this.c, line.length - 1);
      const k = cls(line[c], big);
      let s = c, e = c;
      while (s > 0 && cls(line[s - 1], big) === k) s--;
      while (e + 1 < line.length && cls(line[e + 1], big) === k) e++;
      if (around) {
        if (k !== 0) {
          let e2 = e;
          while (e2 + 1 < line.length && cls(line[e2 + 1], big) === 0) e2++;
          if (e2 > e) e = e2;
          else while (s > 0 && cls(line[s - 1], big) === 0) s--;
        } else if (e + 1 < line.length) {
          const k2 = cls(line[e + 1], big);
          e++;
          while (e + 1 < line.length && cls(line[e + 1], big) === k2) e++;
        }
      }
      return { type: 'char', sr: this.r, sc: s, er: this.r, ec: e + 1 };
    }

    sentenceObj(around) {
      const text = this.lines.join('\n');
      const off = this.offset(this.r, Math.min(this.c, this.lines[this.r].length));
      const starts = this.sentenceStarts();
      let s = 0;
      for (const x of starts) if (x <= off) s = x;
      let e = starts.find(x => x > off);
      if (e === undefined) e = text.length;
      let ie = e;
      while (ie > s && /\s/.test(text[ie - 1])) ie--;
      if (!around) return this.charRange(s, ie);
      let ae = e;
      if (text.slice(ie, ae).includes('\n')) ae = ie + (text.slice(ie).match(/^[ \t]*/)[0].length);
      return this.charRange(s, ae);
    }

    paraObj(around) {
      const L = this.lines, last = this.last;
      const blank = r => /^\s*$/.test(L[r]);
      const b = blank(this.r);
      let s = this.r, e = this.r;
      while (s > 0 && blank(s - 1) === b) s--;
      while (e < last && blank(e + 1) === b) e++;
      if (around) {
        if (e < last) {
          const b2 = blank(e + 1);
          e++;
          while (e < last && blank(e + 1) === b2) e++;
        } else if (!b) {
          while (s > 0 && blank(s - 1)) s--;
        }
      }
      return { type: 'line', sr: s, er: e };
    }

    quoteObj(q, around) {
      const line = this.lines[this.r], c = this.c;
      const idx = [];
      for (let i = 0; i < line.length; i++) if (line[i] === q && line[i - 1] !== '\\') idx.push(i);
      let a = -1, b = -1;
      const k = idx.indexOf(c);
      if (k >= 0) {
        if (k % 2 === 0) { a = idx[k]; b = idx[k + 1] === undefined ? -1 : idx[k + 1]; }
        else { a = idx[k - 1]; b = idx[k]; }
      } else {
        for (let i = 0; i + 1 < idx.length; i += 2) if (idx[i] < c && c < idx[i + 1]) { a = idx[i]; b = idx[i + 1]; break; }
        if (a < 0) {
          const j = idx.findIndex(x => x > c);
          if (j >= 0 && j + 1 < idx.length) { a = idx[j]; b = idx[j + 1]; }
        }
      }
      if (a < 0 || b < 0) return null;
      if (!around) return { type: 'char', sr: this.r, sc: a + 1, er: this.r, ec: b };
      let s = a, e = b + 1;
      if (e < line.length && line[e] === ' ') { while (e < line.length && line[e] === ' ') e++; }
      else while (s > 0 && line[s - 1] === ' ') s--;
      return { type: 'char', sr: this.r, sc: s, er: this.r, ec: e };
    }

    offset(r, c) { let o = 0; for (let i = 0; i < r; i++) o += this.lines[i].length + 1; return o + c; }
    posAt(o) {
      let r = 0;
      while (r < this.lines.length - 1 && o > this.lines[r].length) { o -= this.lines[r].length + 1; r++; }
      return { r, c: Math.min(o, this.lines[r].length) };
    }
    charRange(a, b) {
      const s = this.posAt(a), e = this.posAt(b);
      return { type: 'char', sr: s.r, sc: s.c, er: e.r, ec: e.c };
    }

    bracketObj(open, close, around, count) {
      const text = this.lines.join('\n');
      const off = this.offset(this.r, Math.min(this.c, this.lines[this.r].length));
      const findOpen = from => {
        let depth = 0;
        for (let i = from; i >= 0; i--) {
          if (text[i] === close) depth++;
          else if (text[i] === open) { if (depth === 0) return i; depth--; }
        }
        return -1;
      };
      let s;
      if (text[off] === open) s = off;
      else s = findOpen(off - 1);
      for (let k = 1; k < (count || 1) && s >= 0; k++) s = findOpen(s - 1);
      if (s < 0) return null;
      let depth = 0, e = -1;
      for (let i = s; i < text.length; i++) {
        if (text[i] === open) depth++;
        else if (text[i] === close) { depth--; if (depth === 0) { e = i; break; } }
      }
      if (e < 0) return null;
      if (around) return this.charRange(s, e + 1);
      let is = s + 1;
      const ie = e;
      if (text[is] === '\n') {
        const closeLineStart = text.lastIndexOf('\n', ie - 1) + 1;
        if (/^\s*$/.test(text.slice(closeLineStart, ie))) {
          const sp = this.posAt(is), ep = this.posAt(ie);
          const sr = sp.r + 1, er = ep.r - 1;
          if (er < sr) return { type: 'char', sr: sp.r, sc: sp.c, er: sp.r, ec: sp.c };
          return { type: 'line', sr, er };
        }
        is++;
      }
      return this.charRange(is, ie);
    }

    tagObj(around) {
      const text = this.lines.join('\n');
      const off = this.offset(this.r, this.c);
      const re = /<(\/?)([A-Za-z][\w:-]*)[^>]*?(\/?)>/g;
      const stack = [], pairs = [];
      let m;
      while ((m = re.exec(text))) {
        if (m[3] === '/') continue;
        if (!m[1]) stack.push({ name: m[2], s: m.index, e: m.index + m[0].length });
        else {
          for (let k = stack.length - 1; k >= 0; k--) {
            if (stack[k].name === m[2]) {
              const o = stack[k];
              stack.length = k;
              pairs.push({ os: o.s, oe: o.e, cs: m.index, ce: m.index + m[0].length });
              break;
            }
          }
        }
      }
      let best = null;
      for (const p of pairs) if (p.os <= off && off < p.ce && (!best || p.os > best.os)) best = p;
      if (!best) return null;
      return around ? this.charRange(best.os, best.ce) : this.charRange(best.oe, best.cs);
    }

    getText(sr, sc, er, ec) {
      const L = this.lines;
      if (sr === er) return L[sr].slice(sc, ec);
      let t = L[sr].slice(sc);
      for (let r = sr + 1; r < er; r++) t += '\n' + L[r];
      return t + '\n' + L[er].slice(0, ec);
    }
    delText(sr, sc, er, ec) {
      const L = this.lines;
      L[sr] = L[sr].slice(0, sc) + L[er].slice(ec);
      L.splice(sr + 1, er - sr);
    }
    insText(r, c, text) {
      const L = this.lines, parts = text.split('\n'), line = L[r];
      const before = line.slice(0, c), after = line.slice(c);
      if (parts.length === 1) { L[r] = before + text + after; return { r, c: c + text.length }; }
      const nl = [before + parts[0]].concat(parts.slice(1, -1), [parts[parts.length - 1] + after]);
      L.splice(r, 1, ...nl);
      return { r: r + parts.length - 1, c: parts[parts.length - 1].length };
    }

    setReg(name, text, linewise, kind, block) {
      if (name === '_') return;
      const val = { text, linewise: !!linewise, block: !!block };
      if (name && /^[A-Z]$/.test(name)) {
        const l = name.toLowerCase(), old = this.regs[l];
        if (old) {
          val.linewise = old.linewise || !!linewise;
          val.text = val.linewise ? old.text + '\n' + text : old.text + text;
        }
        name = l;
      }
      if (name === '+' || name === '*') { if (this.shared.onClipboard) this.shared.onClipboard(text); }
      if (name && name !== '"') { this.regs[name] = val; this.regs['"'] = val; return; }
      this.regs['"'] = val;
      if (kind === 'y') this.regs['0'] = val;
      else if (kind === 'd') {
        if (linewise || text.includes('\n')) {
          for (let i = 9; i > 1; i--) if (this.regs[String(i - 1)]) this.regs[String(i)] = this.regs[String(i - 1)];
          this.regs['1'] = val;
        } else this.regs['-'] = val;
      }
    }
    getReg(name) {
      if (!name || name === '"') return this.regs['"'];
      if (name === ':') return this.lastEx ? { text: this.lastEx } : null;
      if (name === '/') return this.lastSearch ? { text: this.lastSearch.src } : null;
      if (name === '.') return this.shared.lastInserted != null ? { text: this.shared.lastInserted } : null;
      if (name === '%') return { text: this.buf.name };
      if (name === '#') return this.alt ? { text: this.alt.name } : null;
      return this.regs[name.toLowerCase()];
    }

    shift(sr, er, dir, times) {
      const sw = this.o.shiftwidth * (times || 1);
      for (let r = sr; r <= er; r++) {
        const line = this.lines[r];
        if (dir === '>') { if (line.length) this.lines[r] = ' '.repeat(sw) + line; }
        else { const m = line.match(/^ */)[0].length; this.lines[r] = line.slice(Math.min(m, sw)); }
      }
    }

    formatLines(sr, er) {
      const L = this.lines, tw = this.o.textwidth || 79;
      const out = [];
      let r = sr;
      while (r <= er) {
        if (!L[r].trim()) { out.push(''); r++; continue; }
        const indent = L[r].match(/^\s*/)[0];
        const words = [];
        while (r <= er && L[r].trim()) { words.push(...L[r].trim().split(/\s+/)); r++; }
        let line = indent;
        for (const w of words) {
          if (line.trim() && (line + ' ' + w).length > tw) { out.push(line); line = indent + w; }
          else line = line.trim() ? line + ' ' + w : indent + w;
        }
        out.push(line);
      }
      L.splice(sr, er - sr + 1, ...out);
      return sr + out.length - 1;
    }

    indentLines(sr, er) {
      const L = this.lines, sw = this.o.shiftwidth;
      const opens = s => (s.replace(/(["'`]).*?\1/g, '').match(/[{([]/g) || []).length;
      const closes = s => (s.replace(/(["'`]).*?\1/g, '').match(/[})\]]/g) || []).length;
      let depth = 0;
      for (let r = 0; r < sr; r++) depth += opens(L[r]) - closes(L[r]);
      depth = Math.max(0, depth);
      for (let r = sr; r <= er; r++) {
        const tr = L[r].trim();
        if (!tr) { L[r] = ''; continue; }
        const lead = (tr.match(/^[})\]]+/) || [''])[0].length;
        const d = Math.max(0, depth - lead);
        L[r] = ' '.repeat(d * sw) + tr;
        depth = Math.max(0, depth + opens(tr) - closes(tr));
      }
    }

    createFold(sr, er) {
      if (er < sr) return this.fail();
      this.folds.push({ s: sr, e: er, closed: true });
      this.r = sr; this.c = this.fnb(sr);
    }

    applyOp(op, rg, reg) {
      const L = this.lines;
      if (rg.type === 'block') return this.applyBlockOp(op, rg, reg);
      if (rg.type !== 'line' && ['gq', 'gw', '=', '!', 'zf'].includes(op)) rg = { type: 'line', sr: rg.sr, er: rg.er };
      if (rg.type === 'line') {
        const { sr, er } = rg, cnt = er - sr + 1;
        const text = L.slice(sr, er + 1).join('\n');
        this.marks['['] = { r: sr, c: 0 }; this.marks[']'] = { r: er, c: 0 };
        switch (op) {
          case 'y':
            this.setReg(reg, text, true, 'y');
            this.r = sr; this.clampNormal();
            if (cnt > 2) this.msg(M('yanked', cnt));
            return;
          case 'd':
            this.setReg(reg, text, true, 'd');
            L.splice(sr, cnt);
            if (!L.length) L.push('');
            this.r = Math.min(sr, L.length - 1); this.c = this.fnb(this.r);
            if (cnt > 2) this.msg(M('fewer', cnt));
            return;
          case 'c': {
            this.setReg(reg, text, true, 'd');
            const ind = this.o.autoindent ? L[sr].match(/^\s*/)[0] : '';
            L.splice(sr, cnt, ind);
            this.r = sr; this.c = ind.length;
            this.startInsert('c', 1);
            this.autoIndentRow = ind ? sr : null;
            return;
          }
          case '>': case '<':
            this.shift(sr, er, op, 1);
            this.r = sr; this.c = this.fnb(sr);
            if (cnt > 2) this.msg(M('shifted', cnt, op));
            return;
          case 'gq': case 'gw': {
            const pos = { r: this.r, c: this.c };
            const lastRow = this.formatLines(sr, er);
            if (op === 'gw') { this.r = Math.min(pos.r, this.last); this.c = pos.c; this.clampNormal(); }
            else { this.r = lastRow; this.c = this.fnb(lastRow); }
            return;
          }
          case '=':
            this.indentLines(sr, er);
            this.r = sr; this.c = this.fnb(sr);
            if (cnt > 2) this.msg(M('shifted', cnt, '='));
            return;
          case '!':
            this.r = sr;
            return this.openCmd(':', (cnt === 1 ? '.' : '.,.+' + (cnt - 1)) + '!');
          case 'zf':
            return this.createFold(sr, er);
          default:
            for (let r = sr; r <= er; r++) L[r] = caseFn(op)(L[r]);
            this.r = sr; this.clampNormal();
            return;
        }
      }
      const { sr, sc, er, ec } = rg;
      const text = this.getText(sr, sc, er, ec);
      this.marks['['] = { r: sr, c: sc }; this.marks[']'] = { r: er, c: Math.max(0, ec - 1) };
      switch (op) {
        case 'y': this.setReg(reg, text, false, 'y'); this.r = sr; this.c = sc; this.clampNormal(); return;
        case 'd': this.setReg(reg, text, false, 'd'); this.delText(sr, sc, er, ec); this.r = sr; this.c = sc; this.clampNormal(); return;
        case 'c': this.setReg(reg, text, false, 'd'); this.delText(sr, sc, er, ec); this.r = sr; this.c = sc; this.startInsert('c', 1); return;
        case '>': case '<': this.shift(sr, er, op, 1); this.r = sr; this.c = this.fnb(sr); return;
        default: {
          const t = caseFn(op)(text);
          this.delText(sr, sc, er, ec); this.insText(sr, sc, t);
          this.r = sr; this.c = sc; this.clampNormal();
        }
      }
    }

    applyBlockOp(op, rg, reg) {
      const L = this.lines, parts = [];
      const ecOf = line => rg.toEnd ? line.length : Math.min(rg.ec, line.length);
      for (let r = rg.sr; r <= rg.er; r++) parts.push(L[r].slice(rg.sc, ecOf(L[r])));
      const text = parts.join('\n');
      if (op === 'y') { this.setReg(reg, text, false, 'y', true); this.r = rg.sr; this.c = rg.sc; this.clampNormal(); return; }
      if (op === 'd' || op === 'c') {
        this.setReg(reg, text, false, 'd', true);
        for (let r = rg.sr; r <= rg.er; r++) {
          const line = L[r];
          if (line.length > rg.sc) L[r] = line.slice(0, rg.sc) + line.slice(ecOf(line));
        }
        this.r = rg.sr; this.c = rg.sc;
        if (op === 'c') {
          if (L[rg.sr].length < rg.sc) L[rg.sr] += ' '.repeat(rg.sc - L[rg.sr].length);
          this.blockInsert = { sr: rg.sr, er: rg.er, col: rg.sc, before: L[rg.sr].length, append: false };
          this.startInsert('c', 1);
        } else this.clampNormal();
        return;
      }
      if (['>', '<', 'gq', 'gw', '=', '!', 'zf'].includes(op)) return this.applyOp(op, { type: 'line', sr: rg.sr, er: rg.er }, reg);
      for (let r = rg.sr; r <= rg.er; r++) {
        const line = L[r];
        const e = ecOf(line);
        if (line.length > rg.sc) L[r] = line.slice(0, rg.sc) + caseFn(op)(line.slice(rg.sc, e)) + line.slice(e);
      }
      this.r = rg.sr; this.c = rg.sc; this.clampNormal();
    }

    put(before, reg, n, variant) {
      const R = this.getReg(reg);
      if (!R || R.text == null) return this.fail(M('e353', reg || '"'));
      const L = this.lines;
      if (R.block) {
        const parts = R.text.split('\n');
        const col = before ? this.c : Math.min(this.c + 1, L[this.r].length);
        for (let i = 0; i < parts.length; i++) {
          const rr = this.r + i;
          if (rr >= L.length) L.push('');
          let line = L[rr];
          if (line.length < col) line += ' '.repeat(col - line.length);
          L[rr] = line.slice(0, col) + parts[i].repeat(n) + line.slice(col);
        }
        this.c = col;
        return;
      }
      if (R.linewise) {
        let block = [];
        let parts = R.text.split('\n');
        if (variant === 'indent') {
          const cur = this.indentLen(this.r), first = parts.find(x => x.trim());
          const delta = cur - (first ? first.match(/^\s*/)[0].length : 0);
          parts = parts.map(x => !x.trim() ? x : delta >= 0 ? ' '.repeat(delta) + x : x.slice(Math.min(-delta, x.match(/^\s*/)[0].length)));
        }
        for (let i = 0; i < n; i++) block = block.concat(parts);
        const at = before ? this.r : this.r + 1;
        L.splice(at, 0, ...block);
        this.marks['['] = { r: at, c: 0 }; this.marks[']'] = { r: at + block.length - 1, c: 0 };
        if (variant === 'after') { this.r = Math.min(at + block.length, this.last); this.c = 0; }
        else { this.r = at; this.c = this.fnb(at); }
        if (block.length > 2) this.msg(M('more', block.length));
        return;
      }
      const text = R.text.repeat(n);
      const col = before ? this.c : (L[this.r].length ? this.c + 1 : 0);
      const end = this.insText(this.r, col, text);
      this.marks['['] = { r: this.r, c: col }; this.marks[']'] = { r: end.r, c: Math.max(0, end.c - 1) };
      if (variant === 'after') { this.r = end.r; this.c = end.c; this.keepPastEnd = true; }
      else if (text.includes('\n')) this.c = col;
      else this.c = Math.max(0, end.c - 1);
    }

    undo() {
      const b = this.buf, s = b.undoStack.pop();
      if (!s) { this.msg(M('oldest'), 'warn'); this.failed = true; return false; }
      b.redoStack.push(Object.assign(this.snap(), { seq: b.seq }));
      this.lines = s.lines; this.r = s.r; this.c = s.c;
      b.seq = s.seq || 0;
      this.clampNormal();
      this.skipUndo = true;
      return true;
    }
    redo() {
      const b = this.buf, s = b.redoStack.pop();
      if (!s) { this.msg(M('newest'), 'warn'); this.failed = true; return false; }
      b.undoStack.push(Object.assign(this.snap(), { seq: b.seq }));
      this.lines = s.lines; this.r = s.r; this.c = s.c;
      b.seq = s.seq || 0;
      this.clampNormal();
      this.skipUndo = true;
      return true;
    }
    travel(target) {
      const b = this.buf;
      if (target < 0) { this.msg(M('oldest'), 'warn'); this.failed = true; return; }
      if (target > b.seqLast) { this.msg(M('newest'), 'warn'); this.failed = true; return; }
      const st = b.states[target];
      if (!st) return this.fail();
      b.undoStack = [];
      for (let i = 0; i < target; i++) if (b.states[i]) b.undoStack.push({ lines: b.states[i].lines.slice(), r: b.states[i].r, c: b.states[i].c, seq: i });
      b.redoStack = [];
      this.lines = st.lines.slice(); this.r = st.r; this.c = st.c;
      b.seq = target;
      this.clampNormal();
      this.skipUndo = true;
      this.msg(M('state', target));
    }
    timeTarget(arg, dir) {
      const b = this.buf;
      const m = String(arg || '1').trim().match(/^(\d*)([smhd]?)$/);
      if (!m) return null;
      const n = m[1] ? parseInt(m[1], 10) : 1;
      if (!m[2]) return dir < 0 ? Math.max(0, b.seq - n) : Math.min(b.seqLast, b.seq + n);
      const ms = n * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
      const now = b.states[b.seq] ? b.states[b.seq].t : Date.now();
      const goal = now + dir * ms;
      let best = dir < 0 ? 0 : b.seqLast;
      for (let i = 0; i <= b.seqLast; i++) {
        const s = b.states[i];
        if (!s) continue;
        if (dir < 0 && s.t <= goal) best = i;
        if (dir > 0 && s.t <= goal) best = i;
      }
      return best;
    }
    lineUndo() {
      const u = this.buf.uLine;
      if (!u || u.r > this.last) return this.fail();
      const cur = this.lines[u.r];
      this.lines[u.r] = u.text;
      u.text = cur;
      this.r = u.r; this.c = 0;
    }

    repeatDot(count) {
      if (!this.dot) return this.fail();
      let keys = this.dot.join('');
      if (count) {
        const m = keys.match(/^("[\s\S])?([1-9][0-9]*)?([\s\S]*)$/);
        keys = (m[1] || '') + count + m[3];
      }
      this.replayingDot = true;
      for (const k of keys) { this.dispatch(k); if (this.failed) break; }
      if (INS[this.mode]) this.dispatch(ESC);
      this.replayingDot = false;
      if (count) this.dot = Array.from(keys);
    }

    runMacro(name, n) {
      const R = this.getReg(name);
      if (!R) return this.fail(M('regEmpty', name));
      const keys = R.keys ? R.keys : parseNotation(R.text + (R.linewise ? '\n' : ''), this.shared.leader);
      this.lastMacro = name;
      if (this.macroDepth > 1000) return this.fail();
      this.macroDepth++;
      outer: for (let i = 0; i < n; i++) {
        for (const k of keys) { this.feedKey(k, 0); if (this.failed) break outer; }
      }
      this.macroDepth--;
    }

    join(n, spaces) {
      const L = this.lines, cnt = Math.max(2, n);
      if (this.r >= this.last) return this.fail();
      const end = Math.min(this.last, this.r + cnt - 1);
      let line = L[this.r], pos = 0;
      for (let k = this.r + 1; k <= end; k++) {
        let nx = L[k];
        if (spaces) {
          nx = nx.replace(/^\s+/, '');
          if (nx.length && line.length && !/\s$/.test(line) && nx[0] !== ')') { pos = line.length; line += ' ' + nx; }
          else { pos = Math.max(0, line.length - (nx.length ? 0 : 1)); line += nx; }
        } else { pos = line.length; line += nx; }
      }
      L.splice(this.r, end - this.r + 1, line);
      this.c = pos;
    }

    increment(delta) {
      const c = this.incLine(this.r, this.c, delta);
      if (c < 0) return this.fail();
      this.c = c;
    }
    incLine(r, from, delta) {
      const line = this.lines[r];
      const re = /-?\d+/g;
      let m;
      while ((m = re.exec(line))) {
        let s = m.index, str = m[0];
        if (str[0] === '-' && s > 0 && WORD_RE.test(line[s - 1])) { s++; str = str.slice(1); }
        const e = s + str.length;
        if (e - 1 < from) continue;
        const v = parseInt(str, 10) + delta;
        let out = String(Math.abs(v));
        const digits = str.replace('-', '');
        if (/^0\d/.test(digits) && out.length < digits.length) out = out.padStart(digits.length, '0');
        if (v < 0) out = '-' + out;
        this.lines[r] = line.slice(0, s) + out + line.slice(e);
        return s + out.length - 1;
      }
      return -1;
    }

    /* ---- Einfügen & Ersetzen ---- */
    startInsert(kind, count) {
      this.mode = 'insert';
      this.insertKeys = [];
      this.insertedText = '';
      this.insertRepeat = { kind, count: count || 1 };
      this.compl = null;
      this.clampInsert();
    }
    openLine(above) {
      const L = this.lines;
      const ind = this.o.autoindent ? L[this.r].match(/^\s*/)[0] : '';
      if (above) L.splice(this.r, 0, ind);
      else { L.splice(this.r + 1, 0, ind); this.r++; }
      this.c = ind.length;
      this.autoIndentRow = ind ? this.r : null;
    }

    expandAbbrev() {
      const tbl = this.shared.abbr;
      if (!tbl || !Object.keys(tbl).length) return;
      const line = this.lines[this.r];
      let s = this.c;
      while (s > 0 && WORD_RE.test(line[s - 1])) s--;
      if (s === this.c) return;
      const word = line.slice(s, this.c);
      const rep = tbl[word];
      if (rep == null) return;
      this.lines[this.r] = line.slice(0, s) + rep + line.slice(this.c);
      this.c = s + rep.length;
    }

    insChar(ch) {
      const L = this.lines, line = L[this.r];
      L[this.r] = line.slice(0, this.c) + ch + line.slice(this.c);
      this.c += ch.length;
      this.insertedText += ch;
      this.autoIndentRow = null;
    }

    completeWords(prefix, dir) {
      const seen = new Set([prefix]), out = [];
      const re = /[\p{L}\p{N}_]+/gu;
      const order = [];
      const cur = this.lines;
      const rows = [];
      if (dir > 0) { for (let r = this.r; r < cur.length; r++) rows.push(r); for (let r = 0; r < this.r; r++) rows.push(r); }
      else { for (let r = this.r; r >= 0; r--) rows.push(r); for (let r = cur.length - 1; r > this.r; r--) rows.push(r); }
      for (const r of rows) {
        const words = cur[r].match(re) || [];
        const list = dir > 0 ? words : words.slice().reverse();
        for (const w of list) order.push(w);
      }
      for (const b of this.shared.buffers) if (b !== this.buf) for (const l of b.lines) for (const w of (l.match(re) || [])) order.push(w);
      for (const w of order) if (w.startsWith(prefix) && !seen.has(w)) { seen.add(w); out.push(w); }
      return out;
    }

    completeLines(prefix) {
      const p = prefix.trim(), seen = new Set(), out = [];
      const cands = this.lines.filter((l, i) => i !== this.r).concat(...this.shared.buffers.filter(b => b !== this.buf).map(b => b.lines));
      for (const l of cands) { const t = l.trim(); if (t && t.startsWith(p) && t !== p && !seen.has(t)) { seen.add(t); out.push(t); } }
      return out;
    }

    doComplete(dir, lineMode) {
      const L = this.lines;
      if (this.compl && this.compl.r === this.r) {
        const cp = this.compl;
        const step = dir === cp.dir ? 1 : -1;
        cp.idx = (cp.idx + step + cp.list.length + 1) % (cp.list.length + 1);
      } else {
        const line = L[this.r];
        let s = this.c;
        if (lineMode) s = this.indentLen(this.r);
        else while (s > 0 && WORD_RE.test(line[s - 1])) s--;
        const prefix = line.slice(s, this.c);
        const list = lineMode ? this.completeLines(prefix) : this.completeWords(prefix, dir);
        if (!list.length) { this.msg(M('complNone'), 'error'); this.compl = null; return; }
        this.compl = { r: this.r, s, prefix, list, idx: 0, dir, cur: prefix, line: lineMode };
      }
      const cp = this.compl;
      const word = cp.idx >= cp.list.length ? cp.prefix : cp.list[cp.idx];
      const line = L[this.r];
      L[this.r] = line.slice(0, cp.s) + word + line.slice(cp.s + cp.cur.length);
      this.c = cp.s + word.length;
      cp.cur = word;
      if (cp.idx < cp.list.length) this.msg(cp.line ? M('complLine', cp.idx + 1, cp.list.length) : M('compl', cp.idx + 1, cp.list.length));
      else this.msg(M('complNone'));
    }

    insertKey(key) {
      const L = this.lines;
      const complKey = key === CTRL.n || key === CTRL.p || (this.ctrlX && key === CTRL.l);
      if (!complKey && !this.ctrlX) this.compl = null;
      if (this.insertRegPending) {
        this.insertRegPending = false;
        if (key === ESC) return;
        if (key === '=') { this.openCmd('=', ''); return; }
        const R = this.getReg(key);
        if (!R) return;
        const t = R.text + (R.linewise ? '\n' : '');
        const end = this.insText(this.r, this.c, t);
        this.r = end.r; this.c = end.c; this.autoIndentRow = null; this.insertedText += t;
        return;
      }
      if (this.digraph !== null) {
        if (key === ESC) { this.digraph = null; return; }
        if (!isPrintable(key)) { this.digraph = null; return; }
        if (this.digraph === '') { this.digraph = key; return; }
        const pair = this.digraph + key;
        this.digraph = null;
        this.insChar(DIGRAPHS[pair] || DIGRAPHS[pair[1] + pair[0]] || key);
        return;
      }
      if (this.literal !== null) {
        if (this.literal === '' && key !== 'u' && !/\d/.test(key)) { this.literal = null; if (key === TAB) this.insChar('    '); else if (isPrintable(key)) this.insChar(key); return; }
        this.literal += key;
        const lt = this.literal;
        if ((lt[0] === 'u' && lt.length === 5) || (/^\d{3}$/.test(lt))) {
          this.literal = null;
          const code = lt[0] === 'u' ? parseInt(lt.slice(1), 16) : parseInt(lt, 10);
          if (code > 0) this.insChar(String.fromCodePoint(code));
        } else if (lt[0] === 'u' && !/^u[0-9a-fA-F]*$/.test(lt)) this.literal = null;
        return;
      }
      if (this.ctrlX) {
        this.ctrlX = false;
        if (key === CTRL.l) return this.doComplete(1, true);
        if (key === CTRL.n || key === CTRL.p) return this.doComplete(key === CTRL.n ? 1 : -1, false);
      }
      if (key === ESC) { this.expandAbbrev(); return this.finishInsert(); }
      const line = L[this.r];
      switch (key) {
        case CR: case '\n': case CTRL.j: {
          this.expandAbbrev();
          const ln = L[this.r];
          const before = ln.slice(0, this.c), after = ln.slice(this.c);
          const ind = this.o.autoindent ? before.match(/^\s*/)[0] : '';
          L[this.r] = /^\s+$/.test(before) ? '' : before;
          L.splice(this.r + 1, 0, ind + after.replace(/^\s+/, ''));
          this.r++; this.c = ind.length;
          this.autoIndentRow = ind ? this.r : null;
          this.insertedText += '\n';
          return;
        }
        case BS: case CTRL.h:
          if (this.c > 0) { L[this.r] = line.slice(0, this.c - 1) + line.slice(this.c); this.c--; this.insertedText = this.insertedText.slice(0, -1); }
          else if (this.r > 0) {
            const prev = L[this.r - 1];
            L[this.r - 1] = prev + line; L.splice(this.r, 1);
            this.r--; this.c = prev.length;
          }
          return;
        case DEL:
          if (this.c < line.length) L[this.r] = line.slice(0, this.c) + line.slice(this.c + 1);
          else if (this.r < this.last) { L[this.r] = line + L[this.r + 1]; L.splice(this.r + 1, 1); }
          return;
        case TAB: {
          const sw = this.o.shiftwidth, n = sw - (this.c % sw);
          this.insChar(' '.repeat(n));
          return;
        }
        case CTRL.w: {
          if (this.c === 0) return this.insertKey(BS);
          let j = this.c;
          while (j > 0 && line[j - 1] === ' ') j--;
          if (j > 0) { const k = cls(line[j - 1]); while (j > 0 && cls(line[j - 1]) === k) j--; }
          L[this.r] = line.slice(0, j) + line.slice(this.c); this.c = j;
          return;
        }
        case CTRL.u: {
          const ind = this.indentLen(this.r), j = this.c > ind ? ind : 0;
          L[this.r] = line.slice(0, j) + line.slice(this.c); this.c = j;
          return;
        }
        case CTRL.t: case CTRL.d: {
          const before = this.indentLen(this.r);
          this.shift(this.r, this.r, key === CTRL.t ? '>' : '<', 1);
          if (key === CTRL.t && !line.length) this.lines[this.r] = ' '.repeat(this.o.shiftwidth);
          const after = this.indentLen(this.r);
          this.c = Math.max(0, this.c + after - before);
          return;
        }
        case CTRL.a: if (this.shared.lastInserted) this.insChar(this.shared.lastInserted); return;
        case CTRL.e: case CTRL.y: {
          const src = this.lines[this.r + (key === CTRL.e ? 1 : -1)];
          if (src === undefined || this.c >= src.length) return;
          this.insChar(src[this.c]);
          return;
        }
        case CTRL.n: case CTRL.p: return this.doComplete(key === CTRL.n ? 1 : -1, false);
        case CTRL.x: this.ctrlX = true; this.msg(M('ctrlx')); return;
        case CTRL.k: this.digraph = ''; return;
        case CTRL.v: case CTRL.q: this.literal = ''; return;
        case CTRL.o:
          this.ctrlO = true; this.ctrlOFresh = true; this.mode = 'normal'; this.pending = '';
          return;
        case CTRL.r: this.insertRegPending = true; if (this.onCmd || this.shared.onCmd) (this.onCmd || this.shared.onCmd)({ type: 'insreg' }); return;
        case LEFT: if (this.c > 0) this.c--; return;
        case RIGHT: if (this.c < line.length) this.c++; return;
        case UP: if (this.r > 0) { this.r--; this.c = Math.min(this.c, L[this.r].length); } return;
        case DOWN: if (this.r < this.last) { this.r++; this.c = Math.min(this.c, L[this.r].length); } return;
      }
      if (isPrintable(key)) {
        if (!WORD_RE.test(key)) this.expandAbbrev();
        this.insChar(key);
        const tw = this.o.textwidth;
        const ln = this.lines[this.r];
        if (tw > 0 && key !== ' ' && ln.length > tw) {
          let sp = ln.lastIndexOf(' ', tw);
          const ind = ln.match(/^\s*/)[0];
          if (sp > ind.length) {
            const head = ln.slice(0, sp).replace(/\s+$/, ''), tail = ln.slice(sp + 1);
            this.lines[this.r] = head;
            this.lines.splice(this.r + 1, 0, ind + tail);
            const delta = this.c - (sp + 1);
            this.r++; this.c = ind.length + Math.max(0, delta);
          }
        }
      }
    }

    finishInsert() {
      const L = this.lines;
      const rep = this.insertRepeat;
      if (rep && rep.count > 1) {
        const keys = this.insertKeys.slice();
        for (let i = 1; i < rep.count; i++) {
          if (rep.kind === 'o' || rep.kind === 'O') this.openLine(false);
          for (const k of keys) this.insertKey(k);
        }
      }
      this.insertRepeat = null;
      let adjust = true;
      if (this.blockInsert) {
        const b = this.blockInsert;
        this.blockInsert = null;
        if (this.r === b.sr) {
          const added = L[b.sr].length - b.before;
          if (added > 0) {
            const col = b.toEnd ? b.before : b.col;
            const ins = L[b.sr].slice(col, col + added);
            for (let r = b.sr + 1; r <= b.er; r++) {
              let line = L[r];
              const at = b.toEnd ? line.length : b.col;
              if (line.length < at) {
                if (!b.append) continue;
                line += ' '.repeat(at - line.length);
              }
              L[r] = line.slice(0, at) + ins + line.slice(at);
            }
          }
          this.c = b.col; adjust = false;
        }
      }
      if (this.autoIndentRow === this.r && /^\s+$/.test(L[this.r])) { L[this.r] = ''; this.c = 0; }
      this.autoIndentRow = null;
      if (this.insertedText) this.shared.lastInserted = this.insertedText;
      this.marks['^'] = { r: this.r, c: this.c };
      this.mode = 'normal';
      this.ctrlO = false; this.compl = null; this.ctrlX = false; this.digraph = null; this.literal = null;
      if (adjust && this.c > 0) this.c--;
      this.clampNormal();
      this.want = this.c;
      if (this.dotPending) { this.dot = this.dotPending; this.dotPending = null; }
    }

    replaceKey(key) {
      const L = this.lines;
      if (key === ESC) {
        this.mode = 'normal';
        if (this.c > 0) this.c--;
        this.clampNormal(); this.want = this.c;
        if (this.dotPending) { this.dot = this.dotPending; this.dotPending = null; }
        return;
      }
      if (key === BS) {
        const s = this.replaceStack.pop();
        if (s) {
          const line = L[s.r];
          L[s.r] = s.ch === null ? line.slice(0, s.c) + line.slice(s.c + 1) : line.slice(0, s.c) + s.ch + line.slice(s.c + 1);
          this.r = s.r; this.c = s.c;
        } else if (this.c > 0) this.c--;
        return;
      }
      if (key === CR) {
        const line = L[this.r];
        L[this.r] = line.slice(0, this.c);
        L.splice(this.r + 1, 0, line.slice(this.c));
        this.r++; this.c = 0;
        return;
      }
      if (key === LEFT) { if (this.c > 0) this.c--; return; }
      if (key === RIGHT) { if (this.c < L[this.r].length) this.c++; return; }
      if (!isPrintable(key)) return;
      const line = L[this.r];
      if (this.c < line.length) {
        this.replaceStack.push({ r: this.r, c: this.c, ch: line[this.c] });
        L[this.r] = line.slice(0, this.c) + key + line.slice(this.c + 1);
      } else {
        this.replaceStack.push({ r: this.r, c: this.c, ch: null });
        L[this.r] = line + key;
      }
      this.c++;
    }

    /* ---- Visueller Modus ---- */
    startVisual(mode) { this.mode = mode; this.vs = { r: this.r, c: this.c }; }
    exitVisual() {
      const a = this.vs, b = { r: this.r, c: this.c };
      this.lastVisual = { mode: this.mode, vs: Object.assign({}, a), ve: b };
      const s = cmp(a, b) <= 0 ? a : b, e = cmp(a, b) <= 0 ? b : a;
      this.marks['<'] = { r: s.r, c: s.c };
      this.marks['>'] = { r: e.r, c: e.c };
      this.mode = 'normal';
      this.clampNormal();
    }
    visualRange() {
      const a = this.vs, b = { r: this.r, c: this.c };
      let s = a, e = b;
      if (cmp(b, a) < 0) { s = b; e = a; }
      if (this.mode === 'vline') return { type: 'line', sr: s.r, er: e.r };
      if (this.mode === 'vblock') {
        return { type: 'block', sr: Math.min(a.r, b.r), er: Math.max(a.r, b.r), sc: Math.min(a.c, b.c), ec: Math.max(a.c, b.c) + 1, toEnd: this.want === Infinity };
      }
      const elen = this.lines[e.r].length;
      if (e.c + 1 > elen && e.r < this.last) return { type: 'char', sr: s.r, sc: s.c, er: e.r + 1, ec: 0 };
      return { type: 'char', sr: s.r, sc: s.c, er: e.r, ec: Math.min(elen, e.c + 1) };
    }

    visualKey(key) {
      if (key === ESC) {
        if (this.pending) { this.pending = ''; return; }
        this.exitVisual(); return;
      }
      this.pending += key;
      const p = this.parse(this.pending, true);
      if (p === 'inc') return;
      this.pending = '';
      if (!p) return this.fail();
      if (p.arg === ESC) return;
      if (this.onCmd || this.shared.onCmd) (this.onCmd || this.shared.onCmd)(Object.assign({ visual: true }, p));
      if (p.type === 'motion') {
        const m = this.motion(p.key, p.arg, p.count, false);
        if (!m) return this.fail();
        if (m.buf && m.buf !== this.buf) return this.fail();
        if (m.scroll != null) this.top = m.scroll;
        if (JUMPS.has(p.key)) this.setJump();
        this.r = m.r; this.c = m.c;
        if (p.key === '$') this.want = Infinity;
        else if (!m.keepWant) this.want = this.c;
        this.clampNormal();
        return;
      }
      const prefix = (!this.replayingDot && VCHANGES.has(p.key)) ? this.visualDotPrefix() : null;
      this.execVisual(p);
      if (VIS[this.mode]) this.clampNormal();
      if (prefix !== null && !this.failed) {
        const keys = Array.from(prefix + (p.reg ? '"' + p.reg : '') + (p.count ? p.count : '') + p.key + (p.arg || ''));
        if (INS[this.mode]) this.dotPending = keys; else this.dot = keys;
      }
    }

    visualDotPrefix() {
      const rg = this.visualRange();
      if (rg.type === 'line') { const n = rg.er - rg.sr; return 'V' + (n ? n + 'j' : ''); }
      if (rg.type === 'block') {
        const rows = rg.er - rg.sr, cols = rg.ec - rg.sc - 1;
        return CTRL.v + (rows ? rows + 'j' : '') + (rg.toEnd ? '$' : (cols ? cols + 'l' : ''));
      }
      if (rg.sr === rg.er) { const n = rg.ec - rg.sc - 1; return 'v' + (n > 0 ? n + 'l' : ''); }
      return 'v' + (rg.er - rg.sr) + 'j0' + (rg.ec > 1 ? (rg.ec - 1) + 'l' : '');
    }

    execVisual(p) {
      const L = this.lines, n = p.count || 1, k = p.key, reg = p.reg;
      if (k === 'i' || k === 'a') {
        const rg = this.textObject(k + p.arg, n);
        if (!rg) return this.fail();
        if (rg.type === 'line') {
          if (this.mode === 'visual') this.mode = 'vline';
          this.vs = { r: rg.sr, c: 0 }; this.r = rg.er; this.c = 0;
        } else {
          if (rg.ec === rg.sc && rg.er === rg.sr) return;
          this.vs = { r: rg.sr, c: rg.sc };
          if (rg.ec > 0) { this.r = rg.er; this.c = rg.ec - 1; }
          else { this.r = rg.er - 1; this.c = L[this.r].length; }
        }
        return;
      }
      switch (k) {
        case 'o': case 'O': {
          if (k === 'O' && this.mode === 'vblock') { const t = this.vs.c; this.vs.c = this.c; this.c = t; return; }
          const t = this.vs; this.vs = { r: this.r, c: this.c }; this.r = t.r; this.c = t.c; return;
        }
        case 'v': case 'V': case CTRL.v: {
          const target = k === 'v' ? 'visual' : k === 'V' ? 'vline' : 'vblock';
          if (this.mode === target) this.exitVisual(); else this.mode = target;
          return;
        }
        case ':': this.exitVisual(); return this.openCmd(':', "'<,'>");
        case '/': case '?': return this.openCmd(k, '');
      }
      const rg = this.visualRange();
      const lineRg = { type: 'line', sr: Math.min(this.vs.r, this.r), er: Math.max(this.vs.r, this.r) };
      const startPos = { r: rg.sr, c: rg.type === 'line' ? 0 : rg.sc };
      this.exitVisual();
      switch (k) {
        case 'd': case 'x': case DEL: return this.applyOp('d', rg, reg);
        case 'X': case 'D':
          if (rg.type === 'block' && k === 'D') return this.applyOp('d', Object.assign({}, rg, { toEnd: true }), reg);
          return this.applyOp('d', lineRg, reg);
        case 'y': this.applyOp('y', rg, reg); this.r = startPos.r; this.c = startPos.c; return;
        case 'Y': return this.applyOp('y', lineRg, reg);
        case 'c': case 's': return this.applyOp('c', rg, reg);
        case 'C': case 'S': case 'R': return this.applyOp('c', lineRg, reg);
        case '>': case '<':
          this.shift(lineRg.sr, lineRg.er, k, n);
          this.r = lineRg.sr; this.c = this.fnb(this.r);
          return;
        case 'gq': case 'gw': case '=': case '!': case 'zf': return this.applyOp(k, lineRg, reg);
        case '~': case 'u': case 'U': case 'g~': case 'gu': case 'gU': case 'g?':
          this.applyOp(k.length === 1 ? (k === '~' ? 'g~' : 'g' + k) : k, rg, reg);
          this.r = startPos.r; this.c = startPos.c;
          return;
        case 'J': case 'gJ':
          this.r = lineRg.sr;
          return this.join(Math.max(2, lineRg.er - lineRg.sr + 1), k === 'J');
        case 'r': {
          const ch = p.arg;
          if (rg.type === 'line') { for (let r = rg.sr; r <= rg.er; r++) L[r] = L[r].replace(/./g, ch); }
          else if (rg.type === 'block') {
            for (let r = rg.sr; r <= rg.er; r++) {
              const line = L[r], e = rg.toEnd ? line.length : Math.min(rg.ec, line.length);
              if (line.length > rg.sc) L[r] = line.slice(0, rg.sc) + ch.repeat(e - rg.sc) + line.slice(e);
            }
          } else {
            const t = this.getText(rg.sr, rg.sc, rg.er, rg.ec).replace(/[^\n]/g, ch);
            this.delText(rg.sr, rg.sc, rg.er, rg.ec); this.insText(rg.sr, rg.sc, t);
          }
          this.r = startPos.r; this.c = startPos.c;
          return;
        }
        case 'p': case 'P': {
          const R = this.getReg(reg);
          if (!R) return this.fail(M('e353', reg || '"'));
          const saved = Object.assign({}, R);
          this.applyOp('d', rg, k === 'p' ? null : '_');
          if (saved.linewise) {
            const parts = saved.text.split('\n');
            if (rg.type === 'line') { this.lines.splice(rg.sr, 0, ...parts); this.r = rg.sr; this.c = this.fnb(rg.sr); }
            else {
              const line = this.lines[this.r];
              this.lines.splice(this.r, 1, line.slice(0, this.c), ...parts, line.slice(this.c));
              this.r++; this.c = 0;
            }
          } else if (rg.type === 'line') {
            this.lines.splice(rg.sr, 0, ...saved.text.split('\n'));
            this.r = rg.sr; this.c = 0;
          } else {
            const end = this.insText(rg.sr, rg.sc, saved.text);
            this.r = end.r; this.c = Math.max(0, end.c - 1);
          }
          return;
        }
        case 'I':
          if (rg.type === 'block') {
            this.blockInsert = { sr: rg.sr, er: rg.er, col: rg.sc, before: L[rg.sr].length, append: false };
            this.r = rg.sr; this.c = Math.min(rg.sc, L[rg.sr].length);
          } else { this.r = rg.sr; this.c = rg.type === 'line' ? this.indentLen(rg.sr) : rg.sc; }
          return this.startInsert('i', 1);
        case 'A':
          if (rg.type === 'block') {
            if (rg.toEnd) {
              this.blockInsert = { sr: rg.sr, er: rg.er, col: L[rg.sr].length, before: L[rg.sr].length, append: true, toEnd: true };
              this.r = rg.sr; this.c = L[rg.sr].length;
            } else {
              if (L[rg.sr].length < rg.ec) L[rg.sr] += ' '.repeat(rg.ec - L[rg.sr].length);
              this.blockInsert = { sr: rg.sr, er: rg.er, col: rg.ec, before: L[rg.sr].length, append: true };
              this.r = rg.sr; this.c = rg.ec;
            }
          } else if (rg.type === 'line') { this.r = rg.er; this.c = L[rg.er].length; }
          else { this.r = rg.er; this.c = rg.ec; }
          return this.startInsert('a', 1);
        case CTRL.a: case CTRL.x: case 'g' + CTRL.a: case 'g' + CTRL.x: {
          const sign = (k === CTRL.a || k === 'g' + CTRL.a) ? 1 : -1;
          const prog = k.length === 2;
          let i = 0;
          for (let r = lineRg.sr; r <= lineRg.er; r++) {
            const from = rg.type === 'block' ? rg.sc : (r === rg.sr && rg.type === 'char' ? rg.sc : 0);
            if (this.incLine(r, from, sign * n * (prog ? i + 1 : 1)) >= 0) i++;
          }
          this.r = lineRg.sr; this.c = 0;
          return;
        }
      }
    }

    /* ---- Befehlszeile ---- */
    openCmd(type, init) {
      this.cmdFrom = { mode: this.mode === 'cmdline' ? 'normal' : this.mode };
      this.mode = 'cmdline'; this.cmdType = type; this.cmdText = init;
      this.histIdx = -1; this.histBase = null; this.cmdCompl = null; this.inc = null;
    }
    pushHist(type, text) {
      const h = this.shared.hist[type === ':' ? ':' : '/'];
      if (!text) return;
      const i = h.indexOf(text);
      if (i >= 0) h.splice(i, 1);
      h.push(text);
      if (h.length > 100) h.shift();
    }
    cmdKey(key) {
      if (this.cmdRegPending) {
        this.cmdRegPending = false;
        if (key === CTRL.w || key === CTRL.a) { const w = this.wordAt(key === CTRL.a); if (w) this.cmdText += w.word; return; }
        const R = this.getReg(key);
        if (R) this.cmdText += R.text.split('\n')[0];
        this.updateInc();
        return;
      }
      if (key !== TAB) this.cmdCompl = null;
      const back = () => { this.mode = this.cmdFrom ? this.cmdFrom.mode : 'normal'; this.inc = null; };
      if (key === ESC || (key === BS && !this.cmdText)) { back(); return; }
      if (key === CR) {
        const t = this.cmdText, ty = this.cmdType;
        back();
        this.cmdText = '';
        if (ty === '=') {
          const v = evalExpr(t);
          if (v === null) return this.fail(M('e15', t));
          this.insChar(v);
          return;
        }
        this.pushHist(ty, t);
        if (this.onCmd || this.shared.onCmd) (this.onCmd || this.shared.onCmd)({ type: 'ex', cmdType: ty, text: t });
        if (ty === ':') this.ex(t); else this.search(t, ty === '/' ? 1 : -1);
        return;
      }
      if (key === UP || key === DOWN) {
        const h = this.shared.hist[this.cmdType === ':' ? ':' : '/'];
        if (this.histBase === null) { this.histBase = this.cmdText; this.histIdx = h.length; }
        let i = this.histIdx;
        do { i += key === UP ? -1 : 1; } while (i >= 0 && i < h.length && !h[i].startsWith(this.histBase));
        if (i < 0) return;
        if (i >= h.length) { this.histIdx = h.length; this.cmdText = this.histBase; return; }
        this.histIdx = i; this.cmdText = h[i];
        return;
      }
      if (key === TAB && this.cmdType === ':') return this.cmdComplete();
      if (key === BS) { this.cmdText = this.cmdText.slice(0, -1); this.updateInc(); return; }
      if (key === CTRL.u) { this.cmdText = ''; return; }
      if (key === CTRL.w) { this.cmdText = this.cmdText.replace(/\S*\s*$/, ''); return; }
      if (key === CTRL.r) { this.cmdRegPending = true; return; }
      if (isPrintable(key)) { this.cmdText += key; this.histBase = null; this.updateInc(); }
    }
    updateInc() {
      this.inc = null;
      if ((this.cmdType !== '/' && this.cmdType !== '?') || !this.o.incsearch || !this.cmdText) return;
      const src = this.cmdText.split(/(?<!\\)[/?]/)[0];
      const re = this.compile(src);
      if (!re) return;
      const ms = this.allMatches(re);
      if (!ms.length) return;
      const dir = this.cmdType === '/' ? 1 : -1;
      let f;
      if (dir > 0) f = ms.find(m => m.r > this.r || (m.r === this.r && m.c > this.c)) || ms[0];
      else { f = null; for (const m of ms) if (m.r < this.r || (m.r === this.r && m.c < this.c)) f = m; f = f || ms[ms.length - 1]; }
      this.inc = { r: f.r, c: f.c, len: Math.max(1, f.len) };
    }
    cmdComplete() {
      if (this.cmdCompl) {
        const cc = this.cmdCompl;
        cc.idx = (cc.idx + 1) % cc.list.length;
        this.cmdText = cc.base + cc.list[cc.idx];
        return;
      }
      const t = this.cmdText;
      const m = t.match(/^(\s*[%.,$'<>0-9+\-]*)(\w*)$/);
      let base, cands;
      if (m) { base = m[1]; cands = EXCMDS.filter(c => c.startsWith(m[2])); }
      else {
        const m2 = t.match(/^(.*?\b(set?|setl(?:ocal)?)\s+(?:.*\s)?)(\w*)$/);
        const m3 = t.match(/^(.*?\b(e|edit|b|buffer|sp|split|vs|vsplit|tabe|tabedit|tabnew|r|read|so|source|sav|saveas|w|write)!?\s+)(\S*)$/);
        if (m2) { base = m2[1]; cands = OPTS.concat(OPTS.map(o => 'no' + o)).filter(o => o.startsWith(m2[3])); }
        else if (m3) {
          base = m3[1];
          const names = new Set(this.shared.buffers.map(b => b.name).concat(Object.keys(this.shared.files)));
          cands = Array.from(names).filter(nm => nm.startsWith(m3[3])).sort();
        } else return;
      }
      if (!cands.length) return;
      this.cmdCompl = { base, list: cands, idx: 0 };
      this.cmdText = base + cands[0];
    }

    search(raw, dir) {
      const sep = dir > 0 ? '/' : '?';
      let src = raw, off = '';
      const parts = raw.split(new RegExp('(?<!\\\\)\\' + sep));
      if (parts.length > 1) { src = parts[0]; off = parts.slice(1).join(sep); }
      if (src === '') {
        if (!this.lastSearch) return this.fail(M('noPat'));
        src = this.lastSearch.src;
        if (parts.length === 1) off = this.lastSearch.off || '';
      }
      const re = this.compile(src);
      if (!re) return this.fail(M('badPat', src));
      this.lastSearch = { src, re, dir, off };
      this.hls = true;
      const q = this.searchPos(re, dir, 1, null, src);
      if (!q) return;
      if (!this.message) this.msg(sep + raw);
      this.setJump();
      const t = this.applyOffset(q, off);
      this.r = t.r; this.c = t.c; this.want = t.c;
      if (this.mode === 'normal') this.clampNormal();
    }

    parseRange(s) {
      let i = 0;
      const last = this.last;
      const skip = () => { while (s[i] === ' ') i++; };
      const one = () => {
        skip();
        let base = null;
        if (s[i] === '.') { base = this.r; i++; }
        else if (s[i] === '$') { base = last; i++; }
        else if (/\d/.test(s[i] || '')) { let d = ''; while (/\d/.test(s[i] || '')) d += s[i++]; base = parseInt(d, 10) - 1; }
        else if (s[i] === "'") {
          const mk = this.getMark(s[i + 1]);
          if (!mk || (mk.buf && mk.buf !== this.buf)) throw new Error(M('e20'));
          base = mk.r; i += 2;
        } else if (s[i] === '/' || s[i] === '?') {
          const d = s[i]; let j = i + 1, pat = '';
          while (j < s.length && s[j] !== d) { if (s[j] === '\\' && j + 1 < s.length) { pat += s[j] + s[j + 1]; j += 2; continue; } pat += s[j++]; }
          i = j + 1;
          const src = pat || (this.lastSearch && this.lastSearch.src);
          if (!src) throw new Error(M('noPat'));
          const re = this.compile(src);
          if (!re) throw new Error(M('badPat', src));
          this.lastSearch = { src, re, dir: d === '/' ? 1 : -1, off: '' };
          let found = -1;
          const n = this.lines.length;
          for (let k = 1; k <= n; k++) {
            const rr = d === '/' ? (this.r + k) % n : (this.r - k + n) % n;
            re.lastIndex = 0;
            if (re.test(this.lines[rr])) { found = rr; break; }
          }
          if (found < 0) throw new Error(M('e486', src));
          base = found;
        }
        while (s[i] === '+' || s[i] === '-') {
          const sign = s[i++];
          let d = '';
          while (/\d/.test(s[i] || '')) d += s[i++];
          const v = d ? parseInt(d, 10) : 1;
          if (base === null) base = this.r;
          base += sign === '+' ? v : -v;
        }
        return base;
      };
      skip();
      if (s[i] === '%') return { range: [0, last], rest: s.slice(i + 1) };
      const a = one();
      if (a === null) return { range: null, rest: s.slice(i) };
      const addrs = [a];
      while (s[i] === ',' || s[i] === ';') {
        const semi = s[i] === ';';
        i++;
        if (semi) this.r = Math.max(0, Math.min(last, addrs[addrs.length - 1]));
        const b = one();
        addrs.push(b === null ? this.r : b);
      }
      return { range: [addrs[0], addrs[addrs.length - 1]], single: addrs.length === 1, rest: s.slice(i) };
    }

    splitBar(s) {
      const name = (s.replace(/^[\s:]*/, '').replace(/^[%.,$'<>a-z0-9+\-;/\\?]*?(?=[a-zA-Z])/, '').match(/^[a-zA-Z]+/) || [''])[0];
      if (/^(g|global|v|vglobal|norm|normal|map|nmap|vmap|xmap|imap|noremap|nnoremap|vnoremap|xnoremap|inoremap|ab|abbreviate|iab|iabbrev|let|bufdo|bufd|windo|tabdo|cdo|cfdo)$/.test(name)) return [s];
      const out = [];
      let cur = '', start = 0;
      if (/^(s|su|substitute)$/.test(name)) {
        const at = s.search(/s(?:u(?:bstitute)?)?(?=[^a-zA-Z0-9\s"|])/);
        if (at >= 0) {
          let j = s.indexOf(name, at) + name.length;
          const d = s[j]; let seen = 0;
          for (j = j + 1; j < s.length && seen < 2; j++) { if (s[j] === '\\') { j++; continue; } if (s[j] === d) seen++; }
          cur = s.slice(0, j); start = j;
        }
      }
      for (let i = start; i < s.length; i++) {
        if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
        if (s[i] === '|') { out.push(cur); cur = ''; continue; }
        cur += s[i];
      }
      out.push(cur);
      return out;
    }

    ex(input) {
      const raw = input.replace(/^[\s:]+/, '');
      if (!raw) return;
      this.lastEx = raw;
      this.exLog.push(raw.trim());
      const parts = this.splitBar(raw);
      if (parts.length > 1) {
        for (const p of parts) { if (p.trim()) this.exOne(p); if (this.failed) break; }
        return;
      }
      return this.exOne(raw);
    }

    exOne(raw) {
      raw = raw.replace(/^[\s:]+/, '');
      let rr;
      try { rr = this.parseRange(raw); } catch (e) { return this.fail(e.message); }
      let range = rr.range;
      const s = rr.rest.replace(/^\s+/, '');
      const L = this.lines, last = this.last;
      if (range) {
        if (range[0] > range[1]) range = [range[1], range[0]];
        if (s === '') {
          const t = Math.max(0, Math.min(last, range[1]));
          this.setJump(); this.r = t; this.c = this.fnb(t);
          return;
        }
        if (range[0] < -1 || range[1] > last) return this.fail(M('e16'));
        range = [Math.max(0, range[0]), range[1]];
      }
      if (s[0] === '!') return this.exBang(range, s.slice(1));
      const m = s.match(/^([a-zA-Z]+|[&<>~]+|@)(!?)([\s\S]*)$/);
      if (!m) return this.fail(M('e492', s));
      const name = m[1], bang = m[2] === '!', arg = m[3];
      const argT = arg.trim();
      const cur = [this.r, this.r];
      const is = (...names) => names.includes(name);

      if (is('w', 'write', 'up', 'update', 'sav', 'saveas', 'wa', 'wall')) {
        if (is('wa', 'wall')) { for (const b of this.shared.buffers) if (b.modified) this.writeBuf(b); return; }
        if (is('up', 'update') && !this.buf.modified) return;
        if (is('sav', 'saveas')) { if (!argT) return this.fail(M('e32')); this.buf.name = argT; return this.writeBuf(this.buf); }
        if (argT && argT !== this.buf.name) {
          const text = (range ? L.slice(range[0], range[1] + 1) : L).join('\n');
          this.shared.files[argT] = text;
          return this.msg(M('written', argT, range ? range[1] - range[0] + 1 : L.length));
        }
        return this.writeBuf(this.buf);
      }
      if (is('wq', 'x', 'xit', 'exit')) {
        if (!is('x', 'xit', 'exit') || this.buf.modified) this.writeBuf(this.buf);
        return this.quitWin(true);
      }
      if (is('q', 'quit', 'clo', 'close')) {
        if (!bang && this.buf.modified && !this.otherWindowShows(this.buf) && !(is('clo', 'close'))) {
          const win = this.ws ? this.ws.windowCount() : 1;
          if (win <= 1 || !this.o.hidden) return this.fail(M('e37'));
        }
        return this.quitWin(bang, is('clo', 'close'));
      }
      if (is('qa', 'qall', 'quita', 'quitall', 'wqa', 'wqall', 'xa', 'xall', 'cq')) {
        if (is('wqa', 'wqall', 'xa', 'xall')) for (const b of this.shared.buffers) if (b.modified) this.writeBuf(b);
        else if (!bang) { const mod = this.shared.buffers.find(b => b.modified); if (mod) return this.fail(M('e37')); }
        if (this.ws) this.ws.onlyAll();
        return this.msg(M('quit'));
      }
      if (is('e', 'edit')) {
        if (!argT) {
          if (bang) return this.revert();
          return this.msg(M('fileInfo', this.buf.name, L.length, this.buf.modified));
        }
        return this.openFile(argT, bang);
      }
      if (is('ene', 'enew')) return this.openFile(null, bang);
      if (is('f', 'file')) { if (argT) this.buf.name = argT; return this.msg(M('fileInfo', this.buf.name, L.length, this.buf.modified)); }
      if (is('ls', 'buffers', 'files')) return this.showBuffers();
      if (is('b', 'bu', 'buf', 'buffer')) {
        if (!argT) return;
        const b = /^\d+$/.test(argT) ? this.shared.buffers.find(x => x.id === parseInt(argT, 10)) : this.findBuf(argT);
        if (!b) return this.fail(/^\d+$/.test(argT) ? M('e86', argT) : M('e94', argT));
        return this.switchTo(b, bang);
      }
      if (is('bn', 'bnext', 'bp', 'bprevious', 'bN', 'bNext', 'bf', 'bfirst', 'br', 'brewind', 'bl', 'blast')) {
        const list = this.shared.buffers;
        if (!list.length) return this.fail(M('e85'));
        let i = list.indexOf(this.buf);
        const n = parseInt(argT, 10) || 1;
        if (is('bn', 'bnext')) i = (i + n) % list.length;
        else if (is('bp', 'bprevious', 'bN', 'bNext')) i = ((i - n) % list.length + list.length) % list.length;
        else if (is('bf', 'bfirst', 'br', 'brewind')) i = 0;
        else i = list.length - 1;
        return this.switchTo(list[i], bang);
      }
      if (is('bd', 'bdelete', 'bw', 'bwipeout', 'bun', 'bunload')) {
        const b = argT ? (/^\d+$/.test(argT) ? this.shared.buffers.find(x => x.id === parseInt(argT, 10)) : this.findBuf(argT)) : this.buf;
        if (!b) return this.fail(M('e94', argT));
        if (b.modified && !bang) return this.fail(M('e89', b.id));
        return this.deleteBuf(b);
      }
      if (is('bufdo', 'bufd', 'windo', 'tabdo')) {
        if (is('windo', 'tabdo') && this.ws) return this.ws.doAll(name === 'windo' ? 'win' : 'tab', argT);
        const start = this.buf;
        for (const b of this.shared.buffers.slice()) { this.setBuffer(b); this.r = 0; this.c = 0; this.ex(argT); this.exLog.pop(); }
        this.failed = false;
        void start;
        return;
      }
      if (is('sp', 'split', 'vs', 'vsplit', 'new', 'vne', 'vnew', 'on', 'only', 'tabnew', 'tabe', 'tabedit', 'tabn', 'tabnext', 'tabp', 'tabprevious', 'tabN', 'tabNext',
        'tabc', 'tabclose', 'tabo', 'tabonly', 'tabs', 'tabfir', 'tabfirst', 'tabl', 'tablast', 'winc', 'wincmd', 'sb', 'sbuffer')) {
        if (!this.ws) return this.msg(M('windows'));
        return this.ws.exWin(this, name, argT, bang);
      }
      if (is('s', 'su', 'substitute') || name === '&' || name === '&&' || name === '~') {
        if (name === '&') return arg.startsWith('&') ? this.substitute(range || cur, this.lastSub ? this.lastSub.pat : '', this.lastSub ? this.lastSub.rep : '', this.lastSub ? this.lastSub.flags : '') : this.exSub(range || cur, '');
        if (name === '&&') return this.exSub(range || cur, '&');
        if (name === '~') {
          if (!this.lastSub || !this.lastSearch) return this.fail(M('noSub'));
          return this.substitute(range || cur, this.lastSearch.src, this.lastSub.rep, argT);
        }
        return this.exSub(range || cur, arg);
      }
      if (is('g', 'global', 'v', 'vglobal')) return this.exGlobal(range, arg, bang || name[0] === 'v');
      if (is('d', 'de', 'del', 'delete')) {
        const rg = range || cur, reg = argT[0] && /[a-zA-Z"_]/.test(argT[0]) ? argT[0] : null;
        return this.applyOp('d', { type: 'line', sr: rg[0], er: rg[1] }, reg);
      }
      if (is('y', 'ya', 'yank')) {
        const rg = range || cur, reg = argT[0] && /[a-zA-Z"_+*]/.test(argT[0]) ? argT[0] : null;
        const pos = { r: this.r, c: this.c };
        this.applyOp('y', { type: 'line', sr: rg[0], er: rg[1] }, reg);
        this.r = pos.r; this.c = pos.c;
        return;
      }
      if (is('pu', 'put')) {
        const reg = argT[0] || null;
        const R = this.getReg(reg);
        if (!R) return this.fail(M('e353', reg || '"'));
        const at = range ? range[1] : this.r;
        const parts = R.text.split('\n');
        if (bang) this.lines.splice(at, 0, ...parts); else this.lines.splice(at + 1, 0, ...parts);
        this.r = bang ? at + parts.length - 1 : at + parts.length; this.c = this.fnb(this.r);
        return;
      }
      if (is('m', 'mo', 'move')) return this.exMove(range || cur, argT, false);
      if (is('t', 'co', 'copy')) return this.exMove(range || cur, argT, true);
      if (is('j', 'join')) {
        const rg = range || cur;
        this.r = rg[0];
        return this.join(rr.single || !range ? 2 : rg[1] - rg[0] + 1, !bang);
      }
      if (is('sor', 'sort')) return this.exSort(range || [0, last], argT, bang);
      if (is('norm', 'normal')) return this.exNormal(range || cur, arg.replace(/^\s/, ''), bang);
      if (is('noh', 'nohlsearch')) { this.hls = false; return; }
      if (is('se', 'set', 'setl', 'setlocal', 'setg', 'setglobal')) return this.exSet(argT);
      if (is('reg', 'registers', 'di', 'display')) return this.showRegisters();
      if (is('marks')) return this.showMarks();
      if (is('ju', 'jumps')) return this.showJumps();
      if (is('changes')) return this.showChanges();
      if (is('dig', 'digraphs')) {
        const rows = [M('digHead')], ents = Object.entries(DIGRAPHS);
        for (let i = 0; i < ents.length; i += 6) rows.push(ents.slice(i, i + 6).map(([k, v]) => k + ' ' + v).join('   '));
        this.list = rows;
        return;
      }
      if (is('u', 'un', 'undo')) { if (argT && /^\d+$/.test(argT)) return this.travel(parseInt(argT, 10)); this.undo(); return; }
      if (is('red', 'redo')) { this.redo(); return; }
      if (is('ea', 'earlier', 'lat', 'later')) {
        const t = this.timeTarget(argT, is('ea', 'earlier') ? -1 : 1);
        if (t === null) return this.fail(M('e476'));
        return this.travel(t);
      }
      if (is('fo', 'fold')) { const rg = range || cur; return this.createFold(rg[0], rg[1]); }
      if (is('foldo', 'foldopen', 'foldc', 'foldclose')) {
        const rg = range || cur, open = is('foldo', 'foldopen');
        this.folds.forEach(f => { if (f.e >= rg[0] && f.s <= rg[1]) f.closed = !open; });
        return;
      }
      if (/^[nvxi]?(nore)?map$|^no(remap)?$|^[nvxi]no(remap)?$/.test(name)) return this.exMap(name, arg);
      if (/^[nvxi]?unm(ap)?$|^unmap$/.test(name)) return this.exUnmap(name, argT);
      if (/^[nvxi]?mapc(lear)?$/.test(name)) { const md = 'nvi'.includes(name[0]) && name[1] !== 'a' ? name[0] : null; if (md) this.shared.maps[md === 'x' ? 'v' : md] = {}; else this.shared.maps = { n: {}, i: {}, v: {} }; return; }
      if (is('ab', 'abbreviate', 'iab', 'iabbrev', 'ia')) return this.exAbbr(argT);
      if (is('una', 'unabbreviate', 'iuna', 'iunabbrev')) { if (this.shared.abbr[argT] === undefined) return this.fail(M('e24')); delete this.shared.abbr[argT]; return; }
      if (is('abc', 'abclear', 'iabc', 'iabclear')) { this.shared.abbr = {}; return; }
      if (is('let')) return this.exLet(argT);
      if (is('so', 'source', 'ru', 'runtime')) return this.exSource(argT);
      if (is('r', 'read')) return this.exRead(range, argT);
      if (is('vim', 'vimgrep', 'gr', 'grep', 'vimgrepa', 'vimgrepadd')) return this.exVimgrep(argT);
      if (is('cn', 'cnext', 'cp', 'cprevious', 'cN', 'cNext', 'cfir', 'cfirst', 'cr', 'crewind', 'cla', 'clast', 'cc')) return this.qfJump(name, argT);
      if (is('cope', 'copen', 'cw', 'cwindow', 'cl', 'clist')) return this.qfList();
      if (is('ccl', 'cclose')) return;
      if (is('cdo', 'cfdo')) {
        const list = this.shared.qf.list.slice();
        if (!list.length) return this.fail(M('e42'));
        list.forEach((q, i) => { this.shared.qf.idx = i; this.gotoQf(q); this.ex(argT); this.exLog.pop(); });
        this.failed = false;
        return;
      }
      if (is('h', 'help')) {
        if (!argT) return this.msg(M('help'));
        const res = this.shared.help ? this.shared.help(argT) : null;
        if (!res || !res.length) return this.fail(M('helpNone', argT));
        this.list = res;
        return;
      }
      if (is('ret', 'retab', 'redr', 'redraw', 'sy', 'syntax', 'filetype', 'filet', 'colo', 'colorscheme', 'echo', 'ec')) {
        if (is('echo', 'ec')) { const v = evalExpr(argT); return this.msg(v !== null ? v : argT.replace(/^['"]|['"]$/g, '')); }
        return;
      }
      if (name[0] === '>' || name[0] === '<') {
        const rg = range || cur;
        this.shift(rg[0], rg[1], name[0], name.length);
        this.r = rg[1]; this.c = this.fnb(this.r);
        return;
      }
      return this.fail(M('e492', s));
    }

    /* ---- Dateien & Puffer ---- */
    writeBuf(b) {
      this.shared.files[b.name] = b.lines.join('\n');
      b.savedSeq = b.seq; b.savedText = b.lines.join("\n");
      this.msg(M('written', b.name, b.lines.length));
    }
    revert() {
      const b = this.buf;
      const text = this.shared.files[b.name];
      if (text === undefined) return this.fail(M('e484', b.name));
      this.setBufText(b, text);
      this.r = 0; this.c = 0;
      this.msg(M('fileInfo', b.name, b.lines.length, false));
    }
    setBufText(b, text) {
      const pre = { lines: b.lines.slice(), r: this.r, c: this.c };
      b.lines = text.split('\n');
      if (b === this.buf && this.changed(pre)) {
        pre.seq = b.seq; b.undoStack.push(pre); b.redoStack = [];
        b.seqLast++; b.seq = b.seqLast; b.states[b.seq] = { lines: b.lines.slice(), r: 0, c: 0, seq: b.seq, t: Date.now() };
      }
      b.savedSeq = b.seq; b.savedText = text;
      this.skipUndo = true;
    }
    findBuf(name) {
      const bs = this.shared.buffers;
      return bs.find(b => b.name === name) || (bs.filter(b => b.name.includes(name)).length === 1 ? bs.find(b => b.name.includes(name)) : null);
    }
    newBuffer(name, text) {
      const b = new Buffer(this.shared.nextBuf++, name, text, text === undefined || text === null || name === "[No Name]");
      this.shared.buffers.push(b);
      return b;
    }
    otherWindowShows(b) { return this.ws ? this.ws.allWindows().some(w => w.v !== this && w.v.buf === b) : false; }
    setBuffer(b) {
      if (b === this.buf) return;
      this.buf.lastPos = { r: this.r, c: this.c };
      this.alt = this.buf;
      this.buf = b;
      this.r = Math.min(b.lastPos.r, b.lines.length - 1); this.c = b.lastPos.c;
      this.top = 0;
      this.clampNormal();
    }
    switchTo(b, bang) {
      if (b === this.buf) return;
      if (this.buf.modified && !this.o.hidden && !bang && !this.otherWindowShows(this.buf)) return this.fail(M('e37'));
      this.setJump();
      this.setBuffer(b);
      this.msg(M('fileInfo', b.name, b.lines.length, b.modified));
    }
    openFile(name, bang) {
      if (this.buf.modified && !this.o.hidden && !bang && !this.otherWindowShows(this.buf) && (name === null || name !== this.buf.name)) return this.fail(M('e37'));
      if (name === null) { const b = this.newBuffer('[No Name]', ''); this.setBuffer(b); return; }
      if (name === this.buf.name) { if (bang) return this.revert(); return; }
      let b = this.findBufExact(name);
      if (!b) {
        const text = this.shared.files[name];
        b = this.newBuffer(name, text === undefined ? '' : text);
        b.savedSeq = 0;
        this.setJump();
        this.setBuffer(b);
        return this.msg(text === undefined ? M('newFile', name) : M('fileInfo', name, b.lines.length, false));
      }
      this.setJump();
      this.setBuffer(b);
      this.msg(M('fileInfo', b.name, b.lines.length, b.modified));
    }
    findBufExact(name) { return this.shared.buffers.find(b => b.name === name) || null; }
    deleteBuf(b) {
      const list = this.shared.buffers;
      const i = list.indexOf(b);
      if (i < 0) return;
      if (list.length === 1) {
        const nb = this.newBuffer('[No Name]', '');
        list.splice(list.indexOf(b), 1);
        this.replaceBufEverywhere(b, nb);
        return;
      }
      list.splice(i, 1);
      const repl = (this.alt && list.includes(this.alt)) ? this.alt : list[Math.min(i, list.length - 1)];
      this.replaceBufEverywhere(b, repl);
    }
    replaceBufEverywhere(b, nb) {
      const wins = this.ws ? this.ws.allWindows().map(w => w.v) : [this];
      for (const v of wins) if (v.buf === b) { v.buf = nb; v.r = Math.min(nb.lastPos.r, nb.lines.length - 1); v.c = nb.lastPos.c; v.top = 0; v.clampNormal(); }
      for (const k in this.shared.gmarks) if (this.shared.gmarks[k].buf === b) delete this.shared.gmarks[k];
    }
    quitWin(force, closeOnly) {
      if (this.ws && (this.ws.windowCount() > 1 || this.ws.tabs.length > 1)) {
        return this.ws.closeWin(this, force);
      }
      if (closeOnly) return this.fail(M('e444'));
      return this.msg(M('quit'));
    }
    showBuffers() {
      const rows = this.shared.buffers.map(b => {
        const flag = (b === this.buf ? '%a' : b === this.alt ? '# ' : (this.otherWindowShows(b) ? ' a' : '  ')) + (b.modified ? ' +' : '  ');
        const ln = b === this.buf ? this.r + 1 : b.lastPos.r + 1;
        return String(b.id).padStart(3) + ' ' + flag + ' "' + b.name + '"' + ' '.repeat(Math.max(1, 22 - b.name.length)) + (LANG === 'en' ? 'line ' : 'Zeile ') + ln;
      });
      this.list = rows;
    }

    /* ---- Quickfix ---- */
    exVimgrep(arg) {
      const m = arg.match(/^(\S)(.*?)\1(g?j?)\s*(.*)$/) || [null, '/', arg.split(/\s+/)[0], '', arg.split(/\s+/).slice(1).join(' ')];
      const pat = m[2];
      const re = this.compile(pat);
      if (!re) return this.fail(M('badPat', pat));
      this.lastSearch = { src: pat, re, dir: 1, off: '' };
      this.hls = true;
      const files = (m[4] || '').trim();
      const want = files === '' || files === '*' || files === '**' || files === '##' ? null : files === '%' ? [this.buf.name] : files.split(/\s+/);
      const glob = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      const names = new Set(this.shared.buffers.map(b => b.name).concat(Object.keys(this.shared.files)));
      const list = [];
      for (const name of names) {
        if (want && !want.some(w => glob(w).test(name))) continue;
        const b = this.findBufExact(name);
        const lines = b ? b.lines : this.shared.files[name].split('\n');
        lines.forEach((l, r) => {
          re.lastIndex = 0;
          let mm;
          while ((mm = re.exec(l))) { list.push({ name, r, c: mm.index, text: l.trim() }); if (!m[3].includes('g')) break; if (!mm[0].length) re.lastIndex++; }
        });
      }
      this.shared.qf = { list, idx: list.length ? 0 : -1 };
      if (!list.length) return this.fail(M('e486', pat));
      if (!m[3].includes('j')) this.gotoQf(list[0]);
      this.msg(M('qfItem', 1, list.length, list[0].text));
    }
    gotoQf(q) {
      let b = this.findBufExact(q.name);
      if (!b) { b = this.newBuffer(q.name, this.shared.files[q.name] || ''); }
      if (b !== this.buf) { this.setJump(); this.setBuffer(b); }
      this.r = Math.min(q.r, this.last); this.c = q.c; this.clampNormal();
    }
    qfJump(name, arg) {
      const qf = this.shared.qf;
      if (!qf.list.length) return this.fail(M('e42'));
      let i = qf.idx;
      const n = parseInt(arg, 10) || 1;
      if (/^(cn|cnext)$/.test(name)) i += n;
      else if (/^(cp|cprevious|cN|cNext)$/.test(name)) i -= n;
      else if (/^(cfir|cfirst|cr|crewind)$/.test(name)) i = 0;
      else if (/^(cla|clast)$/.test(name)) i = qf.list.length - 1;
      else if (name === 'cc') i = arg ? n - 1 : qf.idx;
      if (i < 0 || i >= qf.list.length) return this.fail(M('e553'));
      qf.idx = i;
      this.gotoQf(qf.list[i]);
      this.msg(M('qfItem', i + 1, qf.list.length, qf.list[i].text));
    }
    qfList() {
      const qf = this.shared.qf;
      if (!qf.list.length) return this.fail(M('e42'));
      this.list = qf.list.map((q, i) => (i === qf.idx ? '> ' : '  ') + String(i + 1).padStart(2) + ' ' + q.name + '|' + (q.r + 1) + ' col ' + (q.c + 1) + '| ' + q.text);
    }

    exBang(range, cmd) {
      if (!range) {
        const out = runFilter(cmd, this.lines);
        if (out === null) return this.fail(M('shellNA', cmd.trim()));
        this.list = out;
        return;
      }
      const lines = this.lines.slice(range[0], range[1] + 1);
      const out = runFilter(cmd, lines);
      if (out === null) return this.fail(M('shellNA', cmd.trim()));
      this.lines.splice(range[0], range[1] - range[0] + 1, ...out);
      this.r = range[0]; this.c = this.fnb(this.r);
      if (range[1] - range[0] + 1 > 2) this.msg((range[1] - range[0] + 1) + (LANG === 'en' ? ' lines filtered' : ' Zeilen gefiltert'));
    }
    exRead(range, arg) {
      let lines;
      if (arg.startsWith('!')) { lines = runFilter(arg.slice(1), []); if (lines === null) return this.fail(M('shellNA', arg.slice(1).trim())); }
      else {
        const b = this.findBufExact(arg);
        const text = b ? b.lines.join('\n') : this.shared.files[arg];
        if (text === undefined) return this.fail(M('e484', arg));
        lines = text.split('\n');
      }
      const at = range ? range[1] : this.r;
      this.lines.splice(at + 1, 0, ...lines);
      this.r = at + 1; this.c = this.fnb(this.r);
    }
    exSource(arg) {
      let text;
      if (!arg || arg === '%') text = this.lines.join('\n');
      else { const b = this.findBufExact(arg); text = b ? b.lines.join('\n') : this.shared.files[arg]; }
      if (text === undefined) return this.fail(M('e484', arg));
      let n = 0;
      const saved = this.lastEx;
      for (const line of text.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('"')) continue;
        this.ex(t.replace(/^:/, '')); this.exLog.pop(); n++;
        if (this.failed) break;
      }
      this.lastEx = saved;
      if (!this.failed) this.msg(M('sourced', n));
    }
    exLet(arg) {
      let m = arg.match(/^@([a-z0-9"/+*])\s*=\s*(['"])(.*)\2$/i);
      if (m) {
        let v = m[3];
        if (m[2] === '"') v = v.replace(/\\n/g, '\n').replace(/\\e/g, ESC).replace(/\\r/g, CR).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        if (m[1] === '/') { const re = this.compile(v); if (!re) return this.fail(M('badPat', v)); this.lastSearch = { src: v, re, dir: 1, off: '' }; this.hls = true; return; }
        this.regs[m[1].toLowerCase()] = { text: v, linewise: false };
        return this.msg(M('letDone', '@' + m[1]));
      }
      m = arg.match(/^(?:g:)?mapleader\s*=\s*(['"])(.*)\1$/);
      if (m) { this.shared.leader = m[2].replace(/\\<Space>|<Space>/i, ' ') || '\\'; return this.msg(M('leader', this.shared.leader === ' ' ? '<Space>' : this.shared.leader)); }
      m = arg.match(/^&(\w+)\s*=\s*(.+)$/);
      if (m) return this.exSet(m[1] + '=' + m[2].replace(/^['"]|['"]$/g, ''));
      if (/^[gbwlst]:\w+\s*=/.test(arg)) return;
      return this.fail(M('e15', arg));
    }
    exMap(name, arg) {
      const t = arg.trim();
      const mode = /^[nvxi]/.test(name) && !/^no(remap)?$/.test(name) ? name[0] : 'nv';
      const noremap = /nore|^no(remap)?$|^[nvxi]no(remap)?$/.test(name);
      const modes = mode === 'nv' ? ['n', 'v'] : [mode === 'x' ? 'v' : mode];
      if (!t) {
        const rows = [];
        for (const md of modes) for (const [lhs, m] of Object.entries(this.shared.maps[md])) rows.push(md + '  ' + toNotation(Array.from(lhs)).padEnd(14) + (m.noremap ? '* ' : '  ') + toNotation(m.rhs));
        this.list = rows.length ? rows : [M('noMaps')];
        return;
      }
      const sp = t.match(/^((?:<[^>]+>|\S)+?)\s+([\s\S]+)$/);
      if (!sp) {
        const lhs = parseNotation(t.replace(/^<(silent|buffer|nowait|expr|unique)>\s*/gi, ''), this.shared.leader).join('');
        const rows = [];
        for (const md of modes) { const m = this.shared.maps[md][lhs]; if (m) rows.push(md + '  ' + toNotation(Array.from(lhs)).padEnd(14) + (m.noremap ? '* ' : '  ') + toNotation(m.rhs)); }
        this.list = rows.length ? rows : [M('noMaps')];
        return;
      }
      const lhsSrc = sp[1].replace(/^(<(silent|buffer|nowait|expr|unique)>\s*)+/gi, '');
      const rhsSrc = sp[2].replace(/^(<(silent|buffer|nowait|expr|unique)>\s*)+/gi, '');
      const lhs = parseNotation(lhsSrc, this.shared.leader).join('');
      const rhs = parseNotation(rhsSrc, this.shared.leader);
      if (!lhs) return this.fail(M('e476'));
      for (const md of modes) this.shared.maps[md][lhs] = { rhs, noremap, src: rhsSrc };
    }
    exUnmap(name, arg) {
      const mode = /^[nvxi]/.test(name) && name !== 'unmap' ? name[0] : 'nv';
      const modes = mode === 'nv' ? ['n', 'v'] : [mode === 'x' ? 'v' : mode];
      const lhs = parseNotation(arg, this.shared.leader).join('');
      let found = false;
      for (const md of modes) if (this.shared.maps[md][lhs]) { delete this.shared.maps[md][lhs]; found = true; }
      if (!found) return this.fail(M('e31'));
    }
    exAbbr(arg) {
      if (!arg) {
        const rows = Object.entries(this.shared.abbr).map(([k, v]) => 'i  ' + k.padEnd(12) + v);
        this.list = rows.length ? rows : [M('noAbbr')];
        return;
      }
      const m = arg.match(/^(\S+)\s+([\s\S]+)$/);
      if (!m) { const v = this.shared.abbr[arg]; this.list = v !== undefined ? ['i  ' + arg.padEnd(12) + v] : [M('noAbbr')]; return; }
      this.shared.abbr[m[1]] = m[2];
    }

    exSub(range, rest) {
      if (!rest || /^[\s&gciIn]*$/.test(rest)) {
        if (!this.lastSub) return this.fail(M('noPat'));
        const keep = rest.includes('&') ? this.lastSub.flags : '';
        return this.substitute(range, this.lastSub.pat, this.lastSub.rep, keep + rest.replace(/[\s&]/g, ''));
      }
      const d = rest[0];
      if (/[a-zA-Z0-9\\"| ]/.test(d)) return this.fail(M('e146'));
      const parts = [];
      let cur = '', i = 1;
      while (i < rest.length) {
        const ch = rest[i];
        if (ch === '\\' && i + 1 < rest.length) {
          if (rest[i + 1] === d) { cur += parts.length === 0 ? '\\' + d : d; i += 2; continue; }
          cur += ch + rest[i + 1]; i += 2; continue;
        }
        if (ch === d && parts.length < 2) { parts.push(cur); cur = ''; i++; continue; }
        cur += ch; i++;
      }
      parts.push(cur);
      return this.substitute(range, parts[0], parts.length > 1 ? parts[1] : '', parts.length > 2 ? parts[2].trim() : '');
    }

    substitute(range, pat, rep, flags) {
      let src = pat;
      if (src === '') {
        if (!this.lastSearch) return this.fail(M('noPat'));
        src = this.lastSearch.src;
      }
      flags = flags.replace(/&/g, '');
      const ic = flags.includes('i') || (this.o.ignorecase && !flags.includes('I') && !(this.o.smartcase && /\p{Lu}/u.test(src)));
      const re = compileVim(src, ic, false);
      if (!re) return this.fail(M('badPat', src));
      const prevRep = this.lastSub ? this.lastSub.rep : null;
      if (rep === '~') rep = prevRep || '';
      this.lastSub = { pat: src, rep, flags };
      this.lastSearch = { src, re: compileVim(src, ic, false), dir: 1, off: '' };
      this.hls = true;
      if (flags.includes('c')) return this.startConfirm(range, re, rep, flags, prevRep);
      if (flags.includes('n')) {
        let n = 0, lines = 0;
        for (let r = range[0]; r <= range[1]; r++) { re.lastIndex = 0; const ms = this.lines[r].match(re); if (ms) { n += flags.includes('g') ? ms.length : 1; lines++; } }
        if (!n) return this.fail(M('e486', src));
        return this.msg(LANG === 'en' ? n + ' matches on ' + lines + ' lines' : n + ' Treffer in ' + lines + ' Zeilen');
      }
      const reOne = new RegExp(re.source, re.flags.replace('g', ''));
      const L = this.lines;
      let count = 0, lines = 0, lastLine = -1;
      const fn = (...a) => {
        count++;
        let g = a.slice(0, -2);
        if (typeof a[a.length - 1] === 'object') g = a.slice(0, -3);
        return vimReplace(rep, g, prevRep);
      };
      for (let r = range[0]; r <= range[1]; r++) {
        const before = count;
        const out = flags.includes('g') ? L[r].replace(re, fn) : L[r].replace(reOne, fn);
        if (count > before) { lines++; lastLine = r; L[r] = out; }
      }
      if (!count) return this.fail(M('e486', src));
      let extraAbove = 0;
      for (let r = range[1]; r >= range[0]; r--) {
        if (L[r].includes('\n')) {
          const parts = L[r].split('\n');
          L.splice(r, 1, ...parts);
          if (r < lastLine) extraAbove += parts.length - 1;
        }
      }
      this.r = lastLine + extraAbove; this.c = this.fnb(this.r);
      if (lines > 1 || count > 2) this.msg(M('subs', count, lines));
    }

    startConfirm(range, re, rep, flags, prevRep) {
      this.confirm = { range: range.slice(), re, rep, flags, prevRep, r: range[0], c: 0, count: 0, lines: new Set(), all: false };
      this.cmdFrom = { mode: 'normal' };
      this.mode = 'confirm';
      if (!this.nextConfirm()) { this.mode = 'normal'; this.confirm = null; return this.fail(M('e486', this.lastSub.pat)); }
    }
    nextConfirm() {
      const cf = this.confirm, L = this.lines;
      while (cf.r <= cf.range[1] && cf.r <= this.last) {
        const reOne = new RegExp(cf.re.source, cf.re.flags);
        reOne.lastIndex = cf.c;
        const m = reOne.exec(L[cf.r]);
        if (m && (cf.c === 0 || cf.flags.includes('g'))) {
          cf.m = m;
          this.r = cf.r; this.c = m.index;
          this.inc = { r: cf.r, c: m.index, len: Math.max(1, m[0].length) };
          this.msg(M('confirm', cf.rep), 'warn');
          return true;
        }
        cf.r++; cf.c = 0;
      }
      return false;
    }
    confirmKey(key) {
      const cf = this.confirm, L = this.lines;
      const doOne = () => {
        const m = cf.m;
        const g = Array.from(m);
        const rep = vimReplace(cf.rep, g, cf.prevRep);
        L[cf.r] = L[cf.r].slice(0, m.index) + rep + L[cf.r].slice(m.index + m[0].length);
        cf.count++; cf.lines.add(cf.r);
        if (cf.flags.includes('g')) cf.c = m.index + rep.length + (m[0].length ? 0 : 1);
        else { cf.r++; cf.c = 0; }
      };
      const skip = () => { if (cf.flags.includes('g')) cf.c = cf.m.index + Math.max(1, cf.m[0].length); else { cf.r++; cf.c = 0; } };
      const end = () => {
        this.mode = 'normal'; this.confirm = null; this.inc = null; this.message = null;
        if (cf.count > 1 || cf.lines.size > 1) this.msg(M('subs', cf.count, cf.lines.size));
        this.clampNormal();
      };
      if (key === 'y') { doOne(); if (!this.nextConfirm()) end(); return; }
      if (key === 'n') { skip(); if (!this.nextConfirm()) end(); return; }
      if (key === 'l') { doOne(); return end(); }
      if (key === 'a') { do { doOne(); } while (this.nextConfirm()); return end(); }
      if (key === 'q' || key === ESC) return end();
      if (key === CTRL.e || key === CTRL.y) return;
    }

    exGlobal(range, rest, invert) {
      range = range || [0, this.last];
      const d = rest[0];
      if (!d) return this.fail(M('e476'));
      let pat = '', i = 1;
      while (i < rest.length && rest[i] !== d) {
        if (rest[i] === '\\' && i + 1 < rest.length) { pat += rest[i] + rest[i + 1]; i += 2; continue; }
        pat += rest[i]; i++;
      }
      const cmd = rest.slice(i + 1).trim() || 'p';
      const src = pat || (this.lastSearch && this.lastSearch.src);
      if (!src) return this.fail(M('noPat'));
      const re = this.compile(src);
      if (!re) return this.fail(M('badPat', src));
      this.lastSearch = { src, re, dir: 1, off: '' };
      const marked = [];
      for (let r = range[0]; r <= range[1]; r++) { re.lastIndex = 0; if (re.test(this.lines[r]) !== invert) marked.push(r); }
      if (!marked.length) return this.fail(M('e486', src));
      if (cmd === 'p' || cmd === 'print' || cmd === '#' || cmd === 'nu' || cmd === 'number') {
        this.list = marked.map(r => (r + 1) + '  ' + this.lines[r]);
        return;
      }
      const savedEx = this.lastEx;
      const queue = marked.slice();
      while (queue.length) {
        const idx = queue.shift();
        if (idx < 0 || idx >= this.lines.length) continue;
        const pre = this.lines.slice();
        this.r = idx; this.c = 0;
        this.ex(cmd);
        this.exLog.pop();
        const post = this.lines, delta = post.length - pre.length;
        if (delta) {
          let d = 0;
          while (d < pre.length && d < post.length && pre[d] === post[d]) d++;
          for (let q = 0; q < queue.length; q++) if (queue[q] >= d) queue[q] += delta;
        }
      }
      this.lastEx = savedEx;
      this.failed = false;
      this.clampNormal();
    }

    exMove(range, arg, copy) {
      let t;
      try { const pr = this.parseRange(arg); t = pr.range ? pr.range[1] : this.r; } catch (e) { return this.fail(e.message); }
      if (arg.trim() === '0') t = -1;
      if (t < -1 || t > this.last) return this.fail(M('e16'));
      const L = this.lines;
      const block = L.slice(range[0], range[1] + 1);
      if (copy) {
        L.splice(t + 1, 0, ...block);
        this.r = t + block.length;
      } else {
        if (t >= range[0] && t < range[1]) return this.fail(M('e134'));
        if (t === range[1] || t === range[0] - 1) { this.r = range[1]; this.c = this.fnb(this.r); return; }
        L.splice(range[0], block.length);
        let dest = t;
        if (t > range[1]) dest -= block.length;
        L.splice(dest + 1, 0, ...block);
        this.r = dest + block.length;
      }
      this.c = this.fnb(this.r);
    }

    exSort(range, flags, reverse) {
      const L = this.lines;
      let part = L.slice(range[0], range[1] + 1);
      const ic = flags.includes('i'), num = flags.includes('n');
      if (num) {
        const val = s => { const m = s.match(/-?\d+/); return m ? parseInt(m[0], 10) : -Infinity; };
        part.sort((a, b) => val(a) - val(b));
      } else {
        part.sort((a, b) => {
          const x = ic ? a.toLowerCase() : a, y = ic ? b.toLowerCase() : b;
          return x < y ? -1 : x > y ? 1 : 0;
        });
      }
      if (reverse) part.reverse();
      if (flags.includes('u')) part = part.filter((s, i) => i === 0 || (ic ? s.toLowerCase() !== part[i - 1].toLowerCase() : s !== part[i - 1]));
      L.splice(range[0], range[1] - range[0] + 1, ...part);
      this.r = range[0]; this.c = 0;
    }

    exNormal(range, keysStr, bang) {
      const keys = parseNotation(keysStr, this.shared.leader);
      let offset = 0;
      for (let orig = range[0]; orig <= range[1]; orig++) {
        const idx = orig + offset;
        if (idx < 0 || idx >= this.lines.length) break;
        const before = this.lines.length;
        this.mode = 'normal'; this.pending = '';
        this.r = idx; this.c = 0; this.failed = false;
        for (const k of keys) { if (bang) this.dispatch(k); else this.feedKey(k, 0); if (this.failed) break; }
        this.mapBuf = '';
        for (let g = 0; g < 3 && this.mode !== 'normal'; g++) this.dispatch(ESC);
        this.pending = '';
        offset += this.lines.length - before;
      }
      this.failed = false;
    }

    exSet(arg) {
      if (!arg) return this.msg(M('setHelp'));
      const out = [];
      const so = this.shared.o;
      for (let item of arg.split(/\s+/)) {
        const m = item.match(/^(\w+)([+\-^]?=)(.*)$/);
        if (m) {
          const k = ALIAS[m[1]] || m[1];
          if (!(k in OPT_DEFAULTS)) return this.fail(M('e518', m[1]));
          if (typeof OPT_DEFAULTS[k] === 'number') {
            const v = parseInt(m[3], 10);
            if (isNaN(v)) return this.fail(M('e518', item));
            so[k] = m[2] === '+=' ? so[k] + v : m[2] === '-=' ? so[k] - v : v;
          } else if (typeof OPT_DEFAULTS[k] === 'string') {
            so[k] = m[3];
            if (k === 'foldmethod') { if (m[3] === 'indent') this.computeIndentFolds(); else this.folds = this.folds.filter(f => !f.auto); }
          } else return this.fail(M('e518', item));
          continue;
        }
        let val = true, toggle = false, query = false, reset = false;
        if (item.endsWith('!')) { toggle = true; item = item.slice(0, -1); }
        if (item.endsWith('?')) { query = true; item = item.slice(0, -1); }
        if (item.endsWith('&')) { reset = true; item = item.slice(0, -1); }
        if (item.startsWith('no') && (ALIAS[item.slice(2)] || OPT_DEFAULTS[item.slice(2)] !== undefined)) { val = false; item = item.slice(2); }
        else if (item.startsWith('inv')) { toggle = true; item = item.slice(3); }
        const k = ALIAS[item] || item;
        if (item === 'all') { out.push(...OPTS.map(o => typeof so[o] === 'boolean' ? (so[o] ? '  ' : 'no') + o : o + '=' + so[o])); continue; }
        if (!(k in OPT_DEFAULTS)) return this.fail(M('e518', item));
        if (reset) { so[k] = OPT_DEFAULTS[k]; continue; }
        if (query || typeof OPT_DEFAULTS[k] !== 'boolean') { out.push(typeof so[k] === 'boolean' ? (so[k] ? '  ' : 'no') + k : k + '=' + so[k]); continue; }
        so[k] = toggle ? !so[k] : val;
        if (k === 'hlsearch' && so[k]) this.hls = true;
      }
      if (out.length) { if (out.length > 3) this.list = out; else this.msg(out.join('  ')); }
    }

    showRegisters() {
      const order = ['"', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'].concat('abcdefghijklmnopqrstuvwxyz'.split(''), ['+', '*']);
      const rows = [M('regHead')];
      for (const k of order) {
        const R = this.regs[k];
        if (!R) continue;
        const t = R.text.replace(/\n/g, '^J');
        rows.push((R.block ? '  b  ' : R.linewise ? '  l  ' : '  c  ') + '"' + k + '   ' + (t.length > 60 ? t.slice(0, 60) + '…' : t));
      }
      if (this.shared.lastInserted) rows.push('  c  ".   ' + this.shared.lastInserted.replace(/\n/g, '^J').slice(0, 60));
      if (this.lastEx) rows.push('  c  ":   ' + this.lastEx);
      rows.push('  c  "%   ' + this.buf.name);
      if (this.lastSearch) rows.push('  c  "/   ' + this.lastSearch.src);
      this.list = rows;
    }
    showMarks() {
      const rows = [M('markHead')];
      const ks = Object.keys(this.marks).sort();
      for (const k of ks) {
        const m = this.marks[k];
        if (m.r > this.last) continue;
        rows.push(' ' + k + '    ' + String(m.r + 1).padStart(4) + '  ' + String(m.c).padStart(4) + '   ' + this.lines[m.r].trim().slice(0, 40));
      }
      for (const k of Object.keys(this.shared.gmarks).sort()) {
        const m = this.shared.gmarks[k];
        rows.push(' ' + k + '    ' + String(m.r + 1).padStart(4) + '  ' + String(m.c).padStart(4) + '   ' + m.buf.name);
      }
      this.list = rows.length > 1 ? rows : [M('markNone')];
    }
    showJumps() {
      const rows = [M('jumpsHead')];
      this.jumps.forEach((j, i) => {
        const d = Math.abs(i - this.jumpIdx);
        const ln = j.buf.lines[j.r] !== undefined ? j.buf.lines[j.r].trim() : '';
        rows.push((i === this.jumpIdx ? '>' : ' ') + String(d).padStart(4) + String(j.r + 1).padStart(6) + String(j.c).padStart(5) + ' ' + (j.buf === this.buf ? ln.slice(0, 40) : j.buf.name));
      });
      if (this.jumpIdx >= this.jumps.length) rows.push('>');
      this.list = rows;
    }
    showChanges() {
      const b = this.buf, rows = [M('changesHead')];
      b.changes.forEach((p, i) => rows.push((i === b.changeIdx ? '>' : ' ') + String(Math.abs(i - b.changeIdx)).padStart(5) + String(p.r + 1).padStart(6) + String(p.c).padStart(5) + ' ' + (this.lines[p.r] || '').trim().slice(0, 40)));
      if (b.changeIdx >= b.changes.length) rows.push('>');
      this.list = rows;
    }
  }

  /* ---------- Arbeitsbereich: Fenster und Tabs ---------- */
  class Workspace {
    constructor(opts) {
      opts = opts || {};
      this.shared = makeShared(opts.o);
      this.shared.ws = this;
      this.rows = opts.height || 12;
      this.nextWin = 1;
      const files = opts.files || null;
      let first = null;
      if (files && Object.keys(files).length) {
        const names = Object.keys(files);
        for (const name of names) this.shared.files[name] = files[name];
        const open = opts.open || names.filter(n => !(opts.closed || []).includes(n));
        for (const name of open) {
          const b = new Buffer(this.shared.nextBuf++, name, files[name]);
          this.shared.buffers.push(b);
          if (!first) first = b;
        }
      }
      if (!first) {
        first = new Buffer(this.shared.nextBuf++, opts.name || (LANG === 'en' ? 'practice.txt' : 'uebung.txt'), opts.text || '');
        this.shared.buffers.push(first);
        if (opts.saved !== false) this.shared.files[first.name] = first.lines.join('\n');
      }
      const w = this.newWin(first);
      this.tabs = [{ root: { type: 'win', win: w }, cur: w, prev: null }];
      this.tabIdx = 0;
      this.layout();
    }
    get tab() { return this.tabs[this.tabIdx]; }
    get win() { return this.tab.cur; }
    get active() { return this.win.v; }
    newWin(buf, from) {
      const v = new Vim('', { height: this.rows, buf }, this);
      if (from) {
        v.r = from.r; v.c = from.c; v.top = from.top; v.want = from.want;
        v.foldsByBuf = JSON.parse(JSON.stringify(from.foldsByBuf));
        v.jumps = from.jumps.slice(); v.jumpIdx = from.jumpIdx; v.alt = from.alt;
      }
      return { id: this.nextWin++, v };
    }
    feed(key) {
      const v = this.active;
      v.feed(key);
      this.layout();
      if (this.active !== v) this.active.scrollToCursor();
    }
    allWindows() { const out = []; this.tabs.forEach(t => this.leaves(t.root, out)); return out; }
    windows(tab) { const out = []; this.leaves((tab || this.tab).root, out); return out; }
    leaves(n, out) { if (n.type === 'win') out.push(n.win); else n.children.forEach(c => this.leaves(c, out)); return out; }
    windowCount() { return this.windows().length; }

    rects(tab) {
      const out = [];
      const walk = (n, x, y, w, h) => {
        if (n.type === 'win') { out.push({ win: n.win, x, y, w, h }); return; }
        const total = n.sizes.reduce((a, b) => a + b, 0);
        let off = 0;
        n.children.forEach((c, i) => {
          const f = n.sizes[i] / total;
          if (n.dir === 'col') walk(c, x, y + off * h, w, f * h); else walk(c, x + off * w, y, f * w, h);
          off += f;
        });
      };
      walk((tab || this.tab).root, 0, 0, 1, 1);
      return out;
    }
    layout() {
      for (const t of this.tabs) {
        const rs = this.rects(t);
        const multi = rs.length > 1;
        for (const r of rs) {
          r.win.v.o.height = Math.max(1, Math.round(r.h * this.rows) - (multi ? 1 : 0));
          r.win.v.scrollToCursor();
        }
      }
    }
    findParent(node, target, parent) {
      if (node === target) return parent;
      if (node.type === 'split') for (const c of node.children) { const p = this.findParent(c, target, node); if (p !== undefined) return p; }
      return undefined;
    }
    leafOf(win, node) {
      node = node || this.tab.root;
      if (node.type === 'win') return node.win === win ? node : null;
      for (const c of node.children) { const f = this.leafOf(win, c); if (f) return f; }
      return null;
    }
    split(dir, buf) {
      const cur = this.win;
      const leaf = this.leafOf(cur);
      const nw = this.newWin(buf || cur.v.buf, buf && buf !== cur.v.buf ? null : cur.v);
      if (buf && buf !== cur.v.buf) { nw.v.alt = cur.v.buf; nw.v.r = Math.min(buf.lastPos.r, buf.lines.length - 1); nw.v.c = buf.lastPos.c; }
      const parent = this.findParent(this.tab.root, leaf, null);
      const newLeaf = { type: 'win', win: nw };
      if (parent && parent.dir === dir) {
        const i = parent.children.indexOf(leaf);
        parent.children.splice(i, 0, newLeaf);
        const s = parent.sizes[i] / 2;
        parent.sizes.splice(i, 1, s, s);
      } else {
        const node = { type: 'split', dir, children: [newLeaf, { type: 'win', win: cur }], sizes: [1, 1] };
        if (!parent) this.tab.root = node;
        else { const i = parent.children.indexOf(leaf); parent.children[i] = node; }
      }
      this.tab.prev = cur;
      this.tab.cur = nw;
      this.layout();
      return nw;
    }
    closeWin(v, force) {
      const wins = this.windows();
      const win = wins.find(w => w.v === v) || this.win;
      if (wins.length === 1) {
        if (this.tabs.length === 1) { v.msg(M('quit')); return; }
        this.tabs.splice(this.tabIdx, 1);
        this.tabIdx = Math.min(this.tabIdx, this.tabs.length - 1);
        this.layout();
        return;
      }
      const leaf = this.leafOf(win);
      const parent = this.findParent(this.tab.root, leaf, null);
      const i = parent.children.indexOf(leaf);
      parent.children.splice(i, 1);
      parent.sizes.splice(i, 1);
      if (parent.children.length === 1) {
        const only = parent.children[0];
        const gp = this.findParent(this.tab.root, parent, null);
        if (!gp) this.tab.root = only; else gp.children[gp.children.indexOf(parent)] = only;
      }
      const remaining = this.windows();
      const prev = this.tab.prev && remaining.includes(this.tab.prev) ? this.tab.prev : remaining[Math.min(i, remaining.length - 1)];
      this.tab.cur = prev;
      this.layout();
      void force;
    }
    only() { this.tab.root = { type: 'win', win: this.win }; this.layout(); }
    onlyAll() { this.tabs = [this.tab]; this.tabIdx = 0; this.only(); }
    focus(win) { if (win && win !== this.win) { this.tab.prev = this.win; this.tab.cur = win; } }
    neighbor(dir, count) {
      let cur = this.win;
      for (let k = 0; k < (count || 1); k++) {
        const rs = this.rects();
        const me = rs.find(r => r.win === cur);
        const eps = 1e-6;
        let best = null, bestD = Infinity;
        for (const r of rs) {
          if (r.win === cur) continue;
          let ok = false, d = 0;
          const vOverlap = r.y < me.y + me.h - eps && r.y + r.h > me.y + eps;
          const hOverlap = r.x < me.x + me.w - eps && r.x + r.w > me.x + eps;
          if (dir === 'l') { ok = vOverlap && r.x >= me.x + me.w - eps; d = r.x - me.x; }
          if (dir === 'h') { ok = vOverlap && r.x + r.w <= me.x + eps; d = me.x - r.x; }
          if (dir === 'j') { ok = hOverlap && r.y >= me.y + me.h - eps; d = r.y - me.y; }
          if (dir === 'k') { ok = hOverlap && r.y + r.h <= me.y + eps; d = me.y - r.y; }
          if (ok && d < bestD) { bestD = d; best = r.win; }
        }
        if (!best) break;
        cur = best;
      }
      return cur;
    }
    resize(win, delta, absolute) {
      const leaf = this.leafOf(win);
      const parent = this.findParent(this.tab.root, leaf, null);
      if (!parent) return;
      const i = parent.children.indexOf(leaf);
      if (absolute === 'max') { parent.sizes = parent.sizes.map((s, j) => j === i ? 10 : 0.6); }
      else if (absolute === 'equal') { parent.sizes = parent.sizes.map(() => 1); }
      else parent.sizes[i] = Math.max(0.3, parent.sizes[i] + delta);
      this.layout();
    }
    wincmd(v, ch, count) {
      const C = CTRL;
      switch (ch) {
        case 's': case 'S': case C.s: this.split('col'); break;
        case 'v': case C.v: this.split('row'); break;
        case 'n': case C.n: { const b = v.newBuffer('[No Name]', ''); this.split('col', b); break; }
        case 'w': case C.w: {
          const ws = this.windows(), i = ws.indexOf(this.win);
          this.focus(count ? ws[Math.min(count, ws.length) - 1] : ws[(i + 1) % ws.length]);
          break;
        }
        case 'W': { const ws = this.windows(), i = ws.indexOf(this.win); this.focus(ws[(i - 1 + ws.length) % ws.length]); break; }
        case 'p': case C.p: if (this.tab.prev && this.windows().includes(this.tab.prev)) this.focus(this.tab.prev); else v.fail(); break;
        case 'h': case 'j': case 'k': case 'l': case C.h: case C.j: case C.k: case C.l: case LEFT: case RIGHT: case UP: case DOWN: {
          const d = { [C.h]: 'h', [C.j]: 'j', [C.k]: 'k', [C.l]: 'l', [LEFT]: 'h', [RIGHT]: 'l', [UP]: 'k', [DOWN]: 'j' }[ch] || ch;
          const n = this.neighbor(d, count || 1);
          if (n === this.win) v.fail(); else this.focus(n);
          break;
        }
        case 't': case C.t: this.focus(this.windows()[0]); break;
        case 'b': case C.b: { const ws = this.windows(); this.focus(ws[ws.length - 1]); break; }
        case 'c': case C.c: if (this.windowCount() === 1) v.fail(M('e444')); else this.closeWin(v); break;
        case 'q': case C.q: v.ex('q'); break;
        case 'o': case C.o: this.only(); break;
        case '=': this.resize(this.win, 0, 'equal'); break;
        case '+': this.resize(this.win, 0.4 * (count || 1)); break;
        case '-': this.resize(this.win, -0.4 * (count || 1)); break;
        case '>': this.resize(this.win, 0.4 * (count || 1)); break;
        case '<': this.resize(this.win, -0.4 * (count || 1)); break;
        case '_': case '|': this.resize(this.win, 0, 'max'); break;
        case 'T': {
          if (this.windowCount() === 1) { v.fail(); break; }
          const w = this.win;
          this.closeWin(v);
          this.tabs.splice(this.tabIdx + 1, 0, { root: { type: 'win', win: w }, cur: w, prev: null });
          this.tabIdx++;
          break;
        }
        case 'x': case C.x: {
          const leaf = this.leafOf(this.win), parent = this.findParent(this.tab.root, leaf, null);
          if (!parent) { v.fail(); break; }
          const i = parent.children.indexOf(leaf), j = i + 1 < parent.children.length ? i + 1 : i - 1;
          const tmp = parent.children[i]; parent.children[i] = parent.children[j]; parent.children[j] = tmp;
          break;
        }
        default: v.fail();
      }
      this.layout();
    }
    tabcmd(cmd, n) {
      const len = this.tabs.length;
      if (cmd === 'next') this.tabIdx = (this.tabIdx + 1) % len;
      else if (cmd === 'prev') this.tabIdx = (this.tabIdx - (n || 1) % len + len) % len;
      else if (cmd === 'goto') this.tabIdx = Math.max(0, Math.min(len - 1, n - 1));
      else if (cmd === 'first') this.tabIdx = 0;
      else if (cmd === 'last') this.tabIdx = len - 1;
      this.layout();
    }
    newTab(buf) {
      const w = this.newWin(buf);
      this.tabs.splice(this.tabIdx + 1, 0, { root: { type: 'win', win: w }, cur: w, prev: null });
      this.tabIdx++;
      this.layout();
      return w;
    }
    bufFor(v, arg, bang) {
      if (!arg) return null;
      let b = v.findBufExact(arg);
      if (!b) { const text = v.shared.files[arg]; b = v.newBuffer(arg, text === undefined ? '' : text); if (text === undefined) v.msg(M('newFile', arg)); }
      void bang;
      return b;
    }
    exWin(v, name, arg, bang) {
      const is = (...n) => n.includes(name);
      if (is('sp', 'split')) { this.split('col', this.bufFor(v, arg)); return; }
      if (is('vs', 'vsplit')) { this.split('row', this.bufFor(v, arg)); return; }
      if (is('new')) { this.split('col', arg ? this.bufFor(v, arg) : v.newBuffer('[No Name]', '')); return; }
      if (is('vne', 'vnew')) { this.split('row', arg ? this.bufFor(v, arg) : v.newBuffer('[No Name]', '')); return; }
      if (is('sb', 'sbuffer')) {
        const b = /^\d+$/.test(arg) ? v.shared.buffers.find(x => x.id === parseInt(arg, 10)) : v.findBuf(arg);
        if (!b) return v.fail(M('e94', arg));
        this.split('col', b); return;
      }
      if (is('on', 'only')) { this.only(); return; }
      if (is('winc', 'wincmd')) { this.wincmd(v, arg[0], 0); return; }
      if (is('tabnew', 'tabe', 'tabedit')) { this.newTab(arg ? this.bufFor(v, arg) : v.newBuffer('[No Name]', '')); return; }
      if (is('tabn', 'tabnext')) { this.tabcmd(arg ? 'goto' : 'next', parseInt(arg, 10)); return; }
      if (is('tabp', 'tabprevious', 'tabN', 'tabNext')) { this.tabcmd('prev', parseInt(arg, 10) || 1); return; }
      if (is('tabfir', 'tabfirst')) { this.tabcmd('first'); return; }
      if (is('tabl', 'tablast')) { this.tabcmd('last'); return; }
      if (is('tabc', 'tabclose')) {
        if (this.tabs.length === 1) return v.fail(M('e784'));
        this.tabs.splice(this.tabIdx, 1);
        this.tabIdx = Math.min(this.tabIdx, this.tabs.length - 1);
        this.layout();
        return;
      }
      if (is('tabo', 'tabonly')) { this.tabs = [this.tab]; this.tabIdx = 0; this.layout(); return; }
      if (is('tabs')) {
        const rows = [];
        this.tabs.forEach((t, i) => {
          rows.push(M('tabHead', i + 1));
          this.windows(t).forEach(w => rows.push((t.cur === w && i === this.tabIdx ? '> ' : '    ') + (w.v.buf.modified ? '+ ' : '  ') + w.v.buf.name));
        });
        v.list = rows;
        return;
      }
      void bang;
    }
    doAll(kind, cmd) {
      const startTab = this.tabIdx, startWin = this.win;
      if (kind === 'win') {
        for (const w of this.windows()) { this.focus(w); w.v.ex(cmd); w.v.exLog.pop(); }
        this.focus(startWin);
      } else {
        for (let i = 0; i < this.tabs.length; i++) { this.tabIdx = i; const v = this.active; v.ex(cmd); v.exLog.pop(); }
        this.tabIdx = startTab;
      }
      this.layout();
    }
    bufferText(name) {
      const b = this.shared.buffers.find(x => x.name === name);
      return b ? b.lines.join('\n') : null;
    }
  }

  Vim.setLang = l => { LANG = MSG[l] ? l : 'de'; };
  Vim.keys = { ESC, CR, BS, TAB, DEL, LEFT, RIGHT, UP, DOWN, CTRL };
  Vim.parseNotation = parseNotation;
  Vim.toNotation = toNotation;
  Vim.keyLabel = keyLabel;
  Vim.compileVim = compileVim;
  Vim.runFilter = runFilter;
  Vim.Workspace = Workspace;
  Vim.Buffer = Buffer;
  Vim.M = M;
  root.Vim = Vim;
  if (typeof module !== 'undefined' && module.exports) module.exports = Vim;
})(typeof window !== 'undefined' ? window : this);
