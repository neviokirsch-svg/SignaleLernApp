// Interaktive Labore. Jedes Labor zeigt einen Gedanken zum Anfassen: Regler bewegen, Bild ändert sich sofort.
(function () {
  'use strict';

  const { sig, ramp } = SSEngine.Sig;
  const Labs = window.SSLabs;
  const n = (v, d) => {
    const r = +(+v).toFixed(d === undefined ? 2 : d);
    return String(r).replace('.', '{,}');
  };
  const plain = (v, d) => String(+(+v).toFixed(d === undefined ? 2 : d)).replace('.', ',').replace('-', '−');

  function slider(label, min, max, step, value, onInput, fmt) {
    const out = h('b', null, fmt ? fmt(value) : plain(value));
    const input = h('input', { type: 'range', min, max, step, value, 'aria-label': label, oninput: (e) => { const v = parseFloat(e.target.value); out.textContent = fmt ? fmt(v) : plain(v); onInput(v); } });
    const el = h('label', null, h('span', { html: md(label) }), out, input);
    el.set = (v) => { input.value = v; out.textContent = fmt ? fmt(v) : plain(v); };
    return el;
  }
  function chooser(items, active, onPick) {
    const el = h('div', { class: 'chips' });
    const draw = (cur) => el.replaceChildren(...items.map((it) =>
      h('button', { type: 'button', class: 'chip' + (it.id === cur ? ' on' : ''), 'aria-pressed': it.id === cur ? 'true' : 'false', html: md(it.label), onclick: () => { draw(it.id); onPick(it.id); } })));
    draw(active);
    return el;
  }
  const box = (title, ...kids) => vizCard(title, ...kids);
  const figure = () => h('div');
  const readout = (cls) => h('div', { class: 'readout' + (cls ? ' ' + cls : '') });

  function integrate(f, a, b, steps) {
    const N = steps || 2000;
    const dx = (b - a) / N;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += f(a + (i + 0.5) * dx);
    return sum * dx;
  }

  // ---------------------------------------------------------------------------
  // Signaloperationen: Verstärken, Verschieben, Stauchen, Spiegeln
  // ---------------------------------------------------------------------------
  Labs.ops = function (host) {
    const SIG = {
      rect: { label: 'Rechteck', f: (t) => sig(t) - sig(t - 1) },
      ramp: { label: 'Rampe', f: (t) => ramp(t) * sig(2 - t) + (t > 2 ? 0 : 0) },
      exp: { label: '$\\sigma(t)e^{-t}$', f: (t) => sig(t) * Math.exp(-t) },
      cos: { label: 'Kosinus', f: (t) => Math.cos(Math.PI * t) }
    };
    let cur = 'rect';
    let A = 1;
    let a = 1;
    let t0 = 0;
    let mirror = false;
    const fig = figure();
    const out = readout();
    const draw = () => {
      const s = SIG[cur].f;
      const aa = mirror ? -a : a;
      const f = (t) => A * s(aa * (t - t0));
      fig.innerHTML = plotSVG({ x: [-5, 5], y: [-2.4, 2.4], xl: 't', yt: [-2, -1, 1, 2], curves: [{ f: s, c: 'm', d: '5 4', w: 1.6 }, { f, c: 'p' }], alt: 'Original gestrichelt, verändertes Signal durchgezogen' });
      const inner = (mirror ? '-' : '') + (a === 1 ? '' : n(a)) + (t0 === 0 ? 't' : '(t' + (t0 > 0 ? '-' + n(t0) : '+' + n(-t0)) + ')');
      out.innerHTML = md('$y(t)=' + (A === 1 ? '' : A === -1 ? '-' : n(A) + '\\cdot ') + 's\\big(' + inner + '\\big)$');
    };
    host.append(box('Signaloperationen zum Anfassen', chooser(Object.keys(SIG).map((id) => ({ id, label: SIG[id].label })), cur, (id) => { cur = id; draw(); }), fig, out,
      h('div', { class: 'ctl' },
        slider('Amplitude $A$', -2, 2, 0.1, A, (v) => { A = v; draw(); }),
        slider('Verschiebung $t_0$', -3, 3, 0.1, t0, (v) => { t0 = v; draw(); }),
        slider('Zeitskalierung $a$ (größer heißt schmaler)', 0.25, 3, 0.05, a, (v) => { a = v; draw(); })),
      h('div', { class: 'btns' }, h('button', { type: 'button', class: 'btn s line', onclick: () => { mirror = !mirror; draw(); } }, 'An der y-Achse spiegeln')),
      caption('Gestrichelt ist $s(t)$. Probiere $t_0=2$: Das Signal wandert nach **rechts**, obwohl im Argument $t-2$ ein Minus steht. Das ist der häufigste Denkfehler.')));
    draw();
  };

  // ---------------------------------------------------------------------------
  // Gerader und ungerader Anteil
  // ---------------------------------------------------------------------------
  Labs.evenodd = function (host) {
    const SIG = {
      a: { label: '$t^2-2t+1$', f: (t) => t * t - 2 * t + 1, y: [-4, 8] },
      b: { label: '$\\sigma(t)$', f: (t) => sig(t), y: [-1.2, 1.4] },
      c: { label: '$\\sigma(t)e^{-t}$', f: (t) => sig(t) * Math.exp(-t), y: [-1.2, 1.4] },
      d: { label: '$e^{t}$', f: (t) => Math.exp(t), y: [-4, 8] }
    };
    let cur = 'a';
    const fig = figure();
    const draw = () => {
      const s = SIG[cur];
      fig.innerHTML = plotSVG({ x: [-3, 3], y: s.y, xl: 't', curves: [
        { f: s.f, c: 'm', d: '5 4', w: 1.6 },
        { f: (t) => (s.f(t) + s.f(-t)) / 2, c: 'p' },
        { f: (t) => (s.f(t) - s.f(-t)) / 2, c: 'w' }] });
    };
    host.append(box('Jedes Signal zerfällt in gerade + ungerade', chooser(Object.keys(SIG).map((id) => ({ id, label: SIG[id].label })), cur, (id) => { cur = id; draw(); }), fig,
      plotLegend([{ c: 'm', label: '$s(t)$' }, { c: 'p', label: '$s_e(t)$, spiegelbildlich zur y-Achse' }, { c: 'w', label: '$s_o(t)$, punktsymmetrisch zum Ursprung' }]),
      caption('Addierst du die blaue und die orange Kurve, entsteht wieder die gestrichelte.')));
    draw();
  };

  // ---------------------------------------------------------------------------
  // Energie oder Leistung
  // ---------------------------------------------------------------------------
  Labs.energy = function (host) {
    const SIG = {
      rect: { label: 'Rechteck', f: (t) => sig(t + 1) - sig(t - 1), verdict: 'Die Energie bleibt bei $2$, die mittlere Leistung geht gegen $0$. Also **Energiesignal**.' },
      exp: { label: '$\\sigma(t)e^{-t}$', f: (t) => sig(t) * Math.exp(-t), verdict: 'Die Energie nähert sich $\\tfrac12$, die mittlere Leistung geht gegen $0$. Also **Energiesignal**.' },
      cos: { label: '$\\cos(t)$', f: (t) => Math.cos(t), verdict: 'Die Energie wächst ohne Ende, die mittlere Leistung pendelt sich bei $\\tfrac12$ ein. Also **Leistungssignal**.' },
      step: { label: '$\\sigma(t)$', f: (t) => sig(t), verdict: 'Die Energie wächst ohne Ende, die mittlere Leistung geht gegen $\\tfrac12$. Also **Leistungssignal**.' },
      ramp: { label: '$\\varrho(t)$', f: (t) => ramp(t), verdict: 'Energie und mittlere Leistung wachsen beide ohne Ende. Also **weder noch**: nicht klassifizierbar.' }
    };
    let cur = 'rect';
    let TB = 4;
    const fig = figure();
    const out = readout();
    const draw = () => {
      const s = SIG[cur];
      const half = TB / 2;
      const E = integrate((t) => s.f(t) * s.f(t), -half, half, 6000);
      const show = Math.min(half, 6) + 1;
      fig.innerHTML = plotSVG({ x: [-show, show], y: [-0.3, cur === 'ramp' ? 9 : 1.4], xl: 't', yl: 's²(t)', bands: [{ a: -half, b: half, c: 'g', o: 0.1 }],
        curves: [{ f: (t) => (Math.abs(t) <= half ? s.f(t) * s.f(t) : NaN), c: 'p', fill: true, fo: 0.25 }, { f: (t) => s.f(t) * s.f(t), c: 'm', d: '4 3', w: 1.2 }] });
      out.innerHTML = md('Fläche unter $s^2$ im Fenster: $E=' + n(E, 3) + '$. Geteilt durch die Fensterbreite: $P_\\varnothing=' + n(E / TB, 3) + '$.' + (TB >= 150 ? '\n' + s.verdict : ''));
    };
    host.append(box('Beobachtungsfenster vergrößern', chooser(Object.keys(SIG).map((id) => ({ id, label: SIG[id].label })), cur, (id) => { cur = id; draw(); }), fig, out,
      h('div', { class: 'ctl' }, slider('Fensterbreite $T_B$ (ganz nach rechts schieben)', 1, 200, 1, TB, (v) => { TB = v; draw(); })),
      caption('Die Klassifizierung fragt: Was passiert, wenn das Fenster unendlich groß wird? Bleibt die **Fläche** endlich, ist es ein Energiesignal. Bleibt nur die **Fläche pro Zeit** endlich, ist es ein Leistungssignal.')));
    draw();
  };

  // ---------------------------------------------------------------------------
  // Dirac als Grenzwert, Siebeigenschaft
  // ---------------------------------------------------------------------------
  Labs.delta = function (host) {
    const f = (t) => 1 + Math.cos(t);
    let w = 1.5;
    let t0 = 1;
    const fig = figure();
    const out = readout();
    const draw = () => {
      const pulse = (t) => (Math.abs(t - t0) <= w / 2 ? 1 / w : 0);
      const area = integrate((t) => f(t) * pulse(t), t0 - w / 2, t0 + w / 2, 400);
      fig.innerHTML = plotSVG({ x: [-3.2, 3.2], y: [-0.3, 4.4], xl: 't', yt: [1, 2, 3, 4],
        curves: [{ f: (t) => f(t) * pulse(t), c: 'g', fill: true, line: false }, { f, c: 'p' }, { f: pulse, c: 'b' }],
        points: [{ x: t0, y: f(t0), c: 'p' }] });
      out.innerHTML = md('Fläche des Rechtecks: $' + n(w, 2) + '\\cdot\\frac{1}{' + n(w, 2) + '}=1$.\n$\\int f(t)\\,p(t)\\,dt=' + n(area, 3) + '$ und $f(t_0)=' + n(f(t0), 3) + '$.');
    };
    host.append(box('Aus dem Rechteck wird der Dirac-Impuls', fig, plotLegend([{ c: 'p', label: '$f(t)=1+\\cos t$' }, { c: 'b', label: 'schmales Rechteck $p(t)$ mit Fläche 1' }, { c: 'g', label: 'Produkt $f\\cdot p$' }]), out,
      h('div', { class: 'ctl' },
        slider('Breite des Rechtecks', 0.25, 3, 0.05, w, (v) => { w = v; draw(); }),
        slider('Ort $t_0$', -2, 2, 0.1, t0, (v) => { t0 = v; draw(); })),
      caption('Mach das Rechteck schmal: Es wird höher, die Fläche bleibt 1. Dann ist $f$ unter dem Rechteck fast konstant, und das Integral liefert genau $f(t_0)$. Das ist die **Siebeigenschaft**.')));
    draw();
  };

  // ---------------------------------------------------------------------------
  // Faltung animiert
  // ---------------------------------------------------------------------------
  Labs.conv = function (host, params) {
    const PRE = {
      rr: { label: 'Rechteck mit Rechteck', x: (t) => sig(t) - sig(t - 1), g: (t) => sig(t) - sig(t - 1), ty: [-0.2, 1.3] },
      re: { label: 'Rechteck am RC-Glied', x: (t) => sig(t) - sig(t - 2), g: (t) => sig(t) * Math.exp(-t), ty: [-0.2, 1.3] },
      se: { label: 'Sprung am RC-Glied', x: (t) => sig(t), g: (t) => sig(t) * Math.exp(-t), ty: [-0.2, 1.3] },
      ee: { label: 'Zwei e-Funktionen', x: (t) => sig(t) * Math.exp(-t), g: (t) => sig(t) * Math.exp(-2 * t), ty: [-0.2, 1.3] },
      ma: { label: 'Rechteck, verzögert', x: (t) => sig(t), g: (t) => 2 * (sig(t - 1) - sig(t - 2)), ty: [-0.2, 2.4] }
    };
    let cur = (params && params.preset) || 'rr';
    let t = -1;
    let table = null;
    const A = -3;
    const B = 7;
    const dt = 0.02;
    const figTop = figure();
    const figBottom = figure();
    const out = readout();
    const compute = () => {
      const p = PRE[cur];
      const N = Math.round((B - A) / dt);
      table = new Float64Array(N + 1);
      for (let i = 0; i <= N; i++) {
        const ti = A + i * dt;
        let sum = 0;
        for (let j = 0; j <= N; j++) {
          const tau = A + (j + 0.5) * dt;
          sum += p.x(tau) * p.g(ti - tau);
        }
        table[i] = sum * dt;
      }
    };
    const yAt = (ti) => {
      const i = Math.round((ti - A) / dt);
      return i < 0 || i >= table.length ? NaN : table[i];
    };
    const draw = () => {
      const p = PRE[cur];
      figTop.innerHTML = plotSVG({ x: [A, B], y: p.ty, xl: 'τ', xn: 10, vlines: [{ x: t, l: 't' }],
        curves: [{ f: (tau) => p.x(tau) * p.g(t - tau), c: 'g', fill: true, line: false, fo: 0.35 }, { f: p.x, c: 'p' }, { f: (tau) => p.g(t - tau), c: 'w' }], h: 170 });
      const top = Math.max(...table) * 1.2 || 1;
      figBottom.innerHTML = plotSVG({ x: [A, B], y: [-0.12 * top, top], xl: 't', yl: 'y(t)', xn: 10, h: 140,
        curves: [{ f: yAt, c: 'g', w: 1.6, o: 0.5 }, { f: yAt, c: 'g', to: t, w: 2.8 }], points: [{ x: t, y: yAt(t), c: 'g' }] });
      const v = yAt(t);
      const overlap = Math.abs(v) > 1e-3;
      out.innerHTML = md('$t=' + n(t, 2) + '$: ' + (overlap ? 'Die grüne Fläche ist $y(t)=' + n(v, 3) + '$.' : 'Kein Überlapp von $x(\\tau)$ und $g(t-\\tau)$, also $y(t)=0$.'));
    };
    const slide = slider('Zeitpunkt $t$', A, B, 0.02, t, (v) => { t = v; stop(); draw(); });
    let timer = null;
    const stop = () => { if (timer) clearInterval(timer); timer = null; play.replaceChildren(icon('play')); };
    const play = h('button', { type: 'button', class: 'btn s pri', 'aria-label': 'Abspielen', onclick: () => {
      if (timer) return stop();
      if (t >= B - 0.2) t = A;
      play.replaceChildren(icon('pause'));
      timer = setInterval(() => {
        if (!play.isConnected) return stop();
        t = Math.min(B, +(t + 0.06).toFixed(2));
        slide.set(t);
        draw();
        if (t >= B) stop();
      }, 40);
    } }, icon('play'));
    play.firstChild.style.cssText = 'width:18px;height:18px';
    compute();
    host.append(box('Faltung: spiegeln, schieben, Fläche messen', chooser(Object.keys(PRE).map((id) => ({ id, label: PRE[id].label })), cur, (id) => { cur = id; stop(); compute(); draw(); }),
      figTop, plotLegend([{ c: 'p', label: '$x(\\tau)$ steht still' }, { c: 'w', label: '$g(t-\\tau)$ ist gespiegelt und läuft mit $t$' }, { c: 'g', label: 'Produkt, seine Fläche ist $y(t)$' }]),
      figBottom, out, h('div', { class: 'ctl' }, slide), h('div', { class: 'btns' }, play)));
    draw();
  };

  // ---------------------------------------------------------------------------
  // Faltungssumme
  // ---------------------------------------------------------------------------
  Labs.convsum = function (host) {
    const PRE = {
      a: { label: '$[1,2,3]$ mit $[1,1]$', x: [1, 2, 3], g: [1, 1] },
      b: { label: '$[1,1,1]$ mit $[1,1,1]$', x: [1, 1, 1], g: [1, 1, 1] },
      c: { label: '$[2,-1,1]$ mit $[1,0,2]$', x: [2, -1, 1], g: [1, 0, 2] }
    };
    let cur = 'a';
    let k = 0;
    const host2 = h('div', { class: 'stack-s' });
    const conv = (x, g) => {
      const y = new Array(x.length + g.length - 1).fill(0);
      x.forEach((xv, i) => g.forEach((gv, j) => { y[i + j] += xv * gv; }));
      return y;
    };
    let slide = null;
    const draw = () => {
      const { x, g } = PRE[cur];
      const y = conv(x, g);
      const maxK = y.length - 1;
      k = Math.min(k, maxK);
      const top = Math.max(...y.map(Math.abs), 1);
      const rows = [];
      const ls = x.map((_, l) => l);
      const parts = [];
      ls.forEach((l) => {
        const gv = k - l >= 0 && k - l < g.length ? g[k - l] : 0;
        parts.push({ l, xv: x[l], gv, p: x[l] * gv });
      });
      rows.push(h('tr', null, h('th', { html: md('$l$') }), parts.map((p) => h('td', null, String(p.l)))));
      rows.push(h('tr', null, h('th', { html: md('$x(l)$') }), parts.map((p) => h('td', null, String(p.xv)))));
      rows.push(h('tr', null, h('th', { html: md('$g(k-l)$') }), parts.map((p) => h('td', null, String(p.gv)))));
      rows.push(h('tr', null, h('th', null, 'Produkt'), parts.map((p) => h('td', { class: p.p ? 'hit' : undefined }, String(p.p)))));
      host2.replaceChildren(
        h('div', { html: plotSVG({ x: [-0.5, maxK + 0.5], y: [Math.min(0, ...y) * 1.2 - 0.2, top * 1.25], xl: 'k', xt: y.map((_, i) => i).filter((i) => i), stems: [{ k: y.map((_, i) => i), v: y, c: 'g', hl: k }], h: 150 }) }),
        h('div', { style: 'overflow-x:auto' }, h('table', { class: 'seq-table' }, rows)),
        h('div', { class: 'readout', html: md('$y(' + k + ')=' + parts.map((p) => (p.xv < 0 ? '(' + p.xv + ')' : p.xv) + '\\cdot ' + (p.gv < 0 ? '(' + p.gv + ')' : p.gv)).join('+') + '=' + y[k] + '$') }));
      if (slide && slide.isConnected) {
        slide.querySelector('input').max = maxK;
      }
    };
    slide = slider('Index $k$', 0, 4, 1, 0, (v) => { k = v; draw(); }, (v) => String(v));
    host.append(box('Faltungssumme von Hand', chooser(Object.keys(PRE).map((id) => ({ id, label: PRE[id].label })), cur, (id) => { cur = id; k = 0; slide.set(0); draw(); }), host2, h('div', { class: 'ctl' }, slide),
      caption('Für jedes $k$: Folge $g$ umdrehen, um $k$ schieben, stellenweise multiplizieren, alles addieren.')));
    draw();
    slide.querySelector('input').max = PRE[cur].x.length + PRE[cur].g.length - 2;
  };

  // ---------------------------------------------------------------------------
  // Fourier-Synthese
  // ---------------------------------------------------------------------------
  Labs.fourier = function (host) {
    const P = Math.PI;
    const wrap = (t) => {
      let u = (t + P) % (2 * P);
      if (u < 0) u += 2 * P;
      return u - P;
    };
    const PRE = {
      rect: { label: 'Rechteck', f: (t) => (wrap(t) >= 0 ? 1 : -1), a0: 0, a: () => 0, b: (k) => (k % 2 ? 4 / (P * k) : 0), y: [-1.6, 1.6], txt: '$b_k=\\frac{2}{\\pi k}\\,(1-(-1)^k)$, nur ungerade $k$. Ungerade Funktion: nur Sinus.' },
      saw: { label: 'Sägezahn', f: (t) => wrap(t) / P, a0: 0, a: () => 0, b: (k) => (2 * (k % 2 ? 1 : -1)) / (P * k), y: [-1.6, 1.6], txt: '$b_k=\\frac{2}{\\pi k}(-1)^{k+1}$. Ungerade Funktion: nur Sinus.' },
      tri: { label: 'Dreieck', f: (t) => Math.abs(wrap(t)), a0: P, a: (k) => (k % 2 ? -4 / (P * k * k) : 0), b: () => 0, y: [-0.5, 3.8], txt: '$a_k=-\\frac{4}{\\pi k^2}$ für ungerade $k$. Gerade Funktion: nur Kosinus. Knicke brauchen weniger Oberwellen als Sprünge.' }
    };
    let cur = 'rect';
    let N = 3;
    const fig = figure();
    const spec = figure();
    const out = readout();
    const draw = () => {
      const p = PRE[cur];
      const sum = (t) => {
        let s = p.a0 / 2;
        for (let k = 1; k <= N; k++) s += p.a(k) * Math.cos(k * t) + p.b(k) * Math.sin(k * t);
        return s;
      };
      fig.innerHTML = plotSVG({ x: [-2 * P, 2 * P], y: p.y, xl: 't', xt: [[-2 * P, '−2π'], [-P, '−π'], [P, 'π'], [2 * P, '2π']], curves: [{ f: p.f, c: 'm', d: '4 3', w: 1.4 }, { f: sum, c: 'p', n: 700 }] });
      const K = [];
      const V = [];
      for (let k = -N; k <= N; k++) {
        K.push(k);
        V.push(k === 0 ? Math.abs(p.a0 / 2) : Math.hypot(p.a(Math.abs(k)), p.b(Math.abs(k))) / 2);
      }
      spec.innerHTML = plotSVG({ x: [-N - 0.6, N + 0.6], y: [-0.08 * Math.max(...V, 0.1), Math.max(...V, 0.1) * 1.25], xl: 'k', yl: '|c_k|', xt: K.filter((k) => k && (N < 8 || k % 3 === 0)), stems: [{ k: K, v: V, c: 'v' }], h: 130 });
      out.innerHTML = md(p.txt);
    };
    host.append(box('Aus Schwingungen wird ein Signal', chooser(Object.keys(PRE).map((id) => ({ id, label: PRE[id].label })), cur, (id) => { cur = id; draw(); }), fig, spec, out,
      h('div', { class: 'ctl' }, slider('Anzahl der Harmonischen $N$', 0, 25, 1, N, (v) => { N = v; draw(); }, (v) => String(v))),
      caption('Mit wachsendem $N$ schmiegt sich die Summe an das Signal an. An Sprüngen bleibt ein kleines Überschwingen stehen.')));
    draw();
  };

  // ---------------------------------------------------------------------------
  // Spektrum aus Koeffizienten
  // ---------------------------------------------------------------------------
  Labs.spectrum = function (host) {
    let a0 = 1;
    let a1 = 2;
    let b2 = 1;
    const fig = figure();
    const spec = figure();
    const out = readout();
    const draw = () => {
      const f = (t) => a0 + a1 * Math.cos(t) + b2 * Math.sin(2 * t);
      const lim = Math.abs(a0) + Math.abs(a1) + Math.abs(b2) + 0.4;
      fig.innerHTML = plotSVG({ x: [-Math.PI * 2, Math.PI * 2], y: [-lim, lim], xl: 't', xt: [[-2 * Math.PI, '−2π'], [2 * Math.PI, '2π']], curves: [{ f, c: 'p' }] });
      const K = [-2, -1, 0, 1, 2];
      const V = [Math.abs(b2) / 2, Math.abs(a1) / 2, Math.abs(a0), Math.abs(a1) / 2, Math.abs(b2) / 2];
      spec.innerHTML = plotSVG({ x: [-2.7, 2.7], y: [-0.2, Math.max(...V, 0.5) * 1.3], xl: 'kω₀', yl: '|c_k|', xt: [-2, -1, 1, 2], yn: 2, stems: [{ k: K, v: V, c: 'v' }], h: 130 });
      const im = (v) => (v === 0 ? '0' : (v > 0 ? '' : '-') + 'j\\,' + n(Math.abs(v)));
      out.innerHTML = md('$c_0=' + n(a0) + '$,  $c_{\\pm1}=' + n(a1 / 2) + '$,  $c_2=' + im(-b2 / 2) + '$,  $c_{-2}=' + im(b2 / 2) + '$');
    };
    host.append(box('Koeffizienten direkt ablesen', h('div', { class: 'formula', html: md('$$f(t)=A_0+A_1\\cos(t)+B_2\\sin(2t)$$') }), fig, spec, out,
      h('div', { class: 'ctl' },
        slider('Gleichanteil $A_0$', -2, 2, 0.1, a0, (v) => { a0 = v; draw(); }),
        slider('Kosinus-Amplitude $A_1$', -3, 3, 0.1, a1, (v) => { a1 = v; draw(); }),
        slider('Sinus-Amplitude $B_2$', -3, 3, 0.1, b2, (v) => { b2 = v; draw(); })),
      caption('Der Kosinus liefert zwei reelle Linien, der Sinus zwei imaginäre. Die Höhe jeder Linie ist die **halbe** Amplitude. Nur der Gleichanteil bleibt ganz.')));
    draw();
  };

  // ---------------------------------------------------------------------------
  // Fourier-Transformation: Zeit und Frequenz
  // ---------------------------------------------------------------------------
  Labs.ft = function (host) {
    const PRE = {
      rect: { label: 'Rechteck', par: '$T$ (halbe Breite)', f: (t, a) => sig(t + a) - sig(t - a), F: (w, a) => (Math.abs(w) < 1e-9 ? 2 * a : (2 * Math.sin(w * a)) / w), tex: (a) => 'F(\\omega)=\\frac{2\\sin(' + n(a) + '\\,\\omega)}{\\omega}', top: () => 6.4, bot: () => -1.6, mag: false },
      exp: { label: '$\\sigma(t)e^{-at}$', par: '$a$', f: (t, a) => sig(t) * Math.exp(-a * t), F: (w, a) => 1 / Math.hypot(a, w), tex: (a) => '|F(\\omega)|=\\frac{1}{\\sqrt{' + n(a * a) + '+\\omega^2}}', top: (a) => 1.25 / a, bot: () => 0, mag: true },
      two: { label: '$e^{-a|t|}$', par: '$a$', f: (t, a) => Math.exp(-a * Math.abs(t)), F: (w, a) => (2 * a) / (a * a + w * w), tex: (a) => 'F(\\omega)=\\frac{' + n(2 * a) + '}{' + n(a * a) + '+\\omega^2}', top: (a) => 2.5 / a, bot: () => 0, mag: false },
      gauss: { label: 'Gauß', par: '$a$', f: (t, a) => Math.exp(-a * t * t), F: (w, a) => Math.sqrt(Math.PI / a) * Math.exp((-w * w) / (4 * a)), tex: (a) => 'F(\\omega)=\\sqrt{\\pi/' + n(a) + '}\\;e^{-\\omega^2/' + n(4 * a) + '}', top: (a) => 1.25 * Math.sqrt(Math.PI / a), bot: () => 0, mag: false }
    };
    let cur = 'rect';
    let a = 1;
    const figT = figure();
    const figF = figure();
    const out = readout();
    const draw = () => {
      const p = PRE[cur];
      figT.innerHTML = plotSVG({ x: [-4, 4], y: [-0.2, 1.3], xl: 't', yl: 'f(t)', yt: [1], curves: [{ f: (t) => p.f(t, a), c: 'p' }], h: 130 });
      const top = p.top(a);
      figF.innerHTML = plotSVG({ x: [-12, 12], y: [p.bot(a) || -0.08 * top, top], xl: 'ω', yl: p.mag ? '|F(ω)|' : 'F(ω)', yn: 2, curves: [{ f: (w) => p.F(w, a), c: 'v', n: 700 }], h: 150 });
      out.innerHTML = md('$' + p.tex(a) + '$');
    };
    let sl = slider(PRE[cur].par, 0.25, 3, 0.05, a, (v) => { a = v; draw(); });
    host.append(box('Schmal in der Zeit heißt breit in der Frequenz', chooser(Object.keys(PRE).map((id) => ({ id, label: PRE[id].label })), cur, (id) => { cur = id; draw(); }), figT, figF, out,
      h('div', { class: 'ctl' }, sl),
      caption('Beim Rechteck macht großes $T$ das Signal breit und das Spektrum schmal. Bei $e^{-at}$ und Gauß ist es umgekehrt: Großes $a$ macht das Signal schmal und das Spektrum breit. Das ist die **Unschärferelation**.')));
    draw();
  };

  // ---------------------------------------------------------------------------
  // System prüfen
  // ---------------------------------------------------------------------------
  Labs.lti = function (host) {
    const SYS = {
      gain: { label: '$2x(t)$', T: (x) => (t) => 2 * x(t) },
      off: { label: '$x(t)+1$', T: (x) => (t) => x(t) + 1 },
      sq: { label: '$x^2(t)$', T: (x) => (t) => x(t) * x(t) },
      tx: { label: '$t\\cdot x(t)$', T: (x) => (t) => t * x(t) },
      sinx: { label: '$\\sin(t)\\,x(t)$', T: (x) => (t) => Math.sin(t) * x(t) },
      del: { label: '$x(t-1)$', T: (x) => (t) => x(t - 1) },
      sub: { label: '$x(t)-x(t-1)$', T: (x) => (t) => x(t) - x(t - 1) },
      tw: { label: '$x(2t)$', T: (x) => (t) => x(2 * t) },
      exp: { label: '$e^{t/2}x(t)$', T: (x) => (t) => Math.exp(t / 2) * x(t) }
    };
    const x1 = (t) => sig(t) - sig(t - 1.5);
    const x2 = (t) => (sig(t + 1) - sig(t - 1)) * (1 - Math.abs(t));
    let cur = 'gain';
    let test = 'lin';
    let t0 = 1;
    const fig = figure();
    const out = readout();
    const draw = () => {
      const T = SYS[cur].T;
      let A;
      let B;
      let names;
      if (test === 'lin') {
        A = T((t) => x1(t) + 2 * x2(t));
        const y1 = T(x1);
        const y2 = T(x2);
        B = (t) => y1(t) + 2 * y2(t);
        names = ['$T\\{x_1+2x_2\\}$ (erst mischen, dann System)', '$T\\{x_1\\}+2\\,T\\{x_2\\}$ (erst System, dann mischen)'];
      } else {
        A = T((t) => x1(t - t0));
        const y = T(x1);
        B = (t) => y(t - t0);
        names = ['$T\\{x(t-t_0)\\}$ (erst schieben, dann System)', '$y(t-t_0)$ (erst System, dann schieben)'];
      }
      let diff = 0;
      for (let t = -4; t <= 5; t += 0.013) diff = Math.max(diff, Math.abs(A(t) - B(t)));
      fig.innerHTML = plotSVG({ x: [-4, 5], y: [-3.4, 4.4], xl: 't', curves: [{ f: A, c: 'p', w: 3.4, o: 0.75 }, { f: B, c: 'w', d: '5 4', w: 2 }] });
      const same = diff < 1e-6;
      out.className = 'readout ' + (same ? 'ok' : 'bad');
      out.innerHTML = md((same ? 'Beide Kurven sind **gleich**. Der Test ist für dieses Eingangssignal bestanden.' : 'Die Kurven **weichen voneinander ab**. Das System ist ' + (test === 'lin' ? 'nicht linear.' : 'zeitvariant.')));
      leg.replaceChildren(plotLegend([{ c: 'p', label: names[0] }, { c: 'w', label: names[1] }]));
    };
    const leg = h('div');
    host.append(box('Ist das System linear und zeitinvariant?', chooser(Object.keys(SYS).map((id) => ({ id, label: SYS[id].label })), cur, (id) => { cur = id; draw(); }),
      segmented([{ id: 'lin', label: 'Linearität' }, { id: 'ti', label: 'Zeitinvarianz' }], test, (id) => { test = id; draw(); }), fig, leg, out,
      h('div', { class: 'ctl' }, slider('Verschiebung $t_0$', 0.2, 3, 0.1, t0, (v) => { t0 = v; if (test === 'ti') draw(); })),
      caption('Ein bestandener Test mit einem einzigen Signal ist noch kein Beweis, ein nicht bestandener aber schon ein Gegenbeweis. In der Klausur rechnest du deshalb allgemein.')));
    draw();
  };
})();
