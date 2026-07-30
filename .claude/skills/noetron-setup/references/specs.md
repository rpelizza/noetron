# Template: noetron/specs/

Executable specifications — what an agent picks up to actually do the work.

## Scaffold

`noetron-setup` creates only `noetron/specs/README.md`, with exactly this content:

```markdown
# Specs

One file per task: `YYYY-MM-DD-<slug>.md`. A spec derived from a plan reuses the plan's
slug (traceability by name) and requires that plan to be approved. Small, mechanical
tasks may be specified directly, with `plan: none`. A spec is executable: steps,
target files, acceptance criteria, validation.
```

## Entry format

```markdown
---
status: ready | in-progress | done | abandoned
date: YYYY-MM-DD
slug: <slug>
plan: <relative path or none>
---

# <Spec title>

## Goal
The observable outcome when this spec is done.

## Steps
1. Ordered, concrete steps an agent can follow without asking what comes next.

## Target files
- `path` — expected change

## Acceptance criteria
- [ ] Verifiable statements — each checkable by running something or reading something.

## Validation
How to prove it works: commands to run, tests, browser checks.
```

## Rules

- A spec derived from a plan requires the plan to be `approved` first; direct specs (`plan: none`) are reserved for small, low-risk tasks.
- The executing agent keeps `status` current, and `noetron/state.md` points to the active spec.
- Acceptance criteria are the definition of done: never close a task with unchecked criteria — renegotiate with the user instead.
