// Kapitel 3: Elementarsignale, Blatt 2.
(function () {
  'use strict';
  const R = String.raw;
  const { p, h3, b, k, w, ex, i, err, f, tb, plot, lab, st } = SSB;
  const Q = SSQ;
  const W = SSW;
  const { sig, ramp } = SSEngine.Sig;

  SS_MOD({
    id: 'm05', order: 5, exam: 2, weight: 5, glyph: 'σ', title: 'Sprung, Rechteck und Rampe', src: 'Kap. 3, S. 1 bis 8',
    goal: 'Du kennst die Testsignale, mit denen man Systeme untersucht, und kannst Signale aus Sprüngen und Rampen zusammensetzen.',
    sections: [
      {
        id: 'm05s1', title: 'Die Sprungfunktion', practice: ['m05q1', 'g.pulse'],
        blocks: [
          p(R`Die **Sprungfunktion** $\sigma(t)$ ist der einfachste Einschaltvorgang: Bis $t=0$ ist alles aus, ab $t=0$ ist alles an. Denk an einen Lichtschalter.`),
          f(R`\sigma(t)=\begin{cases}1 & t\ge 0\\ 0 & t<0\end{cases}`),
          plot({ title: R`$\sigma(t)$ und $\sigma(t-2)$`, x: [-3, 5], y: [-0.3, 1.4], xl: 't', yt: [1], curves: [{ f: sig, c: 'p', label: R`$\sigma(t)$` }, { f: (t) => sig(t - 2), c: 'w', d: '6 3', label: R`$\sigma(t-2)$ springt bei $t=+2$` }], h: 150 }),
          h3('Signale zusammensetzen'),
          p(R`Mit Sprüngen kannst du jede Treppe bauen: Jeder Sprung nach oben ist ein $+\sigma$, jeder Sprung nach unten ein $-\sigma$. Ein Rechteck von $a$ bis $b$ mit Höhe $A$ ist also:`),
          f(R`s(t)=A\,[\sigma(t-a)-\sigma(t-b)]`),
          plot({ title: R`$2\,[\sigma(t-1)-\sigma(t-3)]$`, x: [-1, 5], y: [-0.4, 2.6], xl: 't', yt: [2], curves: [{ f: (t) => 2 * (sig(t - 1) - sig(t - 3)), c: 'p' }], h: 130 }),
          k(R`Außerdem schaltet $\sigma(t-t_0)$ jedes andere Signal ein: $\sigma(t)\cos(t)$ ist ein Kosinus, der bei $t=0$ beginnt.`)
        ]
      },
      {
        id: 'm05s2', title: 'Signum und Rechteckimpuls', practice: ['m05q2', 'm05q3', 'm05q6'],
        blocks: [
          p(R`Die **Signumfunktion** liefert nur das Vorzeichen. Sie entsteht aus zwei Sprungfunktionen:`),
          f(R`\mathrm{sgn}(t)=\begin{cases}1 & t>0\\ -1 & t<0\end{cases}=2\sigma(t)-1=\sigma(t)-\sigma(-t)`),
          p(R`Der **Rechteckimpuls** $\mathrm{rect}(t)$ hat die Breite $1$, die Höhe $1$ und liegt symmetrisch um $0$:`),
          f(R`\mathrm{rect}(t)=\sigma\left(t+\tfrac12\right)-\sigma\left(t-\tfrac12\right)`),
          plot({ x: [-2, 2], y: [-1.3, 1.4], xl: 't', yt: [-1, 1], curves: [{ f: (t) => (t >= 0 ? 1 : -1), c: 'p', label: R`$\mathrm{sgn}(t)$` }, { f: (t) => sig(t + 0.5) - sig(t - 0.5), c: 'w', d: '6 3', label: R`$\mathrm{rect}(t)$` }], h: 150 })
        ]
      },
      {
        id: 'm05s3', title: 'Die Rampe', practice: ['m05q4', 'g.stepval'],
        blocks: [
          p(R`Die **Rampenfunktion** $\varrho(t)$ ist links von $0$ null und steigt dann mit Steigung $1$. Sie ist das Integral der Sprungfunktion.`),
          f(R`\varrho(t)=\sigma(t)\cdot t=\int_{-\infty}^{t}\sigma(\tau)\,d\tau,\qquad\sigma(t)=\frac{d\varrho}{dt}`),
          plot({ title: R`$\varrho(t)$ und $\varrho(t-1)$`, x: [-2, 4], y: [-0.4, 3.4], xl: 't', yn: 3, curves: [{ f: ramp, c: 'p', label: R`$\varrho(t)$` }, { f: (t) => ramp(t - 1), c: 'w', d: '6 3', label: R`$\varrho(t-1)=\sigma(t-1)(t-1)$` }], h: 150 }),
          w(R`$\varrho(t-t_0)=\sigma(t-t_0)\cdot(t-t_0)$. Im zweiten Faktor muss das $-t_0$ auch stehen. $\sigma(t-1)\cdot t$ wäre eine andere Funktion, sie springt bei $t=1$ auf den Wert $1$.`)
        ]
      },
      {
        id: 'm05s4', title: 'Kosinus, Burst und Chirp', practice: ['m05q5'],
        blocks: [
          p(R`Das **Kosinussignal** ist $x(t)=\hat{x}\cos(\omega t+\varphi_0)$. Der Scheitelwert liegt nicht bei $0$, sondern bei $t_0=-\frac{\varphi_0}{\omega}$.`),
          plot({ title: R`$\cos(2t+1)$: Das Maximum liegt bei $t_0=-\frac12$`, x: [-3, 4], y: [-1.3, 1.3], xl: 't', yt: [-1, 1], curves: [{ f: (t) => Math.cos(2 * t + 1), c: 'p' }], points: [{ x: -0.5, y: 1, c: 'w' }], h: 130 }),
          p('Zwei abgeleitete Testsignale:'),
          b('**Burst:** Eine Schwingung, die nur für eine begrenzte Zeit an ist, also ein Kosinus mal ein Rechteck.', '**Chirp:** Eine Schwingung, deren Frequenz sich mit der Zeit ändert.'),
          plot({ title: 'Burst', x: [-1, 7], y: [-1.3, 1.3], xl: 't', yt: [-1, 1], curves: [{ f: (t) => (sig(t - 1) - sig(t - 5)) * Math.cos(8 * t), c: 'p', w: 1.4, n: 800 }], h: 110 }),
          plot({ title: 'Chirp', x: [0, 7], y: [-1.3, 1.3], xl: 't', yt: [-1, 1], curves: [{ f: (t) => Math.cos(1.2 * t * t), c: 'w', w: 1.4, n: 900 }], h: 110 })
        ]
      }
    ],
    questions: [
      Q.num('m05q1', R`Wie groß ist $3\,[\sigma(t-1)-\sigma(t-4)]$ bei $t=2$?`, 3, null, { steps: [R`Bei $t=2$ ist $\sigma(2-1)=1$ und $\sigma(2-4)=0$.`, R`$3\cdot(1-0)=3$.`], ref: 'Kap. 3 S. 2' }),
      Q.num('m05q2', R`Welchen Wert hat $\mathrm{sgn}(-5)$?`, -1, 'Nur das Vorzeichen zählt.', { ref: 'Kap. 3 S. 4' }),
      Q.mc('m05q6', R`Übung aus dem Skript: Für welche $t$ ist $\sigma(-t+2)=1$?`, [R`Für $t\le 2$`, R`Für $t\ge 2$`, R`Für $t\ge -2$`, R`Für $t\le -2$`], 0, R`$\sigma(u)=1$ für $u\ge 0$, also $-t+2\ge 0$. Das ist ein gespiegelter Sprung: Er ist links an und schaltet bei $t=2$ ab.`, { ref: 'Kap. 3 S. 3' }),
      Q.mc('m05q3', R`Wie schreibt man $\mathrm{rect}(t)$ mit Sprungfunktionen?`, [R`$\sigma(t+\frac12)-\sigma(t-\frac12)$`, R`$\sigma(t-\frac12)-\sigma(t+\frac12)$`, R`$\sigma(t)-\sigma(t-1)$`, R`$\sigma(t+1)-\sigma(t-1)$`], 0, R`Das Rechteck beginnt bei $-\frac12$ und endet bei $+\frac12$. $\sigma(t)-\sigma(t-1)$ hätte zwar dieselbe Breite, läge aber auf $[0,1]$.`, { ref: 'Kap. 3 S. 4' }),
      Q.mc('m05q4', R`Welche Formel beschreibt eine Rampe, die bei $t=2$ startet und mit Steigung $1$ steigt?`, [R`$\sigma(t-2)(t-2)$`, R`$\sigma(t-2)\,t$`, R`$\sigma(t)(t-2)$`, R`$\sigma(t+2)(t+2)$`], 0, R`Bei $t=2$ muss der Wert $0$ sein. Nur die erste Formel erfüllt das und ist links davon $0$.`, { ref: 'Kap. 3 S. 6' }),
      Q.num('m05q5', R`Bei welchem $t_0$ liegt das erste Maximum von $\cos(4t+2)$?`, -0.5, null, { steps: [R`Das Maximum liegt dort, wo das Argument $0$ wird: $4t+2=0$.`, R`$t_0=-\frac{\varphi_0}{\omega}=-\frac{2}{4}=-0{,}5$.`], ref: 'Kap. 3 S. 7' })
    ],
    calcs: ['g.pulse', 'g.stepval']
  });

  SS_MOD({
    id: 'm06', order: 6, exam: 2, weight: 8, glyph: 'δ', title: 'Der Dirac-Impuls', src: 'Kap. 3, S. 9 bis 11',
    goal: 'Du verstehst, was der Dirac-Impuls ist, und löst damit Blatt 2 sicher: Siebeigenschaft, Ausblendeigenschaft und Ableiten von Signalen mit Sprüngen.',
    sections: [
      {
        id: 'm06s1', title: 'Was ist der Dirac-Impuls?', practice: ['m06q1'],
        blocks: [
          p(R`Stell dir einen kräftigen, sehr kurzen Schlag vor, einen Hammerschlag auf eine Glocke. Mathematisch nimmst du ein Rechteck mit Breite $\Delta$ und Höhe $\frac{1}{\Delta}$. Die Fläche ist immer $1$. Macht man es schmaler, wird es höher. Im Grenzfall $\Delta\to 0$ entsteht der **Dirac-Impuls** $\delta(t)$.`),
          f(R`\delta(t)=0\;\text{ für }t\ne 0,\qquad\int_{-\infty}^{\infty}\delta(t)\,dt=1`),
          plot({ title: 'Gezeichnet wird er als Pfeil. Die Pfeilhöhe steht für die Fläche, nicht für einen Funktionswert.', x: [-3, 3], y: [-0.2, 1.4], xl: 't', yt: [1], deltas: [{ x: 0, h: 1, l: 'δ(t)' }, { x: 2, h: 0.5, c: 'w', l: '0,5·δ(t−2)' }], h: 130 }),
          lab('delta'),
          k(R`Der Dirac-Impuls ist die Ableitung der Sprungfunktion: $\delta(t)=\frac{d\sigma}{dt}$. Das passt: Bei $t=0$ ist die Steigung unendlich groß, überall sonst $0$. Umgekehrt ist $\sigma(t)=\int_{-\infty}^{t}\delta(\tau)d\tau$.`)
        ]
      },
      {
        id: 'm06s2', title: 'Ausblend- und Siebeigenschaft', practice: ['m06q2', 'm06q3', 'm06q4', 'm06q5', 'm06q6', 'm06q7', 'm06q8', 'm06q9', 'g.siftmul', 'g.siftint'],
        blocks: [
          p('Weil der Impuls nur an einer Stelle lebt, zählt von jeder anderen Funktion auch nur der Wert an dieser Stelle. Daraus folgen die beiden Regeln, die fast alle Aufgaben auf Blatt 2 lösen:'),
          f(R`f(t)\,\delta(t-t_0)=f(t_0)\,\delta(t-t_0)`, 'Ausblendeigenschaft: Das Ergebnis ist wieder ein Impuls'),
          f(R`\int_{-\infty}^{\infty}f(t)\,\delta(t-t_0)\,dt=f(t_0)`, 'Siebeigenschaft: Das Ergebnis ist eine Zahl'),
          ex(R`1. Wo sitzt der Impuls? Das Argument gleich null setzen: $\delta(t+1)$ sitzt bei $t=-1$. 2. Den Wert dort in den Rest einsetzen. 3. Steht ein Integral da, ist die Zahl das Ergebnis. Sonst bleibt der Impuls stehen.`),
          w(R`$\delta(t+1)$ sitzt bei $t=-1$, nicht bei $+1$. Und liegt der Impuls außerhalb der Integrationsgrenzen, ist das Integral $0$.`),
          k(R`Der Impuls ist gerade: $\delta(t_0-t)=\delta(t-t_0)$.`)
        ]
      },
      {
        id: 'm06s3', title: 'Ableiten von Signalen mit Sprüngen', practice: ['m06q10', 'm06q11', 'm06q12', 'm06q13', 'g.deriv', 'g.derivpulse'],
        blocks: [
          p(R`Jetzt kommt die wichtigste Anwendung. Signale wie $\sigma(t)\cos(t)$ haben einen Sprung, normale Ableitungsregeln scheitern dort. Mit $\frac{d\sigma}{dt}=\delta$ funktioniert aber ganz normal die **Produktregel**:`),
          f(R`\frac{d}{dt}\bigl[\sigma(t)f(t)\bigr]=\delta(t)f(t)+\sigma(t)f'(t)=f(0)\,\delta(t)+\sigma(t)f'(t)`),
          st('Schritt für Schritt: $s(t)=\\sigma(t)\\cos(t)$', [
            { x: 'Das Signal ist links von $0$ null und springt bei $t=0$ auf $\\cos 0=1$.', plot: { x: [-3, 6], y: [-1.3, 1.5], xl: 't', yl: 's(t)', yt: [-1, 1], curves: [{ f: (t) => sig(t) * Math.cos(t), c: 'p' }], h: 130 } },
            { f: R`\frac{ds}{dt}=\delta(t)\cos(t)+\sigma(t)\cdot(-\sin t)`, x: 'Produktregel anwenden.' },
            { f: R`\frac{ds}{dt}=\delta(t)-\sigma(t)\sin t`, x: 'Ausblendeigenschaft: $\\delta(t)\\cos t=\\delta(t)\\cos 0=\\delta(t)$.', plot: { x: [-3, 6], y: [-1.3, 1.5], xl: 't', yl: "s'(t)", yt: [-1, 1], curves: [{ f: (t) => (t > 0 ? -Math.sin(t) : 0), c: 'w' }], deltas: [{ x: 0, h: 1 }], h: 130 } }
          ]),
          k('Die Höhe des Sprungs wird zur Stärke des Impulses. Hat das Signal bei $t=0$ keinen Sprung, gibt es auch keinen Impuls. Darum entsteht bei $\\sigma(t)\\sin(t)$ kein Dirac-Impuls.')
        ]
      }
    ],
    questions: [
      Q.tf('m06q1', 'Stimmen die Aussagen?', [
        [R`Die Fläche unter $\delta(t)$ ist $1$.`, true, 'Das ist seine Definition.'],
        [R`$\delta(0)=1$`, false, 'Bei $0$ ist er unendlich groß. Die $1$ ist seine Fläche.'],
        [R`$\frac{d}{dt}\varrho(t)=\sigma(t)$ und $\frac{d}{dt}\sigma(t)=\delta(t)$`, true, 'Rampe, Sprung, Impuls: jeweils eine Ableitung weiter.']
      ], { ref: 'Kap. 3 S. 9' }),
      Q.mc('m06q2', R`**Aufgabe 2-1 a)** Vereinfache $(t^2+2t+1)\,\delta(t+1)$.`, ['$0$', R`$\delta(t+1)$`, R`$4\,\delta(t+1)$`, R`$(t^2+2t+1)$`], 0, null, { src: 'Blatt 2-1a', ref: 'Blatt 2, Aufgabe 2-1', steps: [R`Der Impuls sitzt bei $t=-1$.`, R`$(-1)^2+2(-1)+1=1-2+1=0$. Der Faktor ist dort null, also verschwindet das ganze Produkt.`] }),
      Q.mc('m06q3', R`**Aufgabe 2-1 b)** Vereinfache $e^{-(t+1)}\,\delta(t+1)$.`, [R`$\delta(t+1)$`, '$1$', R`$e^{-1}\,\delta(t+1)$`, '$0$'], 0, null, { src: 'Blatt 2-1b', ref: 'Blatt 2, Aufgabe 2-1', steps: [R`Bei $t=-1$ ist der Exponent $-(−1+1)=0$, also $e^0=1$.`, R`Ohne Integral bleibt der Impuls stehen: $1\cdot\delta(t+1)$.`] }),
      Q.num('m06q4', R`**Aufgabe 2-1 c)** Berechne $\int_{-\infty}^{\infty}e^{-t}\cos(t)\,\delta(t)\,dt$.`, 1, null, { src: 'Blatt 2-1c', ref: 'Blatt 2, Aufgabe 2-1', steps: [R`Impuls bei $t=0$: $e^0\cos 0=1$.`] }),
      Q.num('m06q5', R`**Aufgabe 2-1 d)** Berechne $\int_{-\infty}^{\infty}e^{-t}\sin(t)\,\delta(t)\,dt$.`, 0, null, { src: 'Blatt 2-1d', ref: 'Blatt 2, Aufgabe 2-1', steps: [R`Impuls bei $t=0$: $e^0\sin 0=0$.`] }),
      Q.num('m06q6', R`**Aufgabe 2-1 e)** Berechne $\int_{-\infty}^{\infty}(t-1)\sin(t)\,\delta(t+1)\,dt$ als Dezimalzahl. Taschenrechner auf Bogenmaß!`, 1.683, null, { src: 'Blatt 2-1e', ref: 'Blatt 2, Aufgabe 2-1', steps: [R`Impuls bei $t=-1$.`, R`$(-1-1)\sin(-1)=-2\sin(-1)=2\sin(1)\approx 1{,}683$.`] }),
      Q.mc('m06q7', R`**Aufgabe 2-1 f)** Vereinfache $\sigma(t)\,e^{at}\,\delta(t+a)$.`, [R`$\sigma(-a)\,e^{-a^2}\,\delta(t+a)$`, R`$\sigma(-a)\,e^{-2a}\,\delta(t+a)$`, R`$e^{-a^2}\,\delta(t+a)$`, R`$\sigma(a)\,e^{a^2}\,\delta(t+a)$`], 0, null, { src: 'Blatt 2-1f', ref: 'Blatt 2, Aufgabe 2-1', lvl: 2, pts: 2, steps: [R`Der Impuls sitzt bei $t=-a$. Überall $t$ durch $-a$ ersetzen.`, R`$\sigma(-a)$ und $e^{a\cdot(-a)}=e^{-a^2}$.`, R`Für $a>0$ ist $\sigma(-a)=0$, dann ist das ganze Ergebnis $0$.`], sol: [err(R`In der Lösung des Blatts steht $e^{-2a}$. Das ist ein Fehler: $a\cdot(-a)=-a^2$.`)] }),
      Q.tf('m06q8', 'Übung aus dem Skript: Stimmen die Ergebnisse?', [
        [R`$(t-1)^2\,\delta(t-1)=0$`, true, 'Der Faktor hat bei $t=1$ eine Nullstelle.'],
        [R`$e^t\,\delta(t)=\delta(t)$`, true, R`$e^0=1$.`],
        [R`$\int_{-\infty}^{\infty}(t+1)^2\,\delta(1-t)\,dt=1$`, false, R`Der Impuls sitzt bei $t=1$: $(1+1)^2=4$.`],
        [R`$\int_{-\infty}^{\infty}\sin(t)\,\delta(t)\,dt=0$`, true, R`$\sin 0=0$.`]
      ], { ref: 'Kap. 3 S. 11' }),
      Q.num('m06q9', R`Berechne $\int_{0}^{5}t^2\,\delta(t-7)\,dt$.`, 0, null, { lvl: 2, steps: [R`Der Impuls sitzt bei $t=7$. Das liegt außerhalb von $[0,5]$.`, R`Also trägt er nichts bei, das Integral ist $0$.`], ref: 'Kap. 3 S. 10' }),
      Q.walk('m06q10', R`**Aufgabe 2-2 a)** Leite ab: $s(t)=\sigma(t)\,e^{-t}\cos(t)$.`, [
        W.num(R`Wie hoch ist der Sprung bei $t=0$? Berechne $e^0\cos 0$.`, 1, 'Das Signal springt von $0$ auf $1$, also entsteht $1\\cdot\\delta(t)$.'),
        W.mc(R`Leite $f(t)=e^{-t}\cos t$ mit der Produktregel ab.`, [R`$-e^{-t}(\cos t+\sin t)$`, R`$e^{-t}(\cos t-\sin t)$`, R`$-e^{-t}\sin t$`], 0, R`$(-e^{-t})\cos t+e^{-t}(-\sin t)$. Dann $-e^{-t}$ ausklammern.`),
        W.mc('Wie lautet das Ergebnis?', [R`$\delta(t)-\sigma(t)\,e^{-t}(\cos t+\sin t)$`, R`$-\sigma(t)\,e^{-t}(\cos t+\sin t)$`, R`$\delta(t)+\sigma(t)\,e^{-t}(\cos t+\sin t)$`], 0, 'So steht es auch in der Lösung des Blatts.')
      ], { src: 'Blatt 2-2a', ref: 'Blatt 2, Aufgabe 2-2' }),
      Q.walk('m06q11', R`**Aufgabe 2-2 b)** Leite ab: $s(t)=\varrho(t+a)+\sigma(t)\,e^{-t}\sin(t)$.`, [
        W.mc(R`Wie lautet die Ableitung von $\varrho(t+a)$?`, [R`$\sigma(t+a)$`, R`$\delta(t+a)$`, R`$\varrho(t+a)$`], 0, 'Die Ableitung der Rampe ist der Sprung, das $+a$ bleibt.'),
        W.num(R`Wie groß ist der Sprung von $\sigma(t)e^{-t}\sin t$ bei $t=0$?`, 0, R`$e^0\sin 0=0$. Also kein Impuls.`),
        W.mc(R`Wie lautet die gesamte Ableitung?`, [R`$\sigma(t+a)+\sigma(t)\,e^{-t}(\cos t-\sin t)$`, R`$\sigma(t+a)+\delta(t)+\sigma(t)\,e^{-t}(\cos t-\sin t)$`, R`$\delta(t+a)+\sigma(t)\,e^{-t}(\cos t+\sin t)$`], 0, R`Produktregel: $(e^{-t}\sin t)'=-e^{-t}\sin t+e^{-t}\cos t=e^{-t}(\cos t-\sin t)$.`)
      ], { src: 'Blatt 2-2b', ref: 'Blatt 2, Aufgabe 2-2' }),
      Q.walk('m06q12', R`**Aufgabe 2-2 c)** Leite ab: $s(t)=\sigma(t)\,(\cos t+\sin t)$.`, [
        W.num(R`Wie groß ist der Sprung bei $t=0$?`, 1, R`$\cos 0+\sin 0=1$.`),
        W.mc('Wie lautet das Ergebnis?', [R`$\delta(t)+\sigma(t)(\cos t-\sin t)$`, R`$\sigma(t)(\cos t-\sin t)$`, R`$\delta(t)+\sigma(t)(\sin t-\cos t)$`], 0, R`$(\cos t+\sin t)'=-\sin t+\cos t$. Dazu kommt der Impuls aus dem Sprung.`)
      ], { src: 'Blatt 2-2c', ref: 'Blatt 2, Aufgabe 2-2', pts: 2 }),
      Q.walk('m06q13', R`**Aufgabe 2-2 d)** Leite ab: $s(t)=\varrho(t)\,(t+a)+\sigma(t)\,e^{-t}\sin(t)$. Auf dem Blatt heißt sie versehentlich noch einmal b).`, [
        W.mc(R`Produktregel für den ersten Summanden. Was ist $\frac{d}{dt}[\varrho(t)(t+a)]$?`, [R`$\sigma(t)(t+a)+\varrho(t)$`, R`$\sigma(t)(t+a)$`, R`$\delta(t)(t+a)+\varrho(t)$`], 0, R`$\varrho'=\sigma$ und $(t+a)'=1$. Die Rampe springt nicht, also kein Impuls.`),
        W.mc('Wie lautet die gesamte Ableitung?', [R`$\varrho(t)+\sigma(t)\left[(t+a)+e^{-t}(\cos t-\sin t)\right]$`, R`$\varrho(t)+\sigma(t)(t+a)$`, R`$\sigma(t)\left[(t+a)+e^{-t}(\cos t-\sin t)\right]$`], 0, R`Der zweite Summand ist wie in b). Dann $\sigma(t)$ ausklammern.`)
      ], { src: 'Blatt 2-2d', ref: 'Blatt 2, Aufgabe 2-2', lvl: 3, pts: 3 })
    ],
    calcs: ['g.siftmul', 'g.siftint', 'g.deriv', 'g.derivpulse']
  });

  SS_MOD({
    id: 'm07', order: 7, exam: 2, weight: 2, glyph: 'k', title: 'Diskrete Standardsignale', src: 'Kap. 3, S. 11 bis 13',
    goal: 'Du kennst Sprungfolge, Einheitsimpuls und Rampenfolge und ihre Zusammenhänge. Statt Ableitung gibt es die Differenz, statt Integral die Summe.',
    sections: [
      {
        id: 'm07s1', title: 'Sprung, Impuls und Rampe als Folgen', practice: ['m07q1', 'm07q2'],
        blocks: [
          p(R`Zeitdiskrete Signale gibt es nur an ganzzahligen Stellen $k$. Der große Vorteil: Der Impuls ist hier ganz harmlos, er hat einfach den Wert $1$.`),
          tb(['Name', 'Formel', 'für $k<0$', 'für $k=0$', 'für $k>0$'], [[R`Sprungfolge $\sigma(k)$`, '', '$0$', '$1$', '$1$'], [R`Einheitsimpuls $\delta(k)$`, '', '$0$', '$1$', '$0$'], [R`Rampenfolge $\rho(k)$`, R`$k\,\sigma(k)$`, '$0$', '$0$', '$k$']]),
          plot({ title: R`$\sigma(k)$`, x: [-3.5, 5.5], y: [-0.2, 1.4], xl: 'k', yt: [1], xt: [-3, -2, -1, 1, 2, 3, 4, 5], stems: [{ k: [-3, -2, -1, 0, 1, 2, 3, 4, 5], v: [0, 0, 0, 1, 1, 1, 1, 1, 1], c: 'p' }], h: 110 }),
          plot({ title: R`$\delta(k)$`, x: [-3.5, 5.5], y: [-0.2, 1.4], xl: 'k', yt: [1], xt: [-3, -2, -1, 1, 2, 3, 4, 5], stems: [{ k: [-3, -2, -1, 0, 1, 2, 3, 4, 5], v: [0, 0, 0, 1, 0, 0, 0, 0, 0], c: 'w' }], h: 110 }),
          err(R`Im Skript steht bei der Rampenfolge für $k<0$ der Wert $1$. Richtig ist $0$.`),
          h3('Die Zusammenhänge'),
          tb(['Kontinuierlich', 'Diskret'], [[R`$\delta(t)=\frac{d\sigma}{dt}$`, R`$\delta(k)=\sigma(k)-\sigma(k-1)$`], [R`$\sigma(t)=\int_{-\infty}^{t}\delta(\tau)d\tau$`, R`$\sigma(k)=\sum_{l=-\infty}^{k}\delta(l)$`], [R`$f(t)\delta(t-t_0)=f(t_0)\delta(t-t_0)$`, R`$f(k)\delta(k-k_0)=f(k_0)\delta(k-k_0)$`]]),
          err(R`In Kapitel 3.2.4 steht in der Summe $\delta(k)$. Der Summationsindex ist aber $l$, also muss dort $\delta(l)$ stehen.`)
        ]
      }
    ],
    questions: [
      Q.num('m07q1', R`Wie groß ist $\sigma(3)-\sigma(2)$?`, 0, null, { steps: [R`Beide Werte sind $1$. Das passt: Das ist $\delta(3)$, und der Impuls ist nur bei $k=0$ ungleich null.`], ref: 'Kap. 3 S. 12' }),
      Q.num('m07q2', R`Wie groß ist $\sum_{k=-\infty}^{\infty}k^2\,\delta(k-3)$?`, 9, null, { steps: [R`Die Summe liefert wie das Integral den Wert an der Stelle des Impulses: $3^2=9$.`], ref: 'Kap. 3 S. 12' })
    ],
    calcs: []
  });
})();
