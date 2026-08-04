# Template: `.noetron/state.md`

The cursor of the active task — the crash-recovery point, and after compaction the authority that outranks
memory. It is a cursor, not a diary: narration belongs in the report, decisions in the plan, finished tasks
in `history/`.

## Scaffold

`noetron-setup` writes the idle state, exactly:

```markdown
---
task: none
status: idle
---

# State

No task in progress.
```

**A missing `status:` is not `idle`.** The scaffold above *states* idleness; a file that carries no
`status:` key at all — one migrated from the legacy `noetron/` layout, or hand-edited — states nothing,
and it is **unknown**, which routes to `noetron-recovery` before anything classifies. The failure is
concrete: `noetron-core` routes on `status: active`, so a live task recorded in a shape that predates the
field reads as "present and idle", `noetron-router` closes a fresh G0 over it, and the front matter of a
running task is overwritten in one write ([migration.md](./migration.md) § 2).

## Active-task format

```markdown
---
task: <short imperative title>
slug: <task-slug>
status: active
tier: trivial | small | standard | large | bug
phase: explore | branch | interview | plan | spec | execute | review | debug | finish
scope: <package paths the task touches — omit in a single-package repository>
branch: <branch> @ <base-ref> (<short-sha>)
isolation: branch | worktree
mode: inline | subagents | agent-team
commits: granular | squash-final
cadence: per-slice | single-delivery
slices: <N>            # omit when the chain produced no plan
slice: <k> — <title>   # the slice being executed now
plan: <relative path or none>
spec: <relative path or none>
stash: <name> — <what> # only while a preservation is unresolved
---

# <Task title>

## Delivered
- s1 <slice title> — merged into `main` · `feat/<slug>` @ `a1b2c3d` · 2026-08-03 → `history/2026-08-03-<slug>-s1.md`

## Ledger — slice <k>
- Task 1: complete
- Task 2: complete
- Task 3: in progress
- Task 3: fix round 2/5
- Task 4: BLOCKED

## Decisions
- <decision> — user | agent proposal ratified by the user, <date>

## Next — what the next session does first if work resumes here
```

Task numbers **run continuously across slices** — slice 2 opens at `Task 5`, not at `Task 1`
(`noetron-spec` § Slices). The ledger section resets per slice; the numbering does not, so a line
read after a compaction identifies one task in the whole spec.

**The short chains key the same lines on `Change`.** `trivial`, `small`, and `bug` hold one unit of
work and produce no plan, so they have no task number and no slices: their ledger lines are
`Change: in progress` and `Change: fix round <k>/5`, under a plain `## Ledger` with no slice suffix
(`noetron-execute` § The short cycle). Same lines, same meanings, one key — a cap keyed on a number
that chain never has is a cap that cannot be written down.

The front matter from `tier` through `commits` is exactly what gate G0 ratified. `cadence` is
ratified one gate later, at **G1 with the plan** — G0 fires before the plan exists, so the slices it
would decide between are not yet known; `slices` and `slice` come from that same approved plan. There
is no `review:` field — the two review lenses are always split, never a per-task choice, so recording
it would be a question nobody should be asked, and a literal reading would hand it back to G0 as an
item.

**`phase:` names a node of the graph, and it names all of them.** The enum is the router's node set, in
the order a chain meets them; its only job is to say where a resumed session re-enters, so a value the
graph can be at and the enum cannot name is a re-entry point that does not exist. An enum shorter than
the graph does not fail loudly — it degrades into the nearest legal value. Measured: with the five-value
enum, a `small` chain compacted between G0 and its first write had `execute` as the only legal value
naming anything in its chain, so recovery re-entered at `noetron-execute`, which commits — with
`noetron-branch` never having run, no protected guard, no resolved base, no baseline. The commit landed
on `main`. `noetron-recovery` § 3 carries one re-entry rule per value.

The `slug` names everything the task produces: the branches, the plan, the spec, every history entry.
`scope` names the packages the work may touch — `noetron-branch` reads it to build the verification
set, and a diff outside it is a scope change that returns to G0, not a judgement call for the executor.

## The delivery cursor

`cadence`, `slices`, `slice`, and `## Delivered` are what let one task reach a destination more than
once. `cadence: per-slice` means each independently deliverable slice runs
`execute → review → G2 → finish` on its own and lands before the next one starts;
`single-delivery` means the whole spec integrates once at the end. A chain with no plan writes
neither field.

- **`slice` is the resume point.** A session resuming reads `## Delivered` first: those slices are
  integrated and are never re-executed, whatever the ledger below says. Then it re-enters at
  `slice: <k>`, at the first ledger line without `complete`.
- **`## Delivered` is append-only and survives every rotation.** It is the shortest true answer to
  "what does the user already have?", and it is the line the field failure could not produce — a run
  that stopped at task 5 of 8 with nothing integrated had no such section to be empty.
- **Each line carries its branch and its tip SHA, because "delivered" is a question about the base.**
  For the slice loop there are only two categories, and remembering which menu option the user picked
  is not how either is decided: **the base already carries this slice** (a local merge), or **it does
  not** (a PR still open, or *keep the branch*). `git merge-base --is-ancestor <tip-sha> <base>`
  answers it, which is why the SHA is in the line and not only in the history entry. The same SHA is
  what makes "a squash never rewrites a delivered commit" checkable rather than trusted.
- **`branch` is the active slice's branch**, rewritten when the next slice cuts its own. The previous
  slice's branch is recorded in its `## Delivered` line and in its history entry.
- **The ledger resets per slice.** When a slice closes, its resolved lines migrate into that slice's
  history entry and the section restarts as `## Ledger — slice <k+1>`. That, not the ceiling, is what
  normally keeps this file short.

## Every field has a writer

This file is read by almost every skill in the harness, which is precisely why a field here can look
finished while nothing in the harness ever writes it. Each row names **who writes it and when**.

| Field or section | Written by | When |
|---|---|---|
| `task: none`, `status: idle` — the scaffold | `noetron-setup` | at install, and when a legacy workspace is migrated |
| `task`, `slug` | `noetron-router` | closing G0 — the whole front matter in one write, and only after the one-task check below |
| `status: active` | `noetron-router` | same write; this is the flag `noetron-core` routes on |
| `status: idle` | `noetron-finish` | closeout of the last slice, or abandonment |
| `tier` | `noetron-router` | at G0 — `bug (<size>)` in the bug chain |
| `phase` | `noetron-router` | at G0 with the chain's first node, then once per node transition as it walks the graph; every node label the graph draws is a legal value |
| `scope` | `noetron-router` | at G0, workspaces only |
| `branch` | `noetron-router`, then `noetron-branch` | the router writes the ratified name and base; `noetron-branch` rewrites it with the resolved short SHA, and again for each slice's branch |
| `isolation`, `mode`, `commits` | `noetron-router` | at G0 |
| `cadence`, `slices`, `slice: 1` | `noetron-plan` | on approval at G1, from the approved slice table |
| `slice: <k+1>` | `noetron-finish`, `noetron-recovery` | `noetron-finish` at the closeout of a non-final slice, **after** its `## Delivered` line and in **one write** with the new `## Ledger — slice <k+1>` header; `noetron-recovery` rolls it back to `slice: <k>` when the cursor is ahead of every destination git and `history/INDEX.md` can show (§5) |
| `plan` | `noetron-router`, then `noetron-plan` | `none` at G0; the path the moment the plan file exists |
| `spec` | `noetron-router`, then `noetron-spec` | `none` at G0; the path the moment the spec file exists |
| `stash` | `noetron-recovery` | written when the user accepts a preservation (§7); read and cleared by the same skill when the preserved work is restored or the user releases it (§2.3) — the field is not dropped by anyone else, closeout included |
| `direction contract →` pointer | `noetron-design` | when the contract block lands in the plan |
| `## Delivered` | `noetron-finish`, `noetron-recovery` | `noetron-finish` **first of the closeout's writes** — before the cursor, and before the destination is executed, so the record travels to the destination with the code; append-only, and it migrates whole into the last (or abandoning) closeout's history entry. `noetron-recovery` writes the line a crashed closeout owed, when the base or `history/INDEX.md` shows the destination happened (§5) |
| `## Ledger` — `Task N: in progress` | `noetron-execute` | at DISPATCH, before the task's first write; replaced at COMPLETE |
| `## Ledger` — `Task N: complete` | `noetron-execute` | the moment a task ends — **after** its review and its fix loop — in the working tree |
| `## Ledger` — `Task N: fix round <k>/5` | `noetron-execute` | before dispatching each fix round; cleared at COMPLETE |
| `## Ledger` — `Change: in progress`, `Change: fix round <k>/5` | `noetron-execute` | the short chains' own key: at BRIEF, and before each fix round; both replaced by the closing ledger line |
| `## Ledger` — `Task N: BLOCKED` | `noetron-execute` | at the circuit breaker, when a load-bearing finding survives the cap |
| `## Ledger` — rotation at the 80-line ceiling | `noetron-execute` | mid-task, the moment this file crosses 80 lines — the resolved lines move into the slug's **open** history entry |
| `## Ledger` — a `Task N: in progress` line restored, or the section header realigned with the cursor | `noetron-recovery` | when a commit implements a task the ledger never recorded (§4), and when the header names a slice the cursor has left (§5) |
| `## Ledger` — migration and per-slice reset | `noetron-finish` | at closeout: the resolved lines migrate into the history entry **after** the `## Delivered` line; the new `## Ledger — slice <k+1>` header is written **with the cursor, in the same write** |
| `## Decisions` | `noetron-interview` | when a decision is ratified — one pointer line, never the reasoning |
| `## Next` | `noetron-execute` | at every stop that pauses a running chain |

**A field with no writer named in this table is a defect in the harness, not a blank someone forgot
to fill.** The failure mode is silent and it has recurred: `commits`, `review: combined`,
`learnings.md`, `verification-standard.md`, `status: active`, `phase:` — each was ratified or
declared, each had readers, none had a writer, and every occurrence read as *the agent forgot* until
someone went looking for the instruction and found there was none. So the rule is structural, not a
reminder: **a field, a section, or an artifact enters this harness together with the skill that
writes it and the moment it writes it, in the same change, or it does not enter.** Adding a reader is
not adding a field.

**The mirror defect is a write with no row**, and it is the one a reader cannot see: `noetron-recovery`
wrote `## Delivered` and `slice:` for a whole round while this table named only `noetron-finish`, so
anyone auditing by walking the table found two rows that checked out and never learned there was a
third writer. A skill that writes into this file adds its row **in the same change**, exactly as a new
field does — the table is append-friendly on purpose, one row per (field, writer, moment), and two
skills writing one field is two names in one row, never a silent second author.

Auditing it is one pass and it is falsifiable in both directions: for every row, open the named skill
and find the sentence that instructs the write; for every field, section, and ledger line shape in the
format block above, find its row. `scripts/sync-noetron.mjs --check` runs exactly that, both ways, on
every sync — a row whose skill does not mention the field, and a field the table forgot, are each
reported with their own name.

## Rules

- **Ceiling: 80 lines.** At the ceiling, the oldest resolved ledger entries migrate to the active
  slug's **open** history entry (`.noetron/history/YYYY-MM-DD-<slug>[-s<N>].md`, `## Ledger (rotated)`)
  and leave one index line behind. `## Delivered` never migrates.
- **The rotation is `noetron-execute`'s write, mid-task, and it writes into the entry the closeout
  will finish.** It is not a closeout step: it fires while the task loop is running, which is the only
  time this file grows. The entry it opens keeps **the date it was opened on**, and the closeout
  completes *that* file rather than creating one dated today
  ([memory.md](./memory.md) § Immutable, with one named exception). Two files for one delivery leaves
  the first with no index line, and an entry with no index line is unreachable — nothing lists the
  directory.
- Write a ledger line the moment a task completes, in the working tree — it travels in the closeout
  metadata commit. One commit per task to record progress produces stray history and is not done.
- **`Task N: complete` means *reviewed*, not *committed*.** `noetron-execute` writes it at COMPLETE,
  after the review and the fix loop; `Task N: in progress` is what a dispatched-but-unfinished task
  carries. The distinction is the whole point of having two lines: without it, a commit is the only
  evidence a resuming session has, and a commit proves implementation and says nothing about review.
  No skill writes `complete` from the existence of a commit — `noetron-recovery` § 4 restores
  `in progress` and sends the task back through REVIEW.
- One task at a time. A second task arriving while one is active is a conflict to surface, never a
  silent swap. It is enforced at **all three** points a second task can arrive, because a rule enforced
  at two of them is a rule the most common path walks around: `noetron-core` detects it on the first
  read of this file, `noetron-recovery` §2.1 states it and hands the choice to the user, and
  `noetron-router` re-reads `status:` **immediately before** the single write that closes G0 — the
  mid-session arrival, which reaches neither of the other two and whose one write would otherwise
  overwrite a live task's `## Delivered`, ledger, and `## Decisions` along with its front matter.
- **A recorded `stash:` outlives the field it lives in.** It is the one preservation a later session
  cannot reconstruct from the tree: a stash is invisible in `git status`, survives every branch switch,
  and is named by nothing else. So the field has a reader (`noetron-recovery` §2.3) and a moment it is
  cleared, and the closeout that rewrites this file as the idle scaffold **surfaces a standing
  `stash:` line before the reset erases it** — dropping the record does not drop the stash, it only
  drops the only thing that knew about it.
- **`## Next` is read at resume, before the node is re-entered.** It is the only field whose reader is
  a session that did not witness the stop, so `noetron-recovery` reads it in the same sweep as the
  cursor and re-enters where it points: a chain stopped at a material gap resumes at
  `noetron-interview` with the question, not at the task that was already waiting for the answer.
- On closeout, `noetron-finish` writes the history entry, adds its index line, and moves the cursor:
  **to `slice: <k+1>` when slices remain, to idle only when the last one is delivered.** A finished
  task that left `status: active` behind means the chain never reached `finish`; a task reset to idle
  with slices still undelivered means the rest were dropped silently.
- **`k` there is the slice the delivery *ended on*, which is not always the one this field shows.**
  A delivery unit can span several slices — a `deliverable: no` slice plus the one it lands with —
  and nothing moves this cursor while `noetron-execute` crosses between them, so at closeout it still
  names the unit's **first** slice. `noetron-finish` takes `k` from the slice whose heading carries
  the `### Slice validation` it just ran, and asks "last delivery?" of that `k`. Asking it of this
  field instead compares a trailing number against `slices`, never finds equality on a spec whose
  last unit spans two slices, and leaves a fully delivered task at `status: active` forever.
- **One order for the closeout's writes into this file, and every file states the same one:** the
  `## Delivered` line first; then the resolved ledger lines migrate into the history entry; then the
  cursor and the new `## Ledger — slice <k+1>` header, **in one write**. Delivered first, so every
  crash in between leaves evidence ahead of claim — a delivery recorded and a cursor one short, which
  `noetron-recovery` §5 settles by advancing the cursor. Cursor and header together, because a cursor
  at `k` sitting over a header at `k+1` is a state no recovery rule names and a closeout has no reason
  to invent. Two files prescribing two orders leave the recovery with no expected state to compare
  against.
- **The bookkeeping is committed before the destination is executed**, so the `## Delivered` line is
  written while the merge or the push is still ahead of it. That does not make it a guess — the code
  is committed and the destination is the one G2 ratified — but it does mean **git, not this file,
  says whether the slice landed**: a crash between the metadata commit and the destination leaves a
  line whose destination never ran. `noetron-recovery` §5 checks the line against the base and
  re-enters at the destination step, never at execution.

---

**This cursor is working if:** a session resuming after a crash or a compaction re-dispatches no
completed task and re-delivers no slice listed under `## Delivered`; the file stays under 80 lines
through a large task; at any moment during a `per-slice` task, `## Delivered` answers "what can
the user use right now?" without opening another file; `phase:` always names a node the graph actually
draws; every field in the format above appears in the writer table with a skill that actually
instructs the write, and every skill that writes here appears in the table.
