/* Models (signed-in): fallback order with live status, and the own-key form. */
(async function () {
  'use strict';
  var P = window.PC, $ = P.$, el = P.el;
  var sess = await P.requireSession();
  if (!sess) return;
  $('#main').hidden = false;

  var STATUS = { ok: 'Available', busy: 'Busy', down: 'Down' };
  var PROVIDERS = { openai: 'OpenAI', gemini: 'Gemini' };

  async function load() {
    var box = $('#models-status'), ol = $('#model-list'), loading = $('#models-loading');
    box.replaceChildren();
    loading.hidden = false;
    var r = await window.PCApi.call('GET', '/api/models');
    loading.hidden = true;
    if (!r.ok) {
      var retry = el('button', { class: 'btn', type: 'button' }, 'Try again');
      retry.addEventListener('click', load);
      box.append(P.banner('err', P.errorTitle(r.error.code), r.error.message), retry);
      return;
    }
    ol.replaceChildren();
    r.data.models.forEach(function (m, i) {
      ol.append(el('li', null,
        el('div', null, el('strong', { text: (i + 1) + '. ' + m.name }),
          el('div', { class: 'hint', text: (m.role === 'default' ? 'Tried first' : 'Backup') + (m.openWeight ? ', open-weight' : '') })),
        el('span', { class: 'status', text: STATUS[m.status] || 'Unknown' })));
    });
  }

  var msg = $('#key-msg'), forget = $('#key-forget');
  function showKeyState() {
    var k = P.getUserKey();
    if (k) { msg.textContent = 'A ' + PROVIDERS[k.provider] + ' key is set for this tab. It is not shown again.'; forget.hidden = false; }
    else { msg.textContent = 'No key set. The key is kept in this tab only and is not meant to be saved on the server.'; forget.hidden = true; }
  }
  $('#key-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#apikey').value.trim();
    if (v.length < 16) { msg.textContent = 'That key looks too short. Paste the whole key and try again.'; $('#apikey').focus(); return; }
    if (!P.setUserKey(v, $('#provider').value)) { msg.textContent = 'This browser would not let us keep the key for this tab.'; return; }
    $('#apikey').value = '';
    showKeyState();
    P.announce('Key set for this tab.');
  });
  forget.addEventListener('click', function () { P.clearUserKey(); showKeyState(); P.announce('Key forgotten.'); $('#apikey').focus(); });

  showKeyState();
  load();
})();
