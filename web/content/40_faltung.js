// Kapitel 5: Impulsantwort und Faltung, Blatt 5.
(function () {
  'use strict';
  const R = String.raw;
  const { p, h3, b, k, w, ex, i, err, f, tb, plot, lab, st } = SSB;
  const Q = SSQ;
  const W = SSW;
  const { sig, ramp, convExpSin, convStepExp, convRect, convWindowCos2 } = SSEngine.Sig;

  SS_MOD({
    id: 'm10', order: 10, exam: 4, weight: 4, glyph: 'g', title: 'Impuls-, Sprung- und Rampenantwort', src: 'Kap. 5, S. 1 bis 3',
    goal: 'Du kennst die drei Antworten eines LTI-Systems und rechnest mit Ableiten und Integrieren zwischen ihnen hin und her.',
    sections: [
      {
        id: 'm10s1', title: 'Drei Testsignale, drei Antworten', practice: ['m10q1', 'm10q2', 'm10q3', 'g.ghq'],
        blocks: [
          p(R`Um ein System kennenzulernen, schickt man ein einfaches Testsignal hinein und schaut, was herauskommt.`),
          tb(['Eingang', 'Ausgang', 'Name'], [[R`$\delta(t)$`, R`$g(t)=T\{\delta(t)\}$`, 'Impulsantwort'], [R`$\sigma(t)$`, R`$h(t)=T\{\sigma(t)\}$`, 'Sprungantwort'], [R`$\varrho(t)$`, R`$q(t)=T\{\varrho(t)\}$`, 'Rampenantwort']]),
          i('Klatsche einmal in einer Kirche. Der Nachhall, den du hörst, ist die Impulsantwort des Raums. Aus ihr lässt sich berechnen, wie jede Musik in diesem Raum klingen würde.'),
          p('Weil Sprung und Impuls durch Ableiten verbunden sind und das System linear und zeitinvariant ist, gilt dasselbe für die Antworten:'),
          f(R`g(t)=\frac{dh(t)}{dt},\quad h(t)=\int_{-\infty}^{t}g(\tau)\,d\tau,\quad h(t)=\frac{dq(t)}{dt},\quad q(t)=\int_{-\infty}^{t}h(\tau)\,d\tau`),
          k(R`Reihenfolge merken: $q\xrightarrow{\;d/dt\;}h\xrightarrow{\;d/dt\;}g$, genau wie $\varrho\to\sigma\to\delta$.`),
          plot({ title: R`RC-Glied: Sprungantwort und Impulsantwort für $RC=1$`, x: [-1, 5], y: [-0.15, 1.25], xl: 't', yt: [1], curves: [{ f: (t) => sig(t) * (1 - Math.exp(-t)), c: 'p', label: R`$h(t)=\sigma(t)(1-e^{-t})$` }, { f: (t) => sig(t) * Math.exp(-t), c: 'w', label: R`$g(t)=\sigma(t)e^{-t}$` }] }),
          p(R`**Im Diskreten** wird aus der Ableitung eine Differenz und aus dem Integral eine Summe: $g(k)=h(k)-h(k-1)$ und $h(k)=\sum_{l=-\infty}^{k}g(l)$.`)
        ]
      }
    ],
    questions: [
      Q.match('m10q1', 'Ordne zu: Was ist die Antwort worauf?', [[R`$g(t)$`, 'Antwort auf den Impuls'], [R`$h(t)$`, 'Antwort auf den Sprung'], [R`$q(t)$`, 'Antwort auf die Rampe']], { ref: 'Kap. 5 S. 1' }),
      Q.walk('m10q2', R`Übung aus dem Skript: Die Sprungantwort eines Systems ist $h(t)=\frac12\sigma(t)\,t^2$. Bestimme $g(t)$ und $q(t)$.`, [
        W.mc(R`Wie lautet die Impulsantwort $g=\frac{dh}{dt}$?`, [R`$\sigma(t)\,t$`, R`$\frac12\sigma(t)\,t$`, R`$\delta(t)$`, R`$\frac12\delta(t)\,t^2$`], 0, R`Die Potenzregel liefert $\frac12\cdot 2t=t$. Ein Impuls entsteht nicht, weil $h(0)=0$ ist.`),
        W.mc(R`Wie lautet die Rampenantwort $q=\int h\,d\tau$?`, [R`$\frac16\sigma(t)\,t^3$`, R`$\frac12\sigma(t)\,t^3$`, R`$\frac13\sigma(t)\,t^3$`], 0, R`$\int_0^t\frac12\tau^2d\tau=\frac12\cdot\frac{t^3}{3}=\frac{t^3}{6}$.`)
      ], { ref: 'Kap. 5 S. 3', pts: 2 }),
      Q.tf('m10q3', 'Stimmen die Aussagen?', [
        ['Die Impulsantwort ist die Ableitung der Sprungantwort.', true, R`$g=\frac{dh}{dt}$.`],
        ['Die Sprungantwort ist die Ableitung der Rampenantwort.', true, R`$h=\frac{dq}{dt}$.`],
        ['Bei einem kausalen System ist die Impulsantwort für $t<0$ null.', true, 'Das System kann nicht vor dem Impuls antworten.']
      ], { ref: 'Kap. 5 S. 1' })
    ],
    calcs: ['g.ghq']
  });

  SS_MOD({
    id: 'm11', order: 11, exam: 4, weight: 12, glyph: '∗', title: 'Das Faltungsintegral', src: 'Kap. 5, S. 4 bis 8',
    goal: 'Du verstehst, was Faltung anschaulich bedeutet, und rechnest ein Faltungsintegral mit dem 6-Schritte-Rezept aus. Das ist der schwierigste Teil und der größte Klausurbrocken: Blatt 5.',
    sections: [
      {
        id: 'm11s1', title: 'Die Idee', practice: ['m11q1'],
        blocks: [
          p(R`Kennst du die Impulsantwort $g(t)$, kannst du den Ausgang für **jedes** Eingangssignal berechnen. Die Idee hat drei Schritte:`),
          st('Warum die Faltung so aussieht', [
            { x: R`**1. Zerlegen:** Du schneidest das Eingangssignal in viele schmale Streifen. Jeder Streifen ist fast ein Impuls, dessen Stärke dem Signalwert entspricht.`, plot: { x: [-0.5, 5], y: [-0.2, 1.3], xl: 't', yl: 'x(t)', yt: [1], curves: [{ f: (t) => (t >= 0 && t <= 3 ? 1 - t / 3 : 0), c: 'm', d: '4 3', w: 1.2 }], stems: [{ k: [0, 0.5, 1, 1.5, 2, 2.5], v: [1, 0.83, 0.67, 0.5, 0.33, 0.17], c: 'p' }], h: 140 } },
            { x: R`**2. Einzeln antworten:** Jeder Impuls bei $\tau$ löst eine eigene Impulsantwort aus. Sie startet bei $\tau$ und ist mit der Impulsstärke $x(\tau)$ gewichtet: $x(\tau)\,g(t-\tau)$.`, plot: { x: [-0.5, 5], y: [-0.2, 1.3], xl: 't', yt: [1], curves: [0, 1, 2].map((n) => ({ f: (t) => { const tau = n * 0.8; return t >= tau ? (1 - tau / 3) * Math.exp(-1.2 * (t - tau)) : 0; }, c: ['p', 'w', 't'][n] })), h: 140 } },
            { x: R`**3. Aufsummieren:** Wegen der Linearität addieren sich alle Antworten. Aus der Summe über viele schmale Streifen wird ein Integral.`, f: R`y(t)=\int_{-\infty}^{\infty}x(\tau)\,g(t-\tau)\,d\tau=x(t)*g(t)` }
          ]),
          k(R`$\tau$ läuft über alle Zeitpunkte, zu denen ein Impuls entstanden ist. $t$ ist fest: der Zeitpunkt, zu dem du den Ausgang wissen willst. Integriert wird nach $\tau$, das Ergebnis hängt von $t$ ab.`)
        ]
      },
      {
        id: 'm11s2', title: 'Das Bild dazu: spiegeln und schieben', practice: ['m11q2', 'm11q3'],
        blocks: [
          p(R`Für festes $t$ siehst du dir das Produkt $x(\tau)\,g(t-\tau)$ als Funktion von $\tau$ an. $g(t-\tau)$ ist $g$ an der $y$-Achse gespiegelt und um $t$ nach rechts geschoben. Mit wachsendem $t$ fährt diese gespiegelte Kurve von links nach rechts durch das Bild. **Der Wert $y(t)$ ist die Fläche der Überlappung.**`),
          lab('conv', { preset: 'rr' }),
          i('Schiebe den Regler langsam. Solange sich nichts überlappt, ist der Ausgang null. Dann wächst die grüne Fläche an und fällt wieder ab. Probiere auch das RC-Glied aus: Der Ausgang steigt, solange das Rechteck anliegt, und klingt danach ab.', 'Probier es aus'),
          k(R`Faustregeln: Beginn des Ergebnisses = Beginn von $x$ + Beginn von $g$. Ende = Ende von $x$ + Ende von $g$. Zwei Rechtecke ergeben ein Dreieck oder ein Trapez.`)
        ]
      },
      {
        id: 'm11s3', title: 'Das 6-Schritte-Rezept', practice: ['m11q4', 'm11q5', 'g.convdelta', 'g.convexp', 'g.convstep'],
        blocks: [
          p('So steht es im Skript. Das Rezept funktioniert immer, sogar wenn dir das Integral am Anfang unheimlich vorkommt:'),
          tb(['Nr.', 'Schritt', 'Was du tust'], [
            ['1', 'Ansatz', R`Formel aufschreiben: $y(t)=\int x(t-\tau)g(\tau)d\tau$ oder $\int x(\tau)g(t-\tau)d\tau$. Signale einsetzen. Du darfst wählen, welches du spiegelst.`],
            ['2', 'Skizze', R`Beide Signale über $\tau$ zeichnen. Das gespiegelte für ein festes $t$.`],
            ['3', 'Überlappung', R`Für welche $t$ und $\tau$ überlappen sie sich? Daraus folgen die Integrationsgrenzen.`],
            ['4', 'Vereinfachen', R`Konstanten rausziehen. Die Einschaltfunktionen sind innerhalb der Grenzen $1$ und verschwinden.`],
            ['5', 'Einschaltfunktion', R`Vor das Integral die neue Sprungfunktion schreiben, die sagt, ab welchem $t$ es einen Beitrag gibt.`],
            ['6', 'Integrieren', 'Das Integral ausrechnen und Grenzen einsetzen.']
          ]),
          st('Beispiel aus dem Skript: RC-Glied mit Rampe', [
            { x: R`**Schritt 1, Ansatz:** $g(t)=\frac{1}{RC}\sigma(t)e^{-t/RC}$ und $x(t)=a\,t\,\sigma(t)$. Kurz $\omega_0=\frac{1}{RC}$.`, f: R`y(t)=\int_{-\infty}^{\infty}a\,(t-\tau)\,\sigma(t-\tau)\;\omega_0\,\sigma(\tau)\,e^{-\omega_0\tau}\,d\tau` },
            { x: R`**Schritt 2 und 3, Skizze und Überlappung:** $\sigma(\tau)$ verlangt $\tau\ge 0$. $\sigma(t-\tau)$ verlangt $\tau\le t$. Überlappung gibt es also nur auf $0\le\tau\le t$, und nur für $t>0$.`, plot: { x: [-1, 4], y: [-0.2, 2.2], xl: 'τ', yn: 2, vlines: [{ x: 2, l: 't' }], curves: [{ f: (u) => sig(u) * Math.exp(-u), c: 'p', label: R`$g(\tau)$` }, { f: (u) => (u <= 2 ? 2 - u : 0), c: 'w', label: R`$x(t-\tau)$ für $t=2$` }, { f: (u) => (u >= 0 && u <= 2 ? (2 - u) * Math.exp(-u) : 0), c: 'g', fill: true, line: false, fo: 0.35 }], h: 150 } },
            { x: R`**Schritt 4, Vereinfachen:** Konstanten raus. Die Sprungfunktionen sind innerhalb der Grenzen $1$.`, f: R`a\,\omega_0\int_0^t(t-\tau)\,e^{-\omega_0\tau}\,d\tau` },
            { x: R`**Schritt 5, Einschaltfunktion:** Weil es nur für $t>0$ einen Beitrag gibt, kommt $\sigma(t)$ davor.`, f: R`y(t)=\sigma(t)\,a\,\omega_0\int_0^t(t-\tau)\,e^{-\omega_0\tau}\,d\tau` },
            { x: R`**Schritt 6, Integrieren:** Partielle Integration liefert das Ergebnis. Mit $\omega_0=\frac{1}{RC}$:`, f: R`y(t)=\sigma(t)\,a\,\left[t+RC\,e^{-t/RC}-RC\right]` }
          ]),
          err(R`In der letzten Zeile des Skript-Beispiels fehlt am e-Term der Faktor $RC$. Probe: Für $t=0$ muss $y(0)=0$ gelten, und das stimmt nur mit dem Faktor: $0+RC-RC=0$.`),
          k(R`**Probe, die immer geht:** Der Ausgang eines kausalen Systems muss bei $t=0$ stetig starten, wenn beide Signale endlich sind. Setze $t=0$ ein und prüfe, ob $0$ herauskommt.`),
          w(R`Grenzen sind die häufigste Fehlerquelle. Rechne nie mit $\int_{-\infty}^{\infty}$ weiter, sondern ersetze die Sprungfunktionen sofort durch Grenzen.`)
        ]
      },
      {
        id: 'm11s4', title: 'Rechenregeln', practice: ['m11q6', 'm11q7'],
        blocks: [
          tb(['Regel', 'Formel', 'Nutzen'], [
            ['Einselement', R`$\delta(t)*x(t)=x(t)$`, 'Der Impuls ändert nichts'],
            ['Verschiebung', R`$\delta(t-t_0)*x(t)=x(t-t_0)$`, 'Direkt aus der Siebeigenschaft'],
            ['Kommutativ', R`$g*x=x*g$`, 'Spiegele das einfachere Signal'],
            ['Distributiv', R`$g*(x_1+x_2)=g*x_1+g*x_2$`, 'Parallele Eingänge getrennt rechnen'],
            ['Assoziativ', R`$g_2*(g_1*x)=(g_2*g_1)*x$`, 'Reihenschaltung: Impulsantworten falten']
          ]),
          ex('Für ein Rechteck schreibst du es als Differenz zweier Sprünge und rechnest beide getrennt. So löst du Rechteck-Aufgaben mit einer einzigen Rechnung und ihrer Verschiebung.')
        ]
      },
      {
        id: 'm11s5', title: 'Die Aufgaben von Blatt 5', practice: ['m11q8', 'm11q9', 'm11q10', 'm11q11', 'g.convrect', 'g.convsin', 'g.convwin'],
        blocks: [
          p(R`Jetzt rechnest du die Originalaufgaben Schritt für Schritt. Nimm dir Papier dazu. Die App fragt dich nach den entscheidenden Zwischenschritten, das Rechnen selbst übst du auf dem Blatt.`),
          plot({ title: 'Ergebnis von Aufgabe 5-3: Rechteck mit sich selbst gefaltet', x: [-0.5, 3], y: [-0.15, 1.3], xl: 't', yl: 'y(t)', xt: [[1, 'tₐ'], [2, '2tₐ']], yt: [[1, 'tₐ']], curves: [{ f: (t) => convRect(1, 1, 1, 1, t), c: 'g' }], h: 130 })
        ]
      }
    ],
    questions: [
      Q.mc('m11q1', R`Was gibt die Impulsantwort $g(t-\tau)$ im Faltungsintegral an?`, [R`Die Antwort zum Zeitpunkt $t$ auf einen Impuls, der zum Zeitpunkt $\tau$ kam`, R`Die Antwort zum Zeitpunkt $\tau$ auf einen Impuls bei $t$`, R`Das Eingangssignal zum Zeitpunkt $t$`], 0, R`Seit dem Impuls ist die Zeit $t-\tau$ vergangen, und genau dort liest man die Impulsantwort ab.`, { ref: 'Kap. 5 S. 4' }),
      Q.tf('m11q2', R`$x$ ist ungleich null auf $[1,3]$, $g$ auf $[2,6]$. Stimmen die Aussagen?`, [
        [R`$y(t)$ beginnt bei $t=3$.`, true, 'Beginn plus Beginn: $1+2=3$.'],
        [R`$y(t)$ endet bei $t=9$.`, true, 'Ende plus Ende: $3+6=9$.'],
        [R`$y(t)$ ist für $t=2$ schon ungleich null.`, false, 'Die Überlappung beginnt erst bei $t=3$.']
      ], { ref: 'Kap. 5 S. 5' }),
      Q.mc('m11q3', R`Wie sieht $g(t-\tau)$ als Funktion von $\tau$ aus, wenn $g(t)=\sigma(t)$?`, [R`Eine Stufe, die für $\tau\le t$ gleich $1$ und rechts davon $0$ ist`, R`Eine Stufe, die für $\tau\ge t$ gleich $1$ ist`, R`Immer $1$`], 0, R`$\sigma(t-\tau)=1$ heißt $t-\tau\ge 0$, also $\tau\le t$. Die Stufe zeigt nach links, weil sie gespiegelt ist.`, { ref: 'Kap. 5 S. 5' }),
      Q.ord('m11q4', 'Bringe die Schritte des Rezepts in die richtige Reihenfolge.', ['Ansatz: Faltungsintegral aufschreiben', 'Skizze der Signale über $\\tau$', 'Überlappung und Grenzen bestimmen', 'Konstanten rausziehen, Einschaltfunktionen werden $1$', 'Neue Einschaltfunktion vor das Integral schreiben', 'Integral ausrechnen'], 'Genau so steht es im Skript, Kapitel 5.2.', { ref: 'Kap. 5 S. 5', pts: 2 }),
      Q.walk('m11q5', R`Übung 1 aus dem Skript: $g(t)=\sigma(t)$ und $x(t)=e^{t}\sigma(t)$. Berechne $y(t)$.`, [
        W.mc('Welche Grenzen hat das Integral?', [R`$\int_0^t$ für $t\ge 0$`, R`$\int_{-\infty}^{t}$`, R`$\int_t^{\infty}$`], 0, 'Beide Signale starten bei $0$.'),
        W.mc('Was ist das Integral?', [R`$\int_0^te^{\tau}d\tau=e^t-1$`, R`$\int_0^te^{\tau}d\tau=e^t$`, R`$\int_0^te^{\tau}d\tau=e^t+1$`], 0, R`Untere Grenze nicht vergessen: $e^0=1$.`),
        W.mc('Wie lautet das Ergebnis?', [R`$y(t)=\sigma(t)(e^t-1)$`, R`$y(t)=e^t-1$`, R`$y(t)=\sigma(t)e^t$`], 0, R`Die Einschaltfunktion kommt davor. Probe: $y(0)=0$.`)
      ], { ref: 'Kap. 5 S. 7' }),
      Q.tf('m11q6', 'Stimmen die Rechenregeln?', [
        [R`$\delta(t)*\cos(t)=\cos(t)$`, true, 'Der Impuls ist das Einselement.'],
        [R`$\delta(t-2)*\sigma(t)=\sigma(t-2)$`, true, 'Faltung mit einem Impuls verschiebt.'],
        [R`$g*x=x*g$`, true, 'Die Faltung ist kommutativ.'],
        [R`$(x_1\cdot x_2)*g=(x_1*g)\cdot(x_2*g)$`, false, 'Distributiv gilt nur für Summen, nicht für Produkte.']
      ], { ref: 'Kap. 5 S. 4' }),
      Q.walk('m11q7', R`Übung 2 aus dem Skript: Ein System mit $g(t)=\sigma(t)e^{-at}$ bekommt das Rechteck $x(t)=\sigma(t)-\sigma(t-t_a)$. Berechne $y(t)$.`, [
        W.mc('Was ist die Antwort auf den ersten Sprung $\\sigma(t)$ allein?', [R`$h(t)=\sigma(t)\frac{1-e^{-at}}{a}$`, R`$\sigma(t)e^{-at}$`, R`$\sigma(t)(1-e^{-at})$`], 0, R`Die Antwort auf den Sprung ist das Integral der Impulsantwort. Der Faktor $\frac1a$ kommt aus dem Integrieren.`),
        W.mc('Was ist die Antwort auf den zweiten Sprung $\\sigma(t-t_a)$?', [R`$h(t-t_a)=\sigma(t-t_a)\frac{1-e^{-a(t-t_a)}}{a}$`, R`$\sigma(t)\frac{1-e^{-at}}{a}$`, R`$\sigma(t-t_a)\frac{1-e^{-at}}{a}$`], 0, 'Zeitinvarianz: Dasselbe Ergebnis, nur verschoben. **Jedes** $t$ wird ersetzt.'),
        W.mc('Wie lautet das Gesamtergebnis?', [R`$\sigma(t)\frac{1-e^{-at}}{a}-\sigma(t-t_a)\frac{1-e^{-a(t-t_a)}}{a}$`, R`$\sigma(t)\frac{1-e^{-at}}{a}+\sigma(t-t_a)\frac{1-e^{-a(t-t_a)}}{a}$`, R`$\sigma(t)\frac{1-e^{-at}}{a}$`], 0, 'Linearität: Eingang ist eine Differenz, also ist auch der Ausgang eine Differenz. Das ist der schnellste Weg bei allen Rechtecken.')
      ], { ref: 'Kap. 5 S. 8', lvl: 3 }),
      Q.walk('m11q8', R`**Aufgabe 5-1** $g(t)=\sigma(t)\,e^{-2t}$, $x(t)=a\,\sigma(t)\sin(\omega t)$. Berechne $y(t)=\int_{-\infty}^{\infty}x(t-\tau)\,g(\tau)\,d\tau$.`, [
        W.mc('Schritt 1 bis 3: Welche Grenzen bleiben?', [R`$\int_0^t$ für $t\ge 0$`, R`$\int_{-\infty}^{t}$`, R`$\int_0^{\infty}$`], 0, R`$g(\tau)$ verlangt $\tau\ge 0$, $x(t-\tau)$ verlangt $\tau\le t$.`),
        W.mc('Schritt 4 und 5: Wie sieht das vereinfachte Integral aus?', [R`$\sigma(t)\,a\int_0^t\sin(\omega(t-\tau))\,e^{-2\tau}\,d\tau$`, R`$\sigma(t)\,a\int_0^t\sin(\omega\tau)\,e^{-2(t+\tau)}\,d\tau$`, R`$a\int_{-\infty}^{\infty}\sin(\omega\tau)\,e^{-2\tau}\,d\tau$`], 0, 'Konstanten raus, die Sprungfunktionen werden innerhalb der Grenzen zu $1$, davor kommt die neue Einschaltfunktion.'),
        W.mc('Hilfreich ist die umgekehrte Formel mit $x(\\tau)g(t-\\tau)$, denn die Faltung ist kommutativ. Was entsteht dabei?', [R`$\sigma(t)\,a\,e^{-2t}\int_0^te^{2\tau}\sin(\omega\tau)\,d\tau$`, R`$\sigma(t)\,a\,e^{2t}\int_0^te^{-2\tau}\sin(\omega\tau)\,d\tau$`, R`$\sigma(t)\,a\int_0^t\sin(\omega\tau)\,d\tau$`], 0, R`$e^{-2(t-\tau)}=e^{-2t}e^{2\tau}$. Das $e^{-2t}$ darf vor das Integral.`),
        W.mc('Schritt 6: Mit der Formelsammlung ergibt sich', [R`$y(t)=\frac{a\,\sigma(t)}{4+\omega^2}\left(\omega e^{-2t}+2\sin\omega t-\omega\cos\omega t\right)$`, R`$y(t)=\frac{a\,\sigma(t)}{4+\omega^2}\left(2e^{-2t}+\omega\sin\omega t-2\cos\omega t\right)$`, R`$y(t)=\frac{a\,\sigma(t)}{2+\omega}\left(e^{-2t}+\sin\omega t-\cos\omega t\right)$`], 0, R`$\int e^{2\tau}\sin(\omega\tau)d\tau=\frac{e^{2\tau}}{4+\omega^2}(2\sin\omega\tau-\omega\cos\omega\tau)$, Grenzen einsetzen. Probe: $y(0)=\frac{a}{4+\omega^2}(\omega-\omega)=0$.`)
      ], { src: 'Blatt 5-1', ref: 'Blatt 5, Aufgabe 5-1', lvl: 3, pts: 5, sol: [plot({ title: R`Ergebnis für $a=1$, $\omega=3$: Erst ein Einschwingen, dann eine reine Sinusschwingung`, x: [-1, 8], y: [-0.4, 0.4], xl: 't', yl: 'y(t)', yt: [-0.3, 0.3], curves: [{ f: (t) => convExpSin(2, 3, t), c: 'g' }] })] }),
      Q.walk('m11q9', R`**Aufgabe 5-2** $g(t)=\sigma(t-t_a)$ mit $t_a>0$, $x(t)=\sigma(t)e^{-3t}$. Berechne $y(t)=\int_{-\infty}^{\infty}x(t-\tau)\,g(\tau)\,d\tau$.`, [
        W.mc('Welche Bedingung liefert $g(\\tau)$?', [R`$\tau\ge t_a$`, R`$\tau\le t_a$`, R`$\tau\ge 0$`], 0, R`$\sigma(\tau-t_a)=1$ für $\tau\ge t_a$.`),
        W.mc('Welche Bedingung liefert $x(t-\\tau)$?', [R`$\tau\le t$`, R`$\tau\ge t$`, R`$\tau\le 0$`], 0, R`$\sigma(t-\tau)=1$ für $t-\tau\ge 0$.`),
        W.mc('Welches Integral bleibt?', [R`$\sigma(t-t_a)\int_{t_a}^{t}e^{-3(t-\tau)}\,d\tau$`, R`$\sigma(t)\int_0^{t}e^{-3(t-\tau)}\,d\tau$`, R`$\sigma(t-t_a)\int_{t_a}^{\infty}e^{-3\tau}\,d\tau$`], 0, R`Aus $t_a\le\tau\le t$ folgen die Grenzen und auch die Bedingung $t\ge t_a$.`),
        W.mc('Wie lautet das Ergebnis?', [R`$y(t)=\sigma(t-t_a)\,\frac13\left[1-e^{-3(t-t_a)}\right]$`, R`$y(t)=\sigma(t-t_a)\,\frac13\left[1+e^{-3(t-t_a)}\right]$`, R`$y(t)=\sigma(t-t_a)\,3\left[1-e^{-3(t-t_a)}\right]$`], 0, R`$\left[\frac13e^{-3(t-\tau)}\right]_{t_a}^{t}=\frac13-\frac13e^{-3(t-t_a)}$. Probe: $y(t_a)=0$.`)
      ], { src: 'Blatt 5-2', ref: 'Blatt 5, Aufgabe 5-2', pts: 4, sol: [plot({ title: R`Ergebnis für $t_a=1$`, x: [-0.5, 4], y: [-0.06, 0.42], xl: 't', yl: 'y(t)', yt: [[1 / 3, '⅓']], curves: [{ f: (t) => convStepExp(3, 1, t), c: 'g' }] })] }),
      Q.walk('m11q10', R`**Aufgabe 5-3** Falte das Rechteck $x(t)=\sigma(t)-\sigma(t-t_a)$ mit sich selbst.`, [
        W.mc('Teile das Rechteck in Sprünge. Wie viele Faltungen entstehen beim Ausmultiplizieren?', ['Vier', 'Zwei', 'Eine'], 0, R`$(\sigma(t)-\sigma(t-t_a))*(\sigma(t)-\sigma(t-t_a))$ ergibt vier Teile.`),
        W.mc(R`Was ist $\sigma(t)*\sigma(t)$?`, [R`$\sigma(t)\,t$, also die Rampe`, R`$\sigma(t)$`, R`$\delta(t)$`], 0, R`$\int_0^t1\,d\tau=t$ für $t\ge 0$.`),
        W.mc(R`Was ist dann $\sigma(t)*\sigma(t-t_a)$?`, [R`$\sigma(t-t_a)(t-t_a)$`, R`$\sigma(t-t_a)\,t$`, R`$\sigma(t)(t-t_a)$`], 0, 'Eine Verschiebung im Eingang verschiebt das Ergebnis. Sie kommt zweimal vor, daher der Faktor $2$.'),
        W.mc('Wie lautet das Gesamtergebnis?', [R`$\sigma(t)t+\sigma(t-t_a)(2t_a-2t)+\sigma(t-2t_a)(t-2t_a)$`, R`$\sigma(t)t-\sigma(t-t_a)(t-t_a)$`, R`$\sigma(t)t+\sigma(t-t_a)(t-t_a)+\sigma(t-2t_a)(t-2t_a)$`], 0, 'Die drei Rampen bilden ein Dreieck: steigen, fallen, und dann bleibt alles $0$. Die Lösung des Blatts schreibt es genauso.'),
        W.num(R`Wie hoch ist die Spitze des Dreiecks für $t_a=3$?`, 3, R`Bei $t=t_a$ überlappen beide Rechtecke vollständig. Die Fläche ist $t_a=3$.`)
      ], { src: 'Blatt 5-3', ref: 'Blatt 5, Aufgabe 5-3', lvl: 2, pts: 4 }),
      Q.walk('m11q11', R`**Aufgabe 5-4** $g(t)=2(\sigma(t-t_a)-\sigma(t-t_b))$ mit $0<t_a<t_b$, $x(t)=\cos^2(\omega t)$. Berechne $y(t)=\int_{-\infty}^{\infty}x(\tau)\,g(t-\tau)\,d\tau$.`, [
        W.mc(R`$g(t-\tau)$ ist $2$, wenn $t_a\le t-\tau\le t_b$. Welche Grenzen folgen?`, [R`$\int_{t-t_b}^{t-t_a}$`, R`$\int_{t-t_a}^{t-t_b}$`, R`$\int_{t_a}^{t_b}$`], 0, R`Nach $\tau$ umstellen: Wegen des Minuszeichens drehen sich die Ungleichungen um. Die untere Grenze ist $t-t_b$.`),
        W.mc(R`Wie integrierst du $\cos^2(\omega\tau)$?`, [R`Mit $\cos^2\alpha=\frac12(1+\cos 2\alpha)$`, 'Mit partieller Integration ohne Umformung', 'Mit der Siebeigenschaft'], 0, 'Dieses Additionstheorem steht im Anhang.'),
        W.mc('Wie lautet das Ergebnis?', [R`$y(t)=t_b-t_a+\frac{1}{2\omega}\left[\sin 2\omega(t-t_a)-\sin 2\omega(t-t_b)\right]$`, R`$y(t)=t_a-t_b+\frac{1}{2\omega}\left[\sin 2\omega(t-t_a)-\sin 2\omega(t-t_b)\right]$`, R`$y(t)=t_b-t_a+\frac{1}{\omega}\left[\sin\omega(t-t_a)-\sin\omega(t-t_b)\right]$`], 0, R`$2\int\frac12(1+\cos 2\omega\tau)d\tau=\tau+\frac{1}{2\omega}\sin 2\omega\tau$. Obere minus untere Grenze.`),
        W.fix('Wofür gibt es hier keine Einschaltfunktion vor dem Ergebnis?', ['Der Eingang läuft ewig, die Überlappung existiert für jedes $t$', 'Es wurde beim Rechnen vergessen', 'Die Faltung braucht nie eine Einschaltfunktion'], 0, 'Das Fenster passt für jedes $t$ auf den Kosinus. Eine Einschaltfunktion gibt es nur, wenn das Eingangssignal irgendwo beginnt.')
      ], { src: 'Blatt 5-4', ref: 'Blatt 5, Aufgabe 5-4', lvl: 3, pts: 4, sol: [plot({ title: R`Ergebnis für $t_a=0{,}5$, $t_b=1{,}5$, $\omega=2$ (ohne den Faktor 2 wäre es der gleitende Mittelwert)`, x: [0, 8], y: [-0.3, 1.8], xl: 't', yl: 'y(t)', yt: [1], curves: [{ f: (t) => convWindowCos2(2, 0.5, 1.5, 2, t), c: 'g' }] })] })
    ],
    calcs: ['g.convdelta', 'g.convexp', 'g.convstep', 'g.convrect', 'g.convsin', 'g.convwin']
  });

  SS_MOD({
    id: 'm12', order: 12, exam: 4, weight: 3, glyph: 'Σ', title: 'Faltungssumme und Frequenzgang', src: 'Kap. 5, S. 9 bis 10',
    goal: 'Du faltest diskrete Folgen von Hand und weißt, warum die Faltung im Frequenzbereich zu einer einfachen Multiplikation wird.',
    sections: [
      {
        id: 'm12s1', title: 'Die Faltungssumme', practice: ['m12q1', 'm12q3', 'g.convsum', 'g.convgeo'],
        blocks: [
          p('Bei diskreten Signalen wird aus dem Integral eine Summe. Der Gedanke bleibt genau derselbe:'),
          f(R`y(k)=x(k)*g(k)=\sum_{l=-\infty}^{\infty}x(l)\,g(k-l)`),
          lab('convsum'),
          ex(R`Schreibe $g$ umgedreht auf einen Streifen. Lege ihn so unter $x$, dass die Indizes zusammen $k$ ergeben. Multipliziere stellenweise und addiere. Für das nächste $k$ schiebst du um eins weiter.`),
          k(R`Die Länge des Ergebnisses: Länge von $x$ plus Länge von $g$ minus $1$. Und die Summe aller $y(k)$ ist das Produkt aus Summe aller $x(k)$ und Summe aller $g(k)$. Das ist eine gute Probe.`),
          p(R`Bei unendlichen Folgen begrenzt die Sprungfolge die Summe auf $0\le l\le k$. Das Beispiel im Skript ist $g(k)=\sigma(k)\left(\frac12\right)^k$ und $x(k)=\sigma(k)$. Dort entsteht eine **geometrische Reihe**:`),
          f(R`y(k)=\sigma(k)\sum_{l=0}^{k}\left(\frac12\right)^{k-l}=\sigma(k)\,\frac{1-\left(\frac12\right)^{k+1}}{1-\frac12}`)
        ]
      },
      {
        id: 'm12s2', title: 'Ausblick: der Frequenzgang', practice: ['m12q2'],
        blocks: [
          p(R`Das Faltungsintegral ist aufwendig. Die Fourier-Transformation (Kapitel 6 und 7) macht es einfach: Im Frequenzbereich wird aus der Faltung eine **Multiplikation**.`),
          f(R`y(t)=x(t)*g(t)\quad\Longleftrightarrow\quad Y(\omega)=X(\omega)\cdot G(\omega)`),
          p(R`$G(\omega)$ heißt **Übertragungsfunktion** oder **Frequenzgang**. Sie sagt für jede Frequenz, wie stark das System sie durchlässt und wie stark es sie verschiebt.`)
        ]
      }
    ],
    questions: [
      Q.num('m12q1', R`Gegeben: $x=[1,2,3]$ und $g=[1,1]$, beide ab $k=0$. Wie groß ist $y(2)$?`, 5, null, { steps: [R`$y(2)=x(0)g(2)+x(1)g(1)+x(2)g(0)=1\cdot 0+2\cdot 1+3\cdot 1=5$.`, R`Die ganze Folge ist $y=[1,3,5,3]$. Probe: $(1+2+3)\cdot(1+1)=12$ und $1+3+5+3=12$.`], ref: 'Kap. 5 S. 9' }),
      Q.num('m12q3', R`Für das Beispiel aus dem Skript: Wie groß ist $y(2)$?`, 1.75, null, { tol: 0.002, steps: [R`$y(2)=\left(\frac12\right)^2+\left(\frac12\right)^1+\left(\frac12\right)^0=\frac14+\frac12+1=1{,}75$.`], ref: 'Kap. 5 S. 9' }),
      Q.mc('m12q2', 'Was passiert mit der Faltung im Frequenzbereich?', ['Sie wird zur Multiplikation', 'Sie wird zur Addition', 'Sie bleibt eine Faltung', 'Sie wird zur Ableitung'], 0, R`$Y(\omega)=G(\omega)\cdot X(\omega)$. Darum sind Filter im Frequenzbereich so einfach zu verstehen.`, { ref: 'Kap. 5 S. 10' })
    ],
    calcs: ['g.convsum', 'g.convgeo']
  });
})();
