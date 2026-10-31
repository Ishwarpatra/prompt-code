/* Converter (signed-in). */
(async function () {
  'use strict';
  var P = window.PC, $ = P.$, el = P.el;
  var sess = await P.requireSession();
  if (!sess) return;
  $('#main').hidden = false;

  var form = $('#convert-form'), idea = $('#idea'), btn = $('#convert'), res = $('#result');
  var label = btn.firstChild, slot = $('#loading-slot');

  function busy(on) {
    btn.disabled = on;
    label.textContent = on ? 'Converting… ' : 'Convert ';
    res.setAttribute('aria-busy', String(on));
    slot.replaceChildren();
    if (on) slot.append(P.banner('info', 'Converting…', 'Waiting for the model.'));
  }

  function renderOk(data) {
    var refineBtn = el('button', { class: 'btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'refine-box' }, 'Refine');
    var input = el('input', { id: 'refine-text', type: 'text', maxlength: '200', placeholder: 'For example: shorter, and ask for tests' });
    var go = el('button', { class: 'btn btn-primary', type: 'button' }, 'Apply change');
    var box = el('div', { class: 'refine', id: 'refine-box', hidden: true },
      el('label', { for: 'refine-text', text: 'What should change?' }), el('div', { class: 'row' }, input, go));
    refineBtn.addEventListener('click', function () {
      var open = box.hidden; box.hidden = !open;
      refineBtn.setAttribute('aria-expanded', String(open));
      if (open) input.focus();
    });
    function apply() {
      var t = input.value.trim();
      if (!t) { input.focus(); return; }
      run({ instruction: t, previousPrompt: data.prompt, type: data.recommendedType });
    }
    go.addEventListener('click', apply);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    P.renderResult(res, data, { actions: [refineBtn], after: [box] });
  }

  async function run(extra) {
    var text = idea.value.trim();
    if (!text) { res.replaceChildren(P.banner('err', 'Write your idea first', 'Describe what you want to build or ask for.')); idea.focus(); return; }
    var model = $('#model').value;
    var body = { idea: text, type: form.elements['type'].value, model: model };
    if (model === 'own') {
      var k = P.getUserKey();
      if (!k) {
        res.replaceChildren(P.banner('err', 'Add your key first', el('p', null, 'Open the ', el('a', { href: 'models.html' }, 'Models page'), ' to add an OpenAI or Gemini key for this tab.')));
        return;
      }
      body.userKey = k.key; body.userProvider = k.provider;
    }
    if (extra) Object.keys(extra).forEach(function (key) { body[key] = extra[key]; });
    busy(true);
    var r = await window.PCApi.call('POST', '/api/convert', body);
    busy(false);
    if (r.ok) { renderOk(r.data); P.announce('Prompt ready. Saved to History.'); }
    else if (r.error.code === 'UNAUTHENTICATED') location.replace('login.html?next=app.html');
    else res.replaceChildren(P.banner('err', P.errorTitle(r.error.code), r.error.message));
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
})();
