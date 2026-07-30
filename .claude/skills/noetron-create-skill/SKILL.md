---
name: noetron-create-skill
description: Use when creating, editing, splitting, or retiring a domain skill (a .claude/skills/ entry named <repo-name>-*) in a repository that uses Noetron, or when noetron/setup/domain-skills.md lists approved domain skills as pending.
---

# Noetron Create Skill

Create or edit **domain skills** — the skills that teach the harness this project's own domains. Harness skills (`noetron-*`) are out of scope: they are authored only in the Noetron source repository, never in target projects.

Domain skills live in `.claude/skills/` and are named `<prefix>-<skill-name>` — the prefix is **read from `noetron/setup/domain-skills.md`**, the recorded authority (set at setup from the project's manifest name, user-confirmed). Never re-derive it from the directory name: a scratch checkout named `p12` still creates `till-*` skills. Bodies are written in English; domain terms stay in the project's original language (e.g. `talhão`, `nota fiscal`).

## What a domain skill is — and is not

A domain skill teaches **how to work on a domain**: conventions, invariants, traps, verification recipes, where things live. It is not:

- **Feature documentation.** Facts about what a feature does belong in `noetron/docs/<feature>.md`; the skill links there instead of duplicating.
- **A narrative.** "How we solved X that one time" is a history entry, not a skill.
- **A generic best practice.** If it applies to any codebase, it belongs to the harness, not to a domain skill.
- **A mechanical constraint.** If a linter or CI can enforce it, automate it; keep skills for judgment.

Create a skill when an agent working in the domain **would get something wrong, or not know something, without it** — and the gap recurs across tasks.

## The creation loop

Run the loop in order. Each pass through VERIFY either exits the loop or consumes one round; **after 3 failed rounds, stop and escalate to the user with what was tried** — do not keep iterating.

### 1. FRAME

Name the gap in one sentence: *what would an agent do wrong (or not know) in this domain without the skill?* Then classify it — the classification chooses the skill's form (see [Doctrine](references/doctrine.md), "Form matches the failure"):

| Gap | The agent… |
|---|---|
| Knowledge | doesn't know facts or conventions of the domain |
| Technique | knows the facts but applies the wrong process |
| Discipline | knows better but skips the rule under pressure |

**Admission rule:** a skill is only admitted if this sentence names a concrete failure mode — something an agent would actually get wrong. "General knowledge about `<domain>`" names no failure and admits no skill. If you cannot fill the sentence, stop: there is no skill to create.

### 2. EVIDENCE

Ground the skill in the repository: collect the real files and patterns it will reference, and at least one concrete instance of the gap — a wrong assumption an agent would plausibly make, an inconsistency that exists, a trap that has bitten before. Run the sweep through `noetron-explore` (facts with evidence, never memory). No skill from pure imagination; if you cannot show the gap, do not write the skill.

### 3. DRAFT

Write the skill following [Doctrine](references/doctrine.md) and the skeleton in [Template](references/template.md).

### 4. VERIFY

Two gates, in order:

1. **Checklist** (from [Doctrine](references/doctrine.md), "Review checklist") — fix everything it catches.
2. **Trigger test** (see [Trigger Test](references/trigger-test.md)) — a fresh-context subagent gets a realistic task in the domain that does **not** name the skill; pass means the subagent invokes the skill and its rules visibly shape the output.

Fail → diagnose with the table in [Trigger Test](references/trigger-test.md), adjust, re-test. Three failed rounds → escalate to the user via `noetron-interview`.

### 5. REGISTER

Propose-confirm: present the final skill to the user and get approval. Then update the catalog `noetron/setup/domain-skills.md` — add to **Catalog**, remove from **Pending** if it was there. The catalog mirrors reality: verify it against an actual listing of `.claude/skills/`, never against memory.

## Editing and retiring

- **Editing** an existing domain skill re-enters the loop at VERIFY (checklist + trigger test): an edit can silently break triggering.
- **Splitting**: when one skill covers two domains, frame each half as a new skill and retire the original; sharpen both descriptions so their triggers no longer overlap.
- **Retiring**: propose-confirm, delete the skill directory, update the catalog in the same change.

## Graph rules

Domain skills are nodes in the harness's routing graph. Keep the graph sound:

- **Edges are exact names.** Every skill ends with a "Related skills" section listing sibling skills by their exact `name`. A misspelled name is a broken edge — verify each against `.claude/skills/`.
- **Triggers are disjoint.** If two descriptions could fire on the same task, routing is nondeterministic: merge the skills or sharpen both descriptions until each task has one obvious owner.
- **Narrow beats broad.** `acme-billing-refunds` routes better than `acme-backend`. A catch-all skill is a routing dead zone — split it.

---

**This skill is working if:** new domain skills pass the trigger test within the three-round budget; the catalog in `noetron/setup/domain-skills.md` always matches `.claude/skills/`; and the failure modes named in FRAME stop appearing in the repository's diffs and reviews.
