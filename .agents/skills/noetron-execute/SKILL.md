---
name: noetron-execute
description: Use when work ratified at gate G0 needs implementing — a ready spec run task by task, a single change in the trivial or small chain, or a fix in the bug chain; also when resuming an interrupted or compacted execution.
---

# Noetron Execute

The harness's loop engine. It runs **every mutating chain**, inside the boundary G0 ratified.

| Chain | What it runs |
|---|---|
| `trivial` / `small` | [the short cycle](#the-short-cycle--trivial-small-bug): brief → cycle → verify → commit → (small) scoped review |
| `bug` | the short cycle in regression form: red → fix → red-green → commit → scoped review |
| `standard` / `large` | [the task loop](#the-task-loop), over a `ready` spec, task by task |

Two engines, because the loop that serves a spec has nothing to iterate over without one. Below
`standard` the request itself is the contract and the short cycle writes it down. This skill never
refuses a chain — a chain whose engine declines to run is a chain with no engine.

Kickoff — tier, branch, isolation, mode, commits — is ratified at **G0 by `noetron-router`** before
this skill starts, and recorded in `.noetron/state.md`. Read it; do not re-ask.

## Execution modes

| Mode | When |
|---|---|
| **subagents** (preferred when available) | fresh implementer per task, handoff by file — keeps the coordinator's context clean |
| **inline** (fallback) | no subagent capability: the coordinator implements directly, same cycle, same oracles |
| **agent-team** | real role parallelism, user opted in; write tasks still serialize |

Executors always run at the session's model and effort — never downgraded to save cost.

**Parallelism rule: writes serialize, reads fan out.** Never two implementers at once. Read-only
nodes (investigation, research, review) run in parallel freely.

### Mode names who implements — never who reviews

`inline` is a statement about where the code is written, and G0 recommends it at `trivial` and
`small` because a one-file change does not repay a handoff. It is not a licence to grade your own
work: `noetron-review` lists reviewing your own implementation as a red flag precisely because the
context that wrote the code cannot see what the code is missing — it remembers the intention and
reads it back off the page. So the review node runs in a **fresh context in every mode**:

- **Delegation available (the normal case, `inline` included)** — the coordinator implements, then
  *dispatches* the review to a fresh agent with the review package — **two dispatches wherever two
  lenses apply**, per [Which lenses are dispatched](#which-lenses-are-dispatched). This costs almost
  nothing: a reviewer's briefing is two or three paths plus element 3, never the session.
- **No delegation capability at all** — the **quality** lens runs as a **declared self-review**: read
  the diff from the review package **file** rather than from the memory of writing it, judge it
  against the brief and the harness floor, and open the report with the exact line `self-review — no
  independent reviewer available`. **The spec lens is recorded as not run** — a context holding the
  report cannot be blind to it, and a self-review claiming both lenses is the false oracle this whole
  section exists to prevent. Both facts enter the ledger as `⚠️ Cannot verify` class markers and
  surface again at G2, so the user integrates knowing exactly which lens was missing.

A degraded review that names its degradation is usable evidence. One that presents itself as
independent is a false oracle, and `noetron-verify` treats it as such.

### Which lenses are dispatched

`noetron-review` holds **two lenses, and they are never one reviewer**. This skill is what turns that
rule into dispatches, and **the packages differ** — a reviewer that has already read the
implementer's report cannot be made blind to it afterwards.

| Review | Dispatches | What each package carries | Report file |
|---|---|---|---|
| per task, `standard` / `large` | **two, in parallel, blind to each other** | **spec lens:** the brief + the review package (diff), and nothing else · **quality lens:** brief + report + review package + the spec's Global constraints | `review-N-spec.md` · `review-N-quality.md` |
| the scoped review of `small` and `bug` | one — the **quality** lens | brief + report + review package | `review-quality.md` |
| a delivery's final review | one — the **quality** lens over the whole range, pointed at the ledger's deferred Minors (`noetron-review` § Final branch review) | the full package | `review-final[-s<k>]-quality.md` |

`<lens>` takes exactly two values, `spec` and `quality`, and **the dispatch that creates the file
writes it** — it is not a placeholder left for the reviewer to resolve. A review file still carrying
`<lens>` is a verdict nobody can attribute to a lens.

**The spec lens never receives the report, the implementer's rationale, or a summary of either.** Its
entire value is reading the diff against the contract without knowing what the author meant, so one
paragraph of context turns it into a second quality lens with the same blind spots. The shape this is
written against is the cheap one: dispatch a single reviewer with all three paths, and the transcript
satisfies both rows of `noetron-review`'s lens table while the run satisfies neither — the compliance
lens never existed, and the ledger records "review clean".

## The ledger

- **`.noetron/state.md`** (versioned) — the crash-recovery point: phase, active spec pointer, one
  `Task N: in progress` line while a task is out, one `Task N: complete` line per finished task, one
  `Task N: fix round <k>/5` line while a fix loop is running, ratified G0 choices. **Versioned means
  one copy per tree:** under `isolation: worktree` the main repository and the worktree each hold
  one. This skill reads and writes **the executing tree's** — see [Bookkeeping](#bookkeeping) — and a
  line written into the other copy is a line no destination ever receives.
  **After compaction, `noetron-recovery` runs before anything
  resumes.** This skill is the resident context when a long execution is cut, so the reconciliation
  is *this* skill's first move — the ledger and git disagree in both directions and only that pass
  says which. Then, and only then, the rule: **trust the ledger and `git log` over memory** — a task
  with a `complete` line is DONE; resume at the first without one. Applied raw, ahead of the
  reconciliation, that same rule re-dispatches finished work whose line was never written: this
  skill's own red flag, reached by following this skill.
  **An empty ledger section is a slice that has not started — never a slice that starts at Task 1.**
  `noetron-finish` resets the section at each boundary, so right after slice 2 lands there is no
  "first line without a `complete`" to resume at, and the most available number on the screen is the
  wrong one. Resume at the **spec's first unchecked task under `## Slice <k>`**: numbering runs
  continuously, so slice 3 opens at Task 9. The spec checkboxes this skill ticks at COMPLETE survive
  the reset; the ledger section does not.
  **Ceiling: 80 lines — and this skill is what rotates it**, because the ceiling is crossed *mid-task*
  while the loop runs and the closeout is not there to do it. At the ceiling the oldest resolved
  entries migrate under `## Ledger (rotated)` into this slice's history entry,
  `.noetron/history/<date>-<slug>[-s<N>].md` — the same file `noetron-finish` will write its closeout
  entry into, created here if it does not exist yet — and leave **one index line** behind in the
  ledger. One file per slice, appended twice: a second file would be unreachable, since nothing lists
  the directory. A ledger is a cursor, not a
  diary — narration belongs in the report, decisions in the plan.
  **`## Delivered` outranks everything.** A slice listed there is integrated: never re-execute its
  tasks, never re-dispatch them, whatever the ledger or memory says. The ledger section resets at
  each slice boundary, so the absence of `Task 3: complete` in the current section says nothing
  about slice 1.
- **`.noetron/work/<slug>/`** (ephemeral, git-ignored) — briefs, reports, review packages. **Kept
  across slice boundaries**, deleted at the closeout that resets the cursor to idle — the last
  slice's — **and on abandonment**: a chain that stops without reaching `finish` still cleans up
  when the user closes the task. Under `per-slice` the closeout fires once per slice, so a directory
  deleted at slice 1's would take with it the reports element 4 of the next slice's dispatch reads
  (`noetron-finish` § Per-slice closeout, [Dispatch contract](references/dispatch.md)).

## The short cycle — `trivial`, `small`, `bug`

One pass, not N. No spec exists here, so the **request is the contract** and it gets written down
before anything runs — the gates and the oracle doctrine are the same ones, at the ceremony the size
earned.

1. **BRIEF** — write `.noetron/work/<slug>/brief.md`: the user's request **quoted verbatim**, the
   ratified G0 line from the ledger, the acceptance in one sentence, the oracle (exact command plus
   the output that proves it), the files in play, and the domain skills from
   `.noetron/domain-skills.md` that cover this territory — `none` is an answer, blank means nobody
   decided. In the `bug` chain it also carries `noetron-debug`'s triage class and the red command
   with its **pasted failing output**. This is the same artifact a spec task would produce, built
   from a request instead: the [Dispatch contract](references/dispatch.md) reads it either way, so
   `inline` and `subagents` run identical requirements.
   Then write **`Change: in progress`** in `.noetron/state.md`. The short chains hold one unit of work
   and no task number, so `Change` is the ledger's name for it; a commit found under that line is work
   that was dispatched and never reviewed, which is what sends it back to REVIEW instead of being
   closed on the strength of the commit existing.
2. **CYCLE** — behavior-bearing work: failing test → runner output showing it failed **for the
   expected reason** → smallest implementation that passes → green, with the scoped suite
   `noetron-branch` baselined. In the `bug` chain the failing test is the regression test pinning the
   reported symptom, and the cycle closes with the red-green proof: revert the fix → red; restore →
   green. Work with no observable behavior (config, formatting, docs, pure moves) declares
   `cycle: none` **with its reason**, and its oracle exercises the artifact — build, lint, render —
   because "the file contains the line" proves only that the source is the source.
3. **VERIFY** — `noetron-verify` on the tree as it stands: the oracle re-run fresh, its whole output
   read, then the diff inspected line by line against the brief. Every changed line traces to the
   request; anything else is scope that never passed G0.
4. **COMMIT** — [the code commit](#the-code-commit), one for the change. The oracle is green before
   this step, never after.
5. **REVIEW** — `trivial` closes here: its step oracle is the whole proof, which is why the tier
   exists. `small` and `bug` run one **scoped review** — the quality lens, one dispatch, per
   [Which lenses are dispatched](#which-lenses-are-dispatched) — in a fresh context (see the mode rule
   above) against the brief and the harness floor; its findings enter the same fix loop the task loop
   uses — cap 5, suite after every fix, circuit breaker at the cap — and its round line is
   **`Change: fix round <k>/5`**, since there is no `Task N` here to key it on.
6. **LEDGER → `noetron-finish`** — one ledger line carrying the facts closeout needs: commit SHA,
   oracle, review verdict, **replacing `Change: in progress`**. The chain's entry condition at
   `finish` is then already satisfied.

| Chain | Oracle that closes it | Evidence that must exist afterwards |
|---|---|---|
| `trivial` | the change's own command, green | that run's output, quoted |
| `small` | the same, plus a scoped review clean or adjudicated in writing | the output and the review verdict |
| `bug` | the red-green proof on the regression test | the pre-fix red output **and** the post-revert red |

A gap found mid-cycle stops it exactly like a gap mid-task: `noetron-interview`, then resume. Size
shrinks the ceremony; it removes no gate.

## The task loop

For each task, in spec order, without pausing between tasks.

1. **DISPATCH** — write **`Task N: in progress`** in `.noetron/state.md` **before the dispatch
   leaves**, then hand off by file per the [Dispatch contract](references/dispatch.md), including
   **element 3, the harness floor**, and **element 8, the verification set**. Never paste the spec,
   the plan, or accumulated history. Without that line a task that is out and a task nobody started
   are the same screen, and `noetron-recovery` closes the first as `complete` on the strength of its
   commit — a task no reviewer ever saw.
2. **EXECUTE** — the implementer runs the task's embedded cycle: failing test → fails for the
   expected reason → minimal implementation → passes → **the verification set green**, meaning the
   commands element 8 carried and not whichever suite the implementer could find → **the task's
   commit**, per [The code commit](#the-code-commit). The failing-test output is **evidence in the report**, not a
   claim. A material gap stops the task: delegated agents never interview the user — they return
   `NEEDS_CONTEXT` with the gap, options, and a recommendation; the coordinator interviews and
   re-dispatches.
3. **REPORT** — `DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED`; at most 15 lines back.
4. **VERIFY** — `noetron-verify`: the report is claims, the diff is truth — read it from the commits
   the report names, not from the report. Every changed line traces to the task; the red evidence
   exists for every behavior-bearing one.
5. **REVIEW** — per-task review under `noetron-review`: **two dispatches, the spec lens and the
   quality lens, in parallel and blind to each other**, each in a fresh context whatever the mode, per
   [Which lenses are dispatched](#which-lenses-are-dispatched). The spec lens gets the brief and the
   diff and nothing else. Never pre-judge either reviewer: if the prompt you are writing contains
   "don't flag" or "at most Minor" — stop.
6. **FIX LOOP** — cap **5**, over the findings of **both** lenses, and the suite runs inside it:
   - **Before dispatching each round, write the count:** `Task N: fix round <k>/5` in
     `.noetron/state.md`, replacing that unit's previous round line — one line per unit, never one
     per round (`Task N: debug fix <k>/3` when `noetron-debug`'s cap governs). The cap lives in
     context and context does not survive compaction, so this line **is** the cap; the round that
     crashes mid-flight is exactly the one whose count nobody would otherwise have.
     `noetron-recovery` reads it and resumes at `k+1`.
   - **Every fix loop has a subject, including the two that carry no `Task N`.** Three routes enter
     this loop and only one of them is a numbered spec task; keying the line on `Task N` alone left
     the other two unable to write it at all, the recovery fell back to counting commits, the count
     came back 1 in every round, and a cap of 5 became no cap:

     | The loop is fixing | Subject of the line |
     |---|---|
     | a spec task | `Task N` |
     | the single change of a short chain (`small`, `bug`) | `Change` |
     | a delivery's final review | `Slice <k> review` — `Spec review` under `single-delivery` |

   - **Whatever ends the loop replaces the line; nothing leaves it standing.** `Task N: complete` at
     COMPLETE, `Task N: BLOCKED` at the circuit breaker. A `BLOCKED` outcome sitting next to
     `fix round 5/5` tells the next session to dispatch round 6: `noetron-recovery` resumes at `k+1`
     and has no way to know the loop already ended.
   - Rounds 1–3: resume the **original implementer** with the findings verbatim.
   - Rounds 4–5: dispatch a **fresh implementer**, told what was already tried.
   - After every fix: **run the verification set** — the same commands element 8 carries — then
     exactly one **scoped re-review** of the findings plus
     the fix diff. A fix that turns the suite red is not addressed, however clean the scoped review
     reads. Out-of-scope observations go to the ledger as deferred and never extend the loop.
   - **At the cap, the circuit breaker:** adjudicate each open finding — (a) contestable → park
     with a written ruling; (b) real but nothing depends on it → park as deferred; (c) real and
     **load-bearing** → mark `Task N: BLOCKED`, stop, escalate with the finding, the spec text, and
     the fix history. Every adjudication is a ledger entry; silent discard is forbidden.
     Adjudicating **before** the cap is pre-judging with another name.
   - The coordinator never fixes findings itself — its context stays clean, and coordinator fixes
     escape review.
7. **COMPLETE** — write **`Task N: complete`**, replacing that task's `in progress` and `fix round`
   lines; check off the task in the spec; next task. **That line means *reviewed*** — it is written
   here, after REVIEW and the FIX LOOP, and never earlier, which is why a commit found under an
   `in progress` line goes back to REVIEW rather than being promoted to `complete`
   (`noetron-recovery` § 4).

### Which cap applies

One cap per node, and the **active node's cap wins**:

| Node | Cap |
|---|---|
| a step's oracle inside a task | 3 attempts, then escalate with what was tried — **unless the task's `Contract` field declares another number** (`noetron-spec` § Task shape), which the brief carries; the declared value wins |
| the review fix loop | 5 rounds, then the circuit breaker |
| repeated fixes for the same defect | 3 — the third failure is architectural; re-enter as `standard` |

When a failing oracle routes to `noetron-debug`, the debug cap governs from there.

## Slice boundaries

A spec whose plan declared deliverable slices is executed **one slice at a time**, in the plan's
order. Inside a slice nothing changes: the task loop above runs unmodified, without pausing between
tasks.

**Task numbers run continuously across the whole spec** — slice 2 opens at Task 5, not at Task 1
(`noetron-spec` § Slices). The ledger section resets per slice but the numbers do not, so a
`Task 5: complete` line means one thing on any screen, and `task-5-brief.md` cannot be overwritten by
another slice's first task. A slice entered on a freshly reset section therefore takes its first task
number **from the spec**, not from the empty ledger — [The ledger](#the-ledger).

At the last task of a **delivery unit** — the deliverable slice plus every `deliverable: no` slice
that lands with it (`noetron-spec` § How many tasks) — and only there:

1. run that unit's **`### Slice validation`** from the spec, written under the unit's last slice
   heading whatever that slice's `deliverable` value is — the slice-level oracle, not the
   spec-level one. **At the last unit, run both**: its `### Slice validation` first, then the spec's
   `## Validation` in full, per [Completion](#completion). That is the only moment the whole spec is
   proven on a tree that carries every slice;
2. green → `noetron-review` for the final review of **this slice's diff** — one dispatch, the quality
   lens over the whole range, pointed at the ledger's deferred Minors
   ([Which lenses are dispatched](#which-lenses-are-dispatched)), its fix loop keyed on
   `Slice <k> review` — then `noetron-finish`.
   This holds at the last slice too: **there is no whole-spec review, ever** — the slices before it
   were reviewed against their own diffs and integrated on those verdicts, and re-reading merged code
   at the end is the ceremony this topology removed;
3. `noetron-finish` returns with the cursor on `slice: <k+1>`. **Invoke `noetron-branch` before that
   slice's first write** — merging slice `k` locally left HEAD on the base, so re-entering at task
   `N+1` skips the protected guard and puts the next slice's commits on `main`. It cuts
   `<type>/<slug>-s<k+1>` from the ratified base **when the base already carries slice `k`**
   (`git merge-base --is-ancestor`), and otherwise — an open PR as much as *keep the branch* — keeps
   the current branch, because there is no base holding that slice to cut from. Then it runs the
   slice's scoped baseline.
   Then resume at that slice's first task, re-reading no plan and re-asking nothing G0 or G1 settled.

`cadence: single-delivery` skips all of this: every task runs, then the spec's `## Validation`, then
one review and one finish.

**Never carry an unfinished slice into the next one.** "I'll integrate slice 1 after slice 2, it's
almost the same area" is exactly the reasoning that produced a 7h47 run with nothing integrated. The
slice boundary is a destination, not a checkpoint.

## Stops

The only reasons to pause a running execution:

- a material gap (`noetron-interview` — the mandatory stop);
- `BLOCKED` the coordinator cannot resolve;
- a contradiction between spec and reality → back to `noetron-spec` / `noetron-plan`;
- a deliverable slice's last task — the loop hands off to review and `noetron-finish`, per
  [Slice boundaries](#slice-boundaries), and resumes at the next slice;
- all tasks complete.

**Every stop writes `## Next` before it yields** — one line in `.noetron/state.md` naming what a
resuming session does first: the task, the gap, the finding, the answer being waited on. It is the
only field in the ledger whose reader is a session that did not witness the stop, so a blank one
makes that session reconstruct a decision it cannot see.

"Should I continue?" between tasks wastes the human — the spec already granted it. Narration stays
at one short line between tool calls; the ledger carries the record.

## The code commit

**This skill turns the diff into history — every chain, every mode.** `noetron-finish` writes one
metadata commit and no code, so a chain that reaches it with a green but uncommitted tree has nothing
to merge, nothing to squash, and no range for a reviewer to read.

| Chain | Who commits | When | What lands |
|---|---|---|---|
| `standard` / `large` | the implementer that wrote the diff | end of **EXECUTE**, before REPORT | one commit per spec task; each review fix is its own commit |
| `trivial` / `small` | whoever implemented — the delegate, or the coordinator under `inline` | after **VERIFY** is green | one commit for the change; each review fix is its own commit |
| `bug` | same | after the red-green proof | one commit carrying the regression test **and** the fix, so reverting takes both |

**The oracle runs first.** A commit made on a red tree puts a broken state inside the range every
reviewer reads and every `git bisect` walks.

**The message follows the repository's own idiom** — read it before writing one
(`git log --oneline -20`). With no idiom to follow, Conventional Commits: `type(scope): subject`,
imperative, no trailing period, the scope naming the code territory the diff touches. The body
carries the **why** in the request's terms when the subject cannot. `noetron-preferences` governs
the text: no emojis, no session narration, no "as requested". `chore(noetron):` belongs to the
closeout commit alone — a code commit never wears it, and a markdown-only diff never wears a code
scope. `docs(spec):` and `fix(api):` describe different things.

**Never in a code commit:** anything under `.noetron/`, unrelated formatting, another task's work.
**`--no-verify` is never passed** — a hook that fails is a finding to fix, and switching off the
project's own quality check is the `CLAUDE.md` guardrail violation with a flag on it.

**`granular` and `squash-final` differ only at the destination.** Both produce exactly the commits
above while the chain runs; `squash-final` collapses them at `noetron-finish`, which already has the
ratification and does not re-ask, and collapses **one delivery's commits at a time** — never the
branch's whole range, which under `per-slice` still carries the previous delivery. **Nothing is
rebased, amended, or squashed while the chain is running:** the ledger, the review packages, and the
recovery point all address work by SHA. The one carve-out is that collapse, at that delivery's own
G2, over that delivery's own commits — a rewrite the user ratified at G0 and confirmed at closeout.

Delegated implementers commit their own work and return the SHAs in the 15-line report. The
coordinator's `git log` check against those SHAs is what turns a `DONE` into a range it can review.

## Bookkeeping

Harness records — `.noetron/state.md`, spec checkboxes, catalogs — ride in the **closeout metadata
commit** and in no other, never mixed into commits carrying code.

Task completion survives a crash without one of its own: the ledger line is written the moment the
task ends, **in the working tree the chain is executing in** — the worktree under
`isolation: worktree`, the repository root otherwise — and `noetron-finish` commits it from that same
tree, before the destination is executed, so it travels with the code instead of staying behind.
Naming the tree is not pedantry: `.noetron/` is versioned, a worktree carries its own copy of
`state.md`, and a line written into the main tree's copy while the work happens in the worktree
reaches no destination at all. That is what makes a progress
commit per task unnecessary — treating it as necessary anyway produced 12 stray metadata commits in
one field run.

## Completion

All tasks of the **last delivery unit** done → run that unit's `### Slice validation` → then the
spec's **Validation** in full → check acceptance criteria one by one → hand off to the **last unit's
review**, which is the final review and not a second one → its findings clean or adjudicated in
writing → **only then `status: done`** → present the synthesis with evidence (attestation oracle) →
`noetron-finish`.

**`done` is written after the review, never before it.** It is half of `noetron-finish`'s entry
condition for the last slice, so a spec flipped to `done` while a review is still out puts on disk a
document claiming completion over work nobody has judged — and a Critical returned afterwards gets
fixed under a status that already said there was nothing left to fix.

**Two validations here, one review.** The validations answer different questions: the slice's proves
*this* delivery integrable, the spec's proves the whole thing on a tree that finally carries every
slice, and only the last closeout can run the second. A second review would answer a question already
answered: every earlier slice's diff was reviewed before it was integrated, and re-reading merged
code is what `per-slice` exists to stop. Earlier slices reached `finish` already; the spec's status
flips only here.

## Red flags

- Refusing to run because a chain has no spec, or bending the task loop over a chain that has none
  instead of running the short cycle.
- Dispatching, or starting a short cycle, with no brief file to point at.
- Reaching `noetron-finish` with the change uncommitted; a code commit carrying `.noetron/`; a
  rebase, amend, or squash while the chain is still running; `--no-verify` on any commit.
- Re-dispatching a task whose `complete` line is in the ledger — compaction amnesia.
- Resuming a compacted execution straight from the ledger, without `noetron-recovery` reconciling it
  against git first.
- Dispatching a fix round without writing its `fix round <k>/5` line — a cap that exists only in a
  context about to be compacted — or skipping the line because the unit was a short chain or a final
  review and had no `Task N` to key it on.
- Leaving `fix round 5/5` standing next to a `BLOCKED` outcome, so the next session dispatches
  round 6.
- Dispatching a task without writing its `in progress` line first; writing `complete` before the
  review ran.
- Starting the next slice's first task without `noetron-branch`, on whatever branch the previous
  slice's merge left HEAD on — or resuming a reset ledger section at Task 1 instead of at the slice's
  first task in the spec.
- Pasting spec, plan, or session history into a dispatch.
- A dispatch without element 3, or one whose floor omits `noetron-preferences` or `noetron-verify`;
  a dispatch that says "suite green" without carrying the commands that are the suite (element 8).
- **One reviewer holding the brief, the report and the diff at once, recorded as the task's review.**
  The spec lens cannot be run afterwards by a context that has read the report, so that dispatch does
  not produce two lenses — it produces one, and a ledger line claiming two.
- A review file whose `<lens>` is still a placeholder, or a per-task review at `standard`/`large`
  that produced one report file instead of two.
- Reviewing in the context that wrote the code without the `self-review` declaration and its marker,
  or letting that self-review stand in for the spec lens instead of recording it as not run.
- Deleting `.noetron/work/<slug>/` at a non-final slice's closeout.
- Flipping the spec to `done` before the last slice's review is clean or adjudicated.
- Two implementers running at once.
- Fixing review findings in the coordinator's own hands.
- Closing a fix round without running the suite.
- Adjudicating findings before the cap to end a loop early.
- A report that re-narrates context for each attempt.
- Running the next slice's first task before the previous slice reached a recorded destination.
- Re-dispatching a task from a slice listed under `## Delivered`.
- Proving a slice with the spec-level Validation instead of its own `### Slice validation`.

## Integration

- `noetron-router` — ratified G0, wrote the front matter this skill reads, and owns `phase:`; tier
  and chain come from there, and are never re-derived here.
- `noetron-recovery` — the mandatory first move of any resumed or compacted execution, and the reader
  of the `fix round` lines this skill writes; it reconciles the ledger against git, this skill then
  runs from the corrected ledger.
- `noetron-spec` — the input for standard/large; contradictions return there.
- `noetron-interview` — gap mode is this skill's mandatory stop.
- `noetron-verify` — every claim, every report-vs-diff check, the final Validation.
- `noetron-review` — owns the two lenses and what each may see; **this skill owns the dispatches that
  realize them** — two per task at `standard`/`large`, one for a scoped or final review — and the fix
  loop consumes the findings of both.
- `noetron-debug` — a failing oracle whose cause is not evident routes there; in the `bug` chain the
  triage class and the red command arrive from there and enter the brief.
- `noetron-finish` — integration and closeout; it consolidates the commits this skill created and
  writes no code of its own.
- `noetron-branch` — clears the ground before the first write, and its scoped baseline **is** the
  verification set element 8 carries into every dispatch and the short cycle re-runs.
- `noetron-setup` — `.noetron/profile.md`'s per-package commands and dependency edges are what turn
  the ratified `scope` into that set.

---

**This skill is working if:** every chain that starts has an engine that runs it — the short cycle
below `standard`, the task loop above it; every chain arrives at `noetron-finish` with its code
already in commits whose messages match the repository's idiom and whose diffs carry no `.noetron/`;
no completed task is re-dispatched after compaction, because no compacted execution resumes before
`noetron-recovery` has reconciled the ledger against git; every task that was dispatched and not yet
reviewed says so on disk, so no commit is ever closed as `complete` without a review; a fix loop cut
at round 4 leaves a line saying so **whatever it was fixing**, and one that ended `BLOCKED` leaves no
round number for the next session to increment; no review is written by the context that wrote
the code without saying so in its first line; **every per-task review at `standard`/`large` leaves two
report files with two named lenses, and the spec lens's package contains no report**; the
coordinator's diffs under `subagents` contain no
implementation of its own; a fix that breaks something outside its diff is caught in the same
round it happened; and no task from a slice already listed under `## Delivered` is ever dispatched
again.
