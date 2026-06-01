# Commercial Delivery Gate

Use before `/kit-test`, `/kit-pack`, archive, or customer handoff.

## Commercial Readiness Checklist

- Product value is explicit: target user, painful workflow, paid or operational value, and first success moment.
- Scope is bounded: V1 includes only what is needed for the first real user/customer handoff.
- Delivery contents are confirmed: included files, excluded files, evidence, run/open instructions, known risks.
- Data path is real: create/read/update/export or equivalent workflow works with non-demo data.
- Operations are covered: admin access, logs, backup/export, recovery, support workflow, and ownership.
- Security basics are covered: secrets excluded, auth boundary clear, destructive actions confirmed, external writes gated.
- Mainland China gates are checked when relevant: ICP/domain, WeChat/Alipay/SMS/maps/invoice, moderation, network assumptions.
- UI/commercial polish evidence exists when there is a UI: screenshots, responsive check, error/empty/loading states.

## Go / No-Go

- `go`: V1 can be handed to a real user with clear run instructions and known risk notes.
- `fix`: implementation is close but needs `/kit-run fix <scope>` before handoff.
- `block`: user/business/platform decision is missing.

Never claim commercial readiness from green tests alone. Green tests prove only the tested behavior.
