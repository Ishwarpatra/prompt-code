# Prompt Code

Turn a rough idea into a prompt that works. Prompt Code reads what you want to build, recommends the right prompt type (system, role, step-by-step, agent, few-shot, project or power), and writes it, using open-weight models.

Built in Rust for the Hacktoberfest 2026 Open-Source AI track.

New here? Read `START-HERE.md`: what works, and exactly what to do next.

## Status
Active build. Verified parts:

| Part | State |
|---|---|
| Web UI (landing, sign-in, convert, history, models) | Built. Fully responsive, WCAG-compliant, demo and API-ready |
| Palette and Typography | Harmonized high-contrast system applied to `static/css/style.css` |
| Rust Server (Axum 0.8) | Built with Gemma default (`gemma-4-31b-it`), fallback routing, and CSP headers |
| Model Routing | Gemma default open-weight; external APIs (OpenAI/Gemini) opt-in |
| Automated UI Tests | 41 passing (11 static checks, 11 demo backend, 19 page interactions) |
| Automated Rust Tests | 6 passing (intent classification, prompt specializations, rate limiting, health) |
| Deployment Specs | `Dockerfile` and DigitalOcean App Platform (`.do/app.yaml`) configured |

This README will be updated as each part becomes real. Do not treat demo output as model output.

## What it will do
- Free, limited try on the landing page; sign in with your email (one-time link, no password) for more.
- Recommends a prompt type and says why.
- Open-weight models answer by default; if one is busy, the next takes over, and the result says which model answered.
- Refine a result, keep a history, choose the model, or bring your own key.

## Where the AI runs
Planned: through hosted model APIs (an open-weight model such as Gemma, Llama, Qwen or Mistral, served by a provider). A local model can be used during development. The exact models will be listed here once chosen [to be filled in].

## Models and licences
To be filled in with exact model names, versions and licence links. Open-weight models have their own terms; read them before reusing. See `agent/docs/SUBMISSION.md` section 5.

## Run the UI demo
Requires nothing but a static file server and a browser.

```
cd static
python3 -m http.server 8000
```
Open http://localhost:8000. A Scenario menu at the top shows the busy, failure, rate-limit and expired-link states. To sign in during the demo, enter any email, then press "Open the sign-in link".

## Run the UI tests
Node 20 or later.

```
cd tests/ui
npm install
npm test
```
These test the UI in demo mode. They do not test the Rust server.

## Deployment
Prompt Code is ready to deploy on **DigitalOcean**:
- **DigitalOcean App Platform**: Fully managed PaaS with zero server maintenance. See [`.do/app.yaml`](.do/app.yaml) and the full [Deployment Guide](DEPLOYMENT.md).
- **DigitalOcean Droplet**: Multi-stage [`Dockerfile`](Dockerfile) and [`docker-compose.yml`](docker-compose.yml) ready for one-command Docker launch.

## Configuration
Settings for the planned server are listed in `agent/skills/tools-config.md`. Keys go in environment variables, never in the repository. A `.env.example` file will be added with the server.

## Screenshots
[to be added]

## Project layout and rules
```
prompt-code/
  Cargo.toml, Cargo.lock      APP    (planned)
  src/                        APP    Rust source (planned)
  tests/                      APP    Rust tests (planned)
    ui/                       APP    UI tests (Node, dev only; exist)
  static/                     APP    the UI (plain HTML, CSS, JS)
  agent/                      AGENT-ONLY
    README.md
    docs/                     plan, architecture, status, handover, code map, references, submission
    skills/                   18 skill files for coding agents
    reference/                older design mockup (superseded)
```

1. The app is Rust. Everything it needs to run is outside `agent/`.
2. `agent/` is for coding agents and maintainers. The app never imports, bundles or reads it, at build time or runtime. Release builds exclude it.
3. Prompt-making resources (skills, templates, references) are agent material. The prompts the app sends to models live in app code (`src/core/templates.rs`, planned). The skill file describing them may lag; the code wins.
4. The UI in `static/` is the app's interface. The older mockup in `agent/reference/` is superseded and kept for history.
5. `static/js/demo.js` and `demo: true` are for design review only. Release builds remove them.
6. No secrets in either zone.
7. Start at `agent/docs/INDEX.md`. To find the file for a problem, use `agent/docs/CODEMAP.md`. For who can do what and how sign-in works, see `agent/docs/AUTH-AND-ACCESS.md`. For the Hacktoberfest submission, see `agent/docs/SUBMISSION.md`.

## Responsible use
Layout ideas were studied from public sites; no assets, wording, colours or fonts were copied. The UI uses system fonts and makes no third-party requests.

## Licence
MIT License. See [LICENSE](LICENSE) for the full text.

## Acknowledgements
Hacktoberfest 2026, MLH, DigitalOcean and Google (Gemma) are named in the participant guide that shaped the submission checklist. Prompt Code is not affiliated with them.
