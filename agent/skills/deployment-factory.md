# deployment-factory.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Pipeline (CI/CD already in place; verify these steps)
1. Lint and type check.
2. Unit and fallback tests with mocked providers.
3. Secret scan and dependency audit.
4. Build.
5. Deploy `main` to the free host.
6. Smoke test `/api/health` after deploy.
7. Roll back automatically or by one click if the smoke test fails.

## Environments
Local (Ollama optional), preview, production. Separate keys for each.

## Release checklist
- [ ] CI green
- [ ] Environment variables set on the host
- [ ] Health route shows providers
- [ ] Rollback tested
- [ ] README and changelog updated

## If you cannot host
Run locally, record a short demo, and include screenshots and run steps in the report.

## Hosting and release additions
- Host: DigitalOcean. Region: Brussels or London, to be chosen; check the region has what is needed [verify].
- Before release: `demo` is `false`, `static/js/demo.js` is gone, the security headers are on, email sending works from a verified domain, and a privacy notice is published.
- Rollback must restore the UI and the API together.
