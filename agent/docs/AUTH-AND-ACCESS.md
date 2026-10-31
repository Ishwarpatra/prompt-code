# AUTH-AND-ACCESS.md: Who Can Do What, and How Sign-in Works

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Purpose: keep model API keys and free-tier quota safe, while letting anyone try the product. The UI in `static/` already follows these rules in demo mode. The Rust server that enforces them is not written yet.

Items marked **[owner to confirm]** are proposals, not decisions.

## 1. Access levels
| Level | How | Can do |
|---|---|---|
| Visitor | No sign-in | A small number of free tries on the landing page. Nothing else |
| Signed in | Email magic link | Convert, refine, history, choose the model, use their own key |

The owner's rule: the API cannot be given away freely. Anything beyond a simple try needs sign-in.

## 2. Free try rules (landing page, no sign-in)
- Limited tries per visitor. Default 3 (`FREE_TRIES`) [owner to confirm].
- Short input only (`FREE_TRY_MAX_CHARS`, proposed 800) [owner to confirm]. The landing box currently allows 4000 characters; set it to the server limit when the API exists.
- The cheapest open-weight model only. No model choice, no own key, no refine.
- Output length capped.
- Results are not saved, and the idea text is not logged.
- Counted two ways, because cookies are easy to clear: a signed visitor cookie, and a per-IP limit on the server. Store a hash of the IP, not the address.
- A global daily cap across all free tries (`FREE_TRY_DAILY_CAP`) so anonymous traffic can never use up the quota. When it is hit, return `FREE_TRY_UNAVAILABLE` and show: free tries are paused for today, sign in to continue.
- Failed tries do not count.
- Server keys never reach the browser.

## 3. Sign-in: email magic link, no passwords
Flow:
1. Person enters their email on `login.html`. The page posts it to `/api/auth/request-link`.
2. The server always answers `202 {sent:true}`, whether or not the email has an account (no account guessing).
3. The server emails a link: `https://<host>/login.html#token=<token>`.
4. Opening the link loads `login.html`. The page reads the token from the fragment, removes it from the address bar at once, and posts it to `/api/auth/verify`.
5. On success the server sets a session cookie and the page redirects to the app. The first successful sign-in creates the account.

Why the token is in the fragment: browsers never send the part after `#` to the server, so it stays out of server logs, proxies and Referer headers.

Token rules:
- 32 random bytes from the operating system's secure random source, URL-safe encoded.
- Store only a hash (SHA-256) of the token. Never the token itself.
- Single use. Mark it used atomically (compare-and-set) so two requests cannot both win.
- Expires after `LINK_TTL_MINUTES` (default 15).
- Tied to one email. A new request invalidates earlier unused links for that email.
- Rate limits: per email and per IP (proposed 5 and 20 per hour) [owner to confirm]. Return `RATE_LIMITED` with a plain message.
- The UI enforces a 30-second wait before "Send again" (`resendSeconds`). The server must enforce its own limits too.

Known risk: some email security scanners run JavaScript on links and could use up a token before the person clicks. If this happens, make the login page ask for one click ("Sign in") before posting the token.

Session:
- Cookie `__Host-pc_session`: `HttpOnly; Secure; SameSite=Lax; Path=/`, no Domain attribute.
- Random 32-byte value; store its hash with the user id and expiry. Lifetime `SESSION_DAYS` (proposed 14) [owner to confirm].
- Sign-out deletes the server record and the cookie.
- State-changing requests: require `Content-Type: application/json` and check the `Origin` header matches the site.

Email sending:
- Use a free-tier transactional email service [owner to choose; verify its free limit].
- Set SPF, DKIM and DMARC on the sending domain, or links will land in spam [verify].
- Plain text plus a minimal HTML version. No tracking pixels or tracked links.
- Subject: "Your Prompt Code sign-in link". Say it expires and works once.

## 4. API
| Method and path | Needs sign-in | Request | Success | Errors |
|---|---|---|---|---|
| GET /api/try | No | none | `{triesLeft, limit}` | |
| POST /api/try | No | `{idea}` | `{prompt, recommendedType, typeLabel, reason, model, provider, fallbackUsed, fallbackFrom, triesLeft}` | INPUT_EMPTY, INPUT_TOO_LONG, TRY_LIMIT_REACHED, FREE_TRY_UNAVAILABLE, ALL_PROVIDERS_FAILED, RATE_LIMITED |
| POST /api/auth/request-link | No | `{email}` | 202 `{sent:true}` | EMAIL_INVALID, RATE_LIMITED |
| POST /api/auth/verify | No | `{token}` | `{email}` and a session cookie | LINK_INVALID |
| POST /api/auth/logout | Yes | none | `{signedOut:true}` | |
| GET /api/me | Yes | none | `{email}` | UNAUTHENTICATED |
| POST /api/convert | Yes | `{idea, type, model, userKey?, userProvider?, instruction?, previousPrompt?}` | as /api/try, plus `id` | INPUT_*, KEY_INVALID, ALL_PROVIDERS_FAILED, RATE_LIMITED, UNAUTHENTICATED |
| GET /api/history | Yes | none | `{items:[{id, createdAt, idea, type, typeLabel, model, prompt}]}` | UNAUTHENTICATED |
| DELETE /api/history/:id | Yes | none | `{deleted:1}` | NOT_FOUND |
| DELETE /api/history | Yes | none | `{deleted:n}` | |
| GET /api/models | Yes | none | `{models:[{id, name, role, status, openWeight}]}` in fallback order | |

Error body is always `{"error":{"code","message","retryable"}}`. `NETWORK` is created by the browser when the server cannot be reached.

## 5. Own key (OpenAI or Gemini)
- Entered on the Models page. Kept in the browser tab's `sessionStorage` until forgotten, signed out, or the tab closes.
- Sent in the JSON body of each `/api/convert` request. The server uses it for that request only.
- Never stored, logged, echoed in a response or put in an error message. Invalid key returns `KEY_INVALID` and the request stops; it does not fall back to another model.
- Trade-off: script on the page could read it. This is why the CSP below is strict and the UI never inserts text as HTML.

## 6. Browser security
Send these headers on all static and API responses (adjust once the server exists) [verify]:
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer` (at least for `login.html`)
- `Strict-Transport-Security` once HTTPS is confirmed
- `Cache-Control: no-store` for `/api/*` and `login.html`

The UI is written for this policy: no inline scripts, no inline styles, no inline event handlers, no third-party requests. Fonts are system fonts for that reason, and so that visitors' addresses are not sent to a font provider. To use a custom font later, self-host it.

## 7. Data and hosting
- Hosting: DigitalOcean. Region: Brussels or London, to be chosen by the owner. Check that the region offers the services needed [verify].
- Store the minimum: email, hashed sessions and tokens, history (only for signed-in people), hashed visitor counters.
- Free tries are not saved.
- Give people a way to delete a history item, all history, and (to build) their account.
- GDPR and UK GDPR may apply to people in Brussels and London. A privacy notice, a retention rule and a deletion process are needed before launch. This is not legal advice [owner to confirm].

## 8. Demo mode (current state of the UI)
- `static/js/config.js` has `demo: true`. The pages then use `static/js/demo.js`, which returns sample output and keeps its state in the browser. No model is called. Every demo result carries a visible "Demo mode" notice.
- The demo bar at the top has a Scenario menu (backup model answers, all models fail, rate limited, invalid key, network error, link expired) for reviewing error states.
- In demo mode the "magic link" is simulated by a button on the "Check your email" screen.
- To view: serve the `static/` folder with any static file server and open `index.html`.
- Before release: set `demo` to `false`, delete `static/js/demo.js` and its `<script>` lines, and let CI confirm neither remains.

## 9. Tests the server must have
- Link works once; second use fails. Expired link fails. Wrong token fails. New request voids the old link.
- Same 202 response for known and unknown emails; response time does not reveal which.
- Per-email and per-IP link limits.
- Free try: limit per visitor, per-IP limit, daily cap, failed tries not counted, input not logged.
- Session cookie flags; sign-out ends the session; protected routes return `UNAUTHENTICATED`.
- Origin and content-type checks on state-changing routes.
- Own key never appears in logs, responses, errors or stored data.
- Fallback behaviour as in ARCHITECTURE-RUST.md section 7.

## 10. Open decisions for the owner
1. Free-try limits: per visitor, input size, daily cap.
2. Email provider and sending domain.
3. Session length, and whether to add a confirmation click on the login page.
4. Region: Brussels or London.
5. Privacy notice, retention, account deletion.
6. Project name. It may change before release. Search the project for "Prompt Code" and "prompt-code" to rename. Internal keys that start with `pc_` and the cookie name `__Host-pc_session` are internal and do not need to change.
