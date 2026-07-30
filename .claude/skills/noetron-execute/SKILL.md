---
name: noetron-execute
description: Use when a spec with status ready needs to be executed task by task, when resuming an interrupted or compacted execution, or when the user asks to implement an approved plan or spec.
---

# Noetron Execute

The harness's loop engine. Runs a `status: ready` spec task by task, continuously, inside the boundary the plan and spec ratified. Every step runs as the node contract demands — action, oracle, stop condition — and the only pauses are exceptions, never courtesy.

No ready spec → this skill does not run; route through `noetron-plan`'s chain classifier first.

## Execution modes

Recommend and ratify the mode at kickoff — one compact confirm, together with the branch and isolation prepared by `noetron-branch` and the commit strategy — and record it in `noetron/state.md`:

| Mode | When |
|---|---|
| **subagents** (preferred when available) | fresh implementer per task, handoff by file — keeps the coordinator's context clean for coordination |
| **inline** (fallback) | no subagent capability: the coordinator implements directly, same task cycle, same oracles |
| **agent-team** | only when real role parallelism is warranted and the user opts in; write tasks still serialize |

Executors always run at the session's model and effort — never downgraded to save cost.

**Parallelism rule: writes serialize, reads fan out.** Never two implementers at once — concurrent writes are the most documented failure mode of orchestrated execution. Read-only nodes (investigation, research, review) may run in parallel freely.

## The ledger

Two layers, split by durability:

- **`noetron/state.md`** (versioned) — the crash-recovery point: `phase: execute`, pointer to the active spec, one `Task N: complete` line per finished task under Progress, decisions mirrored. Updated at every task completion and phase change. **After compaction, trust the ledger and `git log` over your own memory** — a task with a `complete` line is DONE; never re-dispatch it; resume at the first task without one.
  **Bookkeeping is never task content:** `state.md` and spec checkbox updates stay in the working tree and are committed only at closeout, in `noetron-finish`'s metadata commit — task commits carry exclusively lines that trace to the task.
- **`noetron/work/<slug>/`** (ephemeral) — created at execution start with a self-ignoring `.gitignore` (containing `*`); holds the file handoffs: task briefs, reports, review packages. It belongs to this slug alone — another slug's directory is never yours to read or write. Deleted at completion, after the history entry: git history is the record then. (`git clean -fdx` destroys it; recover from `state.md` + `git log`.)

## The task loop

Run for each task, in spec order, without pausing between tasks.

1. **DISPATCH** — hand off by file, never by pasted context. Extract the task's text verbatim to `work/<slug>/task-N-brief.md` and dispatch with exactly the six elements of the [Dispatch contract](references/dispatch.md) — including the domain skills covering the task's territory. Never paste the whole spec or plan; never paste accumulated history.
2. **EXECUTE** — the implementer follows the task's embedded cycle (failing test → fails for the expected reason → minimal implementation → passes, suite green → commit), running each step's `verify:`. A material gap stops the task: delegated agents never interview the user — they return `NEEDS_CONTEXT` with the named gap, options, and recommendation (`noetron-interview` gap mode); the coordinator interviews and re-dispatches.
3. **REPORT** — status is one of `DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED`; full detail in the report file, at most 15 lines back (contract in [Dispatch](references/dispatch.md)).
4. **VERIFY** — the coordinator applies `noetron-verify`: the report is claims, the diff is truth. Inspect the diff; every changed line traces to the task.
5. **REVIEW** — per-task review under `noetron-review`: the two lenses (blind spec + quality), severities, and the pre-report gate live there; the review package and paths come from the [Dispatch contract](references/dispatch.md). Never pre-judge the reviewer: if the prompt you are writing contains "don't flag", "don't treat X as a defect", or "at most Minor" — stop; you are pre-judging to spare yourself a fix loop.
6. **FIX LOOP** — cap **5**:
   - Rounds 1–3: resume the **original implementer** with the findings verbatim — its context is intact.
   - Rounds 4–5: dispatch a **fresh implementer** framed as: "a previous implementer tried this task 3 times; it is yours now — read the report for what was tried." Fresh eyes, same model (it is already the maximum).
   - After every fix: exactly one **scoped re-review** — the findings plus the fix diff, nothing more; out-of-scope observations go to the ledger as deferred, and never extend the loop.
   - **At the cap, the circuit breaker:** adjudicate each open finding — (a) contestable → park with a written ruling; (b) real but nothing depends on it → park as deferred; (c) real and **load-bearing** (a later task builds on it, or it reveals a spec defect) → mark `Task N: BLOCKED`, stop, escalate with the finding, the spec text, and the fix history. Every adjudication is a ledger entry; silent discard is forbidden. Adjudicating **before** the cap is pre-judging with another name.
   - The coordinator never fixes findings itself — its context stays clean for coordination, and coordinator fixes escape review.
7. **COMPLETE** — ledger line in `state.md`, check off the task's steps in the spec, next task.

## Stops

The only reasons to pause a running execution:

- a material gap (`noetron-interview` — the mandatory stop);
- `BLOCKED` the coordinator cannot resolve (including the circuit breaker's case c);
- a contradiction between spec and reality → back to `noetron-spec` / `noetron-plan`;
- all tasks complete.

"Should I continue?" between tasks and mid-run progress summaries waste the human — narration stays at one short line between tool calls; the ledger carries the record.

## Completion

All tasks done → run the spec's **Validation** section in full (the spec-level oracle) → check acceptance criteria one by one → `status: done` on the spec. Present the synthesis with evidence (attestation oracle) and hand off: the final review pass to `noetron-review`, then integration and closeout to `noetron-finish`. `work/<slug>/` is deleted only after the history entry exists.

## Red flags

- Re-dispatching a task whose `complete` line is in the ledger — compaction amnesia; trust the ledger.
- Pasting spec, plan, or session history into a dispatch.
- Two implementers running at once.
- Fixing review findings in the coordinator's own hands.
- Pre-judging a reviewer, or skipping the scoped re-review "because the fix was small".
- Adjudicating findings before the cap to end a loop early.
- Proceeding to a dependent task over a load-bearing parked finding.
- Pausing between tasks to ask permission the spec already granted.

## Integration

- `noetron-spec` — the input; contradictions found mid-run return there.
- `noetron-interview` — gap mode is this skill's mandatory stop; delegated agents escalate via `NEEDS_CONTEXT`.
- `noetron-verify` — every claim, every report-vs-diff check, the final Validation.
- `noetron-explore` — read-only investigation nodes, freely in parallel.
- `noetron-plan` — chain classification happens there before this skill ever runs.
- `noetron-review` — per-task and final review protocol; the fix loop consumes its findings.
- `noetron-debug` — a failing oracle whose cause is not evident routes there before more attempts.
- `noetron-finish` — integration and closeout after the final review.
- `noetron-design` — frontend tasks load it alongside this skill.
- `noetron-branch` — clears the ground before the first write; part of the kickoff confirm.
- `noetron-security` — overlays every task whose territory includes a sensitive surface.

---

**This skill is working if:** specs run start to finish without mid-run permission prompts; no completed task is ever re-dispatched after a compaction; the coordinator's diffs contain no implementation of its own; and every fix loop that hits the cap leaves a written adjudication per finding.
