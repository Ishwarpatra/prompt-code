# performance-skills.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Targets (adjust after measuring)
- Convert response: under about 5 seconds on the primary model.
- Page load: fast on a mobile connection.

## Levers
- Smaller models for classification; larger only if quality needs it.
- Cap `maxTokens` and input length.
- Stream results to the UI if the provider supports it.
- Cache identical requests briefly.
- Per-call timeout so a slow provider triggers fallback early.
- Keep the front end lightweight; load fonts with fallbacks.

## Rules
- Measure first. Log latency per provider and per stage.
- Do not optimize without a number showing the problem.
- Watch free-tier rate limits; they are a performance limit too.
