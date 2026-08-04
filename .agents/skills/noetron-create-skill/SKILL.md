---
name: noetron-create-skill
description: Use when creating, editing, splitting, or retiring a domain skill (a .claude/skills/ entry named <prefix>-*) in a repository that uses Noetron; when .noetron/domain-skills.md lists approved domain skills as pending; or when a task lands in a territory no skill covers.
---

# Noetron Create Skill

Authoring for **domain skills** — the skills that teach the harness this project's own domains.
Harness skills (`noetron-*`) are authored only in the Noetron source repository, never in a target
project.

Domain skills live in `.claude/skills/<prefix>-<skill-name>/`. The prefix is **read from
`.noetron/domain-skills.md`**, the recorded authority (set at setup from the manifest name,
user-confirmed) — never re-derived from the directory name: a scratch checkout named `p12` still
creates `till-*` skills. Bodies are English; domain terms keep the project's language (`talhão`).

## What a domain skill is — and is not

It teaches **how to work in a domain**: conventions, invariants, traps, verification recipes, where
things live. It is not **feature documentation** (what a feature does lives in
the project's own `docs/`; the skill links there), not **a narrative** ("how we solved X" is a
history entry), not **a generic best practice** (that belongs to the harness), and not **a mechanical
constraint** (if a linter or CI can enforce it, automate it — skills carry judgment).

Create one when an agent working in the domain **would get something wrong, or not know something,
without it**, and the gap recurs across tasks.

## The creation loop

Each pass through VERIFY either exits or consumes one round; **after 3 failed rounds, stop and
escalate** with what was tried.

### 1. FRAME

One sentence: *what would an agent do wrong, or not know, in this domain without the skill?* Then
classify — the class picks the form (see [Doctrine](references/doctrine.md), "Form matches the
failure"):

| Gap | The agent… |
|---|---|
| Knowledge | doesn't know the domain's facts or conventions |
| Technique | knows the facts, applies the wrong process |
| Discipline | knows better, skips the rule under pressure |

**Admission rule:** the sentence must name a concrete failure mode. "General knowledge about
`<domain>`" names no failure and admits no skill. Cannot fill it → there is no skill here.

### 2. EVIDENCE — grounded, never remembered

Collect the real files and patterns the skill will cite, plus at least one concrete instance of the
gap: a wrong assumption an agent would plausibly make, an inconsistency that exists, a trap that has
bitten. Sweep through `noetron-explore`.

For any technology the skill covers, derive the **version actually in use** (manifest, lockfile) and
confirm every claim about it against **context7 or the official docs for that version**. Repository
conventions cite `file:line`; technology facts cite doc plus version; an unconfirmable claim is
written `(unconfirmed — verify against docs for <version>)` and the limitation is reported.
**Nothing cites memory** — a stack skill written from memory is imagination with frontmatter.

**No domain code to sweep?** The repository is greenfield and this step has nothing to point at. The
evidence moves to the stack the plan ratified, read at the pinned version, and the skill is born
marked `doc-grounded` — [Greenfield](references/greenfield.md). The requirement does not relax; its
source moves, and the marker records that it did.

### 3. DRAFT

Follow [Doctrine](references/doctrine.md) and the skeleton in [Template](references/template.md).

### 4. VERIFY — two gates, in order

1. **Checklist** — [Doctrine](references/doctrine.md), "Review checklist". Fix everything it catches.
2. **Trigger test** — [Trigger Test](references/trigger-test.md): a **fresh, read-only** subagent
   gets a realistic probe that **never names the skill**; both criteria must pass — it *triggered*
   (invoked the skill before working) and it *followed* (a rule visibly shaped the output).

**Creating a batch: write every skill first, run the probes afterwards.** Overlap between siblings
exists only once both siblings exist; probing one at a time measures a graph that will not ship.

Fail → diagnose with the table in [Trigger Test](references/trigger-test.md), adjust, re-test with a
new fresh subagent. Three failed rounds → escalate via `noetron-interview`: three failures usually
mean the skill is mis-scoped, and scoping is the user's decision.

### 5. REGISTER — approve, then finish the mechanics

Propose-confirm: present the final skill — for an edit, the diff — and get approval. **Approval is
per skill, never a batch "ok" for a set.**

Once approved, **one change** carries all three:

1. the skill file(s);
2. the catalog `.noetron/domain-skills.md` — the skill recorded, and cleared from the pending list if
   it was there; verified against an actual listing of `.claude/skills/`, never against memory;
3. **the sync** — `node scripts/sync-noetron.mjs`, which replicates `.claude/skills/` into
   `.agents/skills/` and regenerates `AGENTS.md`. `node scripts/sync-noetron.mjs --check` verifies
   without writing; that is what CI runs, and it must be clean before the change is done.

**The sync is mechanics, not a decision.** The user authorized creating, changing, or removing the
skill; asking again for permission to mirror it is asking permission to finish. Until `--check` is
clean, the skill is invisible to every tool that reads the agents convention.

## Editing an existing skill

Never regenerate a skill from its description. The lock, in order:

1. **Read the current file in full** — including the parts the weakness does not mention.
2. **Change only what the named weakness requires** — the smallest edit that addresses it.
3. **Preserve the project's customizations** — added rules, local examples, extra sections, adjusted
   paths survive verbatim. What reads as noise from outside is usually a scar from a real incident.
4. **Show the diff before writing** — actual old and new lines, not a summary of intent.
5. Approval → back through VERIFY (checklist **and** trigger test: an edit silently breaks
   triggering) → REGISTER's mechanics (catalog if the entry changed, sync always).

Ten proposed edits are ten decisions; one "ok" covers the one diff that was shown.

## Splitting and retiring

- **Split** — frame each half as a new skill, retire the original, sharpen both descriptions until
  their triggers no longer overlap. Probes for both run after both exist.
- **Retire** — propose-confirm, delete the directory, update the catalog and run the sync in the
  same change.

## Graph rules

- **Edges are literal strings.** "Related skills" names each sibling by its exact `name`. A typo is a
  dead edge, and nothing reports it — check every one against a listing of `.claude/skills/`.
- **Trigger surfaces do not intersect.** Two descriptions that can both fire on one task turn routing
  into a coin flip. Merge them, or sharpen both until each task has one obvious owner.
- **Narrow routes; broad collects dust.** `acme-billing-refunds` fires on a refund task.
  `acme-backend` nominally covers everything and in practice fires unpredictably — split it along the
  failure modes it was trying to hold.

## Red flags

- Regenerating a whole skill when the weakness named one section, or dropping a project rule because
  the template has no slot for it.
- An edit written before its diff was shown; one "ok" stretched over several skills.
- `--check` red at the end of the change, or never run at all.
- A technology claim with no version behind it and no `(unconfirmed)` mark — the memory leak this
  skill exists to close.
- A catalog row that an actual listing of `.claude/skills/` does not produce.
- The trigger test skipped because the edit was small; probes run before every sibling in the batch
  exists.
- A greenfield skill prescribing a convention the plan never ratified, teaching plain documentation
  instead of a named wrong default, or landing without its `doc-grounded` marker.

## Integration

- `noetron-evolve` — decides *which* skill needs changing and why; the mechanics land here.
- `noetron-explore` — the EVIDENCE sweep and every repository fact.
- `noetron-interview` — FRAME scoping doubts and the three-round escalation.
- `noetron-setup` — records the prefix and the initial catalog this skill reads.
- `noetron-plan` — its COVER step approves the candidates; in a greenfield repository it also supplies
  the pinned stack and the first slice the probe is written from.
- `noetron-finish` — offers skill creation when a task opens uncovered territory.
- `noetron-verify` — the trigger-test result and `--check` are claims, and carry their evidence.

---

**This skill is working if:** new skills pass the trigger test inside the three-round budget;
`.noetron/domain-skills.md` and `.agents/skills/` match `.claude/skills/` after every change, with
`--check` clean; edits show a diff before landing and never delete a project rule nobody asked to
remove; no skill in a greenfield repository is blocked for lack of code to cite, and none stays
`doc-grounded` once its territory has diffs; and the failure modes named in FRAME stop appearing in
diffs and reviews.
