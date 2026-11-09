/* Desktop portfolio — Jodhdeep Singh (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const doc = $('#doc');
  const EMAIL = 'jodhdeepsingh@gmail.com';
  const RESUME = 'assets/Jodhdeep_Singh_Resume.pdf';
  // The claude.ai viewer blocks plain downloads, embedded PDFs and email links
  const inViewer = !!(window.claude && typeof window.claude.use === 'function');

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (t) => t.replace(/&/g, '&amp;');
  const clamp = (v, a, b) => Math.min(Math.max(v, a), Math.max(a, b));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const phone = matchMedia('(max-width: 719px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOK = () => !reduced.matches;
  const starSvg = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 12l4.5 15.5L52 32l-15.5 4.5L32 52l-4.5-15.5L12 32l15.5-4.5z"/></svg>';

  /* ---------- Icons ---------- */
  const GLYPHS = {
    about: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>',
    resume: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    contact: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 7l8.5 6.5L20.5 7"/>',
    journey: '<circle cx="6" cy="18" r="2"/><circle cx="12" cy="11" r="2"/><circle cx="18" cy="5.5" r="2"/><path d="M7.4 16.5l3.2-3.9M13.5 9.7l3-2.8"/>',
    education: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M7 11.800V16c0 1.200 2.200 2.500 5 2.500s5-1.300 5-2.500v-4.200"/>',
    toolkit: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.500M12 12v9"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6.5 9.5V20h11V9.5"/>'
  };
  const glyph = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${GLYPHS[name]}</svg>`;
  const tile = (name, small) => `<span class="ico${small ? ' ico-sm' : ''}" aria-hidden="true">${glyph(name)}</span>`;

  /* ---------- Apps ---------- */
  const APPS = {
    about:     { title: 'About Me',              icon: 'about',     w: 640, h: 420 },
    resume:    { title: 'Resume',                icon: 'resume',    w: 700, h: 720 },
    contact:   { title: 'Contact Me',            icon: 'contact',   w: 540, h: 440 },
    journey:   { title: 'Journey',               icon: 'journey',   w: 780, h: 720 },
    education: { title: 'Learning & Leadership', icon: 'education', w: 660, h: 470 },
    toolkit:   { title: 'Toolkit',               icon: 'toolkit',   w: 720, h: 380 }
  };
  const ICON_ORDER = ['about', 'resume', 'contact', 'journey', 'education', 'toolkit'];
  const idFromHash = (h) => {
    const key = decodeURIComponent(h.replace(/^#/, ''));
    return APPS[key] ? key : null;
  };

  /* ---------- Shell ---------- */
  const wall = el('div', 'wall', '<i class="orb o1"></i><i class="orb o2"></i><i class="orb o3"></i>');

  const topbar = el('header', 'topbar', `
    <div class="tb-id">${starSvg}Jodhdeep Singh <span class="tb-active"></span></div>
    <div class="tb-right">
      <button class="tb-btn tb-theme" type="button"></button>
      <span class="tb-clock"></span>
    </div>`);

  const desk = el('div', 'desk', `
    <figure class="quote-wrap">
      <blockquote class="headline">The best way to predict the future is to <span class="hl">invent</span> it.</blockquote>
      <figcaption class="quote-by">Alan Kay</figcaption>
    </figure>
    <div class="dicons"></div>`);
  desk.setAttribute('role', 'main');
  doc.removeAttribute('role');
  const dicons = $('.dicons', desk);

  const taskbar = el('footer', 'taskbar', `
    <button class="tk-start" type="button" aria-expanded="false" aria-haspopup="true">${starSvg}Apps</button>
    <div class="tk-tasks" role="group" aria-label="Open windows"></div>
    <a class="btn btn-primary" href="${RESUME}" download>Resume</a>
    <nav class="dock" aria-label="Quick apps">
      <button type="button" data-home>${glyph('home')}Home</button>
      <button type="button" data-open="about">${glyph('about')}About</button>
      <button type="button" data-open="journey">${glyph('journey')}Journey</button>
      <button type="button" data-open="resume">${glyph('resume')}Resume</button>
      <button type="button" data-open="contact">${glyph('contact')}Contact</button>
    </nav>`);

  const toast = el('div', 'toast');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  document.body.prepend(wall, topbar, desk, taskbar, toast);
  const tasks = $('.tk-tasks', taskbar);
  const startBtn = $('.tk-start', taskbar);
  const activeLabel = $('.tb-active', topbar);

  let toastT = 0;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ---------- Theme ---------- */
  const themeBtn = $('.tb-theme', topbar);
  const metaTheme = $('meta[name="theme-color"]');
  const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.400 1.400M5.300 18.700l1.400-1.400M17.300 6.700l1.400-1.400"/>';
  const MOON = '<path d="M20 14.5A8.5 8.5 0 0 1 9.500 4a8.500 8.500 0 1 0 10.500 10.500z"/>';
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    const dark = t === 'dark';
    themeBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${dark ? MOON : SUN}</svg>`;
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    metaTheme.setAttribute('content', dark ? '#0f1520' : '#e9edf2');
    try { localStorage.setItem('js-theme', t); } catch {}
  }
  function setTheme(next) {
    if (next === root.getAttribute('data-theme')) return;
    if (!document.startViewTransition || !motionOK()) return applyTheme(next);
    const r = themeBtn.getBoundingClientRect();
    root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
    root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    root.classList.add('theme-vt');
    document.startViewTransition(() => applyTheme(next)).finished.finally(() => root.classList.remove('theme-vt'));
  }
  const toggleTheme = () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  themeBtn.addEventListener('click', toggleTheme);

  const clockEl = $('.tb-clock', topbar);
  const clockFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
  const tick = () => { clockEl.textContent = clockFmt.format(new Date()); };
  tick(); setInterval(tick, 15000);

  /* ---------- Windows ---------- */
  const wins = new Map();
  let zTop = 10;
  const deskSize = () => ({ W: desk.clientWidth, H: desk.clientHeight });
  const applyGeo = (w) => {
    w.el.style.translate = `${Math.round(w.x)}px ${Math.round(w.y)}px`;
    w.el.style.width = `${Math.round(w.w)}px`;
    w.el.style.height = `${Math.round(w.h)}px`;
  };
  const CTRL = {
    min: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h14"/></svg>',
    max: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="1.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
  };

  function placement(def, at) {
    const { W, H } = deskSize();
    const w = clamp(def.w, 300, W - 16);
    const h = clamp(def.h, 220, H - 16);
    const n = wins.size;
    const x = at ? at.x : Math.max(W > 900 ? 220 : 8, (W - w) / 2) + (n % 6) * 26;
    const y = at ? at.y : Math.max(10, (H - h) / 2 + (n % 6) * 22 - 30);
    return { w, h, x: clamp(x, 8, W - w - 8), y: clamp(y, 8, H - h - 8) };
  }

  function openApp(id, opts = {}) {
    const def = APPS[id];
    if (!def) return null;
    closeLauncher();
    const existing = wins.get(id);
    if (existing) {
      if (existing.min) restore(existing);
      focusWin(existing, true);
      if (opts.scrollTo) jumpTo(existing, opts.scrollTo);
      return existing;
    }
    const content = doc.querySelector(`[data-app="${id}"]`);
    if (!content) return null;

    const node = el('section', 'win');
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-label', def.title);
    node.tabIndex = -1;
    node.innerHTML = `
      <div class="win-bar" tabindex="0" aria-label="${esc(def.title)} title bar. Arrow keys move the window.">
        <button class="w-back" type="button" aria-label="Back">${CTRL.back}</button>
        ${tile(def.icon, true)}
        <span class="win-t">${esc(def.title)}</span>
        <div class="win-c">
          <button class="w-min" type="button" aria-label="Minimize ${esc(def.title)}" title="Minimize">${CTRL.min}</button>
          <button class="w-max" type="button" aria-label="Maximize ${esc(def.title)}" title="Maximize">${CTRL.max}</button>
          <button class="w-close" type="button" aria-label="Close ${esc(def.title)}" title="Close">${CTRL.close}</button>
        </div>
      </div>
      <div class="win-body"></div>
      ${['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].map((d) => `<i class="rz rz-${d}" data-d="${d}"></i>`).join('')}`;

    content.hidden = false;
    $('.win-body', node).appendChild(content);

    const w = { id, def, el: node, content, min: false, max: false, prev: null, opener: opts.opener || document.activeElement, ...placement(def, opts.at) };
    wins.set(id, w);
    desk.appendChild(node);
    applyGeo(w);
    addTask(w);
    bindWindow(w);
    initApp(id, w);
    focusWin(w, true);
    if (opts.scrollTo) jumpTo(w, opts.scrollTo);
    // Scale only: an opacity fade can leave a window invisible if the frame clock stalls during load
    if (motionOK() && !opts.instant) node.animate([{ transform: 'scale(.97)' }, { transform: 'none' }], { duration: 150, easing: 'ease-out' });
    return w;
  }

  function jumpTo(w, id) {
    const t = w.content.querySelector(`#${id}`);
    if (t) t.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
  }

  function focusWin(w, moveFocus) {
    w.el.style.zIndex = ++zTop;
    wins.forEach((o) => {
      const on = o === w;
      o.el.classList.toggle('focused', on);
      o.task.classList.toggle('on', on);
      o.task.setAttribute('aria-pressed', String(on));
    });
    if (moveFocus) w.el.focus({ preventScroll: true });
    syncChrome(w);
  }
  const topWin = () => [...wins.values()].filter((w) => !w.min).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0] || null;

  function syncChrome(w) {
    activeLabel.textContent = w ? `/ ${w.def.title}` : '';
    $$('.dock button', taskbar).forEach((b) => {
      b.classList.toggle('on', w ? b.dataset.open === w.id : b.hasAttribute('data-home'));
    });
    try { history.replaceState(null, '', w ? `#${w.id}` : location.pathname + location.search); } catch {}
  }
  function blurAll() {
    wins.forEach((o) => { o.el.classList.remove('focused'); o.task.classList.remove('on'); o.task.setAttribute('aria-pressed', 'false'); });
    syncChrome(null);
  }
  function refocusTop(moveFocus) {
    const next = topWin();
    if (next) focusWin(next, moveFocus); else blurAll();
  }

  function addTask(w) {
    const b = el('button', 'task', `${tile(w.def.icon, true)}<span>${esc(w.def.title)}</span>`);
    b.type = 'button';
    b.title = w.def.title;
    b.addEventListener('click', () => {
      if (w.min) { restore(w); focusWin(w, true); }
      else if (w.el.classList.contains('focused')) minimize(w);
      else focusWin(w, true);
    });
    w.task = b;
    tasks.appendChild(b);
  }

  function minimize(w) {
    if (w.min || phone.matches) return;
    w.min = true;
    w.el.classList.add('min');
    w.task.classList.add('isMin');
    stopApp(w.id);
    refocusTop(false);
  }
  function restore(w) {
    w.min = false;
    w.el.classList.remove('min');
    w.task.classList.remove('isMin');
  }
  function animGeo(w) {
    if (!motionOK()) return;
    w.el.classList.add('anim');
    setTimeout(() => w.el.classList.remove('anim'), 240);
  }
  function setMax(w, on) {
    if (on === w.max) return;
    animGeo(w);
    w.max = on;
    w.el.classList.toggle('max', on);
    const btn = $('.w-max', w.el);
    btn.setAttribute('aria-label', `${on ? 'Restore' : 'Maximize'} ${w.def.title}`);
    btn.title = on ? 'Restore' : 'Maximize';
    if (on) {
      w.prev = w.prev || { x: w.x, y: w.y, w: w.w, h: w.h };
      const { W, H } = deskSize();
      Object.assign(w, { x: 0, y: 0, w: W, h: H });
    } else if (w.prev) {
      Object.assign(w, w.prev); w.prev = null;
    }
    applyGeo(w);
  }

  function closeWin(w) {
    wins.delete(w.id);
    w.task.remove();
    stopApp(w.id);
    w.content.querySelectorAll('iframe').forEach((f) => f.remove());
    if (w.def.keepHidden) w.content.hidden = true;
    doc.appendChild(w.content);
    w.el.remove();
    const opener = w.opener;
    refocusTop(false);
    const t = topWin();
    if (t) t.el.focus({ preventScroll: true });
    else if (opener && opener.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
  }
  const closeAll = () => [...wins.values()].forEach(closeWin);

  function bindWindow(w) {
    const bar = $('.win-bar', w.el);
    w.el.addEventListener('pointerdown', () => { if (!w.el.classList.contains('focused')) focusWin(w, false); }, true);
    $('.w-min', w.el).addEventListener('click', () => minimize(w));
    $('.w-max', w.el).addEventListener('click', () => setMax(w, !w.max));
    $('.w-close', w.el).addEventListener('click', () => closeWin(w));
    $('.w-back', w.el).addEventListener('click', () => closeWin(w));
    bar.addEventListener('dblclick', (e) => { if (!e.target.closest('button') && !phone.matches) setMax(w, !w.max); });
    bar.addEventListener('pointerdown', (e) => startDrag(e, w, bar));
    bar.addEventListener('keydown', (e) => {
      if (e.target !== bar || phone.matches) return;
      const step = e.shiftKey ? 64 : 24;
      const m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (m) {
        e.preventDefault();
        if (w.max) setMax(w, false);
        const { W, H } = deskSize();
        w.x = clamp(w.x + m[0], 120 - w.w, W - 120); w.y = clamp(w.y + m[1], 0, H - 40);
        applyGeo(w);
      } else if (e.key === 'Enter') { e.preventDefault(); setMax(w, !w.max); }
    });
    $$('.rz', w.el).forEach((h) => h.addEventListener('pointerdown', (e) => startResize(e, w, h.dataset.d)));
  }

  let snapEl = null;
  function snapRect(zone) {
    const { W, H } = deskSize();
    if (zone === 'left') return { x: 0, y: 0, w: Math.round(W / 2), h: H };
    if (zone === 'right') return { x: Math.round(W / 2), y: 0, w: W - Math.round(W / 2), h: H };
    return { x: 0, y: 0, w: W, h: H };
  }
  function showSnap(zone) {
    if (!zone) { if (snapEl) { snapEl.remove(); snapEl = null; } return; }
    if (!snapEl) { snapEl = el('div', 'snap'); desk.appendChild(snapEl); }
    const r = snapRect(zone);
    Object.assign(snapEl.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
  }

  function startDrag(e, w, bar) {
    if (e.button || e.target.closest('button') || phone.matches) return;
    const sx = e.clientX, sy = e.clientY, top = desk.getBoundingClientRect().top;
    let ox = w.x, oy = w.y, moved = false, zone = null;
    bar.setPointerCapture(e.pointerId);
    const move = (ev) => {
      if (!moved) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        moved = true;
        document.body.classList.add('dragging');
        if (w.max || w.snapped) {
          const ratio = (sx - w.x) / w.w, r = w.prev;
          if (w.max) { w.max = false; w.el.classList.remove('max'); }
          if (r) { w.w = r.w; w.h = r.h; }
          w.prev = null; w.snapped = false;
          ox = sx - w.w * ratio; oy = 0; w.x = ox; w.y = oy;
          $('.w-max', w.el).title = 'Maximize';
        }
      }
      const { W, H } = deskSize();
      w.x = clamp(ox + ev.clientX - sx, 120 - w.w, W - 120);
      w.y = clamp(oy + ev.clientY - sy, 0, H - 40);
      applyGeo(w);
      zone = ev.clientX <= 6 ? 'left' : ev.clientX >= innerWidth - 7 ? 'right' : ev.clientY <= top + 2 ? 'top' : null;
      showSnap(zone);
    };
    const up = (ev) => {
      if (ev.type === 'pointerup') move(ev);
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
      document.body.classList.remove('dragging');
      showSnap(null);
      if (!moved || !zone) return;
      if (zone === 'top') setMax(w, true);
      else {
        animGeo(w);
        w.prev = { x: w.x, y: 40, w: w.w, h: w.h };
        w.snapped = true;
        Object.assign(w, snapRect(zone));
        applyGeo(w);
      }
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  }

  function startResize(e, w, dir) {
    if (e.button || phone.matches) return;
    e.preventDefault();
    const h = e.currentTarget, sx = e.clientX, sy = e.clientY, s = { x: w.x, y: w.y, w: w.w, h: w.h };
    const MINW = 320, MINH = 220;
    h.setPointerCapture(e.pointerId);
    document.body.classList.add('dragging');
    w.snapped = false; w.prev = null;
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy, { W, H } = deskSize();
      if (dir.includes('e')) w.w = clamp(s.w + dx, MINW, W - s.x);
      if (dir.includes('s')) w.h = clamp(s.h + dy, MINH, H - s.y);
      if (dir.includes('w')) { const nw = clamp(s.w - dx, MINW, s.x + s.w); w.x = s.x + s.w - nw; w.w = nw; }
      if (dir.includes('n')) { const nh = clamp(s.h - dy, MINH, s.y + s.h); w.y = s.y + s.h - nh; w.h = nh; }
      applyGeo(w);
    };
    const up = () => {
      h.removeEventListener('pointermove', move);
      h.removeEventListener('pointerup', up);
      h.removeEventListener('pointercancel', up);
      document.body.classList.remove('dragging');
    };
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerup', up);
    h.addEventListener('pointercancel', up);
  }

  /* ---------- Desktop icons ---------- */
  const iconEls = ICON_ORDER.map((id) => {
    const b = el('button', 'dicon', `${tile(APPS[id].icon)}<span class="dicon-l">${esc(APPS[id].title)}</span>`);
    b.type = 'button';
    b.addEventListener('click', () => openApp(id, { opener: b }));
    dicons.appendChild(b);
    return b;
  });
  iconEls.forEach((b, i) => b.addEventListener('keydown', (e) => {
    const d = (phone.matches ? { ArrowDown: 3, ArrowUp: -3, ArrowRight: 1, ArrowLeft: -1 } : { ArrowDown: 1, ArrowUp: -1 })[e.key];
    if (!d) return;
    e.preventDefault();
    iconEls[clamp(i + d, 0, iconEls.length - 1)].focus();
  }));
  desk.addEventListener('pointerdown', (e) => {
    closeLauncher();
    if (e.target === desk || e.target === dicons) blurAll();
  });

  /* ---------- Launcher + search ---------- */
  let launcher = null;
  const SEARCH = ICON_ORDER.map((id) => ({ label: APPS[id].title, id, def: APPS[id] }));
  $$('.proj').forEach((p) => SEARCH.push({ label: $('h3', p).textContent, hint: 'Project', id: 'journey', def: APPS.journey, target: p.id, extra: p.textContent }));
  $$('.job').forEach((j) => SEARCH.push({ label: $('h2', j).textContent, hint: 'Role', id: 'journey', def: APPS.journey, target: j.id, extra: $('.job-org', j).textContent + $('.bul', j).textContent }));
  $$('.kit li').forEach((li) => SEARCH.push({ label: li.textContent, hint: 'Skill', id: 'toolkit', def: APPS.toolkit }));

  function itemButton(it, first) {
    const b = el('button', `ln-item${first ? ' first' : ''}`, `${tile(it.def.icon, true)}<span></span>${it.hint ? `<small>${it.hint}</small>` : ''}`);
    b.type = 'button';
    b.querySelector('span:nth-child(2)').textContent = it.label;
    b.addEventListener('click', () => openApp(it.id, { opener: startBtn, scrollTo: it.target }));
    return b;
  }
  function renderLauncher(q) {
    const list = $('.ln-list', launcher);
    list.replaceChildren();
    const needle = q.trim().toLowerCase();
    if (!needle) {
      const grid = el('div', 'ln-grid');
      SEARCH.slice(0, ICON_ORDER.length).forEach((s) => grid.appendChild(itemButton(s)));
      list.appendChild(grid);
      return;
    }
    const hits = SEARCH.filter((s) => `${s.label} ${s.extra || ''}`.toLowerCase().includes(needle)).slice(0, 10);
    if (!hits.length) { list.appendChild(el('p', 'ln-none', 'No matches.')); return; }
    hits.forEach((h, i) => list.appendChild(itemButton(h, i === 0)));
  }
  function openLauncher() {
    if (launcher) return;
    launcher = el('div', 'launcher', `
      <div class="ln-input"><input id="ln-search" type="search" aria-label="Search" placeholder="Search" autocomplete="off" /></div>
      <div class="ln-list"></div>`);
    launcher.setAttribute('role', 'dialog');
    launcher.setAttribute('aria-label', 'Apps and search');
    document.body.appendChild(launcher);
    startBtn.setAttribute('aria-expanded', 'true');
    const input = $('input', launcher);
    renderLauncher('');
    input.addEventListener('input', () => renderLauncher(input.value));
    launcher.addEventListener('keydown', (e) => {
      const btns = $$('.ln-item', launcher);
      if (e.key === 'Enter' && e.target === input) { e.preventDefault(); if (input.value.trim() && btns[0]) btns[0].click(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const i = btns.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') (i < btns.length - 1 ? btns[i + 1] : input).focus();
      else if (i === 0) input.focus();
      else (i < 0 ? btns[btns.length - 1] : btns[i - 1]).focus();
    });
    input.focus();
  }
  function closeLauncher() {
    if (!launcher) return;
    launcher.remove(); launcher = null;
    startBtn.setAttribute('aria-expanded', 'false');
  }
  startBtn.addEventListener('click', () => launcher ? closeLauncher() : openLauncher());
  document.addEventListener('pointerdown', (e) => {
    if (launcher && !e.target.closest('.launcher') && !e.target.closest('.tk-start')) closeLauncher();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); launcher ? closeLauncher() : openLauncher(); }
    else if (e.key === 'Escape' && launcher) { closeLauncher(); startBtn.focus(); }
  });

  /* ---------- App behaviour ---------- */
  const inited = new Set();
  const starters = {}, stoppers = {};
  const stopApp = (id) => { if (stoppers[id]) stoppers[id](); };

  function initApp(id, w) {
    if (id === 'resume' && !inViewer && !phone.matches && finePointer.matches && !$('iframe', w.content)) {
      const f = el('iframe');
      f.src = `${RESUME}#view=FitH`;
      f.title = 'Resume of Jodhdeep Singh';
      $('.pdf-frame', w.content).appendChild(f);
    }
    if (!inited.has(id)) { inited.add(id); if (INIT[id]) INIT[id](w); }
    if (starters[id]) starters[id](w);
  }

  const INIT = {
    journey(w) {
      $$('[data-jump]', w.content).forEach((b) => b.addEventListener('click', () => jumpTo(w, b.dataset.jump)));
    },

    contact(w) {
      const f = $('form', w.content);
      if (inViewer) $('.mail-send', f).textContent = 'Copy message';
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!inViewer) {
          location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(f.subject.value)}&body=${encodeURIComponent(f.body.value)}`;
          return;
        }
        try {
          await navigator.clipboard.writeText(`To: ${EMAIL}\nSubject: ${f.subject.value}\n\n${f.body.value}`);
          showToast('Message copied. Paste it into your email app.');
        } catch { showToast(`Email me at ${EMAIL}`); }
      });
    }
  };

  /* ---------- Global clicks ---------- */
  async function copyEmail() {
    try { await navigator.clipboard.writeText(EMAIL); showToast('Email copied'); }
    catch { showToast(EMAIL); }
  }
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) { e.preventDefault(); openApp(opener.dataset.open, { opener }); return; }
    if (e.target.closest('[data-home]')) { closeAll(); return; }
    if (e.target.closest('[data-action="copy-email"]')) copyEmail();
  });

  /* Résumé download inside the claude.ai viewer. On a normal host the plain <a download> is used. */
  if (inViewer) {
    window.claude.use('downloads').then((downloads) => {
      if (!downloads) return;
      document.addEventListener('click', async (e) => {
        const a = e.target.closest('a[download]');
        if (!a) return;
        e.preventDefault();
        try {
          const blob = await (await fetch(a.getAttribute('href'))).blob();
          await downloads.save({ filename: 'Jodhdeep_Singh_Resume.pdf', data: blob });
        } catch (err) {
          if (err && err.code === 'declined') return;
          showToast(err && err.code === 'rate_limited' ? 'One moment, then try again' : 'Download unavailable here');
        }
      });
    }).catch(() => {});
  }

  /* ---------- Quote that responds to the cursor ---------- */
  const headline = $('.headline', desk);
  const flexChars = [];
  (function splitHeadline() {
    headline.setAttribute('aria-label', headline.textContent);
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = el('span', 'word');
            word.setAttribute('aria-hidden', 'true');
            for (const c of part) {
              const ch = el('span', 'ch');
              ch.textContent = c;
              word.appendChild(ch);
              flexChars.push({ el: ch, x: 0, y: 0, rw: 0, w: 560, d: 100, ty: 0, tw: 560, td: 100, tt: 0 });
            }
            frag.appendChild(word);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(headline);
  })();

  function measureChars() {
    flexChars.forEach((c) => { c.el.style.fontVariationSettings = ''; c.el.style.transform = ''; c.el.style.width = ''; });
    flexChars.forEach((c) => {
      const r = c.el.getBoundingClientRect();
      c.x = r.left + r.width / 2; c.y = r.top + r.height / 2; c.rw = r.width;
      c.w = c.tw = 560; c.d = c.td = 100; c.ty = c.tt = 0;
    });
    // Freeze each letter's box so the changing weight can't re-wrap the lines
    flexChars.forEach((c) => { c.el.style.width = `${c.rw}px`; });
  }
  const pointer = { x: -9999, y: -9999 };
  let flexRaf = 0;
  const RADIUS = 200;
  function flexTick() {
    let moving = false;
    for (const c of flexChars) {
      const k = Math.max(0, 1 - Math.hypot(pointer.x - c.x, pointer.y - c.y) / RADIUS);
      const e = k * k * (3 - 2 * k);
      c.tw = 560 + e * 240; c.td = 100 - e * 22; c.tt = -e * 6;
      c.w += (c.tw - c.w) * 0.18; c.d += (c.td - c.d) * 0.18; c.ty += (c.tt - c.ty) * 0.18;
      if (Math.abs(c.tw - c.w) > 0.5 || Math.abs(c.ty - c.tt) > 0.05) moving = true;
      c.el.style.fontVariationSettings = `"wght" ${c.w.toFixed(0)}, "wdth" ${c.d.toFixed(1)}`;
      c.el.style.transform = c.ty ? `translateY(${c.ty.toFixed(2)}px)` : '';
    }
    flexRaf = moving ? requestAnimationFrame(flexTick) : 0;
  }
  addEventListener('pointermove', (e) => {
    if (!finePointer.matches || !motionOK() || document.body.classList.contains('dragging')) return;
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (!flexRaf) flexRaf = requestAnimationFrame(flexTick);
  }, { passive: true });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(measureChars);

  /* ---------- Resize and start ---------- */
  addEventListener('resize', debounce(() => {
    measureChars();
    const { W, H } = deskSize();
    wins.forEach((w) => {
      if (w.max) { w.w = W; w.h = H; }
      else {
        w.w = clamp(w.w, 300, W); w.h = clamp(w.h, 220, H);
        if (w.x + w.w > W) w.x = Math.max(0, W - w.w);
        w.y = clamp(w.y, 0, H - 40);
      }
      applyGeo(w);
    });
  }, 140));
  addEventListener('hashchange', () => { const id = idFromHash(location.hash); if (id) openApp(id); });

  applyTheme(root.getAttribute('data-theme') || 'light');
  const wanted = idFromHash(location.hash);
  if (wanted && (phone.matches || wanted !== 'about')) openApp(wanted, { opener: document.body, instant: true });
  else if (!phone.matches) {
    // First window sits bottom left beside the icons, clear of the quote
    const { H } = deskSize();
    openApp('about', { opener: document.body, instant: true, at: { x: 136, y: H - APPS.about.h - 24 } });
  } else syncChrome(null);
})();
