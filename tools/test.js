// Prüft Inhalte und rechnet Lösungen nach. Aufruf: node tools/test.js
// 1. Alle Formeln müssen fehlerfrei setzen, alle Aufgaben vollständig sein.
// 2. Alle Generatoren laufen hundertfach mit Zufallszahlen.
// 3. Die Formeln aus Übungsblättern und Rechenkern werden numerisch nachintegriert.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = {};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.console = console;
vm.createContext(sandbox);
const load = (file) => vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
load(path.join(root, 'web', 'vendor', 'katex', 'katex.min.js'));
load(path.join(root, 'web', 'src', 'engine.js'));
for (const f of fs.readdirSync(path.join(root, 'web', 'content')).sort()) load(path.join(root, 'web', 'content', f));
// plot.js und labs.js brauchen zum Laden nur wenige Globale.
sandbox.h = () => ({});
sandbox.md = () => '';
load(path.join(root, 'web', 'src', 'plot.js'));

const { katex, SSEngine, SS_CONTENT: C, plotSVG } = sandbox;
const { Calc, Sig } = SSEngine;
const errors = [];
const err = (where, msg) => errors.push(where + ': ' + msg);

function checkText(where, text) {
  if (text === undefined || text === null) return;
  if (typeof text !== 'string') return err(where, 'kein Text: ' + typeof text);
  if ((text.match(/\*\*/g) || []).length % 2) err(where, 'ungerade Anzahl ** in: ' + text.slice(0, 60));
  const stripped = text.replace(/\$\$[\s\S]+?\$\$/g, '').replace(/\$[^$\n]+?\$/g, '');
  if (stripped.includes('$')) err(where, 'offenes $ in: ' + text.slice(0, 80));
  if (/undefined|NaN|\[object/.test(text)) err(where, 'Platzhalter im Text: ' + text.slice(0, 80));
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let m;
  while ((m = re.exec(text))) {
    const tex = m[1] !== undefined ? m[1] : m[2];
    try {
      katex.renderToString(tex, { throwOnError: true, strict: false, displayMode: m[1] !== undefined });
    } catch (e) {
      err(where, 'KaTeX: ' + e.message.slice(0, 120) + ' in ' + tex.slice(0, 80));
    }
  }
}

function checkBlock(where, b) {
  if (b.t !== 'plot') checkText(where, b.x); // Beim Plot ist x der Wertebereich der Achse.
  checkText(where, b.title);
  checkText(where, b.cap);
  (b.i || []).forEach((x) => checkText(where, x));
  if (b.t === 'f' && !/\$/.test(b.x)) checkText(where, '$$' + b.x + '$$');
  if (b.t === 'tb') {
    (b.head || []).forEach((c) => checkText(where, c));
    (b.rows || []).forEach((r) => {
      if (r.length !== b.head.length) err(where, 'Tabelle: ' + r.length + ' statt ' + b.head.length + ' Spalten');
      r.forEach((c) => checkText(where, c));
    });
  }
  if (b.t === 'plot') checkPlot(where, b);
  if (b.t === 'st') {
    if (!b.steps || b.steps.length < 2) err(where, 'st braucht mindestens zwei Schritte');
    (b.steps || []).forEach((s) => {
      checkText(where, s.x);
      if (s.f) checkText(where, /\$/.test(s.f) ? s.f : '$$' + s.f + '$$');
      if (s.plot) checkPlot(where, s.plot);
    });
  }
  if (b.t === 'x' && !/^(ops|evenodd|energy|delta|conv|convsum|fourier|spectrum|ft|lti)$/.test(b.viz)) err(where, 'unbekanntes Labor ' + b.viz);
}

function checkPlot(where, spec) {
  try {
    const svg = plotSVG(spec);
    if (/NaN|undefined|Infinity/.test(svg)) err(where, 'Plot enthält ungültige Zahlen');
  } catch (e) {
    err(where, 'Plot: ' + e.message);
  }
  (spec.curves || []).concat(spec.deltas || [], spec.stems || []).forEach((c) => checkText(where, c.label));
}

function checkQuestion(where, q) {
  if (!q.id) err(where, 'Frage ohne id');
  checkText(where, q.q);
  checkText(where, q.e);
  (q.steps || []).forEach((s) => checkText(where, s));
  (q.sol || []).forEach((b) => checkBlock(where, b));
  if (q.fig) checkBlock(where, q.fig);
  switch (q.k) {
    case 'mc':
    case 'ms':
      if (!Array.isArray(q.o) || q.o.length < 2) err(where, 'zu wenige Optionen');
      (q.o || []).forEach((x) => checkText(where, x));
      if (new Set(q.o).size !== (q.o || []).length) err(where, 'doppelte Optionen: ' + JSON.stringify(q.o));
      (q.a || []).forEach((i) => { if (!(i >= 0 && i < q.o.length)) err(where, 'Lösungsindex außerhalb'); });
      if (!q.a || !q.a.length) err(where, 'keine Lösung');
      break;
    case 'tf':
      if (!q.st || !q.st.length) err(where, 'tf ohne Aussagen');
      (q.st || []).forEach((s) => { checkText(where, s.s); checkText(where, s.e); if (typeof s.v !== 'boolean') err(where, 'tf ohne Wahrheitswert'); });
      break;
    case 'num':
      if (!Number.isFinite(q.num)) err(where, 'num ungültig: ' + q.num);
      if (!(q.tol >= 0)) err(where, 'tol fehlt');
      break;
    case 'match':
      (q.pairs || []).forEach((p) => { checkText(where, p[0]); checkText(where, p[1]); });
      if (!q.pairs || q.pairs.length < 2) err(where, 'match zu kurz');
      break;
    case 'ord':
      (q.seq || []).forEach((s) => checkText(where, s));
      break;
    case 'open':
      if (!q.model || !q.model.length) err(where, 'open ohne Musterlösung');
      (q.model || []).forEach((s) => checkText(where, s));
      break;
    case 'walk':
      if (!q.parts || !q.parts.length) err(where, 'walk ohne Teile');
      (q.parts || []).forEach((p, i) => {
        if (p.k === 'info') checkText(where + '#' + i, p.x);
        else checkQuestion(where + '#' + i, Object.assign({ id: q.id + '.' + i }, p));
      });
      break;
    case 'info':
      break;
    default:
      err(where, 'unbekannter Fragetyp ' + q.k);
  }
}

// --- Inhalte ---------------------------------------------------------------
const ids = new Set();
const claim = (where, id) => { if (ids.has(id)) err(where, 'id doppelt: ' + id); ids.add(id); };
let questionCount = 0;
let sheetCount = 0;
for (const m of C.modules) {
  checkText(m.id, m.title);
  checkText(m.id, m.goal);
  claim(m.id, m.id);
  const qids = new Set(m.questions.map((q) => q.id));
  const used = new Set();
  for (const s of m.sections) {
    claim(s.id, s.id);
    if (!s.id.startsWith(m.id + 's')) err(s.id, 'id passt nicht zum Modul');
    checkText(s.id, s.title);
    s.blocks.forEach((b) => checkBlock(s.id, b));
    for (const id of s.practice || []) {
      used.add(id);
      if (!qids.has(id) && !Calc.has(id)) err(s.id, 'Praxis verweist ins Leere: ' + id);
    }
  }
  for (const q of m.questions) {
    questionCount++;
    if (/^Blatt/.test(q.src || '')) sheetCount++;
    claim(m.id, q.id);
    checkQuestion(q.id, q);
    if (!used.has(q.id)) err(m.id, 'Frage ohne Abschnitt: ' + q.id);
  }
  for (const c of m.calcs || []) if (!Calc.has(c)) err(m.id, 'unbekannter Generator ' + c);
}
for (const e of C.course.errata) checkText('errata', e);
checkText('examNote', C.course.examNote);
const examPct = C.course.examTasks.reduce((s, t) => s + t.pct, 0);
const examMin = C.course.examTasks.reduce((s, t) => s + t.min, 0);
if (examPct !== 100) err('course', 'Anteile ergeben ' + examPct + ' %');
if (examMin !== 48) err('course', 'Minuten ergeben ' + examMin);
for (const e of C.exams) {
  let total = 0;
  for (const t of e.tasks) {
    const sum = t.questions.reduce((s, q) => s + q.pts, 0);
    if (sum !== t.pts) err(e.id, 'Aufgabe ' + t.no + ': ' + sum + ' statt ' + t.pts + ' Punkte');
    total += t.pts;
    t.questions.forEach((q) => { claim(e.id, q.id); checkQuestion(q.id, q); });
  }
  if (total !== 48) err(e.id, 'Summe ' + total + ' statt 48 Punkte');
  if (e.minutes !== 48) err(e.id, 'nicht 48 Minuten');
}
// Jede Übungsaufgabe muss vorkommen.
const WANT = ['1-1a', '1-1b', '1-1c', '1-2', '1-3', '1-4a', '1-4b', '1-4c', '2-1a', '2-1b', '2-1c', '2-1d', '2-1e', '2-1f', '2-2a', '2-2b', '2-2c', '2-2d', '3-1', '3-2', '3-3', '3-4', '3-5', '5-1', '5-2', '5-3', '5-4', '6-1a', '6-1b', '6-1c', '6-1d', '6-2', '6-3', '6-4', '7-1', '7-2', '7-3', '7-4'];
const have = new Set();
C.modules.forEach((m) => m.questions.forEach((q) => { if (q.src) have.add(q.src.replace('Blatt ', '')); }));
WANT.forEach((w) => { if (!have.has(w)) err('Übungsblätter', 'Aufgabe fehlt: ' + w); });

// --- Generatoren -------------------------------------------------------------
let genRuns = 0;
for (const g of Calc.list()) {
  checkText(g.id, g.formula);
  if (!C.modules.some((m) => (m.calcs || []).includes(g.id))) err(g.id, 'Generator gehört zu keinem Modul');
  for (let run = 0; run < 300; run++) {
    Calc.seed(run * 7919 + 13);
    let q;
    try {
      q = Calc.make(g.id);
    } catch (e) {
      err(g.id, 'Absturz: ' + e.message);
      break;
    }
    genRuns++;
    checkQuestion(g.id + '/' + run, q);
    if (q.id !== g.id) err(g.id, 'falsche id ' + q.id);
  }
}

// --- Numerik -----------------------------------------------------------------
function integ(f, a, b, N) {
  const n = N || 40000;
  const dx = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * dx);
  return s * dx;
}
const near = (name, a, b, tol) => { if (!(Math.abs(a - b) <= (tol === undefined ? 1e-3 : tol))) err('Numerik', name + ': ' + a + ' statt ' + b); };
const conv = (x, g, t, A, B) => integ((u) => x(u) * g(t - u), A, B);
const sg = Sig.sig;
const PI = Math.PI;
let checks = 0;
const eq = (...a) => { checks++; near(...a); };

// Blatt 1
for (const [w, p1, p2, t] of [[2, 0.3, 1.1, 0.7], [5, -1, 2, 1.3]]) {
  eq('1-1a', Math.sin(w * t + p1) + Math.sin(w * t + p2), 2 * Math.sin(w * t + (p1 + p2) / 2) * Math.cos((p1 - p2) / 2));
}
eq('1-1b', Math.sin(3 * 0.4) + Math.sin(3 * 0.4 - PI), 0);
eq('1-1c', Math.sin(2 * 0.4 + 0.2) + Math.sin(5 * 0.4 + 0.9), 2 * Math.sin((2 * 0.4 + 5 * 0.4 + 0.2 + 0.9) / 2) * Math.cos((2 * 0.4 - 5 * 0.4 + 0.2 - 0.9) / 2));
eq('1-2 σ', integ((t) => sg(t), -5000, 5000, 200000) / 10000, 0.5, 1e-3);
eq('1-3 cos', integ((t) => Math.cos(3 * t) ** 2, -2000, 2000, 400000) / 4000, 0.5, 1e-3);
eq('Energie Rechteck', integ((t) => (2 * (sg(t + 1) - sg(t - 1))) ** 2, -3, 3), 8, 1e-2);
eq('Energie e', integ((t) => (3 * Math.exp(-2 * t)) ** 2, 0, 30), 2.25);
eq('Energie e|t|', integ((t) => (2 * Math.exp(-Math.abs(t))) ** 2, -30, 30), 4);
{
  const s = (t) => Math.exp(t) * Math.sin(t) - t ** 5 - 3 * t * t + 5;
  for (const t of [0.5, 1.7]) {
    eq('1-4c se', (s(t) + s(-t)) / 2, (Math.sin(t) / 2) * (Math.exp(t) - Math.exp(-t)) - 3 * t * t + 5);
    eq('1-4c so', (s(t) - s(-t)) / 2, (Math.sin(t) / 2) * (Math.exp(t) + Math.exp(-t)) - t ** 5);
  }
}
// Blatt 2: Dirac durch ein sehr schmales Rechteck annähern
const deltaInt = (f, t0) => { const w = 1e-4; return integ((t) => f(t) / w, t0 - w / 2, t0 + w / 2, 100); };
eq('2-1c', deltaInt((t) => Math.exp(-t) * Math.cos(t), 0), 1);
eq('2-1d', deltaInt((t) => Math.exp(-t) * Math.sin(t), 0), 0);
eq('2-1e', deltaInt((t) => (t - 1) * Math.sin(t), -1), 2 * Math.sin(1));
{
  // Ableitungen numerisch
  const d = (f, t) => (f(t + 1e-5) - f(t - 1e-5)) / 2e-5;
  const a = 1.3;
  const t = 0.9;
  eq('2-2a', d((u) => Math.exp(-u) * Math.cos(u), t), -Math.exp(-t) * (Math.cos(t) + Math.sin(t)));
  eq('2-2b', d((u) => (u + a) + Math.exp(-u) * Math.sin(u), t), 1 + Math.exp(-t) * (Math.cos(t) - Math.sin(t)));
  eq('2-2c', d((u) => Math.cos(u) + Math.sin(u), t), Math.cos(t) - Math.sin(t));
  eq('2-2d', d((u) => u * (u + a) + Math.exp(-u) * Math.sin(u), t), t + (t + a) + Math.exp(-t) * (Math.cos(t) - Math.sin(t)));
}
// Blatt 5 und Rechenkern
for (const t of [0.4, 1.5, 3.2]) {
  eq('convExpExp', conv((u) => sg(u) * Math.exp(-2 * u), (u) => sg(u) * Math.exp(-5 * u), t, 0, t), Sig.convExpExp(5, 2, t));
  eq('5-1', conv((u) => sg(u) * Math.sin(3 * u), (u) => sg(u) * Math.exp(-2 * u), t, 0, t), Sig.convExpSin(2, 3, t));
  eq('5-1 Formel', Sig.convExpSin(2, 3, t), (3 * Math.exp(-2 * t) + 2 * Math.sin(3 * t) - 3 * Math.cos(3 * t)) / 13);
  eq('5-2', conv((u) => sg(u) * Math.exp(-3 * u), (u) => sg(u - 1), t, 0, t), Sig.convStepExp(3, 1, t));
  const r = (u) => sg(u) - sg(u - 1);
  eq('5-3', conv(r, r, t, -1, 4), Sig.convRect(1, 1, 1, 1, t), 2e-3);
  const ta = 1;
  const f53 = sg(t) * t + sg(t - ta) * (2 * ta - 2 * t) + sg(t - 2 * ta) * (t - 2 * ta);
  eq('5-3 Blatt', f53, Sig.convRect(1, ta, 1, ta, t));
  eq('Trapez', conv((u) => 2 * (sg(u) - sg(u - 1)), (u) => sg(u) - sg(u - 3), t, -1, 6), Sig.convRect(2, 1, 1, 3, t), 2e-3);
  const g54 = (u) => 2 * (sg(u - 0.5) - sg(u - 1.5));
  eq('5-4', integ((u) => Math.cos(2 * u) ** 2 * g54(t - u), t - 2, t + 1, 40000), Sig.convWindowCos2(2, 0.5, 1.5, 2, t), 2e-3);
  eq('5-4 Blatt', Sig.convWindowCos2(2, 0.5, 1.5, 2, t), 1 + (1 / 4) * (Math.sin(4 * (t - 0.5)) - Math.sin(4 * (t - 1.5))));
  eq('cos-Fenster', integ((u) => Math.cos(3 * u) * (sg(t - u - 1) - sg(t - u - 2)) * 2, t - 3, t, 40000), Sig.convWindowCos(2, 1, 2, 3, t), 2e-3);
  const a = 2;
  const rect = (u) => sg(u) - sg(u - 1);
  const yRect = (Math.max(0, 1 - Math.exp(-a * t)) / a) * sg(t) - sg(t - 1) * ((1 - Math.exp(-a * (t - 1))) / a);
  eq('Skript Rechteck am RC', conv(rect, (u) => sg(u) * Math.exp(-a * u), t, -1, 5), yRect, 2e-3);
  eq('Skript e^t', conv((u) => sg(u) * Math.exp(u), sg, t, 0, t), Math.exp(t) - 1);
  const RC = 0.7;
  const w0 = 1 / RC;
  eq('RC-Rampe korrigiert', conv((u) => sg(u) * 2 * u, (u) => sg(u) * w0 * Math.exp(-w0 * u), t, 0, t), 2 * (t + RC * Math.exp(-t / RC) - RC), 2e-3);
}
{
  const y = Sig.convSeq([1, 2, 3], [1, 1]);
  checks++;
  if (y.join() !== '1,3,5,3') err('Numerik', 'Faltungssumme: ' + y.join());
  // Beispiel aus dem Skript: (1/2)^k mit Sprung
  let s = 0;
  for (let l = 0; l <= 3; l++) s += Math.pow(0.5, 3 - l);
  eq('Faltungssumme geometrisch', s, (1 - Math.pow(0.5, 4)) / 0.5);
}
// Blatt 6: komplexe Koeffizienten
function ck(f, a, T, k) {
  const w0 = (2 * PI) / T;
  const re = integ((t) => f(t) * Math.cos(k * w0 * t), a, a + T, 200000) / T;
  const im = integ((t) => -f(t) * Math.sin(k * w0 * t), a, a + T, 200000) / T;
  return [re, im];
}
for (const k of [1, 2, 3, 5]) {
  const c = ck((t) => t ** 3, 0, 2 * PI, k);
  eq('6-2 Re', c[0], (6 * k * PI) / k ** 3, 2e-3);
  eq('6-2 Im', c[1], (4 * PI * PI * k * k - 6) / k ** 3, 2e-3);
  const f63 = (t) => (t < 0 ? -t / PI : 0);
  const c3 = ck(f63, -PI, 2 * PI, k);
  const odd = 1 - Math.pow(-1, k);
  eq('6-3 Re', c3[0], (-1 / (2 * PI * PI * k * k)) * odd, 2e-3);
  eq('6-3 Im', c3[1], (-1 / (2 * PI * k)) * Math.pow(-1, k), 2e-3);
  const c4 = ck((t) => 1 - Math.cos(t), -PI / 2, PI, k);
  eq('6-4', c4[0], (2 / (PI * (1 - 4 * k * k))) * Math.pow(-1, k + 1), 2e-3);
  eq('6-4 Im', c4[1], 0, 2e-3);
  const saw = ck((t) => 3 * t, 0, 2, k);
  eq('Sägezahn', saw[1], Sig.fsSawIm(3, 2, k), 2e-3);
  const skriptSaw = ck((t) => 2 / 4 - t / 2, 0, 2, k);
  eq('Skript Sägezahn', skriptSaw[1], -2 / (4 * k * PI), 2e-3);
  const pulse = ck((t) => (Math.abs(t) <= 1 ? 2 : 0), -4, 8, k);
  eq('Pulsfolge', pulse[0], Sig.fsPulse(2, 2, 8, k), 3e-3);
  const sq = ck((t) => (t < 2 ? 3 : -3), 0, 4, k);
  eq('Rechteck Im', sq[1], -Sig.fsSquareB(3, k) / 2, 3e-3);
  const tp = ck((t) => (t <= PI ? t : PI), 0, 2 * PI, k);
  eq('Skript Übung Kap6 Re', tp[0], (Math.pow(-1, k) - 1) / (2 * PI * k * k), 2e-3);
  eq('Skript Übung Kap6 Im', tp[1], 1 / (2 * k), 2e-3);
}
eq('6-4 c0', ck((t) => 1 - Math.cos(t), -PI / 2, PI, 0)[0], 1 - 2 / PI, 2e-3);
eq('6-3 c0', ck((t) => (t < 0 ? -t / PI : 0), -PI, 2 * PI, 0)[0], 0.25, 2e-3);
eq('6-2 c0', ck((t) => t ** 3, 0, 2 * PI, 0)[0], 2 * PI ** 3, 2e-2);
eq('Übung Kap6 c0', ck((t) => (t <= PI ? t : PI), 0, 2 * PI, 0)[0], (3 * PI) / 4, 2e-3);
// Blatt 7
for (const w of [0.7, 1.9, 4.2]) {
  const F = (f, a, b) => [integ((t) => f(t) * Math.cos(w * t), a, b, 200000), integ((t) => -f(t) * Math.sin(w * t), a, b, 200000)];
  eq('7-1', F(() => 1, -2, 2)[0], Sig.ftRect(1, 2, w), 2e-3);
  eq('7-2 Im', F((t) => (3 / 2) * t, -2, 2)[1], Sig.ftLineIm(3, 2, w), 2e-3);
  eq('7-2 Re', F((t) => (3 / 2) * t, -2, 2)[0], 0, 2e-3);
  eq('7-4', F((t) => 1 / (4 + t * t), -4000, 4000)[0], Sig.ftLorentz(2, w), 3e-3);
  const e = F((t) => Math.exp(-2 * t), 0, 40);
  eq('σe Betrag', Math.hypot(e[0], e[1]), 1 / Math.hypot(2, w), 2e-3);
  eq('σe Phase', Math.atan2(e[1], e[0]), -Math.atan(w / 2), 2e-3);
  const two = F((t) => Math.exp(-2 * Math.abs(t)), -40, 40);
  eq('e|t|', two[0], 4 / (4 + w * w), 2e-3);
  const gauss = F((t) => Math.exp(-2 * t * t), -20, 20);
  eq('Gauss', gauss[0], Math.sqrt(PI / 2) * Math.exp((-w * w) / 8), 2e-3);
  const te = F((t) => t * Math.exp(-2 * t), 0, 40);
  const den = 4 - w * w;
  eq('σte Re', te[0], den / (den * den + 16 * w * w), 2e-3);
  const tri = F((t) => (Math.abs(t) <= 3 ? 1 - Math.abs(t) / 3 : 0), -3, 3);
  eq('Dreieck', tri[0], (4 / (3 * w * w)) * Math.sin((w * 3) / 2) ** 2, 2e-3);
}
// Zahlen aus den Probeklausuren
eq('x1d2', (1 - Math.exp(-3)) / 3, 0.3167, 1e-3);
eq('x1d3', (1 - Math.exp(-9)) / 3 - (1 - Math.exp(-3)) / 3, 0.01655, 1e-3);
eq('x2d3', (1 - Math.exp(-2)) / 2, 0.4323, 1e-3);
eq('x2e3', Sig.fsSquareB(2, 1), 2.546, 2e-3);
eq('x3a2', integ((t) => (Sig.ramp(t) - Sig.ramp(t - 1)) ** 2, -5000, 5000, 400000) / 10000, 0.5, 2e-3);
eq('x3d4', Sig.convRect(2, 1, 1, 3, 3.5), 1);
eq('x1a3', integ((t) => sg(t) * Math.cos(t) ** 2, -2000, 2000, 400000) / 4000, 0.25, 2e-3);

const report = C.modules.length + ' Module, ' + questionCount + ' Aufgaben (' + sheetCount + ' von den Übungsblättern), ' + Calc.list().length + ' Generatoren mit ' + genRuns + ' Läufen, ' + C.exams.length + ' Probeklausuren, ' + checks + ' Nachrechnungen';
console.log(report);
if (errors.length) {
  const unique = Array.from(new Set(errors.map((e) => e.replace(/\/\d+(#\d+)?:/, ':'))));
  unique.slice(0, 60).forEach((e) => console.log('FEHLER ' + e));
  console.log(unique.length + ' Fehler');
  process.exit(1);
}
console.log('Alles in Ordnung.');
