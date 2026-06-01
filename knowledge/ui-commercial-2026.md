# Commercial UI Quality 2026

Use this as the practical UI bar for commercial delivery.

## Current Taste Direction

- Calm enterprise density: compact but readable layouts, strong tables/forms/search/filtering, little decorative noise.
- Confidence over novelty: clear status, audit trail, next action, empty states, loading states, and irreversible-action warnings.
- Accessibility is part of the design system: keyboard path, contrast, focus, target size, reduced cognitive load, plain language.
- AI UI should show sources, confidence, editability, review queue, and rollback. Avoid magical black-box panels.
- Visual polish comes from spacing, typography, hierarchy, state handling, and data fit, not gradients or hero decoration.

## Required UI Gates

- Desktop and mobile screenshots for user-facing surfaces.
- No text overlap, clipped labels, inaccessible icon-only controls, or horizontal overflow.
- Forms have validation, disabled/loading/success/error states.
- Tables/lists have empty, loading, error, filtering/search, pagination or infinite-load behavior.
- Dashboards explain what changed and what action to take next.
- Admin tools prioritize scanability and repeated operation over marketing-style composition.

## Delivery Evidence

- Screenshot set: desktop, mobile, key modal/form, empty state, error state.
- Browser console: no red errors.
- Accessibility spot check: keyboard focus, contrast, target sizes, labels.
- Customer handoff: short operator guide with "daily workflow", "common failure", and "support contact/escalation".

## Anti-Patterns

- One-screen demo that cannot persist data.
- Pretty dashboard with no real filters, export, or action path.
- AI answer box without citations, source freshness, or correction path.
- Mobile layout treated as an afterthought.
- Overbuilt settings pages before the core workflow proves value.
