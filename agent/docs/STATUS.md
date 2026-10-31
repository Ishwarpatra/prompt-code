# STATUS.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Last updated: 31 Oct 2026

## Summary
Planning, design and the UI are done; the UI runs in demo mode. The Rust server has not been written. Rust is the chosen implementation language, for security.

## Done
| Item | File | Notes |
|---|---|---|
| Project plan, flow, architecture | agent/docs/PROJECT-PLAN.md | Language-neutral; Rust details in ARCHITECTURE-RUST.md |
| Interface reference design | agent/reference/prompt-code-design.html | Converter, fallback, error and empty states, light and dark |
| 18 agent skill files | prompt-code.zip | Core, engineering, quality, operations |
| Rust architecture, errors, fallback | ARCHITECTURE-RUST.md | Design only, code sketches untested |
| Version control and CI/CD plan | VERSION-CONTROL.md, CI-CD.md | See note below |
| Handover | HANDOVER.md | |

## Not done
- [ ] Repository created and first commit
- [ ] Rust project scaffold
- [ ] Provider trait and first adapter
- [ ] Convert endpoint, classifier, validator
- [ ] Fallback chain and its tests
- [ ] Build the Rust API that the UI calls (contract: AUTH-AND-ACCESS.md section 4)
- [ ] History storage
- [ ] Final report and demo or screenshots
- [ ] "Resources" section in the app and "References" in the report (GitHub skill repositories)

## Unverified
- The CI/CD pipeline was described by the owner as already in place. I have not seen it. CI-CD.md is a checklist to compare against it.
- All provider limits, model names and crate versions are marked [verify].
- GitHub resources were gathered from one search; details were not opened or confirmed.

## Decisions made
| Decision | Choice |
|---|---|
| Language | Rust |
| Default model path | Open-weight (Llama, Gemma, Qwen or Mistral) |
| Optional models | User's own OpenAI or Gemini key |
| Cost | Free tiers only |
| Hosting | May not host; a report is the fallback deliverable |

## Open questions
1. Project name: Prompt Code, as stated by the owner. Confirm the spelling.
2. Email provider and sending domain for sign-in links; free-try limits; session length.
3. Hosted demo, or local run plus report?

## Risks
- Free-tier rate limits during a demo.
- Small models drifting off format.
- Rust build time on free CI runners.

## Update
- Added gateway and proxy-model design (ARCHITECTURE-RUST.md, section 11). Default is the app's own fallback chain. LiteLLM and OpenRouter details come from one search and are unverified [verify].
- Open decision: own chain only, or add a LiteLLM proxy.

## Update: documentation
- Added agent/docs/ARCHITECTURE.md (system reference and troubleshooting guide) and agent/docs/INDEX.md (map for people and LLMs, with external documentation sources).
- Landing page: references gathered (show the product in the hero, minimal meaningful motion, accessible, dark and light themes). Not built; design only if requested.
- Offline docs tools identified: DevDocs, Zeal, Dash, plus cargo doc for Rust crates. Unverified beyond one search.

## Update: references
- Added agent/docs/REFERENCES.md with the supplied papers (unverified), GitHub skill resources, and how the research shaped decisions.
- Still to do: open each paper and confirm details; add a Resources section to the app; cite verified sources in the report.

## Update: references checked
- Confirmed four papers (Xu and Yan survey, SAGE, Harmful Skills, SkillOps). Corrected a wrong title, a wrong link, and one misdescribed claim. Details in agent/docs/REFERENCES.md sections 1 and 2.
- Still unconfirmed: two surveys (preprints.org, Google Research), Skill-Pro, PolySkill, the two paper lists.
- Next: read the confirmed papers before citing; add the Resources section to the app.

## Update: survey confirmed
- Confirmed the preprints.org survey (six-layer taxonomy). Five papers now confirmed. Skill-Pro is real but its own paper is unopened.
- Still unconfirmed: Google Research survey, SSRN item, PolySkill, the Awesome-Skills-Paper list.

## Update: code map
- Added agent/docs/CODEMAP.md: problem-to-file table, planned Rust file map, existing docs and skills, and upkeep rules. Source files are marked planned because no code exists yet.
- To do: update the map as files are created; add a CI check that listed paths exist; add the CI/CD config paths once located.

## Update: design references
- Added REFERENCES.md sections 10 to 12: open-source component libraries, curated lists, accessibility tools, rules for using references, a borrowing-log template, and report guidance. All entries unverified; licences not checked.

## Update: naming and boundary
- Project renamed Prompt Code (all files). Spelling to be confirmed.
- All agent material now lives under `agent/` (docs, skills, reference). The Rust app, tests and the UI in `static/` stay outside it. See README.md.
- The old mockup is superseded by the UI built in `static/` (see the update below).
- Runtime prompt templates belong in app code (`src/core/templates.rs`, planned). The skill file `prompt-templates.md` is an agent-side description. Code wins on any difference. Owner has not yet confirmed this split.

## Update: inspiration galleries
- Added eight design galleries supplied by the owner to REFERENCES.md section 10.5. Unopened; terms not checked. Reference and comparison only.

## Update: landing page reference
- Owner supplied brik.space/home as the target look. Read as text only; visuals not seen.
- Added agent/docs/LANDING-PAGE.md (plan, accessibility rules, open questions). No page built.
- Needed from owner: screenshots of the reference (desktop and phone), and approval of copy (the UI folder question is settled: it is `static/`).

## Update: reference screenshots reviewed
- Four screenshots of the reference reviewed. Colours measured and contrast checked; recorded in LANDING-PAGE.md section 2. Screenshots are not stored in the repository.
- Decision: principles only, with Prompt Code's own colours and type (as built).
- Still needed: who writes the real example cards.

## Update: design extraction note
- Added DESIGN-EXTRACTION.md: candidate open-source tools (unverified, not run), keep-versus-replace table, workflow, design brief template, safety notes.
- Owner clarified the goal: copy layout and style principles only, not exact content.
- To do: run one extractor on the reference page; confirm licences and install steps.

## Update: UI built, access model decided
- Owner clarified there was no UI yet, and that the free landing try must be limited, with sign-in required for real work, using email only and magic links.
- Built in `static/`: landing page (limited free try), sign-in, converter (with refine), history, models (with own-key form). Plain HTML, CSS and JavaScript; light and dark themes; own colours and system fonts. No inline scripts or styles.
- Runs in demo mode: sample output only, with a visible notice. A Scenario menu shows the backup, all-fail, rate-limit, invalid-key, network and expired-link states.
- Tests run and passing: 11 demo-backend tests and 15 simulated-browser page tests (`tests/ui`). Structure, label, link and contrast checks passed (all text pairs at least 4.5:1, borders at least 3:1).
- Written: `AUTH-AND-ACCESS.md` (rules, API contract, security headers, tests the server needs, open decisions). Updated the skill files and CI notes to match.
- Not done: the Rust API and email sending; real example outputs; manual screen-reader, phone and 200% zoom checks; privacy notice; free-try limits; email provider; hosting region (DigitalOcean, Brussels or London).
- Project name is "Prompt Code" for now and may change before release; see AUTH-AND-ACCESS.md section 10 for how to rename.

## Update: Hacktoberfest guide read
- Owner supplied the Hacktoberfest 2026 participant guide (Open-Source AI track, Hack Day Bhubaneswar, 31 Oct 2026). Written up in SUBMISSION.md.
- Finding: the project is not yet submittable. The track needs real use of an open-weight model; the UI is demo-only and the Rust server does not exist.
- Gemma added to the model list in the UI, demo backend, tests and docs (order: Llama, Gemma, Qwen, Mistral; order is the owner's call).
- Root README rewritten for GitHub, with an honest status table and placeholders for screenshots, models and licence.
- Test fake keys renamed so secret scanners do not flag them. A secret-pattern scan found no real keys.
- Blocking decisions for the owner: licence, which model and adapter first, Option A or B in SUBMISSION.md section 3, the submission deadline.

## Update: UI audit
- Anti Slop audit run in AFTER mode on `static/`: `agent/anti-slop/audit-001-2026-10-31.md`. 19 findings (8 HIGH, 6 MEDIUM, 5 LOW). Nothing fixed yet; waiting for the owner to choose numbers.
- Needs the owner: 2 (legal pages), 3 (logo), 8 (real-browser check), 11 (font), 17 (theme toggle).

## Update: audit fixes
- Fixed audit findings 1, 4, 5, 6, 7, 9, 13, 16, 18 and 19. Report: `agent/anti-slop/followup-001-2026-10-31.md`.
- Tests: 41 passing (11 static checks guarding the fixes, 11 demo backend, 19 simulated-browser pages).
- Still open: 2 (legal pages), 3 (logo), 8 (real-browser check), 10, 11, 12, 14, 15, 17, plus new finding 20.
- The pages have still never been rendered in a real browser. Layout fixes (7) are confirmed by code checks only.

## Update: palette
- Owner is working on audit findings 2 (legal pages), 3 (logo) and 8 (real-browser check).
- Colour palette prepared from the colour wheel: `agent/docs/PALETTE.md`, `agent/reference/palette.html`, `agent/reference/palette-tokens.css`. Complementary scheme (yellow accent, tinted cool neutrals), six 11-step scales, light and dark tokens, every pairing measured with the skill checker (all pass).
- Not applied to `static/`. A trial on a throwaway copy left no undefined tokens and passed all 11 static checks. Applying needs the owner's approval, and a look in a real browser.
- If the logo or brand colour changes (finding 3), regenerate the palette from the new accent.

## Update: Rust backend and palette applied
- Palette tokens applied directly to `static/css/style.css` (semantic light and dark scales, `--danger-text`).
- Rust backend scaffolded with Axum 0.8 in `src/` (`main.rs`, `config.rs`, `error.rs`, `classifier.rs`, `models.rs`).
- Gemma set as the default open-weight model path (`gemma-4-31b-it`), with `gemma-4-26b-a4b-it` as open-weight fallback. External providers (OpenAI, Gemini) opt-in via server environment variables or per-request user keys.
- Input validation, rate-limiting per visitor/IP, error envelopes, and security headers (CSP, nosniff, no-referrer) configured.
- Static assets served via Axum fallback service.
- 6 focused unit tests implemented and passing: intent classification, design prompt specialization, code-audit specialization, rate-limiting after quota, health/model visibility, and safe empty/long input rejection.
- `cargo fmt --check` and `cargo clippy -- -D warnings` green; `cargo build --release` succeeded.
- All 41 UI tests pass (11 static checks, 11 demo tests, 19 page tests).
- Containerization and deployment artifacts created: `Dockerfile`, `.do/app.yaml`, `.env.example`.
