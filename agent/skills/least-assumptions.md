# least-assumptions.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Do not fill gaps with guesses.

## Rules
1. If a requirement is unclear and the answer changes the work, ask one specific question.
2. If you cannot ask, pick the safest reversible option and write the assumption at the top of your output.
3. Never invent: model names, pricing, limits, API fields, or file contents. Mark unknowns as [verify].
4. Do not expand scope. A request for X is not a request for Y.
5. Prefer reading existing code and docs over assuming how they work.
6. State confidence when it matters: confirmed, likely, unknown.

## Assumption log format
```
Assumption: <statement>
Reason: <why needed>
Risk if wrong: <impact>
How to confirm: <step>
```
