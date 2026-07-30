# Template: noetron/specs/

Executable specifications — what an executor picks up to actually do the work, written for zero context: every step is `action → verify:`, every task carries its own test cycle and full code, the stop condition is declared up front.

## Scaffold

`noetron-setup` creates only `noetron/specs/README.md`, with exactly this content:

```markdown
# Specs

One file per piece of work: `YYYY-MM-DD-<slug>.md`. A spec derived from a plan reuses
the plan's slug (traceability by name) and requires that plan to be approved. Work
classified as spec-only is specified directly, with `plan: none`. A spec is executable:
tasks with full code (no placeholders), exact interfaces between tasks, a `verify:` on
every step, and a declared stop condition. Lifecycle: ready → in-progress → done | abandoned.
```

## Entry format

````markdown
---
status: ready | in-progress | done | abandoned
date: YYYY-MM-DD
slug: <slug>
plan: <relative path or none>
---

# <Spec title>

**Goal:** the observable outcome when this spec is done.
**Architecture:** two or three sentences.
**Stop condition:** three failed attempts at a step's verify → stop and escalate with
what was tried (a task may override; none may omit).

## Global constraints

- <project-wide requirements copied VERBATIM from the source: version floors, dependency
  limits, naming and text rules, platform requirements — one line each, exact values.
  Every task implicitly includes this section.>

## Task 1: <title>

**Files:**
- Create: `path`
- Modify: `path`
- Test: `path`

**Interfaces:**
- Consumes: <exact signatures from earlier tasks, or none>
- Produces: <exact signatures this task exports>

**Steps:**
- [ ] Write the failing test: <complete test code> → verify: it fails for the expected reason
- [ ] Implement: <complete code> → verify: the test passes and the suite stays green
- [ ] Commit → verify: clean tree

## Acceptance criteria

- [ ] <criterion from the plan/source> — implemented by Task N

## Validation

<the full proof at spec level: commands to run, expected output, checks in the running app>
````

## Rules

- A spec derived from a plan requires the plan to be `approved`; direct specs (`plan: none`) require goal, approach, and acceptance ratified by the user.
- Tasks are bite-sized (2–5 minute steps), each the smallest unit with its own test cycle. Full code always — no placeholders, no "similar to Task N" (repeat the code; tasks may be read out of order).
- The executing agent keeps `status` current, checks off steps and criteria as they pass, and `noetron/state.md` points to the active spec.
- Acceptance criteria are the definition of done: never close work with unchecked criteria — renegotiate with the user instead.
