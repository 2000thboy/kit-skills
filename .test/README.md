# Test Package — kit-skills

> Project version: `0.3.0`
> KIT template version: `0.3.0`
> Host: `codex`
> Updated: `2026-05-28`

## Purpose

`.test/` is the isolated test package for this public skill package.

- `.test/ai/`: AI self-checks, helper dry-runs, package proof, validation logs, and AI-simulated user results.
- `.test/user/`: real user install package, user-facing trial guide, acceptance checklist, feedback, and user-returned evidence.

AI pretending to be a user is still AI. Put it under `.test/ai/`, not `.test/user/`.

Do not create root `output/` or `outputs/`. If an older run creates them, classify the contents into `.test/ai/`, `.test/user/`, or `.plan/archive/` before claiming archive cleanup is complete.

## AI Checks

Run from package root:

```powershell
npm run check
npm run check:contract
npm run check:self-audit
npm run check:pack
```

Store:

- command summaries in `.test/ai/reports/`
- package dry-run summaries in `.test/ai/packages/`
- large raw logs or screenshots in `.test/ai/evidence/`
- isolated generated projects under `.test/ai/sandboxes/`

## Real User Testing

Only real human-facing material goes under `.test/user/`.

- `.test/user/README.md`: trial instructions.
- `.test/user/packages/`: tested package or release pointer.
- `.test/user/guides/`: task guide for a tester.
- `.test/user/acceptance/`: pass/fail checklist.
- `.test/user/feedback/`: user returned notes.
- `.test/user/evidence/`: screenshots, recordings, or returned files.

Do not ship `.test/ai/` as if it were user documentation. That is how teams confuse proof with instructions.
