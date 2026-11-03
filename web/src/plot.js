// Zeichnet Signale als SVG: Kurven mit sauberen Sprüngen, Dirac-Pfeile, Stielfolgen und Linienspektren.
(function () {
  'use strict';

  const COLORS = { p: 'var(--primary)', g: 'var(--good)', b: 'var(--bad)', w: 'var(--warn)', v: 'var(--violet)', t: 'var(--teal)', m: 'var(--muted)', f: 'var(--fg)' };
  const color = (c) => COLORS[c] || COLORS.p;
  let uid = 0;

  function niceStep(range, count) {
    const raw = range / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }
  function autoTicks(a, b, count) {
    const step = niceStep(b - a, count);
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) {
      const r = Math.round(v / step) * step;
      if (Math.abs(r) > 1e-9) out.push(+r.toFixed(6));
    }
    return out;
  }
  const label = (v) => String(+(+v).toFixed(3)).replace('.', ',').replace('-', '−');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  window.plotSVG = function (s) {
    const W = s.w || 420;
    const H = s.h || 190;
    const L = 30;
    const R = 16;
    const T = 14;
    const B = 22;
    const [x0, x1] = s.x;
    const [y0, y1] = s.y;
    const X = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R);
    const Y = (y) => T + ((y1 - y) / (y1 - y0)) * (H - T - B);
    const id = 'clip' + ++uid;
    const range = y1 - y0;
    const axisY = Y(Math.max(y0, Math.min(y1, 0)));
    const axisX = X(Math.max(x0, Math.min(x1, 0)));
    let out = '<svg class="plot" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(s.alt || s.yl || 'Signalverlauf') + '">';
    out += '<defs><clipPath id="' + id + '"><rect x="' + L + '" y="' + (T - 4) + '" width="' + (W - L - R + 2) + '" height="' + (H - T - B + 8) + '"/></clipPath>';
    out += '<marker id="' + id + 'a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z" fill="context-stroke"/></marker></defs>';

    const xt = s.xt || autoTicks(x0, x1, s.xn || 6);
    const yt = s.yt || autoTicks(y0, y1, s.yn || 3);
    for (const v of yt) {
      const val = Array.isArray(v) ? v[0] : v;
      const txt = Array.isArray(v) ? v[1] : label(v);
      if (val < y0 || val > y1) continue;
      out += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(val) + '" y2="' + Y(val) + '"/>';
      out += '<text class="tick" x="' + (axisX - 4 < L + 6 ? L - 3 : axisX - 4) + '" y="' + (Y(val) + 3.5) + '" text-anchor="end">' + esc(txt) + '</text>';
    }
    for (const v of xt) {
      const val = Array.isArray(v) ? v[0] : v;
      const txt = Array.isArray(v) ? v[1] : label(v);
      if (val < x0 || val > x1) continue;
      out += '<line class="axis" x1="' + X(val) + '" x2="' + X(val) + '" y1="' + (axisY - 3) + '" y2="' + (axisY + 3) + '"/>';
      out += '<text class="tick" x="' + X(val) + '" y="' + Math.min(axisY + 14, H - 3) + '" text-anchor="middle">' + esc(txt) + '</text>';
    }
    out += '<line class="axis" x1="' + L + '" x2="' + (W - R + 6) + '" y1="' + axisY + '" y2="' + axisY + '" marker-end="url(#' + id + 'a)" stroke="var(--muted)"/>';
    out += '<line class="axis" x1="' + axisX + '" x2="' + axisX + '" y1="' + (H - B + 4) + '" y2="' + (T - 8) + '" marker-end="url(#' + id + 'a)" stroke="var(--muted)"/>';
    if (s.xl) out += '<text x="' + (W - R + 4) + '" y="' + (axisY - 6) + '" text-anchor="end">' + esc(s.xl) + '</text>';
    if (s.yl) out += '<text x="' + (axisX + 7) + '" y="' + (T + 3) + '">' + esc(s.yl) + '</text>';

    out += '<g clip-path="url(#' + id + ')">';
    for (const b of s.bands || []) {
      out += '<rect x="' + X(b.a) + '" y="' + T + '" width="' + (X(b.b) - X(b.a)) + '" height="' + (H - T - B) + '" fill="' + color(b.c || 'p') + '" opacity="' + (b.o || 0.12) + '"/>';
    }
    for (const c of s.curves || []) out += curve(c, x0, x1, range, X, Y, axisY);
    out += '</g>';

    for (const v of s.vlines || []) {
      out += '<line x1="' + X(v.x) + '" x2="' + X(v.x) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="' + color(v.c || 'm') + '" stroke-dasharray="4 3" stroke-width="1.2"/>';
      if (v.l) out += '<text x="' + (X(v.x) + 4) + '" y="' + (T + 10) + '" style="fill:' + color(v.c || 'm') + '">' + esc(v.l) + '</text>';
    }
    for (const d of s.deltas || []) {
      const c = color(d.c || 'b');
      out += '<line x1="' + X(d.x) + '" x2="' + X(d.x) + '" y1="' + axisY + '" y2="' + Y(d.h === undefined ? 1 : d.h) + '" stroke="' + c + '" stroke-width="2.2" marker-end="url(#' + id + 'a)"/>';
      if (d.l) out += '<text x="' + (X(d.x) + 6) + '" y="' + (Y(d.h === undefined ? 1 : d.h) + 11) + '" style="fill:' + c + '">' + esc(d.l) + '</text>';
    }
    for (const st of s.stems || []) {
      const c = color(st.c || 'p');
      st.k.forEach((k, i) => {
        const v = st.v[i];
        if (k < x0 - 1e-9 || k > x1 + 1e-9) return;
        out += '<line x1="' + X(k) + '" x2="' + X(k) + '" y1="' + axisY + '" y2="' + Y(v) + '" stroke="' + c + '" stroke-width="' + (st.hl === k ? 3 : 2) + '"/>';
        out += '<circle cx="' + X(k) + '" cy="' + Y(v) + '" r="' + (st.hl === k ? 4.6 : 3.2) + '" fill="' + c + '"/>';
      });
    }
    for (const p of s.points || []) {
      const c = color(p.c || 'p');
      out += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="' + (p.r || 3.6) + '" fill="' + (p.open ? 'var(--solid)' : c) + '" stroke="' + c + '" stroke-width="1.8"/>';
      if (p.l) out += '<text x="' + (X(p.x) + 6) + '" y="' + (Y(p.y) - 6) + '" style="fill:' + c + '">' + esc(p.l) + '</text>';
    }
    return out + '</svg>';
  };

  // Ein echter Sprung bleibt auch bei immer kleinerem Abstand groß; eine steile Flanke nicht.
  function isJump(f, a, b, ya, yb, limit) {
    let la = a;
    let lb = b;
    let fa = ya;
    let fb = yb;
    for (let i = 0; i < 14; i++) {
      const m = (la + lb) / 2;
      const fm = f(m);
      if (!Number.isFinite(fm)) return true;
      if (Math.abs(fm - fa) >= Math.abs(fb - fm)) {
        lb = m;
        fb = fm;
      } else {
        la = m;
        fa = fm;
      }
      if (Math.abs(fb - fa) < limit * 0.25) return false;
    }
    return true;
  }

  function curve(c, x0, x1, range, X, Y, axisY) {
    const N = c.n || 420;
    const limit = range * 0.08;
    const pieces = [];
    let cur = [];
    let px = null;
    let py = null;
    const a = c.from === undefined ? x0 : Math.max(x0, c.from);
    const b = c.to === undefined ? x1 : Math.min(x1, c.to);
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N;
      const y = c.f(x);
      if (!Number.isFinite(y)) {
        if (cur.length) pieces.push(cur);
        cur = [];
        px = null;
        continue;
      }
      if (px !== null && Math.abs(y - py) > limit && isJump(c.f, px, x, py, y, limit)) {
        if (cur.length) pieces.push(cur);
        cur = [];
      }
      cur.push([x, y]);
      px = x;
      py = y;
    }
    if (cur.length) pieces.push(cur);
    let out = '';
    const pathOf = (p) => p.map((q, i) => (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(Math.max(-1e4, Math.min(1e4, q[1]))).toFixed(1)).join('');
    if (c.fill) {
      for (const p of pieces) {
        out += '<path d="' + pathOf(p) + 'L' + X(p[p.length - 1][0]).toFixed(1) + ' ' + axisY + 'L' + X(p[0][0]).toFixed(1) + ' ' + axisY + 'Z" fill="' + color(c.c) + '" opacity="' + (c.fo || 0.22) + '" stroke="none"/>';
      }
    }
    if (c.line !== false) {
      for (const p of pieces) {
        out += '<path d="' + pathOf(p) + '" fill="none" stroke="' + color(c.c) + '" stroke-width="' + (c.w || 2.2) + '" stroke-linejoin="round" stroke-linecap="round"' + (c.d ? ' stroke-dasharray="' + c.d + '"' : '') + (c.o ? ' opacity="' + c.o + '"' : '') + '/>';
      }
    }
    return out;
  }

  window.plotFigure = function (b) {
    const named = (b.curves || []).concat(b.deltas || [], b.stems || []).filter((c) => c.label);
    return h('figure', { class: 'plot-box', style: 'margin:0' },
      b.title ? h('figcaption', { class: 'plot-title', html: md(b.title) }) : null,
      h('div', { html: plotSVG(b) }),
      named.length ? legend(named) : null,
      b.cap ? h('div', { class: 'plot-cap', html: md(b.cap) }) : null);
  };
  function legend(list) {
    return h('div', { class: 'legend-s' }, list.map((c) => h('span', null, h('i', { style: 'background:' + color(c.c || 'p') }), h('span', { html: md(c.label) }))));
  }
  window.plotLegend = legend;
})();
