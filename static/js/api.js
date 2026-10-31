/* One door for every server call. Same shape in demo and real mode:
   resolves to { ok:true, status, data } or { ok:false, status, error:{ code, message, retryable } }. */
(function () {
  'use strict';
  var cfg = window.PC_CONFIG || { demo: false };

  async function real(method, path, body) {
    var opts = { method: method, headers: {}, credentials: 'same-origin' };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    var res;
    try { res = await fetch(path, opts); }
    catch (e) {
      return { ok: false, status: 0, error: { code: 'NETWORK', message: 'Could not reach the server. Check your connection and try again.', retryable: true } };
    }
    var data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (res.ok) return { ok: true, status: res.status, data: data };
    var err = data && data.error ? data.error : { code: 'SERVER_ERROR', message: 'Something went wrong on our side. Try again.', retryable: true };
    return { ok: false, status: res.status, error: err };
  }

  window.PCApi = {
    call: function (method, path, body) {
      if (cfg.demo) {
        if (!window.PCDemo) return Promise.resolve({ ok: false, status: 0, error: { code: 'SERVER_ERROR', message: 'Demo backend is missing.', retryable: false } });
        return window.PCDemo.call(method, path, body);
      }
      return real(method, path, body);
    }
  };
})();
