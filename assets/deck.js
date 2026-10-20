/* ===========================================================================
   Deck runtime: fit to the screen, move between slides, the overview grid,
   the speaker-notes panel, the theme switch, and the charts.
   =========================================================================== */

const stage = document.getElementById('stage');
const slides = [...document.querySelectorAll('.slide')];
const TOTAL = slides.length;
let cur = 0, notesOpen = false;

/* --- fit the 1280 x 720 stage into whatever screen it lands on ----------- */
function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  stage.style.transform = 'scale(' + s + ')';
}
addEventListener('resize', fit);
fit();

/* --- build the rail and the overview ------------------------------------- */
const ticks = document.getElementById('ticks');
const grid = document.getElementById('grid');
slides.forEach((s, n) => {
  const t = document.createElement('div');
  t.className = 'tick';
  t.title = (n + 1) + '. ' + (s.dataset.title || '');
  t.onclick = () => go(n);
  ticks.appendChild(t);

  const c = document.createElement('button');
  c.className = 'gcard';
  c.innerHTML = `<div class="gn">${n + 1}</div><div class="gt">${s.dataset.title || ''}</div>`;
  c.onclick = () => { toggleGrid(false); go(n); };
  grid.appendChild(c);
});

function go(n) {
  cur = Math.max(0, Math.min(TOTAL - 1, n));
  slides.forEach((s, k) => s.classList.toggle('on', k === cur));
  [...ticks.children].forEach((t, k) => {
    t.className = 'tick' + (k < cur ? ' done' : '') + (k === cur ? ' now' : '');
  });
  [...grid.querySelectorAll('.gcard')].forEach((c, k) => c.classList.toggle('cur', k === cur));
  document.getElementById('count').textContent = (cur + 1) + ' / ' + TOTAL;
  document.getElementById('where').textContent = slides[cur].dataset.where || '';
  renderNotes();
  hideTip();
  location.hash = 's' + (cur + 1);
}

function toggleGrid(on) {
  const g = document.getElementById('grid');
  const want = on === undefined ? !g.classList.contains('on') : on;
  g.classList.toggle('on', want);
  document.getElementById('bGrid').setAttribute('aria-pressed', String(want));
}
function toggleNotes(on) {
  notesOpen = on === undefined ? !notesOpen : on;
  document.getElementById('notes').classList.toggle('on', notesOpen);
  document.getElementById('bNotes').setAttribute('aria-pressed', String(notesOpen));
  renderNotes();
}
function renderNotes() {
  if (!notesOpen) return;
  const n = (typeof NOTES !== 'undefined' && NOTES[cur]) || { say: '', points: [], ask: '' };
  document.getElementById('notes').innerHTML =
    `<h4>Speaker notes &middot; slide ${cur + 1} &middot; ${n.time || ''}</h4>` +
    `<p><b>Open with:</b> ${n.say}</p>` +
    (n.points || []).map(p => `<p>${p}</p>`).join('') +
    (n.ask ? `<p class="q"><b>If asked:</b> ${n.ask}</p>` : '');
}
function toggleTheme() {
  const r = document.documentElement;
  r.setAttribute('data-theme', r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); go(cur + 1); }
  else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); go(cur - 1); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(TOTAL - 1);
  else if (k === 'g' || k === 'G') toggleGrid();
  else if (k === 'n' || k === 'N') toggleNotes();
  else if (k === 't' || k === 'T') toggleTheme();
  else if (k === '?' || k === '/') document.getElementById('help').classList.toggle('on');
  else if (k === 'f' || k === 'F') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  } else if (k === 'Escape') {
    toggleGrid(false); toggleNotes(false);
    document.getElementById('help').classList.remove('on');
  } else if (/^[1-9]$/.test(k)) go(parseInt(k, 10) - 1);
  else if (k === '0') go(9);
});

addEventListener('click', e => {
  if (e.target.closest('button, a, .tick, svg, #notes, #grid, #tools, #help')) return;
  if (document.getElementById('grid').classList.contains('on')) return;
  go(e.clientX < innerWidth * 0.25 ? cur - 1 : cur + 1);
});

let tx = 0, ty = 0;
addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
}, { passive: true });

document.getElementById('bGrid').onclick = () => toggleGrid();
document.getElementById('bNotes').onclick = () => toggleNotes();
document.getElementById('bTheme').onclick = () => toggleTheme();
document.getElementById('bHelp').onclick = () => document.getElementById('help').classList.toggle('on');

/* ===========================================================================
   The charts. Every figure comes from assets/data.js.
   =========================================================================== */
const $ = id => document.getElementById(id);
const D = DATA;

/* 03 — how much battery the world uses */
columns($('c_demand'), {
  w: 330, h: 212, barW: 40,
  cats: [
    { label: '2020', value: 170 }, { label: '2022', value: 550 },
    { label: '2024', value: 950 }, { label: '2025', value: 1200 },
    { label: '2030', value: 3000, color: 'var(--alu)', note: 'the IEA outlook, not an actual' }
  ],
  vFmt: v => v >= 1000 ? (v / 1000).toFixed(1) + ' TWh' : v
});

/* 03 — what a pack costs, in thousand rupees per kWh */
columns($('c_price'), {
  w: 330, h: 212, barW: 40, color: 'var(--s1)',
  cats: [0, 2, 4, 5, 6].map(i => ({
    label: String(D.packPrice.years[i]).slice(2),
    value: D.packPrice.inrK[i],
    color: i === 6 ? 'var(--alu)' : 'var(--s1)',
    note: i === 6 ? "BloombergNEF's forecast" : 'about $' + D.packPrice.usd[i] + ' per kWh'
  })),
  vFmt: v => '₹' + v.toFixed(1) + 'k'
});

/* 04 — China's share, step by step */
bars($('c_choke'), {
  w: 560, h: 222, labelW: 190, valW: 54, barH: 17, gap: 9, max: 100, unit: '%',
  rows: D.chinaShare.map((r, i) => ({
    ...r, color: i < 3 ? 'var(--s2)' : i === 3 ? 'var(--s1)' : i < 7 ? 'var(--s3)' : 'var(--alu)'
  }))
});

/* 05 — importers, and where China's exports went */
bars($('c_imp'), {
  w: 520, h: 186, labelW: 152, valW: 118, barH: 23, gap: 14,
  rows: D.importers.map((r, i) => ({
    label: r.label, value: r.usd, note: r.note,
    color: ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)'][i]
  })),
  vFmt: v => cr(v * 1e9, 'USD')
});
splitBar($('c_dest'), {
  w: 520, bh: 30,
  parts: [
    { label: 'Europe', value: D.chinaExports.euUsd, color: 'var(--s1)' },
    { label: 'United States', value: D.chinaExports.usUsd, color: 'var(--s2)' },
    { label: 'Everywhere else', value: D.chinaExports.totalUsd - D.chinaExports.euUsd - D.chinaExports.usUsd, color: 'var(--alu)' }
  ],
  unit: '', vFmt: v => cr(v * 1e9, 'USD')
});

/* 06 — what Europe promised against what it will build */
rangeColumns($('c_eu'), {
  w: 520, h: 252, yMax: 2400, unit: ' GWh',
  cats: D.europe2030.map((c, i) => ({
    ...c, color: ['var(--alu)', 'var(--s3)', 'var(--s1)', 'var(--s2)'][i]
  }))
});
legend($('c_eu'), [
  { label: 'A single figure means there is no range', color: 'var(--alu)' },
  { label: 'Solid is the low end, the pale block above it is the high end', color: 'var(--s1)' }
]);

/* 09 — the capacity arithmetic, drawn to scale */
bars($('c_arith'), {
  w: 540, h: 206, labelW: 214, valW: 96, barH: 32, gap: 18, max: 1500, unit: ' MWh',
  rows: [
    { label: 'What they advertise', value: D.arithmetic.marketedMWh, color: 'var(--s1)', note: 'this is the electrode line, not cells' },
    { label: 'Their 2027 plan', value: D.arithmetic.plan2027MWh, color: 'var(--s3)', note: 'needs about 100 times today' },
    { label: 'What the funding targets', value: D.arithmetic.seriesBTargetMWh, color: 'var(--s2)', note: 'contradicts the 1,500 by 1.7 times' },
    { label: 'What the cell line makes', value: D.arithmetic.actualMWh, color: 'var(--crit)', note: '50,000 cells a month, since June 2026' }
  ],
  vFmt: v => v.toLocaleString('en-IN')
});

/* 11 — where the value sits, and the four product lines */
splitBar($('c_chain'), { w: 520, bh: 30, parts: D.valueChain });
map2x2($('c_bcg'), {
  w: 420, h: 226, xLab: 'Their share of that niche', yLab: 'How fast it is growing',
  xEnds: ['almost none', 'the most they have'], yEnds: ['steady', 'fast'],
  points: [
    { x: 27, y: 68, label: 'The 21700 cell', r: 12, note: 'Fast growth, almost no share, and it is spending the money.' },
    { x: 13, y: 86, label: 'Sodium-ion', r: 8, note: 'A government-funded option, not yet a business.' },
    { x: 70, y: 33, label: 'Electrode foil', r: 15, me: true, anchor: 'end', note: 'The cash engine: real customers and almost no competition in Europe.' },
    { x: 40, y: 17, label: 'Pouch prototypes', r: 9, note: 'Steady engineering work.' }
  ]
});

/* 12 — the five pressures, niche against commodity */
pairedColumns($('c_forces'), {
  w: 500, h: 254, cats: D.forces.names,
  a: { name: 'This niche', vals: D.forces.niche, color: 'var(--s1)' },
  b: { name: 'The mass market', vals: D.forces.commodity, color: 'var(--s2)' }
});
legend($('l_forces'), [
  { label: 'This niche', color: 'var(--s1)', note: 'average ' + D.forces.nicheAvg },
  { label: 'Mass-market car cells', color: 'var(--s2)', note: 'average ' + D.forces.commodityAvg }
]);

/* 15 — what India spends on imported cells */
columns($('c_india'), {
  w: 400, h: 164, barW: 34, color: 'var(--s4)',
  cats: D.indiaImports.labels.map((l, i) => ({
    label: l, value: D.indiaImports.crore[i],
    note: 'about $' + D.indiaImports.usd[i].toFixed(2) + ' billion'
  })),
  vFmt: v => '₹' + (v / 1000).toFixed(1) + 'k cr'
});

/* --- the two tables that are built from data ----------------------------- */
$('t_fail').innerHTML = D.failures.map(f => `<tr>
  <td>${f.co}</td><td>${f.country}</td><td>${f.what}</td>
  <td class="n">${f.amt ? cr(f.amt * 1e9, f.cur) : '<span class="muted">not disclosed</span>'}</td></tr>`).join('');

$('t_dry').innerHTML = D.dryCoating.ranking.map(r => `<tr${r.me ? ' class="me"' : ''}>
  <td class="n" style="width:34px">${r.n}</td><td>${r.who}</td><td>${r.scope}</td><td>${r.scale}</td></tr>`).join('');

/* --- start ---------------------------------------------------------------- */
const start = parseInt((location.hash.match(/^#s(\d+)$/) || [])[1] || '1', 10) - 1;
go(isNaN(start) ? 0 : start);
setTimeout(() => {
  const h = document.getElementById('hint');
  if (h) { h.style.opacity = '0'; setTimeout(() => h.remove(), 600); }
}, 5000);
