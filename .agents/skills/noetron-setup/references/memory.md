# Template: `.noetron/history/`

Two memories live in `.noetron/`, deliberately separate. `history/` is **what happened** — one immutable
block per closed task, an audit trail. `learnings.md` is **what to do differently** — the active rules and
the incident log behind them. Merging them produces a log nobody reads.

This file is the format authority for `history/` only. `learnings.md` and `verification-standard.md` are
owned by [`noetron-evolve/templates/`](../../noetron-evolve/templates/): setup copies those templates in as
empty skeletons and `noetron-evolve` maintains them from there. Do not restate their format here — one
format, one file, or they drift.

## `history/README.md`

```markdown
# History

One block per delivery: `YYYY-MM-DD-<slug>.md`, or `YYYY-MM-DD-<slug>-s<N>.md` when a task
delivers several vertical slices. Written at closeout by summarizing the cursor; it also
receives ledger entries rotated out of `state.md` at its 80-line ceiling.

`INDEX.md` is the entry point — one line per delivery. Read the index; open an entry only when
an index line points at it. The directory is never listed.
```

## `history/INDEX.md` — the only part of history read at task start

Reading the whole directory at the start of every exploration is the failure this file exists to
stop: the cost grows with the project's age, is paid by every task, and buys almost nothing, because
the overwhelming majority of past entries have nothing to do with the one in front of you. The index
inverts it — a bounded read that says which entries are worth opening.

```markdown
# History index

One line per delivery, newest first. Signal: `clean` (nothing failed) · `defect` (a confirmed
defect, logged in learnings.md) · `rework` (something had to be redone or corrected twice) ·
`abandoned`. Ceiling 50 lines; older lines live in INDEX-archive.md.

- 2026-08-04 · `rate-limit` s2/3 · standard · merged · defect → `2026-08-04-rate-limit-s2.md`
- 2026-08-03 · `rate-limit` s1/3 · standard · merged · clean → `2026-08-03-rate-limit-s1.md`
```

**Budget: 50 lines, hard.** At the ceiling the oldest lines move, in order, into
`history/INDEX-archive.md` (append-only, never read at task start) until 40 remain. Entry files never
move: the filename is the address every index line, plan, and spec points at.

The **signal** is what makes the index sufficient for mining. `noetron-evolve` looks for rework,
corrections of corrections, and decisions made twice — all three are visible in the signal column, so
it opens only the `defect` and `rework` entries since the marker instead of every entry. A `clean`
line is read as one line and closed.

## Entry format

```markdown
---
date: YYYY-MM-DD
slug: <task-slug>
slice: <k>/<N> — <slice title>   # omit when the task delivered once
type: feature | fix | refactor | chore | docs
tier: trivial | small | standard | large | bug
signal: clean | defect | rework | abandoned
plan: <relative path or none>
spec: <relative path or none>
---

# <Task title>

**Request:** what the user asked for, in one or two sentences.
**Outcome:** what was delivered, and where it went (merged, PR, kept local).

## Files touched
- `path` — what changed

## Decisions
Made during the task, and why, with the ADR link when one was recorded.

## Ledger (rotated)
Only when `state.md` crossed its ceiling mid-task. Resolved task lines, in order.

## Notes — follow-ups, deferred findings, known limitations. Omit when there are none.
```

**Budget: 60 lines per entry, hard.** Past it, the entry is re-telling the task instead of recording
it — the reasoning already lives in the plan, the steps in the spec, the diff in git. Cut `## Files
touched` to the paths that carry meaning and point `## Decisions` at the plan.

## One delivery, one entry

A task that reaches a destination once produces one entry. A task whose plan declares several
**independently deliverable slices** produces **one entry per delivered slice**, named
`YYYY-MM-DD-<slug>-s<N>.md`, written when that slice reaches its destination — not held back until
the last one. The slug still joins everything: plan, spec, branches, and every slice entry share it,
and `slice: <k>/<N>` says which delivery this was.

That is the point of slicing at all. An entry written only at the end of a four-slice task means
three deliveries left no record, and a chain interrupted after slice 2 shows a history that says the
work never happened.

## Immutable, with one named exception

An entry is **written once and never rewritten** — editing the past hides the pattern
`noetron-evolve` mines for. The one exception is mechanical and decidable: while `state.md` names a
slug as active, **that slug's current entry is open** and receives ledger lines rotated out of the
cursor at its 80-line ceiling. Closeout writes the summary, sets `signal:`, adds the index line, and
**closes** it. Every entry whose slug is not the active one in `state.md` is immutable, full stop.

Without that exception the ceiling had nowhere to spill: `state.md` rotated into a file that closeout
would later claim to create fresh, so either the rotation was lost or the "written once" rule was.

## Rules

- A deferred review finding, a parked adjudication, and an abandoned task all still get an entry. Work
  that produced no code still produced a decision.
- **Every entry gets exactly one index line, written in the same closeout.** An entry with no index
  line is unreachable — nothing lists the directory.
- `noetron-evolve` reads the **index lines** since the review marker in `domain-skills.md` and opens
  only those flagged `defect` or `rework`. Quiet territory costs one line, not one file.
- Ten **distinct task slugs** among the index lines past that marker trigger `noetron-finish` to offer
  a skills review — slices of one task count once, because the trigger measures tasks, not deliveries.
  The offer never blocks.
- An observation that belongs to one task stays in its `## Notes`. It is promoted into `learnings.md` only
  when it recurs — promotion rules belong to `noetron-evolve`.

---

**This memory is working if:** every delivery has exactly one entry and exactly one index line; no
closed entry is ever edited; `INDEX.md` stays under 50 lines however long the project runs; a
skills review reads a bounded number of entries rather than the whole directory; and a rework
pattern never appears three times without a rule or a skill to show for it.
