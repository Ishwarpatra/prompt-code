# coding-standards.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## General
- Small functions with one job. Clear names over comments.
- Comments explain why, not what.
- No dead code, no commented-out blocks.
- Handle errors explicitly; never swallow them.
- Types on all public functions.
- No secrets in code. Read from environment variables.

## Structure
```
/src
  /api          route handlers (thin)
  /core         orchestrator, classifier, validator
  /providers    one adapter per provider + shared interface
  /storage      history persistence
  /config       env loading and validation
/tests
```

## Naming
- Files: kebab-case. Types and classes: PascalCase. Functions and variables: camelCase.
- Provider adapters: `<provider>-adapter`.

## Git
- Small commits, imperative messages ("Add Groq adapter").
- One concern per pull request. CI must pass before merge.

## Boundary
App code must not import, read or reference anything under `agent/`.

## Logging
Log provider, model, status, latency. Never log prompt text or keys.
