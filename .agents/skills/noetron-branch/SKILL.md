---
name: noetron-branch
description: Use before the first write of any task that will produce commits — when on a protected branch, a detached HEAD, or an unclear base; when a worktree is needed; when a delivered slice hands off and the next slice needs its own branch and baseline; or when the user asks to start a branch or an isolated workspace.
---

# Noetron Branch

Isolation before the first write. No chain that commits — trivial, bug, or large — touches a file
before this skill has cleared the ground: the protected guard held, the base resolved, the tree's
uncommitted work preserved, the isolation created, the baseline proven or its absence stated.

**This is the skill that moves the tree.** `git switch`, `git worktree add`, and the base resolution
behind them all live here, which is why the rule about not destroying uncommitted work lives here as
a step (§4) rather than as a warning somewhere else.

## The unborn repository — check this first

A repository with no commits has no branch to protect and no base to resolve: `git switch -c` and
`git rev-parse` both fail, and the guard below would bounce the chain back to `noetron-router`
forever. Detect it before anything else:

```
git rev-parse --verify HEAD    # fails → the repository is unborn
```

Unborn is not a violation — it is a **greenfield repository on its first task**, the most common
way this harness meets a new project. Establish the ground, then proceed:

1. Confirm with the user in one line: *this repository has no commits yet; I will create the initial
   commit on `<default-branch>` so the task branch has a base. Ok?*
2. Commit whatever already exists — the harness scaffold from `noetron-setup`, a `.gitignore`, a
   README — as `chore: initial commit`. An empty tree is a valid initial commit. **Read
   `git status --porcelain` into that confirmation**: "whatever already exists" is a blind `git add`
   otherwise, and an unborn repository is exactly where a directory full of the user's scratch files
   gets swept into the first commit of the project's history.
3. Resume at the guard below. The base now resolves and the task branch has somewhere to fork from.

Never work directly on the unborn default branch because "there was nothing to branch from": that
is the guard's exception dressed as a technicality.

## The protected guard — non-negotiable

Before any `git add` or commit, run `git branch --show-current`. If it returns `main`, `master`,
`develop`, `dev`, **or empty** (detached HEAD or mid-rebase — fail closed: empty is NOT cleared),
**STOP** and create the task branch first. There is no convenience exception and no trivial-task
exception — this rule outranks any pressure to move fast.

### Empty is not cleared — and step 1 does not override it

"Never fight the harness" (§1) is about the **workspace**: do not build a git worktree inside an
isolation the host already gave you. It was never a licence to commit onto a nameless HEAD, and read
that way it contradicts this guard — which wins, in both readings of *empty*. What differs is only
what clears it, and the evidence is one read:

```
git status                     # states any operation in progress, in prose
git rev-parse --git-dir        # the machine-readable form is the presence of these under it:
                               # rebase-merge/ · rebase-apply/ · MERGE_HEAD · CHERRY_PICK_HEAD
                               # · REVERT_HEAD · BISECT_LOG
```

- **any of them present → an operation is in flight.** Nothing clears the guard here: stop and hand it
  to `noetron-recovery`. A branch cut on top of an unfinished rebase buries the operation under a ref,
  and the sequencer state is then reachable only by someone who already knows it is there.
- **none present → the workspace is host-managed** (a platform checked out a ref and owns the
  directory). Keep the directory — that is §1's rule — and still cut the task branch **inside** it, at
  step 5, after step 4: a ref costs the host nothing and gives the commits a name. When the detached
  HEAD is not the ratified base, say so in one line before switching, because the workspace opened at
  a different ref and moving it is visible to whoever opened it.

A host that refuses the ref is a stated constraint, not a waiver: record it in the ledger's `branch:`
line as `detached @ <base-ref> (<short-sha>)`, and `noetron-finish`'s G2 then keeps only the options a
nameless HEAD can reach — push, or keep as is.

## What G0 already settled

`noetron-router` ratified tier, slug, branch name, base, **scope** (which packages the task touches,
in a workspace), **isolation** (branch or worktree), mode, and commit strategy at G0, and recorded
them in `.noetron/state.md`. This skill reads those and **executes** them; it re-asks nothing and
re-decides nothing.

An item missing from the ledger is a G0 gap, not a blank to fill: return to `noetron-router` for that
one item, then come back. A branch you guessed is a branch nobody agreed to — and a scope you inferred
sets the baseline, the verification set, and the overlays for the rest of the task.

## Order of operations

### 1. DETECT existing isolation — two questions, not one

**Am I inside a worktree?** Compare `git rev-parse --git-dir` with `--git-common-dir`. Different →
possibly already a worktree, but check `git rev-parse --show-superproject-working-tree` first:
submodules produce the same signal. Already isolated, whether the harness or the host created it →
report it and use it. **Never fight the harness:** a native isolation tool (the platform's worktree
command or workspace) beats reimplementing it in git, which leaves phantom state the host cannot see.

**Does a worktree for *this task* already exist?** The first question cannot answer it — it describes
where the cwd is, not what the task owns — and at slice `k+1` it is the question that matters:
`noetron-finish` merged slice `k` from the repository root, so the cwd is the root, the first question
answers "no", and the task's worktree is sitting there unfound.

```
git worktree list --porcelain    # the entry whose branch is the one .noetron/state.md names,
                                 # or whose path is .worktrees/<slug>
```

`noetron-recovery` §6 owns this enumeration for **adjudication** — which foreign worktrees are
orphans, which belong to other tasks, which are prunable. What runs here is the narrow lookup: one
path, one branch, this task's ledger, no ruling on anything else. Skipping it leaves N directories
for one task, against this skill's own per-slice rule, and cleanup by provenance then finds only the
last one.

### 2. READ the scope, don't ask for it
The ledger's `scope` names the packages G0 ratified. Derive three things from it and record none as
a question:

- **where the branch lives** — the repository root that owns those packages. Packages never carry
  branches of their own; a monorepo is one repository with one branch per task.
- **the verification set** — the ratified packages plus everything in `profile.md`'s dependency edges
  that consumes them, **transitively: follow the edges until the set stops growing.** The table holds
  one hop per row, so `api → web` and `web → admin` are two rows and one set — a change in `api`
  verifies `web` **and** `admin`. Stopping at the first hop leaves the break to surface in the package
  nobody ran. This set is what step 6 runs and what `noetron-verify` re-runs at every claim.
- **the overlays** — the rows of `.noetron/domain-skills.md` whose `Packages` column names a package
  in the ratified **scope**, plus every row marked `all`. Scope, not the verification set: a dependent
  is verified, not written, and a domain skill governs writing. This step is that column's reader —
  without one, every task in a workspace carries every package's skills and the filter the catalog
  advertises is decoration. The set is **re-derived, never recorded**: `scope` is already in the
  ledger and the rule above is the whole derivation, so a second copy could only drift.

Several **independent repositories** under one root is not a scope: it is N harnesses, one per
repository ([directory-layout.md](../noetron-setup/references/directory-layout.md)). Say which
repository you are in and stay inside it. A `scope` line absent from a multi-package ledger goes back
to `noetron-router` for that one item.

### 3. RESOLVE the base
Take the base from G0, then prove it: `git rev-parse <base>` resolves, and the short SHA the branch
actually forks from goes in the ledger. Unresolvable or absent → back to `noetron-router`. Never
assume `develop` exists, and never assume `main` is the base.

### 4. PRESERVE — read the tree before moving it

**Before any `git switch`, `git checkout`, `git worktree add`, merge, rebase, or pull — every one of
which this skill runs — `git status --porcelain`. Not empty → stop.** This rule outranks the step it
interrupts, and it is here because this is the node that actually runs those commands: the two
failures it prevents are both silent.

- **worktree** — the user's changes stay in the main tree, orphaned there. Nothing is deleted, which
  is why nobody notices: work continues in the new tree, and the final gate proves a tree missing
  everything the user had in flight.
- **branch** — `git switch` aborts on a conflicting change, and the most obvious way out is
  `git stash`, which the paragraph below forbids outright.

**`noetron-recovery` §7 owns the preservation procedure and this skill does not duplicate it.** Hand
the finding there and let it run: preservation is **proposed, never automatic**, and
`git stash`, `git reset`, `git checkout -- .` and `git clean` are never run on this skill's own
initiative. Only the user knows whether an uncommitted change is the active task, a neighbour's
leftovers, or the thing they were about to ask for next.

**One carve-out, and it is `.noetron/` itself.** G0 wrote the front matter in the working tree and it
is uncommitted **by design** — `noetron-execute` writes its ledger lines the same way, and
`noetron-finish` is the node that commits them. So a tree dirty only under `.noetron/` is the
harness's own record, not the user's work: it does not go to preservation, and a step that stopped on
it would stop on **every task**. Everything outside `.noetron/` does go, without exception.

That record still has to reach the tree that executes:

- **branch** — `git switch -c` carries the working tree with it. Nothing to do.
- **worktree** — `git worktree add` carries no uncommitted work, so the new tree opens with the idle
  scaffold and everything G0 ratified is invisible to whoever executes. **Copy every dirty file under
  `.noetron/` into the new worktree right after creating it**, and from that moment the worktree's
  copy is the one the chain reads and writes. The main tree keeps an uncommitted duplicate that goes
  stale at the first ledger line; reconciling it belongs to `noetron-finish`, the only node that
  commits `.noetron/` and the one that has to name which working tree its closeout writes in.

Empty, or dirty only under `.noetron/` → continue. Saying "clean tree, proceeding" in the same line as
the switch is this step working, not this step being skipped.

### 5. CREATE the isolation G0 chose

**Both forms name the branch and the base explicitly.** A command that lets git infer either one
creates a branch nobody ratified — and the record at the end of this step writes down what *G0*
said, not what git did, so from that moment the ledger is lying about where the work lives.

- **branch** — `git switch -c <type>/<slug> <base>` in the current tree.
- **worktree** — the path is `.worktrees/<slug>` by construction, and the command carries the ratified
  name and the resolved base:

  ```
  git worktree add -b <type>/<slug> .worktrees/<slug> <base>
  ```

  `git worktree add .worktrees/<slug>`, with no `-b` and no base, creates a branch named after the
  **directory**, cut from the **current HEAD** — which, at slice `k+1` after a local merge, is the
  base and, in the head of the chain, is whatever the session happened to be on. Neither is what G0
  ratified.

**Keeping a worktree out of version control never costs a commit on a protected branch.** Run
`git check-ignore -q .worktrees/` first — it exits 0 when the path is already ignored. Not ignored →
append `.worktrees/` to **`$(git rev-parse --git-common-dir)/info/exclude`**: it needs no commit, and
per-clone is exactly a worktree's scope, since a `.worktrees/` directory only ever exists in the clone
that created it.

Committing `.gitignore` "before creating the worktree" means committing on the branch the guard just
refused, and it is the **default path, not an edge case**: an un-ignored `.worktrees/` is what the
first worktree of a project meets in every repository whose `.gitignore` does not already carry the
rule. A durable versioned rule, when the project wants one, rides the task's own diff on the task
branch; it never earns a commit of its own on the base.

**Failure modes — every improvisation here is destructive.** These messages mean a branch or a
directory exists that this session did not create, which is `noetron-recovery`'s subject, not a name
to reuse:

| The command says | What it means | What to do |
|---|---|---|
| `fatal: a branch named '<type>/<slug>' already exists` | a crash, an aborted attempt, or the user cut it | **never** `git switch -C` (it moves someone's ref) and never a bare `git switch` onto it. Constate with `git log --oneline <base>..<type>/<slug>`, then `noetron-recovery` |
| `fatal: '<type>/<slug>' is already checked out at '<path>'` | the branch lives in a worktree | step 1's second question says whether that worktree is this task's — if it is, work in it; if it is not, `noetron-recovery` rules |
| `fatal: '.worktrees/<slug>' already exists` | a directory survived a closeout that never ran | `noetron-recovery` §6 — orphan, or ours. `noetron-finish` owns removal; **this skill never removes a worktree** |

Record branch and base SHA in `.noetron/state.md`. **The path is not recorded:** it is
`.worktrees/<slug>` by construction and re-found by step 1, never remembered. A field no template
carries and no writer table names is a field nobody reads.

### 6. BASELINE — tier picks the depth, scope picks the breadth

Two dials, never one. **Breadth** is the verification set from step 2 — never the repository, unless
the ratified scope is the repository. **Depth** is what runs inside it:

| Tier | Depth, inside the verification set |
|---|---|
| `trivial`, `small`, `bug` | the checks covering the touched area — its test target, plus lint or typecheck on those paths |
| `standard`, `large` | every check `profile.md` lists for each package in the set |

"The whole suite" in a monorepo means the suite of the ratified packages and their dependents. Running
`packages/ml` to start work on `packages/api` buys nothing and costs the minutes that make people skip
the baseline; skipping `packages/web` when it imports `api` hides exactly the break the edges predict.
Each package runs its own commands from its own directory — a workspace-level fan-out counts only when
`profile.md` records the tool that does it.

Run it through `noetron-verify` before any work. **A dirty baseline makes every later failure
ambiguous:** you cannot tell what you broke from what arrived broken, and that investigation costs more
than the run it replaced. Narrow does not mean lenient — the scoped baseline still runs, still has to
be green, and when no check targets the touched area the package's full set runs instead.

Red baseline → report it and ask whether to proceed or investigate (`noetron-debug`). Building on an
unexplained red is how a pre-existing failure gets billed to your diff.

**A package with no commands has no baseline — and says so.** `profile.md` fills a package's command
rows and its stack baseline **when the plan ratifies that package's stack**, which happens at G1,
after this node. So on greenfield — named above as the most common way this harness meets a new
project — and on any package whose block still reads `pending`, there is nothing here to run. Walk
`noetron-verify`'s ladder against what actually exists and stop at the first rung that holds: a build,
a typecheck, a lint, a command the repository already answers. No rung holds → **state, in the same
line that would have carried the green, that this package has no baseline yet and why.** Never write
"green": a baseline declared without a run is the false oracle `noetron-verify` names, and it is worse
than the missing one, because every later failure gets measured against a green that never happened.
The first command the task's own oracle establishes becomes that package's baseline from the next
slice on.

## Per-slice isolation — the ground cleared more than once

With `cadence: per-slice` in `.noetron/state.md`, the tail `execute ──► review ═G2═► finish` runs once
per deliverable slice, so this skill runs once per slice too. **G0 is not reopened by a slice:** tier,
scope, isolation, mode, and commit strategy are already ratified in the ledger. Read `slice:` and
execute — a slice that re-asks them multiplies the kickoff by N, which is the cost the loop exists to
avoid.

Slice 1 runs on `<type>/<slug>`, the task branch this skill cut at the head of the chain — that is
where the plan and the spec were written. Every later slice asks **one question, and asks git, never
memory**:

```
git merge-base --is-ancestor <slice k's branch> <base>    # exit 0 → the base already carries slice k
```

`<slice k's branch>` is the one slice `k`'s `## Delivered` line records; `<base>` is the base ratified
at G0, resolved fresh through step 3.

| The base carries slice `k` | What slice `k+1` does |
|---|---|
| **yes** — the merge landed | cut `<type>/<slug>-s<k+1>` from the ratified base |
| **no** — a PR is open, or the destination was *keep the branch* | **continue on the same branch.** Cut nothing, rename nothing |

**Two categories, not three options.** The G2 menu has three; enumerating them here is what left the
hole, because **an open PR is neither "landed" nor "keep"** — a slice under review fell outside both
clauses and both improvisations were bad: cut from a base without it, or stack the next slice's
commits inside a PR someone is reviewing. Asking the base closes it without a fourth rule, and it
survives a menu that grows. It is also the only reading that is *correct* rather than remembered: a
user who merges the PR themselves between two slices changes the answer, and no field in the ledger
would have noticed.

**What slice `k+1` finds in `.noetron/` is why the categories are not cosmetic.** `.noetron/` is
versioned, so it has one copy per branch:

- **cut from the base** — `noetron-finish` commits the closeout bookkeeping *before* it executes the
  destination, so the merge carries that commit into the base along with the code. The new branch
  therefore opens on a tree whose `state.md` already holds slice `k`'s `## Delivered` line, the cursor
  at `slice: k+1`, the reset ledger section, and the plan and spec pointers.
- **continue on the branch** — nothing moves, so nothing is reverted: the tree in front of you is
  already the one holding all of it, and the bookkeeping commit is on the branch (pushed with the PR,
  or sitting on the kept branch) rather than in the base.

The move the old table produced is the one to keep forbidden: **cutting a branch from a base that
never received slice `k` reverts `.noetron/state.md` to the base's version** — cursor, `## Delivered`,
ledger and all — and the next session opens `status: idle` on a live task with slice `k`'s delivery
invisible. The code is still recoverable from the branch; the record is what nobody notices is gone.

**In worktree mode the worktree persists across slices** — `noetron-finish` cleans it only at the last
one — so the new slice's branch is created **inside** the existing worktree, the one step 1's second
question found:

```
cd <the path git worktree list --porcelain reported>
git switch -c <type>/<slug>-s<k+1> <base>     # only in the "yes" row above; step 4 runs first
```

One worktree per slice leaves N directories for one task, and cleanup by provenance finds only the
last.

**The baseline is per slice too:** step 6's dials still pick it, with breadth narrowed to what the new
slice touches, run on the previous slice's proven-green result. The full baseline runs once, at slice
1; re-running it at slice 4 re-proves three slices that already landed green.

## Where this skill gets talked out of its own rules

Each line is a thought that arrives right before the violation. The reply is what to do instead.

| The thought | What to do |
|---|---|
| "One line, I'll just commit on this branch" | Branch first. The protected guard reads the branch name, not the diff size. |
| "Detached HEAD, so the guard has nothing to protect" | Empty is not cleared. One command says which reading it is: an operation in flight goes to `noetron-recovery`; a host-managed workspace still gets the task branch cut inside it. |
| "I'd know if I were in a worktree" | Run the detection. Harness-created isolation and submodules both look like an ordinary checkout. |
| "I'm at the repo root, so this task has no worktree" | That answers where the cwd is. `git worktree list --porcelain` answers what the task owns — and after a slice's merge the cwd is always the root. |
| "The tree is dirty, I'll stash it and switch" | `git status --porcelain` first, then stop. `noetron-recovery` §7 owns preservation, it is proposed and never automatic, and `git stash` is one of the four commands this skill never runs on its own. |
| "The worktree will pick the changes up anyway" | It will not. `git worktree add` carries no uncommitted work, and the gate at the end then proves the tree that is missing it. That is also why G0's front matter is copied in by hand — otherwise the worktree opens at `status: idle` and the gate the user just closed is invisible to whoever executes. |
| "The tree is dirty, so step 4 stops — every time" | Only outside `.noetron/`. The harness's own uncommitted record is the carve-out; the user's uncommitted work never is. |
| "G0 said branch, near enough" | Open the ledger. An item nobody recorded goes back to G0 — it does not become a default here. |
| "Faster to `git worktree add` than to find the host's command" | Use the host's. Git-level worktrees leave state the platform cannot see, and cleanup finds it later. |
| "`git worktree add .worktrees/<slug>` is the same command" | It is not. With no `-b` and no base it names the branch after the directory and cuts it from the current HEAD — then the ledger records the name G0 chose, for a branch that does not exist. |
| "`.worktrees/` is ignored in every repo" | `git check-ignore` answers in one second, and in a repository whose `.gitignore` never got the rule it answers *no*. |
| "One small commit on `main` to ignore `.worktrees/`" | The guard has no convenience exception, and this is the default path of every project's first worktree. `info/exclude` needs no commit and matches a worktree's scope exactly. |
| "The branch already exists, I'll just switch onto it" | A branch this session did not create is `noetron-recovery`'s subject. `-C` moves someone's ref and a bare `switch` adopts it — both destroy the evidence of how it got there. |
| "Trivial task, the baseline can wait" | Run the scoped one. Tier shrinks the baseline; nothing removes it. |
| "Greenfield, so the baseline is green by definition" | Nothing ran. Walk `noetron-verify`'s ladder; when no rung holds, record that this package has no baseline yet. A declared green is a false oracle with a longer half-life than no baseline. |
| "It's a monorepo, run everything to be safe" | Run the verification set. A baseline nobody has patience for is a baseline that gets skipped. |
| "The change is in `api`, so `web` is irrelevant" | Check the dependency edges. `web` imports `api`; its suite is where the break surfaces. |
| "`web` consumes `api`, so the set is `api` and `web`" | Follow the edges to closure. `admin` consumes `web`, so `admin` is in the set too — the table holds one hop per row, not the whole chain. |
| "Every domain skill applies to every task" | The `Packages` column filters them by the ratified scope, and this step is that column's only reader. |
| "Slice 2 just continues on slice 1's branch" | Ask git: `git merge-base --is-ancestor`. It continues only when the base does not carry slice 1 — an open PR included. |
| "They chose merge for slice 1, so slice 2 cuts from the base" | The menu is not the record. The base is: a merge that failed, or a PR that was never merged, gives the same answer through one command. |
| "New slice, so re-run G0 for its branch" | The ledger already holds it. Read `slice:` and cut the name the table gives. |
| "New slice, new worktree" | The worktree belongs to the task. Create the slice's branch inside it; `finish` removes it at the last slice. |
| "New slice, run the full baseline again" | Scope it to what this slice touches, on the previous slice's green result. The full one ran at slice 1. |

## Integration

- `noetron-router` — G0 ratified everything this skill executes, scope included, **and wrote the
  slug**; this skill only reads it.
- `noetron-recovery` — **owns the preservation procedure step 4 stops for**, and this skill never
  duplicates or improvises it. It also adjudicates every branch, worktree, or in-flight git operation
  this session did not create, which is where §5's three failure modes go. The one thing this skill
  runs from that toolkit is the narrow lookup in step 1: this task's worktree, by its own ledger's
  branch.
- `noetron-setup` — `profile.md` supplies each package's commands and the dependency edges that turn
  the ratified scope into a verification set; `domain-skills.md`'s `Packages` column is what step 2
  filters the overlays with. A package whose `profile.md` block is still `pending` is the greenfield
  baseline case, not a lookup failure.
- `noetron-verify` — the baseline proof, the ladder a package with no commands walks, and the same
  set at every later claim.
- `noetron-debug` — an unexplained red baseline.
- `noetron-interview` — the node the graph sends this one to in the `large` chain: the ground is
  cleared first, so the decisions it opens are answered with a branch already under them.
- `noetron-plan` — its slice table with the ratified cadence says how many branches this skill cuts.
  The slug is **not** decided there: it is ratified at G0 and written by `noetron-router`, and a
  second authority over it would give the branch and the plan two names for one task.
- `noetron-execute` — starts writing the moment this skill clears the ground, and returns here at each
  slice boundary for the next slice's branch and its scoped baseline.
- `noetron-finish` — mirrors this detection and cleans by provenance what this skill created; it
  commits the closeout bookkeeping before executing the destination, which is what makes the base a
  complete starting point for the next slice when the merge lands.

---

**This skill is working if:** no commit ever lands on a protected branch, and none is made to ignore a
worktree; every task branch traces to a base SHA someone ratified and to the name G0 gave it, never
to one git inferred; worktrees never appear inside version control, and one task never has two; no
uncommitted change is ever moved, stashed, or lost by a command this skill ran; this skill never asks
the user a question G0 already answered; slice `k+1` of a `per-slice` task starts from a base that
`git merge-base --is-ancestor` proves carries slice `k`, or stays on its branch — so an open PR is
never the case nobody wrote a rule for, and no branch switch ever reverts `.noetron/state.md` under a
live task; and no failure investigation ever starts with "was the baseline even green?" — including
in a greenfield repository, where the honest answer is that there was none yet and it says so.
