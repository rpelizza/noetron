---
name: noetron-recovery
description: Use when a session resumes and the harness's record may not match the repository — after a compaction, crash, or interruption; when `.noetron/state.md` shows an active task or no `status:` at all; when the ledger and `git log` disagree; when a worktree, branch, stash, or uncommitted change appears that this session did not create; and before any operation that could move or discard work in the tree.
---

# Noetron Recovery

Reconciles the harness's **record** with the repository's **reality**. It starts read-only: constate first,
propose second. Nothing here moves HEAD, writes a commit, stashes, resets, or removes a worktree on its own —
recovery that destroys evidence is the incident, not the fix. It runs before classification, never instead of
it — and it has **two exits that are not interchangeable**: the chain resumes at the node it stopped in when
the request *is* the open task, and `noetron-router` classifies a new request only after the conflict between
the two has been put to the user (§2.1). Choosing an exit by which one is nearer to hand is the silent swap
this skill is here to make impossible.

It writes into `.noetron/state.md` in these places and nowhere else, each carrying its own row in that
file's writer table: the `Task N: in progress` line a crash lost (§4); the `## Delivered` line a crashed
closeout owed, and the `slice:` cursor rolled back when it ran ahead of every destination (§5); the
`## Ledger` header realigned with the cursor (§5); and the `stash:` field (§2.3, §7). Everything else here
is read, propose, and hand off — and a write not in that list, however obviously right, is a write the
next auditor walking the table will never find.

## 1. CONSTATE — the read-only sweep

One pass, all of it, before any conclusion. Every command reads:

```
cat .noetron/state.md              # the record: task, status, phase, branch, ledger, `## Next`, G0 choices
cat .noetron/history/INDEX.md      # deliveries the closeout recorded before it ever touched the cursor
git branch --show-current          # where HEAD actually is
git log --oneline <base>..HEAD     # what exists as commits
git status --porcelain             # uncommitted work
git worktree list                  # isolation no other skill in this harness enumerates
git stash list                     # earlier preservation, this session's or another's
```

Write all seven answers down before judging any of them: a divergence read off one command is a guess, and
the diagnosis is the intersection of the seven.

**`history/INDEX.md` is in the sweep because it is the only delivery record that outlives this file.**
`## Delivered` migrates out of `.noetron/state.md` at the last slice and on abandonment, and the idle
scaffold has nowhere to keep it; the index line stays. It is also the corroboration §5 needs when the
cursor and `## Delivered` disagree — §5's hardest question, "was this slice ever delivered?", was
otherwise being answered out of the one record that is missing by hypothesis. It is bounded by contract
(50 lines, newest first), so reading it costs a fixed amount and it is read whole, never as a directory
listing.

**`## Next` is in the sweep because nothing else reads it.** `noetron-execute` writes one line at every
stop that pauses a chain, naming what the next session does first — and its only possible reader is a
session that did not witness the stop. Read it with the cursor and carry it into §3.

## 2. CLASSIFY — false alarm or real divergence

| Finding | Reading |
|---|---|
| ledger idle, tree clean, no stray worktree, **no `destination-pending.md`** | no recovery — hand back to `noetron-router` to classify the request |
| ledger idle **and** a `destination-pending.md` under some `.noetron/work/<slug>/` | **a closeout stopped between its commit and its destination** — §5.2. The idle ledger is not a finished task; it is the record that `noetron-finish` reset before the delivery it had already committed |
| the front matter has **no `status:` key at all** | **unknown, never idle** — §2.2, before anything classifies |
| ledger active, and the request **is** that task | **resumption**, not damage — §3 |
| ledger active, and the request is **something else** | **two tasks** — §2.1, before either exit |
| a `stash:` field, or a stash `git stash list` shows | **preserved work with a record, or without one** — §2.3 |
| an open `fix round <k>/5` line on the task the cursor is at | **a fix loop mid-flight** — §8, and §4 does not apply to that task |
| ledger and git disagree in either direction | **divergence** — §4 |
| ledger active with slices: `## Delivered`, `slice:`, and the ledger read in that order | **slice re-entry** — §5 |
| a worktree this task's ledger does not name | **orphan** — §6 |
| uncommitted changes in the tree | **WIP** — §7, before anything else moves |

State the classification in one line with its evidence. "Something looks off" is not a classification, and a clean sweep reported as clean is this skill working, not failing.

**Order, when the record is active:** §7 first if the tree is dirty (nothing moves before that), then §5 to
learn *which slice* the ledger section belongs to, then §8 to learn whether a fix loop is open, then §4 for
the ledger-versus-git reconciliation, then §3 to re-enter. Running §4 first was how a task with live review
findings got closed: the order is not a preference.

### 2.1 TWO TASKS — state the conflict, never swap

One task at a time ([state.md](../noetron-setup/references/state.md)). A second request arriving
while `status: active` is a conflict the **user** resolves, and it is resolved before either exit
above is taken:

> `<open task>` is open at `phase: <phase>`, on `<branch>`, `<n>` of `<m>` tasks complete. You asked
> for `<request, one line>`. Finish the open one first, park it through `noetron-finish` and start
> yours, or queue yours behind it?

Never announce a resumption of task A because the ledger names it while the user asked for B. Never
run B under A's front matter either: `tier`, `scope`, `branch`, `isolation`, and `commits` were
ratified against A's blast radius, and B inherits none of them — it needs its own G0, which means its
own trip through `noetron-router`. "Park it" ends at `noetron-finish`, the only node that closes a
ledger; a task left `active` while another runs gives the next compaction two answers and no rule
for picking one.

**This is one of three enforcement points and it is not the common one.** This section fires on a
*resumption*; `noetron-core` fires on the first read of the file in a session. The second task that
arrives **mid-session**, in a conversation that already resolved both, reaches neither — and its G0
closes with a single write of the whole front matter, over a live task's `## Delivered`, ledger, and
`## Decisions`. That third point belongs to `noetron-router`, immediately before that write; this
skill is where it lands when the router finds `status: active` still standing.

### 2.2 UNKNOWN RECORD — a file with no `status:`

A `.noetron/state.md` carrying no `status:` key states nothing, and **nothing is not idleness**. The file
predates the field: a workspace migrated from the legacy `noetron/` layout arrives as a `git mv` of a file
written before `status:`, `phase:`, and `## Delivered` existed. Read as idle — which is what
`noetron-core`'s "present and idle" exit does with it — a live task gets a fresh G0 written over it.

Reconstruct with the user, never by default. Name what the file carries (a task title, a ledger with
unfinished lines, a plan or spec pointer), name what git shows (the branch, commits since the base, the
worktrees), and ask whether that task is open. `noetron-interview` owns the question. Filling `status:` or
`phase:` from a plausible reading is a user decision taken by an agent, and it is the decision that
decides whether the next write lands on top of live work. Only once it is answered does the table above
apply.

### 2.3 A RECORDED STASH — the reader the field never had

`stash: <name> — <what>` in the front matter and the output of `git stash list` are read **together**, and
the four pairings are not the same finding:

- **field and stash both present** — parked work, still parked. Show it (`git stash show -p <name>`) and
  offer: restore it into the current tree, leave it where it is, or drop it. On the user's word, restore or
  drop **and clear the field in the same edit**; leaving it parked leaves the field.
- **field present, no matching stash** — someone applied or dropped it elsewhere. Say so, quote what the
  field claimed, and clear it only with the user's word: the field is the last trace that the work existed.
- **stash present, no field** — an unrecorded preservation, this session's or another task's. Report it;
  record it in the field only if the user says it belongs to this task. Never read "unrecorded" as
  "leftovers".
- **neither** — say so in one line and move on.

A stash is invisible in `git status`, survives every branch switch, and is named by nothing else in the
repository, which is why the field exists at all and why it is read here rather than quietly deleted:
dropping the record does not drop the stash, it only drops the one thing that knew about it. The field is
also the one front-matter line the closeout's reset to the idle scaffold would erase, so a `stash:` still
standing at closeout comes back here before that reset.

## 3. RESUME an active task — G0 is already ratified

Tier, slug, branch, base SHA, scope, isolation, mode, and commit strategy sit in the front matter of
`.noetron/state.md`, ratified at G0: **read them, never re-ask them.** Re-opening a gate the user already
closed is the compaction failure this skill exists to stop — it spends a ratification twice and teaches the
user that the gate means nothing.

**Read `## Next` before choosing the node.** It names what the stopping session was waiting on, and it
outranks the phase when the two point at different places: a chain stopped at a material gap re-enters at
`noetron-interview` with that question, not at the task that was already waiting for its answer. A blank
`## Next` on a stopped chain is itself a finding — say so, and reconstruct from `phase:` alone.

Then re-enter at the node `phase:` names. Every node the graph draws is a legal value, and each one has its
own rule, because "resume at the phase" is only an instruction if the phase names something:

| `phase:` | Re-enter at |
|---|---|
| `explore` | `noetron-explore`. It reads and never writes, so nothing needs reconciling first; the chain then continues to `branch`. |
| `branch` | `noetron-branch`, from the top. The ground was never cleared — protected guard, base, isolation, baseline. It is safe to re-run: an existing branch or worktree is detected, not recreated. **Never skip forward to `execute` because commits exist**; that is how a compacted chain commits on `main`. |
| `interview` | `noetron-interview`, at the decision `## Next` names. A ratified decision is already a line in `## Decisions`; one that is not there is still open, whatever a report claims. |
| `plan` / `spec` | that artifact's own `status:`. |
| `execute` | the first ledger line without `complete` — **after §5**, **after §8**, and **after §4**. |
| `review` | `noetron-review`, on the diff of the task or slice the ledger is at. A review whose report file is gone is **re-run**, never assumed to have passed. |
| `debug` | `noetron-debug` at triage, from the red command in the brief. A triage whose class was never recorded restarts at the red command; a fix proposed from a remembered diagnosis is a guess. |
| `finish` | `noetron-finish`, **at the first closeout step whose evidence is missing** — §5.1, never from the top. A closeout that already reached its destination re-enters at cleanup, not at PROVE. |

Confirm in one line what is being resumed and where; a task the user no longer wants is abandoned through
`noetron-finish`, never dropped mid-air.

## 4. PRECEDENCE — git is the evidence, the ledger is the record

**The ledger is corrected to match git; git is never rewritten to match the ledger** — and the two directions are not symmetric.

**This section does not run on a task with an open `fix round <k>/5` line.** That line says the review
already ran and returned findings: the task is mid-fix-loop, not mid-implementation, and every commit under
it is expected. Re-entry is §8's, at round `k+1`, with the findings from the review report in
`.noetron/work/<slug>/` — and when that report is gone, the review is **re-run**, never skipped. Closing
such a task discards live findings without adjudication, which `noetron-execute`'s circuit breaker forbids
in writing. Check for the line before reading anything below.

**Commit exists, no `complete` line.** The work exists; what is unproven is the **review**. Confirm the
commit actually implements that task — diff against the spec's task text, under `noetron-verify` — then
write `Task N: in progress` if the ledger carries no line for it at all, and **re-enter at REVIEW**
(`noetron-execute` step 5), never at the next task.

**This skill never writes `complete`.** That line means *reviewed*: `noetron-execute` writes it at COMPLETE,
after the review and the fix loop. Writing it from the mere existence of a commit hands `noetron-finish` a
ledger asserting the opposite of what happened, and the slice integrates with a diff nobody read. The window
is not exotic — commit to review is the longest gap in the task loop, so it is the likeliest place for a
crash to land. "Resume at the first task without a line" is the right rule only after this reconciliation;
applied raw it re-dispatches finished work, `noetron-execute`'s own red flag.

**In the short chains the same lines are keyed on `Change`** — `Change: in progress`, `Change: fix round
<k>/5` — because a chain with no plan has no task number (`noetron-execute` § The short cycle). Every
ruling in this section and in §8 applies to them unchanged; only the key differs.

**`Task N: BLOCKED`.** The circuit breaker already fired: a load-bearing finding survived the cap and the
open item is the **escalation**, not the loop. Re-entry is that escalation, presented with the finding, the
spec text, and the fix history. Re-dispatching the task restarts a loop a human was asked to settle, and it
restarts it at a counter that the BLOCKED line does not carry.

**`Task N: complete` line exists, commit missing.** Never draw the mirror-image conclusion and skip the task as
done. Search before deciding: `git status` (a task completed but not yet committed is legitimate — the ledger
line is written in the working tree), `git stash list`, other worktrees (§6), the branch the ledger names versus
the branch HEAD is on, `git reflog` for a HEAD that moved. Found → present it and let the user choose: commit
what exists, or re-run the task. Not found after that sweep → **escalate with what was searched**; the line is
corrected only inside a ratified decision, since deleting it destroys the only trace that the work happened.

## 5. SLICES — the ledger section is one slice, not the task

A `per-slice` task resets its ledger at every slice boundary, so `Task 1` in the section on screen is
`Task 1 of slice <k>` and is indistinguishable from `Task 1 of slice 1` unless you read the cursor
first. Three reads, **in this order**, and never starting at the ledger:

1. **`## Delivered`** — append-only, survives every rotation. Those slices are integrated: never
   re-execute, re-dispatch, or re-review them, whatever the ledger or memory says.
2. **`slice: <k> — <title>`** — the cursor, which says whose ledger the section below is. A task
   number read without it is a numerator with no denominator.
3. **`## Ledger — slice <k>`** — re-entry at the first line without `complete`, after §4 and §8.

**When the cursor and `## Delivered` disagree, the evidence settles it — and "was this slice delivered?"
is a question about the base, not about which menu option the user picked.** `noetron-finish` writes the
`## Delivered` line **first**, then migrates the ledger, then the cursor and the new ledger header in one
write, and only then executes the destination — so every crash in that stretch is a real state and the
*expected* one is evidence ahead of claim. Two categories decide it, and only two:

- **the base already carries the slice** — `git merge-base --is-ancestor <slice k's tip> <base>` is true.
  That is a local merge, and it is decidable from git alone.
- **the base does not carry it** — which is **not** the same as "it never happened". A pushed PR and a
  ratified *keep the branch* both leave the base untouched. Enumerating destinations one by one is what
  left the PR falling through every clause; the second copy of the evidence answers it instead —
  `history/INDEX.md` carries the slice's index line, written at the start of the closeout, long before
  the cursor moved.

| Found | Ruling |
|---|---|
| `slice: k+1`, no `Delivered` line for slice `k`, and the base carries slice `k`'s tip | the delivery happened; the bookkeeping did not. **Write the missing `Delivered` line** and keep the cursor. The same asymmetry as §4: the ledger is corrected to match git. |
| `slice: k+1`, no `Delivered` line, the base does not carry it, **but `INDEX.md` names `<slug>-s<k>`** | the closeout ran and stopped partway. Read the destination from that entry's `**Outcome:**`, write the `Delivered` line from it, keep the cursor, and re-enter the closeout at **§5.1** — not at its first step. |
| `slice: k+1`, no `Delivered` line, no ancestor, and no index line | the cursor is **ahead of reality**. Roll it back to `slice: k` and re-enter at **`noetron-finish`, per §5.1** — not at `noetron-execute`. Slice `k`'s tasks are committed and its ledger section may already be reset, so re-entering at execution re-implements delivered code, which is §4's failure one level up. |
| a `Delivered` line for a slice the cursor has not reached | `## Delivered` wins and the cursor advances. That line is the closeout's **first** write and the cursor is one of its last, so this is the ordinary crash state, not a contradiction. |
| a `Delivered` line for slice `k`, and the base does not carry it, and no PR or kept branch matches its recorded destination | the **bookkeeping ran and the destination did not**. The closeout commits its record *before* executing the destination, so this is the gap between the metadata commit and the merge or push. Re-enter at `noetron-finish` **at the destination step**, with the destination the line already records — never at the closeout's writes, and never at `noetron-execute`: the code is committed, only the delivery is outstanding. |
| the `## Ledger — slice <j>` header names a slice that is not the cursor's | the cursor and the header are written **together, in one write**, so no closeout produces this: it is a hand edit, a bad merge of two copies of the file, or a workspace written by an older harness. The cursor is the authority — realign the header to it **only when the lines under it are accounted for**, every resolved line already present in slice `j`'s history entry and none unaccounted, and escalate with both values otherwise. |

`## Delivered` is the record the closeout committed; `slice:` is a claim about what happens next.
Evidence outranks claim here for the same reason it does in §4 — and the record itself is still checked
against git, because it is written one step before the destination runs. What the line always proves is
that slice `k`'s code is committed and its review is behind it: **no slice listed there is ever
re-executed**, whatever is still outstanding at its destination.

**Slice re-entry goes through `noetron-branch`, never straight into the task loop.** Merging slice
`k` locally left HEAD on the base; resuming at the first uncompleted task of slice `k+1` without
cutting its branch is how the protected guard gets skipped by a recovery instead of by a chain. When
slice `k`'s destination left nothing in the base — a PR still open, or the branch kept — slice `k+1`
continues on that same branch and no new branch is cut; `noetron-branch` owns that call, this skill
only hands it the category above.

### 5.1 RE-ENTERING A CLOSEOUT — at the first step with no evidence

A closeout re-entered from the top is not a wasted minute, it is a corrupted record: its steps are **not
idempotent**. Re-enter at the first one whose evidence is missing, and each step carries its own:

| Closeout step | Evidence it already ran | What a second run produces |
|---|---|---|
| history entry | a file under this slug and slice | a second file for one delivery, or a rewrite of a closed entry |
| `INDEX.md` line | a line naming that entry | two index lines for one delivery |
| learnings entry | an entry whose task is **this** slug | the costliest one — see below |
| status flips | spec `done`, plan `executed` | harmless; check anyway |
| `## Delivered`, cursor, ledger header | the line is present; the cursor and the header sit at `k+1` | a duplicate delivery line, or a cursor advanced twice |
| metadata commit | `chore(noetron): close <slug>` in `git log` for this slice | an empty commit, or a second one |
| `work/<slug>/` deleted | the directory is gone — and at a non-final slice it must **not** be | the next slice loses the briefs it runs out of |
| the destination | the base carries the slice, the PR exists, or the branch stands as recorded | a second merge, or a push over a PR someone is reviewing |

**The learnings entry is the one that does real damage.** Its recurrence count asks whether this root cause
already appears in the log — and on a re-entry it finds the entry this same task wrote minutes earlier,
reads it as a second occurrence, and promotes a permanent harness rule out of a single event. Recurrence is
counted across **other** tasks' entries; an entry carrying the active slug is this closeout's own and is
never its own precedent.

**An entry keeps the name it was opened under.** A closeout that crosses midnight — or that follows a
mid-task ledger rotation from the day before — writes into the entry that is already open for this slug and
slice, never into a second file dated today. Two files for one delivery leaves the first with no index line,
and nothing lists the directory.

### 5.2 AN IDLE LEDGER WITH A PENDING DESTINATION

`.noetron/work/<slug>/destination-pending.md` names a destination that was ratified at G2 and never
executed. The ledger says idle because the closeout had already reset it — at the last delivery, or
in a chain that never had a cursor — before reaching the step this marker guards.

**The ledger is the wrong authority here and the marker is the right one.** Re-enter at
`noetron-finish` **at its destination step**, for the delivery the marker names, and do not rebuild
the cursor first: everything the closeout wrote is in the metadata commit
`chore(noetron): close <slug>[-s<k>]`, which the branch still carries. Reconstruct nothing that a
commit already holds.

Two readings settle what to do next, in this order:

| Finding | Reading |
|---|---|
| the base already carries that delivery — ancestry, or a PR its `INDEX.md` line records as merged | the destination **did** execute and only the marker survived. Delete the marker, say so, and stop |
| the base does not carry it, and no PR or kept branch matches the recorded destination | the destination never ran. Execute it, then let step 9 delete the marker |

A marker with no matching history entry is not this case: nothing was committed, so there is no
delivery to finish. Say what the file claims, and hand the choice to the user — deleting a marker
whose closeout you cannot reconstruct is guessing with a `rm`.

## 6. ORPHAN WORKTREES

`git worktree list` is run nowhere else in the harness; run it here, for every entry that is not this task's isolation:
- under `.worktrees/` or `worktrees/` and named by a **closed** history entry → report it as a cleanup candidate and offer removal; `noetron-finish` owns the command, this skill never runs it unasked.
- **belonging to another task** — active elsewhere, or holding commits your ledger never mentions → leave it untouched and say so. Another session's isolation is someone's open work, "it looks stale" has been wrong before, and that loss is unrecoverable.
- marked `prunable` in `git worktree list --porcelain` (its directory is gone) → propose `git worktree prune`, which touches administrative files only.

## 7. UNCOMMITTED WIP — preserve before anything moves

Before **any** operation that can move or discard the tree — `git switch`, `git checkout`, `git worktree add`,
merge, rebase, pull — run `git status --porcelain`. Not empty → stop and preserve first; this rule outranks
the operation someone asked for. **`noetron-branch` runs those commands and this skill owns the procedure**:
it calls the check and comes here, it does not carry a second copy of it.

Preservation is **proposed, never automatic**. Present what exists (files, rough size, whether it looks like the
active task) and the options: commit it on the current branch · `git stash push -m <slug>` · copy it aside ·
carry it across only when git can do so cleanly. **Never run `git stash`, `git reset`, `git checkout -- .`, or
`git clean` on your own initiative** — those four destroy work no oracle can reproduce, and only the user knows
whether it was leftovers. A stash the user accepted is recorded in `.noetron/state.md` (`stash: <name> —
<what>`) and **read back by §2.3 at the next resume, which is also the only place the field is cleared**: an
unrecorded stash is lost work with extra steps, and a recorded one that nobody ever reads is the same loss
with a receipt.

## 8. FIX-LOOP COUNTER — read it, and never restart it

The fix loop's cap of 5 (`noetron-execute`), the debug cap of 3, and a step's 3 attempts all live in context and
reset to zero at compaction — an unbounded loop with a cap on paper. The line that survives is written by the
skill that actually dispatches the rounds: `noetron-execute` writes `Task N: fix round <k>/5` in the ledger
before each one (`Task N: debug fix <k>/3` under the debug cap, `Change: fix round <k>/5` in the short
chains, which have no task number), one line per unit of work, replacing that unit's previous round line.
**This skill reads it, under whichever key the chain uses.** A counter whose only named writer is the skill
that never runs a round is a counter nobody ever increments — and a counter keyed on a number two of the
three fix-loop routes never have is a counter that cannot be written down in the first place.

On resume the recorded round **is** the count: the next dispatch is `k+1`, never 1. An open round line also
tells §4 to stand down for that task.

**No line → reconstruct from commits, and bound the range twice.** Reports in `work/` are rewritten under fixed
names, so counting files returns 1 in round 1 and 1 in round 5 — a fallback that always says "first round" is
worse than none, because it reads as evidence. What accumulates is history: each fix is its own commit
(`noetron-execute` § The code commit). But `<base>..HEAD` is the range of the **whole task**, not of the
task the loop is on, and it is wrong in both directions: with `granular` and a slice that kept its branch
it still holds every earlier slice's commits and over-counts; after a per-slice squash it holds one commit
where a slice had eight and under-counts.

So bound it:

1. **Bottom of the range — the slice, not the task.** The floor is the tip SHA of the newest `## Delivered`
   line, and the branch's base SHA from `branch:` when there is none. Commits below it belong to deliveries
   already recorded.
2. **Inside the slice — the trailing run.** Writes serialize and tasks run in order, so the commits after the
   task's own implementation commit are its fix commits and nothing else.

When step 2's boundary cannot be read off git — no marker separates task `N-1`'s commits from task `N`'s —
**do not invent a number: count the whole slice range and state it as an upper bound**, `j` commits, next
round `j+1`, declared as reconstructed and high. Erring high ends the loop at the circuit breaker, where a
human adjudicates the open findings; erring low is the loop that runs forever. No line and no commits in the
range → round 1, stated as such. A count that quietly restarts is how a capped loop runs forever.

## Rationalizations

| Excuse | Reality |
|---|---|
| "No ledger line for this task, so I'll run it" | Check `git log` first: a commit that implements it means the line is missing, not the work. |
| "The commit is there, so the task is complete" | `complete` means *reviewed*. Write `Task N: in progress` and send it back through REVIEW; this skill never writes `complete`. |
| "The ledger says complete, so I'll move on" | A `complete` line with no artifact behind it opens an investigation, never a green light. |
| "There's an active task — I'll just redo G0" | G0 is ratified and recorded. Read the front matter. |
| "No `status:` line, so the file is idle" | Absence states nothing. A legacy file predates the field, and reading it as idle writes a new G0 over a live task. |
| "The fix round line is stale, I'll close the task" | An open round means live findings. Resume at `k+1`; discarding them silently is exactly what the circuit breaker forbids. |
| "I'll stash the leftovers to get a clean tree" | Uncommitted work is preserved by proposal only, never by reflex; that worktree that "looks stale" belongs to a task that is not yours. |
| "There's a `stash:` line but no stash, I'll drop the field" | It is the last trace that the work existed. Say what it claimed and let the user clear it. |
| "The round counter is gone, so it starts over" | A cap that resets is not a cap. Count the fix commits inside the slice's range, say the number was reconstructed, and err high. |
| "The ledger's Task 1 has no line, so slice 2 starts there" | Read `## Delivered` and `slice:` first. That section belongs to one slice; the numbers repeat, the deliveries do not. |
| "No `Delivered` line, so the slice was never delivered" | Ask the base, then `INDEX.md`. A PR and a kept branch both deliver without touching the base. |
| "The closeout crashed, so I'll run it again from the top" | Its steps are not idempotent — §5.1. A second learnings entry promotes a rule out of one occurrence. |
| "A task is open, so this request is that task" | Two names in one ledger is a conflict, not a continuation. §2.1, before either exit. |

## Integration

- `noetron-core` — the door that reaches here on `status: active`, and that names the two-task conflict this skill adjudicates; `noetron-router` — wrote the front matter at G0 and owns `phase:`, re-reads `status:` before that write so a mid-session second task lands here, routes here when the ledger is active or record and repository disagree, and takes the chain back once reality is established.
- `noetron-execute` — owns the ledger, the task loop, and **writes the `in progress`, `complete`, `fix round` and `## Next` lines this skill reads**; `noetron-branch` — owns isolation creation, including the branch a resumed slice needs before its first write, and calls §7 before every command that moves the tree; this skill only detects the isolation.
- `noetron-finish` — owns worktree removal, abandonment, and closeout: every offer made here ends there, and §5.1 is the contract for re-entering a closeout it left half-written; `noetron-verify` — "this commit implements task N" is a claim that needs evidence.
- `noetron-setup` — [state.md](../noetron-setup/references/state.md) is the format authority for every field this skill reads or writes, and `references/migration.md` is where a file with no `status:` comes from.
- `noetron-interview` — a divergence the evidence cannot settle is a user decision, including the reconstruction in §2.2; `noetron-debug` — a divergence caused by a failing process rather than a lost record.

---

**This skill is working if:** a session resuming after compaction re-opens no ratified gate and re-dispatches no
committed task; every ledger-versus-git divergence ends with the ledger corrected and git untouched; no task is
ever marked `complete` by this skill, and a task whose review never ran goes back to review; no
uncommitted change is destroyed by a command the user did not approve, and no recorded stash outlives the
session that could still have restored it; worktrees belonging to other tasks
survive every recovery; a resumption inside slice 3 never re-runs slice 1's Task 1, a closeout that crashed
between the cursor and the `## Delivered` line ends with one of them corrected and neither slice re-executed,
and a closeout re-entered writes no second history entry, no second index line, and no second learnings
entry; a request that is not the open task reaches the user as a stated conflict rather than as a swap; and a
fix loop interrupted at round 4 resumes at round 5.
