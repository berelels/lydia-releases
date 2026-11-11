/* =============================================
   LYDIA · site · app.js
   The opening (a greeting written by hand that becomes the notch), each
   screen's own hello, the pages deck, the packages and the languages.
   ============================================= */
(() => {
  // the version shipped: every link and command below follows it (update it with each release)
  const VERSION = '1.6.0';
  const REL = 'https://github.com/berelels/lydia-releases/releases/latest/download/';
  const PKGS = {
    deb: { file: `lydia_${VERSION}_amd64.deb`, cmd: (f) => `sudo apt install ./${f}` },
    rpm: { file: `lydia-${VERSION}.x86_64.rpm`, cmd: (f) => `sudo dnf install ./${f}` },
    appimage: { file: `Lydia-${VERSION}.AppImage`, cmd: (f) => `chmod +x ${f} && ./${f}` },
  };
  const G = window.LYDIA_GREETINGS ?? {};
  const write = window.lydiaHello?.write;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- packages ----------
  $$('[data-version]').forEach((el) => (el.textContent = VERSION));
  for (const [kind, p] of Object.entries(PKGS)) {
    $$(`[data-pkg="${kind}"]`).forEach((a) => (a.href = REL + p.file));
    $$(`[data-cmd="${kind}"]`).forEach((c) => (c.textContent = p.cmd(p.file)));
  }
  $$('[data-copy]').forEach((b) =>
    b.addEventListener('click', async () => {
      const p = PKGS[b.dataset.copy];
      try {
        await navigator.clipboard.writeText(p.cmd(p.file));
        b.classList.add('is-done');
        b.textContent = t('inst.copied');
        setTimeout(() => (b.classList.remove('is-done'), (b.textContent = t('inst.copy'))), 1600);
      } catch {}
    }),
  );

  // ---------- languages ----------
  const I18N = window.LYDIA_I18N ?? {};
  const base = {}; // the page as written (English), to come back to
  $$('[data-i18n]').forEach((el) => (base[el.dataset.i18n] = el.innerHTML));
  $$('[data-i18n-attr]').forEach((el) => el.dataset.i18nAttr.split(',').forEach((pair) => { const [attr, key] = pair.split(':'); base[key] = el.getAttribute(attr) ?? ''; }));
  let lang = 'en';
  const t = (key) => I18N[lang]?.[key] ?? I18N.en?.[key] ?? base[key] ?? key;
  function setLang(l) {
    lang = I18N[l] || l === 'en' ? l : 'en';
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    $$('[data-i18n]').forEach((el) => (el.innerHTML = t(el.dataset.i18n)));
    $$('[data-i18n-attr]').forEach((el) => el.dataset.i18nAttr.split(',').forEach((pair) => { const [attr, key] = pair.split(':'); el.setAttribute(attr, t(key)); }));
    $$('.lang button').forEach((b) => b.classList.toggle('is-on', b.dataset.lang === lang));
    if (I18N[lang]?.title) document.title = I18N[lang].title;
    try { localStorage.setItem('lydia-lang', lang); } catch {}
  }
  let saved = null;
  try { saved = localStorage.getItem('lydia-lang'); } catch {}
  setLang(saved || (navigator.language || 'en').slice(0, 2));
  $$('.lang button').forEach((b) => b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    // her greetings follow the language too
    $$('[data-hello-self]').forEach((svg) => svg.dataset.done && hello(svg, lang, { ink: '#ffffff', still: true }));
  }));

  // ---------- her handwriting ----------
  /** Writes the greeting of `l` into the svg; resolves when it is written. */
  function hello(svg, l, opts = {}) {
    const g = G[l] ?? G.en;
    if (!write || !g) return Promise.resolve();
    const { duration } = write(svg, g, calm ? { ...opts, still: true } : opts);
    svg.dataset.done = '1';
    return new Promise((r) => setTimeout(r, duration));
  }
  const inkOf = (section) => (getComputedStyle(section).color === 'rgb(255, 255, 255)' ? '#ffffff' : '#0b0b0d');

  // each screen's own hello, written as it comes into view (once)
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      seen.unobserve(e.target);
      const svg = e.target;
      if (svg.matches('[data-hello]')) hello(svg, svg.dataset.hello, { ink: inkOf(svg.closest('.screen')), speed: 0.1 });
      else if (svg.matches('[data-hello-self]')) hello(svg, lang, { ink: '#ffffff', speed: 0.1 });
      else if (svg.matches('.opening__word')) hello(svg, lang, { ink: 'rainbow', speed: 0.14 });
    }
  }, { threshold: 0.4 });
  $$('[data-hello], [data-hello-self], .opening__word').forEach((svg) => seen.observe(svg));
  $('[data-replay]')?.addEventListener('click', () => hello($('.opening__word'), lang, { ink: 'rainbow', speed: 0.14 }));

  // ---------- the opening: black, the hello by hand, then into the notch ----------
  async function opening() {
    const intro = $('.intro');
    const svg = $('.intro__word');
    let once = false;
    try { once = sessionStorage.getItem('lydia-hello') === '1'; } catch {}
    if (calm || once || !write) return intro.remove();
    try { sessionStorage.setItem('lydia-hello', '1'); } catch {}
    document.body.classList.add('is-intro');
    await new Promise((r) => setTimeout(r, 450));
    await hello(svg, lang, { ink: '#ffffff', speed: 0.12 });
    await new Promise((r) => setTimeout(r, 500));
    // the word shrinks up into her island, hanging at the top
    const s = svg.getBoundingClientRect();
    const scale = Math.min(34 / s.height, 0.3);
    svg.animate([{ transform: 'none' }, { transform: `translate(${innerWidth / 2 - (s.left + s.width / 2)}px, ${26 - (s.top + s.height / 2)}px) scale(${scale})`, opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    await new Promise((r) => setTimeout(r, 520));
    document.body.classList.remove('is-intro');
    intro.classList.add('is-gone');
    setTimeout(() => intro.remove(), 1200);
  }
  opening();

  // ---------- entrances ----------
  const rise = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), rise.unobserve(e.target))), { threshold: 0.15 });
  $$('.shot, .deck, .desk, .pkgs, .facts').forEach((el) => (el.classList.add('rise'), rise.observe(el)));

  // ---------- the pages deck ----------
  const deck = $('[data-deck]');
  if (deck) {
    const shots = $$('.deck__shot', deck);
    const tabs = $$('.deck__tabs button', deck);
    let i = 0;
    let timer = 0;
    const show = (k) => {
      i = (k + shots.length) % shots.length;
      shots.forEach((s, j) => s.classList.toggle('is-on', j === i));
      tabs.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
    };
    const play = () => (clearInterval(timer), calm || (timer = setInterval(() => show(i + 1), 4200)));
    tabs.forEach((b, j) => b.addEventListener('click', () => (show(j), play())));
    new IntersectionObserver(([e]) => (e.isIntersecting ? play() : clearInterval(timer)), { threshold: 0.3 }).observe(deck);
  }

  // ---------- the notch comes down once the first screen's island has scrolled away ----------
  const atTop = () => document.body.classList.toggle('at-top', scrollY < innerHeight * 0.45);
  addEventListener('scroll', atTop, { passive: true });
  atTop();

  // ---------- where you are, in the notch ----------
  const links = $$('.notch__links a');
  const here = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === `#${e.target.id}`));
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => here.observe(s));
})();
