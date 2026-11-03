// Kapitel 4: Systemeigenschaften, Blatt 3.
(function () {
  'use strict';
  const R = String.raw;
  const { p, h3, b, k, w, ex, i, err, f, tb, lab } = SSB;
  const Q = SSQ;
  const W = SSW;

  SS_MOD({
    id: 'm08', order: 8, exam: 3, weight: 8, glyph: 'T', title: 'Linearität und Zeitinvarianz', src: 'Kap. 4, S. 1 bis 5',
    goal: 'Du kannst für jedes System nachrechnen, ob es linear und ob es zeitinvariant ist. Beides zusammen ergibt ein LTI-System, und nur für LTI-Systeme funktioniert später die Faltung.',
    sections: [
      {
        id: 'm08s1', title: 'Linearität', practice: ['m08q1', 'g.linwalk'],
        blocks: [
          p(R`Ein System ist **linear**, wenn es egal ist, ob du Eingänge erst mischst und dann durchs System schickst, oder erst einzeln durchs System schickst und dann mischst.`),
          f(R`T\{\alpha x_1(t)+\beta x_2(t)\}=\alpha\,T\{x_1(t)\}+\beta\,T\{x_2(t)\}`, 'Superpositionsprinzip'),
          i('Ein guter Audioverstärker ist linear: Spielen zwei Instrumente gleichzeitig, kommt die Summe beider verstärkter Klänge heraus. Ein übersteuerter Verstärker ist es nicht: Es entstehen neue Töne, die vorher nicht da waren.'),
          ex(R`1. Schreibe $\tilde{x}=\alpha x_1+\beta x_2$. 2. Berechne $\tilde{y}=T\{\tilde{x}\}$, indem du $\tilde{x}$ überall für $x$ einsetzt. 3. Berechne $\alpha y_1+\beta y_2$ getrennt. 4. Vergleiche.`),
          k(R`**Schnelltest:** Ein lineares System antwortet auf $x=0$ mit $y=0$. Damit fällt zum Beispiel $y=x+3$ sofort durch.`),
          w(R`Eine zeitabhängige Funktion vor dem $x$ stört die Linearität **nicht**. $y=\sin(t)\cdot x(t)$ und $y=t\cdot x(t)$ sind linear. Nichtlinear wird es durch Potenzen, Produkte oder Funktionen **von** $x$, und durch Konstanten.`),
          tb(['System', 'Linear?', 'Warum'], [[R`$y=2x^2$`, 'nein', R`Das Quadrat erzeugt den Mischterm $4x_1x_2$`], [R`$y=ax+b$`, R`nur für $b=0$`, R`$T\{0\}=b$`], [R`$y=\cos(\omega t)\,x$`, 'ja', 'Der Kosinus ist nur ein Faktor']], 'Übungen aus dem Skript')
        ]
      },
      {
        id: 'm08s2', title: 'Zeitinvarianz', practice: ['m08q2', 'g.tiwalk'],
        blocks: [
          p(R`Ein System ist **zeitinvariant**, wenn es sich heute genauso verhält wie morgen. Verschiebst du den Eingang um $t_0$, verschiebt sich der Ausgang um genau $t_0$, sonst ändert sich nichts.`),
          f(R`T\{x(t-t_0)\}=y(t-t_0)`),
          ex(R`1. **Erster Weg:** Ersetze im System nur das $x(\ldots)$ durch den verschobenen Eingang. Was außerhalb von $x$ steht, bleibt. 2. **Zweiter Weg:** Nimm den fertigen Ausdruck für $y(t)$ und ersetze **jedes** $t$ durch $t-t_0$. 3. Vergleiche.`),
          p(R`Beispiel $y(t)=t\,x(t)$:`),
          f(R`T\{x(t-t_0)\}=t\,x(t-t_0)\qquad\ne\qquad y(t-t_0)=(t-t_0)\,x(t-t_0)`),
          k(R`**Faustregel:** Steht ein $t$ **außerhalb** des Arguments von $x$, zum Beispiel als Faktor, oder wird das Argument mit etwas anderem als $1$ multipliziert, wie bei $x(2t)$ und $x(-t)$, ist das System zeitvariant.`),
          lab('lti'),
          err(R`In Kapitel 4.7 steht beim Beispiel $y(k)=x(2k)$ "zeitinvariant". Das ist falsch: Der erste Weg liefert $x(2k-k_0)$, der zweite $x(2k-2k_0)$. Das System ist **zeitvariant**.`)
        ]
      },
      {
        id: 'm08s3', title: 'LTI-Systeme', practice: ['m08q3', 'm08q4'],
        blocks: [
          p(R`Ein System, das linear **und** zeitinvariant ist, heißt **LTI-System** (linear time invariant). Das ist die wichtigste Systemklasse, weil man damit alles vorhersagen kann: Kennt man die Antwort auf einen einzigen Impuls, kennt man die Antwort auf jedes Signal.`),
          p(R`Warum? Jedes Signal lässt sich aus vielen kleinen Impulsen zusammensetzen. Wegen der Zeitinvarianz reagiert das System auf jeden davon gleich, wegen der Linearität addieren sich die Antworten. Genau das macht die Faltung in Kapitel 5.`)
        ]
      }
    ],
    questions: [
      Q.tf('m08q1', 'Welche Systeme sind linear?', [
        [R`$y(t)=5x(t)$`, true, 'Reiner Verstärker.'],
        [R`$y(t)=x(t)+1$`, false, R`$T\{0\}=1\ne 0$.`],
        [R`$y(t)=x^2(t)$`, false, 'Mischterm beim Quadrieren.'],
        [R`$y(t)=t^2\,x(t)$`, true, R`$t^2$ ist nur ein zeitabhängiger Faktor, $x$ steht linear da.`]
      ], { ref: 'Kap. 4 S. 1' }),
      Q.tf('m08q2', 'Welche Systeme sind zeitinvariant?', [
        [R`$y(t)=x(t-3)$`, true, 'Ein $t$ steht nur im Argument, Vorfaktor $1$.'],
        [R`$y(t)=\cos(t)\,x(t)$`, false, 'Ein $t$ steht außerhalb.'],
        [R`$y(t)=x(3t)$`, false, 'Das Argument wird gestaucht.'],
        [R`$y(t)=x^2(t)+7$`, true, 'Nichtlinear, aber zeitinvariant. Die Eigenschaften sind unabhängig voneinander.']
      ], { ref: 'Kap. 4 S. 4' }),
      Q.mc('m08q3', 'Was bedeutet LTI?', ['linear und zeitinvariant', 'linear und stabil', 'zeitinvariant und kausal', 'kausal und stabil'], 0, 'Linear Time Invariant.', { ref: 'Kap. 4 S. 4' }),
      Q.tf('m08q4', 'Sind diese Systeme LTI?', [
        [R`$y(t)=x(t)-x(t-1)$`, true, 'Linear und zeitinvariant.'],
        [R`$y(t)=a\ln(x(t))$`, false, 'Nichtlinear.'],
        [R`$y(t)=\sin(t)\,x(t)$`, false, 'Linear, aber zeitvariant.']
      ], { ref: 'Blatt 3' })
    ],
    calcs: ['g.linwalk', 'g.tiwalk']
  });

  SS_MOD({
    id: 'm09', order: 9, exam: 3, weight: 6, glyph: 'B', title: 'Stabilität, Kausalität und Gedächtnis', src: 'Kap. 4, S. 6 bis 10',
    goal: 'Du prüfst BIBO-Stabilität und Kausalität und löst damit die komplette Aufgabenreihe von Blatt 3.',
    sections: [
      {
        id: 'm09s1', title: 'BIBO-Stabilität', practice: ['m09q1', 'g.bibo'],
        blocks: [
          p(R`**BIBO** heißt Bounded Input, Bounded Output. Ein System ist stabil, wenn jeder beschränkte Eingang einen beschränkten Ausgang liefert.`),
          f(R`|x(t)|\le M<\infty\;\Rightarrow\;|y(t)|\le N<\infty`),
          i('Eine Rückkopplung am Mikrofon, die sich immer weiter aufschaukelt, ist instabil: Ein leises Geräusch erzeugt einen immer lauteren Ton.'),
          ex(R`**Stabil zeigen:** Schätze $|y|$ mit $|x|\le M$ nach oben ab. Nützlich: $|\sin|\le 1$, $|\cos|\le 1$, $|a+b|\le|a|+|b|$. **Instabil zeigen:** Ein einziges beschränktes Gegenbeispiel reicht, meist $x=1$ oder $x=\sigma(t)$.`),
          tb(['System', 'BIBO-stabil?', 'Begründung'], [[R`$y=3x$`, 'ja', R`$|y|\le 3M$`], [R`$y=x(1-e^t)$`, 'nein', R`Mit $x=1$ wächst $|1-e^t|$ für $t\to\infty$ unbegrenzt`], [R`$y=\int x\,d\tau$`, 'nein', R`Aus $x=\sigma$ wird die Rampe`], [R`$y=\sin(t)x$`, 'ja', R`$|y|\le M$`]]),
          w('Das Integral ist der klassische Fall eines instabilen LTI-Systems. Es wirkt harmlos, aber schon der beschränkte Sprung erzeugt die unbeschränkte Rampe.')
        ]
      },
      {
        id: 'm09s2', title: 'Kausalität und Gedächtnis', practice: ['m09q2', 'm09q3'],
        blocks: [
          p(R`Ein System ist **kausal**, wenn der Ausgang nicht vor dem Eingang reagiert. Es darf aktuelle und vergangene Werte benutzen, aber keine zukünftigen.`),
          f(R`x(t)=0\;\text{für }t<t_0\;\Rightarrow\;y(t)=0\;\text{für }t<t_0`),
          b(R`$y(t)=x(t-1)$ ist kausal, es braucht die Vergangenheit.`, R`$y(t)=x(t+1)$ ist **akausal**, es braucht die Zukunft. Solche Systeme lassen sich nicht in Echtzeit bauen.`, R`$y(t)=x(2t)$ ist akausal, denn für $t=1$ braucht man $x(2)$.`),
          k(R`Bei LTI-Systemen gilt: kausal heißt, dass die Impulsantwort für $t<0$ null ist. Das System kann nicht antworten, bevor der Impuls kommt.`),
          h3('Statisch oder dynamisch'),
          b(R`**Statisch (gedächtnislos):** $y(t_0)$ hängt nur von $x(t_0)$ ab. Beschreibung durch algebraische Gleichungen, zum Beispiel beim Spannungsteiler.`, R`**Dynamisch (mit Gedächtnis):** $y$ hängt auch von früheren Werten ab. Beschreibung durch Differentialgleichungen, zum Beispiel beim RC-Glied.`),
          p(R`Systeme **mit Rückkopplung** führen den Ausgang wieder auf den Eingang zurück. **Diskrete Systeme** behandelt man genauso, nur mit $x(k)$ und $y(k)$ statt $x(t)$ und $y(t)$.`)
        ]
      },
      {
        id: 'm09s3', title: 'Die Aufgaben von Blatt 3', practice: ['m09q4', 'm09q5', 'm09q6', 'm09q7', 'm09q8', 'm09q9', 'g.sysprop'],
        blocks: [
          p('Auf Blatt 3 prüfst du immer dasselbe nach festem Muster. Gehe die vier Eigenschaften der Reihe nach durch und schreibe bei jeder einen kurzen Nachweis auf:'),
          tb(['Eigenschaft', 'Was du aufschreibst'], [['Linear', R`$T\{\alpha x_1+\beta x_2\}$ und $\alpha y_1+\beta y_2$ vergleichen`], ['Zeitinvariant', R`$T\{x(t-t_0)\}$ und $y(t-t_0)$ vergleichen`], ['BIBO-stabil', R`$|y|$ abschätzen oder ein Gegenbeispiel angeben`], ['Kausal', R`Kommen nur $x(t)$ und $x(t-\ldots)$ vor?`]])
        ]
      }
    ],
    questions: [
      Q.tf('m09q1', 'Sind diese Systeme BIBO-stabil?', [
        [R`$y(t)=e^{t}x(t)$`, false, R`Mit $x=1$ wächst $y$ unbegrenzt.`],
        [R`$y(t)=e^{-t^2}x(t)$`, true, R`$e^{-t^2}\le 1$, also $|y|\le M$.`],
        [R`$y(t)=\frac{dx}{dt}$`, false, R`Aus dem beschränkten Sprung wird ein Dirac-Impuls, und der ist nicht beschränkt.`]
      ], { ref: 'Kap. 4 S. 6' }),
      Q.tf('m09q2', 'Sind diese Systeme kausal?', [
        [R`$y(t)=x(t)+x(t-2)$`, true, 'Nur Gegenwart und Vergangenheit.'],
        [R`$y(t)=x(t+0{,}1)$`, false, 'Ein Zehntel Zukunft ist auch Zukunft.'],
        [R`$y(t)=t\,x(t)$`, true, 'Das Argument von $x$ ist $t$. Der Faktor ändert daran nichts.'],
        [R`$y(k)=x(k+1)$`, false, 'Beispiel aus dem Skript.']
      ], { ref: 'Kap. 4 S. 8' }),
      Q.mc('m09q3', 'Welches System ist dynamisch?', [R`RC-Glied: Die Spannung am Kondensator hängt von der Vorgeschichte ab`, 'Spannungsteiler aus zwei Widerständen', R`$y(t)=3x(t)$`, R`$y(t)=x^2(t)$`], 0, 'Ein Kondensator speichert, also hat das System Gedächtnis.', { ref: 'Kap. 4 S. 8' }),
      Q.walk('m09q4', R`**Aufgabe 3-1** $y(t)=2x(t)\sin(t)$. Untersuche auf Linearität, Stabilität und Zeitinvarianz.`, [
        W.mc(R`Was ist $T\{\alpha x_1+\beta x_2\}$?`, [R`$2(\alpha x_1+\beta x_2)\sin t=\alpha y_1+\beta y_2$`, R`$2(\alpha x_1+\beta x_2)^2\sin t$`, R`$2\alpha x_1\beta x_2\sin t$`], 0, '**Linear:** Durch Ausmultiplizieren entsteht genau $\\alpha y_1+\\beta y_2$.'),
        W.mc(R`Wie lässt sich $|y|$ für $|x|\le M$ abschätzen?`, [R`$|y|\le 2M$, also stabil`, R`$|y|$ wächst unbegrenzt, also instabil`, R`$|y|\le M$, also stabil`], 0, R`**Stabil:** $|\sin t|\le 1$, also $|y|\le 2\cdot M\cdot 1$.`),
        W.mc(R`Vergleiche $T\{x(t-t_0)\}$ und $y(t-t_0)$.`, [R`$2x(t-t_0)\sin t\ne 2x(t-t_0)\sin(t-t_0)$, also zeitvariant`, R`Beide sind $2x(t-t_0)\sin t$, also zeitinvariant`, R`Beide sind $2x(t-t_0)\sin(t-t_0)$, also zeitinvariant`], 0, '**Zeitvariant:** Der Sinus außerhalb des Arguments von $x$ verrät es.')
      ], { src: 'Blatt 3-1', ref: 'Blatt 3, Aufgabe 3-1' }),
      Q.walk('m09q5', R`**Aufgabe 3-2** $y(t)=e^{at}x(t)$ mit $a>0$.`, [
        W.fix('Linear?', ['Ja', 'Nein'], 0, R`$e^{at}(\alpha x_1+\beta x_2)=\alpha y_1+\beta y_2$.`),
        W.mc('Stabil?', [R`Nein: Mit $x=1$ wächst $e^{at}$ unbegrenzt`, R`Ja: $|y|\le M$`, R`Ja: $|y|\le e^{a}M$`], 0, 'Die Schranke hängt von $t$ ab und wird beliebig groß.'),
        W.mc('Zeitinvariant?', [R`Nein: $e^{at}x(t-t_0)\ne e^{a(t-t_0)}x(t-t_0)$`, R`Ja: Beide Ausdrücke sind gleich`], 0, 'Der Faktor ändert sich mit der Zeit.')
      ], { src: 'Blatt 3-2', ref: 'Blatt 3, Aufgabe 3-2' }),
      Q.walk('m09q6', R`**Aufgabe 3-3** Subtrahierer: $y(t)=x(t)-x(t-1)$.`, [
        W.fix('Linear?', ['Ja', 'Nein'], 0, R`$\alpha x_1(t)+\beta x_2(t)-\alpha x_1(t-1)-\beta x_2(t-1)=\alpha y_1+\beta y_2$.`),
        W.fix('Zeitinvariant?', ['Ja', 'Nein'], 0, R`Beide Wege liefern $x(t-t_0)-x(t-t_0-1)$.`),
        W.num(R`Für $|x|\le M$ gilt $|y|\le c\cdot M$. Wie groß ist $c$?`, 2, R`$|y|\le|x(t)|+|x(t-1)|\le 2M$. Also BIBO-stabil.`),
        W.fix('Kausal?', ['Ja', 'Nein'], 0, 'Nur Gegenwart und Vergangenheit kommen vor.')
      ], { src: 'Blatt 3-3', ref: 'Blatt 3, Aufgabe 3-3', pts: 4 }),
      Q.walk('m09q7', R`**Aufgabe 3-4** Logarithmierer: $y(t)=a\ln(x(t))$. Ist das ein LTI-System?`, [
        W.mc('Linear?', [R`Nein: $a\ln(\alpha x_1+\beta x_2)\ne\alpha a\ln x_1+\beta a\ln x_2$`, R`Ja: Der Logarithmus zerlegt Summen`], 0, R`Der Logarithmus zerlegt **Produkte**: $\ln(x_1x_2)=\ln x_1+\ln x_2$. Bei Summen gibt es keine solche Regel.`),
        W.fix('Also ist es', ['kein LTI-System', 'ein LTI-System'], 0, 'Es ist zwar zeitinvariant, aber schon die fehlende Linearität reicht.')
      ], { src: 'Blatt 3-4', ref: 'Blatt 3, Aufgabe 3-4', pts: 2 }),
      Q.walk('m09q8', R`**Aufgabe 3-5** $y(t)=2x(t-1)\cdot x(t-2)+x(t-2)$. Untersuche auf Linearität, Zeitinvarianz und Kausalität.`, [
        W.mc('Linear?', ['Nein: Das Produkt zweier Eingangswerte erzeugt Mischterme', 'Ja: Es kommen nur Verschiebungen vor'], 0, R`$2(\alpha x_1+\beta x_2)(t-1)\cdot(\alpha x_1+\beta x_2)(t-2)$ enthält zum Beispiel $\alpha^2$.`),
        W.fix('Zeitinvariant?', ['Ja', 'Nein'], 0, R`Beide Wege liefern $2x(t-t_0-1)x(t-t_0-2)+x(t-t_0-2)$.`),
        W.fix('Kausal?', ['Ja', 'Nein'], 0, 'Es kommen nur vergangene Werte vor.')
      ], { src: 'Blatt 3-5', ref: 'Blatt 3, Aufgabe 3-5' }),
      Q.tf('m09q9', R`Übung aus dem Skript: $y(t)=\cos(\omega_0\,x(t))$.`, [
        ['Das System ist linear.', false, 'Der Eingang steht im Kosinus.'],
        ['Das System ist zeitinvariant.', true, R`Beide Wege liefern $\cos(\omega_0x(t-t_0))$.`],
        ['Das System ist kausal.', true, 'Nur der aktuelle Wert zählt.'],
        ['Das System ist BIBO-stabil.', true, R`$|\cos|\le 1$ für jeden Eingang.`]
      ], { ref: 'Kap. 4 S. 10' })
    ],
    calcs: ['g.bibo', 'g.sysprop']
  });
})();
