# tools-config.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Environment variables
| Name | Example | Notes |
|---|---|---|
| PRIMARY_PROVIDER | groq | Default open-weight route |
| PRIMARY_MODEL | (set from provider's current list) | [verify] |
| FALLBACK_PROVIDERS | huggingface,openrouter | Ordered |
| GROQ_API_KEY | secret | Server only |
| HF_TOKEN | secret | Server only |
| OPENROUTER_API_KEY | secret | Server only |
| REQUEST_TIMEOUT_MS | 8000 | Per call |
| MAX_INPUT_CHARS | 4000 | Input limit |
| DATABASE_URL | sqlite:./data.db | Or Postgres URL |

## Provider list (config shape)
```
{ "providers": [
  { "name": "groq", "role": "primary", "models": ["<model id>"] },
  { "name": "huggingface", "role": "fallback", "models": ["<model id>"] },
  { "name": "openrouter", "role": "fallback", "models": ["<model id>"] },
  { "name": "openai", "role": "user-key", "models": [] },
  { "name": "gemini", "role": "user-key", "models": [] }
]}
```
Model ids change often; fill from each provider's current docs [verify].

## Local development
Ollama with a small open-weight model as an offline backup.

## Tooling
Linter, formatter, test runner, secret scanner, dependency audit; all run in CI.

## Access and sign-in settings
| Name | Example | Notes |
|---|---|---|
| PUBLIC_BASE_URL | https://example.invalid | Used to build the sign-in link |
| LINK_TTL_MINUTES | 15 | Sign-in link life |
| SESSION_DAYS | 14 | [owner to confirm] |
| LINK_RATE_PER_EMAIL_HOUR | 5 | [owner to confirm] |
| LINK_RATE_PER_IP_HOUR | 20 | [owner to confirm] |
| FREE_TRIES | 3 | Per visitor [owner to confirm] |
| FREE_TRY_MAX_CHARS | 800 | [owner to confirm] |
| FREE_TRY_DAILY_CAP | (set after seeing provider limits) | Global cap |
| EMAIL_PROVIDER | (to choose) | Free tier [verify] |
| EMAIL_API_KEY | secret | Server only |
| EMAIL_FROM | (sending address) | Needs SPF, DKIM, DMARC |
| COOKIE_SECRET | secret | Signs the visitor cookie |
