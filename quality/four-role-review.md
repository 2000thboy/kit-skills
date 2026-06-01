# Four-Role 95 Review

Use for major handoff, `/kit-check full`, `/kit-test`, `/kit-pack`, and any claim that KIT can deliver a commercial project.

## Reviewers

### 1. Top PM

Scores product clarity, business value, user workflow, scope discipline, acceptance criteria, handoff readiness, and mainland China fit when relevant.

### 2. Top Code Engineer

Scores architecture, maintainability, test strategy, real data path, security basics, observability, and failure recovery.

### 3. Top Frontend Engineer

Scores UI hierarchy, responsiveness, accessibility, interaction states, browser evidence, design-system fit, and customer polish.

### 4. Backend Framework Engineer

Scores API boundaries, auth, database/storage, background jobs, integrations, idempotency, deployment, and operational handoff.

## Scoring Rule

Each reviewer returns 0-100.

- Pass requires every reviewer score >= 95.
- Any reviewer below 95 returns `fix` and a prioritized repair list.
- Any P0 security/data/delivery issue returns `block` regardless of average score.
- Average score is informational only; the minimum score controls pass/fail.

## Required Output

```markdown
## Four-Role Review

| Reviewer | Score | Verdict | Main Reason |
|---|---:|---|---|
| Top PM |  |  |  |
| Top Code Engineer |  |  |  |
| Top Frontend Engineer |  |  |  |
| Backend Framework Engineer |  |  |  |

Overall: <pass|fix|block>

### Fix Order
1. <highest leverage fix>
```

Do not rubber-stamp. Scores above 95 need evidence, not confidence.
