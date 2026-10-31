const { JSDOM, VirtualConsole } = require('jsdom');
const assert = require('assert');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', 'static');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.normalize(path.join(ROOT, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0])));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
let BASE = '';
const wait = ms => new Promise(r => setTimeout(r, ms));
let passed = 0;
async function t(name, fn) { await fn(); passed++; console.log('ok  ' + name); }

async function open(page, { session, history, stubConfirm = true } = {}) {
  const errors = [], navs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (/navigation/i.test(e.message)) navs.push(e.message); else errors.push(e.message); });
  vc.on('error', m => errors.push(String(m)));
  const dom = await JSDOM.fromURL(BASE + page, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      if (session) w.localStorage.setItem('pc_demo_session', JSON.stringify({ email: session }));
      if (history) w.localStorage.setItem('pc_demo_history', JSON.stringify(history));
      if (stubConfirm) w.confirm = () => true;
      if (w.HTMLDialogElement) { w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); }; w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); }; }
    }
  });
  await new Promise(res => dom.window.addEventListener('load', res));
  return { dom, w: dom.window, d: dom.window.document, errors, navs };
}
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
const q = (d, s) => d.querySelector(s);

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r)); BASE = 'http://127.0.0.1:' + server.address().port + '/';
  await t('landing: loads clean, shows tries, chip fills box, free try returns a prompt', async () => {
    const { w, d, errors } = await open('index.html');
    await wait(1200);
    assert.match(q(d, '#tries-note').textContent, /3 free tries left/);
    assert(q(d, '#demo-slot .demo-bar'), 'demo bar present');
    click(w, q(d, '[data-example="class"]'));
    assert.match(q(d, '#idea').value, /class designs/);
    click(w, q(d, '#convert'));
    await wait(1500);
    const out = q(d, '#try-result');
    assert.match(out.textContent, /Demo mode/);
    assert.match(out.textContent, /Recommended: Role prompt/);
    assert.match(q(d, '#try-result pre').textContent, /senior specialist/);
    assert.match(q(d, '#tries-note').textContent, /2 free tries left/);
    assert(q(d, '#try-result a[href="login.html"]'), 'sign-in nudge');
    assert.deepStrictEqual(errors, []);
  });
  await t('landing: empty submit shows a clear error and keeps focus on the box', async () => {
    const { w, d } = await open('index.html'); await wait(800);
    click(w, q(d, '#convert')); await wait(100);
    assert.match(q(d, '#try-result [role="alert"]').textContent, /Write your idea first/);
    assert.strictEqual(d.activeElement, q(d, '#idea'));
  });
  await t('landing: after 3 tries the box locks and points to sign-in', async () => {
    const { w, d } = await open('index.html'); await wait(800);
    for (let i = 0; i < 3; i++) { q(d, '#idea').value = 'plan a project'; click(w, q(d, '#convert')); await wait(1300); }
    assert.match(q(d, '#tries-note').textContent, /used your free tries/);
    assert.strictEqual(q(d, '#convert').disabled, true);
  });
  await t('landing: prompt types browser switches detail and aria-pressed', async () => {
    const { w, d } = await open('index.html'); await wait(500);
    const btns = d.querySelectorAll('#type-list button'); assert.strictEqual(btns.length, 7);
    assert.strictEqual(btns[0].getAttribute('aria-pressed'), 'true');
    click(w, btns[2]);
    assert.strictEqual(btns[2].getAttribute('aria-pressed'), 'true'); assert.strictEqual(btns[0].getAttribute('aria-pressed'), 'false');
    assert.match(q(d, '#type-detail h3').textContent, /System prompt/);
  });
  await t('landing: backup-model scenario shows a visible notice', async () => {
    const { w, d } = await open('index.html'); await wait(500);
    const sel = q(d, '#scenario'); sel.value = 'fallback'; sel.dispatchEvent(new w.Event('change'));
    q(d, '#idea').value = 'plan a project'; click(w, q(d, '#convert')); await wait(1300);
    assert.match(q(d, '#try-result .banner-warn').textContent, /Llama did not respond.*Gemma answered instead/s);
  });
  await t('login: bad email blocked; valid email shows "check your email"; link opens a session', async () => {
    const { w, d, errors } = await open('login.html'); await wait(500);
    q(d, '#email').value = 'not-an-email'; q(d, '#login-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(100);
    assert.strictEqual(q(d, '#email-error').hidden, false); assert.strictEqual(q(d, '#email').getAttribute('aria-invalid'), 'true');
    q(d, '#email').value = 'ada@example.com'; q(d, '#login-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(1200);
    assert.strictEqual(q(d, '#state-sent').hidden, false); assert.strictEqual(q(d, '#state-request').hidden, true);
    assert.strictEqual(q(d, '#sent-to').textContent, 'ada@example.com');
    assert.strictEqual(q(d, '#resend').disabled, true, 'resend is rate-limited by a countdown');
    assert.strictEqual(q(d, '#demo-open-box').hidden, false);
    click(w, q(d, '#demo-open')); await wait(1500);
    assert.strictEqual(JSON.parse(w.localStorage.getItem('pc_demo_session')).email, 'ada@example.com');
    assert.deepStrictEqual(errors, []);
  });
  await t('login: expired link shows the error state with a way to get a new one', async () => {
    const { w, d } = await open('login.html'); await wait(400);
    q(d, '#email').value = 'ada@example.com'; q(d, '#login-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(1200);
    const sel = q(d, '#scenario'); sel.value = 'link_invalid'; sel.dispatchEvent(new w.Event('change'));
    click(w, q(d, '#demo-open')); await wait(1500);
    assert.strictEqual(q(d, '#state-error').hidden, false);
    assert.match(q(d, '#error-box [role="alert"]').textContent, /expired or was already used/);
    click(w, q(d, '#again')); assert.strictEqual(q(d, '#state-request').hidden, false);
  });
  await t('login: token in the address bar is removed immediately and used once', async () => {
    const errors = [];
    const dom = await JSDOM.fromURL(BASE + 'login.html#token=demo-token', {
      runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
      beforeParse(w) { w.localStorage.setItem('pc_demo_pending', JSON.stringify({ email: 'ada@example.com' })); }
    });
    await new Promise(r => dom.window.addEventListener('load', r)); await wait(1500);
    assert.strictEqual(dom.window.location.hash, '', 'fragment cleared');
    assert(dom.window.localStorage.getItem('pc_demo_session'));
  });
  await t('protected pages: without a session the page stays hidden and redirects to login', async () => {
    for (const p of ['app.html', 'history.html', 'models.html']) {
      const { d, navs } = await open(p); await wait(1000);
      assert.strictEqual(q(d, '#main').hidden, true, p); assert(navs.length >= 1, p + ' should try to navigate to login');
    }
  });
  await t('app: convert, copy button, refine applies a change, result saved to history', async () => {
    const { w, d, errors } = await open('app.html', { session: 'ada@example.com' }); await wait(1000);
    assert.strictEqual(q(d, '#main').hidden, false); assert.strictEqual(q(d, '#who-email').textContent, 'ada@example.com');
    q(d, '#idea').value = 'Review how our app stores user data and flag risks';
    q(d, '#convert-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(1400);
    assert.match(q(d, '#result .rec').textContent, /Recommended: Step-by-step checklist/);
    assert.strictEqual(q(d, '#result').getAttribute('aria-busy'), 'false');
    click(w, [...d.querySelectorAll('#result button')].find(b => b.textContent === 'Refine'));
    assert.strictEqual(q(d, '#refine-box').hidden, false);
    q(d, '#refine-text').value = 'make it shorter'; click(w, q(d, '#refine-box .btn-primary')); await wait(1400);
    assert.match(q(d, '#result pre').textContent, /Change requested: make it shorter/);
    assert.strictEqual(JSON.parse(w.localStorage.getItem('pc_demo_history')).length, 2);
    assert.deepStrictEqual(errors, []);
  });
  await t('app: choosing "my own key" without a key explains what to do; with a key it is sent', async () => {
    const { w, d } = await open('app.html', { session: 'ada@example.com' }); await wait(800);
    q(d, '#idea').value = 'plan a project'; q(d, '#model').value = 'own';
    q(d, '#convert-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(300);
    assert.match(q(d, '#result [role="alert"]').textContent, /Add your key first/);
    w.sessionStorage.setItem('pc_user_key', 'not-a-real-key-0123456789'); w.sessionStorage.setItem('pc_user_provider', 'gemini');
    q(d, '#convert-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(1400);
    assert.match(q(d, '#result .status').textContent, /Gemini \(your key\)/);
    assert(!q(d, '#result').textContent.includes('not-a-real-key'), 'key is never shown');
  });
  await t('app: all-models-fail shows an error and keeps the idea in the box', async () => {
    const { w, d } = await open('app.html', { session: 'ada@example.com' }); await wait(800);
    const sel = q(d, '#scenario'); sel.value = 'all_failed'; sel.dispatchEvent(new w.Event('change'));
    q(d, '#idea').value = 'keep me'; q(d, '#convert-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(1400);
    assert.match(q(d, '#result [role="alert"]').textContent, /All models are busy/);
    assert.strictEqual(q(d, '#idea').value, 'keep me'); assert.strictEqual(q(d, '#convert').disabled, false);
  });
  const seeded = [
    { id: 'a1', createdAt: '2026-10-30T10:00:00Z', idea: 'First idea', type: 'role', typeLabel: 'Role prompt', model: 'Llama', prompt: 'P1' },
    { id: 'b2', createdAt: '2026-10-31T10:00:00Z', idea: 'Second idea', type: 'system', typeLabel: 'System prompt', model: 'Qwen', prompt: 'P2' }
  ];
  await t('history: lists items, deletes one after confirm, deletes all, shows empty state', async () => {
    const { w, d, errors } = await open('history.html', { session: 'ada@example.com', history: seeded }); await wait(2600);
    assert.strictEqual(d.querySelectorAll('#hist > li').length, 2); assert.strictEqual(q(d, '#empty').hidden, true);
    click(w, q(d, '#hist > li .btn-danger')); assert(q(d, '#confirm').hasAttribute('open'), 'confirm dialog opens'); assert.match(q(d, '#confirm-text').textContent, /will be removed/); click(w, q(d, '#confirm-ok')); assert(!q(d, '#confirm').hasAttribute('open')); await wait(2600);
    assert.strictEqual(d.querySelectorAll('#hist > li').length, 1);
    click(w, q(d, '#delete-all')); click(w, q(d, '#confirm-ok')); await wait(2600);
    assert.strictEqual(d.querySelectorAll('#hist > li').length, 0); assert.strictEqual(q(d, '#empty').hidden, false);
    assert.strictEqual(q(d, '#delete-all').hidden, true); assert.deepStrictEqual(errors, []);
  });
  await t('models: shows fallback order with text status; key is kept in the tab and can be forgotten', async () => {
    const { w, d, errors } = await open('models.html', { session: 'ada@example.com' }); await wait(2600);
    const items = d.querySelectorAll('#model-list > li'); assert.strictEqual(items.length, 4);
    assert.match(items[0].textContent, /1\. Llama.*Tried first.*Available/s); assert.match(items[1].textContent, /Backup/);
    q(d, '#apikey').value = 'short'; q(d, '#key-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
    assert.match(q(d, '#key-msg').textContent, /too short/); assert.strictEqual(w.sessionStorage.getItem('pc_user_key'), null);
    q(d, '#apikey').value = 'not-a-real-key-0123456789'; q(d, '#key-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
    assert.strictEqual(w.sessionStorage.getItem('pc_user_key'), 'not-a-real-key-0123456789'); assert.strictEqual(q(d, '#apikey').value, '');
    assert.match(q(d, '#key-msg').textContent, /key is set for this tab/); assert(!d.body.textContent.includes('not-a-real-key'));
    click(w, q(d, '#key-forget')); assert.strictEqual(w.sessionStorage.getItem('pc_user_key'), null); assert.strictEqual(q(d, '#key-forget').hidden, true);
    assert.deepStrictEqual(errors, []);
  });
  await t('sign out clears the session and the tab key', async () => {
    const { w, d } = await open('models.html', { session: 'ada@example.com' }); await wait(1800);
    w.sessionStorage.setItem('pc_user_key', 'not-a-real-key-0123456789');
    click(w, q(d, '#signout')); await wait(1800);
    assert.strictEqual(w.localStorage.getItem('pc_demo_session'), null); assert.strictEqual(w.sessionStorage.getItem('pc_user_key'), null);
  });

  await t('finding 16: closing button adds an example, focuses the box, and never overwrites typed text', async () => {
    const { w, d } = await open('index.html'); await wait(500);
    assert.strictEqual(q(d, '#idea').value, '');
    click(w, q(d, '#start-example'));
    assert.match(q(d, '#idea').value, /class designs/); assert.strictEqual(d.activeElement, q(d, '#idea'));
    q(d, '#idea').value = 'my own idea'; click(w, q(d, '#start-example'));
    assert.strictEqual(q(d, '#idea').value, 'my own idea');
  });
  await t('finding 6: a visible loading state shows while a free try runs, then the result replaces it', async () => {
    const { w, d } = await open('index.html'); await wait(500);
    q(d, '#idea').value = 'plan a project'; click(w, q(d, '#convert')); await wait(60);
    assert.match(q(d, '#try-result [role="status"]').textContent, /Converting/);
    await wait(1400);
    assert.doesNotMatch(q(d, '#try-result').textContent, /Converting/); assert.match(q(d, '#try-result').textContent, /Recommended:/);
  });
  const watch = (d, loadingSel, doneSel) => new Promise(resolve => {
    let seen = false; const t0 = Date.now();
    const iv = setInterval(() => {
      const main = d.querySelector('#main'), ld = d.querySelector(loadingSel);
      if (main && !main.hidden && ld && !ld.hidden && /Loading/.test(ld.textContent)) seen = true;
      if (d.querySelectorAll(doneSel).length > 0 || Date.now() - t0 > 5000) { clearInterval(iv); resolve(seen); }
    }, 15);
  });
  await t('finding 6: History and Models show "Loading" on screen before their content, then hide it', async () => {
    const h = await open('history.html', { session: 'ada@example.com', history: [{ id: 'a1', createdAt: '2026-10-30T10:00:00Z', idea: 'First', type: 'role', typeLabel: 'Role prompt', model: 'Llama', prompt: 'P1' }] });
    assert(await watch(h.d, '#loading', '#hist > li'), 'History never showed a visible loading message');
    assert.strictEqual(q(h.d, '#loading').hidden, true);
    const m = await open('models.html', { session: 'ada@example.com' });
    assert(await watch(m.d, '#models-loading', '#model-list > li'), 'Models never showed a visible loading message');
    assert.strictEqual(q(m.d, '#models-loading').hidden, true); assert.strictEqual(m.d.querySelectorAll('#model-list > li').length, 4);
  });
  await t('finding 6: the converter shows "Converting" while waiting and clears it after', async () => {
    const { w, d } = await open('app.html', { session: 'ada@example.com' }); await wait(1000);
    q(d, '#idea').value = 'plan a project'; q(d, '#convert-form').dispatchEvent(new w.Event('submit', { cancelable: true })); await wait(60);
    assert.match(q(d, '#loading-slot [role="status"]').textContent, /Converting/);
    await wait(1400);
    assert.strictEqual(q(d, '#loading-slot').children.length, 0); assert.match(q(d, '#result .rec').textContent, /Recommended:/);
  });
  console.log('\n' + passed + ' page tests passed'); server.close(); process.exit(0);
})().catch(e => { console.error('FAIL:', e && e.stack || e); server.close(); process.exit(1); });
