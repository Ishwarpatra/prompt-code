/* Landing page: limited free try (no sign-in), example chips, prompt-type browser. */
(function () {
  'use strict';
  var P = window.PC, $ = P.$, $$ = P.$$, el = P.el;
  var form = $('#try-form'), idea = $('#idea'), btn = $('#convert'), out = $('#try-result'), note = $('#tries-note');
  var label = btn.firstChild;
  var exhausted = false;

  function renderTries(n) {
    note.textContent = n > 0
      ? n + ' free ' + (n === 1 ? 'try' : 'tries') + ' left. Sign in for history, model choice and your own key.'
      : 'You have used your free tries. Sign in to keep going.';
    if (n <= 0) { exhausted = true; btn.disabled = true; }
  }
  window.PCApi.call('GET', '/api/try').then(function (r) { if (r.ok) renderTries(r.data.triesLeft); });

  $$('[data-example]').forEach(function (b) {
    b.addEventListener('click', function () {
      idea.value = window.PC_EXAMPLES[b.getAttribute('data-example')] || '';
      idea.focus();
      P.announce('Example added. Press Convert.');
    });
  });

  function upsell() {
    return el('p', { class: 'upsell' }, 'Want to refine it, keep it in a history, or pick the model? ', el('a', { href: 'login.html' }, 'Sign in with your email'), '.');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var text = idea.value.trim();
    if (!text) {
      out.replaceChildren(P.banner('err', 'Write your idea first', 'Type or paste what you want to build, or pick an example under the box.'));
      idea.focus();
      return;
    }
    btn.disabled = true; label.textContent = 'Converting… '; out.setAttribute('aria-busy', 'true');
    out.replaceChildren(P.banner('info', 'Converting…', 'Waiting for the model.'));
    var r = await window.PCApi.call('POST', '/api/try', { idea: text });
    out.setAttribute('aria-busy', 'false'); label.textContent = 'Convert ';
    if (r.ok) {
      P.renderResult(out, r.data, { after: [upsell()] });
      renderTries(r.data.triesLeft);
      P.announce('Prompt ready.');
    } else if (r.error.code === 'TRY_LIMIT_REACHED') {
      out.replaceChildren(P.banner('info', 'You have used your free tries', el('p', null, 'Sign in with your email to keep going. ', el('a', { href: 'login.html' }, 'Sign in'))));
      renderTries(0);
    } else {
      out.replaceChildren(P.banner('err', P.errorTitle(r.error.code), r.error.message));
    }
    if (!exhausted) btn.disabled = false;
  });

  /* Closing button: puts an example in an empty box and moves to it. Never overwrites typed text. */
  var start = $('#start-example');
  if (start) start.addEventListener('click', function () {
    if (!idea.value.trim()) idea.value = window.PC_EXAMPLES['class'];
    idea.focus(); /* focusing scrolls the box into view */
    P.announce('Example added. Press Convert.');
  });

  /* Prompt types browser */
  var list = $('#type-list'), detail = $('#type-detail');
  function show(id) {
    var t = window.PC_TYPE_BY_ID[id];
    $$('button', list).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-id') === id)); });
    detail.replaceChildren(el('h3', { text: t.label }), el('p', { text: t.when }), el('p', { class: 'eg', text: 'Example: ' + t.example }));
  }
  window.PC_TYPES.forEach(function (t) {
    var b = el('button', { type: 'button', 'aria-pressed': 'false', 'data-id': t.id, text: t.label });
    b.addEventListener('click', function () { show(t.id); });
    list.append(el('li', null, b));
  });
  show(window.PC_TYPES[0].id);
  detail.setAttribute('aria-live', 'polite');
})();
