/* Normalmodus · Vim-Engine
   Ein kompakter Vim-Emulator im Browser: Modi, Motions, Operatoren, Textobjekte,
   Register, Makros, Marken, Punkt-Befehl, Suche und Ex-Befehle. */
(function (root) {
  'use strict';

  const ESC = '\x1b', CR = '\r', BS = '\b', TAB = '\t', DEL = '\x7f';
  const LEFT = '', RIGHT = '', UP = '', DOWN = '';
  const CTRL = {};
  for (const ch of 'abcdefghijklmnopqrstuvwxyz') CTRL[ch] = String.fromCharCode(ch.charCodeAt(0) - 96);

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

  const caseFn = op => {
    let f;
    if (op.endsWith('~')) f = ch => { const u = ch.toUpperCase(); if (u !== ch) return u.length === 1 ? u : ch; return ch.toLowerCase(); };
    else if (op.endsWith('U')) f = ch => { const u = ch.toUpperCase(); return u.length === 1 ? u : ch; };
    else f = ch => ch.toLowerCase();
    return s => Array.from(s).map(f).join('');
  };

  /* ---------- Tasten-Notation ---------- */
  const NAMES = { [ESC]: 'Esc', [CR]: 'Enter', [BS]: '⌫', [TAB]: 'Tab', [DEL]: 'Entf', ' ': '␣', [LEFT]: '←', [RIGHT]: '→', [UP]: '↑', [DOWN]: '↓' };
  function keyLabel(k) {
    if (NAMES[k]) return NAMES[k];
    const code = k.charCodeAt(0);
    if (code < 32) return 'Ctrl-' + String.fromCharCode(code + 96);
    return k;
  }
  const NOTATION = { esc: ESC, cr: CR, enter: CR, return: CR, bs: BS, tab: TAB, del: DEL, space: ' ', left: LEFT, right: RIGHT, up: UP, down: DOWN, lt: '<', bar: '|' };
  function parseNotation(s) {
    const out = [];
    let i = 0;
    while (i < s.length) {
      if (s[i] === '<') {
        const j = s.indexOf('>', i);
        if (j > i + 1) {
          const name = s.slice(i + 1, j).toLowerCase();
          let k = null;
          if (NOTATION[name] !== undefined) k = NOTATION[name];
          else { const m = name.match(/^c-([a-z\[])$/); if (m) k = m[1] === '[' ? ESC : CTRL[m[1]]; }
          if (k !== null) { out.push(k); i = j + 1; continue; }
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
      if (code < 32) return '<C-' + String.fromCharCode(code + 96) + '>';
      return k;
    }).join('');
  }

  /* ---------- Vim-Regex nach JS übersetzen ---------- */
  const KW = '[\\p{L}\\p{N}_]';
  function compileVim(pat, ic) {
    if (/\\c/.test(pat)) { ic = true; pat = pat.replace(/\\c/g, ''); }
    if (/\\C/.test(pat)) { ic = false; pat = pat.replace(/\\C/g, ''); }
    let out = '', i = 0, inClass = false;
    while (i < pat.length) {
      const ch = pat[i];
      if (inClass) {
        if (ch === ']') { inClass = false; out += ']'; i++; continue; }
        if (ch === '\\') {
          const n = pat[i + 1];
          if (n === undefined) out += '\\\\';
          else if ('dswDSWnt]\\^-'.includes(n)) out += '\\' + n;
          else out += /[\^$\\.*+?()[\]{}|\/]/.test(n) ? '\\' + n : n;
          i += 2; continue;
        }
        out += ch; i++; continue;
      }
      if (ch === '\\') {
        const n = pat[i + 1];
        i += 2;
        switch (n) {
          case '(': out += '('; break;
          case ')': out += ')'; break;
          case '|': out += '|'; break;
          case '+': out += '+'; break;
          case '=': case '?': out += '?'; break;
          case '{': {
            const j = pat.indexOf('}', i);
            if (j < 0) { out += '\\{'; break; }
            let q = pat.slice(i, j), lazy = false;
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
          case 'u': out += '\\p{Lu}'; break;
          case 'l': out += '\\p{Ll}'; break;
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
    try { return new RegExp(out, 'gu' + (ic ? 'i' : '')); } catch (e) { return null; }
  }

  function vimReplace(rep, m) {
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
      emit(ch); i++;
    }
    return out;
  }

  /* ---------- Befehlstabellen ---------- */
  const MOTIONS = {
    h: 0, j: 0, k: 0, l: 0, [BS]: 0, ' ': 0, [LEFT]: 0, [RIGHT]: 0, [UP]: 0, [DOWN]: 0,
    w: 0, W: 0, b: 0, B: 0, e: 0, E: 0, ge: 0, gE: 0, '0': 0, '^': 0, '$': 0, g_: 0, '|': 0,
    gg: 0, G: 0, '{': 0, '}': 0, '%': 0, H: 0, M: 0, L: 0, _: 0, '+': 0, '-': 0, [CR]: 0,
    n: 0, N: 0, '*': 0, '#': 0, [CTRL.d]: 0, [CTRL.u]: 0, [CTRL.f]: 0, [CTRL.b]: 0,
    f: 1, F: 1, t: 1, T: 1, ';': 0, ',': 0, "'": 1, '`': 1
  };
  const OPS = ['g~', 'gu', 'gU', 'd', 'c', 'y', '>', '<'];
  const NCMDS = {
    x: 0, X: 0, [DEL]: 0, s: 0, S: 0, D: 0, C: 0, Y: 0, p: 0, P: 0, u: 0, [CTRL.r]: 0, '.': 0,
    i: 0, a: 0, I: 0, A: 0, o: 0, O: 0, R: 0, v: 0, V: 0, [CTRL.v]: 0, gv: 0, J: 0, gJ: 0, '~': 0,
    zz: 0, zt: 0, zb: 0, ZZ: 0, ZQ: 0, ':': 0, '/': 0, '?': 0, [CTRL.a]: 0, [CTRL.x]: 0, '&': 0,
    r: 1, m: 1, q: 1, '@': 1
  };
  const VCMDS = {
    d: 0, x: 0, [DEL]: 0, X: 0, D: 0, c: 0, s: 0, C: 0, S: 0, R: 0, y: 0, Y: 0, '>': 0, '<': 0,
    '~': 0, u: 0, U: 0, 'g~': 0, gu: 0, gU: 0, J: 0, gJ: 0, r: 1, p: 0, P: 0, o: 0, O: 0, I: 0, A: 0,
    v: 0, V: 0, [CTRL.v]: 0, ':': 0, '/': 0, '?': 0, [CTRL.a]: 0, [CTRL.x]: 0,
    ['g' + CTRL.a]: 0, ['g' + CTRL.x]: 0, i: 1, a: 1
  };
  const CHANGE_CMDS = new Set(['x', 'X', DEL, 's', 'S', 'D', 'C', 'p', 'P', 'J', 'gJ', '~', 'r',
    'i', 'a', 'I', 'A', 'o', 'O', 'R', CTRL.a, CTRL.x, '&']);
  const VCHANGES = new Set(['d', 'x', DEL, 'X', 'D', 'c', 's', 'C', 'S', 'R', '>', '<', '~', 'u', 'U', 'g~', 'gu', 'gU', 'J', 'gJ', 'r']);
  const JUMPS = new Set(['G', 'gg', 'n', 'N', '*', '#', '%', '{', '}', "'", '`', 'H', 'M', 'L']);

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

  /* ---------- Engine ---------- */
  class Vim {
    constructor(text, o) {
      this.o = Object.assign({ height: 12, shiftwidth: 4, autoindent: true, number: true, relativenumber: false, hlsearch: true, ignorecase: false }, o || {});
      this.regs = {};
      this.marks = {};
      this.exLog = [];
      this.setText(text || '');
    }

    setText(text) {
      this.lines = text.replace(/\t/g, '    ').split('\n');
      this.r = 0; this.c = 0; this.want = 0; this.top = 0;
      this.mode = 'normal'; this.pending = '';
      this.undoStack = []; this.redoStack = [];
      this.insertPre = null; this.insertKeys = []; this.insertRepeat = null;
      this.dot = null; this.dotPending = null; this.replayingDot = false;
      this.recording = null; this.recBuf = [];
      this.cmdType = ''; this.cmdText = ''; this.cmdFrom = null;
      this.vs = null; this.lastVisual = null;
      this.lastFind = null; this.lastSearch = null; this.hls = false;
      this.lastSub = null; this.lastEx = null; this.lastMacro = null; this.lastJump = null;
      this.message = null; this.list = null;
      this.depth = 0; this.steps = 0; this.macroDepth = 0;
      this.failed = false; this.keystrokes = 0;
      this.blockInsert = null; this.autoIndentRow = null; this.insertRegPending = false;
      this.cmdRegPending = false; this.replaceStack = [];
      this.marks = {};
    }

    text() { return this.lines.join('\n'); }
    setCursor(r, c) { this.r = r; this.c = c; this.want = c; this.clampNormal(); this.scrollToCursor(); }
    get last() { return this.lines.length - 1; }

    msg(text, type) { this.message = { text, type: type || 'info' }; }
    fail(text) { this.failed = true; if (text) this.msg(text, 'error'); return false; }

    snap() { return { lines: this.lines.slice(), r: this.r, c: this.c }; }
    changed(s) {
      if (s.lines.length !== this.lines.length) return true;
      for (let i = 0; i < s.lines.length; i++) if (s.lines[i] !== this.lines[i]) return true;
      return false;
    }
    pushUndo(s) { this.undoStack.push(s); if (this.undoStack.length > 300) this.undoStack.shift(); this.redoStack = []; }

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
    scrollToCursor() {
      const h = this.o.height;
      if (this.r < this.top) this.top = this.r;
      else if (this.r >= this.top + h) this.top = this.r - h + 1;
      if (this.top > this.last) this.top = Math.max(0, this.last);
      if (this.top < 0) this.top = 0;
    }
    setJump() { this.lastJump = { r: this.r, c: this.c }; }

    /* ---- Eingabe ---- */
    feed(key) {
      this.failed = false;
      this.list = null;
      if (this.mode !== 'cmdline') this.message = null;
      this.keystrokes++;
      if (this.recording) this.recBuf.push(key);
      this.steps = 0;
      this.dispatch(key);
      this.scrollToCursor();
    }

    dispatch(key) {
      if (++this.steps > 100000) { this.failed = true; return; }
      this.depth++;
      const before = this.mode;
      const top = this.depth === 1;
      const pre = (top && !INS[before]) ? this.snap() : null;
      if (INS[before]) {
        if (this.dotPending && !this.replayingDot) this.dotPending.push(key);
        if (before === 'insert' && key !== ESC && !this.insertRegPending) this.insertKeys.push(key);
      }
      switch (this.mode) {
        case 'normal': this.normalKey(key); break;
        case 'insert': this.insertKey(key); break;
        case 'replace': this.replaceKey(key); break;
        case 'cmdline': this.cmdKey(key); break;
        default: this.visualKey(key);
      }
      if (top && this.skipUndo) {
        this.skipUndo = false;
      } else if (top) {
        if (pre) {
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
      if (key === ESC) { this.pending = ''; return; }
      this.pending += key;
      const p = this.parse(this.pending, false);
      if (p === 'inc') return;
      const keys = this.pending;
      this.pending = '';
      if (!p) return this.fail();
      this.keepWant = false;
      this.execNormal(p);
      if (this.mode === 'normal') {
        this.clampNormal();
        if (!this.keepWant) this.want = this.c;
      }
      if (!this.replayingDot && this.isChange(p)) {
        if (INS[this.mode]) this.dotPending = Array.from(keys);
        else if (!this.failed) this.dot = Array.from(keys);
      }
    }

    isChange(p) {
      if (p.type === 'op') return p.op !== 'y';
      if (p.type !== 'cmd') return false;
      return CHANGE_CMDS.has(p.key);
    }

    applyMotion(p) {
      const m = this.motion(p.key, p.arg, p.count, false);
      if (!m) return this.fail();
      if (JUMPS.has(p.key)) this.setJump();
      if (m.scroll != null) this.top = m.scroll;
      this.r = m.r; this.c = m.c;
      if (p.key === '$') { this.want = Infinity; this.keepWant = true; }
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
        case 'u': for (let i = 0; i < n; i++) if (!this.undo()) break; return;
        case CTRL.r: for (let i = 0; i < n; i++) if (!this.redo()) break; return;
        case '.': return this.repeatDot(p.count);
        case 'i': return this.startInsert('i', n);
        case 'a': if (len) this.c++; return this.startInsert('a', n);
        case 'I': this.c = this.indentLen(r); return this.startInsert('I', n);
        case 'A': this.c = len; return this.startInsert('A', n);
        case 'o': this.openLine(false); return this.startInsert('o', n);
        case 'O': this.openLine(true); return this.startInsert('O', n);
        case 'R': this.mode = 'replace'; this.replaceStack = []; this.insertKeys = []; this.insertRepeat = null; return;
        case 'v': return this.startVisual('visual');
        case 'V': return this.startVisual('vline');
        case CTRL.v: return this.startVisual('vblock');
        case 'gv': {
          const lv = this.lastVisual;
          if (!lv) return this.fail();
          this.mode = lv.mode; this.vs = Object.assign({}, lv.vs);
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
          if (/^[a-zA-Z]$/.test(p.arg)) { this.marks[p.arg] = { r, c }; return; }
          if (p.arg === '`' || p.arg === "'") { this.setJump(); return; }
          return this.fail('E191: Ungültiges Argument für m');
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
          if (!name) return this.fail('E748: Kein zuvor verwendetes Register');
          if (name === ':') { if (!this.lastEx) return this.fail(); for (let i = 0; i < n; i++) this.ex(this.lastEx); return; }
          return this.runMacro(name, n);
        }
        case 'zz': this.top = Math.max(0, r - Math.floor((this.o.height - 1) / 2)); return;
        case 'zt': this.top = r; return;
        case 'zb': this.top = Math.max(0, r - this.o.height + 1); return;
        case 'ZZ': case 'ZQ': this.msg('Hier gibt es kein Fenster zum Schließen. In echtem Vim wärst du jetzt draußen.'); return;
        case ':': return this.openCmd(':', p.count ? (p.count === 1 ? '.' : '.,.+' + (p.count - 1)) : '');
        case '/': case '?': return this.openCmd(p.key, '');
        case CTRL.a: return this.increment(n);
        case CTRL.x: return this.increment(-n);
        case '&':
          if (!this.lastSub) return this.fail('E35: Kein vorheriges Ersetzen');
          return this.substitute([r, r], this.lastSub.pat, this.lastSub.rep, '');
      }
    }

    /* ---- Motions ---- */
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
        case 'j': case DOWN: {
          if (r >= last) return null;
          const nr = Math.min(last, r + n);
          return { r: nr, c: this.colFor(nr), type: 'line', keepWant: true };
        }
        case 'k': case UP: {
          if (r <= 0) return null;
          const nr = Math.max(0, r - n);
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
        case '%': {
          const q = this.matchPair();
          if (!q) return null;
          return { r: q.r, c: q.c, type: 'incl' };
        }
        case 'H': case 'M': case 'L': {
          const top = Math.min(this.top, last), bottom = Math.min(last, this.top + this.o.height - 1);
          let nr;
          if (key === 'H') nr = Math.min(bottom, top + n - 1);
          else if (key === 'L') nr = Math.max(top, bottom - n + 1);
          else nr = top + Math.floor((bottom - top) / 2);
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
          if (!this.lastSearch) { this.fail('E35: Kein vorheriges Suchmuster'); return null; }
          const dir = this.lastSearch.dir * (key === 'N' ? -1 : 1);
          const q = this.searchPos(this.lastSearch.re, dir, n, null, this.lastSearch.src);
          if (!q) return null;
          this.hls = true;
          this.msg((dir > 0 ? '/' : '?') + this.lastSearch.src, this.message ? this.message.type : 'info');
          return { r: q.r, c: q.c, type: 'excl' };
        }
        case '*': case '#': {
          const w = this.wordAt();
          if (!w) { this.fail('E348: Kein Wort unter dem Cursor'); return null; }
          const src = '\\<' + w.word + '\\>';
          const re = compileVim(src, this.o.ignorecase);
          const dir = key === '*' ? 1 : -1;
          this.lastSearch = { src, re, dir };
          this.hls = true;
          const q = this.searchPos(re, dir, n, { r, c: w.s }, src);
          if (!q) return null;
          if (!this.message || this.message.type !== 'warn') this.msg((dir > 0 ? '/' : '?') + src);
          return { r: q.r, c: q.c, type: 'excl' };
        }
        case "'": case '`': {
          const mk = this.getMark(arg);
          if (!mk) { this.fail('E20: Marke nicht gesetzt'); return null; }
          const mr = Math.min(mk.r, last);
          if (key === "'") return { r: mr, c: this.fnb(mr), type: 'line' };
          return { r: mr, c: Math.min(mk.c, Math.max(0, L[mr].length - (op ? 0 : 1))), type: 'excl' };
        }
      }
      return null;
    }

    getMark(m) {
      if (m === '`' || m === "'") return this.lastJump;
      if (m === '<' || m === '>') return this.marks[m];
      return this.marks[m] || null;
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
      if (!ms.length) { this.fail('E486: Muster nicht gefunden: ' + (src || '')); return null; }
      let cur = from, wrapped = false;
      for (let i = 0; i < n; i++) {
        let found = null;
        if (dir > 0) {
          found = ms.find(m => m.r > cur.r || (m.r === cur.r && m.c > cur.c));
          if (!found) { found = ms[0]; wrapped = true; }
        } else {
          for (let k = ms.length - 1; k >= 0; k--) {
            const m = ms[k];
            if (m.r < cur.r || (m.r === cur.r && m.c < cur.c)) { found = m; break; }
          }
          if (!found) { found = ms[ms.length - 1]; wrapped = true; }
        }
        cur = found;
      }
      if (wrapped) this.msg(dir > 0 ? 'Suche erreichte das ENDE und machte am ANFANG weiter' : 'Suche erreichte den ANFANG und machte am ENDE weiter', 'warn');
      return cur;
    }

    wordAt() {
      const line = this.lines[this.r];
      let c = this.c;
      while (c < line.length && !WORD_RE.test(line[c])) c++;
      if (c >= line.length) return null;
      let s = c, e = c;
      while (s > 0 && WORD_RE.test(line[s - 1])) s--;
      while (e + 1 < line.length && WORD_RE.test(line[e + 1])) e++;
      return { word: line.slice(s, e + 1), s };
    }

    /* ---- Operatoren ---- */
    execOp(p) {
      const op = p.op, L = this.lines;
      let rg;
      if (p.double) {
        const n = p.count || 1;
        if (this.r + n - 1 > this.last && n > 1 && this.r === this.last) return this.fail();
        rg = { type: 'line', sr: this.r, er: Math.min(this.last, this.r + n - 1) };
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
            } else {
              key = big ? 'E' : 'e';
            }
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
      this.applyOp(op, rg, p.reg);
    }

    textObject(obj, count) {
      const around = obj[0] === 'a', ch = obj[1];
      switch (ch) {
        case 'w': return this.wordObj(false, around);
        case 'W': return this.wordObj(true, around);
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
      return { r, c: o };
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
      else if (text[off] === close) s = findOpen(off - 1);
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

    applyOp(op, rg, reg) {
      const L = this.lines;
      if (rg.type === 'block') return this.applyBlockOp(op, rg, reg);
      if (rg.type === 'line') {
        const { sr, er } = rg, cnt = er - sr + 1;
        const text = L.slice(sr, er + 1).join('\n');
        switch (op) {
          case 'y':
            this.setReg(reg, text, true, 'y');
            this.r = sr; this.clampNormal();
            if (cnt > 2) this.msg(cnt + ' Zeilen kopiert');
            return;
          case 'd':
            this.setReg(reg, text, true, 'd');
            L.splice(sr, cnt);
            if (!L.length) L.push('');
            this.r = Math.min(sr, L.length - 1); this.c = this.fnb(this.r);
            if (cnt > 2) this.msg(cnt + ' Zeilen weniger');
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
            if (cnt > 2) this.msg(cnt + ' Zeilen ' + op + ' 1-mal eingerückt');
            return;
          default:
            for (let r = sr; r <= er; r++) L[r] = caseFn(op)(L[r]);
            this.r = sr; this.clampNormal();
            return;
        }
      }
      const { sr, sc, er, ec } = rg;
      const text = this.getText(sr, sc, er, ec);
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
      if (op === '>' || op === '<') { this.shift(rg.sr, rg.er, op, 1); this.r = rg.sr; this.c = this.fnb(rg.sr); return; }
      for (let r = rg.sr; r <= rg.er; r++) {
        const line = L[r];
        const e = ecOf(line);
        if (line.length > rg.sc) L[r] = line.slice(0, rg.sc) + caseFn(op)(line.slice(rg.sc, e)) + line.slice(e);
      }
      this.r = rg.sr; this.c = rg.sc; this.clampNormal();
    }

    put(before, reg, n) {
      const R = this.getReg(reg);
      if (!R || R.text == null) return this.fail('E353: Nichts in Register ' + (reg || '"'));
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
        const parts = R.text.split('\n');
        for (let i = 0; i < n; i++) block = block.concat(parts);
        const at = before ? this.r : this.r + 1;
        L.splice(at, 0, ...block);
        this.r = at; this.c = this.fnb(at);
        return;
      }
      const text = R.text.repeat(n);
      const col = before ? this.c : (L[this.r].length ? this.c + 1 : 0);
      const end = this.insText(this.r, col, text);
      if (text.includes('\n')) this.c = col;
      else this.c = Math.max(0, end.c - 1);
    }

    undo() {
      const s = this.undoStack.pop();
      if (!s) { this.msg('Bereits bei der ältesten Änderung', 'warn'); this.failed = true; return false; }
      this.redoStack.push(this.snap());
      this.lines = s.lines; this.r = s.r; this.c = s.c;
      this.clampNormal();
      this.skipUndo = true;
      return true;
    }
    redo() {
      const s = this.redoStack.pop();
      if (!s) { this.msg('Bereits bei der neuesten Änderung', 'warn'); this.failed = true; return false; }
      this.undoStack.push(this.snap());
      this.lines = s.lines; this.r = s.r; this.c = s.c;
      this.clampNormal();
      this.skipUndo = true;
      return true;
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
      const R = this.regs[name.toLowerCase()];
      if (!R) return this.fail('E748: Register ' + name + ' ist leer');
      const keys = R.keys ? R.keys : parseNotation(R.text + (R.linewise ? '\n' : ''));
      this.lastMacro = name;
      if (this.macroDepth > 20) return this.fail();
      this.macroDepth++;
      outer: for (let i = 0; i < n; i++) {
        for (const k of keys) { this.dispatch(k); if (this.failed) break outer; }
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
      this.insertRepeat = { kind, count: count || 1 };
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

    insertKey(key) {
      const L = this.lines;
      if (this.insertRegPending) {
        this.insertRegPending = false;
        if (key === ESC) return;
        const R = this.getReg(key);
        if (!R) return;
        const t = R.text + (R.linewise ? '\n' : '');
        const end = this.insText(this.r, this.c, t);
        this.r = end.r; this.c = end.c; this.autoIndentRow = null;
        return;
      }
      if (key === ESC) return this.finishInsert();
      const line = L[this.r];
      switch (key) {
        case CR: {
          const before = line.slice(0, this.c), after = line.slice(this.c);
          const ind = this.o.autoindent ? before.match(/^\s*/)[0] : '';
          L[this.r] = /^\s+$/.test(before) ? '' : before;
          L.splice(this.r + 1, 0, ind + after.replace(/^\s+/, ''));
          this.r++; this.c = ind.length;
          this.autoIndentRow = ind ? this.r : null;
          return;
        }
        case BS:
          if (this.c > 0) { L[this.r] = line.slice(0, this.c - 1) + line.slice(this.c); this.c--; }
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
          L[this.r] = line.slice(0, this.c) + ' '.repeat(n) + line.slice(this.c);
          this.c += n; this.autoIndentRow = null;
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
        case CTRL.r: this.insertRegPending = true; return;
        case LEFT: if (this.c > 0) this.c--; return;
        case RIGHT: if (this.c < line.length) this.c++; return;
        case UP: if (this.r > 0) { this.r--; this.c = Math.min(this.c, L[this.r].length); } return;
        case DOWN: if (this.r < this.last) { this.r++; this.c = Math.min(this.c, L[this.r].length); } return;
      }
      if (isPrintable(key)) {
        L[this.r] = line.slice(0, this.c) + key + line.slice(this.c);
        this.c++; this.autoIndentRow = null;
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
      this.mode = 'normal';
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
      if (p.type === 'motion') {
        const m = this.motion(p.key, p.arg, p.count, false);
        if (!m) return this.fail();
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
        case '~': case 'u': case 'U': case 'g~': case 'gu': case 'gU':
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
          if (!R) return this.fail('E353: Nichts in Register ' + (reg || '"'));
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
      this.cmdFrom = { mode: this.mode };
      this.mode = 'cmdline'; this.cmdType = type; this.cmdText = init;
    }
    cmdKey(key) {
      if (this.cmdRegPending) {
        this.cmdRegPending = false;
        const R = this.getReg(key);
        if (R) this.cmdText += R.text.split('\n')[0];
        return;
      }
      const back = () => { this.mode = this.cmdFrom ? this.cmdFrom.mode : 'normal'; };
      if (key === ESC || (key === BS && !this.cmdText)) { back(); return; }
      if (key === CR) {
        const t = this.cmdText, ty = this.cmdType;
        back();
        this.cmdText = '';
        if (ty === ':') this.ex(t); else this.search(t, ty === '/' ? 1 : -1);
        return;
      }
      if (key === BS) { this.cmdText = this.cmdText.slice(0, -1); return; }
      if (key === CTRL.u) { this.cmdText = ''; return; }
      if (key === CTRL.w) { this.cmdText = this.cmdText.replace(/\S*\s*$/, ''); return; }
      if (key === CTRL.r) { this.cmdRegPending = true; return; }
      if (isPrintable(key)) this.cmdText += key;
    }

    search(pat, dir) {
      let src = pat;
      if (src === '') {
        if (!this.lastSearch) return this.fail('E35: Kein vorheriges Suchmuster');
        src = this.lastSearch.src;
      }
      const re = compileVim(src, this.o.ignorecase);
      if (!re) return this.fail('E486: Ungültiges Muster: ' + src);
      this.lastSearch = { src, re, dir };
      this.hls = true;
      const q = this.searchPos(re, dir, 1, null, src);
      if (!q) return;
      if (!this.message) this.msg((dir > 0 ? '/' : '?') + src);
      this.setJump();
      this.r = q.r; this.c = q.c; this.want = q.c;
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
          if (!mk) throw new Error('E20: Marke nicht gesetzt');
          base = mk.r; i += 2;
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
      while (s[i] === ',' || s[i] === ';') { i++; const b = one(); addrs.push(b === null ? this.r : b); }
      return { range: [addrs[0], addrs[addrs.length - 1]], single: addrs.length === 1, rest: s.slice(i) };
    }

    ex(input) {
      const raw = input.replace(/^[\s:]+/, '');
      if (!raw) return;
      this.lastEx = raw;
      this.exLog.push(raw.trim());
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
        if (range[0] < -1 || range[1] > last) return this.fail('E16: Ungültiger Bereich');
        range = [Math.max(0, range[0]), range[1]];
      }
      const m = s.match(/^([a-zA-Z]+|[&<>~]+)(!?)([\s\S]*)$/);
      if (!m) return this.fail('E492: Kein Editor-Befehl: ' + s);
      const name = m[1], bang = m[2] === '!', arg = m[3];
      const argT = arg.trim();
      const cur = [this.r, this.r];
      const is = (...names) => names.includes(name);

      if (is('w', 'write', 'up', 'update', 'sav', 'saveas')) return this.msg('"uebung.txt" ' + L.length + ' Zeilen geschrieben');
      if (is('q', 'quit', 'qa', 'qall', 'quita', 'wq', 'x', 'xit', 'exit', 'wqa', 'xa', 'wqall', 'xall', 'cq')) {
        return this.msg('Geschafft, du hast Vim verlassen! Hier bleibt der Editor offen, damit du weiterüben kannst.');
      }
      if (is('s', 'su', 'substitute') || name === '&') {
        if (name === '&') return this.exSub(range || cur, '');
        return this.exSub(range || cur, arg);
      }
      if (is('g', 'global', 'v', 'vglobal')) return this.exGlobal(range, arg, bang || name[0] === 'v');
      if (is('d', 'de', 'del', 'delete')) {
        const rg = range || cur, reg = argT[0] && /[a-zA-Z"_]/.test(argT[0]) ? argT[0] : null;
        return this.applyOp('d', { type: 'line', sr: rg[0], er: rg[1] }, reg);
      }
      if (is('y', 'ya', 'yank')) {
        const rg = range || cur, reg = argT[0] && /[a-zA-Z"_]/.test(argT[0]) ? argT[0] : null;
        const pos = { r: this.r, c: this.c };
        this.applyOp('y', { type: 'line', sr: rg[0], er: rg[1] }, reg);
        this.r = pos.r; this.c = pos.c;
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
      if (is('norm', 'normal')) return this.exNormal(range || cur, arg.replace(/^\s/, ''));
      if (is('noh', 'nohlsearch')) { this.hls = false; return; }
      if (is('se', 'set')) return this.exSet(argT);
      if (is('reg', 'registers', 'di', 'display')) return this.showRegisters();
      if (is('marks')) return this.showMarks();
      if (is('u', 'un', 'undo')) { this.undo(); return; }
      if (is('red', 'redo')) { this.redo(); return; }
      if (is('h', 'help')) return this.msg('Tipp: Der Spickzettel oben in der Navigation listet alle Befehle dieses Kurses.');
      if (is('e', 'edit', 'new', 'vnew', 'sp', 'split', 'vs', 'vsplit', 'tabnew', 'tabe', 'bn', 'bp', 'ls')) return this.msg('Fenster und Puffer gibt es in diesem Kurs-Editor nicht.');
      if (name[0] === '>' || name[0] === '<') {
        const rg = range || cur;
        this.shift(rg[0], rg[1], name[0], name.length);
        this.r = rg[1]; this.c = this.fnb(this.r);
        return;
      }
      if (name === '~') return this.exSub(range || cur, '');
      return this.fail('E492: Kein Editor-Befehl: ' + s);
    }

    exSub(range, rest) {
      if (!rest || /^[\s&gciIn]*$/.test(rest)) {
        if (!this.lastSub) return this.fail('E35: Kein vorheriges reguläres Muster');
        return this.substitute(range, this.lastSub.pat, this.lastSub.rep, rest.replace(/[\s&]/g, ''));
      }
      const d = rest[0];
      if (/[a-zA-Z0-9\\"| ]/.test(d)) return this.fail('E146: Reguläre Ausdrücke können nicht durch Buchstaben getrennt werden');
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
        if (!this.lastSearch) return this.fail('E35: Kein vorheriges reguläres Muster');
        src = this.lastSearch.src;
      }
      const ic = flags.includes('i') || (this.o.ignorecase && !flags.includes('I'));
      const re = compileVim(src, ic);
      if (!re) return this.fail('E486: Ungültiges Muster: ' + src);
      const reOne = new RegExp(re.source, re.flags.replace('g', ''));
      this.lastSub = { pat: src, rep, flags };
      this.lastSearch = { src, re: compileVim(src, ic), dir: 1 };
      this.hls = true;
      const L = this.lines;
      let count = 0, lines = 0, lastLine = -1;
      const fn = (...a) => {
        count++;
        let g = a.slice(0, -2);
        if (typeof a[a.length - 1] === 'object') g = a.slice(0, -3);
        return vimReplace(rep, g);
      };
      for (let r = range[0]; r <= range[1]; r++) {
        const before = count;
        const out = flags.includes('g') ? L[r].replace(re, fn) : L[r].replace(reOne, fn);
        if (count > before) { lines++; lastLine = r; L[r] = out; }
      }
      if (!count) return this.fail('E486: Muster nicht gefunden: ' + src);
      let extraAbove = 0;
      for (let r = range[1]; r >= range[0]; r--) {
        if (L[r].includes('\n')) {
          const parts = L[r].split('\n');
          L.splice(r, 1, ...parts);
          if (r < lastLine) extraAbove += parts.length - 1;
        }
      }
      this.r = lastLine + extraAbove; this.c = this.fnb(this.r);
      if (lines > 1 || count > 2) this.msg(count + (count === 1 ? ' Ersetzung' : ' Ersetzungen') + ' in ' + lines + (lines === 1 ? ' Zeile' : ' Zeilen'));
    }

    exGlobal(range, rest, invert) {
      range = range || [0, this.last];
      const d = rest[0];
      if (!d) return this.fail('E476: Ungültiger Befehl');
      let pat = '', i = 1;
      while (i < rest.length && rest[i] !== d) {
        if (rest[i] === '\\' && i + 1 < rest.length) { pat += rest[i] + rest[i + 1]; i += 2; continue; }
        pat += rest[i]; i++;
      }
      const cmd = rest.slice(i + 1).trim() || 'p';
      const src = pat || (this.lastSearch && this.lastSearch.src);
      if (!src) return this.fail('E35: Kein vorheriges reguläres Muster');
      const re = compileVim(src, this.o.ignorecase);
      if (!re) return this.fail('E486: Ungültiges Muster: ' + src);
      this.lastSearch = { src, re, dir: 1 };
      const marked = [];
      for (let r = range[0]; r <= range[1]; r++) { re.lastIndex = 0; if (re.test(this.lines[r]) !== invert) marked.push(r); }
      if (!marked.length) return this.fail('E486: Muster nicht gefunden: ' + src);
      if (cmd === 'p' || cmd === 'print') {
        this.list = marked.map(r => (r + 1) + '  ' + this.lines[r]);
        return;
      }
      const savedEx = this.lastEx;
      let offset = 0;
      for (const orig of marked) {
        const idx = orig + offset;
        if (idx < 0 || idx >= this.lines.length) continue;
        const before = this.lines.length;
        this.r = idx; this.c = 0;
        this.ex(cmd);
        this.exLog.pop();
        offset += this.lines.length - before;
      }
      this.lastEx = savedEx;
      this.failed = false;
      this.clampNormal();
    }

    exMove(range, arg, copy) {
      let t;
      try { const pr = this.parseRange(arg); t = pr.range ? pr.range[1] : this.r; } catch (e) { return this.fail(e.message); }
      if (arg.trim() === '0') t = -1;
      if (t < -1 || t > this.last) return this.fail('E16: Ungültiger Bereich');
      const L = this.lines;
      const block = L.slice(range[0], range[1] + 1);
      if (copy) {
        L.splice(t + 1, 0, ...block);
        this.r = t + block.length;
      } else {
        if (t >= range[0] && t < range[1]) return this.fail('E134: Zeilen können nicht in sich selbst verschoben werden');
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

    exNormal(range, keysStr) {
      const keys = parseNotation(keysStr);
      let offset = 0;
      for (let orig = range[0]; orig <= range[1]; orig++) {
        const idx = orig + offset;
        if (idx < 0 || idx >= this.lines.length) break;
        const before = this.lines.length;
        this.mode = 'normal'; this.pending = '';
        this.r = idx; this.c = 0; this.failed = false;
        for (const k of keys) { this.dispatch(k); if (this.failed) break; }
        for (let g = 0; g < 3 && this.mode !== 'normal'; g++) this.dispatch(ESC);
        this.pending = '';
        offset += this.lines.length - before;
      }
      this.failed = false;
    }

    exSet(arg) {
      if (!arg) return this.msg('Optionen: number, relativenumber, hlsearch, ignorecase, autoindent, shiftwidth');
      const ALIAS = { nu: 'number', rnu: 'relativenumber', hls: 'hlsearch', ic: 'ignorecase', ai: 'autoindent', sw: 'shiftwidth' };
      const out = [];
      for (let item of arg.split(/\s+/)) {
        let m = item.match(/^(\w+)=(\d+)$/);
        if (m) {
          const k = ALIAS[m[1]] || m[1];
          if (k !== 'shiftwidth') return this.fail('E518: Unbekannte Option: ' + m[1]);
          this.o.shiftwidth = Math.max(1, Math.min(8, parseInt(m[2], 10)));
          continue;
        }
        let val = true, toggle = false, query = false;
        if (item.endsWith('!')) { toggle = true; item = item.slice(0, -1); }
        if (item.endsWith('?')) { query = true; item = item.slice(0, -1); }
        if (item.startsWith('no') && (ALIAS[item.slice(2)] || this.o[item.slice(2)] !== undefined)) { val = false; item = item.slice(2); }
        else if (item.startsWith('inv')) { toggle = true; item = item.slice(3); }
        const k = ALIAS[item] || item;
        if (!['number', 'relativenumber', 'hlsearch', 'ignorecase', 'autoindent', 'shiftwidth'].includes(k)) return this.fail('E518: Unbekannte Option: ' + item);
        if (query || (k === 'shiftwidth')) { out.push(k === 'shiftwidth' ? 'shiftwidth=' + this.o.shiftwidth : (this.o[k] ? '  ' : 'no') + k); continue; }
        this.o[k] = toggle ? !this.o[k] : val;
        if (k === 'hlsearch' && this.o[k]) this.hls = true;
      }
      if (out.length) this.msg(out.join('  '));
    }

    showRegisters() {
      const order = ['"', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'].concat('abcdefghijklmnopqrstuvwxyz'.split(''), ['+', '*']);
      const rows = ['Typ  Name  Inhalt'];
      for (const k of order) {
        const R = this.regs[k];
        if (!R) continue;
        const t = R.text.replace(/\n/g, '^J');
        rows.push((R.block ? '  b  ' : R.linewise ? '  l  ' : '  c  ') + '"' + k + '   ' + (t.length > 60 ? t.slice(0, 60) + '…' : t));
      }
      if (this.lastEx) rows.push('  c  ":   ' + this.lastEx);
      if (this.lastSearch) rows.push('  c  "/   ' + this.lastSearch.src);
      this.list = rows.length > 1 ? rows : ['Alle Register sind leer.'];
    }
    showMarks() {
      const rows = ['Marke Zeile Spalte Text'];
      const ks = Object.keys(this.marks).sort();
      for (const k of ks) {
        const m = this.marks[k];
        if (m.r > this.last) continue;
        rows.push(' ' + k + '    ' + String(m.r + 1).padStart(4) + '  ' + String(m.c).padStart(4) + '   ' + this.lines[m.r].trim().slice(0, 40));
      }
      this.list = rows.length > 1 ? rows : ['Keine Marken gesetzt.'];
    }
  }

  Vim.keys = { ESC, CR, BS, TAB, DEL, LEFT, RIGHT, UP, DOWN, CTRL };
  Vim.parseNotation = parseNotation;
  Vim.toNotation = toNotation;
  Vim.keyLabel = keyLabel;
  Vim.compileVim = compileVim;
  root.Vim = Vim;
  if (typeof module !== 'undefined' && module.exports) module.exports = Vim;
})(typeof window !== 'undefined' ? window : this);
