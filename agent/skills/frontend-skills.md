# frontend-skills.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Where the UI lives
`static/`: five pages (landing, login, converter, history, models), one stylesheet, one script per page. It is APP code, not agent material. The mockup in `agent/reference/` is superseded.

## Rules that keep it safe
- No inline `<script>`, `style=` attributes or `on...=` handlers. The content security policy forbids them.
- Put model output in the page with `textContent` only. Never `innerHTML`.
- No third-party requests: system fonts, no CDN, no analytics. Links to other sites are plain links.
- Keep the own API key in `sessionStorage` only; never show it again, never put it in a URL.
- The sign-in token is read from `#token=` in the address bar and removed at once.
- The next-page parameter after sign-in is checked against a fixed list of pages.

## Design
- Flat and square: no rounded corners, hairline borders, a hairline frame around the content column.
- One action colour (yellow) used for the Convert button and selected options. Example chips are outlined, not colour-coded.
- Tokens are CSS variables in `css/style.css`: light and dark themes, both tested for contrast.
- Headline in a serif display stack, body in the system sans stack, generated prompts in a monospace stack.

## Accessibility (checked in tests, still check by hand)
- One visible `h1` per page, a skip link, labelled controls, real buttons and links.
- Visible focus ring, 44px touch targets, text contrast at least 4.5:1, borders at least 3:1.
- Status and error messages use `role="status"` or `role="alert"` and a polite live region.
- Never block zoom (no `maximum-scale`, no `user-scalable=no`).
- Status is never colour only: words and icons carry it.
- Respect reduced motion. The UI uses no animation.

## States to build for every action
Idle, loading, success, backup model used, error (with what to do next), empty.

## Copy rules
- Sentence case. Buttons say what happens: "Convert", "Copy prompt", "Send sign-in link", "Delete".
- Errors say what happened and what to do. No apologies, no vague text.
- Say which model answered. Say when a backup was used.
- Demo results always say "Demo mode".

## Before release
Set `demo` to false in `js/config.js`, delete `js/demo.js` and its script tags, run `tests/ui` against the real API's test build, and do the manual checks: screen reader, phone, 200% zoom.
