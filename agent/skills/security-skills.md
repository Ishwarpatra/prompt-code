# security-skills.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Secrets
- Keys only in environment or secret stores. Never in code, logs, or the browser.
- CI secret scan must fail the build on any key.
- User-supplied keys: per request only, not stored, not logged.

## Input and output
- Validate and size-limit all input.
- Escape model output before rendering; never insert as raw HTML.
- Treat pasted text as untrusted: it may contain instructions aimed at the model. Keep your system instructions separate from user text, and never let user text change provider, keys, or settings.

## Access
- Rate limit per client.
- HTTPS only. Set sensible CORS.
- History is private to its user; offer delete.

## Dependencies
- Pin versions. Run an audit in CI. Remove unused packages.

## Privacy
- Do not log prompt text. Tell users what is stored.

## Sign-in, sessions and the browser
- Magic-link tokens: random, hashed at rest, single use, short life, tied to one email. See `agent/docs/AUTH-AND-ACCESS.md` section 3.
- The same response for known and unknown emails; do not reveal which accounts exist.
- Session cookie: `__Host-` prefix, `HttpOnly`, `Secure`, `SameSite=Lax`.
- Check `Origin` and require JSON content type on state-changing requests.
- Strict content security policy; the UI is built for it. Never insert model output as HTML.
- Own API keys: held in the tab only, sent per request, never logged or stored.
- Free try: limit per visitor, per IP and per day so anonymous use cannot drain the quota.
