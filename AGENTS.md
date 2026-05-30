# AGENTS.md — kit-skills

Project version: `0.1.0`
KIT template version: `0.1.0`
Host: `codex/generic`

Read in this order:

1. `README.md`
2. `SKILL.md`
3. `bin/spec-loop-kit.mjs`
4. `templates/`
5. `knowledge/`
6. `.kit/version.json`
7. `.test/README.md`
8. `.test/config.json`

Rules:

- Keep this file aligned with `CLAUDE.md`, `README.md`, `SKILL.md`, `package.json`, and `.kit/version.json`.
- `SKILL.md` is the skill entrypoint. `README.md` is the human onboarding entry.
- Use `bin/spec-loop-kit.mjs` for helper behavior; do not document validator rules that the helper cannot check.
- Keep `.test/ai/` for AI self-checks and simulated users.
- Keep `.test/user/` for real user testing packages, instructions, feedback, and returned evidence.
- Do not create root `output/` or `outputs/`; classify legacy contents into `.test/ai/`, `.test/user/`, or `.plan/archive/`.
- For package changes, run `npm run check`, `npm run check:self-audit`, `npm run check:pack`, and `quick_validate.py .`.
