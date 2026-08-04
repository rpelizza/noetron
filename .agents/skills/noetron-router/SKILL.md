---
name: noetron-router
description: Use when a request needs its route — the tier, the chain, gate G0 before the first write — and when a failed oracle, a broken premise, or a gap forces a re-route mid-chain; `noetron-core` hands off here.
---

# Noetron Router

The graph. Every task-bearing request arrives from `noetron-core` and leaves with a **tier**, a
**chain**, and — for anything that writes — a **ratified G0**. Routing is deterministic: the same
request yields the same chain, and no chain is shortened because the work "looks small".

<EXTREMELY-IMPORTANT>
**A router that points at a skill that does not exist is a router that lies.** Every node label in
the graph resolves to a row in the routes tables, and every skill under `.claude/skills/` has
exactly one row there. A new harness skill adds its row **in the same change that creates it** — a
route and its node are born together.

**And every edge the graph draws is instructed by the node it leaves.** A node names its successor
in its own file — in `## Related skills` when nothing more specific applies — so a chain survives a
reader who has only that one node open. A node drawn in the graph that no path actually enters is
the second half of the same defect, and it is the costlier half: the label resolves, the route
exists, and the work still goes somewhere else. `scripts/sync-noetron.mjs --check` is the oracle for
both halves, and it runs on every sync.
</EXTREMELY-IMPORTANT>

## 1. CLASSIFY — kind, then size

Two questions, in this order, and both answers go in the same line.

**Kind — what the work is.** A request to *change* what the system does runs the change chains. A
request to *repair* behavior the system already promised — a symptom, a failing test, an incident —
is a **defect**, and defects enter through `debug(triage)`, because a fix proposed before its red
command is a guess wearing a diff. A question that needs no write is `read-only`.

**Size — how large the blast radius is.** Score the request on three signals, take the **highest
band any one of them names**, and state it in one line so the user can override it. The ledger's
`tier` field carries this answer.

| Size | Files touched | New dependency or contract | Open decisions |
|---|---|---|---|
| `trivial` | one file, a few lines — nothing created or deleted | — | none: the change is obvious as stated |
| `small` | one file past a few lines, or a second file that only follows it (its test, its import site) | — | one, and reading the code settles it |
| `standard` | 2–5 files, each carrying part of the change | a new internal module, or an internal contract others call | one real choice the code cannot settle |
| `large` | more than 5, or a change that cuts across layers | an external dependency, a public API, or a new stack | several, still open |

**The bands exclude one another, and a `—` names no band.** Both halves are load-bearing, and the
first is the repair of a measured hole: the cells used to nest — `trivial` read "a few lines",
`small` read "one file" — so every change satisfying the first satisfied the second too, and since
the highest band wins, **`trivial` was unreachable by that signal**. "Change the button label to
'Save changes'" then bought a review node in fresh context and a fix loop of up to 5 rounds. A `—`
cell means the signal has nothing to say: it never raises the tier and never lowers a band another
signal already named.

**Tie-breakers, and they apply to defects exactly as they apply to changes.** Work touching the
**security surface** — the territory the `noetron-security` overlay names in the table below,
**dependencies included** — or a public contract is **at least `standard`**. That overlay row is the
single definition of the term; this section carried a second, shorter enumeration of it, the two
disagreed about dependencies, and one enumeration disagreeing with another is all it takes for one
request to admit two defensible tiers. Ratified consequence, written down so it is never re-derived:
**"update `axios` from 1.6.7 to 1.7.2" is `standard`, always** — one line in one lockfile is still
that surface. A greenfield product is `large`. Work whose size you cannot tell is `standard` — state
the doubt in the same line.

**Kind and size compose.** A defect carries a size like everything else, and the size decides what
happens after triage:

| A defect that scores | Route |
|---|---|
| `trivial` or `small` | the `bug` chain, whole — triage → branch → red → fix → verify → scoped review → finish |
| `standard` or `large` | **triage only**, then re-enter as `standard` from G0, with the root cause already in hand |

This is the hole that composition plugs: an authentication bug is a security surface, so it scores
at least `standard`, so it triages and re-enters standard — the short chain never gets it. Same for
a defect whose fix needs a decision about behavior, contract, or accepted risk: an open decision is
an open decision whether it arrived as a feature request or as a bug report.

The ledger records both — `tier: bug (<size>)`, the chain outside the parenthesis and the size
inside it. `noetron-branch` reads the size for baseline depth and `noetron-review` for review
scope; a `bug` line with no size leaves both of them guessing.

Size governs the chain **and the ceremony inside each node**: at `trivial`, `small`, and `bug`,
`noetron-branch` runs a baseline scoped to the touched area instead of the whole suite, and
`noetron-design` skips the ratified direction contract (rendered verification still applies to any
real visual change).

Classification happens **here and once**. A downstream skill that re-derives the tier produces a
second answer and one argument; `noetron-plan` and `noetron-execute` take it as given.

## 2. ASSEMBLE — the chains

```text
read-only   explore ──► answer                                    (no artifacts, no state)

trivial     G0 ──► branch ──► execute ──► verify ──► finish

small       G0 ──► branch ──► execute ──► verify ──► review(scoped) ──► finish

standard    G0 ──► explore ──► branch ──► plan ═G1═► spec ═G1═► ┌► execute ──► review ═G2═► finish ─┐
                                                                └── branch ◄── next slice ◄────────┘

large       G0 ──► explore ──► branch ──► interview ──► plan ═G1═► spec ═G1═► ┌► execute ──► review ═G2═► finish ─┐
                                                                              └── branch ◄── next slice ◄────────┘

bug         G0 ──► debug(triage) ──► branch ──► execute(red → fix) ──► verify ──► review(scoped) ──► finish
                        ├── size ≥ standard (sensitive surface, contract, open decision) ──► re-enter as standard
                        └── architectural (3-fix rule) ──────────────────────────────────► re-enter as standard
```

`═G═►` is an edge a human opens. `──►` is gated by the previous node's oracle.

**Every node label names its skill** — `noetron-<label>` — and a parenthetical names a mode inside
that skill, never a second node. `answer` is the read-only terminal; `G0`, `G1`, `G2` are gates.
The trivial and small chains once drew an `implement` node: no such skill, no such route, and the
one label in the graph a reader could not follow. `noetron-execute` already owns the single change
in those chains and the red→fix cycle in the bug chain, so `implement` was a phase name wearing a
node's clothes. It is now `execute`, which is what actually runs.

**`branch` precedes every node that writes** — including `plan` and `spec`, whose artifacts are
files. Putting `branch` after the planning nodes looks harmless until isolation is a worktree:
`git worktree add` carries no uncommitted work, so a plan and spec written first would not exist in
the tree that executes them.

**Two things run before it, and both are named here rather than discovered.** `explore` reads and
never writes. **The G0 front matter is written before `branch` and cannot be anything else** — the
ledger is what tells `branch` which isolation to build, so a rule that put it after would have the
isolation decided by a file the isolation has to create. That circularity is real and it is closed
in [Closing G0](#closing-g0--this-skill-writes-the-front-matter-in-full): the write happens in the
current tree, and in `isolation: worktree` `noetron-branch` carries it into the worktree it creates.
Anything else on this side of `branch` is a violation, not a third exemption.

**That rule has no slice exception, which is why `branch` sits on the loop's return edge.** Slice 1
enters `execute` from the head, on the task branch already cut for the plan and the spec; every later
slice re-enters through `branch`. The failure is not hypothetical: `noetron-finish` merges slice `k`
locally **in the tree that holds the base** — the repository root under `worktree`, the same tree
under `branch` — so when it returns, HEAD is on the base.
A loop that re-entered at `execute` would put slice `k+1`'s commits straight onto `main` with the
protected guard never having run, and would skip that slice's scoped baseline as well — the next
failure then has no green to be measured against.

**Every chain ends at `finish`.** A chain that stops earlier has left the workspace dirty and the
ledger open.

**The tail loops; the head never does.** When the approved plan declares two or more independently
deliverable slices and G1 ratified `cadence: per-slice`, the segment
`branch ──► execute ──► review ═G2═► finish` runs **once per deliverable slice**. Everything before
the spec's G1 runs exactly once for the whole task — tier, scope, plan, spec, the domain-skill gate.
A slice that re-opened G0 or re-ran the plan's stress would multiply the ceremony by N, which is the
cost this loop exists to avoid.

**Where slice `k+1` starts is one question with two answers: does the base already carry slice `k`?**
Not three, and not a memory of which menu option the user picked at G2 — it is decidable on the spot,
by `git merge-base --is-ancestor`, and `noetron-branch` is the node that decides it.

| Slice `k`'s destination | Where slice `k+1` starts |
|---|---|
| **the base carries it** — merged locally | cut `<type>/<slug>-s<N>` from the ratified base |
| **the base does not** — a PR opened and not yet merged, or *keep the branch* | **continue on the same branch**, cutting nothing |

Enumerating destinations one by one is what left a hole: an open PR is neither "landed" nor "keep",
so it fell outside both clauses and the two improvised exits were cutting from a base without the
previous slice, or stacking new commits inside a PR under review. **Continuing also preserves
`.noetron/state.md`**, which is versioned: switching to a branch cut from a base that never received
slice `k` reverts the cursor, `## Delivered`, and the ledger to the base's copies, and the next
session reads `status: idle` on a task that is very much alive.

**G2 asks the destination at every slice.** After slice 1 it is a one-line confirm that repeats
**the previous slice's destination, read from `## Delivered`**, with the full menu reachable by
naming another option. G1 ratified the *cadence* — **when** to deliver — and never **where**: there
is no ratified destination policy, so a confirm citing one is reading a field no skill writes.

`finish` advances `.noetron/state.md` to `slice: <k+1>` and resets it to idle **only at the last
slice**. `cadence: single-delivery` collapses the loop to one pass — the old shape, now chosen
explicitly instead of by default. The failure this replaces is measured: 7h47, stopped at task 5 of
8, two finished slices nobody could use, because the chain had one destination and it was at the end.

**This table is exhaustive over the edges the diagram draws between nodes**, and it holds nothing
else. The `bug` chain's two escalation arrows land on prose, not on a node: they are re-routes and
§5 owns them. It used to carry `task N → task N+1`, which is not an edge of this graph at all — it
is a step inside `execute`, whose loop owns it and whose ledger records it. A table that mixes the
graph's granularity with one node's internals is a table nobody can audit against the drawing, and
the omission it hid was real: `verify → finish` closes the `trivial` chain and had no row while
`review → finish` did.

| Edge | Oracle that opens it |
|---|---|
| `G0` → the chain's first node | the user answered the kickoff line, and the front matter is on disk carrying `status: active` |
| explore → answer | the question is answered from what the repository actually says; nothing was written, so no ledger and no gate |
| explore → branch | the facts the chain needs are gathered and written down, and the tree is untouched |
| branch → the chain's first writing node (plan · interview · execute) | the protected guard held, the base resolved, the isolation G0 chose exists, and the scoped baseline is green |
| interview → plan | every material decision this chain opened is answered or explicitly accepted — including the one-line "none open" |
| plan → spec | plan `status: approved` (stressed and ratified), **with its slice table and its cadence** |
| spec → execute | spec `status: ready` (self-review passed, ratified) |
| debug → branch | the red command ran with its failing output pasted, and the triage class is declared; in the incident class, containment already happened and is recorded |
| execute → verify (short chains) | the change's own oracle ran fresh and its output was read; in `bug`, the red-green proof |
| execute → review | the delivery's tasks are complete and **that delivery's** validation is green — under `per-slice`, the slice's `### Slice validation`, and at the **last** slice its `### Slice validation` **and** the spec's `## Validation`, which only there runs on a tree carrying every slice; under `single-delivery`, the spec's `## Validation`. The spec's Validation on a non-final slice is red by construction — it covers criteria of slices that do not exist yet — and a finished, integrable slice would sit behind a red it can never turn green |
| verify → review (scoped) | the oracle is green and the diff was read line by line against the brief |
| verify → finish (`trivial`) | the same, and the step oracle is the whole proof at that tier — which is why the tier exists |
| review → finish | review passed, or findings adjudicated in writing |
| slice k `finish` → slice k+1 `branch` | slice k reached a recorded destination and its `## Delivered` line is written in `.noetron/state.md` |
| slice k+1 `branch` → slice k+1 `execute` | the slice's branch exists per `noetron-branch`'s per-slice table — cut from the ratified base when that base already carries slice k, continued on the same branch when it does not — and that slice's scoped baseline is green |

**`verify` and `interview` are nodes *and* standing guards, and neither fact cancels the other.**
The graph draws them where a chain of that shape always passes through them — `verify` closes the
short chains, `interview` opens `large` — and they also fire **undrawn, anywhere, in any chain**:
`noetron-verify` at every claim of success, `noetron-interview` at every material gap. Being a guard
does not remove the node; being a node does not confine the guard; neither can be skipped by tier.
Writing "neither is a node" while drawing both was two defensible answers to the same question in
one file, and the question it left open was concrete: in a greenfield `large` chain whose user
arrived with closed requirements, does `interview` run? **It runs, and "no material decision open"
is a result** — one line naming what was checked against what. What is forbidden is the silent skip,
which leaves the same assumptions unnamed and attributable to nobody.

**Overlays** apply to every node in their territory and travel in the dispatch briefing — the
overlay table below names them.

**Parallelism:** write nodes serialize; read-only nodes fan out.

## 3. RATIFY — gate G0

The kickoff gate belongs to this skill and fires in every mutating chain, before the first write.

**`trivial` and `small` — one line, everything named:**

```
Kickoff: <tier> · <slug> on branch <type>/<slug> @ <base-ref> (<short-sha>)
— scope: <packages>¹ · isolation: branch · mode: inline · commits: granular. Ok?
(overrides: worktree · subagents/team · squash-final · a different scope, name, or base)

¹ workspaces only; a single-package repository omits the segment.
```

One "ok" ratifies all of it; a named override adjusts that item and keeps the rest. Do not split
this line into separate questions.

**`bug` — one line, symptom first:**

```
Kickoff: bug (<size>) · <slug> on branch fix/<slug> @ <base-ref> (<short-sha>)
— symptom: <one line> · repro: <the red command, or "not reproduced yet">
· scope: <packages>¹ · isolation: branch · mode: inline · commits: granular. Ok?
(overrides: worktree · subagents/team · squash-final · a different scope, name, or base)
```

The symptom and the repro sit in the line because they are what the user is actually buying, and
because `repro: not reproduced yet` warns them that `debug(triage)` may come back with a different
size. Triage fits **inside** this gate the way `explore` does: running a failing command and reading
its output writes nothing. When triage escalates — a bigger size, a sensitive surface, the 3-fix
rule — re-ratify per **§5** and re-enter as `standard`; every other item in the line stands.

**The incident class is the one exception, and it is an exception in both directions.** When triage
classifies *incident — active damage*, `noetron-debug` contains **first**, reversibly — a flag off,
a rollback, traffic blocked. That writes, in production, and it is not this gate's to grant: live
config, data, and access are the explicit-human-approval guardrail in `CLAUDE.md`, so containment is
put to the user **as its own question, immediately, before the kickoff line** — never queued behind
a gate while the damage runs, and never taken on the agent's own authority because the damage makes
it obvious. It is also outside the chain's isolation by construction: containment changes a running
system, not the source tree, so `noetron-branch` neither precedes it nor covers it. The kickoff line
then records what happened rather than what is pending:

```
· contained: <what was done> @ <time>   — or   contained: no — <why not>
```

Both readings this replaces are failures with names: "triage writes nothing" walked a containment
past an open G0 and an unrun `branch`, and "no write before the gate" watched users lose data while
a kickoff line waited for an answer.

**`standard` and `large` — sequential, one decision per turn**, each with a recommendation and its
reason, in this order: **scope** (workspaces only) → **isolation** (branch or worktree) → **mode**
(inline · subagents · team, all three always visible) → **commits** (granular or squash-final;
squash only on request). Review is **not** among them: the two lenses are always split, never a user
choice — a single reviewer holding both lenses cannot be blind to the spec while judging against it.

**Four decisions are asked and ten fields are written**, so the sequence ends with the same complete
line the short tiers open with. The slug, the branch name, and the base are in none of the four, and
`noetron-branch` treats each of them as a G0 gap rather than a blank to fill — without this line it
hands them back one item per turn, which is the ping-pong the sequential gate was accused of.
Filling them by default is the violation `CLAUDE.md` names outright, so they are **recommended and
confirmed**, after the fourth answer, in one line:

```
Kickoff: <tier> · <slug> on branch <type>/<slug> @ <base-ref> (<short-sha>)
— scope: <ratified> · isolation: <ratified> · mode: <ratified> · commits: <ratified>. Ok?
(overrides: a different name or base — the four answers above stand as ratified)
```

This is a confirmation, not a fifth decision: the four ratified items are echoed so the user sees
the record about to be written, and what the line actually asks for is the name and the base. One
"ok" closes the gate.

**Scope is a G0 item, not a question the executor asks later.** In a repository with several packages,
which ones the task touches — `packages/api` alone, `api` plus `web`, the whole workspace — decides
the blast radius of the diff, the baseline and verification set (`noetron-branch`), and which domain
skills travel as overlays. That is a product decision, so it is ratified here with the rest, and it
goes first at `standard` and `large` because isolation and mode are answered differently once it is
known. "Adding rate limiting to search" reads as one endpoint until the user says the web client and
the ML scorer move with it. Recommend the narrowest scope the request supports, name what it excludes,
and wait.

**What the `commits` item buys.** Both strategies commit code *during* execution — `noetron-execute`
owns that commit and names its moment. What they decide is what survives to the destination:

| Choice | During execution | At `noetron-finish` |
|---|---|---|
| `granular` | one commit per task, or per change in the short chains | honored as they are; reorganization is offered, never performed |
| `squash-final` | identical — the review package is a commit range and the ledger recovers by SHA | collapsed into one commit before the destination, its message confirmed first |

Ratifying `squash-final` here **is** the explicit request `CLAUDE.md` demands, so `noetron-finish`
executes it instead of asking a second time. Nothing is squashed, rebased, or amended mid-chain.

**`mode` names who implements — never who reviews.** The `review(scoped)` node in the `small` and
`bug` chains, and every review at `standard`/`large`, runs in a **fresh context** in every mode,
`inline` included: a reader who already knows why the code looks like that cannot see what it is
missing. `noetron-execute` holds the mechanics and the single degraded case, which declares itself.

### Closing G0 — this skill writes the front matter, in full

A gate is closed by the file, not by an agreement in the transcript. On the user's answer, and before
handing the chain to its next node, **this skill creates the front matter of `.noetron/state.md`**
from the template in [state.md](../noetron-setup/references/state.md) — every field, in one write:

```
task · slug · status: active · tier · phase · scope · branch · isolation · mode · commits
plan: none · spec: none
```

Three of those were never anyone's: `status: active` is the flag `noetron-core` routes on, `phase:`
is where a resumed session re-enters, and `task:`/`slug:` are how it knows *which* task it resumed.
They are ratified nowhere because they are not choices — they are the record that the choices
happened, and this is the only node that sees the gate close. **`task:` is the imperative title of
the kickoff line the user just answered and `slug:` is its slug form**, so the gate ratifies one
name and the ledger writes both; a title invented here that the line never showed is a record of a
conversation that did not happen. `plan` and `spec` start at `none` and are filled by the skills that
create those files. `cadence`, `slices`, and `slice` belong to G1 and are written by `noetron-plan`;
a chain with no plan never writes them.

**`phase:` opens at the chain's first node — and every chain's first node has a legal value:**

| Chain | `phase:` written at G0 close |
|---|---|
| `trivial`, `small` | `branch` |
| `standard`, `large` | `explore` |
| `bug` | `debug` |

The enum in [state.md](../noetron-setup/references/state.md) covers all nine nodes of the graph for
this reason. It once held five, and **the first node of every mutating chain was outside it**: in a
`small` chain compacted between this gate and the first write, the only legal value naming anything
in the chain was `execute` — so recovery re-entered at `noetron-execute`, which commits, with
`noetron-branch` never having run. No protected guard, no resolved base, no baseline, and the commit
lands on `main`. A field whose enum cannot express the state it is written in is not a cursor.

**Read `status:` again immediately before this write — it is one write and it overwrites everything.**
The front matter, `## Delivered`, the ledger, and `## Decisions` of whatever is already in the file go
with it. `status: active` here means a second task arrived **mid-session**, and that is the one arrival
neither of the harness's other two checks can see: `noetron-core` fires on the first read of the file
in a session, `noetron-recovery` §2.1 on a resumption. Stop and hand the conflict to `noetron-recovery`
§2.1 — never write over a live task, and never run the new request under the old task's ratified G0.
This is the third of the three enforcement points [state.md](../noetron-setup/references/state.md)
§ Rules names, and it is the one the common path actually walks.

**A chain that reaches its first write with `status: idle` on disk has disarmed its own recovery.**
The next compaction finds an idle ledger, sends the request back through classification, and re-opens
the gate the user just closed — which is the exact failure `noetron-recovery` exists to prevent, made
unreachable by the file it reads.

**Which tree this write lands in.** Under `isolation: branch` there is one working tree and the
question does not arise. Under `isolation: worktree` there are two, `.noetron/` is versioned, and
`git worktree add` carries no uncommitted work — so a front matter written here and left here stays
in the tree that ratified the gate, while the worktree that *executes* starts from the committed
scaffold at `status: idle`, with everything the user ratified invisible to whoever runs the chain.
That is the disarmed recovery above, produced by the gate that writes against it. So the record ends
up in two trees, and each copy has a named owner:

1. **here, in the current tree, as the gate closes** — between this gate and the isolation sits
   `noetron-branch`'s baseline, which can run for minutes; a compaction in that window must not spend
   the user's ratification a second time;
2. **inside the worktree, by `noetron-branch`, as that isolation's first write** — the same front
   matter, carried in with everything else dirty under `.noetron/`, alongside the resolved base SHA
   and the worktree location that skill already records. From that moment **the worktree's copy is
   the ledger** the chain reads and writes; the root tree keeps an uncommitted duplicate that goes
   stale at the first ledger line, and reconciling it belongs to `noetron-finish` — the only node
   that commits `.noetron/`, and the one that has to name which working tree its closeout writes in.

Two copies of one versioned cursor are a **property of worktree mode**, not an improvisation: what
is forbidden is leaving which one is authoritative to whoever opens the file next. Named here, once:
after `noetron-branch` runs, it is the worktree's.

**A recommendation is not an answer**: the gate is open only when the user has replied. A
`trivial` task reaches its first write with exactly one stop.

## 4. RUN

**This skill does not hand the chain over and leave — it walks it.** Every dispatch to a node is this
skill dispatching, which is why the graph draws no edge *into* `noetron-router`: a chain never
returns here, because it never left. Saying so is the repair. Read as a node the chain departs, this
skill had no moment at which to write `phase:` and nobody was going to do it instead — no node
instructs a return here, and none may, because a node announcing its own arrival is what the next
paragraph forbids. A `single-delivery` chain then ran from `execute` all the way to `finish` with
`phase:` still reading whatever G0 wrote.

**Write `phase:` at every node transition: this skill, one write, before the node's first action.**
Transitions have no other owner. A node does not announce its own arrival, and "the ledger records
phase transitions" in the passive is how that field stays where G0 put it. Inside a node `phase:`
does not move, which is what makes it a re-entry point rather than a progress bar; task completions
*inside* `execute` are the ledger's business and `noetron-execute` writes them in real time.
`noetron-finish` writes the last transition of all, back to `status: idle`.

**Compaction is the one thing that ends the residency**, and the walk is then re-established rather
than remembered: `noetron-core` reads `status: active`, `noetron-recovery` reconciles the record
against git and hands the chain back here, and this skill resumes writing transitions from that node
on. That handback is the single inbound path, and it is why `noetron-recovery` names this skill as
the owner of `phase:` rather than writing the field itself.

### Where a resumed chain re-enters

`.noetron/state.md` is the crash-recovery point, and after compaction it outranks memory. **Three
reads, in this order, and no fourth rule:**

1. **`## Delivered`** — those slices are integrated and are never re-executed, whatever the ledger
   below them says;
2. **`slice:`** — which slice's ledger the section on screen is;
3. **`phase:`** — the node. Inside `execute`, and only there, re-entry is at the first ledger line
   without a `complete` — keyed `Task N` in a spec chain and `Change` in a short one, per
   [state.md](../noetron-setup/references/state.md); at `plan` and `spec` it is at the artifact's
   own `status:`; at `branch`, `interview`, `review`, `debug`, and `finish` it is that skill's own
   entry point. `noetron-recovery` § 3 holds one rule per value.

In a chain that produced no plan the first two are absent — nothing ever wrote them — and the read
starts at `phase:`. All of it **after `noetron-recovery` reconciles the ledger against git**, since a
missing line over an existing commit re-dispatches finished work. The chain is not re-classified: the
tier is already in the ledger.

**There is no per-node completion line, and there never was.** "Re-enter at the first node without a
completion line" described a record nothing in this harness writes, and it competed with two other
rules for one decision. The three cursors are distinct and nested: `## Delivered` outranks
everything, `phase:` is the node-level cursor, and the ledger's own `complete` line is the
task-level cursor **inside `execute`** and nowhere else. The order above is `noetron-recovery` §3
and §5 deliberately — two skills reading one file must read it the same way, or the ledger has two
meanings and the tie goes to whichever ran last.

## 5. ADAPT — when an oracle fails

- a failing **step** → its stop condition (attempts, then escalate), or `noetron-debug` when the
  cause is not evident;
- a failing **premise** (a plan assumption proved wrong) → re-plan the remaining subgraph from the
  failed node — never restart the whole graph, never improvise past the failure;
- a **gap** → `noetron-interview`, then resume exactly where the graph stopped;
- a **tier proved wrong by evidence** (the "one file" turned out to be five, the mechanical fix
  needs a decision) → re-route once, say so in one line, and re-ratify G0 for what changed. A tier
  revised because the work grew is honest; a tier revised to skip ceremony is the violation.

## Direct routes

### Node routes

| Situation | Route |
|---|---|
| The first substantive move of any conversation | `noetron-core` — which hands off here |
| A request needs a tier, a chain, or G0; a re-route after a failure | `noetron-router` |
| `.noetron/` missing or incomplete | `noetron-setup` |
| The ledger shows an active task, or the record and the repository disagree | `noetron-recovery` |
| A factual question about the repository or workspace | `noetron-explore` |
| A material decision is open | `noetron-interview` |
| A `standard` or `large` task needs its design before any code | `noetron-plan` |
| An approved plan needs its executable tasks | `noetron-spec` |
| First write of a chain that commits | `noetron-branch` |
| Ratified work needs implementing, or an execution needs resuming | `noetron-execute` |
| About to claim anything works, passes, or is done | `noetron-verify` |
| A bug, test failure, or unexpected behavior | `noetron-debug` |
| Work needs review; review feedback arrived | `noetron-review` |
| Execution complete and the work needs a destination | `noetron-finish` |
| Creating, editing, or retiring a domain skill | `noetron-create-skill` |
| A recurring failure suggests a standing rule; the verification standard or the learnings file needs work | `noetron-evolve` |

### Overlay routes

An overlay never replaces a node. It applies **inside** every node in its territory and travels in
the dispatch briefing, so a delegated implementer carries it without discovering it.

| Territory | Overlay |
|---|---|
| everything the project keeps — code, tests, config, commit messages, user-facing text | `noetron-preferences` |
| this repository's own stack and domain | domain skills, `<prefix>-*`, catalogued in `.noetron/domain-skills.md` |
| all test code, and any green nobody has reason to trust | `noetron-testing` |
| auth, untrusted input, queries, secrets, uploads, sensitive data, dependencies — and, where the repository embeds a model, prompts, tools exposed to it, MCP config, retrieval and agent memory | `noetron-security` |
| pages, components, templates, styles — anything with a rendered result | `noetron-design` |
| material uncertainty: competing hypotheses, a decision between alternatives, no obvious next step | `noetron-reasoning` |

## Red flags

- A node label in the graph with no row in the routes tables, or a row naming a skill that does not
  exist under `.claude/skills/`.
- A node whose own file never names the node the graph sends it to — the edge is drawn and nothing
  walks it; or an edge drawn between two nodes with no row in the edge table, which is the same
  omission on the reader's side.
- Skipping the `large` chain's `interview` because the requirements arrived closed — "no material
  decision open" is that node's output, not a reason to delete it from the chain.
- Reaching a write with no G0 in `.noetron/state.md`, or treating a recommendation as the answer.
- Closing G0 in the transcript and leaving `status: idle` on disk — a ratification no later session
  can find, and a `noetron-recovery` with nothing to fire on. In worktree mode, the same failure
  wearing a green root: the front matter written here and never carried into the tree that executes.
- Writing a `phase:` the enum cannot express, or opening a chain at a value that names no node of it
  — `execute` at G0 in a `small` chain is a commit on `main` waiting for a compaction.
- Advancing to a node without moving `phase:`, so a resumed session re-enters where the chain was
  three nodes ago — or leaving the walk to the nodes, which never write that field and never will.
- Asking the four sequential decisions and then filling the slug, the branch, or the base by default
  instead of confirming them in the closing line — the other exit, one item handed back per turn,
  is the same defect billed to `noetron-branch`.
- Taking a containment on the agent's own authority because the incident makes it obvious — or
  holding it behind an open kickoff line while the damage runs.
- Choosing where slice `k+1` starts from the destination the user named at G2 instead of from
  whether the base carries slice `k`; citing a "ratified destination policy", which no skill writes.
- Re-entering the slice loop at `execute`, skipping the `branch` node that the merge of the previous
  slice made necessary.
- Inferring which packages a workspace task touches instead of ratifying the scope at this gate.
- A `bug` kickoff with no size, no symptom, or no repro status — or a defect on a sensitive surface
  sent down the short chain because "it's just a bug".
- Re-classifying the tier downstream, or revising it to reduce ceremony rather than to match
  evidence.
- Re-asking the commit strategy at closeout, or reading `inline` as permission to review one's own
  diff.
- Running `plan` or `spec` before `branch` when isolation is a worktree.
- Restarting the whole graph after one failed node.
- Re-opening G0, the plan's stress, or the domain-skill gate at each slice instead of once per task.
- Resetting `.noetron/state.md` to idle with deliverable slices still undelivered.
- Running a whole spec to a single destination when G1 ratified `per-slice`.

---

**This skill is working if:** every mutating chain states its kind and its size and stops at G0
before the first write, the `bug` chain included and with its symptom named; the same request read
twice by two readers lands on the same tier, because no signal satisfies two bands and no term is
defined in two places; every closed G0 leaves a front matter on disk carrying `status: active` and a
`phase:` that names a node of *this* chain and moves with it; the tree that executes reads the front
matter the user ratified, worktree or not; no defect on a security surface or public contract runs
the short chain; every chain that starts reaches `finish`; every node label in the graph resolves to
a routes row, every skill under `.claude/skills/` appears in exactly one row, and every edge the
diagram draws has a row in the edge table naming the oracle that opens it; a failed oracle re-plans
the remaining subgraph instead of restarting the graph or pushing past the failure; and a per-slice
task interrupted at any point leaves every already-delivered slice integrated and recorded, never
held hostage by the slices after it.
