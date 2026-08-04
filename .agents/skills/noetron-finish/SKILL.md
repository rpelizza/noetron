---
name: noetron-finish
description: Use when a task's execution is complete and the work needs a destination — merge, PR, or keeping the branch; when the user asks to merge, push, open a PR, close out, or abandon a task; or when a finished branch or worktree needs cleanup.
---

# Noetron Finish

Closes the loop: prove the work green where it will actually live, let the user pick the destination
at **G2**, write the history and migrate the ledger, **commit that record on the task branch so it
travels to the destination**, execute the destination, clean only what is ours.

## Entry condition — by tier

Finish requires whatever its own chain produced, and never an artifact that chain never had. One
universal condition ("final review passed and the spec is `done`") is unsatisfiable for the trivial,
small, and bug chains — in the field it stalled closeout and left the ledger open and the workspace
littered.

| Chain | Entry condition |
|---|---|
| `trivial` | the change's oracle passed under `noetron-verify` |
| `small`, `bug` | the oracle passed **and** the scoped review is clean or its findings adjudicated in writing; a bug chain also carries its RED regression evidence |
| `standard`, `large` — a non-final delivery unit | that unit's `### Slice validation` is green — its ratified integration safety included — and the review of its diff passed or its findings are adjudicated |
| `standard`, `large` — the last delivery unit | that unit's `### Slice validation` **and** the spec's `## Validation` are both green, the review of that unit's diff passed or its findings are adjudicated, and the spec is `status: done` |
| `standard`, `large` — `single-delivery` | the spec's Validation is green, the `noetron-review` of the whole diff passed or its findings are adjudicated, and the spec is `status: done` |

*The last slice carries two validations and one review.* The slice's proves this delivery integrable,
the spec's proves the whole on a tree that finally holds every slice — and the review it needs is the
one on its own diff, because every earlier slice was reviewed before it was integrated. Demanding a
second, whole-spec review here would send a reviewer back over merged code (`noetron-execute` §
Completion).

*A slice closes out like a task of its own; only the last one carries the spec.*

This scales the requirement, never the standard: finish substitutes for no review and no validation.

**And in every chain, one condition the tier does not scale: the code is already committed.** At
entry, `git status --porcelain` shows nothing outside `.noetron/` — the ledger line written in the
working tree is the single legitimate dirty file, and it travels in this skill's own metadata commit.
Uncommitted code found here goes back to `noetron-execute` for its commit, message and all: **this
skill writes exactly one commit per delivery and it carries no code.** A closeout that commits the
work it is closing writes the one commit message nobody reviewed, under a scope nobody chose.

## Per-slice closeout

With `cadence: per-slice` in `.noetron/state.md`, this skill fires **once per deliverable slice**,
not once per spec. The order of operations below runs whole every time — a slice that skipped PROVE
or the menu was integrated on trust.

What changes, and only this:

| Step | At a non-final slice | At the last slice |
|---|---|---|
| PROVE | that slice's `### Slice validation`, **and only it** | that slice's, then the spec's `## Validation` |
| MENU (G2) | full menu at slice 1; afterwards one line — `Slice <k> green — <the destination of slice k-1, read from ## Delivered>. Ok?` — the three options still reachable by naming one | full menu |
| history | the entry for this slug's slice `<k>` — the one a ledger rotation already opened, or a new `history/YYYY-MM-DD-<slug>-s<k>.md` — plus its single `INDEX.md` line | same, `-s<N>` |
| statuses | untouched — the spec is not done | spec `done`, plan `executed` |
| cursor | the `## Delivered` line first; then `slice: <k+1>` and an empty `## Ledger — slice <k+1>`, in one write | the `## Delivered` line first, then the whole block migrates into this entry, then the idle scaffold |
| `work/<slug>/` | **kept** — the next slice uses it | deleted |
| CLEANUP | keep the worktree; the next slice runs in it | clean by provenance |

**The one-line G2 is not a weaker gate — and it is not a policy being applied.** G1 ratified the
**cadence**, which says *when* to deliver; nothing in this harness ratifies *where*. The destination
is asked at G2, once per slice. What the one-liner carries is the destination of slice `k-1`, read
off its `## Delivered` line — the only place a destination is ever recorded — offered as the likely
answer for this one. A default shown, never a decision inherited, and silence is not an answer here
either. Any sentence of the form "the destination per the ratified policy" is reading a field no
skill writes.

**Abandonment with slices delivered is not an empty outcome.** Record what is integrated, from
`## Delivered`, and say plainly what the user already has and what was never built. That sentence is
the whole point of the topology: a chain that stops at slice 3 of 5 leaves two working deliveries
behind, not a branch.

## Order of operations

### 1. PROVE
Re-run **this delivery's own oracle** on the current tree through `noetron-verify`, with the checks
in `.noetron/verification-standard.md`. Which oracle that is follows the delivery, never the chain's
largest artifact:

| Delivery | The oracle PROVE re-runs |
|---|---|
| `trivial`, `small` | the change's own oracle |
| `bug` | the red-green proof on the regression test |
| `standard`/`large`, `single-delivery` | the spec's `## Validation`, in full |
| `standard`/`large`, a **non-final** slice | that slice's `### Slice validation`, **and only it** |
| `standard`/`large`, the **last** slice | that slice's `### Slice validation`, then the spec's `## Validation` |

**Running the spec's `## Validation` at a non-final slice is red by construction** — it asserts
criteria the plan mapped to slices that do not exist yet. The red then routes a finished, integrable
slice to `noetron-debug` to hunt a defect nobody wrote, and the slice never reaches G2. That is the
7h47 field failure reproduced by the step built to prevent it: the work is done, and the closeout is
what holds it hostage. It is the same rule `noetron-execute` states from the other side — proving a
slice with the spec-level Validation is a red flag there.

`.noetron/verification-standard.md` is what *correct* means here, and it is read-only for the whole
closeout: a criterion edited to let a closeout through is a closeout that proved nothing. **The menu
comes after green.** A red run stops here and routes to `noetron-debug`.

### 2. DETECT
Worktree or normal repo (`git rev-parse --git-dir` vs `--git-common-dir`, with the
`--show-superproject-working-tree` submodule guard). **Capture the worktree path now** — later steps
move directories and then need it.

### 3. SAFETY NET — offer, never block
The real duty lives in the earlier phases; this is the net:

- a security-sensitive surface changed (auth, untrusted input, queries, secrets, sensitive data,
  uploads, dependencies) with no `noetron-security` pass on the diff;
- the diff touches templates, styles, or client-side components with no rendered verification from
  `noetron-design`;
- a stable surface — route, command, public API, screen — was created or changed while the
  project's own documentation still describes the old behavior (documentation belongs to the
  project; the harness writes none of it);
- the task opened a domain territory no `<prefix>-*` skill covers → offer `noetron-create-skill`;
- **ten or more distinct task slugs** among the index lines in `.noetron/history/INDEX.md` since the
  last review marker in `.noetron/domain-skills.md` → offer a skills review via `noetron-evolve`;
- a `## Pending` entry in `.noetron/domain-skills.md` that **two distinct task slugs have closed
  past** since its approval → offer to write it or drop it, per its expiry. Max 5 pending; the queue
  is a debt, not a wish list.

**Both counters count tasks, never deliveries.** They were calibrated when one task produced one
index line. Under `per-slice` a four-slice task produces four, so counting lines fires the skills
review on two and a half tasks of evidence, and expires a skill the user approved at G1 before the
very task that approved it has finished. The slug is the join key across every entry of one task
([artifacts.md](../noetron-setup/references/artifacts.md)), so the count is a count of **slugs** in
the index lines past the marker — still one bounded read of `INDEX.md`, never a directory listing.

Name the gap and **offer** to send the work back into the cycle. The decision is the user's and it
gets recorded — blocking here would only relocate the mess.

### 4. BASE
The base is in `.noetron/state.md` from G0. Confirm it **before the menu** — option 1 names it out
loud, and merging into the wrong base is expensive to undo.

### 5. MENU — gate G2, exactly these options
> 1. Merge locally into `<base>`
> 2. Push and open a PR
> 3. Keep the branch as is

**Present three things in the same message**: the menu, the evidence PROVE produced, and — for a
slice of a `standard`/`large` plan — **the integration safety that plan declared for this slice**:
the flag it hides behind, the additive-only migration, the route nothing links yet, together with
the observation that proved it, which `noetron-spec` folded into this slice's `### Slice validation`.
That safety is the answer the user ratified at G1 to "is the base still shippable with this in it?",
and **G2 is the only moment it is ever spent**. A menu presented without it asks for a destination
while withholding the one fact that decides it. Chains with no plan have none, and say so by having
nothing to show.

Wait for the answer; integration is the user's decision. Detached HEAD (an externally managed
workspace) → options 2 and 3 only — and the closeout still needs a branch to carry its commit, so
name the one the host expects or send it to `noetron-branch` for one. **Discard is not in this
menu.** After slice 1 of a `per-slice` task this is the one-line confirm described in
[Per-slice closeout](#per-slice-closeout): the previous slice's destination read from
`## Delivered`, still an answer waited for, with all three options reachable by naming one.

### 6. CONSOLIDATE — execute the strategy G0 ratified, over this delivery's commits
The ledger's `commits` item already answers this, so the step executes rather than re-opens it — and
it runs **here**: after G2, after the base is confirmed, immediately before the closeout commit and
the destination.

- **`granular`** — present the commit list and stop there. A reorganization is *offered* with one
  line on what it would produce and runs only on an explicit choice. Honored commits are the default.
- **`squash-final`** — collapse **this delivery's commits, and no others**, into one. Ratifying
  `squash-final` at G0 **is** the explicit request `CLAUDE.md` requires, so the decision is not
  re-asked; what is confirmed here is the **resulting subject and body**, shown before they are
  written.

**The range is the delivery's, never `<base>..HEAD`.** Under `per-slice`, a slice whose predecessor
ended at *keep the branch* or at an open PR sits on a branch that still carries that predecessor's
commits: `<base>..HEAD` sweeps them in, and collapsing them **destroys the commit that proved a
delivery the user already has** — one listed in `## Delivered` and referenced by its history entry.
So the range starts **just above the previous delivery's metadata commit** —
`chore(noetron): close <slug>-s<k-1>` on this branch — and at the branch point when this is the
branch's first delivery.

**Not at the SHA the previous `## Delivered` line recorded**, which is the obvious floor and the
wrong one: sub-step 1 writes that line before sub-step 6 makes the commit, so the metadata commit
sits *above* the SHA the line carries. A range floored there collapses the previous delivery's
history entry, learnings entry and cursor into this delivery's commit — and on a PR path rewrites
something already pushed, which the push then rejects with a message this skill would read as "the
remote moved". Nothing already listed under `## Delivered` is ever rewritten, **and its bookkeeping
is part of it.**

Two orderings follow from that and neither is cosmetic. **This runs before step 7**, because a squash
after the closeout commit swallows it. And `noetron-execute` forbids rewriting *while the chain
runs* — under `per-slice` the chain is still running, so this is the one moment a rewrite is allowed
and its scope is exactly one delivery, after that delivery's gate.

There is no surprise squash in either direction: none happens without ratification, and one that was
ratified is not quietly skipped. Nothing is rewritten after a push except on the user's explicit
request.

### 7. CLOSE OUT — on the task branch, before the destination, in this order

**Where this runs is part of the instruction.** Every write below happens in the working tree that
holds this delivery's branch — the worktree when `isolation: worktree`, the main tree otherwise —
and the commit at the end is made with HEAD on `<type>/<slug>[-s<k>]`. Never at the repository root
with the base checked out: `.noetron/` is versioned, so a bookkeeping commit made there is
`chore(noetron): close <slug>` landing straight on `main`, against a `noetron-branch` guard that
admits no exception. In worktree mode there are two copies of `.noetron/state.md` and only the
committed one travels; writing into the wrong copy is how a base ends up with the code and none of
the record.

**Committing before the destination is what makes the record travel.** On a local merge this commit
is inside the range being merged, so the base receives the history entry, the learnings entry and the
cursor together with the code. On a PR it is inside the push, so the PR carries its own bookkeeping
instead of stranding a commit on a branch left forever one ahead of its remote — and a merged PR then
lands code *and* record. On *keep the branch*, the branch is the deliverable and it carries its own
record. It also empties the tree: the ledger line `noetron-execute` wrote is the one legitimate dirty
file, and committing it here is what lets the next `git switch` run at all instead of aborting.

**Re-entry is idempotent by inspection.** A closeout resumed after an interruption checks each write
before making it — an entry that exists is completed in place, never duplicated; a cursor already
advanced is not advanced again, and **the destination itself is evidence** — a base that already
carries this slice, a PR that exists, or the branch standing as recorded, checked before re-executing
it, so a re-entry never merges twice or pushes over a PR someone is reviewing. Sub-step 3 is the one a
blind re-run actively corrupts: its
recurrence count would find the entry this same closeout wrote and promote a one-off to a standing
rule. The invariant is **one metadata commit per delivery reached**, not one per attempt; a closeout
that had to come back and correct its own records commits the correction.

1. **The `## Delivered` line** — in `.noetron/state.md`, first of everything: the slice, its title,
   the destination ratified at G2, the branch's SHA, and the path of this delivery's history entry.
   It is written **before the cursor moves**, so a crash between them leaves a delivery recorded and
   a cursor one short — the state `noetron-recovery` §5 settles by advancing the cursor. The reverse
   order leaves a cursor with no evidence under it, and that costs a git investigation. It is also
   the field the *next* slice's one-line G2 reads its default from, and the only record of a
   destination anywhere in the harness.

   **A chain with no delivery cursor writes nothing here** — `trivial`, `small`, `bug`, and any chain
   that produced no plan have no `## Delivered` section to write into, and their record is the
   history entry and its index line. Inventing the section for them would put a delivery list under a
   task that delivers once.
2. **History entry — one per delivery, and it may already exist.** A ledger rotation at the 80-line
   ceiling opens this slug's entry mid-slice (`noetron-execute`), days before this closeout runs.
   **Resolve the entry by slug and slice before creating anything** — `history/` is addressed by
   slug, never listed — and write the summary into the open one, closing it. Creating a second file
   under today's date leaves the rotation's file with no index line, and an entry no index line
   points at is unreachable, because nothing lists the directory. With no open entry, create
   `.noetron/history/YYYY-MM-DD-<slug>[-s<k>].md`.

   It carries: what changed, the destination, the oracles that proved it, deferred findings, and a
   pointer to the plan's decisions. **The ledger migrates into it here** — every resolved entry in
   `.noetron/state.md`'s `## Ledger — slice <k>` section moves in under `## Ledger (rotated)`,
   joining whatever the mid-slice rotation already put there. **`## Delivered` never migrates at a
   non-final slice**: it is the shortest true answer to "what does the user already have?", and the
   next slice needs it in the ledger. It
   migrates exactly once, **whole**, into the entry of the closeout that resets the cursor to idle —
   the last slice's, or the abandoned task's — and it migrates *after* sub-step 1, so this delivery's
   own line is inside the block instead of being written into a section that has already left.
   Without that move the list would vanish at the reset, since the idle scaffold has no such section;
   `INDEX.md` still carries one line per delivery, and the migrated block is where they read as one
   task's deliveries rather than N unrelated entries.

   Then its **one line in `.noetron/history/INDEX.md`**, newest first, with the signal
   `clean | defect | rework | abandoned`. At 50 lines, the oldest index lines fold into
   `INDEX-archive.md` until 40 remain.

   **Budget 60 lines — and the migrated records are not what yields.** The reasoning lives in the
   plan, the steps in the spec, the diff in git. An entry that cannot hold its own rotated ledger and
   its `## Delivered` block inside 60 lines is an entry re-telling its task instead of recording it:
   cut `## Files touched` to the paths that carry meaning and reduce `## Decisions` to its pointer.
3. **Learnings entry — only when this task produced a confirmed defect.** Confirmed means
   reproduced: a failing oracle, a review finding that held, a fix that needed a fix, the bug the
   chain was opened to close. Append it to `.noetron/learnings.md`, newest first, with the seven
   fields `noetron-evolve` owns — **trigger** (the observable event) · **root cause** (not the
   symptom) · **smallest durable fix** (`file:line`) · **rule**, or explicitly `n/a — one-off` ·
   **scope** (a rule without one fires everywhere) · **revert** (one line) · **status** `candidate`.
   An anomaly nobody could reproduce is logged the same way with `Rule: n/a — one-off`, and was not
   fixed.

   **A task where nothing failed writes nothing here.** This file is memory of observed failure, not
   a diary of work done — a diary reaches the ~200-line budget without ever having taught anything,
   and then nobody reads it at task start.

   **Count the recurrence while writing.** If the root cause you are about to log already appears in
   the log, this is its second occurrence — the promotion trigger. Say so and route to
   `noetron-evolve`, which owns the edit that lifts the rule into **Active rules**, and into
   `CLAUDE.md` when it must hold before any skill loads. The count belongs to this skill because
   this is the only node that sees every closed task; the promotion belongs there because it is a
   ratified change. Over budget → retire an entry before adding, per `noetron-evolve`.
4. **Flip statuses** — spec `done`, plan `executed`, for the chains that produced them, and only at
   the last slice.
5. **Move the cursor** — and `k` here is **the slice this delivery ended on**, not the one the cursor
   was showing. A delivery unit can span more than one slice, and nothing advances the cursor while
   `noetron-execute` crosses from a `deliverable: no` slice into the one it lands with: the cursor
   still names the first slice of this unit. Take `k` from the slice whose heading carries the
   `### Slice validation` PROVE just ran, then write `slice: <k+1>` **and** the section restarted as
   an empty `## Ledger — slice <k+1>`, in **one write** to `.noetron/state.md`. One write because a
   cursor at `k` sitting over a header at `k+1` is a state no recovery rule names, and a closeout
   should not invent one. A chain with no slices skips straight to the scaffold — there is no `k+1`.

   **"Is this the last delivery?" is asked of that same `k`, never of the cursor.** With a unit of two
   slices the cursor trails by one, so a closeout comparing the cursor against `slices` finds `2 ≠ 3`
   at the end of a fully delivered spec, writes `slice: 3` over a slice whose tasks are all ticked,
   keeps `status: active`, and never reaches idle — a finished task that no session can close and
   every session re-enters. At the last slice — and on abandonment — rewrite the file as the idle
   scaffold
   instead: `task: none`, `status: idle`, and no other front matter, the `## Delivered` block having
   migrated per sub-step 2. **Write that field, do not merely "reset the file".** `status: active` is
   the flag `noetron-core` routes on and the one `noetron-recovery` fires on, so a closeout that
   leaves it standing hands the next session a task that already ended. A task reset to idle with
   slices undelivered dropped them silently.

   **A `stash:` line still standing is surfaced before the reset erases it.** The scaffold keeps no
   front matter, and that field is the only record anywhere that preserved work exists — a stash is
   invisible in `git status` and survives every branch switch. Name it, say what it claimed, and hand
   it to `noetron-recovery` §2.3, which owns restoring, releasing, and clearing it. Resetting over it
   does not drop the stash, only the one thing that knew about it.
6. **One metadata-only commit, on the task branch** — `chore(noetron): close <slug>[-s<k>]`, carrying
   the history entry, the index line, the learnings entry when the task produced one, the status
   flips, the `## Delivered` line and the cursor, and nothing else. Run `git branch --show-current`
   before it, exactly as `noetron-branch` requires: `main`, `master`, `develop`, `dev`, or empty means
   the closeout is standing in the wrong tree, not that the guard has an exception. Task commits never
   carry these files, and this commit carries no code. A learnings entry left uncommitted is a lesson
   that exists on one machine.

   **The slice suffix is what makes this commit findable, and re-entry depends on it.** The branch,
   the history entry, the `## Delivered` line and the ledger header all carry `-s<k>`; a subject that
   did not would make delivery 2 on a continued branch find delivery 1's commit, conclude the write
   already happened, skip it, and push a delivery whose record stayed behind. It is also the floor the
   next delivery's squash range starts above (step 6).
7. **Mark the destination pending** — write `.noetron/work/<slug>/destination-pending.md`, one line:
   the destination G2 ratified and the delivery it belongs to. Step 9 deletes it once the destination
   is reached. **This is the only record that survives what step 5 just erased**: at the last delivery
   and in every chain without a cursor, sub-step 5 rewrote the file as the idle scaffold, so from here
   until the destination executes the ledger claims a finished task and the repository has an
   unintegrated branch. `noetron-core` reads this marker before treating an idle ledger as idle.

### 8. DESTINATION — execute what G2 chose
- **Merge local:** the base lives in the repository root under `worktree` isolation, and in this same
  tree otherwise.

  **This step moves the tree, so it reads the tree first** — `git status --porcelain` **in the tree
  it is moving into**, which under `worktree` is not the one the entry condition checked. The rule is
  `noetron-branch`'s and it does not stop at that skill's border: every node that runs `git switch`,
  `git merge` or `git worktree remove` owns it, and this step runs all three.

  Under `worktree` that read is never empty on a first delivery, and the reason is known: G0 wrote the
  front matter at the root before the worktree existed, `noetron-branch` copied it in rather than
  moving it, and the copy left behind went stale at the first ledger line. **Reconciling it is this
  step's job** — `noetron-branch` says so and stops there, because the commands that would do it are
  the ones it forbids itself. Here it is not forbidden, because here it is provable: the commit step 7
  just made contains that file's content and everything after it, so `git show <commit>:.noetron/state.md`
  is a superset of what the root copy holds. Confirm that, discard the root copy, and say so in one
  line. Skipping this does not make the merge safe — it makes it abort, because the merge writes the
  very file left modified.

  **Anything dirty outside `.noetron/` is not ours**: stop and hand it to `noetron-recovery` §7.

  Then merge, and run the suite on the **merged result** (`noetron-verify`). Failure → the delivery
  did not happen: revert the local merge, then **restore the cursor before saying anything**. At the
  last delivery sub-step 5 already rewrote the file as the idle scaffold, so a failure here would
  otherwise leave a finished-looking ledger over an unfinished task, and nothing would route a later
  session anywhere. Rebuild `status: active`, `phase: finish` and the `## Delivered` block from the
  history entry this closeout just wrote — it carries all three — and leave
  `destination-pending.md` in place. Then route to `noetron-debug`. Nothing was pushed, the branch
  still carries every commit including its bookkeeping, and the closeout re-enters at PROVE when the
  fix lands — completing the delivery its records already describe rather than writing them twice.
- **PR:** push, which carries the bookkeeping up with the code, then open the PR with the forge's own
  tooling, following the repo's template if one exists. **Keep the worktree** — PR feedback is
  iterated there. A rejected push means the remote moved: investigate; force-push only on the user's
  explicit request.
- **Keep:** record and stop — the branch is the deliverable, bookkeeping and all.

**Which of the three happened decides where the next slice starts — and the question is not which
option the user named.** It is whether the base already carries this slice, and
`git merge-base --is-ancestor <branch tip> <base>` answers it without anyone remembering — with one
qualification that is not optional:

**A "no" from that command is not yet an answer when the destination was a PR.** Squash and rebase
merges are the default on many forges, and both put the slice's *content* in the base without
leaving any commit the tip is an ancestor of. Ancestry then says "did not land" about a slice that
landed, and the next delivery continues on a branch whose work the base already has — duplicating
the diff in the next PR, or conflicting on the next merge. So when the command says no **and** this
slice's `## Delivered` line records a PR, read the second evidence before deciding: that slice's
line in `.noetron/history/INDEX.md` carries its destination, and a PR recorded there as merged
landed whatever ancestry says. Two readings agreeing is the answer; ancestry alone is the answer
only where no PR is involved.

| This slice | What slice `k+1` does |
|---|---|
| **landed in the base** (merged locally) | `noetron-branch` cuts `<type>/<slug>-s<k+1>` from the ratified base |
| **did not land** — a PR still open, or *keep the branch* | **continues on this branch**, cutting nothing |

Enumerating the three menu options one by one is what left the PR outside every clause: it is neither
"landed" nor "keep", and both improvised exits are bad — cutting from a base that never received the
slice, or piling the next slice's commits into a PR under review. The category is "does the base
carry this?", and it is decidable.

**Continuing on the branch is also what preserves `.noetron/state.md`.** The file is versioned, so
switching to a branch cut from a base that never received this slice reverts the cursor, the
`## Delivered` list and the ledger to the base's copy — handing the next session `status: idle` in
the middle of a live task.

**A closeout is not over until its destination is reached.** Committing the bookkeeping first is what
makes it travel; ending there, with the destination unexecuted, is the one failure this order can
produce and the one it must never end on.

### 9. CLEANUP — by provenance, and only now
**Delete `.noetron/work/<slug>/destination-pending.md` first** — the destination it announced has
been reached, and a marker outliving its destination sends every later session to recovery for a
task that finished.

Then **delete `.noetron/work/<slug>/`**, and only here: at a non-final delivery not at all, since the
next one runs out of it. This deletion sits after the destination rather than inside step 7 for the
same reason the marker exists — a closeout cut between its commit and its destination has to leave
something behind that says so. **Abandonment is the named exception**: it ends the task whatever
slice it stopped on, so it deletes on purpose.

Remove only worktrees under a directory we created (`.worktrees/` or `worktrees/`):
`git worktree remove` + `git worktree prune`. Anything else is host-owned — leave it in place, and
use the platform's workspace-exit tool if it offers one. A sibling worktree that "looks stale"
belongs to someone else.

## Abandonment — closeout without a destination

A chain that stops without integrating still closes here. Run steps 7.1–7.7 with the task recorded
as abandoned — where it stopped, why, what exists on the branch — and set plan and spec to
`abandoned`. Step 8 does not run: there is no destination, which is the only thing this path drops.
The bookkeeping commit still does, on the task branch, because that branch is now the whole record.

**Abandonment is the one named exception to the non-final-slice rules, and it is an exception
because it ends the task.** The cursor resets to idle whatever slice it stopped on, and
`.noetron/work/<slug>/` is deleted — both forbidden at a non-final slice of a chain that *continues*,
both correct here, for the same reason: nothing comes next. Step 7.1 has nothing to write — an
abandoned slice delivered nothing — so what migrates in 7.2 is the block exactly as the previous
closeouts left it: `## Delivered` moves **whole into this history entry** before the reset, because
it is what tells the user which slices they still have and the idle scaffold has nowhere to keep it.
**An abandoned chain is where the learnings entry matters most:** work stopped for a reason, and that
reason is exactly the failure the next task should not repeat. Ephemeral folders outliving their
tasks are how the workspace filled with briefs and diffs for work nobody remembered starting. Branch
and commits survive; abandonment closes the ledger, it does not destroy work.

## Discard — the only destructive path

Never offered, never in the menu. Only on the user's **explicit, unprompted request**: list exactly
what will be permanently deleted — branch, commits, worktree — then require the typed word
**`discard`**. Only the exact word authorizes; "yes, get rid of it" does not. The history entry is
still written afterwards: destroyed work is still history.

**Its commit needs a branch, and the one it would have ridden is what the user asked to destroy.**
The protected guard has no exception, so cut `chore/<slug>-closeout` from the base, write the entry
and the index line there, and say in the same listing that this branch is what survives the discard.
Merging it or keeping it is the user's call — the same destinations as any delivery, minus the code.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Tests passed earlier this session" | A green run proves only the tree it ran on. Run it on the tree you are about to integrate. |
| "There's no spec, so closeout doesn't apply" | The entry condition is per tier. A trivial chain closes out like a trivial chain. |
| "The tree is green, I'll just commit it here" | Code commits belong to `noetron-execute`, with the brief in hand and the message idiom read. Send it back; this skill writes one metadata commit per delivery. |
| "G0 said squash-final, but squashing needs approval" | It has it. G0 *is* the explicit request. Confirm the resulting message, not the decision. |
| "Squash the branch — `<base>..HEAD` is the range" | It is the range of every delivery on that branch. Take this delivery's commits only; the previous one is in `## Delivered` and its proof is not yours to rewrite. |
| "The spec's Validation is the real proof, run it every slice" | At a non-final slice it asserts criteria for slices that do not exist. Run that slice's `### Slice validation`, and only it. |
| "Merge first, then write the history — the record needs the fact" | Then the record commits onto the base, and the base is protected. Commit it on the branch, before the destination, so it travels with the code. |
| "The bookkeeping is `.noetron/` — the PR doesn't need it" | A PR without its history entry merges code and no record, and leaves the branch permanently one commit ahead of its remote. |
| "Obviously they want it merged" | Integration is the user's decision. Present the menu. |
| "The task was abandoned — nothing to clean up" | Abandonment runs the same closeout minus the destination. |
| "'Yes, get rid of it' counts as confirmation" | Only the typed word `discard` authorizes deletion. |
| "The PR is up, the worktree is clutter" | PR feedback is fixed in that worktree. Keep it. |
| "That other worktree looks stale, I'll take it too" | Clean only what is under `.worktrees/`. The rest is host-owned. |
| "The defect was small, not worth logging" | Size is not the filter — recurrence is. An unlogged root cause cannot be counted, and an uncounted one is never promoted. |
| "Nothing failed, but the task deserves a learnings note" | It does not. No defect, no entry. The budget is spent on failures. |
| "I'll write the learnings entry into the next code commit" | Bookkeeping rides the metadata commit. A code commit carrying `.noetron/` makes the history unreadable. |
| "The failure on the merged result is probably flaky" | A failing merged result stops everything — `noetron-debug`, with a measured rate if flakiness is claimed. |
| "Slice 1 is done but I'll integrate everything at the end" | The cadence was ratified at G1. A finished slice that is not integrated is the field failure, verbatim. |
| "They said merge for slice 1, so slice 2 merges too" | Nobody ratified a destination policy — G1 ratified *when*, never *where*. Slice 1's destination is the default you show; the answer is still theirs. |
| "Slice 1's PR is open, so slice 2 cuts from the base like always" | The base does not carry slice 1. `git merge-base --is-ancestor` says so. Slice 2 continues on the branch. |

## Red flags

- Presenting the menu before a green run, or executing a destination the user did not pick.
- Running the spec's `## Validation` to prove a non-final slice, and routing the guaranteed red to
  `noetron-debug`.
- Presenting G2 without the integration safety the plan declared for that slice.
- Naming a "ratified destination policy", or repeating the previous slice's destination as a decision
  instead of as the default it is.
- Starting a closeout with uncommitted code in the tree, or writing a code commit in this skill.
- Demanding an artifact the chain never produced; squashing what G0 did not ratify, or honoring
  commits it ratified away; re-asking the commit strategy at closeout.
- Squashing over `<base>..HEAD`, before G2, or across a commit already named in `## Delivered`.
- Making the bookkeeping commit with HEAD on a protected branch, at the repository root after a
  merge, or in a tree that is not the one holding this delivery's branch.
- Reaching a destination with the bookkeeping still uncommitted — a PR with no history entry, a merge
  that carried code and no record — or ending a closeout with the bookkeeping committed and the
  destination never executed.
- Deleting `.noetron/work/<slug>/` before the history entry exists — or leaving it behind on
  abandonment.
- Cleaning a workspace the harness did not create.
- A closeout commit carrying code, or a code commit carrying `.noetron/` bookkeeping.
- Closing a chain that fixed a confirmed defect with `learnings.md` untouched — or writing an entry
  for a task where nothing failed.
- Logging a second occurrence of a root cause without naming the promotion and routing it to
  `noetron-evolve` — including the false second occurrence a re-entered closeout finds in its own
  entry.
- Editing `.noetron/verification-standard.md` to get a red closeout to green.
- Closing a **non-final slice of a chain that continues** by resetting the cursor to idle, or
  deleting `.noetron/work/<slug>/` with slices still to run. Abandonment does both on purpose and is
  the only path that may.
- Resetting the cursor to idle — at the last slice or at abandonment — with `## Delivered` still
  only in the ledger, where the reset erases it.
- Advancing the cursor before writing the slice's `## Delivered` line, or migrating the
  `## Delivered` block before the last slice's own line is in it.
- Creating a second history entry for a slice whose entry a ledger rotation already opened.
- Deciding where slice `k+1` starts from the menu option the user named instead of from whether the
  base carries slice `k`.
- Demanding a whole-spec review at the last slice on top of that slice's own.
- A history entry with no line in `INDEX.md`; flipping the spec to `done` at a slice that is not the
  last.

## Integration

- `noetron-router` — G0 recorded the base, the isolation, and the tier that sets the entry condition.
- `noetron-verify` — the fresh proof at entry and the merged-result proof before cleanup, both
  judged against `.noetron/verification-standard.md`.
- `noetron-review` — its verdict, scoped or final, is half the entry condition.
- `noetron-plan` — declared, per deliverable slice, **how it is safe to integrate**; step 5 is the
  one place that declaration is ever read, and G2 is where it is spent.
- `noetron-spec` — owns the `### Slice validation` that PROVE runs at a non-final slice and the
  `## Validation` it adds only at the last, and folds the plan's integration safety into the former
  so G2 shows an observation and not a promise.
- `noetron-execute` — hands off here with the code already committed; its ledger is the source of the
  history entry, its commits are what step 6 honors or collapses, and its mid-slice ledger rotation
  may already have opened the history entry step 7 writes into.
- `noetron-interview` — safety-net gaps are decisions: named, offered, ratified.
- `noetron-debug` — any red suite found here, including a red merged result.
- `noetron-branch` — created the isolation this skill detects and cleans by provenance, holds the
  protected guard this skill's commit obeys, and is where a non-final slice hands the chain **back**:
  a local merge leaves HEAD on the base, so the next slice needs its branch and its scoped baseline
  before `noetron-execute` writes anything — while a slice that did not land leaves that branch in
  place for the next one to continue on.
- `noetron-recovery` — reads the `## Delivered` line and the cursor this skill writes, and owns the
  rulings for every crash window step 7 can leave.
- `noetron-security`, `noetron-design`, `noetron-create-skill`, `noetron-evolve` — the four offers.
- `noetron-evolve` — also the format authority for the learnings entry this skill writes, and the
  owner of the promotion this skill triggers on a root cause's second occurrence.

---

**This skill is working if:** every chain that starts reaches a recorded destination whatever its
tier; a non-final slice is proven by its own validation and never held behind the spec's; no closeout
begins with uncommitted code and its only commit per delivery is the metadata one, made on the task
branch and never on a protected one; every destination carries that commit with it, so no PR merges
without its history entry and no base receives code without its record; the branch that reaches the
destination carries exactly the shape `commits` ratified at G0, with no squash the user did not ask
for and none they did, and no delivery already listed in `## Delivered` is ever rewritten; every G2
shows the integration safety the plan declared and asks the destination rather than assuming it;
merged results are proven green before any cleanup; no branch or worktree disappears without its
typed authorization or created-by-us provenance; `.noetron/work/` holds nothing for a task that is
over; the ledger never crosses its ceiling; every confirmed defect the chain fixed is findable in
`.noetron/learnings.md` afterwards, while a chain that hit no defect added no line to it; every
delivery has exactly one history entry and exactly one index line, and `INDEX.md` stays under 50
lines; and a task abandoned mid-way leaves every delivered slice integrated and named in its history.
