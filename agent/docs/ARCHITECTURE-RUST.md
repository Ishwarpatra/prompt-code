# ARCHITECTURE-RUST.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Design only. Code sketches have not been compiled or tested. Crate names are common choices; confirm current versions and fit [verify].

## 1. Name
The project is named **Prompt Code**, as stated by the owner. Confirm the spelling. Check the repository, package and domain names are free before publishing.

## 2. Why Rust here
Memory safety, no garbage-collector pauses, a single small binary, strong typing for error handling. Good fit for a service that holds API keys and handles untrusted text.

## 3. Layout
```
prompt-code/
  Cargo.toml
  .env.example
  src/
    main.rs            start server, load config
    config.rs          read and validate env vars
    error.rs           AppError and API error mapping
    api/               routes: convert, history, health
    core/              classifier, type_map, rewriter, validator, templates (runtime prompt templates, source of truth)
    providers/         mod.rs (trait), groq.rs, huggingface.rs, openrouter.rs, user_key.rs
    fallback.rs        chain, health tracking
    storage/           history persistence
  static/              the UI (built; runs in demo mode until the API exists)
  tests/               fallback and API tests
  agent/               AGENT-ONLY: docs, skills, reference. Never built into the app
```

## 4. Suggested crates [verify]
| Need | Crate |
|---|---|
| Web server | axum on tokio |
| HTTP client | reqwest with rustls |
| JSON | serde, serde_json |
| Errors | thiserror |
| Logging | tracing, tracing-subscriber |
| Storage | sqlx with SQLite |
| Rate limiting | tower_governor or tower middleware |
| Config | dotenvy |
| Secrets in memory | secrecy |
| Mocking HTTP in tests | wiremock |

## 5. Provider contract
```rust
// Sketch, not compiled
#[async_trait::async_trait]
pub trait Provider: Send + Sync {
    fn name(&self) -> &str;
    async fn generate(&self, req: GenRequest) -> Result<GenResponse, ProviderError>;
}

pub struct GenRequest { pub model: String, pub messages: Vec<Message>, pub max_tokens: u32, pub timeout_ms: u64 }
pub struct GenResponse { pub text: String, pub model: String, pub provider: String, pub latency_ms: u64 }
```

## 6. Error types
```rust
// Sketch, not compiled
#[derive(thiserror::Error, Debug)]
pub enum ProviderError {
    #[error("timeout")] Timeout,
    #[error("rate limited")] RateLimited,
    #[error("server error {0}")] Server(u16),
    #[error("invalid key")] InvalidKey,
    #[error("bad output")] BadOutput,
}
```
API error body (one shape): `{ "error": { "code", "message", "retryable" } }`.
Codes: INPUT_EMPTY, INPUT_TOO_LONG, KEY_INVALID, RATE_LIMITED, ALL_PROVIDERS_FAILED.

## 7. Fallback chain
```
for provider in ordered_providers (skip those marked unhealthy):
    result = provider.generate(req)
    Ok + valid output   -> return, set fallbackUsed if not first
    Timeout             -> retry once, then next
    RateLimited         -> next, no retry
    Server(5xx)         -> mark unhealthy 60 s, next
    BadOutput           -> retry once with stricter instruction, then next
    InvalidKey          -> STOP, return KEY_INVALID (no silent fallback)
chain exhausted -> ALL_PROVIDERS_FAILED, keep user input
```
Always return which model and provider answered.

## 8. Security rules in Rust
- Keys wrapped in `secrecy::SecretString`; never `Debug`-printed.
- No `unwrap()` or `expect()` on request paths; return `Result`.
- `#![forbid(unsafe_code)]` in the crate.
- Input length limit before any model call.
- Model output escaped before display; never injected as raw HTML.
- Pasted text goes in the user message only; system instructions stay separate.
- Logs hold provider, model, status, latency only.
- `cargo audit` and `cargo deny` in CI.

## 9. Config
Environment variables as listed in agent/skills/tools-config.md. Fail fast at startup if a required one is missing.

## 10. Build order
1. Config and error types. 2. Provider trait plus one adapter. 3. Convert endpoint (no fallback). 4. Validator. 5. Fallback chain with tests. 6. Classifier and type mapping. 7. Serve `static/` and wire it to the API: session cookie, security headers, demo mode off. 8. History. 9. Health route. 10. Polish and report.

## 11. Gateway and proxy models (added)

Goal: if the main model hits a rate limit or goes down, requests move to another open-weight model automatically, so the app keeps working.

### Model order (default path stays open-weight)
1. Primary: Llama (current instruct model on the primary provider) [verify model id]
2. Backup 1: Gemma, through Google's Gemma API (links in the Hacktoberfest guide; check model name, quota and terms) [verify]
3. Backup 2: Qwen [verify]
4. Backup 3: Mistral [verify]
5. Optional, only if the user supplies a key: OpenAI or Gemini

The order is the owner's choice [owner to confirm]. Gemma could also be first, since the Open-Source AI track highlights it.

### Two ways to build it
| Option | What it is | Pros | Cons |
|---|---|---|---|
| A. Own chain (default) | The fallback chain in section 7, inside the Rust app | No extra service, full control, fewer moving parts, easier to secure | You maintain the retry and health logic |
| B. LiteLLM proxy | Open-source proxy exposing one OpenAI-style endpoint with fallback chains, per-model rate limits and health checks. Rust calls it over HTTP | Less fallback code to write | Extra service to run and secure; Python dependency; single point of failure |
| C. OpenRouter | Hosted gateway; pass a list of models in priority order | No infrastructure | Free tier is small (reported about 50 requests a day) [verify]; extra latency; third party sees requests |

Recommendation: start with A. Add B only if the chain becomes hard to maintain. Use C as one fallback provider, not as the only route.

### Rules
- Keep a direct route to at least one provider, so a gateway outage cannot take the app down.
- Set per-model request-per-minute limits in config and skip a model before it returns 429.
- Mark a failing model unhealthy for 60 seconds, then retry it.
- If using LiteLLM: bind it to localhost or a private network, require a key, and never expose it publicly.
- Gateway keys and provider keys stay in secret stores, never in the repo.
- Show the user which model answered, and when a backup was used.
- Invalid user key still stops the request. No silent switch to another model.

### Config additions
| Name | Purpose |
|---|---|
| GATEWAY_MODE | own, litellm, or openrouter |
| GATEWAY_URL | Proxy address if litellm |
| MODEL_ORDER | Comma-separated priority list |
| MODEL_RPM_LIMITS | Per-model requests per minute |
| UNHEALTHY_COOLDOWN_SEC | Default 60 |

### Tests to add
- Primary returns 429 -> backup answers, fallbackUsed true.
- Primary and first backup fail -> second backup answers.
- Gateway unreachable -> direct provider route used.
- Model recovers after cooldown -> returns to the primary.

## 12. App and agent boundary
- The app is the Rust code, tests and the UI in `static/`. The `agent/` folder is for coding agents and maintainers only.
- The app never imports, bundles or reads files from `agent/`, at build time or runtime.
- The prompts the app sends to models live in code (`src/core/templates.rs`, planned). `agent/skills/prompt-templates.md` describes them for agents; if they differ, the code wins. Change both in one commit.
- Release builds and container images exclude `agent/`.

## 13. Serving the UI, sessions and access
- Serve `static/` with a static-file service (for example tower-http `ServeDir`) from the same origin as the API, so cookies and the strict content security policy work without exceptions.
- Add the security headers listed in AUTH-AND-ACCESS.md section 6.
- New planned modules: `src/api/auth.rs`, `src/api/free_try.rs`, `src/api/models.rs`, `src/auth/mod.rs` (tokens, sessions, rate limits), `src/auth/mailer.rs` (sends the sign-in email).
- The UI already calls these routes; see AUTH-AND-ACCESS.md section 4 for the contract.
- Release builds must not contain `static/js/demo.js` or `demo: true`.
