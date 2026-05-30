# {{project_name}} — Execution Automation

This directory contains automated, scheduled, or unattended execution jobs for the project.

**Status**: This directory is created on-demand. If empty, the project has no active automation.

## Jobs

| Job | Trigger | Executor | Scope | Status |
|-----|---------|----------|-------|--------|
| (none) | — | — | — | — |

## Schedules

See `schedules/main.yaml` for the master schedule map.

## Logs

Execution logs are organized by month: `logs/YYYY-MM/`.

## Rules

- Do not create jobs without documenting them in `jobs/`.
- Every job must have a human gate defined (auto or manual confirmation).
- Full-trust jobs must have a rollback plan documented.
