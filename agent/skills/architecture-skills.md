# architecture-skills.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Principles
- Smallest design that meets the brief. Add layers only when a real need appears.
- One provider interface: `generate(model, messages, {timeoutMs, maxTokens}) -> {text, model, provider, latencyMs}`.
- Config over code: model names, provider order, limits live in environment variables.
- The browser never sees server keys.
- Stateless backend; state lives in storage.

## Components
UI -> API (`/convert`, `/history`, `/health`) -> Orchestrator -> Provider adapters -> Storage.

## Decision checklist
- Does this keep open-weight as the default path?
- Can a provider be added by writing one adapter and one config line?
- What happens when this component fails?
- Does it work on free tiers?

## Record decisions
Write a short note per decision: context, choice, alternatives, consequence.
