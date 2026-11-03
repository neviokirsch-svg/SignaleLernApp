// Fragetypen und Übungssitzung .
// Typen: mc, ms, tf, num, ord, match, open, lab und walk (geführte Aufgabe in Teilschritten).
(function () {
  'use strict';

  const shuffle = (a) => SSEngine.Calc.shuffle(a);

  window.freshDraft = function (q) {
    const d = { selected: [], tf: {}, numText: '', order: [], match: {}, openText: '', openChecks: [], labScore: null, optionOrder: [], matchChoices: [], walkIndex: 0, walkScores: [], walkDraft: null, walkChecked: false };
    const idx = (q.o || []).map((_, i) => i);
    d.optionOrder = q.keep ? idx : shuffle(idx);
    let seq = shuffle(q.seq || []);
    if (q.seq && seq.join('|') === q.seq.join('|') && seq.length > 1) seq = seq.slice().reverse();
    d.order = seq;
    d.matchChoices = shuffle(Array.from(new Set((q.pairs || []).map((p) => p[1]))));
    return d;
  };

  const parseNum = (s) => {
    let t = String(s).trim().replace(/\s/g, '').replace(/−/g, '-');
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    t = t.replace(/π|pi/gi, 'P');
    // Erlaubt auch Brüche und π, zum Beispiel 3/4, -1/2 oder 2π.
    const m = /^(-?)(\d*\.?\d*)(P?)(?:\/(\d*\.?\d*)(P?))?$/.exec(t);
    if (m && (m[2] || m[3])) {
      let v = (m[2] ? parseFloat(m[2]) : 1) * (m[3] ? Math.PI : 1);
      if (m[4] !== undefined) v /= (m[4] ? parseFloat(m[4]) : 1) * (m[5] ? Math.PI : 1);
      if (m[1]) v = -v;
      return Number.isFinite(v) ? v : null;
    }
    return null;
  };

  window.scoreDraft = function (q, d) {
    switch (q.k) {
      case 'mc':
        return d.selected[0] === (q.a || [])[0] ? 1 : 0;
      case 'ms': {
        const correct = q.a || [];
        if (!correct.length) return 0;
        const hits = d.selected.filter((x) => correct.includes(x)).length;
        const misses = d.selected.filter((x) => !correct.includes(x)).length;
        return Math.max(0, (hits - misses) / correct.length);
      }
      case 'tf': {
        const st = q.st || [];
        if (!st.length) return 0;
        return st.filter((s, i) => d.tf[i] === s.v).length / st.length;
      }
      case 'num': {
        const v = parseNum(d.numText);
        return v !== null && Math.abs(v - q.num) <= (q.tol === undefined ? 0.01 : q.tol) ? 1 : 0;
      }
      case 'ord': {
        const sol = q.seq || [];
        if (!sol.length) return 0;
        return d.order.filter((x, i) => sol[i] === x).length / sol.length;
      }
      case 'match': {
        const pairs = q.pairs || [];
        if (!pairs.length) return 0;
        return pairs.filter((p, i) => d.match[i] === p[1]).length / pairs.length;
      }
      case 'open': {
        const pts = q.model || [];
        return pts.length ? d.openChecks.length / pts.length : 0;
      }
      case 'lab':
        return d.labScore === null ? 0 : d.labScore;
      case 'walk':
        return (q.parts || []).length ? d.walkScores.reduce((a, b) => a + b, 0) / q.parts.length : 0;
      default:
        return 0;
    }
  };

  const isAnswered = (q, d) => {
    switch (q.k) {
      case 'mc': case 'ms': return d.selected.length > 0;
      case 'tf': return Object.keys(d.tf).length === (q.st || []).length;
      case 'num': return d.numText.trim() !== '';
      case 'ord': case 'open': return true;
      case 'match': return Object.keys(d.match).length > 0;
      case 'lab': return d.labScore !== null;
      case 'walk': return d.walkScores.length === (q.parts || []).length;
      default: return false;
    }
  };
  window.isAnswered = isAnswered;

  const KIND = { mc: 'Einfachauswahl', ms: 'Mehrfachauswahl', tf: 'Richtig oder falsch?', num: 'Rechenaufgabe', ord: 'Reihenfolge', match: 'Zuordnung', open: 'Auf Papier rechnen', lab: 'Interaktive Aufgabe', walk: 'Schritt für Schritt' };

  function srcLabel(src) {
    if (!src) return null;
    if (src === 'klausurnah') return h('span', { class: 'pill exam' }, 'klausurnah');
    if (src === 'trainer') return h('span', { class: 'pill' }, 'Neue Zahlen');
    if (/^Blatt/.test(src)) return h('span', { class: 'pill exam' }, src);
    return h('span', { class: 'pill' }, src);
  }

  window.questionHeader = function (q) {
    const dots = '●'.repeat(q.lvl || 1) + '○'.repeat(3 - (q.lvl || 1));
    return h('div', { class: 'stack-s' },
      h('div', { class: 'q-head' }, h('span', null, KIND[q.k] || ''), srcLabel(q.src), h('span', { class: 'dots3', 'aria-label': 'Schwierigkeit ' + (q.lvl || 1) + ' von 3' }, dots), h('span', { class: 'muted num' }, (q.pts || 0) + ' P.')),
      rich(q.q, 'q-text'));
  };

  window.questionInput = function (q, draft, opts) {
    const o = opts || {};
    const locked = !!o.locked;
    const show = !!o.showSolution;
    const changed = () => o.onChange && o.onChange();
    const box = h('div', { class: 'stack-s' });

    const draw = () => {
      box.replaceChildren();
      if (q.k === 'mc' || q.k === 'ms') {
        const correct = q.a || [];
        if (q.k === 'ms') box.append(h('div', { class: 'small muted' }, 'Mehrere Antworten können richtig sein.'));
        const compact = q.keep && (q.o || []).every((x) => x.length < 18);
        const list = h('div', { class: compact ? 'opts-grid' : 'stack-s' });
        for (const i of draft.optionOrder) {
          const sel = draft.selected.includes(i);
          let cls = 'opt';
          let ic = q.k === 'ms' ? (sel ? 'checksq' : 'square') : sel ? 'dot' : 'circle';
          if (show) {
            if (correct.includes(i)) { cls += ' ok'; ic = 'check'; }
            else if (sel) { cls += ' bad'; ic = 'cross'; }
          } else if (sel) cls += ' on';
          list.append(h('button', {
            type: 'button', class: cls, disabled: locked, 'aria-pressed': sel ? 'true' : 'false',
            onclick: () => {
              if (q.k === 'mc') draft.selected = [i];
              else draft.selected = sel ? draft.selected.filter((x) => x !== i) : draft.selected.concat(i);
              draw();
              changed();
            }
          }, icon(ic), h('span', { html: md(q.o[i]) })));
        }
        box.append(list);
      } else if (q.k === 'tf') {
        (q.st || []).forEach((s, i) => {
          const btn = (val, label) => {
            const on = draft.tf[i] === val;
            let cls = on ? 'on' : '';
            if (show) cls = s.v === val ? 'ok' : on ? 'bad' : '';
            return h('button', { type: 'button', class: cls || undefined, disabled: locked, 'aria-pressed': on ? 'true' : 'false', onclick: () => { draft.tf[i] = val; draw(); changed(); } }, label);
          };
          box.append(h('div', { class: 'tf' },
            rich(s.s, 'prose'),
            h('div', { class: 'pair' }, btn(true, 'Richtig'), btn(false, 'Falsch')),
            show && s.e ? rich(s.e, 'small muted') : null));
        });
      } else if (q.k === 'num') {
        const input = h('input', {
          type: 'text', inputmode: 'decimal', id: 'num-' + q.id, 'aria-label': 'Ergebnis', placeholder: 'Ergebnis', value: draft.numText, disabled: locked,
          class: show ? (scoreDraft(q, draft) >= 0.999 ? 'ok' : 'bad') : undefined,
          oninput: (e) => { draft.numText = e.target.value; changed(); }
        });
        box.append(h('div', { class: 'row' }, h('div', { class: 'grow' }, input), q.unit ? h('b', { class: 'muted' }, q.unit) : null));
        // Die Zifferntastatur des iPhones hat weder Minus noch Bruchstrich.
        if (!locked) {
          const put = (ch) => {
            const v = input.value;
            input.value = ch === '−' ? (v.startsWith('-') || v.startsWith('−') ? v.slice(1) : '−' + v) : v + ch;
            draft.numText = input.value;
            changed();
          };
          box.append(h('div', { class: 'num-keys' }, ['−', '/', 'π'].map((ch) =>
            h('button', { type: 'button', class: 'chip', 'aria-label': ch === '−' ? 'Vorzeichen wechseln' : ch + ' eingeben', onpointerdown: (e) => e.preventDefault(), onclick: () => put(ch) }, ch))));
        }
        if (show) box.append(h('b', { style: 'color:var(--good)' }, 'Lösung: ' + String(+(+q.num).toFixed(4)).replace('.', ',') + (q.unit ? ' ' + q.unit : '')));
      } else if (q.k === 'ord') {
        const sol = q.seq || [];
        draft.order.forEach((item, i) => {
          const right = sol[i] === item;
          box.append(h('div', { class: 'ord-item' },
            h('span', { class: 'n' }, String(i + 1)),
            h('span', { html: md(item) }),
            locked
              ? (show ? h('span', { style: 'color:var(--' + (right ? 'good' : 'bad') + ');width:22px' }, icon(right ? 'check' : 'cross')) : h('span'))
              : h('span', { class: 'row', style: 'gap:4px' },
                  h('button', { type: 'button', 'aria-label': 'Nach oben', disabled: i === 0, onclick: () => { [draft.order[i - 1], draft.order[i]] = [draft.order[i], draft.order[i - 1]]; draw(); changed(); } }, icon('up')),
                  h('button', { type: 'button', 'aria-label': 'Nach unten', disabled: i === draft.order.length - 1, onclick: () => { [draft.order[i + 1], draft.order[i]] = [draft.order[i], draft.order[i + 1]]; draw(); changed(); } }, icon('down')))));
        });
        if (show) {
          box.append(h('div', { class: 'caption ok small' }, h('b', null, 'Richtige Reihenfolge'), h('ol', { style: 'margin:4px 0 0;padding-left:20px' }, sol.map((x) => h('li', { html: md(x) })))));
        }
      } else if (q.k === 'match') {
        (q.pairs || []).forEach((p, i) => {
          box.append(h('div', { class: 'match-row' }, rich(p[0], 'prose'),
            h('div', { class: 'row wrap', style: 'gap:6px' }, draft.matchChoices.map((c) => {
              const on = draft.match[i] === c;
              let cls = 'chip' + (on ? ' on' : '');
              if (show) cls = 'chip' + (p[1] === c ? ' ok' : on ? ' bad' : '');
              return h('button', { type: 'button', class: cls, disabled: locked, 'aria-pressed': on ? 'true' : 'false', html: md(c), onclick: () => { if (on) delete draft.match[i]; else draft.match[i] = c; draw(); changed(); } });
            })),
            show && p[2] ? rich(p[2], 'small muted') : null));
        });
      } else if (q.k === 'open') {
        box.append(h('textarea', { id: 'o-' + q.id, 'aria-label': 'Deine Antwort', placeholder: 'Rechne auf Papier. Hier kannst du dein Ergebnis notieren.', disabled: locked && !show, oninput: (e) => { draft.openText = e.target.value; } }, draft.openText));
        if (show) {
          box.append(h('div', { class: 'small muted' }, 'Vergleiche mit der Musterlösung und hake ab, was du hattest:'));
          (q.model || []).forEach((pt, i) => {
            const on = draft.openChecks.includes(i);
            box.append(h('button', { type: 'button', class: 'check-item' + (on ? ' on' : ''), 'aria-pressed': on ? 'true' : 'false', onclick: () => { draft.openChecks = on ? draft.openChecks.filter((x) => x !== i) : draft.openChecks.concat(i); draw(); changed(); } }, icon(on ? 'checksq' : 'square'), h('span', { html: md(pt) })));
          });
        }
      } else if (q.k === 'walk') {
        drawWalk(q, draft, box, locked || show, () => { draw(); changed(); });
      } else if (q.k === 'lab') {
        if (!draft.labHost) {
          draft.labHost = h('div', { class: 'lab-host' });
          const fn = window.SSLabs[q.viz];
          if (fn) fn(draft.labHost, q.params || {}, { done: (score) => { draft.labScore = score; changed(); } });
          if (q.params && q.params.autoDone) draft.labScore = 1;
          else draft.labHost.append(caption('Labor „' + q.viz + '“ fehlt.', 'bad'));
        }
        box.append(draft.labHost);
      }
    };
    draw();
    return box;
  };

  // Jeder Teilschritt wird einmal geprüft. Danach steht die Erklärung da, und es geht weiter.
  function drawWalk(q, d, box, done, redraw) {
    const parts = q.parts || [];
    const shown = done ? parts.length : Math.min(d.walkIndex + 1, parts.length);
    for (let i = 0; i < shown; i++) {
      const p = parts[i];
      const past = i < d.walkIndex || done;
      const pid = Object.assign({ id: q.id + '.' + i }, p);
      if (!d['w' + i]) d['w' + i] = freshDraft(pid);
      const sub = d['w' + i];
      const checked = past || (i === d.walkIndex && d.walkChecked);
      const card = h('div', { class: 'walk-step' + (checked ? ' done' : ' now') },
        h('div', { class: 'walk-no' }, 'Schritt ' + (i + 1) + ' von ' + parts.length),
        p.k === 'info' ? null : rich(p.q, 'q-text'));
      if (p.k === 'info') {
        card.append(renderBlocks(p.blocks || [{ t: 'p', x: p.x }]));
        if (!past && i === d.walkIndex) {
          card.append(h('button', { type: 'button', class: 'btn pri full', onclick: () => { d.walkScores[i] = 1; d.walkIndex = i + 1; d.walkChecked = false; redraw(); } }, i + 1 < parts.length ? 'Weiter' : 'Fertig'));
        }
        box.append(card);
        continue;
      }
      if (p.fig) card.append(renderBlock(p.fig));
      const inner = questionInput(pid, sub, { locked: checked, showSolution: checked, onChange: () => { if (btn) btn.disabled = !isAnswered(pid, sub); } });
      card.append(inner);
      let btn = null;
      if (i === d.walkIndex && !done) {
        if (!d.walkChecked) {
          btn = h('button', { type: 'button', class: 'btn pri full', disabled: !isAnswered(pid, sub), onclick: () => { d.walkScores[i] = scoreDraft(pid, sub); d.walkChecked = true; redraw(); } }, 'Prüfen');
          card.append(btn);
        } else {
          card.append(walkExplain(p, d.walkScores[i]));
          card.append(h('button', { type: 'button', class: 'btn pri full', onclick: () => { d.walkIndex = i + 1; d.walkChecked = false; redraw(); } }, i + 1 < parts.length ? 'Nächster Schritt' : 'Aufgabe abschließen'));
        }
      } else if (checked) {
        card.append(walkExplain(p, d.walkScores[i]));
      }
      box.append(card);
    }
  }
  function walkExplain(p, score) {
    const good = score >= 0.999;
    return h('div', { class: 'walk-e ' + (good ? 'ok' : 'bad') }, p.e ? rich(p.e, 'prose') : h('span', null, good ? 'Richtig.' : 'Siehe Lösung oben.'));
  }

  window.solutionPanel = function (q, score) {
    const items = [];
    if (q.k !== 'open' && q.k !== 'walk') {
      const state = score >= 0.999 ? ['ok', 'check', 'Richtig!'] : score > 0 ? ['part', 'half', 'Teilweise richtig'] : ['bad', 'cross', 'Noch nicht richtig'];
      items.push(h('div', { class: 'sol-head ' + state[0] }, icon(state[1]), h('span', null, state[2])));
    }
    if (q.steps && q.steps.length) {
      items.push(h('div', { class: 'stack-s' }, h('div', { class: 'eyebrow' }, 'Lösungsweg'), h('ol', { class: 'steps' }, q.steps.map((s) => h('li', null, h('span', { html: md(s) }))))));
    }
    if (q.e) items.push(rich(q.e, 'prose'));
    if (q.sol) items.push(renderBlocks(q.sol));
    if (q.ref) items.push(h('div', { class: 'ref' }, 'Nachlesen: ' + refLabel(q.ref)));
    return h('div', { class: 'card stack fade-in', role: 'status' }, items);
  };

  // Eine Sitzung läuft wie in der App: falsche Aufgaben kommen einmal wieder.
  window.runSession = function (host, cfg) {
    const queue = cfg.questions.slice();
    const requeued = new Set();
    const wrong = new Set();
    let index = 0;
    let total = 0;
    let max = 0;
    let finished = false;

    const apply = (q, d) => {
      const s = scoreDraft(q, d);
      total += s * (q.pts || 1);
      max += q.pts || 1;
      const rating = s >= 0.999 ? 'good' : s >= 0.5 ? 'hard' : 'wrong';
      Store.record(q.id, rating);
      if (rating === 'wrong') {
        wrong.add(q.id);
        if (!requeued.has(q.id) && q.k !== 'lab' && q.k !== 'open') {
          requeued.add(q.id);
          queue.push(q);
        }
      }
    };

    const showSummary = () => {
      finished = true;
      const ratio = max ? total / max : 0;
      host.replaceChildren(
        h('div', { class: 'card stack fade-in', style: 'align-items:center;text-align:center' },
          h('div', { style: 'position:relative;width:128px;height:128px' }, ring(ratio, 128, ratio >= 0.5 ? 'var(--good)' : 'var(--warn)', 12), h('b', { style: 'position:absolute;inset:0;display:grid;place-items:center;font-size:1.6rem' }, Math.round(ratio * 100) + ' %')),
          h('h2', null, cfg.questions.length ? 'Sitzung abgeschlossen' : 'Gerade ist nichts zu tun.'),
          cfg.questions.length ? h('div', { class: 'muted num' }, total.toFixed(1).replace('.', ',') + ' von ' + max + ' Punkten') : null,
          wrong.size ? h('div', { class: 'small', style: 'color:var(--warn)' }, wrong.size + (wrong.size === 1 ? ' Aufgabe kommt' : ' Aufgaben kommen') + ' bald in der Wiederholung wieder.') : null,
          cfg.finish ? cfg.finish() : null));
      window.scrollTo({ top: 0 });
    };

    const showQuestion = () => {
      const q = queue[index];
      const d = freshDraft(q);
      let revealed = false;
      const headCard = h('div', { class: 'card stack' }, questionHeader(q), q.fig ? renderBlock(q.fig) : null);
      const inputCard = h('div', { class: q.k === 'lab' ? 'stack' : 'card stack' });
      const after = h('div', { class: 'stack' });
      const action = h('div');

      const drawInput = () => {
        inputCard.replaceChildren(questionInput(q, d, {
          locked: revealed && q.k !== 'open',
          showSolution: revealed,
          onChange: () => { drawAction(); }
        }));
      };
      const drawAction = () => {
        if (!revealed) {
          const answered = isAnswered(q, d);
          const label = q.k === 'open' ? 'Musterlösung zeigen' : q.k === 'lab' ? (answered ? 'Auswerten' : 'Erst die Aufgabe lösen') : q.k === 'walk' ? (answered ? 'Auswerten' : 'Erst alle Schritte lösen') : 'Prüfen';
          action.replaceChildren(h('button', {
            type: 'button', class: 'btn pri full', disabled: !answered,
            onclick: () => {
              revealed = true;
              if (q.k !== 'open') apply(q, d);
              if (q.k !== 'lab') drawInput();
              after.replaceChildren(solutionPanel(q, scoreDraft(q, d)));
              drawAction();
            }
          }, label));
        } else {
          action.replaceChildren(h('button', {
            type: 'button', class: 'btn pri full',
            onclick: () => {
              if (q.k === 'open') apply(q, d);
              if (index + 1 < queue.length) {
                index++;
                showQuestion();
                window.scrollTo({ top: 0 });
              } else showSummary();
            }
          }, index + 1 < queue.length ? 'Weiter' : 'Abschließen'));
        }
      };
      drawInput();
      drawAction();
      host.replaceChildren(
        h('div', { class: 'row small muted' }, h('div', { class: 'grow bar' }, h('i', { style: 'width:' + (index / Math.max(queue.length, 1)) * 100 + '%' })), h('span', { class: 'num' }, index + 1 + '/' + queue.length)),
        headCard, inputCard, after, action);
    };

    if (!queue.length) showSummary();
    else showQuestion();
    return { get finished() { return finished; } };
  };
})();
