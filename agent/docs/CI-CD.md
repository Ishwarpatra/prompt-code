# CI-CD.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

The pipeline is reported as already in place. Compare it to this list and fill gaps.

## On every push and pull request
1. `cargo fmt --check`
2. `cargo clippy --all-targets -- -D warnings`
3. `cargo test` (providers mocked; no real network calls)
4. `cargo audit` and `cargo deny check` (known vulnerabilities, licenses)
5. Secret scan (for example gitleaks)
6. `cargo build --release`
Cache the Cargo registry and `target` to save time on free runners.

## On merge to main
1. Build release binary or container image.
2. Deploy to the free host.
3. Smoke test `GET /api/health`.
4. Roll back if the smoke test fails.

## Required fallback tests in CI
Timeout, 429, 5xx, empty output, invalid user key, all providers down. See agent/skills/testing-factory.md.

## Secrets
Stored only in the CI and host secret stores. Never echoed in logs.

## Status gates
A change merges only if all checks are green. A deploy is "done" when the health check passes.

## If you cannot host
CI still runs build and tests. Attach screenshots and a recorded local run to the report.

## Boundary checks (app versus agent)
- Exclude `agent/` from release builds and container images (for example with an ignore file).
- Fail the build if any file in `src/` or the UI folder references `agent/`.
- Fail the build if `agent/` appears in the release artifact.

## UI checks
- Run `tests/ui` (Node 20 or later, dev dependency only).
- Fail if any file in `static/` has an inline `<script>`, a `style=` attribute or an `on...=` handler.
- Fail if `static/js` uses `innerHTML`, `outerHTML`, `eval` or `document.write`.
- Fail if `static/` makes requests to any host other than the site itself.
- Release build: fail if `static/js/demo.js` exists or `demo: true` appears in `static/js/config.js`.
- After deploy, check the response headers include the content security policy.
