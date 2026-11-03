// Kapitel 6 und 7: Fourier-Reihe und Fourier-Transformation, Blatt 6 und 7.
(function () {
  'use strict';
  const R = String.raw;
  const { p, h3, b, k, w, ex, i, err, f, tb, plot, lab, st } = SSB;
  const Q = SSQ;
  const W = SSW;
  const { sig, ftRect } = SSEngine.Sig;
  const PI = Math.PI;
  const wrapPi = (t) => { let u = (t + PI) % (2 * PI); if (u < 0) u += 2 * PI; return u - PI; };

  SS_MOD({
    id: 'm13', order: 13, exam: 5, weight: 8, glyph: 'cₖ', title: 'Die Fourier-Reihe verstehen', src: 'Kap. 6, S. 1 bis 5',
    goal: 'Du verstehst, dass jedes periodische Signal aus Schwingungen besteht, kannst reelle und komplexe Form ineinander umrechnen und liest die Koeffizienten ohne Integral direkt ab. Das ist Aufgabe 6-1.',
    sections: [
      {
        id: 'm13s1', title: 'Die Idee', practice: ['m13q1'],
        blocks: [
          p(R`Bisher haben wir Signale in der **Zeit** betrachtet. Man kann aber auch fragen: Welche Frequenzen stecken darin? Ein Klavierton besteht aus einem Grundton und vielen Obertönen. Genau diese Zerlegung liefert die Fourier-Reihe.`),
          p(R`**Jedes periodische Signal** mit Periode $T$ lässt sich aus Sinus- und Kosinusschwingungen zusammensetzen, deren Frequenzen ganzzahlige Vielfache der **Grundkreisfrequenz** $\omega_0=\frac{2\pi}{T}$ sind.`),
          lab('fourier'),
          f(R`f(t)=\frac{a_0}{2}+\sum_{k=1}^{\infty}\bigl(a_k\cos(k\omega_0t)+b_k\sin(k\omega_0t)\bigr)`, 'Reelle Fourier-Reihe'),
          b(R`$\frac{a_0}{2}$ ist der **Gleichanteil**, der Mittelwert des Signals.`, R`$k=1$ ist die **Grundschwingung**.`, R`$k=2,3,\ldots$ sind die **Harmonischen** oder Oberschwingungen.`),
          err(R`Im Skript fehlt beim $b_k$-Term der reellen Reihe der Sinus. So wie hier oben ist es richtig.`)
        ]
      },
      {
        id: 'm13s2', title: 'Die komplexe Form', practice: ['m13q2', 'g.fsab'],
        blocks: [
          p(R`Mit den Euler-Formeln wird aus Sinus und Kosinus eine einzige Exponentialform. Das sieht erst schwieriger aus, ist aber viel bequemer, weil es nur noch **einen** Koeffizienten gibt:`),
          f(R`f(t)=\sum_{k=-\infty}^{\infty}c_k\,e^{jk\omega_0t}`, 'Komplexe Fourier-Reihe'),
          err(R`Im Skript steht in dieser Formel noch ein "$c_0+$" und ein "$dt$". Die Summe läuft über alle $k$ und enthält $c_0$ schon, ein Integral gibt es hier nicht.`),
          p(R`Warum gibt es auch negative $k$? Nach Euler besteht ein Kosinus aus zwei gegenläufig drehenden Zeigern: $\cos\alpha=\frac12e^{j\alpha}+\frac12e^{-j\alpha}$. Deren Imaginärteile heben sich immer auf, übrig bleibt ein reelles Signal.`),
          h3('Umrechnen'),
          tb(['Von reell nach komplex', 'Von komplex nach reell'], [[R`$c_0=\frac{a_0}{2}$`, R`$a_0=2c_0$`], [R`$c_k=\frac12(a_k-jb_k)$`, R`$a_k=c_k+c_{-k}$`], [R`$c_{-k}=\frac12(a_k+jb_k)=c_k^*$`, R`$b_k=j(c_k-c_{-k})$`]]),
          k(R`Bei reellen Signalen gilt immer $c_{-k}=c_k^*$. Du musst also nur die Hälfte ausrechnen.`)
        ]
      },
      {
        id: 'm13s3', title: 'Die Grundfrequenz finden', practice: ['m13q3', 'g.fsw0'],
        blocks: [
          p(R`Steht das Signal als Summe mehrerer Schwingungen da, ist $\omega_0$ die größte Frequenz, von der alle anderen ganzzahlige Vielfache sind, also der **ggT**. Gleichwertig ist die Periode das **kleinste gemeinsame Vielfache** aller Einzelperioden.`),
          tb(['Signal', 'Frequenzen', R`$\omega_0$`, R`$T$`], [[R`$\cos(4t)+\sin(8t)$`, '$4,\\;8$', '$4$', R`$\frac{\pi}{2}$`], [R`$\cos(8t)-\sin(3t)$`, '$8,\\;3$', '$1$', R`$2\pi$`], [R`$\cos(\frac13t)+\sin(\frac23t)$`, R`$\frac13,\;\frac23$`, R`$\frac13$`, R`$6\pi$`]]),
          w(R`Bei $\cos(8t)-\sin(3t)$ ist $\omega_0=1$, nicht $3$ oder $8$. Der Kosinus hat dann $k=8$ und der Sinus $k=3$. Die Schwingung mit $\omega_0$ selbst muss gar nicht im Signal vorkommen.`)
        ]
      },
      {
        id: 'm13s4', title: 'Koeffizientenvergleich', practice: ['m13q4', 'm13q5', 'm13q6', 'm13q7', 'g.fscompare', 'g.fsphase'],
        blocks: [
          p(R`Steht das Signal bereits als Summe von Sinus und Kosinus da, brauchst du **kein Integral**. Du schreibst nur um und liest ab.`),
          ex(R`1. Grundfrequenz $\omega_0$ bestimmen. 2. Jeden Sinus und Kosinus mit Euler umschreiben. 3. Vor jedem $e^{jk\omega_0t}$ steht ein $c_k$: ablesen. 4. Alle anderen $c_k$ sind null.`),
          st('Aufgabe 6-1 a) in Ruhe', [
            { f: R`f(t)=\cos(4t)+\sin(8t)`, x: R`**1.** Die Frequenzen sind $4$ und $8$. Also $\omega_0=4$, und die Terme liegen bei $k=1$ und $k=2$.` },
            { f: R`f(t)=\frac12e^{j4t}+\frac12e^{-j4t}+\frac{1}{2j}e^{j8t}-\frac{1}{2j}e^{-j8t}`, x: '**2.** Euler auf beide Terme anwenden.' },
            { f: R`e^{j4t}=e^{j\cdot 1\cdot\omega_0t},\qquad e^{j8t}=e^{j\cdot 2\cdot\omega_0t}`, x: R`**3.** Mit $\omega_0=4$ den Index ablesen.` },
            { f: R`c_{\pm 1}=\frac12,\quad c_2=\frac{1}{2j}=-\frac{j}{2},\quad c_{-2}=-\frac{1}{2j}=\frac{j}{2}`, x: R`**4.** Fertig. Probe: $c_{-2}=c_2^*$.` }
          ]),
          lab('spectrum'),
          k(R`**Phase:** Aus $\cos(k\omega_0t+\varphi)$ wird $\frac12e^{j\varphi}e^{jk\omega_0t}+\frac12e^{-j\varphi}e^{-jk\omega_0t}$. Die Phase steckt also im Vorfaktor. Beim Sinus genauso, mit $\frac{1}{2j}$ und $-\frac{1}{2j}$.`)
        ]
      }
    ],
    questions: [
      Q.tf('m13q1', 'Stimmen die Aussagen?', [
        ['Jede Harmonische hat eine Frequenz, die ein ganzzahliges Vielfaches von $\\omega_0$ ist.', true, 'Genau das bedeutet Harmonische.'],
        [R`$\frac{a_0}{2}$ ist der Mittelwert des Signals.`, true, 'Sinus und Kosinus mitteln sich über eine Periode weg.'],
        ['Die Fourier-Reihe gilt auch für aperiodische Signale.', false, 'Dafür braucht man die Fourier-Transformation aus Kapitel 7.']
      ], { ref: 'Kap. 6 S. 1' }),
      Q.mc('m13q2', R`Es gilt $c_3=1-2j$. Wie groß ist $c_{-3}$ bei einem reellen Signal?`, [R`$1+2j$`, R`$1-2j$`, R`$-1+2j$`, R`$-1-2j$`], 0, R`$c_{-k}=c_k^*$: Das Vorzeichen des Imaginärteils dreht sich.`, { ref: 'Kap. 6 S. 2' }),
      Q.num('m13q3', R`Wie groß ist $\omega_0$ von $\sin(6t)+\cos(9t)$?`, 3, null, { steps: [R`$\mathrm{ggT}(6,9)=3$.`, R`Der Sinus liegt bei $k=2$, der Kosinus bei $k=3$.`], ref: 'Kap. 6 S. 3' }),
      Q.walk('m13q4', R`**Aufgabe 6-1 a)** Bestimme die Fourierkoeffizienten von $f(t)=\cos(4t)+\sin(8t)$.`, [
        W.num(R`Wie groß ist $\omega_0$?`, 4, R`$\mathrm{ggT}(4,8)=4$. Der Kosinus liegt bei $k=1$, der Sinus bei $k=2$.`),
        W.num(R`Wie groß ist $c_1$?`, 0.5, R`$\cos(4t)=\frac12e^{j4t}+\frac12e^{-j4t}$, also $c_{\pm 1}=\frac12$.`),
        W.mc(R`Wie groß ist $c_2$?`, [R`$\frac{1}{2j}$`, R`$\frac{j}{2}$`, R`$\frac12$`], 0, R`$\sin(8t)=\frac{1}{2j}e^{j8t}-\frac{1}{2j}e^{-j8t}$.`),
        W.mc(R`Wie groß ist $c_{-2}$?`, [R`$\frac{j}{2}$`, R`$\frac{1}{2j}$`, R`$-\frac{j}{2}$`], 0, R`$-\frac{1}{2j}=\frac{j}{2}$, weil $\frac{1}{j}=-j$.`)
      ], { src: 'Blatt 6-1a', ref: 'Blatt 6, Aufgabe 6-1' }),
      Q.walk('m13q5', R`**Aufgabe 6-1 b)** Bestimme die Fourierkoeffizienten von $f(t)=3+\cos(8t)-\sin(3t)$.`, [
        W.num(R`Wie groß ist $\omega_0$?`, 1, R`$\mathrm{ggT}(8,3)=1$.`),
        W.num(R`Wie groß ist $c_0$?`, 3, 'Die Konstante ist der Gleichanteil.'),
        W.num(R`Wie groß ist $c_8$?`, 0.5, 'Der Kosinus mit $k=8$ liefert $\\frac12$.'),
        W.mc(R`Wie groß ist $c_3$? Vor dem Sinus steht ein Minus!`, [R`$\frac{j}{2}$`, R`$\frac{1}{2j}$`, R`$-\frac12$`], 0, R`$-\sin(3t)=-\frac{1}{2j}e^{j3t}+\frac{1}{2j}e^{-j3t}$. Also $c_3=-\frac{1}{2j}=\frac{j}{2}$ und $c_{-3}=\frac{1}{2j}$.`)
      ], { src: 'Blatt 6-1b', ref: 'Blatt 6, Aufgabe 6-1' }),
      Q.walk('m13q6', R`**Aufgabe 6-1 c)** Bestimme die Fourierkoeffizienten von $f(t)=\cos\left(\frac13t\right)+\sin\left(\frac23t-3\right)$.`, [
        W.mc(R`Wie groß ist $\omega_0$?`, [R`$\frac13$`, R`$\frac23$`, '$1$', '$3$'], 0, R`$\frac23$ ist das Doppelte von $\frac13$. Der Kosinus liegt also bei $k=1$, der Sinus bei $k=2$.`),
        W.num(R`Wie groß ist $c_1$?`, 0.5, 'Kosinus ohne Phase.'),
        W.mc(R`Wie groß ist $c_2$?`, [R`$\frac{e^{-3j}}{2j}$`, R`$\frac{e^{3j}}{2j}$`, R`$\frac{1}{2j}$`], 0, R`$\sin(\frac23t-3)=\frac{e^{j(\frac23t-3)}-e^{-j(\frac23t-3)}}{2j}$. Exponent aufteilen: vor $e^{j\frac23t}$ steht $\frac{e^{-3j}}{2j}$.`),
        W.mc(R`Wie groß ist $c_{-2}$?`, [R`$\frac{j\,e^{3j}}{2}$`, R`$\frac{e^{3j}}{2j}$`, R`$\frac{j\,e^{-3j}}{2}$`], 0, R`$-\frac{e^{3j}}{2j}=\frac{j\,e^{3j}}{2}$. Probe: Das ist das Konjugierte von $c_2$.`)
      ], { src: 'Blatt 6-1c', ref: 'Blatt 6, Aufgabe 6-1', lvl: 3 }),
      Q.walk('m13q7', R`**Aufgabe 6-1 d)** Bestimme die Fourierkoeffizienten von $f(t)=\cos(8t)-\sin(3t-1)$.`, [
        W.num(R`Wie groß ist $\omega_0$?`, 1, R`$\mathrm{ggT}(8,3)=1$.`),
        W.mc(R`Wie groß ist $c_3$?`, [R`$\frac{j\,e^{-j}}{2}$`, R`$\frac{e^{-j}}{2j}$`, R`$\frac{j\,e^{j}}{2}$`], 0, R`Der Sinus liefert $\frac{e^{-j}}{2j}$, das Minus davor dreht das Vorzeichen: $-\frac{e^{-j}}{2j}=\frac{j\,e^{-j}}{2}$.`),
        W.mc(R`Wie groß ist $c_{-3}$?`, [R`$\frac{e^{j}}{2j}$`, R`$\frac{e^{-j}}{2j}$`, R`$-\frac{e^{j}}{2j}$`], 0, 'Das Konjugierte von $c_3$.')
      ], { src: 'Blatt 6-1d', ref: 'Blatt 6, Aufgabe 6-1', lvl: 3 })
    ],
    calcs: ['g.fsab', 'g.fsw0', 'g.fscompare', 'g.fsphase']
  });

  SS_MOD({
    id: 'm14', order: 14, exam: 5, weight: 9, glyph: '∫', title: 'Koeffizienten berechnen und Linienspektrum', src: 'Kap. 6, S. 6 bis 10',
    goal: 'Du berechnest Fourierkoeffizienten mit dem Analyse-Integral, nutzt Symmetrien als Abkürzung und zeichnest das Linienspektrum. Das ist Aufgabe 6-2 bis 6-4.',
    sections: [
      {
        id: 'm14s1', title: 'Die Analyse-Formeln', practice: ['m14q1', 'g.fssym'],
        blocks: [
          p('Wenn das Signal nicht als Summe von Schwingungen dasteht, sondern als Formel oder Bild, brauchst du die Integrale. Du kannst das Intervall frei wählen, Hauptsache es ist genau eine Periode lang.'),
          f(R`a_k=\frac{2}{T}\int_{T}f(t)\cos(k\omega_0t)\,dt,\qquad b_k=\frac{2}{T}\int_{T}f(t)\sin(k\omega_0t)\,dt`),
          f(R`c_k=\frac{1}{T}\int_{T}f(t)\,e^{-jk\omega_0t}\,dt`),
          i(R`Das Integral misst, wie stark das Signal der Schwingung $k$ ähnelt. Passen beide zusammen, entsteht eine große Fläche, sonst heben sich positive und negative Anteile auf.`),
          h3('Symmetrie spart Arbeit'),
          tb(['Das Signal ist', 'Folge', 'Bei $c_k$'], [['gerade', R`$b_k=0$, nur Kosinus`, R`$c_k$ rein reell`], ['ungerade', R`$a_k=0$ und $a_0=0$, nur Sinus`, R`$c_k$ rein imaginär`]]),
          w(R`Rechne $c_0$ bzw. $a_0$ immer **getrennt** aus. Die allgemeine Formel hat meist ein $k$ im Nenner und gilt für $k=0$ nicht.`)
        ]
      },
      {
        id: 'm14s2', title: 'Beispiel: Rechteckschwingung', practice: ['m14q2', 'g.fssquare', 'g.fspulse'],
        blocks: [
          plot({ title: R`Rechteckschwingung mit Periode $2\pi$`, x: [-7, 7], y: [-1.4, 1.4], xl: 't', xt: [[-2 * PI, '−2π'], [-PI, '−π'], [PI, 'π'], [2 * PI, '2π']], yt: [-1, 1], curves: [{ f: (t) => (wrapPi(t) >= 0 ? 1 : -1), c: 'p' }], h: 130 }),
          st('Beispiel aus dem Skript, Schritt für Schritt', [
            { x: R`**1. Grundfrequenz:** $T=2\pi$, also $\omega_0=1$.`, f: R`\omega_0=\frac{2\pi}{T}=1` },
            { x: R`**2. Symmetrie:** Die Funktion ist ungerade, also $a_k=0$ für alle $k$. Nur $b_k$ bleibt, und wegen des ungeraden Produkts reicht die halbe Periode mal zwei.`, f: R`b_k=\frac{2}{\pi}\int_0^{\pi}1\cdot\sin(kt)\,dt` },
            { x: '**3. Integrieren:**', f: R`b_k=\frac{2}{\pi}\left[-\frac{\cos(kt)}{k}\right]_0^{\pi}=\frac{2}{\pi k}\bigl(1-\cos(k\pi)\bigr)` },
            { x: R`**4. Vereinfachen** mit $\cos(k\pi)=(-1)^k$. Für gerade $k$ ist das $0$, für ungerade $k$ ist es $\frac{4}{\pi k}$.`, f: R`b_k=\frac{2}{\pi k}\bigl(1-(-1)^k\bigr)` }
          ]),
          k(R`Merke dir die zwei Vereinfachungen für ganze $k$: $\cos(k\pi)=(-1)^k$ und $\sin(k\pi)=0$.`)
        ]
      },
      {
        id: 'm14s3', title: 'Partielle Integration: Sägezahn', practice: ['m14q3', 'm14q4', 'g.fssaw'],
        blocks: [
          p(R`Steht $t$ im Signal, kommst du um die partielle Integration nicht herum. Für den Sägezahn $f(t)=\frac{T}{4}-\frac{t}{2}$ auf $[0,T)$ liefert das Skript $c_k=-\frac{jT}{4k\pi}$.`),
          ex(R`**Vorgehen beim $c_k$-Integral:** 1. Wähle $u=t$ und $v'=e^{-jk\omega_0t}$, also $v=\frac{e^{-jk\omega_0t}}{-jk\omega_0}$. 2. Der Randterm enthält $e^{-jk\omega_0T}=e^{-j2\pi k}=1$. 3. Das Restintegral über eine ganze Periode ist für $k\ne 0$ null. 4. Vereinfache mit $\frac{1}{j}=-j$. Bei $t^3$ wiederholst du das dreimal.`),
          plot({ title: 'Sägezahn', x: [-3, 6], y: [-1.5, 1.5], xl: 't', xt: [[2, 'T'], [4, '2T'], [-2, '−T']], yn: 2, curves: [{ f: (t) => { let u = t % 2; if (u < 0) u += 2; return 1 * (0.5 - u / 2) * 2; }, c: 'p' }], h: 120 })
        ]
      },
      {
        id: 'm14s4', title: 'Das Linienspektrum', practice: ['m14q5', 'm14q6', 'g.fsmag'],
        blocks: [
          p(R`Trägt man $|c_k|$ über der Frequenz $k\omega_0$ auf, entsteht das **Betragsspektrum**. Trägt man die Winkel auf, entsteht das **Phasenspektrum**. Weil nur Vielfache von $\omega_0$ vorkommen, besteht es aus einzelnen Linien.`),
          p(R`Beispiel: $f(t)=2+3\cos(\omega_0t)+\sin(2\omega_0t)$ hat $c_0=2$, $c_{\pm 1}=\frac32$, $c_2=-\frac{j}{2}$ und $c_{-2}=\frac{j}{2}$.`),
          plot({ title: 'Betragsspektrum', x: [-2.8, 2.8], y: [-0.2, 2.5], xl: 'kω₀', yl: '|c_k|', xt: [[-2, '−2ω₀'], [-1, '−ω₀'], [1, 'ω₀'], [2, '2ω₀']], yt: [[0.5, '½'], [1.5, '³⁄₂'], [2, '2']], stems: [{ k: [-2, -1, 0, 1, 2], v: [0.5, 1.5, 2, 1.5, 0.5], c: 'v' }], h: 150 }),
          plot({ title: 'Phasenspektrum', x: [-2.8, 2.8], y: [-2, 2], xl: 'kω₀', yl: 'φ_k', xt: [[-2, '−2ω₀'], [-1, '−ω₀'], [1, 'ω₀'], [2, '2ω₀']], yt: [[-PI / 2, '−π/2'], [PI / 2, 'π/2']], stems: [{ k: [-2, 2], v: [PI / 2, -PI / 2], c: 't' }], h: 150 }),
          k('Bei reellen Signalen ist das Betragsspektrum **gerade** (spiegelbildlich) und das Phasenspektrum **ungerade**. Die Linien bei $\\pm k$ haben jeweils die halbe Amplitude der echten Schwingung.'),
          err(R`Das Beispiel in Kapitel 6.2 des Skripts ist nicht stimmig: Die Linie ist mit Höhe $2$ statt $\frac32$ gezeichnet, und die Achse trägt $k$ statt $k\omega_0$. Rechne selbst nach, wenn du es dir ansiehst.`)
        ]
      },
      {
        id: 'm14s5', title: 'Die Aufgaben von Blatt 6', practice: ['m14q7', 'm14q8', 'm14q9'],
        blocks: [
          p('Das sind die drei anspruchsvollsten Aufgaben des Blatts. Rechne auf Papier mit, die App stellt dir die entscheidenden Zwischenfragen.'),
          plot({ title: R`Das Signal aus Aufgabe 6-3 für $A=1$`, x: [-7, 7], y: [-0.2, 1.3], xl: 't', xt: [[-2 * PI, '−2π'], [-PI, '−π'], [PI, 'π'], [2 * PI, '2π']], yt: [[1, 'A']], curves: [{ f: (t) => { const u = wrapPi(t); return u < 0 ? -u / PI : 0; }, c: 'p' }], h: 130 })
        ]
      }
    ],
    questions: [
      Q.tf('m14q1', 'Stimmen die Aussagen?', [
        ['Das Integrationsintervall muss genau eine Periode lang sein, darf aber frei liegen.', true, R`$[0,T]$ und $[-\frac{T}{2},\frac{T}{2}]$ liefern dasselbe.`],
        ['Bei einer geraden Funktion ist $c_k$ rein imaginär.', false, 'Bei einer geraden Funktion ist $c_k$ reell.'],
        [R`$c_0$ ist der Mittelwert über eine Periode.`, true, R`Für $k=0$ wird die e-Funktion zu $1$: $c_0=\frac{1}{T}\int f\,dt$.`]
      ], { ref: 'Kap. 6 S. 6' }),
      Q.num('m14q2', R`Für die Rechteckschwingung aus dem Beispiel gilt $b_k=\frac{2}{\pi k}(1-(-1)^k)$. Wie groß ist $b_3$?`, 0.424, null, { tol: 0.006, steps: [R`$k=3$ ist ungerade: $1-(-1)^3=2$.`, R`$b_3=\frac{4}{3\pi}\approx 0{,}424$.`], ref: 'Kap. 6 S. 6' }),
      Q.mc('m14q3', R`Was gilt bei der partiellen Integration von $\int_0^T t\,e^{-jk\omega_0t}dt$ für den Faktor $e^{-jk\omega_0T}$?`, ['Er ist $1$, weil $k\\omega_0T=2\\pi k$ ist', 'Er ist $0$', 'Er ist $(-1)^k$', 'Er bleibt stehen'], 0, R`$\omega_0T=2\pi$. Und $e^{-j2\pi k}=1$ für jedes ganze $k$.`, { ref: 'Kap. 6 S. 7' }),
      Q.walk('m14q4', R`Übung aus dem Skript: $f(t)$ ist $2\pi$-periodisch mit $f(t)=t$ auf $[0,\pi]$ und $f(t)=\pi$ auf $(\pi,2\pi]$. Bestimme $c_k$.`, [
        W.mc(R`Wie groß ist $c_0$?`, [R`$\frac{3\pi}{4}$`, R`$\frac{\pi}{2}$`, R`$\pi$`], 0, R`$\frac{1}{2\pi}\left(\int_0^{\pi}t\,dt+\int_{\pi}^{2\pi}\pi\,dt\right)=\frac{1}{2\pi}\left(\frac{\pi^2}{2}+\pi^2\right)=\frac{3\pi}{4}$.`),
        W.mc(R`Wie lautet $c_k$ für $k\ne 0$?`, [R`$\frac{j}{2k}+\frac{(-1)^k-1}{2\pi k^2}$`, R`$\frac{j}{k}$`, R`$\frac{(-1)^k}{k}$`], 0, 'Das erste Teilintegral braucht die partielle Integration, das zweite ist eine reine e-Funktion. Am Schluss vereinfachst du mit $e^{-jk\pi}=(-1)^k$.')
      ], { ref: 'Kap. 6 S. 9', lvl: 3 }),
      Q.num('m14q5', R`Wie hoch ist die Linie bei $k=\pm 1$ im Betragsspektrum von $f(t)=4\cos(\omega_0t)$?`, 2, null, { steps: [R`$4\cos(\omega_0t)=2e^{j\omega_0t}+2e^{-j\omega_0t}$.`, R`$|c_{\pm 1}|=2$, also die halbe Amplitude.`], ref: 'Kap. 6 S. 10' }),
      Q.tf('m14q6', R`Für $f(t)=5\sin(2t)$ mit $\omega_0=2$:`, [
        [R`$|c_1|=\frac52$`, true, R`$c_1=\frac{5}{2j}=-\frac52j$.`],
        [R`Die Phase von $c_1$ ist $-\frac{\pi}{2}$.`, true, 'Der Pfeil zeigt genau nach unten.'],
        [R`Die Phase von $c_{-1}$ ist ebenfalls $-\frac{\pi}{2}$.`, false, R`$c_{-1}=c_1^*=+\frac52j$, also $+\frac{\pi}{2}$.`]
      ], { ref: 'Kap. 6 S. 10' }),
      Q.walk('m14q7', R`**Aufgabe 6-2** $f(t)=t^3$ ist periodisch im Bereich $[0,2\pi]$. Berechne die komplexen Fourierkoeffizienten.`, [
        W.num(R`Wie groß ist $\omega_0$?`, 1, R`$T=2\pi$, also $\omega_0=1$. Das Integral ist $c_k=\frac{1}{2\pi}\int_0^{2\pi}t^3e^{-jkt}dt$.`),
        W.mc(R`Wie oft musst du partiell integrieren?`, ['Dreimal', 'Einmal', 'Zweimal'], 0, R`Bei jedem Schritt sinkt die Potenz von $t$ um eins, bis nur noch $e^{-jkt}$ übrig ist.`),
        W.mc(R`Mit $I_n=\int_0^{2\pi}t^ne^{-jkt}dt$ gilt wegen $e^{-j2\pi k}=1$ die Rekursion $I_n=\frac{j(2\pi)^n}{k}+\frac{n}{jk}I_{n-1}$. Was ist $I_0$?`, ['$0$', R`$2\pi$`, '$1$'], 0, 'Über eine ganze Periode integriert verschwindet die e-Funktion.'),
        W.mc(R`Dann ist $I_1=\frac{j2\pi}{k}$. Wie lautet $I_2$?`, [R`$\frac{j4\pi^2}{k}+\frac{4\pi}{k^2}$`, R`$\frac{j4\pi^2}{k}$`, R`$\frac{j4\pi^2}{k}-\frac{4\pi}{k^2}$`], 0, R`$\frac{2}{jk}\cdot\frac{j2\pi}{k}=\frac{4\pi}{k^2}$.`),
        W.mc(R`Das Ergebnis ist $c_k=\frac{I_3}{2\pi}$. Wie lautet es?`, [R`$c_k=\frac{4\pi^2jk^2+6k\pi-6j}{k^3}$`, R`$c_k=\frac{4\pi^2k^2+6k\pi+6}{k^3}$`, R`$c_k=\frac{4\pi^2jk^2-6k\pi+6j}{k^3}$`], 0, R`$I_3=\frac{j8\pi^3}{k}+\frac{3}{jk}I_2=\frac{j8\pi^3}{k}+\frac{12\pi^2}{k^2}-\frac{12\pi j}{k^3}$. Geteilt durch $2\pi$ steht es da. $c_0=2\pi^3$ rechnest du getrennt.`)
      ], { src: 'Blatt 6-2', ref: 'Blatt 6, Aufgabe 6-2', lvl: 3, pts: 5 }),
      Q.walk('m14q8', R`**Aufgabe 6-3** Gegeben ist die Funktion $f(t)$: Auf $[-\pi,0)$ fällt sie linear von $A$ auf $0$, also $f(t)=-\frac{A}{\pi}t$. Auf $[0,\pi)$ ist sie $0$.`, [
        W.mc('a) Welche Periode hat $f(t)$?', [R`$2\pi$`, R`$\pi$`, R`$4\pi$`], 0, R`Das Muster wiederholt sich alle $2\pi$. Also $\omega_0=1$.`),
        W.num(R`Wie groß ist $c_0$ für $A=1$, also der Mittelwert?`, 0.25, R`Dreiecksfläche $\frac12\pi A$ geteilt durch $2\pi$: $\frac{A}{4}$.`),
        W.mc(R`b) Wie lautet $a_k=\frac{1}{\pi}\int_{-\pi}^{0}-\frac{A}{\pi}t\cos(kt)\,dt$?`, [R`$-\frac{A}{\pi^2k^2}\left(1-(-1)^k\right)$, also $-\frac{2A}{\pi^2k^2}$ für ungerade $k$`, R`$\frac{A}{\pi k}(-1)^k$ für alle $k$`, R`$0$ für alle $k$`], 0, R`Partielle Integration: $\int_{-\pi}^{0}t\cos(kt)dt=\frac{1-(-1)^k}{k^2}$. Für gerade $k$ ist $a_k=0$.`),
        W.mc(R`Wie lautet $b_k=\frac{1}{\pi}\int_{-\pi}^{0}-\frac{A}{\pi}t\sin(kt)\,dt$?`, [R`$\frac{A}{\pi k}(-1)^k$`, R`$-\frac{A}{\pi k}$ für alle $k$`, R`$\frac{2A}{\pi k}$`], 0, R`$\int_{-\pi}^{0}t\sin(kt)dt=-\frac{\pi(-1)^k}{k}$. Für ungerade $k$ also $-\frac{A}{\pi k}$, für gerade $k$ $+\frac{A}{\pi k}$.`),
        W.mc(R`c) Wie lautet $c_k$?`, [R`$-\frac{A}{2\pi^2k^2}\left(1-(-1)^k\right)-j\frac{A}{2\pi k}(-1)^k$`, R`$-\frac{A}{2\pi^2k^2}\left(1-(-1)^k\right)+j\frac{A}{2\pi k}(-1)^k$`, R`$\frac{A}{2\pi k}(-1)^k$`], 0, R`$c_k=\frac12(a_k-jb_k)$. Die komplexe Rechnung mit dem Integral liefert dasselbe, das ist eine gute Probe.`)
      ], { src: 'Blatt 6-3', ref: 'Blatt 6, Aufgabe 6-3', lvl: 3, pts: 5 }),
      Q.walk('m14q9', R`**Aufgabe 6-4** $f(t)$ ist $\pi$-periodisch mit $f(t)=1-\cos(t)$ für $t\in[-\frac{\pi}{2},\frac{\pi}{2})$. Ermittle die komplexen Fourierkoeffizienten.`, [
        W.num(R`Wie groß ist $\omega_0$?`, 2, R`$T=\pi$, also $\omega_0=\frac{2\pi}{\pi}=2$. Das ist die häufigste Falle dieser Aufgabe.`),
        W.mc(R`Wie lautet das Integral?`, [R`$c_k=\frac{1}{\pi}\int_{-\pi/2}^{\pi/2}(1-\cos t)\,e^{-j2kt}\,dt$`, R`$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}(1-\cos t)\,e^{-jkt}\,dt$`, R`$c_k=\frac{1}{\pi}\int_{0}^{\pi}(1-\cos t)\,e^{-jkt}\,dt$`], 0, R`$\frac1T=\frac{1}{\pi}$, Periode von $-\frac{\pi}{2}$ bis $\frac{\pi}{2}$, und $k\omega_0=2k$.`),
        W.fix(R`Die Funktion ist gerade. Was folgt daraus?`, [R`$c_k$ ist reell, es bleibt nur der Kosinusteil von $e^{-j2kt}$`, R`$c_k$ ist rein imaginär`, R`$c_k=0$`], 0, R`Der Sinusteil hebt sich weg: $c_k=\frac{1}{\pi}\int(1-\cos t)\cos(2kt)\,dt$.`),
        W.mc(R`Wie lautet das Ergebnis für $k\ne 0$?`, [R`$c_k=\frac{2}{\pi(1-4k^2)}(-1)^{k+1}$`, R`$c_k=\frac{2}{\pi(1-4k^2)}$`, R`$c_k=\frac{1}{\pi k}(-1)^{k}$`], 0, R`Der Teil mit der $1$ fällt für $k\ne 0$ weg. Den Rest löst $\cos a\cos b=\frac12[\cos(a+b)+\cos(a-b)]$.`),
        W.mc(R`Wie groß ist $c_0$?`, [R`$1-\frac{2}{\pi}$`, R`$-\frac{2}{\pi}$`, R`$0$`], 0, R`$c_0=\frac{1}{\pi}\int_{-\pi/2}^{\pi/2}(1-\cos t)\,dt=\frac{1}{\pi}(\pi-2)$. Die allgemeine Formel würde für $k=0$ das falsche $-\frac{2}{\pi}$ liefern.`)
      ], { src: 'Blatt 6-4', ref: 'Blatt 6, Aufgabe 6-4', lvl: 3, pts: 5, sol: [err(R`In der Lösung des Blatts fehlt $c_0$. Sie gibt nur die allgemeine Formel an, die für $k=0$ nicht gilt.`)] })
    ],
    calcs: ['g.fssym', 'g.fssquare', 'g.fspulse', 'g.fssaw', 'g.fsmag']
  });

  SS_MOD({
    id: 'm15', order: 15, exam: 6, weight: 7, glyph: 'F', title: 'Die Fourier-Transformation', src: 'Kap. 7, S. 1 bis 5',
    goal: 'Du verstehst den Schritt von der Reihe zum Integral und berechnest das Spektrum einfacher Signale direkt. Das ist Aufgabe 7-1 und 7-2.',
    sections: [
      {
        id: 'm15s1', title: 'Von der Reihe zum Integral', practice: ['m15q1'],
        blocks: [
          p(R`Die Fourier-Reihe gilt nur für periodische Signale. Was ist mit einem einzelnen Impuls? Stell dir vor, die Periode $T$ wird immer größer. Dann rücken die Linien im Spektrum immer enger zusammen, denn ihr Abstand ist $\omega_0=\frac{2\pi}{T}$. Für $T\to\infty$ wird aus den einzelnen Linien eine **durchgehende Kurve** und aus der Summe ein Integral.`),
          f(R`F(\omega)=\int_{-\infty}^{\infty}f(t)\,e^{-j\omega t}\,dt`, 'Hintransformation: Wie viel steckt in der Frequenz ω?'),
          f(R`f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}F(\omega)\,e^{j\omega t}\,d\omega`, 'Rücktransformation'),
          p(R`Die Schreibweise für zusammengehörige Paare ist $f(t)\;\circ\!\!-\!\!\bullet\;F(\omega)$. Das Spektrum $F(\omega)$ ist meist komplex. Sein Betrag $|F(\omega)|$ sagt, wie stark die Frequenz vorkommt, sein Winkel sagt, wie sie verschoben ist.`),
          tb(['', 'Fourier-Reihe', 'Fourier-Transformation'], [['Signal', 'periodisch', 'aperiodisch'], ['Spektrum', 'einzelne Linien $c_k$', 'durchgehend $F(\\omega)$'], ['Formel', R`$c_k=\frac{1}{T}\int_Tf\,e^{-jk\omega_0t}dt$`, R`$F(\omega)=\int f\,e^{-j\omega t}dt$`]]),
          k(R`$F(0)=\int f(t)\,dt$ ist die **Fläche** unter dem Signal. Damit prüfst du jedes Ergebnis in Sekunden.`)
        ]
      },
      {
        id: 'm15s2', title: 'Beispiel: die abklingende e-Funktion', practice: ['m15q2', 'g.ftexp'],
        blocks: [
          st('Beispiel aus dem Skript', [
            { f: R`f(t)=\sigma(t)\,e^{-at},\quad a>0`, x: '**Gegeben:** ein bei $t=0$ einsetzendes Abklingen.', plot: { x: [-1, 4], y: [-0.1, 1.2], xl: 't', yl: 'f(t)', yt: [1], curves: [{ f: (t) => sig(t) * Math.exp(-t), c: 'p' }], h: 110 } },
            { f: R`F(\omega)=\int_0^{\infty}e^{-at}e^{-j\omega t}dt=\int_0^{\infty}e^{-(a+j\omega)t}dt`, x: '**Einsetzen:** Die Sprungfunktion setzt die untere Grenze auf $0$, die Exponenten werden zusammengefasst.' },
            { f: R`F(\omega)=\left[\frac{e^{-(a+j\omega)t}}{-(a+j\omega)}\right]_0^{\infty}=\frac{1}{a+j\omega}`, x: R`**Integrieren:** Oben verschwindet der Term wegen $a>0$, unten ist die e-Funktion $1$.` },
            { f: R`|F(\omega)|=\frac{1}{\sqrt{a^2+\omega^2}},\qquad\varphi(\omega)=-\arctan\frac{\omega}{a}`, x: '**Betrag und Phase:** Betrag oben durch Betrag unten, Winkel oben minus Winkel unten.', plot: { x: [-8, 8], y: [-0.1, 1.2], xl: 'ω', yl: '|F(ω)|', yt: [[1, '1/a']], curves: [{ f: (w) => 1 / Math.hypot(1, w), c: 'v' }], h: 120 } }
          ]),
          i('Ein Abklingen enthält vor allem tiefe Frequenzen. Hohe Frequenzen sind schwach vertreten. Das ist genau der Tiefpass-Charakter des RC-Glieds.')
        ]
      },
      {
        id: 'm15s3', title: 'Das Rechteck und seine Verwandten', practice: ['m15q3', 'm15q4', 'm15q5', 'g.ftrect', 'g.ftline'],
        blocks: [
          p(R`Ein Rechteck der Höhe $A$ auf $[-T,T]$ ist die wichtigste Korrespondenz überhaupt:`),
          f(R`F(\omega)=A\int_{-T}^{T}e^{-j\omega t}dt=A\left[\frac{e^{-j\omega t}}{-j\omega}\right]_{-T}^{T}=A\,\frac{e^{j\omega T}-e^{-j\omega T}}{j\omega}=\frac{2A\sin(\omega T)}{\omega}`),
          plot({ title: R`Spektrum eines Rechtecks mit $A=1$ und $T=1$`, x: [-14, 14], y: [-0.6, 2.3], xl: 'ω', yl: 'F(ω)', xt: [[-2 * PI, '−2π'], [-PI, '−π'], [PI, 'π'], [2 * PI, '2π']], yt: [[2, '2']], curves: [{ f: (w) => ftRect(1, 1, w), c: 'v', n: 600 }] }),
          b(R`Bei $\omega=0$ steht die Fläche: $F(0)=2AT$.`, R`Die Nullstellen liegen bei $\omega=\frac{n\pi}{T}$ mit $n\ne 0$.`),
          lab('ft'),
          k(R`Das Signal ist reell und gerade, also ist auch das Spektrum reell und gerade. Ist das Signal reell und ungerade, ist das Spektrum rein imaginär und ungerade.`)
        ]
      }
    ],
    questions: [
      Q.tf('m15q1', 'Stimmen die Aussagen?', [
        ['Die Fourier-Transformation ist auch für aperiodische Signale gedacht.', true, 'Das ist ihr Zweck.'],
        ['In der Hintransformation steht im Exponenten ein Minus.', true, R`$e^{-j\omega t}$.`],
        [R`In der Rücktransformation steht ein Faktor $\frac{1}{2\pi}$.`, true, 'Ohne ihn stimmt die Größe nicht.'],
        ['$F(0)$ ist der Wert des Signals bei $t=0$.', false, R`$F(0)$ ist die Fläche unter dem Signal. Der Wert $f(0)$ ist die Fläche unter dem Spektrum, geteilt durch $2\pi$.`]
      ], { ref: 'Kap. 7 S. 1' }),
      Q.num('m15q2', R`Für $f(t)=\sigma(t)e^{-3t}$ ist $F(\omega)=\frac{1}{3+j\omega}$. Wie groß ist $|F(4)|$?`, 0.2, null, { tol: 0.002, steps: [R`$|F(4)|=\frac{1}{\sqrt{9+16}}=\frac15=0{,}2$.`], ref: 'Kap. 7 S. 3' }),
      Q.walk('m15q3', R`**Aufgabe 7-1** Berechne das Fourierspektrum des Rechteckimpulses $f(t)=\sigma(t+T)-\sigma(t-T)$ mit $T>0$.`, [
        W.mc('Welche Grenzen hat das Integral?', [R`$\int_{-T}^{T}$`, R`$\int_{0}^{T}$`, R`$\int_{-\infty}^{\infty}$`], 0, R`Nur auf $[-T,T]$ ist $f(t)=1$, sonst $0$.`),
        W.mc('Wie lautet die Stammfunktion?', [R`$\frac{e^{-j\omega t}}{-j\omega}$`, R`$\frac{e^{-j\omega t}}{j\omega}$`, R`$-j\omega\,e^{-j\omega t}$`], 0, 'Beim Integrieren teilt man durch den Faktor vor $t$, hier $-j\\omega$.'),
        W.mc('Grenzen einsetzen und ordnen. Was entsteht?', [R`$\frac{e^{j\omega T}-e^{-j\omega T}}{j\omega}$`, R`$\frac{e^{j\omega T}+e^{-j\omega T}}{j\omega}$`, R`$\frac{e^{-j\omega T}-e^{j\omega T}}{j\omega}$`], 0, 'Das Minus im Nenner dreht die Differenz der Grenzen um.'),
        W.mc('Mit Euler wird daraus', [R`$F(\omega)=\frac{2}{\omega}\sin(\omega T)$`, R`$F(\omega)=\frac{2}{\omega}\cos(\omega T)$`, R`$F(\omega)=\frac{1}{\omega}\sin(\omega T)$`], 0, R`$e^{j\alpha}-e^{-j\alpha}=2j\sin\alpha$. Das $j$ kürzt sich. Probe: Für $\omega\to 0$ geht $F$ gegen $2T$, das ist die Fläche.`)
      ], { src: 'Blatt 7-1', ref: 'Blatt 7, Aufgabe 7-1', pts: 4 }),
      Q.walk('m15q4', R`**Aufgabe 7-2** Berechne die Fouriertransformierte von $f(t)=\frac{A}{a}t$ für $-a\le t\le a$ und $f(t)=0$ sonst.`, [
        W.fix('Welche Symmetrie hat $f(t)$, und was folgt daraus?', ['Ungerade, das Spektrum ist rein imaginär', 'Gerade, das Spektrum ist reell', 'Keine, das Spektrum ist allgemein komplex'], 0, R`$f(-t)=-f(t)$. Vom Integral bleibt nur der Sinusteil: $F(\omega)=-j\frac{A}{a}\int_{-a}^{a}t\sin(\omega t)dt$.`),
        W.mc(R`Wie lautet $\int t\sin(\omega t)\,dt$?`, [R`$\frac{\sin\omega t}{\omega^2}-\frac{t\cos\omega t}{\omega}$`, R`$\frac{\sin\omega t}{\omega^2}+\frac{t\cos\omega t}{\omega}$`, R`$\frac{t^2}{2}\sin\omega t$`], 0, R`Partielle Integration mit $u=t$ und $v'=\sin\omega t$.`),
        W.mc('Wie lautet das Ergebnis?', [R`$F(\omega)=\frac{2Aj}{\omega^2a}\left(\omega a\cos\omega a-\sin\omega a\right)$`, R`$F(\omega)=\frac{2A}{\omega^2a}\left(\omega a\cos\omega a-\sin\omega a\right)$`, R`$F(\omega)=\frac{2Aj}{\omega^2a}\left(\sin\omega a-\omega a\cos\omega a\right)$`], 0, R`Das Integral von $-a$ bis $a$ ist $2\left(\frac{\sin\omega a}{\omega^2}-\frac{a\cos\omega a}{\omega}\right)$. Das Vorzeichen des $-j$ vertauscht die Reihenfolge in der Klammer.`)
      ], { src: 'Blatt 7-2', ref: 'Blatt 7, Aufgabe 7-2', lvl: 3, pts: 4 }),
      Q.num('m15q5', R`Übung aus dem Skript: Das Dreieck mit Höhe $1$ auf $[-T,T]$ hat $F(\omega)=\frac{4}{T\omega^2}\sin^2\left(\frac{\omega T}{2}\right)$. Wie groß ist $F(0)$ für $T=3$? Nutze die Fläche.`, 3, null, { lvl: 2, steps: [R`$F(0)$ ist die Fläche unter dem Signal.`, R`Dreiecksfläche: $\frac12\cdot 2T\cdot 1=T=3$.`, 'Das Einsetzen von $\\omega=0$ in die Formel ginge nur mit einem Grenzwert. Die Fläche ist schneller.'], ref: 'Kap. 7 S. 5' })
    ],
    calcs: ['g.ftexp', 'g.ftrect', 'g.ftline']
  });

  SS_MOD({
    id: 'm16', order: 16, exam: 6, weight: 6, glyph: '○●', title: 'Eigenschaften und Korrespondenzen', src: 'Kap. 7, S. 6 bis 9, Anhang S. 2',
    goal: 'Du berechnest Spektren ohne Integral, indem du die Korrespondenztabelle mit den Eigenschaften kombinierst. Das ist Aufgabe 7-3 und 7-4.',
    sections: [
      {
        id: 'm16s1', title: 'Die Tabelle der Eigenschaften', practice: ['m16q1', 'g.ftprop'],
        blocks: [
          p('In der Klausur darfst du die Korrespondenzen nachschlagen. Mit diesen Regeln baust du daraus fast jedes andere Spektrum. Die Tabelle steht im Skript, Kapitel 7.1:'),
          tb(['Eigenschaft', 'Zeitbereich', 'Frequenzbereich'], [
            ['Linearität', R`$\alpha f_1+\beta f_2$`, R`$\alpha F_1+\beta F_2$`],
            ['Zeitverschiebung', R`$f(t-t_0)$`, R`$F(\omega)\,e^{-j\omega t_0}$`],
            ['Frequenzverschiebung', R`$f(t)\,e^{j\omega_0t}$`, R`$F(\omega-\omega_0)$`],
            ['Skalierung', R`$f(at)$`, R`$\frac{1}{|a|}F\left(\frac{\omega}{a}\right)$`],
            ['Ableitung', R`$\frac{df}{dt}$`, R`$j\omega\,F(\omega)$`],
            ['Integration', R`$\int_{-\infty}^{t}f(\tau)d\tau$`, R`$\frac{F(\omega)}{j\omega}+\pi F(0)\,\delta(\omega)$`],
            ['Dualität', R`$F(t)$`, R`$2\pi f(-\omega)$`],
            ['Faltung', R`$f_1*f_2$`, R`$F_1\cdot F_2$`]
          ]),
          k(R`Zeitverschiebung ändert nur die Phase, nie den Betrag: $|e^{-j\omega t_0}|=1$. Ein verzögertes Signal enthält dieselben Frequenzen.`),
          err(R`In Kapitel 7.1.4 steht in der Dualitätszeile ein falsches Vorzeichen im Exponenten. Richtig ist $e^{+j\omega_0t}\;\circ\!\!-\!\!\bullet\;2\pi\delta(\omega-\omega_0)$.`)
        ]
      },
      {
        id: 'm16s2', title: 'Dirac, Kosinus und Sinus', practice: ['m16q2', 'g.fttable'],
        blocks: [
          p(R`Der Impuls enthält **alle Frequenzen gleich stark**: $\delta(t)\;\circ\!\!-\!\!\bullet\;1$. Das ist auch der Grund, warum die Impulsantwort ein System vollständig beschreibt. Umgekehrt ist ein Gleichsignal eine einzige Linie bei $\omega=0$.`),
          tb(['Zeitsignal', 'Spektrum'], [
            [R`$\delta(t)$`, R`$1$`], [R`$\delta(t-t_0)$`, R`$e^{-j\omega t_0}$`], [R`$1$`, R`$2\pi\delta(\omega)$`], [R`$\sigma(t)$`, R`$\pi\delta(\omega)+\frac{1}{j\omega}$`],
            [R`$e^{j\omega_0t}$`, R`$2\pi\delta(\omega-\omega_0)$`], [R`$\cos(\omega_0t)$`, R`$\pi[\delta(\omega-\omega_0)+\delta(\omega+\omega_0)]$`], [R`$\sin(\omega_0t)$`, R`$\frac{\pi}{j}[\delta(\omega-\omega_0)-\delta(\omega+\omega_0)]$`],
            [R`$\sigma(t)e^{-at}$`, R`$\frac{1}{a+j\omega}$`], [R`$\sigma(t)\,t\,e^{-at}$`, R`$\frac{1}{(a+j\omega)^2}$`], [R`$e^{-a|t|}$`, R`$\frac{2a}{a^2+\omega^2}$`], [R`$\sigma(t+T)-\sigma(t-T)$`, R`$\frac{2\sin(\omega T)}{\omega}$`], [R`$e^{-at^2}$`, R`$\sqrt{\frac{\pi}{a}}\,e^{-\omega^2/4a}$`]
          ], 'Die wichtigsten Korrespondenzen (Anhang)'),
          plot({ title: R`Kosinus mit $\omega_0=2$: zwei Linien im Spektrum`, x: [-4, 4], y: [-0.5, 4], xl: 'ω', xt: [[-2, '−ω₀'], [2, 'ω₀']], yt: [[PI, 'π']], deltas: [{ x: -2, h: PI, c: 'v' }, { x: 2, h: PI, c: 'v' }], h: 130 })
        ]
      },
      {
        id: 'm16s3', title: 'Skalierung und Unschärfe', practice: ['m16q3', 'g.ftuncert'],
        blocks: [
          p(R`Stauchst du ein Signal, läuft alles schneller ab, und das Spektrum wird breiter. Das ist die **Skalierung**:`),
          f(R`f(at)\;\circ\!\!-\!\!\bullet\;\frac{1}{|a|}F\left(\frac{\omega}{a}\right)`),
          p('Daraus folgt die **Unschärferelation**: Ein Signal kann nicht gleichzeitig in der Zeit und in der Frequenz schmal sein. Ein kurzer Knall enthält viele Frequenzen, ein reiner langer Ton fast nur eine.'),
          f(R`\Delta t\cdot\Delta\omega\ge\text{const}`)
        ]
      },
      {
        id: 'm16s4', title: 'Die Aufgaben von Blatt 7', practice: ['m16q4', 'm16q5', 'g.ftdual'],
        blocks: [
          ex('1. Welche Korrespondenz sieht ähnlich aus? 2. Welche Eigenschaft überbrückt den Unterschied? 3. Vorfaktoren sorgfältig nachführen.')
        ]
      }
    ],
    questions: [
      Q.tf('m16q1', 'Stimmen die Aussagen?', [
        ['Eine Zeitverschiebung ändert den Betrag des Spektrums.', false, 'Nur die Phase ändert sich.'],
        ['Ableiten verstärkt hohe Frequenzen.', true, R`Der Faktor $j\omega$ wächst mit $\omega$.`],
        ['Faltung im Zeitbereich wird zur Multiplikation im Frequenzbereich.', true, 'Das ist der große Nutzen der Transformation.']
      ], { ref: 'Kap. 7 S. 6' }),
      Q.mc('m16q2', R`Was ist das Spektrum von $\delta(t-3)$?`, [R`$e^{-j3\omega}$`, R`$e^{j3\omega}$`, '$1$', R`$2\pi\delta(\omega-3)$`], 0, R`Korrespondenz $\delta(t)\;\circ\!\!-\!\!\bullet\;1$ und Zeitverschiebung.`, { ref: 'Anhang S. 2' }),
      Q.mc('m16q3', 'Ein Signal wird zeitlich auf die halbe Breite gestaucht. Was passiert mit dem Spektrum?', ['Es wird doppelt so breit und halb so hoch', 'Es wird halb so breit und doppelt so hoch', 'Es bleibt gleich', 'Es wird doppelt so breit und doppelt so hoch'], 0, R`$a=2$ in der Skalierungsformel: $\frac12F\left(\frac{\omega}{2}\right)$.`, { ref: 'Kap. 7 S. 8' }),
      Q.walk('m16q4', R`**Aufgabe 7-3** Bestimme mit der Integrationseigenschaft die Fouriertransformierte der Sprungfunktion $\sigma(t)=\int_{-\infty}^{t}\delta(\tau)\,d\tau$.`, [
        W.mc(R`Welche Funktion wird integriert, und was ist ihr Spektrum?`, [R`$\delta(t)$ mit $F(\omega)=1$`, R`$\sigma(t)$ mit $F(\omega)=1$`, R`$\delta(t)$ mit $F(\omega)=0$`], 0, 'Die Sprungfunktion ist das Integral des Impulses.'),
        W.num(R`Wie groß ist $F(0)$ in der Integrationseigenschaft?`, 1, R`$F(\omega)=1$ für alle $\omega$, also auch $F(0)=1$.`),
        W.mc(R`Setze in $\frac{F(\omega)}{j\omega}+\pi F(0)\delta(\omega)$ ein.`, [R`$\pi\delta(\omega)-\frac{j}{\omega}$`, R`$\pi\delta(\omega)+\frac{j}{\omega}$`, R`$\frac{1}{j\omega}$`, R`$2\pi\delta(\omega)$`], 0, R`$\frac{1}{j\omega}=-\frac{j}{\omega}$. Der Impuls bei $\omega=0$ steht für den Mittelwert $\frac12$ der Sprungfunktion.`)
      ], { src: 'Blatt 7-3', ref: 'Blatt 7, Aufgabe 7-3' }),
      Q.walk('m16q5', R`**Aufgabe 7-4** Bestimme mit einer Eigenschaft der Fourier-Transformation das Spektrum von $f(t)=\frac{1}{a^2+t^2}$.`, [
        W.mc('Welche Eigenschaft passt, wenn eine Funktion aussieht wie ein bekanntes **Spektrum**?', ['Die Dualität', 'Die Zeitverschiebung', 'Die Ableitung'], 0, R`Dualität: Aus $g(t)\;\circ\!\!-\!\!\bullet\;G(\omega)$ folgt $G(t)\;\circ\!\!-\!\!\bullet\;2\pi g(-\omega)$.`),
        W.mc('Welche Korrespondenz aus der Tabelle hat diese Form?', [R`$e^{-a|t|}\;\circ\!\!-\!\!\bullet\;\frac{2a}{a^2+\omega^2}$`, R`$\sigma(t)e^{-at}\;\circ\!\!-\!\!\bullet\;\frac{1}{a+j\omega}$`, R`$e^{-at^2}\;\circ\!\!-\!\!\bullet\;\sqrt{\frac{\pi}{a}}e^{-\omega^2/4a}$`], 0, 'Der Nenner $a^2+\\ldots^2$ passt genau.'),
        W.mc('Dualität anwenden. Was folgt?', [R`$\frac{2a}{a^2+t^2}\;\circ\!\!-\!\!\bullet\;2\pi\,e^{-a|\omega|}$`, R`$\frac{2a}{a^2+t^2}\;\circ\!\!-\!\!\bullet\;e^{-a|\omega|}$`, R`$\frac{1}{a^2+t^2}\;\circ\!\!-\!\!\bullet\;2\pi\,e^{-a|\omega|}$`], 0, R`$\omega$ und $t$ tauschen die Rollen. Der Betrag macht aus $-\omega$ wieder $\omega$.`),
        W.mc('Jetzt stört noch das $2a$ im Zähler. Was ist das Ergebnis?', [R`$F(\omega)=\frac{\pi}{a}\,e^{-a|\omega|}$`, R`$F(\omega)=2\pi\,e^{-a|\omega|}$`, R`$F(\omega)=\frac{2\pi}{a}\,e^{-a|\omega|}$`], 0, R`Linearität: Beide Seiten durch $2a$ teilen. $\frac{2\pi}{2a}=\frac{\pi}{a}$.`)
      ], { src: 'Blatt 7-4', ref: 'Blatt 7, Aufgabe 7-4', pts: 4 })
    ],
    calcs: ['g.ftprop', 'g.fttable', 'g.ftuncert', 'g.ftdual']
  });
})();
