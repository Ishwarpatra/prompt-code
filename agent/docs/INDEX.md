# INDEX.md: Documentation Map (read this first)

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Written so a person or an LLM can find the right document for a problem. Each entry says what is inside and when to open it. Paths are relative to the project root.

## How to use this index (for LLM agents)
1. Match the problem to a row below.
2. Open that file and read the named section only.
3. If the answer is not there, say so. Do not guess (see agent/skills/least-assumptions.md).
4. For anything about a language or library, use the external documentation list at the end rather than memory.

## Project documents
| Problem or question | Open | Section |
|---|---|---|
| Where do I begin; what exactly do I do with this package? | START-HERE.md | all |
| What is the app and what is agent-only? | README.md | all |
| What is this project and how does it flow? | agent/docs/PROJECT-PLAN.md | 1, 2 |
| How do the parts fit together? | agent/docs/ARCHITECTURE.md | 2, 3, 4 |
| Something broke; which layer? | agent/docs/ARCHITECTURE.md | 6 |
| How is it built in Rust, crates, trait, errors? | agent/docs/ARCHITECTURE-RUST.md | 3 to 8 |
| Fallback, gateway, proxy models | agent/docs/ARCHITECTURE-RUST.md | 7, 11 |
| Endpoint shapes and error codes | agent/skills/api-design-factory.md | all |
| Environment variables and provider list | agent/skills/tools-config.md | all |
| Prompt templates the app uses | agent/skills/prompt-templates.md | all |
| Which tests are required? | agent/skills/testing-factory.md | Required fallback cases |
| Security rules | agent/skills/security-skills.md | all |
| Branching, commits, versions | agent/docs/VERSION-CONTROL.md | all |
| CI/CD steps | agent/docs/CI-CD.md | all |
| What is done and not done | agent/docs/STATUS.md | all |
| Taking over the project | agent/docs/HANDOVER.md | all |
| Papers, sources, citations for the report | agent/docs/REFERENCES.md | 1 to 9 |
| Design references, licences, borrowing log | agent/docs/REFERENCES.md | 10 to 12 |
| Which file to open for a problem or change | agent/docs/CODEMAP.md | section 1 |
| Turning a reference website link into a design brief | agent/docs/DESIGN-EXTRACTION.md | all |
| Who can do what; free try; email sign-in; API contract; security headers | agent/docs/AUTH-AND-ACCESS.md | all |
| UI audit findings (numbered, pick which to fix) | agent/anti-slop/audit-001-2026-10-31.md | all |
| Colour palette from the colour wheel: scales, tokens, contrast, harmonies | agent/docs/PALETTE.md | all |
| What was fixed from the audit, and what is still open | agent/anti-slop/followup-001-2026-10-31.md | all |
| Hacktoberfest requirements, readiness, licence, checklist, links | agent/docs/SUBMISSION.md | all |
| Landing page plan and reference | agent/docs/LANDING-PAGE.md | all |
| Interface look and states | static/index.html and the other pages in static/ | serve the folder and open index.html |
| Frontend rules | agent/skills/frontend-skills.md | all |
| Database schema | agent/skills/db-skills.md | all |
| How agents should work | agent/skills/agents.md, agent/skills/orchestration.md | all |

## Reading order for a new agent
STATUS, HANDOVER, CODEMAP, ARCHITECTURE, ARCHITECTURE-RUST, then the skill file for your task.

## External documentation (use these, not memory)
| Topic | Source | Offline option |
|---|---|---|
| Rust language | The Rust Book and std docs at doc.rust-lang.org | rustup doc --open |
| Rust crates in this project | docs.rs for each crate | cargo doc --open |
| HTML, CSS, JavaScript, Python and many more | DevDocs (devdocs.io) | DevDocs offline mode |
| 200+ languages and tools | Zeal (Windows, Linux) or Dash (Mac) | Docsets, offline |
| Agent skills format (SKILL.md) | github.com/agentskills/agentskills | clone the repo |
| Example skills | github.com/anthropics/skills, github.com/addyosmani/agent-skills | clone the repos |
| Model fallback and gateways | LiteLLM docs (docs.litellm.ai), OpenRouter docs (openrouter.ai/docs) | none [verify] |

These sources came from searches and have not all been opened and confirmed [verify].

## Keeping docs readable by LLMs
- Plain markdown, short sections, descriptive headings.
- One topic per file; link instead of copying.
- Tables for lookups, prose for reasons.
- Update docs in the same change as the code.
- Mark unknowns as [verify]; never invent limits, versions or model ids.
- Keep this index current: add a row whenever a document is added.
