// UI-Test mit dem vorhandenen Chrome im Headless-Modus. Aufruf: node tools/test-ui.js [Ausgabeordner] [Seite ...]
// Ohne Seiten: Selbsttest bei Handy- und Desktopbreite. Mit Seiten: nur Bildschirmfotos, z. B. heute m11s2.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const BROWSER = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const root = path.join(__dirname, '..');
const dist = path.join(root, 'web', 'dist');
const out = process.argv[2] || path.join(os.tmpdir(), 'sisytest');
const pages = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
const profile = path.join(out, 'profile');
const toUrl = (p) => 'file:///' + p.split(path.sep).join('/').replace(/ /g, '%20');

function edge(args) {
  return execFileSync(BROWSER, ['--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files', '--user-data-dir=' + profile, ...args], { encoding: 'utf8', timeout: 280000, maxBuffer: 200 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
}

// Ein Iframe erzwingt die echte Breite, denn Headless-Fenster haben eine Mindestbreite.
function frame(name, width, height, src, theme) {
  const wrapper = path.join(dist, 'frame_' + name + '.html');
  fs.writeFileSync(wrapper, '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#888"><iframe id="f" src="' + src + '" style="border:0;display:block;width:' + width + 'px;height:' + height + 'px"></iframe><pre id="r"></pre><script>addEventListener("message",function(e){document.getElementById("r").textContent=e.data})</script>' +
    (theme ? '<script>document.getElementById("f").addEventListener("load",function(){this.contentDocument.documentElement.setAttribute("data-theme","' + theme + '")})</script>' : ''));
  return toUrl(wrapper);
}

if (pages.length) {
  const [h, width] = [parseInt(process.env.SHOT_H || '844', 10), parseInt(process.env.SHOT_W || '390', 10)];
  for (const page of pages) {
    const [hash, theme] = page.split(':');
    const file = path.join(out, hash.replace(/[^a-z0-9-]/gi, '_') + (theme ? '_' + theme : '') + '.png');
    edge(['--window-size=' + Math.max(width, 500) + ',' + h, '--virtual-time-budget=4000', '--hide-scrollbars', '--screenshot=' + file, frame('shot', width, h, 'index.html#' + hash, theme)]);
    console.log(file);
  }
  process.exit(0);
}

let failed = false;
for (const width of [390, 1200]) {
  const dom = edge(['--window-size=1300,1000', '--virtual-time-budget=250000', '--dump-dom', frame('t' + width, width, 900, 'selftest.html')]);
  const m = /<pre id="r">([\s\S]*?)<\/pre>/.exec(dom);
  if (!m || !m[1]) {
    console.log('Breite ' + width + ': Kein Bericht erhalten');
    failed = true;
    continue;
  }
  const r = JSON.parse(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
  console.log('Breite ' + r.width + ' px: ' + r.routes + ' Seiten, ' + r.sessions + ' Aufgaben durchgeklickt, ' + r.solved + '/' + r.checked + ' richtig gewertet, ' + r.labsTouched + ' Labore bedient');
  Array.from(new Set(r.errors)).slice(0, 40).forEach((e) => { console.log('  FEHLER ' + e); failed = true; });
  Array.from(new Set(r.overflow)).slice(0, 40).forEach((e) => { console.log('  BREITE ' + e); failed = true; });
}
console.log(failed ? 'Es gibt Auffälligkeiten.' : 'Alles in Ordnung.');
process.exit(failed ? 1 : 0);
