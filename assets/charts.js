/* ===========================================================================
   Chart primitives. Inline SVG, one measure per axis, flat marks, rounded
   ends, direct labels on everything, and a tooltip on hover. No gridlines
   beyond a faint tone step, no legends where a direct label will do.
   =========================================================================== */

const NS = 'http://www.w3.org/2000/svg';
const SER = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)'];
const FONT = 'var(--sans)';

function el(n, a = {}, kids = []) {
  const e = document.createElementNS(NS, n);
  for (const k in a) if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]);
  (Array.isArray(kids) ? kids : [kids]).forEach(c => c && e.appendChild(c));
  return e;
}
function txt(s, a = {}) { const t = el('text', a); t.textContent = s; return t; }
const fmt = (v, d = 0) => v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

/* --- shared tooltip ------------------------------------------------------ */
let TIP;
function showTip(html, x, y) {
  if (!TIP) { TIP = document.createElement('div'); TIP.className = 'vtip'; document.getElementById('stage').appendChild(TIP); }
  TIP.innerHTML = html;
  TIP.style.opacity = '1';
  TIP.style.left = Math.max(10, Math.min(1280 - 250, x + 16)) + 'px';
  TIP.style.top = Math.max(10, y - 10) + 'px';
}
function hideTip() { if (TIP) TIP.style.opacity = '0'; }

const AXIS = { 'font-family': FONT, 'font-size': 13, fill: 'var(--alu-dark)', 'font-weight': 400 };
const VAL  = { 'font-family': FONT, 'font-size': 15, 'font-weight': 700 };

/* --- 1. columns, one series, always directly labelled -------------------- */
function columns(host, o) {
  const w = o.w || 520, h = o.h || 260, m = o.m || { t: 34, r: 6, b: 38, l: 6 };
  const max = o.yMax ?? Math.max(...o.cats.map(c => c.value)) * 1.2;
  const band = (w - m.l - m.r) / o.cats.length, bw = Math.min(o.barW || 72, band * 0.62);
  const Y = v => h - m.b - v / max * (h - m.t - m.b);
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img', 'aria-label': o.alt || '' });
  o.cats.forEach((c, i) => {
    const cx = m.l + i * band + band / 2, x = cx - bw / 2;
    const col = c.color || o.color || SER[0];
    const r = el('rect', { x, y: h - m.b, width: bw, height: 0, rx: 8, fill: col, style: 'cursor:pointer' });
    svg.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transition = `y .6s cubic-bezier(.2,.75,.25,1) ${i * 70}ms, height .6s cubic-bezier(.2,.75,.25,1) ${i * 70}ms`;
      r.setAttribute('y', Y(c.value)); r.setAttribute('height', h - m.b - Y(c.value));
    });
    svg.appendChild(txt(o.vFmt ? o.vFmt(c.value) : fmt(c.value), {
      x: cx, y: Y(c.value) - 12, 'text-anchor': 'middle', fill: col, ...VAL }));
    svg.appendChild(txt(c.label, { x: cx, y: h - m.b + 22, 'text-anchor': 'middle', ...AXIS }));
    r.addEventListener('mouseenter', () => showTip(
      `<b>${c.label}</b><em>${o.vFmt ? o.vFmt(c.value) : fmt(c.value)}</em>${c.note ? '<span>' + c.note + '</span>' : ''}`, cx, Y(c.value)));
    r.addEventListener('mouseleave', hideTip);
  });
  host.appendChild(svg);
}

/* --- 2. range columns: a pale bar to the top of the range, solid to the low */
function rangeColumns(host, o) {
  const w = o.w || 520, h = o.h || 280, m = o.m || { t: 36, r: 6, b: 48, l: 6 };
  const max = o.yMax ?? Math.max(...o.cats.map(c => c.high)) * 1.2;
  const band = (w - m.l - m.r) / o.cats.length, bw = Math.min(78, band * 0.6);
  const Y = v => h - m.b - v / max * (h - m.t - m.b);
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img', 'aria-label': o.alt || '' });
  o.cats.forEach((c, i) => {
    const cx = m.l + i * band + band / 2, x = cx - bw / 2;
    const col = c.color || SER[i % 5], same = c.low == null;
    if (!same) svg.appendChild(el('rect', {
      x, y: Y(c.high), width: bw, height: Y(c.low) - Y(c.high) - 3, rx: 8, fill: col, opacity: .26 }));
    const lo = same ? c.high : c.low;
    const r = el('rect', { x, y: h - m.b, width: bw, height: 0, rx: 8, fill: col, style: 'cursor:pointer' });
    svg.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transition = `y .6s cubic-bezier(.2,.75,.25,1) ${i * 80}ms, height .6s cubic-bezier(.2,.75,.25,1) ${i * 80}ms`;
      r.setAttribute('y', Y(lo)); r.setAttribute('height', h - m.b - Y(lo));
    });
    const lab = same ? fmt(c.high) : fmt(c.low) + ' to ' + fmt(c.high);
    svg.appendChild(txt(lab, { x: cx, y: Y(c.high) - 12, 'text-anchor': 'middle', fill: col, ...VAL, 'font-size': 14 }));
    c.label.split(' ').forEach((wd, k) =>
      svg.appendChild(txt(wd, { x: cx, y: h - m.b + 22 + k * 17, 'text-anchor': 'middle', ...AXIS })));
    r.addEventListener('mouseenter', () => showTip(`<b>${c.label}</b><em>${lab}${o.unit || ''}</em>${c.note ? '<span>' + c.note + '</span>' : ''}`, cx, Y(c.high)));
    r.addEventListener('mouseleave', hideTip);
  });
  host.appendChild(svg);
}

/* --- 3. horizontal bars, label left, value right ------------------------- */
function bars(host, o) {
  const rows = o.rows, barH = o.barH || 26, gap = o.gap || 16;
  const labelW = o.labelW || 230, valW = o.valW || 76;
  const w = o.w || 560, h = o.h || rows.length * (barH + gap);
  const max = o.max ?? Math.max(...rows.map(r => r.value));
  const track = w - labelW - valW;
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img', 'aria-label': o.alt || '' });
  rows.forEach((r, i) => {
    const y = i * (barH + gap), col = r.color || o.color || SER[i % 5];
    svg.appendChild(txt(r.label, { x: 0, y: y + barH * 0.72, 'font-family': FONT, 'font-size': 15.5, fill: 'var(--ink-2)' }));
    svg.appendChild(el('rect', { x: labelW, y, width: track, height: barH, rx: 8, fill: 'var(--track)' }));
    const bw = Math.max(5, r.value / max * track);
    const bar = el('rect', { x: labelW, y, width: 0, height: barH, rx: 8, fill: col, style: 'cursor:pointer' });
    svg.appendChild(bar);
    requestAnimationFrame(() => { bar.style.transition = `width .65s cubic-bezier(.2,.75,.25,1) ${i * 55}ms`; bar.setAttribute('width', bw); });
    svg.appendChild(txt((o.vFmt ? o.vFmt(r.value) : fmt(r.value)) + (o.unit || ''), {
      x: w, y: y + barH * 0.72, 'text-anchor': 'end', fill: 'var(--ink)', ...VAL }));
    bar.addEventListener('mouseenter', () => showTip(
      `<b>${r.label}</b><em>${(o.vFmt ? o.vFmt(r.value) : fmt(r.value)) + (o.unit || '')}</em>${r.note ? '<span>' + r.note + '</span>' : ''}`, labelW + bw, y));
    bar.addEventListener('mouseleave', hideTip);
  });
  host.appendChild(svg);
}

/* --- 4. a single 100% bar, labelled by a legend that cannot collide ------ */
function splitBar(host, o) {
  const unit = o.unit ?? '%';
  const w = o.w || 520, bh = o.bh || 32, h = bh;
  const total = o.parts.reduce((a, p) => a + p.value, 0);
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img', 'aria-label': o.alt || '' });
  let x = 0;
  o.parts.forEach((p, i) => {
    const pw = p.value / total * w, col = p.color || SER[i % 5];
    const r = el('rect', { x, y: 0, width: Math.max(2, pw - 4), height: bh, rx: 8, fill: col, style: 'cursor:pointer' });
    const val = (o.vFmt ? o.vFmt(p.value) : fmt(p.value)) + unit;
    svg.appendChild(r);
    r.addEventListener('mouseenter', () => showTip(`<b>${p.label}</b><em>${val}</em>`, x + pw / 2, 0));
    r.addEventListener('mouseleave', hideTip);
    x += pw;
  });
  host.appendChild(svg);
  legend(host, o.parts.map((p, i) => ({
    label: p.label, color: p.color || SER[i % 5],
    note: (o.vFmt ? o.vFmt(p.value) : fmt(p.value)) + unit
  })));
}

/* --- 5. two series side by side, for the Five Forces comparison ---------- */
function pairedColumns(host, o) {
  const w = o.w || 520, h = o.h || 270, m = o.m || { t: 32, r: 6, b: 40, l: 6 };
  const max = o.yMax ?? 6;
  const band = (w - m.l - m.r) / o.cats.length, bw = Math.min(34, band * 0.32);
  const Y = v => h - m.b - v / max * (h - m.t - m.b);
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img', 'aria-label': o.alt || '' });
  o.cats.forEach((c, i) => {
    const cx = m.l + i * band + band / 2;
    [o.a, o.b].forEach((s, k) => {
      const v = s.vals[i], x = cx - bw - 3 + k * (bw + 6);
      const r = el('rect', { x, y: h - m.b, width: bw, height: 0, rx: 7, fill: s.color, style: 'cursor:pointer' });
      svg.appendChild(r);
      requestAnimationFrame(() => {
        r.style.transition = `y .55s cubic-bezier(.2,.75,.25,1) ${i * 60 + k * 40}ms, height .55s cubic-bezier(.2,.75,.25,1) ${i * 60 + k * 40}ms`;
        r.setAttribute('y', Y(v)); r.setAttribute('height', h - m.b - Y(v));
      });
      svg.appendChild(txt(v, { x: x + bw / 2, y: Y(v) - 10, 'text-anchor': 'middle', fill: s.color, ...VAL, 'font-size': 14 }));
      r.addEventListener('mouseenter', () => showTip(`<b>${s.name}</b><span>${c}</span><em>${v} out of 5</em>`, x + bw, Y(v)));
      r.addEventListener('mouseleave', hideTip);
    });
    svg.appendChild(txt(c, { x: cx, y: h - m.b + 24, 'text-anchor': 'middle', ...AXIS }));
  });
  host.appendChild(svg);
}

/* --- 6. a 2x2 map ------------------------------------------------------- */
function map2x2(host, o) {
  const w = o.w || 460, h = o.h || 300, m = { t: 26, r: 18, b: 42, l: 20 };
  const X = v => m.l + v / 100 * (w - m.l - m.r), Y = v => h - m.b - v / 100 * (h - m.t - m.b);
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img', 'aria-label': o.alt || '' });
  svg.appendChild(el('rect', { x: m.l, y: m.t, width: w - m.l - m.r, height: h - m.t - m.b, rx: 12, fill: 'var(--paper-2)' }));
  svg.appendChild(el('rect', { x: X(50) - 1, y: m.t, width: 2, height: h - m.t - m.b, fill: 'var(--light)' }));
  svg.appendChild(el('rect', { x: m.l, y: Y(50) - 1, width: w - m.l - m.r, height: 2, fill: 'var(--light)' }));
  o.points.forEach(p => {
    const col = p.me ? 'var(--copper)' : 'var(--alu-dark)';
    const g = el('g', { style: 'cursor:pointer' });
    if (p.me) g.appendChild(el('circle', { cx: X(p.x), cy: Y(p.y), r: (p.r || 12) + 9, fill: 'var(--copper-pale)' }));
    g.appendChild(el('circle', { cx: X(p.x), cy: Y(p.y), r: p.r || 11, fill: col }));
    g.appendChild(txt(p.label, {
      x: X(p.x) + (p.anchor === 'end' ? -(p.r || 11) - 10 : (p.r || 11) + 10),
      y: Y(p.y) + 5, 'text-anchor': p.anchor || 'start',
      'font-family': FONT, 'font-size': 15, 'font-weight': p.me ? 800 : 600,
      fill: p.me ? 'var(--copper-ink)' : 'var(--ink-2)' }));
    g.addEventListener('mouseenter', () => showTip(`<b>${p.label}</b>${p.note ? '<span>' + p.note + '</span>' : ''}`, X(p.x), Y(p.y)));
    g.addEventListener('mouseleave', hideTip);
    svg.appendChild(g);
  });
  svg.appendChild(txt(o.xLab, { x: (m.l + w - m.r) / 2, y: h - 6, 'text-anchor': 'middle', ...AXIS, 'font-size': 12.5 }));
  svg.appendChild(txt(o.yLab, { x: 0, y: 0, transform: `translate(12,${(m.t + h - m.b) / 2}) rotate(-90)`, 'text-anchor': 'middle', ...AXIS, 'font-size': 12.5 }));
  if (o.xEnds) {
    svg.appendChild(txt(o.xEnds[0], { x: m.l, y: h - 24, ...AXIS, 'font-size': 11 }));
    svg.appendChild(txt(o.xEnds[1], { x: w - m.r, y: h - 24, 'text-anchor': 'end', ...AXIS, 'font-size': 11 }));
  }
  if (o.yEnds) {
    svg.appendChild(txt(o.yEnds[1], { x: 0, y: 0, transform: `translate(26,${m.t + 4}) rotate(-90)`, 'text-anchor': 'end', ...AXIS, 'font-size': 11 }));
    svg.appendChild(txt(o.yEnds[0], { x: 0, y: 0, transform: `translate(26,${h - m.b - 4}) rotate(-90)`, ...AXIS, 'font-size': 11 }));
  }
  host.appendChild(svg);
}

/* --- 7. legend ---------------------------------------------------------- */
function legend(host, items) {
  const d = document.createElement('div');
  d.className = 'legend';
  items.forEach((it, i) => {
    const s = document.createElement('span');
    s.innerHTML = `<i style="background:${it.color || SER[i % 5]}"></i>${it.label}` + (it.note ? `<u>${it.note}</u>` : '');
    d.appendChild(s);
  });
  host.appendChild(d);
}
