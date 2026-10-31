# api-design-factory.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | /api/convert | Convert idea to prompt |
| GET | /api/history | List past conversions |
| DELETE | /api/history/:id | Delete one item |
| GET | /api/health | Provider status |

## POST /api/convert
Request:
```
{ "idea": string, "type": "auto|system|power|project", "model": string?, "userKey": string? }
```
Response:
```
{ "prompt": string, "recommendedType": string, "reason": string,
  "model": string, "provider": string, "fallbackUsed": boolean }
```
Errors use one shape:
```
{ "error": { "code": string, "message": string, "retryable": boolean } }
```
Codes: `INPUT_EMPTY`, `INPUT_TOO_LONG`, `KEY_INVALID`, `RATE_LIMITED`, `ALL_PROVIDERS_FAILED`.

## Rules
- Validate every input; enforce `MAX_INPUT_CHARS`.
- Rate limit per client.
- Version when breaking: `/api/v2/...`.
- `userKey` is used for the request only, never stored or logged.

## Access and sign-in routes
Full contract in `agent/docs/AUTH-AND-ACCESS.md` section 4. Summary:
- Public: `GET /api/try`, `POST /api/try`, `POST /api/auth/request-link`, `POST /api/auth/verify`.
- Signed in: `GET /api/me`, `POST /api/auth/logout`, `POST /api/convert`, `GET /api/history`, `DELETE /api/history`, `DELETE /api/history/:id`, `GET /api/models`.
- New error codes: `TRY_LIMIT_REACHED`, `FREE_TRY_UNAVAILABLE`, `EMAIL_INVALID`, `LINK_INVALID`, `UNAUTHENTICATED`, `NOT_FOUND`.
- `POST /api/convert` also accepts `instruction` and `previousPrompt` for refining, and an explicit `type`.
- `request-link` always returns 202 with the same body.
