// Baut die Lernapp aus den Quellen in eine einzige offline lauffähige HTML-Datei.
// Aufruf: node tools/build.js [--test]
// Ergebnis: SignaleLernApp/Resources/index.html für die iOS-App und, wenn der Ordner darüber existiert,
// ../Signale_Lerntool.html als Webversion. Mit --test zusätzlich web/dist/selftest.html.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'web', 'src');
const contentDir = path.join(root, 'web', 'content');
const vendor = path.join(root, 'web', 'vendor', 'katex');
const read = (p) => fs.readFileSync(p, 'utf8');
const script = (code) => '<script>' + code.replace(/<\/script>/gi, '<\\/script>') + '</script>';

// KaTeX-Stile mit eingebetteten Schriften, damit die Datei ohne Netz funktioniert.
function katexCSS() {
  return read(path.join(vendor, 'katex.min.css')).replace(/src:([^;}]*)/g, (all, list) => {
    const m = /url\(fonts\/([^)]+\.woff2)\)/.exec(list);
    if (!m) return all;
    const data = fs.readFileSync(path.join(vendor, 'fonts', m[1])).toString('base64');
    return 'src:url(data:font/woff2;base64,' + data + ') format("woff2")';
  });
}

const contentFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith('.js')).sort();
const css = katexCSS() + read(path.join(src, 'style.css'));
const HEAD = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
const scripts = [
  read(path.join(vendor, 'katex.min.js')),
  read(path.join(src, 'engine.js')),
  read(path.join(src, 'core.js')),
  read(path.join(src, 'plot.js')),
  read(path.join(src, 'blocks.js')),
  read(path.join(src, 'labs.js')),
  read(path.join(src, 'questions.js')),
  ...contentFiles.map((f) => read(path.join(contentDir, f))),
  read(path.join(src, 'app.js'))
].map(script).join('');

const html = '<!doctype html><html lang="de"><head>' + HEAD + '<title>Signale und Systeme Lerntool</title><style>' + css + '</style></head><body>' +
  '<div id="bg" aria-hidden="true"><i></i><i></i><i></i></div><div id="shell"><nav id="tabs" aria-label="Hauptnavigation"></nav><main id="view"></main></div>' +
  scripts + '</body></html>';

const appFile = path.join(root, 'SignaleLernApp', 'Resources', 'index.html');
fs.mkdirSync(path.dirname(appFile), { recursive: true });
fs.writeFileSync(appFile, html);

// Die Webversion liegt neben den Skripten im Studienordner. Auf dem Build-Server gibt es den nicht.
const webFile = path.join(root, '..', 'Signale_Lerntool.html');
if (fs.existsSync(path.join(root, '..', 'Skripte'))) fs.writeFileSync(webFile, html);

if (process.argv.includes('--test')) {
  const dist = path.join(root, 'web', 'dist');
  fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, 'selftest.html'), html.replace('</body></html>', script(read(path.join(root, 'tools', 'selftest.js'))) + '</body></html>'));
  fs.writeFileSync(path.join(dist, 'index.html'), html);
}
console.log('Gebaut: ' + (html.length / 1048576).toFixed(2) + ' MB aus ' + contentFiles.length + ' Inhaltsdateien');
