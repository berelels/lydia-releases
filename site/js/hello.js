/**
 * The hello, written by hand: the word (greetings.json, made by
 * build/hello-paths.mjs from Macintosh Skeletal) appears under a pen that
 * follows the middle of each stroke, in the order it is written: a mask, a
 * line as wide as the strokes drawn along it.
 *
 * Used by the opening window and by the notch's hello (a <script>, no modules).
 */
(function (root) {
  const NS = 'http://www.w3.org/2000/svg';
  const INKS = {
    white: [['#ffffff', 0]],
    mint: [['#9ff5d0', 0], ['#5fe0b7', 1]],
    // the colors of the hello screens, left to right
    rainbow: [['#5ac8fa', 0], ['#34c759', 0.22], ['#ffd60a', 0.45], ['#ff9f0a', 0.62], ['#ff375f', 0.8], ['#bf5af2', 1]],
  };
  let uid = 0;

  const el = (name, attrs = {}, parent) => {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    parent?.append(e);
    return e;
  };

  /**
   * Writes greeting ({ fill: [d], pen: [d], penWidth }, font units, y up) into the <svg>,
   * sized to fit it. opts: ink ('white' | 'mint' | 'rainbow'), speed (ms per font unit
   * the pen travels), delay (ms), still (drawn at once). Returns { duration } (ms until written).
   */
  function write(svg, greeting, { ink = 'white', speed = 0.16, delay = 0, still = false } = {}) {
    svg.replaceChildren();
    const id = `lh${++uid}`;
    const defs = el('defs', {}, svg);
    const body = el('g', {}, svg);
    const letters = el('g', { transform: 'scale(1 -1)' }, body);
    for (const d of greeting.fill) for (const part of d.split(/(?=M)/)) part.trim() && el('path', { d: part }, letters);
    // the drawing's own box: the view fits it, with room for the pen's round ends
    const box = letters.getBBox();
    const pad = greeting.penWidth * 0.3;
    const vb = { x: box.x - pad, y: -box.y - box.height - pad, w: box.width + pad * 2, h: box.height + pad * 2 };
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const stops = INKS[ink] ?? (/^#[0-9a-f]{6}$/i.test(ink) ? [[ink, 0]] : INKS.white); // a named ink, or one colour
    const grad = el('linearGradient', { id: `${id}-ink`, gradientUnits: 'userSpaceOnUse', x1: vb.x, x2: vb.x + vb.w, y1: 0, y2: 0 }, defs);
    for (const [color, at] of stops) el('stop', { offset: at, 'stop-color': color }, grad);
    letters.setAttribute('fill', `url(#${id}-ink)`);
    if (still) return { duration: 0 };

    // each stroke shows only under its own pen: one mask per stroke, its line drawn along it. A single mask
    // over the whole word let the wide pen uncover a neighbour stroke ahead of time (a sharp sliver, a "knife")
    const parts = [...letters.children];
    const paired = parts.length === greeting.pen.length;
    const masks = [];
    const nibAttrs = { fill: 'none', stroke: '#fff', 'stroke-width': greeting.penWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    const maskFor = (target, k) => {
      const m = el('mask', { id: `${id}-pen${k}`, maskUnits: 'userSpaceOnUse', x: -1e5, y: -1e5, width: 2e5, height: 2e5 }, defs);
      target.setAttribute('mask', `url(#${id}-pen${k})`);
      masks.push(target);
      return m;
    };
    // without the pairing (an older greetings file): one mask over the word, as before
    const shared = paired ? null : el('g', nibAttrs, maskFor(letters, 'all'));
    // one hand, at one speed: each stroke right after the last, the pen never slowing at the joins
    let t = delay;
    greeting.pen.forEach((d, k) => {
      const p = el('path', { d, ...(paired ? nibAttrs : {}) }, paired ? maskFor(parts[k], k) : shared);
      const len = p.getTotalLength();
      if (!len) return;
      const dur = Math.max(16, len * speed);
      // a hair longer than the line: a dash pattern that has just ended can leave a speck at its start
      p.style.strokeDasharray = `${len + 1} ${len + 2}`;
      p.style.strokeDashoffset = len + 1;
      p.animate([{ strokeDashoffset: len + 1 }, { strokeDashoffset: 0 }], { duration: dur, delay: t, fill: 'forwards', easing: 'linear' });
      t += dur;
    });
    // written: the mask goes
    const duration = t + 120;
    setTimeout(() => masks.forEach((m) => m.removeAttribute('mask')), duration + 60);
    return { duration };
  }

  const api = { write, INKS };
  root.lydiaHello = api;
})(this);
