/* Regression checks for the Anti Slop audit fixes. Plain Node, no browser needed.
   These read the files in ../../static and fail if a fixed problem comes back. */
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..', '..', 'static');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const scripts = fs.readdirSync(path.join(ROOT, 'js')).map(f => 'js/' + f);
const css = read('css/style.css');
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };

function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lum(h) { h = h.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
function ratio(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
const tokens = name => [...css.matchAll(new RegExp('--' + name + ':(#[0-9A-Fa-f]{6})', 'g'))].map(m => m[1]); // [light, dark]

t('R-02: no em or en dashes in any page, script, stylesheet or icon', () => {
  for (const f of [...pages, ...scripts, 'css/style.css', 'favicon.svg']) assert(!/[\u2013\u2014]/.test(read(f)), f);
});
t('CSP: no inline scripts, styles or event handlers', () => {
  for (const f of pages) {
    const h = read(f);
    assert(!/\sstyle=/.test(h), f + ' has style=');
    assert(!/\son[a-z]+=/i.test(h), f + ' has an inline handler');
    assert(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(h), f + ' has an inline script');
  }
});
t('Finding 1 (R-36): no speed claims or unbuilt behaviour stated as fact', () => {
  const bad = ['Usually a few seconds', 'in seconds', 'The server does not store it', 'Free tries are not saved', 'counted per visitor and are not saved', 'is never saved on the server', 'the next one answers', 'takes over.'];
  for (const f of [...pages, ...scripts]) for (const s of bad) assert(!read(f).includes(s), f + ' still says: ' + s);
});
t('Finding 4 (R-25): placeholder colour is set and passes 4.5:1 on the panel in both themes', () => {
  assert(/::placeholder\{color:var\(--muted\);opacity:1\}/.test(css));
  const muted = tokens('muted'), panel = tokens('panel');
  assert.strictEqual(muted.length, 2); assert.strictEqual(panel.length, 2);
  for (let i = 0; i < 2; i++) assert(ratio(muted[i], panel[i]) >= 4.5, 'theme ' + i + ': ' + ratio(muted[i], panel[i]).toFixed(2));
});
t('Finding 5 (R-32): demo bar focus ring contrasts with the bar in both themes', () => {
  assert(/\.demo-bar :focus-visible\{outline-color:var\(--ground\)/.test(css));
  const ink = tokens('ink'), ground = tokens('ground');
  for (let i = 0; i < 2; i++) assert(ratio(ink[i], ground[i]) >= 3, 'theme ' + i);
});
t('Finding 6 (R-27): History, Models and the converter show a visible loading state', () => {
  assert(/id="loading"[^>]*role="status"[^>]*>Loading history/.test(read('history.html')));
  assert(/id="models-loading"[^>]*role="status"[^>]*>Loading models/.test(read('models.html')));
  assert(read('app.html').includes('id="loading-slot"'));
  assert(read('js/app.js').includes("'Converting…'") && read('js/landing.js').includes("'Converting…'"));
});
t('Finding 7 (R-03): phone step, dvh and a card grid that cannot overflow', () => {
  const m = css.slice(css.indexOf('@media (max-width:640px){\n  .top{'));
  assert(m.length > 0, 'phone step missing');
  for (const rule of ['.section{padding:48px 16px}', '.hero{padding:40px 16px 32px}', '.top nav{order:3;flex-basis:100%', '.auth{margin:24px 16px']) assert(m.includes(rule), rule);
  assert(css.includes('min-height:100dvh'));
  assert(css.includes('minmax(min(100%,260px),1fr)'));
});
t('Findings 9 and 13 (R-01, R-29, non-text contrast): one outlined chip style, boundary at least 3:1', () => {
  assert(!/chip-(mint|lilac|peach|sky|lemon)|--chip-ink/.test(css + pages.map(read).join('')));
  assert(/\.chip\{[^}]*border:1px solid var\(--ink\)/.test(css));
  const ink = tokens('ink'), ground = tokens('ground'), panel = tokens('panel');
  for (let i = 0; i < 2; i++) assert(ratio(ink[i], ground[i]) >= 3 && ratio(ink[i], panel[i]) >= 3);
});
t('Finding 16 (R-15, C-3): closing section starts something and no longer says "Back to the top"', () => {
  const h = read('index.html');
  assert(!h.includes('Back to the top')); assert(h.includes('id="start-example"') && h.includes('Start with an example'));
});
t('Finding 19 (C-3): footer has no internal process note; its links exist', () => {
  const h = read('index.html');
  assert(!h.includes('Layout ideas studied'));
  const foot = h.slice(h.indexOf('<footer'));
  assert(foot.includes('href="login.html"') && foot.includes('href="#resources"') && h.includes('id="resources"'));
});
t('R-24: every landing-page anchor has a target', () => {
  const h = read('index.html');
  for (const m of h.matchAll(/href="#([a-z-]+)"/g)) assert(h.includes('id="' + m[1] + '"'), m[1]);
});
console.log('\n' + n + ' static checks passed');
