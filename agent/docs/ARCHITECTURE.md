# ARCHITECTURE.md: Prompt Code Architecture Reference

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Purpose: one place that explains how the system fits together, so architecture problems can be found and fixed fast. Language details are in ARCHITECTURE-RUST.md. Read INDEX.md first if you do not know where to look.

Status: design only. Nothing here has been built or tested yet. Provider limits, model ids and crate versions are [verify].

## 1. System in one paragraph
A user sends a rough idea. The backend validates it, classifies the task, picks a prompt type, asks an open-weight model to write the prompt, validates the output, and returns it with the model and provider that answered. If a model fails, the fallback chain tries the next one.

## 2. Components and responsibilities
| Component | Does | Must not |
|---|---|---|
| UI (static) | Collect idea, show result, errors, which model answered | Hold server keys; render model output as raw HTML |
| API layer | Validate input, rate limit, map errors to the one error shape | Contain business logic |
| Orchestrator | Run steps: validate, classify, pick type, rewrite, validate output | Know provider details |
| Provider layer | One adapter per provider behind one trait | Decide fallback order |
| Fallback chain | Order, retry, health tracking, cooldown | Hide a fallback from the user |
| Gateway option | Optional proxy (LiteLLM) or hosted router (OpenRouter) | Be the only route |
| Storage | History, optional | Store user API keys or log prompt text |
| Config | Read and validate environment variables, fail fast | Hard-code model ids |

## 3. Request flow
1. UI posts to /api/convert.
2. API checks size and emptiness, then rate limit.
3. Orchestrator classifies task and picks prompt type (rules table plus model suggestion).
4. Orchestrator builds the rewrite request from a template.
5. Fallback chain calls providers in order until one returns valid output.
6. Output validator checks it is non-empty, within length, and has required sections.
7. API returns prompt, recommended type, reason, model, provider, fallbackUsed.

## 4. Boundaries that must hold
- Browser never receives server keys.
- User-supplied keys live in memory for one request only.
- Provider differences stay inside adapters.
- Model names and order live in config.
- Open-weight stays the default path.
- Pasted text goes in the user message only; system instructions stay separate.

## 5. Failure behavior
| Failure | Result |
|---|---|
| Timeout | Retry once, then next provider |
| 429 | Next provider, no retry |
| 5xx | Mark unhealthy 60 seconds, next provider |
| Bad or empty output | One stricter retry, then next provider |
| Invalid user key | Stop with KEY_INVALID. No silent fallback |
| All providers fail | ALL_PROVIDERS_FAILED, input kept, Try again offered |
| Gateway unreachable | Use direct provider route |

## 6. Architecture troubleshooting guide
| Symptom | Likely layer | Check first |
|---|---|---|
| Works locally, fails hosted | Config | Environment variables on the host |
| Always uses a backup model | Fallback chain | Primary health state and cooldown, primary key, rate limits |
| Slow responses | Provider or timeout | Latency logs per provider; timeout value |
| Wrong prompt type recommended | Orchestrator | Classifier output and type mapping table |
| Output missing sections | Validator or template | Template text and validator rules |
| 429 storms | Fallback or limits | Per-model request limits in config; cooldown |
| Key leaked in logs | Logging | Logging rules; secret scan in CI |
| Model output shows odd markup | UI | Escaping of model output |
| User text changes behavior | Orchestrator | Separation of system and user messages |

## 7. Decision records
Record each architecture decision in a short note: context, choice, alternatives, consequence.
- D1 Rust for security and a small binary.
- D2 Own fallback chain first; LiteLLM or OpenRouter optional.
- D3 Open-weight default; user-key models optional.
- D4 Free tiers only.

## 8. Change rules
- Changing the provider trait, error shape, or request fields means updating API.md, this file, and the tests in the same change.
- Adding a provider means one adapter, one config entry, and one fallback test.

## 9. Known risks
Free-tier rate limits, small models drifting off format, a gateway becoming a single point of failure, Rust build time on free CI.
