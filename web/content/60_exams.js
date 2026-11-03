// Probeklausuren: 48 Minuten und 48 Punkte, im Stil der Übungsblätter, mit neuen Zahlen.
(function () {
  'use strict';
  const R = String.raw;
  const { sig } = SSEngine.Sig;
  const open = (id, pts, lvl, q, model, fig) => ({ id, k: 'open', q, model, pts, lvl, fig });
  const num = (id, pts, lvl, q, value, tol) => ({ id, k: 'num', q, num: value, tol: tol === undefined ? 0.011 : tol, pts, lvl });
  const mc = (id, pts, lvl, q, o, a) => ({ id, k: 'mc', q, o, a: [a], pts, lvl });
  const tf = (id, pts, lvl, q, st) => ({ id, k: 'tf', q, st: st.map(([s, v, e]) => ({ s, v, e })), pts, lvl });

  SS_CONTENT.exams.push({
    id: 'x1', title: 'Probeklausur 1', minutes: 48,
    scenario: 'Eng an den Übungsblättern, ein guter erster Test.',
    tasks: [
      { no: 1, title: 'Signale', pts: 8, questions: [
        open('x1a1', 3, 1, R`Zerlege $s(t)=2t^3-t^2+4t+1$ in geraden und ungeraden Anteil.`, [R`$s(-t)=-2t^3-t^2-4t+1$`, R`$s_e(t)=-t^2+1$`, R`$s_o(t)=2t^3+4t$`]),
        num('x1a2', 3, 2, R`Wie groß ist die Energie von $s(t)=3\sigma(t)e^{-2t}$?`, 2.25),
        mc('x1a3', 2, 2, R`Wie ist $s(t)=\sigma(t)\cos(t)$ einzuordnen?`, [R`Leistungssignal mit $P_\varnothing=\frac14$`, R`Leistungssignal mit $P_\varnothing=\frac12$`, 'Energiesignal', 'Keines von beiden'], 0)
      ] },
      { no: 2, title: 'Sprung, Rampe, Dirac', pts: 8, questions: [
        num('x1b1', 2, 1, R`Berechne $\int_{-\infty}^{\infty}(t^2+1)\,\delta(t-2)\,dt$.`, 5),
        mc('x1b2', 2, 1, R`Vereinfache $(t^2-4)\,\delta(t+2)$.`, ['$0$', R`$-4\,\delta(t+2)$`, R`$\delta(t+2)$`, R`$(t^2-4)$`], 0),
        open('x1b3', 4, 2, R`Leite ab: $s(t)=\sigma(t)\,e^{-2t}\cos(3t)$.`, [R`Sprung bei $t=0$ hat die Höhe $1$, also entsteht $\delta(t)$`, R`Produktregel: $f'(t)=e^{-2t}(-2\cos 3t-3\sin 3t)$`, R`Ergebnis: $\delta(t)+\sigma(t)\,e^{-2t}(-2\cos 3t-3\sin 3t)$`])
      ] },
      { no: 3, title: 'Systeme', pts: 8, questions: [
        tf('x1c1', 4, 2, R`Gegeben ist $y(t)=x(t-2)+t\,x(t)$.`, [['Das System ist linear.', true, 'Beide Summanden sind linear in $x$.'], ['Das System ist zeitinvariant.', false, 'Das $t$ vor $x(t)$ verrät es.'], ['Das System ist BIBO-stabil.', false, 'Mit $x=1$ wächst $y$ unbegrenzt.'], ['Das System ist kausal.', true, 'Nur Gegenwart und Vergangenheit.']]),
        open('x1c2', 4, 2, R`Zeige rechnerisch, dass $y(t)=x(t-2)+t\,x(t)$ zeitvariant ist.`, [R`$T\{x(t-t_0)\}=x(t-t_0-2)+t\,x(t-t_0)$`, R`$y(t-t_0)=x(t-t_0-2)+(t-t_0)\,x(t-t_0)$`, 'Die Ausdrücke unterscheiden sich, also zeitvariant'])
      ] },
      { no: 4, title: 'Faltung', pts: 10, questions: [
        open('x1d1', 6, 3, R`Ein System hat $g(t)=\sigma(t)e^{-3t}$. Am Eingang liegt $x(t)=\sigma(t)-\sigma(t-2)$. Berechne $y(t)$.`, [R`Antwort auf $\sigma(t)$: $\int_0^te^{-3\tau}d\tau$, also $h(t)=\sigma(t)\frac{1-e^{-3t}}{3}$`, R`Wegen Zeitinvarianz ist die Antwort auf $\sigma(t-2)$ gleich $h(t-2)$`, R`Wegen Linearität: $y(t)=h(t)-h(t-2)$`, R`Ausgeschrieben: $\sigma(t)\frac{1-e^{-3t}}{3}-\sigma(t-2)\frac{1-e^{-3(t-2)}}{3}$`]),
        num('x1d2', 2, 2, R`Wie groß ist $y(1)$?`, 0.3167, 0.004),
        num('x1d3', 2, 2, R`Wie groß ist $y(3)$?`, 0.01655, 0.002)
      ] },
      { no: 5, title: 'Fourier-Reihe', pts: 8, questions: [
        num('x1e1', 1, 1, R`$f(t)=2+3\cos(2t)-\sin(6t)$. Wie groß ist $\omega_0$?`, 2),
        num('x1e2', 2, 1, R`Wie groß ist die Periode $T$? (Dezimalzahl oder π)`, 3.1416, 0.02),
        num('x1e3', 1, 1, R`Wie groß ist $c_0$?`, 2),
        num('x1e4', 1, 1, R`Wie groß ist $c_1$?`, 1.5),
        open('x1e5', 3, 2, R`Gib $c_3$ und $c_{-3}$ an und skizziere das Betragsspektrum.`, [R`$c_3=-\frac{1}{2j}=\frac{j}{2}$`, R`$c_{-3}=\frac{1}{2j}=-\frac{j}{2}$`, R`Linien bei $0$, $\pm\omega_0$ und $\pm 3\omega_0$ mit Höhen $2$, $\frac32$ und $\frac12$`])
      ] },
      { no: 6, title: 'Fourier-Transformation', pts: 6, questions: [
        num('x1f1', 2, 1, R`$f(t)=2(\sigma(t+3)-\sigma(t-3))$. Wie groß ist $F(0)$?`, 12),
        num('x1f2', 2, 2, R`Wo liegt die erste Nullstelle von $F(\omega)$ für $\omega>0$? (Dezimalzahl oder π/3)`, 1.0472, 0.02),
        mc('x1f3', 2, 2, R`Wie lautet das Spektrum von $f(t-1)$?`, [R`$F(\omega)\,e^{-j\omega}$`, R`$F(\omega)\,e^{j\omega}$`, R`$F(\omega-1)$`, R`$F(\omega)-1$`], 0)
      ] }
    ]
  });

  SS_CONTENT.exams.push({
    id: 'x2', title: 'Probeklausur 2', minutes: 48,
    scenario: 'Neue Signale, gleiches Vorgehen. Hier zählt, ob du die Rezepte frei anwendest.',
    tasks: [
      { no: 1, title: 'Signale', pts: 8, questions: [
        num('x2a1', 3, 2, R`$s(t)=\sin(3t+\frac{\pi}{3})+\sin(3t-\frac{\pi}{3})$ ist wieder eine Sinusschwingung. Wie groß ist ihre Amplitude?`, 1),
        num('x2a2', 3, 2, R`Wie groß ist die Energie von $s(t)=2e^{-|t|}$?`, 4),
        mc('x2a3', 2, 2, R`Wie lautet der gerade Anteil von $s(t)=e^{t}$?`, [R`$\frac{e^t+e^{-t}}{2}=\cosh t$`, R`$\frac{e^t-e^{-t}}{2}=\sinh t$`, R`$e^{t}$`, '$1$'], 0)
      ] },
      { no: 2, title: 'Sprung, Rampe, Dirac', pts: 8, questions: [
        num('x2b1', 2, 1, R`Berechne $\int_{-\infty}^{\infty}\cos(t)\,\delta(t-\pi)\,dt$.`, -1),
        mc('x2b2', 2, 1, R`Vereinfache $t^2\,\delta(3-t)$.`, [R`$9\,\delta(t-3)$`, R`$9$`, R`$-9\,\delta(t-3)$`, R`$t^2\,\delta(t+3)$`], 0),
        open('x2b3', 4, 2, R`Gegeben ist $s(t)=\varrho(t)-\varrho(t-2)$. Skizziere $s(t)$ und bilde die erste und zweite Ableitung.`, ['Skizze: Anstieg von $0$ auf $2$ zwischen $t=0$ und $t=2$, danach konstant $2$', R`$s'(t)=\sigma(t)-\sigma(t-2)$, ein Rechteck`, R`$s''(t)=\delta(t)-\delta(t-2)$, zwei Impulse`])
      ] },
      { no: 3, title: 'Systeme', pts: 8, questions: [
        tf('x2c1', 4, 2, R`Gegeben ist $y(t)=x(t)\cos(2t)+3$.`, [['Das System ist linear.', false, R`$T\{0\}=3$.`], ['Das System ist zeitinvariant.', false, 'Der Kosinus hängt von $t$ ab.'], ['Das System ist BIBO-stabil.', true, R`$|y|\le M+3$.`], ['Das System ist kausal.', true, 'Nur der aktuelle Wert zählt.']]),
        open('x2c2', 4, 2, R`Zeige die Nichtlinearität und die Stabilität von $y(t)=x(t)\cos(2t)+3$.`, [R`$T\{\alpha x_1+\beta x_2\}=(\alpha x_1+\beta x_2)\cos 2t+3$`, R`$\alpha y_1+\beta y_2=(\alpha x_1+\beta x_2)\cos 2t+3(\alpha+\beta)$, also verschieden`, R`$|y|\le|x||\cos 2t|+3\le M+3$, also BIBO-stabil`])
      ] },
      { no: 4, title: 'Faltung', pts: 10, questions: [
        open('x2d1', 6, 3, R`Ein System hat $g(t)=\sigma(t-1)$. Am Eingang liegt $x(t)=\sigma(t)e^{-2t}$. Berechne $y(t)$ mit dem Faltungsintegral.`, [R`Ansatz: $y(t)=\int x(t-\tau)\,g(\tau)\,d\tau=\int\sigma(t-\tau)e^{-2(t-\tau)}\sigma(\tau-1)\,d\tau$`, R`Grenzen aus den Sprüngen: $1\le\tau\le t$, also nur für $t\ge 1$`, R`$y(t)=\sigma(t-1)\int_1^te^{-2(t-\tau)}d\tau$`, R`Ergebnis: $y(t)=\sigma(t-1)\frac12\left[1-e^{-2(t-1)}\right]$`]),
        num('x2d2', 1, 1, R`Wie groß ist $y(1)$?`, 0),
        num('x2d3', 2, 2, R`Wie groß ist $y(2)$?`, 0.4323, 0.004),
        num('x2d4', 1, 2, R`Welchem Wert nähert sich $y(t)$ für $t\to\infty$?`, 0.5)
      ] },
      { no: 5, title: 'Fourier-Reihe', pts: 8, questions: [
        mc('x2e1', 2, 1, R`$f(t)$ ist $2\pi$-periodisch mit $f=2$ auf $[0,\pi)$ und $f=-2$ auf $[\pi,2\pi)$. Welche Koeffizienten sind null?`, [R`Alle $a_k$`, R`Alle $b_k$`, 'Keine'], 0),
        open('x2e2', 2, 2, R`Berechne $b_k$ allgemein.`, [R`$b_k=2\cdot\frac{1}{\pi}\int_0^{\pi}2\sin(kt)\,dt$, die halbe Periode zählt doppelt`, R`$b_k=\frac{4}{\pi k}\left(1-(-1)^k\right)$`]),
        num('x2e3', 2, 1, R`Wie groß ist $b_1$?`, 2.546, 0.01),
        num('x2e4', 2, 2, R`Wie groß ist der Imaginärteil von $c_1$?`, -1.273, 0.01)
      ] },
      { no: 6, title: 'Fourier-Transformation', pts: 6, questions: [
        num('x2f1', 2, 1, R`$f(t)=\sigma(t)e^{-2t}$. Wie groß ist $|F(2)|$?`, 0.3536, 0.004),
        num('x2f2', 2, 2, R`Wie groß ist die Phase von $F(2)$ in Bogenmaß?`, -0.7854, 0.01),
        mc('x2f3', 2, 2, R`Wie lautet das Spektrum von $\frac{df}{dt}$?`, [R`$\frac{j\omega}{2+j\omega}$`, R`$\frac{1}{j\omega(2+j\omega)}$`, R`$\frac{-2}{2+j\omega}$`, R`$\frac{1}{(2+j\omega)^2}$`], 0)
      ] }
    ]
  });

  SS_CONTENT.exams.push({
    id: 'x3', title: 'Probeklausur 3', minutes: 48,
    scenario: 'Etwas anspruchsvoller. Hier werden die Themen miteinander verknüpft.',
    tasks: [
      { no: 1, title: 'Signale', pts: 8, questions: [
        mc('x3a1', 3, 2, R`Wie lautet der ungerade Anteil von $s(t)=e^{t}\cos(t)$?`, [R`$\cos(t)\sinh(t)$`, R`$\cos(t)\cosh(t)$`, R`$\sin(t)\sinh(t)$`, R`$e^{t}\cos(t)$`], 0),
        mc('x3a2', 3, 3, R`Wie ist $s(t)=\varrho(t)-\varrho(t-1)$ einzuordnen?`, [R`Leistungssignal mit $P_\varnothing=\frac12$`, 'Energiesignal', R`Leistungssignal mit $P_\varnothing=1$`, 'Keines von beiden'], 0),
        num('x3a3', 2, 1, R`Wie groß ist die Energie von $s(t)=3(\sigma(t)-\sigma(t-2))$?`, 18)
      ] },
      { no: 2, title: 'Sprung, Rampe, Dirac', pts: 8, questions: [
        open('x3b1', 4, 2, R`Leite ab: $s(t)=\varrho(t-1)+\sigma(t)\sin(2t)$.`, [R`$\frac{d}{dt}\varrho(t-1)=\sigma(t-1)$`, R`Der Sinus ist bei $t=0$ null, also kein Impuls`, R`Ergebnis: $\sigma(t-1)+2\sigma(t)\cos(2t)$`]),
        num('x3b2', 2, 1, R`Berechne $\int_{-\infty}^{\infty}e^{-t^2}\,\delta(t-1)\,dt$.`, 0.3679, 0.004),
        mc('x3b3', 2, 2, R`Vereinfache $\sigma(t-1)\,\delta(t+1)$.`, ['$0$', R`$\delta(t+1)$`, R`$\sigma(t-1)$`, R`$\delta(t-1)$`], 0)
      ] },
      { no: 3, title: 'Systeme', pts: 8, questions: [
        tf('x3c1', 4, 2, R`Gegeben ist der gleitende Mittelwert $y(t)=\int_{t-1}^{t}x(\tau)\,d\tau$.`, [['Das System ist linear.', true, 'Das Integral einer Summe ist die Summe der Integrale.'], ['Das System ist zeitinvariant.', true, 'Das Fenster wandert einfach mit.'], ['Das System ist BIBO-stabil.', true, R`$|y|\le 1\cdot M$, weil das Fenster die Länge $1$ hat.`], ['Das System ist kausal.', true, 'Es wird nur über die Vergangenheit integriert.']]),
        mc('x3c2', 2, 2, 'Wie lautet seine Impulsantwort?', [R`$g(t)=\sigma(t)-\sigma(t-1)$`, R`$g(t)=\delta(t)-\delta(t-1)$`, R`$g(t)=\varrho(t)-\varrho(t-1)$`, R`$g(t)=\sigma(t)$`], 0),
        mc('x3c3', 2, 2, 'Wie lautet seine Sprungantwort?', [R`$h(t)=\varrho(t)-\varrho(t-1)$`, R`$h(t)=\sigma(t)-\sigma(t-1)$`, R`$h(t)=\sigma(t)$`, R`$h(t)=\varrho(t)$`], 0)
      ] },
      { no: 4, title: 'Faltung', pts: 10, questions: [
        open('x3d1', 4, 2, R`Falte $x(t)=2(\sigma(t)-\sigma(t-1))$ mit $g(t)=\sigma(t)-\sigma(t-3)$. Skizziere das Ergebnis.`, ['Ergebnis ist ein Trapez, weil die Breiten verschieden sind', 'Anstieg von $t=0$ bis $t=1$, Dach bis $t=3$, Abfall bis $t=4$', R`Schreibweise: $2[\varrho(t)-\varrho(t-1)-\varrho(t-3)+\varrho(t-4)]$`]),
        num('x3d2', 2, 1, 'Wie hoch ist das Dach?', 2),
        num('x3d3', 2, 1, 'Ab welchem $t$ ist $y(t)=0$?', 4),
        num('x3d4', 2, 2, R`Wie groß ist $y(3{,}5)$?`, 1)
      ] },
      { no: 5, title: 'Fourier-Reihe', pts: 8, questions: [
        num('x3e1', 2, 1, R`$f(t)=t$ auf $[0,2\pi)$, $2\pi$-periodisch. Wie groß ist $c_0$? (Dezimalzahl oder π)`, 3.1416, 0.02),
        open('x3e2', 4, 3, R`Berechne $c_k$ für $k\ne 0$.`, [R`$c_k=\frac{1}{2\pi}\int_0^{2\pi}t\,e^{-jkt}dt$ mit $\omega_0=1$`, R`Partielle Integration mit $u=t$, $v'=e^{-jkt}$`, R`Randterm: $\frac{2\pi}{-jk}$ wegen $e^{-j2\pi k}=1$. Das Restintegral ist $0$`, R`Ergebnis: $c_k=\frac{j}{k}$`]),
        num('x3e3', 2, 1, R`Wie groß ist der Imaginärteil von $c_2$?`, 0.5)
      ] },
      { no: 6, title: 'Fourier-Transformation', pts: 6, questions: [
        num('x3f1', 2, 1, R`$f(t)=e^{-2|t|}$. Wie groß ist $F(0)$?`, 1),
        num('x3f2', 2, 1, R`Wie groß ist $F(2)$?`, 0.5),
        mc('x3f3', 2, 2, R`Wie lautet das Spektrum von $f(3t)$?`, [R`$\frac13\cdot\frac{4}{4+\omega^2/9}$`, R`$3\cdot\frac{4}{4+9\omega^2}$`, R`$\frac{4}{4+\omega^2/9}$`, R`$\frac13\cdot\frac{4}{4+9\omega^2}$`], 0)
      ] }
    ]
  });
})();
