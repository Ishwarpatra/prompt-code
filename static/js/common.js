/* Shared helpers. Everything that touches model output uses textContent, never innerHTML. */
(function () {
  'use strict';
  var cfg = window.PC_CONFIG || {};

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === false || v == null) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var kid = arguments[i];
      if (kid == null || kid === false) continue;
      if (Array.isArray(kid)) { kid.forEach(function (k2) { if (k2) n.append(k2.nodeType ? k2 : document.createTextNode(String(k2))); }); continue; }
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return n;
  }

  function announce(msg) {
    var l = $('#live');
    if (!l) return;
    l.textContent = '';
    setTimeout(function () { l.textContent = msg; }, 50);
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  var ICONS = {
    warn: 'M10 3l8 14H2L10 3zM10 8v4M10 14.5v.1',
    err: 'M10 2a8 8 0 100 16 8 8 0 000-16zM10 6v5M10 13.5v.1',
    ok: 'M10 2a8 8 0 100 16 8 8 0 000-16zM6.5 10.5l2.5 2.5 4.5-5',
    info: 'M10 2a8 8 0 100 16 8 8 0 000-16zM10 9v5M10 6v.1'
  };
  function icon(kind) {
    var s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 20 20');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    var p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', ICONS[kind] || ICONS.info);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.7');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    s.append(p);
    return s;
  }

  function banner(kind, title, body) {
    var text = el('div', null, el('strong', { text: title }));
    if (body) text.append(body.nodeType ? body : el('p', { text: body }));
    return el('div', { class: 'banner banner-' + kind, role: kind === 'err' ? 'alert' : 'status' }, icon(kind), text);
  }

  var TITLES = {
    INPUT_EMPTY: 'Write your idea first',
    INPUT_TOO_LONG: 'That is too long',
    RATE_LIMITED: 'Too many requests',
    ALL_PROVIDERS_FAILED: 'All models are busy',
    KEY_INVALID: 'That API key was rejected',
    NETWORK: 'No connection',
    UNAUTHENTICATED: 'Please sign in',
    LINK_INVALID: 'That link did not work',
    EMAIL_INVALID: 'Check the email address'
  };
  function errorTitle(code) { return TITLES[code] || 'Something went wrong'; }

  async function copyText(text, btn) {
    var done = false;
    try { await navigator.clipboard.writeText(text); done = true; }
    catch (e) {
      var ta = el('textarea', { tabindex: '-1', 'aria-hidden': 'true' });
      ta.value = text; document.body.append(ta); ta.select();
      try { done = document.execCommand('copy'); } catch (e2) { done = false; }
      ta.remove();
    }
    var old = btn.textContent;
    btn.textContent = done ? 'Copied' : 'Copy failed. Select the text instead.';
    announce(done ? 'Prompt copied.' : 'Could not copy the prompt.');
    setTimeout(function () { btn.textContent = old; }, 1800);
  }

  function fmtTime(iso) {
    try { return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  /* Shared result card used by the landing page and the converter. */
  function renderResult(container, data, opts) {
    opts = opts || {};
    container.replaceChildren();
    if (data.demo) container.append(banner('info', 'Demo mode', 'Sample output. No model was called.'));
    if (data.fallbackUsed) {
      container.append(banner('warn', (data.fallbackFrom || 'The first model') + ' did not respond.', data.model + ' answered instead. Your result is below.'));
    }
    var rec = el('div', { class: 'rec' }, el('strong', { text: 'Recommended: ' + data.typeLabel + '.' }), ' ' + data.reason);
    var pre = el('pre', { class: 'prompt-out', tabindex: '0', 'aria-label': 'Generated prompt' });
    pre.textContent = data.prompt;
    var copy = el('button', { class: 'btn', type: 'button' }, 'Copy prompt');
    copy.addEventListener('click', function () { copyText(data.prompt, copy); });
    var actions = el('div', { class: 'actions' }, copy, opts.actions || []);
    var meta = el('div', { class: 'meta' },
      el('span', { class: 'status', text: 'Model: ' + data.model + (data.fallbackUsed ? ' (backup)' : '') }), actions);
    container.append(el('div', { class: 'result' }, el('div', { class: 'result-body' }, rec, pre, meta, opts.after || [])));
  }

  /* Own key: kept in this tab only (sessionStorage), sent with each request, not meant to be stored by the server. */
  var KEY = 'pc_user_key', PROV = 'pc_user_provider';
  function getUserKey() {
    try { var k = sessionStorage.getItem(KEY); return k ? { key: k, provider: sessionStorage.getItem(PROV) || 'openai' } : null; }
    catch (e) { return null; }
  }
  function setUserKey(k, p) { try { sessionStorage.setItem(KEY, k); sessionStorage.setItem(PROV, p); return true; } catch (e) { return false; } }
  function clearUserKey() { try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(PROV); } catch (e) { /* ignore */ } }

  async function requireSession() {
    var r = await window.PCApi.call('GET', '/api/me');
    if (!r.ok) {
      var here = location.pathname.split('/').pop() || 'app.html';
      location.replace('login.html?next=' + encodeURIComponent(here));
      return null;
    }
    var w = $('#who-email'); if (w) w.textContent = r.data.email;
    var so = $('#signout');
    if (so) so.addEventListener('click', async function () { await window.PCApi.call('POST', '/api/auth/logout'); clearUserKey(); location.href = 'index.html'; });
    return r.data;
  }

  function demoBar() {
    var slot = $('#demo-slot');
    if (!slot || !cfg.demo || !window.PCDemo) return;
    var sel = el('select', { id: 'scenario' });
    window.PCDemo.scenarios.forEach(function (s) {
      var o = el('option', { value: s[0] }, s[1]);
      if (s[0] === window.PCDemo.getScenario()) o.selected = true;
      sel.append(o);
    });
    sel.addEventListener('change', function () {
      window.PCDemo.setScenario(sel.value);
      announce('Demo scenario: ' + sel.options[sel.selectedIndex].text);
    });
    slot.append(el('div', { class: 'demo-bar' },
      el('strong', { text: 'Demo mode.' }),
      el('span', { text: 'Sample output only. No model is called and nothing leaves this browser.' }),
      el('label', { for: 'scenario', text: 'Scenario' }), sel));
  }

  window.PC = { $: $, $$: $$, el: el, announce: announce, icon: icon, banner: banner, errorTitle: errorTitle,
    copyText: copyText, fmtTime: fmtTime, renderResult: renderResult, getUserKey: getUserKey, setUserKey: setUserKey,
    clearUserKey: clearUserKey, requireSession: requireSession };
  demoBar();
})();
