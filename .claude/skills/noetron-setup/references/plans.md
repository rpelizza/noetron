# Template: noetron/plans/

Every plan produced together with the human — the captured outcome of a planning conversation, before any execution starts.

## Scaffold

`noetron-setup` creates only `noetron/plans/README.md`, with exactly this content:

```markdown
# Plans

One file per plan: `YYYY-MM-DD-<slug>.md`. A plan records the outcome of a planning
conversation — objective, scope, decisions, approach, risks. It is NOT executable;
the executable version is the spec in `noetron/specs/` with the same slug.
Lifecycle: draft → approved → executed | abandoned.
```

## Entry format

```markdown
---
status: draft | approved | executed | abandoned
date: YYYY-MM-DD
slug: <slug>
spec: <relative path once derived, or pending>
---

# <Plan title>

## Objective
What we want to achieve and why.

## In scope
## Out of scope

## Decisions
Decisions made with the user during planning. Open questions stay here, marked (open),
until resolved with the user — never resolved by silent default.

## Approach
The intended path, at plan altitude — no file-by-file detail; that belongs to the spec.

## Risks
What could go wrong and how we would notice.
```

## Rules

- A plan only moves to `approved` with the user's explicit approval; only approved plans may derive specs.
- Substantial work always starts with a plan. Small, mechanical tasks may skip straight to a spec (see `specs.md`).
- Mark the plan `executed` when its spec completes, or `abandoned` (with a one-line reason) when dropped.
