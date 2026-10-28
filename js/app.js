/* Normalmodus · Oberfläche */
(function () {
  'use strict';
  const { COURSE, CHALLENGES, WELCOME, DRILL_TEXT } = window.VK;
  const K = Vim.keys;

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const fmtKey = s => esc(s.replace(/<C-(.)>/g, 'Ctrl-$1').replace(/<Esc>/g, 'Esc').replace(/<CR>/g, 'Enter'));
  const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);

  const LESSONS = [];
  COURSE.forEach((ch, ci) => ch.lessons.forEach(l => { l.chapter = ch; l.ci = ci; l.num = LESSONS.length + 1; LESSONS.push(l); }));
  const TOTAL_EX = LESSONS.reduce((n, l) => n + l.ex.length, 0);

  /* ---------- Fortschritt ---------- */
  const STORE_KEY = 'normalmodus.fortschritt.v1';
  const Store = {
    data: { ex: {}, ch: {}, drill: 0 },
    load() {
      try { const s = localStorage.getItem(STORE_KEY); if (s) Object.assign(this.data, JSON.parse(s)); } catch (e) { /* ohne Speicher weiter */ }
    },
    save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch (e) { /* ohne Speicher weiter */ } },
    record(key, keys, stars) {
      const bucket = key.startsWith('ch:') ? this.data.ch : this.data.ex;
      const id = key.startsWith('ch:') ? key.slice(3) : key;
      const prev = bucket[id];
      const better = !prev || keys < prev.best;
      bucket[id] = { best: better ? keys : prev.best, stars: Math.max(stars, prev ? prev.stars : 0) };
      this.save();
      return { prev, better };
    },
    get(key) { return key.startsWith('ch:') ? this.data.ch[key.slice(3)] : this.data.ex[key]; },
    reset() { this.data = { ex: {}, ch: {}, drill: 0 }; this.save(); }
  };
  Store.load();

  function lessonStatus(l) {
    let done = 0, min = 3;
    l.ex.forEach((e, i) => { const r = Store.data.ex[l.id + ':' + i]; if (r) { done++; min = Math.min(min, r.stars); } });
    return { done, total: l.ex.length, complete: done === l.ex.length, stars: done === l.ex.length ? min : 0 };
  }
  function totals() {
    let ex = 0, stars = 0, lessons = 0;
    LESSONS.forEach(l => {
      const s = lessonStatus(l);
      ex += s.done; if (s.complete) lessons++;
      l.ex.forEach((e, i) => { const r = Store.data.ex[l.id + ':' + i]; if (r) stars += r.stars; });
    });
    const ch = CHALLENGES.filter(c => Store.data.ch[c.id]).length;
    return { ex, stars, lessons, ch, maxStars: TOTAL_EX * 3 };
  }
  function nextLesson() { return LESSONS.find(l => !lessonStatus(l).complete) || LESSONS[LESSONS.length - 1]; }

  /* ---------- Tastatur ---------- */
  function mapKey(e, mode) {
    if (e.metaKey) return null;
    const k = e.key;
    if (e.ctrlKey && !e.altKey) {
      if (k === '[') return K.ESC;
      if (/^[a-zA-Z]$/.test(k)) return K.CTRL[k.toLowerCase()];
      return null;
    }
    switch (k) {
      case 'Escape': return K.ESC;
      case 'Enter': return K.CR;
      case 'Backspace': return K.BS;
      case 'Delete': return K.DEL;
      case 'Tab': return mode === 'insert' ? K.TAB : null;
      case 'ArrowLeft': return K.LEFT;
      case 'ArrowRight': return K.RIGHT;
      case 'ArrowUp': return K.UP;
      case 'ArrowDown': return K.DOWN;
    }
    if (k.length === 1) return k;
    return null;
  }

  const MODE_LABEL = { normal: 'NORMAL', insert: 'EINFÜGEN', replace: 'ERSETZEN', visual: 'VISUELL', vline: 'V-ZEILE', vblock: 'V-BLOCK', cmdline: 'BEFEHL' };
  const MODE_LINE = { insert: '-- EINFÜGEN --', replace: '-- ERSETZEN --', visual: '-- VISUELL --', vline: '-- VISUELL ZEILE --', vblock: '-- VISUELL BLOCK --' };

  /* ---------- Editor-Ansicht ---------- */
  class EditorView {
    constructor(host, opts) {
      this.opts = opts || {};
      this.el = el(`<div class="editor" data-mode="normal">
        <div class="ed-screen" aria-hidden="true"></div>
        <pre class="ed-list" hidden></pre>
        <div class="ed-status"><span class="ed-mode">NORMAL</span><span class="ed-pending"></span><span class="ed-rec" hidden></span><span class="ed-pos"></span></div>
        <div class="ed-cmd"></div>
        <div class="ed-toast" role="status" hidden></div>
        <textarea class="ed-input" rows="1" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="${esc(this.opts.label || 'Vim-Editor')}"></textarea>
        <div class="ed-overlay" aria-hidden="true"><span>Klicke hier und tippe los</span></div>
        <div class="ed-touch"><button type="button" data-k="esc">Esc</button><button type="button" data-k="ctrl" aria-pressed="false">Ctrl</button></div>
      </div>`);
      host.appendChild(this.el);
      this.screen = $('.ed-screen', this.el);
      this.ta = $('.ed-input', this.el);
      this.ctrlArmed = false;
      this.dead = false;
      this.bind();
    }

    setEngine(v) { this.v = v; this.render(); }

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
      if (this.ctrlArmed && k.length === 1 && /[a-z\[]/i.test(k)) {
        k = k === '[' ? K.ESC : K.CTRL[k.toLowerCase()];
        this.ctrlArmed = false;
        $('[data-k="ctrl"]', this.el).setAttribute('aria-pressed', 'false');
      }
      if (this.opts.onKey) this.opts.onKey(k); else this.v.feed(k);
      this.render();
    }

    focus() { try { this.ta.focus({ preventScroll: true }); } catch (e) { this.ta.focus(); } }

    toast(text) {
      const t = $('.ed-toast', this.el);
      t.textContent = text; t.hidden = false;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { t.hidden = true; }, 1600);
    }

    render() {
      const v = this.v;
      if (!v) return;
      const L = v.lines, h = v.o.height, top = v.top;
      const dec = this.opts.decorate ? this.opts.decorate() : null;
      const vis = v.mode === 'visual' || v.mode === 'vline' || v.mode === 'vblock' || (v.mode === 'cmdline' && v.cmdFrom && /^v/.test(v.cmdFrom.mode));
      let sel = null;
      if (vis && v.vs) {
        const saved = v.mode;
        if (v.mode === 'cmdline') v.mode = v.cmdFrom.mode;
        sel = v.visualRange();
        v.mode = saved;
      }
      const re = (v.hls && v.o.hlsearch && v.lastSearch && v.lastSearch.re) ? v.lastSearch.re : null;
      const showNum = v.o.number || v.o.relativenumber;
      const gw = Math.max(3, String(L.length).length + 1);
      let html = '';
      for (let i = 0; i < h; i++) {
        const r = top + i;
        if (r >= L.length) {
          html += `<div class="ed-line tilde">${showNum ? `<span class="ed-gut" style="width:${gw}ch"></span>` : ''}<span class="ed-txt">~</span></div>`;
          continue;
        }
        const line = L[r], len = line.length;
        const cls = new Array(len + 1).fill('');
        const add = (a, b, name) => { for (let x = Math.max(0, a); x < Math.min(len + 1, b); x++) cls[x] += ' ' + name; };
        if (sel) {
          if (sel.type === 'line' && r >= sel.sr && r <= sel.er) add(0, len + 1, 'sel');
          else if (sel.type === 'block' && r >= sel.sr && r <= sel.er) add(sel.sc, sel.toEnd ? len : sel.ec, 'sel');
          else if (sel.type === 'char' && r >= sel.sr && r <= sel.er) {
            const a = r === sel.sr ? sel.sc : 0, b = r === sel.er ? sel.ec : len + 1;
            add(a, b, 'sel');
          }
        }
        if (re) {
          re.lastIndex = 0;
          let m;
          while ((m = re.exec(line))) {
            if (!m[0].length) { re.lastIndex++; continue; }
            add(m.index, m.index + m[0].length, 'hl');
          }
        }
        if (dec && dec.targets) for (const t of dec.targets) if (t.r === r) add(Math.min(t.c, len), Math.min(t.c, len) + 1, t.kind);
        if (r === v.r) {
          const cc = Math.min(v.c, len);
          const kind = v.mode === 'insert' ? 'cur-ins' : v.mode === 'replace' ? 'cur-rep' : v.mode === 'cmdline' ? 'cur-dim' : 'cur';
          add(cc, cc + 1, kind);
        }
        let txt = '', run = '', runCls = null;
        const flushRun = () => { if (run) txt += runCls ? `<span class="${runCls.trim()}">${esc(run)}</span>` : esc(run); run = ''; };
        const end = cls[len] ? len + 1 : len;
        for (let x = 0; x < end; x++) {
          const ch = x < len ? line[x] : ' ';
          if (cls[x] !== runCls) { flushRun(); runCls = cls[x]; }
          run += ch;
        }
        flushRun();
        let num = '';
        if (showNum) {
          const isCur = r === v.r;
          const n = v.o.relativenumber && !isCur ? Math.abs(r - v.r) : r + 1;
          num = `<span class="ed-gut${isCur ? ' now' : ''}${v.o.relativenumber && isCur ? ' left' : ''}" style="width:${gw}ch">${n}</span>`;
        }
        html += `<div class="ed-line${r === v.r ? ' curline' : ''}">${num}<span class="ed-txt">${txt || ''}</span></div>`;
      }
      this.screen.innerHTML = html;
      this.screen.style.setProperty('--rows', h);
      this.el.dataset.mode = v.mode === 'cmdline' && v.cmdFrom ? 'cmdline' : v.mode;
      $('.ed-mode', this.el).textContent = MODE_LABEL[v.mode] || v.mode;
      $('.ed-pending', this.el).textContent = v.pending ? Array.from(v.pending).map(Vim.keyLabel).join('') : (v.insertRegPending ? '"' : '');
      const rec = $('.ed-rec', this.el);
      rec.hidden = !v.recording;
      rec.textContent = v.recording ? 'Aufnahme @' + v.recording : '';
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
        cmd.textContent = MODE_LINE[v.mode] || (v.recording ? 'Aufnahme @' + v.recording : '');
      }
      const list = $('.ed-list', this.el);
      if (v.list) { list.hidden = false; list.textContent = v.list.join('\n') + '\n\nWeiter mit einer beliebigen Taste'; }
      else list.hidden = true;
      const cur = $('.cur, .cur-ins, .cur-rep, .cur-dim', this.screen);
      if (cur) {
        const sx = this.screen.scrollLeft, w = this.screen.clientWidth;
        const x = cur.offsetLeft;
        if (x < sx + 40) this.screen.scrollLeft = Math.max(0, x - 40);
        else if (x > sx + w - 60) this.screen.scrollLeft = x - w + 60;
      }
    }
  }

  function keycaps(keys) { return keys.map(k => `<kbd>${esc(Vim.keyLabel(k))}</kbd>`).join(''); }

  /* ---------- Übungspanel ---------- */
  class Practice {
    constructor(host, opts) {
      this.opts = opts;
      this.items = opts.exercises.map(VK.prepare);
      this.el = el(`<section class="practice">
        <header class="pr-head">
          <div class="pr-steps" role="group" aria-label="Übungen"></div>
          <div class="pr-meter">
            <span class="pr-keys"><b>0</b> Tasten</span>
            <span class="pr-par"></span>
            <span class="pr-best"></span>
          </div>
        </header>
        <p class="pr-task"></p>
        <div class="pr-stage">
          <div class="pr-ed"></div>
          <aside class="pr-goal" hidden><div class="pr-goal-h"><span>Ziel</span><span class="pr-goal-state"></span></div><pre class="pr-goal-text"></pre></aside>
        </div>
        <div class="pr-done" hidden></div>
        <div class="pr-log" aria-label="Zuletzt gedrückte Tasten"></div>
        <div class="pr-sol" hidden></div>
        <div class="pr-foot">
          <div class="pr-actions">
            <button type="button" class="btn ghost" data-act="reset">Neu starten</button>
            <button type="button" class="btn ghost" data-act="hint">Lösung zeigen</button>
          </div>
          <button type="button" class="btn primary" data-act="next">Überspringen</button>
        </div>
      </section>`);
      host.appendChild(this.el);
      this.view = new EditorView($('.pr-ed', this.el), { onKey: k => this.key(k), decorate: () => this.decorate(), label: 'Übungseditor' });
      this.el.addEventListener('click', e => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const act = b.dataset.act;
        if (act === 'reset') { this.load(this.i); this.view.focus(); }
        if (act === 'hint') this.toggleSolution();
        if (act === 'next') this.advance();
        if (act === 'step') { this.load(+b.dataset.i); this.view.focus(); }
      });
      this.load(opts.start || 0);
    }

    keyFor(i) { return this.opts.storeKey ? this.opts.storeKey(i) : null; }

    load(i) {
      this.i = i;
      this.ex = this.items[i];
      this.st = VK.newState();
      this.solved = false;
      this.log = [];
      const v = new Vim(this.ex.text, { height: this.ex.height || Math.max(4, Math.min(12, this.ex.text.split('\n').length + 1)) });
      v.setCursor(this.ex.start.r, this.ex.start.c);
      this.v = v;
      $('.pr-task', this.el).innerHTML = this.ex.task;
      $('.pr-done', this.el).hidden = true;
      $('.pr-sol', this.el).hidden = true;
      $('[data-act="hint"]', this.el).textContent = 'Lösung zeigen';
      const goal = $('.pr-goal', this.el);
      goal.hidden = this.ex.type !== 'match';
      this.el.classList.toggle('has-goal', this.ex.type === 'match');
      this.renderSteps();
      this.view.setEngine(v);
      this.update();
    }

    renderSteps() {
      const steps = $('.pr-steps', this.el);
      if (this.items.length < 2) { steps.innerHTML = this.opts.heading ? `<span class="pr-heading">${esc(this.opts.heading)}</span>` : ''; return; }
      steps.innerHTML = '<span class="pr-heading">Übung ' + (this.i + 1) + ' von ' + this.items.length + '</span>' + this.items.map((x, j) => {
        const k = this.keyFor(j);
        const done = k && Store.get(k);
        return `<button type="button" class="step${j === this.i ? ' now' : ''}${done ? ' done' : ''}" data-act="step" data-i="${j}" aria-label="Übung ${j + 1}${done ? ', erledigt' : ''}"></button>`;
      }).join('');
    }

    decorate() {
      if (this.ex.type !== 'targets') return null;
      const t = [];
      this.ex.targets.forEach((p, j) => {
        if (j === this.st.ti) t.push({ r: p.r, c: p.c, kind: 'tgt' });
        else if (j > this.st.ti) t.push({ r: p.r, c: p.c, kind: 'tgt-later' });
      });
      return { targets: t };
    }

    key(k) {
      const v = this.v;
      if (this.solved) {
        if (k === K.CR) this.advance();
        else if (k === 'r' || k === K.BS) { this.load(this.i); }
        return;
      }
      if (VK.isBlocked(this.ex, v, k)) { this.view.toast(Vim.keyLabel(k) + ' ist in dieser Übung gesperrt'); return; }
      v.feed(k);
      this.st.hist += k;
      this.st.keys++;
      this.log.push(k);
      if (VK.check(this.ex, this.st, v)) this.solve();
      this.update();
    }

    solve() {
      this.solved = true;
      const keys = this.st.keys, par = this.ex.par;
      const stars = VK.stars(keys, par);
      const key = this.keyFor(this.i);
      let rec = { prev: null, better: true };
      if (key) rec = Store.record(key, keys, stars);
      const best = rec.prev && !rec.better ? ` · Bestwert ${rec.prev.best}` : (rec.prev && rec.better ? ' · Neuer Bestwert' : '');
      const last = this.i === this.items.length - 1;
      const msg = stars === 3 ? 'Perfekt gelöst' : stars === 2 ? 'Gelöst' : 'Geschafft';
      const d = $('.pr-done', this.el);
      d.innerHTML = `<span class="done-stars s${stars}" aria-label="${stars} von 3 Sternen">${starStr(stars)}</span>
        <span class="done-text"><b>${msg}</b> mit ${keys} ${keys === 1 ? 'Taste' : 'Tasten'}${par ? ` (Ziel: ${par})` : ''}${best}</span>
        <span class="done-hint"><kbd>Enter</kbd> ${last ? 'abschließen' : 'nächste Übung'} · <kbd>r</kbd> nochmal</span>`;
      d.hidden = false;
      this.renderSteps();
      if (this.opts.onSolve) this.opts.onSolve(this.i, { keys, stars });
    }

    advance() {
      if (this.i < this.items.length - 1) { this.load(this.i + 1); this.view.focus(); }
      else if (this.opts.onFinish) this.opts.onFinish(this.solved);
    }

    toggleSolution() {
      const s = $('.pr-sol', this.el);
      const b = $('[data-act="hint"]', this.el);
      if (!s.hidden) { s.hidden = true; b.textContent = 'Lösung zeigen'; return; }
      s.innerHTML = `<span class="sol-label">Eine mögliche Lösung</span><span class="sol-keys">${keycaps(this.ex.solKeys)}</span>`;
      s.hidden = false;
      b.textContent = 'Lösung ausblenden';
    }

    update() {
      const v = this.v, ex = this.ex;
      $('.pr-keys b', this.el).textContent = this.st.keys;
      $('.pr-par', this.el).innerHTML = ex.par ? `Ziel <b>≤ ${ex.par}</b>` : '';
      const k = this.keyFor(this.i), rec = k && Store.get(k);
      $('.pr-best', this.el).innerHTML = rec ? `<span class="mini-stars">${starStr(rec.stars)}</span> Bestwert ${rec.best}` : '';
      const over = ex.par && this.st.keys > ex.par && !this.solved;
      $('.pr-keys', this.el).classList.toggle('over', !!over);
      $('[data-act="next"]', this.el).textContent = this.solved ? (this.i < this.items.length - 1 ? 'Weiter' : (this.opts.finishLabel || 'Abschließen')) : 'Überspringen';
      $('[data-act="next"]', this.el).hidden = !this.solved && this.items.length === 1 && !this.opts.allowSkipSingle;
      const logEl = $('.pr-log', this.el);
      const shown = this.log.slice(-28);
      logEl.innerHTML = shown.length ? keycaps(shown) : '<span class="log-empty">Deine Tastendrücke erscheinen hier.</span>';
      if (ex.type === 'match') {
        const goal = ex.goal.split('\n');
        const cur = v.lines;
        let ok = 0;
        $('.pr-goal-text', this.el).innerHTML = goal.map((g, j) => {
          const same = cur[j] === g;
          if (same) ok++;
          return `<span class="gl ${same ? 'ok' : 'diff'}">${esc(g) || ' '}</span>`;
        }).join('\n') + (cur.length > goal.length ? `\n<span class="gl extra">${cur.length - goal.length} Zeile${cur.length - goal.length > 1 ? 'n' : ''} zu viel</span>` : '');
        const all = ok === goal.length && cur.length === goal.length;
        $('.pr-goal-state', this.el).textContent = all ? (v.mode === 'normal' ? 'erreicht' : 'Esc drücken') : ok + ' von ' + goal.length + ' Zeilen';
        $('.pr-goal', this.el).classList.toggle('reached', all);
      }
      if (this.opts.onUpdate) this.opts.onUpdate();
    }
  }

  /* ---------- Layout & Navigation ---------- */
  const main = $('#main');
  const sidebar = $('#sidebar');

  function renderSidebar(activeId) {
    const t = totals();
    const pct = Math.round(t.ex / TOTAL_EX * 100);
    let html = `<div class="sb-progress">
      <div class="sb-ring" style="--p:${pct}"><span>${pct}%</span></div>
      <div><b>${t.ex} von ${TOTAL_EX}</b> Übungen<br><span class="muted">${t.stars} von ${t.maxStars} Sternen</span></div>
    </div>`;
    COURSE.forEach((ch, ci) => {
      html += `<div class="sb-ch"><div class="sb-ch-h"><span class="sb-num">${ci + 1}</span>${esc(ch.title)}</div><ol>`;
      ch.lessons.forEach(l => {
        const s = lessonStatus(l);
        const state = s.complete ? 'done' : s.done ? 'started' : '';
        html += `<li><a href="#l-${l.id}" class="sb-l ${state}${l.id === activeId ? ' now' : ''}"${l.id === activeId ? ' aria-current="page"' : ''}>
          <span class="sb-dot" aria-hidden="true"></span><span class="sb-t">${esc(l.title)}</span>
          <span class="sb-st">${s.complete ? starStr(s.stars) : s.done ? s.done + '/' + s.total : ''}</span></a></li>`;
      });
      html += '</ol></div>';
    });
    html += `<div class="sb-foot" id="sb-foot"><button type="button" class="linkish" data-reset>Fortschritt zurücksetzen</button></div>`;
    sidebar.innerHTML = html;
  }

  sidebar.addEventListener('click', e => {
    const foot = $('#sb-foot');
    if (e.target.closest('[data-reset]')) {
      foot.innerHTML = `<span>Alle Sterne und Bestwerte löschen?</span><div class="confirm"><button type="button" class="btn danger small" data-reset-yes>Löschen</button><button type="button" class="btn ghost small" data-reset-no>Abbrechen</button></div>`;
      return;
    }
    if (e.target.closest('[data-reset-yes]')) { Store.reset(); route(); return; }
    if (e.target.closest('[data-reset-no]')) { renderSidebar(currentLesson); return; }
    if (e.target.closest('a')) document.body.classList.remove('nav-open');
  });
  $('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

  let currentLesson = null;
  let drillTimer = null;

  function setNav(name) {
    $$('.topnav a').forEach(a => a.classList.toggle('now', a.dataset.nav === name));
    $('.topnav [data-nav="lektionen"]').setAttribute('href', '#l-' + (currentLesson || nextLesson().id));
  }

  function route() {
    clearInterval(drillTimer);
    const hash = location.hash.replace(/^#/, '');
    document.body.classList.remove('nav-open');
    currentLesson = null;
    if (hash.startsWith('l-')) {
      const l = LESSONS.find(x => x.id === hash.slice(2));
      if (l) { currentLesson = l.id; renderSidebar(l.id); setNav('lektionen'); renderLesson(l); window.scrollTo(0, 0); return; }
    }
    renderSidebar(null);
    if (hash === 'challenges' || hash.startsWith('c-')) { setNav('challenges'); renderChallenges(hash.startsWith('c-') ? hash.slice(2) : null); }
    else if (hash === 'zielscheibe') { setNav('zielscheibe'); renderDrill(); }
    else if (hash === 'spielwiese') { setNav('spielwiese'); renderPlayground(); }
    else if (hash === 'spickzettel') { setNav('spickzettel'); renderCheatsheet(); }
    else { setNav('start'); renderStart(); }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- Start ---------- */
  function renderStart() {
    const t = totals();
    const nl = nextLesson();
    const begun = t.ex > 0;
    main.innerHTML = `<div class="page start">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Interaktiver Vim-Kurs · ${LESSONS.length} Lektionen · ${CHALLENGES.length} Challenges</p>
          <h1>Lerne Vim, indem du Vim benutzt.</h1>
          <p class="lede">Jede Lektion erklärt wenige Befehle und lässt dich sie sofort in einem echten Vim-Editor üben. Du siehst jeden Tastendruck, sammelst Sterne für sparsame Lösungen, und dein Fortschritt bleibt in diesem Browser gespeichert.</p>
          <div class="hero-cta">
            <a class="btn primary" href="#l-${nl.id}">${begun ? 'Weiter mit Lektion ' + nl.num : 'Mit Lektion 1 beginnen'}</a>
            <a class="btn ghost" href="#spickzettel">Spickzettel öffnen</a>
          </div>
          <dl class="stats">
            <div><dt>Lektionen</dt><dd>${t.lessons}<small>/${LESSONS.length}</small></dd></div>
            <div><dt>Sterne</dt><dd>${t.stars}<small>/${t.maxStars}</small></dd></div>
            <div><dt>Challenges</dt><dd>${t.ch}<small>/${CHALLENGES.length}</small></dd></div>
            <div><dt>Zielscheibe</dt><dd>${Store.data.drill || 0}<small> Treffer</small></dd></div>
          </dl>
        </div>
        <div class="hero-try"><p class="try-label">Probier es direkt aus</p><div id="welcome"></div></div>
      </section>
      <section class="chapters">
        <h2>Der Kurs</h2>
        <div class="ch-grid">${COURSE.map((ch, ci) => {
          const st = ch.lessons.map(lessonStatus);
          const done = st.filter(s => s.complete).length;
          return `<article class="ch-card">
            <div class="ch-top"><span class="ch-num">Kapitel ${ci + 1}</span><span class="ch-count">${done}/${ch.lessons.length}</span></div>
            <h3>${esc(ch.title)}</h3>
            <div class="bar"><span style="width:${Math.round(done / ch.lessons.length * 100)}%"></span></div>
            <ol>${ch.lessons.map((l, j) => `<li><a href="#l-${l.id}" class="${st[j].complete ? 'done' : st[j].done ? 'started' : ''}"><span class="sb-dot" aria-hidden="true"></span>${esc(l.title)}</a> <span class="ch-keys">${l.keys.slice(0, 3).map(k => `<kbd>${fmtKey(k[0])}</kbd>`).join('')}</span></li>`).join('')}</ol>
          </article>`;
        }).join('')}
          <article class="ch-card extra">
            <div class="ch-top"><span class="ch-num">Training</span></div>
            <h3>Üben ohne Anleitung</h3>
            <ul class="extra-list">
              <li><a href="#challenges"><b>Challenges</b><span>${CHALLENGES.length} Aufgaben im Vim-Golf-Stil: so wenige Tasten wie möglich.</span></a></li>
              <li><a href="#zielscheibe"><b>Zielscheibe</b><span>60 Sekunden Bewegungstraining gegen die Uhr.</span></a></li>
              <li><a href="#spielwiese"><b>Spielwiese</b><span>Freier Editor mit Registern, Marken und eigenem Text.</span></a></li>
            </ul>
          </article>
        </div>
      </section>
    </div>`;
    new Practice($('#welcome'), {
      exercises: [WELCOME], heading: 'Erste Bewegung', finishLabel: 'Zu Lektion 1',
      onFinish: () => { location.hash = '#l-' + LESSONS[0].id; }
    });
  }

  /* ---------- Lektion ---------- */
  function renderLesson(l) {
    const idx = LESSONS.indexOf(l);
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    const s = lessonStatus(l);
    const startAt = Math.max(0, l.ex.findIndex((e, i) => !Store.data.ex[l.id + ':' + i]));
    main.innerHTML = `<article class="page lesson">
      <header class="l-head">
        <p class="eyebrow">Kapitel ${l.ci + 1} · ${esc(l.chapter.title)} <span class="sep">/</span> Lektion ${l.num} von ${LESSONS.length}</p>
        <h1>${esc(l.title)}</h1>
        <p class="lede">${l.intro}</p>
      </header>
      <section class="l-keys" aria-label="Befehle dieser Lektion">${l.keys.map(k => `<div class="keycard"><kbd>${fmtKey(k[0])}</kbd><span>${esc(k[1])}</span></div>`).join('')}</section>
      <div class="prose">${l.body}${l.tip ? `<p class="tip"><b>Tipp</b> ${l.tip}</p>` : ''}</div>
      <div id="practice"></div>
      <div id="lesson-done" hidden></div>
      <nav class="pager" aria-label="Lektionen">
        ${prev ? `<a href="#l-${prev.id}" class="pg prev"><small>Vorherige Lektion</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}
        ${next ? `<a href="#l-${next.id}" class="pg next"><small>Nächste Lektion</small><span>${esc(next.title)}</span></a>` : `<a href="#challenges" class="pg next"><small>Kurs geschafft</small><span>Zu den Challenges</span></a>`}
      </nav>
    </article>`;
    const showDone = () => {
      const st = lessonStatus(l);
      const box = $('#lesson-done');
      if (!st.complete) return;
      box.hidden = false;
      box.innerHTML = `<div class="done-card">
        <span class="done-stars s${st.stars}">${starStr(st.stars)}</span>
        <div><h2>Lektion abgeschlossen</h2><p>${st.stars === 3 ? 'Jede Übung mit Bestwert gelöst.' : 'Für drei Sterne: Löse jede Übung mit höchstens so vielen Tasten wie das Ziel vorgibt.'}</p></div>
        ${next ? `<a class="btn primary" href="#l-${next.id}">Weiter: ${esc(next.title)}</a>` : '<a class="btn primary" href="#challenges">Zu den Challenges</a>'}
      </div>`;
    };
    const p = new Practice($('#practice'), {
      exercises: l.ex,
      start: s.complete ? 0 : startAt,
      storeKey: i => l.id + ':' + i,
      finishLabel: next ? 'Nächste Lektion' : 'Zu den Challenges',
      allowSkipSingle: true,
      onSolve: () => { renderSidebar(l.id); showDone(); },
      onFinish: () => { location.hash = next ? '#l-' + next.id : '#challenges'; }
    });
    showDone();
    p.view.focus();
  }

  /* ---------- Challenges ---------- */
  function renderChallenges(activeId) {
    const active = CHALLENGES.find(c => c.id === activeId);
    const lvl = n => `<span class="lvl l${n}" aria-label="Schwierigkeit ${n} von 3">${'●'.repeat(n)}${'○'.repeat(3 - n)}</span>`;
    main.innerHTML = `<div class="page challenges">
      <header class="l-head">
        <p class="eyebrow">Training</p>
        <h1>Challenges</h1>
        <p class="lede">Kleine Bearbeitungsaufgaben im Stil von Vim-Golf. Es gibt keinen vorgegebenen Weg. Jede Aufgabe hat einen Zielwert an Tasten, und wer darunter bleibt, bekommt drei Sterne.</p>
      </header>
      <div id="ch-active"></div>
      <div class="cards">${CHALLENGES.map((c, i) => {
        const r = Store.data.ch[c.id];
        const par = VK.prepare(c).par;
        return `<a class="cc${c.id === activeId ? ' now' : ''}${r ? ' done' : ''}" href="#c-${c.id}">
          <span class="cc-top"><span class="cc-num">${String(i + 1).padStart(2, '0')}</span>${lvl(c.level)}</span>
          <b>${esc(c.title)}</b><span class="cc-task">${esc(c.task)}</span>
          <span class="cc-foot"><span>Ziel ≤ ${par}</span><span>${r ? `<span class="mini-stars">${starStr(r.stars)}</span> ${r.best}` : 'offen'}</span></span>
        </a>`;
      }).join('')}</div>
    </div>`;
    if (active) {
      const i = CHALLENGES.indexOf(active), nx = CHALLENGES[i + 1];
      const box = $('#ch-active');
      box.innerHTML = `<div class="ch-active-h"><h2>${esc(active.title)}</h2><a class="linkish" href="#challenges">Schließen</a></div>`;
      const p = new Practice(box, {
        exercises: [active], heading: 'Challenge ' + (i + 1) + ' von ' + CHALLENGES.length,
        storeKey: () => 'ch:' + active.id,
        finishLabel: nx ? 'Nächste Challenge' : 'Zur Übersicht', allowSkipSingle: true,
        onSolve: () => {
          const card = $(`.cc[href="#c-${active.id}"]`);
          const r = Store.data.ch[active.id];
          if (card && r) { card.classList.add('done'); $('.cc-foot span:last-child', card).innerHTML = `<span class="mini-stars">${starStr(r.stars)}</span> ${r.best}`; }
        },
        onFinish: () => { location.hash = nx ? '#c-' + nx.id : '#challenges'; }
      });
      p.view.focus();
    }
  }

  /* ---------- Zielscheibe ---------- */
  function renderDrill() {
    const DURATION = 60;
    main.innerHTML = `<div class="page drill">
      <header class="l-head">
        <p class="eyebrow">Training</p>
        <h1>Zielscheibe</h1>
        <p class="lede">Ein Ziel nach dem anderen leuchtet im Code auf. Triff in 60 Sekunden so viele wie möglich. Die Uhr startet mit deinem ersten Tastendruck. Nutze alles, was du kennst: <kbd>w</kbd>, <kbd>f</kbd>, <kbd>/</kbd>, Zahlen und Zeilensprünge.</p>
      </header>
      <div class="drill-bar">
        <div class="db"><span>Zeit</span><b id="d-time">60,0</b></div>
        <div class="db"><span>Treffer</span><b id="d-hits">0</b></div>
        <div class="db"><span>Tasten pro Treffer</span><b id="d-eff">–</b></div>
        <div class="db"><span>Rekord</span><b id="d-best">${Store.data.drill || 0}</b></div>
      </div>
      <div class="drill-meter"><span id="d-bar"></span></div>
      <div id="d-ed"></div>
      <div class="drill-foot"><p id="d-msg" class="muted">Klicke in den Editor und drücke eine Bewegungstaste.</p><button type="button" class="btn primary" id="d-new">Neue Runde</button></div>
    </div>`;
    let v, target, hits, keys, startT, running, over;
    const view = new EditorView($('#d-ed'), {
      label: 'Zielscheibe',
      decorate: () => target ? { targets: [{ r: target.r, c: target.c, kind: 'tgt' }] } : null,
      onKey: k => {
        if (over) { if (k === K.CR) reset(); return; }
        if (!running) { running = true; startT = performance.now(); drillTimer = setInterval(tick, 100); }
        v.feed(k); keys++;
        if (v.mode === 'normal' && v.r === target.r && v.c === target.c) { hits++; pick(); }
        stats();
      }
    });
    const cells = [];
    DRILL_TEXT.split('\n').forEach((line, r) => { for (let c = 0; c < line.length; c++) if (line[c] !== ' ') cells.push({ r, c }); });
    function pick() {
      let t;
      do { t = cells[Math.floor(Math.random() * cells.length)]; } while (target && Math.abs(t.r - v.r) + Math.abs(t.c - v.c) < 6);
      target = t;
    }
    function stats() {
      $('#d-hits').textContent = hits;
      $('#d-eff').textContent = hits ? (keys / hits).toFixed(1).replace('.', ',') : '–';
    }
    function tick() {
      const left = Math.max(0, DURATION - (performance.now() - startT) / 1000);
      $('#d-time').textContent = left.toFixed(1).replace('.', ',');
      $('#d-bar').style.width = (left / DURATION * 100) + '%';
      if (left <= 0) finish();
    }
    function finish() {
      clearInterval(drillTimer);
      over = true; running = false;
      const best = Store.data.drill || 0;
      if (hits > best) { Store.data.drill = hits; Store.save(); $('#d-best').textContent = hits; }
      $('#d-msg').innerHTML = `<b>Zeit ist um: ${hits} Treffer.</b> ${hits > best ? 'Neuer Rekord!' : 'Rekord: ' + best + '.'} <kbd>Enter</kbd> startet eine neue Runde.`;
      target = null; view.render();
    }
    function reset() {
      clearInterval(drillTimer);
      v = new Vim(DRILL_TEXT, { height: 13 });
      hits = 0; keys = 0; running = false; over = false; target = null;
      pick();
      view.setEngine(v);
      $('#d-time').textContent = '60,0';
      $('#d-bar').style.width = '100%';
      $('#d-msg').textContent = 'Die Uhr startet mit deinem ersten Tastendruck.';
      stats();
      view.focus();
    }
    $('#d-new').addEventListener('click', reset);
    reset();
  }

  /* ---------- Spielwiese ---------- */
  const SAMPLE = [
    '# Spielwiese',
    '',
    'Hier kannst du alles ausprobieren, was du gelernt hast.',
    'Nichts wird bewertet, nichts kann kaputtgehen. Mit u machst du alles rückgängig.',
    '',
    'function begruessung(name, sprache) {',
    '    const texte = {',
    '        de: "Hallo",',
    '        en: "Hello",',
    '        fr: "Bonjour",',
    '    };',
    '    return `${texte[sprache]}, ${name}!`;',
    '}',
    '',
    'const gaeste = ["Ada", "Linus", "Grace", "Bram"];',
    'for (const gast of gaeste) {',
    '    console.log(begruessung(gast, "de"));',
    '}',
    '',
    '<ul class="liste">',
    '    <li>Eins</li>',
    '    <li>Zwei</li>',
    '    <li>Drei</li>',
    '</ul>',
    '',
    'Ideen: ci" im Objekt, :%s/Hallo/Servus/g, qa…q mit @a, oder Ctrl-v für Blöcke.'
  ].join('\n');

  function renderPlayground() {
    main.innerHTML = `<div class="page playground">
      <header class="l-head">
        <p class="eyebrow">Training</p>
        <h1>Spielwiese</h1>
        <p class="lede">Ein freier Vim-Editor ohne Aufgaben. Rechts siehst du live, was in den Registern und Marken steckt.</p>
      </header>
      <div class="pg-grid">
        <div id="pg-ed"></div>
        <aside class="pg-side">
          <section><h3>Optionen</h3>
            <label class="check"><input type="checkbox" id="pg-rnu"> Relative Zeilennummern</label>
            <label class="check"><input type="checkbox" id="pg-hls" checked> Suchtreffer hervorheben</label>
            <label class="check"><input type="checkbox" id="pg-ic"> Groß/klein bei Suche ignorieren</label>
          </section>
          <section><h3>Register</h3><div id="pg-regs" class="pg-table"></div></section>
          <section><h3>Marken</h3><div id="pg-marks" class="pg-table"></div></section>
          <section><h3>Zuletzt</h3><div id="pg-last" class="pg-table"></div></section>
        </aside>
      </div>
      <div class="pg-tools">
        <button type="button" class="btn ghost" id="pg-sample">Beispieltext laden</button>
        <button type="button" class="btn ghost" id="pg-clear">Leeren</button>
        <details class="pg-own"><summary>Eigenen Text einfügen</summary>
          <label for="pg-own" class="muted">Füge Text ein, zum Beispiel Code aus deinem Projekt.</label>
          <textarea id="pg-own" rows="6" spellcheck="false"></textarea>
          <button type="button" class="btn primary small" id="pg-load">In den Editor laden</button>
        </details>
      </div>
    </div>`;
    const v = new Vim(SAMPLE, { height: 18 });
    const view = new EditorView($('#pg-ed'), { label: 'Spielwiese', onKey: k => { v.feed(k); side(); } });
    view.setEngine(v);
    const side = () => {
      const rows = [];
      const order = ['"', '0', '1', '2', '3', '-'].concat('abcdefghijklmnopqrstuvwxyz'.split(''));
      for (const r of order) if (v.regs[r]) rows.push(`<div><kbd>"${esc(r)}</kbd><code>${esc(v.regs[r].text.replace(/\n/g, '⏎').slice(0, 48)) || '∅'}</code></div>`);
      $('#pg-regs').innerHTML = rows.join('') || '<p class="muted">Noch leer. Kopiere etwas mit <kbd>y</kbd>.</p>';
      const marks = Object.keys(v.marks).filter(k => /[a-zA-Z]/.test(k)).sort();
      $('#pg-marks').innerHTML = marks.map(k => `<div><kbd>${k}</kbd><code>Zeile ${v.marks[k].r + 1}, Spalte ${v.marks[k].c + 1}</code></div>`).join('') || '<p class="muted">Setze eine mit <kbd>ma</kbd>.</p>';
      const last = [];
      if (v.dot) last.push(`<div><kbd>.</kbd><code>${esc(Vim.toNotation(v.dot))}</code></div>`);
      if (v.lastEx) last.push(`<div><kbd>:</kbd><code>${esc(v.lastEx)}</code></div>`);
      if (v.lastSearch) last.push(`<div><kbd>/</kbd><code>${esc(v.lastSearch.src)}</code></div>`);
      $('#pg-last').innerHTML = last.join('') || '<p class="muted">Letzte Änderung, Suche und Befehl erscheinen hier.</p>';
      $('#pg-rnu').checked = v.o.relativenumber;
      $('#pg-hls').checked = v.o.hlsearch;
      $('#pg-ic').checked = v.o.ignorecase;
    };
    const load = text => { v.setText(text); view.render(); side(); view.focus(); };
    $('#pg-rnu').addEventListener('change', e => { v.o.relativenumber = e.target.checked; view.render(); });
    $('#pg-hls').addEventListener('change', e => { v.o.hlsearch = e.target.checked; view.render(); });
    $('#pg-ic').addEventListener('change', e => { v.o.ignorecase = e.target.checked; });
    $('#pg-sample').addEventListener('click', () => load(SAMPLE));
    $('#pg-clear').addEventListener('click', () => load(''));
    $('#pg-load').addEventListener('click', () => { const t = $('#pg-own').value; if (t) load(t); });
    side();
    view.focus();
  }

  /* ---------- Spickzettel ---------- */
  function renderCheatsheet() {
    main.innerHTML = `<div class="page cheatsheet">
      <header class="l-head">
        <p class="eyebrow">Nachschlagen</p>
        <h1>Spickzettel</h1>
        <p class="lede">Alle Befehle aus dem Kurs, sortiert nach Lektion. Ein Klick auf die Lektion bringt dich zur passenden Übung.</p>
        <div class="search"><label for="cs-q" class="sr">Befehle durchsuchen</label>
          <input type="search" id="cs-q" placeholder="Suchen, zum Beispiel „löschen“, „ci“ oder „Register“" autocomplete="off"></div>
      </header>
      <div class="cs-grid">${COURSE.map((ch, ci) => `<section class="cs-ch"><h2><span>${ci + 1}</span>${esc(ch.title)}</h2>${ch.lessons.map(l => `
        <div class="cs-l"><h3><a href="#l-${l.id}">${esc(l.title)}</a></h3><dl>${l.keys.map(k => `<div class="cs-row" data-s="${esc((k[0] + ' ' + k[1] + ' ' + l.title).toLowerCase())}"><dt><kbd>${fmtKey(k[0])}</kbd></dt><dd>${esc(k[1])}</dd></div>`).join('')}</dl></div>`).join('')}</section>`).join('')}
      </div>
      <p class="cs-empty muted" hidden>Kein Befehl passt zu dieser Suche.</p>
    </div>`;
    const q = $('#cs-q');
    q.addEventListener('input', () => {
      const s = q.value.trim().toLowerCase();
      let any = false;
      $$('.cs-row').forEach(r => { const hit = !s || r.dataset.s.includes(s); r.hidden = !hit; any = any || hit; });
      $$('.cs-l').forEach(l => { l.hidden = !$$('.cs-row', l).some(r => !r.hidden); });
      $$('.cs-ch').forEach(c => { c.hidden = !$$('.cs-l', c).some(l => !l.hidden); });
      $('.cs-empty').hidden = any;
    });
  }

  route();
})();
