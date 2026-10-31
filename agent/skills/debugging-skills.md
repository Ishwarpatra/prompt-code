# debugging-skills.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Method
1. Reproduce. Write the exact steps and input.
2. Narrow. Which layer: UI, API, orchestrator, provider, storage?
3. Hypothesize one cause at a time and test it.
4. Fix the cause, not the symptom.
5. Add a test that fails without the fix.
6. Note what you learned.

## Prompt Code hot spots
- Provider returns text in an unexpected format -> check validator and parsing.
- Works locally, fails hosted -> compare environment variables first.
- Slow responses -> check provider latency in logs before touching code.
- Wrong prompt type recommended -> inspect classifier output and mapping table.

## Rules
- Read the actual error and logs before changing code.
- Change one thing per attempt.
- After two failed attempts, stop and report findings.
