# prompt-templates.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Agent-side description. The prompts the app sends to models live in code (`src/core/templates.rs`, planned) and are the source of truth. If they differ, the code wins. Update both in the same commit.

Templates the app fills in. `{{...}}` marks the user's details.

## Classifier
```
Classify the task below. Reply with JSON only:
{"category": "<class-design|data-audit|chatbot|agent|extraction|project|other>",
 "prompt_type": "<role|chain-of-thought|system|agent|few-shot|project|power>",
 "reason": "<one sentence>"}

Task: {{idea}}
```

## Role prompt (e.g. class design)
```
You are a {{expert role}}.
Task: {{goal}}.
Return: {{numbered output sections}}.
Ask before assuming anything unclear.
```

## Chain-of-thought / checklist (e.g. data audit)
```
Work through {{items}} one at a time.
For each, state: {{fields}}.
End with a ranked list of the top {{n}} risks.
```

## System prompt
```
You are {{assistant role}} for {{audience}}.
Rules: {{rules}}.
Tone: {{tone}}.
If you are unsure, say so and ask one question.
```

## Project prompt
```
Project: {{name}}. Goal: {{goal}}.
Constraints: {{constraints}}.
Deliverables: {{list}}.
Work in stages; confirm each stage before the next.
```

## Rewriter (outer wrapper)
```
Rewrite the user's idea as a {{prompt_type}} prompt using the template below.
Keep the user's facts. Do not add requirements they did not give.
Output only the finished prompt.
```
