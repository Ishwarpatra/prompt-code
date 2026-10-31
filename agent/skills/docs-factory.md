# docs-factory.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Document set
| File | Audience | Content |
|---|---|---|
| README.md | New user or judge | What it is, quick start, screenshots |
| ARCHITECTURE.md | Developers | Diagram, provider layer, fallback chain |
| API.md | Developers | Endpoints, request and response, error codes |
| CONTRIBUTING.md | Contributors | Setup, standards, tests |
| REPORT.md | Judges | Report skeleton from the project docs |

## README outline
1. One-sentence summary. 2. Why open-weight. 3. Quick start (under 5 commands). 4. Configuration table. 5. Screenshots. 6. Limitations. 7. License.

## Rules
- Update docs in the same change as the code.
- Every command in the docs must have been run.
- Plain words; define terms once.
- Mark anything that depends on provider limits as [verify].
