# Directory Layout

`.noetron/` at the repository root is the harness's workspace — hidden like `.github/`, versioned like
it, owned by the harness. It holds what the harness knows that is not source code. What the *product*
is lives in the project's own `docs/`, and decisions live in `docs/adr/`.

## The tree

```
.noetron/
├── state.md                  cursor of the active task and its active slice
├── profile.md                real commands and stack baseline per package, dependency edges, MCP record
├── domain-skills.md          catalog of <prefix>-* skills, the prefix authority, pending list
├── verification-standard.md  what "correct" means in this project
├── learnings.md              execution memory that outlives one task
├── history/
│   ├── INDEX.md              one line per delivery — the only part of history read at task start
│   ├── INDEX-archive.md      index lines rotated out of INDEX.md, never read at task start
│   └── <date>-<slug>.md      one block per closed task or delivered slice — opened by slug, not by listing
├── plans/                    on demand — noetron-plan
├── specs/                    on demand — noetron-spec
└── work/                     ephemeral, git-ignored, deleted at closeout and on abandonment
```

`docs/adr/` sits **in the project**, beside the project's own documentation — see
[adr.md](./adr.md).

## Context budgets — this file is the authority

Every artifact here is read by an agent with a finite window, so **the budget follows the read
class, not the importance**:

- **Start-of-task** — something opens it before the work begins, on every task, whether or not it
  turns out to matter. It competes with the code for the same window, so it gets a **hard line
  ceiling** and a rotation rule that fires at the ceiling.
- **On demand** — nothing opens it until a specific question points at it by name. It may be large,
  on one condition: **no reader ever lists or globs the directory**. Entry is by slug, through an
  index that is itself start-of-task and therefore capped.

An unbounded file in the first class is compound debt: it is paid on every task, forever, and it
grows fastest exactly when the project is busiest.

| Path | Read class | Ceiling | What happens at the ceiling |
|---|---|---|---|
| `state.md` | start-of-task | **80 lines** | resolved ledger lines migrate into the active slug's history entry; one index line stays — [state.md](./state.md) |
| `profile.md` | start-of-task (any task that writes) | one block per package; `## Preferences` **10 bullets** | a preference is enforced by config, promoted to a rule, or dropped — [profile.md](./profile.md) |
| `domain-skills.md` | start-of-task (overlay selection) | **120 lines**; catalog ≤ 30 rows; `## Pending` ≤ 5 | a pending entry expires after 2 distinct task slugs close; a catalog past 30 rows means skills must be split, merged, or retired — [domain-skills.md](./domain-skills.md) |
| `learnings.md` | start-of-task (every plan, before approaches) | **200 lines** | retire an entry before adding one — `noetron-evolve` |
| `verification-standard.md` | start-of-task (every claim of success) | **150 lines**; Baseline ≤ 25 rows | the baseline is latest-known-good per surface: a new approval **replaces** its row — `noetron-evolve` |
| `history/INDEX.md` | start-of-task (the only part of `history/` that is) | **50 lines** | the oldest lines fold into `INDEX-archive.md`; the newest 40 stay — [memory.md](./memory.md) |
| `history/<date>-<slug>.md` | on demand, by slug | **60 lines** per entry | over budget means the entry is re-telling the task; the plan and the spec already hold that |
| `history/INDEX-archive.md` | on demand, by date range | none | append-only; never read at task start |
| `plans/`, `specs/` | on demand, by slug | **no directory cap**; a plan ≤ 200 lines | past 30 files, closed artifacts compact to their durable core — [artifacts.md](./artifacts.md) |
| `work/<slug>/` | the task that owns it | none | deleted **after the destination is reached**, and on abandonment; it also holds `destination-pending.md`, which `noetron-finish` writes before executing a destination and deletes after, and which `noetron-core` reads before believing an idle ledger |

Where another file repeats one of these numbers it is a **mirror**; this table wins, and the two
change in one edit.

## One repository, one `.noetron/`

`.noetron/` sits at the **git repository root** — never inside a package, and never once per package,
however many manifests the tree carries. A task is one unit of work with one cursor, one ledger, and
one gate history; two `state.md` files would give two answers to "where did the interrupted task
stop?" and no rule for choosing between them.

| Tree | Where the harness lives |
|---|---|
| single project | the repository root |
| monorepo — `packages/*`, `apps/*`, Cargo or Go workspace members | the repository root, **once**; the packages become entries inside `profile.md` |
| several independent repositories under one directory | one `.noetron/` per repository; setup runs once per repository |
| a submodule, or a vendored repository | the outer root. A submodule that carries its own harness keeps it, and neither writes into the other |

The boundary is the repository rather than the directory because everything G0 ratifies — branch,
base ref, commit strategy — is repository-scoped. A harness straddling two repositories would ratify
a branch in one and write in the other.

**Which packages a task touches is not a layout question.** It is the task's **scope**: a user
decision, ratified at G0 with the rest of the kickoff, recorded in `state.md`, and turned into a
verification set by the dependency edges in [profile.md](./profile.md).

## What setup creates

The five root files plus `history/` (seeded with its `README.md` and an empty `INDEX.md`, so an
otherwise empty directory can still be committed). `verification-standard.md` and `learnings.md` are copied from
[`noetron-evolve/templates/`](../../noetron-evolve/templates/), which owns their format; the rest come from
this skill's references. `plans/` and `specs/` are created by the first skill that writes into them, seeded
from [artifacts.md](./artifacts.md). `work/<slug>/` is created per task by `noetron-execute`.

Setup appends `.noetron/work/` **and `.worktrees/`** to the repository `.gitignore`, creating the file
if absent and never touching existing rules. The second rule costs nothing and removes a trap:
`noetron-branch` creates worktrees under `.worktrees/`, and an un-ignored path there leaves it choosing
between a `.gitignore` commit on a protected branch and a worktree inside version control. Everything
else under `.noetron/` is committed: a state file that only exists on one machine cannot be a recovery
point.

## Ownership

| Path | Written by | Read by |
|---|---|---|
| `state.md` | `noetron-setup` (the idle scaffold), `noetron-router` (G0 and every `phase:` transition), `noetron-branch` (the resolved base SHA, and each slice's branch), `noetron-plan` (the delivery cursor at G1), `noetron-spec`, `noetron-execute`, `noetron-interview`, `noetron-recovery`, `noetron-finish` — field by field in [state.md](./state.md) § Every field has a writer | every skill resuming work |
| `profile.md`, `verification-standard.md` | `noetron-setup`, corrected by `noetron-verify` on contact with reality; `profile.md`'s per-package `Stack baseline` and its `## Decision records` path also by `noetron-plan`, on approval at G1 | `noetron-plan`, `noetron-spec`, `noetron-verify`, `noetron-finish` |
| `domain-skills.md` | `noetron-setup`, `noetron-plan` (the COVER outcome: `## Pending` entries and the greenfield gate's `Fired` line), `noetron-create-skill`, `noetron-evolve` | `noetron-spec` (task field), `noetron-branch` (the `Packages` column, for overlay selection), dispatch briefings |
| `learnings.md` | `noetron-finish`, `noetron-evolve` | `noetron-plan`, `noetron-explore` |
| `history/INDEX.md` | `noetron-finish`, one line per delivery | `noetron-explore`, `noetron-evolve` — **this file, not the directory** |
| `history/<entry>` | `noetron-finish`, and `noetron-execute` when the state ledger rotates | opened by slug when an index line points at it |
| `plans/`, `specs/` | `noetron-plan`, `noetron-spec`, checked off by `noetron-execute` | `noetron-execute`, `noetron-review` |
| `work/` | `noetron-execute` and its delegates | delegated agents only |

## What never goes here

- **Product documentation.** It belongs in the project's `docs/`. The removed `noetron/docs/` collided
  with it in the field and produced two descriptions of one feature, drifting apart from the first
  edit — with no rule for which one was true.
- **Architecture decisions.** `docs/adr/` follows the adr-tools/MADR convention every other tool and
  reviewer already knows.
- **Secrets, tokens, keys.** Record that a credential is configured and where, never its value.
- **Build output or anything regenerable.** If a command can produce it, the command belongs in
  `profile.md` instead.

---

**This layout is working if:** a `git status` after closeout shows no stray `.noetron/work/` files; a
reader looking for what a feature does never finds two answers; a `find . -name .noetron` in a
monorepo returns exactly one path; a fresh clone can resume an interrupted task from `state.md`
alone; every start-of-task file is under its ceiling in the table above after a hundred closed
tasks; and no transcript shows an agent reading `history/` as a directory instead of `INDEX.md`.
