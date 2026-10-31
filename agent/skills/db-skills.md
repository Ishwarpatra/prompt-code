# db-skills.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Choice
SQLite for local and hackathon use; a free Postgres tier if hosted. Same schema either way.

## Schema (starting point)
```
conversions(
  id, created_at, user_id NULL,
  task_category, prompt_type,
  model, provider, latency_ms, fallback_used
)
prompts(
  id, conversion_id, input_text, output_text
)
```
## Rules
- Parameterized queries only.
- Migrations as numbered files; never edit an applied migration.
- Index `created_at` and `user_id`.
- Store user input only if history is enabled; offer delete.
- Never store user-supplied API keys.
- Back up before schema changes.

## Users, tokens and sessions
```
users(id, email UNIQUE, created_at)
login_tokens(id, email, token_hash, expires_at, used_at NULL, requested_ip_hash, created_at)
sessions(id_hash, user_id, expires_at, created_at)
free_try_counters(visitor_hash, day, count)
rate_events(kind, key_hash, at)
```
- Store hashes of tokens, session ids, visitor ids and IP addresses, never the raw values.
- Mark a token used with a single atomic update that only succeeds if `used_at` is empty and the token has not expired.
- Delete expired tokens, sessions and old counters on a schedule.
- History rows belong to a user; deleting a user deletes their history.
- Never store user API keys.
