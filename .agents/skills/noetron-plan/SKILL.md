---
name: noetron-plan
description: Use when a standard or large task needs its plan before code — a greenfield product, or a feature, refactor, or structural change with open requirements, architecture, UX, data, or risk decisions; or when the user asks for a plan or a design.
---

# Noetron Plan

Turns a ratified objective into an approved plan — the durable record of the planning conversation,
and the one place a decision lives in full.

`noetron-router` already classified the tier and ratified it at G0. This skill runs for `standard` and
`large`, takes that classification as given, and never re-derives it: two classifiers in one harness
produce two answers and one argument.

<HARD-GATE>
No implementation while planning. No code, no scaffold, no "just to see if it works" file — until
the plan is approved at G1. A task too simple to plan was already routed elsewhere by the tier
classifier; arriving here means the ceremony was earned.
</HARD-GATE>

## The loop

### 1. DISCOVER
Objective or acceptance admits materially different readings → `noetron-interview` (discovery mode)
before any design. One question per turn.

### 2. EXPLORE
Map the territory through `noetron-explore`: the patterns to follow, the **Active rules in
`.noetron/learnings.md`**, the project's existing decision records, the surfaces the work will touch.
**Those records live where `.noetron/profile.md` says they live** — its `## Decision records` line.
`docs/adr/` is the default, not the address: setup detects `doc/adr/`, `docs/decisions/`, `adr/`, or an
`.adr-dir` left by adr-tools and records the real one
([adr.md](../noetron-setup/references/adr.md)). Reading the default instead of the recorded path finds
no prior decisions in a project that has thirty — and then proposes a new record where it would open a
second convention in one repository, which that file rates worse than a less-preferred one. Profile
still says `none yet` → run that detection here, and the path it finds rides the profile write this
skill already makes at G1 (step 10).

Prior art is reached through `.noetron/history/INDEX.md` — scan the index, open the two or three entries whose
slug or signal touches this territory, and follow their plan pointers. Never read `history/` or
`plans/` as directories: that cost grows with the project's age and is paid on every task, which is
the definition of the debt this harness refuses elsewhere. A plan built on unread code is
imagination with headings.

### 3. GROUND
Every decision resting on external technology gets its evidence before its options exist — below.

### 4. APPROACHES
**2–3 genuinely different approaches** with trade-offs, leading with
`Recommended: <approach> — <reason>`. One approach only when the territory truly admits one, said
explicitly. YAGNI each of them: complexity needs a present signal that authorizes it. Independent
subsystems split into separate plans before refining — each plan must yield working software alone.

**"Different" is a falsifiable claim, not a feeling.** Two approaches are different when they differ
on at least one of four axes: **where the behavior lives** (which module, layer, or service owns it),
**the data** (its shape, its owner, its source of truth), **the mechanism** (the algorithm or
protocol; build-time or run-time; synchronous or queued), **the dependency posture** (a new
dependency, an existing primitive, or hand-rolled). The test the user can run on your list: *each
approach names what it gives up that the others keep.* Three variants that touch the same modules,
keep the same data shape, take the same dependency, and give up the same thing are **one approach in
three file layouts** — the facade the red flag below rejects, wearing three plausible names instead of
one good one and two absurd ones, and therefore harder to decline.

**Check every approach against `.noetron/learnings.md` before offering it.** The Active rules are
what this project already paid to learn; a rule whose scope covers these paths is a **constraint on
the design**, written into it, not a footnote. An approach that repeats a root cause in the incident
log is either dropped, or offered with the rule it breaks named and the evidence that it no longer
applies — never offered silently, because the user cannot decline a repeat they were not shown. This
edge is the reason the file exists: memory written at closeout that nothing reads before the next
design is a log, not a learning.

### 5. DESIGN
Present the chosen approach scaled to complexity: a short design whole, one approval; a complex one
by section — architecture, components, data flow, error handling, testing strategy — with a "does
this hold so far?" checkpoint per section. Cover what the work needs rather than a fixed template:
contracts, data, error and empty states, and the acceptance criteria the spec turns into oracles.
A genuinely visual question — layout, hierarchy, look — is answered better by a throwaway HTML
mockup rendered in the browser than by prose; offer that per question, since a question about a UI
topic is not automatically a visual one.

UI-bearing designs hand aesthetic direction to `noetron-design` — and its ratified contract lives
**here, in this plan**: a `### Direction contract` block inside `## Decisions`, opened at
`.noetron/plans/YYYY-MM-DD-<slug>.md#direction-contract`. That anchor is what `.noetron/state.md`
points at and what every dispatch and every reviewer is handed. So a plan that will hold one **creates
its file at this step**, before the contract is ratified — WRITE is step 7 and this is step 5, and a
contract approved with nowhere to live leaves the implementer an anchor that opens nothing, which
returns them to their own taste: the exact convergence `noetron-design` exists to stop.

### 6. SLICE
Cut the approach into thin vertical slices, and say which of them **reach a destination on their
own** — below. This step produces the `## Slices` table the spec, the ledger, and every closeout read.

### 7. WRITE
`.noetron/plans/YYYY-MM-DD-<slug>.md`, in the format
[artifacts.md](../noetron-setup/references/artifacts.md) holds — and **the front matter complete on
the first write**: `status: draft`, `date`, `slug`, `spec: pending`, `slices`, `deliverable-slices`.
Two of those are the slice table restated as numbers, and they are what the ledger and every closeout
read; a front matter carrying only `status:` is the header of a plan nobody can resume.

The directory is created here when it does not exist, **seeded with the `plans/README.md` from that
same file**: setup deliberately does not scaffold `plans/`, so the first plan to write is what creates
it, and a directory nobody seeded teaches its next reader nothing about lifecycle or budget.

`## Decisions` carries each ratified choice with its rejected alternatives and why — including the
`### Direction contract` block when DESIGN produced one. Anything still marked `(open)` blocks
approval. Record the path in `.noetron/state.md` as `plan:` the moment the file exists — G0 left that
field at `none`, and a session resuming at `phase: plan` reaches the draft through this pointer and
its own `status:`. **The file may already exist when this step runs**: DESIGN opens it early when a
direction contract has to land in `## Decisions`, and this step completes it instead of creating it.

### 8. STRESS
Mandatory, never dropped for time: `noetron-interview` (focused stress) against the draft,
proportional to the real surface. Every gap is resolved with the user or explicitly accepted, and
the plan updated. A plan nobody stressed is a draft wearing an approved label.

**The stress leaves a trace in the plan, or it did not happen.** Every gap it raised lands as a line
in `## Decisions` (resolved) or in `## Risks` (accepted, with how we would notice); a pass that found
nothing writes the single line `stress <date> — no gap found`. Nothing else records this step:
downstream sees only `status: approved`, and `noetron-router` reads that field as proof the stress
ran — so a plan compacted straight from WRITE to RATIFY arrives at execution indistinguishable from a
stressed one. This line is the difference, and it costs a sentence.

### 9. COVER — domain skills before the code
Before ratifying, check `.noetron/domain-skills.md` against the stack this plan just settled. If a
ratified stack has no covering skill — the catalog is absent, empty, or silent about it — propose
the skills that would close the gap, grounded in `context7` for the version the plan pins, and let
the user choose. `noetron-create-skill` writes the ratified ones.

The measured failure: a greenfield sweep has nothing to find, so the catalog stayed empty while ~17k
lines were written with no domain rule at all, and the skills were offered at closeout — after the
code they should have shaped. The stack becomes known here; here is where the gap closes.

**Greenfield skills are written in `noetron-create-skill`'s greenfield mode** — evidence from the
pinned version's documentation, marked `doc-grounded`, re-grounded at the first real diff. That mode
needs the versions ratified at GROUND and the **first vertical slice** from SLICE, which is where its
trigger probe comes from. Hence the order: COVER runs after both, never before.

One question, with a recommendation: *the ratified stack is `<X, Y, Z>`; I propose `<N>` domain
skills — `[name — the decision or error it corrects]`; create all, adjust the set, or proceed with
none?* Proceeding with none is a valid answer.

**Whatever the answer, this skill writes the outcome — in two registers, neither carrying the
other's content.** The *decision* — which skills, and why the rest were declined — is one
`## Decisions` entry in this plan, its canonical home. The *catalog fact* goes to
`.noetron/domain-skills.md` with no reasoning at all: each approved skill as a `## Pending` entry
(or straight to `noetron-create-skill` when it is written now), and the armed `## Greenfield gate`
section **replaced by one line** — `Fired <date> — outcome: <all | the adjusted set | none>; re-arms
only if the ratified stack changes`. That replacement is the disarm. Left armed, the gate fires again
at the next task's plan and re-asks a question the user already answered; and the same skills come
back a third time through `noetron-finish`'s closeout net — after the code they were supposed to
shape, which is the measured failure above arriving one node later.

### 10. RATIFY — gate G1
Present the synthesis: decisions, gaps and their fates, risks, the slice table with its deliverable
column **and each deliverable slice's integration safety**, the **recommended delivery cadence**, and
the domain-skill outcome. The user approves → `status: approved`. This is an attestation oracle —
evidence presented, human decides. Only approved plans derive specs, and the slug names everything
downstream: spec, branches, history entries.

**The cadence is ratified here, at G1, not at G0** — G0 fires before this plan exists, so the slices
it decides between are not yet known. One line inside the same approval: `per-slice` when two or more
slices are deliverable and each names a real integration safety; `single-delivery` when landing a
slice would leave the base unshippable — a migration destructive halfway, a public contract changed
in two steps. **A plan with exactly one slice is `single-delivery` by arithmetic**: one slice is one
destination, and the two cadences differ only in how many destinations a task has, so the line states
it with its reason and G1's approval ratifies it along with the rest of the plan, instead of opening a
question with one answer. Anywhere else it is a real choice: recommend, give the reason, and wait —
the answer is the user's. Ask it once; no slice re-opens it.

**Cadence says when to deliver, never where.** No gate in this harness ratifies a destination policy:
`noetron-finish` asks the destination at **every** G2, and from slice 2 on the one-line confirm
repeats the **previous slice's** destination as recorded in `## Delivered`, with the full menu
reachable by naming another option. A plan that presents the cadence as "where the slices land" is
writing a field nobody stores, and every later slice has to guess what it said.

**On approval this skill writes the delivery cursor into `.noetron/state.md`** — `cadence:`, plus
`slices: <N>` and `slice: 1 — <title>` taken from the approved slice table. `slices: <N>` is the
**number of rows in that table** — the same count the plan's own front matter carries — and the
ordinals that reach a destination are the plan's separate `deliverable-slices:`. Two numbers, named
apart on purpose: `noetron-finish` advances the cursor while deliverable slices remain and resets it
to idle at the last one, and it can only do both from one field because the last slice is always
deliverable (below). They belong here and nowhere else: G0 fired before this plan existed, so the
router could not have written them, and by the time `noetron-execute` needs the cursor it must
already be reading it. A chain that produced no plan writes none of the three.

**And on the same approval it writes the stack baseline into `.noetron/profile.md`** — for each
package in the ratified scope, the `Stack baseline` rows: technology, exact version, and where it is
pinned (`pending` until the first lockfile lands, in greenfield); plus the decision-record path when
EXPLORE detected one and the profile still said `none yet`. That file states the baseline "is written
when the plan ratifies that package's stack" and names no writer — **this is the writer**. Unwritten,
the ratified version survives only in this conversation: this plan's spec, its domain skills, and the
next task's plan all re-derive it, and in a monorepo they re-derive it from whichever lockfile they
happen to open.

## Grounding — evidence before options

A decision that depends on an external library, framework, API, or service is grounded before its
options are written:

1. **Read `.noetron/profile.md` first, and take the baseline of the package the decision belongs to**
   — the `## Package: <path>` block selected by the **`scope` ratified at G0**, whose `Stack baseline`
   is declared there as *the anchor for every context7 lookup about this package*. There is one
   baseline per package, so in a workspace "the version in use" names nothing until the scope says
   which package is being decided; a plan that skips this step anchors a decision about `packages/web`
   to the version it found in `packages/api`'s lockfile, and the Grounding it reports is real evidence
   about the wrong artifact.
2. **Profile silent, `pending`, or contradicted by the tree → derive the version and correct the
   file.** Manifest, lockfile, engine constraint, image tag, for the package in scope. Greenfield has
   none of those: derive the candidate stack from the conversation and record it as a premise the user
   ratifies at G1 — which is where this skill writes it back as that package's baseline.
3. **Consult `context7` or the official documentation for that version** — real capabilities,
   limits, breaking changes, the API's actual shape. Memory is a snapshot of some other version.
4. **Cite it in the option** — what was checked, against which version, for which package.

The evidence grounds the options and the recommendation; it **never ratifies**. Documentation settles
what is possible and what it costs; the user settles what we do. An ungrounded option bills at
execution time — a pinned version that never existed, an API that moved a major ago — and by then the
plan, the spec, and the branches all move with it.

## Vertical slices

The Approach is a sequence of **thin vertical slices**. Each crosses every layer the feature touches
and ends in behavior somebody can observe: a request that returns, a screen that renders, a command
that prints, a job that runs. The first slice is the **walking skeleton** — the narrowest end-to-end
path through the real architecture, everything else stubbed.

**Test for a slice:** name what someone can do after it that they could not do before. No answer
means it is a layer, not a slice; fold it into the slice that consumes it.

**Order by risk:** the slice proving the shakiest premise goes first, because that is the one whose
failure changes the plan.

Horizontal phases are the measured failure this replaces: one field plan shipped 8 of them, phase 1
delivered nothing anyone could look at, and the first honest feedback arrived after phase 5 — most
of the budget spent, five phases of premises unchallenged.

## Each slice reaches a destination

Slicing the plan and then funnelling every slice into one integration at the end changes nothing:
the first usable thing is still last in the queue. That is the second field failure exactly — 7h47,
stopped at task 5 of 8, nothing integrated, the user left with a branch instead of a product. Slices
1 and 2 were finished and unusable for one reason: the harness had one destination, at the end.

So **the deliverable slice, not the spec, is the unit that reaches a destination.** The chain's tail
runs once per deliverable slice; its head runs once per task. That split is what keeps this from
becoming the same ceremony N times:

| Once per task — never reopened per slice | Once per deliverable slice |
|---|---|
| **G0**: tier, scope, isolation, mode, commits | the branch: slice 1 uses the task branch `<type>/<slug>`; a slice whose predecessor **landed in the base** cuts `<type>/<slug>-s<N>` from it, one whose predecessor **did not land** continues on the same branch |
| the plan, its stress, and **G1** — which also ratifies the **cadence** | `execute` — that slice's tasks only |
| the spec, its self-review, and **G1** | `review`, scoped to the slice's diff |
| the COVER gate for domain skills | **G2** — destination, then `finish`: history entry, index line, `## Delivered` line |
| the full baseline, at slice 1 | the scoped baseline of what the new slice touches, on the previous slice's proven-green result |

Slice 1 keeps the task branch because that is where the plan and the spec were written; landing it
carries both into the base, so every later slice branches from a base that already has them. After
that there are **two categories, and the G2 menu's three options collapse into them**: the previous
slice **landed in the base** (merged locally) → the next one cuts its branch from that base; it **did
not land** (a PR still open, or *keep the branch*) → the next one continues on the same branch,
because there is nothing in the base to cut from. Enumerating destinations one by one is what left
the PR outside both clauses; the question is *does the base already carry this slice?*, and
`git merge-base --is-ancestor` answers it without anyone remembering which option was picked.

A slice re-asks nothing G0 settled and re-opens no plan the user approved — it inherits all of it.
What it earns on its own is a **destination, and that is asked every time**: after slice 1 the G2
shrinks to a one-line confirm repeating the previous slice's destination from `## Delivered`, with
the full menu reachable by naming another option. G1 bought the rhythm, never the address.

**Per deliverable slice the plan states two things**, neither inferable at execution time: **what
someone can do after it** (the same slice test, now also the evidence G2 presents), and **how it is
safe to integrate** — a feature flag, an additive-only migration, a route nothing links yet, a
command absent from the help text. Deliverable with no safety answer is a claim that the base can
ship a half-built feature, which is the user's call, not the plan's.

**Both are written to be checked, not to be believed.** The safety is a sentence with a pass and a
fail inside it — *"`features.billing` defaults to `false` in `config/default.yml`"*, *"the migration
is additive: no `DROP`, no type change on an existing column"*, *"nothing routes, links, or lists
`/beta`"* — because two nodes downstream turn it into an observation: `noetron-spec` derives that
slice's `### Slice validation` from the acceptance criteria **and** from this line, and
`noetron-finish` presents it at G2 beside the evidence. A category word — "behind a flag" — survives
that trip as a claim nobody can run, and the slice integrates with the flag on, every oracle green.
Until this column reached a reader it was ratified prose; making it runnable is what made it a
safeguard.

A slice that cannot stand alone is marked `deliverable: no` and **names the slice it lands with**;
an orphan `no` is a layer nobody folded into its consumer. Two placement rules make that mark
executable instead of decorative:

- **it lands with the slice that follows it**, and sits immediately before it. A `no` slice naming an
  earlier one names a delivery that already happened, and its code then reaches no destination at all;
- **its tasks count inside the ceiling of the delivery that carries them** (`noetron-spec` § How many
  tasks). The ceiling measures the autonomy window, and that window runs from one G2 to the next
  whatever headings sit in between — a `no` slice counted by nobody is how a window of 6 becomes 9.

And **slice 1 is deliverable, and so is the last slice, or the plan is not sliced.** The first because
a walking skeleton nobody can integrate is a phase wearing better vocabulary, and the failure above
repeats behind the new word. The last because the cursor resets to idle when the last slice is
delivered: end the table with `deliverable: no` and the final code has no destination, no
`### Slice validation` to prove it, and no state the closeout can reach — the chain stalls with
everything written and nothing closed.

## One decision, one home

The same decision written out in two files is a defect: the copies drift, and the drift is found by
whoever acted on the stale one.

| Where | What it holds |
|---|---|
| the plan's `## Decisions` | **canonical** — the choice, the rejected alternatives, why, the evidence |
| `.noetron/state.md` | one pointer line — `<decision> → plans/<file>#decisions`, no reasoning |
| the project's decision-record directory — **the path recorded in `.noetron/profile.md`**, `docs/adr/` only when that is what it says | only a decision that **outlives this task**: a constraint future work must respect |

An ADR is an exception, not a companion: offered to the user when that criterion is met, never
produced by default, and once it exists the plan's entry shrinks to a pointer at it. The harness
writes no product documentation of its own — decision records are the project's convention and the
project owns them, **path and format both**: a record proposed into `docs/adr/` in a repository whose
records sit in `docs/decisions/` opens a second convention in one tree, which
[adr.md](../noetron-setup/references/adr.md) rates worse than a less-preferred one, and a record
written in lean MADR beside thirty in another format is the same defect one directory down. Take the
path from the profile and the format from what is already in that directory. Writing one ratified
decision at full length in plan, ledger, and ADR is how the harness ended up with three texts and no
source of truth.

## Plan altitude

The plan records **what and why**; the spec records **how, step by step, with oracles**. No
file-by-file task lists here. "We'll see during implementation" names a gap, and gaps go to
`noetron-interview`. Acceptance criteria are the bridge: the plan states them, the spec turns each
one into a verifiable check.

## Red flags

- Any code or scaffold before G1 opens; re-classifying the tier here to change the ceremony.
- Designing without exploring, or exploring from memory instead of `noetron-explore`.
- An option about an external library with no version behind it — or one anchored to a package the
  ratified `scope` does not name, in a repository with more than one lockfile.
- Reaching G1 without opening `.noetron/profile.md`, or leaving it after G1 with the ratified stack
  unwritten.
- One facade approach plus two absurd ones — or three that touch the same modules, keep the same data
  shape, take the same dependency, and give up the same thing.
- A plan file whose front matter is missing `slices` or `deliverable-slices`, or a `plans/` directory
  created without its README.
- A direction contract ratified before the plan file exists: the anchor the ledger records opens
  nothing.
- Approving a plan whose `## Decisions` and `## Risks` carry no trace of the stress, and no line
  saying it found none.
- Closing COVER without writing the outcome — the gate stays armed and re-fires at the next task.
- An integration safety written as a category ("behind a flag") instead of a sentence with a pass and
  a fail in it.
- A slice table ending in `deliverable: no`, or a `no` slice naming a slice that already landed.
- Presenting the cadence as if it also settled where the slices land.
- Proposing a decision record at `docs/adr/` in a repository that keeps its records elsewhere.
- Proposing an approach an Active rule in `.noetron/learnings.md` already ruled out, or presenting a
  known-repeat without naming the rule it breaks.
- A first slice that delivers infrastructure and nothing observable, or one marked deliverable with
  no integration safety named.
- A slice table where every slice is `deliverable: no` — that is a phase list with a new column.
- Recommending `single-delivery` because several destinations feel like more work, rather than
  because a partial integration would leave the base unshippable.
- Splitting the plan or the spec per slice, or re-running the stress at each slice — G1 opens once.
- Skipping the stress "because the design is obviously right", or approving with `(open)` questions.
- Copying a ratified decision into a second file instead of pointing at it.
- Resolving a mid-planning decision by default instead of `noetron-interview`.

## Integration

- `noetron-router` — tier and G0; this skill never re-classifies.
- `noetron-interview` — discovery, the mandatory stress, every mid-planning decision.
- `noetron-explore` — territory, prior art, version discovery, and any claim about current behavior.
- `noetron-spec` — derives the executable spec; each deliverable slice's `### Slice validation` comes
  from the acceptance criteria **and** the integration safety written here. Contradictions with the
  design return here.
- `noetron-design` — UI-bearing plans build their direction contract with it during DESIGN, and this
  plan is where it lives: `## Decisions` → `### Direction contract`, anchor `#direction-contract`.
- `noetron-reasoning` — the techniques APPROACHES and risk analysis consume.
- `noetron-setup` — owns the templates this skill writes into: `profile.md` (the baseline read at
  GROUND and written at G1), `domain-skills.md` (the gate COVER fires and disarms), `artifacts.md`
  (the plan format and its README), `adr.md` (the decision-record path and format).
- `noetron-branch` — cuts one branch per deliverable slice from the slice table approved here; the
  slug it uses was ratified at G0 and written by `noetron-router`, never decided in this skill.
- `noetron-execute` — runs one slice at a time; the slice table is what it advances through.
- `noetron-finish` — fires per deliverable slice, not once per spec; the integration safety and the
  observable behavior declared here are what its G2 presents. The **destination** it asks for is
  never ratified here.
- `noetron-create-skill` — writes the skills COVER ratifies; greenfield mode reads this plan's pinned
  versions and its first slice.
- `noetron-evolve` — owns `.noetron/learnings.md`; a rule this plan needs to break, or one it proves
  obsolete, returns there rather than being ignored here.

---

**This skill is working if:** structural and greenfield work never reaches code without a stressed,
approved plan, and the stress is findable in the plan afterwards; the first slice of every plan
produces something a human can look at **and reaches a destination before the second slice starts**,
and the last slice reaches one too; every deliverable slice names how it is safe to integrate in a
form the spec can run and the G2 can show; a task abandoned halfway leaves the user everything its
delivered slices produced, listed in `state.md`'s `## Delivered`; every option touching an external
library names the version it was checked against **and the package that version belongs to**, and
that version is in `.noetron/profile.md` before the spec looks for it; the greenfield skills gate
fires exactly once per repository; no approved plan repeats a root cause already in
`.noetron/learnings.md` without saying so; and no ratified decision ever has to be updated in two
places.
