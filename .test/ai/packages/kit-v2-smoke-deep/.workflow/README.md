# Workflow Entry — kit-v2-smoke-deep

> Owner: test
> Profile: generic-project
> Project version: 0.1.0
> Updated: 2026-05-30

## Purpose

Stable workflow entry for AI IDEs, CLI agents, and local runners.

## Read Order

1. `.plan/PRD.md`
2. `.plan/SPEC.md`
3. `.plan/CHECKLIST.md`
4. `.kit/config.json`
5. `.kit/version.json`
6. `.test/README.md`
7. `.test/config.json`
8. `.workflow/status.md`

## Presets

- `codex.md`: Codex workflow.
- `workbuddy.md`: WorkBuddy progress-reading workflow.
- `trae-solo.md`: Trae Solo workflow.

## Rule

This directory explains how to resume and operate the workflow. It does not override `.plan/` unless the decision is promoted into PRD/SPEC/CHECKLIST.

AI-run workflow proof goes to `.test/ai/`. Real user testing packages and returned user evidence go to `.test/user/`. If an AI simulates a user, it is still AI proof.

Do not use root `output/` or `outputs/` as workflow state. During archive cleanup, classify old output material into `.test/ai/`, `.test/user/`, or `.plan/archive/`.
