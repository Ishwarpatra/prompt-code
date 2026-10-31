# agents.md: Agent Roles for Prompt Code

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Project: prompt converter and recommender. Open-weight models are the default engine. Free tiers only.

## Roles

| Agent | Job | Reads | Writes |
|---|---|---|---|
| Planner | Breaks a request into small tasks with acceptance checks | Request, docs | Task list |
| Architect | Decides structure, interfaces, boundaries | Task list, architecture-skills.md | Design note |
| Builder | Implements one task at a time | Design note, coding-standards.md | Code, tests |
| Tester | Writes and runs tests, including fallback tests | Code, testing-factory.md | Test results |
| Reviewer | Finds defects and risks (see adversarial-review.md) | Diff, security-skills.md | Findings list |
| Documenter | Keeps README, API docs, report current | Diff, docs-factory.md | Docs |
| Deployer | Handles CI/CD and release | deployment-factory.md | Release notes |

## Rules for every agent
1. Follow least-assumptions.md. Ask or state the assumption; never guess silently.
2. Work on one task at a time. Finish and verify before starting the next.
3. Change only what the task needs. No drive-by edits.
4. Report what you did, what you checked, and what you did not check.
5. Never log or commit API keys or user prompt text.
6. Open-weight must stay the default model path.

## Handoff format
```
Task: <id and one line>
Done: <what changed, files>
Checked: <tests run, results>
Not checked: <known gaps>
Next: <suggested next task>
```

## Boundary rules
1. `agent/` is for you. The app must never import, bundle or read it.
2. Do not copy skill or template text into app code. Write the app's own templates in `src/core/templates.rs`.
3. The UI is in `static/`. Change it only for the task at hand, keep it free of inline scripts and styles, and never ship `demo.js`.
4. Commit changes to `agent/` separately from app changes.
