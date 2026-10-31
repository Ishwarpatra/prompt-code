# START HERE: Prompt Code package

Prepared 31 October 2026. Read this first. It says what you have, what works, and exactly what to do with it, in order.

## 1. In one minute

Prompt Code turns a rough idea into a prompt that works. It is meant to be a Rust server plus a plain HTML, CSS and JavaScript interface, using open-weight models.

| Part | State today |
|---|---|
| Web interface (landing page, sign-in, converter, history, models) | **Built.** Runs in demo mode: sample output, no model is called |
| Automated tests for the interface | **41 pass** (11 static checks, 11 demo-backend tests, 19 page tests) |
| Opened in a real browser, on a phone, in dark mode, at 200% zoom | **Never.** This is the biggest gap |
| Rust server (real model calls, email sign-in, history storage) | **Not written** |
| Colour palette from the colour wheel | **Prepared, not applied** |
| Anti Slop audit | 19 findings. 10 fixed. 9 open, plus 1 new |
| Hacktoberfest submission | **Not ready.** Needs a real model call, a licence and a public repository |

### The seven things to do, in order
1. See it running (section 3).
2. Run the tests (section 4).
3. Do the real-browser check (section 5). Several fixes are unconfirmed until you do.
4. Decide the logo and the palette (sections 6 and 7).
5. Supply the legal pages, or keep the site demo-only (section 8).
6. Choose a licence, create the GitHub repository, push (section 9).
7. Build the Rust server, Option A first, then submit (sections 10 and 11).

## 2. What is in the package

```
prompt-code/
  START-HERE.md          this guide
  README.md              the public GitHub README (honest status, how to run)
  .gitignore             keeps node_modules, target, .env and databases out of git
  static/                THE APP INTERFACE (ships with the product)
    index.html           landing page with the limited free try
    login.html           email sign-in with a one-time link
    app.html             converter (signed in)
    history.html         saved prompts (signed in)
    models.html          model order and own-key form (signed in)
    css/style.css        all styling and colours
    js/                  one script per page, plus shared helpers
    js/demo.js           SAMPLE backend for design review. Must never ship
    js/config.js         the demo switch: demo: true
    favicon.svg          icon (see section 6)
  tests/ui/              interface tests (Node). Development only. package-lock.json pins
                         the exact test-tool versions that were tried
  agent/                 AGENT-ONLY. For coding agents and maintainers. Never ships
    README.md            entry point for agents
    docs/                plan, architecture, status, handover, code map, auth rules,
                         submission, landing page, palette, references, index
    skills/              18 working-rule files for coding agents
    anti-slop/           the audit (19 findings) and the follow-up (what was fixed)
    reference/           colour palette page and tokens, older mockup (superseded)
```

Rule: the app never reads, imports or bundles anything from `agent/`. Release builds leave it out.

## 3. See it running

You need Python 3 (any recent version). No installs.

```
unzip prompt-code.zip
cd prompt-code/static
python3 -m http.server 8000
```
Windows: use `py -m http.server 8000` if `python3` is not found. Then open http://localhost:8000 in a browser. Stop the server with Ctrl+C.

Verified here: all five pages, the stylesheet, every script and the icon load from this server with no errors.

### A walk-through that shows everything
1. **Landing page.** Click a chip (for example "Class design"), then press **Convert**. A result appears with a "Demo mode" notice. You have 3 free tries; after the third, the box locks and asks you to sign in.
2. **Sign in.** Press "Sign in". Enter any email address, press **Send sign-in link**. On the "Check your email" screen press **Open the sign-in link** (this button exists only in demo mode; in real use the link arrives by email).
3. **Converter.** Type an idea, press **Convert**. Press **Refine**, type a change, press **Apply change**. Press **Copy prompt**.
4. **History.** Your results are listed. Open one, copy it, delete one, delete all (a confirmation box opens; Escape closes it).
5. **Models.** Shows the order models are tried and their status.
6. **Error states.** At the top of every page the **Scenario** menu changes what the demo does: backup model answers, all models fail, rate limited, invalid user key, network error, sign-in link expired. Pick one, then repeat an action to see that state.

To start over: open a private window, or clear the site's data in the browser.
Do not paste a real API key into the demo. Nothing is sent anywhere, but there is no reason to risk it.

### See it on a phone
Same Wi-Fi as your computer: run `python3 -m http.server 8000 --bind 0.0.0.0`, find your computer's local address, and open `http://<that address>:8000` on the phone. This shares the folder with your local network while it runs. Stop it when done.

## 4. Run the tests

You need Node 20 or later (tested here with Node 22).

```
cd prompt-code/tests/ui
npm install
npm test
```
Expected, in order: `11 static checks passed`, `11 demo tests passed`, `19 page tests passed`. The page tests take one to two minutes.

What they prove: the interface behaves as designed against the demo backend, and the audit fixes cannot be quietly undone. What they do not prove: how anything looks, or that a Rust server works. They run the pages in a simulated browser that draws nothing.

Verified here from a clean copy of this package: `npm install` and `npm test` pass.

## 5. The real-browser check (audit finding 8): do this first

Nothing has been looked at on a screen. This check is the evidence the project is missing, and it can reveal new problems.

**Set up (Chrome or Edge; menu names vary by version).**
- Open the pages from section 3.
- Press F12 for developer tools. Press Ctrl+Shift+M (Cmd+Shift+M on Mac) for the device toolbar. Choose "Responsive" and type a width.
- Dark mode: switch your operating system to dark, or in developer tools open the command menu (Ctrl+Shift+P) and search "prefers-color-scheme".
- Zoom: Ctrl and + (Cmd and + on Mac) until the browser says 200%.

**Widths to test:** 375 (phone), 768 (tablet), 1280 (desktop). Each in light and dark.

**Look for, on every page:**
- No sideways scrolling. No text cut off or overlapping.
- Phone: the header is two rows (name and buttons, then links) and nothing is crammed.
- Text is easy to read, including the grey placeholder text in dark mode.
- Yellow appears only on the Convert button and on selected options. Nothing else yellow.
- Press Tab repeatedly: a clear outline moves to every button, link and field, in a sensible order. The Scenario menu at the top shows an outline too.
- Buttons and links are easy to tap (about a thumb wide).
- At 200% zoom, nothing is lost and you can still use every control.
- History: the delete confirmation opens, and Escape closes it. "Copy prompt" shows "Copied".

**Record it.** Make a file `agent/anti-slop/browser-check-2026-10-31.md` with this table, one row per page and one column per test, writing Pass or a one-line problem. Save screenshots of anything wrong in `agent/anti-slop/evidence/`.

| Page | Phone light | Phone dark | Tablet | Desktop light | Desktop dark | 200% zoom | Keyboard only |
|---|---|---|---|---|---|---|---|
| index.html | | | | | | | |
| login.html | | | | | | | |
| app.html | | | | | | | |
| history.html | | | | | | | |
| models.html | | | | | | | |

Number new problems from 21 (finding 20 already exists). Give the file to me or to a coding agent and ask it to fix them.

## 6. The logo (audit finding 3)

The yellow square with a prompt symbol and the icon file were invented without asking you. Choose one:

**Option 1: name only (simplest, safest).** In each of `index.html`, `login.html`, `app.html`, `history.html` and `models.html`, line 17, replace the whole line with:
```
  <a class="brand" href="index.html" aria-label="Prompt Code home">Prompt Code</a>
```
Then delete line 8, `<link rel="icon" href="favicon.svg" type="image/svg+xml">`, in the same five files, and delete `static/favicon.svg`. Browsers then show a default icon.

**Option 2: keep the mark.** Nothing to change. Say so, and I will record that it was approved.

**Option 3: your own logo.** Replace `static/favicon.svg` with your file. Replace the `<svg>...</svg>` inside the brand link in the five pages with your mark, or an `<img>` of it with an empty `alt` (the link already has a text label).

Note: the current `favicon.svg` is 8 KB because the saved copy holds an embedded provenance (C2PA) metadata block I did not write. It is harmless and gets deleted if you choose Option 1.

If your brand colour is not yellow, the palette in section 7 must be regenerated from the new colour. Tell me the colour.

## 7. The colour palette: apply or skip

Prepared from the colour wheel, with every pairing measured: open `agent/reference/palette.html` in a browser to see it. Full explanation: `agent/docs/PALETTE.md`. Ready-to-use values: `agent/reference/palette-tokens.css`.

In short: yellow accent and cool neutrals tinted toward its opposite on the wheel (a complementary scheme). In light theme almost nothing changes. Warnings become peach so they cannot be mistaken for the yellow action colour. Dark theme panels get a little lighter.

**To apply**, two ways:
- **Ask me** (or a coding agent): "apply the palette to static/css/style.css. Edit the source directly, no patch script." Then redo section 5.
- **By hand.** In `static/css/style.css`:
  1. In the first `:root{ ... }` block, replace the colour lines (`--ground` through `--err-bg`) with the lines under "semantic tokens, light theme" in `palette-tokens.css`. Keep `--display`, `--sans`, `--mono` and `--max`.
  2. In the `@media (prefers-color-scheme:dark)` block just below, replace the colour lines with the dark ones in `palette-tokens.css`.
  3. Add the extra line `--danger-text` (both blocks). In `.btn-danger` and `.field-error`, use `var(--danger-text)` instead of the typed-in reds, and delete the two small dark-mode overrides for them.
  4. Run the tests (section 4). The static checks re-measure contrast with the new values.
  5. Look at both themes (section 5).

A trial on a throwaway copy showed no missing colour token and all 11 static checks passing. Not tried: a real browser.

Why no one-click script: the project's own rule (R-33) forbids changing styles with a find-and-replace script. Edit the source.

## 8. The legal pages (audit finding 2)

The site asks for an email address, so it needs a Terms of Use and a Privacy Policy before real people use it. **I did not write them and will not invent legal text.** You (ideally with someone qualified) must supply the words.

What the Privacy Policy needs to cover for this product:
- What is collected: email address; a sign-in cookie; saved prompts for signed-in people; counters for free tries (stored as hashes).
- **The text of each prompt is sent to a third-party model provider** (whichever providers you use). Say which, and what they do with it.
- The email service that sends sign-in links, and the hosting provider (DigitalOcean, region Brussels or London, to be decided).
- How long things are kept, how a person deletes a prompt, all history, and their account (account deletion is not built yet).
- Cookies. Contact details.
- People in Brussels and London: privacy laws (GDPR and the UK version) probably apply. Get advice.

What the Terms need to cover: acceptable use, the free-try limits, results may be wrong, your own API key is your responsibility, no warranty, and how you can change or end the service.

**To add them:** create `static/terms.html` and `static/privacy.html` (copy `login.html` as a starting layout), link them from the footer of `index.html` and the bottom of `login.html`, add rows to `agent/docs/CODEMAP.md`.

**Until then:** keep demo mode on, do not collect real emails, and say the site is in development.

## 9. Licence, GitHub, push

**Choose a licence.** The Hacktoberfest track requires an open-source one. Common permissive choices are MIT (short) and Apache-2.0 (adds an explicit patent grant). Read the challenge page for its exact rule, and check your dependencies' licences are compatible. Put the full text of your choice in a file named `LICENSE` at the project root, with your name and the year where the text asks. Then change the "Licence" section of `README.md`.

**Create the repository and push.** On GitHub, make a new public repository named `prompt-code` with no README and no licence (you already have them). Then:
```
cd prompt-code
git init -b main
git add -A
git status
git commit -m "Initial commit: interface, tests, agent docs"
git remote add origin https://github.com/<your-username>/prompt-code.git
git push -u origin main
```
Read the `git status` output before committing: it must not list `node_modules`, `.env` or any key. The included `.gitignore` handles that; verified here that no `node_modules` file is staged.

## 10. Build the Rust server

`cargo` was not available where this package was prepared, so **no Rust has been compiled or run**. Any Rust written from this plan is untested until you run `cargo test`.

Start with Option A from `agent/docs/SUBMISSION.md` section 3: a minimal server that makes the landing page real. Steps, each with what "done" means. The detailed design is in `agent/docs/ARCHITECTURE-RUST.md`; the routes and error shapes are in `agent/docs/AUTH-AND-ACCESS.md` section 4.

| # | Task | Done when |
|---|---|---|
| 1 | In the project root run `cargo init --name prompt-code`. Add `axum`, `tokio`, `reqwest`, `serde`, `serde_json`, `thiserror`, `tracing` (check current versions) | `cargo build` succeeds |
| 2 | Settings and errors: `src/config.rs`, `src/error.rs` (list in `agent/skills/tools-config.md`) | The server refuses to start if a required setting is missing, and a test proves it |
| 3 | Serve the `static/` folder from the same address as the API, with the security headers in `AUTH-AND-ACCESS.md` section 6 | `cargo run` shows the interface at http://localhost:8000 and the response headers include the content security policy |
| 4 | The provider trait and **one real adapter**: Gemma through Google's Gemma API (the guide links its docs) or Llama through Groq. Check the model name, free quota and terms first | A test with a fake provider passes, and one real call returns model text |
| 5 | `GET` and `POST /api/try` with the limits: per visitor, per IP, per day, failed tries not counted | The fourth try returns `TRY_LIMIT_REACHED`; a failure does not use up a try |
| 6 | Make demo mode per route, so `/api/try` is real while the rest stays demo (ask me or an agent; today one switch covers everything) | The landing page shows real model output with no "Demo mode" notice |
| 7 | The fallback chain and `GET /api/models` | Tests for timeout, rate limit, server error, empty output, invalid key, all models down |
| 8 | **Option B only:** magic-link sign-in, sessions, `/api/convert`, history | Every test listed in `AUTH-AND-ACCESS.md` section 9 passes |

Before release: set `demo` to `false` in `static/js/config.js`, delete `static/js/demo.js` and its `<script>` lines, and make sure `agent/` is not in the release.

## 11. Submit to Hacktoberfest

Full detail and the links are in `agent/docs/SUBMISSION.md`. The short list:
1. Read the challenge page (link in that file) and note the deadline. The guide you supplied does not give one.
2. Have a real model call working (section 10, step 4).
3. Licence chosen and `LICENSE` added; public repository pushed (section 9).
4. README final: screenshots, install and run steps, which models are used and where the AI runs.
5. Fill in the licence table for each model and library (`SUBMISSION.md` section 5).
6. No keys or personal data in the repository.
7. Submit on the MLH page; publish the DEV write-up (outline in `SUBMISSION.md` section 9). Write only what is true on the day: do not describe demo-only features as working.

## 12. Using a coding agent with this package

Start any agent session with:
```
Read agent/docs/INDEX.md, then agent/docs/STATUS.md, agent/docs/HANDOVER.md,
agent/skills/agents.md and agent/skills/least-assumptions.md.
Do not edit anything under agent/ unless I say so.
Task: <one clear task, for example: build step 4 of START-HERE.md section 10>.
When done, run the tests in tests/ui and tell me what you did, what you
checked, and what you did not check.
```
To find the file for any problem, the agent uses `agent/docs/CODEMAP.md`: its first table says "when this breaks, open this".

## 13. Decisions still open (with a recommendation)

| Decision | Recommendation |
|---|---|
| Option A or B for the submission | A: smaller, and it makes the one thing the track checks real |
| First model and adapter | Gemma through its API, because the guide features it; fall back to Llama through Groq. Check quotas first |
| Licence | MIT or Apache-2.0; your choice |
| Logo | Name only until you have a mark you like (section 6, Option 1) |
| Apply the palette | Yes, after the browser check shows the current look is fine |
| Free-try limits | 3 per visitor, about 800 characters, plus a daily cap; set the cap after you see the provider's limits |
| Email provider and sending domain | A free tier; set up SPF, DKIM and DMARC or links land in spam |
| Region | Brussels or London, whichever your hosting offers [verify] |
| Project name | "Prompt Code" for now. To rename: search for `Prompt Code` and `prompt-code` across the package. `pc_` keys and the cookie name `__Host-pc_session` are internal and can stay |

### Audit status (`agent/anti-slop/`)
- **Fixed:** 1, 4, 5, 6, 7, 9, 13, 16, 18, 19.
- **Yours:** 2 (legal pages), 3 (logo), 8 (real-browser check).
- **Open, optional:** 10 (identical cards), 11 (headline font depends on the device), 12 (arrow on Convert), 14 (a DESIGN.md and style settings), 15 (template section order), 17 (manual theme switch), 20 (loading line during the sign-in check).

## 14. Rules to keep

1. Never ship `static/js/demo.js` or `demo: true`.
2. No API key in the repository, in a log, or in a response. User keys are used once and never stored.
3. The app never reads `agent/`. Do not copy skill text into app code.
4. Edit source directly. No find-and-replace patch scripts for styles or features.
5. Do not state a speed, security or privacy claim you have not built and measured.
6. No third-party requests from the interface (no font servers, no analytics) unless you also update the security policy and the privacy text.
7. Every new colour pairing is measured before it is used.

## 15. What is not verified

- Appearance: nothing was rendered. Layout, colours and the phone view are checked only by code and measurement.
- Rust: not installed here; nothing compiled.
- Every link from the Hacktoberfest guide and the research list: not opened.
- Model names, free quotas and licences: not checked.
- The sample outputs on the landing page are labelled "Illustrative example", not real model output.
- Legal text: none written.

## 16. What to ask me next

Send any of these as one line:
- "Apply the palette." (then do section 5)
- "Fix audit findings 10, 12, 15, 17 and 20."
- "Make demo mode per route so /api/try can be real."
- "Write the Rust provider trait, config and tests for step 2 to 4." (untested until you compile)
- "Draft the DEV write-up from the outline."
- "Here are my browser-check results: ..." (I will number and fix the problems)
- "The logo is Option 1" or "Option 3, here is the file."
- "New accent colour: #......" (I will regenerate the palette)
