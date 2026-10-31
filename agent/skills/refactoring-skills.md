# refactoring-skills.md

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

## Process
1. Confirm tests pass before starting.
2. Change structure, not behavior.
3. One refactor per commit.
4. Run tests after each step.

## Look for
- Duplicate provider logic -> move to shared helper.
- Functions over about 40 lines or doing two jobs.
- Config values hard-coded in code.
- Error handling copied in several places.

## Do not
- Mix refactoring with new features.
- Rename public API fields without a version bump.
- Refactor code with no tests until you add tests first.
