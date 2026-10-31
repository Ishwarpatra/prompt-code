/* Email magic-link sign-in. The link carries the token in the URL fragment (#token=...),
   which browsers never send to the server. This script reads it, removes it from the address bar,
   and posts it once. No password anywhere. */
(function () {
  'use strict';
  var P = window.PC, $ = P.$, el = P.el, cfg = window.PC_CONFIG || {};
  var STATES = ['request', 'sent', 'verify', 'error'];
  var timer = null;

  function show(name, focus) {
    STATES.forEach(function (s) { $('#state-' + s).hidden = (s !== name); });
    if (focus) { var h = $('#state-' + name + ' h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
  }
  var next = (function () {
    var n = new URLSearchParams(location.search).get('next');
    return ['app.html', 'history.html', 'models.html'].indexOf(n) > -1 ? n : 'app.html';
  })();
  $('#link-minutes').textContent = String(cfg.linkMinutes || 15);
  var sentMsg = el('div', { id: 'sent-msg' });
  $('#state-sent').insertBefore(sentMsg, $('#state-sent .actions'));

  function validEmail(v) { return v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function fieldError(msg) {
    var e = $('#email-error'), i = $('#email');
    if (msg) { e.textContent = msg; e.hidden = false; i.setAttribute('aria-invalid', 'true'); }
    else { e.textContent = ''; e.hidden = true; i.removeAttribute('aria-invalid'); }
  }

  function startCountdown() {
    var b = $('#resend'), left = cfg.resendSeconds || 30;
    clearInterval(timer);
    b.disabled = true;
    b.textContent = 'Send again in ' + left + 's';
    timer = setInterval(function () {
      left -= 1;
      if (left <= 0) { clearInterval(timer); b.disabled = false; b.textContent = 'Send again'; }
      else b.textContent = 'Send again in ' + left + 's';
    }, 1000);
  }

  $('#login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var v = $('#email').value.trim();
    if (!validEmail(v)) { fieldError('Enter a valid email address, like name@example.com.'); $('#email').focus(); return; }
    fieldError('');
    var b = $('#send'); b.disabled = true; b.textContent = 'Sending…';
    var r = await window.PCApi.call('POST', '/api/auth/request-link', { email: v });
    b.disabled = false; b.textContent = 'Send sign-in link';
    if (!r.ok) { fieldError(r.error.message); $('#email').focus(); return; }
    $('#sent-to').textContent = v;
    sentMsg.replaceChildren();
    show('sent', true);
    startCountdown();
    if (cfg.demo) $('#demo-open-box').hidden = false;
  });

  $('#resend').addEventListener('click', async function () {
    var v = $('#email').value.trim();
    var r = await window.PCApi.call('POST', '/api/auth/request-link', { email: v });
    if (r.ok) { sentMsg.replaceChildren(P.banner('ok', 'Link sent again', 'Check your email.')); startCountdown(); P.announce('Link sent again.'); }
    else sentMsg.replaceChildren(P.banner('err', P.errorTitle(r.error.code), r.error.message));
  });
  $('#change').addEventListener('click', function () { clearInterval(timer); show('request', true); $('#email').focus(); });
  $('#again').addEventListener('click', function () { show('request', true); $('#email').focus(); });

  async function verify(token) {
    show('verify', true);
    var r = await window.PCApi.call('POST', '/api/auth/verify', { token: token });
    if (r.ok) { location.replace(next); return; }
    $('#error-box').replaceChildren(P.banner('err', P.errorTitle(r.error.code), r.error.message));
    show('error', true);
  }
  $('#demo-open').addEventListener('click', function () { verify('demo-token'); });

  var m = /^#token=([^&]+)/.exec(location.hash);
  if (m) {
    var token = decodeURIComponent(m[1]);
    history.replaceState(null, '', location.pathname + location.search);
    verify(token);
  } else {
    window.PCApi.call('GET', '/api/me').then(function (r) { if (r.ok) location.replace(next); });
  }
})();
