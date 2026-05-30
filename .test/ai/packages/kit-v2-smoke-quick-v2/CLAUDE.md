# CLAUDE.md — kit-v2-smoke-quick-v2

Project version: `0.1.0`
KIT template version: `0.2.0`
Host: `claude`

Claude must read this file as the primary host entry. Do not rely on `AGENTS.md` for Claude behavior.

Read in this order:

1. `README.md`
2. `.plan/PRD.md`
3. `.plan/SPEC.md`
4. `.plan/CHECKLIST.md`
5. `.kit/config.json`
6. `.kit/version.json`
7. `.workflow/README.md`
8. `.test/README.md`
9. `.test/config.json`

Rules:

- Keep root `README.md` as the user-facing entry. Do not create `.plan/README.md`.
- Keep `project_version` aligned across `.kit/version.json`, `CLAUDE.md`, package/release metadata, and git tags when present.
- Use `.workflow/` as the only KIT-managed workflow directory.
- Put AI self-checks, scripted browser/CLI runs, model-generated feedback, dry-runs, fixtures, and package proof under `.test/ai/`.
- Put only real user testing packages, user instructions, acceptance forms, feedback, and returned evidence under `.test/user/`.
- AI-simulated users are AI tests. Do not file them as real user tests.
- Do not create root `output/` or `outputs/`. During archive cleanup, classify existing contents into `.test/ai/`, `.test/user/`, or `.plan/archive/`.
- Update `.plan/SPEC.md` before changing architecture, workflow entry, version policy, or test strategy.
