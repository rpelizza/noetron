---
name: noetron-spec
description: Use when an approved plan needs its executable spec, when a task classified as spec-only (goal, approach, and acceptance already ratified) needs specification before execution, or when the user asks for a spec, decomposition into tasks, or an implementation breakdown.
---

# Noetron Spec

Turn an approved plan (or directly ratified requirements) into the executable spec — the artifact an executor picks up and runs without asking what comes next. The spec is where the harness's node contract materializes: **every step is `action → verify:`**, every task carries its own test cycle, and the stop condition is declared before execution starts.

Write for an executor with **zero context and questionable taste**: skilled, but knowing nothing of this codebase, its toolset, or the planning conversation. Everything the executor needs is in the spec — exact and complete.

## Sources

| Chain | Source required |
|---|---|
| Plan + spec | a plan with `status: approved`, same slug — never an unapproved draft |
| Spec only | goal, approach, and acceptance ratified by the user (recorded by the chain classifier), `plan: none` |

No valid source → back to `noetron-plan`. A spec is a translation, never a decision: any choice the source does not cover is a gap for `noetron-interview`, and any contradiction with the source goes back to the plan — silent drift is forbidden.

## Task rules

- **Bite-sized:** every step is a 2–5 minute action. A task is the smallest unit that carries its own test cycle and that a reviewer could reject while approving its neighbor. Fold setup, config, and scaffolding into the task whose deliverable needs them.
- **Full code, no placeholders.** Every task contains the complete, real code — test code included. Never write: "TBD", "TODO", "implement later"; "add appropriate error handling / validation / edge cases"; "write tests for the above" without the test code; **"similar to Task N"** (repeat the code — tasks may be read out of order); steps that describe *what* without showing *how*; references to types or functions no task defines.
- **The embedded cycle** in every task: write the failing test → run it, see it fail for the expected reason → minimal implementation → run it, see it pass with the suite green → commit.
- **Interfaces are the seams between tasks.** Each task declares `Consumes` (exact signatures from earlier tasks) and `Produces` (exact signatures it exports) — that block is how an isolated executor learns its neighbors' names and types.
- **Global constraints travel verbatim.** Copy the source's project-wide requirements — version floors, dependency limits, naming and text rules, platform requirements — one line each, exact values. Every task implicitly includes this section, and reviewers use it as their attention lens.
- **Stop condition declared in the header:** by default, three failed attempts at a step's verify → stop and escalate with what was tried. A task may override; no task may omit.

Format authority: `noetron/specs/README.md` and the `noetron-setup` template (`references/specs.md`).

## The spec loop

### 1. SOURCE
Verify the source per the table above. Read it whole — the spec covers all of it, not the memorable parts.

### 2. EXPLORE
Re-verify through `noetron-explore` every fact the tasks will touch: current signatures, real paths, existing patterns. Code blocks written from stale or imagined facts are broken on arrival.

### 3. DRAFT
Write `noetron/specs/YYYY-MM-DD-<slug>.md` (same slug as the plan; `plan: none` for spec-only), `status` unset until ready. Header (goal, architecture, stop condition, global constraints), then tasks per the rules above, then acceptance criteria, then validation.

### 4. SELF-REVIEW
Four axes, all mandatory:
1. **Coverage** — for each acceptance criterion of the source, name the task that implements it. List every gap found.
2. **Placeholder scan** — hunt the prohibited list; any hit is rewritten with the real content.
3. **Interface consistency** — the same function must have the same name and signature in every task that mentions it; `clearLayers()` in Task 3 and `clearFullLayers()` in Task 7 is a bug, not a detail.
4. **Oracle presence** — every step has its `verify:`; every task has its own test cycle; the header has its stop condition.

### 5. STRESS
Mandatory and integral: run `noetron-interview` (focused stress) against the full spec — no exemption for specs derived from freshly stressed plans. New decisions discovered in translation are resolved with the user; findings that contradict the plan send the work back to `noetron-plan`.

### 6. READY
Present the synthesis; the user ratifies → `status: ready`. Only ready specs execute. Ratification is an attestation oracle.

### 7. HANDOFF
Execution belongs to `noetron-execute`. Mark acceptance criteria as the executor completes tasks; `noetron/state.md` points to the active spec throughout.

## Red flags

- Any entry from the placeholder list — including "similar to Task N".
- A step without `verify:`, a task without its own test cycle, a header without a stop condition.
- Writing a spec from a draft plan, or from memory instead of the source document.
- Code blocks invented without re-verifying current signatures via `noetron-explore`.
- Deviating from the plan silently — deviation is a gap or a plan revision, never a spec-side choice.
- Skipping the stress because "the plan was just stressed".
- Acceptance criteria that no task implements — or tasks that no criterion justifies.

## Integration

- `noetron-plan` — the approved source; contradictions found here return there.
- `noetron-interview` — mandatory integral stress; every translation-time decision.
- `noetron-explore` — re-verification of every fact the tasks touch.
- `noetron-verify` — the spec's oracles are what it will run at claim time.
- `noetron-execute` — runs the ready spec, task by task.

---

**This skill is working if:** executors finish tasks without asking what comes next; specs contain zero placeholders on arrival at execution; interface mismatches between tasks are caught at self-review, not at runtime; and every acceptance criterion traces to a named task.
