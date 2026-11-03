// Läuft im Browser (siehe tools/test-ui.js): besucht alle Seiten, klickt alle Aufgaben durch und bedient alle Labore.
(function () {
  'use strict';
  const report = { width: innerWidth, routes: 0, sessions: 0, labsTouched: 0, solved: 0, checked: 0, errors: [], overflow: [] };
  window.addEventListener('error', (e) => report.errors.push('Skriptfehler: ' + e.message));
  const C = window.SS_CONTENT;
  const view = document.getElementById('view');
  const text = (el) => (el.textContent || '').trim();
  const button = (root, ...labels) => Array.from(root.querySelectorAll('button')).find((b) => !b.disabled && labels.some((l) => text(b).startsWith(l)));

  function checkLayout(where) {
    if (document.documentElement.scrollWidth > innerWidth + 1) report.overflow.push(where + ': Seite ist ' + document.documentElement.scrollWidth + ' px breit');
    if (view.querySelector('.katex-error')) report.errors.push(where + ': Formelfehler ' + text(view.querySelector('.katex-error')).slice(0, 60));
    for (const el of view.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right <= innerWidth + 1 || r.width === 0) continue;
      let scroller = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if (o === 'auto' || o === 'scroll' || o === 'hidden') { scroller = true; break; }
      }
      if (!scroller) {
        report.overflow.push(where + ': ' + el.tagName + '.' + (el.className.baseVal === undefined ? el.className : el.className.baseVal) + ' ragt ' + Math.round(r.right - innerWidth) + ' px hinaus');
        break;
      }
    }
  }
  function visit(hash) {
    try {
      location.hash = hash;
      SSApp.route();
      report.routes++;
      checkLayout('#' + hash);
    } catch (e) {
      report.errors.push('#' + hash + ': ' + e.message);
    }
  }

  // Alle Seiten
  ['heute', 'lernen', 'wiederholen', 'trainer', 'klausur'].forEach(visit);
  for (const m of C.modules) {
    visit(m.id);
    for (const s of m.sections) visit(s.id);
  }

  // Jede Aufgabe von Hand richtig beantworten: Die Punktewertung muss 100 % ergeben.
  function solve(q, d) {
    switch (q.k) {
      case 'mc': d.selected = [q.a[0]]; break;
      case 'ms': d.selected = q.a.slice(); break;
      case 'tf': q.st.forEach((s, i) => { d.tf[i] = s.v; }); break;
      case 'num': d.numText = String(q.num).replace('.', ','); break;
      case 'ord': d.order = q.seq.slice(); break;
      case 'match': q.pairs.forEach((p, i) => { d.match[i] = p[1]; }); break;
      case 'open': d.openChecks = q.model.map((_, i) => i); break;
      case 'walk':
        d.walkScores = q.parts.map((p) => {
          if (p.k === 'info') return 1;
          const sub = freshDraft(p);
          solve(p, sub);
          return scoreDraft(p, sub);
        });
        break;
    }
  }
  function checkScore(q) {
    report.checked++;
    const d = freshDraft(q);
    solve(q, d);
    const s = scoreDraft(q, d);
    if (s >= 0.999 && isAnswered(q, d)) report.solved++;
    else report.errors.push(q.id + ': richtige Antwort ergibt ' + s);
  }
  const all = [];
  C.modules.forEach((m) => m.questions.forEach((q) => all.push(q)));
  C.exams.forEach((e) => e.tasks.forEach((t) => t.questions.forEach((q) => all.push(q))));
  SSEngine.Calc.list().forEach((g) => { for (let i = 0; i < 20; i++) all.push(SSEngine.Calc.make(g.id)); });
  all.forEach(checkScore);

  // Jede Aufgabe einmal komplett durch die Oberfläche klicken, auch wenn die Antwort falsch ist.
  function driveSession(q, where) {
    const host = h('div', { class: 'stack' });
    view.replaceChildren(host);
    let done = false;
    runSession(host, { questions: [q], finish: () => { done = true; return h('span', null, 'Ende'); } });
    for (let guard = 0; guard < 200 && !done; guard++) {
      const now = host.querySelector('.walk-step.now');
      const scope = now || host;
      const opt = scope.querySelector('.opt:not([disabled])');
      if (opt && !scope.querySelector('.opt[aria-pressed="true"]')) opt.click();
      const input = scope.querySelector('input[type=text]:not([disabled])');
      if (input && !input.value) {
        input.value = '1';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const now2 = host.querySelector('.walk-step.now') || host;
      for (const row of now2.querySelectorAll('.tf')) {
        const yes = Array.from(row.querySelectorAll('button')).find((b) => text(b) === 'Richtig' && !b.disabled);
        if (yes && yes.getAttribute('aria-pressed') !== 'true') yes.click();
      }
      for (const row of now2.querySelectorAll('.match-row')) {
        if (!row.querySelector('.chip.on')) {
          const chip = row.querySelector('button.chip:not([disabled])');
          if (chip) chip.click();
        }
      }
      const step = host.querySelector('.walk-step.now') || host;
      const next = button(step, 'Prüfen', 'Nächster Schritt', 'Aufgabe abschließen', 'Fertig') || button(host, 'Prüfen', 'Musterlösung zeigen', 'Auswerten', 'Weiter', 'Abschließen');
      if (!next) {
        report.errors.push(where + ': kein Knopf zum Weitermachen, Text: ' + text(host).slice(0, 80));
        break;
      }
      checkLayout(where);
      next.click();
    }
    if (!done) report.errors.push(where + ': Sitzung endet nicht');
    report.sessions++;
  }
  C.modules.forEach((m) => m.questions.forEach((q) => { try { driveSession(q, q.id); } catch (e) { report.errors.push(q.id + ': ' + e.message); } }));
  SSEngine.Calc.list().forEach((g) => { try { driveSession(SSEngine.Calc.make(g.id), g.id); } catch (e) { report.errors.push(g.id + ': ' + e.message); } });

  // Alle Labore bedienen
  const labs = ['ops', 'evenodd', 'energy', 'delta', 'conv', 'convsum', 'fourier', 'spectrum', 'ft', 'lti'];
  for (const name of labs) {
    try {
      const host = h('div', { class: 'lab-host' });
      view.replaceChildren(host);
      window.SSLabs[name](host, {}, {});
      const chips = () => Array.from(host.querySelectorAll('button.chip'));
      const count = chips().length || 1;
      for (let i = 0; i < count; i++) {
        if (chips()[i]) chips()[i].click();
        for (const range of host.querySelectorAll('input[type=range]')) {
          for (const v of [range.min, range.max, range.value]) {
            range.value = v;
            range.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
        for (const seg of host.querySelectorAll('.seg button')) seg.click();
        const svg = host.innerHTML;
        if (/NaN|undefined/.test(svg)) report.errors.push(name + ': ungültige Werte in der Darstellung');
        checkLayout('Labor ' + name);
      }
      report.labsTouched++;
    } catch (e) {
      report.errors.push('Labor ' + name + ': ' + e.message);
    }
  }

  // Probeklausuren einmal durchspielen
  C.exams.forEach((e, idx) => {
    try {
      location.hash = 'klausur';
      SSApp.route();
      const start = Array.from(view.querySelectorAll('button')).filter((b) => text(b).includes('Minuten starten'))[idx];
      start.click();
      location.hash = 'pruefung';
      SSApp.route();
      checkLayout(e.id + ' Lauf');
      let weiter;
      while ((weiter = button(view, 'Weiter'))) {
        weiter.click();
        checkLayout(e.id + ' Lauf');
      }
      const abgeben = button(view, 'Abgeben');
      abgeben.click();
      button(view, 'Wirklich abgeben').click();
      checkLayout(e.id + ' Bewertung');
      const auswertung = button(view, 'Auswertung anzeigen');
      if (auswertung) auswertung.click();
      if (!text(view).includes('Auswertung')) report.errors.push(e.id + ': keine Auswertung');
      checkLayout(e.id + ' Auswertung');
    } catch (err) {
      report.errors.push(e.id + ': ' + err.message);
    }
  });

  // Der Lernstand muss überlebt haben.
  if (!Object.keys(Store.data.items).length) report.errors.push('Lernstand leer');
  const pre = document.createElement('pre');
  pre.id = 'r';
  pre.textContent = JSON.stringify(report);
  document.body.append(pre);
  if (window.parent !== window) window.parent.postMessage(pre.textContent, '*');
})();
