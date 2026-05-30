# {{project_name}} — Tests

This directory contains standard tests recognized by your framework (pytest, Jest, Cargo, etc.).

## Structure

```
tests/
  unit/           # Unit tests
  integration/    # Integration tests
  acceptance/     # User acceptance tests (human-executed)
```

## Rules

- Put traditional test code here — frameworks will discover it automatically
- Do not put AI-generated evidence here — evidence goes to `evals/evidence/` or `docs/evidence/`
- Do not use `.test/` — it is hidden and breaks framework discovery
