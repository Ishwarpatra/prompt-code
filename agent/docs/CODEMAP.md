# CODEMAP.md: Project File Map

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Purpose: go straight to the right file. Read the "When this breaks" table first, then open only the file it names.

Status key: **exists** = file is in the project now. **planned** = from the Rust design in ARCHITECTURE-RUST.md; no code written yet. Update the status when a file is created.

Paths are relative to the project root. This map works for any file type; add a row for each new file whatever its language.

## 0. Zones
- **APP**: ships with the product: Rust source, tests, the UI in `static/`, Cargo files.
- **AGENT**: for agents and maintainers only: everything under `agent/`. Never imported, bundled or read by the app.
Prompt-making resources (skills, templates, references) are AGENT. The prompts the app sends to models are APP, in code.

## 1. When this breaks, open this

| Problem | Open first | Then |
|---|---|---|
| App will not start, missing setting | src/config.rs (planned) | agent/skills/tools-config.md |
| Wrong error code or message to user | src/error.rs (planned) | agent/skills/api-design-factory.md |
| /api/convert returns bad request | src/api/convert.rs (planned) | agent/skills/api-design-factory.md |
| Wrong prompt type recommended | src/core/classifier.rs, src/core/type_map.rs (planned) | agent/skills/prompt-templates.md |
| Output missing sections or empty | src/core/validator.rs (planned) | agent/skills/prompt-templates.md |
| Prompt text badly written | src/core/rewriter.rs, src/core/templates.rs (planned) | agent/skills/prompt-templates.md (agent copy; the code is the source of truth) |
| Always falling back to a backup model | src/fallback.rs (planned) | agent/docs/ARCHITECTURE-RUST.md section 7 |
| One provider fails or times out | src/providers/<name>.rs (planned) | agent/docs/ARCHITECTURE.md section 6 |
| New model or provider to add | src/providers/mod.rs, one new adapter (planned) | agent/skills/tools-config.md |
| Rate limit (429) storms | src/fallback.rs, config limits (planned) | agent/docs/ARCHITECTURE-RUST.md section 11 |
| History not saving or loading | src/storage/ (planned) | agent/skills/db-skills.md |
| Given a website link as a design reference | agent/docs/DESIGN-EXTRACTION.md | agent/docs/LANDING-PAGE.md |
| Changing or checking colours | agent/docs/PALETTE.md | agent/reference/palette-tokens.css, static/css/style.css |
| Page looks wrong or breaks on mobile | static/css/style.css, then the page's HTML | agent/skills/frontend-skills.md |
| Sign-in link problems | static/js/login.js; src/api/auth.rs, src/auth/ (planned) | agent/docs/AUTH-AND-ACCESS.md section 3 |
| Free try limit wrong | static/js/landing.js; src/api/free_try.rs (planned) | agent/docs/AUTH-AND-ACCESS.md section 2 |
| UI shows sample output instead of real results | static/js/config.js (demo flag) | agent/docs/AUTH-AND-ACCESS.md section 8 |
| Key appears in logs or code | src/config.rs, logging setup (planned) | agent/skills/security-skills.md |
| CI failing | CI config in repo (not seen) | agent/docs/CI-CD.md |
| Deploy failed | deploy config (not seen) | agent/skills/deployment-factory.md |
| Not sure what is done | agent/docs/STATUS.md | agent/docs/HANDOVER.md |

## 2. Source files (Rust, planned) [zone: APP]

| Path | Status | Purpose | Depends on | Tests | Explained in |
|---|---|---|---|---|---|
| src/main.rs | planned | Start server, load config, build router | config, api, fallback | tests/api_* | ARCHITECTURE-RUST.md s3 |
| src/config.rs | planned | Read and validate environment variables; fail fast | none | tests/config_* | agent/skills/tools-config.md |
| src/error.rs | planned | AppError, ProviderError, mapping to API error shape | none | tests/error_* | ARCHITECTURE-RUST.md s6 |
| src/api/convert.rs | planned | POST /api/convert: validate input, call orchestrator | core, fallback, error | tests/api_convert | agent/skills/api-design-factory.md |
| src/api/auth.rs | planned | request-link, verify, logout, me | auth, error | tests/auth_* | agent/docs/AUTH-AND-ACCESS.md |
| src/api/free_try.rs | planned | Anonymous limited try with per-visitor, per-IP and daily limits | core, auth | tests/free_try_* | agent/docs/AUTH-AND-ACCESS.md |
| src/api/models.rs | planned | GET /api/models with live status in fallback order | fallback | tests/api_models | agent/docs/AUTH-AND-ACCESS.md |
| src/auth/mod.rs | planned | One-time tokens (hashed), sessions, rate limits | storage, config | tests/auth_* | agent/docs/AUTH-AND-ACCESS.md |
| src/auth/mailer.rs | planned | Sends the sign-in email through the chosen provider | config | mocked provider tests | agent/docs/AUTH-AND-ACCESS.md |
| src/api/history.rs | planned | GET and DELETE history routes | storage | tests/api_history | agent/skills/api-design-factory.md |
| src/api/health.rs | planned | GET /api/health: provider status | fallback | tests/api_health | agent/docs/ARCHITECTURE.md s2 |
| src/core/classifier.rs | planned | Classify the task from the idea | providers via fallback | tests/classifier_* | agent/skills/prompt-templates.md |
| src/core/type_map.rs | planned | Task category to prompt type table | none | tests/type_map_* | agent/docs/PROJECT-PLAN.md s3 |
| src/core/rewriter.rs | planned | Build rewrite request from templates | type_map | tests/rewriter_* | agent/skills/prompt-templates.md |
| src/core/templates.rs | planned | Runtime prompt templates sent to models (source of truth) | none | tests/templates_* | agent/skills/prompt-templates.md (agent copy) |
| src/core/validator.rs | planned | Check output is non-empty, sized, has sections | none | tests/validator_* | agent/docs/ARCHITECTURE.md s3 |
| src/providers/mod.rs | planned | Provider trait, GenRequest, GenResponse | error | tests/provider_* | ARCHITECTURE-RUST.md s5 |
| src/providers/groq.rs | planned | Groq adapter (primary) | mod.rs | tests/provider_groq | agent/skills/tools-config.md |
| src/providers/huggingface.rs | planned | Hugging Face adapter (fallback) | mod.rs | tests/provider_hf | agent/skills/tools-config.md |
| src/providers/openrouter.rs | planned | OpenRouter adapter (fallback) | mod.rs | tests/provider_or | ARCHITECTURE-RUST.md s11 |
| src/providers/user_key.rs | planned | OpenAI or Gemini with the user's own key; key kept per request only | mod.rs | tests/provider_userkey | agent/skills/security-skills.md |
| src/fallback.rs | planned | Provider order, retries, health, cooldown | providers | tests/fallback_* | ARCHITECTURE-RUST.md s7 |
| src/storage/mod.rs | planned | History persistence | config | tests/storage_* | agent/skills/db-skills.md |
| static/ | exists | The UI. See section 2b | API | tests/ui | agent/docs/LANDING-PAGE.md |
| tests/ | planned | Unit, API and fallback tests; providers mocked | all | n/a | agent/skills/testing-factory.md |
| Cargo.toml, Cargo.lock | planned | Dependencies and version | none | n/a | agent/docs/VERSION-CONTROL.md |
| .env.example | planned | Names of settings, no secrets | none | n/a | agent/skills/tools-config.md |

## 2b. UI files (exist now) [zone: APP]
All plain HTML, CSS and JavaScript. No inline scripts or styles, so a strict content security policy works.

| Path | Purpose | Notes |
|---|---|---|
| static/index.html | Landing page with the limited free try | Calls GET and POST /api/try |
| static/login.html | Email magic-link sign-in: request, sent, signing in, error | Reads #token from the address bar |
| static/app.html | Converter (signed in) | POST /api/convert; refine |
| static/history.html | Saved prompts: copy, delete one, delete all | GET and DELETE /api/history |
| static/models.html | Model order and status; own-key form | GET /api/models; key kept in tab |
| static/css/style.css | All styling and design tokens, light and dark | |
| static/js/config.js | demo flag, link lifetime, resend wait | Set demo to false for release |
| static/js/types.js | Prompt types and example ideas | |
| static/js/demo.js | Sample backend for design review | Must not ship. Inert when demo is false |
| static/js/api.js | One door for all server calls | Same result shape in demo and real mode |
| static/js/common.js | Helpers: banners, result card, copy, session check, demo bar | Uses textContent only |
| static/js/landing.js, login.js, app.js, history.js, models.js | One script per page | |
| static/favicon.svg | Icon | |
| tests/ui/ | UI tests (Node, jsdom). 41 tests (11 static, 11 demo backend, 19 page), all passing at time of writing | Dev only; see tests/ui/README.md |

## 3. Documents and design (exist now) [zone: AGENT]

| Path | Status | What it holds |
|---|---|---|
| agent/docs/PROJECT-PLAN.md | exists | Goal, flow, prompt-type table, free-tier plan, report skeleton |
| agent/reference/prompt-code-design.html | exists | Older interface mockup. Superseded by the UI in static/; kept for history |
| START-HERE.md | exists | Step-by-step guide: run it, test it, browser check, logo, palette, legal pages, GitHub, Rust build order, submission |
| .gitignore | exists | Keeps node_modules, target, .env and databases out of git |
| README.md | exists | Public README: status, what runs, how to run, layout and rules |
| agent/README.md | exists | Entry point for agents |
| agent/docs/INDEX.md | exists | Problem-to-document map and external documentation |
| agent/docs/DESIGN-EXTRACTION.md | exists | Tools and steps for learning a layout from a website link; keep structure, replace surface |
| agent/docs/AUTH-AND-ACCESS.md | exists | Access levels, free-try rules, magic-link sign-in, API contract, security headers, demo mode |
| agent/anti-slop/audit-001-2026-10-31.md | exists | Anti Slop audit of the UI: 19 numbered findings |
| agent/anti-slop/followup-001-2026-10-31.md | exists | Fixes applied from the audit (10 findings), checks re-run, what is still open |
| agent/docs/SUBMISSION.md | exists | Hacktoberfest track requirements, honest readiness, licence options, checklist, event links |
| agent/docs/PALETTE.md | exists | Colour palette from the wheel, measured; prepared, not applied to static/ |
| agent/reference/palette.html | exists | Visual wheel, scales and tokens (agent reference, open in a browser) |
| agent/reference/palette-tokens.css | exists | Drop-in colour tokens for static/css/style.css; not applied |
| agent/docs/LANDING-PAGE.md | exists | Landing page plan based on the owner's reference site; page not built |
| agent/docs/CODEMAP.md | exists | This file |
| agent/docs/ARCHITECTURE.md | exists | Components, request flow, failure table, troubleshooting |
| agent/docs/ARCHITECTURE-RUST.md | exists | Rust layout, crates, trait, errors, fallback, gateway |
| agent/docs/STATUS.md | exists | Done, not done, decisions, risks |
| agent/docs/HANDOVER.md | exists | Takeover guide |
| agent/docs/VERSION-CONTROL.md | exists | Branching, commits, versions |
| agent/docs/CI-CD.md | exists | Pipeline checklist |
| agent/docs/REFERENCES.md | exists | Papers and resources, with verification status |

## 4. Skill files (exist now) [zone: AGENT]

| Path | Open when |
|---|---|
| agent/skills/agents.md | Starting work; roles and handoff format |
| agent/skills/orchestration.md | Planning stages and gates |
| agent/skills/architecture-skills.md | Making a structural decision |
| agent/skills/least-assumptions.md | Something is unclear |
| agent/skills/coding-standards.md | Writing or reviewing code |
| agent/skills/frontend-skills.md | Working on the interface |
| agent/skills/db-skills.md | Touching storage or schema |
| agent/skills/api-design-factory.md | Changing an endpoint or error shape |
| agent/skills/refactoring-skills.md | Restructuring code |
| agent/skills/testing-factory.md | Writing tests; required fallback cases |
| agent/skills/debugging-skills.md | Chasing a bug |
| agent/skills/performance-skills.md | Something is slow |
| agent/skills/security-skills.md | Keys, input, dependencies |
| agent/skills/adversarial-review.md | Reviewing a change |
| agent/skills/deployment-factory.md | Releasing or rolling back |
| agent/skills/docs-factory.md | Writing or updating docs |
| agent/skills/prompt-templates.md | Editing the prompts the app uses |
| agent/skills/tools-config.md | Settings and provider list |

## 5. Not yet built
- Landing page: built as static/index.html (demo mode). Planning notes are in agent/docs/LANDING-PAGE.md.
- App Resources section: planned; see agent/docs/REFERENCES.md section 8.
- CI/CD pipeline files: reported as in place but not seen; add their paths here once located.

## 6. Keeping this map true
1. Add or change a row in the same change that adds, moves or deletes a file.
2. Change "planned" to "exists" when the file is created.
3. Keep each purpose to one line; link to a doc for detail.
4. Recommended check in CI: a small script that fails if any path listed here as "exists" is missing from the repository.
5. Optional, alongside this file: a generated repo map (as Aider and similar tools produce) listing symbols per file. Do not replace this hand-written map with it; the map explains why, the generated one lists what.
6. Never put secrets, keys or user data in this file.
