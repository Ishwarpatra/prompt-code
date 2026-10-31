# SUBMISSION.md: Hacktoberfest 2026 Open-Source AI Track

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Source: the "Hacktoberfest 2026 Participant Resource Guide" (DatrixLabs), supplied by the owner. Event: Hacktoberfest Hack Day Bhubaneswar x DatrixLabs, 31 October 2026. The guide transcribes links from promotional cards and slides. Short links may redirect and terms may change. None of the links were opened here. The guide states no submission deadline, so check the challenge page.

## 1. Honest status today
Prompt Code is **not ready to submit yet**. The track asks for a project that genuinely uses an open-source or open-weight model. Today the UI is finished but runs in demo mode, which returns sample output and calls no model. The Rust server and its first real model adapter do not exist. Until one real call works end to end, the project does not meet the main requirement.

## 2. What the guide requires, and where Prompt Code stands
| Requirement (from the guide) | Status | What is needed |
|---|---|---|
| Original project | Yes | |
| Genuinely uses an open-source or open-weight AI model or tool (agent skills, model harnesses, applications) | **Not yet** | Rust provider trait, one real adapter, and the convert route. See section 3 |
| Published on GitHub with an open-source licence | Not done | Choose a licence (section 4), create a public repository, add `LICENSE` |
| README: problem, features, installation, configuration, model details, screenshots, demo instructions, how to run | Drafted | Root `README.md` is drafted. Add screenshots and real install steps once the server runs |
| State whether the AI runs locally, through an API, or on a hosted service | Written | README says: through hosted model APIs; a local model is for development only. Update if that changes |
| No API keys, passwords, personal data or private logs in the repository | Clean so far | A scan found no real keys. Add a secret scan to CI (see `CI-CD.md`) |
| Document the models and tools used | Partly | Name the exact models and versions once chosen. List them in the README |
| Comply with licences of third-party models and libraries | Not done | Fill in the licence table in section 5 |
| Check the current rules and submission instructions | Owner | Read the challenge pages in section 6 first |
| MLH submission page and DEV write-up | Not done | See sections 6 and 8 |

## 3. Shortest honest path to a real submission
Choose one with the owner.

**Option A, minimum:** a Rust server with the provider trait, one real adapter, `/api/try` (limited free try) and `/api/models`. The landing page then works for real. The signed-in pages stay in demo mode or show "coming soon". The README says so plainly.

**Option B, full:** also build sign-in (magic link and email sending), `/api/convert`, history, and sessions, as in `AUTH-AND-ACCESS.md`. Larger, with more to get right.

First adapter, in order of fit [verify each]:
1. Gemma through Google's Gemma API. The guide highlights it and links a quickstart and API docs. Check the model name, free quota and terms.
2. Llama or Qwen through Groq, as already planned.

Either way: set `demo` to false only for the pages whose API exists. Today one flag covers all pages, so Option A needs a small change to make the flag per page or to hide unfinished pages.

## 4. Licence (owner decides)
The challenge requires an open-source licence. Common permissive choices:
- MIT: short and simple.
- Apache-2.0: permissive, with an explicit patent grant.

Check the exact rule on the challenge page, and that the choice is compatible with the licences of your dependencies. The licence file needs the owner's name. It has not been created.

## 5. Third-party licences to record
Open-weight does not mean free of conditions. Read each model's own licence page before redistributing or using commercially.

| Item | Where used | Licence | Checked |
|---|---|---|---|
| Gemma | Model | see Gemma terms [verify] | No |
| Llama | Model | see the model's licence page [verify] | No |
| Qwen | Model | see the model's licence page [verify] | No |
| Mistral | Model | see the model's licence page [verify] | No |
| Rust crates | Server | run `cargo deny check` or similar [verify] | No |
| Fonts | UI | none: system fonts only | Yes |

## 6. Links from the guide (not opened)
| Use | Link |
|---|---|
| Read first: challenge and partner instructions | https://mlh.link/hf26-digitalocean |
| MLH Open-Source AI track | https://www.mlh.com/opensource-ai |
| MLH submission page for the event | https://mlh.link/your-event |
| DEV Hacktoberfest challenge write-up | https://mlh.link/dev-hacktoberfest |
| Gemma quickstart | https://mlh.link/gemma-quickstart |
| Gemma API documentation | https://mlh.link/gemma-docs |
| Gemma beginner guide | https://mlh.link/gemma-beginnerguide |
| Gemma hub, and the Gemma information page | https://mlh.link/gemma, https://hack.mlh.com |
| Gemma Hack Day demo | https://mlh.link/hackdays-gemma-demo |
| DigitalOcean AI starter kit | https://mlh.link/digitalocean-starterkit-h26 |
| DigitalOcean libraries | https://mlh.link/digitalocean-libraries-h26 |
| Hermes one-click deploy (review before using; may cost money) | https://mlh.link/digitalocean-hermes-h26 |
| Account-specific partner offers (sign-in may be needed) | https://hacktoberfest.com/my/promos |
| MLH Code of Conduct | https://mlh.io/code-of-conduct |
| Hack Day feedback | https://mlh.link/gemma-hack-day-feedback |

DevRelay (an MCP developer workflow on one card) is optional and not needed for Prompt Code.

## 7. Costs and promotions
The guide says plainly that promotions are conditional and that cloud and API usage can create charges. Prompt Code's rule is free tiers only, so nothing here depends on credits, prizes or swag. Do not deploy anything from a promotional link until its price, permissions and expiry are clear.

## 8. Checklist
- [ ] Read the challenge page and note the deadline: ____
- [ ] Choose the first model and adapter
- [ ] Rust server: config, provider trait, one real adapter, `/api/try`, `/api/models`
- [ ] A real model call works end to end
- [ ] Choose a licence, add `LICENSE`, create the public repository
- [ ] Add `.env.example`; confirm no secrets are committed; add a secret scan to CI
- [ ] Fill in the licence table (section 5)
- [ ] README final: screenshots, install and run steps, models used, where the AI runs
- [ ] Demo mode off for finished pages, and clearly labelled for any that remain
- [ ] Test on a clean machine from the README steps alone
- [ ] Submit on the MLH page
- [ ] Publish the DEV write-up

## 9. DEV write-up outline
1. The problem: people write weak prompts.
2. What Prompt Code does, with a short example.
3. How open-weight models are used: which models, for classifying and rewriting, with fallbacks.
4. How it is built: Rust, plain HTML and JavaScript, strict security policy, magic-link sign-in, limited free try.
5. What went wrong and what was learned. Only real events.
6. What is not built yet.
7. Links: repository, licence, models and their licences.

Write only what is true on the day. Do not describe features that are demo-only as working.
