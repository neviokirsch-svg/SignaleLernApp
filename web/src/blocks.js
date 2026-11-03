// Darstellung der Inhaltsblöcke aus den module_*.json (Inhalte stehen in web/content).
(function () {
  'use strict';

  window.refLabel = (ref) => ref;

  const R = {
    p: (b) => rich(b.x, 'prose'),
    h: (b) => h('h3', { class: 'sub', html: md(b.x) }),
    b: (b) => h('ul', { class: 'points' }, (b.i || []).map((x) => h('li', { html: md(x) }))),
    k: (b) => callout('k', 'bulb', 'Merke', b.x),
    i: (b) => callout('i', 'bulb', b.tag || 'Anschaulich', b.x),
    err: (b) => callout('w', 'warn', 'Achtung, Fehler in der Vorlage', b.x),
    w: (b) => callout('w', 'warn', 'Typischer Fehler', b.x),
    ex: (b) => callout('ex', 'target', 'Rechenrezept', b.x),
    f: (b) => h('div', { class: 'formula' }, h('div', { html: md(/\$/.test(b.x) ? b.x : '$$' + b.x + '$$') }), b.title ? h('small', { html: md(b.title) }) : null),
    s: (b) => h('div', { class: 'schema', html: md(b.x) }),
    code: (b) => h('pre', { class: 'code' }, b.x),
    tb: (b) => relTable({ title: b.title, head: b.head || [], rows: b.rows || [] }, { data: false }),
    rels: (b) => relGroup(b.tabs || []),
    st: (b) => stepBlock(b),
    plot: (b) => plotFigure(b),
    x: (b) => labBlock(b)
  };

  function callout(cls, ic, tag, text) {
    return h('div', { class: 'call ' + cls }, icon(ic), h('div', { class: 'prose' }, h('span', { class: 'tag' }, tag), h('span', { html: md(text) })));
  }

  window.renderBlock = function (b) {
    const fn = R[b.t];
    if (!fn) return h('div', { class: 'caption bad' }, 'Unbekannter Blocktyp: ' + b.t);
    return fn(b);
  };
  window.renderBlocks = (list) => h('div', { class: 'blocks' }, (list || []).map(renderBlock));

  // Schrittfolge mit Text, Formel und Tabellen, z. B. die Division.
  function stepBlock(b) {
    const stage = h('div', { class: 'stack' });
    const dots = b.steps.length - 1;
    const controls = stepControls(dots, (i) => {
      const s = b.steps[i];
      stage.replaceChildren(
        ...[
          s.f ? h('div', { class: 'formula fade-in', html: md(/\$/.test(s.f) ? s.f : '$$' + s.f + '$$') }) : null,
          s.plot ? plotFigure(s.plot) : null,
          s.tabs ? relGroup(s.tabs) : null,
          s.x ? caption(s.x) : null
        ].filter(Boolean)
      );
    });
    return vizCard(b.title || 'Schritt für Schritt', stage, controls.el);
  }

  function labBlock(b) {
    const host = h('div', { class: 'lab-host' });
    const fn = window.SSLabs && window.SSLabs[b.viz];
    if (!fn) {
      host.append(caption('Labor „' + b.viz + '“ nicht gefunden.', 'bad'));
      return host;
    }
    fn(host, b.params || {}, {});
    return host;
  }
  window.SSLabs = window.SSLabs || {};
})();
