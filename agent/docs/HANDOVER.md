# HANDOVER.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

For the next person or agent picking this up.

## What this is
A prompt converter and recommender. A user pastes a rough idea; the app picks the best prompt type (system, power, project, role, chain-of-thought, few-shot, agent) and writes it using an open-weight model. Built in Rust. Free tiers only.

## Start here
To find the right file for a problem or change, open agent/docs/CODEMAP.md and use its "When this breaks" table. For documents, open agent/docs/INDEX.md. It maps every problem to the right document and lists external documentation sources.

## Read in this order
1. STATUS.md: what is done and not.
2. agent/docs/PROJECT-PLAN.md: goal, flow, prompt-type table, free-tier plan, report skeleton.
3. agent/docs/ARCHITECTURE.md: how the parts fit and how to diagnose problems.
3b. ARCHITECTURE-RUST.md: how it is built in Rust.
4. agent/reference/prompt-code-design.html: open in a browser for the interface.
5. agent/skills/agents.md, then agent/skills/least-assumptions.md: working rules.
6. VERSION-CONTROL.md and CI-CD.md before your first commit.

## Where to start
Follow the "Not done" list in STATUS.md from the top. The first useful milestone: `cargo run`, then `POST /api/convert` returns a prompt from one provider.

## Rules to keep
- Open-weight stays the default path (hackathon requirement).
- Server-side keys only. User keys are used per request, never stored or logged.
- Never log prompt text.
- Every fallback is visible to the user.
- No silent fallback after an invalid user key.
- Do not invent model names, limits or prices. Mark [verify].

## Known gaps
- No code exists yet.
- The existing CI/CD pipeline was not inspected.
- The earlier docs use generic file layouts; use the Rust layout in ARCHITECTURE-RUST.md.

## Contacts and access
Fill in before handing over:
- Repository URL: ____
- Hosting account: ____
- Provider key owner: ____
- Where secrets are stored: ____

## First-day checklist
- [ ] Clone repo, install Rust toolchain
- [ ] Copy `.env.example` to `.env`, add a free provider key
- [ ] Run fmt, clippy, tests
- [ ] Read the fallback test list in agent/skills/testing-factory.md

## Research
See agent/docs/REFERENCES.md. All papers there are unverified until someone opens them. Do not cite them in the report before checking.

## Zones: app versus agent
- APP: Rust source, tests, the UI in `static/`, Cargo files. This is what ships.
- AGENT: everything under `agent/`. Read it; never import, bundle or ship it.
- Do not copy skill text into app code. Runtime prompt templates live in `src/core/templates.rs` (planned).
- The UI is in `static/` and runs in demo mode (sample output) until the Rust API exists. To view it, serve that folder with any static file server and open `index.html`.
- Before release: set `demo` to false in `static/js/config.js` and delete `static/js/demo.js`.
- The mockup in `agent/reference/` is superseded.
- Access rules and sign-in design: `agent/docs/AUTH-AND-ACCESS.md`.

## Hacktoberfest submission
See `agent/docs/SUBMISSION.md`. The project is not yet submittable: it needs a real model call, a licence and a public repository.
