# Codex Workflow Preset

## Start

Read:

1. `.plan/PRD.md`
2. `.plan/SPEC.md`
3. `.plan/CHECKLIST.md`
4. `.kit/config.json`
5. `.workflow/status.md`

## Rules

- If the user request conflicts with `.plan/`, report drift before editing.
- For 3+ file changes, plan before implementation.
- Run `spec-loop-kit validate --cwd .` after workflow or planning changes.
- Record AI test evidence in `.test/ai/evidence/` or `.test/ai/reports/`.
