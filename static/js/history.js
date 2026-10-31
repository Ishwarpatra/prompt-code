/* History (signed-in): list, copy, delete one, delete all. */
(async function () {
  'use strict';
  var P = window.PC, $ = P.$, el = P.el;
  var sess = await P.requireSession();
  if (!sess) return;
  $('#main').hidden = false;

  var list = $('#hist'), empty = $('#empty'), delAll = $('#delete-all'), dlg = $('#confirm'), box = $('#status-box');
  var pending = null;

  function ask(title, text, fn) {
    $('#confirm-h').textContent = title;
    $('#confirm-text').textContent = text;
    pending = fn;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else if (window.confirm(text)) fn();
  }
  function closeDialog() {
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  }
  $('#confirm-cancel').addEventListener('click', function () { pending = null; closeDialog(); });
  $('#confirm-ok').addEventListener('click', function () { var fn = pending; pending = null; closeDialog(); if (fn) fn(); });

  function render(items) {
    list.replaceChildren();
    items.forEach(function (it) {
      var title = it.idea.length > 90 ? it.idea.slice(0, 90) + '…' : it.idea;
      var copy = el('button', { class: 'btn', type: 'button' }, 'Copy prompt');
      copy.addEventListener('click', function () { P.copyText(it.prompt, copy); });
      var del = el('button', { class: 'btn btn-danger', type: 'button', 'aria-label': 'Delete: ' + title }, 'Delete');
      del.addEventListener('click', function () {
        ask('Delete this prompt?', '"' + title + '" will be removed from your history.', function () { removeOne(it.id); });
      });
      var pre = el('pre', { class: 'prompt-out' }); pre.textContent = it.prompt;
      list.append(el('li', null,
        el('h2', { text: title }),
        el('p', { class: 'sub', text: it.typeLabel + ', ' + it.model + ', ' + P.fmtTime(it.createdAt) }),
        el('details', null, el('summary', { text: 'Show prompt' }), pre),
        el('div', { class: 'actions' }, copy, del)));
    });
    empty.hidden = items.length > 0;
    delAll.hidden = items.length === 0;
  }

  function focusTop() { var h = $('.page-title'); h.setAttribute('tabindex', '-1'); h.focus(); }

  async function load() {
    box.replaceChildren();
    var loading = $('#loading');
    loading.hidden = false;
    var r = await window.PCApi.call('GET', '/api/history');
    loading.hidden = true;
    if (r.ok) { render(r.data.items); return; }
    var retry = el('button', { class: 'btn', type: 'button' }, 'Try again');
    retry.addEventListener('click', load);
    box.append(P.banner('err', P.errorTitle(r.error.code), r.error.message), retry);
  }
  async function removeOne(id) {
    var r = await window.PCApi.call('DELETE', '/api/history/' + encodeURIComponent(id));
    if (r.ok) { P.announce('Deleted.'); await load(); focusTop(); }
    else box.replaceChildren(P.banner('err', P.errorTitle(r.error.code), r.error.message));
  }
  async function removeAll() {
    var r = await window.PCApi.call('DELETE', '/api/history');
    if (r.ok) { P.announce('All history deleted.'); await load(); focusTop(); }
    else box.replaceChildren(P.banner('err', P.errorTitle(r.error.code), r.error.message));
  }
  delAll.addEventListener('click', function () {
    ask('Delete all history?', 'Every saved prompt will be removed. This cannot be undone.', removeAll);
  });
  load();
})();
