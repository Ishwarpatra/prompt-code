# Prompt Code: Project Documentation

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Turns a rough idea into a polished prompt (system, power, or project) and recommends which prompt type fits the task. Open-weight models are the default engine.

> Items marked **[verify]** depend on provider limits or names that change often. Check the provider's current page before relying on them.

---

## 1. Goal and hackathon fit

- **Project:** a prompt converter and recommender.
- **Open-weight role:** an open-weight model (Llama, Gemma, Qwen, or Mistral) does the classification and rewriting. It is the core of the product, not an add-on.
- **Optional extra:** users can bring their own OpenAI or Gemini key. This is never the default path.
- **Cost:** free tiers only. No subscription fees.

## 2. User flow

1. User pastes a rough idea.
2. User picks an output type, or leaves it on **Auto-recommend**.
3. App classifies the task (class design, data audit, chatbot, agent, and so on).
4. App recommends a prompt type and explains why in one sentence.
5. App writes the prompt, shows it, and lets the user copy or refine it.
6. Result is saved to the user's history.

## 3. Prompt-type mapping (starting set)

| Task category | Recommended type | Why |
|---|---|---|
| Class or system design | Role prompt | Needs an expert persona and a fixed output format |
| Data handling audit | Chain-of-thought or checklist | Model must walk each data flow and flag risks |
| Chatbot or assistant | System prompt | Sets role, rules, tone |
| Tool-using agent | Agent prompt | Defines tools, limits, stop conditions |
| Classification or extraction | Few-shot prompt | Examples fix the format |
| Large multi-step project | Project prompt | Goals, constraints, deliverables, milestones |
| Anything else | Power prompt | General structured rewrite |

## 4. Architecture and connections

```
Browser (UI)
   |  HTTPS, JSON
   v
App backend  (Hugging Face Space, Render, or DigitalOcean App Platform)
   |-- /api/convert      -> Orchestrator
   |-- /api/history      -> Storage
   |-- /api/health       -> Status check
   v
Orchestrator
   1. Validate and trim input
   2. Classify task        (small open-weight model)
   3. Pick prompt type     (rules table above + model suggestion)
   4. Write prompt         (open-weight model)
   5. Validate output      (non-empty, within length, has required sections)
   v
Provider layer (one interface, many adapters)
   Primary:   Groq (Llama or Qwen)
   Fallback 0: Google Gemma API (Gemma)
   Fallback 1: Hugging Face Inference (Qwen or Mistral)
   Fallback 2: OpenRouter free open model
   Optional:  User's own OpenAI or Gemini key
   v
Storage: SQLite file or free Postgres tier (history, settings)
```

### Provider interface (the one contract everything shares)

```
generate(model, messages, { timeoutMs, maxTokens }) -> { text, model, provider, latencyMs }
```

Each provider adapter implements only this function. Adding a model means adding one adapter and one config line.

### Configuration (environment variables)

| Variable | Purpose |
|---|---|
| `PRIMARY_PROVIDER`, `PRIMARY_MODEL` | Default open-weight route |
| `FALLBACK_PROVIDERS` | Ordered list tried on failure |
| `GROQ_API_KEY`, `HF_TOKEN`, `OPENROUTER_API_KEY` | Server-side keys, never sent to the browser |
| `REQUEST_TIMEOUT_MS` | Per-call timeout |
| `MAX_INPUT_CHARS` | Input size limit |
| `DATABASE_URL` | History storage |

User-supplied keys (OpenAI, Gemini) are sent per request, used once, and never stored or logged.

## 5. Error handling and fallback

| Failure | Detection | Response |
|---|---|---|
| Timeout | No reply within `REQUEST_TIMEOUT_MS` | Retry once, then next provider |
| Rate limit (429) | HTTP status | Skip to next provider immediately, no retry |
| Provider down (5xx) | HTTP status | Next provider, mark unhealthy for 60 seconds |
| Bad or empty output | Validator fails | Retry once with a stricter instruction, then next provider |
| Invalid user key | 401 or 403 | Stop and tell the user to check the key. Do not fall back silently to another paid model |
| All providers failed | Chain exhausted | Keep the user's input, show "All models are busy", offer **Try again** |
| Input too long or empty | Pre-validation | Inline message with the limit |

Rules:

- Every fallback is shown to the user: "Llama timed out. Switched to Gemma." The result card labels which model answered.
- Errors say what happened and what to do next. They do not apologize or stay vague.
- Log provider, model, status, and latency for every call. Never log the user's prompt text or keys.
- Add a `/api/health` route that reports each provider's last status.

## 6. Interface plan

Reference mockup: `agent/reference/prompt-code-design.html` (open in any browser).

- **Layout:** two columns on desktop (input left, result right), stacked on mobile.
- **Screens:** converter, fallback notice, error and empty states, history, models.
- **Style:** clean and modern, one blue accent, Inter for interface text, JetBrains Mono for generated prompts, light and dark themes.
- **Accessibility:** visible keyboard focus, 44px touch targets, text contrast at least 4.5:1, status messages announced to screen readers.
- **Reference sites to study for patterns:** linear.app (quiet density), vercel.com (whitespace and two-column rhythm), raycast.com (command-style input).

## 7. CI/CD (already in place)

Confirm the pipeline covers these steps:

1. Lint and type check on every push.
2. Unit tests, including provider adapters with mocked responses.
3. A fallback test that simulates timeout, 429, and 5xx and checks the chain order.
4. Build.
5. Secret scan. Fail if any key appears in the repo.
6. Auto-deploy `main` to the free host. Keep a one-click rollback.

Keep API keys in the CI and host secret stores only.

## 8. Free-tier plan **[verify all limits]**

| Need | Free option |
|---|---|
| Model API | Groq free tier, Hugging Face free inference, OpenRouter free open models |
| Local development | Ollama with a small model |
| App hosting | Hugging Face Spaces, Render, Vercel, Cloudflare Pages |
| Database | SQLite file, or a free Postgres tier |
| DigitalOcean (optional) | Serverless inference or a Droplet; paid, so skip if staying at zero cost |

The user plans a report instead of a hosted demo if hosting is not possible. If so, include screenshots and a short recorded run of the app from a local build.

## 9. Task checklist

**Foundation**
- [ ] Repo, README, license (use an open-source license)
- [ ] Provider interface and one adapter (Groq)
- [ ] Convert endpoint with validation
- [ ] Prompt-type mapping table in code

**Core features**
- [ ] Task classifier
- [ ] Recommendation with one-line reason
- [ ] Output types: system, power, project
- [ ] Copy and refine actions
- [ ] History storage

**Reliability**
- [ ] Fallback chain with provider health tracking
- [ ] Output validator and single retry
- [ ] User-facing error and fallback messages
- [ ] Health route

**Interface**
- [ ] Build screens from the reference mockup
- [ ] Light and dark themes
- [ ] Mobile layout check
- [ ] Keyboard and screen-reader check

**Quality**
- [ ] Unit tests for adapters and fallback chain
- [ ] 10 sample prompts across task categories, scored by hand
- [ ] CI green, secrets scan passing

**Delivery**
- [ ] Final report (see below)
- [ ] Demo video or screenshots

## 10. Report skeleton

1. **Summary:** what it does in two sentences.
2. **Problem:** why people struggle to write good prompts.
3. **Solution:** the converter and recommender.
4. **Open-weight AI use:** which models, what each does, why open-weight.
5. **Architecture:** diagram from section 4.
6. **Reliability:** fallback design and test results.
7. **Evaluation:** sample prompts before and after, with your scoring method.
8. **Interface:** screenshots.
9. **Cost:** free-tier choices and limits.
10. **Limitations and next steps.**

## 11. Risks to watch

- Free-tier rate limits during a demo. Keep Ollama as an offline backup.
- Small models may drift off format. The validator and retry exist for this.
- Provider model names change. Keep them in config, not code.
- Hackathon rule: open-weight must be central. Keep it as the default and say so in the report.
