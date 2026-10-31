# orchestration.md: How Work Flows

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Pipeline
Plan -> Design -> Build -> Test -> Review -> Document -> Deploy

## Stage gates
| Stage | Exit condition |
|---|---|
| Plan | Each task has an acceptance check a person could verify |
| Design | Interfaces named; provider contract unchanged or change noted |
| Build | Compiles, lints clean, task acceptance check met |
| Test | Unit and fallback tests pass |
| Review | No open high or medium findings |
| Document | README and API notes match the code |
| Deploy | CI green, rollback tested |

## Rules
- Run agents in sequence for dependent work; in parallel only for independent files.
- If a gate fails, return to the earliest stage that caused the failure.
- Limit retries: two attempts at the same fix, then stop and report.
- Keep a short running log: task, owner, status, blocker.

## Prompt Code runtime orchestration (the app itself)
1. Validate input -> 2. Classify task -> 3. Pick prompt type -> 4. Write prompt -> 5. Validate output.
On failure at step 2 or 4, follow the fallback chain in the docs. Always surface which model answered.
