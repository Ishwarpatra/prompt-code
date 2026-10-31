# tests/ui

Tests for the static UI in `../../static`. They run the real pages in a simulated browser (jsdom) against the demo backend in `static/js/demo.js`.

- `static.test.js`: reads the files in `static/` and fails if an audit fix is undone (dashes, inline scripts, unverified claims, placeholder and focus contrast, loading states, phone-step rules, chip style, closing button, footer, anchors). No browser needed.
- `demo.test.js`: logic of the demo backend (free-try limit, magic-link flow, history, scenarios).
- `pages.test.js`: landing, login, converter, history and models pages end to end. Starts its own small file server.

Run (Node 20 or later):

```
cd tests/ui
npm install
npm test
```

Important: these tests need `demo: true` in `static/js/config.js`. They test the UI, not the Rust API. When the Rust API exists, add tests for it under `tests/` and keep these for the UI.
Dev only. Never ship this folder.
