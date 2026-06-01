# China Mainland Delivery Notes

Use this when the target user, deployment, payment, login, map, SMS, content, or customer handoff is in mainland China.

## Product Defaults

- Prefer WeChat-first user journeys when the user expects consumer or SMB adoption: WeChat login, mini program path, public account/service account, and share card behavior.
- For paid products, plan for WeChat Pay and Alipay separately. Do not assume Stripe-only or overseas card payment is acceptable.
- For public web deployment on mainland infrastructure, record ICP filing status, domain owner, entity type, hosting provider, and whether public security filing is relevant.
- For B2B delivery, include exportable Excel/CSV, printable receipts/contracts, role-based permissions, operation logs, and customer service handoff notes.
- For mobile-first usage, optimize for WeChat browser, Android Chrome variants, and slower networks. Avoid layouts that only work on desktop.

## Compliance And Ops Gates

- ICP / domain / hosting: block public launch until owner, domain, hosting region, and filing responsibility are explicit.
- Payment: block live payment until merchant account, callback URL, signing keys, sandbox/live switch, refund path, and reconciliation report are documented.
- Login: block production auth until account binding, union/open id strategy, session expiry, and logout/deactivation path are documented.
- Data: classify PII, business records, uploads, logs, and retention. Do not place customer data in `.test/ai/`.
- Content: for UGC, marketing pages, comments, public profiles, or generated content, document moderation and complaint handling.

## Acceptance Evidence

- Mainland smoke path: WeChat browser or mini program path, desktop browser path if applicable.
- Payment evidence: sandbox order, callback, refund or cancellation, reconciliation export.
- Handoff evidence: deployment region, domain/ICP status, admin account creation, backup/export path, customer support procedure.
- Latency evidence: key page/API tested on mainland network assumptions or with fallback/CDN plan.

## Phase Questions

Ask only what changes the product or delivery path:

1. Is this for mainland public users, private internal users, or overseas users?
2. Does it need WeChat login, WeChat Pay, Alipay, SMS, maps, invoice, or ICP filing?
3. Is the first delivery a web app, mini program, admin panel, CLI/workflow, or customer handoff package?
