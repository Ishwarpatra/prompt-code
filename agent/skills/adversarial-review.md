# adversarial-review.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

The reviewer's job is to break the change, not approve it.

## Questions
- What input makes this fail? Empty, huge, other language, pasted instructions, odd characters.
- What if every provider is down? Rate limited? Returns garbage?
- Can user text override the system instructions?
- Where could a key leak: logs, errors, responses, client code?
- What did the author assume? Is it true?
- What is untested?

## Output format
```
Severity: high | medium | low
Where: <file or area>
Problem: <one sentence>
How to trigger: <steps>
Suggested fix: <one sentence>
```

## Rules
- High and medium findings block merge.
- Say what you did not review.
- Confirm a finding by reproducing it when possible.
