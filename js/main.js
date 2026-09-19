/* =========================================================
   Bastin Prasad — Portfolio interactions
   No dependencies. One requestAnimationFrame loop drives all
   scroll-linked motion. Everything degrades gracefully without
   JS and respects prefers-reduced-motion.
   ========================================================= */

/* ✏️ CONTACT FORM CONFIGURATION
   provider:
     'mailto'    → opens the visitor's email app with the message pre-filled (works with no setup)
     'formspree' → set endpoint to your Formspree URL, e.g. 'https://formspree.io/f/xxxxxxx'
     'web3forms' → set endpoint to 'https://api.web3forms.com/submit' and accessKey to your key
     'custom'    → set endpoint to your own API; it receives JSON {name, email, subject, message}
*/
const CONTACT_CONFIG = {
  provider: 'formspree',
  endpoint: 'https://formspree.io/f/xyezzywd',
  accessKey: '',
  toEmail: 'bastinprasad300@gmail.com'
};

/* ✏️ Set to false once you've filled in the placeholder project cards */
const SHOW_PLACEHOLDER_HINTS = false;

(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = !reduceMotion;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  doc.classList.toggle('motion', motion);

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  if (!SHOW_PLACEHOLDER_HINTS) document.body.classList.add('hide-hints');

  /* ---------- Page load ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => doc.classList.add('is-loaded')));

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  /* ---------- Theme ---------- */
  const themeBtn = $('.theme-toggle');
  function syncThemeLabel() {
    const dark = doc.getAttribute('data-theme') !== 'light';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#0F1520' : '#F2F4F7');
  }
  syncThemeLabel();
  themeBtn.addEventListener('click', () => {
    const next = doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    doc.setAttribute('data-theme', next);
    try { localStorage.setItem('bp-theme', next); } catch (e) {}
    syncThemeLabel();
  });

  /* ---------- Mobile menu ---------- */
  const nav = $('.nav');
  const menuBtn = $('.menu-toggle');
  const links = $('#nav-links');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    nav.classList.remove('is-hidden');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

  /* ---------- Text splitting helpers ---------- */
  function splitWords(el, cls) {
    const words = el.textContent.replace(/\s+/g, ' ').trim().split(' ');
    el.textContent = '';
    const out = [];
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = cls;
      if (cls === 'split-w') {
        const inner = document.createElement('span');
        inner.textContent = w;
        inner.style.setProperty('--i', i);
        span.appendChild(inner);
      } else {
        span.textContent = w;
      }
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      out.push(span);
    });
    return out;
  }

  /* ---------- Reveal system: .reveal, .split headings, .stagger groups ---------- */
  if (motion) {
    $$('.h2').forEach(h => { h.classList.add('split'); splitWords(h, 'split-w'); });
    $$('.stagger').forEach(group => [...group.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 8))));
  }
  const revealTargets = $$('.reveal, .split, .stagger');
  if (!motion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(el => el.classList.add('is-in', 'stagger-done'));
  } else {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-in');
        ro.unobserve(el);
        if (el.classList.contains('stagger')) {
          setTimeout(() => el.classList.add('stagger-done'), 900 + el.children.length * 70);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(el => ro.observe(el));
  }

  /* ---------- Scroll-scrubbed About text ---------- */
  const scrubEl = $('.scrub');
  const scrubWords = motion && scrubEl ? $$('p', scrubEl).flatMap(p => splitWords(p, 'sw')) : [];
  let scrubN = 0;

  /* ---------- Architecture diagram sequence ---------- */
  const arch = $('.arch');
  const archNodes = arch ? $$('.arch-node', arch) : [];
  const archWires = arch ? $$('.arch-wire', arch) : [];
  let archLit = -1;
  if (motion && arch) arch.classList.add('seq');

  /* ---------- Timeline ---------- */
  const timeline = $('.timeline');
  const tlDots = $$('.tl-dot');

  /* ---------- Philosophy pinned sequence ---------- */
  const phil = $('.philosophy');
  const philTrack = $('.phil-track');
  const philItems = $$('.phil-list li');
  let philIdx = -1;
  if (motion && phil) {
    phil.classList.add('is-pinned');
    philItems.forEach((li, i) => {
      const h = $('h3', li);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phil-verb';
      btn.textContent = h.textContent;
      h.textContent = '';
      h.appendChild(btn);
      btn.addEventListener('click', () => {
        const r = philTrack.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        window.scrollTo({ top: window.scrollY + r.top + total * ((i + 0.5) / philItems.length), behavior: 'smooth' });
      });
    });
  }

  /* ---------- Hero ---------- */
  const hero = $('.hero');
  const heroCopy = $('.hero-copy');
  const stage = $('.flow-stage');
  const st = { py: 0, rx: 0, ry: 0, trx: 0, try: 0 };
  if (motion && finePointer) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const nx = e.clientX / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      st.trx = -ny * 10;
      st.try = nx * 14;
    });
    hero.addEventListener('pointerleave', () => { st.trx = 0; st.try = 0; });
  }

  // Role text decode
  const role = $('.hero-role');
  function scramble(el, text, dur = 900) {
    const chars = '<>/{}[]=+*#01_';
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      const n = Math.floor(t * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        out += (i < n || text[i] === ' ') ? text[i] : chars[(Math.random() * chars.length) | 0];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (motion && role) {
    const roleText = role.textContent;
    setTimeout(() => scramble(role, roleText), 450);
    let lastScramble = 0;
    role.addEventListener('pointerenter', () => {
      if (performance.now() - lastScramble > 1500) { lastScramble = performance.now(); scramble(role, roleText, 600); }
    });
  }

  /* ---------- Trace log + node highlight ---------- */
  const flowSvg = $('.flow');
  if (!motion) $$('.flow, .int-svg').forEach(svg => svg.pauseAnimations && svg.pauseAnimations());

  // Integrations orbit: hovering a manufacturer highlights its connection to the LIS
  const intLines = $$('.int-line');
  $$('.int-vendors li').forEach(li => {
    const line = intLines[+li.dataset.i];
    li.addEventListener('pointerenter', () => { line && line.classList.add('is-hot'); });
    li.addEventListener('pointerleave', () => { line && line.classList.remove('is-hot'); });
  });
  const traceList = $('.trace-lines');
  const nodes = $$('.fn');
  // Illustrative log lines (not real data): mix of web, database and healthcare traffic
  const traces = [
    '<b>build</b> dotnet build succeeded',
    '<b>POST</b> /api/orders <i>201</i>',
    '<b>EXEC</b> usp_GetWorklist @Section=\'HEM\'',
    '<b>GET</b> /api/results/pending <i>200</i>',
    '<b>ASTM</b> H|\\^&|||Analyzer frame ok',
    '<b>HL7</b> MSH|^~\\&|RIS|HOSP| ORM^O01',
    '<b>hub</b> results.updated → clients',
    '<b>tcp</b> 10.0.0.x:5000 connected',
    '<b>auth</b> JWT validated <i>200</i>',
    '<b>ui</b> worklist rendered'
  ];
  let ti = 0;
  function pushTrace() {
    const li = document.createElement('li');
    li.innerHTML = traces[ti % traces.length];
    traceList.appendChild(li);
    while (traceList.children.length > 4) traceList.removeChild(traceList.firstChild);
    nodes.forEach((n, i) => n.classList.toggle('is-lit', i === ti % nodes.length));
    ti++;
  }
  for (let i = 0; i < 4; i++) pushTrace();
  let traceTimer = null;
  function startTrace() { if (!traceTimer && motion) traceTimer = setInterval(pushTrace, 1400); }
  function stopTrace() { clearInterval(traceTimer); traceTimer = null; }
  if (motion) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? startTrace() : stopTrace())).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? stopTrace() : startTrace()));
  }

  /* ---------- Marquee ---------- */
  const marquee = $('.marquee');
  const mqRows = $$('.mq-row').map(row => ({
    row, track: $('.mq-track', row), x: 0, w: 0,
    speed: parseFloat(row.dataset.speed || '0.6'), dir: parseFloat(row.dataset.dir || '1')
  }));
  let mqVisible = false;
  function measureMarquee() {
    mqRows.forEach(r => {
      $$('.mq-clone', r.row).forEach(c => c.remove());
      r.w = r.track.getBoundingClientRect().width;
      if (!r.w) return;
      const copies = Math.ceil((window.innerWidth * 1.2) / r.w) + 1;
      for (let i = 0; i < copies; i++) {
        const c = r.track.cloneNode(true);
        c.classList.add('mq-clone');
        r.row.appendChild(c);
      }
    });
  }
  if (motion && marquee) {
    measureMarquee();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureMarquee);
    new IntersectionObserver(([e]) => { mqVisible = e.isIntersecting; }).observe(marquee);
  }

  /* ---------- Cursor follower + background spotlight ---------- */
  const cursor = $('.cursor');
  const spot = $('.bg-spot');
  const cur = { x: -100, y: -100, tx: -100, ty: -100, on: false };
  if (motion && finePointer) {
    window.addEventListener('pointermove', e => {
      cur.tx = e.clientX; cur.ty = e.clientY;
      if (!cur.on) { cur.x = cur.tx; cur.y = cur.ty; cur.on = true; cursor.classList.add('is-on'); }
      spot.style.setProperty('--mx', e.clientX + 'px');
      spot.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
    document.addEventListener('pointerover', e => {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, input, textarea, summary, label'));
    });
    document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    doc.addEventListener('pointerleave', () => { cursor.classList.remove('is-on'); cur.on = false; });
  }

  /* ---------- Magnetic buttons ---------- */
  if (motion && finePointer) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = '0px 0px'; });
    });
  }

  /* ---------- 3D tilt + glow on cards ---------- */
  if (motion && finePointer) {
    $$('.card, .cert, .ai-tool').forEach(el => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.setProperty('--rx', (-ny * 7).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (nx * 9).toFixed(2) + 'deg');
        el.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--cy', (e.clientY - r.top) + 'px');
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Section spy: nav + rail ---------- */
  const navLinks = $$('.nav-links a');
  const railLinks = $$('.rail a');
  const spyIds = railLinks.map(a => a.getAttribute('href').slice(1));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(a => {
        const on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      railLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  spyIds.map(id => document.getElementById(id)).filter(Boolean).forEach(s => spy.observe(s));

  /* ---------- Scroll-linked updates ---------- */
  const bar = $('.scroll-progress span');
  const toTop = $('.to-top');
  const bgGrid = $('.bg-grid');
  let vh = window.innerHeight;
  let navLastY = window.scrollY;

  function onScroll(y) {
    const max = doc.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-scrolled', y > 20);
    if (!links.classList.contains('is-open')) {
      if (y > 500 && y > navLastY + 4) nav.classList.add('is-hidden');
      else if (y < navLastY - 4 || y <= 500) nav.classList.remove('is-hidden');
    }
    navLastY = y;
    toTop.classList.toggle('is-visible', y > 900);
    if (!motion) return;

    // Background grid drifts slower than content
    bgGrid.style.transform = `translate3d(0, ${-(y * 0.06) % 64}px, 0)`;

    // Hero parallax
    if (y < vh * 1.4) {
      const p = y / vh;
      heroCopy.style.transform = `translate3d(0, ${(y * 0.06).toFixed(1)}px, 0)`;
      st.py = -y * 0.08;
    }

    // About reading text
    if (scrubWords.length) {
      const r = scrubEl.getBoundingClientRect();
      const start = vh * 0.85, end = vh * 0.4;
      const p = clamp((start - r.top) / (r.height + start - end));
      const n = Math.round(p * scrubWords.length);
      if (n !== scrubN) {
        const lo = Math.min(n, scrubN), hi = Math.max(n, scrubN);
        for (let i = lo; i < hi; i++) scrubWords[i].classList.toggle('on', i < n);
        scrubN = n;
      }
    }

    // Architecture diagram powers on node by node
    if (arch && arch.offsetParent) {
      const r = arch.getBoundingClientRect();
      const p = clamp((vh * 0.88 - r.top) / (vh * 0.5));
      const lit = Math.round(p * archNodes.length);
      if (lit !== archLit) {
        archNodes.forEach((n, i) => { n.classList.toggle('is-lit', i < lit); n.classList.toggle('is-current', i === lit - 1); });
        archWires.forEach((w, i) => w.classList.toggle('is-on', i < lit - 1));
        archLit = lit;
      }
    }

    // Timeline fill
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const line = vh * 0.6;
      timeline.style.setProperty('--fill', clamp((line - r.top) / r.height).toFixed(3));
      tlDots.forEach(d => d.classList.toggle('is-passed', d.getBoundingClientRect().top < line));
    }

    // Philosophy sequence
    if (philTrack && phil.classList.contains('is-pinned')) {
      const r = philTrack.getBoundingClientRect();
      const total = r.height - vh;
      const p = clamp(-r.top / total);
      phil.style.setProperty('--pp', p.toFixed(3));
      const idx = Math.min(philItems.length - 1, Math.floor(p * philItems.length));
      if (idx !== philIdx) {
        philItems.forEach((li, i) => li.classList.toggle('is-active', i === idx));
        philIdx = idx;
      }
    }
  }

  /* ---------- Main loop ---------- */
  let lastY = window.scrollY, vel = 0, scrollDir = 1, handledY = null;
  function tick() {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    vel = lerp(vel, dy, 0.12);
    if (dy > 0.5) scrollDir = 1; else if (dy < -0.5) scrollDir = -1;

    if (y !== handledY) { handledY = y; onScroll(y); }

    if (motion) {
      // Hero stage: parallax + pointer tilt
      if (y < vh * 1.4 && stage) {
        st.rx = lerp(st.rx, st.trx, 0.08);
        st.ry = lerp(st.ry, st.try, 0.08);
        stage.style.transform = `translate3d(0, ${st.py.toFixed(1)}px, 0) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg)`;
      }
      // Marquee: speed and direction follow the scroll
      if (mqVisible) {
        const boost = Math.min(Math.abs(vel) * 0.4, 16);
        const skew = clamp(vel * -0.3, -8, 8);
        mqRows.forEach(r => {
          if (!r.w) return;
          r.x -= (r.speed + boost) * r.dir * scrollDir;
          if (r.x <= -r.w) r.x += r.w;
          if (r.x > 0) r.x -= r.w;
          r.row.style.transform = `translate3d(${r.x.toFixed(1)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
        });
      }
      // Cursor follower
      if (cur.on) {
        cur.x = lerp(cur.x, cur.tx, 0.22);
        cur.y = lerp(cur.y, cur.ty, 0.22);
        cursor.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0)`;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener('resize', () => {
    vh = window.innerHeight;
    handledY = null;
    if (motion && marquee) measureMarquee();
  });

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' });
    $('.brand').focus({ preventScroll: true });
  });

  /* ---------- Counters ---------- */
  $$('.counter').forEach(el => {
    if (!motion) return;
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const co = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      co.disconnect();
      const start = performance.now(), dur = 1100;
      const step = now => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = prefix + (target >= 10 ? Math.round(target * eased) : (target * eased).toFixed(t < 1 ? 1 : 0)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    co.observe(el);
  });

  /* ---------- Skills detail panel ---------- */
  const panel = $('.skill-detail');
  const sdGroup = $('.sd-group', panel), sdName = $('.sd-name', panel), sdNote = $('.sd-note', panel);
  let activeChip = null;
  function showSkill(chip) {
    if (chip === activeChip) return;
    if (activeChip) activeChip.classList.remove('is-active');
    activeChip = chip;
    chip.classList.add('is-active');
    sdGroup.textContent = chip.closest('.skill-group').querySelector('h3').textContent;
    sdName.textContent = chip.textContent;
    sdNote.textContent = chip.dataset.note || '';
    panel.classList.remove('is-updating'); void panel.offsetWidth; panel.classList.add('is-updating');
  }
  $$('.chip').forEach(chip => {
    chip.setAttribute('type', 'button');
    chip.addEventListener('mouseenter', () => showSkill(chip));
    chip.addEventListener('focus', () => showSkill(chip));
    chip.addEventListener('click', () => showSkill(chip));
  });

  /* ---------- Project filtering ---------- */
  const filterBtns = $$('.filter');
  const projects = $$('#projects .project');
  const gridCards = $$('.project-grid .project');
  const empty = $('.empty-state');
  const filterStatus = $('.filter-status');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterBtns.forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    let shown = 0, order = 0;
    projects.forEach(p => {
      const match = f === 'all' || p.dataset.cats.split(' ').includes(f);
      p.classList.toggle('is-hidden', !match);
      if (match) {
        shown++;
        if (motion) {
          p.style.animationDelay = `${Math.min(order++, 8) * 50}ms`;
          p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering');
        }
      }
    });
    empty.hidden = gridCards.some(p => !p.classList.contains('is-hidden'));
    filterStatus.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}${f === 'all' ? '' : ' in ' + btn.textContent}.`;
    handledY = null; // re-evaluate scroll-linked pieces (layout changed)
  }));

  /* ---------- Copy email ---------- */
  $$('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
    }
    btn.textContent = 'Copied';
    btn.classList.add('is-done');
    toast('Email address copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 2000);
  }));

  /* ---------- Resume link: tell the visitor if the file isn't there yet ---------- */
  $$('.resume-link').forEach(link => link.addEventListener('click', async e => {
    if (location.protocol === 'file:') return;
    e.preventDefault();
    try {
      const res = await fetch(link.getAttribute('href'), { method: 'HEAD' });
      if (!res.ok) { toast('Resume is not available yet. Please email me for a copy.'); return; }
    } catch (_) { /* network issue: try the download anyway */ }
    const a = document.createElement('a');
    a.href = link.getAttribute('href'); a.download = '';
    document.body.appendChild(a); a.click(); a.remove();
  }));

  /* ---------- Contact form ---------- */
  const form = $('.contact-form');
  const statusEl = $('.form-status', form);
  const submitBtn = $('button[type="submit"]', form);
  const rules = {
    name: v => v.trim().length >= 2 || 'Enter your name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address, like name@example.com.',
    subject: v => v.trim().length >= 3 || 'Add a short subject.',
    message: v => v.trim().length >= 10 || 'Write a message of at least 10 characters.'
  };
  function validateField(input) {
    const res = rules[input.name](input.value);
    const field = input.closest('.field');
    const err = $('.field-error', field);
    const ok = res === true;
    field.classList.toggle('has-error', !ok);
    err.textContent = ok ? '' : res;
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
    return ok;
  }
  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    input.addEventListener('blur', () => { if (input.value) validateField(input); });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) validateField(input); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    statusEl.className = 'form-status';
    const inputs = Object.keys(rules).map(n => form.elements[n]);
    const valid = inputs.map(validateField);
    if (valid.includes(false)) {
      inputs[valid.indexOf(false)].focus();
      statusEl.textContent = 'Check the highlighted fields and try again.';
      statusEl.classList.add('is-err');
      return;
    }
    if (form.elements._gotcha.value) return; // bot

    const data = Object.fromEntries(inputs.map(i => [i.name, i.value.trim()]));

    if (CONTACT_CONFIG.provider === 'mailto' || !CONTACT_CONFIG.endpoint) {
      const body = `${data.message}\n\n${data.name}\n${data.email}`;
      window.location.href = `mailto:${CONTACT_CONFIG.toEmail}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      statusEl.textContent = 'Your email app should open with the message ready to send.';
      statusEl.classList.add('is-ok');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const payload = CONTACT_CONFIG.provider === 'web3forms'
        ? { access_key: CONTACT_CONFIG.accessKey, ...data, from_name: data.name }
        : CONTACT_CONFIG.provider === 'formspree'
          ? { ...data, _subject: `Portfolio: ${data.subject}`, _replyto: data.email }
          : data;
      const res = await fetch(CONTACT_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      statusEl.textContent = 'Message sent. I\'ll reply to your email soon.';
      statusEl.classList.add('is-ok');
    } catch (err) {
      statusEl.textContent = `Message not sent. Email me directly at ${CONTACT_CONFIG.toEmail}.`;
      statusEl.classList.add('is-err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
})();
