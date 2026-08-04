---
name: noetron-spec
description: Use when an approved plan needs its executable spec, or when the user asks for a spec, a decomposition into tasks, or an implementation breakdown. Standard and large tiers only — trivial, small, and bug chains execute without one.
---

# Noetron Spec

Turns an approved plan into tasks an implementer can execute without guessing. A spec is a
**contract**, not a draft of the source file.

Only `standard` and `large` tiers get a spec. Below that, `noetron-router`'s chain executes without
one — and forcing a spec there is how a one-line change costs an afternoon.

## Contract, not body

<EXTREMELY-IMPORTANT>
**Specify the contract; leave the body to whoever can compile it.**

Each task carries: exact signatures, input and output types, invariants, named edge cases, the
oracle (command plus expected output), and the completion criterion.

Literal code appears **only where the exact value *is* the contract** — constants, wire formats,
regexes, fixture values, config keys, schema fragments.
</EXTREMELY-IMPORTANT>

The reason is measured, not aesthetic. A spec carrying full bodies becomes a second copy of the
source: every correction then costs two writes, the copies drift, and the spec keeps growing during
execution. Contracts do not drift, because they are not the thing being edited.

**The spec freezes at `ready`.** After that it changes only when reality contradicts it — and that
is a defect returning to this skill, never an edit in passing.

## Task shape

Every task states, in this order:

1. **Goal** — one sentence, in the plan's terms.
2. **Files** — real paths, verified to exist, or explicitly new.
3. **Contract** — signatures, types, invariants, named edge cases. `Consumes` and `Produces` name
   the exact signatures at the seams with neighboring tasks, and the **global constraints that bind
   this task**, copied verbatim from the header.
4. **Test cycle** — the behavior to pin and the failure expected before any implementation exists.
5. **Oracle** — the exact command and the output that proves this task done. An artifact with no
   command — documentation, content, configuration — names the check instead, per `noetron-verify`:
   the mechanical property and how it is asserted (build, link check, lint, required structure, a
   `--check` regeneration), or a declared attestation whose observable pass and fail are written
   **before** the task runs — and written into `.noetron/verification-standard.md`, per
   [Validation section](#validation-section), because that is where the closeout will look for it.
   `Oracle: n/a` does not exist; a task with no oracle is not a task.
6. **Domain skills to apply** — names from `.noetron/domain-skills.md`, or `none`.
7. **Completion criterion** — checkable: could an agent tell done from not-done?

Field 6 is mandatory and travels into the dispatch briefing. `none` is a valid answer; blank is
not — blank means nobody decided.

**Global constraints travel verbatim** in the header: version floors, dependency limits, naming and
text rules, platform requirements — one line each, exact values. The header is the canonical list,
and **every task repeats the ones that bind it, verbatim, inside its `Contract` field.**

That repetition is not a second home for a decision — it is the only copy that reaches the hands the
constraint governs. The dispatch extracts *task N's text* into the brief
([dispatch.md](../noetron-execute/references/dispatch.md)); the header is not part of it. A
constraint that lives only there travels to the **reviewer**, who opens a finding against a rule the
implementer had no way to read, and a fix loop pays for a handoff that never carried what it
promised. A task whose copy differs from the header is a defect that returns here — never a silent
local override.

**Stop condition in the header:** by default, three failed attempts at a step's oracle → stop and
escalate with what was tried. A task may override; none may omit — **and an override is written in
that task's `Contract` field too**, for the same reason: `noetron-execute` runs 3 unless the task in
front of it says otherwise, and the only thing in front of it is the brief.

## How many tasks — the ceiling

The number is not taste, and it is not the spec's length either: it is **the autonomy window** —
how far `noetron-execute` runs without pausing before a human sees a result and can stop it. So the
ceiling counts the tasks inside that window, and the cadence says where the window ends.

**The cadence is read from `.noetron/state.md`, never from the plan.** `noetron-plan` writes
`cadence`, `slices`, and `slice: 1` into the cursor on approval at G1
([state.md](../noetron-setup/references/state.md) § Every field has a writer); the plan's own front
matter has no such field, so a spec that goes looking for it there finds nothing and fills the blank
with the shape it expected. That blank is expensive in one direction: reading `single-delivery` over
a `per-slice` plan gave a `large` task of three slices two tasks per slice, which fits nothing real.
A cursor with a plan pointer and no cadence is a contradiction, not a default — back to
`noetron-plan`.

| Cadence | The window | Ceiling counts tasks in |
|---|---|---|
| `per-slice` | the **delivery unit** — it ends at that unit's `### Slice validation` and at G2 | **each delivery unit**: `standard` at most 4, `large` at most 6. The spec's total is the sum and is not itself capped. |
| `single-delivery` | the whole spec — one Validation at the far end, one G2 | **the spec**: `standard` at most 4, `large` at most 6 |

**A delivery unit is one deliverable slice plus every `deliverable: no` slice that names it** as the
one it lands with (`noetron-plan` § Each slice reaches a destination). Nothing between two G2s falls
outside a unit, and that is the whole point of the word: counting only the `yes` slices leaves a
`no` slice's tasks counted by no rule at all, so a real autonomy window of nine tasks clears a
ceiling of six by an arithmetic that never saw three of them.

A spec of eight under `single-delivery` is one ratification buying a day of unattended work, one
Validation at the far end, and — when the premise breaks at task 3 — a re-plan that has to unwind
everything after it. That spec exists; it is the field failure this ceiling answers. Under
`per-slice` that failure cannot happen the same way: the run stops at each unit's G2 whatever the
spec's total is, which is exactly why the count is taken per unit rather than per spec.

**Over the ceiling, the fix is upstream — never a spec split per slice.** The plan and the spec are
never divided by slice: that would reopen G1 once per slice, which is the ceremony this whole design
removes ([artifacts.md](../noetron-setup/references/artifacts.md)).

- **`per-slice`, a delivery unit over its ceiling** → the *unit* is too big. Back to `noetron-plan`:
  slices are cut there, and a unit of nine tasks is two units.
- **`single-delivery` over its ceiling** → either the cadence is wrong — take it back to `noetron-plan`,
  where G1 ratified it — or the work is genuinely two ratifications: **sequenced specs**, each with
  its own G1, its own Validation, and each ending at a state the user could accept, the first spec's
  proof being the second's premise. Never by arithmetic ("tasks 1–6", "tasks 7–12"), which keeps
  every drawback of the monolith and adds a gate to it.

**The ceiling never justifies a bigger task.** Merging two tasks to fit under it moves the same work
into one dispatch nobody can review in a single pass and erases a seam `Consumes`/`Produces` would
have made explicit. A task that cannot state its seven fields in about 40 lines is two tasks — and
if that pushes the count over, the **spec** splits.

## Slices

When the approved plan declares deliverable slices, tasks are grouped under `## Slice <k> — <title>`
in the plan's order, and **every delivery unit ends with its own `### Slice validation`, written
under that unit's last slice heading** — whatever that slice's `deliverable` value is. The placement
is mechanical, not stylistic: `noetron-execute` runs the slice validation at the last task before a
G2, and `noetron-finish` will not close a delivery without it green. A unit whose last heading is a
`deliverable: no` slice and whose validation sits two headings earlier deadlocks the closeout with
the code already finished — the chain has nothing to run and no way to declare that it ran.

**The `### Slice validation` proves two things, and the second is the one that gets dropped:**

| What it proves | Where it is derived from |
|---|---|
| the unit works | the acceptance criteria the plan mapped to these slices |
| the unit is **safe to integrate** | the **Integration safety** the plan declared for its deliverable slice, ratified at G1 — the flag, the additive-only migration, the route nothing links yet |

The safety becomes a command or an observation with a stated pass and fail, exactly like every other
oracle: *the flag's default reads `off`, and with it off the new route answers 404*; *the migration
adds columns and drops none — `<the diff command>`, empty removal set*; *the new page appears in no
navigation and no sitemap*. Left as prose it is a promise nobody can run, and this is the failure
that closes: a slice ratified as "behind a flag, default off" integrates with the flag on and every
oracle green, because the only checks that ran were the acceptance criteria — and an acceptance
criterion says nothing about a flag.

The spec-level `## Validation` still proves the whole: the slice validation opens a destination for
one delivery, the spec's closes the spec. They are not interchangeable in either direction — running
the spec's on a non-final unit is red by construction, against criteria whose slices do not exist
yet.

**Task numbers run continuously through the spec, never restarting per slice.** Slice 1 holds tasks
1–4, slice 2 opens at task 5. The grouping is a heading; the numbering is the spec's. Two reasons,
both mechanical: the ledger resets at each slice boundary, so a restarted `Task 1` is
indistinguishable from the previous slice's on any screen a resumed session reads; and
`.noetron/work/<slug>/` is deliberately kept across slices, so `task-1-brief.md` written twice is the
first one destroyed.

**A number is an identity, not a position — so an amendment never renumbers.** After `ready`, a task
that a returning defect adds takes the **next unused number**, sits under its slice heading, and
carries one line — `Runs after: task <n>` — holding the dependency order the ordinal no longer
shows. A task removed leaves its number **retired**, with one line saying so, and it is never
reused. The same identities are already on disk and already trusted: `task-5-brief.md`,
`review-5-<lens>.md`, and every `Task 5:` line in a ledger a resumed session reads over its own
memory. Renumbering rewrites all of them silently; appending without the `Runs after` line hands an
implementer a seam whose producer has not run.

## The embedded cycle

Every behavior-bearing task carries: **write the failing test → run it and see it fail for the
expected reason → minimal implementation → run it and see it pass with the suite green**.

The red is **evidence, not a claim**: the task's oracle includes the runner output of the failing
test, and `noetron-verify` holds it. A task arriving with test and implementation written together
did not run this cycle.

Tasks with no observable behavior — configuration, formatting, docs, pure moves — declare
`cycle: none` with the reason. Do not invent a red for them, and do not reclassify a behavioral
change as cosmetic to escape the cycle.

## Building it

1. **SOURCE** — the approved plan is the only source of **content**, and `.noetron/state.md` is the
   only source of the **ratified cursor** that shapes it: `cadence` (which sets the window and the
   ceiling), `slices` and `slice`, and `scope` (which package the versions are anchored to). Both
   were ratified — the plan at G1, the cursor at G0 and G1 — and neither is reopened here. A
   decision covered by neither is a gap: `noetron-interview`, then back. A spec is a translation,
   never a decision.
2. **EXPLORE** — re-verify through `noetron-explore` every repository fact the tasks touch: current
   signatures, real paths, existing patterns. In greenfield there is nothing here to verify — the
   step is a no-op and GROUND carries the weight instead.
3. **GROUND** — open `.noetron/profile.md` and take the package block for the **`scope` ratified at
   G0** (a single-package repository has exactly one block, rooted at `.`). That block's **Stack
   baseline** is the anchor for every lookup this spec makes: confirm each API, signature, and
   pinned version against **context7 or the official docs for that version**, never from memory.
   Deriving the version by hand instead — "a manifest, a lockfile, the plan's stack" — is what a
   monorepo with three lockfiles turns into an anchor on the wrong package, and the Grounding axis
   then passes, because the author confirmed against the version the author chose. A baseline still
   marked `pending` (greenfield, no dependency landed) means the anchor is the stack G1 ratified,
   and `noetron-plan` is what writes it into `profile.md`: this skill reads that file and never
   writes it.
4. **DRAFT** — `.noetron/specs/YYYY-MM-DD-<slug>.md`, **`status: draft`**, tasks in dependency
   order, each with the seven fields. Record its path in `.noetron/state.md` as `spec:` the moment
   the file exists — that pointer is how a session resuming at `phase: spec` finds the artifact
   whose `status:` says where it stopped, and `status:` says it only because this step writes it.
   Written for the first time at G1, the field is a promise the file cannot keep: a crash between
   here and SELF-REVIEW leaves a spec that reads finished, and steps 5 and 6 vanish with the context
   that would have run them — approved at G1 without either. **A spec at `draft` re-enters at
   SELF-REVIEW**; the axes and the stress are cheap to repeat and unsafe to skip. Only `ready`
   executes.
5. **SELF-REVIEW** — the seven axes below.
6. **STRESS** — `noetron-interview` against the whole spec. Decisions discovered in translation go
   to the user; findings that contradict the plan return to `noetron-plan`.
7. **RATIFY** — gate G1. The user opens the edge; `draft` becomes `status: ready`, and this step is
   the only writer of that value.

## Self-review — seven axes

| Axis | Question |
|---|---|
| Coverage | Does every acceptance criterion — in the plan **and** in `.noetron/verification-standard.md` — map to a named task or an explicitly stated exclusion, and to a **named slice**? One no slice claims is a gap, not a leftover. |
| Contract | Does every task carry signatures and types — and no function bodies? |
| Interface | Do tasks meeting at a seam agree on the exact same name and signature? |
| Oracle | Does every task name a command — or, for a non-executable artifact, a check — whose output distinguishes pass from fail? And does every delivery unit's `### Slice validation` prove its ratified **integration safety** as well as its criteria? |
| **Size** | Is the task count within the tier's ceiling **in every delivery unit**, `deliverable: no` slices included, with no task enlarged to get there? |
| Cycle | Does every behavior-bearing task carry its cycle, and every exception its reason? |
| **Grounding** | Is every pinned version, external API, and signature confirmed against the docs for the version in the **scope's stack baseline in `.noetron/profile.md`** — or explicitly marked `(unconfirmed — verify)`? |

A failing axis sends the spec back to DRAFT.

The Grounding axis exists because of a measured failure mode: a version pinned from inference
rather than verification, an API that changed between majors, an oracle that would pass a failed
install. Each of those is discovered only at execution time, costs one human stop, and returns the
whole task to the start. Naming the anchor — the scope's baseline, not "the lockfile" — is what
keeps the axis falsifiable: an axis whose reference is whichever version the author derived can only
ever confirm the author.

## Validation section

The spec ends with **Validation**: the commands that prove the whole spec done. It runs **once, at
the last task of the last delivery unit** — of the whole spec under `single-delivery`. Never on a
non-final unit, where it is red by construction, and **never on a task claim**: a task claim runs
that task's own oracle, and the last task of a unit adds that unit's `### Slice validation`. This is
the spec-level oracle. Name a coverage threshold when the project has one.

**"In full" means every command re-runs on the tree that finally carries every slice. It does not
mean asking a human twice.** A criterion whose oracle is a **declared attestation**
(`noetron-verify`) is presented **once**: under `per-slice` that once is the G2 of the unit whose
`### Slice validation` carries it, and at the last unit the spec's Validation **cites** it — the
criterion, the G2 that ratified it, the `## Delivered` line that records the delivery — instead of
putting it in front of the user a second time. Re-asking is not a stricter gate but an unanswerable
one: a re-presented attestation that failed could only be repaired by re-executing a task from a
slice already listed under `## Delivered`, which `noetron-execute` forbids outright. An attestation
no earlier unit carried is presented here for the first time, verbatim, with its observable pass and
fail. Batching the human's look at the natural review point is what keeps a project without machine
oracles proportional instead of pausing at every step.

**Its source is `.noetron/verification-standard.md`** — what *correct* already means in this
project, which is not renegotiated per spec. Read it at DRAFT, not at the end:

- each **acceptance criterion** it lists becomes a line in Validation — a command, or the citation
  of the G2 that already ratified it — or is named here with the reason this spec does not touch it.
  Silently omitting one ships a spec that declares done against a standard nobody ran;
- its **procedure** decides the shape of the task oracles — which command, and how the artifact is
  exercised. "Reading the code is not exercising the artifact" is the standard's rule, and it is why
  a task oracle for a rendered surface names a browser step and not a unit test;
- its **baseline** supplies the numbers a task must hold: an oracle that would pass a measurable
  regression is a false oracle, and `noetron-verify` will reject it.

The standard is input, never output **from a correction**: a spec never edits it to make its own
Validation easier, and a criterion that is genuinely wrong goes to `noetron-evolve` as its own
ratified change.

**One addition runs the other way, and it runs before the work rather than during it.** When a task
or a unit can be proven only by a **declared attestation**, that attestation is added to
`.noetron/verification-standard.md` through `noetron-evolve`, ratified, **before G1 closes** — and
the spec then cites it rather than owning it. `noetron-verify`'s third rung is explicit that an
attestation is legitimate only when it is fixed before the action *and written where the next claim
will be judged*; the closeout judges against the standard, not against a spec. So an attestation
that lives only here is born illegitimate: `noetron-finish` walks the standard's criteria, never
finds it, and the single oracle the project had for that behavior is the one nobody runs. Writing it
at spec time is also the only moment writing to that file is not a correction softening its own
standard — which is exactly why it belongs before G1 and nowhere later.

## Red flags

- A task containing a complete function body.
- A version number or API signature confirmed against a version somebody derived by hand instead of
  the scope's stack baseline in `.noetron/profile.md`.
- `Domain skills to apply` left blank.
- An oracle that says "it works" or "tests pass" without naming the command — or, in a non-code
  repository, an attestation used where a build, link check, or lint would have rejected.
- A declared attestation that exists only in the spec, never added to
  `.noetron/verification-standard.md` before G1.
- Creating the spec file without `status: draft`, or writing `ready` anywhere but at G1.
- Taking the cadence from the plan, from the tier, or from what the spec looks like, instead of from
  `.noetron/state.md`.
- More tasks than the tier's ceiling in the active window — the delivery unit under `per-slice`, the
  spec under `single-delivery` — or a task grown to keep the count under it; a `deliverable: no`
  slice left out of its unit's count.
- A `### Slice validation` that proves the acceptance criteria and leaves the ratified integration
  safety as prose — or one written anywhere but under its unit's last slice heading.
- Splitting the spec per slice, restarting task numbers at each slice heading, or renumbering tasks
  after `ready` to make an amendment fit.
- A global constraint, or an overridden stop condition, living only in the header — where the
  dispatch will not find it.
- A Validation section that proves less than `.noetron/verification-standard.md` asks, with no
  exclusion stated — or a spec that edits that file to make a failing output pass.
- Re-presenting at the last unit an attestation an earlier G2 already ratified.
- Editing the spec to match what the implementer did, instead of returning the defect here.
- A behavior-bearing task declaring `cycle: none`.
- Writing a spec from a draft plan, or from memory instead of the source document.

## Integration

- `noetron-plan` — the input; it also writes the cadence and the slice cursor this skill reads from
  `.noetron/state.md`, and the **Integration safety** each `### Slice validation` turns into a
  check. Contradictions with the design return there.
- `noetron-explore` — repository facts and version discovery.
- `noetron-setup` — owns `.noetron/profile.md`, whose per-package **Stack baseline** is the anchor
  GROUND reads; the package is chosen by the `scope` ratified at G0.
- `noetron-execute` — consumes the tasks; contradictions with reality return here.
- `noetron-testing` — the doctrine the cycle's tests are written to.
- `noetron-verify` — holds the red evidence, runs Validation against the same standard, and carries
  the ladder a task uses when the project offers no machine oracle to name.
- `noetron-evolve` — owns `.noetron/verification-standard.md`, the source of Validation and of the
  oracles' shape; a criterion that must change goes there, and so does an attestation this spec
  declares, before G1.
- `noetron-finish` — its G2 rests on the `### Slice validation` written here, integration safety
  included; the spec's `## Validation` reaches it only at the last delivery unit.
- `noetron-interview` — the stress pass and every gap found while specifying.
- `noetron-create-skill` — a task whose stack has no domain skill coverage raises it here.

---

**This skill is working if:** specs stop containing function bodies; code in the repository appears
in no document but itself; specs stop growing after `ready`; a spec interrupted before its
self-review is found at `draft` and never ratified as if it had one; every acceptance criterion in
`.noetron/verification-standard.md` is either in a spec's Validation or excluded in writing, and
every attestation a spec declares is findable in that file rather than only in the spec; every
delivery unit's ratified integration safety is a check somebody can run and see fail; no autonomy
window carries more tasks than its tier's ceiling — `deliverable: no` slices counted — and none
reached the ceiling by merging tasks; no spec is ever split per slice, no slice restarts the task
numbering, and no task number is ever reassigned; an implementer never violates a global constraint
it had no way to read; every task in a non-code repository still names a check that can reject; and
execution stops discovering that a pinned version does not exist.
