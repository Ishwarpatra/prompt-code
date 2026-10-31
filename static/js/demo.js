/* DEMO BACKEND. For design review only. Returns sample output; no model is ever called.
   Mirrors the planned API (see agent/docs/AUTH-AND-ACCESS.md) so pages can be reviewed without a server.
   Inert unless PC_CONFIG.demo is true. Must not ship: delete this file for release (CI checks). */
(function () {
  'use strict';
  var CFG = window.PC_CONFIG || {};
  if (!CFG.demo) return;

  var LS = window.localStorage, SS = window.sessionStorage;
  var K = { session: 'pc_demo_session', pending: 'pc_demo_pending', tries: 'pc_demo_tries', history: 'pc_demo_history', scenario: 'pc_demo_scenario' };
  var MAX_TRIES = 3, MAX_LEN = 4000;
  var SCENARIOS = [
    ['ok', 'Success'], ['fallback', 'Backup model answers'], ['all_failed', 'All models fail'],
    ['rate_limited', 'Rate limited'], ['key_invalid', 'Invalid user key'], ['network', 'Network error'],
    ['link_invalid', 'Sign-in link expired']
  ];

  function jget(k, f) { try { var v = LS.getItem(k); return v == null ? f : JSON.parse(v); } catch (e) { return f; } }
  function jset(k, v) { try { LS.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  function getScenario() { try { return SS.getItem(K.scenario) || 'ok'; } catch (e) { return 'ok'; } }
  function setScenario(v) { try { SS.setItem(K.scenario, v); } catch (e) { /* ignore */ } }
  function ok(data, status) { return { ok: true, status: status || 200, data: data }; }
  function fail(status, code, message, retryable) { return { ok: false, status: status, error: { code: code, message: message, retryable: !!retryable } }; }
  function delay() { return CFG.demoDelay != null ? CFG.demoDelay : 350 + Math.random() * 350; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function classify(text) {
    var t = text.toLowerCase();
    if (/\b(class|classes|object|uml|schema|architecture|design)\b/.test(t)) return 'role';
    if (/\b(audit|risk|risks|privacy|gdpr|compliance|review|security)\b/.test(t)) return 'cot';
    if (/\b(chatbot|bot|assistant|support|customer|customers)\b/.test(t)) return 'system';
    if (/\b(agent|tool|tools|automate|workflow)\b/.test(t)) return 'agent';
    if (/\b(extract|classify|format|example|examples)\b/.test(t)) return 'fewshot';
    if (/\b(project|plan|roadmap|milestone|milestones|build)\b/.test(t)) return 'project';
    return 'power';
  }

  function build(typeId, idea, instruction) {
    var task = idea.trim().replace(/\s+/g, ' ').slice(0, 240);
    var change = instruction ? '\nChange requested: ' + instruction.trim().replace(/\s+/g, ' ').slice(0, 200) : '';
    var T = {
      role: 'You are a senior specialist in this area.\nTask: ' + task + '\nReturn: 1. A short plan. 2. The main parts, each with a one-line purpose. 3. Open questions you need answered.\nAsk before assuming anything unclear.',
      cot: 'Work through the items one at a time.\nTask: ' + task + '\nFor each item, state: what it is, where it sits, who is affected, and the risk.\nEnd with the three biggest risks, ranked.',
      system: 'You are a helpful assistant for this job: ' + task + '\nRules: stay on topic, be brief and polite, never invent facts.\nIf you are not sure, say so and ask one question.',
      agent: 'You are an agent with a clear goal: ' + task + '\nTools: [list the tools you may use, and when].\nLimits: do not act outside the goal. Ask a person before anything that cannot be undone.\nStop when the goal is met and report what you did.',
      fewshot: 'Do the following task and keep the same format as the examples.\nTask: ' + task + '\nExample 1: [input] -> [output]\nExample 2: [input] -> [output]\nNow do the same for the new input.',
      project: 'Project goal: ' + task + '\nConstraints: [time, budget, tools]\nDeliverables: [list]\nWork in stages and confirm each stage before the next.',
      power: 'Goal: ' + task + '\nContext: [who this is for]\nSteps: [what to do, in order]\nOutput format: [how the answer should look]\nCheck your answer against the goal before replying.'
    };
    return T[typeId] + change;
  }

  function validateIdea(v) {
    var t = typeof v === 'string' ? v.trim() : '';
    if (!t) return fail(400, 'INPUT_EMPTY', 'Write your idea first.', false);
    if (t.length > MAX_LEN) return fail(400, 'INPUT_TOO_LONG', 'That is too long. Keep it under ' + MAX_LEN + ' characters.', false);
    return null;
  }

  function convertResult(body) {
    var sc = getScenario();
    if (sc === 'all_failed') return fail(503, 'ALL_PROVIDERS_FAILED', 'Every model is busy right now. Your idea is still in the box. Try again in a minute.', true);
    if (sc === 'rate_limited') return fail(429, 'RATE_LIMITED', 'Too many requests. Wait a minute, then try again.', true);
    if (body.userKey && sc === 'key_invalid') return fail(401, 'KEY_INVALID', 'That API key was rejected. Check the key on the Models page, then try again.', false);
    var id = (body.type && body.type !== 'auto' && window.PC_TYPE_BY_ID[body.type]) ? body.type : classify(body.idea);
    var info = window.PC_TYPE_BY_ID[id];
    var auto = !body.model || body.model === 'auto';
    var fb = sc === 'fallback' && auto && !body.userKey;
    var model = fb ? 'Gemma' : 'Llama';
    if (body.userKey) model = body.userProvider === 'gemini' ? 'Gemini (your key)' : 'OpenAI (your key)';
    else if (!auto && body.model !== 'own') model = cap(String(body.model));
    return ok({
      prompt: build(id, body.idea, body.instruction), recommendedType: id, typeLabel: info.label, reason: info.when,
      model: model, provider: 'demo', fallbackUsed: fb, fallbackFrom: fb ? 'Llama' : null, demo: true
    });
  }

  async function call(method, path, body) {
    await sleep(delay());
    var sc = getScenario();
    var p = String(path).split('?')[0];
    body = body || {};
    if (sc === 'network' && p !== '/api/me') return fail(0, 'NETWORK', 'Could not reach the server. Check your connection and try again.', true);
    var session = jget(K.session, null);

    if (method === 'GET' && p === '/api/me') return session ? ok({ email: session.email }) : fail(401, 'UNAUTHENTICATED', 'Sign in to continue.', false);

    if (method === 'POST' && p === '/api/auth/request-link') {
      var email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(400, 'EMAIL_INVALID', 'Enter a valid email address, like name@example.com.', false);
      if (sc === 'rate_limited') return fail(429, 'RATE_LIMITED', 'Too many sign-in links requested. Wait a few minutes, then try again.', true);
      jset(K.pending, { email: email });
      return ok({ sent: true }, 202);
    }
    if (method === 'POST' && p === '/api/auth/verify') {
      var pend = jget(K.pending, null);
      if (sc === 'link_invalid' || body.token !== 'demo-token' || !pend) return fail(400, 'LINK_INVALID', 'This link has expired or was already used. Request a new one.', false);
      jset(K.session, { email: pend.email });
      try { LS.removeItem(K.pending); } catch (e) { /* ignore */ }
      return ok({ email: pend.email });
    }
    if (method === 'POST' && p === '/api/auth/logout') { try { LS.removeItem(K.session); } catch (e) { /* ignore */ } return ok({ signedOut: true }); }

    if (method === 'GET' && p === '/api/try') return ok({ triesLeft: Math.max(0, MAX_TRIES - jget(K.tries, 0)), limit: MAX_TRIES });
    if (method === 'POST' && p === '/api/try') {
      var bad = validateIdea(body.idea); if (bad) return bad;
      var used = jget(K.tries, 0);
      if (used >= MAX_TRIES) return fail(429, 'TRY_LIMIT_REACHED', 'You have used your free tries. Sign in to keep going.', false);
      var tr = convertResult({ idea: body.idea, type: 'auto', model: 'auto' });
      if (tr.ok) { used += 1; jset(K.tries, used); tr.data.triesLeft = Math.max(0, MAX_TRIES - used); }
      return tr;
    }

    if (!session && (p === '/api/convert' || p.indexOf('/api/history') === 0 || p === '/api/models')) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.', false);

    if (method === 'POST' && p === '/api/convert') {
      var bad2 = validateIdea(body.idea); if (bad2) return bad2;
      var cr = convertResult(body);
      if (cr.ok) {
        var items = jget(K.history, []);
        var rec = { id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdAt: new Date().toISOString(),
          idea: String(body.idea).trim(), type: cr.data.recommendedType, typeLabel: cr.data.typeLabel, model: cr.data.model, prompt: cr.data.prompt };
        items.unshift(rec); jset(K.history, items.slice(0, 200));
        cr.data.id = rec.id;
      }
      return cr;
    }
    if (method === 'GET' && p === '/api/history') return ok({ items: jget(K.history, []) });
    if (method === 'DELETE' && p === '/api/history') { var n = jget(K.history, []).length; jset(K.history, []); return ok({ deleted: n }); }
    var m = /^\/api\/history\/([^/]+)$/.exec(p);
    if (method === 'DELETE' && m) {
      var id = decodeURIComponent(m[1]), all = jget(K.history, []), keep = all.filter(function (x) { return x.id !== id; });
      if (keep.length === all.length) return fail(404, 'NOT_FOUND', 'That item no longer exists.', false);
      jset(K.history, keep); return ok({ deleted: 1 });
    }

    if (method === 'GET' && p === '/api/models') {
      var s1 = sc === 'all_failed' ? 'down' : (sc === 'fallback' ? 'busy' : 'ok'), s2 = sc === 'all_failed' ? 'down' : 'ok';
      return ok({ models: [
        { id: 'llama', name: 'Llama', role: 'default', status: s1, openWeight: true },
        { id: 'gemma', name: 'Gemma', role: 'backup', status: s2, openWeight: true },
        { id: 'qwen', name: 'Qwen', role: 'backup', status: s2, openWeight: true },
        { id: 'mistral', name: 'Mistral', role: 'backup', status: s2, openWeight: true }
      ] });
    }
    return fail(404, 'NOT_FOUND', 'Not found.', false);
  }

  window.PCDemo = { call: call, scenarios: SCENARIOS, getScenario: getScenario, setScenario: setScenario };
})();
