# testing-factory.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Layers
| Layer | What | Notes |
|---|---|---|
| Unit | Classifier, type mapping, validator, adapters | Mock all network calls |
| Fallback | Timeout, 429, 5xx, bad output, invalid key | Assert chain order and user message |
| API | Each endpoint, valid and invalid input | Check error shape |
| UI | Keyboard flow, states, themes | Manual plus a smoke test |
| Quality | 10+ sample ideas across task categories | Score by hand |

## Required fallback cases
1. Primary times out -> second provider answers, `fallbackUsed` true.
2. Primary returns 429 -> skip with no retry.
3. Output empty -> one stricter retry, then next provider.
4. Invalid user key -> stop, no silent fallback.
5. All providers fail -> input preserved, "Try again" offered.

## Rules
- Each bug fix gets a test that failed first.
- Tests must not call real providers in CI.
- Keep tests fast and independent.

## Quality scoring (per sample)
Clarity 1-5, Fit of prompt type 1-5, Follows required format yes/no.

## Sign-in and access tests
Server tests are listed in `agent/docs/AUTH-AND-ACCESS.md` section 9. For the UI, `tests/ui` has 41 tests (11 static checks that guard the audit fixes, 11 for the demo backend, 19 for the pages in a simulated browser). Run with `npm test` in that folder. They test the UI in demo mode only; they do not prove the Rust API works.
