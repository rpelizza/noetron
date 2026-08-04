# Template: `.noetron/domain-skills.md`

The catalog of this project's own skills and the authority for their prefix. It also carries the gate that
gets domain skills written **before** the domain code — the failure this file prevents is a catalog still
empty after two phases and ~17k lines, because the only offer to create one came at closeout.

## Scaffold

```markdown
# Domain skills

**Prefix:** `<prefix>` — one per repository, from the root manifest's name, confirmed by the
user at setup. All domain skills are `<prefix>-<name>` in `.claude/skills/`, with the package
area inside the name when the repository has several. This file is the authority; the prefix
is never re-derived from a directory name or from a package manifest.

## Catalog

| Skill | Domain | Packages | Grounded in | Status |
|---|---|---|---|---|
| `<prefix>-<name>` | <what it covers> | `<package path>` or `all` | <repo evidence, or library@version via context7> | active \| doc-grounded |

`doc-grounded` means the skill was written before the code existed, from the plan's pinned stack. It
re-grounds at the first diff that lands in its territory and then flips to `active` — see
`noetron-create-skill`, greenfield mode.

## Pending
Approved by the user, awaiting `noetron-create-skill`. Max 5; each expires once 2 distinct task slugs
have closed since its approval.
- `<prefix>-<name>` — <the decision it settles or the error it prevents> — approved <date>, expires after <slug>

## Greenfield gate
Armed <date>: this repository had no code to sweep at setup. `noetron-plan` fires the
candidate gate at its COVER step, sourced from the ratified stack, before the first line
of domain code. On firing, `noetron-plan` replaces these lines with the outcome:
`Fired <date> — outcome: <all | the adjusted set | none>; re-arms only if the ratified stack changes`.

## Last review
<date> — up to <most recent history index line considered>, by `noetron-evolve`. At setup: "never".
```

## Budget — 120 lines, hard

This file is a **start-of-task** read: `noetron-spec` fills the `Domain skills to apply` field from
it and every dispatch briefing selects overlays from it, so it is paid on every task in the project's
life. Two sections grow, and each has its own valve.

**Catalog — 30 rows.** It is nominally self-bounding, because it must match an actual listing of
`.claude/skills/`. Past 30 rows the problem is upstream, not here: skills that overlap, skills whose
territory disappeared, or one skill doing three jobs. Route it to `noetron-evolve` with the evidence
— merge, split, or retire — never trim the catalog to fit while the skills stay.

**Pending — 5 entries, each expiring after 2 distinct task slugs.** Pending is a debt queue, and an
unbounded queue is a wish list: entries the user approved months ago, for a stack that moved, that
nobody will ever write. The count is of **tasks**, never of closeouts: a four-slice task closes four
times and is one task, and expiring an entry approved at that task's own G1 empties the queue of
exactly what it was opened to hold. At the second such task an entry is **created or dropped**, in one
question naming both options and the reason it is still here. A drop is recorded with its date, and
that record is itself evidence — a skill approved twice and dropped twice is telling you the
territory does not need it. A sixth approval with five already pending is not queued: the user picks
which one it replaces, or the new one waits.

## The prefix when several manifests exist

**One repository, one prefix — the workspace's.** It is taken from the root manifest when the root names
the workspace; when no root manifest names it, the user picks one at setup and this file records it.
Package manifests never contribute prefixes of their own.

Two mechanical reasons. `.claude/skills/` is a single namespace at the repository root: per-package
prefixes would install three naming authorities in one directory, with no rule for a task that spans two
of them. And the prefix is a namespace marker, not an address — what actually routes a task to a skill is
the skill's name and description.

**The area goes in the name, not in the prefix:** `<prefix>-api-ratelimit`, `<prefix>-web-forms`,
`<prefix>-ml-features`. A skill whose rules bind every package drops the area segment — `<prefix>-auth`
when one auth contract holds across the workspace. **`noetron-branch` reads the `Packages` column** at
its scope step: a task's overlays are the rows naming a package in the ratified **scope**, plus every
row marked `all`. Scope, not the verification set — a dependent package is verified, not written, and
a domain skill governs writing.

## Finding candidates in an existing repository

Sweep through `noetron-explore` and propose the **maximum useful set** — the filter is utility, not
scarcity. A candidate qualifies when an agent working there would get something wrong, or not know
something, without it, and the gap recurs. Look at:

- **bounded contexts and modules** — the domain vocabulary and its invariants;
- **integrations** — each external API's auth, quirks, and failure modes;
- **the stack itself** — one skill per framework whose idioms decide how code is written, grounded in
  context7 for the version in the lockfile, never from memory;
- **UI areas** — component conventions, state ownership, design tokens;
- **infrastructure** — migrations, deploys, environments, feature flags.

In a workspace, sweep **package by package** and give each candidate its `Packages` value. One package's
stack skill is useless noise in another's scope, and a rule that really does hold everywhere is worth
saying so explicitly — `all` is a claim, not a default.

## Finding candidates in a greenfield repository

Nothing to sweep, so the source is the **stack ratified in the plan** — frameworks, data layer,
deployment target, and the domain vocabulary the interview settled. That is the earliest moment the
candidates exist and the last one before domain code is written. `noetron-plan` fires the gate; this file
arms it and records the outcome.

## The gate — one question, with a recommendation

> Detected stack: `<X, Y, Z>` (versions from `<lockfile>`). I propose `<N>` skills:
> 1. `<prefix>-<name>` — `<the decision it settles or the error it prevents>`
> …
> Create all of them, adjust the set, or proceed with none?

Each line names a **concrete failure mode**; "general knowledge about billing" names none and is not a
candidate — `noetron-create-skill` rejects it at FRAME anyway. Answers: *all* → each goes to
`noetron-create-skill`; *adjust* → the user's set is created and the rest dropped, with the drop
recorded; *none* → recorded with the date. **`noetron-plan` writes that outcome here**, in the turn
the user answers: approved skills into `## Pending`, and the `## Greenfield gate` section replaced by
its `Fired <date>` line. A gate whose outcome nobody records re-fires at the next task's plan and
re-asks a question already answered — and the same skills return a third time through
`noetron-finish`'s closeout net, after the code they were meant to shape.

---

**This catalog is working if:** it matches an actual listing of `.claude/skills/`; every entry names the
error it prevents; no project writes its first 10k lines of domain code with an empty catalog; and no
entry sits under `## Pending` across three closed tasks without being written or dropped in writing.
