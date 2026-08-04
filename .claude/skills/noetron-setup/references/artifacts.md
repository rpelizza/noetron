# Templates: `.noetron/plans/` and `.noetron/specs/`

The two task artifacts, created on demand — `plans/` by `noetron-plan`, `specs/` by `noetron-spec`, each
seeded with the README below the first time it writes there. Setup does not scaffold them: an empty
artifact directory teaches nothing and invites a plan for work that needs none. Both belong to `standard`
and `large` tiers; `trivial`, `small`, and `bug` chains execute without either, and forcing one there is
how a one-line change costs an afternoon.

## `plans/README.md`

```markdown
# Plans

One file per plan: `YYYY-MM-DD-<slug>.md`. A plan records the outcome of a planning conversation
— objective, scope, decisions, approach, slices, risks — and is NOT executable; the executable
form is the spec of the same slug. Lifecycle: draft → approved → executed | abandoned; only an
approved plan derives a spec. Budget: 200 lines — a longer plan is two plans.
```

Plan format:

```markdown
---
status: draft | approved | executed | abandoned
date: YYYY-MM-DD
slug: <slug>
spec: <relative path once derived, or pending>
slices: <N>                # rows in the table below
deliverable-slices: <the ordinals that reach a destination of their own>
---

# <Plan title>

## Objective — what we want and why
## In scope / Out of scope

## Decisions
Every decision ratified with the user, with the alternatives rejected and why. Open items
stay marked `(open)` and block approval. A UI-bearing plan holds `### Direction contract`
here — the `#direction-contract` anchor `noetron-design` records in `.noetron/state.md`
and every dispatch and reviewer opens.

## Approach — the intended path at plan altitude; file-by-file detail belongs to the spec

## Slices
| # | Slice | What someone can do after it | Deliverable | Integration safety | Criteria |
|---|---|---|---|---|---|
| 1 | <walking skeleton> | <the observable behavior> | yes | <flag / additive-only / route not linked> | AC1 |
| 2 | <the shared layer s3 consumes> | — | no → lands with s3 | — | AC2 |
| 3 | <…> | <…> | yes | <…> | AC3, AC4 |

## Acceptance criteria — what must be observably true; the spec turns each into an oracle
## Risks — what could go wrong, and how we would notice
```

**Deliverable** is the field the whole delivery topology turns on: `yes` means this slice can reach
a destination on its own, before the next slice starts. **Integration safety** is how — the flag it
hides behind, the additive-only migration, the route nobody links yet. A slice claiming `yes` with
no safety answer is claiming the base can ship half a feature, which is a decision the user makes,
not the plan. A slice marked `no` names the slice it lands with and **sits immediately before it**:
naming an earlier slice names a delivery that already happened, and that code then reaches no
destination at all. An orphan `no` is a layer that was never folded into its consumer.

**Slice 1 is deliverable, and so is the last slice, or the plan is not sliced.** A walking skeleton
that cannot be integrated is a phase with a better name. And a table ending in `no` leaves its final
code with no destination and no `### Slice validation` to prove it, so the cursor never reaches idle
— the closeout stalls with everything written and nothing closed.

## `specs/README.md`

```markdown
# Specs

One file per piece of work: `YYYY-MM-DD-<slug>.md`, reusing the plan's slug. Front matter:
`status: draft | ready | in-progress | done | abandoned`, `date`, `slug`, `plan: <path or none>`,
`slices: <N>`. A spec is a contract — signatures, types, invariants, edge cases, an oracle per
task — never function bodies; literal code appears only where the exact value IS the contract.
`noetron-spec` writes `draft` the moment the file exists and `ready` only at G1: a spec found at
`draft` never ran its self-review, whatever it looks like. It freezes at `ready`.
```

**Tasks are grouped under their slice**, in the plan's order — `## Slice 1 — <title>`, then its
tasks — and each **delivery unit** ends with its own **`### Slice validation`**, written under that
unit's last slice heading: the commands and observations that prove *this delivery* integrable,
drawn from the acceptance criteria the plan mapped to it **and from the `Integration safety` the
plan declared for it**, each one a check with a stated pass and fail. A delivery unit is one
deliverable slice plus every `deliverable: no` slice that names it as the one it lands with — so a
unit whose last heading is a `no` slice still carries its validation there, which is where
`noetron-execute` runs it and `noetron-finish` requires it green. The spec-level `## Validation` at
the end still proves the whole. Both exist because they answer different questions: one opens a
destination for one delivery, the other closes the spec.

The task shape, the seven mandatory fields, the embedded cycle, and the seven self-review axes are
`noetron-spec`'s doctrine; this file only says where the artifact lives, what it is called, and how
the slices divide it.

## The slug across slices

One task, one slug — it joins plan, spec, branches, history entries, and index lines, and it is
never suffixed in the artifacts. Only two things carry the slice ordinal:

| Thing | Multi-slice form | Why |
|---|---|---|
| the branch | slice 1 keeps the task branch `<type>/<slug>`; slices 2..N are `<type>/<slug>-s<N>`, each cut from the ratified base **after** the previous slice landed | a landed slice must be revertible without touching the next one — and slice 1 is where the plan and the spec were written, so landing it carries both into the base |
| the history entry | `YYYY-MM-DD-<slug>-s<N>.md` | one delivery, one entry — [memory.md](./memory.md) |

A single-delivery task keeps the plain `<type>/<slug>` and `YYYY-MM-DD-<slug>.md`. The plan and the
spec are never split per slice: splitting them would reopen G1 once per slice, which is the ceremony
this design exists to avoid. What *is* per slice is the task ceiling — under `per-slice` the autonomy
window ends at each slice's G2, so `noetron-spec`'s ceiling counts tasks inside a slice, not inside
the spec. **The cadence itself is ratified at G1**, with the plan — G0 fires before
the plan exists, so the slices it would decide between are not yet known.

**Task numbers are the spec's, not the slice's**, and they never restart: slice 1 holds tasks 1–4,
slice 2 opens at task 5. The heading groups them; the numbering identifies them across a ledger that
resets per slice and a `work/<slug>/` kept across slices.

## Rules

- The slug is the join key: plan, spec, branches, and history entries share it. A spec whose slug does not
  match its plan has lost its traceability.
- A plan reaches `approved` only by the user's explicit word; `noetron-execute` reads `ready` specs only.
- Status flips ride in the closeout metadata commit, never mixed with code. A `per-slice` task flips the
  spec to `done` and the plan to `executed` at the **last** slice's closeout; earlier closeouts record the
  delivery in `state.md`'s `## Delivered` and leave the status alone.
- Abandoned artifacts stay, with a one-line reason in the front matter — deleting them erases the record
  that the decision was ever considered.

## Growth — compaction, never deletion

`plans/` and `specs/` are **on-demand** reads: nothing lists them, everything reaches them by slug
through `history/INDEX.md`. So directory size costs nothing — until someone globs it, and someone
eventually does.

Past **30 files** in either directory, artifacts whose status is `executed`, `done`, or `abandoned`
and which fall outside the newest 30 are **compacted in place**, oldest first:

- a plan keeps its front matter, `## Decisions`, and `## Slices`, and gains one line —
  `compacted <date>; approaches, risks, and design detail dropped; delivery in history/<file>`;
- a spec keeps its front matter, its task titles, and `## Validation`.

Nothing is deleted: the decision record is exactly the part that outlives the task, and a decision
that outlives the *project* was already promoted to `docs/adr/` at plan time. What compaction drops
is deliberation that has already been superseded by the code it produced.

---

**These artifacts are working if:** every spec traces to an approved plan or an explicit `plan: none`;
no `trivial` or `small` task has either; slug collisions never leave two plans for one branch; every
plan with more than one slice says which ones are deliverable and how each is safe to integrate; and
no plan or spec is ever deleted to keep a directory small.
