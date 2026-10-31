# VERSION-CONTROL.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Branching
- `main`: always deployable. Protected: pull request, passing CI, one review.
- `feature/<short-name>`, `fix/<short-name>`: short-lived, branch from `main`.
- No long-running branches.

## Commits
- Small, one concern each. Imperative message: "Add Groq adapter".
- Optional prefix: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Never commit secrets, `.env`, or build output (`/target`).

## Pull requests
Include: what changed, why, how tested, anything not checked. Link the task from STATUS.md.

## Versioning
Semantic versioning in `Cargo.toml`: MAJOR.MINOR.PATCH.
- PATCH: fixes. MINOR: new features, compatible. MAJOR: breaking API change (use `/api/v2`).
Tag releases `vX.Y.Z`. Keep `CHANGELOG.md`.

## Files to include
`.gitignore` (target, .env, *.db), `.env.example`, `LICENSE` (open-source), `Cargo.lock` committed (this is an application).

## If a secret leaks
Revoke the key first, then remove it from history, then rotate. Do not just delete the file.
