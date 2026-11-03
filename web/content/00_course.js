// Kursdaten und Bausteine für alle Inhaltsdateien.
(function (root) {
  'use strict';
  const R = String.raw;

  root.SS_CONTENT = {
    course: {
      title: 'Signale und Systeme',
      subtitle: 'DHBW Stuttgart, Vorlesung von Miriam Haas',
      tagline: 'Vom ersten Sinus bis zur Fourier-Transformation. Alles von Grund auf erklärt und an den Übungsblättern geübt.',
      weightNote: 'Eine Altklausur gibt es im Kurs nicht. Die Anteile sind meine Schätzung aus dem Umfang der Übungsblätter.',
      examIntro: 'Probeklausuren unter echten Bedingungen: 48 Minuten, Rechnen auf Papier, danach Vergleich mit der Musterlösung.',
      examNote: R`Laut Moodle läuft Signale und Systeme im gemeinsamen 120-Minuten-Block und wird nach **48 Minuten** eingesammelt, danach folgt Netztechnik. Erlaubt sind **Papula-Formelsammlung, Skript und ein einfacher Taschenrechner**. Weil keine Altklausur vorliegt, sind Aufbau und Aufgabenstil dieser Probeklausuren eine begründete Schätzung nach den Übungsblättern.`,
      examTasks: [
        { no: 1, title: 'Signale einordnen und umformen', min: 8, pct: 17, what: 'Energie oder Leistung, gerader und ungerader Anteil, Sinus addieren. Grundlage: Kapitel 1 und 2, Blatt 1.' },
        { no: 2, title: 'Sprung, Rampe und Dirac', min: 8, pct: 17, what: 'Siebeigenschaft und Ableiten von Signalen mit Sprüngen. Grundlage: Kapitel 3, Blatt 2.' },
        { no: 3, title: 'Systeme untersuchen', min: 8, pct: 16, what: 'Linear, zeitinvariant, stabil, kausal. Grundlage: Kapitel 4, Blatt 3.' },
        { no: 4, title: 'Faltung', min: 10, pct: 20, what: 'Impulsantwort und Faltungsintegral nach dem 6-Schritte-Rezept. Grundlage: Kapitel 5, Blatt 5.' },
        { no: 5, title: 'Fourier-Reihe', min: 8, pct: 17, what: 'Koeffizientenvergleich, Analyse-Integral, Linienspektrum. Grundlage: Kapitel 6, Blatt 6.' },
        { no: 6, title: 'Fourier-Transformation', min: 6, pct: 13, what: 'Spektrum berechnen, Korrespondenzen und Eigenschaften benutzen. Grundlage: Kapitel 7, Blatt 7.' }
      ],
      sheets: [
        { no: 1, title: 'Blatt 1: Signale und Energie' },
        { no: 2, title: 'Blatt 2: Dirac und Ableitungen' },
        { no: 3, title: 'Blatt 3: Systemeigenschaften' },
        { no: 5, title: 'Blatt 5: Faltung' },
        { no: 6, title: 'Blatt 6: Fourier-Reihen' },
        { no: 7, title: 'Blatt 7: Fourier-Transformation' }
      ],
      errata: [
        R`**Blatt 2, Lösung 2-1 f:** Dort steht $e^{-2a}$. Richtig ist $\sigma(-a)\,e^{-a^2}\,\delta(t+a)$, denn bei $t=-a$ wird $e^{at}$ zu $e^{-a^2}$.`,
        R`**Blatt 6, Lösung 6-4:** $c_0$ fehlt und passt nicht in die allgemeine Formel. Getrennt gerechnet ist $c_0=1-\frac{2}{\pi}$.`,
        R`**Kapitel 4.7:** $y(k)=x(2k)$ wird als zeitinvariant bezeichnet. Es ist **zeitvariant**, denn $T\{x(k-k_0)\}=x(2k-k_0)$, aber $y(k-k_0)=x(2k-2k_0)$.`,
        R`**Kapitel 5, RC-Beispiel, letzte Zeile:** Richtig ist $y(t)=\sigma(t)\,a\,[t+RC\,e^{-t/RC}-RC]$. Am e-Term fehlt im Skript der Faktor $RC$.`,
        R`**Kapitel 3.2.3:** Die Rampenfolge ist für $k<0$ gleich $0$, nicht $1$.`,
        R`**Kapitel 3.2.4:** In der Summenformel muss $\delta(l)$ stehen, nicht $\delta(k)$.`,
        R`**Kapitel 6, Synthesegleichung:** Richtig ist $f(t)=\sum_{k=-\infty}^{\infty}c_ke^{jk\omega_0t}$ ohne das $dt$, und beim $b_k$-Term der reellen Reihe fehlt der Sinus.`,
        R`**Kapitel 6.2, Linienspektrum:** Beschriftung und Höhe im Beispiel passen nicht zusammen (gezeichnet $2$ statt $\frac32$), und die Achse trägt $k$ statt $k\omega_0$.`,
        R`**Kapitel 7.1.4:** In der Dualitätszeile muss $e^{+j\omega_0t}$ stehen.`,
        R`**Kapitel 2.2:** Die Reflexion erfolgt an der $y$-Achse, nicht an der $t$-Achse. Dazu zwei Tippfehler: "$ht-2$" und $e^{-\delta t\sin(\omega_0t)}$.`,
        R`**Anhang:** $\arctan\frac{b}{a}$ gilt als Winkel nur für $a>0$. Sonst muss man $\pi$ addieren oder abziehen.`
      ]
    },
    modules: [],
    exams: []
  };
  root.SS_MOD = (m) => root.SS_CONTENT.modules.push(m);

  // Kurzschreibweisen für Blöcke
  root.SSB = {
    p: (x) => ({ t: 'p', x }),
    h3: (x) => ({ t: 'h', x }),
    b: (...i) => ({ t: 'b', i }),
    k: (x) => ({ t: 'k', x }),
    w: (x) => ({ t: 'w', x }),
    ex: (x) => ({ t: 'ex', x }),
    i: (x, tag) => ({ t: 'i', x, tag }),
    err: (x) => ({ t: 'err', x }),
    f: (x, title) => ({ t: 'f', x, title }),
    tb: (head, rows, title) => ({ t: 'tb', head, rows, title }),
    plot: (spec) => Object.assign({ t: 'plot' }, spec),
    lab: (viz, params) => ({ t: 'x', viz, params }),
    st: (title, steps) => ({ t: 'st', title, steps })
  };
  // Kurzschreibweisen für Aufgaben
  const q = (id, k, text, rest) => Object.assign({ id, k, q: text, lvl: 1, pts: 1 }, rest);
  root.SSQ = {
    mc: (id, text, o, a, e, rest) => q(id, 'mc', text, Object.assign({ o, a: [a], e }, rest)),
    ms: (id, text, o, a, e, rest) => q(id, 'ms', text, Object.assign({ o, a, e }, rest)),
    tf: (id, text, st, rest) => q(id, 'tf', text, Object.assign({ st: st.map(([s, v, e]) => ({ s, v, e })) }, rest)),
    num: (id, text, value, e, rest) => q(id, 'num', text, Object.assign({ num: value, tol: 0.011, e }, rest)),
    match: (id, text, pairs, rest) => q(id, 'match', text, Object.assign({ pairs }, rest)),
    ord: (id, text, seq, e, rest) => q(id, 'ord', text, Object.assign({ seq, e }, rest)),
    open: (id, text, model, rest) => q(id, 'open', text, Object.assign({ model }, rest)),
    walk: (id, text, parts, rest) => q(id, 'walk', text, Object.assign({ parts, lvl: 2, pts: 3 }, rest))
  };
  root.SSW = {
    mc: (text, o, a, e, rest) => Object.assign({ k: 'mc', q: text, o, a: [a], e }, rest),
    fix: (text, o, a, e) => ({ k: 'mc', q: text, o, a: [a], e, keep: true }),
    num: (text, value, e, tol) => ({ k: 'num', q: text, num: value, tol: tol === undefined ? 0.011 : tol, e }),
    info: (x) => ({ k: 'info', x })
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
