// Rechenkern und Aufgabengeneratoren. Jeder Generator entspricht einem Aufgabentyp der Übungsblätter
// und erzeugt neue Zahlen samt Lösungsweg. Läuft auch in Node, damit tools/test.js alles nachrechnen kann.
(function (root) {
  'use strict';

  const R = String.raw;
  const PI = Math.PI;

  // ---------------------------------------------------------------------------
  // Formeln, die tools/test.js gegen numerische Integration prüft
  // ---------------------------------------------------------------------------
  const sig = (t) => (t >= 0 ? 1 : 0);
  const ramp = (t) => (t >= 0 ? t : 0);
  const Sig = {
    sig,
    ramp,
    // σ(t)e^{-at} * σ(t)e^{-bt}
    convExpExp: (a, b, t) => (t < 0 ? 0 : a === b ? t * Math.exp(-a * t) : (Math.exp(-b * t) - Math.exp(-a * t)) / (a - b)),
    // σ(t-ta) * σ(t)e^{-bt}
    convStepExp: (b, ta, t) => (t < ta ? 0 : (1 - Math.exp(-b * (t - ta))) / b),
    // σ(t)e^{-at} * σ(t)sin(wt)
    convExpSin: (a, w, t) => (t < 0 ? 0 : (w * Math.exp(-a * t) + a * Math.sin(w * t) - w * Math.cos(w * t)) / (a * a + w * w)),
    // A·rect[0,T1] * B·rect[0,T2]
    convRect: (A, T1, B, T2, t) => {
      const lo = Math.min(T1, T2);
      const hi = Math.max(T1, T2);
      const f = t <= 0 || t >= T1 + T2 ? 0 : t < lo ? t : t <= hi ? lo : T1 + T2 - t;
      return A * B * f;
    },
    // k(σ(t-ta)-σ(t-tb)) * cos²(wt)
    convWindowCos2: (k, ta, tb, w, t) => k * ((tb - ta) / 2 + (Math.sin(2 * w * (t - ta)) - Math.sin(2 * w * (t - tb))) / (4 * w)),
    // k(σ(t-ta)-σ(t-tb)) * cos(wt)
    convWindowCos: (k, ta, tb, w, t) => (k * (Math.sin(w * (t - ta)) - Math.sin(w * (t - tb)))) / w,
    // Ausgang der Faltungssumme zweier endlicher Folgen
    convSeq: (x, g) => {
      const y = new Array(x.length + g.length - 1).fill(0);
      x.forEach((xv, i) => g.forEach((gv, j) => { y[i + j] += xv * gv; }));
      return y;
    },
    // Fourier-Transformierte des Rechtecks A(σ(t+T)-σ(t-T))
    ftRect: (A, T, w) => (Math.abs(w) < 1e-12 ? 2 * A * T : (2 * A * Math.sin(w * T)) / w),
    // Imaginärteil der Transformierten von (A/a)t auf [-a,a]
    ftLineIm: (A, a, w) => ((2 * A) / (w * w * a)) * (w * a * Math.cos(w * a) - Math.sin(w * a)),
    // Transformierte von 1/(a²+t²)
    ftLorentz: (a, w) => (PI / a) * Math.exp(-a * Math.abs(w)),
    // c_k des Rechteckpulses A auf [-tau/2, tau/2] mit Periode T
    fsPulse: (A, tau, T, k) => (k === 0 ? (A * tau) / T : (A * Math.sin((k * PI * tau) / T)) / (k * PI)),
    // b_k der Rechteckschwingung +A / -A
    fsSquareB: (A, k) => ((2 * A) / (PI * k)) * (1 - Math.pow(-1, k)),
    // Imaginärteil von c_k der Rampe b·t auf [0,T)
    fsSawIm: (b, T, k) => (b * T) / (2 * PI * k)
  };

  // ---------------------------------------------------------------------------
  // Zufall und Formatierung
  // ---------------------------------------------------------------------------
  let rnd = Math.random;
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const shuffle = (a) => {
    const c = a.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };
  const round = (x, d) => +x.toFixed(d === undefined ? 4 : d);
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  const dec = (x, d) => {
    const v = round(x, d === undefined ? 3 : d);
    return String(v).replace('.', '{,}');
  };
  function frac(p, q) {
    q = q === undefined ? 1 : q;
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q);
    p /= g;
    q /= g;
    if (q === 1) return String(p);
    return (p < 0 ? '-' : '') + R`\frac{${Math.abs(p)}}{${q}}`;
  }
  // p·π/q als TeX
  function piT(p, q) {
    q = q === undefined ? 1 : q;
    if (p === 0) return '0';
    const g = gcd(p, q);
    p /= g;
    q /= g;
    const top = (Math.abs(p) === 1 ? '' : Math.abs(p)) + R`\pi`;
    return (p < 0 ? '-' : '') + (q === 1 ? top : R`\frac{${top}}{${q}}`);
  }
  // Faktor vor einem Symbol: 1 fällt weg, -1 wird zu -
  const co = (c, sym) => (c === 1 ? sym : c === -1 ? '-' + sym : dec(c) + sym);
  // Summand mit Vorzeichen: +3t, -t
  const plus = (c, sym) => (c < 0 ? '-' : '+') + (Math.abs(c) === 1 && sym ? sym : dec(Math.abs(c)) + (sym || ''));
  function poly(terms, v) {
    const name = v || 't';
    const parts = terms.filter((t) => t[0] !== 0).sort((a, b) => b[1] - a[1]);
    if (!parts.length) return '0';
    return parts.map(([c, p], i) => {
      const sym = p === 0 ? '' : p === 1 ? name : name + '^{' + p + '}';
      const s = plus(c, sym);
      return i === 0 && c > 0 ? s.slice(1) : s;
    }).join('');
  }
  const shiftT = (a, v) => (a === 0 ? (v || 't') : (v || 't') + (a < 0 ? '+' + dec(-a) : '-' + dec(a))); // t-a

  // Einfachauswahl: richtige Antwort steht intern vorn, die Anzeige mischt.
  function choices(right, wrong) {
    const seen = new Set([right]);
    const o = [right];
    for (const w of wrong) {
      if (!seen.has(w)) {
        seen.add(w);
        o.push(w);
      }
    }
    return { o, a: [0] };
  }
  const P = {
    mc: (q, right, wrong, e, extra) => Object.assign({ k: 'mc', q, e }, choices(right, wrong), extra),
    fix: (q, opts, right, e) => ({ k: 'mc', q, o: opts, a: [right], keep: true, e }),
    num: (q, value, e, tol, extra) => Object.assign({ k: 'num', q, num: round(value), tol: tol === undefined ? 0.011 : tol, e }, extra),
    info: (x) => ({ k: 'info', x })
  };

  const gens = [];
  const gen = (id, title, group, formula, ref, lvl, pts, make) => gens.push({ id, title, group, formula, ref, lvl, pts, make });
  const asQ = (id, ref, lvl, pts, q) => Object.assign({ id, ref, lvl, pts, src: 'trainer' }, q);
  const G1 = 'Blatt 1: Signale';
  const G2 = 'Blatt 2: Sprung, Rampe, Dirac';
  const G3 = 'Blatt 3: Systeme';
  const G5 = 'Blatt 5: Faltung';
  const G6 = 'Blatt 6: Fourier-Reihen';
  const G7 = 'Blatt 7: Fourier-Transformation';

  // ===========================================================================
  // Blatt 1
  // ===========================================================================
  gen('g.sinadd', 'Zwei Sinusschwingungen addieren', G1, R`$\sin\alpha+\sin\beta=2\sin\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}$`, 'Blatt 1-1, Anhang S. 1', 2, 3, () => {
    let p1;
    let p2;
    do {
      p1 = int(-6, 6);
      p2 = int(-6, 6);
    } while (p1 === p2 || Math.abs(p1 - p2) > 6);
    const w = pick([1, 2, 3, 5]);
    const wt = w === 1 ? R`\omega t` : w + R`\omega t`;
    const add = (p) => (p === 0 ? '' : (p > 0 ? '+' : '-') + piT(Math.abs(p), 6));
    const amp = 2 * Math.cos(((p1 - p2) * PI) / 12);
    const mid = p1 + p2;
    return asQ('g.sinadd', 'Blatt 1-1', 2, 3, {
      k: 'walk',
      q: R`Gegeben: $s(t)=\sin(${wt}${add(p1)})+\sin(${wt}${add(p2)})$. Fasse zu einer einzigen Schwingung zusammen.`,
      parts: [
        P.mc('Welche Formel aus dem Anhang hilft hier?', R`$\sin\alpha+\sin\beta=2\sin\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}$`, [R`$\sin\alpha+\sin\beta=\sin(\alpha+\beta)$`, R`$\sin\alpha+\sin\beta=2\cos\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}$`, R`$\sin\alpha+\sin\beta=2\sin\alpha\cos\beta$`],
          'Das ist das Additionstheorem aus dem Anhang. Es macht aus einer Summe ein Produkt.'),
        P.num(R`Im zweiten Faktor verschwindet $${wt}$. Welche Amplitude hat das Ergebnis? Rechne $2\cos\frac{\varphi_1-\varphi_2}{2}$ aus.`, amp,
          R`$\frac{\varphi_1-\varphi_2}{2}=${piT(p1 - p2, 12)}$, also $2\cos(${piT(p1 - p2, 12)})=${dec(amp)}$.` + (Math.abs(amp) < 1e-9 ? ' Die Schwingungen sind genau gegenphasig und löschen sich aus.' : '')),
        P.mc('Wie groß ist die Phase der Summe?', '$' + piT(mid, 12) + '$', ['$' + piT(p1 - p2, 12) + '$', '$' + piT(mid, 6) + '$', '$' + piT(p1 * p2 === 0 ? mid + 3 : p1 * p2, 12) + '$'],
          R`Die Phase ist der Mittelwert: $\frac{\varphi_1+\varphi_2}{2}=${piT(mid, 12)}$. Die Frequenz bleibt gleich.`)
      ]
    });
  });

  function energyFamily() {
    const A = int(1, 4);
    const a = pick([1, 2, 3, 4]);
    const T = int(1, 3);
    const w = pick([2, 3, 5]);
    const AA = A === 1 ? '' : String(A);
    return pick([
      () => ({ tex: R`${AA}(\sigma(t+${T})-\sigma(t-${T}))`, cls: 0, val: 2 * A * A * T, what: 'E', e: [R`Das Signal ist nur auf $[-${T},${T}]$ ungleich null, dort hat es den Wert ${A}.`, R`$E=\int_{-${T}}^{${T}}${A}^2\,dt=${A * A}\cdot ${2 * T}=${2 * A * A * T}$. Endlich, also Energiesignal.`] }),
      () => ({ tex: R`${AA}\,\sigma(t)e^{-${co(a, 't')}}`, cls: 0, val: (A * A) / (2 * a), what: 'E', e: [R`Quadrieren: $s^2(t)=${A * A}\,\sigma(t)e^{-${2 * a}t}$. Die Sprungfunktion schneidet alles links von $0$ ab.`, R`$E=${A * A}\int_0^{\infty}e^{-${2 * a}t}dt=\frac{${A * A}}{${2 * a}}=${dec((A * A) / (2 * a))}$. Endlich, also Energiesignal.`] }),
      () => ({ tex: R`${AA}\,e^{-${co(a, '|t|')}}`, cls: 0, val: (A * A) / a, what: 'E', e: [R`Das Signal ist gerade, also reicht die rechte Hälfte mal zwei.`, R`$E=2\cdot ${A * A}\int_0^{\infty}e^{-${2 * a}t}dt=\frac{${2 * A * A}}{${2 * a}}=${dec((A * A) / a)}$. Endlich, also Energiesignal.`] }),
      () => ({ tex: R`${AA}\cos(${w}t)`, cls: 1, val: (A * A) / 2, what: 'P', e: [R`Die Fläche unter $s^2$ wächst mit jeder Periode weiter, also $E\to\infty$.`, R`Der Mittelwert von $\cos^2$ ist $\frac12$, also $P_\varnothing=\frac{${A * A}}{2}=${dec((A * A) / 2)}$. Leistungssignal.`] }),
      () => ({ tex: R`${AA}\,\sigma(t)`, cls: 1, val: (A * A) / 2, what: 'P', e: [R`$E=\int_0^\infty ${A * A}\,dt\to\infty$.`, R`$P_\varnothing=\lim\frac{1}{T_B}\cdot ${A * A}\cdot\frac{T_B}{2}=${dec((A * A) / 2)}$. Nur die rechte Hälfte des Fensters zählt. Leistungssignal.`] }),
      () => ({ tex: String(A), cls: 1, val: A * A, what: 'P', e: [R`$s^2=${A * A}$ für alle Zeiten, also $E\to\infty$.`, R`$P_\varnothing=\lim\frac{1}{T_B}\cdot ${A * A}\cdot T_B=${A * A}$. Leistungssignal.`] }),
      () => ({ tex: R`${AA}\,\varrho(t)`, cls: 2, e: [R`$s^2(t)=${A * A}\,\sigma(t)t^2$ wächst unbegrenzt.`, R`$E\to\infty$, und auch $P_\varnothing=\lim\frac{1}{T_B}\cdot\frac{${A * A}}{3}\left(\frac{T_B}{2}\right)^3\to\infty$. Weder Energie- noch Leistungssignal.`] })
    ])();
  }
  gen('g.energy', 'Energie- oder Leistungssignal', G1, R`$E=\int s^2dt$, $\;P_\varnothing=\lim\frac{1}{T_B}\int s^2dt$`, 'Blatt 1-2, 1-3, Kap. 2 S. 8', 2, 3, () => {
    const f = energyFamily();
    const NAMES = ['Energiesignal', 'Leistungssignal', 'Weder noch'];
    const parts = [P.fix(R`Wie lässt sich $s(t)=${f.tex}$ klassifizieren?`, NAMES, f.cls, f.e[0])];
    if (f.cls === 2) parts.push(P.info(f.e[1]));
    else parts.push(P.num(f.cls === 0 ? R`Wie groß ist die Energie $E$?` : R`Wie groß ist die mittlere Leistung $P_\varnothing$?`, f.val, f.e[1]));
    return asQ('g.energy', 'Blatt 1-2, 1-3', 2, 3, { k: 'walk', q: R`Untersuche das Signal $s(t)=${f.tex}$.`, parts });
  });

  function randomPoly() {
    const evens = shuffle([0, 2, 4]).slice(0, 2);
    const odds = shuffle([1, 3, 5]).slice(0, int(1, 2));
    const nz = () => pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    return { even: evens.map((p) => [nz(), p]), odd: odds.map((p) => [nz(), p]) };
  }
  gen('g.evenodd', 'Geraden und ungeraden Anteil bestimmen', G1, R`$s_e=\frac{s(t)+s(-t)}{2}$, $\;s_o=\frac{s(t)-s(-t)}{2}$`, 'Blatt 1-4, Kap. 2 S. 12', 1, 3, () => {
    const { even, odd } = randomPoly();
    const all = even.concat(odd);
    const flip = odd.map(([c, p]) => [-c, p]);
    const sTex = poly(all);
    const mTex = poly(even.concat(flip));
    const eTex = poly(even);
    const oTex = poly(odd);
    return asQ('g.evenodd', 'Blatt 1-4', 1, 3, {
      k: 'walk',
      q: R`Zerlege $s(t)=${sTex}$ in geraden und ungeraden Anteil.`,
      parts: [
        P.mc(R`Setze $-t$ ein. Wie lautet $s(-t)$?`, '$' + mTex + '$', ['$' + sTex + '$', '$' + poly(even.map(([c, p]) => [-c, p]).concat(odd)) + '$', '$' + poly(all.map(([c, p]) => [-c, p])) + '$'],
          'Gerade Potenzen bleiben gleich, weil $(-t)^2=t^2$. Ungerade Potenzen wechseln das Vorzeichen, weil $(-t)^3=-t^3$.'),
        P.mc(R`Wie lautet der gerade Anteil $s_e(t)=\frac{s(t)+s(-t)}{2}$?`, '$' + eTex + '$', ['$' + oTex + '$', '$' + sTex + '$', '$' + poly(even.map(([c, p]) => [2 * c, p])) + '$'],
          'Beim Addieren heben sich die ungeraden Potenzen auf. Die geraden stehen doppelt da, und die $2$ im Nenner kürzt das wieder weg.'),
        P.mc(R`Wie lautet der ungerade Anteil $s_o(t)=\frac{s(t)-s(-t)}{2}$?`, '$' + oTex + '$', ['$' + eTex + '$', '$' + poly(flip) + '$', '$' + poly(odd.map(([c, p]) => [2 * c, p])) + '$'],
          R`Probe: $s_e+s_o=${sTex}$. Bei Polynomen gilt die Abkürzung: gerade Potenzen nach $s_e$, ungerade nach $s_o$.`)
      ]
    });
  });

  gen('g.evenoddval', 'Anteile an einer Stelle ausrechnen', G1, R`$s_e(t_1)=\frac{s(t_1)+s(-t_1)}{2}$`, 'Kap. 2 S. 12', 1, 2, () => {
    const a = pick([1, 2]);
    const t1 = pick([1, 2]);
    const odd = rnd() < 0.5;
    const v = Math.exp(-a * t1) / 2;
    return asQ('g.evenoddval', 'Kap. 2 S. 12', 1, 2, P.num(R`Gegeben ist $s(t)=\sigma(t)e^{-${co(a, 't')}}$. Wie groß ist ${odd ? R`$s_o(${t1})$` : R`$s_e(${t1})$`}?`, v, null, 0.006, {
      steps: [R`Für $t_1=${t1}>0$ gilt $s(${t1})=e^{-${a * t1}}$. Für $-${t1}<0$ gilt $s(-${t1})=0$, weil dort die Sprungfunktion null ist.`,
        odd ? R`$s_o(${t1})=\frac{e^{-${a * t1}}-0}{2}=${dec(v)}$` : R`$s_e(${t1})=\frac{e^{-${a * t1}}+0}{2}=${dec(v)}$`],
      fig: { t: 'plot', x: [-3, 3], y: [-0.7, 1.2], xl: 't', yl: 's(t)', curves: [{ f: (t) => sig(t) * Math.exp(-a * t), c: 'p' }] }
    }));
  });

  // ===========================================================================
  // Blatt 2
  // ===========================================================================
  gen('g.siftmul', 'Produkt mit dem Dirac-Impuls', G2, R`$f(t)\,\delta(t-t_0)=f(t_0)\,\delta(t-t_0)$`, 'Blatt 2-1, Kap. 3 S. 10', 1, 2, () => {
    const t0 = pick([-2, -1, 1, 2, 3]);
    const b = pick([1, 2, 3, -1, -2]);
    const c = pick([1, 2, -1, -3]);
    const form = pick(['quad', 'square', 'exp']);
    let tex;
    let val;
    if (form === 'quad') {
      tex = '(' + poly([[1, 2], [b, 1], [c, 0]]) + ')';
      val = t0 * t0 + b * t0 + c;
    } else if (form === 'square') {
      tex = '(' + shiftT(t0) + ')^2'; // Nullstelle genau an t0
      val = 0;
    } else {
      tex = R`e^{-(${shiftT(t0)})}`;
      val = 1;
    }
    const d = R`\delta(${shiftT(t0)})`;
    const right = val === 0 ? '$0$' : '$' + (val === 1 ? '' : val === -1 ? '-' : val) + d + '$';
    return asQ('g.siftmul', 'Blatt 2-1', 1, 2, P.mc(R`Vereinfache $${tex}\,${d}$.`, right, ['$' + tex + d + '$', '$' + (val + 1) + d + '$', '$' + val + '$', R`$${d}$`], null, {
      steps: [R`Der Dirac-Impuls $${d}$ ist nur bei $t=${t0}$ ungleich null. Dort zählt also nur der Wert des Faktors.`,
        form === 'exp' ? R`Bei $t=${t0}$ ist der Exponent $0$, und $e^0=1$.` : form === 'square' ? R`Der Faktor hat bei $t=${t0}$ eine Nullstelle, also wird das ganze Produkt $0$.` : R`Einsetzen: $f(${t0})=${val}$.`,
        R`Ergebnis: ${right}. Das Ergebnis ist wieder ein Impuls, außer der Faktor ist dort null.`]
    }));
  });

  gen('g.siftint', 'Integral mit dem Dirac-Impuls', G2, R`$\int_{-\infty}^{\infty}f(t)\delta(t-t_0)dt=f(t_0)$`, 'Blatt 2-1, Kap. 3 S. 10', 1, 2, () => {
    const form = pick(['poly', 'expcos', 'expsin', 'lin', 'mirror', 'outside']);
    let q;
    let val;
    const steps = [];
    if (form === 'poly') {
      const t0 = int(-3, 3) || 2;
      const b = int(-3, 3);
      val = t0 * t0 + b * t0;
      q = R`\int_{-\infty}^{\infty}(${poly([[1, 2], [b, 1]])})\,\delta(${shiftT(t0)})\,dt`;
      steps.push(R`Der Impuls sitzt bei $t=${t0}$. Das Integral liefert $f(${t0})=${val}$.`);
    } else if (form === 'expcos') {
      val = 1;
      q = R`\int_{-\infty}^{\infty}e^{-t}\cos(t)\,\delta(t)\,dt`;
      steps.push(R`Der Impuls sitzt bei $t=0$: $e^0\cos 0=1\cdot 1=1$.`);
    } else if (form === 'expsin') {
      val = 0;
      q = R`\int_{-\infty}^{\infty}e^{-t}\sin(t)\,\delta(t)\,dt`;
      steps.push(R`Der Impuls sitzt bei $t=0$: $e^0\sin 0=1\cdot 0=0$.`);
    } else if (form === 'lin') {
      const a = pick([1, 2]);
      const t0 = pick([1, 2]);
      val = (-t0 - a) * Math.sin(-t0);
      q = R`\int_{-\infty}^{\infty}(${shiftT(a)})\sin(t)\,\delta(t+${t0})\,dt`;
      steps.push(R`$\delta(t+${t0})$ sitzt bei $t=-${t0}$, nicht bei $+${t0}$.`, R`$(-${t0}-${a})\sin(-${t0})=${dec(val)}$. Der Sinus rechnet im Bogenmaß.`);
    } else if (form === 'mirror') {
      const t0 = int(1, 3);
      const b = int(1, 3);
      val = (t0 + b) * (t0 + b);
      q = R`\int_{-\infty}^{\infty}(t+${b})^2\,\delta(${t0}-t)\,dt`;
      steps.push(R`Der Impuls ist gerade, also $\delta(${t0}-t)=\delta(t-${t0})$. Er sitzt bei $t=${t0}$.`, R`$(${t0}+${b})^2=${val}$.`);
    } else {
      const t0 = int(3, 5);
      val = 0;
      q = R`\int_{0}^{2}\cos(t)\,\delta(t-${t0})\,dt`;
      steps.push(R`Der Impuls sitzt bei $t=${t0}$. Das liegt außerhalb der Integrationsgrenzen $[0,2]$, also kommt $0$ heraus.`);
    }
    return asQ('g.siftint', 'Blatt 2-1', 1, 2, P.num(R`Berechne $${q}$.`, val, null, 0.011, { steps }));
  });

  gen('g.pulse', 'Rechteckimpuls mit Sprüngen schreiben', G2, R`$A\,(\sigma(t-a)-\sigma(t-b))$`, 'Kap. 3 S. 2', 1, 2, () => {
    const a = int(-2, 2);
    const b = a + int(1, 3);
    const A = pick([1, 2, 3]);
    const sg = (x) => R`\sigma(${shiftT(x)})`;
    const pre = A === 1 ? '' : A;
    return asQ('g.pulse', 'Kap. 3 S. 2', 1, 2, P.mc('Welche Formel beschreibt das gezeichnete Signal?', R`$${pre}(${sg(a)}-${sg(b)})$`,
      [R`$${pre}(${sg(-a)}-${sg(-b)})$`, R`$${pre}(${sg(b)}-${sg(a)})$`, R`$${pre}(${sg(a)}+${sg(b)})$`, R`$${A + 1}(${sg(a)}-${sg(b)})$`], null, {
        fig: { t: 'plot', x: [-4, 6], y: [-0.5, 4], xl: 't', yl: 's(t)', xn: 10, curves: [{ f: (t) => A * (sig(t - a) - sig(t - b)), c: 'p' }] },
        steps: [R`Bei $t=${a}$ springt das Signal hoch: Das ist $${sg(a)}$.`, R`Bei $t=${b}$ springt es wieder herunter: Das ist $-${sg(b)}$.`, R`Die Höhe ${A} steht als Faktor davor. Merke: $\sigma(t-a)$ springt bei $t=+a$.`]
      }));
  });

  gen('g.stepval', 'Signal aus Sprüngen und Rampen auswerten', G2, R`$\varrho(t-t_0)=\sigma(t-t_0)(t-t_0)$`, 'Kap. 3 S. 6', 2, 2, () => {
    const form = pick(['stair', 'ramp']);
    if (form === 'stair') {
      const t1 = int(-3, -1);
      const t2 = t1 + int(1, 2);
      const t3 = t2 + int(1, 2);
      const c1 = int(1, 3);
      const c2 = pick([-2, -1, 1, 2]);
      const c3 = pick([-3, -2, -1, 1]);
      const at = t2 + pick([0.5, 1.5]);
      const s = (t) => c1 * sig(t - t1) + c2 * sig(t - t2) + c3 * sig(t - t3);
      const val = s(at);
      return asQ('g.stepval', 'Kap. 3 S. 1', 2, 2, P.num(R`Gegeben $s(t)=${co(c1, R`\sigma(${shiftT(t1)})`)}${plus(c2, R`\sigma(${shiftT(t2)})`)}${plus(c3, R`\sigma(${shiftT(t3)})`)}$. Wie groß ist $s(${dec(at)})$?`, val, null, 0.011, {
        steps: [R`Eine Sprungfunktion $\sigma(t-t_i)$ ist $1$, sobald $t\ge t_i$ gilt, sonst $0$.`,
          R`Bei $t=${dec(at)}$: $${c1}\cdot${sig(at - t1)}+(${c2})\cdot${sig(at - t2)}+(${c3})\cdot${sig(at - t3)}=${val}$.`],
        sol: [{ t: 'plot', x: [-4, 6], y: [Math.min(-1, c1 + c2 + c3) - 1, c1 + Math.max(0, c2) + Math.max(0, c3) + 1], xl: 't', yl: 's(t)', xn: 10, curves: [{ f: s, c: 'p' }], points: [{ x: at, y: val, c: 'g' }] }]
      }));
    }
    const a = int(0, 2);
    const b = int(1, 3);
    const at = b + int(1, 3);
    const val = ramp(at + a) - ramp(at - b);
    return asQ('g.stepval', 'Kap. 3 S. 6', 2, 2, P.num(R`Gegeben $s(t)=\varrho(${shiftT(-a)})-\varrho(${shiftT(b)})$. Wie groß ist $s(${at})$?`, val, null, 0.011, {
      steps: [R`Die Rampe $\varrho(u)$ ist $0$ für $u<0$ und sonst gleich $u$.`, R`$\varrho(${at}+${a})=${at + a}$ und $\varrho(${at}-${b})=${at - b}$.`, R`Differenz: $${at + a}-${at - b}=${val}$. Nach beiden Knicken bleibt das Signal konstant.`]
    }));
  });

  gen('g.deriv', 'Ableiten mit Sprungfunktion', G2, R`$\frac{d}{dt}[\sigma f]=f(0)\delta(t)+\sigma(t)f'(t)$`, 'Blatt 2-2, Kap. 3 S. 10', 2, 4, () => {
    const a = pick([2, 3, 4]);
    const w = pick([2, 3, 4]);
    const A = pick([2, 3, 5]);
    const fam = pick([
      { f: R`e^{-${a}t}`, f0: 1, df: R`-${a}e^{-${a}t}`, wrongDf: [R`${a}e^{-${a}t}`, R`-e^{-${a}t}`], why: R`Kettenregel: Der Faktor $-${a}$ aus dem Exponenten kommt nach vorn.` },
      { f: R`${A}\cos(${w}t)`, f0: A, df: R`-${A * w}\sin(${w}t)`, wrongDf: [R`${A * w}\sin(${w}t)`, R`-${A}\sin(${w}t)`], why: R`$\cos$ wird zu $-\sin$, und die innere Ableitung ${w} kommt als Faktor dazu.` },
      { f: R`${A}\sin(${w}t)`, f0: 0, df: R`${A * w}\cos(${w}t)`, wrongDf: [R`-${A * w}\cos(${w}t)`, R`${A}\cos(${w}t)`], why: R`$\sin$ wird zu $\cos$, und die innere Ableitung ${w} kommt als Faktor dazu.` },
      { f: R`e^{-t}\cos(t)`, f0: 1, df: R`-e^{-t}(\cos t+\sin t)`, wrongDf: [R`e^{-t}(\cos t-\sin t)`, R`-e^{-t}\sin t`], why: 'Produktregel: $(uv)\'=u\'v+uv\'$ mit $u=e^{-t}$ und $v=\\cos t$.' },
      { f: R`e^{-t}\sin(t)`, f0: 0, df: R`e^{-t}(\cos t-\sin t)`, wrongDf: [R`-e^{-t}(\cos t+\sin t)`, R`e^{-t}\cos t`], why: 'Produktregel: $(uv)\'=u\'v+uv\'$ mit $u=e^{-t}$ und $v=\\sin t$.' },
      { f: R`\cos t+\sin t`, f0: 1, df: R`\cos t-\sin t`, wrongDf: [R`\sin t-\cos t`, R`-\cos t-\sin t`], why: 'Summanden einzeln ableiten.' },
      { f: poly([[A, 0], [w, 1]]), f0: A, df: String(w), wrongDf: [String(A), R`${w}t`], why: 'Eine Gerade hat ihre Steigung als Ableitung.' }
    ]);
    const dPart = fam.f0 === 0 ? '' : (fam.f0 === 1 ? '' : fam.f0) + R`\delta(t)+`;
    const right = R`$${dPart}\sigma(t)\,(${fam.df})$`;
    return asQ('g.deriv', 'Blatt 2-2', 2, 4, {
      k: 'walk',
      q: R`Bilde die Ableitung von $s(t)=\sigma(t)\,(${fam.f})$.`,
      parts: [
        P.info(R`Das Signal ist links von $0$ null und springt bei $t=0$. **Der Sprung selbst** erzeugt beim Ableiten einen Dirac-Impuls, weil $\frac{d\sigma}{dt}=\delta(t)$ gilt. Produktregel: $\frac{d}{dt}[\sigma f]=\delta(t)f(t)+\sigma(t)f'(t)=f(0)\delta(t)+\sigma(t)f'(t)$.`),
        P.num(R`Wie hoch ist der Sprung bei $t=0$? Berechne $f(0)$ für $f(t)=${fam.f}$.`, fam.f0, fam.f0 === 0 ? 'Der Wert ist $0$. Das Signal startet stetig, also entsteht **kein** Dirac-Impuls.' : R`Das Signal springt von $0$ auf ${fam.f0}, also entsteht ein Impuls der Stärke ${fam.f0}.`),
        P.mc(R`Wie lautet $f'(t)$?`, '$' + fam.df + '$', fam.wrongDf.map((x) => '$' + x + '$'), fam.why),
        P.mc(R`Setze zusammen. Wie lautet $\frac{ds}{dt}$?`, right, [R`$\sigma(t)\,(${fam.df})$`, R`$\delta(t)\,(${fam.f})+\sigma(t)\,(${fam.wrongDf[0]})$`, R`$${fam.f0 + 1}\delta(t)+\sigma(t)\,(${fam.df})$`], R`Ergebnis: ${right}.`)
      ]
    });
  });

  gen('g.derivpulse', 'Rechteck und Rampe ableiten', G2, R`$\frac{d}{dt}\sigma(t-a)=\delta(t-a)$`, 'Kap. 3 S. 10', 1, 2, () => {
    const a = int(1, 3);
    const b = a + int(1, 3);
    const A = pick([1, 2, 3]);
    const form = pick(['rect', 'ramp']);
    const dd = (x) => R`\delta(${shiftT(x)})`;
    const ss = (x) => R`\sigma(${shiftT(x)})`;
    const co2 = A === 1 ? '' : A;
    if (form === 'rect') {
      return asQ('g.derivpulse', 'Kap. 3 S. 10', 1, 2, P.mc(R`Leite ab: $s(t)=${co2}(${ss(a)}-${ss(b)})$`, R`$${co2}\,${dd(a)}-${co2}\,${dd(b)}$`, [R`$${co2}\,${dd(a)}+${co2}\,${dd(b)}$`, R`$${co2}\,${dd(-a)}-${co2}\,${dd(-b)}$`, '$0$'], null, {
        steps: [R`Jeder Sprung wird zu einem Dirac-Impuls. Sprung nach oben ergibt einen positiven Impuls, Sprung nach unten einen negativen.`, 'Dazwischen ist das Signal konstant, dort ist die Ableitung $0$.'],
        sol: [{ t: 'plot', x: [-1, 7], y: [-A - 1, A + 1], xl: 't', yl: "s'(t)", curves: [], deltas: [{ x: a, h: A, c: 'p' }, { x: b, h: -A, c: 'b' }] }]
      }));
    }
    return asQ('g.derivpulse', 'Kap. 3 S. 6', 1, 2, P.mc(R`Leite ab: $s(t)=${co2}\,\varrho(${shiftT(a)})$`, R`$${co2}\,${ss(a)}$`, [R`$${co2}\,${dd(a)}$`, R`$${co2}\,(${shiftT(a)})$`, R`$${co2}\,${ss(-a)}$`], null, {
      steps: [R`Die Rampe ist links vom Knick $0$ und rechts davon eine Gerade mit Steigung $1$.`, R`Ihre Ableitung ist also links $0$ und rechts $1$. Das ist genau eine Sprungfunktion, die bei $t=${a}$ springt.`]
    }));
  });

  // ===========================================================================
  // Blatt 3
  // ===========================================================================
  const YES = true;
  const NO = false;
  function systemTable() {
    const c = pick([2, 3, 5]);
    const d = pick([1, 2, 3]);
    const w = pick([1, 2, 3]);
    return [
      { y: R`${c}\,x(t)`, lin: YES, ti: YES, st: YES, ka: YES, why: { lin: 'Reiner Verstärker: Faktoren und Summen gehen unverändert durch.', ti: 'Das $t$ kommt nur im Argument von $x$ vor.', st: R`$|y|\le ${c}M$.`, ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } },
      { y: R`x(t)+${d}`, lin: NO, ti: YES, st: YES, ka: YES, why: { lin: R`Der Test mit $x=0$ reicht: $T\{0\}=${d}\ne 0$. Ein lineares System muss auf $0$ mit $0$ antworten.`, ti: 'Die Konstante hängt nicht von der Zeit ab.', st: R`$|y|\le M+${d}$.`, ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } },
      { y: R`x^2(t)`, lin: NO, ti: YES, st: YES, ka: YES, why: { lin: 'Aus $(x_1+x_2)^2$ entsteht ein Mischterm $2x_1x_2$.', ti: 'Das $t$ kommt nur im Argument von $x$ vor.', st: '$|y|\\le M^2$.', ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } },
      { y: R`${c}\,x(t)\sin(${w}t)`, lin: YES, ti: NO, st: YES, ka: YES, why: { lin: 'Der Sinus ist nur ein zeitabhängiger Faktor, $x$ selbst steht linear da.', ti: R`Ein $t$ steht außerhalb von $x$: $\sin(${w}t)$ und $\sin(${w}(t-t_0))$ sind verschieden.`, st: R`$|\sin|\le 1$, also $|y|\le ${c}M$.`, ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } },
      { y: R`e^{${d}t}x(t)`, lin: YES, ti: NO, st: NO, ka: YES, why: { lin: 'Die e-Funktion ist ein zeitabhängiger Faktor, $x$ steht linear da.', ti: 'Ein $t$ steht außerhalb von $x$.', st: 'Selbst mit $x=1$ wächst $y$ für $t\\to\\infty$ unbegrenzt.', ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } },
      { y: R`t\,x(t)`, lin: YES, ti: NO, st: NO, ka: YES, why: { lin: 'Das $t$ ist ein zeitabhängiger Faktor, $x$ steht linear da.', ti: 'Ein $t$ steht außerhalb von $x$.', st: 'Selbst mit $x=1$ wächst $y=t$ unbegrenzt.', ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } },
      { y: R`x(t)-x(t-${d})`, lin: YES, ti: YES, st: YES, ka: YES, why: { lin: 'Differenz zweier Eingangswerte ohne Potenzen oder Konstanten.', ti: 'Das $t$ kommt nur in den Argumenten von $x$ vor.', st: '$|y|\\le 2M$.', ka: 'Es werden nur aktuelle und vergangene Eingangswerte benutzt.' } },
      { y: R`${c}\ln(x(t))`, lin: NO, ti: YES, st: NO, ka: YES, why: { lin: '$\\ln(x_1+x_2)\\ne\\ln x_1+\\ln x_2$.', ti: 'Das $t$ kommt nur im Argument von $x$ vor.', st: 'Für $x\\to 0^+$ geht der Logarithmus gegen $-\\infty$, obwohl der Eingang beschränkt ist.', ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } },
      { y: R`x(t+${d})`, lin: YES, ti: YES, st: YES, ka: NO, why: { lin: 'Eine reine Verschiebung ist linear.', ti: 'Das $t$ kommt nur im Argument von $x$ vor, und der Faktor davor ist $1$.', st: '$|y|\\le M$.', ka: R`$y(t)$ braucht den Eingang bei $t+${d}$, also einen Wert aus der Zukunft.` } },
      { y: R`x(${c}t)`, lin: YES, ti: NO, st: YES, ka: NO, why: { lin: 'Zeitskalierung ändert die Werte nicht, sie ist linear.', ti: R`$T\{x(t-t_0)\}=x(${c}t-t_0)$, aber $y(t-t_0)=x(${c}t-${c}t_0)$.`, st: '$|y|\\le M$.', ka: R`Für $t>0$ braucht $y(t)$ den Eingang bei $${c}t$, also aus der Zukunft.` } },
      { y: R`x(-t)`, lin: YES, ti: NO, st: YES, ka: NO, why: { lin: 'Spiegeln ändert die Werte nicht, es ist linear.', ti: '$T\\{x(t-t_0)\\}=x(-t-t_0)$, aber $y(t-t_0)=x(-t+t_0)$.', st: '$|y|\\le M$.', ka: 'Für $t<0$ braucht $y(t)$ den Eingang aus der Zukunft.' } },
      { y: R`\int_{-\infty}^{t}x(\tau)\,d\tau`, lin: YES, ti: YES, st: NO, ka: YES, why: { lin: 'Das Integral einer Summe ist die Summe der Integrale.', ti: 'Eine Substitution zeigt: Verschieben des Eingangs verschiebt das Ergebnis.', st: 'Mit dem beschränkten $x=\\sigma(t)$ entsteht die unbeschränkte Rampe $\\varrho(t)$.', ka: 'Es wird nur über die Vergangenheit integriert.' } },
      { y: R`2x(t-1)x(t-2)+x(t-2)`, lin: NO, ti: YES, st: YES, ka: YES, why: { lin: 'Das Produkt zweier Eingangswerte ist nicht linear.', ti: 'Das $t$ kommt nur in den Argumenten von $x$ vor.', st: '$|y|\\le 2M^2+M$.', ka: 'Es werden nur vergangene Eingangswerte benutzt.' } },
      { y: R`\cos(${w}\,x(t))`, lin: NO, ti: YES, st: YES, ka: YES, why: { lin: 'Der Eingang steht im Kosinus, also nicht linear.', ti: 'Das $t$ kommt nur im Argument von $x$ vor.', st: 'Der Kosinus ist immer zwischen $-1$ und $1$.', ka: 'Es wird nur der aktuelle Eingangswert benutzt.' } }
    ];
  }
  gen('g.sysprop', 'System auf alle vier Eigenschaften prüfen', G3, 'linear, zeitinvariant, BIBO-stabil, kausal', 'Blatt 3, Kap. 4', 2, 4, () => {
    const s = pick(systemTable());
    return asQ('g.sysprop', 'Blatt 3', 2, 4, {
      k: 'tf',
      q: R`Ein System antwortet auf $x(t)$ mit $y(t)=${s.y}$. Stimmen die Aussagen?`,
      st: [
        { s: 'Das System ist **linear**.', v: s.lin, e: s.why.lin },
        { s: 'Das System ist **zeitinvariant**.', v: s.ti, e: s.why.ti },
        { s: 'Das System ist **BIBO-stabil**.', v: s.st, e: s.why.st },
        { s: 'Das System ist **kausal**.', v: s.ka, e: s.why.ka }
      ]
    });
  });

  gen('g.tiwalk', 'Zeitinvarianz nachrechnen', G3, R`$T\{x(t-t_0)\}\overset{?}{=}y(t-t_0)$`, 'Blatt 3, Kap. 4 S. 4', 2, 3, () => {
    const c = pick([2, 3]);
    const d = pick([1, 2]);
    const w = pick([2, 3]);
    const fam = pick([
      { y: R`${c}\,x(t)`, a: R`${c}\,x(t-t_0)`, b: R`${c}\,x(t-t_0)`, same: true, x1: R`${c}\,x(t)\,(t-t_0)`, x2: R`${c}\,x(t-t_0)-t_0` },
      { y: R`x(t-${d})`, a: R`x(t-t_0-${d})`, b: R`x(t-t_0-${d})`, same: true, x1: R`x(t-t_0+${d})`, x2: R`x(t-${d})-t_0` },
      { y: R`x(t)-x(t-${d})`, a: R`x(t-t_0)-x(t-t_0-${d})`, b: R`x(t-t_0)-x(t-t_0-${d})`, same: true, x1: R`x(t-t_0)-x(t-${d})`, x2: R`x(t)-x(t-${d}-t_0)` },
      { y: R`\sin(${w}t)\,x(t)`, a: R`\sin(${w}t)\,x(t-t_0)`, b: R`\sin(${w}(t-t_0))\,x(t-t_0)`, same: false, x1: R`\sin(${w}t-t_0)\,x(t)`, x2: R`\sin(${w}t)\,x(t)` },
      { y: R`t\,x(t)`, a: R`t\,x(t-t_0)`, b: R`(t-t_0)\,x(t-t_0)`, same: false, x1: R`(t-t_0)\,x(t)`, x2: R`t\,x(t)-t_0` },
      { y: R`x(${c}t)`, a: R`x(${c}t-t_0)`, b: R`x(${c}t-${c}t_0)`, same: false, x1: R`x(${c}(t+t_0))`, x2: R`x(${c}t)-t_0` },
      { y: R`e^{${d}t}x(t)`, a: R`e^{${d}t}x(t-t_0)`, b: R`e^{${d}(t-t_0)}x(t-t_0)`, same: false, x1: R`e^{${d}t-t_0}x(t)`, x2: R`e^{${d}t}x(t)` }
    ]);
    return asQ('g.tiwalk', 'Blatt 3', 2, 3, {
      k: 'walk',
      q: R`Prüfe, ob $y(t)=T\{x(t)\}=${fam.y}$ zeitinvariant ist.`,
      parts: [
        P.mc(R`**Weg 1:** Erst den Eingang verschieben, dann durchs System. Ersetze nur das, was im Argument von $x$ steht. Was ist $T\{x(t-t_0)\}$?`, '$' + fam.a + '$', [fam.b !== fam.a ? '$' + fam.b + '$' : '$' + fam.x1 + '$', '$' + fam.x1 + '$', '$' + fam.x2 + '$'], 'Im System steht $x(\\ldots)$ als Eingang. Das neue Eingangssignal ist $x(t-t_0)$, jedes $t$ **außerhalb** von $x$ bleibt stehen.'),
        P.mc(R`**Weg 2:** Erst durchs System, dann den Ausgang verschieben. Ersetze **jedes** $t$ durch $t-t_0$. Was ist $y(t-t_0)$?`, '$' + fam.b + '$', [fam.a !== fam.b ? '$' + fam.a + '$' : '$' + fam.x2 + '$', '$' + fam.x1 + '$', '$' + fam.x2 + '$'], 'Hier wird wirklich jedes $t$ im fertigen Ausdruck ersetzt, auch die außerhalb von $x$.'),
        P.fix('Stimmen beide Wege überein?', ['Ja, zeitinvariant', 'Nein, zeitvariant'], fam.same ? 0 : 1, fam.same ? 'Beide Ausdrücke sind gleich. Das System reagiert heute genauso wie morgen.' : 'Die Ausdrücke unterscheiden sich. Das System verhält sich zu verschiedenen Zeitpunkten verschieden.')
      ]
    });
  });

  gen('g.linwalk', 'Linearität nachrechnen', G3, R`$T\{\alpha x_1+\beta x_2\}\overset{?}{=}\alpha T\{x_1\}+\beta T\{x_2\}$`, 'Blatt 3, Kap. 4 S. 1', 2, 3, () => {
    const c = pick([2, 3, 5]);
    const fam = pick([
      { y: R`${c}\,x(t)`, a: R`${c}(\alpha x_1+\beta x_2)`, b: R`\alpha\,${c}\,x_1+\beta\,${c}\,x_2`, same: true, e: 'Ausmultiplizieren zeigt: Beide Seiten sind gleich.' },
      { y: R`x(t)+${c}`, a: R`\alpha x_1+\beta x_2+${c}`, b: R`\alpha x_1+\beta x_2+(\alpha+\beta)\,${c}`, same: false, e: 'Die Konstante taucht links einmal auf, rechts $(\\alpha+\\beta)$-mal.' },
      { y: R`x^2(t)`, a: R`\alpha^2x_1^2+2\alpha\beta x_1x_2+\beta^2x_2^2`, b: R`\alpha x_1^2+\beta x_2^2`, same: false, e: 'Links steht ein Mischterm und $\\alpha^2$, rechts nicht.' },
      { y: R`x(t)\cos(${c}t)`, a: R`(\alpha x_1+\beta x_2)\cos(${c}t)`, b: R`\alpha x_1\cos(${c}t)+\beta x_2\cos(${c}t)`, same: true, e: 'Der Kosinus ist nur ein Faktor. Linear heißt nicht zeitinvariant, diese Eigenschaft wird getrennt geprüft.' },
      { y: R`x(t-${c})`, a: R`\alpha x_1(t-${c})+\beta x_2(t-${c})`, b: R`\alpha x_1(t-${c})+\beta x_2(t-${c})`, same: true, e: 'Beide Seiten sind gleich. Ein Verzögerungsglied ist linear.' }
    ]);
    return asQ('g.linwalk', 'Blatt 3', 2, 3, {
      k: 'walk',
      q: R`Prüfe, ob $y(t)=${fam.y}$ linear ist. Die Zeitargumente von $x_1$ und $x_2$ sind nur dort geschrieben, wo sie wichtig sind.`,
      parts: [
        P.mc(R`Setze $\alpha x_1+\beta x_2$ als Eingang ein. Was ist $T\{\alpha x_1+\beta x_2\}$?`, '$' + fam.a + '$', [fam.a !== fam.b ? '$' + fam.b + '$' : R`$\alpha+\beta$`, R`$\alpha\beta\,x_1x_2$`, R`$(\alpha+\beta)\,x_1x_2$`], 'Überall, wo im System $x$ steht, kommt die ganze Summe in Klammern hinein.'),
        P.mc(R`Rechne das System einzeln und mische danach. Was ist $\alpha T\{x_1\}+\beta T\{x_2\}$?`, '$' + fam.b + '$', [fam.a !== fam.b ? '$' + fam.a + '$' : R`$x_1+x_2$`, R`$\alpha\beta\,x_1x_2$`, R`$(\alpha+\beta)\,x_1x_2$`], 'Jedes Signal einzeln durchs System schicken und die Ausgänge dann mit $\\alpha$ und $\\beta$ gewichten.'),
        P.fix('Sind beide Ausdrücke gleich?', ['Ja, das System ist linear', 'Nein, das System ist nichtlinear'], fam.same ? 0 : 1, fam.e)
      ]
    });
  });

  gen('g.bibo', 'BIBO-Schranke bestimmen', G3, R`$|x(t)|\le M\Rightarrow|y(t)|\le\ldots$`, 'Kap. 4 S. 6', 1, 2, () => {
    const M = pick([2, 3, 4, 5]);
    const c = pick([2, 3]);
    const d = pick([1, 2]);
    const fam = pick([
      { y: R`${c}\,x(t)`, v: c * M, e: R`$|y|=${c}\,|x|\le ${c}\cdot ${M}=${c * M}$.` },
      { y: R`x(t)-x(t-${d})`, v: 2 * M, e: R`Im schlimmsten Fall ist $x(t)=+${M}$ und $x(t-${d})=-${M}$. Dann ist $|y|=${2 * M}$.` },
      { y: R`${c}\,x(t)\sin(t)`, v: c * M, e: R`Der Sinus erreicht höchstens $1$, also $|y|\le ${c}\cdot ${M}\cdot 1=${c * M}$.` },
      { y: R`x(t)+${d}`, v: M + d, e: R`$|y|\le|x|+${d}\le ${M}+${d}=${M + d}$.` }
    ]);
    return asQ('g.bibo', 'Kap. 4 S. 6', 1, 2, P.num(R`Das Eingangssignal von $y(t)=${fam.y}$ ist durch $|x(t)|\le ${M}$ beschränkt. Wie groß kann $|y(t)|$ höchstens werden?`, fam.v, null, 0.011, { steps: [fam.e, 'Eine endliche Schranke für jeden beschränkten Eingang bedeutet: BIBO-stabil.'] }));
  });

  // ===========================================================================
  // Blatt 5
  // ===========================================================================
  gen('g.ghq', 'Impuls-, Sprung- und Rampenantwort', G5, R`$g=\frac{dh}{dt}$, $\;h=\frac{dq}{dt}$`, 'Kap. 5 S. 1', 1, 2, () => {
    const a = pick([1, 2, 3, 4]);
    const A = pick([2, 3, 5]);
    const form = pick(['h2g', 'g2h', 'h2gc', 'poly']);
    if (form === 'h2g') {
      return asQ('g.ghq', 'Kap. 5 S. 1', 1, 2, P.mc(R`Die Sprungantwort ist $h(t)=\sigma(t)(1-e^{-${co(a, 't')}})$. Wie lautet die Impulsantwort $g(t)$?`, R`$${a === 1 ? '' : a}\,\sigma(t)e^{-${co(a, 't')}}$`, [R`$\sigma(t)e^{-${co(a, 't')}}$`, R`$\delta(t)+${a === 1 ? '' : a}\,\sigma(t)e^{-${co(a, 't')}}$`, R`$-${a === 1 ? '' : a}\,\sigma(t)e^{-${co(a, 't')}}$`, R`$\sigma(t)(1+${a === 1 ? '' : a}e^{-${co(a, 't')}})$`], null, {
        steps: [R`Die Impulsantwort ist die Ableitung der Sprungantwort: $g=\frac{dh}{dt}$.`, R`Produktregel: $\delta(t)(1-e^{0})+\sigma(t)\cdot ${a}e^{-${co(a, 't')}}$.`, R`Der Impuls fällt weg, weil $1-e^0=0$ ist. Es bleibt $${a === 1 ? '' : a}\,\sigma(t)e^{-${co(a, 't')}}$.`]
      }));
    }
    if (form === 'g2h') {
      const t1 = pick([0.5, 1, 2]);
      const val = (1 - Math.exp(-a * t1)) / a;
      return asQ('g.ghq', 'Kap. 5 S. 1', 1, 2, P.num(R`Die Impulsantwort ist $g(t)=\sigma(t)e^{-${co(a, 't')}}$. Wie groß ist die Sprungantwort $h(${dec(t1)})$?`, val, null, 0.006, {
        steps: [R`Sprungantwort heißt Integral der Impulsantwort: $h(t)=\int_0^t e^{-${co(a, R`\tau`)}}d\tau=\frac{1-e^{-${co(a, 't')}}}{${a}}$ für $t\ge 0$.`, R`Einsetzen: $h(${dec(t1)})=\frac{1-e^{-${dec(a * t1)}}}{${a}}=${dec(val)}$.`]
      }));
    }
    if (form === 'h2gc') {
      return asQ('g.ghq', 'Kap. 5 S. 1', 1, 2, P.mc(R`Ein reiner Verstärker hat die Sprungantwort $h(t)=${A}\sigma(t)$. Wie lautet die Impulsantwort?`, R`$${A}\,\delta(t)$`, [R`$${A}\,\sigma(t)$`, R`$${A}\,\varrho(t)$`, R`$${A}$`], null, {
        steps: [R`$g=\frac{dh}{dt}=${A}\frac{d\sigma}{dt}=${A}\,\delta(t)$.`, 'Ein Verstärker gibt einen Impuls sofort verstärkt wieder aus. Das passt.']
      }));
    }
    const c2 = pick([1, 3, 5]);
    return asQ('g.ghq', 'Kap. 5 S. 3', 1, 2, P.mc(R`Die Sprungantwort ist $h(t)=\frac{${c2}}{2}\sigma(t)t^2$. Wie lautet die Impulsantwort $g(t)$?`, R`$${c2 === 1 ? '' : c2}\,\sigma(t)\,t$`, [R`$\frac{${c2}}{2}\sigma(t)\,t$`, R`$\frac{${c2}}{6}\sigma(t)\,t^3$`, R`$${c2}\,\delta(t)$`], null, {
      steps: [R`$g=\frac{dh}{dt}$. Die Potenzregel liefert $\frac{${c2}}{2}\cdot 2t=${c2 === 1 ? '' : c2}t$.`, 'Ein Dirac-Impuls entsteht nicht, weil $h(0)=0$ ist.', R`Die Rampenantwort wäre umgekehrt das Integral: $q(t)=\frac{${c2}}{6}\sigma(t)t^3$.`]
    }));
  });

  gen('g.convdelta', 'Faltung mit dem Dirac-Impuls', G5, R`$x(t)*\delta(t-t_0)=x(t-t_0)$`, 'Kap. 5 S. 4', 1, 2, () => {
    const t0 = pick([1, 2, 3]);
    const a = pick([1, 2, 3]);
    const A = pick([2, 3]);
    const x = pick([
      { tex: R`\sigma(t)e^{-${co(a, 't')}}`, r: R`\sigma(t-${t0})e^{-${co(a, `(t-${t0})`)}}`, w: R`\sigma(t)e^{-${co(a, `(t-${t0})`)}}`, w2: R`\sigma(t+${t0})e^{-${co(a, `(t+${t0})`)}}` },
      { tex: R`\cos(${a + 1}t)`, r: R`\cos(${a + 1}(t-${t0}))`, w: R`\cos(${a + 1}t-${t0})`, w2: R`\cos(${a + 1}(t+${t0}))` },
      { tex: R`\sigma(t)`, r: R`\sigma(t-${t0})`, w: R`\sigma(t)\delta(t-${t0})`, w2: R`\sigma(t+${t0})` }
    ]);
    return asQ('g.convdelta', 'Kap. 5 S. 4', 1, 2, P.mc(R`Berechne $${x.tex}*${A}\,\delta(t-${t0})$.`, R`$${A}\,${x.r}$`, [R`$${A}\,${x.w}$`, R`$${A}\,${x.w2}$`, R`$${A}\,${x.tex}$`], null, {
      steps: ['Das Faltungsintegral und die Siebeigenschaft ergeben: Faltung mit einem Impuls **verschiebt** das Signal an den Ort des Impulses.', R`Jedes $t$ im Signal wird durch $t-${t0}$ ersetzt. Der Faktor ${A} bleibt stehen.`]
    }));
  });

  gen('g.convexp', 'Zwei e-Funktionen falten', G5, R`$\sigma e^{-at}*\sigma e^{-bt}=\sigma\frac{e^{-bt}-e^{-at}}{a-b}$`, 'Blatt 5, Kap. 5 S. 5', 2, 4, () => {
    const a = pick([3, 4, 5]);
    const b = pick([1, 2]);
    const t1 = pick([0.5, 1, 2]);
    const val = Sig.convExpExp(a, b, t1);
    const eb = R`e^{-${co(b, 't')}}`;
    const ea = R`e^{-${co(a, 't')}}`;
    const den = a - b;
    return asQ('g.convexp', 'Blatt 5', 2, 4, {
      k: 'walk',
      q: R`Ein System hat die Impulsantwort $g(t)=\sigma(t)${ea}$. Am Eingang liegt $x(t)=\sigma(t)${eb}$. Berechne $y(t)=\int_{-\infty}^{\infty}x(\tau)\,g(t-\tau)\,d\tau$.`,
      parts: [
        P.mc(R`Das Produkt $\sigma(\tau)\,\sigma(t-\tau)$ begrenzt das Integral. Welche Grenzen bleiben für $t\ge 0$?`, R`$\int_0^t$`, [R`$\int_{-\infty}^{t}$`, R`$\int_0^{\infty}$`, R`$\int_{-t}^{t}$`], R`$\sigma(\tau)$ verlangt $\tau\ge 0$, und $\sigma(t-\tau)$ verlangt $\tau\le t$. Für $t<0$ gibt es keinen Überlapp, also ist $y(t)=0$.`),
        P.mc('Wie sieht der Integrand aus, wenn du die Exponenten zusammenfasst?', R`$e^{-${co(a, 't')}}\,e^{${co(a - b, R`\tau`)}}$`, [R`$e^{-${co(a, 't')}}\,e^{${co(a + b, R`\tau`)}}$`, R`$e^{-${co(b, 't')}}\,e^{${co(a - b, R`\tau`)}}$`, R`$e^{${co(a - b, R`\tau`)}}$`],
          R`$e^{-${co(b, R`\tau`)}}\cdot e^{-${co(a, R`(t-\tau)`)}}=e^{-${co(a, 't')}}\,e^{(${a}-${b})\tau}$. Was nicht von $\tau$ abhängt, zieht man vor das Integral.`),
        P.mc(R`Integriere von $0$ bis $t$. Welches Ergebnis entsteht für $t\ge 0$?`, R`$\frac{1}{${den}}\left(${eb}-${ea}\right)$`, [R`$\frac{1}{${den}}\left(${ea}-${eb}\right)$`, R`$\frac{1}{${a + b}}\left(${eb}-${ea}\right)$`, R`$${eb}-${ea}$`],
          R`$e^{-${co(a, 't')}}\cdot\frac{e^{${co(den, 't')}}-1}{${den}}=\frac{${eb}-${ea}}{${den}}$. Die Exponenten addieren sich dabei: $-${a}t+${den}t=-${b}t$.`),
        P.num(R`Wie groß ist $y(${dec(t1)})$?`, val, R`$y(${dec(t1)})=\frac{e^{-${dec(b * t1)}}-e^{-${dec(a * t1)}}}{${den}}=${dec(val)}$`, 0.006)
      ]
    });
  });

  gen('g.convstep', 'Verzögerte Sprung-Impulsantwort falten', G5, R`$\sigma(t-t_a)*\sigma(t)e^{-bt}$`, 'Blatt 5-2', 2, 4, () => {
    const b = pick([1, 2, 3, 4]);
    const ta = pick([1, 2, 3]);
    const t1 = ta + pick([0.5, 1]);
    const val = Sig.convStepExp(b, ta, t1);
    return asQ('g.convstep', 'Blatt 5-2', 2, 4, {
      k: 'walk',
      q: R`Ein System hat die Impulsantwort $g(t)=\sigma(t-${ta})$. Am Eingang liegt $x(t)=\sigma(t)e^{-${co(b, 't')}}$. Berechne $y(t)=\int_{-\infty}^{\infty}x(t-\tau)\,g(\tau)\,d\tau$.`,
      fig: { t: 'plot', x: [-1, 6], y: [-0.2, 1.3], xl: 't', yt: [1], curves: [{ f: (t) => sig(t - ta), c: 'p', label: '$g(t)$' }, { f: (t) => sig(t) * Math.exp(-b * t), c: 'w', label: '$x(t)$' }] },
      parts: [
        P.mc(R`$g(\tau)$ ist $1$ für $\tau\ge ${ta}$. $x(t-\tau)$ verlangt $t-\tau\ge 0$. Welche Grenzen bleiben?`, R`$\int_{${ta}}^{t}$, und zwar nur für $t\ge ${ta}$`, [R`$\int_0^{t}$ für $t\ge 0$`, R`$\int_{${ta}}^{\infty}$ für alle $t$`, R`$\int_{t}^{${ta}}$ für $t\le ${ta}$`], R`Aus beiden Bedingungen folgt $${ta}\le\tau\le t$`+'. Vor $t='+ta+'$ passiert also nichts: Das ist die Verzögerung.'),
        P.mc('Löse das Integral. Wie lautet $y(t)$?', R`$\sigma(t-${ta})\,\frac{1}{${b}}\left[1-e^{-${co(b, `(t-${ta})`)}}\right]$`, [R`$\sigma(t)\,\frac{1}{${b}}\left[1-e^{-${co(b, 't')}}\right]$`, R`$\sigma(t-${ta})\,\left[1-e^{-${co(b, `(t-${ta})`)}}\right]$`, R`$\sigma(t-${ta})\,\frac{1}{${b}}\,e^{-${co(b, `(t-${ta})`)}}$`],
          R`$\int_{${ta}}^{t}e^{-${co(b, R`(t-\tau)`)}}d\tau=\frac{1}{${b}}\left[e^{-${co(b, R`(t-\tau)`)}}\right]_{${ta}}^{t}=\frac{1}{${b}}\left[1-e^{-${co(b, `(t-${ta})`)}}\right]$`),
        P.num(R`Wie groß ist $y(${dec(t1)})$?`, val, R`$y=\frac{1-e^{-${dec(b * (t1 - ta))}}}{${b}}=${dec(val)}$`, 0.006)
      ]
    });
  });

  gen('g.convrect', 'Zwei Rechtecke falten', G5, 'Rechteck mit Rechteck ergibt Dreieck oder Trapez', 'Blatt 5-3, Kap. 5', 2, 4, () => {
    const T1 = pick([1, 2, 3]);
    const T2 = pick([1, 2, 3, 4]);
    const A = pick([1, 2, 3]);
    const B = pick([1, 2]);
    const end = T1 + T2;
    const top = A * B * Math.min(T1, T2);
    const t1 = pick([0.5, 1, 1.5, 2.5]);
    const val = Sig.convRect(A, T1, B, T2, t1);
    const shape = T1 === T2 ? 'Dreieck' : 'Trapez';
    const x = (t) => A * (sig(t) - sig(t - T1));
    const g = (t) => B * (sig(t) - sig(t - T2));
    return asQ('g.convrect', 'Blatt 5-3', 2, 4, {
      k: 'walk',
      q: R`Falte $x(t)=${A}\,(\sigma(t)-\sigma(t-${T1}))$ mit $g(t)=${B}\,(\sigma(t)-\sigma(t-${T2}))$.`,
      fig: { t: 'plot', x: [-1, 6], y: [-0.4, 3.6], xl: 't', curves: [{ f: x, c: 'p', label: '$x(t)$' }, { f: g, c: 'w', label: '$g(t)$', d: '5 3' }] },
      parts: [
        P.num('Das gespiegelte Rechteck schiebt sich von links über das andere. Wann endet die Überlappung, also ab welchem $t$ ist $y(t)=0$?', end, R`Die Breiten addieren sich: $${T1}+${T2}=${end}$. Das gilt bei jeder Faltung: Beginn plus Beginn, Ende plus Ende.`),
        P.num('Wie hoch ist der größte Wert von $y(t)$?', top, R`Bei voller Überlappung ist die Fläche Höhe mal Höhe mal kleinere Breite: $${A}\cdot ${B}\cdot ${Math.min(T1, T2)}=${top}$.`),
        P.fix('Welche Form hat das Ergebnis?', ['Dreieck', 'Trapez', 'Rechteck'], shape === 'Dreieck' ? 0 : 1, T1 === T2 ? 'Gleich breite Rechtecke überlappen nur in einem einzigen Moment vollständig, also ein Dreieck.' : 'Das schmale Rechteck passt eine Weile ganz in das breite. So lange bleibt die Fläche konstant, also ein Trapez.'),
        P.num(R`Wie groß ist $y(${dec(t1)})$? Zeichne dir dazu die Überlappung auf.`, val, R`Die Fläche der Überlappung bei $t=${dec(t1)}$ ist ${dec(val)}. Das Bild unten zeigt die fertige Kurve $y(t)$.`)
      ],
      sol: [{ t: 'plot', title: 'Ergebnis $y(t)$', x: [-1, 8], y: [-0.2 * Math.max(top, 1), top * 1.3], xl: 't', yl: 'y(t)', xn: 9, curves: [{ f: (t) => Sig.convRect(A, T1, B, T2, t), c: 'g' }], points: [{ x: t1, y: val, c: 'g' }] }]
    });
  });

  gen('g.convsin', 'e-Funktion mit Sinus falten', G5, R`$\sigma e^{-at}*\sigma\sin\omega t$`, 'Blatt 5-1', 3, 4, () => {
    const a = pick([1, 2, 3]);
    const w = pick([1, 2, 3, 4]);
    const t1 = pick([1, 2]);
    const val = Sig.convExpSin(a, w, t1);
    const n = a * a + w * w;
    return asQ('g.convsin', 'Blatt 5-1', 3, 4, {
      k: 'walk',
      q: R`Ein System hat die Impulsantwort $g(t)=\sigma(t)e^{-${co(a, 't')}}$. Am Eingang liegt $x(t)=\sigma(t)\sin(${co(w, 't')})$. Berechne $y(t)$.`,
      parts: [
        P.mc('Welche Grenzen hat das Faltungsintegral für $t\\ge 0$?', R`$\int_0^t$`, [R`$\int_{-\infty}^{t}$`, R`$\int_t^{\infty}$`, R`$\int_{-t}^{t}$`], 'Beide Signale starten bei $0$, also überlappen sie nur von $0$ bis $t$.'),
        P.mc(R`Was ist die Stammfunktion von $e^{${co(a, R`\tau`)}}\sin(${co(w, R`\tau`)})$? Sie steht in jeder Formelsammlung.`, R`$\frac{e^{${co(a, R`\tau`)}}}{${n}}\left(${a}\sin(${co(w, R`\tau`)})-${w}\cos(${co(w, R`\tau`)})\right)$`, [R`$\frac{e^{${co(a, R`\tau`)}}}{${n}}\left(${w}\sin(${co(w, R`\tau`)})-${a}\cos(${co(w, R`\tau`)})\right)$`, R`$\frac{e^{${co(a, R`\tau`)}}}{${a + w}}\left(\sin(${co(w, R`\tau`)})-\cos(${co(w, R`\tau`)})\right)$`], R`Allgemein: $\int e^{a\tau}\sin(\omega\tau)d\tau=\frac{e^{a\tau}}{a^2+\omega^2}(a\sin\omega\tau-\omega\cos\omega\tau)$. Der Nenner ist hier $${a}^2+${w}^2=${n}$.`),
        P.num(R`Grenzen einsetzen ergibt $y(t)=\frac{1}{${n}}\left(${w}e^{-${co(a, 't')}}+${a}\sin(${co(w, 't')})-${w}\cos(${co(w, 't')})\right)$. Wie groß ist $y(${t1})$?`, val, R`Der Taschenrechner muss im Bogenmaß stehen. $y(${t1})=${dec(val)}$. Der erste Summand klingt ab, übrig bleibt eine Sinusschwingung gleicher Frequenz.`, 0.006)
      ]
    });
  });

  gen('g.convwin', 'Fensterintegral: Mittelwertbildner', G5, R`$g=k(\sigma(t-t_a)-\sigma(t-t_b))$`, 'Blatt 5-4', 3, 4, () => {
    const k = pick([1, 2, 3]);
    const ta = pick([0, 1]);
    const tb = ta + pick([1, 2]);
    const w = pick([1, 2, 3]);
    const useSq = rnd() < 0.6;
    const t1 = tb + 1;
    const val = useSq ? Sig.convWindowCos2(k, ta, tb, w, t1) : Sig.convWindowCos(k, ta, tb, w, t1);
    const xTex = useSq ? R`\cos^2(${co(w, 't')})` : R`\cos(${co(w, 't')})`;
    const sgA = ta === 0 ? R`\sigma(t)` : R`\sigma(t-${ta})`;
    return asQ('g.convwin', 'Blatt 5-4', 3, 4, {
      k: 'walk',
      q: R`Ein System hat die Impulsantwort $g(t)=${k === 1 ? '' : k}\left(${sgA}-\sigma(t-${tb})\right)$. Am Eingang liegt $x(t)=${xTex}$. Berechne $y(t)=\int x(\tau)\,g(t-\tau)\,d\tau$.`,
      parts: [
        P.mc(R`$g(t-\tau)$ ist nur dann ungleich null, wenn $${ta}\le t-\tau\le ${tb}$ gilt. Welche Grenzen für $\tau$ folgen daraus?`, R`$\int_{t-${tb}}^{${shiftT(ta)}}$`, [R`$\int_{${shiftT(ta)}}^{t-${tb}}$`, R`$\int_{${ta}}^{${tb}}$`, R`$\int_{t+${ta}}^{t+${tb}}$`], R`Nach $\tau$ umstellen: $t-${tb}\le\tau\le ${shiftT(ta)}$. Die untere Grenze gehört zu $t_b$. Das System mittelt also über ein Fenster in der Vergangenheit.`),
        useSq
          ? P.mc(R`$\cos^2$ lässt sich direkt schlecht integrieren. Welche Umformung hilft?`, R`$\cos^2\alpha=\frac12(1+\cos 2\alpha)$`, [R`$\cos^2\alpha=1-\cos 2\alpha$`, R`$\cos^2\alpha=\frac12(1-\cos 2\alpha)$`, R`$\cos^2\alpha=2\cos\alpha$`], 'Das Additionstheorem aus dem Anhang: Der doppelte Winkel lässt sich einfach integrieren.')
          : P.mc(R`Was ist die Stammfunktion von $\cos(${co(w, R`\tau`)})$?`, R`$\frac{1}{${w}}\sin(${co(w, R`\tau`)})$`, [R`$-\frac{1}{${w}}\sin(${co(w, R`\tau`)})$`, R`$${w}\sin(${co(w, R`\tau`)})$`, R`$\frac{1}{${w}}\cos(${co(w, R`\tau`)})$`], 'Beim Integrieren teilt man durch die innere Ableitung.'),
        P.num(R`Wie groß ist $y(${t1})$?`, val, useSq ? R`$y(t)=${k}\left[\frac{${tb - ta}}{2}+\frac{1}{${4 * w}}\left(\sin(${2 * w}(${shiftT(ta)}))-\sin(${2 * w}(t-${tb}))\right)\right]$, also $y(${t1})=${dec(val)}$.` : R`$y(t)=\frac{${k}}{${w}}\left(\sin(${w}(${shiftT(ta)}))-\sin(${w}(t-${tb}))\right)$, also $y(${t1})=${dec(val)}$.`, 0.006)
      ]
    });
  });

  gen('g.convsum', 'Faltungssumme endlicher Folgen', G5, R`$y(k)=\sum_l x(l)\,g(k-l)$`, 'Kap. 5 S. 9', 1, 3, () => {
    const nz = () => pick([-2, -1, 1, 2, 3]);
    const x = [nz(), int(-2, 3), nz()].slice(0, int(2, 3));
    const g = [nz(), int(-1, 2), nz()].slice(0, int(2, 3));
    const y = Sig.convSeq(x, g);
    const k = int(1, y.length - 1);
    const parts = [];
    x.forEach((xv, l) => {
      const gv = k - l >= 0 && k - l < g.length ? g[k - l] : null;
      if (gv !== null) parts.push(R`(${xv})\cdot(${gv})`);
    });
    return asQ('g.convsum', 'Kap. 5 S. 9', 1, 3, P.num(R`Gegeben sind die Folgen $x=[${x.join(',\\,')}]$ und $g=[${g.join(',\\,')}]$, beide beginnen bei $k=0$. Wie groß ist $y(${k})=\sum_l x(l)\,g(${k}-l)$?`, y[k], null, 0.001, {
      steps: [R`Die Indizes in jedem Produkt ergeben zusammen $${k}$.`, '$y(' + k + ')=' + parts.join('+') + '=' + y[k] + '$', R`Die ganze Folge ist $y=[${y.join(',\\,')}]$.`],
      sol: [{ t: 'plot', x: [-0.6, y.length - 0.4], y: [Math.min(0, ...y) - 1, Math.max(...y) + 1], xl: 'k', yl: 'y(k)', xt: y.map((_, i) => i).filter((i) => i), stems: [{ k: y.map((_, i) => i), v: y, c: 'g', hl: k }] }]
    }));
  });

  gen('g.convgeo', 'Faltungssumme mit geometrischer Reihe', G5, R`$\sum_{l=0}^{k}q^l=\frac{1-q^{k+1}}{1-q}$`, 'Kap. 5 S. 9', 3, 3, () => {
    const a = pick([0.5, 0.25, 2, 3]);
    const b = pick([0.5, 0.25, 2, 3].filter((v) => v !== a));
    const k = pick([1, 2, 3]);
    let sum = 0;
    for (let l = 0; l <= k; l++) sum += Math.pow(a, l) * Math.pow(b, k - l);
    return asQ('g.convgeo', 'Kap. 5 S. 9', 3, 3, P.num(R`Falte $x(k)=\sigma(k)\,(${dec(a)})^{k}$ mit $g(k)=\sigma(k)\,(${dec(b)})^{k}$. Wie groß ist $y(${k})$?`, sum, null, 0.011, {
      steps: [R`Die Sprungfolgen begrenzen die Summe auf $0\le l\le k$.`, R`$y(k)=\sum_{l=0}^{k}a^{l}b^{k-l}=b^{k}\sum_{l=0}^{k}\left(\frac{a}{b}\right)^{l}$. Das ist eine geometrische Reihe.`, R`Formel: $y(k)=\frac{a^{k+1}-b^{k+1}}{a-b}$ mit $a=${dec(a)}$ und $b=${dec(b)}$.`, R`Einsetzen: $y(${k})=${dec(sum)}$.`]
    }));
  });

  // ===========================================================================
  // Blatt 6
  // ===========================================================================
  gen('g.fsw0', 'Grundfrequenz einer Summe finden', G6, R`$\omega_0=\mathrm{ggT}(\omega_1,\omega_2,\ldots)$`, 'Blatt 6-1, Kap. 6 S. 3', 1, 2, () => {
    const set = pick([[4, 8, 1], [8, 3, 1], [1, 2, 3], [6, 9, 1], [2, 3, 1], [10, 15, 1], [3, 5, 2], [6, 10, 1], [4, 6, 3]]);
    const [m1, m2, d] = set;
    const g = gcd(m1, m2);
    const w0 = g / d;
    const wt = (m) => (d === 1 ? (m === 1 ? 't' : m + 't') : R`\tfrac{${m}}{${d}}t`);
    const fn1 = '\\' + pick(['cos', 'sin']);
    const fn2 = '\\' + pick(['cos', 'sin']);
    return asQ('g.fsw0', 'Blatt 6-1', 1, 2, {
      k: 'walk',
      q: 'Gegeben ist $f(t)=' + fn1 + '(' + wt(m1) + ')+' + fn2 + '(' + wt(m2) + ')$.',
      parts: [
        P.num(R`Wie groß ist die Grundkreisfrequenz $\omega_0$? Sie ist die größte Zahl, von der beide Frequenzen ganzzahlige Vielfache sind.`, w0, R`$\omega_0=\mathrm{ggT}(${frac(m1, d)},\,${frac(m2, d)})=${frac(g, d)}$.` + (d > 1 ? R` Bei Brüchen hilft der gemeinsame Nenner: $\mathrm{ggT}(${m1},${m2})=${g}$, also $\frac{${g}}{${d}}$.` : ''), 0.011),
        P.num(R`Wie groß ist die Periode $T=\frac{2\pi}{\omega_0}$? (Dezimalzahl oder zum Beispiel $2π/3$ eingeben)`, (2 * PI) / w0, R`$T=\frac{2\pi}{${frac(g, d)}}=${piT(2 * d, g)}\approx ${dec((2 * PI) / w0)}$.`, 0.02),
        P.num(R`Die wievielte Harmonische ist der zweite Summand, also welches $k$ gehört zu ${'$' + wt(m2) + '$'}?`, m2 / g, R`$k=\frac{\omega_2}{\omega_0}=${m2 / g}$. Der erste Summand liegt bei $k=${m1 / g}$.`, 0.01)
      ]
    });
  });

  gen('g.fscompare', 'Koeffizientenvergleich', G6, R`$\cos\alpha=\frac{e^{j\alpha}+e^{-j\alpha}}{2}$, $\;\sin\alpha=\frac{e^{j\alpha}-e^{-j\alpha}}{2j}$`, 'Blatt 6-1, Kap. 6 S. 4', 2, 4, () => {
    const A = pick([0, 1, 2, 3]);
    const m = pick([1, 2, 3, 4]);
    let n;
    do n = pick([1, 2, 3, 4, 5, 6]); while (n === m);
    const B = pick([1, 2, 3, 4, -2]);
    const C = pick([1, 2, 4, 6, -2, -4]);
    const w0base = pick([1, 2, 3]);
    const wm = m * w0base;
    const wn = n * w0base;
    const g = gcd(wm, wn);
    const km = wm / g;
    const kn = wn / g;
    const fTex = (A ? A + '+' : '') + co(B, R`\cos(${wm}t)`) + plus(C, R`\sin(${wn}t)`);
    const imTex = (v) => (v === 0 ? '0' : (v < 0 ? '-' : '') + (Math.abs(v) === 1 ? '' : dec(Math.abs(v))) + 'j');
    return asQ('g.fscompare', 'Blatt 6-1', 2, 4, {
      k: 'walk',
      q: R`Bestimme die komplexen Fourierkoeffizienten von $f(t)=${fTex}$ durch Koeffizientenvergleich.`,
      parts: [
        P.num(R`Wie groß ist die Grundkreisfrequenz $\omega_0$?`, g, R`$\omega_0=\mathrm{ggT}(${wm},${wn})=${g}$. Damit liegt der Kosinus bei $k=${km}$ und der Sinus bei $k=${kn}$.`, 0.01),
        P.num(R`Der Gleichanteil ist $c_0$. Wie groß ist er?`, A, A ? R`Die Konstante ${A} ist genau der Gleichanteil.` : 'Es gibt keine Konstante, also $c_0=0$.', 0.01),
        P.num(R`Schreibe den Kosinus mit Euler: $${co(B, R`\cos(${wm}t)`)}=\frac{${B}}{2}e^{j${wm}t}+\frac{${B}}{2}e^{-j${wm}t}$. Wie groß ist $c_{${km}}$?`, B / 2, R`Vor $e^{j${km}\omega_0t}$ steht $\frac{${B}}{2}$, also $c_{${km}}=c_{-${km}}=${dec(B / 2)}$. Kosinus liefert zwei gleiche reelle Linien.`, 0.01),
        P.mc(R`Jetzt der Sinus: $${co(C, R`\sin(${wn}t)`)}=\frac{${C}}{2j}e^{j${wn}t}-\frac{${C}}{2j}e^{-j${wn}t}$. Wie groß ist $c_{${kn}}$? Beachte $\frac{1}{j}=-j$.`, '$' + imTex(-C / 2) + '$', ['$' + imTex(C / 2) + '$', '$' + dec(C / 2) + '$', '$' + imTex(-C) + '$'], R`$c_{${kn}}=\frac{${C}}{2j}=${imTex(-C / 2)}$.`),
        P.mc(R`Wie groß ist dann $c_{-${kn}}$?`, '$' + imTex(C / 2) + '$', ['$' + imTex(-C / 2) + '$', '$' + dec(-C / 2) + '$', '$' + imTex(C) + '$'], R`Es gilt immer $c_{-k}=c_k^*$, das Konjugierte: Das Vorzeichen des Imaginärteils dreht sich.`)
      ]
    });
  });

  gen('g.fsphase', 'Koeffizienten mit Phase', G6, R`$\sin(\alpha+\varphi)=\frac{e^{j\varphi}e^{j\alpha}-e^{-j\varphi}e^{-j\alpha}}{2j}$`, 'Blatt 6-1 c, d', 2, 2, () => {
    const k = pick([1, 2, 3]);
    const ph = pick([1, 2, 3]);
    const sign = pick(['-', '+']);
    const ex = sign === '-' ? -ph : ph;
    const kindSin = rnd() < 0.5;
    const wt = k === 1 ? 't' : k + 't';
    if (kindSin) {
      return asQ('g.fsphase', 'Blatt 6-1', 2, 2, P.mc(R`Gegeben ist $f(t)=\sin(${wt}${sign}${ph})$ mit $\omega_0=1$. Wie groß ist $c_{${k}}$?`, R`$\frac{e^{${ex}j}}{2j}$`, [R`$\frac{e^{${-ex}j}}{2j}$`, R`$\frac{e^{${ex}j}}{2}$`, R`$-\frac{e^{${ex}j}}{2j}$`], null, {
        steps: [R`Sinus mit Euler: $\sin(${wt}${sign}${ph})=\frac{e^{j(${wt}${sign}${ph})}-e^{-j(${wt}${sign}${ph})}}{2j}$.`, R`Exponent aufteilen: $\frac{e^{${ex}j}}{2j}\,e^{j${wt}}$. Die Phase wird zu einem festen komplexen Faktor.`, R`Der Faktor vor $e^{j${wt}}$ ist $c_{${k}}=\frac{e^{${ex}j}}{2j}$.`]
      }));
    }
    return asQ('g.fsphase', 'Blatt 6-1', 2, 2, P.mc(R`Gegeben ist $f(t)=\cos(${wt}${sign}${ph})$ mit $\omega_0=1$. Wie groß ist $c_{-${k}}$?`, R`$\frac{e^{${-ex}j}}{2}$`, [R`$\frac{e^{${ex}j}}{2}$`, R`$\frac{e^{${-ex}j}}{2j}$`, '$\\frac12$'], null, {
      steps: [R`$\cos(${wt}${sign}${ph})=\frac{e^{${ex}j}e^{j${wt}}+e^{${-ex}j}e^{-j${wt}}}{2}$.`, R`Der Faktor vor $e^{-j${wt}}$ ist $c_{-${k}}=\frac{e^{${-ex}j}}{2}$.`]
    }));
  });

  gen('g.fsab', 'Reelle und komplexe Koeffizienten umrechnen', G6, R`$c_k=\frac12(a_k-jb_k)$`, 'Kap. 6 S. 2', 1, 3, () => {
    const a = pick([-4, -2, 0, 2, 3, 4, 6]);
    const b = pick([-6, -2, 1, 2, 4, 5]);
    const k = pick([1, 2, 3]);
    return asQ('g.fsab', 'Kap. 6 S. 2', 1, 3, {
      k: 'walk',
      q: R`Für eine Fourier-Reihe gilt $a_{${k}}=${a}$ und $b_{${k}}=${b}$. Rechne in komplexe Koeffizienten um.`,
      parts: [
        P.num(R`Wie groß ist der **Realteil** von $c_{${k}}=\frac12(a_{${k}}-jb_{${k}})$?`, a / 2, R`Der Realteil ist $\frac{a_{${k}}}{2}=${dec(a / 2)}$.`, 0.01),
        P.num(R`Wie groß ist der **Imaginärteil** von $c_{${k}}$? (Nur die Zahl vor dem $j$)`, -b / 2, R`Der Imaginärteil ist $-\frac{b_{${k}}}{2}=${dec(-b / 2)}$. Das Minus wird oft vergessen.`, 0.01),
        P.num(R`Wie groß ist der Imaginärteil von $c_{-${k}}$?`, b / 2, R`$c_{-k}$ ist das Konjugierte von $c_k$, also $+\frac{b_{${k}}}{2}=${dec(b / 2)}$. Zurück geht es mit $a_k=c_k+c_{-k}$ und $b_k=j(c_k-c_{-k})$.`, 0.01)
      ]
    });
  });

  gen('g.fsmag', 'Betrag und Phase eines Koeffizienten', G6, R`$|c_k|=\sqrt{\mathrm{Re}^2+\mathrm{Im}^2}$`, 'Kap. 6 S. 10, Anhang S. 1', 1, 3, () => {
    const [p, q, r] = pick([[3, 4, 5], [4, 3, 5], [1, 1, Math.SQRT2], [6, 8, 10], [5, 12, 13], [8, 6, 10], [0, 2, 2], [2, 0, 2]]);
    const sp = pick([1, -1]);
    const sq = pick([1, -1]);
    const a = p * sp || 0;
    const b = q * sq || 0;
    const ph = Math.atan2(b, a);
    const cTex = (a === 0 ? '' : String(a)) + (b === 0 ? '' : (b > 0 && a !== 0 ? '+' : b < 0 ? '-' : '') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'j');
    return asQ('g.fsmag', 'Kap. 6 S. 10', 1, 3, {
      k: 'walk',
      q: R`Ein Fourierkoeffizient ist $c=${cTex}$.`,
      parts: [
        P.num('Wie groß ist der Betrag $|c|$?', r, R`$|c|=\sqrt{(${a})^2+(${b})^2}=${dec(r)}$. Stell dir $c$ als Pfeil in der komplexen Ebene vor: Der Betrag ist seine Länge.`, 0.011),
        P.num('Wie groß ist die Phase in Bogenmaß? Rechne mit $\\arctan$ und achte auf den Quadranten.', ph, (a > 0 ? R`Der Realteil ist positiv, also gilt direkt $\varphi=\arctan\frac{${b}}{${a}}=${dec(ph)}$.` : a === 0 ? R`Der Pfeil zeigt genau senkrecht, also $\varphi=${b > 0 ? R`\frac{\pi}{2}` : R`-\frac{\pi}{2}`}$.` : b === 0 ? R`Der Pfeil zeigt genau nach links, also $\varphi=\pi$.` : R`Der Realteil ist negativ. $\arctan\frac{${b}}{${a}}$ allein ist deshalb falsch, es fehlt ${b > 0 ? R`$+\pi$` : R`$-\pi$`}. Ergebnis: $\varphi=${dec(ph)}$.`), 0.02)
      ],
      sol: b === 0 && a < 0 ? [{ t: 'p', x: 'Auch $-\\pi$ ist richtig, das ist derselbe Winkel.' }] : undefined
    });
  });

  gen('g.fssquare', 'Rechteckschwingung analysieren', G6, R`$b_k=\frac{2A}{\pi k}(1-(-1)^k)$`, 'Kap. 6 S. 6', 2, 4, () => {
    const A = pick([1, 2, 3, 5]);
    const T = pick([2, 4, 8]);
    const k = pick([1, 2, 3, 5]);
    const b = Sig.fsSquareB(A, k);
    return asQ('g.fssquare', 'Kap. 6 S. 6', 2, 4, {
      k: 'walk',
      q: R`Gegeben ist die Rechteckschwingung mit $f(t)=${A}$ auf $[0,${T / 2})$ und $f(t)=-${A}$ auf $[${T / 2},${T})$, Periode $T=${T}$.`,
      fig: { t: 'plot', x: [-T, T], y: [-A - 1, A + 1], xl: 't', xn: 8, curves: [{ f: (t) => { let u = t % T; if (u < 0) u += T; return u < T / 2 ? A : -A; }, c: 'p' }] },
      parts: [
        P.fix('Die Funktion ist punktsymmetrisch zum Ursprung, also ungerade. Was folgt daraus?', [R`$a_k=0$, nur Sinusanteile`, R`$b_k=0$, nur Kosinusanteile`, 'Es entfallen keine Koeffizienten'], 0, 'Eine ungerade Funktion besteht nur aus ungeraden Bausteinen, und das sind die Sinusfunktionen. Der Mittelwert ist auch null.'),
        P.num(R`Wie groß ist $b_{${k}}$? Es gilt $b_k=\frac{2}{T}\int_0^T f(t)\sin(k\omega_0t)dt=\frac{2\cdot ${A}}{\pi k}\left(1-(-1)^k\right)$.`, b, k % 2 ? R`$k=${k}$ ist ungerade: $1-(-1)^{${k}}=2$, also $b_{${k}}=\frac{${4 * A}}{${k}\pi}=${dec(b)}$.` : R`$k=${k}$ ist gerade: $1-(-1)^{${k}}=0$. Die Rechteckschwingung enthält nur ungerade Harmonische.`, 0.011),
        P.num(R`Wie groß ist der Imaginärteil von $c_{${k}}=\frac12(a_{${k}}-jb_{${k}})$?`, -b / 2, R`Wegen $a_k=0$ ist $c_k$ rein imaginär: $\mathrm{Im}(c_{${k}})=-\frac{b_{${k}}}{2}=${dec(-b / 2)}$.`, 0.011)
      ]
    });
  });

  gen('g.fspulse', 'Pulsfolge: Gleichanteil und Koeffizient', G6, R`$c_k=\frac{1}{T}\int_{T}f(t)e^{-jk\omega_0t}dt$`, 'Kap. 6 S. 7', 2, 3, () => {
    const A = pick([1, 2, 4]);
    const T = pick([4, 8]);
    const tau = T / pick([2, 4]);
    const k = pick([1, 2, 3]);
    const c = Sig.fsPulse(A, tau, T, k);
    return asQ('g.fspulse', 'Kap. 6 S. 7', 2, 3, {
      k: 'walk',
      q: R`Eine periodische Pulsfolge hat die Höhe $${A}$ auf $[-${tau / 2},${tau / 2}]$, sonst den Wert $0$. Die Periode ist $T=${T}$.`,
      fig: { t: 'plot', x: [-T, T], y: [-0.5, A + 1], xl: 't', curves: [{ f: (t) => { let u = (t + T / 2) % T; if (u < 0) u += T; u -= T / 2; return Math.abs(u) <= tau / 2 ? A : 0; }, c: 'p' }] },
      parts: [
        P.num(R`$c_0$ ist der Mittelwert über eine Periode. Wie groß ist er?`, Sig.fsPulse(A, tau, T, 0), R`$c_0=\frac{1}{T}\int f\,dt=\frac{${A}\cdot ${tau}}{${T}}=${dec((A * tau) / T)}$. Fläche durch Periode.`, 0.011),
        P.num(R`Die Rechnung ergibt $c_k=\frac{${A}}{\pi k}\sin\left(\frac{k\pi\tau}{T}\right)$. Wie groß ist $c_{${k}}$?`, c, R`$\frac{k\pi\tau}{T}=${piT(k * tau, T)}$, also $c_{${k}}=\frac{${A}}{${k}\pi}\sin(${piT(k * tau, T)})=${dec(c)}$.`, 0.011)
      ],
      sol: [{ t: 'p', x: 'Die Funktion ist gerade, darum ist $c_k$ reell. Die Hüllkurve des Spektrums hat die Form $\\sin(x)/x$. Genau das liefert später auch die Fourier-Transformation des einzelnen Rechtecks.' }]
    });
  });

  gen('g.fssaw', 'Sägezahn mit partieller Integration', G6, R`$\int u'v=uv-\int uv'$`, 'Blatt 6-2, 6-3, Kap. 6 S. 7', 3, 3, () => {
    const b = pick([1, 2, 3, 4]);
    const T = pick([1, 2, 4]);
    const k = pick([1, 2, 3]);
    const im = Sig.fsSawIm(b, T, k);
    return asQ('g.fssaw', 'Blatt 6-2', 3, 3, {
      k: 'walk',
      q: R`Gegeben ist die $T$-periodische Funktion $f(t)=${co(b, 't')}$ auf $[0,${T})$. Berechne $c_k=\frac{1}{T}\int_0^{T}f(t)\,e^{-jk\omega_0t}\,dt$.`,
      fig: { t: 'plot', x: [-T, 2 * T], y: [-0.2 * b * T, 1.2 * b * T], xl: 't', curves: [{ f: (t) => { let u = t % T; if (u < 0) u += T; return b * u; }, c: 'p' }] },
      parts: [
        P.num('Wie groß ist $c_0$, also der Mittelwert?', (b * T) / 2, R`$c_0=\frac{1}{${T}}\int_0^{${T}}${co(b, 't')}\,dt=\frac{${b}\cdot ${T}}{2}=${dec((b * T) / 2)}$. Für $k=0$ gilt die allgemeine Formel nicht, das muss immer getrennt gerechnet werden.`, 0.011),
        P.mc('Wie wählst du bei der partiellen Integration $u$ und $v\'$?', R`$u=t$ und $v'=e^{-jk\omega_0t}$`, [R`$u=e^{-jk\omega_0t}$ und $v'=t$`, R`$u=1$ und $v'=te^{-jk\omega_0t}$`], 'Das $t$ soll durch Ableiten verschwinden. Die e-Funktion lässt sich leicht integrieren.'),
        P.num(R`Der Randterm bei $T$ enthält $e^{-jk\omega_0T}=e^{-j2\pi k}=1$, das Restintegral wird $0$. Es bleibt $c_k=j\frac{${b}\cdot ${T}}{2\pi k}$. Wie groß ist der Imaginärteil von $c_{${k}}$?`, im, R`$\mathrm{Im}(c_{${k}})=\frac{${b * T}}{2\pi\cdot ${k}}=${dec(im)}$.`, 0.006)
      ]
    });
  });

  gen('g.fssym', 'Symmetrie erkennen', G6, 'gerade: nur Kosinus. ungerade: nur Sinus', 'Kap. 6 S. 6', 1, 2, () => {
    const A = pick([2, 3]);
    const kind = pick([
      { tex: R`${A}\cos(2t)+\cos(5t)`, even: true, odd: false, dc: false },
      { tex: R`${A}\sin(2t)-\sin(5t)`, even: false, odd: true, dc: false },
      { tex: R`${A}+\cos(3t)`, even: true, odd: false, dc: true },
      { tex: R`${A}\sin(t)+\cos(t)`, even: false, odd: false, dc: false }
    ]);
    return asQ('g.fssym', 'Kap. 6 S. 6', 1, 2, {
      k: 'tf',
      q: R`Betrachte $f(t)=${kind.tex}$.`,
      st: [
        { s: 'Alle $c_k$ sind rein reell.', v: kind.even, e: kind.even ? 'Eine gerade Funktion hat nur Kosinusanteile, und die liefern reelle $c_k$.' : 'Sinusanteile liefern imaginäre $c_k$.' },
        { s: 'Alle $a_k$ sind null.', v: kind.odd, e: kind.odd ? 'Eine ungerade Funktion hat keine Kosinusanteile.' : 'Es gibt einen Kosinusanteil.' },
        { s: '$c_0$ ist ungleich null.', v: kind.dc, e: kind.dc ? 'Die Konstante ist der Gleichanteil.' : 'Sinus und Kosinus haben über eine Periode den Mittelwert $0$.' }
      ]
    });
  });

  // ===========================================================================
  // Blatt 7
  // ===========================================================================
  gen('g.ftexp', 'Spektrum der e-Funktion', G7, R`$\sigma(t)e^{-at}\;\circ\!\!-\!\!\bullet\;\frac{1}{a+j\omega}$`, 'Kap. 7 S. 2', 1, 3, () => {
    const a = pick([1, 2, 3, 4]);
    const w = pick([1, 2, 3, 4, 5]);
    const mag = 1 / Math.hypot(a, w);
    const ph = -Math.atan(w / a);
    return asQ('g.ftexp', 'Kap. 7 S. 2', 1, 3, {
      k: 'walk',
      q: R`Gegeben ist $f(t)=\sigma(t)e^{-${co(a, 't')}}$, also $F(\omega)=\frac{1}{${a}+j\omega}$. Betrachte die Frequenz $\omega=${w}$.`,
      parts: [
        P.num(R`Wie groß ist der Betrag $|F(${w})|$?`, mag, R`$|F|=\frac{1}{\sqrt{${a}^2+${w}^2}}=\frac{1}{\sqrt{${a * a + w * w}}}=${dec(mag)}$. Der Betrag eines Bruchs ist Betrag oben durch Betrag unten.`, 0.006),
        P.num(R`Wie groß ist die Phase in Bogenmaß?`, ph, R`Die Phase eines Bruchs ist Phase oben minus Phase unten: $\varphi=0-\arctan\frac{${w}}{${a}}=${dec(ph)}$.`, 0.011),
        P.num(R`Wie groß ist der Betrag bei $\omega=0$?`, 1 / a, R`$|F(0)|=\frac{1}{${a}}=${dec(1 / a)}$. Das ist die Fläche unter $f(t)$, denn $F(0)=\int f(t)\,dt$.`, 0.006)
      ],
      sol: [{ t: 'plot', title: 'Betragsspektrum', x: [-10, 10], y: [-0.1 / a, 1.2 / a], xl: 'ω', yl: '|F(ω)|', yn: 2, curves: [{ f: (x) => 1 / Math.hypot(a, x), c: 'v' }], points: [{ x: w, y: mag, c: 'g' }] }]
    });
  });

  gen('g.ftrect', 'Spektrum des Rechteckimpulses', G7, R`$F(\omega)=\frac{2A\sin(\omega T)}{\omega}$`, 'Blatt 7-1', 1, 3, () => {
    const A = pick([1, 2, 3, 5]);
    const T = pick([0.5, 1, 2, 4]);
    const w1 = pick([0.5, 1, 1.5, 2]);
    return asQ('g.ftrect', 'Blatt 7-1', 1, 3, {
      k: 'walk',
      q: R`Gegeben ist der Rechteckimpuls $f(t)=${A}\,(\sigma(t+${dec(T)})-\sigma(t-${dec(T)}))$.`,
      parts: [
        P.mc('Wie vereinfacht sich das Fourier-Integral?', R`$F(\omega)=${A}\int_{-${dec(T)}}^{${dec(T)}}e^{-j\omega t}dt$`, [R`$F(\omega)=${A}\int_{0}^{\infty}e^{-j\omega t}dt$`, R`$F(\omega)=\int_{-\infty}^{\infty}${A}\,dt$`, R`$F(\omega)=${A}\int_{-${dec(T)}}^{${dec(T)}}e^{j\omega t}dt$`], 'Außerhalb des Rechtecks ist $f(t)=0$, also bleibt nur das Stück dazwischen. Im Hinweg steht das Minus im Exponenten.'),
        P.num('Wie groß ist $F(0)$?', Sig.ftRect(A, T, 0), R`$F(0)$ ist die Fläche unter $f(t)$: $${A}\cdot 2\cdot ${dec(T)}=${dec(2 * A * T)}$.`, 0.011),
        P.num('Bei welchem kleinsten $\\omega>0$ ist $F(\\omega)=0$? (Dezimalzahl oder z. B. π/2)', PI / T, R`$\sin(\omega\cdot ${dec(T)})=0$ gilt zuerst bei $\omega=\frac{\pi}{${dec(T)}}=${dec(PI / T)}$.`, 0.02),
        P.num(R`Wie groß ist $F(${dec(w1)})$? Es gilt $F(\omega)=\frac{${2 * A}\sin(${dec(T)}\,\omega)}{\omega}$.`, Sig.ftRect(A, T, w1), R`Mit Bogenmaß: $F(${dec(w1)})=${dec(Sig.ftRect(A, T, w1))}$.`, 0.011)
      ],
      sol: [{ t: 'plot', title: 'Spektrum', x: [-3 * PI / T, 3 * PI / T], y: [-0.4 * 2 * A * T, 1.2 * 2 * A * T], xl: 'ω', yl: 'F(ω)', yn: 2, curves: [{ f: (x) => Sig.ftRect(A, T, x), c: 'v' }] }]
    });
  });

  const FT_TABLE = [
    [R`$\delta(t)$`, R`$1$`],
    [R`$1$`, R`$2\pi\delta(\omega)$`],
    [R`$\sigma(t)$`, R`$\pi\delta(\omega)+\frac{1}{j\omega}$`],
    [R`$\sigma(t)e^{-at}$`, R`$\frac{1}{a+j\omega}$`],
    [R`$e^{-a|t|}$`, R`$\frac{2a}{a^2+\omega^2}$`],
    [R`$\sigma(t)te^{-at}$`, R`$\frac{1}{(a+j\omega)^2}$`],
    [R`$\delta(t-t_0)$`, R`$e^{-j\omega t_0}$`],
    [R`$e^{j\omega_0t}$`, R`$2\pi\delta(\omega-\omega_0)$`],
    [R`$\cos(\omega_0t)$`, R`$\pi[\delta(\omega-\omega_0)+\delta(\omega+\omega_0)]$`],
    [R`$\sin(\omega_0t)$`, R`$\frac{\pi}{j}[\delta(\omega-\omega_0)-\delta(\omega+\omega_0)]$`]
  ];
  gen('g.fttable', 'Korrespondenzen zuordnen', G7, 'Tabelle im Anhang', 'Anhang S. 2', 1, 3, () => {
    const sel = shuffle(FT_TABLE).slice(0, 4);
    return asQ('g.fttable', 'Anhang S. 2', 1, 3, { k: 'match', q: 'Ordne jedem Zeitsignal sein Spektrum zu. Diese Tabelle darfst du in der Klausur nachschlagen, aber du musst sie schnell finden.', pairs: sel.map((p) => [p[0], p[1]]) });
  });

  gen('g.ftprop', 'Eigenschaften anwenden', G7, R`$f(t-t_0)\;\circ\!\!-\!\!\bullet\;F(\omega)e^{-j\omega t_0}$`, 'Kap. 7 S. 6 bis 8', 2, 3, () => {
    const a = pick([1, 2, 3]);
    const t0 = pick([1, 2, 3]);
    const c = pick([2, 3, 4]);
    const w0 = pick([2, 3, 5]);
    const base = R`\frac{1}{${a}+j\omega}`;
    const f = R`\sigma(t)e^{-${co(a, 't')}}`;
    const task = pick([
      { q: R`f(t-${t0})`, r: R`e^{-j${t0}\omega}\,${base}`, w: [R`e^{j${t0}\omega}\,${base}`, R`\frac{1}{${a}+j(\omega-${t0})}`, R`${base}-${t0}`], e: 'Verschieben in der Zeit ändert nur die Phase: Der Faktor $e^{-j\\omega t_0}$ kommt hinzu, der Betrag bleibt gleich.' },
      { q: R`${c}\,f(t)`, r: R`\frac{${c}}{${a}+j\omega}`, w: [R`\frac{1}{${a}+j${c}\omega}`, R`\frac{1}{${c * a}+j\omega}`, R`\frac{1}{${a}+j\omega}+${c}`], e: 'Linearität: Ein konstanter Faktor bleibt einfach stehen.' },
      { q: R`f(${c}t)`, r: R`\frac{1}{${c}}\cdot\frac{1}{${a}+j\frac{\omega}{${c}}}`, w: [R`${c}\cdot\frac{1}{${a}+j${c}\omega}`, R`\frac{1}{${a}+j\frac{\omega}{${c}}}`, R`\frac{1}{${c}}\cdot\frac{1}{${a}+j${c}\omega}`], e: R`Skalierung: $f(ct)\;\circ\!\!-\!\!\bullet\;\frac{1}{|c|}F(\frac{\omega}{c})$. Stauchen in der Zeit dehnt das Spektrum.` },
      { q: R`\frac{df}{dt}`, r: R`\frac{j\omega}{${a}+j\omega}`, w: [R`\frac{1}{j\omega(${a}+j\omega)}`, R`\frac{-j\omega}{${a}+j\omega}`, R`\frac{\omega}{${a}+j\omega}`], e: 'Ableiten in der Zeit heißt Multiplizieren mit $j\\omega$ im Spektrum.' },
      { q: R`e^{j${w0}t}f(t)`, r: R`\frac{1}{${a}+j(\omega-${w0})}`, w: [R`\frac{1}{${a}+j(\omega+${w0})}`, R`e^{j${w0}\omega}\,${base}`, R`\frac{e^{j${w0}}}{${a}+j\omega}`], e: 'Dual zur Zeitverschiebung: Multiplizieren mit $e^{j\\omega_0t}$ verschiebt das Spektrum um $\\omega_0$ nach rechts.' }
    ]);
    return asQ('g.ftprop', 'Kap. 7 S. 6 bis 8', 2, 3, P.mc(R`Es sei $f(t)=${f}$ mit $F(\omega)=${base}$. Wie lautet die Transformierte von $${task.q}$?`, '$' + task.r + '$', task.w.map((x) => '$' + x + '$'), null, { steps: [task.e] }));
  });

  gen('g.ftdual', 'Dualität benutzen', G7, R`$F(t)\;\circ\!\!-\!\!\bullet\;2\pi f(-\omega)$`, 'Blatt 7-4, Kap. 7 S. 6', 2, 3, () => {
    const a = pick([1, 2, 3]);
    const w1 = pick([0, 0.5, 1]);
    const val = Sig.ftLorentz(a, w1);
    const a2 = a * a;
    return asQ('g.ftdual', 'Blatt 7-4', 2, 3, {
      k: 'walk',
      q: R`Bestimme die Transformierte von $f(t)=\frac{1}{${a2}+t^2}$, also $a=${a}$.`,
      parts: [
        P.mc('Welche bekannte Korrespondenz hat die gleiche Form, nur mit $\\omega$ statt $t$?', R`$e^{-a|t|}\;\circ\!\!-\!\!\bullet\;\frac{2a}{a^2+\omega^2}$`, [R`$\sigma(t)e^{-at}\;\circ\!\!-\!\!\bullet\;\frac{1}{a+j\omega}$`, R`$\delta(t)\;\circ\!\!-\!\!\bullet\;1$`], 'Der Bruch mit $a^2+\\ldots^2$ im Nenner steht rechts in der Tabelle. Die Dualität erlaubt, ihn links zu verwenden.'),
        P.mc(R`Die Dualität sagt: $\frac{2a}{a^2+t^2}\;\circ\!\!-\!\!\bullet\;2\pi e^{-a|\omega|}$. Unser $f(t)$ hat aber keine $2a$ im Zähler. Was tust du?`, R`Durch $2a$ teilen: $F(\omega)=\frac{\pi}{a}e^{-a|\omega|}$`, [R`Nichts: $F(\omega)=2\pi e^{-a|\omega|}$`, R`Mal $2a$ nehmen: $F(\omega)=4\pi ae^{-a|\omega|}$`], 'Linearität: Teilt man die Zeitfunktion durch $2a$, teilt sich auch das Spektrum durch $2a$.'),
        P.num(R`Wie groß ist $F(${dec(w1)})$ für $a=${a}$?`, val, R`$F(${dec(w1)})=\frac{\pi}{${a}}e^{-${a}\cdot ${dec(w1)}}=${dec(val)}$.`, 0.011)
      ]
    });
  });

  gen('g.ftline', 'Ungerade Funktion transformieren', G7, 'ungerade: Spektrum rein imaginär', 'Blatt 7-2', 3, 3, () => {
    const A = pick([1, 2, 3]);
    const a = pick([1, 2]);
    const w = pick([1, 2]);
    const im = Sig.ftLineIm(A, a, w);
    return asQ('g.ftline', 'Blatt 7-2', 3, 3, {
      k: 'walk',
      q: R`Gegeben ist $f(t)=\frac{${A}}{${a}}t$ für $-${a}\le t\le ${a}$, sonst $0$.`,
      fig: { t: 'plot', x: [-3, 3], y: [-A - 1, A + 1], xl: 't', curves: [{ f: (t) => (Math.abs(t) <= a ? (A / a) * t : 0), c: 'p' }] },
      parts: [
        P.fix('Was gilt für das Spektrum?', ['Es ist rein imaginär', 'Es ist rein reell', 'Es ist null'], 0, 'Die Funktion ist ungerade. Mit Euler bleibt nur $-j\\int f(t)\\sin(\\omega t)dt$ übrig, denn der Kosinusteil hebt sich weg.'),
        P.mc('Wie berechnet sich das Integral $\\int t\\,e^{-j\\omega t}dt$?', 'Mit partieller Integration, $u=t$', ['Mit der Siebeigenschaft', 'Direkt mit der Potenzregel'], 'Dasselbe Vorgehen wie beim Sägezahn der Fourier-Reihe.'),
        P.num(R`Das Ergebnis ist $F(\omega)=j\frac{2A}{\omega^2a}\left(\omega a\cos\omega a-\sin\omega a\right)$. Wie groß ist der Imaginärteil von $F(${w})$ für $A=${A}$ und $a=${a}$?`, im, R`Einsetzen im Bogenmaß: $\mathrm{Im}\,F(${w})=${dec(im)}$.`, 0.011)
      ]
    });
  });

  gen('g.ftuncert', 'Unschärfe: breit gegen schmal', G7, R`$\Delta t\cdot\Delta\omega\approx\text{const}$`, 'Kap. 7 S. 8', 1, 2, () => {
    const T = pick([1, 2, 4]);
    const c = pick([2, 3, 4]);
    const first = PI / T;
    return asQ('g.ftuncert', 'Kap. 7 S. 8', 1, 2, P.num(R`Ein Rechteck $f(t)$ der halben Breite $T=${T}$ hat seine erste Nullstelle im Spektrum bei $\omega=\frac{\pi}{${T}}$. Jetzt wird das Signal zeitlich um den Faktor ${c} **gestaucht**, also $f(${c}t)$. Wo liegt die erste Nullstelle jetzt? (Dezimalzahl oder z. B. π/2)`, (c * PI) / T, null, 0.02, {
      steps: [R`Skalierung: $f(${c}t)\;\circ\!\!-\!\!\bullet\;\frac{1}{${c}}F\left(\frac{\omega}{${c}}\right)$.`, R`Das Spektrum wird also um den Faktor ${c} breiter: $\omega=${c}\cdot\frac{\pi}{${T}}=${dec((c * PI) / T)}$ (vorher ${dec(first)}).`, 'Schmal in der Zeit bedeutet breit in der Frequenz.']
    }));
  });

  // ---------------------------------------------------------------------------
  const Calc = {};
  Calc.seed = (s) => {
    let x = s >>> 0 || 1;
    rnd = () => {
      x ^= x << 13;
      x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
      return x / 4294967296;
    };
  };
  Calc.list = () => gens.map(({ id, title, group, formula, ref, lvl, pts }) => ({ id, title, group, formula, ref, lvl, pts }));
  Calc.groups = () => Array.from(new Set(gens.map((g) => g.group)));
  Calc.has = (id) => gens.some((g) => g.id === id);
  Calc.make = (id) => {
    const g = gens.find((x) => x.id === id);
    if (!g) throw new Error('Unbekannter Aufgabentyp ' + id);
    return g.make();
  };
  Calc.pick = pick;
  Calc.shuffle = shuffle;

  root.SSEngine = { Sig, Calc, fmt: { dec, frac, piT, poly, co, plus, shiftT, round } };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SSEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
