const assert = require('assert');
const store = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), clear: () => m.clear() }; };
global.window = global;
Object.defineProperty(global, 'localStorage', { value: store(), configurable: true });
Object.defineProperty(global, 'sessionStorage', { value: store(), configurable: true });
global.PC_CONFIG = { demo: true, demoDelay: 0 };
const base = require('path').join(__dirname, '..', '..', 'static', 'js') + '/';
require(base + 'types.js'); require(base + 'demo.js');
const D = window.PCDemo;
let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok  ' + name); };
const reset = () => { localStorage.clear(); sessionStorage.clear(); };

(async () => {
  await t('chips classify to the intended prompt types', async () => {
    reset();
    const want = { class: 'role', audit: 'cot', chatbot: 'system', agent: 'agent', project: 'project' };
    for (const [k, id] of Object.entries(want)) {
      const r = await D.call('POST', '/api/try', { idea: PC_EXAMPLES[k] });
      assert(r.ok, k); assert.strictEqual(r.data.recommendedType, id, k + ' -> ' + r.data.recommendedType);
      localStorage.removeItem('pc_demo_tries');
    }
  });
  await t('free try: 3 tries then limit; counter falls', async () => {
    reset();
    const a = await D.call('GET', '/api/try'); assert.strictEqual(a.data.triesLeft, 3);
    for (let i = 2; i >= 0; i--) { const r = await D.call('POST', '/api/try', { idea: 'plan a project' }); assert(r.ok); assert.strictEqual(r.data.triesLeft, i); assert.strictEqual(r.data.demo, true); }
    const r4 = await D.call('POST', '/api/try', { idea: 'plan a project' });
    assert(!r4.ok && r4.error.code === 'TRY_LIMIT_REACHED' && r4.status === 429 && r4.error.retryable === false);
  });
  await t('input validation: empty and too long', async () => {
    reset();
    assert.strictEqual((await D.call('POST', '/api/try', { idea: '   ' })).error.code, 'INPUT_EMPTY');
    assert.strictEqual((await D.call('POST', '/api/try', { idea: 'x'.repeat(4001) })).error.code, 'INPUT_TOO_LONG');
  });
  await t('failed try does not use up a free try', async () => {
    reset(); D.setScenario('all_failed');
    const r = await D.call('POST', '/api/try', { idea: 'a plan' });
    assert.strictEqual(r.error.code, 'ALL_PROVIDERS_FAILED'); assert.strictEqual(r.status, 503);
    D.setScenario('ok'); assert.strictEqual((await D.call('GET', '/api/try')).data.triesLeft, 3);
  });
  await t('protected routes need a session', async () => {
    reset();
    for (const [m, p] of [['GET', '/api/me'], ['POST', '/api/convert'], ['GET', '/api/history'], ['GET', '/api/models'], ['DELETE', '/api/history']]) {
      const r = await D.call(m, p, { idea: 'x' }); assert(!r.ok && r.status === 401 && r.error.code === 'UNAUTHENTICATED', m + p);
    }
  });
  await t('magic link flow: request, wrong token, right token, one use, sign out', async () => {
    reset();
    assert.strictEqual((await D.call('POST', '/api/auth/request-link', { email: 'nope' })).error.code, 'EMAIL_INVALID');
    const sent = await D.call('POST', '/api/auth/request-link', { email: 'ada@example.com' }); assert(sent.ok && sent.status === 202);
    assert.strictEqual((await D.call('POST', '/api/auth/verify', { token: 'wrong' })).error.code, 'LINK_INVALID');
    const v = await D.call('POST', '/api/auth/verify', { token: 'demo-token' }); assert(v.ok && v.data.email === 'ada@example.com');
    assert((await D.call('GET', '/api/me')).data.email === 'ada@example.com');
    await D.call('POST', '/api/auth/logout'); assert(!(await D.call('GET', '/api/me')).ok);
    assert.strictEqual((await D.call('POST', '/api/auth/verify', { token: 'demo-token' })).error.code, 'LINK_INVALID'); // already used
  });
  await t('expired-link and rate-limit scenarios', async () => {
    reset(); await D.call('POST', '/api/auth/request-link', { email: 'a@b.co' });
    D.setScenario('link_invalid'); assert.strictEqual((await D.call('POST', '/api/auth/verify', { token: 'demo-token' })).error.code, 'LINK_INVALID');
    D.setScenario('rate_limited'); const r = await D.call('POST', '/api/auth/request-link', { email: 'a@b.co' }); assert(r.status === 429 && r.error.retryable);
  });
  const signIn = async () => { await D.call('POST', '/api/auth/request-link', { email: 'ada@example.com' }); await D.call('POST', '/api/auth/verify', { token: 'demo-token' }); };
  await t('convert saves to history; delete one; delete all', async () => {
    reset(); await signIn();
    const a = await D.call('POST', '/api/convert', { idea: 'Design classes for a shop', type: 'auto', model: 'auto' });
    const b = await D.call('POST', '/api/convert', { idea: 'A helper bot for customers', type: 'system', model: 'qwen' });
    assert(a.ok && b.ok && a.data.recommendedType === 'role' && b.data.recommendedType === 'system' && b.data.model === 'Qwen');
    let h = (await D.call('GET', '/api/history')).data.items; assert.strictEqual(h.length, 2); assert.strictEqual(h[0].idea, 'A helper bot for customers');
    assert((await D.call('DELETE', '/api/history/' + encodeURIComponent(a.data.id))).ok);
    assert.strictEqual((await D.call('DELETE', '/api/history/nope')).status, 404);
    assert.strictEqual((await D.call('GET', '/api/history')).data.items.length, 1);
    assert.strictEqual((await D.call('DELETE', '/api/history')).data.deleted, 1);
    assert.strictEqual((await D.call('GET', '/api/history')).data.items.length, 0);
  });
  await t('backup model scenario is shown honestly', async () => {
    reset(); await signIn(); D.setScenario('fallback');
    const r = await D.call('POST', '/api/convert', { idea: 'plan a project', type: 'auto', model: 'auto' });
    assert(r.data.fallbackUsed && r.data.model === 'Gemma' && r.data.fallbackFrom === 'Llama');
    const picked = await D.call('POST', '/api/convert', { idea: 'plan a project', type: 'auto', model: 'mistral' });
    assert(!picked.data.fallbackUsed && picked.data.model === 'Mistral');
    const m = (await D.call('GET', '/api/models')).data.models; assert(m[0].status === 'busy' && m[1].status === 'ok');
  });
  await t('invalid user key only matters when a key is sent; key never echoed', async () => {
    reset(); await signIn(); D.setScenario('key_invalid');
    assert((await D.call('POST', '/api/convert', { idea: 'plan', model: 'auto' })).ok);
    const bad = await D.call('POST', '/api/convert', { idea: 'plan', model: 'own', userKey: 'not-a-real-key-for-tests', userProvider: 'openai' });
    assert(bad.error.code === 'KEY_INVALID' && bad.status === 401);
    assert(!JSON.stringify(bad).includes('not-a-real-key'));
    D.setScenario('ok');
    const good = await D.call('POST', '/api/convert', { idea: 'plan', model: 'own', userKey: 'not-a-real-key-for-tests', userProvider: 'gemini' });
    assert(good.data.model === 'Gemini (your key)' && !JSON.stringify(good).includes('not-a-real-key'));
    assert(!localStorage.getItem('pc_demo_history').includes('not-a-real-key'), 'key must not be saved in history');
  });
  await t('refine appends the requested change; network scenario fails cleanly', async () => {
    reset(); await signIn();
    const r = await D.call('POST', '/api/convert', { idea: 'plan a project', type: 'project', instruction: 'shorter please', previousPrompt: 'x' });
    assert(r.data.prompt.includes('Change requested: shorter please'));
    D.setScenario('network'); const n2 = await D.call('POST', '/api/convert', { idea: 'x' });
    assert(n2.status === 0 && n2.error.code === 'NETWORK' && n2.error.retryable);
  });
  console.log('\n' + n + ' demo tests passed');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
