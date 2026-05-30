# Test Package — kit-v2-smoke

> Project version: `0.1.0`
> KIT template version: `0.1.0`
> Host: `claude`
> Updated: `2026-05-30`

## Purpose

`.test/` is the isolated test package. It has two lanes:

- `.test/ai/`: AI/self-check evidence, dry-runs, packaging proof, and automation logs.
- `.test/user/`: real user testing package, user-facing instructions, install bundles, acceptance forms, feedback, and user evidence.

Do not mix these lanes. AI proof is not a user test. User feedback is not CI output. Small distinction, large reduction in nonsense.

If an AI agent simulates a user, roleplays a tester, drives a browser, runs a CLI, or generates feedback, it is still `.test/ai/`. `.test/user/` is only for real humans or external user testers and the package prepared for them.

Do not create root `output/` or `outputs/`. Those folders are ambiguity in directory form. Classify their contents into `.test/ai/`, `.test/user/`, or `.plan/archive/`.

## Layout

```text
.test/
  README.md
  config.json
  ai/
    sandboxes/
    reports/
    evidence/
    packages/
    fixtures/
  user/
    README.md
    packages/
    guides/
    acceptance/
    feedback/
    evidence/
```

## Frontend App

Record real project commands before testing:

```powershell
<install command>
<dev server command>
<build command>
<test command>
```

Check:

- app opens at the documented URL
- first usable workflow works without developer notes
- layout fits desktop and mobile
- no text overlap or clipped controls
- browser/screenshot evidence saved under `.test/user/evidence/` for user runs or `.test/ai/evidence/` for AI runs

## Skill Package

Run validation and package dry-run from the package root:

```powershell
<skill validation command>
<package dry-run command>
```

Save AI dry-run file lists under `.test/ai/packages/`. Save user-installable bundles under `.test/user/packages/`.

## Backend Or CLI

Drive AI CLI checks from `.test/ai/sandboxes/<version>/<test-slug>/`:

```powershell
<setup command>
<smoke command>
<failure/edge-case command>
```

Save command output and exit codes in `.test/ai/reports/`.

## User Testing Package

Put only user-facing material here:

```text
.test/user/
  README.md
  packages/
  guides/
  acceptance/
  feedback/
  evidence/
```

Before giving the project to users, prepare:

- install/open instructions in `.test/user/README.md`
- the tested package or URL pointer in `.test/user/packages/`
- what the user should try in `.test/user/guides/`
- pass/fail checklist in `.test/user/acceptance/`
- feedback form or notes in `.test/user/feedback/`
- screenshots, recordings, or returned evidence in `.test/user/evidence/`

Do not put AI-generated mock feedback here. If a model pretends to be a user, it belongs in `.test/ai/reports/`.

## Workflow Project

Read `.workflow/README.md`, then `.plan/`, `.kit/`, and this file.

Check:

- resume path is clear
- dry-run path is separate from live action
- state and evidence paths are documented
- human stop gates are visible
- old `.workflows/` or `docs/workflows/` paths are migrated, bridged, or marked historical
