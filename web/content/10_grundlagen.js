// Mathe-Werkzeugkasten und Kapitel 1 und 2.
(function () {
  'use strict';
  const R = String.raw;
  const { p, h3, b, k, w, ex, i, err, f, tb, plot, lab } = SSB;
  const Q = SSQ;
  const W = SSW;
  const { sig, ramp } = SSEngine.Sig;

  // ===========================================================================
  SS_MOD({
    id: 'm00', order: 0, exam: 0, weight: 4, glyph: 'j', title: 'Mathe-Werkzeugkasten', src: 'Anhang S. 1',
    goal: 'Alles, was du an Mathe brauchst, an einem Ort: Bogenmaß, Sinus, e-Funktion, Integrale, komplexe Zahlen. Wer das sicher kann, hat in den späteren Kapiteln nur noch halb so viel zu kämpfen.',
    sections: [
      {
        id: 'm00s1', title: 'Bogenmaß, Sinus und Kosinus', practice: ['m00q1', 'm00q2'],
        blocks: [
          p(R`In Signale und Systeme rechnen wir Winkel fast immer im **Bogenmaß**. Eine volle Umdrehung ist $2\pi$ statt $360°$, eine halbe also $\pi$. Stell deinen Taschenrechner deshalb auf **RAD**, das spart in der Klausur Punkte.`),
          tb(['Grad', '0°', '30°', '45°', '60°', '90°', '180°', '360°'], [['Bogenmaß', '$0$', R`$\frac{\pi}{6}$`, R`$\frac{\pi}{4}$`, R`$\frac{\pi}{3}$`, R`$\frac{\pi}{2}$`, R`$\pi$`, R`$2\pi$`], [R`$\cos$`, '$1$', R`$\frac{\sqrt3}{2}$`, R`$\frac{\sqrt2}{2}$`, R`$\frac12$`, '$0$', '$-1$', '$1$'], [R`$\sin$`, '$0$', R`$\frac12$`, R`$\frac{\sqrt2}{2}$`, R`$\frac{\sqrt3}{2}$`, '$1$', '$0$', '$0$']]),
          p('Fast jedes Signal in dieser Vorlesung ist aus einer einzigen Grundform gebaut:'),
          f(R`s(t)=A\cos(\omega t+\varphi)`),
          b(R`$A$ ist die **Amplitude**: wie hoch die Schwingung ausschlägt.`, R`$\omega$ ist die **Kreisfrequenz**: wie schnell sie läuft. Es gilt $\omega=2\pi f=\frac{2\pi}{T}$.`, R`$T$ ist die **Periode**: die Zeit für eine volle Schwingung.`, R`$\varphi$ ist die **Phase**: um wie viel sie verschoben startet.`),
          plot({ title: R`$\cos(t)$ und $2\cos(2t)$`, x: [-7, 7], y: [-2.4, 2.4], xl: 't', xt: [[-2 * Math.PI, '−2π'], [-Math.PI, '−π'], [Math.PI, 'π'], [2 * Math.PI, '2π']], yt: [-2, -1, 1, 2], curves: [{ f: Math.cos, c: 'p', label: R`$\cos(t)$, $T=2\pi$` }, { f: (t) => 2 * Math.cos(2 * t), c: 'w', label: R`$2\cos(2t)$, $T=\pi$` }] }),
          k(R`$\cos$ ist **gerade**: $\cos(-t)=\cos t$. $\sin$ ist **ungerade**: $\sin(-t)=-\sin t$. Der Mittelwert beider über eine Periode ist $0$, der von $\cos^2$ und $\sin^2$ ist $\frac12$.`)
        ]
      },
      {
        id: 'm00s2', title: 'Die e-Funktion', practice: ['m00q3', 'm00q4'],
        blocks: [
          p(R`Die e-Funktion beschreibt alles, was abklingt oder anwächst: Kondensatoren beim Entladen, gedämpfte Schwingungen, Impulsantworten. Für uns ist vor allem $e^{-at}$ mit $a>0$ wichtig.`),
          plot({ title: R`Je größer $a$, desto schneller ist das Signal weg`, x: [-0.5, 4], y: [-0.1, 1.2], xl: 't', yt: [1], curves: [{ f: (t) => (t >= 0 ? Math.exp(-t) : NaN), c: 'p', label: R`$e^{-t}$` }, { f: (t) => (t >= 0 ? Math.exp(-3 * t) : NaN), c: 'w', label: R`$e^{-3t}$` }] }),
          tb(['Regel', 'Beispiel'], [[R`$e^0=1$`, R`$e^{-5\cdot 0}=1$`], [R`$e^{a}e^{b}=e^{a+b}$`, R`$e^{-2t}e^{2\tau}=e^{-2(t-\tau)}$`], [R`$\frac{d}{dt}e^{at}=a\,e^{at}$`, R`$\frac{d}{dt}e^{-3t}=-3e^{-3t}$`], [R`$\int e^{at}dt=\frac{1}{a}e^{at}$`, R`$\int e^{-3t}dt=-\frac13e^{-3t}$`], [R`$\lim_{t\to\infty}e^{-at}=0$`, 'für $a>0$']]),
          k('Beim Ableiten kommt der Faktor vor dem $t$ nach vorn. Beim Integrieren teilt man durch ihn.')
        ]
      },
      {
        id: 'm00s3', title: 'Integrale und partielle Integration', practice: ['m00q5', 'm00q6'],
        blocks: [
          p(R`Ein Integral ist eine **Fläche unter einer Kurve**. Das ist der wichtigste Gedanke der Vorlesung: Energie, Faltung und Fourier-Koeffizienten sind alle nur Flächen.`),
          f(R`\int_a^b f(t)\,dt=F(b)-F(a)`, 'Stammfunktion an den Grenzen einsetzen'),
          p(R`Grenzen dürfen auch unendlich sein. Dann bildet man den Grenzwert. Bei einer abklingenden e-Funktion verschwindet die obere Grenze einfach:`),
          f(R`\int_0^{\infty}e^{-2t}dt=\left[-\tfrac12e^{-2t}\right]_0^{\infty}=0-\left(-\tfrac12\right)=\tfrac12`),
          h3('Partielle Integration'),
          p(R`Steht ein Produkt wie $t\cdot e^{-j\omega t}$ im Integral, hilft die Umkehrung der Produktregel:`),
          f(R`\int u\,v'\,dt=u\,v-\int u'\,v\,dt`),
          ex(R`Wähle $u$ so, dass es beim Ableiten einfacher wird (also $u=t$), und $v'$ so, dass es sich leicht integrieren lässt (also die e-Funktion oder der Sinus). Bei $t^3$ wie in Aufgabe 6-2 wendest du die Regel dreimal hintereinander an.`),
          k(R`**Symmetrie spart Arbeit:** Das Integral einer ungeraden Funktion über $[-a,a]$ ist immer $0$. Bei einer geraden Funktion reicht $2\int_0^a$.`)
        ]
      },
      {
        id: 'm00s4', title: 'Komplexe Zahlen und Euler', practice: ['m00q7', 'm00q8', 'm00q9'],
        blocks: [
          p(R`Für die Fourier-Rechnung brauchst du komplexe Zahlen. In der Elektrotechnik heißt die imaginäre Einheit $j$, weil $i$ schon der Strom ist. Sie ist einfach eine Zahl mit $j^2=-1$.`),
          p(R`Eine komplexe Zahl $z=a+jb$ kannst du dir als **Pfeil in einer Ebene** vorstellen: $a$ nach rechts, $b$ nach oben. Jeder Pfeil hat eine Länge und einen Winkel.`),
          f(R`|z|=\sqrt{a^2+b^2},\qquad\varphi=\arctan\frac{b}{a}\;\;(\text{für }a>0)`),
          w(R`Für $a<0$ zeigt der Pfeil nach links. Dann liefert $\arctan$ allein den falschen Winkel, und du musst $\pi$ addieren oder abziehen. Beispiel: $z=-1+j$ hat den Winkel $\frac{3\pi}{4}$, aber $\arctan(-1)=-\frac{\pi}{4}$.`),
          tb(['Regel', 'Bedeutung'], [[R`$\frac{1}{j}=-j$`, 'Kommt ständig vor. Merken!'], [R`$z^*=a-jb$`, 'Konjugiert: Vorzeichen des Imaginärteils drehen'], [R`$|z_1z_2|=|z_1||z_2|$`, 'Beträge multiplizieren sich'], [R`$\left|\frac{1}{a+jb}\right|=\frac{1}{\sqrt{a^2+b^2}}$`, 'Betrag oben durch Betrag unten'], [R`$\angle\frac{1}{a+jb}=-\arctan\frac{b}{a}$`, 'Winkel oben minus Winkel unten']]),
          h3('Die Euler-Formel'),
          p(R`Die wichtigste Formel der ganzen Vorlesung verbindet die e-Funktion mit Sinus und Kosinus:`),
          f(R`e^{j\alpha}=\cos\alpha+j\sin\alpha`),
          p(R`Anschaulich ist $e^{j\alpha}$ ein Pfeil der Länge $1$ mit dem Winkel $\alpha$. Wächst $\alpha$ mit der Zeit, dreht er sich. Daraus folgen die beiden Umkehrungen, die du für Fourier ständig brauchst:`),
          f(R`\cos\alpha=\frac{e^{j\alpha}+e^{-j\alpha}}{2},\qquad\sin\alpha=\frac{e^{j\alpha}-e^{-j\alpha}}{2j}`),
          k(R`Merke dir für ganze $k$: $e^{j2\pi k}=1$ und $e^{j\pi k}=(-1)^k$. Das vereinfacht fast jedes Fourier-Ergebnis.`)
        ]
      },
      {
        id: 'm00s5', title: 'Summen und größter gemeinsamer Teiler', practice: ['m00q10'],
        blocks: [
          p(R`Zwei kleine Werkzeuge kommen später vor. Die **geometrische Reihe** brauchst du für die Faltungssumme:`),
          f(R`\sum_{l=0}^{k}q^l=\frac{1-q^{k+1}}{1-q}\qquad(q\ne 1)`),
          p(R`Den **größten gemeinsamen Teiler** (ggT) brauchst du für die Grundfrequenz einer Fourier-Reihe. Er ist die größte Zahl, die beide Zahlen ohne Rest teilt: $\mathrm{ggT}(4,6)=2$.`)
        ]
      }
    ],
    questions: [
      Q.num('m00q1', R`Eine Schwingung hat die Periode $T=0{,}5$ s. Wie groß ist ihre Kreisfrequenz $\omega$ in $1/\text{s}$?`, 12.566, null, { tol: 0.02, steps: [R`$\omega=\frac{2\pi}{T}=\frac{2\pi}{0{,}5}=4\pi\approx 12{,}566$.`], ref: 'Kap. 2 S. 7' }),
      Q.mc('m00q2', R`Was ist $\cos(\pi)$?`, ['$-1$', '$0$', '$1$', R`$\pi$`], 0, R`Bei einer halben Umdrehung zeigt der Pfeil nach links, der Kosinus ist dort $-1$.`, { keep: true, ref: 'Anhang S. 1' }),
      Q.mc('m00q3', R`Was ist die Ableitung von $e^{-4t}$?`, [R`$-4e^{-4t}$`, R`$4e^{-4t}$`, R`$e^{-4t}$`, R`$-\frac14e^{-4t}$`], 0, 'Der Faktor vor dem $t$ kommt beim Ableiten nach vorn.', { ref: 'Anhang S. 1' }),
      Q.num('m00q4', R`Vereinfache $e^{-2t}e^{2t}$ zu einer Zahl.`, 1, R`$e^{-2t+2t}=e^0=1$.`, { ref: 'Anhang S. 1' }),
      Q.num('m00q5', R`Berechne $\int_0^{\infty}e^{-4t}dt$.`, 0.25, null, { tol: 0.001, steps: [R`Stammfunktion: $-\frac14e^{-4t}$.`, R`Bei $t\to\infty$ ist sie $0$, bei $t=0$ ist sie $-\frac14$.`, R`$0-(-\frac14)=\frac14$.`], ref: 'Kap. 2 S. 9' }),
      Q.tf('m00q6', 'Stimmen die Aussagen?', [
        [R`$\int_{-3}^{3}t^3\,dt=0$`, true, R`$t^3$ ist ungerade, die Flächen links und rechts heben sich auf.`],
        [R`$\int_{-\pi}^{\pi}\sin(t)\,dt=0$`, true, 'Der Sinus ist ungerade.'],
        [R`$\int_{-1}^{1}t^2\,dt=0$`, false, R`$t^2$ ist gerade. Das Integral ist $2\int_0^1t^2dt=\frac23$.`]
      ], { ref: 'Anhang S. 1' }),
      Q.num('m00q7', R`Wie groß ist der Betrag von $z=3+4j$?`, 5, null, { steps: [R`$|z|=\sqrt{3^2+4^2}=\sqrt{25}=5$.`], ref: 'Anhang S. 1' }),
      Q.mc('m00q8', R`Was ist $\frac{1}{2j}$?`, [R`$-\frac{j}{2}$`, R`$\frac{j}{2}$`, R`$\frac{1}{2}$`, R`$-2j$`], 0, R`Mit $j$ erweitern: $\frac{1\cdot j}{2j\cdot j}=\frac{j}{-2}=-\frac{j}{2}$.`, { ref: 'Anhang S. 1' }),
      Q.mc('m00q9', R`Was ist $e^{j\pi}$?`, ['$-1$', '$1$', '$j$', '$-j$'], 0, R`$\cos\pi+j\sin\pi=-1+0=-1$.`, { keep: true, ref: 'Anhang S. 1' }),
      Q.num('m00q10', R`Wie groß ist $\sum_{l=0}^{3}\left(\frac12\right)^l$?`, 1.875, null, { tol: 0.001, steps: [R`Formel: $\frac{1-(1/2)^4}{1-1/2}=\frac{15/16}{1/2}=\frac{15}{8}=1{,}875$.`, R`Probe: $1+\frac12+\frac14+\frac18=1{,}875$.`], ref: 'Kap. 5 S. 9' })
    ],
    calcs: []
  });

  // ===========================================================================
  SS_MOD({
    id: 'm01', order: 1, exam: 1, weight: 3, glyph: '⇄', title: 'Was sind Signale und Systeme?', src: 'Kap. 1, S. 1 bis 4',
    goal: 'Du kannst erklären, was ein System und was ein Signal ist. Dazu kennst du die drei Systemarten und den Unterschied zwischen Augenblickswert und Signalparameter.',
    sections: [
      {
        id: 'm01s1', title: 'System: die Blackbox', practice: ['m01q1', 'm01q2'],
        blocks: [
          p(R`Ein **System** überträgt, speichert oder verarbeitet Signale. Es ist eine Einheit mit einem Zweck, durch die **Systemgrenze** von der Umgebung getrennt. Beispiele aus dem Skript sind Mobilfunk und ein Tiefpass.`),
          i('Stell dir einen Verstärker vor: Vorn geht ein leises Audiosignal hinein, hinten kommt es laut heraus. Wie die Schaltung innen aussieht, ist für die Berechnung erst einmal egal. Darum heißt das Modell **Blackbox**.'),
          f(R`x(t)\;\longrightarrow\;\boxed{\;T\;}\;\longrightarrow\;y(t)=T\{x(t)\}`, 'x ist der Eingang, y der Ausgang, T beschreibt das System'),
          b('**Input (Eingangssignale)** wirken aus der Umgebung auf das System: Steuersignale, manchmal auch Störsignale.', '**Output (Ausgangssignale)** wirken vom System auf die Umgebung, meist sind es Messsignale.'),
          tb(['Systemart', 'Austausch mit der Umgebung', 'Bemerkung'], [['offen', 'Energie und Materie', 'keine exakte Berechnung möglich'], ['geschlossen', 'nur Energie', 'keine Materie'], ['abgeschlossen', 'nichts', 'Idealvorstellung']])
        ]
      },
      {
        id: 'm01s2', title: 'Signal und Signalparameter', practice: ['m01q3'],
        blocks: [
          p(R`Ein **Signal** ordnet einer Information eine messbare physikalische Größe zu, zum Beispiel eine Spannung. Mathematisch ist es eine Funktion, meist der Zeit: $s(t)$. Schallwellen, elektromagnetische Wellen oder ein Aktienkurs sind Signale.`),
          p(R`Signale können auch mehrdimensional sein. Die Helligkeit auf einem Bildschirm ist $s(x,y)$. Bei uns reicht fast immer eine Dimension.`),
          b(R`Der **Augenblickswert** ist der Wert zu einem bestimmten Zeitpunkt: $s(t_0)$.`, R`Der **Signalparameter** ist die Kenngröße, die die eigentliche Nachricht trägt. Das ist oft **nicht** der Augenblickswert.`),
          i(R`Die Nachricht 0110100 lässt sich als Spannung, Amplitude, Frequenz oder Phasenlage senden. Bei der Frequenzumtastung ist der Augenblickswert ständig ein anderer, die Information steckt aber nur in der Frequenz.`, 'Beispiel aus dem Skript')
        ]
      },
      {
        id: 'm01s3', title: 'Wozu Signalverarbeitung?', practice: ['m01q4'],
        blocks: [
          p('Signalverarbeitung hat zwei Hauptziele: **Störungen unterdrücken** und Signale so **umwandeln**, dass man sie speichern oder übertragen kann.'),
          b('**Analog:** mit Schaltungen aus Verstärkern, Widerständen und Kondensatoren.', '**Digital:** mit einem Digitalrechner.')
        ]
      }
    ],
    questions: [
      Q.match('m01q1', 'Ordne die Systemart zu.', [['Tauscht Energie und Materie mit der Umgebung', 'offen'], ['Tauscht nur Energie', 'geschlossen'], ['Tauscht gar nichts, reine Idealvorstellung', 'abgeschlossen']], { ref: 'Kap. 1 S. 2' }),
      Q.mc('m01q2', 'Was bedeutet Blackbox?', ['Man betrachtet nur, wie der Ausgang vom Eingang abhängt, nicht das Innere.', 'Das System ist unbekannt und lässt sich nicht berechnen.', 'Das System tauscht nichts mit der Umgebung aus.', 'Das System hat keinen Ausgang.'], 0, 'Für die Rechnung zählt allein die Abbildung $x\\mapsto y$.', { ref: 'Kap. 1 S. 1' }),
      Q.mc('m01q3', 'Ein Sender überträgt Bits, indem er die Frequenz umschaltet. Was ist der Signalparameter?', ['Die Frequenz', 'Der Augenblickswert der Spannung', 'Die Periode des Bitmusters', 'Die Systemgrenze'], 0, 'Der Signalparameter trägt die Nachricht. Der Augenblickswert ändert sich dauernd, ohne dass sich an der Nachricht etwas ändert.', { ref: 'Kap. 1 S. 3' }),
      Q.ms('m01q4', 'Wozu dient Signalverarbeitung laut Skript?', ['Störungen unterdrücken', 'Signale für Speicherung umwandeln', 'Signale für Übertragung umwandeln', 'Die Systemgrenze aufheben'], [0, 1, 2], 'Die letzte Antwort ergibt keinen Sinn: Die Systemgrenze ist Teil des Modells.', { ref: 'Kap. 1 S. 3' })
    ],
    calcs: []
  });

  // ===========================================================================
  SS_MOD({
    id: 'm02', order: 2, exam: 1, weight: 4, glyph: 's', title: 'Signale einteilen', src: 'Kap. 2, S. 5 bis 7',
    goal: 'Du kannst ein Signal als zeit- und wertkontinuierlich oder diskret einordnen, seine Periode bestimmen und deterministische von stochastischen Signalen unterscheiden.',
    sections: [
      {
        id: 'm02s1', title: 'Kontinuierlich oder diskret', practice: ['m02q1', 'm02q2'],
        blocks: [
          p('Zwei Fragen ordnen jedes Signal ein: Ist die **Zeit** durchgehend oder nur an einzelnen Stellen definiert? Kann der **Wert** alles annehmen oder nur bestimmte Stufen?'),
          tb(['', 'wertkontinuierlich', 'wertdiskret'], [['**zeitkontinuierlich**', 'Analoges Signal: Spannung am Mikrofon', 'Treppensignal: Ausgang eines DA-Wandlers'], ['**zeitdiskret**', 'Abgetastetes Signal ohne Rundung', 'Digitales Signal: Werte aus einer Audiodatei']]),
          plot({ title: 'Zeitkontinuierlich', x: [-0.3, 6.5], y: [-1.3, 1.3], xl: 't', yt: [-1, 1], curves: [{ f: (t) => Math.sin(1.3 * t), c: 'p' }], h: 130 }),
          plot({ title: R`Zeitdiskret: nur an den Stellen $k$ definiert`, x: [-0.5, 6.5], y: [-1.3, 1.3], xl: 'k', yt: [-1, 1], xt: [1, 2, 3, 4, 5, 6], stems: [{ k: [0, 1, 2, 3, 4, 5, 6], v: [0, 1, 2, 3, 4, 5, 6].map((n) => Math.sin(1.3 * n)), c: 'p' }], h: 130 }),
          k(R`Zeitdiskrete Signale schreibt man $s(k)$ oder $s[n]$. Zwischen den Punkten sind sie nicht null, sondern **gar nicht definiert**.`)
        ]
      },
      {
        id: 'm02s2', title: 'Periodisch oder aperiodisch', practice: ['m02q3', 'm02q4'],
        blocks: [
          p(R`Ein Signal ist **periodisch**, wenn es sich nach einer festen Zeit $T$ exakt wiederholt. $T$ ist die kleinste solche Zeit.`),
          f(R`s(t+kT)=s(t)\quad\text{für alle ganzen }k`),
          f(R`f=\frac{1}{T},\qquad\omega=2\pi f=\frac{2\pi}{T}`, 'Grundfrequenz und Grundkreisfrequenz'),
          plot({ title: R`Aperiodisch: gedämpfte Schwingung $e^{-\delta t}\sin(\omega_0t)$`, x: [-0.3, 9], y: [-1.1, 1.1], xl: 't', yt: [-1, 1], curves: [{ f: (t) => (t >= 0 ? Math.exp(-0.3 * t) * Math.sin(4 * t) : NaN), c: 'p' }, { f: (t) => (t >= 0 ? Math.exp(-0.3 * t) : NaN), c: 'm', d: '4 3', w: 1.2 }], h: 140 }),
          p(R`Sie sieht zwar nach Schwingung aus, aber jede Welle ist kleiner als die vorige. Exakte Wiederholung gibt es nicht, also ist das Signal aperiodisch.`)
        ]
      },
      {
        id: 'm02s3', title: 'Deterministisch, stochastisch, Nutz und Stör', practice: ['m02q5'],
        blocks: [
          b('**Deterministisch:** Eine Formel legt jeden Wert fest, zum Beispiel $\\cos(\\omega t)$.', '**Stochastisch:** Der Wert hängt vom Zufall ab und lässt sich nur statistisch beschreiben, etwa durch Mittelwert und Varianz. Beispiel: Rauschen.'),
          b('**Nutzsignal:** Das Signal, das die Information trägt.', '**Störsignal:** Alles, was sich ungewollt überlagert.'),
          p('Außerdem unterscheidet das Skript elektrische und nichtelektrische Signale. Fast alle Verarbeitung ist heute elektrisch, nichtelektrische Größen wandelt man zuerst mit Sensoren um.')
        ]
      }
    ],
    questions: [
      Q.match('m02q1', 'Ordne das Beispiel der Art zu.', [['Spannung am Mikrofon', 'zeit- und wertkontinuierlich'], ['Lautstärkewerte einer Audiodatei', 'zeit- und wertdiskret'], ['Ausgang eines DA-Wandlers (Stufen)', 'zeitkontinuierlich, wertdiskret'], ['Abtastwerte ohne Rundung', 'zeitdiskret, wertkontinuierlich']], { ref: 'Kap. 2 S. 5' }),
      Q.tf('m02q2', 'Stimmen die Aussagen?', [
        [R`Ein zeitdiskretes Signal ist zwischen den Abtastpunkten null.`, false, 'Es ist dort gar nicht definiert.'],
        ['Ein wertdiskretes Signal kann nur bestimmte Stufen annehmen.', true, 'Genau das bedeutet wertdiskret.']
      ], { ref: 'Kap. 2 S. 6' }),
      Q.num('m02q3', R`$s(t)=3\sin(100\pi t)$. Wie groß ist die Frequenz $f$ in Hz?`, 50, null, { steps: [R`Aus der Formel: $\omega=100\pi$.`, R`$f=\frac{\omega}{2\pi}=50$ Hz.`], ref: 'Kap. 2 S. 7' }),
      Q.mc('m02q4', 'Welches Signal ist periodisch?', [R`$\sin(2t)+\cos(3t)$`, R`$e^{-t}\sin(2t)$`, R`$\sigma(t)$`, R`$t\cos(t)$`], 0, R`Beide Summanden passen in die gemeinsame Periode $2\pi$. Die anderen wiederholen sich nie exakt.`, { ref: 'Kap. 2 S. 7' }),
      Q.mc('m02q5', 'Thermisches Rauschen in einem Widerstand ist', ['stochastisch', 'deterministisch', 'periodisch', 'wertdiskret'], 0, 'Seinen Verlauf kann keine Formel vorhersagen, nur Mittelwert und Varianz lassen sich angeben.', { ref: 'Kap. 2 S. 7' })
    ],
    calcs: []
  });

  // ===========================================================================
  SS_MOD({
    id: 'm03', order: 3, exam: 1, weight: 6, glyph: 'E', title: 'Energie und Leistung', src: 'Kap. 2, S. 8 bis 10',
    goal: 'Du kannst Signalleistung, Energie und mittlere Leistung berechnen und ein Signal als Energiesignal, Leistungssignal oder keines von beiden einordnen. Das ist Aufgabe 1-2 und 1-3.',
    sections: [
      {
        id: 'm03s1', title: 'Die drei Größen', practice: ['m03q1'],
        blocks: [
          p(R`Woher kommen die Formeln? Fließt ein Strom $i$ durch einen Widerstand $R$, ist die Leistung $P=i^2R$. Um unabhängig vom Widerstand zu rechnen, setzt man $R=1$. Die Leistung ist dann einfach das **Quadrat des Signals**.`),
          f(R`P_s(t)=s^2(t)`, 'Signalleistung: Wert zu jedem Zeitpunkt'),
          f(R`E_s=\int_{-\infty}^{\infty}s^2(t)\,dt`, 'Normierte Energie: die gesamte Fläche unter s²'),
          f(R`P_\varnothing=\lim_{T_B\to\infty}\frac{1}{T_B}\int_{-T_B/2}^{T_B/2}s^2(t)\,dt`, 'Mittlere Leistung: Fläche pro Zeit im unendlichen Fenster'),
          k(R`$E_s$ ist eine einzige Zahl. Die mittlere Leistung ist es auch. Nur $P_s(t)$ ist eine Funktion der Zeit.`),
          w(R`Vergiss das Quadrat nicht. Für $s(t)=3$ ist die Leistung $9$, nicht $3$. Auch negative Signalwerte liefern positive Leistung.`)
        ]
      },
      {
        id: 'm03s2', title: 'Energiesignal oder Leistungssignal', practice: ['m03q2', 'm03q3'],
        blocks: [
          p('Es gibt genau drei Fälle:'),
          tb(['Fall', 'Energie', 'mittlere Leistung', 'Typisches Beispiel'], [['**Energiesignal**', R`$0<E<\infty$`, R`$P_\varnothing=0$`, 'kurzer Impuls, Abklingen'], ['**Leistungssignal**', R`$E\to\infty$`, R`$0<P_\varnothing<\infty$`, 'Kosinus, Sprung'], ['**keines von beiden**', R`$E\to\infty$`, R`$P_\varnothing\to\infty$`, 'Rampe']]),
          i('Eine Batterie für einen kurzen Blitz: begrenzte Energie, im Dauermittel keine Leistung. Eine Steckdose: im Lauf der Zeit unendlich viel Energie, aber feste Leistung. Eine immer weiter steigende Spannung: Beides läuft weg.'),
          lab('energy'),
          ex(R`1. Quadriere das Signal. 2. Berechne $E=\int s^2\,dt$. Kommt etwas Endliches heraus, ist es ein Energiesignal und du bist fertig. 3. Sonst berechne $P_\varnothing$. Ist es endlich, ist es ein Leistungssignal. 4. Sonst keines von beiden.`)
        ]
      },
      {
        id: 'm03s3', title: 'Beispiele aus Skript und Übung', practice: ['m03q4', 'm03q5', 'm03q6', 'm03q7', 'g.energy'],
        blocks: [
          p(R`Skript: Ein Rechteck mit Höhe $A$ auf $[-T,T]$ hat die Energie`),
          f(R`E=\int_{-T}^{T}A^2\,dt=2A^2T`),
          plot({ title: R`Rechtecksignal mit $A=2$, $T=1$`, x: [-3, 3], y: [-0.4, 2.6], xl: 't', yt: [2], curves: [{ f: (t) => 2 * (sig(t + 1) - sig(t - 1)), c: 'p' }], h: 130 }),
          p(R`Beim Kosinus hilft die Umformung $\cos^2(\omega t)=\frac12(1+\cos(2\omega t))$. Der hintere Teil mittelt sich weg, also bleibt $P_\varnothing=\frac12$.`),
          k(R`Bei Signalen mit Sprungfunktion fallen alle $t<0$ weg. Vom Fenster $[-T_B/2,T_B/2]$ zählt dann nur die rechte Hälfte, und genau daher kommt das $\frac12$ bei $\sigma(t)$.`)
        ]
      }
    ],
    questions: [
      Q.num('m03q1', R`$s(t)=-4$ für alle $t$. Wie groß ist die Signalleistung $P_s(t)$?`, 16, null, { steps: [R`$P_s(t)=s^2(t)=(-4)^2=16$.`], ref: 'Kap. 2 S. 8' }),
      Q.mc('m03q2', R`Ein Signal hat $E_s\to\infty$ und $P_\varnothing=3$. Was ist es?`, ['Leistungssignal', 'Energiesignal', 'Keines von beiden'], 0, 'Die Fläche pro Zeit bleibt endlich, die gesamte Fläche nicht.', { keep: true, ref: 'Kap. 2 S. 8' }),
      Q.tf('m03q3', 'Stimmen die Aussagen?', [
        ['Ein Energiesignal hat die mittlere Leistung $0$.', true, 'Eine endliche Fläche, geteilt durch ein unendlich großes Fenster, ergibt $0$.'],
        ['Ein Leistungssignal hat endliche Energie.', false, 'Die Energie wächst unbegrenzt.'],
        ['Jedes Signal ist entweder Energie- oder Leistungssignal.', false, 'Die Rampe ist weder das eine noch das andere.']
      ], { ref: 'Kap. 2 S. 8' }),
      Q.walk('m03q4', R`**Aufgabe 1-2 a)** Untersuche die Sprungfunktion $\sigma(t)$.`, [
        W.num(R`Wie groß ist $s^2(t)$ für $t>0$?`, 1, R`Für $t>0$ ist $\sigma(t)=1$, also auch $\sigma^2(t)=1$. Für $t<0$ ist es $0$.`),
        W.fix(R`Was ergibt $E=\int_0^{\infty}1\,dt$?`, ['Das wächst gegen unendlich', R`$1$`, R`$\frac12$`], 0, 'Eine konstante Höhe über unendlich lange Zeit ergibt unendliche Fläche. Kein Energiesignal.'),
        W.num(R`Wie groß ist $P_\varnothing=\lim\frac{1}{T_B}\int_0^{T_B/2}1\,dt$?`, 0.5, R`Das Integral ist $\frac{T_B}{2}$. Geteilt durch $T_B$ bleibt $\frac12$.`),
        W.fix('Also ist $\\sigma(t)$ ein', ['Leistungssignal', 'Energiesignal', 'keines von beiden'], 0, R`Lösung des Blatts: Leistungssignal mit $P_\varnothing=\frac12$.`)
      ], { src: 'Blatt 1-2', ref: 'Blatt 1, Aufgabe 1-2' }),
      Q.walk('m03q5', R`**Aufgabe 1-2 b)** Untersuche die Rampenfunktion $\varrho(t)$.`, [
        W.mc(R`Wie lautet $s^2(t)$ für $t\ge 0$?`, [R`$t^2$`, R`$t$`, R`$2t$`], 0, R`Für $t\ge 0$ gilt $\varrho(t)=t$, also $\varrho^2(t)=t^2$.`),
        W.fix(R`Wie verhält sich $E=\int_0^{\infty}t^2\,dt$?`, ['Es wächst gegen unendlich', 'Es ist endlich'], 0, 'Das Integrand wächst sogar noch, also ist die Fläche unendlich.'),
        W.mc(R`Wie verhält sich $P_\varnothing=\lim\frac{1}{T_B}\cdot\frac{(T_B/2)^3}{3}$?`, [R`Es wächst wie $T_B^2$, also gegen unendlich`, R`Es wird $\frac12$`, 'Es wird $0$'], 0, 'Die dritte Potenz oben gewinnt gegen die erste unten.'),
        W.fix('Also ist die Rampe', ['nicht klassifizierbar', 'ein Energiesignal', 'ein Leistungssignal'], 0, 'Lösung des Blatts: Die Rampe ist weder Energie- noch Leistungssignal.')
      ], { src: 'Blatt 1-2', ref: 'Blatt 1, Aufgabe 1-2' }),
      Q.walk('m03q6', R`**Aufgabe 1-3** Gegeben ist $s(t)=\cos(\omega t)$. Berechne $P_s(t)$, $E_s$ und $P_\varnothing$ und klassifiziere.`, [
        W.mc(R`a) Wie lautet die Signalleistung $P_s(t)$?`, [R`$\cos^2(\omega t)$`, R`$\cos(\omega t)$`, R`$\frac12$`], 0, 'Die Leistung ist das Quadrat des Signals. Sie ändert sich mit der Zeit.'),
        W.fix(R`b) Wie groß ist die Energie $E_s=\int_{-\infty}^{\infty}\cos^2(\omega t)\,dt$?`, ['Unendlich', R`$\frac12$`, '$0$'], 0, R`Mit $\cos^2\alpha=\frac12(1+\cos 2\alpha)$ steckt der konstante Anteil $\frac12$ im Integranden, über unendlich lange Zeit also unendliche Fläche.`),
        W.num(R`c) Wie groß ist $P_\varnothing$?`, 0.5, R`$\frac{1}{T_B}\int\frac12(1+\cos 2\omega t)dt=\frac12+\frac{1}{T_B}\cdot\text{beschränkt}\to\frac12$.`),
        W.fix('ii) Also ist $s(t)$ ein', ['Leistungssignal', 'Energiesignal', 'keines von beiden'], 0, 'Endliche mittlere Leistung bei unendlicher Energie.')
      ], { src: 'Blatt 1-3', ref: 'Blatt 1, Aufgabe 1-3' }),
      Q.mc('m03q7', R`Übung aus dem Skript: $s(t)=\sin(t)$ ist ein`, ['Leistungssignal mit $P_\\varnothing=\\frac12$', 'Energiesignal mit $E=\\frac12$', 'Leistungssignal mit $P_\\varnothing=1$', 'keines von beiden'], 0, R`Wie beim Kosinus: Der Mittelwert von $\sin^2$ ist $\frac12$, und die Energie wächst unbegrenzt.`, { ref: 'Kap. 2 S. 10' })
    ],
    calcs: ['g.energy']
  });

  // ===========================================================================
  SS_MOD({
    id: 'm04', order: 4, exam: 1, weight: 6, glyph: '↔', title: 'Signale umformen', src: 'Kap. 2, S. 11 bis 13',
    goal: 'Du kannst Signale verschieben, stauchen und spiegeln, Sinussignale addieren und jedes Signal in geraden und ungeraden Anteil zerlegen. Das ist Aufgabe 1-1 und 1-4.',
    sections: [
      {
        id: 'm04s1', title: 'Operationen auf dem Signalwert', practice: ['m04q1'],
        blocks: [
          p('Die einfachen Operationen verändern die Werte, die Zeitachse bleibt gleich:'),
          tb(['Operation', 'Formel', 'Wirkung'], [['Skalierung', R`$a\cdot s(t)$`, 'Höher oder flacher, bei $a<0$ umgeklappt'], ['Addition', R`$s_1(t)+s_2(t)$`, 'An jedem $t$ die Werte addieren'], ['Multiplikation', R`$s_1(t)\cdot s_2(t)$`, 'An jedem $t$ die Werte multiplizieren'], ['Differentiation', R`$\frac{ds}{dt}$`, 'Steigung als neues Signal'], ['Integration', R`$\int_{-\infty}^{t}s(\tau)d\tau$`, 'Bisher angesammelte Fläche als neues Signal']]),
          i(R`Mal $\sigma(t)$ zu rechnen wirkt wie ein Schalter: Links von $0$ wird alles null, rechts bleibt das Signal unverändert. Solche Einschaltfunktionen kommen in jeder Faltung vor.`, 'Multiplikation mit einer Einschaltfunktion')
        ]
      },
      {
        id: 'm04s2', title: 'Operationen auf der Zeitachse', practice: ['m04q2', 'm04q3'],
        blocks: [
          p('Hier wird das Argument verändert. Das fühlt sich am Anfang verkehrt herum an:'),
          tb(['Formel', 'Name', 'Was passiert'], [[R`$s(t-t_0)$`, 'Verschiebung', 'Nach **rechts** um $t_0$, wenn $t_0>0$ (Verzögerung)'], [R`$s(t+t_0)$`, 'Verschiebung', 'Nach **links** um $t_0$'], [R`$s(at)$, $a>1$`, 'Stauchung', 'Schmaler, läuft schneller ab'], [R`$s(at)$, $0<a<1$`, 'Dehnung', 'Breiter, läuft langsamer ab'], [R`$s(-t)$`, 'Reflexion', 'An der $y$-Achse gespiegelt']]),
          i(R`Bei $s(t-2)$ fragst du: Wann sieht das Signal den Wert, den es sonst bei $0$ hat? Wenn $t-2=0$, also bei $t=2$. Alles passiert 2 Sekunden **später**, das Bild rückt also nach rechts.`, 'Warum rechts?'),
          lab('ops'),
          w(R`Bei $s(2t-4)$ ist die Verschiebung **nicht** $4$. Klammere aus: $s(2(t-2))$. Erst stauchen, dann um $2$ verschieben.`),
          err(R`Im Skript steht bei der Reflexion "an der $t$-Achse". Gemeint ist die **$y$-Achse**: $s(-t)$ tauscht links und rechts, die Höhe bleibt.`)
        ]
      },
      {
        id: 'm04s3', title: 'Gerader und ungerader Anteil', practice: ['m04q4', 'm04q5', 'm04q6', 'm04q7', 'g.evenodd', 'g.evenoddval'],
        blocks: [
          p(R`Ein Signal ist **gerade**, wenn es spiegelbildlich zur $y$-Achse liegt: $s(t)=s(-t)$. Es ist **ungerade**, wenn es punktsymmetrisch zum Ursprung liegt: $s(t)=-s(-t)$.`),
          tb(['gerade', 'ungerade', 'weder noch'], [[R`$\cos t$, $t^2$, $|t|$, Konstanten`, R`$\sin t$, $t$, $t^3$, $\mathrm{sgn}(t)$`, R`$e^t$, $\sigma(t)$, $t^2+t$`]]),
          p('Der Trick: **Jedes** Signal lässt sich als Summe aus einem geraden und einem ungeraden Teil schreiben.'),
          f(R`s_e(t)=\frac{s(t)+s(-t)}{2},\qquad s_o(t)=\frac{s(t)-s(-t)}{2}`, 'e wie even, o wie odd'),
          lab('evenodd'),
          ex(R`1. Setze $-t$ in das Signal ein. Denke an $(-t)^n$ und $\sin(-t)=-\sin t$, $\cos(-t)=\cos t$. 2. Addiere und halbiere für $s_e$. 3. Subtrahiere und halbiere für $s_o$. 4. Probe: $s_e+s_o=s$.`),
          k(R`Bei einem Polynom geht es sofort: Alle geraden Potenzen samt Konstante wandern nach $s_e$, alle ungeraden nach $s_o$. Bei $e^t$ entstehen $\cosh t$ und $\sinh t$.`)
        ]
      },
      {
        id: 'm04s4', title: 'Zwei Sinussignale addieren', practice: ['m04q8', 'm04q9', 'm04q10', 'g.sinadd'],
        blocks: [
          p('Aus dem Anhang kommt das Additionstheorem, das Aufgabe 1-1 fast allein löst:'),
          f(R`\sin\alpha+\sin\beta=2\sin\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}`),
          p(R`Bei gleicher Frequenz verschwindet das $\omega t$ im Kosinus, weil es sich dort weghebt. Der Kosinus ist dann nur noch eine feste Zahl. Das Ergebnis ist wieder ein Sinus mit derselben Frequenz:`),
          f(R`\sin(\omega t+\varphi_1)+\sin(\omega t+\varphi_2)=\underbrace{2\cos\frac{\varphi_1-\varphi_2}{2}}_{\text{Amplitude}}\;\sin\Bigl(\omega t+\underbrace{\frac{\varphi_1+\varphi_2}{2}}_{\text{Phase}}\Bigr)`),
          plot({ title: R`Summe zweier Sinusschwingungen mit $\varphi_1=0$, $\varphi_2=\frac{\pi}{2}$`, x: [-1, 11], y: [-1.7, 1.7], xl: 't', yt: [-1, 1], curves: [{ f: Math.sin, c: 'm', d: '4 3', w: 1.4 }, { f: (t) => Math.sin(t + Math.PI / 2), c: 'm', d: '2 3', w: 1.4 }, { f: (t) => Math.sin(t) + Math.sin(t + Math.PI / 2), c: 'p', label: R`Summe: Amplitude $2\cos\frac{\pi}{4}\approx 1{,}41$` }] }),
          p('Bei verschiedenen Frequenzen bleibt beides zeitabhängig. Dann entsteht eine **Schwebung**: eine schnelle Schwingung, deren Lautstärke langsam an- und abschwillt.'),
          plot({ title: R`Schwebung: $\sin(5t)+\sin(5{,}6t)$`, x: [0, 22], y: [-2.2, 2.2], xl: 't', yt: [-2, 2], curves: [{ f: (t) => Math.sin(5 * t) + Math.sin(5.6 * t), c: 'p', w: 1.4, n: 900 }, { f: (t) => 2 * Math.cos(0.3 * t), c: 'w', d: '4 3', w: 1.2 }] })
        ]
      }
    ],
    questions: [
      Q.mc('m04q1', R`Was ergibt $\sigma(t)\cdot\cos(t)$?`, [R`Für $t<0$ null, für $t\ge 0$ der Kosinus`, 'Überall der Kosinus', R`Überall $1$`, R`Für $t>0$ null`], 0, 'Die Sprungfunktion schaltet das Signal bei $t=0$ ein.', { ref: 'Kap. 2 S. 11' }),
      Q.tf('m04q2', 'Stimmen die Aussagen?', [
        [R`$s(t-3)$ ist gegenüber $s(t)$ um $3$ nach rechts verschoben.`, true, 'Alles passiert 3 später.'],
        [R`$s(2t)$ ist breiter als $s(t)$.`, false, 'Es läuft doppelt so schnell ab, ist also schmaler.'],
        [R`$s(-t)$ tauscht positive und negative Werte.`, false, 'Es tauscht links und rechts. Die Werte bleiben gleich.']
      ], { ref: 'Kap. 2 S. 11' }),
      Q.mc('m04q3', R`Das Rechteck $s(t)$ liegt auf $[0,2]$. Wo liegt $s(2t-2)$?`, [R`Auf $[1,2]$`, R`Auf $[2,4]$`, R`Auf $[-1,0]$`, R`Auf $[0,1]$`], 0, R`$0\le 2t-2\le 2$ nach $t$ auflösen: $1\le t\le 2$. Im Zweifel immer so rechnen, das ist sicher.`, { lvl: 2, ref: 'Kap. 2 S. 11' }),
      Q.walk('m04q4', R`**Aufgabe 1-4 a)** Zerlege $s(t)=t^2-2t+1$.`, [
        W.mc(R`Wie lautet $s(-t)$?`, [R`$t^2+2t+1$`, R`$t^2-2t+1$`, R`$-t^2+2t-1$`, R`$-t^2-2t+1$`], 0, R`$(-t)^2=t^2$, und $-2(-t)=+2t$.`),
        W.mc(R`Wie lautet $s_e(t)$?`, [R`$t^2+1$`, R`$-2t$`, R`$2t^2+2$`, R`$t^2$`], 0, R`$\frac{(t^2-2t+1)+(t^2+2t+1)}{2}=t^2+1$.`),
        W.mc(R`Wie lautet $s_o(t)$?`, [R`$-2t$`, R`$2t$`, R`$t^2+1$`, R`$-4t$`], 0, R`$\frac{(t^2-2t+1)-(t^2+2t+1)}{2}=-2t$. Probe: $(t^2+1)+(-2t)=s(t)$.`)
      ], { src: 'Blatt 1-4a', ref: 'Blatt 1, Aufgabe 1-4' }),
      Q.walk('m04q5', R`**Aufgabe 1-4 b)** Zerlege $s(t)=5t^3+4$.`, [
        W.mc(R`Wie lautet $s_e(t)$?`, ['$4$', R`$5t^3$`, R`$5t^3+4$`, '$0$'], 0, 'Die Konstante ist gerade.'),
        W.mc(R`Wie lautet $s_o(t)$?`, [R`$5t^3$`, '$4$', R`$10t^3$`, '$0$'], 0, R`$t^3$ ist eine ungerade Potenz.`)
      ], { src: 'Blatt 1-4b', ref: 'Blatt 1, Aufgabe 1-4', lvl: 1, pts: 2 }),
      Q.walk('m04q6', R`**Aufgabe 1-4 c)** Zerlege $s(t)=e^t\sin(t)-t^5-3t^2+5$.`, [
        W.mc(R`Wie lautet $s(-t)$? Achte auf $\sin(-t)=-\sin t$.`, [R`$-e^{-t}\sin t+t^5-3t^2+5$`, R`$e^{-t}\sin t+t^5-3t^2+5$`, R`$-e^{t}\sin t+t^5+3t^2+5$`], 0, R`Aus $e^t$ wird $e^{-t}$, aus $\sin t$ wird $-\sin t$, aus $-t^5$ wird $+t^5$.`),
        W.mc(R`Wie lautet $s_e(t)$?`, [R`$\frac{\sin t}{2}\left(e^t-e^{-t}\right)-3t^2+5$`, R`$\frac{\sin t}{2}\left(e^t+e^{-t}\right)-3t^2+5$`, R`$\frac{\sin t}{2}\left(e^t-e^{-t}\right)-t^5$`], 0, R`Addieren: Das $t^5$ hebt sich weg, die Sinusterme bleiben mit $e^t-e^{-t}$. Kurz: $\sin t\,\sinh t-3t^2+5$.`),
        W.mc(R`Wie lautet $s_o(t)$?`, [R`$\frac{\sin t}{2}\left(e^t+e^{-t}\right)-t^5$`, R`$\frac{\sin t}{2}\left(e^t-e^{-t}\right)-t^5$`, R`$\frac{\sin t}{2}\left(e^t+e^{-t}\right)-3t^2$`], 0, R`Subtrahieren: $-3t^2$ und $5$ heben sich weg. Kurz: $\sin t\,\cosh t-t^5$.`)
      ], { src: 'Blatt 1-4c', ref: 'Blatt 1, Aufgabe 1-4' }),
      Q.mc('m04q7', R`Übung aus dem Skript: Was sind die Anteile von $s(t)=t^2+t-3$?`, [R`$s_e=t^2-3$, $s_o=t$`, R`$s_e=t^2$, $s_o=t-3$`, R`$s_e=t$, $s_o=t^2-3$`, R`$s_e=t^2+t$, $s_o=-3$`], 0, 'Die Konstante gehört zu den geraden Anteilen.', { ref: 'Kap. 2 S. 13' }),
      Q.walk('m04q8', R`**Aufgabe 1-1 a)** $s_1=\sin(\omega_1t+\varphi_1)$, $s_2=\sin(\omega_2t+\varphi_2)$ mit $\omega_1=\omega_2=\omega$ und $\varphi_1\ne\varphi_2$. Berechne $s=s_1+s_2$.`, [
        W.mc(R`Setze $\alpha=\omega t+\varphi_1$ und $\beta=\omega t+\varphi_2$ in das Additionstheorem ein. Was ist $\frac{\alpha+\beta}{2}$?`, [R`$\omega t+\frac{\varphi_1+\varphi_2}{2}$`, R`$2\omega t+\varphi_1+\varphi_2$`, R`$\frac{\varphi_1+\varphi_2}{2}$`], 0, 'Das doppelte $\\omega t$ wird wieder halbiert.'),
        W.mc(R`Was ist $\frac{\alpha-\beta}{2}$?`, [R`$\frac{\varphi_1-\varphi_2}{2}$`, R`$\omega t+\frac{\varphi_1-\varphi_2}{2}$`, '$0$'], 0, 'Das $\\omega t$ hebt sich weg.'),
        W.mc('Wie lautet das Ergebnis?', [R`$2\sin\left(\omega t+\frac{\varphi_1+\varphi_2}{2}\right)\cos\frac{\varphi_1-\varphi_2}{2}$`, R`$2\sin\left(\omega t+\varphi_1+\varphi_2\right)$`, R`$\sin\left(2\omega t+\varphi_1+\varphi_2\right)$`], 0, 'Eine Schwingung gleicher Frequenz, die Amplitude hängt nur vom Phasenunterschied ab.')
      ], { src: 'Blatt 1-1a', ref: 'Blatt 1, Aufgabe 1-1' }),
      Q.num('m04q9', R`**Aufgabe 1-1 b)** Nun ist $\omega_1=\omega_2$, $\varphi_1=0$ und $\varphi_2=-\pi$. Welchen Wert hat die Summe $s(t)$?`, 0, null, { src: 'Blatt 1-1b', ref: 'Blatt 1, Aufgabe 1-1', steps: [R`Mit der Formel aus a): $\cos\frac{0-(-\pi)}{2}=\cos\frac{\pi}{2}=0$.`, R`Die Amplitude ist also $0$. Anschaulich: $\sin(\omega t-\pi)=-\sin(\omega t)$. Beide Schwingungen sind genau gegenphasig und löschen sich aus.`] }),
      Q.mc('m04q10', R`**Aufgabe 1-1 c)** Nun ist $\omega_1\ne\omega_2$ und $\varphi_1\ne\varphi_2$. Wie lautet die Summe?`, [R`$2\sin\left(\frac{\omega_1t+\omega_2t+\varphi_1+\varphi_2}{2}\right)\cos\left(\frac{\omega_1t-\omega_2t+\varphi_1-\varphi_2}{2}\right)$`, R`$2\sin\left(\omega_1t+\omega_2t\right)\cos\left(\varphi_1-\varphi_2\right)$`, R`$2\sin\left(\frac{\omega_1t+\omega_2t}{2}\right)\cos\frac{\varphi_1-\varphi_2}{2}$`], 0, 'Jetzt bleibt auch im Kosinus ein zeitabhängiger Teil. Das ist die Schwebung.', { src: 'Blatt 1-1c', ref: 'Blatt 1, Aufgabe 1-1', lvl: 2, pts: 2 })
    ],
    calcs: ['g.evenodd', 'g.evenoddval', 'g.sinadd']
  });
})();
