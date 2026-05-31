# tmpkit-test-123

> Owner: unassigned
> Level: 2
> Profile: generic-project
> Project version: 0.1.0
> Created: 2026-05-30

## Current Facts

- Product facts: `.plan/PRD.md`
- Technical contract: `.plan/SPEC.md`
- Tasks and evidence: `.plan/CHECKLIST.md`
- Project status: `.kit/config.json`
- Version contract: `.kit/version.json`
- Host entry: `CLAUDE.md`
- Test package: `.test/README.md`

## Workflow Entry

Use `.workflow/README.md` as the workflow entry for host presets, resume rules, workflow scripts, and historical workflow contracts.

Do not create `docs/workflows/`. If this project already has `.workflows/` or `docs/workflows/`, treat it as legacy material and record the migration or bridge in `.plan/SPEC.md`.

## Development Rule

If this README conflicts with `.plan/`, update the stale file before implementation.

Root `README.md` is the only project README. Do not add `.plan/README.md`.

Testing material belongs in `.test/`, not in a loose root Markdown file.

AI self-checks, scripted runs, model-generated feedback, fixtures, and package proof go to `.test/ai/`. Real user packages, instructions, acceptance forms, feedback, and returned evidence go to `.test/user/`. AI pretending to be a user is still AI.

Do not create root `output/` or `outputs/`. If they already exist during archive cleanup, classify the contents into `.test/ai/`, `.test/user/`, or `.plan/archive/`.
